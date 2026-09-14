"use client";

import { useEffect, useRef, useState } from "react";
import type { Question } from "@/lib/types";
import { ChoiceList } from "@/components/ui/ChoiceList";
import { MathText } from "@/components/ui/MathText";
import { formatCountdown } from "@/components/ui/ProgressRing";
import { finalExamTotalSec } from "@/lib/timing";
import { scrollWindowToTop } from "@/lib/scroll";

export type FinalAnswerRecord = {
  qid: string;
  chosen: number;
  correct: boolean;
  timeMs: number;
};

type Props = {
  title: string;
  questions: Question[];
  onComplete: (records: FinalAnswerRecord[], totalTimeMs: number) => void;
  onExit: () => void;
  /** Hide site chrome offset (full-screen mock). */
  flushChrome?: boolean;
};

export function FinalExam({
  title,
  questions,
  onComplete,
  onExit,
  flushChrome = false,
}: Props) {
  const totalSec = finalExamTotalSec(questions.length);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    Array(questions.length).fill(null)
  );
  const [remaining, setRemaining] = useState(totalSec);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  const startTs = useRef(Date.now());
  const qEnter = useRef(Date.now());
  const timeSpent = useRef<number[]>(Array(questions.length).fill(0));
  const submitted = useRef(false);
  const answersRef = useRef(answers);
  const indexRef = useRef(index);
  const onCompleteRef = useRef(onComplete);
  const questionsRef = useRef(questions);

  answersRef.current = answers;
  indexRef.current = index;
  onCompleteRef.current = onComplete;
  questionsRef.current = questions;

  const answeredCount = answers.filter((a) => a != null).length;
  const unanswered = questions.length - answeredCount;
  const q = questions[index];

  const finish = () => {
    if (submitted.current) return;
    submitted.current = true;
    const qs = questionsRef.current;
    const ans = answersRef.current;
    const i = indexRef.current;
    timeSpent.current[i] += Date.now() - qEnter.current;
    const totalTimeMs = Date.now() - startTs.current;
    const records: FinalAnswerRecord[] = qs.map((question, qi) => {
      const chosen = ans[qi];
      const answered = chosen != null;
      return {
        qid: question.id,
        chosen: answered ? chosen : -1,
        correct: answered && chosen === question.correct_index,
        timeMs:
          timeSpent.current[qi] ||
          Math.round(totalTimeMs / Math.max(qs.length, 1)),
      };
    });
    onCompleteRef.current(records, totalTimeMs);
  };

  // Stable countdown — never reset by parent re-renders
  useEffect(() => {
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (remaining === 0) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- finish via refs
  }, [remaining]);

  useEffect(() => {
    const onLeave = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, []);

  const goTo = (next: number) => {
    if (next < 0 || next >= questions.length || next === index) return;
    timeSpent.current[index] += Date.now() - qEnter.current;
    setIndex(next);
    qEnter.current = Date.now();
    setMapOpen(false);
    scrollWindowToTop("auto");
  };

  const select = (choice: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = choice;
      return next;
    });
  };

  const urgent = remaining < 60;
  const warn = remaining < 3 * 60;
  const isLast = index + 1 >= questions.length;
  const progress = Math.max(0, remaining / totalSec);
  const stickyTop = flushChrome ? "top-0" : "top-14";
  const mobileBottom = flushChrome ? "bottom-0" : "bottom-14";

  if (!q) return null;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-[7.5rem] pt-3 lg:pb-12 lg:pt-6">
      {/* ════ Mobile header ════ */}
      <header className={`sticky ${stickyTop} z-30 -mx-4 border-b border-slate-100 bg-white/95 px-4 py-2.5 backdrop-blur-md lg:hidden`}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExit}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600"
            aria-label="خروج"
          >
            <IconBack />
          </button>

          <button
            type="button"
            onClick={() => setMapOpen(true)}
            className="flex h-10 flex-1 items-center justify-center gap-1 rounded-xl bg-slate-50 text-sm font-black tabular-nums text-ink ring-1 ring-slate-200"
          >
            {index + 1}
            <span className="font-bold text-slate-400">/{questions.length}</span>
          </button>

          <TimerBadge remaining={remaining} urgent={urgent} warn={warn} size="sm" />
        </div>
        <ProgressLine progress={progress} urgent={urgent} warn={warn} />
      </header>

      {/* ════ Desktop header ════ */}
      <header className="mb-6 hidden rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80 lg:block">
        <div className="flex items-center gap-5">
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={onExit}
              className="rounded-xl px-3 py-2 text-sm font-bold text-slate-500 transition hover:bg-slate-50 hover:text-ink"
            >
              خروج
            </button>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <p className="text-[11px] font-bold text-slate-400">{title}</p>
              <p className="mt-0.5 text-base font-black text-ink">
                سؤال {index + 1}
                <span className="font-bold text-slate-400">
                  {" "}
                  من {questions.length}
                </span>
                <span className="ms-2 text-sm font-bold text-teal-700">
                  مجاب {answeredCount}
                </span>
              </p>
            </div>
          </div>

          <div className="min-w-0 flex-1 px-2">
            <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-400">الوقت المتبقي</span>
              <span
                className={`tabular-nums ${
                  urgent
                    ? "text-rose-600"
                    : warn
                      ? "text-amber-700"
                      : "text-teal-700"
                }`}
                dir="ltr"
              >
                {formatCountdown(Math.max(0, remaining))}
              </span>
            </div>
            <ProgressLine progress={progress} urgent={urgent} warn={warn} />
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <TimerBadge
              remaining={remaining}
              urgent={urgent}
              warn={warn}
              size="lg"
            />
            <button
              type="button"
              onClick={() => setConfirmSubmit(true)}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
            >
              تسليم
            </button>
          </div>
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:items-start lg:gap-6">
        {/* Desktop sidebar */}
        <aside className="sticky top-6 hidden rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 lg:block">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400">الأسئلة</p>
            <p className="text-[11px] font-bold tabular-nums text-teal-700">
              {answeredCount}/{questions.length}
            </p>
          </div>
          <div className={`grid gap-1.5 ${
            questions.length > 40 ? "grid-cols-6" : "grid-cols-5"
          }`}>
            {questions.map((_, i) => (
              <NavChip
                key={i}
                n={i + 1}
                active={i === index}
                answered={answers[i] != null}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              className="flex h-11 items-center justify-center rounded-xl bg-slate-50 text-sm font-bold text-slate-700 disabled:opacity-30"
            >
              السابق
            </button>
            <button
              type="button"
              onClick={() =>
                isLast ? setConfirmSubmit(true) : goTo(index + 1)
              }
              className={`flex h-11 items-center justify-center rounded-xl text-sm font-bold text-white ${
                isLast ? "bg-slate-950" : "bg-teal-600"
              }`}
            >
              {isLast ? "تسليم" : "التالي"}
            </button>
          </div>
        </aside>

        {/* Question */}
        <main className="lg:rounded-3xl lg:bg-white lg:p-8 lg:shadow-sm lg:ring-1 lg:ring-slate-200/80">
          <p className="mt-4 text-[1.05rem] font-semibold leading-relaxed text-ink lg:mt-0 lg:text-[1.25rem] lg:leading-relaxed">
            <MathText text={q.prompt_ar} />
          </p>
          <div className="mt-5 max-w-xl lg:mt-8">
            <ChoiceList
              choices={q.choices_ar}
              selected={answers[index]}
              onSelect={select}
            />
          </div>
          <p className="mt-6 hidden text-[12px] text-slate-400 lg:block">
            بلا تصحيح أثناء الحل · يمكنك الرجوع وتغيير إجابتك
          </p>
        </main>
      </div>

      {/* Mobile bottom */}
      <div className={`fixed inset-x-0 ${mobileBottom} z-30 border-t border-slate-100 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden`}>
        <div className="mx-auto flex max-w-lg gap-2">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 disabled:opacity-25"
            aria-label="السابق"
          >
            <IconNext />
          </button>
          <button
            type="button"
            onClick={() =>
              isLast ? setConfirmSubmit(true) : goTo(index + 1)
            }
            className={`flex h-12 flex-1 items-center justify-center rounded-2xl text-[15px] font-black text-white ${
              isLast ? "bg-slate-950" : "bg-teal-600"
            }`}
          >
            {isLast ? "تسليم" : "التالي"}
          </button>
          <button
            type="button"
            onClick={() => setMapOpen(true)}
            className="flex h-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 px-3 text-[12px] font-bold text-slate-700"
          >
            خريطة
          </button>
        </div>
      </div>

      {mapOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/45 lg:hidden">
          <button
            type="button"
            className="min-h-0 flex-1"
            aria-label="إغلاق"
            onClick={() => setMapOpen(false)}
          />
          <div className="rounded-t-3xl bg-white px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200" />
            <div className="mb-3 flex items-center justify-between">
              <p className="text-base font-black text-ink">خريطة الأسئلة</p>
              <p className="text-sm font-bold tabular-nums text-teal-700">
                {answeredCount}/{questions.length}
              </p>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, i) => (
                <NavChip
                  key={i}
                  n={i + 1}
                  active={i === index}
                  answered={answers[i] != null}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setMapOpen(false)}
              className="mt-4 flex h-12 w-full items-center justify-center rounded-2xl bg-slate-100 font-bold text-slate-700"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {confirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl">
            <p className="text-lg font-black text-ink">تسليم الاختبار؟</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {unanswered > 0
                ? `باقي ${unanswered} بلا إجابة. بعد التسليم يظهر التصحيح.`
                : "أجبت على الكل. بعد التسليم يظهر التصحيح."}
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmSubmit(false)}
                className="flex h-12 flex-1 items-center justify-center rounded-2xl bg-slate-100 font-bold text-slate-700"
              >
                رجوع
              </button>
              <button
                type="button"
                onClick={finish}
                className="flex h-12 flex-1 items-center justify-center rounded-2xl bg-teal-600 font-bold text-white"
              >
                تسليم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TimerBadge({
  remaining,
  urgent,
  warn,
  size,
}: {
  remaining: number;
  urgent: boolean;
  warn: boolean;
  size: "sm" | "lg";
}) {
  const cls = urgent
    ? "bg-rose-600 text-white"
    : warn
      ? "bg-amber-100 text-amber-950 ring-1 ring-amber-200"
      : "bg-slate-950 text-white";

  return (
    <div
      className={`flex flex-col items-center justify-center ${cls} ${
        size === "lg"
          ? "min-w-[7.5rem] rounded-2xl px-5 py-2.5"
          : "min-h-10 min-w-[5.25rem] rounded-xl px-2.5"
      }`}
      aria-live="polite"
      aria-atomic="true"
    >
      {size === "lg" && (
        <span className="text-[10px] font-bold opacity-70">الوقت المتبقي</span>
      )}
      <span
        className={`font-black tabular-nums tracking-wide ${
          size === "lg" ? "text-3xl leading-none" : "text-base"
        }`}
        dir="ltr"
      >
        {formatCountdown(Math.max(0, remaining))}
      </span>
    </div>
  );
}

function ProgressLine({
  progress,
  urgent,
  warn,
}: {
  progress: number;
  urgent: boolean;
  warn: boolean;
}) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full transition-[width] duration-1000 ease-linear ${
          urgent ? "bg-rose-500" : warn ? "bg-amber-400" : "bg-teal-500"
        }`}
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}

function NavChip({
  n,
  active,
  answered,
  onClick,
}: {
  n: number;
  active: boolean;
  answered: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex aspect-square items-center justify-center rounded-xl text-sm font-black tabular-nums transition ${
        active
          ? "bg-teal-600 text-white shadow-sm shadow-teal-600/25"
          : answered
            ? "bg-teal-50 text-teal-900 ring-1 ring-teal-200 hover:bg-teal-100"
            : "bg-slate-50 text-slate-500 ring-1 ring-slate-200 hover:bg-slate-100"
      }`}
    >
      {n}
    </button>
  );
}

function IconBack() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconNext() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 18l6-6-6-6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
