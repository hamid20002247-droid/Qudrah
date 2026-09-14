"use client";

import { useCallback, useMemo, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type Mode = "missing" | "added";

const PRESETS: {
  label: string;
  mode: Mode;
  known: number[];
  targetMean: number;
  hintMissing?: number;
}[] = [
  { label: "درجة ناقصة", mode: "missing", known: [12, 14, 16], targetMean: 15, hintMissing: 18 },
  { label: "قراءة ناقصة", mode: "missing", known: [8, 10, 9, 11], targetMean: 10, hintMissing: 12 },
  { label: "أُضيفت قيمة", mode: "added", known: [10, 10, 10, 10], targetMean: 12, hintMissing: 20 },
];

export function MeanMissingLab({ onInteract, compact }: Props) {
  const [mode, setMode] = useState<Mode>("missing");
  const [known, setKnown] = useState([12, 14, 16]);
  const [targetMean, setTargetMean] = useState(15);
  const [missing, setMissing] = useState(15);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const knownSum = known.reduce((a, b) => a + b, 0);
  const newCount = mode === "missing" ? known.length + 1 : known.length + 1;
  const newSum = knownSum + missing;
  const newMean = newSum / newCount;
  const match = Math.abs(newMean - targetMean) < 0.001;

  const equation = useMemo(() => {
    if (mode === "missing") {
      return `المطلوب: متوسط ${newCount} قيم = ${targetMean}`;
    }
    return `بعد الإضافة صار المتوسط = ${targetMean}`;
  }, [mode, newCount, targetMean]);

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    setMode(preset.mode);
    setKnown(preset.known);
    setTargetMean(preset.targetMean);
    setMissing(preset.hintMissing ?? preset.targetMean);
    fire();
  };

  const bump = (delta: number) => {
    setMissing((v) => Math.max(0, Math.min(40, v + delta)));
    fire();
  };

  const meanText = Number.isInteger(newMean) ? String(newMean) : newMean.toFixed(2);

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#EEF2FF] to-white ring-1 ring-indigo-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-indigo-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اضبط القيمة المجهولة بزرّي +/−، أو اختر مثالاً جاهزاً.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          عندما يطابق المتوسط الهدف يتحوّل الإطار إلى أخضر.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => {
            setMode("missing");
            fire();
          }}
          className={`min-h-11 rounded-full px-3 text-xs font-bold ${
            mode === "missing"
              ? "bg-indigo-700 text-white"
              : "bg-white text-slate-700 ring-1 ring-slate-200"
          }`}
        >
          قيمة ناقصة
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("added");
            fire();
          }}
          className={`min-h-11 rounded-full px-3 text-xs font-bold ${
            mode === "added"
              ? "bg-indigo-700 text-white"
              : "bg-white text-slate-700 ring-1 ring-slate-200"
          }`}
        >
          أُضيفت قيمة فصار المتوسط…
        </button>
      </div>

      <p className="mt-3 text-center text-[12px] font-bold text-indigo-800">
        {equation}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {known.map((value, index) => (
          <span
            key={index}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-2xl bg-indigo-50 font-black tabular-nums text-indigo-900 ring-1 ring-indigo-100"
            dir="ltr"
          >
            {value}
          </span>
        ))}
        <span
          className={`flex min-h-11 min-w-14 items-center justify-center rounded-2xl font-black tabular-nums ring-2 ${
            match
              ? "bg-emerald-100 text-emerald-800 ring-emerald-400"
              : "bg-white text-indigo-700 ring-indigo-300"
          }`}
          dir="ltr"
          aria-label="القيمة المجهولة"
        >
          {missing}
        </span>
        <span className="text-[11px] font-bold text-slate-400">؟</span>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => bump(-1)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-lg font-black text-indigo-800"
          aria-label="إنقاص"
        >
          −
        </button>
        <div className="text-center">
          <p className="text-[11px] font-bold text-slate-500">القيمة المجهولة</p>
          <p className="text-2xl font-black tabular-nums text-ink" dir="ltr">
            {missing}
          </p>
        </div>
        <button
          type="button"
          onClick={() => bump(1)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-lg font-black text-indigo-800"
          aria-label="زيادة"
        >
          +
        </button>
      </div>

      <div
        className={`mt-4 grid grid-cols-2 gap-3 rounded-2xl p-3 ring-1 ${
          match
            ? "bg-emerald-50 ring-emerald-200"
            : "bg-white ring-indigo-100"
        }`}
      >
        <div className="text-center">
          <p className="text-[11px] font-bold text-slate-500">المتوسط الحالي</p>
          <p
            className={`text-xl font-black tabular-nums ${
              match ? "text-emerald-700" : "text-indigo-800"
            }`}
            dir="ltr"
          >
            {meanText}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[11px] font-bold text-slate-500">المتوسط الهدف</p>
          <p className="text-xl font-black tabular-nums text-ink" dir="ltr">
            {targetMean}
          </p>
        </div>
      </div>

      <p className="mt-2 text-center text-[12px] font-bold tabular-nums text-slate-600" dir="ltr">
        ({knownSum} + {missing}) ÷ {newCount} = {meanText}
      </p>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => applyPreset(preset)}
            className="min-h-11 rounded-full bg-white px-3 text-xs font-bold text-slate-700 ring-1 ring-slate-200"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
