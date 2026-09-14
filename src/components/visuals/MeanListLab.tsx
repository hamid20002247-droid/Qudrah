"use client";

import { useCallback, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

const PRESETS = [
  { label: "درجات", values: [7, 9, 8, 6] },
  { label: "أهداف", values: [2, 5, 3, 4, 6] },
  { label: "متساوية", values: [10, 10, 10] },
];

const MAX_VALUE = 20;

export function MeanListLab({ onInteract, compact }: Props) {
  const [values, setValues] = useState([7, 9, 8, 6]);
  const sum = values.reduce((total, value) => total + value, 0);
  const count = values.length;
  const mean = sum / count;
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const bumpValue = (index: number) => {
    setValues((current) =>
      current.map((value, itemIndex) =>
        itemIndex === index ? (value >= MAX_VALUE ? 2 : value + 1) : value,
      ),
    );
    fire();
  };

  const meanText = Number.isInteger(mean) ? String(mean) : mean.toFixed(2);

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#F0FDFA] to-white ring-1 ring-teal-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-teal-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اضغط أي قيمة لزيادتها، أو اختر قائمة جاهزة.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          راقب المجموع والعدد والمتوسط يتغيّرون معاً.
        </p>
      </div>

      <div
        className="mt-5 flex min-h-40 items-end justify-center gap-2"
        aria-label="قيم القائمة"
      >
        {values.map((value, index) => (
          <button
            key={index}
            type="button"
            onClick={() => bumpValue(index)}
            className="group flex min-h-11 min-w-12 flex-1 flex-col items-center justify-end rounded-2xl bg-teal-50 px-1 pt-2 ring-1 ring-teal-100 active:scale-[0.98]"
            aria-label={`القيمة ${index + 1}: ${value}. اضغط لزيادتها`}
          >
            <span
              className="mb-1 font-black tabular-nums text-teal-900"
              dir="ltr"
            >
              {value}
            </span>
            <span
              className="w-full rounded-t-xl bg-teal-500 transition-[height]"
              style={{ height: Math.max(28, (value / MAX_VALUE) * 104) }}
              aria-hidden
            />
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-3 text-center ring-1 ring-slate-100">
          <p className="text-[11px] font-bold text-slate-500">المجموع</p>
          <p className="text-2xl font-black tabular-nums text-ink" dir="ltr">
            {sum}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-3 text-center ring-1 ring-slate-100">
          <p className="text-[11px] font-bold text-slate-500">العدد</p>
          <p className="text-2xl font-black tabular-nums text-ink" dir="ltr">
            {count}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-2xl bg-teal-600 px-3 py-4 text-center text-white shadow-sm">
        <p className="text-[11px] font-bold text-teal-100">
          المتوسط = المجموع ÷ العدد
        </p>
        <p className="mt-1 text-xl font-black tabular-nums" dir="ltr">
          {sum} ÷ {count} = {meanText}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {PRESETS.map((preset) => {
          const active =
            preset.values.length === values.length &&
            preset.values.every((value, index) => value === values[index]);
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
                  ? "bg-teal-700 text-white"
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
