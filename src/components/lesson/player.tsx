import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Check, Lock, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import type { AnswerPayload, Block, Lesson, MatchBlock, OrderBlock } from "@/lib/content/types";
import { isQuestion } from "@/lib/content/types";
import { checkAnswer, countQuestions, firstWorldLesson, getSkill } from "@/lib/content";
import { SignedIn, SignedOut } from "@/lib/auth/gates";
import { ACHIEVEMENTS } from "@/lib/progress";
import { useProgress } from "@/lib/progress-context";
import {
  completeLesson,
  explainAnswer,
  saveLessonCursor,
  submitAnswer,
} from "@/lib/server/jw";
import { cn } from "@/lib/utils";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

type GradeResult = Awaited<ReturnType<typeof submitAnswer>>;

function localGrade(block: Block, answer: AnswerPayload): GradeResult {
  const result = checkAnswer(block, answer);
  return {
    ok: true,
    correct: result.correct,
    explanation: result.explanation,
    xpAwarded: result.xp,
    alreadyAnswered: false,
    mastery: 0,
    failStreak: 0,
    remedialLessonId: null,
    conceptId: isQuestion(block) ? block.conceptId : "",
    conceptName: "",
    stepResults: result.stepResults,
    levelUp: null,
    newAchievements: [],
  };
}

