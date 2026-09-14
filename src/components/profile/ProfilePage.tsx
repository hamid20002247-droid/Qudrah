"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { nameInitial } from "@/components/auth/AccountMenu";
import { ALL_SKILLS } from "@/content/arithmetic";
import { filterApprovedSkills } from "@/lib/content";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { useProgress } from "@/store/progress";

function formatPct(ratio: number | null | undefined): string {
  if (ratio == null) return "—";
  return `${Math.round(ratio * 100)}٪`;
}

function formatDayAr(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("ar-SA", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso + "T12:00:00"));
  } catch {
    return iso;
  }
}

export function ProfilePage() {
  const router = useRouter();
  const { user, loading, configured, displayName } = useAuth();
  const getSkillProgress = useProgress((s) => s.getSkillProgress);
  const streakDays = useProgress((s) => s.streakDays);
  const bestMockScore = useProgress((s) => s.bestMockScore);
  const lastMock = useProgress((s) => s.lastMock);
  const testDate = useProgress((s) => s.testDate);
  const setTestDate = useProgress((s) => s.setTestDate);
  const daysUntilTest = useProgress((s) => s.daysUntilTest);
  const days = daysUntilTest();
  const [dateInput, setDateInput] = useState("");
  const [dateSaved, setDateSaved] = useState(false);
  const [savingDate, setSavingDate] = useState(false);

  useEffect(() => {
    setDateInput(testDate ?? "");
  }, [testDate]);

  useEffect(() => {
    if (!loading && configured && !user) {
      router.replace("/auth?next=/profile");
    }
  }, [loading, configured, user, router]);

  async function saveExamDate() {
    setSavingDate(true);
    setDateSaved(false);
    const value = dateInput || null;
    setTestDate(value);
    const supabase = createSupabaseBrowser();
    if (supabase && user) {
      await supabase
        .from("profiles")
        .update({ test_date: value, updated_at: new Date().toISOString() })
        .eq("id", user.id);
    }
    setSavingDate(false);
    setDateSaved(true);
  }

  if (!configured || loading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="h-12 w-12 animate-pulse rounded-full bg-teal-100" />
      </div>
    );
  }

  const skills = filterApprovedSkills(ALL_SKILLS, false);
  const startedSkills = skills.filter((s) => getSkillProgress(s.id).started);
  const completedCount = skills.filter(
    (s) => getSkillProgress(s.id).completed
  ).length;

  const scoreSamples = startedSkills
    .map((s) => getSkillProgress(s.id).bestScore)
    .filter((n) => n > 0);
  const avgBest =
    scoreSamples.length > 0
      ? scoreSamples.reduce((a, b) => a + b, 0) / scoreSamples.length
      : null;

  const lastScores = startedSkills
    .map((s) => getSkillProgress(s.id).lastScore)
    .filter((n): n is number => n != null);
  const avgLast =
    lastScores.length > 0
      ? lastScores.reduce((a, b) => a + b, 0) / lastScores.length
      : null;

  const initial = nameInitial(displayName);
  const examLabel = formatDayAr(testDate);

  return (
    <div className="relative pb-28">
      {/* Atmosphere */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem]"
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f766e] via-[#0d9488] to-transparent opacity-[0.97]" />
        <div className="absolute -start-20 top-10 h-64 w-64 rounded-full bg-cyan-300/25 blur-3xl" />
        <div className="absolute -end-16 top-24 h-52 w-52 rounded-full bg-teal-200/20 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
      </div>

      <div className="mx-auto max-w-lg px-4 pt-8">
        {/* Identity hero */}
        <header className="animate-fade-up text-center text-white">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white/15 text-4xl font-extrabold shadow-inner ring-2 ring-white/30 backdrop-blur-sm">
            {initial}
          </div>
          <p className="mt-5 font-display text-sm font-bold tracking-wide text-teal-100">
            صفحتي في قُدرة
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
            {displayName}
          </h1>
          <p className="mt-1 text-sm text-teal-50/80" dir="ltr">
            {user.email}
          </p>
        </header>

        {/* Pulse metrics — one composition */}
        <section
          className="animate-fade-up mt-8 overflow-hidden rounded-[1.75rem] bg-white/95 p-5 shadow-[0_24px_50px_-28px_rgba(15,23,42,0.45)] ring-1 ring-white/60 backdrop-blur"
          style={{ animationDelay: "80ms" }}
        >
          <p className="text-xs font-bold text-teal-700">نبضك الآن</p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="font-display text-3xl font-extrabold tabular-nums text-ink">
                {formatPct(avgBest)}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-slate-500">
                متوسط أفضل درجاتك
              </p>
            </div>
            <div className="border-x border-slate-100">
              <p className="font-display text-3xl font-extrabold tabular-nums text-ink">
                {streakDays || 0}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-slate-500">
                أيام استمرار
              </p>
            </div>
            <div>
              <p className="font-display text-3xl font-extrabold tabular-nums text-ink">
                {completedCount}
                <span className="text-lg text-slate-400">/{skills.length}</span>
              </p>
              <p className="mt-1 text-[11px] font-semibold text-slate-500">
                مهارات أتممتها
              </p>
            </div>
          </div>

          {avgLast != null && (
            <p className="mt-4 text-center text-xs text-slate-500">
              متوسط آخر محاولة:{" "}
              <span className="font-bold text-teal-800">
                {formatPct(avgLast)}
              </span>
            </p>
          )}
        </section>

        {/* Exam day */}
        <section
          className="animate-fade-up mt-4 overflow-hidden rounded-[1.75rem] bg-ink px-5 py-5 text-white"
          style={{ animationDelay: "140ms" }}
        >
          <p className="text-[11px] font-bold text-teal-300">يوم الاختبار</p>
          {examLabel && days !== null && days >= 0 ? (
            <>
              <p className="mt-2 font-display text-2xl font-extrabold leading-snug">
                {days === 0 ? "اختبارك اليوم" : `${days} يوماً باقية`}
              </p>
              <p className="mt-1 text-sm text-slate-300">{examLabel}</p>
            </>
          ) : examLabel && days !== null && days < 0 ? (
            <>
              <p className="mt-2 font-display text-xl font-extrabold">
                التاريخ فات — حدّثه
              </p>
              <p className="mt-1 text-sm text-slate-300">{examLabel}</p>
            </>
          ) : (
            <>
              <p className="mt-2 font-display text-xl font-extrabold">
                متى اختبارك؟
              </p>
              <p className="mt-1 text-sm text-slate-400">
                حط التاريخ ويظهر العدّاد في الشريط العلوي.
              </p>
            </>
          )}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              type="date"
              value={dateInput}
              onChange={(e) => {
                setDateInput(e.target.value);
                setDateSaved(false);
              }}
              className="min-h-12 flex-1 rounded-2xl border-0 bg-white/10 px-4 text-sm text-white outline-none ring-1 ring-white/20 [color-scheme:dark]"
            />
            <button
              type="button"
              onClick={() => void saveExamDate()}
              disabled={savingDate}
              className="min-h-12 rounded-2xl bg-teal-500 px-5 text-sm font-extrabold text-white transition hover:bg-teal-400 disabled:opacity-60"
            >
              {savingDate ? "…" : "حفظ التاريخ"}
            </button>
          </div>
          {dateInput && (
            <button
              type="button"
              className="mt-2 text-xs font-semibold text-slate-400 underline-offset-2 hover:text-white hover:underline"
              onClick={() => {
                setDateInput("");
                setTestDate(null);
                setDateSaved(false);
                const supabase = createSupabaseBrowser();
                if (supabase && user) {
                  void supabase
                    .from("profiles")
                    .update({
                      test_date: null,
                      updated_at: new Date().toISOString(),
                    })
                    .eq("id", user.id);
                }
              }}
            >
              مسح التاريخ
            </button>
          )}
          {dateSaved && (
            <p className="mt-2 text-xs font-bold text-teal-300">تم الحفظ</p>
          )}
        </section>

        {/* Mock */}
        <section
          className="animate-fade-up mt-4 rounded-[1.75rem] bg-white p-5 ring-1 ring-slate-100"
          style={{ animationDelay: "200ms" }}
        >
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-teal-700">المحاكاة</p>
              <h2 className="mt-1 text-lg font-extrabold text-ink">
                تحت الوقت
              </h2>
            </div>
            {bestMockScore != null && lastMock ? (
              <p className="font-display text-3xl font-extrabold tabular-nums text-teal-700">
                {bestMockScore}
                <span className="text-lg text-slate-400">/{lastMock.total}</span>
              </p>
            ) : (
              <p className="text-sm font-semibold text-slate-400">لا نتيجة بعد</p>
            )}
          </div>
          {lastMock && (
            <p className="mt-2 text-xs text-slate-500">
              آخر محاولة: {lastMock.score}/{lastMock.total} · متوسط{" "}
              {Math.round(lastMock.avgTimeMs / 1000)} ث/سؤال
            </p>
          )}
          <Link
            href="/mock"
            className="mt-4 flex min-h-11 items-center justify-center rounded-2xl bg-teal-50 text-sm font-bold text-teal-900 ring-1 ring-teal-100"
          >
            {bestMockScore != null ? "حاول تتفوّق على درجتك" : "جرّب المحاكاة"}
          </Link>
        </section>

        {/* Skills path */}
        <section
          className="animate-fade-up mt-4"
          style={{ animationDelay: "260ms" }}
        >
          <div className="mb-3 flex items-baseline justify-between px-1">
            <h2 className="text-lg font-extrabold text-ink">مسار المهارات</h2>
            <Link href="/skills" className="text-xs font-bold text-teal-700">
              الكل
            </Link>
          </div>
          <ul className="space-y-2.5">
            {skills.map((skill, idx) => {
              const p = getSkillProgress(skill.id);
              const pct = Math.round((p.bestScore || 0) * 100);
              return (
                <li key={skill.id}>
                  <Link
                    href={`/skill/${skill.id}`}
                    className="block rounded-[1.35rem] bg-white p-4 ring-1 ring-slate-100 transition hover:ring-teal-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-sm font-extrabold text-teal-800">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-bold text-ink">
                            {skill.title_ar}
                          </p>
                          <span className="shrink-0 text-xs font-bold tabular-nums text-teal-800">
                            {p.started ? `${pct}٪` : "—"}
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-l from-teal-600 to-cyan-500 transition-all duration-500"
                            style={{ width: `${p.started ? pct : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

      </div>
    </div>
  );
}
