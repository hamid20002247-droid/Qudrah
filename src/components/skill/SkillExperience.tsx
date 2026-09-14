"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import type { Question, Skill } from "@/lib/types";
import { VisualRenderer } from "@/components/visuals/VisualRenderer";
import { ChoiceList } from "@/components/ui/ChoiceList";
import { MathText } from "@/components/ui/MathText";
import { formatMs } from "@/components/ui/ProgressRing";
import { QuestionTimerBar, TimeGoalBoard } from "@/components/ui/TimeGoal";
import { TrainingHub } from "@/components/skill/TrainingHub";
import { FinalExam } from "@/components/skill/FinalExam";
import type { FinalAnswerRecord } from "@/components/skill/FinalExam";
import { track } from "@/lib/analytics";
import { useProgress, isFinalUnlocked } from "@/store/progress";
import { ALL_SKILLS } from "@/content/arithmetic";
import { buildRoundDeck } from "@/lib/drillDeck";
import { scrollWindowToTop } from "@/lib/scroll";
import {
  buildFreePathState,
  isSkillOpenWithoutAuth,
} from "@/lib/access";
import { useAuth } from "@/components/auth/AuthProvider";
import { GuestFreePath } from "@/components/auth/GuestFreePath";
import { useClientReady } from "@/components/ClientBody";
import {
  DEFAULT_TIMING,
  bandForMs,
  bandLabel,
  type DrillRound,
  roundMeta,
  timerBudgetMs,
  timingNote,
  formatGoalClock,
  roundTotalGoalSec,
} from "@/lib/timing";
import type { SkillProgress } from "@/lib/types";

const PHASES = [
  { id: "see" as const, label: "تصوّر" },
  { id: "trick" as const, label: "اختصار" },
  { id: "drill" as const, label: "تدريب" },
];

/** Stable empty object — `?? {}` in a Zustand selector recreates each snapshot and loops. */
const EMPTY_ROUNDS: SkillProgress["rounds"] = {};

type AnswerRecord = {
  qid: string;
  chosen: number;
  correct: boolean;
  timeMs: number;
};

type Phase = "see" | "trick" | "pick" | "drill" | "done";

