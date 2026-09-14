"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

const MIN_N = 8;
const MAX_N = 28;
const PRESETS = [10, 15, 20, 25];

export function NumberSenseLab({ onInteract, compact }: Props) {
  const [n, setN] = useState(20);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const left = n - 1;
  const right = n + 1;
  const productPair = left * right;
  const square = n * n;
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const updateN = useCallback(
    (next: number) => {
      setN(Math.max(MIN_N, Math.min(MAX_N, Math.round(next))));
      fire();
    },
    [fire],
  );

  const setFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    updateN(MIN_N + ratio * (MAX_N - MIN_N));
  };

  const finishDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const pct = ((n - MIN_N) / (MAX_N - MIN_N)) * 100;
  const maxBar = square;
  const pairWidth = Math.max(12, (productPair / maxBar) * 100);
  const squareWidth = 100;

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#ECFDF5] to-white ring-1 ring-emerald-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-emerald-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اسحب المقبض لتغيير ن، أو اضغط قيمة جاهزة.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          لاحظ أن (ن−1)(ن+1) أقل من ن² بمقدار واحد دائماً.
        </p>
      </div>

      <div className="mt-5 text-center">
        <p className="text-[12px] font-bold text-emerald-700">مقارنة بلا ضرب كامل</p>
        <p
          className="mt-1 text-2xl font-black tabular-nums text-ink sm:text-3xl"
          dir="ltr"
        >
          {left}×{right} مقابل {n}×{n}
        </p>
      </div>

      <div className="mt-5 space-y-3" dir="ltr">
        <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-100">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[12px] font-bold text-slate-500">
              ({left})×({right})
            </p>
            <p className="text-lg font-black tabular-nums text-teal-700">
              {productPair}
            </p>
          </div>
          <div className="h-10 overflow-hidden rounded-xl bg-slate-100">
            <div
              className="flex h-full items-center justify-end bg-gradient-to-r from-teal-500 to-emerald-500 px-2 transition-[width] duration-75"
              style={{ width: `${pairWidth}%` }}
            >
              <span className="text-xs font-black tabular-nums text-white">
                ن² − 1
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-100">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[12px] font-bold text-slate-500">
              {n}×{n}
            </p>
            <p className="text-lg font-black tabular-nums text-ink">{square}</p>
          </div>
          <div className="h-10 overflow-hidden rounded-xl bg-slate-100">
            <div
              className="flex h-full items-center justify-end bg-gradient-to-r from-ink to-slate-700 px-2"
              style={{ width: `${squareWidth}%` }}
            >
              <span className="text-xs font-black tabular-nums text-white">
                ن²
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-emerald-50 p-3 text-center ring-1 ring-emerald-100"
        dir="ltr"
      >
        <div>
          <p className="text-[11px] font-bold text-slate-500">الزوج</p>
          <p className="mt-1 text-sm font-black tabular-nums text-teal-800">
            {productPair}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-500">المربع</p>
          <p className="mt-1 text-sm font-black tabular-nums text-ink">
            {square}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-500">الفرق</p>
          <p className="mt-1 text-sm font-black tabular-nums text-emerald-800">
            {square - productPair}
          </p>
        </div>
      </div>

      <div
        ref={trackRef}
        dir="ltr"
        className="relative mt-5 h-12 touch-none select-none rounded-2xl bg-slate-100 ring-2 ring-slate-200"
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
          updateN(n + (e.key === "ArrowRight" ? 1 : -1));
        }}
        role="slider"
        tabIndex={0}
        aria-valuemin={MIN_N}
        aria-valuemax={MAX_N}
        aria-valuenow={n}
        aria-valuetext={`ن تساوي ${n}. حاصل الزوج ${productPair}، والمربع ${square}`}
        aria-label="قيمة ن للمقارنة"
      >
        <div
          className="absolute top-1/2 z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full bg-ink text-sm font-black tabular-nums text-white shadow-lg"
          style={{ left: `${pct}%` }}
        >
          {n}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between px-1 text-[11px] font-bold text-slate-400">
        <span className="tabular-nums" dir="ltr">
          {MIN_N}
        </span>
        <span>اسحب ن</span>
        <span className="tabular-nums" dir="ltr">
          {MAX_N}
        </span>
      </div>

      <div className="mt-4">
        <p className="text-center text-[11px] font-bold text-slate-500">
          قيم جاهزة
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {PRESETS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => updateN(value)}
              className={`min-h-11 min-w-14 rounded-full px-3 text-xs font-bold tabular-nums ${
                n === value
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
              dir="ltr"
            >
              ن = {value}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
