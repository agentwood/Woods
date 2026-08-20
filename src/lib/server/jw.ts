import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import {
  buildDailyLesson,
  checkAnswer,
  conceptName,
  countQuestions,
  getBlock,
  getLesson,
  getSkill,
  isLevelUnlocked,
  lessonForConcept,
  liveSkills,
  countedLessons,
  nextLessonInSkill,
} from "@/lib/content";
import type { AnswerPayload, Lesson } from "@/lib/content/types";
import { isQuestion, XP } from "@/lib/content/types";
import { ACHIEVEMENTS, levelFromXp, nextMastery } from "@/lib/progress";
import { todayISO } from "@/lib/utils";

type ProfileRow = {
  user_id: string;
  total_xp: number;
  streak_days: number;
  last_active_date: string | null;
  is_pro: boolean;
  leaderboard_opt_out: boolean;
};

type LessonRow = {
  lesson_id: string;
  skill_id: string;
  current_block: number;
  completed: boolean;
  perfect: boolean;
  xp_earned: number;
  first_try_correct: number;
  questions_answered: number;
  answered_json: string;
};

type ConceptRow = {
  concept_id: string;
  skill_id: string;
  mastery: number;
  attempts: number;
  correct: number;
  fail_streak: number;
};

type SkillRow = { skill_id: string; xp: number };
type MissionRow = {
  mission_id: string;
  progress: number;
  target: number;
  completed: boolean;
  xp_awarded: number;
};
type AchievementRow = { achievement_id: string; unlocked_at: string };
type ActivityRow = { kind: string; label: string; xp: number; created_at: string };

type Answered = { blockId: string; correct: boolean };

const MISSIONS = [
  { id: "lesson", label: "Complete 1 lesson", target: 1, xp: XP.missionLesson },
  { id: "questions", label: "Answer 10 questions", target: 10, xp: XP.missionQuestions },
  { id: "weak", label: "Master one weak concept", target: 1, xp: XP.missionMastery },
  { id: "daily", label: "Complete today's challenge", target: 1, xp: XP.missionDaily },
] as const;

async function ensureProfile(userId: string): Promise<ProfileRow> {
  const sql = await getSql();
  const existing = await sql<ProfileRow>`
    select user_id, total_xp, streak_days, last_active_date, is_pro, leaderboard_opt_out
    from jw_profiles where user_id = ${userId}
  `;
  if (existing[0]) return existing[0];
  await sql`
    insert into jw_profiles (user_id) values (${userId})
    on conflict (user_id) do nothing
  `;
  return {
    user_id: userId,
    total_xp: 0,
    streak_days: 0,
    last_active_date: null,
    is_pro: false,
    leaderboard_opt_out: false,
  };
}

async function ensureMissions(userId: string, day: string) {
  const sql = await getSql();
  const rows = await sql<MissionRow>`
    select mission_id, progress, target, completed, xp_awarded
    from jw_daily_missions where user_id = ${userId} and day = ${day}
  `;
  if (rows.length >= MISSIONS.length) return rows;
  for (const m of MISSIONS) {
    await sql`
      insert into jw_daily_missions (user_id, day, mission_id, progress, target)
      values (${userId}, ${day}, ${m.id}, 0, ${m.target})
      on conflict (user_id, day, mission_id) do nothing
    `;
  }
  return sql<MissionRow>`
    select mission_id, progress, target, completed, xp_awarded
    from jw_daily_missions where user_id = ${userId} and day = ${day}
  `;
}

function yesterdayISO(day: string): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

async function touchStreak(userId: string, profile: ProfileRow, day: string): Promise<number> {
  const sql = await getSql();
  const last = profile.last_active_date;
  let streak = profile.streak_days;
  if (last === day) return streak;
  if (last === yesterdayISO(day)) streak += 1;
  else streak = 1;
  await sql`
    update jw_profiles
    set streak_days = ${streak}, last_active_date = ${day}
    where user_id = ${userId}
  `;
  return streak;
}

async function addXp(userId: string, skillId: string | null, amount: number) {
  if (amount <= 0) return;
  const sql = await getSql();
  await sql`
    update jw_profiles set total_xp = total_xp + ${amount} where user_id = ${userId}
  `;
  if (skillId) {
    await sql`
      insert into jw_skill_progress (user_id, skill_id, xp)
      values (${userId}, ${skillId}, ${amount})
      on conflict (user_id, skill_id) do update
      set xp = jw_skill_progress.xp + ${amount}, updated_at = now()
    `;
  }
}

