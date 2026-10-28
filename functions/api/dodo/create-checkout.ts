/**
 * Cloudflare Pages Function: /api/dodo/create-checkout
 * Creates a hosted checkout session via Dodo Payments API on Cloudflare Workers edge runtime.
 */

interface Env {
  DODO_PAYMENTS_API_KEY?: string;
  DODO_PAYMENTS_ENVIRONMENT?: string;
  DODO_PRODUCT_AUCTION_PASS?: string;
  DODO_PRODUCT_AVATAR_PASS?: string;
  DODO_PRODUCT_EXTENSION_PASS?: string;
  DODO_PRODUCT_BUNDLE_PASS?: string;
  DODO_PRODUCT_CREDITS_5K?: string;
}

interface EventContext {
  request: Request;
  env: Env;
}

interface CreateCheckoutBody {
  passType: 'auction' | 'avatar' | 'extension' | 'bundle' | 'credits_5000';
  customerEmail?: string;
  customerName?: string;
  returnUrl?: string;
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
  const env = context.env || {};
  const apiKey =
    env.DODO_PAYMENTS_API_KEY ||
    'dodo_test_r9a5A4oyLuJ4pMD8.Sc7lZ9a1amcp8YTzVOUqFQUQ8iIFViJBJcT0eRTvbtHgHr6m';

  const isLive = apiKey.startsWith('dodo_live_') || env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode';
  const dodoEndpoint = isLive
    ? 'https://live.dodopayments.com/checkouts'
    : 'https://test.dodopayments.com/checkouts';

  const productCatalog: Record<string, string> = {
    auction: env.DODO_PRODUCT_AUCTION_PASS || 'pdt_0NqgJlisZzb8svxO90gL0',
    avatar: env.DODO_PRODUCT_AVATAR_PASS || 'pdt_0NqgJPS04QMUNn6vlOUrI',
    extension: env.DODO_PRODUCT_EXTENSION_PASS || 'pdt_0NqgJtNVeIeTlUsEMZ3C1',
    bundle: env.DODO_PRODUCT_BUNDLE_PASS || 'pdt_0NqgJznwnQjxDNNAydOuK',
    credits_5000: env.DODO_PRODUCT_CREDITS_5K || 'pdt_0NqgJznwnQjxDNNAydOuK',
  };

  try {
    const body = (await context.request.json()) as CreateCheckoutBody;
    const { passType, customerEmail, customerName, returnUrl } = body;

    const productId = productCatalog[passType];
    if (!productId) {
      return new Response(
        JSON.stringify({ error: `Unknown or unconfigured passType: ${passType}` }),
        { status: 400, headers: corsHeaders }
      );
    }

    const defaultReturnUrl = `https://www.petslam.app/?dodo_payment=success&pass=${passType}`;
    const finalReturnUrl = returnUrl || defaultReturnUrl;

    const payload: Record<string, any> = {
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
        },
      ],
      return_url: finalReturnUrl,
    };

    if (customerEmail && customerEmail.trim().length > 0) {
      payload.billing = {
        email: customerEmail.trim(),
        name: customerName ? customerName.trim() : customerEmail.split('@')[0],
      };
    }

    const dodoRes = await fetch(dodoEndpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!dodoRes.ok) {
      const errText = await dodoRes.text();
      console.error('[Cloudflare Dodo] API error response:', dodoRes.status, errText);
      return new Response(
        JSON.stringify({
          error: `Dodo Payments checkout failed (${dodoRes.status}): ${errText}`,
        }),
        { status: dodoRes.status, headers: corsHeaders }
      );
    }

    const result = (await dodoRes.json()) as { session_id?: string; checkout_url?: string };

    return new Response(
      JSON.stringify({
        checkoutUrl: result.checkout_url,
        sessionId: result.session_id,
        mode: isLive ? 'live_mode' : 'test_mode',
        simulated: false,
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (err: any) {
    console.error('[Cloudflare Dodo] Internal error:', err);
    return new Response(
      JSON.stringify({ error: err?.message || 'Internal error creating Dodo checkout session' }),
      { status: 500, headers: corsHeaders }
    );
  }
}
