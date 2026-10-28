/**
 * Cloudflare Pages Function: /api/dodo/webhook
 * Receives and acknowledges Dodo Payments webhook callbacks on Cloudflare Workers edge runtime.
 */

interface Env {
  DODO_PAYMENTS_WEBHOOK_SECRET?: string;
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

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function onRequestPost(context: EventContext): Promise<Response> {
  try {
    const rawBody = await context.request.text();
    let event: any = null;
    try {
      event = JSON.parse(rawBody);
    } catch {
      // not JSON
    }

    const eventType = event?.type || event?.event_type || 'unknown';
    console.log(`[Cloudflare Dodo Webhook] Received event: ${eventType}`);

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
