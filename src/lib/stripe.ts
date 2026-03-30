import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export const PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT ?? 15);

export function calculateFees(amount: number): { fee: number; net: number } {
  const fee = Math.round(amount * (PLATFORM_FEE_PERCENT / 100) * 100) / 100;
  return { fee, net: amount - fee };
}
