import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useProgress } from "@/lib/progress-context";
import { createBillingPortal, createClubCheckout } from "@/lib/server/jw";

export const Route = createFileRoute("/_app/pricing")({
  validateSearch: (s: Record<string, unknown>): { club?: string } =>
    typeof s.club === "string" ? { club: s.club } : {},
  component: Pricing,
});

function Pricing() {
  const { user, isPending } = useCurrentUserState();
  const { data } = useProgress();
  const nav = useNavigate();
  const search = Route.useSearch();
  const pro = Boolean(data?.profile.isPro);

  async function pay(period: "monthly" | "yearly") {
    if (!user) {
      void nav({ to: "/login" });
      return;
    }
    const { url } = await createClubCheckout({ data: period });
    window.location.href = url;
  }

  async function portal() {
    const { url } = await createBillingPortal();
    window.location.href = url;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <p className="font-pixel text-sm tracking-[0.22em] text-gold">WOODS CLUB</p>
      <h1 className="mt-2 font-pixel text-4xl tracking-tight sm:text-5xl">Play the full world.</h1>
      <p className="mt-3 max-w-xl text-muted">
        Free gets you through the first chapter of every world — and every 3-minute trial is free. Club is the rest of
        the map. Pixel lands. Gold path. No certificates. Just the game.
      </p>

      {search.club === "ok" ? (
        <p className="mt-4 font-pixel text-sm text-gold">Club checkout complete. Welcome in.</p>
      ) : null}
      {search.club === "cancel" ? (
        <p className="mt-4 text-sm text-muted">Checkout cancelled. The worlds can wait.</p>
      ) : null}

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <Plan
          name="Free"
          price="$0"
          items={["First level of each world", "Try-before-you-learn challenges", "One daily challenge", "XP, streaks, and mastery"]}
        />
        <Plan
          name="Club"
          price="$29.99/mo"
          note="$19.99/mo billed yearly ($239.88)"
          featured
          items={[
            "Full skill worlds",
            "Every professional skill as it launches",
            "Boss simulations",
            "Full mastery tracking",
            "Optional explanations",
          ]}
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {pro ? (
          <>
            <p className="font-pixel text-sm text-gold self-center">Club is active on this account.</p>
            <Button variant="outline" size="lg" disabled={isPending} onClick={() => void portal()}>
              Manage billing
            </Button>
          </>
        ) : (
          <>
            <Button size="lg" disabled={isPending} onClick={() => void pay("monthly")}>
              Club monthly · $29.99
            </Button>
            <Button size="lg" variant="outline" disabled={isPending} onClick={() => void pay("yearly")}>
              Club yearly · $19.99/mo
            </Button>
          </>
        )}
        <Button asChild variant="ghost" size="lg">
          <Link to="/explore">Keep exploring</Link>
        </Button>
      </div>
      <p className="mt-6 max-w-lg text-xs text-faint">
        Paid with Stripe. Cancel anytime. Higher than Codédex Club on purpose — this is the full professional map.
      </p>
    </main>
  );
}

function Plan({
  name,
  price,
  note,
  items,
  featured,
}: {
  name: string;
  price: string;
  note?: string;
  items: string[];
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-6 ${
        featured ? "border-gold/40 bg-surface" : "border-border bg-surface"
      }`}
    >
      <p className="font-pixel text-sm text-muted">{name}</p>
      <p className="mt-2 font-pixel text-4xl tracking-tight">{price}</p>
      {note && <p className="text-sm text-muted">{note}</p>}
      <ul className="mt-6 space-y-2 text-sm">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-gold" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
