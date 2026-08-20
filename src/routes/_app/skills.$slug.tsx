import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { firstWorldLesson, getSkill, nextLessonInSkill, skillAxes, skillMasteryPct } from "@/lib/content";
import { WorldMap } from "@/components/skill/world-map";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/lib/progress-context";
import { startSkill } from "@/lib/server/jw";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { editionLabel, legendTitle, skillBanner } from "@/lib/banners";
import { SignedIn, SignedOut } from "@/lib/auth/gates";

export const Route = createFileRoute("/_app/skills/$slug")({ component: SkillWorld });

function SkillWorld() {
  const { slug } = Route.useParams();
  const skill = getSkill(slug);
  const { data, reload } = useProgress();
  const user = useCurrentUser();

  useEffect(() => {
    if (!user || !skill) return;
    void startSkill({ data: skill.id }).then(() => reload());
  }, [user, skill, reload]);

  if (!skill) {
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-pixel text-4xl">That world is not live yet.</h1>
        <Button asChild className="mt-6">
          <Link to="/explore">Explore worlds</Link>
        </Button>
      </main>
    );
  }

  const completed = new Set(data?.lessons.filter((l) => l.completed).map((l) => l.lesson_id) ?? []);
  const mastery = skillMasteryPct(skill, completed);
  const next = nextLessonInSkill(skill, completed);
  const first = user?.displayName?.split(" ")[0] ?? "adventurer";
  const axes = skillAxes(skill, data?.concepts ?? []);
  const startLesson = next ?? firstWorldLesson(skill);

  return (
    <main className="pb-16">
      <section className="relative isolate overflow-hidden">
        <img
          src={skillBanner(skill)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,8,12,0.15)_0%,rgba(7,8,12,0.35)_55%,#07080c_100%)]" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:py-20">
          <p className="font-pixel text-sm tracking-widest text-gold">{skill.fantasy}</p>
          <h1 className="hero-title mt-2 text-4xl sm:text-6xl">{legendTitle(skill.name)}</h1>
          <p className="mt-4 font-pixel text-base text-fg/90">{editionLabel(skill.difficulty)}</p>
          <p className="mx-auto mt-3 max-w-lg text-sm text-fg/80">{skill.tagline}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {startLesson ? (
              <SignedIn>
                <Button asChild>
                  <Link to="/learn/$lessonId" params={{ lessonId: startLesson.id }}>
                    {next ? "Start" : "Replay"}
                  </Link>
                </Button>
              </SignedIn>
            ) : null}
            <SignedOut>
              <Button asChild>
                <Link to="/login">Start</Link>
              </Button>
            </SignedOut>
            <Button asChild variant="outline">
              <Link to="/try/$slug" params={{ slug: skill.slug }}>
                Try · 3 min
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <div className="relative -mt-6 flex items-end gap-4">
          <img
            src="/images/mascot.jpg"
            alt=""
            className="hidden size-24 shrink-0 rounded-xl border border-border object-cover object-center sm:block"
          />
          <div className="rounded-xl border border-border bg-surface px-4 py-3 text-sm">
            <p>
              Welcome back, <span className="font-semibold">{first}</span>! Let's get learning.
            </p>
            <p className="mt-1 text-muted">
              {mastery}% complete · Knowledge {axes.knowledge}% · Execution {axes.execution}% · Problems {axes.problem}%
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="h-fit rounded-xl border border-border bg-surface p-5">
            <h2 className="font-pixel text-lg">How to Play</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li className="flex items-center gap-2">
                <Star className="size-3.5 fill-gold text-gold" /> Complete missions
              </li>
              <li className="flex items-center gap-2">
                <Star className="size-3.5 fill-gold text-gold" /> Gain XP
              </li>
              <li className="flex items-center gap-2">
                <Star className="size-3.5 fill-gold text-gold" /> Beat the bosses
              </li>
            </ul>
            <div className="mt-6 border-t border-border pt-4">
              <p className="font-pixel text-sm text-muted">My Stats</p>
              <p className="mt-2 text-sm">
                <span className="text-gold">{data?.profile.totalXp.toLocaleString() ?? 0}</span> XP
              </p>
              <p className="text-sm text-muted">Level {data?.profile.level ?? 1}</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="mt-4 w-full">
              <Link to="/skills/$slug/tree" params={{ slug: skill.slug }}>
                Skill tree
              </Link>
            </Button>
          </aside>

          <WorldMap skill={skill} completed={completed} isPro={Boolean(data?.profile.isPro)} />
        </div>
      </div>
    </main>
  );
}