async function logActivity(userId: string, kind: string, label: string, xp: number) {
  const sql = await getSql();
  await sql`
    insert into jw_activity (user_id, kind, label, xp)
    values (${userId}, ${kind}, ${label}, ${xp})
  `;
}

async function bumpMission(
  userId: string,
  day: string,
  missionId: string,
  inc: number,
): Promise<{ completed: boolean; xp: number }> {
  if (inc <= 0) return { completed: false, xp: 0 };
  const sql = await getSql();
  const spec = MISSIONS.find((m) => m.id === missionId);
  if (!spec) return { completed: false, xp: 0 };
  const rows = await sql<MissionRow>`
    select mission_id, progress, target, completed, xp_awarded
    from jw_daily_missions
    where user_id = ${userId} and day = ${day} and mission_id = ${missionId}
  `;
  const row = rows[0];
  if (!row || row.completed) return { completed: false, xp: 0 };
  const progress = Math.min(row.target, row.progress + inc);
  const done = progress >= row.target;
  const xp = done ? spec.xp : 0;
  await sql`
    update jw_daily_missions
    set progress = ${progress}, completed = ${done}, xp_awarded = ${xp}
    where user_id = ${userId} and day = ${day} and mission_id = ${missionId}
  `;
  if (done && xp) {
    await addXp(userId, null, xp);
    await logActivity(userId, "mission", spec.label, xp);
  }
  return { completed: done, xp };
}

async function unlockAchievements(userId: string): Promise<string[]> {
  const sql = await getSql();
  const unlocked: string[] = [];
  const have = new Set(
    (
      await sql<AchievementRow>`
        select achievement_id, unlocked_at from jw_achievements where user_id = ${userId}
      `
    ).map((r) => r.achievement_id),
  );

  const mark = async (id: string) => {
    if (have.has(id)) return;
    await sql`
      insert into jw_achievements (user_id, achievement_id)
      values (${userId}, ${id})
      on conflict do nothing
    `;
    have.add(id);
    unlocked.push(id);
    await logActivity(userId, "achievement", ACHIEVEMENTS.find((a) => a.id === id)?.name ?? id, 0);
  };

  const lessons = await sql<{ n: number }>`
    select count(*)::int as n from jw_lesson_progress
    where user_id = ${userId} and completed = true
  `;
  const nLessons = lessons[0]?.n ?? 0;
  if (nLessons >= 1) await mark("first-steps");
  if (nLessons >= 10) await mark("deep-work");

  const scenarios = await sql<{ n: number }>`
    select count(*)::int as n from jw_activity
    where user_id = ${userId} and kind = 'scenario'
  `;
  if ((scenarios[0]?.n ?? 0) >= 25) await mark("problem-solver");

  const mastery = await sql<{ n: number }>`
    select count(*)::int as n from jw_concept_mastery
    where user_id = ${userId} and mastery >= 90
  `;
  if ((mastery[0]?.n ?? 0) >= 1) await mark("mastery");

  const bossesDone = await sql<{ lesson_id: string }>`
    select lesson_id from jw_lesson_progress
    where user_id = ${userId} and completed = true
  `;
  const bossIds = new Set(
    liveSkills.flatMap((s) => s.lessons.filter((l) => l.kind === "boss").map((l) => l.id)),
  );
  if (bossesDone.some((r) => bossIds.has(r.lesson_id))) await mark("boss-slayer");

  const started = await sql<{ n: number }>`
    select count(*)::int as n from jw_skill_progress where user_id = ${userId}
  `;
  if ((started[0]?.n ?? 0) >= 3) await mark("grove-walker");

  const profile = await sql<ProfileRow>`
    select user_id, total_xp, streak_days, last_active_date, is_pro, leaderboard_opt_out
    from jw_profiles where user_id = ${userId}
  `;
  if ((profile[0]?.streak_days ?? 0) >= 7) await mark("week-in");

  for (const skill of liveSkills) {
    const ids = countedLessons(skill).map((l) => l.id);
    const done = await sql<{ n: number }>`
      select count(*)::int as n from jw_lesson_progress
      where user_id = ${userId} and completed = true and skill_id = ${skill.id}
    `;
    if (ids.length > 0 && (done[0]?.n ?? 0) >= ids.length) await mark("professional");
  }

  return unlocked;
}

