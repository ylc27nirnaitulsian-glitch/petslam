/**
 * Cloudflare Pages Function: /api/dodo/config
 * Returns Dodo Payments configuration and active product catalog.
 */

interface Env {
  DODO_PAYMENTS_API_KEY?: string;
  DODO_PAYMENTS_ENVIRONMENT?: string;
  DODO_PRODUCT_AVATAR_PASS?: string;
  DODO_PRODUCT_EXTENSION_PASS?: string;
  DODO_PRODUCT_BUNDLE_PASS?: string;
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
  const env = context.env || {};
  const apiKey = env.DODO_PAYMENTS_API_KEY || 'dodo_test_r9a5A4oyLuJ4pMD8.Sc7lZ9a1amcp8YTzVOUqFQUQ8iIFViJBJcT0eRTvbtHgHr6m';
  const isLive = apiKey.startsWith('dodo_live_') || env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode';

  const products = {
    extension: {
      id: env.DODO_PRODUCT_EXTENSION_PASS || 'pdt_0Nr3ogcp25O1QY64y7E4w',
      title: 'PET SLAM Desktop & Browser Companion (Lifetime License)',
      price: '$2.99',
      amountCents: 299,
      description: 'Standalone Chrome extension & desktop productivity companion with posture/hydration alerts and voice mimicry.',
    },
    avatar: {
      id: env.DODO_PRODUCT_AVATAR_PASS || 'pdt_0Nr3oUSO21xdKMqzxV2Bq',
      title: 'AI Pet Photo Studio Scanner Pass',
      price: '$0.99',
      amountCents: 99,
      description: 'Generative AI photo utility converting real dog & cat photos into stylized 2D digital trading cards.',
    },
    supporter: {
      id: env.DODO_PRODUCT_BUNDLE_PASS || 'pdt_0Nr3orAQScqvnahROnSmg',
      title: 'Genesis Founder Supporter Pack',
      price: '$4.99',
      amountCents: 499,
      description: 'Founder cosmetic badge, golden UI livery, and Extension License (100% cosmetic, zero stat advantage).',
    },
    bundle: {
      id: env.DODO_PRODUCT_BUNDLE_PASS || 'pdt_0Nr3orAQScqvnahROnSmg',
      title: 'Genesis Founder Supporter Pack',
      price: '$4.99',
      amountCents: 499,
      description: 'Founder cosmetic badge, golden UI livery, and Extension License (100% cosmetic, zero stat advantage).',
    },
  };

  return new Response(
    JSON.stringify({
      enabled: true,
      configured: true,
      environment: isLive ? 'live_mode' : 'test_mode',
      products,
    }),
    {
      status: 200,
      headers: corsHeaders,
    }
  );
}
