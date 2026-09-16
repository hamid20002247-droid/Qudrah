# Auth & hosting (Supabase + Vercel)

Production: **https://qodrah.vercel.app**  
Same Supabase project for local and production.

## What is hardcoded (public)

In `src/lib/publicConfig.ts`:

- Supabase project URL
- Supabase **anon** key (public by design; RLS protects rows)
- PostHog project API key (public by design; init is production-only)
- Production site URL constant (`https://qodrah.vercel.app`)

OAuth redirect uses `window.location.origin` / request `origin`, so local and prod both work.

## What stays secret (Vercel env only)

| Name | Required |
|------|----------|
| `SUPABASE_SERVICE_ROLE_KEY` | Yes — server admin / some API routes |
| `REVIEW_PIN` | Only if you use `/review` |
| `REVIEW_SESSION_SECRET` | Only if you use `/review` |

Do **not** put `service_role` in the client or in `publicConfig.ts`.

PostHog runs **only in production** on `https://qodrah.vercel.app`. Do not add localhost as an authorized domain. The SDK sends to **`https://us.i.posthog.com` directly** (Vercel `/ingest` proxies corrupt gzip capture bodies and return 400). Persistence is **localStorage only** — no tracking cookies, no cookie banner, no session replay (saves free-tier quota). Every event includes `auth_state` (`guest` | `signed_in`). No PostHog env vars are required on Vercel.

## Supabase Auth URLs

**Authentication → URL Configuration**

| Setting | Value |
|---------|--------|
| Site URL | `https://qodrah.vercel.app` |
| Redirect URLs | `https://qodrah.vercel.app/auth/callback` |
| | `http://localhost:3002/auth/callback` |
| | `http://localhost:3000/auth/callback` |

## Google

1. Google Cloud → OAuth Web client  
2. Authorized redirect URI (Supabase, not Vercel):

   `https://nmfxftxqznewycnyxrrb.supabase.co/auth/v1/callback`

3. Optional JS origins: `https://qodrah.vercel.app`, `http://localhost:3002`  
4. Supabase → Authentication → Providers → Google → enable + Client ID/Secret

## Vercel

1. Domain / alias: `qodrah.vercel.app`
2. Env: `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_SITE_URL=https://qodrah.vercel.app`
3. Redeploy after adding secrets
