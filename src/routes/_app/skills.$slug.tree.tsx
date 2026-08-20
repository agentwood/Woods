import { createFileRoute, Link } from "@tanstack/react-router";
import { getSkill } from "@/lib/content";
import { SkillTree } from "@/components/skill/skill-tree";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/lib/progress-context";

export const Route = createFileRoute("/_app/skills/$slug/tree")({ component: TreePage });

function TreePage() {
  const { slug } = Route.useParams();
  const skill = getSkill(slug);
  const { data } = useProgress();
  if (!skill) return null;
  const completed = new Set(data?.lessons.filter((l) => l.completed).map((l) => l.lesson_id) ?? []);
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">{skill.name}</p>
      <h1 className="mt-2 font-pixel text-4xl tracking-tight">Skill tree</h1>
      <p className="mt-2 text-muted">Nodes unlock as you walk the path.</p>
      <SkillTree skill={skill} completed={completed} isPro={Boolean(data?.profile.isPro)} />
      <div className="mt-8 text-center">
        <Button asChild variant="ghost">
          <Link to="/skills/$slug" params={{ slug }}>
            Back to the world
          </Link>
        </Button>
      </div>
    </main>
  );
}
