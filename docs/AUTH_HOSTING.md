# Auth & hosting (Supabase + Vercel)

قُدرة works without an account (localStorage). Signing in unlocks cloud progress sync across devices.

## 1. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** → paste and run [`supabase/schema.sql`](../supabase/schema.sql).
3. **Project Settings → API**: copy Project URL, `anon` key, and `service_role` key into `.env.local` (see `.env.example`).

## 2. Auth providers

### Email / password

**Authentication → Providers → Email**

- Enable Email.
- For local testing you can disable “Confirm email”; for production keep it on.

**Authentication → URL Configuration**

| Setting | Local | Production |
|---------|-------|------------|
| Site URL | `http://localhost:3000` | `https://qudrah.app` (or your domain) |
| Redirect URLs | `http://localhost:3000/auth/callback` | `https://qudrah.app/auth/callback` |

Add both localhost and production redirect URLs so Google/email confirm work in both places.

### Google

1. [Google Cloud Console](https://console.cloud.google.com/) → create OAuth client (Web).
2. Authorized redirect URI must be the **Supabase callback**, not your app:

   `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

3. Supabase → **Authentication → Providers → Google** → paste Client ID + Secret → enable.
4. App redirect stays `/auth/callback` (configured under URL Configuration above).

## 3. Vercel

1. Import the repo; set env vars from `.env.example` (never commit real keys).
2. Mark `SUPABASE_SERVICE_ROLE_KEY` and `REVIEW_*` as sensitive.
3. Set `NEXT_PUBLIC_SITE_URL` to the production URL.
4. After the first deploy, add the production Site URL + Redirect URL in Supabase.

## 4. What the schema gives you

| Table | Purpose |
|-------|---------|
| `profiles` | Auto-created on signup (name, avatar, email) |
| `user_progress` | JSON snapshot of Zustand progress (RLS: own row only) |
| `attempts` | Optional future exam history |
| `notify_leads` / `questions_audit` | Existing MVP tables |

RLS is enabled: users can only read/write their own profile and progress.

## 5. App routes

| Route | Role |
|-------|------|
| `/auth` | Sign in / sign up + Continue with Google |
| `/auth/callback` | OAuth + email confirm exchange |
| Top bar **دخول** / avatar | Account menu + sign out |

Guests keep training offline-first; after login, local + cloud progress are merged (best scores kept).
