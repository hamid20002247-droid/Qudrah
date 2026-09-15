/**
 * Public app config — safe to ship in the client bundle.
 * Secrets (service role, review PIN) stay in process.env only.
 */

/** Canonical production host — the live app, not the similarly-named Vercel typo. */
export const PRODUCTION_SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://qodrah.vercel.app"
).replace(/\/$/, "");

/** Same Supabase project for local + production */
export const SUPABASE_URL = "https://nmfxftxqznewycnyxrrb.supabase.co";

/** anon key — public by design; RLS protects data */
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tZnhmdHhxem5ld3ljbnl4cnJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzMTE4MDIsImV4cCI6MjEwNDg4NzgwMn0.7WAryWwzR7Vy5JJOAKCybGvUhack0PMSlLfbAn9s_4c";

/** PostHog project API key — public by design; production only */
export const POSTHOG_KEY =
  process.env.NEXT_PUBLIC_POSTHOG_KEY ||
  "phc_so3nmx6zbSWzm83Naem2hPDopSADfDYVGdhZ2bA4mcSP";

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
