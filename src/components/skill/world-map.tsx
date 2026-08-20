import { Link } from "@tanstack/react-router";
import type { Skill } from "@/lib/content/types";
import { isLevelUnlocked } from "@/lib/content";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export function WorldMap({
  skill,
  completed,
  isPro,
}: {
  skill: Skill;
  completed: Set<string>;
  isPro: boolean;
}) {
  return (
    <div className="space-y-8">
      {skill.levels.map((level) => {
        const unlocked = isLevelUnlocked(skill, level.index, completed);
        const done = level.lessonIds.every((id) => completed.has(id));
        const free = level.index === 1;
        const needsPro = !free && !isPro;
        const available = unlocked && !needsPro;
        const doneCount = level.lessonIds.filter((id) => completed.has(id)).length;
        const pct = level.lessonIds.length ? (doneCount / level.lessonIds.length) * 100 : 0;
        const hasBoss = level.isBoss || level.lessonIds.some((id) => {
          const lesson = skill.lessons.find((l) => l.id === id);
          return lesson?.kind === "boss";
        });
        return (
          <section key={level.id}>
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                  {hasBoss ? "Boss" : `Level ${String(level.index).padStart(2, "0")}`}
                  {needsPro ? " · Club" : ""}
                  {done ? " · Complete" : ""}
                </p>
                <h3 className="mt-1 font-pixel text-2xl tracking-tight">{level.title}</h3>
                <p className="mt-1 text-sm text-muted">{level.subtitle}</p>
              </div>
              <div className="hidden w-28 sm:block">
                <Progress value={pct} />
              </div>
            </div>
            <ol className="space-y-2">
              {level.lessonIds.map((id, i) => {
                const lesson = skill.lessons.find((l) => l.id === id);
                if (!lesson) return null;
                const lDone = completed.has(id);
                const locked = !available;
                const kindLabel =
                  lesson.kind === "boss"
                    ? "Boss"
                    : lesson.kind === "project"
                      ? "Mini-project"
                      : "Mission";
                return (
                  <li
                    key={id}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3",
                      locked && "opacity-60",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm">
                        <span className="mr-2 tabular-nums text-muted">{i + 1}.</span>
                        {lesson.title}
                      </p>
                      <p className="mt-0.5 text-xs uppercase tracking-wide text-muted">
                        {kindLabel} · {lesson.minutes} min
                      </p>
                    </div>
                    {locked ? (
                      <Button size="sm" variant="outline" disabled>
                        ???
                      </Button>
                    ) : lDone ? (
                      <Button asChild size="sm" variant="outline">
                        <Link to="/learn/$lessonId" params={{ lessonId: id }}>
                          Replay
                        </Link>
                      </Button>
                    ) : needsPro ? (
                      <Button asChild size="sm">
                        <Link to="/pricing" search={{}}>
                          Club
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild size="sm" variant="blue">
                        <Link to="/learn/$lessonId" params={{ lessonId: id }}>
                          Start
                        </Link>
                      </Button>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
