import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdmin } from "@/lib/supabase/server";

/**
 * Server-only client for API routes that previously used getSupabase().
 * Prefers service role; falls back to anon for local demos.
 */
export function getSupabase(): SupabaseClient | null {
  const admin = createSupabaseAdmin();
  if (admin) return admin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
