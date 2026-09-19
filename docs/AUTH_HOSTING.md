# Auth & hosting (Supabase + Vercel)

Production: **https://qodrah.vercel.app**  
Same Supabase project for local and production.

## What is hardcoded (public)

In `src/lib/publicConfig.ts`:

- Supabase project URL
- Supabase **anon** key (public by design; RLS protects rows)
- PostHog project API key (public by design; init is production-only)
- Production site URL constant (`https://qodrah.vercel.app`)

OAuth redirect uses `window.location.origin` with a path-only callback
(`…/auth/callback`). The post-login destination is kept in `sessionStorage`
so we never put `?next=` on the Supabase allow-list (that mismatch used to
fall back to Site URL = production and break localhost login).

## What stays secret (Vercel env only)

| Name | Required |
|------|----------|
| `SUPABASE_SERVICE_ROLE_KEY` | Yes — server admin / some API routes |
| `REVIEW_PIN` | Only if you use `/review` |
| `REVIEW_SESSION_SECRET` | Only if you use `/review` |
| `TELEGRAM_BOT_TOKEN` | Signup alerts — from @BotFather (never commit) |
| `TELEGRAM_CHAT_ID` | Your Telegram user id |
| `TELEGRAM_NOTIFY_SECRET` | Optional — protects `/api/telegram/signup` |

Do **not** put `service_role` in the client or in `publicConfig.ts`.

PostHog runs **only in production** on `https://qodrah.vercel.app`. Do not add localhost as an authorized domain. The SDK sends plain JSON to **`https://us.i.posthog.com`** (`disable_compression: true` — current posthog-js gzip-without-query is rejected by US ingest with 400). Persistence is **localStorage only** — no tracking cookies, no cookie banner, no session replay. Every event includes `auth_state` (`guest` | `signed_in`). No PostHog env vars are required on Vercel.

## Supabase Auth URLs

**Authentication → URL Configuration**

| Setting | Value |
|---------|--------|
| Site URL | `https://qodrah.vercel.app` |
| Redirect URLs | `https://qodrah.vercel.app/auth/callback` |
| | `http://localhost:3002/auth/callback` |
| | `http://localhost:3000/auth/callback` |
| | `http://localhost:3002/**` |
| | `http://localhost:3000/**` |

Also add `https://qodrah.vercel.app/**` if you use preview query paths.

## Google

1. Google Cloud → OAuth Web client  
2. Authorized redirect URI (Supabase, not Vercel):

   `https://nmfxftxqznewycnyxrrb.supabase.co/auth/v1/callback`

3. Authorized JavaScript origins (exact host spelling):
   - `https://qodrah.vercel.app` (not `qudrah`)
   - `http://localhost:3002`
4. Supabase → Authentication → Providers → Google → enable + Client ID/Secret

## Vercel

1. Domain / alias: `qodrah.vercel.app`
2. Env: `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_SITE_URL=https://qodrah.vercel.app`, plus Telegram vars if you want signup alerts
3. Redeploy after adding secrets

## Telegram signup alerts (100% free)

**Never commit the bot token** — GitHub secret scanning will block it. Put secrets on Vercel only.

1. [@BotFather](https://t.me/BotFather) → `/newbot` (or `/token` / `/revoke` to rotate)
2. Open your bot → **Start** once
3. Chat id from userinfobot (yours: `5750891377`)
4. Vercel → Settings → Environment Variables:

| Name | Value |
|------|--------|
| `TELEGRAM_BOT_TOKEN` | from BotFather |
| `TELEGRAM_CHAT_ID` | `5750891377` |
| `TELEGRAM_NOTIFY_SECRET` | any long random string |

5. Redeploy. New Google signups send: name, email, city/country.

