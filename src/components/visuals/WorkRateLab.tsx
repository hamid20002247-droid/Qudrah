"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

const TOTAL_WORK = 48;
const WORKER_OPTIONS = [1, 2, 3, 4, 6, 8, 12] as const;

export function WorkRateLab({ onInteract, compact }: Props) {
  const [workers, setWorkers] = useState(6);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const days = TOTAL_WORK / workers;
  const optionIndex = WORKER_OPTIONS.indexOf(
    workers as (typeof WORKER_OPTIONS)[number],
  );
  const position = (optionIndex / (WORKER_OPTIONS.length - 1)) * 100;
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const chooseWorkers = useCallback(
    (value: number) => {
      setWorkers(value);
      fire();
    },
    [fire],
  );

  const setFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const index = Math.round(ratio * (WORKER_OPTIONS.length - 1));
    chooseWorkers(WORKER_OPTIONS[index]);
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* The pointer may already have been released. */
    }
  };

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#EFF6FF] to-white ring-1 ring-blue-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-blue-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اسحب المقبض لتغيير عدد العمال، أو اختر مثالاً جاهزاً.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          راقب الأيام وحاصل يوم-عامل عندما يتغيّر العدد.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-blue-50 p-3 text-center ring-1 ring-blue-100">
          <p className="text-[11px] font-bold text-blue-700">العمال</p>
          <p
            className="mt-1 text-3xl font-black tabular-nums text-blue-950"
            dir="ltr"
          >
            {workers}
          </p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-3 text-center ring-1 ring-amber-100">
          <p className="text-[11px] font-bold text-amber-800">الأيام</p>
          <p
            className="mt-1 text-3xl font-black tabular-nums text-amber-950"
            dir="ltr"
          >
            {days}
          </p>
        </div>
      </div>

      <div
        ref={trackRef}
        className="relative mt-6 h-14 touch-none select-none"
        onPointerDown={(event) => {
          event.preventDefault();
          dragging.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          setFromClientX(event.clientX);
        }}
        onPointerMove={(event) => {
          if (dragging.current) setFromClientX(event.clientX);
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        role="slider"
        aria-label="عدد العمال"
        aria-valuemin={WORKER_OPTIONS[0]}
        aria-valuemax={WORKER_OPTIONS[WORKER_OPTIONS.length - 1]}
        aria-valuenow={workers}
      >
        <div className="absolute inset-x-2 top-5 h-3 rounded-full bg-slate-200 ring-1 ring-slate-300" />
        {WORKER_OPTIONS.map((value, index) => (
          <span
            key={value}
            className="absolute top-[22px] h-2 w-2 -translate-x-1/2 rounded-full bg-slate-400"
            style={{
              left: `${(index / (WORKER_OPTIONS.length - 1)) * 100}%`,
            }}
            aria-hidden
          />
        ))}
        <div
          className="absolute top-1 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full bg-ink text-lg font-black text-white shadow-lg"
          style={{ left: `${position}%` }}
          aria-hidden
        >
          ↔
        </div>
      </div>

      <div className="mt-2 grid grid-cols-6 gap-1.5" aria-hidden>
        {Array.from({ length: 12 }, (_, index) => (
          <div
            key={index}
            className={`flex h-9 items-center justify-center rounded-lg text-base transition-colors ${
              index < workers
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-300"
            }`}
          >
            ●
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-slate-900 px-4 py-4 text-center text-white">
        <p className="text-[11px] font-bold text-slate-300">
          العمل ثابت بوحدة يوم-عامل
        </p>
        <p className="mt-1 text-2xl font-black tabular-nums" dir="ltr">
          {workers} × {days} = {TOTAL_WORK}
        </p>
        <p className="mt-1 text-xs text-slate-300">
          عامل × يوم = يوم-عامل
        </p>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {[
          { workers: 4, label: "4 عمال × 12 يوماً" },
          { workers: 6, label: "6 عمال × 8 أيام" },
          { workers: 8, label: "8 عمال × 6 أيام" },
          { workers: 12, label: "12 عاملاً × 4 أيام" },
        ].map((preset) => (
          <button
            key={preset.workers}
            type="button"
            onClick={() => chooseWorkers(preset.workers)}
            className={`min-h-11 rounded-full px-3 text-xs font-bold tabular-nums ${
              workers === preset.workers
                ? "bg-blue-700 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
            dir="ltr"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
