import { createFileRoute, Link } from "@tanstack/react-router";
import { Swords } from "lucide-react";
import { RequireAuth } from "@/components/layout/require-auth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { liveSkills } from "@/lib/content";
import { useProgress } from "@/lib/progress-context";

export const Route = createFileRoute("/_app/challenges")({ component: ChallengesPage });

function ChallengesPage() {
  return (
    <RequireAuth>
      <ChallengesInner />
    </RequireAuth>
  );
}

function ChallengesInner() {
  const { data, loading } = useProgress();
  if (loading || !data) return <div className="px-4 py-16 text-sm text-muted">Loading…</div>;
  const completed = new Set(data.lessons.filter((l) => l.completed).map((l) => l.lesson_id));
  const bosses = liveSkills.flatMap((skill) =>
    skill.lessons
      .filter((l) => l.kind === "boss")
      .map((lesson) => ({ skill, lesson, done: completed.has(lesson.id) })),
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="font-pixel text-sm tracking-[0.22em] text-muted">PRACTICE</p>
      <h1 className="mt-2 font-pixel text-4xl tracking-tight">Challenges</h1>
      <p className="mt-2 text-muted">Short enough to finish before the kettle boils.</p>

      <section className="mt-8 rounded-xl border border-border bg-surface p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Today's missions</p>
        <ul className="mt-4 space-y-4">
          {data.missions.map((m) => (
            <li key={m.mission_id}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-pixel">{m.label}</p>
                <p className="text-sm text-gold">+{m.xp} XP</p>
              </div>
              <Progress value={(m.progress / m.target) * 100} className="mt-2" />
              <p className="mt-1 text-xs tabular-nums text-muted">
                {m.completed ? "Done" : `${m.progress}/${m.target}`}
              </p>
            </li>
          ))}
        </ul>
        <Button asChild className="mt-6" variant="blue">
          <Link to="/learn/$lessonId" params={{ lessonId: data.dailyLessonId }}>
            Today's challenge
          </Link>
        </Button>
      </section>

      <h2 className="mt-12 font-pixel text-3xl tracking-tight">Boss fights</h2>
      <div className="mt-4 grid gap-3">
        {bosses.map(({ skill, lesson, done }) => (
          <div
            key={lesson.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-4"
          >
            <div className="flex items-center gap-3">
              <Swords className="size-5 text-gold" />
              <div>
                <p className="font-pixel">{skill.name}</p>
                <p className="text-sm text-muted">{lesson.title}</p>
              </div>
            </div>
            {lesson && (
              <Button asChild size="sm" variant={done ? "ghost" : "blue"}>
                <Link to="/learn/$lessonId" params={{ lessonId: lesson.id }}>
                  {done ? "Replay" : data.profile.isPro ? "Enter" : "Club"}
                </Link>
              </Button>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
