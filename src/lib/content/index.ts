import { hashString } from "@/lib/utils";
import { catalogMeta, CATEGORY_ORDER } from "./catalog";
import { powerBiSkill } from "./worlds/power-bi";
import { tableauSkill } from "./worlds/tableau";
import { dockerSkill } from "./worlds/docker";
import { kubernetesSkill } from "./worlds/kubernetes";
import { terraformSkill } from "./worlds/terraform";
import { gitSkill } from "./worlds/git";
import { typescriptSkill } from "./worlds/typescript";
import { gameDevSkill } from "./worlds/game-dev";
import { aiVideoSkill } from "./worlds/ai-video";
import { n8nSkill } from "./worlds/n8n";
import { aiAgentsSkill } from "./worlds/ai-agents";
import { comfyUiSkill } from "./worlds/comfyui";
import {
  type AnswerPayload,
  type Block,
  type CatalogSkill,
  type ChallengeBlock,
  type Lesson,
  type Level,
  type MasteryAxis,
  type Skill,
  XP,
  isQuestion,
} from "./types";

export { CATEGORY_ORDER, XP, isQuestion };
export type { CatalogSkill, Skill, Lesson, Level, Block, AnswerPayload, MasteryAxis };

export const liveSkills: Skill[] = [
  powerBiSkill,
  tableauSkill,
  dockerSkill,
  kubernetesSkill,
  terraformSkill,
  gitSkill,
  typescriptSkill,
  gameDevSkill,
  aiVideoSkill,
  n8nSkill,
  aiAgentsSkill,
  comfyUiSkill,
];

const skillBySlug = new Map(liveSkills.map((s) => [s.slug, s]));
const skillById = new Map(liveSkills.map((s) => [s.id, s]));
const lessonById = new Map<string, Lesson>();
const blockById = new Map<string, { block: Block; lesson: Lesson }>();
const levelById = new Map<string, { level: Level; skill: Skill }>();

for (const skill of liveSkills) {
  for (const level of skill.levels) levelById.set(level.id, { level, skill });
  for (const lesson of skill.lessons) {
    lessonById.set(lesson.id, lesson);
    for (const block of lesson.blocks) blockById.set(block.id, { block, lesson });
  }
}

export function getSkill(slugOrId: string): Skill | undefined {
  return skillBySlug.get(slugOrId) ?? skillById.get(slugOrId);
}

export function getLesson(id: string): Lesson | undefined {
  if (id.startsWith("daily-")) return buildDailyLesson(id.slice(6));
  return lessonById.get(id);
}

export function getBlock(id: string): { block: Block; lesson: Lesson } | undefined {
  if (id.startsWith("daily-") && id.endsWith("-q")) {
    const day = id.slice(6, -2);
    const lesson = buildDailyLesson(day);
    const block = lesson.blocks.find((b) => b.id === id);
    if (block) return { block, lesson };
  }
  return blockById.get(id);
}

export function getLevel(id: string) {
  return levelById.get(id);
}

export function getCatalog(): CatalogSkill[] {
  return catalogMeta.map((m) => {
    const live = skillById.get(m.id);
    if (!live) {
      return { ...m, levelCount: 8, challengeCount: 24, trialTitle: "Try it", trialMinutes: 3 };
    }
    const trial = live.lessons.find((l) => l.id === live.trialLessonId);
    const challengeCount = live.lessons
      .filter((l) => l.kind !== "trial" && l.kind !== "daily")
      .reduce((n, l) => n + l.blocks.filter(isQuestion).length, 0);
    return {
      id: live.id,
      slug: live.slug,
      name: live.name,
      tagline: live.tagline,
      fantasy: live.fantasy,
      category: live.category,
      difficulty: live.difficulty,
      hours: live.hours,
      live: true,
      icon: live.icon,
      levelCount: live.levels.length,
      challengeCount,
      trialTitle: trial?.title ?? "Try it",
      trialMinutes: trial?.minutes ?? 3,
    };
  });
}

export function questionsForConcept(conceptId: string): Block[] {
  const out: Block[] = [];
  for (const skill of liveSkills) {
    for (const lesson of skill.lessons) {
      for (const block of lesson.blocks) {
        if (isQuestion(block) && block.conceptId === conceptId) out.push(block);
      }
    }
  }
  return out;
}

export function lessonForConcept(conceptId: string): Lesson | undefined {
  for (const skill of liveSkills) {
    for (const lesson of skill.lessons) {
      if (lesson.conceptIds.includes(conceptId) && lesson.kind === "lesson") return lesson;
    }
  }
  return undefined;
}

function dailyPool(): { block: Extract<Block, { type: "scenario" }>; lesson: Lesson }[] {
  const pool: { block: Extract<Block, { type: "scenario" }>; lesson: Lesson }[] = [];
  for (const skill of liveSkills) {
    for (const lesson of skill.lessons) {
      for (const block of lesson.blocks) {
        if (block.type === "scenario") pool.push({ block, lesson });
      }
    }
  }
  return pool;
}

export function buildDailyLesson(day: string): Lesson {
  const pool = dailyPool();
  const pick = pool[hashString(`jw-daily-${day}`) % pool.length] ?? pool[0];
  const source = pick.block;
  const q: typeof source = {
    ...source,
    id: `daily-${day}-q`,
    xp: XP.dailyChallenge,
  };
  return {
    id: `daily-${day}`,
    skillId: pick.lesson.skillId,
    levelId: pick.lesson.levelId,
    title: "Today's challenge",
    summary: source.prompt,
    minutes: 4,
    kind: "daily",
    conceptIds: [source.conceptId],
    blocks: [
      {
        id: `daily-${day}-x`,
        type: "explain",
        title: "Today's challenge",
        body: "A short, realistic scenario. Diagnose it. This is the daily — one clean pass.",
      },
      q,
    ],
  };
}

