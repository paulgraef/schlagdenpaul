# Schlag den Paul - Live Event Webapp

Production-ready v1 for a live game show with admin control, realtime sync, buzzer, scoreboard, soundboard, media control and game modules.

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui style component setup
- Framer Motion
- Lucide Icons
- Supabase (Auth/Postgres/Realtime/Storage ready)
- Zustand state store
- React Hook Form + Zod validation

## Quickstart

1. Install dependencies:

```bash
npm install
```

2. Configure env:

```bash
cp .env.example .env.local
```

3. Start dev server:

```bash
npm run dev
```

4. Open app:

- Landing: `http://localhost:3000/`
- Admin: `http://localhost:3000/admin`
- Buzzer: `http://localhost:3000/buzzer`
- Scoreboard: `http://localhost:3000/scoreboard`
- Public Current: `http://localhost:3000/public/current`

## Admin Login

- Default PIN: `1234` (set via `ADMIN_PIN`)

## Supabase Setup

Run migration + seed in your Supabase project:

- `supabase/migrations/202602280001_initial.sql`
- `supabase/seed/seed.sql`

Includes:

- all requested entities/tables
- indexes and update triggers
- `claim_buzzer` RPC for atomic first-press winner
- demo event with 2 teams and 15 games
- demo media/sound/memory/deutschland rounds

## Implemented Routes

- `/`
- `/admin`
- `/admin/games`
- `/admin/games/[gameId]`
- `/admin/soundboard`
- `/admin/media`
- `/buzzer`
- `/scoreboard`
- `/games/memory`
- `/games/deutschland`
- `/public/current`

## Realtime

- Local realtime: `BroadcastChannel`
- Optional Supabase realtime broadcast channel when env keys exist
- atomic buzzer claim prepared via Supabase RPC

## Project Structure

- `app/` routes and layouts
- `components/` UI, admin, game, public stage components
- `hooks/` Zustand and realtime/audio hooks
- `lib/` game-engine, supabase, services, validation, utilities
- `types/` domain and realtime types
- `config/` demo content and nav/sound configs
- `supabase/` migration + seed SQL
- `public/` placeholder media and placeholder sound assets

## Länderumrisse: PNG/JPG -> animierbare SVG

Lege deine Bilddateien hier ab:

`public/media/laenderumrisse/raw/`

Dann konvertieren:

```bash
npm run trace:laenderumrisse
```

Das Script erzeugt SVG-Dateien als `item-01.svg`, `item-02.svg`, ... in:

`public/media/laenderumrisse/`

Optional: Originalnamen behalten:

```bash
npm run trace:laenderumrisse:keep-names
```

Feintuning (optional):

```bash
node scripts/trace-laenderumrisse.cjs --threshold 180 --turd-size 10 --opt-tolerance 0.3
```
