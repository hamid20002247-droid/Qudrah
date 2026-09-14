"use client";

import {
  roundTargetSec,
  timerColorForElapsed,
  type DrillRound,
  type SkillTiming,
} from "@/lib/timing";

export function TimeGoalBoard({ timing }: { timing: SkillTiming }) {
  const points = [
    { sec: timing.excellent_sec, label: "ممتاز", tone: "text-teal-700" },
    { sec: timing.good_sec, label: "جيد", tone: "text-green-700" },
    { sec: timing.ok_sec, label: "مقبول", tone: "text-amber-700" },
    { sec: timing.slow_sec, label: "بطيء", tone: "text-orange-700" },
  ];

  return (
    <div className="rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200/80">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-black text-ink">هدف الوقت</p>
        <p className="text-[11px] text-slate-400">لهذا النمط فقط</p>
      </div>

      {/* One spectrum — seconds increase left → right */}
      <div className="mt-4" dir="ltr">
        <div
          className="h-2 w-full rounded-full"
          style={{
            background:
              "linear-gradient(90deg, #0F766E 0%, #16A34A 28%, #D97706 58%, #EA580C 82%, #DC2626 100%)",
          }}
        />
        <div className="mt-2 grid grid-cols-4 gap-1">
          {points.map((p) => (
            <div key={p.label} className="min-w-0 text-center">
              <p className={`text-[11px] font-bold ${p.tone}`}>{p.label}</p>
              <p className="mt-0.5 text-sm font-black tabular-nums text-ink">
                حتى {p.sec}
                <span className="ms-0.5 text-[10px] font-semibold text-slate-400">
                  ث
                </span>
              </p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-400">
          أبطأ من {timing.slow_sec} ث ={" "}
          <span className="font-bold text-rose-600">ضعيف</span>
        </p>
      </div>
    </div>
  );
}

export function QuestionTimerBar({
  elapsedMs,
  budgetMs,
  timing,
  round,
  /** After the student answers — freeze visuals; never show ممتاز/جيد next to خطأ */
  locked = false,
}: {
  elapsedMs: number;
  budgetMs: number;
  timing: SkillTiming;
  round: DrillRound;
  locked?: boolean;
}) {
  const remaining = Math.max(0, 1 - elapsedMs / Math.max(budgetMs, 1));
  const color = locked
    ? "#CBD5E1"
    : timerColorForElapsed(elapsedMs, timing);
  const target = roundTargetSec(round, timing);
  const elapsedSec = Math.round(elapsedMs / 1000);

  return (
    <div
      className={`w-full rounded-2xl px-3 py-2.5 ring-1 ${
        locked ? "bg-slate-50/80 ring-slate-100" : "bg-slate-50 ring-slate-100"
      }`}
    >
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold">
        <span className="text-slate-500">
          مرجع الوقت{" "}
          <span className="tabular-nums text-ink">≤ {target} ث</span>
        </span>
        <span
          className="tabular-nums font-bold text-slate-600"
          dir="ltr"
          aria-label={`الوقت المنقضي ${elapsedSec} ثانية`}
        >
          {elapsedSec} ث
        </span>
      </div>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-slate-200/80">
        {!locked && <BandMarks budgetMs={budgetMs} timing={timing} />}
        <div
          className="relative z-[1] h-full rounded-full transition-[width,background-color] duration-150"
          style={{
            width: locked ? "100%" : `${remaining * 100}%`,
            backgroundColor: color,
            opacity: locked ? 0.55 : 1,
          }}
        />
      </div>
    </div>
  );
}

function BandMarks({
  budgetMs,
  timing,
}: {
  budgetMs: number;
  timing: SkillTiming;
}) {
  const budgetSec = budgetMs / 1000;
  const marks = [
    timing.excellent_sec,
    timing.good_sec,
    timing.ok_sec,
    timing.slow_sec,
  ].filter((s) => s < budgetSec);

  return (
    <>
      {marks.map((sec) => {
        // Bar width = remaining time; mark sits where remaining hits this band.
        const left = (1 - sec / budgetSec) * 100;
        return (
          <span
            key={sec}
            className="absolute top-0 z-0 h-full w-px bg-slate-400/50"
            style={{ left: `${left}%` }}
            title={`${sec}ث`}
          />
        );
      })}
    </>
  );
}
