import { Link } from "@tanstack/react-router";
import { skillBanner } from "@/lib/banners";
import type { CatalogSkill } from "@/lib/content/types";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function SkillCard({
  skill,
  mastery,
  started,
  tryFirst,
}: {
  skill: CatalogSkill;
  mastery?: number;
  started?: boolean;
  tryFirst?: boolean;
}) {
  const worldTo = "/skills/$slug" as const;
  const tryTo = "/try/$slug" as const;
  const primaryTo = tryFirst ? tryTo : worldTo;

  const inner = (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors",
        skill.live && "hover:border-muted",
        !skill.live && "opacity-70",
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-raised">
        <img src={skillBanner(skill)} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">
          {skill.live ? skill.fantasy : "Coming soon"}
        </p>
        <h3 className="mt-1 font-pixel text-xl tracking-tight">{skill.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{skill.tagline}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="rounded-full bg-raised px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
            {skill.live ? skill.difficulty : "Soon"}
          </span>
          <span className="text-xs tabular-nums text-faint">{skill.hours}h</span>
        </div>
        {started && mastery != null && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-muted">
              <span>Progress</span>
              <span className="tabular-nums">{Math.round(mastery)}%</span>
            </div>
            <Progress value={mastery} />
          </div>
        )}
        {skill.live && (
          <p className="mt-3 text-xs text-gold">
            Try · {skill.trialMinutes} min — {skill.trialTitle}
          </p>
        )}
      </div>
    </article>
  );

  if (!skill.live) return inner;
  return (
    <Link to={primaryTo} params={{ slug: skill.slug }} className="block h-full">
      {inner}
    </Link>
  );
}