function parseAnswered(raw: string): Answered[] {
  try {
    const v = JSON.parse(raw) as Answered[];
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function canAccessLesson(lesson: Lesson, isPro: boolean, completed: Set<string>): { ok: boolean; reason?: "pro" | "locked" } {
  const skill = getSkill(lesson.skillId);
  if (!skill) return { ok: false, reason: "locked" };
  if (lesson.kind === "trial" || lesson.kind === "daily") return { ok: true };
  const level = skill.levels.find((l) => l.id === lesson.levelId);
  if (!level) return { ok: false, reason: "locked" };
  if (!isLevelUnlocked(skill, level.index, completed)) return { ok: false, reason: "locked" };
  const free = Boolean(lesson.free) || level.index === 1;
  if (!free && !isPro) return { ok: false, reason: "pro" };
  return { ok: true };
}

export const getProgress = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const userId = context.userId;
    const day = todayISO();
    const profile = await ensureProfile(userId);
    const missions = await ensureMissions(userId, day);
    const [skills, lessons, concepts, achievements, activity] = await Promise.all([
      sql<SkillRow>`select skill_id, xp from jw_skill_progress where user_id = ${userId}`,
      sql<LessonRow>`
        select lesson_id, skill_id, current_block, completed, perfect, xp_earned,
               first_try_correct, questions_answered, answered_json
        from jw_lesson_progress where user_id = ${userId}
      `,
      sql<ConceptRow>`
        select concept_id, skill_id, mastery, attempts, correct, fail_streak
        from jw_concept_mastery where user_id = ${userId}
      `,
      sql<AchievementRow>`
        select achievement_id, unlocked_at from jw_achievements where user_id = ${userId}
      `,
      sql<ActivityRow>`
        select kind, label, xp, created_at from jw_activity
        where user_id = ${userId} order by created_at desc limit 12
      `,
    ]);
    const lvl = levelFromXp(profile.total_xp);
    return {
      profile: {
        totalXp: profile.total_xp,
        streakDays: profile.streak_days,
        lastActiveDate: profile.last_active_date,
        isPro: profile.is_pro,
        leaderboardOptOut: profile.leaderboard_opt_out,
        level: lvl.level,
        xpInLevel: lvl.xpInLevel,
        xpToNext: lvl.xpToNext,
      },
      skills,
      lessons,
      concepts,
      missions: missions.map((m) => ({
        ...m,
        label: MISSIONS.find((x) => x.id === m.mission_id)?.label ?? m.mission_id,
        xp: MISSIONS.find((x) => x.id === m.mission_id)?.xp ?? 0,
      })),
      achievements,
      activity,
      dailyLessonId: `daily-${day}`,
    };
  });

export const startSkill = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((skillId: string) => skillId)
  .handler(async ({ context, data: skillId }) => {
    const skill = getSkill(skillId);
    if (!skill) throw new Error("Unknown skill");
    const sql = await getSql();
    await ensureProfile(context.userId);
    await sql`
      insert into jw_skill_progress (user_id, skill_id, xp)
      values (${context.userId}, ${skill.id}, 0)
      on conflict (user_id, skill_id) do update set updated_at = now()
    `;
    await unlockAchievements(context.userId);
    return { ok: true as const, slug: skill.slug };
  });

