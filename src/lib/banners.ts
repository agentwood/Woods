import type { CatalogSkill, SkillCategory } from "@/lib/content/types";

const BY_CATEGORY: Record<SkillCategory, string> = {
  "Data Worlds": "/images/land-data.jpg",
  "Ops Worlds": "/images/land-ops.jpg",
  "Code Worlds": "/images/land-code.jpg",
  "AI Worlds": "/images/land-ai.jpg",
};

const BY_ID: Record<string, string> = {
  "power-bi": "/images/worlds/power-bi.jpg",
  tableau: "/images/worlds/tableau.jpg",
  docker: "/images/worlds/docker.jpg",
  kubernetes: "/images/worlds/kubernetes.jpg",
  terraform: "/images/worlds/terraform.jpg",
  git: "/images/worlds/git.jpg",
  typescript: "/images/worlds/typescript.jpg",
  "game-dev": "/images/worlds/game-dev.jpg",
  "ai-video": "/images/worlds/ai-video.jpg",
  n8n: "/images/worlds/n8n.jpg",
  "ai-agents": "/images/worlds/ai-agents.jpg",
  comfyui: "/images/worlds/comfyui.jpg",
};

export function skillBanner(skill: Pick<CatalogSkill, "id" | "category">): string {
  return BY_ID[skill.id] ?? BY_CATEGORY[skill.category] ?? "/images/land-data.jpg";
}

export function legendTitle(name: string): string {
  return `The Legend of ${name}`;
}

export function editionLabel(difficulty: CatalogSkill["difficulty"]): string {
  if (difficulty === "beginner") return "Beginners Edition";
  if (difficulty === "advanced") return "Advanced Edition";
  return "Intermediate Edition";
}
