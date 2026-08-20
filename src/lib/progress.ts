import { clamp } from "./utils";

/** XP needed to clear the current level. Level 12 requires 1,500. */
export function xpRequiredForLevel(level: number): number {
  return 300 + level * 100;
}

export function levelFromXp(totalXp: number): {
  level: number;
  xpInLevel: number;
  xpToNext: number;
} {
  let level = 1;
  let remaining = Math.max(0, totalXp);
  for (let i = 0; i < 120; i += 1) {
    const need = xpRequiredForLevel(level);
    if (remaining < need) {
      return { level, xpInLevel: remaining, xpToNext: need };
    }
    remaining -= need;
    level += 1;
  }
  return { level, xpInLevel: remaining, xpToNext: xpRequiredForLevel(level) };
}

export function difficultyWeight(d: "easy" | "medium" | "hard"): number {
  if (d === "easy") return 0.7;
  if (d === "hard") return 1.25;
  return 1;
}

export function nextMastery(
  current: number,
  correct: boolean,
  difficulty: "easy" | "medium" | "hard",
): number {
  const w = difficultyWeight(difficulty);
  const next = correct ? current + 18 * w : current - 12 * w;
  return Math.round(clamp(next, 0, 100));
}

export function masteryBand(mastery: number): "foundational" | "intermediate" | "advanced" | "mastery" {
  if (mastery < 60) return "foundational";
  if (mastery < 80) return "intermediate";
  if (mastery < 95) return "advanced";
  return "mastery";
}

export const ACHIEVEMENTS = [
  {
    id: "first-steps",
    name: "First Steps",
    description: "Complete your first lesson.",
  },
  {
    id: "deep-work",
    name: "Deep Work",
    description: "Complete 10 lessons.",
  },
  {
    id: "problem-solver",
    name: "Problem Solver",
    description: "Complete 25 scenarios.",
  },
  {
    id: "mastery",
    name: "Mastery",
    description: "Reach 90% mastery in a topic.",
  },
  {
    id: "boss-slayer",
    name: "Boss Slayer",
    description: "Complete your first boss challenge.",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Complete an entire skill world.",
  },
  {
    id: "week-in",
    name: "Week In",
    description: "Hold a 7-day streak.",
  },
  {
    id: "grove-walker",
    name: "Grove Walker",
    description: "Start three skill worlds.",
  },
] as const;

export type AchievementId = (typeof ACHIEVEMENTS)[number]["id"];
