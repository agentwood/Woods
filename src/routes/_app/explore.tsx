import { createFileRoute } from "@tanstack/react-router";
import { CATEGORY_ORDER, getCatalog, getSkill, skillMasteryPct } from "@/lib/content";
import { SkillCard } from "@/components/skill/skill-card";
import { useProgress } from "@/lib/progress-context";

export const Route = createFileRoute("/_app/explore")({ component: Explore });

function Explore() {
  const catalog = getCatalog();
  const { data } = useProgress();
  const completed = new Set(data?.lessons.filter((l) => l.completed).map((l) => l.lesson_id) ?? []);
  const started = new Set(data?.skills.map((s) => s.skill_id) ?? []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="font-pixel text-sm tracking-widest text-muted">COURSE CATALOG</p>
      <h1 className="mt-2 font-pixel text-4xl tracking-tight sm:text-5xl">
        What do you want to learn?
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        Twelve tech worlds. Try any of them in three minutes — then start Level 01.
      </p>
      {CATEGORY_ORDER.map((cat) => {
        const skills = catalog.filter((s) => s.category === cat);
        if (!skills.length) return null;
        return (
          <section key={cat} className="mt-12">
            <h2 className="font-pixel text-2xl tracking-tight">{cat}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((skill) => {
                const live = getSkill(skill.id);
                const mastery = live ? skillMasteryPct(live, completed) : 0;
                return (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    tryFirst={!started.has(skill.id)}
                    started={started.has(skill.id)}
                    mastery={started.has(skill.id) ? mastery : undefined}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </main>
  );
}
