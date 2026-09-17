"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { MockAttempt, MockReviewItem } from "@/lib/types";
import { DOMAIN_LABELS, SUB_PATTERN_LABELS, domainForSubPattern } from "@/lib/content";
import { skillIdForSubPattern } from "@/content/arithmetic";
import { MathText } from "@/components/ui/MathText";
import { formatMs } from "@/components/ui/ProgressRing";
import { track } from "@/lib/analytics";
import { useAuth } from "@/components/auth/AuthProvider";
import { useClientReady } from "@/components/ClientBody";
import { authHref } from "@/lib/access";
import { LtrNum } from "@/components/ui/LtrNum";
import { useProgress } from "@/store/progress";

function messageFor(score: number, total: number): string {
  const pct = score / total;
  if (pct >= 0.85) return "نتيجة عالية — راجع الوقت لتزيد سرعتك.";
  if (pct >= 0.6) return "نتيجة متوسطة — ركّز على أضعف مهارة ثم أعد الاختبار.";
  if (pct >= 0.4) return "نتيجة منخفضة نسبياً — ابدأ بأضعف مهارة ثم أعد الاختبار.";
  return "ابدأ بأضعف مهارة في المسار ثم أعد الاختبار.";
}

export function ResultExperience() {
  const ready = useClientReady();
  const { user, loading, configured } = useAuth();
  const lastMock = useProgress((s) => s.lastMock);
  const bestMockScore = useProgress((s) => s.bestMockScore);
  const setTestDate = useProgress((s) => s.setTestDate);
  const testDate = useProgress((s) => s.testDate);

  const [attempt, setAttempt] = useState<MockAttempt | null>(null);
  const [review, setReview] = useState<MockReviewItem[]>([]);
  const [dateInput, setDateInput] = useState(testDate ?? "");
  const [dateSaved, setDateSaved] = useState(false);

  useEffect(() => {
    let data = lastMock;
    if (!data && typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem("qudrah_last_mock");
        if (raw) data = JSON.parse(raw) as MockAttempt;
      } catch {
        /* ignore */
      }
    }
    setAttempt(data);
    if (data) track("result_view", { score: data.score, total: data.total });

    try {
      const rawReview = sessionStorage.getItem("qudrah_last_mock_review");
      if (rawReview) {
        setReview(JSON.parse(rawReview) as MockReviewItem[]);
      }
    } catch {
      /* ignore */
    }
  }, [lastMock]);

  const answeredReview = useMemo(
    () => review.filter((r) => r.chosen != null && r.chosen >= 0),
    [review]
  );

  const topWeak = useMemo(() => {
    if (!attempt) return null;
    const spots = Object.entries(attempt.perSubPattern)
      .map(([sub, v]) => ({
        sub,
        pct: v.total ? v.correct / v.total : 1,
        ...v,
        skillId: skillIdForSubPattern(sub),
      }))
      .sort((a, b) => a.pct - b.pct);
    return spots[0] ?? null;
  }, [attempt]);

  if (!attempt) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-lg font-bold text-ink">لا توجد نتيجة بعد</p>
        <p className="mt-2 text-sm text-slate-600">
          أكمل اختباراً أولاً، ثم تظهر درجتك هنا.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/mock"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-teal-600 px-6 font-bold text-white"
          >
            ادخل الاختبار
          </Link>
          <Link
            href="/skills"
            className="inline-flex min-h-11 items-center justify-center font-semibold text-teal-700"
          >
            أو تصفّح المهارات
          </Link>
        </div>
      </div>
    );
  }

  const spots = Object.entries(attempt.perSubPattern);
  const domains = (() => {
    const map: Record<string, { correct: number; total: number }> = {};
    for (const [sub, v] of spots) {
      const d = domainForSubPattern(sub);
      if (!map[d]) map[d] = { correct: 0, total: 0 };
      map[d].correct += v.correct;
      map[d].total += v.total;
    }
    return Object.entries(map).sort(
      (a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total
    );
  })();
  const isNewBest =
    bestMockScore !== null && bestMockScore === attempt.score;
  const guest = ready && configured && !loading && !user;

  return (
    <div className="mx-auto max-w-lg px-4 pb-16 pt-6">
      <p className="text-center text-sm font-semibold text-teal-700">
        نتيجة الاختبار
      </p>
      <p className="mt-2 text-center text-5xl font-extrabold text-ink">
        <LtrNum>
          {attempt.score} / {attempt.total}
        </LtrNum>
      </p>
      <p className="mt-3 text-center text-base font-medium leading-relaxed text-slate-700">
        {messageFor(attempt.score, attempt.total)}
      </p>
      {isNewBest && (
        <p className="mt-2 text-center text-xs font-semibold text-teal-700">
          أفضل نتيجة سجّلتها على هذا الجهاز
        </p>
      )}
      {bestMockScore !== null && bestMockScore > attempt.score && (
        <p className="mt-1 text-center text-xs text-slate-500">
          أفضل نتيجة سابقة:{" "}
          <LtrNum>
            {bestMockScore}/{attempt.total}
          </LtrNum>{" "}
          — حاول تجاوزها
        </p>
      )}

      {guest && (
        <div className="mt-6 overflow-hidden rounded-[1.75rem] bg-ink p-5 text-white shadow-lg shadow-teal-900/20">
          <p className="text-[11px] font-bold tracking-wide text-teal-300">
            احفظ درجتك
          </p>
          <p className="mt-1.5 text-lg font-extrabold leading-snug">
            النتيجة على هذا الجهاز فقط
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
            احفظها بحساب Google عشان ما تضيع — مجاناً، ثواني.
          </p>
          <Link
            href={authHref("/result")}
            onClick={() =>
              track("result_save_cta_clicked", {
                score: attempt.score,
                total: attempt.total,
              })
            }
            className="mt-4 flex min-h-12 items-center justify-center rounded-2xl bg-teal-500 text-sm font-extrabold text-white transition hover:bg-teal-400"
          >
            احفظ درجتي
          </Link>
        </div>
      )}

      {topWeak && topWeak.pct < 0.8 && topWeak.skillId && (
        <div className="mt-6 rounded-2xl bg-teal-700 p-4 text-white shadow-lg shadow-teal-700/20">
          <p className="text-[11px] font-semibold text-teal-100">
            خطوتك التالية (الأهم)
          </p>
          <p className="mt-1 font-bold">
            تدرّب على: {SUB_PATTERN_LABELS[topWeak.sub] ?? topWeak.sub}
          </p>
          <p className="mt-1 text-sm text-teal-100">
            أضعف نقطة في هذا الاختبار (
            <LtrNum>
              {topWeak.correct}/{topWeak.total}
            </LtrNum>
            )
          </p>
          <Link
            href={`/skill/${topWeak.skillId}`}
            onClick={() =>
              track("result_weak_skill_clicked", {
                skill_id: topWeak.skillId,
              })
            }
            className="mt-3 flex min-h-11 items-center justify-center rounded-xl bg-white font-bold text-teal-800"
          >
            افتح المهارة الآن
          </Link>
        </div>
      )}

      <div className="mt-6 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
        <p className="text-sm font-bold text-ink">تفصيل أقسام الكمي</p>
        <ul className="mt-3 space-y-3">
          {domains.map(([domain, { correct, total }]) => {
            const pct = total ? correct / total : 0;
            return (
              <li key={domain}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-semibold">
                    {DOMAIN_LABELS[domain] ?? domain}
                  </span>
                  <span className="tabular-nums text-slate-500" dir="ltr">
                    {correct}/{total}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white ring-1 ring-slate-100">
                  <div
                    className={`h-full ${
                      pct >= 0.8
                        ? "bg-green-500"
                        : pct >= 0.5
                          ? "bg-amber-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${pct * 100}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {answeredReview.length > 0 && (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-bold text-ink">مراجعة إجاباتك</p>
          <p className="text-xs text-slate-500">
            الأسئلة التي أجبت عليها فقط — بدون شرح مفصّل
          </p>
          <ul className="space-y-3">
            {answeredReview.map((item, i) => {
              const ok = item.correct;
              const chosenText =
                item.chosen != null ? item.choices_ar[item.chosen] : null;
              const correctText = item.choices_ar[item.correct_index];
              return (
                <li
                  key={i}
                  className={`rounded-2xl p-4 ring-1 ${
                    ok
                      ? "bg-teal-50/80 ring-teal-100"
                      : "bg-rose-50/80 ring-rose-100"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-500">
                      سؤال {i + 1}
                    </span>
                    <span
                      className={`text-sm font-black ${
                        ok ? "text-teal-700" : "text-rose-700"
                      }`}
                    >
                      {ok ? "صحيح" : "خطأ"}
                    </span>
                  </div>
                  <p className="text-[15px] font-semibold leading-relaxed text-ink">
                    <MathText text={item.prompt_ar} />
                  </p>
                  {chosenText != null && (
                    <p className="mt-3 text-sm text-slate-700">
                      <span className="font-bold text-slate-500">إجابتك: </span>
                      <MathText text={chosenText} />
                    </p>
                  )}
                  {!ok && correctText != null && (
                    <p className="mt-1.5 text-sm font-semibold text-teal-800">
                      <span className="font-bold">الإجابة الصحيحة: </span>
                      <MathText text={correctText} />
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <p className="text-sm font-bold text-ink">الوقت</p>
        <p className="mt-1 text-sm text-slate-600">
          متوسط السؤال: {formatMs(attempt.avgTimeMs)} · هدف نحو 60 ثانية لكل سؤال
        </p>
        <p className="text-xs text-slate-500">
          الإجمالي: {formatMs(attempt.totalTimeMs)}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <Link
          href="/mock"
          onClick={() => track("result_retake_clicked")}
          className="flex min-h-14 flex-col items-center justify-center rounded-2xl bg-slate-900 px-4 text-white transition hover:bg-slate-800 active:scale-[0.99]"
        >
          <span className="text-base font-extrabold leading-none">
            ابدأ اختباراً جديداً
          </span>
          <span className="mt-1 text-[11px] font-bold text-slate-300">
            أسئلة وترتيب مختلف هذه المرة
          </span>
        </Link>
        <Link
          href="/skills"
          className="flex min-h-12 items-center justify-center rounded-2xl bg-slate-100 font-semibold text-slate-800"
        >
          خريطة المهارات
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-teal-200 bg-teal-50/50 p-4">
        <p className="text-sm font-bold text-ink">تاريخ اختبارك</p>
        <p className="mt-1 text-xs text-slate-600">
          يظهر عدّاد الأيام في الشريط العلوي ليذكّرك بالهدف.
        </p>
        <div className="mt-3 flex gap-2">
          <input
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="min-h-11 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm"
          />
          <button
            type="button"
            onClick={() => {
              setTestDate(dateInput || null);
              setDateSaved(true);
              track("test_date_set", { has_date: Boolean(dateInput) });
            }}
            className="min-h-11 rounded-xl bg-ink px-4 text-sm font-bold text-white"
          >
            حفظ
          </button>
        </div>
        {dateSaved && (
          <p className="mt-2 text-xs font-semibold text-teal-700">تم الحفظ</p>
        )}
      </div>
    </div>
  );
}
