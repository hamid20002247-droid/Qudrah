"use client";

import type { RoundResult, Skill } from "@/lib/types";
import {
  formatGoalClock,
  roundMeta,
  roundTotalGoalSec,
  type DrillRound,
  type SkillTiming,
} from "@/lib/timing";
import { roundQuestionCount } from "@/lib/drillDeck";
import { formatMs } from "@/components/ui/ProgressRing";
import { isFinalUnlocked } from "@/store/progress";

type Props = {
  skill: Skill;
  timing: SkillTiming;
  rounds: Partial<Record<1 | 2 | 3 | 4, RoundResult>>;
  onStart: (round: DrillRound) => void;
};

const BAR: Record<string, string> = {
  teal: "from-teal-500 to-teal-600",
  amber: "from-amber-400 to-amber-500",
  rose: "from-rose-400 to-rose-500",
  ink: "from-slate-800 to-slate-950",
};

function ResultStrip({ result }: { result: RoundResult }) {
  const perfect = result.lastScore === result.lastTotal;

  if (!perfect) {
    return (
      <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2.5">
        <p className="text-base font-black tabular-nums text-ink">
          {result.lastScore}
          <span className="text-slate-400">/{result.lastTotal}</span>
        </p>
        <p className="text-[12px] font-bold text-teal-700">ارفع درجتك ←</p>
      </div>
    );
  }

  return (
    <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-teal-50 px-3 py-2.5 ring-1 ring-teal-100">
      <div>
        <p className="text-base font-black tabular-nums text-ink">
          {result.lastScore}/{result.lastTotal}
        </p>
        <p className="mt-0.5 text-[12px] font-semibold tabular-nums text-slate-600">
          متوسط {formatMs(result.lastAvgTimeMs)}
        </p>
      </div>
      <p className="shrink-0 text-[12px] font-bold text-teal-800">اكسر وقتك ←</p>
    </div>
  );
}

function RoundCard({
  round,
  timing,
  skill,
  result,
  onStart,
}: {
  round: 1 | 2 | 3;
  timing: SkillTiming;
  skill: Skill;
  result?: RoundResult;
  onStart: () => void;
}) {
  const meta = roundMeta(round, timing);
  const count = roundQuestionCount(skill, round);
  const totalGoal = roundTotalGoalSec(round, timing, count);
  const hasResult = (result?.attempts ?? 0) > 0;

  return (
    <button
      type="button"
      onClick={onStart}
      className="group w-full overflow-hidden rounded-3xl bg-white text-start ring-1 ring-slate-200/90 transition hover:ring-teal-300"
    >
      <div
        className={`h-1 w-full bg-gradient-to-l ${BAR[meta.accent] ?? BAR.teal}`}
      />
      <div className="px-4 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[15px] font-black text-ink">{meta.title}</p>
          <p className="text-[11px] font-bold text-slate-400">
            {formatGoalClock(totalGoal)}
          </p>
        </div>
        <p className="mt-1 text-[13px] leading-snug text-slate-500">
          {meta.focus}
        </p>
        {hasResult && result && <ResultStrip result={result} />}
      </div>
    </button>
  );
}

export function TrainingHub({ skill, timing, rounds, onStart }: Props) {
  const unlocked = isFinalUnlocked(rounds);
  const finalMeta = roundMeta(4, timing);
  const finalCount = roundQuestionCount(skill, 4);
  const finalGoal = roundTotalGoalSec(4, timing, finalCount);
  const finalResult = rounds[4];
  const doneCount = [1, 2, 3].filter(
    (n) => (rounds[n as 1 | 2 | 3]?.attempts ?? 0) > 0
  ).length;

  return (
    <section className="mt-6 animate-fade-up space-y-3">
      <div className="mb-1">
        <p className="text-sm font-black text-ink">مسار التدريب</p>
        <div className="mt-2.5 flex items-center gap-1.5">
          {[1, 2, 3].map((n) => {
            const done = (rounds[n as 1 | 2 | 3]?.attempts ?? 0) > 0;
            return (
              <div
                key={n}
                className={`h-1 flex-1 rounded-full ${
                  done ? "bg-teal-500" : "bg-slate-200"
                }`}
              />
            );
          })}
          <div
            className={`h-1 flex-1 rounded-full ${
              unlocked ? "bg-slate-900" : "bg-slate-200"
            }`}
          />
        </div>
        <p className="mt-1.5 text-[11px] text-slate-400">
          {doneCount}/3 · ثم النهائي
        </p>
      </div>

      {([1, 2, 3] as const).map((r) => (
        <RoundCard
          key={r}
          round={r}
          timing={timing}
          skill={skill}
          result={rounds[r]}
          onStart={() => onStart(r)}
        />
      ))}

      <div
        className={`relative overflow-hidden rounded-[1.75rem] ${
          unlocked
            ? "bg-slate-950 text-white shadow-lg shadow-slate-900/25"
            : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
        }`}
      >
        {unlocked && (
          <div
            className="pointer-events-none absolute inset-0 opacity-35"
            style={{
              background:
                "radial-gradient(ellipse at 15% 0%, #0D9488 0%, transparent 50%)",
            }}
          />
        )}
        <div className="relative p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p
                className={`text-[10px] font-bold ${
                  unlocked ? "text-teal-300" : "text-slate-400"
                }`}
              >
                {unlocked ? "مفتوح" : "مقفل"}
              </p>
              <p
                className={`text-lg font-black ${
                  unlocked ? "text-white" : "text-slate-600"
                }`}
              >
                {finalMeta.title}
              </p>
            </div>
            {!unlocked ? (
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-500"
                aria-hidden
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
              </span>
            ) : (
              <p className="text-[11px] font-bold text-teal-200">
                {finalCount} أسئلة · {formatGoalClock(finalGoal)}
              </p>
            )}
          </div>

          {!unlocked && (
            <p className="mt-2 text-[12px] text-slate-500">
              أكمل الثلاثة أولاً ({doneCount}/3)
            </p>
          )}

          {unlocked && finalResult && finalResult.attempts > 0 && (
            <div className="mt-3">
              <ResultStrip result={finalResult} />
            </div>
          )}

          {unlocked && (
            <button
              type="button"
              onClick={() => onStart(4)}
              className="mt-3 flex min-h-12 w-full items-center justify-center rounded-2xl bg-teal-500 text-[15px] font-black text-white transition hover:bg-teal-400"
            >
              {finalResult?.attempts ? "أعد النهائي" : "ابدأ النهائي"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
