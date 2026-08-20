import { createFileRoute, Link } from "@tanstack/react-router";
import { LessonPlayer } from "@/components/lesson/player";
import { RequireAuth } from "@/components/layout/require-auth";
import { Button } from "@/components/ui/button";
import { conceptName, liveSkills, questionsForConcept } from "@/lib/content";
import type { Lesson } from "@/lib/content/types";
import { isQuestion } from "@/lib/content/types";
import { masteryBand } from "@/lib/progress";
import { useProgress } from "@/lib/progress-context";

export const Route = createFileRoute("/_app/practice/$conceptId")({ component: PracticePage });

function PracticePage() {
  return (
    <RequireAuth>
      <PracticeInner />
    </RequireAuth>
  );
}

function PracticeInner() {
  const { conceptId } = Route.useParams();
  const { data } = useProgress();
  const all = questionsForConcept(conceptId).filter(isQuestion);
  const row = data?.concepts.find((c) => c.concept_id === conceptId);
  const band = masteryBand(row?.mastery ?? 0);
  const wanted =
    band === "foundational"
      ? "easy"
      : band === "intermediate"
        ? "medium"
        : band === "advanced"
          ? "hard"
          : "hard";
  const filtered = all.filter((b) => b.difficulty === wanted);
  const picks = (filtered.length ? filtered : all).slice(0, 6);
  if (!picks.length) {
    return (
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-pixel text-3xl">Nothing to drill here.</h1>
        <Button asChild className="mt-6">
          <Link to="/home">Home</Link>
        </Button>
      </main>
    );
  }
  const host = liveSkills.find((s) => s.concepts.some((c) => c.id === conceptId));
  const lesson: Lesson = {
    id: `practice-${conceptId}`,
    skillId: host?.id ?? "power-bi",
    levelId: "practice",
    title: conceptName(conceptId),
    summary: "A focused drill on a weak concept.",
    minutes: 5,
    kind: "lesson",
    conceptIds: [conceptId],
    blocks: picks,
  };
  return <LessonPlayer lesson={lesson} practice />;
}
