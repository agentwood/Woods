import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame } from "lucide-react";
import { RequireAuth } from "@/components/layout/require-auth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SkillCard } from "@/components/skill/skill-card";
import {
  conceptName,
  getCatalog,
  getLesson,
  getSkill,
  liveSkills,
  nextLessonInSkill,
  skillAxes,
  skillMasteryPct,
  XP,
} from "@/lib/content";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { useProgress } from "@/lib/progress-context";
import { skillBanner } from "@/lib/banners";

export const Route = createFileRoute("/_app/home")({ component: HomePage });

function HomePage() {
  return (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "GOOD MORNING";
  if (h < 18) return "GOOD AFTERNOON";
  return "GOOD EVENING";
}

function Dashboard() {
  const user = useCurrentUser();
  const { data, loading } = useProgress();
  const catalog = getCatalog().filter((s) => s.live);

  if (loading || !data) {
    return <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-muted">Loading your adventure…</div>;
  }

  const completed = new Set(data.lessons.filter((l) => l.completed).map((l) => l.lesson_id));
  const startedIds = new Set(data.skills.map((s) => s.skill_id));

  let continueLesson: ReturnType<typeof getLesson> | undefined;
  let continueSkill: ReturnType<typeof getSkill> | undefined;
  const recentSkill = data.skills[0]?.skill_id;
  if (recentSkill) {
    const skill = getSkill(recentSkill);
    if (skill) {
      continueSkill = skill;
      continueLesson = nextLessonInSkill(skill, completed);
    }
  }
  if (!continueLesson) {
    for (const skill of liveSkills) {
      const next = nextLessonInSkill(skill, completed);
      if (next) {
        continueLesson = next;
        continueSkill = skill;
        break;
      }
    }
  }

  const weak = [...data.concepts].filter((c) => c.attempts > 0).sort((a, b) => a.mastery - b.mastery)[0];
  const daily = getLesson(data.dailyLessonId);
  const continuePct = continueSkill ? skillMasteryPct(continueSkill, completed) : 0;
  const first = user?.displayName?.split(" ")[0] ?? "adventurer";

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="font-pixel text-sm tracking-widest text-muted">
        {greeting()}, {first.toUpperCase()}
      </p>
      <h1 className="mt-2 font-pixel text-3xl tracking-tight sm:text-5xl">Your next move.</h1>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="overflow-hidden rounded-xl border border-border bg-surface lg:col-span-2">
          {continueLesson && continueSkill ? (
            <>
              <img
                src={skillBanner(continueSkill)}
                alt=""
                className="h-40 w-full object-cover sm:h-48"
              />
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">Your next move</p>
                <h2 className="mt-2 font-pixel text-2xl tracking-tight sm:text-3xl">
                  {continueSkill.name} — {continueLesson.title}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {continueSkill.fantasy} · {continueLesson.minutes} minutes · +{XP.lessonComplete}+ XP
                </p>
                <p className="mt-3 text-xs tabular-nums text-muted">{continuePct}% complete</p>
                <Progress value={continuePct} className="mt-2" />
                <Button asChild className="mt-6">
                  <Link to="/learn/$lessonId" params={{ lessonId: continueLesson.id }}>
                    Continue
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="p-5">
              <h2 className="font-pixel text-3xl tracking-tight">Pick a world.</h2>
              <p className="mt-2 text-sm text-muted">Twelve lands are live. Start with the one you want to get good at.</p>
              <Button asChild className="mt-6">
                <Link to="/explore">Explore worlds</Link>
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Streak</p>
            <div className="mt-2 flex items-center gap-2 text-gold">
              <Flame className="size-5" />
              <p className="font-pixel text-2xl">{data.profile.streakDays} days</p>
            </div>
            <p className="mt-1 text-sm text-muted">Level {data.profile.level} · {data.profile.totalXp.toLocaleString()} XP</p>
            <Button asChild variant="outline" className="mt-5 w-full" size="sm">
              <Link to="/profile">View profile</Link>
            </Button>
          </div>

          {weak ? (
            <div className="rounded-xl border border-border bg-surface p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted">Weak area</p>
              <h3 className="mt-2 font-pixel text-xl tracking-tight">{conceptName(weak.concept_id)}</h3>
              <p className="mt-1 text-sm text-muted">{weak.mastery}% mastered.</p>
              <Button asChild size="sm" className="mt-4" variant="outline">
                <Link to="/practice/$conceptId" params={{ conceptId: weak.concept_id }}>
                  Practice →
                </Link>
              </Button>
            </div>
          ) : null}

          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Daily challenge</p>
            <h3 className="mt-2 font-pixel text-xl tracking-tight">
              {daily?.title ?? "Today's challenge"}
            </h3>
            <p className="mt-1 text-sm text-muted">{daily?.summary ?? "A short diagnosis."}</p>
            <p className="mt-2 text-sm text-gold">+{XP.dailyChallenge} XP</p>
            <Button asChild size="sm" className="mt-4" variant="blue">
              <Link to="/learn/$lessonId" params={{ lessonId: data.dailyLessonId }}>
                Solve it →
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <h2 className="mt-12 font-pixel text-3xl tracking-tight">Mastered</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {catalog
          .filter((s) => startedIds.has(s.id))
          .map((row) => {
            const skill = getSkill(row.id);
            if (!skill) return null;
            const axes = skillAxes(skill, data.concepts);
            return (
              <Link
                key={row.id}
                to="/skills/$slug"
                params={{ slug: row.slug }}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">{skill.fantasy}</p>
                <p className="mt-1 font-pixel text-lg">{skill.name}</p>
                <p className="mt-1 text-sm text-gold">{axes.overall}%</p>
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
              </Link>
            );
          })}
      </div>

      <h2 className="mt-12 font-pixel text-3xl tracking-tight">Your worlds</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {catalog.map((skill) => {
          const s = getSkill(skill.id);
          const mastery = s ? skillMasteryPct(s, completed) : 0;
          return (
            <SkillCard
              key={skill.id}
              skill={skill}
              started={startedIds.has(skill.id)}
              mastery={mastery}
            />
          );
        })}
      </div>
    </main>
  );
}
