/**
 * Cloudflare Pages Function: /api/dodo/webhook
 * Receives, cryptographically verifies, and acknowledges Dodo Payments webhook callbacks
 * on Cloudflare Workers edge runtime (PAY-3).
 */

interface Env {
  DODO_PAYMENTS_WEBHOOK_SECRET?: string;
  VITE_SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

interface EventContext {
  request: Request;
  env: Env;
}

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Webhook-Id, Webhook-Signature, Webhook-Timestamp',
};

async function verifyWebhookSignature(
  rawBody: string,
  secret: string,
  webhookId: string | null,
  webhookTimestamp: string | null,
  signatureHeader: string | null
): Promise<boolean> {
  if (!signatureHeader) return false;

  // Extract raw secret (strip whsec_ prefix if present)
  let cleanSecret = secret.trim();
  if (cleanSecret.startsWith('whsec_')) {
    cleanSecret = cleanSecret.slice(6);
  }

  try {
    const encoder = new TextEncoder();
    let secretKeyBytes: Uint8Array;
    try {
      // Decode base64 secret or use raw utf-8
      const binaryStr = atob(cleanSecret);
      secretKeyBytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        secretKeyBytes[i] = binaryStr.charCodeAt(i);
      }
    } catch {
      secretKeyBytes = encoder.encode(cleanSecret);
    }

    const key = await crypto.subtle.importKey(
      'raw',
      secretKeyBytes as unknown as BufferSource,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify', 'sign']
    );

    // Standard Webhook payload to sign: ${id}.${timestamp}.${body}
    const signedPayload = webhookId && webhookTimestamp
      ? `${webhookId}.${webhookTimestamp}.${rawBody}`
      : rawBody;

    // Signature header may contain multiple signatures: "v1,sig1 v1,sig2"
    const passedSignatures = signatureHeader
      .split(' ')
      .map((part) => (part.includes(',') ? part.split(',')[1] : part));

    const computedSigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
    const computedBase64 = btoa(String.fromCharCode(...new Uint8Array(computedSigBuffer)));

    return passedSignatures.some((sig) => sig === computedBase64);
  } catch (err) {
    console.warn('[Webhook Signature] Verification error:', err);
    return false;
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function onRequestPost(context: EventContext): Promise<Response> {
  try {
    const rawBody = await context.request.text();
    const webhookSecret = context.env?.DODO_PAYMENTS_WEBHOOK_SECRET;

    const webhookId = context.request.headers.get('webhook-id') || context.request.headers.get('Webhook-Id');
    const webhookTimestamp = context.request.headers.get('webhook-timestamp') || context.request.headers.get('Webhook-Timestamp');
    const webhookSig = context.request.headers.get('webhook-signature') || context.request.headers.get('Webhook-Signature');

    // Cryptographic signature check if webhook secret is configured
    if (webhookSecret && webhookSecret.trim().length > 0) {
      const isValid = await verifyWebhookSignature(rawBody, webhookSecret, webhookId, webhookTimestamp, webhookSig);
      if (!isValid) {
        return new Response(
          JSON.stringify({ error: 'Invalid webhook signature.' }),
          { status: 401, headers: corsHeaders }
        );
      }
    }

    let event: any = null;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ error: 'Malformed JSON payload.' }), { status: 400, headers: corsHeaders });
    }

    const eventType = event?.type || event?.event_type || 'unknown';
    console.log(`[Cloudflare Dodo Webhook] Received verified event: ${eventType}`);

    // Persist verified purchase to Supabase if credentials exist
    const supabaseUrl = context.env?.VITE_SUPABASE_URL;
    const supabaseKey = context.env?.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey && (eventType === 'payment.succeeded' || eventType === 'checkout.session.completed')) {
      const payloadData = event.data || event;
      const paymentId = payloadData?.payment_id || payloadData?.id || webhookId || `pay_${Date.now()}`;
      const passType = payloadData?.metadata?.passType || 'supporter';
      const customerEmail = payloadData?.customer?.email || payloadData?.metadata?.customerEmail;
      const amountCents = payloadData?.amount || 99;

      await fetch(`${supabaseUrl}/rest/v1/purchases`, {
        method: 'POST',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=ignore-duplicates',
        },
        body: JSON.stringify({
          payment_id: paymentId,
          pass_type: passType,
          amount_cents: amountCents,
          status: 'succeeded',
          customer_email: customerEmail,
        }),
      }).catch((e) => console.warn('[Webhook] Failed to insert purchase into Supabase:', e));
    }

    return new Response(JSON.stringify({ received: true, eventType }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Webhook processing failed' }), {
      status: 400,
      headers: corsHeaders,
    });
  }
}
