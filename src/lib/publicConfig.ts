/**
 * Public app config — safe to ship in the client bundle.
 * Secrets (service role, review PIN) stay in process.env only.
 */

/** Production site on Vercel */
export const PRODUCTION_SITE_URL = "https://qudrah.vercel.app";

/** Same Supabase project for local + production */
export const SUPABASE_URL = "https://nmfxftxqznewycnyxrrb.supabase.co";

/** anon key — public by design; RLS protects data */
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tZnhmdHhxem5ld3ljbnl4cnJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzMTE4MDIsImV4cCI6MjEwNDg4NzgwMn0.7WAryWwzR7Vy5JJOAKCybGvUhack0PMSlLfbAn9s_4c";

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
