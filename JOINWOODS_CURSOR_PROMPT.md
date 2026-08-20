# Cursor prompt — finish JoinWoods

Paste everything below the line into Cursor (Agent / Composer) with this repo open.

---

You are finishing **JoinWoods**, a Codédex-inspired gamified professional-skills platform. Visual language is **codedex.io** (pixel-art lands, Pixelify Sans headings, Mulish body, gold CTAs on near-black). It is a **game world**, not an LMS. No certificates. No generic “course catalog” copy. Tone is sharp, specific, slightly cocky — like a briefing, not a textbook.

## Stack (do not change)

- TanStack Start (file routes, `src/router.tsx` named `getRouter`, `_app` layout)
- React 19 + Tailwind v4 tokens in `src/styles.css` (`--color-gold`, `--color-ink`, Pixelify Sans + Mulish)
- Better Auth at `/api/auth/*` (Google / X; optional email-password)
- Postgres via `getSql()` (`src/lib/db.ts`) — Neon when `DATABASE_URL` is set, else PGLite
- App tables in `migrations/0002_joinwoods.sql` (`jw_*`); do not edit `0001_auth.sql`
- Server functions: `createServerFn` + `authMiddleware`, input via `.validator()`
- Keep `src/components/preview-host-bridge.tsx` mounted in `__root.tsx`
- Keep `grokPwaPlugin()` / `server/middleware/grok-pwa.ts` / `public/__grok/` unless the user later asks to strip Grok chrome
- Dev: `npm run dev` (binds `0.0.0.0:8080`). `npm run typecheck` and `npm run build` must stay green

## Product — 12 live worlds

Categories: Data / Ops / Code / AI Worlds. All `live: true`. No SEO, finance, medical, VA, or generic business skills.

| slug | name | fantasy | category |
|---|---|---|---|
| power-bi | Power BI | THE DATA ANALYST | Data |
| tableau | Tableau | THE DATA DETECTIVE | Data |
| docker | Docker | THE CONTAINER ENGINEER | Ops |
| kubernetes | Kubernetes | THE SYSTEM OPERATOR | Ops |
| terraform | Terraform | THE INFRASTRUCTURE ARCHITECT | Ops |
| git | Git & GitHub | THE CODE TIME TRAVELLER | Code |
| typescript | TypeScript | THE CODE GUARDIAN | Code |
| game-dev | Game Development | THE GAME MAKER | Code |
| ai-video | AI Video | THE AI DIRECTOR | AI |
| n8n | n8n | THE AUTOMATION ENGINEER | AI |
| ai-agents | AI Agents | THE AGENT BUILDER | AI |
| comfyui | ComfyUI | THE AI WORKFLOW ARTIST | AI |

Content lives in `src/lib/content/worlds/*.ts` via `buildWorld()` (`src/lib/content/factory.ts`). Question builders: `mcq` `tf` `fill` `order` `match` `identify` `scenario` `challenge`.

### Hard content rules

- Pre-authored only. Never generate unique lessons per user with an LLM at runtime.
- Fully online / simulated. No certs. Docker / K8s / n8n / ComfyUI / Git are **simulated** with identify / order / scenario / challenge (no real Docker/K8s runtime).
- Game-dev stays question/scenario based unless you add a tiny canvas demo — do not stall the content pass on a full engine.
- First **30 minutes** of every world (trial + Level 01–02) must be the most polished teaching in that file.
- Real educational copy. No lorem, no “TODO”, no placeholder options like “Option A”.
- Power BI is the **quality bar**. Other worlds are thinner — thicken them toward that bar.

### World shape (target)

Each world:

1. **Trial** (`kind: "trial"`) — 2–5 min, no auth, stored on synthetic level `00`, **not** listed in `skill.levels` / WorldMap. Hook: a real mess. Score at the end: “YOU SCORED X%. You have the instincts. Now learn the skill.”
2. **8–10 levels**. Level 01 free. Later levels Club/Pro gated (`lesson.free` / `level.index === 1`).
3. Per level: 3–5 **missions** (`kind: "lesson"`), at least one **mini-project** (`kind: "project"`, ~100 XP via `challenge(..., "hard", XP.project)`), some mid-world **bosses** (`kind: "boss"`, 250 XP).
4. Final level `isBoss: true` — **Final Boss** `challenge` with `xp: 1000` (`XP.finalBoss`).
5. Concepts tagged `axis: "knowledge" | "execution" | "problem"`.

### XP (`src/lib/content/types.ts` `XP`)

