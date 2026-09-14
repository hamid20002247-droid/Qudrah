# Auth & hosting (Supabase + Vercel)

Production: **https://qudrah.vercel.app**  
Same Supabase project for local and production.

## What is hardcoded (public)

In `src/lib/publicConfig.ts`:

- Supabase project URL
- Supabase **anon** key (public by design; RLS protects rows)
- Production site URL constant

OAuth redirect uses `window.location.origin` / request `origin`, so local and prod both work.

## What stays secret (Vercel env only)

| Name | Required |
|------|----------|
| `SUPABASE_SERVICE_ROLE_KEY` | Yes — server admin / some API routes |
| `REVIEW_PIN` | Only if you use `/review` |
| `REVIEW_SESSION_SECRET` | Only if you use `/review` |

Do **not** put `service_role` in the client or in `publicConfig.ts`.

## Supabase Auth URLs

**Authentication → URL Configuration**

| Setting | Value |
|---------|--------|
| Site URL | `https://qudrah.vercel.app` |
| Redirect URLs | `https://qudrah.vercel.app/auth/callback` |
| | `http://localhost:3002/auth/callback` |
| | `http://localhost:3000/auth/callback` |

## Google

1. Google Cloud → OAuth Web client  
2. Authorized redirect URI (Supabase, not Vercel):

   `https://nmfxftxqznewycnyxrrb.supabase.co/auth/v1/callback`

3. Optional JS origins: `https://qudrah.vercel.app`, `http://localhost:3002`  
4. Supabase → Authentication → Providers → Google → enable + Client ID/Secret

## Vercel

1. Domain / alias: `qudrah.vercel.app`
2. Env: only `SUPABASE_SERVICE_ROLE_KEY` (+ review secrets if needed)
3. Redeploy after adding secrets