export function SkillExperience({ skill }: { skill: Skill }) {
  const ready = useClientReady();
  const { user, configured } = useAuth();
  const startSkill = useProgress((s) => s.startSkill);
  const completeSkill = useProgress((s) => s.completeSkill);
  const getSkillProgress = useProgress((s) => s.getSkillProgress);
  const rounds = useProgress(
    (s) => s.skills[skill.id]?.rounds ?? EMPTY_ROUNDS
  );

  const [phase, setPhase] = useState<Phase>("see");
  const [round, setRound] = useState<DrillRound>(1);
  const [deck, setDeck] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [records, setRecords] = useState<AnswerRecord[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const qStart = useRef(Date.now());
  const trickTracked = useRef(false);

  useEffect(() => {
    startSkill(skill.id);
    track("skill_opened", { skill_id: skill.id });
  }, [skill.id, startSkill]);

  // Phase / question / round changes are not route changes — force top.
  useEffect(() => {
    scrollWindowToTop("auto");
  }, [phase, round, qIndex]);

  useEffect(() => {
    if (phase === "trick" && !trickTracked.current) {
      trickTracked.current = true;
      track("trick_viewed", { skill_id: skill.id });
    }
  }, [phase, skill.id]);

  useEffect(() => {
    if (phase !== "drill" || revealed) return;
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, [phase, revealed, qIndex]);

  const q = deck[qIndex];
  const skillIndex = ALL_SKILLS.findIndex((s) => s.id === skill.id);
  const nextSkill = ALL_SKILLS[skillIndex + 1];
  const timing = skill.timing ?? DEFAULT_TIMING;
  const meta = roundMeta(round, timing);
  const budget = timerBudgetMs(round, timing, q?.difficulty ?? "easy");
  const elapsed = Math.max(0, now - qStart.current);
  const correctCount = records.filter((r) => r.correct).length;
  const avgTime =
    records.length > 0
      ? records.reduce((a, r) => a + r.timeMs, 0) / records.length
      : 0;
  const totalTime = records.reduce((a, r) => a + r.timeMs, 0);
  const finalOpen = isFinalUnlocked(rounds);
  const guestFree =
    ready &&
    configured &&
    !user &&
    isSkillOpenWithoutAuth(skill.id);
  const freePath = guestFree
    ? buildFreePathState(getSkillProgress, skill.id)
    : null;

  const startRound = (r: DrillRound) => {
    if (r === 4 && !isFinalUnlocked(rounds)) return;
    setRound(r);
    setDeck(buildRoundDeck(skill, r));
    setQIndex(0);
    setSelected(null);
    setRevealed(false);
    setRecords([]);
    qStart.current = Date.now();
    setNow(Date.now());
    setPhase("drill");
    track("drill_started", { skill_id: skill.id, round: r });
  };

  const finishFinal = (recs: FinalAnswerRecord[], totalTimeMs: number) => {
    const mapped: AnswerRecord[] = recs.map((r) => ({
      qid: r.qid,
      chosen: r.chosen,
      correct: r.correct,
      timeMs: r.timeMs,
    }));
    setRecords(mapped);
    const correct = mapped.filter((r) => r.correct).length;
    const avg =
      mapped.reduce((a, r) => a + r.timeMs, 0) / Math.max(mapped.length, 1);
    completeSkill(skill.id, correct, deck.length || mapped.length, avg, 4, totalTimeMs);
    track("skill_completed", {
      skill_id: skill.id,
      score: correct,
      avg_time: Math.round(avg),
      round: 4,
    });
    setPhase("done");
  };

  const answer = (index: number) => {
    if (revealed || !q) return;
    setSelected(index);
    setRevealed(true);
    const timeMs = Date.now() - qStart.current;
    const ok = index === q.correct_index;
    setRecords((prev) => [
      ...prev,
      { qid: q.id, chosen: index, correct: ok, timeMs },
    ]);
    track("drill_question_answered", {
      skill_id: skill.id,
      q_id: q.id,
      correct: ok,
      time_ms: timeMs,
      round,
    });
    // Keep the chosen option visible above the result dock
    requestAnimationFrame(() => {
      const buttons = document.querySelectorAll('[role="listbox"] button');
      buttons[index]?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  };

  const nextQuestion = () => {
    if (qIndex + 1 >= deck.length) {
      const correct = records.filter((r) => r.correct).length;
      const avg =
        records.reduce((a, r) => a + r.timeMs, 0) / Math.max(records.length, 1);
      const total = records.reduce((a, r) => a + r.timeMs, 0);
      completeSkill(skill.id, correct, deck.length, avg, round, total);
      track("skill_completed", {
        skill_id: skill.id,
        score: correct,
        avg_time: Math.round(avg),
        round,
      });
      setPhase("done");
      return;
    }
    setQIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
    qStart.current = Date.now();
    setNow(Date.now());
  };

  const recordByQ = useMemo(() => {
    const map = new Map(records.map((r) => [r.qid, r]));
    return map;
  }, [records]);

  if (phase === "drill" && round === 4 && deck.length > 0) {
    return (
      <FinalExam
        title={meta.title}
        questions={deck}
        onComplete={finishFinal}
        onExit={() => setPhase("pick")}
      />
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-28 pt-3">
      <div className="mb-3 flex items-center gap-2">
        <Link
          href="/skills"
          className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-2xl bg-white px-3 text-sm font-extrabold text-ink ring-1 ring-slate-200 transition active:scale-[0.98] hover:ring-teal-300"
          aria-label="رجوع للمهارات"
        >
          <span aria-hidden className="text-lg leading-none">
            →
          </span>
          رجوع
        </Link>
        <p className="min-w-0 flex-1 truncate text-center text-[11px] font-bold text-slate-400">
          {skillIndex + 1} / {ALL_SKILLS.length}
        </p>
        <span className="w-[4.5rem]" aria-hidden />
      </div>

      {phase !== "done" && (
        <div className="sticky top-14 z-30 -mx-4 mb-4 border-b border-teal-100/80 bg-white/95 px-4 py-2.5 backdrop-blur-md">
          <div className="grid grid-cols-3 gap-2">
            {PHASES.map((p, i) => {
              const active =
                phase === p.id ||
                (phase === "pick" && p.id === "drill") ||
                (phase === "drill" && p.id === "drill");
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    scrollWindowToTop("auto");
                    if (p.id === "drill") {
                      if (phase === "drill") return;
                      setPhase("pick");
                    } else {
                      setPhase(p.id);
                    }
                  }}
                  className={`flex min-h-[3.15rem] flex-col items-center justify-center rounded-2xl text-center transition active:scale-[0.98] ${
                    active
                      ? "bg-teal-600 text-white shadow-[0_12px_28px_-12px_rgba(13,148,136,0.7)] ring-2 ring-teal-700/30"
                      : "bg-slate-100 text-slate-600 ring-1 ring-slate-200 hover:bg-teal-50 hover:text-teal-800 hover:ring-teal-200"
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold ${
                      active ? "text-teal-100" : "text-slate-400"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm font-extrabold leading-none">
                    {p.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <h1 className="text-2xl font-extrabold text-ink">{skill.title_ar}</h1>
      <p className="mt-1 text-sm text-slate-600">{skill.hook_ar}</p>

      {phase === "see" && guestFree && freePath && (
        <div className="mt-4">
          <div className="flex items-center justify-between gap-2 rounded-2xl bg-teal-50 px-3 py-2.5 ring-1 ring-teal-100">
            <p className="text-[12px] font-bold text-teal-900">
              بدون حساب {freePath.items.findIndex((x) => x.id === skill.id) + 1}{" "}
              من {freePath.total}
            </p>
            <p className="text-[11px] font-semibold tabular-nums text-teal-700">
              {freePath.completedCount}/{freePath.total}
            </p>
          </div>
        </div>
      )}

      {phase === "see" && (
        <section className="mt-6 animate-fade-up">
          <div className="mb-4 rounded-2xl bg-teal-700 px-4 py-3 text-white">
            <p className="text-[11px] font-semibold text-teal-100">
              الخطوة 1 — التصوّر
            </p>
            <p className="mt-0.5 text-sm font-bold leading-snug">
              حرّك الشكل أولاً، ثم اقرأ النقاط تحته.
            </p>
          </div>
          <VisualRenderer spec={skill.visual} skillId={skill.id} />
          <ul className="mt-5 space-y-3">
            {skill.intuition_ar.map((line, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-2xl bg-white px-4 py-3 text-[15px] leading-relaxed text-slate-800 ring-1 ring-slate-100"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-black text-teal-800">
                  {i + 1}
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setPhase("trick")}
            className="mt-6 flex min-h-14 w-full items-center justify-center rounded-2xl bg-teal-600 text-base font-bold text-white"
          >
            التالي: الاختصار
          </button>
        </section>
      )}

      {phase === "trick" && (
        <section className="mt-6 animate-fade-up space-y-4">
          <div className="rounded-2xl bg-amber-500 px-4 py-3 text-amber-950">
            <p className="text-[11px] font-semibold opacity-80">
              الخطوة 2 — الاختصار
            </p>
            <p className="mt-0.5 text-sm font-bold">
              احفظه ثم افتح مسار التدريب.
            </p>
          </div>
          <div className="rounded-3xl bg-amber-50 p-5 ring-2 ring-amber-300/90">
            <p className="text-[1.25rem] font-black leading-snug text-ink">
              {skill.trick_ar.statement}
            </p>
            <ol className="mt-4 space-y-3">
              {skill.trick_ar.steps.map((s, i) => (
                <li key={i} className="flex gap-3 text-[15px] text-slate-800">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-400 text-xs font-black">
                    {i + 1}
                  </span>
                  <span className="pt-0.5 leading-relaxed">{s}</span>
                </li>
              ))}
            </ol>
            <div className="mt-5 rounded-2xl bg-white px-4 py-3 text-[15px] leading-relaxed text-slate-800 ring-1 ring-amber-100">
              <span className="font-black text-amber-900">مثال: </span>
              {skill.trick_ar.example_ar}
            </div>
          </div>

          <TimeGoalBoard timing={timing} />

          <button
            type="button"
            onClick={() => setPhase("pick")}
            className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-teal-600 text-base font-bold text-white"
          >
            مسار التدريب
          </button>
        </section>
      )}

      {phase === "pick" && (
        <TrainingHub
          skill={skill}
          timing={timing}
          rounds={rounds}
          onStart={startRound}
        />
      )}

      {phase === "drill" && round !== 4 && q && (
        <section>
          <div className="sticky top-14 z-30 -mx-4 mb-4 border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur-md">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="truncate text-[12px] font-black text-ink">
                {meta.title}
              </p>
              <span className="shrink-0 text-[11px] font-bold tabular-nums text-slate-500">
                {qIndex + 1}/{deck.length}
              </span>
            </div>
            <QuestionTimerBar
              elapsedMs={elapsed}
              budgetMs={budget}
              timing={timing}
              round={round}
              locked={revealed}
            />
          </div>

          <div className="mb-4 flex max-w-full flex-wrap gap-1.5" aria-hidden>
            {deck.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2 ${
                  i < qIndex
                    ? "bg-teal-600"
                    : i === qIndex
                      ? "bg-teal-400"
                      : "bg-slate-200"
                }`}
              />
            ))}
          </div>

          <p className="mb-5 text-lg font-semibold leading-relaxed text-ink">
            <MathText text={q.prompt_ar} />
          </p>
          <ChoiceList
            choices={q.choices_ar}
            selected={selected}
            correctIndex={q.correct_index}
            showResult={revealed}
            revealCorrect={false}
            onSelect={answer}
          />
          {revealed && (
            <>
              <div
                className={
                  selected !== null && selected !== q.correct_index
                    ? "h-52"
                    : "h-32"
                }
                aria-hidden
              />
              <DrillResultDock
                ok={selected === q.correct_index}
                explanation={
                  selected !== null && selected !== q.correct_index
                    ? (q.trap_explanations_ar[selected] ??
                      "راجع الاختصار ثم أعد المحاولة في الجولة التالية.")
                    : null
                }
                nextLabel={
                  qIndex + 1 >= deck.length ? "عرض الملخص" : "التالي"
                }
                onNext={nextQuestion}
              />
            </>
          )}
        </section>
      )}

      {phase === "done" && (
        <section className="mt-6 animate-fade-up">
          <p className="text-center text-sm font-semibold text-teal-700">
            {meta.title} — انتهى
          </p>
          <p className="mt-2 text-center text-4xl font-extrabold tabular-nums text-ink">
            {correctCount}/{deck.length}
          </p>
          <p className="mt-2 text-center text-sm text-slate-600">
            متوسط الوقت: {formatMs(avgTime)} · المجموع: {formatMs(totalTime)}
          </p>
          <p className="mt-1 text-center text-[12px] text-slate-400">
            هدف الجولة كان{" "}
            {formatGoalClock(roundTotalGoalSec(round, timing, deck.length))}
          </p>

          {guestFree && (
            <div className="mt-6">
              <GuestFreePath variant="done" currentSkillId={skill.id} />
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => startRound(round)}
              className="flex min-h-12 items-center justify-center rounded-2xl bg-teal-600 font-bold text-white"
            >
              أعد هذه الجولة (ترتيب جديد)
            </button>
            {round < 3 && (
              <button
                type="button"
                onClick={() => startRound((round + 1) as DrillRound)}
                className="flex min-h-12 items-center justify-center rounded-2xl bg-slate-900 font-bold text-white"
              >
                التدريب التالي
              </button>
            )}
            {round === 3 && finalOpen && (
              <button
                type="button"
                onClick={() => startRound(4)}
                className="flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 font-bold text-white"
              >
                الاختبار النهائي — 25 سؤالاً
              </button>
            )}
            {round === 3 && !finalOpen && (
              <p className="text-center text-[12px] text-slate-500">
                أكمل التدريبات ١ و ٢ و ٣ لفتح الاختبار النهائي.
              </p>
            )}
            <button
              type="button"
              onClick={() => setPhase("pick")}
              className="flex min-h-12 items-center justify-center rounded-2xl bg-slate-100 font-semibold text-slate-800"
            >
              العودة لمسار التدريب
            </button>
          </div>

          <div className="mt-8 space-y-4">
            <h2 className="text-base font-extrabold text-ink">
              الحلول والوقت
            </h2>
            <p className="text-[12px] text-slate-500">
              لكل سؤال طريقة الحل كاملة — حتى إن كانت إجابتك صحيحة.
            </p>
            {deck.map((question, i) => {
              const rec = recordByQ.get(question.id);
              const band = rec
                ? bandForMs(rec.timeMs, timing)
                : "weak";
              return (
                <article
                  key={`${question.id}-${i}`}
                  className="rounded-2xl bg-white p-4 ring-1 ring-slate-100"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-400">
                      سؤال {i + 1}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <span
                        className={
                          rec?.correct ? "text-green-700" : "text-rose-700"
                        }
                      >
                        {rec?.correct ? "صحيح" : "خطأ"}
                      </span>
                      <span className="tabular-nums text-slate-500" dir="ltr">
                        {rec ? formatMs(rec.timeMs) : "—"}
                      </span>
                      {rec?.correct && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
                          {bandLabel(band)}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-[15px] font-semibold leading-relaxed text-ink">
                    <MathText text={question.prompt_ar} />
                  </p>
                  <p className="mt-3 text-sm text-slate-600">
                    إجابتك:{" "}
                    <span className="font-bold text-ink">
                      {rec && rec.chosen >= 0
                        ? question.choices_ar[rec.chosen]
                        : "بلا إجابة"}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-green-800">
                    الصحيحة:{" "}
                    <span className="font-bold">
                      {question.choices_ar[question.correct_index]}
                    </span>
                  </p>
                  <div className="mt-3 rounded-xl bg-teal-50/80 px-3 py-3 text-[13px] leading-relaxed text-slate-800 ring-1 ring-teal-100">
                    <p className="mb-1 text-[11px] font-black text-teal-800">
                      طريقة الحل كاملة
                    </p>
                    {question.solve_ar ??
                      "راجع خطوات الاختصار أعلاه ثم أعد الحل من جديد."}
                  </div>
                  {rec?.correct && (
                    <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
                      ملاحظة الوقت: {timingNote(band, round, true)}
                    </p>
                  )}
                </article>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col gap-3">
            {guestFree ? (
              <GuestFreePath variant="done" currentSkillId={skill.id} />
            ) : nextSkill ? (
              <Link
                href={`/skill/${nextSkill.id}`}
                className="flex min-h-12 items-center justify-center rounded-2xl bg-slate-900 font-bold text-white"
              >
                المهارة التالية: {nextSkill.title_ar}
              </Link>
            ) : (
              <Link
                href="/mock"
                className="flex min-h-12 items-center justify-center rounded-2xl bg-slate-900 font-bold text-white"
              >
                المحاكاة الموقوتة
              </Link>
            )}
            <Link
              href="/skills"
              className="text-center text-sm font-semibold text-teal-700"
            >
              خريطة المهارات
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

/** Portal to body so `fixed` is never trapped by ancestor transforms/animations. */
function DrillResultDock({
  ok,
  explanation,
  nextLabel,
  onNext,
}: {
  ok: boolean;
  explanation: string | null;
  nextLabel: string;
  onNext: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 z-[45] px-4 pb-2 pt-2 bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))]">
      <div className="pointer-events-auto mx-auto flex max-w-lg flex-col gap-2.5 rounded-2xl border border-slate-100 bg-white/95 p-3 shadow-[0_-12px_40px_-16px_rgba(15,23,42,0.35)] backdrop-blur-md">
        {ok ? (
          <p
            className="text-center text-sm font-black tracking-wide text-teal-700"
            aria-live="polite"
          >
            صحيح
          </p>
        ) : (
          <p
            className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm leading-relaxed text-rose-950 ring-1 ring-rose-100"
            aria-live="polite"
          >
            <span className="font-black text-rose-700">خطأ</span>
            {explanation ? (
              <span className="mt-0.5 block text-rose-950/90">{explanation}</span>
            ) : null}
          </p>
        )}
        <button
          type="button"
          onClick={onNext}
          className="flex min-h-12 w-full items-center justify-center rounded-xl bg-teal-600 font-bold text-white"
        >
          {nextLabel}
        </button>
      </div>
    </div>,
    document.body
  );
}
