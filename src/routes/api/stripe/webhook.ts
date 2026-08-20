import { createFileRoute } from "@tanstack/react-router";
import type Stripe from "stripe";
import { applyClubEntitlement } from "@/lib/server/jw";
import { getStripe, isClubActive } from "@/lib/server/stripe";

async function userIdFromSubscription(sub: Stripe.Subscription): Promise<string | null> {
  const meta = sub.metadata?.userId;
  if (meta) return meta;
  return null;
}

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
        if (!secret) return new Response("webhook unconfigured", { status: 500 });
        const stripe = getStripe();
        const sig = request.headers.get("stripe-signature");
        if (!sig) return new Response("missing signature", { status: 400 });
        const raw = await request.text();
        let event: Stripe.Event;
        try {
          event = stripe.webhooks.constructEvent(raw, sig, secret);
        } catch {
          return new Response("invalid signature", { status: 400 });
        }

        if (event.type === "checkout.session.completed") {
          const session = event.data.object as Stripe.Checkout.Session;
          if (session.mode !== "subscription") return new Response("ok");
          const userId = session.client_reference_id ?? session.metadata?.userId ?? null;
          const subId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
          const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
          await applyClubEntitlement({
            userId,
            customerId,
            subscriptionId: subId ?? null,
            active: true,
          });
        }

        if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
          const sub = event.data.object as Stripe.Subscription;
          const userId = await userIdFromSubscription(sub);
          const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
          await applyClubEntitlement({
            userId,
            customerId,
            subscriptionId: sub.id,
            active: event.type === "customer.subscription.deleted" ? false : isClubActive(sub.status),
          });
        }

        return new Response("ok");
      },
    },
  },
});
