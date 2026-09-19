import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import {
  isLikelyNewSignup,
  resolveSignupLocation,
  sendTelegramSignupAlert,
} from "@/lib/telegram";

/**
 * OAuth return — exchange code, then hand off to /auth/continue.
 * New signups also fire a free Telegram alert (name, email, city/country).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServer();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user && isLikelyNewSignup(user.created_at)) {
            const meta = user.user_metadata ?? {};
            const loc = await resolveSignupLocation(request);
            await sendTelegramSignupAlert({
              email: user.email,
              name:
                (meta.full_name as string | undefined) ||
                (meta.name as string | undefined) ||
                null,
              provider:
                (user.app_metadata?.provider as string | undefined) ??
                "google",
              userId: user.id,
              city: loc.city,
              country: loc.country,
            });
          }
        } catch (err) {
          console.error("[telegram] signup alert skipped", err);
        }
        return NextResponse.redirect(`${origin}/auth/continue`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=auth`);
}
