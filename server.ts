import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import DodoPayments from 'dodopayments';
import Exa from 'exa-js';
import { authoritativeCombatServer } from './src/server/authoritativeCombatServer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Dev server must always bind to port 3000 as per AI Studio architecture
// (Nginx listens on port 8080 and proxies traffic to port 3000).
function resolvePort(): number {
  const portArgIndex = process.argv.findIndex((arg) => arg === '--port' || arg === '-p');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    return parseInt(process.argv[portArgIndex + 1], 10);
  }
  // If APP_PORT is explicitly specified, use it
  if (process.env.APP_PORT) {
    return parseInt(process.env.APP_PORT, 10);
  }
  // In development and AI Studio container, always listen on 3000
  return 3000;
}

const PORT = resolvePort();
const isProduction = process.env.NODE_ENV === 'production';

// Body parser with 15MB limit for pet photo analysis & raw buffer preservation for Dodo webhooks
app.use(
  express.json({
    limit: '15mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

// Persistent database files
const DATA_DIR = path.resolve(__dirname, 'data');
const WAITLIST_FILE = path.resolve(DATA_DIR, 'waitlist.json');
const PAYMENTS_FILE = path.resolve(DATA_DIR, 'payments.json');

// Ensure data folder and files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ---------------------------------------------------------------------------
// Dodo Payments Configuration & Client
// ---------------------------------------------------------------------------
const dodoApiKey =
  process.env.DODO_PAYMENTS_API_KEY ||
  'dodo_test_r9a5A4oyLuJ4pMD8.Sc7lZ9a1amcp8YTzVOUqFQUQ8iIFViJBJcT0eRTvbtHgHr6m';
const dodoWebhookSecret =
  process.env.DODO_PAYMENTS_WEBHOOK_SECRET || 'whsec_AQ2COHed/IfEtoQ1gZnfmTgHykOYoDiL';
const dodoEnv =
  (process.env.DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode') || 'test_mode';

let dodoClient: DodoPayments | null = null;
if (dodoApiKey && dodoApiKey !== 'your_dodo_api_key_here' && dodoApiKey.trim().length > 0) {
  try {
    dodoClient = new DodoPayments({
      bearerToken: dodoApiKey.trim(),
      environment: dodoEnv,
    });
    console.log(`[DodoPayments] Initialized official SDK in ${dodoEnv}`);
  } catch (err: any) {
    console.warn('[DodoPayments] Client initialization warning:', err?.message || err);
  }
}

// ---------------------------------------------------------------------------
// Exa API Client (Semantic Real-World Pet Lore & Breed Retrieval)
// ---------------------------------------------------------------------------
const exaApiKey = process.env.EXA_API_KEY;
let exaClient: Exa | null = null;
if (exaApiKey && exaApiKey !== 'your_exa_api_key_here' && exaApiKey.trim().length > 0) {
  try {
    exaClient = new Exa(exaApiKey.trim());
    console.log('[Exa] Initialized Exa SDK for real-time pet lore search');
  } catch (err: any) {
    console.warn('[Exa] Exa SDK initialization warning:', err?.message || err);
  }
}

// Product Catalog definition for PET SLAM Monetization
const DODO_PRODUCTS = {
  auction: {
    id: process.env.DODO_PRODUCT_AUCTION_PASS || 'pdt_0NqgJlisZzb8svxO90gL0',
    title: 'Auction House VIP License',
    price: '$1.99',
    amountCents: 199,
    description: 'Permanent unlock for high-stakes live player pet auctions and bidding.',
  },
  avatar: {
    id: process.env.DODO_PRODUCT_AVATAR_PASS || 'pdt_0NqgJPS04QMUNn6vlOUrI',
    title: 'Custom Pet DNA Avatar Pass',
    price: '$0.99',
    amountCents: 99,
    description: 'Upload your pet photos to generate high-res stylized fighting avatars.',
  },
  extension: {
    id: process.env.DODO_PRODUCT_EXTENSION_PASS || 'pdt_0NqgJtNVeIeTlUsEMZ3C1',
    title: 'Browser Extension Lifetime Pass',
    price: '$1.99',
    amountCents: 199,
    description: 'Lifetime interactive browser companion overlay with real-time feeding & voice mimicry.',
  },
  bundle: {
    id: process.env.DODO_PRODUCT_BUNDLE_PASS || 'pdt_0NqgJznwnQjxDNNAydOuK',
    title: 'All-Access Genesis VIP Bundle',
    price: '$4.99',
    amountCents: 499,
    description: 'Unlocks Auction Pass, Avatar Studio Pass, Extension Pass + 5,000 Bonus Credits.',
  },
  credits_5000: {
    id: process.env.DODO_PRODUCT_CREDITS_5K || 'pdt_0NqgJznwnQjxDNNAydOuK',
    title: '5,000 Slam Credits Pack',
    price: '$4.99',
    amountCents: 499,
    description: 'In-game credits for animal training, dietary boosters, and market purchases.',
  },
};

export interface PaymentRecord {
  id: string;
  sessionId: string;
  passType: string;
  amountCents: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed';
  customerEmail?: string;
  createdAt: string;
  isSimulated: boolean;
}

function getPayments(): PaymentRecord[] {
  try {
    if (!fs.existsSync(PAYMENTS_FILE)) return [];
    return JSON.parse(fs.readFileSync(PAYMENTS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function recordPayment(payment: PaymentRecord): void {
  try {
    const payments = getPayments();
    payments.unshift(payment);
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(payments.slice(0, 500), null, 2), 'utf-8');
  } catch (err) {
    console.error('[DodoPayments] Failed to record payment:', err);
  }
}

interface WaitlistEntry {
  id: string;
  email: string;
  created_at: string;
  signup_status: 'confirmed' | 'pending';
  source?: string;
  perks: {
    credits: number;
    founder_badge: boolean;
    alpha_access: boolean;
  };
}

function getWaitlist(): WaitlistEntry[] {
  try {
    if (!fs.existsSync(WAITLIST_FILE)) {
      // Seed with initial realistic waitlist entries if file is fresh
      const initial: WaitlistEntry[] = [
        {
          id: 'ps_seed_01',
          email: 'alex.vanguard@esports.gg',
          created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
          signup_status: 'confirmed',
          source: 'early_bird',
          perks: {
            credits: 10000,
            founder_badge: true,
            alpha_access: true,
          },
        },
        {
          id: 'ps_seed_02',
          email: 'kane.apex@beastzone.io',
          created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
          signup_status: 'confirmed',
          source: 'alpha_circuit',
          perks: {
            credits: 10000,
            founder_badge: true,
            alpha_access: true,
          },
        },
        {
          id: 'ps_seed_03',
          email: 'valeria.strike@predatorarena.net',
          created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          signup_status: 'confirmed',
          source: 'pvp_invite',
          perks: {
            credits: 10000,
            founder_badge: true,
            alpha_access: true,
          },
        },
      ];
      fs.writeFileSync(WAITLIST_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const data = fs.readFileSync(WAITLIST_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    // Ensure all entries have perks
    return parsed.map((item: any) => ({
      ...item,
      perks: item.perks || {
        credits: 10000,
        founder_badge: true,
        alpha_access: true,
      },
    }));
  } catch (err) {
    console.error('Error reading waitlist database:', err);
    return [];
  }
}

function saveWaitlist(list: WaitlistEntry[]): boolean {
  try {
    const tempFile = `${WAITLIST_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(list, null, 2), 'utf-8');
    fs.renameSync(tempFile, WAITLIST_FILE);
    return true;
  } catch (err) {
    console.error('Error persisting waitlist database:', err);
    return false;
  }
}

// Resend Email Sender Helper
async function sendWelcomeEmail(recipientEmail: string, entryId: string): Promise<{ sent: boolean; message: string; template: any }> {
  const fromAddress = process.env.RESEND_FROM_EMAIL || 'PET SLAM Alpha Desk <onboarding@resend.dev>';
  const emailSubject = 'Application Received: 10,000 Credits & Exclusive Alpha Access Granted!';
  const emailBody = `Hey,

We have received your application for the PET SLAM waitlist!

As an early applicant, you have officially been granted:
• 10,000 Arena Credits (credited to your competitor registry for beast acquisitions and training)
• Exclusive Founder Beast Badge (permanent cosmetic honor for your arena profile)
• Priority Closed Alpha Feature Testing Access (first-hand testing of PvP battles, weekly auctions, and IRL proximity matchmaking)

Registration Voucher: ${entryId}

We're building the future where animal ownership meets competitive esports gaming. You'll be among the first through the arena gates.

Stay tuned. The arena is coming.

– Team PET SLAM
https://petslam.gg`;

  const template = {
    from: fromAddress,
    to: recipientEmail,
    subject: emailSubject,
    body: emailBody,
    perks: {
      credits: 10000,
      founderBadge: true,
      alphaTesting: true,
    },
  };

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      sent: false,
      message: 'RESEND_API_KEY is not configured in backend environment variables. Signup safely saved to database.',
      template,
    };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [recipientEmail],
        subject: emailSubject,
        text: emailBody,
      }),
    });

    if (res.ok) {
      return { sent: true, message: 'Welcome email with 10,000 credits & Alpha perks dispatched via Resend', template };
    } else {
      const errText = await res.text();
      console.warn('Resend API returned non-OK status:', res.status, errText);
      return {
        sent: false,
        message: `Email provider returned HTTP ${res.status}. Signup safely recorded in database.`,
        template,
      };
    }
  } catch (error: any) {
    console.error('Failed to trigger transactional email:', error);
    return {
      sent: false,
      message: `Failed to connect to email service: ${error?.message || 'Network error'}. Signup safely recorded.`,
      template,
    };
  }
}

// ---------------------------------------------------------------------------
// Google Search Console Automated HTML File Verification
// Supports any verification file requested by Google: /google[hash].html
// ---------------------------------------------------------------------------
app.get('/google:code.html', (req, res) => {
  const code = req.params.code;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`google-site-verification: google${code}.html`);
});

// ---------------------------------------------------------------------------
// Dodo Payments API Endpoints
// ---------------------------------------------------------------------------

// 1. Get Dodo Gateway Configuration & Products
app.get('/api/dodo/config', (_req, res) => {
  res.json({
    enabled: true,
    configured: Boolean(dodoClient && dodoApiKey),
    environment: dodoEnv,
    products: DODO_PRODUCTS,
  });
});

// 2. Create Checkout Session
app.post('/api/dodo/create-checkout', async (req, res) => {
  try {
    const { passType, customerEmail, customerName, returnUrl } = req.body;
    const product = DODO_PRODUCTS[passType as keyof typeof DODO_PRODUCTS];

    if (!product) {
      return res.status(400).json({ error: `Unknown passType: ${passType}` });
    }

    const origin = req.headers.origin || `http://localhost:${PORT}`;
    const finalReturnUrl = returnUrl || `${origin}/?dodo_payment=success&pass=${passType}`;

    if (dodoClient && dodoApiKey && dodoApiKey !== 'your_dodo_api_key_here') {
      const checkoutSession = await dodoClient.checkoutSessions.create({
        product_cart: [
          {
            product_id: product.id,
            quantity: 1,
          },
        ],
        customer: customerEmail
          ? {
              email: customerEmail,
              name: customerName || 'Pet Slam Challenger',
            }
          : undefined,
        return_url: finalReturnUrl,
        metadata: {
          passType,
          customerEmail: customerEmail || 'anonymous',
          source: 'pet_slam_app',
        },
      });

      return res.json({
        checkoutUrl: checkoutSession.checkout_url,
        sessionId: checkoutSession.session_id,
        mode: dodoEnv,
        simulated: false,
      });
    }

    // Developer Sandbox Simulation for instant testing without live keys
    const simulatedSessionId = 'dodo_sim_' + crypto.randomBytes(8).toString('hex');
    const simulatedUrl = `${finalReturnUrl}&session_id=${simulatedSessionId}&simulated=true`;

    recordPayment({
      id: 'pay_' + crypto.randomBytes(6).toString('hex'),
      sessionId: simulatedSessionId,
      passType,
      amountCents: product.amountCents,
      currency: 'USD',
      status: 'succeeded',
      customerEmail: customerEmail || 'trainer@petslam.gg',
      createdAt: new Date().toISOString(),
      isSimulated: true,
    });

    return res.json({
      checkoutUrl: simulatedUrl,
      sessionId: simulatedSessionId,
      mode: 'test_sandbox',
      simulated: true,
      message:
        'Dodo Payments test simulation active. Set DODO_PAYMENTS_API_KEY in .env for official gateway checkout.',
    });
  } catch (err: any) {
    console.error('[DodoPayments] Checkout creation error:', err);
    return res.status(500).json({ error: err?.message || 'Failed to initialize Dodo checkout' });
  }
});

// 3. Webhook Listener
app.post('/api/dodo/webhook', async (req: any, res) => {
  try {
    const rawBody = req.rawBody ? req.rawBody.toString('utf-8') : JSON.stringify(req.body);
    let event: any = req.body;

    // Verify cryptographic signature if webhook key is present
    if (dodoClient && dodoWebhookSecret && dodoWebhookSecret !== 'your_webhook_secret_here') {
      try {
        event = dodoClient.webhooks.unwrap(rawBody, {
          headers: {
            'webhook-id': req.headers['webhook-id'] as string,
            'webhook-signature': req.headers['webhook-signature'] as string,
            'webhook-timestamp': req.headers['webhook-timestamp'] as string,
          },
        });
        console.log('[DodoPayments Webhook] Verified event signature:', event.type);
      } catch (sigErr: any) {
        console.error('[DodoPayments Webhook] Signature verification failed:', sigErr.message);
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
    }

    const eventType = event?.type || event?.event_type;
    if (eventType === 'payment.succeeded' || eventType === 'checkout.session.completed') {
      const payloadData = event.data || event;
      const passType = payloadData?.metadata?.passType || 'bundle';
      const customerEmail = payloadData?.customer?.email || payloadData?.metadata?.customerEmail;
      const amountCents = payloadData?.amount || 199;

      recordPayment({
        id: 'pay_' + crypto.randomBytes(6).toString('hex'),
        sessionId: payloadData?.payment_id || payloadData?.id || 'dodo_pay_' + Date.now(),
        passType,
        amountCents,
        currency: 'USD',
        status: 'succeeded',
        customerEmail,
        createdAt: new Date().toISOString(),
        isSimulated: false,
      });

      console.log(`[DodoPayments] Fulfilled pass purchase: ${passType} for ${customerEmail || 'customer'}`);
    }

    return res.json({ received: true });
  } catch (err: any) {
    console.error('[DodoPayments Webhook] Processing error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// 4. Payment History (Audit Log)
app.get('/api/dodo/payments', (_req, res) => {
  res.json(getPayments());
});

// API Routes
app.get('/api/waitlist/status', (_req, res) => {
  const waitlist = getWaitlist();
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  res.json({
    totalSignups: waitlist.length,
    emailConfigured: hasResend,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/waitlist/email-template', (req, res) => {
  const sampleEmail = (req.query.email as string) || 'competitor@petslam.gg';
  const sampleId = (req.query.id as string) || 'ps_genesis_alpha';
  const fromAddress = process.env.RESEND_FROM_EMAIL || 'PET SLAM Alpha Desk <onboarding@resend.dev>';
  const emailSubject = 'Application Received: 10,000 Credits & Exclusive Alpha Access Granted!';
  const emailBody = `Hey,

We have received your application for the PET SLAM waitlist!

As an early applicant, you have officially been granted:
• 10,000 Arena Credits (credited to your competitor registry for beast acquisitions and training)
• Exclusive Founder Beast Badge (permanent cosmetic honor for your arena profile)
• Priority Closed Alpha Feature Testing Access (first-hand testing of PvP battles, weekly auctions, and IRL proximity matchmaking)

Registration Voucher: ${sampleId}

We're building the future where animal ownership meets competitive esports gaming. You'll be among the first through the arena gates.

Stay tuned. The arena is coming.

– Team PET SLAM
https://petslam.gg`;

  res.json({
    from: fromAddress,
    to: sampleEmail,
    subject: emailSubject,
    body: emailBody,
    voucher: sampleId,
    perks: {
      credits: 10000,
      founderBadge: true,
      alphaTesting: true,
    },
    resendConfigured: Boolean(process.env.RESEND_API_KEY),
  });
});

app.post('/api/waitlist', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      res.status(400).json({ success: false, error: 'Email address is required.' });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail) || trimmedEmail.length > 254) {
      res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
      return;
    }

    const currentList = getWaitlist();
    const existingIndex = currentList.findIndex((item) => item.email.toLowerCase() === trimmedEmail);

    if (existingIndex !== -1) {
      res.status(409).json({
        success: false,
        duplicate: true,
        message: 'This email is already registered on the PET SLAM waitlist.',
        entry: currentList[existingIndex],
        totalSignups: currentList.length,
      });
      return;
    }

    const entryId = `ps_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
    const newEntry: WaitlistEntry = {
      id: entryId,
      email: trimmedEmail,
      created_at: new Date().toISOString(),
      signup_status: 'confirmed',
      perks: {
        credits: 10000,
        founder_badge: true,
        alpha_access: true,
      },
    };

    const updatedList = [newEntry, ...currentList];
    const writeOk = saveWaitlist(updatedList);

    if (!writeOk) {
      res.status(500).json({
        success: false,
        error: 'Database error: Unable to save your signup. Please try again shortly.',
      });
      return;
    }

    // Trigger transactional email
    const emailResult = await sendWelcomeEmail(trimmedEmail, entryId);

    res.status(201).json({
      success: true,
      message: "You're in. Welcome to PET SLAM.",
      entry: newEntry,
      totalSignups: updatedList.length,
      emailStatus: emailResult,
      perksAwarded: {
        credits: 10000,
        founderBadge: 'Granted',
        alphaTesting: 'Priority Invitation',
      },
    });
  } catch (error: any) {
    console.error('Waitlist POST error:', error);
    res.status(500).json({
      success: false,
      error: 'An internal server error occurred while processing your request.',
    });
  }
});

function generateProceduralFallback(userGivenName?: string) {
  const breeds = [
    {
      breedName: 'Golden Retriever',
      category: 'dog' as const,
      species: 'retriever' as const,
      palette: { primary: '#F59E0B', secondary: '#D97706', belly: '#FEF3C7', ear: '#D97706', eye: '#451A03', nose: '#1C1917' },
    },
    {
      breedName: 'Calico Cat',
      category: 'cat' as const,
      species: 'calico' as const,
      palette: { primary: '#F8FAFC', secondary: '#EA580C', belly: '#FFFFFF', ear: '#FDA4AF', eye: '#059669', nose: '#FB7185' },
    },
    {
      breedName: 'French Bulldog',
      category: 'dog' as const,
      species: 'bulldog' as const,
      palette: { primary: '#94A3B8', secondary: '#64748B', belly: '#E2E8F0', ear: '#F472B6', eye: '#1E293B', nose: '#0F172A' },
    },
    {
      breedName: 'Orange Tabby',
      category: 'cat' as const,
      species: 'tabby' as const,
      palette: { primary: '#EA580C', secondary: '#C2410C', belly: '#FFEDD5', ear: '#FDA4AF', eye: '#15803D', nose: '#FB7185' },
    },
    {
      breedName: 'Siberian Husky',
      category: 'dog' as const,
      species: 'husky' as const,
      palette: { primary: '#334155', secondary: '#1E293B', belly: '#F8FAFC', ear: '#CBD5E1', eye: '#38BDF8', nose: '#0F172A' },
    },
  ];
  const choice = breeds[Math.floor(Math.random() * breeds.length)];
  const name = userGivenName?.trim() || (choice.category === 'dog' ? 'Buddy' : 'Mochi');
  return {
    name,
    title: 'The Couch Monarch',
    category: choice.category,
    species: choice.species,
    breedName: choice.breedName,
    palette: choice.palette,
    features: {
      earType: choice.category === 'cat' ? 'pointed' : 'floppy',
      hasWhiskers: choice.category === 'cat',
      eyePatch: true,
      collarColor: '#CCFF00',
      fluffyTail: true,
    },
    personalityTraits: ['Playful Zoomer', 'Cuddle Champion', 'Treat Sniffer'],
    quirk: 'Chases imaginary butterflies and insists on sleeping directly across keyboard.',
    signatureMove: {
      name: `${name}'s Mega Pounce`,
      description: 'Dashes with unstoppable momentum, stunning opponents with cuteness.',
    },
    stats: {
      attack: 56,
      defense: 54,
      agility: 65,
      stamina: 60,
      cp: 475,
    },
    battleBuff: {
      name: 'Owner Bond',
      description: '+15% Critical Strike Multiplier from unconditional love.',
      effectType: 'crit_chance' as const,
      potency: 15,
    },
  };
}

// AI Pet Photo Analysis Endpoint
app.post('/api/pet/analyze-photo', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', userGivenName } = req.body;
    if (!imageBase64) {
      res.status(400).json({ success: false, error: 'Image base64 data is required.' });
      return;
    }

    // Clean base64 string
    let cleanBase64 = imageBase64;
    let detectedMime = mimeType;
    const match = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (match) {
      detectedMime = match[1];
      cleanBase64 = match[2];
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. Using smart procedural avatar generator fallback.');
      const fallback = generateProceduralFallback(userGivenName);
      res.json({ success: true, avatar: fallback, source: 'procedural_fallback' });
      return;
    }

    const ai = new GoogleGenAI();
    const prompt = `You are an expert anime & pet character designer for the game PET SLAM.
Analyze this photo of a user's real pet and extract detailed traits to construct a customized virtual game avatar.
Extract:
1. Animal category: "dog" | "cat" | "beast"
2. Base species in the game engine:
   - For cats: "tabby", "calico", "siamese", or "blackcat"
   - For dogs: "shiba", "retriever", "husky", or "bulldog"
   - For exotic/beasts: "kodiak", "bagheera", "ignis", or "sultan"
3. Detected breed (e.g. "Golden Retriever", "Orange Tabby", "French Bulldog", "Ragdoll", "Mixed Terrier", etc.)
4. Pet Name: (use "${userGivenName || ''}" if given and non-empty, otherwise invent a great cute name based on their appearance)
5. Heroic Title: (e.g. "The Velvet Prowler", "The Zoomies Champion", "The Sofa Monarch")
6. Hex Color Palette matching the photo:
   - primary: Main body fur color (hex e.g. #D97706, #FFFFFF, #1E293B, #F59E0B)
   - secondary: Accent markings/patches/outer ears color (hex)
   - belly: Chest/belly patch color (hex)
   - ear: Inner ear color (hex)
   - eye: Iris color (hex e.g. #0284C7 for blue, #15803D for green, #D97706 for amber, #292524 for brown)
   - nose: Muzzle/nose color (hex)
7. Features:
   - earType: "pointed" | "floppy" | "round"
   - hasWhiskers: boolean
   - eyePatch: boolean (whether there is a noticeable patch over one eye)
   - collarColor: hex color (matching their collar or a vibrant #CCFF00)
   - fluffyTail: boolean
8. Personality traits: array of 3 fun short tags (e.g. ["Energetic Zoomer", "Treat Sniffer", "Cuddle Champion"])
9. Quirk: 1 funny sentence about this pet's real-life quirk
10. Signature Move: name and description of their special arena move
11. Stats: CP (420 to 650), attack (45 to 75), defense (45 to 75), agility (45 to 80), stamina (45 to 75)
12. Battle Buff: name, description, effectType ("crit_chance" | "damage_shield" | "elixir_rate"), potency (12 to 18)

Return ONLY valid JSON matching this schema:
{
  "name": string,
  "title": string,
  "category": "cat" | "dog" | "beast",
  "species": "tabby" | "calico" | "siamese" | "blackcat" | "shiba" | "retriever" | "husky" | "bulldog" | "kodiak" | "bagheera" | "ignis" | "sultan",
  "breedName": string,
  "palette": {
    "primary": string,
    "secondary": string,
    "belly": string,
    "ear": string,
    "eye": string,
    "nose": string
  },
  "features": {
    "earType": "pointed" | "floppy" | "round",
    "hasWhiskers": boolean,
    "eyePatch": boolean,
    "collarColor": string,
    "fluffyTail": boolean
  },
  "personalityTraits": string[],
  "quirk": string,
  "signatureMove": {
    "name": string,
    "description": string
  },
  "stats": {
    "attack": number,
    "defense": number,
    "agility": number,
    "stamina": number,
    "cp": number
  },
  "battleBuff": {
    "name": string,
    "description": string,
    "effectType": "crit_chance" | "damage_shield" | "elixir_rate",
    "potency": number
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          inlineData: {
            mimeType: detectedMime,
            data: cleanBase64,
          },
        },
        prompt,
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);

    res.json({
      success: true,
      avatar: parsed,
      source: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('Error analyzing pet photo with Gemini:', error);
    const fallback = generateProceduralFallback(req.body?.userGivenName);
    res.json({
      success: true,
      avatar: fallback,
      source: 'procedural_fallback_error',
      note: error?.message || 'Generated via high-fidelity procedural avatar synthesis',
    });
  }
});

// ---------------------------------------------------------------------------
// Exa Real-World Pet Lore & Breed Research Endpoint
// Canonical API shape from build-with-exa: query + type: "auto" + contents: { highlights: true }
// ---------------------------------------------------------------------------
app.post('/api/pet/lore-search', async (req, res) => {
  try {
    const { query, breedName, species } = req.body;
    const targetQuery =
      query ||
      `${breedName || ''} ${species || ''} breed history temperament fun facts origin`.trim() ||
      'pet dog cat breed origins';

    if (!exaClient) {
      const freshKey = process.env.EXA_API_KEY;
      if (freshKey && freshKey.trim().length > 0) {
        exaClient = new Exa(freshKey.trim());
      }
    }

    if (!exaClient) {
      res.status(503).json({
        success: false,
        error: 'EXA_API_KEY is not configured on the server.',
      });
      return;
    }

    const searchResponse = await exaClient.search(targetQuery, {
      type: 'auto',
      contents: { highlights: true },
    });

    res.json({
      success: true,
      query: targetQuery,
      results: searchResponse.results,
      cost: searchResponse.costDollars,
    });
  } catch (error: any) {
    console.error('[Exa] Search error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to search Exa pet lore',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: Number(PORT),
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const server = http.createServer(app);

  // Initialize Authoritative 20-Tick Combat WebSocket Server
  authoritativeCombatServer.init(server);

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[PET SLAM] Server operational on http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('[PET SLAM] Server failed to start:', err);
  process.exit(1);
});