export const submitAnswer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { blockId: string; answer: AnswerPayload }) => input)
  .handler(async ({ context, data }) => {
    const found = getBlock(data.blockId);
    if (!found) throw new Error("Unknown question");
    const { block, lesson } = found;
    if (!isQuestion(block)) throw new Error("Not a question");
    const sql = await getSql();
    const userId = context.userId;
    const day = todayISO();
    const profile = await ensureProfile(userId);
    await ensureMissions(userId, day);

    const completedRows = await sql<{ lesson_id: string }>`
      select lesson_id from jw_lesson_progress
      where user_id = ${userId} and completed = true
    `;
    const completed = new Set(completedRows.map((r) => r.lesson_id));
    const access = canAccessLesson(lesson, profile.is_pro, completed);
    if (!access.ok) return { ok: false as const, reason: access.reason ?? "locked" };

    const result = checkAnswer(block, data.answer);
    const lessonRows = await sql<LessonRow>`
      select lesson_id, skill_id, current_block, completed, perfect, xp_earned,
             first_try_correct, questions_answered, answered_json
      from jw_lesson_progress where user_id = ${userId} and lesson_id = ${lesson.id}
    `;
    const existing = lessonRows[0];
    const answered = parseAnswered(existing?.answered_json ?? "[]");
    const already = answered.find((a) => a.blockId === block.id);
    const firstTry = !already;
    let xpAwarded = 0;
    if (firstTry && result.xp > 0) xpAwarded = result.xp;

    const conceptRows = await sql<ConceptRow>`
      select concept_id, skill_id, mastery, attempts, correct, fail_streak
      from jw_concept_mastery
      where user_id = ${userId} and concept_id = ${block.conceptId}
    `;
    const prev = conceptRows[0];
    const prevMastery = prev?.mastery ?? 0;
    const mastery = nextMastery(prevMastery, result.correct, block.difficulty);
    const failStreak = result.correct ? 0 : (prev?.fail_streak ?? 0) + 1;
    await sql`
      insert into jw_concept_mastery (user_id, concept_id, skill_id, mastery, attempts, correct, fail_streak)
      values (
        ${userId}, ${block.conceptId}, ${lesson.skillId}, ${mastery},
        1, ${result.correct ? 1 : 0}, ${failStreak}
      )
      on conflict (user_id, concept_id) do update set
        mastery = ${mastery},
        attempts = jw_concept_mastery.attempts + 1,
        correct = jw_concept_mastery.correct + ${result.correct ? 1 : 0},
        fail_streak = ${failStreak},
        updated_at = now()
    `;

    if (!already) {
      answered.push({ blockId: block.id, correct: result.correct });
      const firstTryCorrect = (existing?.first_try_correct ?? 0) + (result.correct ? 1 : 0);
      const questionsAnswered = (existing?.questions_answered ?? 0) + 1;
      const xpEarned = (existing?.xp_earned ?? 0) + xpAwarded;
      const json = JSON.stringify(answered);
      await sql`
        insert into jw_lesson_progress (
          user_id, lesson_id, skill_id, answered_json, first_try_correct,
          questions_answered, xp_earned
        )
        values (
          ${userId}, ${lesson.id}, ${lesson.skillId}, ${json},
          ${firstTryCorrect}, ${questionsAnswered}, ${xpEarned}
        )
        on conflict (user_id, lesson_id) do update set
          answered_json = ${json},
          first_try_correct = ${firstTryCorrect},
          questions_answered = ${questionsAnswered},
          xp_earned = ${xpEarned},
          updated_at = now()
      `;
    }

    const before = levelFromXp(profile.total_xp);
    if (xpAwarded) {
      await addXp(userId, lesson.skillId, xpAwarded);
      const kind = block.type === "scenario" || block.type === "challenge" ? "scenario" : "answer";
      await logActivity(userId, kind, lesson.title, xpAwarded);
    }
    const afterProfile = await sql<ProfileRow>`
      select user_id, total_xp, streak_days, last_active_date, is_pro, leaderboard_opt_out
      from jw_profiles where user_id = ${userId}
    `;
    const after = levelFromXp(afterProfile[0]?.total_xp ?? profile.total_xp);
    await bumpMission(userId, day, "questions", firstTry ? 1 : 0);
    if (prevMastery < 60 && mastery >= 60) {
      await bumpMission(userId, day, "weak", 1);
    }
    const newAchievements = await unlockAchievements(userId);
    const remedial =
      failStreak >= 2 ? lessonForConcept(block.conceptId)?.id ?? null : null;

    return {
      ok: true as const,
      correct: result.correct,
      explanation: result.explanation,
      xpAwarded,
      alreadyAnswered: Boolean(already),
      mastery,
      failStreak,
      remedialLessonId: remedial,
      conceptId: block.conceptId,
      conceptName: conceptName(block.conceptId),
      stepResults: result.stepResults,
      levelUp: after.level > before.level ? after.level : null,
      newAchievements,
    };
  });

