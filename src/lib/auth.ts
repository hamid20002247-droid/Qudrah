import type { User } from "@supabase/supabase-js";

export type AuthProfile = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  provider: string | null;
};

export type AuthSessionState = {
  user: User | null;
  profile: AuthProfile | null;
  loading: boolean;
  configured: boolean;
};

export function displayNameFromUser(user: User | null): string {
  if (!user) return "";
  const meta = user.user_metadata ?? {};
  return (
    (meta.full_name as string | undefined) ||
    (meta.name as string | undefined) ||
    user.email?.split("@")[0] ||
    "حسابي"
  );
}

export function authErrorMessage(err: unknown): string {
  const msg =
    err && typeof err === "object" && "message" in err
      ? String((err as { message: string }).message)
      : String(err ?? "");

  const lower = msg.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "البريد أو كلمة المرور غير صحيحة.";
  }
  if (lower.includes("email not confirmed")) {
    return "فضلاً أكّد بريدك من الرابط اللي وصلك.";
  }
  if (lower.includes("user already registered")) {
    return "هذا البريد مسجّل مسبقاً. جرّب تسجيل الدخول.";
  }
  if (lower.includes("password should be at least")) {
    return "كلمة المرور لازم تكون ٦ أحرف على الأقل.";
  }
  if (lower.includes("unable to validate email")) {
    return "صيغة البريد غير صحيحة.";
  }
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return "محاولات كثيرة. انتظر شوية وجرّب مرة ثانية.";
  }
  if (lower.includes("network") || lower.includes("fetch")) {
    return "مشكلة في الاتصال. تأكد من الإنترنت وحاول مرة ثانية.";
  }
  return msg || "صار خطأ غير متوقع. حاول مرة ثانية.";
}
