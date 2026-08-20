import { powerBiSkill } from "../src/lib/content/worlds/power-bi.ts";
import { tableauSkill } from "../src/lib/content/worlds/tableau.ts";
import { dockerSkill } from "../src/lib/content/worlds/docker.ts";
import { kubernetesSkill } from "../src/lib/content/worlds/kubernetes.ts";
import { terraformSkill } from "../src/lib/content/worlds/terraform.ts";
import { gitSkill } from "../src/lib/content/worlds/git.ts";
import { typescriptSkill } from "../src/lib/content/worlds/typescript.ts";
import { gameDevSkill } from "../src/lib/content/worlds/game-dev.ts";
import { aiVideoSkill } from "../src/lib/content/worlds/ai-video.ts";
import { n8nSkill } from "../src/lib/content/worlds/n8n.ts";
import { aiAgentsSkill } from "../src/lib/content/worlds/ai-agents.ts";
import { comfyUiSkill } from "../src/lib/content/worlds/comfyui.ts";
import { isQuestion, type Block, type Skill } from "../src/lib/content/types.ts";

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

export function lintSkills(skills: Skill[]): string[] {
  const errors: string[] = [];
  const ids = new Map<string, string>();

  const claim = (id: string, where: string) => {
    const prev = ids.get(id);
    if (prev) errors.push(`duplicate id ${id} (${prev} vs ${where})`);
    else ids.set(id, where);
  };

  for (const skill of skills) {
    const where = skill.slug;
    claim(skill.id, `${where} skill`);
    if (!skill.trialLessonId) errors.push(`${where}: missing trialLessonId`);
    const trial = skill.lessons.find((l) => l.id === skill.trialLessonId);
    if (!trial || trial.kind !== "trial") errors.push(`${where}: trial lesson missing or not kind trial`);
    else {
      const qs = trial.blocks.filter(isQuestion);
      if (!qs.length) errors.push(`${where}: trial has no questions`);
    }

    if (skill.levels.length < 8 || skill.levels.length > 10) {
      errors.push(`${where}: expected 8–10 levels, got ${skill.levels.length}`);
    }

    const first = skill.levels[0];
    if (first) {
      for (const id of first.lessonIds) {
        const lesson = skill.lessons.find((l) => l.id === id);
        if (lesson && lesson.free !== true) errors.push(`${where}: Level 01 lesson ${lesson.id} is not free`);
      }
    }

    const last = skill.levels[skill.levels.length - 1];
    if (!last?.isBoss) errors.push(`${where}: final level missing isBoss`);
    const finalLessons = last ? skill.lessons.filter((l) => last.lessonIds.includes(l.id)) : [];
    const finalBoss = finalLessons.find((l) => l.kind === "boss");
    if (!finalBoss) errors.push(`${where}: final level has no kind: boss`);
    else {
      const ch = finalBoss.blocks.find((b) => b.type === "challenge");
      if (!ch || ch.type !== "challenge") errors.push(`${where}: final boss missing challenge`);
      else if (ch.steps.length < 3) errors.push(`${where}: final boss challenge has ${ch.steps.length} steps (need ≥3)`);
      else if (ch.steps.length < 4) errors.push(`${where}: final boss challenge has ${ch.steps.length} steps (target 4)`);
      if (ch && ch.type === "challenge" && ch.xp !== 1000) errors.push(`${where}: final boss xp is ${ch.xp}, expected 1000`);
    }

    for (const level of skill.levels) {
      claim(level.id, `${where} ${level.id}`);
      if (!level.isBoss && level.lessonIds.length < 3) {
        console.warn(`${where} ${level.id}: ${level.lessonIds.length} missions (target 3–5)`);
      }
    }

    for (const lesson of skill.lessons) {
      claim(lesson.id, `${where} ${lesson.id}`);
      const qs = lesson.blocks.filter(isQuestion);
      if (!qs.length) errors.push(`${where} ${lesson.id}: no questions`);
      for (const block of lesson.blocks) lintBlock(block, `${where} ${lesson.id}`, errors, claim);
    }

    for (const c of skill.concepts) claim(c.id, `${where} concept ${c.id}`);
  }

  return errors;
}

function lintBlock(block: Block, where: string, errors: string[], claim: (id: string, where: string) => void) {
  claim(block.id, where);
  if (!isQuestion(block)) return;
  if (block.type === "mcq" || block.type === "identify" || block.type === "scenario") {
    if (block.answer < 0 || block.answer >= block.options.length) {
      errors.push(`${where} ${block.id}: answer ${block.answer} out of range (${block.options.length} options)`);
    }
    if (block.options.length < 2) errors.push(`${where} ${block.id}: fewer than 2 options`);
  }
  if (block.type === "match" && block.pairs.length < 2) errors.push(`${where} ${block.id}: match needs pairs`);
  if (block.type === "order" && block.items.length < 2) errors.push(`${where} ${block.id}: order needs items`);
  if (block.type === "fill" && !block.answer.trim()) errors.push(`${where} ${block.id}: empty fill answer`);
  if (block.type === "challenge") {
    if (block.steps.length < 3 && (where.includes("boss") || where.includes("final") || where.includes("project"))) {
      errors.push(`${where} ${block.id}: challenge steps ${block.steps.length} < 3`);
    }
    for (const step of block.steps) {
      claim(step.id, `${where} ${block.id}`);
      if (step.answer < 0 || step.answer >= step.options.length) {
        errors.push(`${where} ${step.id}: answer ${step.answer} out of range`);
      }
    }
  }
}

const errors = lintSkills(liveSkills);
if (errors.length) {
  console.error(`content-lint: ${errors.length} issue(s)`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`content-lint: ok (${liveSkills.length} worlds)`);