export const completeLesson = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { lessonId: string }) => input)
  .handler(async ({ context, data }) => {
    const lesson = getLesson(data.lessonId);
    if (!lesson) throw new Error("Unknown lesson");
    const sql = await getSql();
    const userId = context.userId;
    const day = todayISO();
    const profile = await ensureProfile(userId);
    await ensureMissions(userId, day);
    const rows = await sql<LessonRow>`
      select lesson_id, skill_id, current_block, completed, perfect, xp_earned,
             first_try_correct, questions_answered, answered_json
      from jw_lesson_progress where user_id = ${userId} and lesson_id = ${lesson.id}
    `;
    const row = rows[0];
    const qCount = countQuestions(lesson);
    const perfect = qCount > 0 && (row?.first_try_correct ?? 0) >= qCount;
    let bonus = 0;
    const alreadyDone = Boolean(row?.completed);
    await sql`
      insert into jw_lesson_progress (
        user_id, lesson_id, skill_id, completed, perfect, completed_at, current_block
      )
      values (
        ${userId}, ${lesson.id}, ${lesson.skillId}, true, ${perfect}, now(),
        ${lesson.blocks.length}
      )
      on conflict (user_id, lesson_id) do update set
        completed = true,
        perfect = excluded.perfect,
        completed_at = coalesce(jw_lesson_progress.completed_at, now()),
        current_block = ${lesson.blocks.length},
        updated_at = now()
    `;
    const streak = await touchStreak(userId, profile, day);
    const skill = getSkill(lesson.skillId);
    if (!alreadyDone && lesson.kind !== "trial") {
      bonus = XP.lessonComplete;
      await addXp(userId, lesson.skillId, XP.lessonComplete);
      await logActivity(userId, "lesson", lesson.title, XP.lessonComplete);
      if (perfect) {
        await addXp(userId, lesson.skillId, XP.perfectLesson);
        bonus += XP.perfectLesson;
        await logActivity(userId, "perfect", `Perfect · ${lesson.title}`, XP.perfectLesson);
      }
      if (skill && perfect) {
        const level = skill.levels.find((l) => l.id === lesson.levelId);
        if (level) {
          const levelRows = await sql<{ lesson_id: string; perfect: boolean; completed: boolean }>`
            select lesson_id, perfect, completed from jw_lesson_progress
            where user_id = ${userId} and skill_id = ${lesson.skillId}
          `;
          const byId = new Map(levelRows.map((r) => [r.lesson_id, r]));
          const levelPerfect = level.lessonIds.every((id) => {
            const r = byId.get(id);
            return Boolean(r?.completed && r.perfect);
          });
          if (levelPerfect) {
            await addXp(userId, lesson.skillId, XP.perfectLevel);
            bonus += XP.perfectLevel;
            await logActivity(userId, "perfect-level", `Perfect level · ${level.title}`, XP.perfectLevel);
          }
        }
      }
      await bumpMission(userId, day, "lesson", 1);
      if (lesson.kind === "daily") await bumpMission(userId, day, "daily", 1);
    }
    const newAchievements = await unlockAchievements(userId);
    const completedRows = await sql<{ lesson_id: string }>`
      select lesson_id from jw_lesson_progress
      where user_id = ${userId} and completed = true and skill_id = ${lesson.skillId}
    `;
    const completed = new Set(completedRows.map((r) => r.lesson_id));
    const next = skill ? nextLessonInSkill(skill, completed) : undefined;
    return {
      perfect,
      bonus,
      streak,
      newAchievements,
      nextLessonId: next?.id ?? null,
      nextLessonTitle: next?.title ?? null,
    };
  });

export const saveLessonCursor = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { lessonId: string; currentBlock: number }) => input)
  .handler(async ({ context, data }) => {
    const lesson = getLesson(data.lessonId);
    if (!lesson) return { ok: false as const };
    const sql = await getSql();
    await sql`
      insert into jw_lesson_progress (user_id, lesson_id, skill_id, current_block)
      values (${context.userId}, ${lesson.id}, ${lesson.skillId}, ${data.currentBlock})
      on conflict (user_id, lesson_id) do update set
        current_block = ${data.currentBlock},
        updated_at = now()
    `;
    return { ok: true as const };
  });

export async function applyClubEntitlement(opts: {
  userId?: string | null;
  customerId?: string | null;
  subscriptionId?: string | null;
  active: boolean;
}): Promise<void> {
  const sql = await getSql();
  let userId = opts.userId ?? null;
  if (!userId && opts.customerId) {
    const rows = await sql<{ user_id: string }>`
      select user_id from jw_profiles where stripe_customer_id = ${opts.customerId} limit 1
    `;
    userId = rows[0]?.user_id ?? null;
  }
  if (!userId) return;
  await ensureProfile(userId);
  await sql`
    update jw_profiles
    set is_pro = ${opts.active},
        stripe_customer_id = coalesce(${opts.customerId ?? null}, stripe_customer_id),
        stripe_subscription_id = ${opts.subscriptionId ?? null}
    where user_id = ${userId}
  `;
}

