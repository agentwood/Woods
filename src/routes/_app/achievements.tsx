import { createFileRoute } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { RequireAuth } from "@/components/layout/require-auth";
import { ACHIEVEMENTS } from "@/lib/progress";
import { useProgress } from "@/lib/progress-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/achievements")({ component: AchievementsPage });

function AchievementsPage() {
  return (
    <RequireAuth>
      <AchievementsInner />
    </RequireAuth>
  );
}

function AchievementsInner() {
  const { data } = useProgress();
  const have = new Set(data?.achievements.map((a) => a.achievement_id) ?? []);
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="font-pixel text-sm tracking-[0.22em] text-purple">COMMUNITY</p>
      <h1 className="mt-2 font-pixel text-4xl tracking-tight">Achievements</h1>
      <p className="mt-2 text-muted">Badges you earn as you journey through the lands.</p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {ACHIEVEMENTS.map((a) => {
          const on = have.has(a.id);
          return (
            <li
              key={a.id}
              className={cn(
                "rounded-xl border border-border bg-surface p-4",
                !on && "opacity-50",
              )}
            >
              <Trophy className={cn("size-5", on ? "text-gold" : "text-muted")} />
              <p className="mt-3 font-pixel">{a.name}</p>
              <p className="mt-1 text-sm text-muted">{a.description}</p>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
