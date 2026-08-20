import type {
  Block,
  ChallengeStep,
  Concept,
  DataRow,
  Difficulty,
  Lesson,
  LessonKind,
  Level,
  MasteryAxis,
  QDifficulty,
  Skill,
  SkillCategory,
  SkillTreeNode,
} from "./types";
import { XP } from "./types";

export function xpFor(d: QDifficulty): number {
  if (d === "easy") return XP.easy;
  if (d === "hard") return XP.hard;
  return XP.medium;
}

type MissionSpec = {
  key: string;
  title: string;
  summary: string;
  minutes?: number;
  kind?: LessonKind;
  free?: boolean;
  concept: { key: string; name: string; axis: MasteryAxis };
  teach: { title: string; body: string; bullets?: string[] };
  example?: { title: string; body: string; callout?: string };
  questions: BlockBuilder[];
};

type LevelSpec = {
  key: string;
  title: string;
  subtitle: string;
  isBoss?: boolean;
  missions: MissionSpec[];
};

export type WorldSpec = {
  id: string;
  name: string;
  tagline: string;
  fantasy: string;
  description: string;
  category: SkillCategory;
  difficulty: Difficulty;
  hours: number;
  icon: string;
  trial: MissionSpec;
  levels: LevelSpec[];
  tree?: { label: string; description: string; levelKeys: string[] }[];
};

type BlockBuilder = (ids: { lessonId: string; conceptId: string; n: number }) => Block;

export function mcq(
  prompt: string,
  options: string[],
  answer: number,
  explanation: string,
  difficulty: QDifficulty = "easy",
): BlockBuilder {
  return ({ lessonId, conceptId, n }) => ({
    id: `${lessonId}-q${n}`,
    type: "mcq",
    prompt,
    options,
    answer,
    explanation,
    difficulty,
    xp: xpFor(difficulty),
    conceptId,
  });
}

export function tf(
  prompt: string,
  answer: boolean,
  explanation: string,
  difficulty: QDifficulty = "easy",
): BlockBuilder {
  return ({ lessonId, conceptId, n }) => ({
    id: `${lessonId}-q${n}`,
    type: "tf",
    prompt,
    answer,
    explanation,
    difficulty,
    xp: xpFor(difficulty),
    conceptId,
  });
}

export function fill(
  prompt: string,
  answer: string,
  explanation: string,
  accepted: string[] = [],
  difficulty: QDifficulty = "easy",
): BlockBuilder {
  return ({ lessonId, conceptId, n }) => ({
    id: `${lessonId}-q${n}`,
    type: "fill",
    prompt,
    answer,
    accepted,
    explanation,
    difficulty,
    xp: xpFor(difficulty),
    conceptId,
  });
}

export function order(
  prompt: string,
  items: string[],
  explanation: string,
  difficulty: QDifficulty = "medium",
): BlockBuilder {
  return ({ lessonId, conceptId, n }) => ({
    id: `${lessonId}-q${n}`,
    type: "order",
    prompt,
    items,
    explanation,
    difficulty,
    xp: xpFor(difficulty),
    conceptId,
  });
}

export function match(
  prompt: string,
  pairs: { left: string; right: string }[],
  explanation: string,
  difficulty: QDifficulty = "medium",
): BlockBuilder {
  return ({ lessonId, conceptId, n }) => ({
    id: `${lessonId}-q${n}`,
    type: "match",
    prompt,
    pairs,
    explanation,
    difficulty,
    xp: xpFor(difficulty),
    conceptId,
  });
}

export function identify(
  prompt: string,
  snippet: string,
  options: string[],
  answer: number,
  explanation: string,
  difficulty: QDifficulty = "medium",
): BlockBuilder {
  return ({ lessonId, conceptId, n }) => ({
    id: `${lessonId}-q${n}`,
    type: "identify",
    prompt,
    snippet,
    options,
    answer,
    explanation,
    difficulty,
    xp: xpFor(difficulty),
    conceptId,
  });
}

export function scenario(
  prompt: string,
  context: string,
  options: string[],
  answer: number,
  explanation: string,
  difficulty: QDifficulty = "hard",
  data?: DataRow[],
): BlockBuilder {
  return ({ lessonId, conceptId, n }) => ({
    id: `${lessonId}-q${n}`,
    type: "scenario",
    prompt,
    context,
    data,
    options,
    answer,
    explanation,
    difficulty,
    xp: difficulty === "hard" ? XP.scenario : xpFor(difficulty),
    conceptId,
  });
}

