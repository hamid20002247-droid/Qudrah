"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { VisualRenderer } from "@/components/visuals/VisualRenderer";
import { ChoiceList } from "@/components/ui/ChoiceList";
import { GuestFreePath } from "@/components/auth/GuestFreePath";
import { HomeDashboard } from "@/components/landing/HomeDashboard";
import { useAuth } from "@/components/auth/AuthProvider";
import { LANDING_QUESTION } from "@/content/mock/pool";
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
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const engaged = useRef(false);
  const viewed = useRef(false);

  useEffect(() => {
    if (!ready || viewed.current) return;
    viewed.current = true;
    identifyDevice(deviceId);
    trackLandingView();
  }, [ready, deviceId]);

  const onVisual = () => {
    if (engaged.current) return;
    engaged.current = true;
    track("interactive_engaged");
  };

  const answer = (i: number) => {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
    track("landing_question_answered", {
      correct: i === LANDING_QUESTION.correct_index,
    });
  };

  const signedIn = ready && configured && !loading && Boolean(user);
  const guestPath =
    ready && configured && !loading && !user
      ? buildFreePathState(getSkillProgress)
      : null;
  const startHref = guestPath?.allDone
    ? "/auth"
    : guestPath?.nextHref ?? `/skill/${FREE_SKILL_ID}`;
  const startLabel = guestPath?.allDone
    ? "ادخل بحساب Google"
    : guestPath?.ctaLabel ?? "ابدأ الآن";

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
    <div className="mx-auto max-w-lg">
      {/* First viewport — one composition: brand, line, CTA */}
      <section className="relative overflow-hidden px-4 pb-8 pt-6">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 90% 60% at 70% -20%, rgba(13,148,136,0.22), transparent 55%), linear-gradient(180deg, #ECFDF5 0%, #F8FAFC 48%, #FFFFFF 100%)",
          }}
          aria-hidden
        />

        <p className="font-display text-[2.75rem] font-extrabold leading-none tracking-tight text-teal-800">
          قُدرة
        </p>
        <h1 className="mt-4 max-w-[18rem] text-[1.55rem] font-extrabold leading-snug text-ink">
          افهم النمط. حُلّ أسرع.
        </h1>
        <p className="mt-2 max-w-[20rem] text-[14px] leading-relaxed text-slate-600">
          {PRODUCT_FACTS.skills} مهارة كمي — تصوّر، اختصار، تدريب.
        </p>

        <Link
          href={startHref}
          onClick={() => track("cta_start_clicked")}
          className="mt-7 flex min-h-[3.5rem] w-full items-center justify-center rounded-2xl bg-teal-600 text-base font-extrabold text-white shadow-[0_16px_40px_-16px_rgba(13,148,136,0.65)] transition active:scale-[0.99]"
        >
          {startLabel}
        </Link>
        <Link
          href="/mock"
          onClick={() => track("landing_mock_cta")}
          className="mt-3 flex min-h-[3.25rem] w-full items-center justify-center rounded-2xl bg-ink text-base font-extrabold text-white shadow-[0_14px_36px_-18px_rgba(15,23,42,0.55)] transition active:scale-[0.99]"
        >
          المحاكاة الكاملة — 60 سؤالاً
        </Link>
        <p className="mt-2.5 text-center text-[11px] text-slate-500">
          {FREE_SKILL_COUNT} مهارات بدون حساب · المحاكاة بحساب Google — مجاناً
        </p>
      </section>

      {/* Compact free path — links only, no essay */}
      {guestPath && !guestPath.allDone && (
        <section className="border-t border-slate-100 px-4 py-6">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h2 className="text-base font-extrabold text-ink">جرّب الآن</h2>
            <span className="text-[11px] font-bold tabular-nums text-teal-700">
              {guestPath.completedCount}/{guestPath.total}
            </span>
          </div>
          <ul className="space-y-2">
            {guestPath.items.map((item) => {
              const skill = getSkillById(item.id);
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`flex min-h-[3.25rem] items-center gap-3 rounded-2xl px-3.5 py-2.5 transition active:scale-[0.99] ${
                      item.status === "done"
                        ? "bg-emerald-50 ring-1 ring-emerald-100"
                        : item.status === "next" || item.status === "current"
                          ? "bg-teal-600 text-white shadow-lg shadow-teal-600/25"
                          : "bg-white ring-1 ring-slate-200"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                        item.status === "done"
                          ? "bg-emerald-500 text-white"
                          : item.status === "next" || item.status === "current"
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.completed ? "✓" : item.order}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-sm font-extrabold ${
                          item.status === "next" || item.status === "current"
                            ? "text-white"
                            : "text-ink"
                        }`}
                      >
                        {skill?.title_ar ?? item.title_ar}
                      </span>
                    </span>
                    <span
                      className={`text-lg ${
                        item.status === "next" || item.status === "current"
                          ? "text-white/80"
                          : "text-teal-700"
                      }`}
                    >
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
        <section className="px-4 pb-4">
          <GuestFreePath variant="done" />
        </section>
      )}

      {/* Mock CTA early — see the exam exists */}
      <section className="border-t border-slate-100 px-4 py-6">
        <div className="overflow-hidden rounded-[1.75rem] bg-ink px-5 py-6 text-white">
          <p className="text-[11px] font-bold tracking-wide text-teal-300">
            محاكاة قدرات كمي
          </p>
          <h2 className="mt-2 font-display text-xl font-extrabold leading-snug">
            مثل يوم الاختبار
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            {PRODUCT_FACTS.mockQuestions} سؤالاً · {PRODUCT_FACTS.mockMinutes}{" "}
            دقيقة · أسئلة جديدة كل مرة.
          </p>
          <Link
            href="/mock"
            onClick={() => track("landing_mock_cta")}
            className="mt-5 flex min-h-14 items-center justify-center rounded-2xl bg-teal-500 text-base font-extrabold text-white transition hover:bg-teal-400 active:scale-[0.99]"
          >
            شوف المحاكاة الكاملة
          </Link>
          <p className="mt-2.5 text-center text-[11px] text-slate-400">
            ادخل بحساب Google عند البدء — مجاناً
          </p>
        </div>
      </section>

      <section className="space-y-8 border-t border-slate-100 px-4 py-8">
        <div>
          <h2 className="text-lg font-extrabold text-ink">جرّب التصوّر</h2>
          <p className="mt-1 text-sm text-slate-600">
            لماذا 80→100 = 25٪ وليس 20٪؟ اسحب وجرّب.
          </p>
          <div className="mt-4">
            <VisualRenderer
              spec={{ kind: "custom", component: "percent-change-lab" }}
              onInteract={onVisual}
              compact
            />
          </div>
          <Link
            href={`/skill/${FREE_SKILL_ID}`}
            className="mt-4 flex min-h-12 items-center justify-center rounded-2xl bg-teal-600 font-extrabold text-white"
          >
            افتح المهارة
          </Link>
        </div>

        <div>
          <h2 className="text-lg font-extrabold text-ink">سؤال سريع</h2>
          <p className="mt-3 text-[15px] font-bold leading-snug text-ink">
            {LANDING_QUESTION.prompt_ar}
          </p>
          <div className="mt-3">
            <ChoiceList
              choices={LANDING_QUESTION.choices_ar}
              selected={selected}
              correctIndex={LANDING_QUESTION.correct_index}
              showResult={revealed}
              onSelect={answer}
            />
          </div>
          {revealed && selected === LANDING_QUESTION.correct_index && (
            <p className="mt-3 text-sm font-semibold text-green-700">تمام.</p>
          )}
          {revealed && selected !== LANDING_QUESTION.correct_index && (
            <div className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-950 ring-1 ring-rose-100">
              <p className="font-bold">خطأ</p>
              <p className="mt-1 leading-relaxed">
                {selected !== null
                  ? LANDING_QUESTION.trap_explanations_ar[selected]
                  : ""}
              </p>
              <Link
                href={`/skill/${FREE_SKILL_ID}`}
                className="mt-2 inline-block font-bold text-teal-700"
              >
                افتح التصوّر ←
              </Link>
            </div>
          )}
        </div>

        <div className="rounded-[1.5rem] bg-white px-5 py-5 ring-1 ring-slate-200">
          <p className="text-base font-extrabold text-ink">كل المسار مجاني</p>
          <p className="mt-1 text-sm text-slate-600">
            {PRODUCT_FACTS.skills} مهارة + محاكاة — بحساب Google فقط.
          </p>
          <Link
            href="/auth"
            className="mt-4 flex min-h-12 items-center justify-center rounded-2xl bg-teal-600 font-extrabold text-white"
          >
            ادخل بحساب Google
          </Link>
        </div>
      </section>
    </div>
  );
}
