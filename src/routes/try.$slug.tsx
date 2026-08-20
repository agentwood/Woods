import { createFileRoute, Link } from "@tanstack/react-router";
import { LessonPlayer } from "@/components/lesson/player";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { getSkill, getTrialLesson } from "@/lib/content";
import { skillBanner } from "@/lib/banners";

export const Route = createFileRoute("/try/$slug")({ component: TryWorld });

function TryWorld() {
  const { slug } = Route.useParams();
  const skill = getSkill(slug);
  const lesson = skill ? getTrialLesson(skill) : undefined;

  if (!skill || !lesson) {
    return (
      <div className="min-h-dvh bg-bg text-fg">
        <SiteHeader />
        <main className="mx-auto max-w-md px-4 py-20 text-center">
          <h1 className="font-pixel text-3xl">That trial is not live yet.</h1>
          <Button asChild className="mt-6">
            <Link to="/explore">See the worlds</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <SiteHeader compact />
      <div className="relative isolate overflow-hidden border-b border-border">
        <img src={skillBanner(skill)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,8,12,0.4)_0%,#07080c_100%)]" />
        <div className="relative mx-auto max-w-2xl px-4 py-8 text-center">
          <p className="font-pixel text-sm tracking-widest text-gold">{skill.fantasy}</p>
          <h1 className="mt-2 font-pixel text-3xl tracking-tight sm:text-4xl">Try before you learn</h1>
          <p className="mt-2 text-sm text-muted">
            {skill.name} · {lesson.minutes} minutes · no sign-up
          </p>
        </div>
      </div>
      <LessonPlayer lesson={lesson} trial />
    </div>
  );
}
