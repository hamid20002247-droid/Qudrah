"use client";

import { useCallback, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type Mode = "multiply" | "divide" | "power" | "zero";

type Preset = {
  label: string;
  mode: Mode;
  base: number;
  expA: number;
  expB: number;
};

const BASES = [2, 3, 4, 5];
const EXP_MIN = 1;
const EXP_MAX = 5;

const PRESETS: Preset[] = [
  { label: "2³×2⁴", mode: "multiply", base: 2, expA: 3, expB: 4 },
  { label: "5⁶÷5²", mode: "divide", base: 5, expA: 6, expB: 2 },
  { label: "(3²)³", mode: "power", base: 3, expA: 2, expB: 3 },
  { label: "4⁰", mode: "zero", base: 4, expA: 0, expB: 0 },
];

function powValue(base: number, exp: number): number {
  return base ** exp;
}

function formatPower(base: number, exp: number): string {
  return `${base}^${exp}`;
}

export function ExponentsLab({ onInteract, compact }: Props) {
  const [mode, setMode] = useState<Mode>("multiply");
  const [base, setBase] = useState(2);
  const [expA, setExpA] = useState(3);
  const [expB, setExpB] = useState(4);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const resultExp =
    mode === "multiply"
      ? expA + expB
      : mode === "divide"
        ? expA - expB
        : mode === "power"
          ? expA * expB
          : 0;

  const leftValue =
    mode === "zero"
      ? powValue(base, 0)
      : mode === "power"
        ? powValue(powValue(base, expA), expB)
        : mode === "multiply"
          ? powValue(base, expA) * powValue(base, expB)
          : powValue(base, expA) / powValue(base, expB);

  const rightValue = powValue(base, resultExp);

  const cycleBase = () => {
    const index = BASES.indexOf(base);
    setBase(BASES[(index + 1) % BASES.length] ?? 2);
    fire();
  };

  const bumpExp = (which: "a" | "b") => {
    if (mode === "zero") return;
    if (which === "a") {
      setExpA((value) => (value >= EXP_MAX ? EXP_MIN : value + 1));
    } else {
      setExpB((value) => (value >= EXP_MAX ? EXP_MIN : value + 1));
    }
    fire();
  };

  const applyPreset = (preset: Preset) => {
    setMode(preset.mode);
    setBase(preset.base);
    setExpA(preset.expA);
    setExpB(preset.expB);
    fire();
  };

  const expressionLeft =
    mode === "multiply"
      ? `${formatPower(base, expA)} × ${formatPower(base, expB)}`
      : mode === "divide"
        ? `${formatPower(base, expA)} ÷ ${formatPower(base, expB)}`
        : mode === "power"
          ? `(${formatPower(base, expA)})^${expB}`
          : formatPower(base, 0);

  const ruleHint =
    mode === "multiply"
      ? "نفس القاعدة: اجمع الأسّين"
      : mode === "divide"
        ? "نفس القاعدة: اطرح الأسّين"
        : mode === "power"
          ? "أس فوق أس: اضرب الأسّين"
          : "أي عدد غير صفر أسّه صفر = 1";

  const activePreset = PRESETS.find(
    (preset) =>
      preset.mode === mode &&
      preset.base === base &&
      preset.expA === expA &&
      preset.expB === expB,
  );

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#EEF2FF] to-white ring-1 ring-indigo-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-indigo-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اضغط القاعدة أو الأسّ لتغييره، أو اختر مثالاً جاهزاً.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          راقب كيف يتغيّر ناتج الضرب أو القسمة لنفس القاعدة.
        </p>
      </div>

      <div className="mt-5 text-center">
        <p className="text-[12px] font-bold text-indigo-700">{ruleHint}</p>
        <p
          className="mt-2 text-2xl font-black tabular-nums text-ink sm:text-3xl"
          dir="ltr"
        >
          {expressionLeft} = {formatPower(base, resultExp)}
        </p>
        <p
          className="mt-1 text-sm font-bold tabular-nums text-slate-500"
          dir="ltr"
        >
          = {Number.isInteger(leftValue) ? leftValue : leftValue.toFixed(2)}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={cycleBase}
          className="flex min-h-14 flex-col items-center justify-center rounded-2xl bg-indigo-50 px-2 ring-1 ring-indigo-100 active:scale-[0.98]"
          aria-label={`القاعدة ${base}. اضغط لتغييرها`}
        >
          <span className="text-[11px] font-bold text-slate-500">القاعدة</span>
          <span
            className="mt-0.5 text-xl font-black tabular-nums text-indigo-800"
            dir="ltr"
          >
            {base}
          </span>
        </button>

        <button
          type="button"
          onClick={() => bumpExp("a")}
          disabled={mode === "zero"}
          className="flex min-h-14 flex-col items-center justify-center rounded-2xl bg-white px-2 ring-1 ring-slate-200 active:scale-[0.98] disabled:opacity-50"
          aria-label={`الأس الأول ${mode === "zero" ? 0 : expA}. اضغط لزيادته`}
        >
          <span className="text-[11px] font-bold text-slate-500">
            {mode === "power" ? "الأس الداخلي" : "الأس الأول"}
          </span>
          <span
            className="mt-0.5 text-xl font-black tabular-nums text-ink"
            dir="ltr"
          >
            {mode === "zero" ? 0 : expA}
          </span>
        </button>

        <button
          type="button"
          onClick={() => bumpExp("b")}
          disabled={mode === "zero"}
          className="flex min-h-14 flex-col items-center justify-center rounded-2xl bg-white px-2 ring-1 ring-slate-200 active:scale-[0.98] disabled:opacity-50"
          aria-label={`الأس الثاني ${mode === "zero" ? 0 : expB}. اضغط لزيادته`}
        >
          <span className="text-[11px] font-bold text-slate-500">
            {mode === "power" ? "الأس الخارجي" : "الأس الثاني"}
          </span>
          <span
            className="mt-0.5 text-xl font-black tabular-nums text-ink"
            dir="ltr"
          >
            {mode === "zero" ? "—" : expB}
          </span>
        </button>
      </div>

      <div className="mt-4 rounded-2xl bg-indigo-700 px-3 py-4 text-center text-white shadow-sm">
        <p className="text-[11px] font-bold text-indigo-100">الناتج المبسط</p>
        <p className="mt-1 text-2xl font-black tabular-nums" dir="ltr">
          {formatPower(base, resultExp)}
          {rightValue === leftValue
            ? ` = ${Number.isInteger(rightValue) ? rightValue : rightValue.toFixed(2)}`
            : ""}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {(
          [
            ["multiply", "ضرب"],
            ["divide", "قسمة"],
            ["power", "أس فوق أس"],
            ["zero", "أس صفر"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setMode(value);
              if (value === "zero") {
                setExpA(0);
                setExpB(0);
              } else if (mode === "zero") {
                setExpA(2);
                setExpB(3);
              }
              fire();
            }}
            className={`min-h-11 rounded-full px-3 text-xs font-bold ${
              mode === value
                ? "bg-indigo-700 text-white shadow-sm"
                : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-3">
        <p className="text-center text-[11px] font-bold text-slate-500">
          أمثلة جاهزة
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
              className={`min-h-11 rounded-full px-3 text-xs font-bold tabular-nums ${
                activePreset?.label === preset.label
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
              dir="ltr"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