export const createClubCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((period: "monthly" | "yearly") => period)
  .handler(async ({ context, data: period }) => {
    const { appOrigin, clubPrices, getStripe } = await import("./stripe");
    const prices = clubPrices();
    const priceId = period === "yearly" ? prices.yearly : prices.monthly;
    if (!priceId) throw new Error("Club prices are not configured");
    const stripe = getStripe();
    const sql = await getSql();
    await ensureProfile(context.userId);
    const rows = await sql<{ stripe_customer_id: string | null }>`
      select stripe_customer_id from jw_profiles where user_id = ${context.userId}
    `;
    const origin = appOrigin();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/pricing?club=ok`,
      cancel_url: `${origin}/pricing?club=cancel`,
      client_reference_id: context.userId,
      customer: rows[0]?.stripe_customer_id || undefined,
      metadata: { userId: context.userId, product: "woods_club" },
      subscription_data: { metadata: { userId: context.userId, product: "woods_club" } },
      integration_identifier: `woodsclub${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`,
    });
    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return { url: session.url };
  });

export const createBillingPortal = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { appOrigin, getStripe } = await import("./stripe");
    const sql = await getSql();
    await ensureProfile(context.userId);
    const rows = await sql<{ stripe_customer_id: string | null }>`
      select stripe_customer_id from jw_profiles where user_id = ${context.userId}
    `;
    const customer = rows[0]?.stripe_customer_id;
    if (!customer) throw new Error("No billing customer yet");
    const stripe = getStripe();
    const portal = await stripe.billingPortal.sessions.create({
      customer,
      return_url: `${appOrigin()}/pricing`,
    });
    return { url: portal.url };
  });

export const setLeaderboardOptOut = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((optOut: boolean) => optOut)
  .handler(async ({ context, data: optOut }) => {
    const sql = await getSql();
    await ensureProfile(context.userId);
    await sql`
      update jw_profiles set leaderboard_opt_out = ${optOut} where user_id = ${context.userId}
    `;
    return { ok: true as const };
  });

export const getLeaderboard = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const sql = await getSql();
    const rows = await sql<{ user_id: string; xp: number }>`
      select a.user_id, coalesce(sum(a.xp), 0)::int as xp
      from jw_activity a
      join jw_profiles p on p.user_id = a.user_id
      where p.leaderboard_opt_out = false
        and a.created_at > now() - interval '7 days'
      group by a.user_id
      order by xp desc
      limit 20
    `;
    return rows.map((r, i) => ({
      rank: i + 1,
      userId: r.user_id,
      label: `Ranger ${r.user_id.slice(-4)}`,
      xp: r.xp,
    }));
  });

export const explainAnswer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { blockId: string; userAnswer: string }) => input)
  .handler(async ({ context, data }) => {
    const found = getBlock(data.blockId);
    if (!found) return { ok: false as const, error: "Unknown question" };
    const sql = await getSql();
    const profile = await ensureProfile(context.userId);
    if (!profile.is_pro) return { ok: false as const, error: "pro" };
    const day = todayISO();
    const usage = await sql<{ used: number }>`
      select used from jw_explain_usage where user_id = ${context.userId} and day = ${day}
    `;
    const used = usage[0]?.used ?? 0;
    if (used >= 8) return { ok: false as const, error: "limit" };
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "unavailable" };
    const { block, lesson } = found;
    const prompt = [
      "Explain this professional-skills practice question in plain language.",
      "Be concise (120 words). Do not mention being an AI.",
      `Skill lesson: ${lesson.title}`,
      `Question: ${"prompt" in block ? block.prompt : ""}`,
      `Learner answer: ${data.userAnswer}`,
      `Stored explanation: ${"explanation" in block ? block.explanation : ""}`,
      "If they were wrong, say why, then the rule to remember.",
    ].join("\n");
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 280,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) return { ok: false as const, error: "unavailable" };
    const body = (await res.json()) as { choices: { message: { content: string } }[] };
    const text = body.choices[0]?.message.content ?? "";
    await sql`
      insert into jw_explain_usage (user_id, day, used)
      values (${context.userId}, ${day}, 1)
      on conflict (user_id, day) do update set used = jw_explain_usage.used + 1
    `;
    return { ok: true as const, text };
  });

export { buildDailyLesson };
