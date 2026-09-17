"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { GuestFreePath } from "@/components/auth/GuestFreePath";
import { HomeDashboard } from "@/components/landing/HomeDashboard";
import { useAuth } from "@/components/auth/AuthProvider";
import { track, trackLandingView, identifyDevice } from "@/lib/analytics";
import { useProgress } from "@/store/progress";
import { PRODUCT_FACTS } from "@/lib/next-action";
import {
  buildFreePathState,
  FREE_SKILL_ID,
  FREE_SKILL_COUNT,
} from "@/lib/access";
import { useClientReady } from "@/components/ClientBody";
import { getSkillById } from "@/content/arithmetic";

export function LandingPage() {
  const ready = useClientReady();
  const { user, loading, configured } = useAuth();
  const deviceId = useProgress((s) => s.deviceId);
  const getSkillProgress = useProgress((s) => s.getSkillProgress);
  const viewed = useRef(false);

  useEffect(() => {
    if (!ready || viewed.current) return;
    viewed.current = true;
    identifyDevice(deviceId);
    trackLandingView();
  }, [ready, deviceId]);

  const signedIn = ready && configured && !loading && Boolean(user);
  const guestPath =
    ready && configured && !loading && !user
      ? buildFreePathState(getSkillProgress)
      : null;
  const skillHref = guestPath?.allDone
    ? "/skills"
    : guestPath?.nextHref ?? `/skill/${FREE_SKILL_ID}`;
  const skillLabel = guestPath?.allDone
    ? "خريطة المهارات"
    : guestPath?.ctaLabel ?? "تدرّب على مهارة";

  if (!ready || (configured && loading)) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-lg items-center justify-center px-4">
        <span className="h-12 w-12 animate-pulse rounded-full bg-teal-100" />
      </div>
    );
  }

  if (signedIn) {
    return <HomeDashboard />;
  }

  return (
    <div className="mx-auto w-full max-w-lg overflow-x-hidden">
      {/* First 5 seconds — brand + what this is + two doors */}
      <section className="relative overflow-hidden px-4 pb-28 pt-5">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 100% 70% at 50% -10%, rgba(13,148,136,0.28), transparent 55%), linear-gradient(180deg, #0F766E 0%, #115E59 28%, #F0FDFA 58%, #F8FAFC 100%)",
          }}
          aria-hidden
        />

        <div className="animate-fade-up">
          <p className="font-display text-[2.85rem] font-extrabold leading-none tracking-tight text-white drop-shadow-sm">
            قُدرة
          </p>
          <h1 className="mt-3 max-w-[17rem] text-[1.65rem] font-extrabold leading-snug text-white">
            اختبار قدرات كمي
          </h1>
          <p className="mt-2 max-w-[19rem] text-[14px] leading-relaxed text-teal-50/90">
            ادخل الاختبار الآن — أو تدرّب مهارة بمهارة لرفع درجتك.
          </p>
        </div>

        {/* Product visual: the exam itself */}
        <div
          className="animate-fade-up mt-6 overflow-hidden rounded-[1.75rem] bg-ink px-5 py-6 text-white shadow-[0_28px_60px_-28px_rgba(15,23,42,0.7)] ring-1 ring-white/10"
          style={{ animationDelay: "80ms" }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold tracking-wide text-teal-300">
                الاختبار الكامل
              </p>
              <p className="mt-1 font-display text-2xl font-extrabold leading-none tabular-nums" dir="ltr">
                {PRODUCT_FACTS.mockQuestions}
                <span className="text-base font-bold text-slate-400">
                  {" "}
                  سؤال
                </span>
              </p>
            </div>
            <div className="exam-pulse flex h-[4.75rem] w-[4.75rem] flex-col items-center justify-center rounded-full bg-teal-500/15 ring-2 ring-teal-400/50">
              <span className="text-[10px] font-bold text-teal-200">الوقت</span>
              <span
                className="font-display text-xl font-extrabold tabular-nums leading-none text-white"
                dir="ltr"
              >
                {PRODUCT_FACTS.mockMinutes}:00
              </span>
            </div>
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-300">
            أسئلة جديدة كل مرة · مؤقت واحد للاختبار كله
          </p>
        </div>

        {/* Always two CTAs — exam first (what students seek) */}
        <div
          className="animate-fade-up mt-5 space-y-2.5"
          style={{ animationDelay: "140ms" }}
        >
          <Link
            href="/mock"
            onClick={() => track("landing_mock_cta")}
            className="flex min-h-[3.6rem] w-full flex-col items-center justify-center rounded-2xl bg-teal-500 text-white shadow-[0_18px_40px_-16px_rgba(20,184,166,0.75)] transition hover:bg-teal-400 active:scale-[0.99]"
          >
            <span className="text-base font-extrabold leading-none">
              ادخل الاختبار
            </span>
            <span className="mt-1 text-[11px] font-bold text-teal-50/90" dir="ltr">
              {PRODUCT_FACTS.mockQuestions} سؤال · {PRODUCT_FACTS.mockMinutes}{" "}
              دقيقة
            </span>
          </Link>
          <Link
            href={skillHref}
            onClick={() => track("cta_start_clicked")}
            className="flex min-h-[3.35rem] w-full items-center justify-center rounded-2xl bg-white text-base font-extrabold text-ink shadow-sm ring-1 ring-slate-200/90 transition active:scale-[0.99]"
          >
            {skillLabel}
          </Link>
          <p className="pt-0.5 text-center text-[11px] font-semibold text-slate-500">
            {FREE_SKILL_COUNT} مهارات مفتوحة للتجربة الآن
          </p>
        </div>
      </section>

      {/* One glance — two jobs of the product */}
      <section className="px-4 pb-2">
        <div className="grid grid-cols-2 gap-2.5">
          <Link
            href="/mock"
            onClick={() => track("landing_mock_cta")}
            className="flex min-h-[7.5rem] flex-col justify-between rounded-[1.35rem] bg-ink p-4 text-white transition active:scale-[0.99]"
          >
            <span className="text-[11px] font-bold text-teal-300">الاختبار</span>
            <span>
              <span className="block font-display text-lg font-extrabold leading-snug">
                ادخل الآن
              </span>
              <span className="mt-1 block text-[11px] font-semibold text-slate-400">
                60 سؤال موقوت
              </span>
            </span>
          </Link>
          <Link
            href="/skills"
            className="flex min-h-[7.5rem] flex-col justify-between rounded-[1.35rem] bg-teal-700 p-4 text-white transition active:scale-[0.99]"
          >
            <span className="text-[11px] font-bold text-teal-200">المهارات</span>
            <span>
              <span className="block font-display text-lg font-extrabold leading-snug">
                ارفع درجتك
              </span>
              <span className="mt-1 block text-[11px] font-semibold text-teal-100/80">
                {PRODUCT_FACTS.skills} مهارة حيّة
              </span>
            </span>
          </Link>
        </div>
      </section>

      {/* Compact free trail — action only */}
      {guestPath && !guestPath.allDone && (
        <section className="px-4 py-7">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h2 className="text-base font-extrabold text-ink">جرّب بدون حساب</h2>
            <span className="text-[11px] font-bold tabular-nums text-teal-700" dir="ltr">
              {guestPath.completedCount}/{guestPath.total}
            </span>
          </div>
          <ul className="space-y-2">
            {guestPath.items.map((item) => {
              const skill = getSkillById(item.id);
              const hot =
                item.status === "next" || item.status === "current";
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`flex min-h-[3.15rem] items-center gap-3 rounded-2xl px-3.5 py-2.5 transition active:scale-[0.99] ${
                      item.status === "done"
                        ? "bg-emerald-50 ring-1 ring-emerald-100"
                        : hot
                          ? "bg-teal-600 text-white shadow-lg shadow-teal-600/25"
                          : "bg-white ring-1 ring-slate-200"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                        item.status === "done"
                          ? "bg-emerald-500 text-white"
                          : hot
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.completed ? "✓" : item.order}
                    </span>
                    <span
                      className={`min-w-0 flex-1 truncate text-sm font-extrabold ${
                        hot ? "text-white" : "text-ink"
                      }`}
                    >
                      {skill?.title_ar ?? item.title_ar}
                    </span>
                    <span className={hot ? "text-white/80" : "text-teal-700"}>
                      ←
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {guestPath?.allDone && (
        <section className="px-4 py-6">
          <GuestFreePath variant="done" />
        </section>
      )}

      {/* Soft close — save only after they have seen the product */}
      <section className="border-t border-slate-100 px-4 py-8">
        <p className="text-center text-sm font-bold text-slate-600">
          أعجبك المسار؟ احفظ تقدّمك على كل أجهزتك
        </p>
        <Link
          href="/auth"
          onClick={() => track("landing_save_progress_cta")}
          className="mt-4 flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 font-extrabold text-white transition hover:bg-slate-800 active:scale-[0.99]"
        >
          احفظ تقدّمي
        </Link>
      </section>
    </div>
  );
}
