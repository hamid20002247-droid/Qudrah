# قُدرة (Qudrah)

Arabic-first, mobile web MVP for Saudi Qudurat **quantitative (arithmetic)** prep.

> افهم الحيلة بالتصوّر، وحُلّ أسرع — مو بالحفظ.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS v4 (RTL logical-friendly)
- KaTeX, Zustand, PostHog, Supabase (minimal)

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Set `REVIEW_PIN` in `.env.local` then visit `/review`.

## Screens

| Route | Purpose |
|-------|---------|
| `/` | Landing + live visual + teaser question |
| `/skills` | Arithmetic skills map |
| `/skill/[id]` | Visual → trick → timed drill |
| `/mock` | 12Q / 12min mini-mock |
| `/result` | Score + weak spots + notify me |
| `/auth` | Sign in / sign up + Google |
| `/about` | Brand + social handles |
| `/review` | PIN-gated draft review |

## Content

Skills live in `src/content/arithmetic/`. Mock pool in `src/content/mock/pool.ts`.
Only `review_status: "approved"` items appear publicly.

## Auth & Supabase

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.
4. Enable Email (+ Google if you want) and add redirect URLs — see [docs/AUTH_HOSTING.md](docs/AUTH_HOSTING.md).

Training works without login. Signed-in users sync progress to `user_progress`.

## Deploy

Vercel project name: `qudrah`. Domain target: `qudrah.app`.

Copy the same env vars into Vercel, then add the production Site URL and `/auth/callback` redirect in Supabase.

## Legal

قُدرة is independent of ETEC / Qiyas. Questions are original, modeled on public practice style — never leaked official items.
