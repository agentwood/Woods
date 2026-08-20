import { cn } from "@/lib/utils";

export function WoodsMark({
  className,
  club,
}: {
  className?: string;
  club?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="relative grid size-7 shrink-0 place-items-center" aria-hidden="true">
        <span className="absolute inset-0 rounded-full bg-gold shadow-[0_2px_0_0_var(--color-gold-shadow)]" />
        <span className="relative font-pixel text-sm leading-none text-gold-fg">W</span>
      </span>
      <span className="font-pixel text-xl leading-none tracking-tight text-fg">
        Woods
      </span>
      {club ? (
        <span className="font-pixel text-[10px] leading-none text-gold">Club</span>
      ) : null}
    </span>
  );
}