export function LessonPlayer({
  lesson,
  resumeAt = 0,
  practice = false,
  trial = false,
}: {
  lesson: Lesson;
  resumeAt?: number;
  practice?: boolean;
  trial?: boolean;
}) {
  const nav = useNavigate();
  const { data, reload } = useProgress();
  const [index, setIndex] = useState(Math.min(resumeAt, lesson.blocks.length - 1));
  const [done, setDone] = useState(false);
  const [xpFlash, setXpFlash] = useState<number | null>(null);
  const [summary, setSummary] = useState<{
    perfect: boolean;
    bonus: number;
    streak: number;
    nextLessonId: string | null;
    nextLessonTitle: string | null;
  } | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const [paywall, setPaywall] = useState(false);
  const [locked, setLocked] = useState(false);
  const [remedial, setRemedial] = useState<{ name: string; lessonId: string } | null>(null);
  const [trialHits, setTrialHits] = useState(0);
  const [trialSeen, setTrialSeen] = useState(0);
  const trialHitsRef = useRef(0);
  const trialSeenRef = useRef(0);

  const block = lesson.blocks[index]!;
  const total = lesson.blocks.length;
  const pct = ((index + (done ? 1 : 0)) / total) * 100;

  useEffect(() => {
    if (practice || trial) return;
    void saveLessonCursor({ data: { lessonId: lesson.id, currentBlock: index } });
  }, [index, lesson.id, practice, trial]);

  async function onQuestionResult(res: GradeResult) {
    if (trial) {
      if (res.ok) {
        trialSeenRef.current += 1;
        if (res.correct) trialHitsRef.current += 1;
        setTrialSeen(trialSeenRef.current);
        setTrialHits(trialHitsRef.current);
      }
      return res;
    }
    if (!res.ok) {
      if (res.reason === "pro") setPaywall(true);
      else setLocked(true);
      return;
    }
    if (res.xpAwarded) {
      setXpFlash(res.xpAwarded);
      window.setTimeout(() => setXpFlash(null), 900);
    }
    if (res.levelUp) setLevelUp(res.levelUp);
    for (const id of res.newAchievements) {
      const a = ACHIEVEMENTS.find((x) => x.id === id);
      if (a) toast(a.name, { description: a.description });
    }
    if (res.remedialLessonId && res.failStreak >= 2) {
      setRemedial({ name: res.conceptName, lessonId: res.remedialLessonId });
    }
    await reload();
    return res;
  }

  async function finish() {
    if (practice || trial) {
      const hits = trialHitsRef.current;
      const seen = Math.max(trialSeenRef.current, countQuestions(lesson));
      setDone(true);
      setSummary({
        perfect: trial ? seen > 0 && hits === seen : false,
        bonus: 0,
        streak: data?.profile.streakDays ?? 0,
        nextLessonId: null,
        nextLessonTitle: null,
      });
      setTrialHits(hits);
      setTrialSeen(seen);
      if (!trial) await reload();
      return;
    }
    const res = await completeLesson({ data: { lessonId: lesson.id } });
    setSummary(res);
    setDone(true);
    for (const id of res.newAchievements) {
      const a = ACHIEVEMENTS.find((x) => x.id === id);
      if (a) toast(a.name, { description: a.description });
    }
    await reload();
  }

  if (paywall) {
    return (
      <Gate
        title="Unlock the rest of this world"
        body="Level 01 is free. Pro opens every level, boss, and optional explanation."
        cta="Go Pro"
        to="/pricing"
      />
    );
  }
  if (locked) {
    return (
      <Gate
        title="Still locked"
        body="Finish the previous level first."
        cta="Back to the world"
        href={`/skills/${lesson.skillId}`}
      />
    );
  }

  if (done && summary) {
    return (
      <CompleteScreen
        lesson={lesson}
        summary={summary}
        practice={practice}
        trial={trial}
        trialScore={trial ? { correct: trialHits, total: Math.max(trialSeen, countQuestions(lesson)) } : undefined}
        onHome={() => void nav({ to: "/home" })}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-widest text-muted">
            {trial ? "Trial" : practice ? "Practice" : lesson.kind === "boss" ? "Boss" : lesson.kind === "project" ? "Mini-project" : "Mission"} · {index + 1}/{total}
          </p>
          <p className="text-xs tabular-nums text-muted">{lesson.minutes} min</p>
        </div>
        <h1 className="font-pixel text-3xl tracking-tight">
            {String(index + 1).padStart(2, "0")}. {lesson.title}
          </h1>
        <Progress value={pct} className="mt-4" />
      </div>

      {remedial && (
        <div className="mb-4 rounded-[18px] bg-raised px-4 py-3 text-sm shadow-[var(--shadow-border)]">
          <p className="font-medium">You keep missing {remedial.name}.</p>
          <p className="text-muted">Let's fix it.</p>
          <Link to="/learn/$lessonId" params={{ lessonId: remedial.lessonId }} className="mt-2 inline-block text-gold">
            Revisit the lesson →
          </Link>
        </div>
      )}

      <div className="relative rounded-xl border border-border bg-surface p-5 sm:p-7">
        {xpFlash != null && (
          <div className="jw-xp-pop pointer-events-none absolute right-5 top-5 font-pixel text-gold">
            +{xpFlash} XP
          </div>
        )}
        <BlockView
          key={block.id}
          block={block}
          trial={trial}
          onContinue={() => {
            if (index + 1 >= total) void finish();
            else setIndex((i) => i + 1);
          }}
          onAnswer={onQuestionResult}
        />
      </div>

      {levelUp != null && (
        <button
          type="button"
          className="fixed inset-0 z-40 grid place-items-center bg-bg/80"
          onClick={() => setLevelUp(null)}
        >
          <div className="jw-rise text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">Level up</p>
            <p className="font-pixel text-6xl tracking-tight">LEVEL {levelUp}</p>
          </div>
        </button>
      )}
    </div>
  );
}

function Gate({
  title,
  body,
  cta,
  to,
  href,
}: {
  title: string;
  body: string;
  cta: string;
  to?: "/pricing" | "/home" | "/explore";
  href?: string;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <Lock className="mx-auto mb-4 size-8 text-muted" />
      <h1 className="font-pixel text-4xl tracking-tight">{title}</h1>
      <p className="mt-3 text-muted">{body}</p>
      <Button asChild className="mt-8">
        {href ? (
          <a href={href}>{cta}</a>
        ) : (
          <Link to={to ?? "/pricing"} search={{}}>
            {cta}
          </Link>
        )}
      </Button>
    </div>
  );
}

function CompleteScreen({
  lesson,
  practice,
  trial,
  trialScore,
  summary,
  onHome,
}: {
  lesson: Lesson;
  practice: boolean;
  trial?: boolean;
  trialScore?: { correct: number; total: number };
  summary: {
    perfect: boolean;
    bonus: number;
    streak: number;
    nextLessonId: string | null;
    nextLessonTitle: string | null;
  };
  onHome: () => void;
}) {
  const skill = getSkill(lesson.skillId);
  const first = skill ? firstWorldLesson(skill) : undefined;
  const pct =
    trialScore && trialScore.total > 0
      ? Math.round((trialScore.correct / trialScore.total) * 100)
      : 0;

  if (trial) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="jw-rise text-xs font-medium uppercase tracking-widest text-gold">Trial complete</p>
        <h1 className="jw-rise-2 mt-3 font-pixel text-5xl tracking-tight">YOU SCORED {pct}%</h1>
        <p className="jw-rise-3 mt-4 text-muted">
          {pct >= 70
            ? "You have the instincts. Now learn the skill."
            : "The instincts are there. Level 01 will make them sharp."}
        </p>
        {skill && (
          <p className="jw-rise-3 mt-2 font-pixel text-sm text-gold">{skill.fantasy}</p>
        )}
        <div className="jw-rise-4 mt-8 flex flex-col gap-3">
          <SignedIn>
            {first ? (
              <Button asChild>
                <Link to="/learn/$lessonId" params={{ lessonId: first.id }}>
                  Start Level 1 →
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link to="/skills/$slug" params={{ slug: lesson.skillId }}>
                  Enter the world
                </Link>
              </Button>
            )}
          </SignedIn>
          <SignedOut>
            <Button asChild>
              <Link to="/login">Start Level 1 →</Link>
            </Button>
          </SignedOut>
          <Button asChild variant="ghost">
            <Link to="/explore">See all worlds</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <p className="jw-rise text-xs font-medium uppercase tracking-widest text-gold">
        {summary.perfect ? "Perfect lesson" : practice ? "Drill complete" : "Lesson complete"}
      </p>
      <h1 className="jw-rise-2 mt-3 font-pixel text-5xl tracking-tight">
        {lesson.kind === "boss" ? "BOSS DOWN." : "LEVEL UP."}
      </h1>
      <p className="jw-rise-3 mt-4 text-muted">{lesson.title}</p>
      {summary.bonus > 0 && (
        <p className="jw-rise-3 mt-2 text-sm text-gold">+{summary.bonus} XP</p>
      )}
      <p className="jw-rise-4 mt-2 text-sm text-muted">Streak {summary.streak}</p>
      <div className="jw-rise-4 mt-8 flex flex-col gap-3">
        {summary.nextLessonId ? (
          <Button asChild>
            <Link to="/learn/$lessonId" params={{ lessonId: summary.nextLessonId }}>
              Next challenge →
            </Link>
          </Button>
        ) : (
          <Button onClick={onHome}>Continue</Button>
        )}
        <Button asChild variant="ghost">
          <Link to="/skills/$slug" params={{ slug: lesson.skillId }}>
            Back to the world
          </Link>
        </Button>
      </div>
    </div>
  );
}

