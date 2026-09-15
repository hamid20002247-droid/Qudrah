"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { track } from "@/lib/analytics";

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.5-5.2l-6.2-5.2C29.3 35.4 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.5l.1.1 6.2 5.2C39.2 36.3 44 31 44 24c0-1.3-.1-2.5-.4-3.5z"
      />
    </svg>
  );
}

export function AuthForm() {
  const { configured, user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/";
  const savingResult = next.startsWith("/result");
  const openingSkill = next.startsWith("/skill/");
  const startingMock = next.startsWith("/mock");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    track("auth_page_view", { next });
  }, [next]);

  useEffect(() => {
    if (search.get("error") === "auth") {
      setError("ما اكتمل تسجيل الدخول. جرّب مرة ثانية.");
      track("auth_callback_error");
    }
  }, [search]);

  useEffect(() => {
    if (!loading && user) {
      router.replace(next);
    }
  }, [loading, user, next, router]);

  async function onGoogle() {
    setError(null);
    setBusy(true);
    track("auth_google_clicked", { next });
    try {
      const err = await signInWithGoogle(next);
      if (err) setError(err);
    } finally {
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center">
        <p className="text-sm font-semibold text-amber-950">
          الحسابات غير مفعّلة في هذا البيئة.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex text-sm font-bold text-teal-800 underline"
        >
          الرجوع للرئيسية
        </Link>
      </div>
    );
  }

  if (loading || user) {
    return (
      <div className="flex h-48 items-center justify-center">
        <span className="h-10 w-10 animate-pulse rounded-full bg-teal-100" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-[0_28px_60px_-32px_rgba(15,118,110,0.45)] ring-1 ring-slate-200/70">
      <div className="relative overflow-hidden px-7 pb-10 pt-9 text-white">
        <div
          className="absolute inset-0 bg-gradient-to-bl from-teal-800 via-teal-600 to-cyan-600"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -start-16 top-0 h-56 w-56 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -end-10 bottom-0 h-40 w-40 rounded-full bg-cyan-300/20 blur-2xl"
          aria-hidden
        />
        <div className="relative">
          <p className="font-display text-4xl font-extrabold tracking-tight">
            قُدرة
          </p>
          <h1 className="mt-3 text-2xl font-extrabold leading-snug">
            {savingResult
              ? "احفظ درجتك"
              : startingMock
                ? "ابدأ الاختبار"
                : openingSkill
                  ? "افتح المهارة واحفظ تقدّمك"
                  : "احفظ تقدّمك"}
          </h1>
          <p className="mt-2 max-w-[17rem] text-sm leading-relaxed text-teal-50/90">
            {savingResult
              ? "درجتك على هذا الجهاز الآن. احفظها بحساب Google عشان ترجع لها من أي مكان."
              : startingMock
                ? "حساب Google يبدأ الاختبار ويحفظ درجتك — مجاناً، ثواني."
                : "حساب Google يحفظ مسار التدريب والنتيجة — مجاناً، ثواني."}
          </p>
        </div>
      </div>

      <div className="space-y-4 px-7 py-7">
        <button
          type="button"
          onClick={onGoogle}
          disabled={busy}
          className="flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-ink text-[15px] font-extrabold text-white transition hover:bg-slate-800 active:scale-[0.99] disabled:opacity-60"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
            <GoogleIcon />
          </span>
          {busy ? "لحظة…" : savingResult ? "احفظ درجتي مع Google" : "المتابعة مع Google"}
        </button>

        {error && (
          <p
            role="alert"
            className="rounded-xl bg-rose-50 px-3 py-2 text-center text-sm font-semibold text-rose-800"
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
