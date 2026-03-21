create extension if not exists pgcrypto;

create type event_status as enum ('draft', 'live', 'finished');
create type game_status as enum ('planned', 'active', 'completed');
create type game_type as enum (
  'standard',
  'media_laenderumrisse',
  'media_flaggen',
  'media_wer_luegt',
  'media_deutschland',
  'media_sortieren',
  'memory',
  'deutschland'
);
create type sound_category as enum ('Intro', 'Spannung', 'Konzentration', 'Buzzer', 'Erfolg', 'Fehler');
create type memory_status as enum ('idle', 'running', 'finished');

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status event_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  name text not null,
  color text not null,
  sort_order int not null default 1,
  created_at timestamptz not null default now(),
  unique (event_id, name)
);

create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  name text not null,
  nickname text,
  created_at timestamptz not null default now()
);

create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  title text not null,
  slug text not null,
  game_number int not null check (game_number between 1 and 15),
  point_value int not null check (point_value > 0),
  type game_type not null default 'standard',
  status game_status not null default 'planned',
  winner_team_id uuid references teams(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (event_id, game_number)
);

create table if not exists game_states (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  current_step int not null default 0,
  reveal_state boolean not null default false,
  timer_state jsonb not null default '{"running": false, "startedAt": null, "elapsedMs": 0}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (game_id)
);

create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  total_points int not null default 0,
  updated_at timestamptz not null default now(),
  unique (event_id, team_id)
);

create table if not exists buzzer_events (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  game_id uuid references games(id) on delete set null,
  team_id uuid not null references teams(id) on delete cascade,
  team_member_id uuid references team_members(id) on delete set null,
  pressed_at timestamptz not null default now(),
  is_winner boolean not null default false
);

create table if not exists media_items (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  title text not null,
  type text not null default 'image',
  asset_url text not null,
  sort_order int not null default 1,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists sound_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  title text not null,
  category sound_category not null,
  asset_url text not null,
  sort_order int not null default 1
);

create table if not exists memory_sessions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  game_id uuid references games(id) on delete set null,
  status memory_status not null default 'idle',
  board_state jsonb not null default '{}'::jsonb,
  turn_team_id uuid references teams(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists deutschland_rounds (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  title text not null,
  city_name text not null,
  correct_lat double precision,
  correct_lng double precision,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_games_event_number on games(event_id, game_number);
create index if not exists idx_media_game_sort on media_items(game_id, sort_order);
create index if not exists idx_buzzer_event_game on buzzer_events(event_id, game_id, pressed_at);
create index if not exists idx_scores_event on scores(event_id, total_points desc);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_game_states_updated_at on game_states;
create trigger trg_game_states_updated_at
before update on game_states
for each row
execute function set_updated_at();

drop trigger if exists trg_scores_updated_at on scores;
create trigger trg_scores_updated_at
before update on scores
for each row
execute function set_updated_at();

drop trigger if exists trg_memory_sessions_updated_at on memory_sessions;
create trigger trg_memory_sessions_updated_at
before update on memory_sessions
for each row
execute function set_updated_at();

create or replace function claim_buzzer(
  p_event_id uuid,
  p_game_id uuid default null,
  p_team_id uuid,
  p_team_member_id uuid default null
)
returns table(granted boolean, buzzer_event_id uuid, pressed_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_winner uuid;
  inserted_id uuid;
  now_ts timestamptz;
  lock_key bigint;
begin
  lock_key := ('x' || substr(md5(coalesce(p_event_id::text, '') || ':' || coalesce(p_game_id::text, '')), 1, 16))::bit(64)::bigint;
  perform pg_advisory_xact_lock(lock_key);

  select id
    into existing_winner
  from buzzer_events
  where event_id = p_event_id
    and is_winner = true
    and (
      (p_game_id is null and game_id is null)
      or game_id = p_game_id
    )
  order by pressed_at asc
  limit 1;

  if existing_winner is not null then
    return query
    select false, existing_winner, null::timestamptz;
    return;
  end if;

  now_ts := now();

  insert into buzzer_events (event_id, game_id, team_id, team_member_id, pressed_at, is_winner)
  values (p_event_id, p_game_id, p_team_id, p_team_member_id, now_ts, true)
  returning id into inserted_id;

  return query
  select true, inserted_id, now_ts;
end;
$$;

alter table events replica identity full;
alter table teams replica identity full;
alter table games replica identity full;
alter table game_states replica identity full;
alter table scores replica identity full;
alter table buzzer_events replica identity full;
alter table media_items replica identity full;
alter table memory_sessions replica identity full;

DO $$
BEGIN
  alter publication supabase_realtime add table
    events,
    teams,
    games,
    game_states,
    scores,
    buzzer_events,
    media_items,
    memory_sessions;
EXCEPTION
  WHEN duplicate_object THEN null;
END
$$;
