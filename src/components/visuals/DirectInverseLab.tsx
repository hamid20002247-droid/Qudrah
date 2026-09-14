"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type Mode = "direct" | "inverse";

const MIN_X = 2;
const MAX_X = 20;
const DIRECT_FACTOR = 3;
const INVERSE_PRODUCT = 120;

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export function DirectInverseLab({ onInteract, compact }: Props) {
  const [mode, setMode] = useState<Mode>("direct");
  const [x, setX] = useState(8);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const y = mode === "direct" ? x * DIRECT_FACTOR : INVERSE_PRODUCT / x;
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const updateX = useCallback(
    (next: number) => {
      setX(Math.max(MIN_X, Math.min(MAX_X, Math.round(next))));
      fire();
    },
    [fire],
  );

  const setFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const rtl = getComputedStyle(track).direction === "rtl";
    const position = rtl ? rect.right - clientX : clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, position / rect.width));
    updateX(MIN_X + ratio * (MAX_X - MIN_X));
  };

  const chooseMode = (nextMode: Mode) => {
    setMode(nextMode);
    setX(nextMode === "direct" ? 8 : 10);
    fire();
  };

  const pct = ((x - MIN_X) / (MAX_X - MIN_X)) * 100;
  const maxBarValue = mode === "direct" ? 60 : 60;
  const xWidth = Math.max(8, (x / maxBarValue) * 100);
  const yWidth = Math.max(8, (y / maxBarValue) * 100);

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#EEF2FF] to-white ring-1 ring-indigo-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-indigo-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اختر طردياً أو عكسياً، ثم اسحب المقبض لتغيير الكمية الأولى.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          راقب حركة الكمية الثانية والمقدار الثابت أسفلها.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => chooseMode("direct")}
          className={`min-h-11 rounded-xl text-sm font-black transition ${
            mode === "direct"
              ? "bg-teal-600 text-white shadow-sm"
              : "bg-transparent text-slate-600"
          }`}
          aria-pressed={mode === "direct"}
        >
          تناسب طردي
        </button>
        <button
          type="button"
          onClick={() => chooseMode("inverse")}
          className={`min-h-11 rounded-xl text-sm font-black transition ${
            mode === "inverse"
              ? "bg-violet-600 text-white shadow-sm"
              : "bg-transparent text-slate-600"
          }`}
          aria-pressed={mode === "inverse"}
        >
          تناسب عكسي
        </button>
      </div>

      <div className="mt-5 space-y-3 rounded-2xl bg-white p-4 ring-1 ring-slate-100">
        <div className="grid grid-cols-[4.5rem_1fr_3rem] items-center gap-2">
          <p className="text-sm font-bold text-slate-600">الكمية س</p>
          <div className="h-10 overflow-hidden rounded-xl bg-teal-50">
            <div
              className="flex h-full items-center justify-end rounded-xl bg-teal-500 px-2 transition-[width]"
              style={{ width: `${xWidth}%` }}
            />
          </div>
          <p
            className="text-center text-lg font-black tabular-nums text-teal-800"
            dir="ltr"
          >
            {x}
          </p>
        </div>

        <div className="grid grid-cols-[4.5rem_1fr_3rem] items-center gap-2">
          <p className="text-sm font-bold text-slate-600">الكمية ص</p>
          <div className="h-10 overflow-hidden rounded-xl bg-violet-50">
            <div
              className="flex h-full items-center justify-end rounded-xl bg-violet-500 px-2 transition-[width]"
              style={{ width: `${yWidth}%` }}
            />
          </div>
          <p
            className="text-center text-lg font-black tabular-nums text-violet-800"
            dir="ltr"
          >
            {formatNumber(y)}
          </p>
        </div>
      </div>

      <div
        ref={trackRef}
        className="relative mt-5 h-12 touch-none select-none rounded-full bg-indigo-100 ring-1 ring-indigo-200"
        onPointerDown={(event) => {
          event.preventDefault();
          dragging.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          setFromClientX(event.clientX);
        }}
        onPointerMove={(event) => {
          if (dragging.current) setFromClientX(event.clientX);
        }}
        onPointerUp={(event) => {
          dragging.current = false;
          try {
            event.currentTarget.releasePointerCapture(event.pointerId);
          } catch {
            /* انتهى الالتقاط مسبقاً */
          }
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
            event.preventDefault();
            updateX(x - 1);
          }
          if (event.key === "ArrowRight" || event.key === "ArrowUp") {
            event.preventDefault();
            updateX(x + 1);
          }
        }}
        role="slider"
        tabIndex={0}
        aria-label="الكمية س"
        aria-valuemin={MIN_X}
        aria-valuemax={MAX_X}
        aria-valuenow={x}
      >
        <div
          className="absolute top-1/2 z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full bg-ink text-white shadow-lg"
          style={{ insetInlineStart: `${pct}%` }}
        >
          <span className="text-base font-black" aria-hidden>
            ↔
          </span>
        </div>
      </div>

      <div
        className={`mt-4 rounded-2xl px-3 py-3 text-center ring-1 ${
          mode === "direct"
            ? "bg-teal-50 text-teal-900 ring-teal-100"
            : "bg-violet-50 text-violet-900 ring-violet-100"
        }`}
      >
        <p className="text-[11px] font-bold">
          {mode === "direct" ? "النسبة الثابتة" : "حاصل الضرب الثابت"}
        </p>
        {mode === "direct" ? (
          <>
            <p className="mt-1 text-xl font-black tabular-nums" dir="ltr">
              {x} ÷ {formatNumber(y)} = 1 ÷ 3
            </p>
            <p className="mt-1 text-xs leading-relaxed">
              تزيد س فتزيد ص معها، وتبقى النسبة نفسها.
            </p>
          </>
        ) : (
          <>
            <p className="mt-1 text-xl font-black tabular-nums" dir="ltr">
              {x} × {formatNumber(y)}{" "}
              {Number.isInteger(y) ? "=" : "≈"} {INVERSE_PRODUCT}
            </p>
            <p className="mt-1 text-xs leading-relaxed">
              تزيد س فتنقص ص، ويبقى حاصل الضرب نفسه.
            </p>
          </>
        )}
      </div>

      <p className="mt-3 text-center text-[11px] text-slate-400">
        أو اختر قيمة جاهزة
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {[4, 8, 10, 15].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => updateX(value)}
            className={`min-h-11 min-w-11 rounded-full px-3 text-xs font-bold tabular-nums ${
              x === value
                ? mode === "direct"
                  ? "bg-teal-600 text-white"
                  : "bg-violet-600 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
            dir="ltr"
          >
            س = {value}
          </button>
        ))}
      </div>
    </div>
  );
}
