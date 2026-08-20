import Stripe from "stripe";

function env(key: string): string | undefined {
  const v = process.env[key]?.trim();
  return v || undefined;
}

export const CLUB_MONTHLY_CENTS = 2999;
export const CLUB_YEARLY_CENTS = 23988;

export function clubPrices() {
  const monthly = env("STRIPE_PRICE_MONTHLY");
  const yearly = env("STRIPE_PRICE_YEARLY");
  return { monthly, yearly };
}

export function getStripe(): Stripe {
  const key = env("STRIPE_SECRET_KEY");
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

export function appOrigin(): string {
  return env("BETTER_AUTH_URL") ?? "http://localhost:8080";
}

export function isClubActive(status: string | null | undefined): boolean {
  return status === "active" || status === "trialing";
}
