/**
 * Cloudflare Pages Function: /api/dodo/config
 * Returns Dodo Payments configuration and active product catalog.
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
    auction: {
      id: env.DODO_PRODUCT_AUCTION_PASS || 'pdt_0NqgJlisZzb8svxO90gL0',
      title: 'Auction House VIP License',
      price: '$1.99',
      amountCents: 199,
      description: 'Permanent unlock for high-stakes live player pet auctions and bidding.',
    },
    avatar: {
      id: env.DODO_PRODUCT_AVATAR_PASS || 'pdt_0NqgJPS04QMUNn6vlOUrI',
      title: 'Custom Pet DNA Avatar Pass',
      price: '$0.99',
      amountCents: 99,
      description: 'Upload your pet photos to generate high-res stylized fighting avatars.',
    },
    extension: {
      id: env.DODO_PRODUCT_EXTENSION_PASS || 'pdt_0NqgJtNVeIeTlUsEMZ3C1',
      title: 'Browser Extension Lifetime Pass',
      price: '$1.99',
      amountCents: 199,
      description: 'Lifetime interactive browser companion overlay with real-time feeding & voice mimicry.',
    },
    bundle: {
      id: env.DODO_PRODUCT_BUNDLE_PASS || 'pdt_0NqgJznwnQjxDNNAydOuK',
      title: 'All-Access Genesis VIP Bundle',
      price: '$4.99',
      amountCents: 499,
      description: 'Unlocks Auction Pass, Avatar Studio Pass, Extension Pass + 5,000 Bonus Credits.',
    },
    credits_5000: {
      id: env.DODO_PRODUCT_CREDITS_5K || 'pdt_0NqgJznwnQjxDNNAydOuK',
      title: '5,000 Slam Credits Pack',
      price: '$4.99',
      amountCents: 499,
      description: 'In-game credits for animal training, dietary boosters, and market purchases.',
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
