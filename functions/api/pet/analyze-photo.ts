/**
 * Cloudflare Pages Function: /api/pet/analyze-photo
 * Analyzes uploaded pet photos using Gemini Vision API on Cloudflare edge runtime.
 * Implements CORE-1 and CORE-5 (size limits, MIME checks, edge execution).
 */

interface Env {
  GEMINI_API_KEY?: string;
}

interface EventContext {
  request: Request;
  env: Env;
}

interface AnalyzePhotoRequestBody {
  imageBase64: string;
  mimeType?: string;
  userGivenName?: string;
}

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function onRequestPost(context: EventContext): Promise<Response> {
  try {
    const env = context.env || {};
    const apiKey = env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Gemini AI API key is not configured on Cloudflare edge environment.',
        }),
        { status: 503, headers: corsHeaders }
      );
    }

    let body: AnalyzePhotoRequestBody;
    try {
      body = await context.request.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON request payload.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { imageBase64, mimeType = 'image/jpeg', userGivenName } = body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'imageBase64 is required.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // CORE-5: Size check (max 10MB base64 string ~ 7.5MB raw image)
    const MAX_BASE64_LENGTH = 10 * 1024 * 1024;
    if (imageBase64.length > MAX_BASE64_LENGTH) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Image file exceeds maximum allowable size (10MB limit).',
        }),
        { status: 413, headers: corsHeaders }
      );
    }

    // Clean data URL prefix if present
    let cleanBase64 = imageBase64;
    let detectedMime = mimeType;
    const match = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (match) {
      detectedMime = match[1];
      cleanBase64 = match[2];
    }

    // CORE-5: MIME type validation
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/jpg'];
    if (!allowedMimeTypes.includes(detectedMime.toLowerCase())) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Unsupported image MIME type: ${detectedMime}. Only JPEG, PNG, WEBP, and GIF are permitted.`,
        }),
        { status: 415, headers: corsHeaders }
      );
    }

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

    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: detectedMime,
                  data: cleanBase64,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          response_mime_type: 'application/json',
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('[Gemini Cloudflare Edge] API error:', geminiRes.status, errText);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Gemini AI analysis error (${geminiRes.status}): ${errText || geminiRes.statusText}`,
        }),
        { status: geminiRes.status, headers: corsHeaders }
      );
    }

    const geminiData: any = await geminiRes.json();
    const candidateText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    let parsedAvatar;
    try {
      parsedAvatar = JSON.parse(candidateText);
    } catch {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to parse structured pet data from Gemini Vision.',
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        avatar: parsedAvatar,
        source: 'gemini-2.5-flash-edge',
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error('[Gemini Cloudflare Edge] Uncaught exception:', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message || 'Internal server error analyzing pet photo.',
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}
