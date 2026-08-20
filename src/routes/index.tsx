import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Compass, Star } from "lucide-react";
import { SignedIn, SignedOut } from "@/lib/auth/gates";
import { getCatalog } from "@/lib/content";
import { SiteHeader } from "@/components/layout/site-header";
import { WoodsMark } from "@/components/layout/mark";
import { Button } from "@/components/ui/button";
import { SkillCard } from "@/components/skill/skill-card";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const live = getCatalog().filter((s) => s.live);
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <SiteHeader />

      <section className="relative isolate overflow-hidden border-b-2 border-border">
        <div className="pixel-grid absolute inset-0 opacity-40" />
        <div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <img
            src="/images/hero.jpg"
            alt=""
            className="order-2 h-[300px] w-full border-2 border-border object-cover object-top shadow-pixel sm:h-[420px] lg:order-1"
          />
          <div className="order-1 max-w-xl lg:order-2">
            <p className="jw-rise font-pixel text-sm tracking-[0.3em] text-blue">PRACTICAL SKILLS. MADE PLAYABLE.</p>
            <h1 className="hero-title jw-rise-2 mt-5 text-6xl sm:text-8xl">
              Learn skills
              <span className="block text-purple">that pay off.</span>
            </h1>
            <p className="jw-rise-3 mt-7 max-w-lg text-base leading-8 text-fg/80 sm:text-lg">
              Woods turns career skills into short, interactive missions. Practise real decisions, get instant feedback,
              and build confidence in less time.
            </p>
            <div className="jw-rise-4 mt-8 flex flex-wrap items-center gap-4">
              <SignedOut>
                <Button asChild size="lg" className="shadow-gold">
                  <Link to="/login">Get started</Link>
                </Button>
              </SignedOut>
              <SignedIn>
                <Button asChild size="lg">
                  <Link to="/home">Continue playing</Link>
                </Button>
              </SignedIn>
              <Link to="/explore" className="inline-flex items-center gap-2 font-pixel text-sm text-blue hover:text-fg">
                Browse worlds <ArrowRight className="size-4" />
              </Link>
            </div>
            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              Learn up to 4× faster · Join 30,000+ learners building useful skills
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-pixel text-sm tracking-widest text-blue">START WITH A SKILL</p>
            <h2 className="mt-3 font-pixel text-3xl sm:text-4xl">Learn by doing</h2>
          </div>
          <Compass className="hidden size-10 text-purple sm:block" />
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {live.map((skill) => (
            <SkillCard key={skill.id} skill={skill} tryFirst />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link to="/explore">See all worlds</Link>
          </Button>
        </div>
      </section>

      <section className="pixel-grid mx-auto max-w-7xl border-y-2 border-border px-4 py-20 sm:px-6">
        <h2 className="font-pixel text-3xl sm:text-4xl">A better way to learn</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Pick a skill", body: "Choose Power BI, Docker, TypeScript, AI agents, and more." },
            { title: "Practise in minutes", body: "Short missions turn confusing ideas into clear next steps." },
            { title: "Get instant feedback", body: "See why an answer works, then use the lesson immediately." },
            { title: "Build real confidence", body: "Stack XP, complete projects, and handle the boss scenario." },
          ].map((item) => (
            <div key={item.title} className="pixel-card p-5">
              <Star className="size-4 fill-gold text-gold" />
              <h3 className="mt-3 font-pixel text-lg">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-pixel text-3xl sm:text-4xl">Stop watching. Start practising.</h2>
            <p className="mt-4 max-w-md text-muted">
              Woods gives you a clear path from “I have seen this” to “I can do this.” Start free and see your first
              challenge in three minutes.
            </p>
            <Button asChild className="mt-6">
              <Link to="/pricing" search={{}}>
                Join Club
              </Link>
            </Button>
          </div>
          <div className="rounded-xl border border-border bg-surface p-6">
            <div className="flex items-center gap-3">
              <img src="/images/avatar.jpg" alt="" className="size-12 rounded-full object-cover object-top" />
              <div>
                <p className="font-pixel text-lg">You</p>
                <p className="text-sm text-blue">Level 12</p>
              </div>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted">Total XP</dt>
                <dd className="mt-1 font-pixel text-gold">3,510</dd>
              </div>
              <div>
                <dt className="text-muted">Rank</dt>
                <dd className="mt-1 font-pixel text-gold">Gold</dd>
              </div>
              <div>
                <dt className="text-muted">Badges</dt>
                <dd className="mt-1 font-pixel">30</dd>
              </div>
              <div>
                <dt className="text-muted">Day streak</dt>
                <dd className="mt-1 font-pixel text-gold">4</dd>
              </div>
            </dl>
            <Button asChild variant="outline" className="mt-6 w-full">
              <Link to="/login">View profile</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-ink">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-sm text-muted">
          <WoodsMark />
          <p>Start your skill adventure ⋆˙⟡</p>
        </div>
      </footer>
    </div>
  );
}
