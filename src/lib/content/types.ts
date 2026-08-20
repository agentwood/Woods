export type Difficulty = "beginner" | "intermediate" | "advanced";
export type QDifficulty = "easy" | "medium" | "hard";
export type SkillCategory = "Data Worlds" | "Ops Worlds" | "Code Worlds" | "AI Worlds";
export type MasteryAxis = "knowledge" | "execution" | "problem";

export type Concept = {
  id: string;
  name: string;
  levelId: string;
  axis: MasteryAxis;
};

export type Pair = { left: string; right: string };
export type DataRow = { label: string; value: string };

type QBase = {
  id: string;
  prompt: string;
  explanation: string;
  difficulty: QDifficulty;
  xp: number;
  conceptId: string;
};

export type ExplainBlock = {
  id: string;
  type: "explain";
  title: string;
  body: string;
  bullets?: string[];
};

export type ExampleBlock = {
  id: string;
  type: "example";
  title: string;
  body: string;
  callout?: string;
};

export type McqBlock = QBase & {
  type: "mcq";
  options: string[];
  answer: number;
};

export type TfBlock = QBase & {
  type: "tf";
  answer: boolean;
};

export type MatchBlock = QBase & {
  type: "match";
  pairs: Pair[];
};

export type OrderBlock = QBase & {
  type: "order";
  items: string[];
};

export type FillBlock = QBase & {
  type: "fill";
  answer: string;
  accepted?: string[];
};

export type IdentifyBlock = QBase & {
  type: "identify";
  snippet: string;
  options: string[];
  answer: number;
};

export type ScenarioBlock = QBase & {
  type: "scenario";
  context: string;
  data?: DataRow[];
  options: string[];
  answer: number;
};

export type ChallengeStep = {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type ChallengeBlock = {
  id: string;
  type: "challenge";
  prompt: string;
  context: string;
  data?: DataRow[];
  steps: ChallengeStep[];
  xp: number;
  conceptId: string;
  difficulty: QDifficulty;
  explanation: string;
};

export type Block =
  | ExplainBlock
  | ExampleBlock
  | McqBlock
  | TfBlock
  | MatchBlock
  | OrderBlock
  | FillBlock
  | IdentifyBlock
  | ScenarioBlock
  | ChallengeBlock;

export type LessonKind = "lesson" | "boss" | "daily" | "project" | "trial";

export type Lesson = {
  id: string;
  skillId: string;
  levelId: string;
  title: string;
  summary: string;
  minutes: number;
  kind: LessonKind;
  conceptIds: string[];
  blocks: Block[];
  free?: boolean;
};

export type Level = {
  id: string;
  skillId: string;
  index: number;
  title: string;
  subtitle: string;
  isBoss?: boolean;
  lessonIds: string[];
};

export type SkillTreeNode = {
  id: string;
  label: string;
  description: string;
  levelIds: string[];
  parentId: string | null;
};

export type Skill = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  fantasy: string;
  description: string;
  category: SkillCategory;
  difficulty: Difficulty;
  hours: number;
  live: boolean;
  icon: string;
  trialLessonId: string;
  concepts: Concept[];
  levels: Level[];
  lessons: Lesson[];
  tree: SkillTreeNode[];
};

export type CatalogSkill = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  fantasy: string;
  category: SkillCategory;
  difficulty: Difficulty;
  hours: number;
  live: boolean;
  icon: string;
  levelCount: number;
  challengeCount: number;
  trialTitle: string;
  trialMinutes: number;
};

export type AnswerPayload =
  | { kind: "index"; value: number }
  | { kind: "bool"; value: boolean }
  | { kind: "text"; value: string }
  | { kind: "order"; value: string[] }
  | { kind: "match"; value: { left: string; right: string }[] }
  | { kind: "steps"; value: number[] };

export function isQuestion(
  block: Block,
): block is Exclude<Block, ExplainBlock | ExampleBlock> {
  return block.type !== "explain" && block.type !== "example";
}

export const XP = {
  easy: 10,
  medium: 25,
  hard: 50,
  scenario: 50,
  project: 100,
  boss: 250,
  finalBoss: 1000,
  perfectLesson: 20,
  lessonComplete: 20,
  perfectLevel: 100,
  dailyChallenge: 50,
  missionLesson: 20,
  missionQuestions: 50,
  missionMastery: 50,
  missionDaily: 50,
} as const;
