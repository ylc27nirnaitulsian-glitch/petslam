/**
 * Dodo Payments Client Service for PET SLAM
 * Connects frontend to backend checkout session creation and status verification.
 */

export type DodoPassType = 'auction' | 'avatar' | 'extension' | 'bundle' | 'credits_5000';

export interface DodoProductInfo {
  id: string;
  title: string;
  price: string;
  amountCents: number;
  description: string;
}

export interface DodoCheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
  mode: 'live_mode' | 'test_mode' | 'test_sandbox';
  simulated?: boolean;
  message?: string;
}

export interface DodoConfigResponse {
  enabled: boolean;
  configured: boolean;
  environment: string;
  products: Record<DodoPassType, DodoProductInfo>;
}

/**
 * Fetch Dodo Payments configuration and product catalog
 */
export async function getDodoConfig(): Promise<DodoConfigResponse | null> {
  try {
    const res = await fetch('/api/dodo/config');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('[DodoPayments] Failed to fetch config:', err);
    return null;
  }
}

/**
 * Create a new Dodo Payments Checkout Session
 */
export async function createDodoCheckout(params: {
  passType: DodoPassType;
  customerEmail?: string;
  customerName?: string;
  returnUrl?: string;
}): Promise<DodoCheckoutResponse> {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const finalReturnUrl =
    params.returnUrl ||
    `${origin}/?dodo_payment=success&pass=${params.passType}`;

  const res = await fetch('/api/dodo/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      passType: params.passType,
      customerEmail: params.customerEmail,
      customerName: params.customerName,
      returnUrl: finalReturnUrl,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Checkout request failed' }));
    throw new Error(err.error || 'Failed to initialize Dodo Payments checkout session.');
  }

  return await res.json();
}

/**
 * Launch Dodo Payments checkout flow
 */
export async function launchDodoCheckout(params: {
  passType: DodoPassType;
  customerEmail?: string;
  customerName?: string;
  onBeforeRedirect?: () => void;
}): Promise<void> {
  const session = await createDodoCheckout(params);

  if (params.onBeforeRedirect) {
    params.onBeforeRedirect();
  }

  if (session.checkoutUrl) {
    window.location.href = session.checkoutUrl;
  } else {
    throw new Error('No checkout URL returned from payment server.');
  }
}
