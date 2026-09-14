import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/publicConfig";

/**
 * Server-only client for API routes that previously used getSupabase().
 * Prefers service role; falls back to anon for local demos.
 */
export function getSupabase(): SupabaseClient | null {
  const admin = createSupabaseAdmin();
  if (admin) return admin;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
