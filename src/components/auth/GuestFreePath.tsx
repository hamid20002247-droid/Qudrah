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
import { PRODUCT_FACTS } from "@/lib/next-action";
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
        <FreeSteps path={path} tone="onDark" className="mt-3" />
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
        <p className="mb-3 text-[12px] leading-relaxed text-slate-600">
          جرّب هذه الثلاث الآن. باقي المهارات تُفتح لما تحفظ تقدّمك.
        </p>
        <FreeSteps path={path} tone="light" />
        <Link
          href={path.allDone ? "/mock" : path.nextHref}
          onClick={() => {
            if (!path.allDone) track("cta_start_clicked");
          }}
          className="mt-4 flex min-h-14 w-full items-center justify-center rounded-2xl bg-teal-600 text-base font-extrabold text-white shadow-xl shadow-teal-600/25"
        >
          {path.ctaLabel}
        </Link>
        {path.allDone ? (
          <p className="mt-2 text-center text-[11px] text-slate-500">
            جاهز للاختبار؟ ادخل 60 سؤالاً الآن
          </p>
        ) : (
          <p className="mt-2 text-center text-[11px] text-slate-500">
            الروابط مباشرة — بدون حساب
          </p>
        )}
      </div>
    );
  }

  // panel (default) — skills map / banners
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
            {path.allDone ? "ادخل الاختبار الآن" : "جرّب هذه المهارات الآن"}
          </p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-600 text-sm font-black text-white">
          {path.completedCount}/{path.total}
        </span>
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
        {path.allDone
          ? "الاختبار 60 سؤالاً مفتوح للتجربة — احفظ درجتك بعد التسليم."
          : `${PRODUCT_FACTS.skills} مهارة في المسار — ابدأ بهذه الثلاث.`}
      </p>
      <FreeSteps path={path} tone="light" className="mt-3" />
      <Link
        href={path.allDone ? "/mock" : path.nextHref}
        className={`mt-3 flex min-h-11 items-center justify-center rounded-2xl text-sm font-extrabold ${
          path.allDone
            ? "bg-ink text-white"
            : "bg-teal-600 text-white"
        }`}
      >
        {path.ctaLabel}
      </Link>
    </div>
  );
}

function FreeSteps({
  path,
  tone,
  className = "",
}: {
  path: FreePathState;
  tone: "light" | "onDark";
  className?: string;
}) {
  const onDark = tone === "onDark";
  return (
    <ol className={`space-y-2 ${className}`}>
      {path.items.map((item) => {
        const isDone = item.status === "done";
        const isFocus =
          item.status === "next" || item.status === "current";
        return (
          <li key={item.id}>
            <Link
              href={item.href}
              className={`flex items-start gap-3 rounded-2xl px-3 py-2.5 transition active:scale-[0.99] ${
                onDark
                  ? isFocus
                    ? "bg-white/15 ring-1 ring-white/25"
                    : "bg-black/15"
                  : isFocus
                    ? "bg-teal-50 ring-1 ring-teal-200"
                    : isDone
                      ? "bg-emerald-50/80 ring-1 ring-emerald-100"
                      : "bg-slate-50 ring-1 ring-slate-100"
              }`}
            >
              <span
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black ${
                  isDone
                    ? onDark
                      ? "bg-emerald-400 text-emerald-950"
                      : "bg-emerald-500 text-white"
                    : isFocus
                      ? onDark
                        ? "bg-white text-teal-800"
                        : "bg-teal-600 text-white"
                      : onDark
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 text-slate-600"
                }`}
              >
                {isDone ? "✓" : item.order}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={`flex flex-wrap items-center gap-2 text-sm font-bold ${
                    onDark ? "text-white" : "text-ink"
                  }`}
                >
                  {item.title_ar}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isDone
                        ? onDark
                          ? "bg-emerald-400/20 text-emerald-100"
                          : "bg-emerald-100 text-emerald-800"
                        : isFocus
                          ? onDark
                            ? "bg-white/20 text-white"
                            : "bg-teal-600 text-white"
                          : onDark
                            ? "bg-white/10 text-white/70"
                            : "bg-white text-slate-500 ring-1 ring-slate-200"
                    }`}
                  >
                    {isDone
                      ? "مكتملة"
                      : item.status === "current"
                        ? "أنت هنا"
                        : item.status === "next"
                          ? "التالي"
                          : "بدون حساب"}
                  </span>
                </span>
                <span
                  className={`mt-0.5 block text-[12px] leading-snug ${
                    onDark ? "text-white/70" : "text-slate-500"
                  }`}
                >
                  {item.hook_ar}
                </span>
              </span>
              <span
                className={`mt-1 text-sm ${
                  onDark ? "text-white/60" : "text-teal-700"
                }`}
              >
                ←
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
