import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireAuth } from "@/components/layout/require-auth";
import { SkillCard } from "@/components/skill/skill-card";
import { Button } from "@/components/ui/button";
import { getCatalog, getSkill, skillMasteryPct } from "@/lib/content";
import { useProgress } from "@/lib/progress-context";

export const Route = createFileRoute("/_app/skills/")({ component: MySkills });

function MySkills() {
  return (
    <RequireAuth>
      <MySkillsInner />
    </RequireAuth>
  );
}

function MySkillsInner() {
  const { data, loading } = useProgress();
  const catalog = getCatalog().filter((s) => s.live);
  if (loading || !data) return <div className="px-4 py-16 text-sm text-muted">Loading…</div>;
  const started = new Set(data.skills.map((s) => s.skill_id));
  const completed = new Set(data.lessons.filter((l) => l.completed).map((l) => l.lesson_id));
  const mine = catalog.filter((s) => started.has(s.id));

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="font-pixel text-sm tracking-[0.22em] text-muted">BUILD</p>
      <h1 className="mt-2 font-pixel text-4xl tracking-tight">My courses</h1>
      <p className="mt-2 text-muted">Lands you have entered.</p>
      {mine.length === 0 ? (
        <div className="mt-10 rounded-xl border border-border bg-surface p-8">
          <p className="font-pixel text-2xl">No courses yet.</p>
          <p className="mt-2 text-sm text-muted">Pick a land. The first chapter is free.</p>
          <Button asChild className="mt-6">
            <Link to="/explore">Explore courses</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {mine.map((skill) => {
            const live = getSkill(skill.id);
            const mastery = live ? skillMasteryPct(live, completed) : 0;
            return <SkillCard key={skill.id} skill={skill} started mastery={mastery} />;
          })}
        </div>
      )}
    </main>
  );
}
