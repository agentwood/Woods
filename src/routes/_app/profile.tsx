import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireAuth } from "@/components/layout/require-auth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { liveSkills, skillAxes, skillMasteryPct } from "@/lib/content";
import { ACHIEVEMENTS } from "@/lib/progress";
import { useProgress } from "@/lib/progress-context";
import { getLeaderboard, setLeaderboardOptOut } from "@/lib/server/jw";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_app/profile")({ component: ProfilePage });

function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileInner />
    </RequireAuth>
  );
}

function ProfileInner() {
  const user = useCurrentUser();
  const { data, reload } = useProgress();
  const [board, setBoard] = useState<Awaited<ReturnType<typeof getLeaderboard>>>([]);
  useEffect(() => {
    void getLeaderboard().then(setBoard).catch(() => setBoard([]));
  }, []);
  if (!data || !user) return <div className="px-4 py-16 text-sm text-muted">Loading…</div>;

  const completed = new Set(data.lessons.filter((l) => l.completed).map((l) => l.lesson_id));
  const name = user.displayName ?? user.primaryEmail ?? "adventurer";
  const have = new Set(data.achievements.map((a) => a.achievement_id));

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center gap-4">
          <img
            src={user.profileImageUrl || "/images/avatar.jpg"}
            alt=""
            className="size-16 rounded-full object-cover object-top"
          />
          <div>
            <h1 className="font-pixel text-3xl tracking-tight">{name}</h1>
            <p className="text-sm text-blue">Level {data.profile.level}</p>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Total XP" value={data.profile.totalXp.toLocaleString()} gold />
          <Stat label="Rank" value={data.profile.isPro ? "Club" : "Free"} gold />
          <Stat label="Badges" value={String(have.size)} />
          <Stat label="Day streak" value={String(data.profile.streakDays)} gold />
        </dl>
        <Progress
          value={(data.profile.xpInLevel / data.profile.xpToNext) * 100}
          className="mt-5"
        />
        <p className="mt-1 text-xs tabular-nums text-muted">
          {data.profile.xpInLevel.toLocaleString()} / {data.profile.xpToNext.toLocaleString()} XP
        </p>
      </div>

      <h2 className="mt-10 font-pixel text-2xl">Mastered</h2>
      <ul className="mt-3 space-y-4">
        {liveSkills.map((skill) => {
          const started = data.skills.some((s) => s.skill_id === skill.id);
          const pct = skillMasteryPct(skill, completed);
          const axes = skillAxes(skill, data.concepts);
          return (
            <li key={skill.id}>
              <Link to="/skills/$slug" params={{ slug: skill.slug }} className="block rounded-xl border border-border bg-surface p-4">
                <div className="flex justify-between text-sm">
                  <span className="font-pixel">{skill.name}</span>
                  <span className="tabular-nums text-gold">{started ? `${axes.overall}%` : "—"}</span>
                </div>
                <p className="mt-1 text-xs uppercase tracking-widest text-muted">{skill.fantasy}</p>
                <Progress value={started ? pct : 0} className="mt-2" />
                {started && (
                  <dl className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted">
                    <div>
                      <dt>Knowledge</dt>
                      <dd className="font-pixel text-fg">{axes.knowledge}%</dd>
                    </div>
                    <div>
                      <dt>Execution</dt>
                      <dd className="font-pixel text-fg">{axes.execution}%</dd>
                    </div>
                    <div>
                      <dt>Problems</dt>
                      <dd className="font-pixel text-fg">{axes.problem}%</dd>
                    </div>
                  </dl>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      <h2 className="mt-10 font-pixel text-2xl">Achievements</h2>
      <p className="mt-2 text-sm text-muted">
        {have.size} / {ACHIEVEMENTS.length} unlocked
      </p>

      <h2 className="mt-10 font-pixel text-2xl">Recent activity</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {data.activity.length === 0 && <li className="text-muted">Nothing yet.</li>}
        {data.activity.map((a, i) => (
          <li key={`${a.created_at}-${i}`} className="flex justify-between gap-3">
            <span>{a.label}</span>
            {a.xp > 0 && <span className="tabular-nums text-gold">+{a.xp}</span>}
          </li>
        ))}
      </ul>

      <h2 className="mt-10 font-pixel text-2xl">Weekly XP</h2>
      <p className="mt-1 text-sm text-muted">Optional. Opt out any time.</p>
      <label className="mt-3 flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={data.profile.leaderboardOptOut}
          onChange={(e) => {
            void setLeaderboardOptOut({ data: e.target.checked }).then(() => reload());
          }}
        />
        Opt out of the leaderboard
      </label>
      {!data.profile.leaderboardOptOut && (
        <ol className="mt-4 space-y-2 text-sm">
          {board.map((row) => (
            <li key={row.userId} className="flex justify-between">
              <span>
                {row.rank}. {row.userId === user.id ? "You" : row.label}
              </span>
              <span className="tabular-nums text-muted">{row.xp} XP</span>
            </li>
          ))}
          {board.length === 0 && <li className="text-muted">No one has opted in this week.</li>}
        </ol>
      )}

      {!data.profile.isPro && (
        <Button asChild className="mt-10">
          <Link to="/pricing" search={{}}>
            Join Club
          </Link>
        </Button>
      )}
    </main>
  );
}

function Stat({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className={`mt-1 font-pixel text-lg ${gold ? "text-gold" : ""}`}>{value}</dd>
    </div>
  );
}
