"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Question } from "@/lib/types";
import {
  FinalExam,
  type FinalAnswerRecord,
} from "@/components/skill/FinalExam";
import {
  buildMockExamAtSlot,
  listMockExamCards,
  nextRecommendedSlot,
  MOCK_BANK_SIZE,
  MOCK_EXAM_SIZE,
  type MockExamCard,
} from "@/lib/mock/examEngine";
import { track } from "@/lib/analytics";
import { useClientReady } from "@/components/ClientBody";
import { useAuth } from "@/components/auth/AuthProvider";
import { LtrNum } from "@/components/ui/LtrNum";
import { formatMs } from "@/components/ui/ProgressRing";
import { useProgress } from "@/store/progress";

const MOCK_INTENT = "qudrah_mock_intent";
const MOCK_INTENT_SLOT = "qudrah_mock_intent_slot";

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

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M7 11V8a5 5 0 0 1 10 0v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect
        x="5"
        y="11"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

export function MockExperience() {
  const ready = useClientReady();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, configured, signInWithGoogle } = useAuth();
  const saveMock = useProgress((s) => s.saveMock);
  const recordMockExam = useProgress((s) => s.recordMockExam);
  const deviceId = useProgress((s) => s.deviceId);
  const mockHistory = useProgress((s) => s.mockHistory);
  const bestMockScore = useProgress((s) => s.bestMockScore);
  const lastMock = useProgress((s) => s.lastMock);

  const [phase, setPhase] = useState<"lobby" | "exam">("lobby");
  const [showGate, setShowGate] = useState(false);
  const [busyGoogle, setBusyGoogle] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [meta, setMeta] = useState<{
    fingerprints: string[];
    slot: number;
  } | null>(null);
  const [pendingSlot, setPendingSlot] = useState<number | null>(null);
  const autoStarted = useRef(false);
  const urlStarted = useRef(false);

  const guest = ready && configured && !loading && !user;
  const signedIn = ready && configured && !loading && Boolean(user);
  const history = mockHistory ?? {
    completedCount: 0,
    recentFingerprints: [],
    lastSlots: [],
    slotResults: {},
  };

  const exams = useMemo(() => listMockExamCards(history), [history]);
  const recommended = useMemo(
    () => nextRecommendedSlot(history),
    [history]
  );
  const doneCount = useMemo(
    () => exams.filter((e) => e.status === "done").length,
    [exams]
  );

  const loadExam = useCallback(
    (slot: number) => {
      const built = buildMockExamAtSlot(slot, history, deviceId);
      setQuestions(built.questions);
      setMeta({ fingerprints: built.fingerprints, slot: built.slot });
      setPendingSlot(slot);
      setPhase("exam");
      return built;
    },
    [history, deviceId]
  );

  const beginExam = useCallback(
    (slot: number) => {
      const built = loadExam(slot);
      setShowGate(false);
      track("mock_started", {
        size: built.questions.length,
        mode: built.mode,
        guest: false,
        exam_slot: built.slot,
        exam_number: built.slot + 1,
      });
    },
    [loadExam]
  );

  /** Guest: open the exam UI, then put the signup sheet on top of it. */
  const previewExamBehindGate = useCallback(
    (slot: number) => {
      const built = loadExam(slot);
      setShowGate(true);
      try {
        sessionStorage.setItem(MOCK_INTENT, "1");
        sessionStorage.setItem(MOCK_INTENT_SLOT, String(slot));
      } catch {
        /* ignore */
      }
      track("mock_started", {
        size: built.questions.length,
        mode: built.mode,
        guest: true,
        gated: true,
        exam_slot: built.slot,
        exam_number: built.slot + 1,
      });
      track("mock_gate_shown", { exam_slot: slot, over_exam: true });
    },
    [loadExam]
  );

  /** Guests enter the exam behind a signup gate; signed-in students start. */
  const requestExam = useCallback(
    (slot: number) => {
      track("mock_start_clicked", {
        has_account: Boolean(user),
        gated: guest,
        exam_slot: slot,
        exam_number: slot + 1,
      });

      if (guest) {
        previewExamBehindGate(slot);
        return;
      }

      if (!signedIn && configured) return;
      beginExam(slot);
    },
    [guest, user, signedIn, configured, beginExam, previewExamBehindGate]
  );

  useEffect(() => {
    if (phase === "exam") {
      document.body.dataset.mockExam = "1";
    } else {
      delete document.body.dataset.mockExam;
    }
    return () => {
      delete document.body.dataset.mockExam;
    };
  }, [phase]);

  useEffect(() => {
    if (!ready || phase !== "lobby") return;
    track("mock_lobby_view", {
      exams_total: MOCK_BANK_SIZE,
      exams_done: doneCount,
      guest,
    });
  }, [ready, phase, doneCount, guest]);

  // Deep-link / homepage: /mock?start=3 → open exam 3 (gate if guest)
  useEffect(() => {
    if (!ready || loading || urlStarted.current) return;
    const raw = searchParams.get("start");
    if (!raw) return;
    const examNo = Number(raw);
    if (!Number.isFinite(examNo) || examNo < 1 || examNo > MOCK_BANK_SIZE) {
      return;
    }
    urlStarted.current = true;
    const slot = examNo - 1;
    if (guest) {
      previewExamBehindGate(slot);
      return;
    }
    if (signedIn) {
      autoStarted.current = true;
      beginExam(slot);
    }
  }, [
    ready,
    loading,
    guest,
    signedIn,
    searchParams,
    previewExamBehindGate,
    beginExam,
  ]);

  useEffect(() => {
    if (!ready || loading || !user || autoStarted.current) return;
    if (phase === "exam" && questions.length > 0 && showGate) {
      // Signed in while previewing — lift the gate, keep the same exam
      autoStarted.current = true;
      try {
        sessionStorage.removeItem(MOCK_INTENT);
        sessionStorage.removeItem(MOCK_INTENT_SLOT);
      } catch {
        /* ignore */
      }
      setShowGate(false);
      track("mock_gate_cleared_in_exam", {
        exam_slot: meta?.slot,
      });
      return;
    }
    if (phase !== "lobby") return;
    try {
      if (sessionStorage.getItem(MOCK_INTENT) !== "1") return;
      sessionStorage.removeItem(MOCK_INTENT);
      const raw = sessionStorage.getItem(MOCK_INTENT_SLOT);
      sessionStorage.removeItem(MOCK_INTENT_SLOT);
      const slot =
        raw != null && raw !== "" ? Number(raw) : recommended;
      if (!Number.isFinite(slot)) return;
      autoStarted.current = true;
      beginExam(slot);
    } catch {
      return;
    }
  }, [
    ready,
    loading,
    user,
    beginExam,
    phase,
    recommended,
    questions.length,
    showGate,
    meta?.slot,
  ]);

  const closeGate = () => {
    try {
      sessionStorage.removeItem(MOCK_INTENT);
      sessionStorage.removeItem(MOCK_INTENT_SLOT);
    } catch {
      /* ignore */
    }
    track("mock_gate_dismissed", {
      exam_slot: pendingSlot ?? undefined,
      had_exam_preview: phase === "exam",
    });
    setShowGate(false);
    setPendingSlot(null);
    setGateError(null);
    // Back out of the locked preview into the lobby
    setPhase("lobby");
    setQuestions([]);
    setMeta(null);
  };

  const onGoogle = async () => {
    setGateError(null);
    setBusyGoogle(true);
    track("mock_gate_google_clicked", {
      exam_slot: pendingSlot ?? undefined,
    });
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
          solve_ar: q.solve_ar,
        };
      });
      saveMock(attempt);
      const answeredCount = records.filter((r) => r.chosen >= 0).length;
      const fullyAnswered =
        qs.length === MOCK_EXAM_SIZE && answeredCount === MOCK_EXAM_SIZE;
      if (meta) {
        recordMockExam(meta.fingerprints, meta.slot, {
          fullyAnswered,
          score,
          total: qs.length,
          answeredCount,
          totalTimeMs,
        });
      }
      track("mock_completed", {
        score,
        total: qs.length,
        answered: answeredCount,
        fully_answered: fullyAnswered,
        total_time: totalTimeMs,
        guest: !user,
        exam_slot: meta?.slot,
        exam_number: meta ? meta.slot + 1 : undefined,
      });
      sessionStorage.setItem("qudrah_last_mock", JSON.stringify(attempt));
      sessionStorage.setItem("qudrah_last_mock_review", JSON.stringify(review));
      router.push("/result");
    },
    [questions, saveMock, recordMockExam, meta, router, user]
  );

  if (phase === "exam" && questions.length > 0) {
    const examLabel =
      meta != null ? `اختبار ${meta.slot + 1}` : "اختبار قدرات كمي";
    return (
      <>
        <div
          className={`fixed inset-0 z-[60] overflow-y-auto bg-[#F8FAFC] ${
            showGate ? "pointer-events-none select-none" : ""
          }`}
          aria-hidden={showGate || undefined}
        >
          <FinalExam
            title={examLabel}
            questions={questions}
            onComplete={finish}
            paused={showGate}
            onExit={() => {
              if (showGate) {
                closeGate();
                return;
              }
              track("mock_exit_attempt", {
                answered: questions.length,
                exam_slot: meta?.slot,
              });
              if (
                typeof window !== "undefined" &&
                window.confirm("تبي تطلع؟ بيضيع التقدّم في هذا الاختبار.")
              ) {
                track("mock_abandoned", { exam_slot: meta?.slot });
                setPhase("lobby");
                setQuestions([]);
                setMeta(null);
                setPendingSlot(null);
              }
            }}
            flushChrome
          />
        </div>
        {showGate && <SignupGateSheet
          pendingSlot={pendingSlot}
          busyGoogle={busyGoogle}
          gateError={gateError}
          onGoogle={() => void onGoogle()}
          onClose={closeGate}
        />}
      </>
    );
  }

  const pathPct = Math.round((doneCount / MOCK_BANK_SIZE) * 100);

  return (
    <div className="relative mx-auto w-full max-w-lg overflow-x-hidden px-4 pb-32 pt-5">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(ellipse_at_top,_rgba(13,148,136,0.2),_transparent_62%),radial-gradient(ellipse_at_80%_20%,_rgba(16,185,129,0.12),_transparent_45%)]"
        aria-hidden
      />

      <header className="animate-fade-up">
        <p className="text-[12px] font-bold tracking-wide text-teal-700">
          الاختبار الكامل
        </p>
        <h1 className="mt-1.5 font-display text-[1.85rem] font-extrabold leading-snug text-ink">
          20 اختبار قدرات كمي
        </h1>
        <p className="mt-2 max-w-[22rem] text-[14px] leading-relaxed text-slate-600">
          كل اختبار {MOCK_EXAM_SIZE} سؤالاً · {MOCK_EXAM_SIZE} دقيقة. أكمل
          الـ 60 لتحفظ الوقت — الدرجة تظهر دائماً بعد التسليم.
        </p>
      </header>

      {guest && (
        <p
          className="animate-fade-up mt-4 flex items-center gap-2 rounded-2xl bg-amber-50 px-3.5 py-2.5 text-[12px] font-semibold leading-snug text-amber-950 ring-1 ring-amber-100"
          style={{ animationDelay: "40ms" }}
        >
          <LockIcon className="shrink-0 text-amber-700" />
          شاهد الاختبارات كلها — للدخول سجّل بحساب Google (مجاناً).
        </p>
      )}

      <div
        className="animate-fade-up mt-5 overflow-hidden rounded-[1.5rem] bg-ink p-4 text-white shadow-[0_20px_44px_-24px_rgba(15,23,42,0.55)]"
        style={{ animationDelay: "60ms" }}
      >
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold text-teal-300">مسارك</p>
            <p className="mt-0.5 font-display text-2xl font-extrabold tabular-nums">
              <LtrNum>
                {doneCount}/{MOCK_BANK_SIZE}
              </LtrNum>
              <span className="ms-1.5 text-sm font-bold text-white/55">
                مكتمل 60/60
              </span>
            </p>
          </div>
          <div className="text-end">
            <p className="text-[11px] font-bold text-white/50">أفضل درجة</p>
            <p className="mt-0.5 font-display text-xl font-extrabold tabular-nums">
              {ready && bestMockScore != null && lastMock ? (
                <LtrNum>
                  {bestMockScore}/{lastMock.total}
                </LtrNum>
              ) : (
                "—"
              )}
            </p>
          </div>
        </div>
        <div className="mt-3.5 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-l from-teal-400 to-emerald-400 transition-[width] duration-700 ease-out"
            style={{ width: `${pathPct}%` }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => requestExam(recommended)}
        disabled={!ready || loading}
        className="animate-fade-up mt-4 flex min-h-[4.5rem] w-full flex-col items-center justify-center rounded-[1.5rem] bg-teal-600 text-white shadow-[0_18px_40px_-18px_rgba(13,148,136,0.65)] transition hover:bg-teal-500 active:scale-[0.99] disabled:opacity-60"
        style={{ animationDelay: "100ms" }}
      >
        <span className="flex items-center gap-2 text-base font-extrabold">
          {guest && <LockIcon />}
          {guest
            ? `سجّل لبدء اختبار ${recommended + 1}`
            : `ابدأ اختبار ${recommended + 1}`}
        </span>
        <span className="mt-1 text-[12px] font-bold text-teal-100">
          التالي في المسار · {MOCK_EXAM_SIZE} سؤال · {MOCK_EXAM_SIZE} دقيقة
        </span>
      </button>

      <ul
        className="animate-fade-up mt-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-bold"
        style={{ animationDelay: "120ms" }}
        aria-label="مفتاح الحالات"
      >
        <li className="inline-flex items-center gap-1.5 text-emerald-800">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          مكتمل
        </li>
        <li className="inline-flex items-center gap-1.5 text-amber-900">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          بدأته
        </li>
        <li className="inline-flex items-center gap-1.5 text-slate-600">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          لم يبدأ
        </li>
        <li className="inline-flex items-center gap-1.5 text-teal-800">
          <span className="h-2.5 w-2.5 rounded-full bg-teal-600" />
          التالي
        </li>
      </ul>

      <p
        className="animate-fade-up mt-4 text-[13px] font-bold text-slate-500"
        style={{ animationDelay: "140ms" }}
      >
        كل الاختبارات
      </p>

      <ol className="mt-3 grid grid-cols-2 gap-2.5">
        {exams.map((exam, idx) => (
          <ExamTile
            key={exam.slot}
            exam={exam}
            recommended={exam.slot === recommended}
            locked={guest}
            delay={Math.min(idx, 12) * 28}
            disabled={!ready || loading}
            onStart={() => requestExam(exam.slot)}
          />
        ))}
      </ol>

      <p className="mt-5 text-center text-[11px] leading-relaxed text-slate-400">
        الدرجة دائماً بعد التسليم · الوقت يُحفظ فقط عند إكمال الـ 60.
      </p>

      <Link
        href="/skills"
        className="mt-3 flex min-h-11 items-center justify-center text-sm font-semibold text-teal-800"
        onClick={() => track("mock_lobby_skills_link")}
      >
        أفضّل إكمال مهارة أولاً
      </Link>

      {showGate && (
        <SignupGateSheet
          pendingSlot={pendingSlot}
          busyGoogle={busyGoogle}
          gateError={gateError}
          onGoogle={() => void onGoogle()}
          onClose={closeGate}
        />
      )}
    </div>
  );
}

