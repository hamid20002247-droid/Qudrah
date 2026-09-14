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

  return (
    <div className="mx-auto max-w-lg">
      {/* Hero — one job: tell them the next move */}
      <section className="relative overflow-hidden px-4 pb-8 pt-5">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 90% 60% at 100% -20%, rgba(13,148,136,0.22), transparent), linear-gradient(180deg, #ECFDF8 0%, #F8FAFC 50%, #FFFFFF 100%)",
          }}
        />

        <p className="text-[13px] font-semibold text-slate-500">
          {name ? `مرحباً، ${name}` : "مرحباً بك"}
        </p>
        <p className="mt-3 text-[11px] font-bold tracking-wide text-teal-700">
          {plan.eyebrow}
        </p>
        <h1 className="mt-1.5 font-display text-[1.85rem] font-extrabold leading-snug text-ink">
          {plan.headline}
        </h1>
        <p className="mt-2 max-w-[22rem] text-[15px] leading-relaxed text-slate-600">
          {plan.support}
        </p>

        <Link
          href={plan.primaryHref}
          onClick={() =>
            track("home_primary_cta", { stage: plan.stage, href: plan.primaryHref })
          }
          className="mt-6 flex min-h-14 w-full items-center justify-center rounded-2xl bg-teal-600 text-base font-extrabold text-white shadow-xl shadow-teal-600/25 transition hover:bg-teal-700 active:scale-[0.99]"
        >
          {plan.primaryLabel}
        </Link>
        {plan.secondaryHref && plan.secondaryLabel && (
          <Link
            href={plan.secondaryHref}
            className="mt-3 flex min-h-11 w-full items-center justify-center text-sm font-bold text-teal-800"
          >
            {plan.secondaryLabel}
          </Link>
        )}

        {/* Compact progress — not a dashboard strip of noise */}
        <div className="mt-7 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-white/90 px-3 py-3 text-center ring-1 ring-slate-100">
            <p className="font-display text-xl font-extrabold tabular-nums text-ink">
              {plan.stats.completed}
              <span className="text-sm font-bold text-slate-400">
                /{plan.stats.total}
              </span>
            </p>
            <p className="mt-0.5 text-[10px] font-semibold text-slate-500">
              مهارة مكتملة
            </p>
          </div>
          <div className="rounded-2xl bg-white/90 px-3 py-3 text-center ring-1 ring-slate-100">
            <p className="font-display text-xl font-extrabold tabular-nums text-ink">
              {pct}٪
            </p>
            <p className="mt-0.5 text-[10px] font-semibold text-slate-500">
              تقدّم المسار
            </p>
          </div>
          <div className="rounded-2xl bg-white/90 px-3 py-3 text-center ring-1 ring-slate-100">
            <p className="font-display text-xl font-extrabold tabular-nums text-ink">
              {plan.stats.daysToExam != null && plan.stats.daysToExam >= 0
                ? plan.stats.daysToExam
                : plan.stats.streakDays || "—"}
            </p>
            <p className="mt-0.5 text-[10px] font-semibold text-slate-500">
              {plan.stats.daysToExam != null && plan.stats.daysToExam >= 0
                ? "يوماً للاختبار"
                : "أيام استمرار"}
            </p>
          </div>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-l from-teal-500 to-teal-700 transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </section>

      <section className="space-y-5 border-t border-slate-100 px-4 py-8">
        {/* Upcoming path — orientation, not the same promo skill */}
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
                      <span className="mt-0.5 block truncate text-xs text-slate-500">
                        {s.hook_ar}
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

        {/* Mock card — always clear place on home */}
        <div className="overflow-hidden rounded-[1.75rem] bg-ink p-5 text-white shadow-[0_24px_50px_-28px_rgba(15,118,110,0.45)]">
          <p className="text-[11px] font-bold tracking-wide text-teal-300">
            محاكاة كمي
          </p>
          <p className="mt-1 font-display text-xl font-extrabold leading-snug">
            {plan.stats.bestMockScore != null
              ? `أفضل نتيجة: ${plan.stats.bestMockScore}/${plan.stats.lastMockTotal ?? 60}`
              : "اختبر مستواك بستين سؤالاً"}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
            كل محاولة = اختبار جديد بأسئلة جديدة
          </p>
          <Link
            href="/mock"
            className="mt-4 flex min-h-12 items-center justify-center rounded-xl bg-teal-500 font-bold text-white transition hover:bg-teal-400"
          >
            {plan.stats.bestMockScore != null
              ? "محاكاة جديدة"
              : "ابدأ المحاكاة"}
          </Link>
        </div>

        {/* Fields — browse without repeating the free-skill lab */}
        <div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-teal-700">المجالات</p>
              <p className="mt-0.5 text-sm text-slate-500">
                {PRODUCT_FACTS.fields} مجالات · {PRODUCT_FACTS.skills} مهارة
              </p>
            </div>
            <Link
              href="/skills"
              className="text-sm font-bold text-teal-700"
            >
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
