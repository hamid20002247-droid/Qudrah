"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { SKILL_FIELDS } from "@/content/catalog/fields";
import { buildHomePlan } from "@/lib/homePlan";
import { PRODUCT_FACTS } from "@/lib/next-action";
import { track } from "@/lib/analytics";
import { useProgress } from "@/store/progress";

function firstName(displayName: string): string {
  const t = displayName.trim();
  if (!t) return "";
  return t.split(/\s+/)[0] ?? t;
}

export function HomeDashboard() {
  const { displayName } = useAuth();
  const getSkillProgress = useProgress((s) => s.getSkillProgress);
  const streakDays = useProgress((s) => s.streakDays);
  const daysUntilTest = useProgress((s) => s.daysUntilTest);
  const bestMockScore = useProgress((s) => s.bestMockScore);
  const lastMock = useProgress((s) => s.lastMock);

  const plan = useMemo(
    () =>
      buildHomePlan({
        getProgress: getSkillProgress,
        streakDays,
        daysToExam: daysUntilTest(),
        bestMockScore,
        lastMock,
      }),
    [getSkillProgress, streakDays, daysUntilTest, bestMockScore, lastMock]
  );

  const name = firstName(displayName);
  const pct =
    plan.stats.total > 0
      ? Math.round((plan.stats.completed / plan.stats.total) * 100)
      : 0;

  const primaryIsMock = plan.primaryHref.startsWith("/mock");
  const skillHref = primaryIsMock
    ? plan.secondaryHref ?? "/skills"
    : plan.primaryHref;
  const skillLabel = primaryIsMock
    ? plan.secondaryLabel ?? "تدرّب على مهارة"
    : plan.primaryLabel;
  const mockLabel =
    plan.stats.bestMockScore != null ? "اختبار جديد" : "ادخل الاختبار";

  return (
    <div className="mx-auto w-full max-w-lg overflow-x-hidden">
      {/* First 5 seconds — same product story + two doors */}
      <section className="relative overflow-hidden px-4 pb-8 pt-5">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 100% 65% at 50% -15%, rgba(13,148,136,0.26), transparent 55%), linear-gradient(180deg, #ECFDF8 0%, #F8FAFC 52%, #FFFFFF 100%)",
          }}
          aria-hidden
        />

        <div className="animate-fade-up">
          <p className="text-[13px] font-semibold text-slate-500">
            {name ? `مرحباً، ${name}` : "مرحباً بك"}
          </p>
          <p className="mt-2 font-display text-[2.35rem] font-extrabold leading-none tracking-tight text-teal-800">
            قُدرة
          </p>
          <h1 className="mt-2.5 text-[1.45rem] font-extrabold leading-snug text-ink">
            اختبار قدرات كمي
          </h1>
          <p className="mt-1.5 max-w-[21rem] text-[14px] leading-relaxed text-slate-600">
            {plan.support}
          </p>
        </div>

        {/* Always: mock + skills — mock emphasized (what students seek) */}
        <div
          className="animate-fade-up mt-6 space-y-2.5"
          style={{ animationDelay: "90ms" }}
        >
          <Link
            href="/mock"
            onClick={() =>
              track("home_primary_cta", { stage: plan.stage, href: "/mock" })
            }
            className="flex min-h-[3.6rem] w-full flex-col items-center justify-center rounded-2xl bg-ink text-white shadow-[0_18px_44px_-20px_rgba(15,23,42,0.55)] transition hover:bg-slate-800 active:scale-[0.99]"
          >
            <span className="text-base font-extrabold leading-none">
              {mockLabel}
            </span>
            <span
              className="mt-1 text-[11px] font-bold text-slate-400"
              dir="ltr"
            >
              {plan.stats.bestMockScore != null
                ? `أفضل نتيجة ${plan.stats.bestMockScore}/${plan.stats.lastMockTotal ?? 60}`
                : `${PRODUCT_FACTS.mockQuestions} سؤال · ${PRODUCT_FACTS.mockMinutes} دقيقة`}
            </span>
          </Link>
          <Link
            href={skillHref}
            onClick={() =>
              track("home_primary_cta", {
                stage: plan.stage,
                href: skillHref,
              })
            }
            className="flex min-h-[3.35rem] w-full items-center justify-center rounded-2xl bg-teal-600 text-base font-extrabold text-white shadow-lg shadow-teal-600/25 transition hover:bg-teal-700 active:scale-[0.99]"
          >
            {skillLabel}
          </Link>
        </div>

        {/* One quiet progress line — not a stats dashboard */}
        <div
          className="animate-fade-up mt-6"
          style={{ animationDelay: "140ms" }}
        >
          <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold">
            <span className="text-slate-500">مسار المهارات</span>
            <span className="tabular-nums text-teal-700" dir="ltr">
              {plan.stats.completed}/{plan.stats.total} · {pct}٪
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-l from-teal-500 to-teal-700 transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          {plan.stats.daysToExam != null && plan.stats.daysToExam >= 0 && (
            <p className="mt-2 text-center text-[11px] font-semibold text-amber-800">
              {plan.stats.daysToExam === 0
                ? "اختبارك اليوم — ادخل الاختبار أولاً"
                : `${plan.stats.daysToExam} يوماً لاختبارك`}
            </p>
          )}
        </div>
      </section>

      <section className="space-y-6 border-t border-slate-100 px-4 py-8">
        {/* Twin doors again — scannable */}
        <div className="grid grid-cols-2 gap-2.5">
          <Link
            href="/mock"
            className="flex min-h-[6.75rem] flex-col justify-between rounded-[1.35rem] bg-ink p-4 text-white transition active:scale-[0.99]"
          >
            <span className="text-[11px] font-bold text-teal-300">الاختبار</span>
            <span>
              <span className="block font-display text-base font-extrabold leading-snug">
                ادخل الآن
              </span>
              <span className="mt-1 block text-[11px] font-semibold text-slate-400">
                أسئلة جديدة كل مرة
              </span>
            </span>
          </Link>
          <Link
            href="/skills"
            className="flex min-h-[6.75rem] flex-col justify-between rounded-[1.35rem] bg-teal-700 p-4 text-white transition active:scale-[0.99]"
          >
            <span className="text-[11px] font-bold text-teal-200">المهارات</span>
            <span>
              <span className="block font-display text-base font-extrabold leading-snug">
                ارفع درجتك
              </span>
              <span className="mt-1 block text-[11px] font-semibold text-teal-100/80">
                {PRODUCT_FACTS.skills} مهارة · {PRODUCT_FACTS.fields} مجالات
              </span>
            </span>
          </Link>
        </div>

        {plan.upcoming.length > 0 && (
          <div>
            <p className="text-xs font-bold text-teal-700">بعدها في المسار</p>
            <ul className="mt-3 space-y-2">
              {plan.upcoming.map((s, i) => (
                <li key={s.id}>
                  <Link
                    href={`/skill/${s.id}`}
                    className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-100 transition hover:ring-teal-200 active:scale-[0.99]"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-sm font-extrabold tabular-nums text-teal-800">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-semibold text-slate-400">
                        {s.field_ar}
                      </span>
                      <span className="block truncate font-bold text-ink">
                        {s.title_ar}
                      </span>
                    </span>
                    <span className="text-teal-600" aria-hidden>
                      ←
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <div className="flex items-end justify-between gap-2">
            <p className="text-xs font-bold text-teal-700">المجالات</p>
            <Link href="/skills" className="text-sm font-bold text-teal-700">
              الكل ←
            </Link>
          </div>
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SKILL_FIELDS.map((field) => (
              <li key={field.id}>
                <Link
                  href={`/skills?field=${field.id}`}
                  className="flex min-h-[4.25rem] items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-white transition active:scale-[0.99]"
                  style={{
                    background: `linear-gradient(135deg, ${field.accent.from}, ${field.accent.to})`,
                  }}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-lg font-extrabold ring-1 ring-white/20">
                    {field.mark}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold">{field.title_ar}</span>
                    <span className="block truncate text-xs text-white/75">
                      {field.share_label} · {field.skills.length} مهارة
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