function SignupGateSheet({
  pendingSlot,
  busyGoogle,
  gateError,
  onGoogle,
  onClose,
}: {
  pendingSlot: number | null;
  busyGoogle: boolean;
  gateError: string | null;
  onGoogle: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-ink/45 backdrop-blur-[3px]"
        aria-label="إغلاق"
        onClick={onClose}
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
            {pendingSlot != null ? `اختبار ${pendingSlot + 1}` : "الاختبار"}
          </p>
          <h2
            id="mock-gate-title"
            className="mt-1.5 text-center font-display text-[1.45rem] font-extrabold leading-snug text-ink"
          >
            الاختبار جاهز — سجّل لبدء الحل
          </h2>
          <p className="mx-auto mt-2 max-w-[18rem] text-center text-sm leading-relaxed text-slate-500">
            تشوف الأسئلة خلف هذه البطاقة. التسجيل بـ Google مجاني ويحفظ درجتك.
          </p>
          <button
            type="button"
            onClick={onGoogle}
            disabled={busyGoogle}
            className="mt-5 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-ink text-[15px] font-extrabold text-white transition hover:bg-slate-800 active:scale-[0.99] disabled:opacity-60"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
              <GoogleMark />
            </span>
            {busyGoogle ? "لحظة…" : "سجّل دخولك مع Google"}
          </button>
          {gateError && (
            <p className="mt-3 text-center text-sm font-semibold text-rose-700">
              {gateError}
            </p>
          )}
          <button
            type="button"
            onClick={onClose}
            className="mt-3 flex min-h-11 w-full items-center justify-center text-sm font-semibold text-slate-400"
          >
            رجوع
          </button>
        </div>
      </div>
    </div>
  );
}

