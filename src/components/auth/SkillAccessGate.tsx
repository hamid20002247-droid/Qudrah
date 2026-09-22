"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { isSkillOpenWithoutAuth } from "@/lib/access";
import { useClientReady } from "@/components/ClientBody";
import { track } from "@/lib/analytics";

/**
 * Locked skills: real skill UI underneath, signup sheet on top
 * (same pattern as the mock exam gate).
 */
export function SkillAccessGate({
  skillId,
  children,
  skillTitle,
}: {
  skillId: string;
  children: React.ReactNode;
  skillTitle?: string;
}) {
  const ready = useClientReady();
  const { user, loading, configured, signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const free = isSkillOpenWithoutAuth(skillId);
  const guestLocked =
    configured && ready && !loading && !user && !free;

  useEffect(() => {
    if (guestLocked) track("skill_locked_view", { skill_id: skillId });
  }, [guestLocked, skillId]);

  if (!configured || free) {
    return <>{children}</>;
  }

  if (user) return <>{children}</>;

  // Auth still resolving — keep skill visible, no blank auth page
  if (!ready || loading) {
    return (
      <div className="relative min-h-[70vh]">
        <div className="pointer-events-none select-none" aria-hidden>
          {children}
        </div>
        <div
          className="pointer-events-none absolute inset-0 z-[60] bg-ink/25"
          aria-hidden
        />
      </div>
    );
  }

  const startGoogle = async () => {
    setError(null);
    setBusy(true);
    track("skill_gate_google_clicked", { skill_id: skillId });
    try {
      const err = await signInWithGoogle(`/skill/${skillId}`);
      if (err) setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div
        className="pointer-events-none min-h-[70vh] select-none"
        aria-hidden
        data-skill-gated="1"
      >
        {children}
      </div>

      <div className="fixed inset-0 z-[70] flex flex-col justify-end">
        <div
          className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
          aria-hidden
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="skill-gate-title"
          className="relative mx-auto w-full max-w-lg px-3 pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <div className="overflow-hidden rounded-[1.75rem] bg-white p-5 shadow-[0_-16px_50px_-20px_rgba(15,23,42,0.45)] ring-1 ring-slate-200/80">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />
            <p className="text-center text-[11px] font-bold tracking-wide text-teal-700">
              {skillTitle ?? "المهارة"}
            </p>
            <h2
              id="skill-gate-title"
              className="mt-1.5 text-center font-display text-[1.45rem] font-extrabold leading-snug text-ink"
            >
              المهارة جاهزة — سجّل لبدء التدريب
            </h2>
            <p className="mx-auto mt-2 max-w-[18rem] text-center text-sm leading-relaxed text-slate-500">
              تشوف المحتوى خلف هذه البطاقة. التسجيل بـ Google مجاني ويحفظ تقدّمك.
            </p>
            <button
              type="button"
              onClick={() => void startGoogle()}
              disabled={busy}
              className="mt-5 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-ink text-[15px] font-extrabold text-white transition hover:bg-slate-800 active:scale-[0.99] disabled:opacity-60"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                <GoogleMark />
              </span>
              {busy ? "لحظة…" : "سجّل دخولك مع Google"}
            </button>
            {error && (
              <p className="mt-3 text-center text-sm font-semibold text-rose-700">
                {error}
              </p>
            )}
            <Link
              href="/skills"
              className="mt-3 flex min-h-11 w-full items-center justify-center text-sm font-semibold text-slate-400"
              onClick={() =>
                track("skill_gate_back_skills", { skill_id: skillId })
              }
            >
              رجوع للتأسيس
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function GoogleMark() {
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
