create table if not exists jw_profiles (
  user_id text primary key,
  total_xp integer not null default 0,
  streak_days integer not null default 0,
  last_active_date date,
  is_pro boolean not null default false,
  leaderboard_opt_out boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists jw_skill_progress (
  user_id text not null,
  skill_id text not null,
  xp integer not null default 0,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, skill_id)
);
create index if not exists jw_skill_progress_user_idx on jw_skill_progress (user_id);

create table if not exists jw_lesson_progress (
  user_id text not null,
  lesson_id text not null,
  skill_id text not null,
  current_block integer not null default 0,
  completed boolean not null default false,
  perfect boolean not null default false,
  xp_earned integer not null default 0,
  first_try_correct integer not null default 0,
  questions_answered integer not null default 0,
  answered_json text not null default '[]',
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
create index if not exists jw_lesson_progress_user_idx on jw_lesson_progress (user_id);

create table if not exists jw_concept_mastery (
  user_id text not null,
  concept_id text not null,
  skill_id text not null,
  mastery integer not null default 0,
  attempts integer not null default 0,
  correct integer not null default 0,
  fail_streak integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, concept_id)
);
create index if not exists jw_concept_mastery_user_idx on jw_concept_mastery (user_id);

create table if not exists jw_daily_missions (
  user_id text not null,
  day date not null,
  mission_id text not null,
  progress integer not null default 0,
  target integer not null default 1,
  completed boolean not null default false,
  xp_awarded integer not null default 0,
  primary key (user_id, day, mission_id)
);

create table if not exists jw_achievements (
  user_id text not null,
  achievement_id text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create table if not exists jw_activity (
  id serial primary key,
  user_id text not null,
  kind text not null,
  label text not null,
  xp integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists jw_activity_user_idx on jw_activity (user_id, created_at desc);

create table if not exists jw_explain_usage (
  user_id text not null,
  day date not null,
  used integer not null default 0,
  primary key (user_id, day)
);
