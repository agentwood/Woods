import { createFileRoute, Link } from "@tanstack/react-router";
import { LessonPlayer } from "@/components/lesson/player";
import { RequireAuth } from "@/components/layout/require-auth";
import { Button } from "@/components/ui/button";
import { getLesson } from "@/lib/content";
import { useProgress } from "@/lib/progress-context";

export const Route = createFileRoute("/_app/learn/$lessonId")({ component: LearnPage });

function LearnPage() {
  return (
    <RequireAuth>
      <LearnInner />
    </RequireAuth>
  );
}

function LearnInner() {
  const { lessonId } = Route.useParams();
  const lesson = getLesson(lessonId);
  const { data } = useProgress();
  if (!lesson) {
    return (
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-pixel text-3xl">That lesson does not exist.</h1>
        <Button asChild className="mt-6">
          <Link to="/explore">Explore Skills</Link>
        </Button>
      </main>
    );
  }
  const row = data?.lessons.find((l) => l.lesson_id === lesson.id);
  const resumeAt = row && !row.completed ? row.current_block : 0;
  return <LessonPlayer lesson={lesson} resumeAt={resumeAt} />;
}
