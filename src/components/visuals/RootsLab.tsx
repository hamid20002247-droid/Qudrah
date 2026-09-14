"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

const MIN_N = 2;
const MAX_N = 100;
const PERFECT_SQUARES = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100];
const PRESETS = [2, 10, 18, 40, 50, 72, 90];

function floorRoot(n: number) {
  return Math.floor(Math.sqrt(n));
}

export function RootsLab({ onInteract, compact }: Props) {
  const [n, setN] = useState(50);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const low = floorRoot(n);
  const high = low + 1;
  const lowSq = low * low;
  const highSq = high * high;
  const isPerfect = lowSq === n;
  const rootApprox = Math.sqrt(n);
  const markerPct = ((rootApprox - 1) / 9) * 100;

  const setFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const root = 1 + ratio * 9;
    const next = Math.round(root * root);
    setN(Math.max(MIN_N, Math.min(MAX_N, next)));
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

  const tileSize = compact ? 10 : 12;
  const gridSide = Math.min(low, 8);

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#ECFDF5] to-white ring-1 ring-emerald-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-emerald-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اسحب المؤشر على الخط، أو اضغط عدداً جاهزاً.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          لاحظ بين أي عددين صحيحين يقع الجذر، وكيف يقترب من المربعات الكاملة.
        </p>
      </div>

      <div className="mt-5 text-center">
        <p className="text-[12px] font-bold text-emerald-700">الجذر التربيعي</p>
        <p
          className="mt-1 text-3xl font-black tabular-nums text-ink"
          dir="ltr"
        >
          √{n}
        </p>
        <p
          className="mt-2 text-sm font-bold tabular-nums text-emerald-900"
          dir="ltr"
        >
          {isPerfect
            ? `= ${low} تماماً`
            : `${low} < √${n} < ${high}`}
        </p>
      </div>

      <div
        className={`mt-4 flex items-end justify-center gap-4 ${
          compact ? "min-h-24" : "min-h-28"
        }`}
      >
        <div className="flex flex-col items-center">
          <div
            className="grid gap-0.5 rounded-xl bg-emerald-50 p-2 ring-1 ring-emerald-100"
            style={{
              gridTemplateColumns: `repeat(${gridSide}, ${tileSize}px)`,
            }}
            aria-hidden
            dir="ltr"
          >
            {Array.from({ length: gridSide * gridSide }).map((_, i) => (
              <span
                key={i}
                className="rounded-[2px] bg-emerald-500"
                style={{ width: tileSize, height: tileSize }}
              />
            ))}
          </div>
          <p
            className="mt-2 text-[11px] font-bold tabular-nums text-emerald-800"
            dir="ltr"
          >
            {low}² = {lowSq}
          </p>
        </div>
        {!isPerfect && (
          <div className="flex flex-col items-center">
            <div
              className="rounded-xl bg-amber-50 px-3 py-4 ring-1 ring-amber-100"
              dir="ltr"
            >
              <p className="text-lg font-black tabular-nums text-amber-900">
                +{n - lowSq}
              </p>
            </div>
            <p className="mt-2 text-[11px] font-bold text-amber-800">
              زيادة فوق المربع
            </p>
          </div>
        )}
      </div>

      <div className="mt-5" dir="ltr">
        <div
          ref={trackRef}
          className="relative h-16 touch-none select-none rounded-2xl bg-slate-100 ring-2 ring-slate-200"
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
            const direction = e.key === "ArrowRight" ? 1 : -1;
            setN((value) =>
              Math.max(MIN_N, Math.min(MAX_N, value + direction)),
            );
            fire();
          }}
          role="slider"
          tabIndex={0}
          aria-valuemin={MIN_N}
          aria-valuemax={MAX_N}
          aria-valuenow={n}
          aria-valuetext={
            isPerfect
              ? `الجذر التربيعي لـ ${n} يساوي ${low}`
              : `الجذر التربيعي لـ ${n} بين ${low} و ${high}`
          }
          aria-label="اختر عدداً تحت الجذر"
        >
          {PERFECT_SQUARES.map((sq) => {
            const root = Math.sqrt(sq);
            const left = ((root - 1) / 9) * 100;
            return (
              <div
                key={sq}
                className="absolute bottom-0 top-0 w-px bg-emerald-300/80"
                style={{ left: `${left}%` }}
              >
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 text-[10px] font-bold tabular-nums text-emerald-700">
                  {root}
                </span>
              </div>
            );
          })}
          <div
            className="absolute top-1/2 z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full bg-ink text-[11px] font-black tabular-nums text-white shadow-lg"
            style={{ left: `${markerPct}%` }}
          >
            √{n}
          </div>
        </div>
        <div className="mt-2 flex justify-between px-1 text-[11px] font-bold text-slate-400">
          <span className="tabular-nums">1</span>
          <span>خط الأعداد للجذر</span>
          <span className="tabular-nums">10</span>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-100">
        <div className="grid grid-cols-3 items-center gap-2 text-center">
          <div>
            <p className="text-[11px] font-bold text-slate-500">الأصغر</p>
            <p
              className="mt-1 text-xl font-black tabular-nums text-emerald-700"
              dir="ltr"
            >
              {low}
            </p>
            <p className="text-[10px] tabular-nums text-slate-400" dir="ltr">
              {low}² = {lowSq}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500">العدد</p>
            <p
              className="mt-1 text-xl font-black tabular-nums text-ink"
              dir="ltr"
            >
              {n}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500">الأكبر</p>
            <p
              className="mt-1 text-xl font-black tabular-nums text-teal-700"
              dir="ltr"
            >
              {isPerfect ? low : high}
            </p>
            <p className="text-[10px] tabular-nums text-slate-400" dir="ltr">
              {isPerfect ? `${low}² = ${lowSq}` : `${high}² = ${highSq}`}
            </p>
          </div>
        </div>
        <p
          className="mt-3 rounded-xl bg-emerald-50 px-3 py-2.5 text-center text-sm font-black tabular-nums text-emerald-900 ring-1 ring-emerald-100"
          dir="ltr"
        >
          {isPerfect
            ? `${low}² = ${n} ⇒ √${n} = ${low}`
            : `${lowSq} < ${n} < ${highSq} ⇒ ${low} < √${n} < ${high}`}
        </p>
      </div>

      <div className="mt-4">
        <p className="text-center text-[11px] font-bold text-slate-500">
          أعداد جاهزة
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {PRESETS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setN(value);
                fire();
              }}
              className={`min-h-11 min-w-14 rounded-full px-3 text-xs font-bold tabular-nums ${
                n === value
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
              dir="ltr"
            >
              √{value}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
