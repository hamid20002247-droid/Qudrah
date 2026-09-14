"use client";

import { useCallback, useMemo, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

const PRESETS: { label: string; values: number[] }[] = [
  { label: "أهداف", values: [2, 3, 2, 5, 2, 4] },
  { label: "درجات", values: [7, 8, 7, 9, 7, 6] },
  { label: "أحجام", values: [1, 4, 4, 4, 2, 3] },
];

const MAX_ADD = 12;

export function ModeLab({ onInteract, compact }: Props) {
  const [values, setValues] = useState([2, 3, 2, 5, 2, 4]);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const freqs = useMemo(() => {
    const map = new Map<number, number>();
    for (const v of values) {
      map.set(v, (map.get(v) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [values]);

  const maxFreq = Math.max(...freqs.map(([, f]) => f), 0);
  const modes = freqs.filter(([, f]) => f === maxFreq).map(([v]) => v);
  const singleMode = modes.length === 1 ? modes[0]! : null;

  const addOccurrence = (value: number) => {
    if (values.length >= MAX_ADD) return;
    setValues((current) => [...current, value]);
    fire();
  };

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#FFFBEB] to-white ring-1 ring-amber-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-amber-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اضغط عموداً لإضافة تكرار، أو اختر قائمة جاهزة.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          العمود الأطول هو المنوال — الأكثر تكراراً.
        </p>
      </div>

      <div
        className="mt-5 flex min-h-44 items-end justify-center gap-2"
        aria-label="تكرارات المنوال"
      >
        {freqs.map(([value, freq]) => {
          const isMode = modes.includes(value) && maxFreq > 0;
          return (
            <button
              key={value}
              type="button"
              onClick={() => addOccurrence(value)}
              className={`flex min-h-11 min-w-12 flex-1 flex-col items-center justify-end rounded-2xl px-1 pt-2 ring-1 active:scale-[0.98] ${
                isMode
                  ? "bg-amber-100 ring-amber-400"
                  : "bg-amber-50/80 ring-amber-100"
              }`}
              aria-label={`القيمة ${value} تكررت ${freq}. اضغط لإضافة تكرار`}
            >
              <span
                className={`mb-1 text-xs font-bold tabular-nums ${
                  isMode ? "text-amber-900" : "text-slate-600"
                }`}
                dir="ltr"
              >
                ×{freq}
              </span>
              <span
                className={`w-full rounded-t-xl transition-[height] ${
                  isMode ? "bg-amber-500" : "bg-amber-300"
                }`}
                style={{
                  height: Math.max(24, (freq / Math.max(maxFreq, 1)) * 120),
                }}
                aria-hidden
              />
              <span
                className="mt-1 font-black tabular-nums text-amber-950"
                dir="ltr"
              >
                {value}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl bg-amber-500 px-3 py-4 text-center text-white shadow-sm">
        <p className="text-[11px] font-bold text-amber-100">المنوال</p>
        {singleMode !== null ? (
          <p className="mt-1 text-2xl font-black tabular-nums" dir="ltr">
            {singleMode}
          </p>
        ) : modes.length === 0 ? (
          <p className="mt-1 text-sm font-bold">لا توجد قيم</p>
        ) : (
          <p className="mt-1 text-sm font-bold leading-snug">
            {modes.length === 2 ? "منوالان: " : "مناويل: "}
            <span className="tabular-nums" dir="ltr">
              {modes.join(" و ")}
            </span>
          </p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {PRESETS.map((preset) => {
          const active =
            preset.values.length === values.length &&
            preset.values.every((v, i) => v === values[i]);
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setValues(preset.values);
                fire();
              }}
              className={`min-h-11 rounded-full px-3 text-xs font-bold ${
                active
                  ? "bg-amber-700 text-white"
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
