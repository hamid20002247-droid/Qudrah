"use client";

import { useCallback, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

const PRESETS = [
  {
    label: "درجات",
    listA: [8, 7, 9, 6],
    listB: [5, 10, 7, 8],
  },
  {
    label: "أهداف",
    listA: [2, 4, 3],
    listB: [5, 1, 3],
  },
  {
    label: "قبل وبعد",
    listA: [12, 14, 10, 16],
    listB: [15, 13, 11, 17],
  },
  {
    label: "متساوية",
    listA: [6, 8, 10],
    listB: [9, 7, 8],
  },
];

const MAX_VALUE = 20;

function mean(values: number[]): number {
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function formatMean(value: number): string {
  // integers → "7"; halves → "7.5" (never "7.50"); strip trailing zeros
  return String(Number(value.toFixed(2)));
}

function verdict(a: number, b: number): string {
  if (a > b) return "كمية أ أكبر";
  if (b > a) return "كمية ب أكبر";
  return "متساويتان";
}

export function CmpMeansLab({ onInteract, compact }: Props) {
  const [listA, setListA] = useState([8, 7, 9, 6]);
  const [listB, setListB] = useState([5, 10, 7, 8]);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const meanA = mean(listA);
  const meanB = mean(listB);
  const result = verdict(meanA, meanB);

  const bump = (side: "a" | "b", index: number) => {
    const setter = side === "a" ? setListA : setListB;
    setter((current) =>
      current.map((value, i) =>
        i === index ? (value >= MAX_VALUE ? 2 : value + 1) : value,
      ),
    );
    fire();
  };

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#F0FDFA] to-white ring-1 ring-teal-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-teal-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اضغط أي رقم لزيادته، وراقب متوسط أ ومتوسط ب.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          المقارنة بين المتوسطين — لا مجموع القيم وحده.
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-teal-600 p-3 text-white">
          <p className="text-center text-[11px] font-bold text-teal-100">كمية أ</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {listA.map((value, index) => (
              <button
                key={`a-${index}`}
                type="button"
                onClick={() => bump("a", index)}
                className="flex h-11 min-w-11 items-center justify-center rounded-xl bg-white/20 text-sm font-black tabular-nums active:scale-95"
                dir="ltr"
                aria-label={`قيمة أ ${index + 1}: ${value}`}
              >
                {value}
              </button>
            ))}
          </div>
          <p className="mt-3 text-center text-lg font-black tabular-nums" dir="ltr">
            متوسط = {formatMean(meanA)}
          </p>
        </div>

        <div className="rounded-2xl bg-teal-900 p-3 text-white">
          <p className="text-center text-[11px] font-bold text-teal-200">كمية ب</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {listB.map((value, index) => (
              <button
                key={`b-${index}`}
                type="button"
                onClick={() => bump("b", index)}
                className="flex h-11 min-w-11 items-center justify-center rounded-xl bg-white/20 text-sm font-black tabular-nums active:scale-95"
                dir="ltr"
                aria-label={`قيمة ب ${index + 1}: ${value}`}
              >
                {value}
              </button>
            ))}
          </div>
          <p className="mt-3 text-center text-lg font-black tabular-nums" dir="ltr">
            متوسط = {formatMean(meanB)}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-2xl bg-white px-3 py-4 text-center ring-1 ring-teal-100">
        <p className="text-[11px] font-bold text-slate-500">الحكم</p>
        <p className="mt-1 text-lg font-black text-teal-900">{result}</p>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {PRESETS.map((preset) => {
          const active =
            preset.listA.length === listA.length &&
            preset.listB.length === listB.length &&
            preset.listA.every((v, i) => v === listA[i]) &&
            preset.listB.every((v, i) => v === listB[i]);
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setListA(preset.listA);
                setListB(preset.listB);
                fire();
              }}
              className={`min-h-11 rounded-xl px-3 text-xs font-bold ${
                active
                  ? "bg-teal-700 text-white"
                  : "bg-white text-teal-900 ring-1 ring-teal-100"
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
