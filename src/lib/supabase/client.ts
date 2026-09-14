import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isSupabaseConfigured as configured,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
} from "@/lib/publicConfig";

let browserClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return configured();
}

/** Browser / client components — cookie session via @supabase/ssr */
export function createSupabaseBrowser(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!browserClient) {
    browserClient = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return browserClient;
}
