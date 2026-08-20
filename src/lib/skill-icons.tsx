import type { LucideIcon } from "lucide-react";
import {
  Bot,
  Boxes,
  Building2,
  ChartColumn,
  Clapperboard,
  Cloud,
  Gamepad2,
  GitBranch,
  Search,
  Shield,
  Workflow,
  Zap,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  search: Search,
  boxes: Boxes,
  "chart-column": ChartColumn,
  shield: Shield,
  cloud: Cloud,
  "building-2": Building2,
  "git-branch": GitBranch,
  "gamepad-2": Gamepad2,
  clapperboard: Clapperboard,
  zap: Zap,
  bot: Bot,
  workflow: Workflow,
};

export function SkillIcon({ name, className }: { name: string; className?: string }) {
  const Icon = MAP[name] ?? Search;
  return <Icon className={className} strokeWidth={1.75} />;
}
