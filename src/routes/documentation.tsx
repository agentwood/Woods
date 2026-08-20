import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Check, CircleHelp, CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import { WoodsMark } from "@/components/layout/mark";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/documentation")({ component: Documentation });

const chapters = [
  { id: "start", label: "Start here" },
  { id: "how-it-works", label: "How Woods works" },
  { id: "worlds", label: "Worlds and skills" },
  { id: "club", label: "Woods Club" },
  { id: "account", label: "Your account" },
  { id: "faq", label: "FAQ" },
];

function Documentation() {
  return (
    <main className="min-h-dvh bg-bg text-fg">
      <header className="border-b-2 border-border bg-ink">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <Link to="/">
            <WoodsMark />
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link to="/explore">Enter the Woods</Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[220px_1fr] lg:py-16">
        <aside className="h-fit lg:sticky lg:top-24">
          <p className="font-pixel text-xs tracking-[0.25em] text-blue">FIELD GUIDE</p>
          <nav className="mt-5 grid gap-1">
            {chapters.map((chapter) => (
              <a
                key={chapter.id}
                href={`#${chapter.id}`}
                className="border-l-2 border-transparent px-3 py-2 text-sm text-muted transition-colors hover:border-gold hover:text-fg"
              >
                {chapter.label}
              </a>
            ))}
          </nav>
          <div className="pixel-card mt-8 hidden p-4 lg:block">
            <Sparkles className="size-4 text-gold" />
            <p className="mt-3 font-pixel text-sm">Learn by doing.</p>
            <p className="mt-2 text-xs text-muted">Short missions. Real decisions. Useful skills.</p>
          </div>
        </aside>

        <article className="max-w-3xl">
          <p className="font-pixel text-sm tracking-[0.25em] text-purple">JOINWOODS.CO</p>
          <h1 className="mt-3 font-pixel text-5xl leading-none tracking-tight sm:text-7xl">Documentation</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            Woods is a pixel-powered skill arcade. This guide explains what Woods is, how to play, and how to get the
            most from every world.
          </p>

          <Section id="start" icon={<BookOpen className="size-5 text-blue" />} title="Start here">
            <p>
              Woods helps you build practical confidence through interactive challenges. You choose a world, make
              decisions, receive feedback, and gradually unlock harder missions.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Step number="01" title="Choose" body="Pick a world that matches the skill you want to practise." />
              <Step number="02" title="Play" body="Complete short lessons, questions, and realistic scenarios." />
              <Step number="03" title="Master" body="Build XP, protect your streak, and take on the boss." />
            </div>
            <Callout>There is no perfect starting point. Start with the world that makes you curious.</Callout>
          </Section>

          <Section id="how-it-works" icon={<ArrowRight className="size-5 text-gold" />} title="How Woods works">
            <h3>Lessons</h3>
            <p>
              A lesson breaks one professional idea into small playable blocks. You may read a briefing, inspect a
              situation, choose an answer, or write the next move.
            </p>
            <h3>Questions</h3>
            <p>
              Questions test judgement, not memorisation. When you miss one, Woods explains the decision and gives you
              a chance to try again.
            </p>
            <h3>XP and streaks</h3>
            <p>
              XP records your progress. A streak is a reason to return, not a punishment. Missing a day does not erase
              the skills you have already built.
            </p>
            <h3>Boss missions</h3>
            <p>
              Bosses combine the skills from a world into one practical situation. They are designed to feel like the
              work itself: incomplete information, competing priorities, and a result that depends on your choices.
            </p>
          </Section>

          <Section id="worlds" icon={<Sparkles className="size-5 text-purple" />} title="Worlds and skills">
            <p>
              Each world is a focused path through a professional skill. Worlds can cover data, delivery, tools,
              communication, and modern technical work.
            </p>
            <ul className="mt-5 grid gap-3">
              {[
                "Start with the first level. It is the fastest way to see whether a world fits you.",
                "Use the skill map to see what comes next and which levels are locked.",
                "Replay a lesson when you want to strengthen a weak concept.",
                "Use the daily challenge to keep your momentum between longer sessions.",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm text-muted">
                  <Check className="mt-0.5 size-4 shrink-0 text-xp" />
                  {item}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-7">
              <Link to="/explore">Browse the worlds</Link>
            </Button>
          </Section>

          <Section id="club" icon={<CreditCard className="size-5 text-gold" />} title="Woods Club">
            <p>
              Woods Club unlocks the full game for one account. Club members get access to complete skill worlds,
              advanced missions, boss simulations, and deeper mastery tracking.
            </p>
            <div className="pixel-card mt-6 grid gap-5 p-5 sm:grid-cols-2">
              <div>
                <p className="font-pixel text-sm text-muted">MONTHLY</p>
                <p className="mt-2 font-pixel text-3xl text-gold">$29.99</p>
                <p className="text-sm text-muted">per month</p>
              </div>
              <div>
                <p className="font-pixel text-sm text-muted">YEARLY</p>
                <p className="mt-2 font-pixel text-3xl text-gold">$239.88</p>
                <p className="text-sm text-muted">billed yearly · $19.99/mo</p>
              </div>
            </div>
            <p className="mt-5">
              Payments are handled securely by Stripe. You can manage or cancel your subscription from the Woods
              pricing page.
            </p>
            <Button asChild variant="outline" className="mt-7">
              <Link to="/pricing" search={{}}>View Club pricing</Link>
            </Button>
          </Section>

          <Section id="account" icon={<ShieldCheck className="size-5 text-blue" />} title="Your account">
            <h3>Create an account</h3>
            <p>
              Select <strong>Sign up</strong>, enter your name, email, and a password of at least eight characters.
              You can then continue to your home screen.
            </p>
            <h3>Sign in with Google</h3>
            <p>
              Choose <strong>Continue with Google</strong> on the login page. Woods does not see or store your Google
              password.
            </p>
            <h3>Reset your password</h3>
            <p>
              Select <strong>Forgot password?</strong> on the login page. We will send a reset link. During local
              testing, the link is also printed in the server terminal.
            </p>
            <h3>Privacy and safety</h3>
            <p>
              Woods stores the progress needed to run the game, such as XP, lessons, and achievements. Never enter
              private client, employer, or customer information into a challenge.
            </p>
          </Section>

          <Section id="faq" icon={<CircleHelp className="size-5 text-purple" />} title="Frequently asked questions">
            <h3>Is Woods a course or an LMS?</h3>
            <p>No. Woods is a game-like practice environment. It focuses on decisions and repetition rather than certificates.</p>
            <h3>Can I try Woods before paying?</h3>
            <p>Yes. The free experience lets you try the opening level of each available world.</p>
            <h3>Do I need technical experience?</h3>
            <p>No. Start with a beginner-friendly world. Every lesson introduces the context needed for the challenge.</p>
            <h3>Can I use Woods on my phone?</h3>
            <p>Yes. Woods is designed to work in a modern mobile or desktop browser.</p>
            <h3>Where can I get help?</h3>
            <p>
              Start by checking this guide and the relevant world instructions. If something is not working, contact
              the Woods team with the page, device, and a short description of the problem.
            </p>
          </Section>

          <footer className="mt-16 border-t-2 border-border pt-8 text-sm text-muted">
            <p>Woods is built for practical progress. One decision at a time.</p>
            <Link to="/" className="mt-3 inline-flex text-blue hover:text-fg">
              Back to Woods
            </Link>
          </footer>
        </article>
      </div>
    </main>
  );
}

function Section({
  id,
  icon,
  title,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-border py-12 first:pt-14">
      <div className="flex items-center gap-3">
        {icon}
        <h2 className="font-pixel text-3xl tracking-tight sm:text-4xl">{title}</h2>
      </div>
      <div className="docs-copy mt-6 space-y-4 text-muted">{children}</div>
    </section>
  );
}

function Step({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div className="pixel-card p-4">
      <p className="font-pixel text-xs text-gold">{number}</p>
      <p className="mt-3 font-pixel">{title}</p>
      <p className="mt-2 text-xs leading-5 text-muted">{body}</p>
    </div>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return <p className="border-l-4 border-gold bg-raised px-4 py-3 text-sm text-fg">{children}</p>;
}
