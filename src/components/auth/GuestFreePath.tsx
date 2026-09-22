"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useClientReady } from "@/components/ClientBody";
import {
  buildFreePathState,
  FREE_SKILL_COUNT,
  type FreePathState,
} from "@/lib/access";
import { track } from "@/lib/analytics";
import { useProgress } from "@/store/progress";

type Variant = "hero" | "panel" | "done";

type Props = {
  variant?: Variant;
  /** Highlight this skill as current (e.g. on skill page). */
  currentSkillId?: string | null;
  className?: string;
};

function useGuestFreePath(currentSkillId?: string | null): {
  show: boolean;
  path: FreePathState | null;
} {
  const ready = useClientReady();
  const { user, loading, configured } = useAuth();
  const getSkillProgress = useProgress((s) => s.getSkillProgress);

  if (!ready || !configured || loading || user) {
    return { show: false, path: null };
  }

  return {
    show: true,
    path: buildFreePathState(getSkillProgress, currentSkillId),
  };
}

/** Guest preview trail — open without account; everything else is free with Google. */
export function GuestFreePath({
  variant = "panel",
  currentSkillId = null,
  className = "",
}: Props) {
  const { show, path } = useGuestFreePath(currentSkillId);
  if (!show || !path) return null;

  if (variant === "done" && path.allDone) {
    return (
      <div
        className={`overflow-hidden rounded-[1.75rem] bg-ink px-5 py-6 text-white shadow-xl shadow-teal-900/20 ${className}`}
      >
        <p className="text-[11px] font-bold tracking-wide text-teal-300">
          كل شيء مجاني
        </p>
        <h2 className="mt-2 font-display text-2xl font-extrabold leading-snug">
          أكملت تجربة بدون حساب
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          جاهز للاختبار الكامل؟ ادخل 60 سؤالاً الآن، واحفظ درجتك بعد التسليم.
        </p>
        <Link
          href="/mock"
          className="mt-5 flex min-h-14 items-center justify-center rounded-2xl bg-teal-500 text-base font-extrabold text-white transition hover:bg-teal-400"
        >
          ادخل الاختبار
        </Link>
      </div>
    );
  }

  if (variant === "done" && path.nextId) {
    const next = path.items.find((x) => x.id === path.nextId);
    return (
      <div
        className={`overflow-hidden rounded-[1.75rem] bg-gradient-to-bl from-teal-800 via-teal-700 to-cyan-700 p-5 text-white shadow-lg shadow-teal-800/25 ${className}`}
      >
        <p className="text-[11px] font-bold text-teal-100">
          بدون حساب · {path.completedCount} من {path.total}
        </p>
        <h2 className="mt-1.5 text-xl font-extrabold leading-snug">
          جاهز للمهارة التالية؟
        </h2>
        <p className="mt-1.5 text-sm text-teal-50/90">
          {next
            ? `${next.order}. ${next.title_ar} — ${next.hook_ar}`
            : path.ctaLabel}
        </p>
        <Link
          href={path.nextHref}
          className="mt-4 flex min-h-12 items-center justify-center rounded-2xl bg-white text-sm font-extrabold text-teal-900"
        >
          افتح المهارة التالية
        </Link>
        <p className="mt-3 text-center text-[11px] text-teal-100/80">
          باقي المهارات تُفتح بعد ما تحفظ تقدّمك
        </p>
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <div className={className}>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold tracking-[0.14em] text-teal-700">
              تجربة بدون حساب
            </p>
            <h2 className="mt-1 font-display text-xl font-extrabold text-ink">
              ابدأ بـ {FREE_SKILL_COUNT} بدون حساب
            </h2>
          </div>
          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-extrabold tabular-nums text-teal-800 ring-1 ring-teal-100">
            {path.completedCount}/{path.total}
          </span>
        </div>
        <Link
          href={path.allDone ? "/mock" : path.nextHref}
          onClick={() => {
            if (!path.allDone) track("cta_start_clicked");
          }}
          className="mt-1 flex min-h-14 w-full items-center justify-center rounded-2xl bg-teal-600 text-base font-extrabold text-white shadow-xl shadow-teal-600/25"
        >
          {path.ctaLabel}
        </Link>
      </div>
    );
  }

  // panel — compact CTA only (no skill list — labs live in HomeSkillShowcase)
  return (
    <div
      className={`overflow-hidden rounded-[1.75rem] bg-white p-4 ring-1 ring-teal-100 ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold text-teal-700">
            {path.allDone
              ? "التجربة بدون حساب اكتملت"
              : `بدون حساب · ${path.completedCount} من ${path.total}`}
          </p>
          <p className="mt-0.5 text-base font-extrabold text-ink">
            {path.allDone ? "ادخل الاختبار الآن" : "ثلاث محاكاة مجانية"}
          </p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-600 text-sm font-black text-white">
          {path.completedCount}/{path.total}
        </span>
      </div>
      <Link
        href={path.allDone ? "/mock" : path.nextHref}
        className={`mt-4 flex min-h-12 items-center justify-center rounded-2xl text-sm font-extrabold ${
          path.allDone ? "bg-ink text-white" : "bg-teal-600 text-white"
        }`}
      >
        {path.ctaLabel}
      </Link>
    </div>
  );
}
