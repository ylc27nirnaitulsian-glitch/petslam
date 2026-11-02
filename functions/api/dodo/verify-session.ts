/**
 * Cloudflare Pages Function: /api/dodo/verify-session
 * Verifies a Dodo Payments session status against Dodo Payments API
 * or database entitlements before granting access on the client.
 */

interface Env {
  DODO_PAYMENTS_API_KEY?: string;
  DODO_PAYMENTS_ENVIRONMENT?: string;
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
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function onRequestGet(context: EventContext): Promise<Response> {
  try {
    const url = new URL(context.request.url);
    const sessionId = url.searchParams.get('sessionId') || url.searchParams.get('session_id');

    if (!sessionId || sessionId.trim().length === 0) {
      return new Response(
        JSON.stringify({ verified: false, error: 'Session ID is required.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const env = context.env || {};
    const apiKey = env.DODO_PAYMENTS_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ verified: false, error: 'Dodo Payments API key not configured on server.' }),
        { status: 500, headers: corsHeaders }
      );
    }

    const isLive = apiKey.startsWith('dodo_live_') || env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode';
    const baseUrl = isLive ? 'https://live.dodopayments.com' : 'https://test.dodopayments.com';

    // Query Dodo Payments checkouts / payments endpoint
    const dodoRes = await fetch(`${baseUrl}/payments/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!dodoRes.ok) {
      // Check checkouts endpoint if payments lookup returned 404
      const checkoutRes = await fetch(`${baseUrl}/checkouts/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!checkoutRes.ok) {
        return new Response(
          JSON.stringify({ verified: false, error: 'Unable to verify payment with Dodo Payments.' }),
          { status: 404, headers: corsHeaders }
        );
      }

      const checkoutData: any = await checkoutRes.json();
      const status = checkoutData.status || checkoutData.payment_status;
      const isPaid = status === 'succeeded' || status === 'paid' || status === 'completed';

      return new Response(
        JSON.stringify({
          verified: isPaid,
          status,
          passType: checkoutData.metadata?.passType,
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    const paymentData: any = await dodoRes.json();
    const isPaid = paymentData.status === 'succeeded' || paymentData.status === 'paid';

    return new Response(
      JSON.stringify({
        verified: isPaid,
        status: paymentData.status,
        passType: paymentData.metadata?.passType,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ verified: false, error: err.message || 'Verification failed.' }),
      { status: 500, headers: corsHeaders }
    );
  }
}