export function countedLessons(skill: Skill): Lesson[] {
  return skill.lessons.filter((l) => l.kind !== "trial" && l.kind !== "daily");
}

export function skillMasteryPct(skill: Skill, completed: Set<string>): number {
  const lessons = countedLessons(skill);
  if (!lessons.length) return 0;
  return Math.round((lessons.filter((l) => completed.has(l.id)).length / lessons.length) * 100);
}

export function firstWorldLesson(skill: Skill): Lesson | undefined {
  for (const level of skill.levels) {
    for (const id of level.lessonIds) {
      const lesson = lessonById.get(id);
      if (lesson) return lesson;
    }
  }
  return undefined;
}

export function getTrialLesson(skill: Skill): Lesson | undefined {
  return lessonById.get(skill.trialLessonId);
}

export function nextLessonInSkill(skill: Skill, completedIds: Set<string>): Lesson | undefined {
  for (const level of skill.levels) {
    for (const id of level.lessonIds) {
      if (!completedIds.has(id)) return lessonById.get(id);
    }
  }
  return undefined;
}

export function isLevelUnlocked(skill: Skill, levelIndex: number, completedIds: Set<string>): boolean {
  if (levelIndex <= 1) return true;
  const prev = skill.levels.find((l) => l.index === levelIndex - 1);
  if (!prev) return true;
  return prev.lessonIds.every((id) => completedIds.has(id));
}

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ");
}

export function checkAnswer(
  block: Block,
  answer: AnswerPayload,
): { correct: boolean; explanation: string; xp: number; stepResults?: boolean[] } {
  if (!isQuestion(block)) {
    return { correct: true, explanation: "", xp: 0 };
  }
  if (block.type === "mcq" || block.type === "identify" || block.type === "scenario") {
    const ok = answer.kind === "index" && answer.value === block.answer;
    return { correct: ok, explanation: block.explanation, xp: ok ? block.xp : 0 };
  }
  if (block.type === "tf") {
    const ok = answer.kind === "bool" && answer.value === block.answer;
    return { correct: ok, explanation: block.explanation, xp: ok ? block.xp : 0 };
  }
  if (block.type === "fill") {
    if (answer.kind !== "text") return { correct: false, explanation: block.explanation, xp: 0 };
    const got = norm(answer.value);
    const accepted = [block.answer, ...(block.accepted ?? [])].map(norm);
    const ok = accepted.includes(got);
    return { correct: ok, explanation: block.explanation, xp: ok ? block.xp : 0 };
  }
  if (block.type === "order") {
    if (answer.kind !== "order") return { correct: false, explanation: block.explanation, xp: 0 };
    const ok =
      answer.value.length === block.items.length &&
      answer.value.every((item, i) => item === block.items[i]);
    return { correct: ok, explanation: block.explanation, xp: ok ? block.xp : 0 };
  }
  if (block.type === "match") {
    if (answer.kind !== "match") return { correct: false, explanation: block.explanation, xp: 0 };
    const expected = new Map(block.pairs.map((p) => [p.left, p.right]));
    const ok =
      answer.value.length === block.pairs.length &&
      answer.value.every((p) => expected.get(p.left) === p.right);
    return { correct: ok, explanation: block.explanation, xp: ok ? block.xp : 0 };
  }
  if (block.type === "challenge") {
    return scoreChallenge(block, answer);
  }
  return { correct: false, explanation: "", xp: 0 };
}

function scoreChallenge(
  block: ChallengeBlock,
  answer: AnswerPayload,
): { correct: boolean; explanation: string; xp: number; stepResults: boolean[] } {
  const values = answer.kind === "steps" ? answer.value : [];
  const stepResults = block.steps.map((step, i) => values[i] === step.answer);
  const correct = stepResults.every(Boolean);
  const xp = correct
    ? block.xp
    : Math.round((block.xp * stepResults.filter(Boolean).length) / block.steps.length);
  return { correct, explanation: block.explanation, xp, stepResults };
}

export function countQuestions(lesson: Lesson): number {
  return lesson.blocks.filter(isQuestion).length;
}

export function conceptName(conceptId: string): string {
  for (const skill of liveSkills) {
    const c = skill.concepts.find((x) => x.id === conceptId);
    if (c) return c.name;
  }
  return conceptId;
}

export function conceptAxis(conceptId: string): MasteryAxis {
  for (const skill of liveSkills) {
    const c = skill.concepts.find((x) => x.id === conceptId);
    if (c) return c.axis;
  }
  return "knowledge";
}

export function skillAxes(
  skill: Skill,
  concepts: { concept_id: string; mastery: number; attempts: number }[],
): { knowledge: number; execution: number; problem: number; overall: number } {
  const byAxis: Record<MasteryAxis, number[]> = { knowledge: [], execution: [], problem: [] };
  const map = new Map(concepts.map((c) => [c.concept_id, c]));
  for (const c of skill.concepts) {
    if (c.id.endsWith("-c-trial")) continue;
    const row = map.get(c.id);
    byAxis[c.axis].push(row && row.attempts > 0 ? row.mastery : 0);
  }
  const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0);
  const knowledge = avg(byAxis.knowledge);
  const execution = avg(byAxis.execution);
  const problem = avg(byAxis.problem);
  return {
    knowledge,
    execution,
    problem,
    overall: Math.round((knowledge + execution + problem) / 3),
  };
}
