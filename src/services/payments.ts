import { api } from '../config/api';

export interface Plan {
  id: string;
  code?: string;
  product_code?: string;
  name: string;
  period: 'GRATUIT' | 'MENSUEL' | 'ANNUEL' | string;
  price: number;
  currency: string;
  features: string[];
}

export interface SubscriptionStatus {
  is_premium: boolean;
  status: string;
  plan: Plan | null;
  end_date: string | null;
}

export type CheckoutProductCode =
  | 'STUDENT_ANNUAL'
  | 'TUTOR_SEMESTER'
  | 'SELLER_SEMESTER'
  | 'SCHOOL_ANNUAL'
  | 'TRAINING_OFFICE_BASIC'
  | 'TRAINING_OFFICE_ADVANCED';

export type CheckoutOptionCode =
  | 'TUTOR_HIGHLIGHT_MONTHLY'
  | 'SELLER_HIGHLIGHT_MONTHLY'
  | 'SELLER_BOOST_WEEKLY'
  | 'SCHOOL_BULLETINS_ANNUAL';

export interface TransactionStatus {
  reference: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  amount?: number;
  currency?: string;
  is_subscription?: boolean;
}

const unwrap = (data: any) => data?.data || data;
let planCache: Plan[] = [];

export async function getPlans(): Promise<Plan[]> {
  const { data } = await api.get('/payments/plans/');
  const payload = unwrap(data);
  planCache = Array.isArray(payload) ? payload : payload?.items || payload?.results || payload?.plans || [];
  return planCache;
}

/** Le statut est dérivé du profil serveur, car aucune route subscription/status n'a été fournie. */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const { data } = await api.get('/auth/me/');
  const payload = unwrap(data) || {};
  const rawPlan = payload.subscription_plan || payload.plan || payload.profile?.subscription_plan || null;
  const name = String(rawPlan?.name || rawPlan || 'free');
  const active = Boolean(payload.is_premium || payload.subscription?.is_active || !['', 'free', 'gratuit', 'null'].includes(name.toLowerCase()));
  return {
    is_premium: active,
    status: active ? 'ACTIVE' : 'FREE',
    plan: rawPlan && typeof rawPlan === 'object' ? rawPlan : null,
    end_date: payload.subscription?.end_date || payload.subscription_end_date || null,
  };
}

export async function initiateSubscription(planId: string, currency = 'GNF') {
  if (!planCache.length) await getPlans().catch(() => undefined);
  const plan = planCache.find(item => String(item.id) === String(planId));
  const productCode = plan?.product_code || plan?.code || planId;
  const { data } = await api.post('/payments/checkout/initiate', {
    product_code: productCode,
    currency,
  });
  return unwrap(data);
}

export async function initiateCatalogCheckout(payload: {
  product_code: CheckoutProductCode;
  option_codes?: CheckoutOptionCode[];
  quantity?: number;
}) {
  const { data } = await api.post('/payments/checkout/initiate', payload);
  return unwrap(data);
}

export async function initiatePayment(payload: { order_id: string }) {
  const { data } = await api.post('/payments/checkout/initiate', { order_id: payload.order_id });
  return unwrap(data);
}

export async function getTransactionStatus(reference: string): Promise<TransactionStatus> {
  const { data } = await api.get(`/payments/transactions/${encodeURIComponent(reference)}/status`);
  return unwrap(data);
}

export async function getTransactions(): Promise<any[]> {
  return [];
}
