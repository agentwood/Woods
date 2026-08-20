import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SignedIn, SignedOut } from "@/lib/auth/gates";
import { WoodsMark } from "./mark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/explore", label: "Learn" },
  { to: "/challenges", label: "Practice" },
  { to: "/skills", label: "Build" },
  { to: "/achievements", label: "Community" },
  { to: "/pricing", label: "Pricing" },
] as const;

export function SiteHeader({
  end,
  club,
  compact,
}: {
  end?: ReactNode;
  club?: boolean;
  compact?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-30 border-b-2 border-border bg-ink">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-5 px-4 sm:px-6">
        <Link to="/" className="shrink-0">
          <WoodsMark club={club} />
        </Link>
        {!compact && (
          <nav className="hidden items-center gap-2 md:flex">
            {NAV.map((item) => {
              const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  {...(item.to === "/pricing" ? { search: {} } : {})}
                  className={cn(
                    "border-b-2 border-transparent px-3 py-2 text-sm font-semibold transition-colors",
                    active ? "border-gold text-gold" : "text-fg/70 hover:border-purple hover:text-fg",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
        <div className="flex items-center gap-3">
          {end}
          {!end && (
            <>
              <SignedOut>
                <Button asChild size="sm">
                  <Link to="/login">Sign up</Link>
                </Button>
              </SignedOut>
              <SignedIn>
                <Button asChild size="sm" variant="outline">
                  <Link to="/home">Home</Link>
                </Button>
              </SignedIn>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
