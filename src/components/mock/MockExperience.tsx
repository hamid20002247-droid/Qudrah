"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Question } from "@/lib/types";
import {
  FinalExam,
  type FinalAnswerRecord,
} from "@/components/skill/FinalExam";
import { buildNextMockExam, MOCK_EXAM_SIZE } from "@/lib/mock/examEngine";
import { track } from "@/lib/analytics";
import { useClientReady } from "@/components/ClientBody";
import { useProgress } from "@/store/progress";

export function MockExperience() {
  const ready = useClientReady();
  const router = useRouter();
  const saveMock = useProgress((s) => s.saveMock);
  const recordMockExam = useProgress((s) => s.recordMockExam);
  const deviceId = useProgress((s) => s.deviceId);
  const mockHistory = useProgress((s) => s.mockHistory);
  const bestMockScore = useProgress((s) => s.bestMockScore);
  const lastMock = useProgress((s) => s.lastMock);

  const [phase, setPhase] = useState<"lobby" | "exam">("lobby");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [meta, setMeta] = useState<{
    fingerprints: string[];
    slot: number;
  } | null>(null);

  const start = () => {
    const built = buildNextMockExam(
      mockHistory ?? {
        completedCount: 0,
        recentFingerprints: [],
        lastSlots: [],
      },
      deviceId
    );
    setQuestions(built.questions);
    setMeta({ fingerprints: built.fingerprints, slot: built.slot });
    setPhase("exam");
    track("mock_started", {
      size: built.questions.length,
      mode: built.mode,
    });
  };

  const finish = useCallback(
    (records: FinalAnswerRecord[], totalTimeMs: number) => {
      const qs = questions;
      let score = 0;
      const per: Record<string, { correct: number; total: number }> = {};
      qs.forEach((q, i) => {
        const sub = q.sub_pattern;
        if (!per[sub]) per[sub] = { correct: 0, total: 0 };
        per[sub].total += 1;
        if (records[i]?.correct) {
          score += 1;
          per[sub].correct += 1;
        }
      });
      const attempt = {
        score,
        total: qs.length,
        totalTimeMs,
        perSubPattern: per,
        avgTimeMs: totalTimeMs / Math.max(qs.length, 1),
        completedAt: new Date().toISOString(),
        questionIds: qs.map((q) => q.id),
        answers: records.map((r) => (r.chosen < 0 ? null : r.chosen)),
      };
      const review = qs.map((q, i) => {
        const chosen =
          records[i] && records[i]!.chosen >= 0 ? records[i]!.chosen : null;
        return {
          prompt_ar: q.prompt_ar,
          choices_ar: q.choices_ar,
          chosen,
          correct_index: q.correct_index,
          correct: Boolean(records[i]?.correct),
        };
      });
      saveMock(attempt);
      if (meta) recordMockExam(meta.fingerprints, meta.slot);
      track("mock_completed", {
        score,
        total: qs.length,
        total_time: totalTimeMs,
      });
      sessionStorage.setItem("qudrah_last_mock", JSON.stringify(attempt));
      sessionStorage.setItem("qudrah_last_mock_review", JSON.stringify(review));
      router.push("/result");
    },
    [questions, saveMock, recordMockExam, meta, router]
  );

  if (phase === "exam" && questions.length > 0) {
    return (
      <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#F8FAFC]">
        <FinalExam
          title="محاكاة قدرات كمي"
          questions={questions}
          onComplete={finish}
          onExit={() => {
            if (
              typeof window !== "undefined" &&
              window.confirm("تبي تطلع؟ بيضيع التقدّم في هذا الاختبار.")
            ) {
              setPhase("lobby");
              setQuestions([]);
              setMeta(null);
            }
          }}
          flushChrome
        />
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex min-h-[75vh] max-w-lg flex-col justify-center px-4 py-10">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(ellipse_at_top,_rgba(13,148,136,0.2),_transparent_65%)]"
        aria-hidden
      />

      <div className="overflow-hidden rounded-[2rem] bg-ink text-white shadow-[0_28px_60px_-28px_rgba(15,118,110,0.55)]">
        <div className="relative px-6 pb-8 pt-8">
          <div
            className="pointer-events-none absolute -start-10 top-0 h-40 w-40 rounded-full bg-teal-400/20 blur-3xl"
            aria-hidden
          />
          <p className="text-[11px] font-bold tracking-wide text-teal-300">
            محاكاة كمي كاملة
          </p>
          <h1 className="mt-2 font-display text-[1.85rem] font-extrabold leading-snug">
            مثل يوم الاختبار
            <br />
            حساب · جبر · هندسة · إحصاء · مقارنات
          </h1>
          <p className="mt-3 max-w-[21rem] text-sm leading-relaxed text-slate-300">
            {MOCK_EXAM_SIZE} سؤالاً في {MOCK_EXAM_SIZE} دقيقة — مزيج قريب من
            القسم الكمي: حوالي 40٪ حساب، 24٪ هندسة، 23٪ جبر، 13٪ إحصاء، مع
            مقارنات داخل الأسئلة.
          </p>

          <p className="mt-5 rounded-2xl bg-teal-500/15 px-4 py-3 text-sm font-bold leading-snug text-teal-100 ring-1 ring-teal-400/25">
            كل مرة اختبار جديد بأسئلة جديدة — تجربة مختلفة في كل محاولة
          </p>

          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li className="flex gap-2">
              <span className="text-teal-400">●</span>
              مؤقت واحد لكامل الجلسة، مع خريطة للتنقّل بين الأسئلة
            </li>
            <li className="flex gap-2">
              <span className="text-teal-400">●</span>
              تراجع إجاباتك بعد التسليم — كما في جوّ يوم الاختبار
            </li>
          </ul>

          {ready && bestMockScore != null && lastMock && (
            <p className="mt-5 rounded-2xl bg-white/5 px-4 py-3 text-sm text-teal-100 ring-1 ring-white/10">
              أفضل نتيجة لك:{" "}
              <span className="font-extrabold text-white">
                {bestMockScore}/{lastMock.total}
              </span>
            </p>
          )}

          <button
            type="button"
            onClick={start}
            className="mt-7 flex min-h-14 w-full items-center justify-center rounded-2xl bg-teal-500 text-base font-extrabold text-white transition hover:bg-teal-400 active:scale-[0.99]"
          >
            ابدأ اختباراً جديداً
          </button>
        </div>
      </div>

      <Link
        href="/skills"
        className="mt-5 flex min-h-11 items-center justify-center text-sm font-semibold text-teal-800"
      >
        أفضّل إكمال مهارة أولاً
      </Link>
    </div>
  );
}
