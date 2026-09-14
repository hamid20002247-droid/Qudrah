"use client";

import { useCallback, useEffect, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

const PRESETS: { label: string; values: number[] }[] = [
  { label: "فردي: 5 قيم", values: [9, 3, 7, 1, 5] },
  { label: "زوجي: 4 قيم", values: [8, 2, 6, 4] },
  { label: "فردي: 7 قيم", values: [12, 4, 9, 1, 7, 15, 3] },
  { label: "زوجي: 6 قيم", values: [10, 3, 8, 1, 6, 5] },
];

export function MedianLab({ onInteract, compact }: Props) {
  const [unsorted, setUnsorted] = useState([9, 3, 7, 1, 5]);
  const [sorted, setSorted] = useState(false);
  const [animating, setAnimating] = useState(false);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const display = sorted
    ? [...unsorted].sort((a, b) => a - b)
    : unsorted;
  const n = display.length;
  const isOdd = n % 2 === 1;
  const midLeft = Math.floor((n - 1) / 2);
  const midRight = Math.floor(n / 2);

  let median: number | null = null;
  if (sorted) {
    if (isOdd) {
      median = display[midLeft]!;
    } else {
      median = (display[midLeft]! + display[midRight]!) / 2;
    }
  }

  useEffect(() => {
    if (!animating) return;
    const t = window.setTimeout(() => {
      setSorted(true);
      setAnimating(false);
    }, 380);
    return () => window.clearTimeout(t);
  }, [animating]);

  const applyPreset = (values: number[]) => {
    setUnsorted(values);
    setSorted(false);
    setAnimating(false);
    fire();
  };

  const medianText =
    median === null
      ? "—"
      : Number.isInteger(median)
        ? String(median)
        : median.toFixed(1);

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#F5F3FF] to-white ring-1 ring-violet-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-violet-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اضغط «رتّب» لترتيب القيم، أو اختر قائمة فردية أو زوجية.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          بعد الترتيب يُبرَز الوسط: قيمة واحدة أو متوسط العددين الأوسطين.
        </p>
      </div>

      <div
        className={`mt-5 flex flex-wrap items-center justify-center gap-2 transition-transform duration-300 ${
          animating ? "scale-95 opacity-70" : "scale-100 opacity-100"
        }`}
        aria-label="قيم الوسيط"
      >
        {display.map((value, index) => {
          const isMid =
            sorted &&
            (isOdd
              ? index === midLeft
              : index === midLeft || index === midRight);
          return (
            <span
              key={`${value}-${index}-${sorted}`}
              className={`flex min-h-11 min-w-11 items-center justify-center rounded-2xl font-black tabular-nums transition-all duration-300 ${
                isMid
                  ? "bg-violet-600 text-white ring-2 ring-violet-300 scale-110"
                  : "bg-violet-50 text-violet-900 ring-1 ring-violet-100"
              }`}
              dir="ltr"
            >
              {value}
            </span>
          );
        })}
      </div>

      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={() => {
            if (sorted) {
              setSorted(false);
            } else {
              setAnimating(true);
            }
            fire();
          }}
          className="min-h-11 rounded-full bg-violet-700 px-5 text-sm font-bold text-white"
        >
          {sorted ? "أعد الخلط" : "رتّب"}
        </button>
      </div>

      <div className="mt-4 rounded-2xl bg-violet-600 px-3 py-4 text-center text-white shadow-sm">
        <p className="text-[11px] font-bold text-violet-100">الوسيط</p>
        {!sorted ? (
          <p className="mt-1 text-sm font-bold text-violet-100">رتّب أولاً</p>
        ) : isOdd ? (
          <p className="mt-1 text-xl font-black tabular-nums" dir="ltr">
            الأوسط = {medianText}
          </p>
        ) : (
          <p className="mt-1 text-lg font-black leading-snug">
            <span className="tabular-nums" dir="ltr">
              ({display[midLeft]} + {display[midRight]}) ÷ 2 = {medianText}
            </span>
            <span className="mt-1 block text-[11px] font-bold text-violet-100">
              متوسط العددين الأوسطين
            </span>
          </p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {PRESETS.map((preset) => {
          const active =
            preset.values.length === unsorted.length &&
            preset.values.every((v, i) => v === unsorted[i]);
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset.values)}
              className={`min-h-11 rounded-full px-3 text-xs font-bold ${
                active
                  ? "bg-violet-700 text-white"
                  : "bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
