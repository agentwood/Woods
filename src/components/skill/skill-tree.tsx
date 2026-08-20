import { Link } from "@tanstack/react-router";
import { Check, Lock } from "lucide-react";
import type { Skill } from "@/lib/content/types";
import { isLevelUnlocked } from "@/lib/content";
import { cn } from "@/lib/utils";

export function SkillTree({
  skill,
  completed,
  isPro,
}: {
  skill: Skill;
  completed: Set<string>;
  isPro: boolean;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-0 py-4">
      {skill.tree.map((node, i) => {
        const levels = skill.levels.filter((l) => node.levelIds.includes(l.id));
        const unlocked = levels.some((l) => isLevelUnlocked(skill, l.index, completed));
        const done = levels.every((l) => l.lessonIds.every((id) => completed.has(id)));
        const needsPro = levels.every((l) => l.index > 1) && !isPro;
        const nextLesson = levels
          .flatMap((l) => l.lessonIds)
          .find((id) => !completed.has(id));
        return (
          <div key={node.id} className="flex w-full flex-col items-center">
            {i > 0 && <div className="h-8 w-px bg-border" />}
            <div
              className={cn(
                "w-full rounded-xl border border-border bg-surface px-5 py-4 text-center",
                !unlocked && "opacity-50",
              )}
            >
              <div className="mb-2 flex justify-center">
                {done ? (
                  <Check className="size-5 text-gold" />
                ) : !unlocked || needsPro ? (
                  <Lock className="size-4 text-muted" />
                ) : (
                  <span className="size-2 rounded-full bg-gold" />
                )}
              </div>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
                {node.label}
              </p>
              <p className="mt-1 text-sm text-fg/85">{node.description}</p>
              {unlocked && !needsPro && nextLesson && (
                <Link
                  to="/learn/$lessonId"
                  params={{ lessonId: nextLesson }}
                  className="mt-3 inline-block text-sm font-medium"
                >
                  Enter →
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