function ExamTile({
  exam,
  recommended,
  locked,
  delay,
  disabled,
  onStart,
}: {
  exam: MockExamCard;
  recommended: boolean;
  locked: boolean;
  delay: number;
  disabled: boolean;
  onStart: () => void;
}) {
  const isDone = exam.status === "done";
  const isIncomplete = exam.status === "incomplete";
  const isReady = exam.status === "ready";
  const isNext = recommended && !isDone;
  const hasScore = exam.score != null && exam.total != null;
  const scorePct =
    hasScore && exam.total! > 0
      ? Math.round((exam.score! / exam.total!) * 100)
      : 0;

  const shell = isNext
    ? "bg-teal-600 text-white shadow-lg shadow-teal-600/30 ring-2 ring-teal-400"
    : isDone
      ? "bg-emerald-50 text-ink ring-1 ring-emerald-200/90"
      : isIncomplete
        ? "bg-amber-50 text-ink ring-1 ring-amber-200/90"
        : locked
          ? "bg-slate-50/90 text-ink ring-1 ring-slate-200"
          : "bg-white text-ink ring-1 ring-slate-200/90 hover:ring-teal-300";

  const badge = isDone
    ? { text: "مكتمل", cls: "bg-emerald-600 text-white" }
    : isNext
      ? {
          text: locked ? "سجّل" : "التالي",
          cls: "bg-white/20 text-white",
        }
      : isIncomplete
        ? { text: "بدأته", cls: "bg-amber-500 text-white" }
        : locked
          ? { text: "مقفل", cls: "bg-slate-200 text-slate-600" }
          : { text: "لم يبدأ", cls: "bg-slate-100 text-slate-600" };

  const numCls = isNext
    ? "bg-white/20 text-white"
    : isDone
      ? "bg-emerald-600 text-white"
      : isIncomplete
        ? "bg-amber-500 text-white"
        : "bg-slate-100 text-slate-700";

  const accent = isNext
    ? "bg-white/35"
    : isDone
      ? "bg-emerald-500"
      : isIncomplete
        ? "bg-amber-400"
        : "bg-slate-200";

  return (
    <li
      className="animate-fade-up list-none"
      style={{ animationDelay: `${delay}ms` }}
    >
      <button
        type="button"
        onClick={onStart}
        disabled={disabled}
        className={`relative flex min-h-[7.25rem] w-full flex-col items-start justify-between overflow-hidden rounded-[1.35rem] p-3.5 pe-3 text-start transition active:scale-[0.99] disabled:opacity-60 ${shell}`}
      >
        <span
          className={`absolute inset-y-3 start-0 w-1 rounded-full ${accent}`}
          aria-hidden
        />

        <div className="flex w-full items-center justify-between gap-2 ps-1.5">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-extrabold tabular-nums ${numCls}`}
            dir="ltr"
          >
            {exam.number}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.cls}`}
          >
            {locked && isReady && <LockIcon />}
            {badge.text}
          </span>
        </div>

        <div className="mt-2 w-full ps-1.5">
          <p
            className={`text-[14px] font-extrabold leading-none ${
              isNext ? "text-white" : "text-ink"
            }`}
          >
            {exam.title_ar}
          </p>

          {hasScore ? (
            <div className="mt-2 space-y-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <p
                  className={`text-[15px] font-extrabold tabular-nums ${
                    isNext
                      ? "text-white"
                      : isDone
                        ? "text-emerald-800"
                        : "text-amber-950"
                  }`}
                  dir="ltr"
                >
                  <LtrNum>
                    {exam.score}/{exam.total}
                  </LtrNum>
                </p>
                <span
                  className={`text-[10px] font-bold tabular-nums ${
                    isNext
                      ? "text-teal-50"
                      : isDone
                        ? "text-emerald-700"
                        : "text-amber-800"
                  }`}
                  dir="ltr"
                >
                  {scorePct}%
                </span>
              </div>
              <div
                className={`h-1 overflow-hidden rounded-full ${
                  isNext ? "bg-white/20" : "bg-black/5"
                }`}
              >
                <div
                  className={`h-full rounded-full ${
                    isNext
                      ? "bg-white"
                      : isDone
                        ? "bg-emerald-500"
                        : "bg-amber-400"
                  }`}
                  style={{ width: `${Math.min(100, scorePct)}%` }}
                />
              </div>
              {isDone && exam.bestTimeMs != null ? (
                <p
                  className={`text-[11px] font-bold tabular-nums ${
                    isNext ? "text-teal-50" : "text-emerald-700/85"
                  }`}
                  dir="ltr"
                >
                  الوقت {formatMs(exam.bestTimeMs)}
                </p>
              ) : isIncomplete ? (
                <p
                  className={`text-[10px] font-semibold ${
                    isNext ? "text-teal-50/90" : "text-amber-800/85"
                  }`}
                >
                  مجاب{" "}
                  <span dir="ltr" className="tabular-nums">
                    {exam.answeredCount ?? 0}/60
                  </span>
                  {" · "}
                  أكمل لحفظ الوقت
                </p>
              ) : null}
            </div>
          ) : (
            <p
              className={`mt-2 text-[11px] font-semibold leading-snug ${
                isNext ? "text-teal-50/90" : "text-slate-500"
              }`}
            >
              <LtrNum>{exam.questions}</LtrNum> سؤال ·{" "}
              <LtrNum>{exam.minutes}</LtrNum> د
            </p>
          )}
        </div>
      </button>
    </li>
  );
}
