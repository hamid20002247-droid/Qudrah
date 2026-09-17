import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

/**
 * OAuth return — exchange code, then send the browser to a tiny client
 * handoff page that reads the intended path from sessionStorage.
 * (Avoid ?next= on redirectTo: Supabase allow-list often rejects it and
 * falls back to Site URL = production.)
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServer();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}/auth/continue`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=auth`);
}