export function challenge(
  prompt: string,
  context: string,
  steps: Omit<ChallengeStep, "id">[],
  explanation: string,
  difficulty: QDifficulty = "hard",
  xp?: number,
  data?: DataRow[],
): BlockBuilder {
  return ({ lessonId, conceptId, n }) => ({
    id: `${lessonId}-q${n}`,
    type: "challenge",
    prompt,
    context,
    data,
    steps: steps.map((s, i) => ({ ...s, id: `${lessonId}-q${n}-s${i + 1}` })),
    explanation,
    difficulty,
    xp: xp ?? xpFor(difficulty),
    conceptId,
  });
}

function buildLesson(
  skillId: string,
  levelId: string,
  spec: MissionSpec,
  index: number,
): { lesson: Lesson; concept: Concept } {
  const lessonId = `${skillId}-${spec.key}`;
  const conceptId = `${skillId}-c-${spec.concept.key}`;
  const concept: Concept = {
    id: conceptId,
    name: spec.concept.name,
    levelId,
    axis: spec.concept.axis,
  };
  const blocks: Block[] = [
    {
      id: `${lessonId}-x`,
      type: "explain",
      title: spec.teach.title,
      body: spec.teach.body,
      bullets: spec.teach.bullets,
    },
  ];
  if (spec.example) {
    blocks.push({
      id: `${lessonId}-ex`,
      type: "example",
      title: spec.example.title,
      body: spec.example.body,
      callout: spec.example.callout,
    });
  }
  spec.questions.forEach((build, i) => {
    blocks.push(build({ lessonId, conceptId, n: i + 1 }));
  });
  const lesson: Lesson = {
    id: lessonId,
    skillId,
    levelId,
    title: spec.title,
    summary: spec.summary,
    minutes: spec.minutes ?? 6,
    kind: spec.kind ?? "lesson",
    free: spec.free,
    conceptIds: [conceptId],
    blocks,
  };
  void index;
  return { lesson, concept };
}

export function buildWorld(spec: WorldSpec): Skill {
  const levels: Level[] = [];
  const lessons: Lesson[] = [];
  const concepts: Concept[] = [];

  const trialLevelId = `${spec.id}-00`;
  const trial = buildLesson(spec.id, trialLevelId, { ...spec.trial, kind: "trial", free: true }, 0);
  lessons.push(trial.lesson);
  concepts.push(trial.concept);

  spec.levels.forEach((lv, i) => {
    const levelId = `${spec.id}-${String(i + 1).padStart(2, "0")}`;
    const lessonIds: string[] = [];
    lv.missions.forEach((m, mi) => {
      const built = buildLesson(spec.id, levelId, { ...m, free: m.free ?? i === 0 }, mi);
      lessons.push(built.lesson);
      concepts.push(built.concept);
      lessonIds.push(built.lesson.id);
    });
    levels.push({
      id: levelId,
      skillId: spec.id,
      index: i + 1,
      title: lv.title,
      subtitle: lv.subtitle,
      isBoss: lv.isBoss,
      lessonIds,
    });
  });

  const tree: SkillTreeNode[] = spec.tree
    ? spec.tree.map((n, i) => ({
        id: `${spec.id}-n-${i}`,
        label: n.label,
        description: n.description,
        levelIds: n.levelKeys.map((k) => {
          const idx = spec.levels.findIndex((l) => l.key === k);
          return `${spec.id}-${String(idx + 1).padStart(2, "0")}`;
        }),
        parentId: i === 0 ? null : `${spec.id}-n-${i - 1}`,
      }))
    : levels.map((l, i) => ({
        id: `${spec.id}-n-${i}`,
        label: l.title,
        description: l.subtitle,
        levelIds: [l.id],
        parentId: i === 0 ? null : `${spec.id}-n-${i - 1}`,
      }));

  return {
    id: spec.id,
    slug: spec.id,
    name: spec.name,
    tagline: spec.tagline,
    fantasy: spec.fantasy,
    description: spec.description,
    category: spec.category,
    difficulty: spec.difficulty,
    hours: spec.hours,
    live: true,
    icon: spec.icon,
    trialLessonId: trial.lesson.id,
    concepts,
    levels,
    lessons,
    tree,
  };
}