function BlockView({
  block,
  trial,
  onContinue,
  onAnswer,
}: {
  block: Block;
  trial?: boolean;
  onContinue: () => void;
  onAnswer: (res: GradeResult) => Promise<GradeResult | void>;
}) {
  if (block.type === "explain" || block.type === "example") {
    return (
      <div className="jw-rise">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
          {block.type === "example" ? "Example" : "Briefing"}
        </p>
        <h2 className="mt-2 font-pixel text-3xl tracking-tight">{block.title}</h2>
        <p className="mt-4 text-[17px] leading-relaxed text-fg/90">{block.body}</p>
        {block.type === "explain" && block.bullets && (
          <ul className="mt-4 space-y-2 text-sm text-fg/85">
            {block.bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-gold" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
        {block.type === "example" && block.callout && (
          <p className="mt-5 rounded-md bg-raised px-4 py-3 text-sm text-gold">{block.callout}</p>
        )}
        <Button className="mt-8" onClick={onContinue}>
          Continue
        </Button>
      </div>
    );
  }

  if (block.type === "challenge") {
    return <ChallengePlay block={block} trial={trial} onContinue={onContinue} onAnswer={onAnswer} />;
  }

  return <QuestionPlay block={block} trial={trial} onContinue={onContinue} onAnswer={onAnswer} />;
}

function QuestionPlay({
  block,
  trial,
  onContinue,
  onAnswer,
}: {
  block: Exclude<Block, { type: "explain" | "example" | "challenge" }>;
  trial?: boolean;
  onContinue: () => void;
  onAnswer: (res: GradeResult) => Promise<GradeResult | void>;
}) {
  const [payload, setPayload] = useState<AnswerPayload | null>(null);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [explain, setExplain] = useState<string | null>(null);
  const { data } = useProgress();

  async function check() {
    if (!payload || busy) return;
    setBusy(true);
    try {
      const res = trial
        ? localGrade(block, payload)
        : await submitAnswer({ data: { blockId: block.id, answer: payload } });
      const shown = (await onAnswer(res)) ?? res;
      setResult(shown);
    } finally {
      setBusy(false);
    }
  }

  async function askExplain() {
    const userAnswer = JSON.stringify(payload);
    const res = await explainAnswer({ data: { blockId: block.id, userAnswer } });
    if (res.ok) setExplain(res.text);
    else if (res.error === "pro") toast("Explain is a Pro extra.");
    else if (res.error === "limit") toast("Daily explain limit reached.");
    else toast("Explain is unavailable right now.");
  }

  const answered = result && result.ok;

  return (
    <div className="jw-rise">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
        {trial ? "Instinct check" : `${block.difficulty} · +${block.xp} XP`}
      </p>
      {"context" in block && block.context && (
        <p className="mt-3 text-sm leading-relaxed text-muted">{block.context}</p>
      )}
      {"data" in block && block.data && <DataTable rows={block.data} />}
      {"snippet" in block && block.snippet && (
        <pre className="mt-4 overflow-x-auto rounded-[14px] bg-raised p-4 text-sm leading-relaxed text-fg/90">
          {block.snippet}
        </pre>
      )}
      <h2 className="mt-4 font-pixel text-2xl tracking-tight sm:text-3xl">{block.prompt}</h2>

      <div className="mt-6">
        {(block.type === "mcq" || block.type === "identify" || block.type === "scenario") && (
          <ChoiceList
            options={block.options}
            selected={payload?.kind === "index" ? payload.value : null}
            locked={Boolean(answered)}
            correctIndex={answered && result.ok ? block.answer : null}
            onSelect={(i) => setPayload({ kind: "index", value: i })}
          />
        )}
        {block.type === "tf" && (
          <ChoiceList
            options={["True", "False"]}
            selected={payload?.kind === "bool" ? (payload.value ? 0 : 1) : null}
            locked={Boolean(answered)}
            correctIndex={answered && result.ok ? (block.answer ? 0 : 1) : null}
            onSelect={(i) => setPayload({ kind: "bool", value: i === 0 })}
          />
        )}
        {block.type === "fill" && (
          <Input
            value={payload?.kind === "text" ? payload.value : ""}
            onChange={(e) => setPayload({ kind: "text", value: e.target.value })}
            placeholder="Type the missing word"
            disabled={Boolean(answered)}
          />
        )}
        {block.type === "order" && (
          <OrderPlay
            block={block}
            locked={Boolean(answered)}
            onChange={(items) => setPayload({ kind: "order", value: items })}
          />
        )}
        {block.type === "match" && (
          <MatchPlay
            block={block}
            locked={Boolean(answered)}
            onChange={(pairs) => setPayload({ kind: "match", value: pairs })}
          />
        )}
      </div>

      {answered && result.ok && (
        <div
          className={cn(
            "mt-6 rounded-[16px] px-4 py-3 text-sm",
            result.correct ? "bg-accent/10 text-fg" : "bg-danger/10 text-fg",
          )}
        >
          <p className="flex items-center gap-2 font-medium">
            {result.correct ? <Check className="size-4 text-xp" /> : <X className="size-4 text-danger" />}
            {result.correct ? "Correct." : "Not quite."}
            {!trial && result.xpAwarded > 0 && <span className="text-gold">+{result.xpAwarded} XP</span>}
          </p>
          <p className="mt-1 text-muted">{result.explanation}</p>
        </div>
      )}

      {explain && <p className="mt-4 text-sm leading-relaxed text-fg/85">{explain}</p>}

      <div className="mt-8 flex flex-wrap gap-3">
        {!answered ? (
          <Button onClick={() => void check()} disabled={!payload || busy} variant="blue">
            Check
          </Button>
        ) : (
          <Button onClick={onContinue}>Continue</Button>
        )}
        {answered && data?.profile.isPro && !explain && !trial && (
          <Button variant="ghost" onClick={() => void askExplain()}>
            Explain this
          </Button>
        )}
      </div>
    </div>
  );
}

function ChallengePlay({
  block,
  trial,
  onContinue,
  onAnswer,
}: {
  block: Extract<Block, { type: "challenge" }>;
  trial?: boolean;
  onContinue: () => void;
  onAnswer: (res: GradeResult) => Promise<GradeResult | void>;
}) {
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<number[]>(() => block.steps.map(() => -1));
  const [result, setResult] = useState<GradeResult | null>(null);
  const [busy, setBusy] = useState(false);
  const current = block.steps[step]!;
  const last = step === block.steps.length - 1;
  const answered = result && result.ok;

  async function submit() {
    if (picks.some((p) => p < 0) || busy) return;
    setBusy(true);
    try {
      const answer = { kind: "steps" as const, value: picks };
      const res = trial
        ? localGrade(block, answer)
        : await submitAnswer({
            data: { blockId: block.id, answer },
          });
      const shown = (await onAnswer(res)) ?? res;
      setResult(shown);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="jw-rise">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
        Boss · Step {step + 1}/{block.steps.length} · +{block.xp} XP
      </p>
      <h2 className="mt-3 font-pixel text-3xl tracking-tight">{block.prompt}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">{block.context}</p>
      {block.data && <DataTable rows={block.data} />}
      <p className="mt-6 text-[17px] leading-relaxed">{current.question}</p>
      <div className="mt-4">
        <ChoiceList
          options={current.options}
          selected={picks[step] ?? null}
          locked={Boolean(answered)}
          correctIndex={
            answered && result.ok && result.stepResults ? (result.stepResults[step] ? current.answer : current.answer) : null
          }
          showCorrect={Boolean(answered)}
          onSelect={(i) => setPicks((prev) => prev.map((v, idx) => (idx === step ? i : v)))}
        />
      </div>
      {answered && result.ok && (
        <div className="mt-5 rounded-[16px] bg-raised px-4 py-3 text-sm">
          <p className={result.correct ? "text-gold" : "text-danger"}>
            {result.correct ? "MASTERED." : "Not a clean run — read the misses."}
            {result.xpAwarded > 0 && ` +${result.xpAwarded} XP`}
          </p>
          <p className="mt-1 text-muted">{current.explanation}</p>
          {step === block.steps.length - 1 && (
            <p className="mt-2 text-muted">{result.explanation}</p>
          )}
        </div>
      )}
      <div className="mt-8 flex gap-3">
        {step > 0 && !answered && (
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
        )}
        {!answered && !last && (
          <Button disabled={(picks[step] ?? -1) < 0} onClick={() => setStep((s) => s + 1)}>
            Next
          </Button>
        )}
        {!answered && last && (
          <Button disabled={picks.some((p) => p < 0) || busy} onClick={() => void submit()}>
            Submit diagnosis
          </Button>
        )}
        {answered && step < block.steps.length - 1 && (
          <Button onClick={() => setStep((s) => s + 1)}>Next miss</Button>
        )}
        {answered && step === block.steps.length - 1 && (
          <Button onClick={onContinue}>Continue</Button>
        )}
      </div>
    </div>
  );
}

function ChoiceList({
  options,
  selected,
  locked,
  correctIndex,
  showCorrect,
  onSelect,
}: {
  options: string[];
  selected: number | null;
  locked: boolean;
  correctIndex: number | null;
  showCorrect?: boolean;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="grid gap-2">
      {options.map((opt, i) => {
        const isSel = selected === i;
        const isCorrect = (showCorrect || locked) && correctIndex === i;
        const isWrong = locked && isSel && correctIndex != null && correctIndex !== i;
        return (
          <button
            key={opt}
            type="button"
            disabled={locked}
            onClick={() => onSelect(i)}
            className={cn(
              "min-h-12 rounded-md px-4 py-3 text-left text-sm leading-snug shadow-[var(--shadow-border)] transition-[background-color,box-shadow] duration-150",
              isSel && !locked && "bg-raised shadow-[var(--shadow-border-hover)]",
              isCorrect && "bg-xp/15",
              isWrong && "bg-danger/15",
              !isSel && !locked && "hover:bg-raised/70",
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function OrderPlay({
  block,
  locked,
  onChange,
}: {
  block: OrderBlock;
  locked: boolean;
  onChange: (items: string[]) => void;
}) {
  const [items, setItems] = useState(() => shuffle(block.items));
  useEffect(() => {
    onChange(items);
    // Only when the order changes — parent passes a fresh callback each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    const tmp = next[i]!;
    next[i] = next[j]!;
    next[j] = tmp;
    setItems(next);
  }
  return (
    <ol className="grid gap-2">
      {items.map((item, i) => (
        <li
          key={item}
          className="flex min-h-12 items-center justify-between gap-3 rounded-[14px] bg-raised px-3 py-2 text-sm"
        >
          <span>
            <span className="mr-2 tabular-nums text-muted">{i + 1}.</span>
            {item}
          </span>
          {!locked && (
            <span className="flex">
              <button type="button" className="grid size-10 place-items-center" onClick={() => move(i, -1)}>
                <ArrowUp className="size-4" />
              </button>
              <button type="button" className="grid size-10 place-items-center" onClick={() => move(i, 1)}>
                <ArrowDown className="size-4" />
              </button>
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

function MatchPlay({
  block,
  locked,
  onChange,
}: {
  block: MatchBlock;
  locked: boolean;
  onChange: (pairs: { left: string; right: string }[]) => void;
}) {
  const rights = useMemo(() => shuffle(block.pairs.map((p) => p.right)), [block.pairs]);
  const [pickedLeft, setPickedLeft] = useState<string | null>(null);
  const [pairs, setPairs] = useState<{ left: string; right: string }[]>([]);
  useEffect(() => {
    onChange(pairs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairs]);

  function pickRight(right: string) {
    if (!pickedLeft || locked) return;
    setPairs((prev) => {
      const rest = prev.filter((p) => p.left !== pickedLeft && p.right !== right);
      return [...rest, { left: pickedLeft, right }];
    });
    setPickedLeft(null);
  }

  const usedRights = new Set(pairs.map((p) => p.right));

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="grid gap-2">
        {block.pairs.map((p) => {
          const paired = pairs.find((x) => x.left === p.left);
          return (
            <button
              key={p.left}
              type="button"
              disabled={locked}
              onClick={() => setPickedLeft(p.left)}
              className={cn(
                "min-h-12 rounded-[14px] px-3 py-2 text-left text-sm shadow-[var(--shadow-border)]",
                pickedLeft === p.left && "bg-raised",
                paired && "text-gold",
              )}
            >
              {p.left}
              {paired && <span className="mt-1 block text-xs text-muted">{paired.right}</span>}
            </button>
          );
        })}
      </div>
      <div className="grid gap-2">
        {rights.map((r) => (
          <button
            key={r}
            type="button"
            disabled={locked || usedRights.has(r)}
            onClick={() => pickRight(r)}
            className={cn(
              "min-h-12 rounded-[14px] px-3 py-2 text-left text-sm shadow-[var(--shadow-border)]",
              usedRights.has(r) && "opacity-40",
            )}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}

function DataTable({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <dl className="mt-4 overflow-hidden rounded-[16px] bg-raised">
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 border-b border-border px-4 py-2.5 last:border-b-0"
        >
          <dt className="text-xs text-muted">{row.label}</dt>
          <dd className="text-sm tabular-nums">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export { isQuestion };
