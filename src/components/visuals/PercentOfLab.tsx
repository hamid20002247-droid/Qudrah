"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

const MIN_PERCENT = 5;
const MAX_PERCENT = 95;
const STEP = 5;

export function PercentOfLab({ onInteract, compact }: Props) {
  const [base, setBase] = useState(240);
  const [percent, setPercent] = useState(25);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const part = (base * percent) / 100;
  const remainder = base - part;
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const setFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    const raw = Math.round((ratio * 100) / STEP) * STEP;
    setPercent(Math.max(MIN_PERCENT, Math.min(MAX_PERCENT, raw)));
    fire();
  };

  const finishDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
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
          اسحب الفاصل الأسود على الشريط، أو اضغط نسبة جاهزة.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          لاحظ كيف يتغير الجزء الملوّن من العدد الأساسي.
        </p>
      </div>

      <div className="mt-5 text-center">
        <p className="text-[12px] font-bold text-blue-700">النسبة من العدد</p>
        <p
          className="mt-1 text-3xl font-black tabular-nums text-ink"
          dir="ltr"
        >
          {percent}% × {base} = {part}
        </p>
      </div>

      <div
        ref={trackRef}
        dir="ltr"
        className="relative mt-5 h-24 touch-none select-none overflow-hidden rounded-2xl bg-slate-100 ring-2 ring-slate-200"
        onPointerDown={(e) => {
          e.preventDefault();
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          setFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (dragging.current) setFromClientX(e.clientX);
        }}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onKeyDown={(e) => {
          if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
          e.preventDefault();
          const direction = e.key === "ArrowRight" ? STEP : -STEP;
          setPercent((value) =>
            Math.max(MIN_PERCENT, Math.min(MAX_PERCENT, value + direction)),
          );
          fire();
        }}
        role="slider"
        tabIndex={0}
        aria-valuemin={MIN_PERCENT}
        aria-valuemax={MAX_PERCENT}
        aria-valuenow={percent}
        aria-valuetext={`${percent} بالمئة من ${base} تساوي ${part}`}
        aria-label="النسبة من العدد الأساسي"
      >
        <div
          className="absolute inset-y-0 left-0 flex items-center justify-center bg-gradient-to-r from-blue-600 to-teal-500 transition-[width] duration-75"
          style={{ width: `${percent}%` }}
        >
          <span
            className="px-2 text-base font-black tabular-nums text-white"
            dir="ltr"
          >
            {part}
          </span>
        </div>
        <div
          className="absolute inset-y-0 right-0 flex items-center justify-center"
          style={{ width: `${100 - percent}%` }}
        >
          <span
            className="px-2 text-sm font-bold tabular-nums text-slate-500"
            dir="ltr"
          >
            {remainder}
          </span>
        </div>
        <div
          className="absolute top-0 z-10 flex h-full w-7 -translate-x-1/2 cursor-ew-resize items-center justify-center bg-ink shadow-lg"
          style={{ left: `${percent}%` }}
        >
          <span className="h-9 w-1 rounded-full bg-white/80" />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between px-1 text-[11px] font-bold text-slate-400">
        <span className="tabular-nums" dir="ltr">
          0%
        </span>
        <span>الكل</span>
        <span className="tabular-nums" dir="ltr">
          100%
        </span>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-100">
        <div className="grid grid-cols-3 items-center gap-2 text-center">
          <div>
            <p className="text-[11px] font-bold text-slate-500">النسبة</p>
            <p
              className="mt-1 text-xl font-black tabular-nums text-blue-700"
              dir="ltr"
            >
              {percent}%
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500">العدد</p>
            <p
              className="mt-1 text-xl font-black tabular-nums text-ink"
              dir="ltr"
            >
              {base}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500">الجزء</p>
            <p
              className="mt-1 text-xl font-black tabular-nums text-teal-700"
              dir="ltr"
            >
              {part}
            </p>
          </div>
        </div>
        <p
          className="mt-3 rounded-xl bg-blue-50 px-3 py-2.5 text-center text-sm font-black tabular-nums text-blue-900 ring-1 ring-blue-100"
          dir="ltr"
        >
          {percent} ÷ 100 × {base} = {part}
        </p>
      </div>

      <div className="mt-4">
        <p className="text-center text-[11px] font-bold text-slate-500">
          نسب جاهزة
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {[10, 25, 40, 75].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setPercent(value);
                fire();
              }}
              className={`min-h-11 min-w-14 rounded-full px-3 text-xs font-bold tabular-nums ${
                percent === value
                  ? "bg-blue-700 text-white shadow-sm"
                  : "bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
              dir="ltr"
            >
              {value}%
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <p className="text-center text-[11px] font-bold text-slate-500">
          غيّر العدد الأساسي
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {[200, 240, 320].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setBase(value);
                fire();
              }}
              className={`min-h-11 min-w-16 rounded-full px-3 text-xs font-bold tabular-nums ${
                base === value
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
              dir="ltr"
            >
              {value}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