easy 10 · medium 25 · hard 50 · scenario 50 · project 100 · boss 250 · finalBoss 1000 · lessonComplete 20 · perfectLevel 100 · dailyChallenge 50.

`completeLesson` in `src/lib/server/jw.ts` already awards +20 on finish and +100 if every lesson in the level is perfect. Do not double-dip project/boss XP on complete if the challenge block already paid it.

### Try-before-you-learn

- Public route: `src/routes/try.$slug.tsx` + `LessonPlayer trial`
- Local scoring via `checkAnswer` — **no DB, no auth**
- Skill cards (`tryFirst` on landing) link here
- After score → Start Level 1 (login if signed out)

### Daily loop (signed-in `/home`)

YOUR NEXT MOVE (skill + mission + minutes + XP) · WEAK AREA → `/practice/$conceptId` · DAILY CHALLENGE → `/learn/daily-{day}` · STREAK.

### UI chrome (keep Codédex, do not LMS-ify)

- Landing `/` — “START YOUR Skill Adventure”, 12 world cards with unique pixel-art banners
- `/explore` grouped by Data / Ops / Code / AI Worlds
- `/skills/$slug` — “The Legend of {Name}”, fantasy subtitle, WorldMap (Mission / Mini-project / Boss)
- `/learn/$lessonId` — LessonPlayer (explain / example / 8 question types / multi-step challenge)
- `/profile` — XP, streak, **mastery axes** (knowledge / execution / problem) via `skillAxes()`
- Banners: `src/lib/banners.ts` → `/public/images/worlds/{slug}.jpg`

## What is already done (do not rebuild)

- Factory + all 12 world files registered in `src/lib/content/index.ts` + `catalog.ts`
- Trial route, local trial grading, score screen
- XP, streaks, daily missions, achievements, Club fake-unlock (`unlockPro`)
- World pixel-art banners, `public/og.jpg`, `public/x-banner.jpg`, `src/lib/og/site.json` (`title: JoinWoods`, `type: x:game`, `card: custom`)
- Old SEO / finance / medical content **removed**
- `npm run typecheck` and `npm run build` were green on this snapshot

## What you must finish (priority order)

1. **Content density.** Power BI is ~22 missions / 9 levels (`worlds/power-bi.ts`, ~519 lines). The other 11 worlds are ~9–10 missions / ~230 lines. Expand each toward the spec: more missions per level, a real mini-project, a mid-boss, a 4-step final boss. Start with Level 01–02 of every world (the first 30 minutes). Use `buildWorld` — do not rewrite types.

2. **Teaching quality.** Every mission: short briefing (`teach`) + optional `example` + 3–6 questions that force a decision. Identify/order/scenario for tools that cannot run in-browser. Wrong answers must be plausible. Explanations teach the rule.

3. **World identity.** Keep fantasy names and taglines. World map chapter titles should feel like a game (e.g. “The Data Disaster”, “Desired State”, “The Jump That Didn’t Land”) not “Module 3: Introduction”.

4. **Codédex polish pass.** Match codedex.io: sticky pixel header, gold primary, blue secondary, land hero with “The Legend of … / Beginners Edition / Start”, mascot blurb, How to Play sidebar. Do not add purple SaaS gradients, emoji-as-icons, or Inter-on-white.

5. **Content lint.** Add a small node script or test that loads `liveSkills` and asserts: unique ids, `answer` in range, trial exists, final `kind: "boss"` + `isBoss`, Level 01 `free`, no empty `questions`, `challenge` steps ≥ 3 on bosses.

6. **Do not** add Stripe unless asked (Club is account-flag unlock). Do not add cert PDFs. Do not add LLM-generated per-user lessons. Do not reintroduce generic skills (VA, Excel-for-beginners, “soft skills”).

## Suggested first moves in this repo

```text
src/lib/content/factory.ts          DSL — read before editing worlds
src/lib/content/worlds/power-bi.ts  gold-standard world
src/lib/content/worlds/*.ts         expand these
src/components/lesson/player.tsx    player + trial scoring
src/components/skill/world-map.tsx  map labels
src/routes/try.$slug.tsx            public trial
src/routes/_app/home.tsx            daily loop
src/lib/server/jw.ts                XP / access / missions
```

After content expansion: `npm run typecheck` && `npm run build`. Manually play `/try/docker`, `/try/git`, `/try/ai-agents`, then Level 01 of Power BI while signed in.

Ship playable worlds, not a redesign.

---
