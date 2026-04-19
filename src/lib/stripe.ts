import Stripe from 'stripe';

const key = import.meta.env.STRIPE_SECRET_KEY;
export const stripe = key ? new Stripe(key, { apiVersion: '2024-11-20.acacia' as any }) : (null as unknown as Stripe);

export function getStripeClient() {
  if (!stripe) throw new Error('STRIPE_SECRET_KEY is not configured');
  return stripe;
}
