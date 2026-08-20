import { Link, useRouterState } from "@tanstack/react-router";
import { Flame, House, Map, Swords, UserRound } from "lucide-react";
import { SignedIn, SignedOut } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { signOut } from "@/lib/auth/client";
import { useProgress } from "@/lib/progress-context";
import { SiteHeader } from "./site-header";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const MOBILE = [
  { to: "/home", label: "Home", icon: House },
  { to: "/explore", label: "Learn", icon: Map },
  { to: "/challenges", label: "Practice", icon: Swords },
  { to: "/profile", label: "Profile", icon: UserRound },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const learn = pathname.startsWith("/learn") || pathname.startsWith("/practice");
  const { data } = useProgress();

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <SiteHeader
        compact={learn}
        club={Boolean(data?.profile.isPro)}
        end={
          <>
            {!learn && <XpChip />}
            <AuthSlot />
          </>
        }
      />
      <div className={learn ? "" : "pb-20 md:pb-0"}>{children}</div>
      {!learn && (
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-ink pb-[env(safe-area-inset-bottom)] md:hidden">
          <div className="grid grid-cols-4">
            {MOBILE.map((item) => {
              const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${
                    active ? "text-gold" : "text-muted"
                  }`}
                >
                  <Icon className="size-5" strokeWidth={1.75} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}

function XpChip() {
  const { data } = useProgress();
  if (!data) return null;
  const pct = data.profile.xpToNext
    ? (data.profile.xpInLevel / data.profile.xpToNext) * 100
    : 0;
  return (
    <div className="hidden min-w-40 items-center gap-3 sm:flex">
      <div className="flex items-center gap-1.5 text-gold">
        <Flame className="size-4" strokeWidth={2} />
        <span className="text-xs font-bold tabular-nums">{data.profile.streakDays}</span>
      </div>
      <div className="min-w-28">
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <span className="font-pixel text-[11px] text-muted">Lv {data.profile.level}</span>
          <span className="text-[11px] tabular-nums text-muted">
            {data.profile.xpInLevel.toLocaleString()} / {data.profile.xpToNext.toLocaleString()}
          </span>
        </div>
        <Progress value={pct} className="h-1.5" />
      </div>
    </div>
  );
}

function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <div className="size-8 animate-pulse rounded-full bg-raised" />;
  }
  if (!user) {
    return (
      <SignedOut>
        <Button asChild size="sm">
          <Link to="/login">Sign up</Link>
        </Button>
      </SignedOut>
    );
  }
  return (
    <SignedIn>
      <div className="flex items-center gap-2">
        <Link to="/profile" className="block">
          {user.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt=""
              className="size-8 rounded-full object-cover ring-2 ring-border"
            />
          ) : (
            <img
              src="/images/avatar.jpg"
              alt=""
              className="size-8 rounded-full object-cover object-top ring-2 ring-border"
            />
          )}
        </Link>
        <button
          type="button"
          onClick={() => void signOut("/")}
          className="hidden text-xs font-semibold text-muted hover:text-fg sm:inline"
        >
          Log out
        </button>
      </div>
    </SignedIn>
  );
}
