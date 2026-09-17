"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { useAuth } from "@/components/auth/AuthProvider";
import { LtrNum } from "@/components/ui/LtrNum";
import { useProgress } from "@/store/progress";

const MOCK_INTENT = "qudrah_mock_intent";

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

export function MockExperience() {
  const ready = useClientReady();
  const router = useRouter();
  const { user, loading, configured, signInWithGoogle } = useAuth();
  const saveMock = useProgress((s) => s.saveMock);
  const recordMockExam = useProgress((s) => s.recordMockExam);
  const deviceId = useProgress((s) => s.deviceId);
  const mockHistory = useProgress((s) => s.mockHistory);
  const bestMockScore = useProgress((s) => s.bestMockScore);
  const lastMock = useProgress((s) => s.lastMock);

  const [phase, setPhase] = useState<"lobby" | "exam">("lobby");
  const [gated, setGated] = useState(false);
  const [busyGoogle, setBusyGoogle] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [meta, setMeta] = useState<{
    fingerprints: string[];
    slot: number;
  } | null>(null);
  const autoStarted = useRef(false);

  const guest = ready && configured && !loading && !user;

  const start = useCallback(
    (opts?: { gate?: boolean }) => {
      const needGate = Boolean(opts?.gate);
      track("mock_start_clicked", {
        has_account: Boolean(user),
        gated: needGate,
      });
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
      setGated(needGate);
      setPhase("exam");
      if (needGate) {
        try {
          sessionStorage.setItem(MOCK_INTENT, "1");
        } catch {
          /* ignore */
        }
        track("mock_gate_shown");
      } else {
        track("mock_started", {
          size: built.questions.length,
          mode: built.mode,
          guest: false,
        });
      }
    },
    [user, mockHistory, deviceId]
  );

  useEffect(() => {
    if (!ready || phase !== "lobby") return;
    track("mock_lobby_view");
  }, [ready, phase]);

  useEffect(() => {
    if (!ready || loading || !user || autoStarted.current) return;
    if (phase !== "lobby") return;
    try {
      if (sessionStorage.getItem(MOCK_INTENT) !== "1") return;
      sessionStorage.removeItem(MOCK_INTENT);
    } catch {
      return;
    }
    autoStarted.current = true;
    start({ gate: false });
  }, [ready, loading, user, start, phase]);

  const closeGate = () => {
    try {
      sessionStorage.removeItem(MOCK_INTENT);
    } catch {
      /* ignore */
    }
    track("mock_gate_dismissed");
    setPhase("lobby");
    setGated(false);
    setQuestions([]);
    setMeta(null);
    setGateError(null);
  };

  const onGoogle = async () => {
    setGateError(null);
    setBusyGoogle(true);
    track("mock_gate_google_clicked");
    try {
      const err = await signInWithGoogle("/mock");
      if (err) setGateError(err);
    } finally {
      setBusyGoogle(false);
    }
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
        guest: !user,
      });
      sessionStorage.setItem("qudrah_last_mock", JSON.stringify(attempt));
      sessionStorage.setItem("qudrah_last_mock_review", JSON.stringify(review));
      router.push("/result");
    },
    [questions, saveMock, recordMockExam, meta, router, user]
  );

  if (phase === "exam" && questions.length > 0) {
    return (
      <>
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#F8FAFC]">
          <FinalExam
            title="اختبار قدرات كمي"
            questions={questions}
            onComplete={finish}
            paused={gated}
            onExit={() => {
              if (gated) {
                closeGate();
                return;
              }
              track("mock_exit_attempt", {
                answered: questions.length,
              });
              if (
                typeof window !== "undefined" &&
                window.confirm("تبي تطلع؟ بيضيع التقدّم في هذا الاختبار.")
              ) {
                track("mock_abandoned");
                setPhase("lobby");
                setQuestions([]);
                setMeta(null);
              }
            }}
            flushChrome
          />
        </div>

        {gated && (
          <div className="fixed inset-0 z-[70] flex flex-col justify-end">
            <button
              type="button"
              className="absolute inset-0 bg-ink/35 backdrop-blur-[2px]"
              aria-label="إغلاق"
              onClick={closeGate}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="mock-gate-title"
              className="relative mx-auto w-full max-w-lg px-3 pb-[max(1rem,env(safe-area-inset-bottom))]"
            >
              <div className="overflow-hidden rounded-[1.75rem] bg-white p-5 shadow-[0_-16px_50px_-20px_rgba(15,23,42,0.45)] ring-1 ring-slate-200/80">
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />
                <p className="text-center text-[11px] font-bold tracking-wide text-teal-700">
                  الاختبار جاهز
                </p>
                <h2
                  id="mock-gate-title"
                  className="mt-1.5 text-center font-display text-[1.45rem] font-extrabold leading-snug text-ink"
                >
                  ابدأ بحساب Google
                </h2>
                <p className="mx-auto mt-2 max-w-[18rem] text-center text-sm leading-relaxed text-slate-500">
                  ثواني، ونحفظ درجتك على كل أجهزتك. مجاناً.
                </p>
                <button
                  type="button"
                  onClick={() => void onGoogle()}
                  disabled={busyGoogle}
                  className="mt-5 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-ink text-[15px] font-extrabold text-white transition hover:bg-slate-800 active:scale-[0.99] disabled:opacity-60"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                    <GoogleMark />
                  </span>
                  {busyGoogle ? "لحظة…" : "المتابعة مع Google"}
                </button>
                {gateError && (
                  <p className="mt-3 text-center text-sm font-semibold text-rose-700">
                    {gateError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={closeGate}
                  className="mt-3 flex min-h-11 w-full items-center justify-center text-sm font-semibold text-slate-400"
                >
                  رجوع
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="relative mx-auto flex min-h-[75vh] w-full max-w-lg flex-col justify-center overflow-x-hidden px-4 py-10 pb-32">
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
            الاختبار الكامل
          </p>
          <h1 className="mt-2 font-display text-[1.85rem] font-extrabold leading-snug">
            اختبار قدرات كمي
            <br />
            حساب · جبر · هندسة · إحصاء · مقارنات
          </h1>
          <p className="mt-3 max-w-[21rem] text-sm leading-relaxed text-slate-300">
            {MOCK_EXAM_SIZE} سؤالاً في {MOCK_EXAM_SIZE} دقيقة — مزيج القسم
            الكمي: حوالي 40٪ حساب، 24٪ هندسة، 23٪ جبر، 13٪ إحصاء، مع مقارنات
            داخل الأسئلة.
          </p>

          <p className="mt-5 rounded-2xl bg-teal-500/15 px-4 py-3 text-sm font-bold leading-snug text-teal-100 ring-1 ring-teal-400/25">
            كل مرة اختبار جديد بأسئلة جديدة
          </p>

          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li className="flex gap-2">
              <span className="text-teal-400">●</span>
              مؤقت واحد لكامل الجلسة، مع خريطة للتنقّل بين الأسئلة
            </li>
            <li className="flex gap-2">
              <span className="text-teal-400">●</span>
              تراجع إجاباتك بعد التسليم
            </li>
          </ul>

          {ready && bestMockScore != null && lastMock && (
            <p className="mt-5 rounded-2xl bg-white/5 px-4 py-3 text-sm text-teal-100 ring-1 ring-white/10">
              أفضل نتيجة لك:{" "}
              <span className="font-extrabold text-white">
                <LtrNum>
                  {bestMockScore}/{lastMock.total}
                </LtrNum>
              </span>
            </p>
          )}

          <button
            type="button"
            onClick={() => start({ gate: guest })}
            disabled={!ready || loading}
            className="mt-6 flex min-h-14 w-full items-center justify-center rounded-2xl bg-teal-500 text-base font-extrabold text-white shadow-lg shadow-teal-600/25 transition hover:bg-teal-400 active:scale-[0.99] disabled:opacity-60"
          >
            ادخل الاختبار
          </button>
        </div>
      </div>

      <Link
        href="/skills"
        className="mt-4 flex min-h-11 items-center justify-center text-sm font-semibold text-teal-800"
      >
        أفضّل إكمال مهارة أولاً
      </Link>
    </div>
  );
}
