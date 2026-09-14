"use client";

import { useCallback, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

const PRESETS: { label: string; n: number; highlightMissing: boolean }[] = [
  { label: "1 → 4", n: 2, highlightMissing: false },
  { label: "…9، ؟", n: 4, highlightMissing: true },
  { label: "ن = 3", n: 3, highlightMissing: false },
  { label: "ن = 5", n: 5, highlightMissing: false },
];

export function SquarePatternsLab({ onInteract, compact }: Props) {
  const [n, setN] = useState(3);
  const [missingMode, setMissingMode] = useState(false);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const count = n * n;
  const sequence = [1, 4, 9, 16, 25];
  const maxN = 5;

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#ECFDF5] to-white ring-1 ring-emerald-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-emerald-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اضغط قيمة ن لترى مربعاً ن×ن، وعدد البلاطات = ن².
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          راقب الشريط السفلي: 1، 4، 9، 16… كيف ينمو؟
        </p>
      </div>

      <div className="mt-4 text-center">
        <p className="text-[12px] font-bold text-emerald-700">عدد البلاطات</p>
        <p
          className="mt-1 text-2xl font-black tabular-nums text-ink sm:text-3xl"
          dir="ltr"
        >
          ن = {n} ← {n}×{n} = {count}
        </p>
        <p className="mt-1 text-sm font-bold text-emerald-800">العدد = ن²</p>
      </div>

      <div
        className="mx-auto mt-5 flex max-w-[220px] items-center justify-center rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100"
        style={{
          aspectRatio: "1",
          minHeight: compact ? 140 : 168,
        }}
        aria-label={`شبكة ${n} في ${n}`}
      >
        <div
          className="grid w-full gap-1 transition-all duration-200"
          style={{
            gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: count }, (_, i) => (
            <div
              key={`${n}-${i}`}
              className="aspect-square scale-100 rounded-sm bg-emerald-500 opacity-100 shadow-sm transition-all duration-200"
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {Array.from({ length: maxN }, (_, i) => i + 1).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setN(value);
              setMissingMode(false);
              fire();
            }}
            className={`flex h-12 min-w-12 items-center justify-center rounded-2xl text-base font-black tabular-nums ${
              n === value && !missingMode
                ? "bg-emerald-700 text-white"
                : "bg-white text-emerald-900 ring-1 ring-emerald-200"
            }`}
            dir="ltr"
            aria-label={`ن تساوي ${value}`}
          >
            {value}
          </button>
        ))}
      </div>

      <div
        className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-white px-3 py-3 ring-1 ring-emerald-100"
        dir="ltr"
        aria-label="شريط المتتالية"
      >
        {sequence.map((term, index) => {
          const rank = index + 1;
          const isActive = rank === n;
          const showQ = missingMode && rank === 4;
          return (
            <div key={term} className="flex items-center gap-2">
              <div
                className={`flex h-11 min-w-11 items-center justify-center rounded-xl text-sm font-black tabular-nums transition-colors ${
                  showQ
                    ? "bg-amber-400 text-ink ring-2 ring-amber-600"
                    : isActive
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-50 text-emerald-900"
                }`}
              >
                {showQ ? "؟" : term}
              </div>
              {index < sequence.length - 1 && (
                <span className="text-slate-300">،</span>
              )}
            </div>
          );
        })}
      </div>

      {missingMode && (
        <p className="mt-2 text-center text-sm font-bold text-emerald-800">
          الحد الناقص عند ن = 4 هو 16 = 4²
        </p>
      )}

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {PRESETS.map((preset) => {
          const active =
            preset.n === n && preset.highlightMissing === missingMode;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setN(preset.n);
                setMissingMode(preset.highlightMissing);
                fire();
              }}
              className={`min-h-11 rounded-full px-3 text-xs font-bold ${
                active
                  ? "bg-emerald-800 text-white"
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
