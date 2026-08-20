import type { CatalogSkill, SkillCategory } from "./types";

export const catalogMeta: Omit<CatalogSkill, "levelCount" | "challengeCount" | "trialTitle" | "trialMinutes">[] = [
  { id: "power-bi", slug: "power-bi", name: "Power BI", tagline: "The numbers are hiding the answer. Find it.", fantasy: "THE DATA ANALYST", category: "Data Worlds", difficulty: "intermediate", hours: 14, live: true, icon: "chart-column" },
  { id: "tableau", slug: "tableau", name: "Tableau", tagline: "See it. Prove it. Present it.", fantasy: "THE DATA DETECTIVE", category: "Data Worlds", difficulty: "intermediate", hours: 12, live: true, icon: "search" },
  { id: "docker", slug: "docker", name: "Docker", tagline: "It works on my machine. Now make it work everywhere.", fantasy: "THE CONTAINER ENGINEER", category: "Ops Worlds", difficulty: "intermediate", hours: 12, live: true, icon: "boxes" },
  { id: "kubernetes", slug: "kubernetes", name: "Kubernetes", tagline: "Desired state is the law. Reality must obey.", fantasy: "THE SYSTEM OPERATOR", category: "Ops Worlds", difficulty: "advanced", hours: 14, live: true, icon: "cloud" },
  { id: "terraform", slug: "terraform", name: "Terraform", tagline: "Write the city. Then keep it true.", fantasy: "THE INFRASTRUCTURE ARCHITECT", category: "Ops Worlds", difficulty: "intermediate", hours: 12, live: true, icon: "building-2" },
  { id: "git", slug: "git", name: "Git & GitHub", tagline: "Every save point is a choice.", fantasy: "THE CODE TIME TRAVELLER", category: "Code Worlds", difficulty: "beginner", hours: 10, live: true, icon: "git-branch" },
  { id: "typescript", slug: "typescript", name: "TypeScript", tagline: "Make illegal states unrepresentable.", fantasy: "THE CODE GUARDIAN", category: "Code Worlds", difficulty: "intermediate", hours: 12, live: true, icon: "shield" },
  { id: "game-dev", slug: "game-dev", name: "Game Development", tagline: "Make something move. Then make it feel alive.", fantasy: "THE GAME MAKER", category: "Code Worlds", difficulty: "beginner", hours: 16, live: true, icon: "gamepad-2" },
  { id: "ai-video", slug: "ai-video", name: "AI Video", tagline: "Turn a sentence into a shot.", fantasy: "THE AI DIRECTOR", category: "AI Worlds", difficulty: "beginner", hours: 10, live: true, icon: "clapperboard" },
  { id: "n8n", slug: "n8n", name: "n8n", tagline: "Trigger → action → output.", fantasy: "THE AUTOMATION ENGINEER", category: "AI Worlds", difficulty: "beginner", hours: 10, live: true, icon: "zap" },
  { id: "ai-agents", slug: "ai-agents", name: "AI Agents", tagline: "From answers to actions.", fantasy: "THE AGENT BUILDER", category: "AI Worlds", difficulty: "intermediate", hours: 12, live: true, icon: "bot" },
  { id: "comfyui", slug: "comfyui", name: "ComfyUI", tagline: "Nodes in. A machine out.", fantasy: "THE AI WORKFLOW ARTIST", category: "AI Worlds", difficulty: "intermediate", hours: 12, live: true, icon: "workflow" },
];

export const CATEGORY_ORDER: SkillCategory[] = ["Data Worlds", "Ops Worlds", "Code Worlds", "AI Worlds"];
