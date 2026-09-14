"use client";

import { useCallback, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type Item =
  | { kind: "root"; n: number; label: string; value: number }
  | { kind: "pow"; base: number; exp: number; label: string; value: number };

const ITEMS: Item[] = [
  { kind: "root", n: 49, label: "√49", value: 7 },
  { kind: "root", n: 64, label: "√64", value: 8 },
  { kind: "root", n: 81, label: "√81", value: 9 },
  { kind: "root", n: 36, label: "√36", value: 6 },
  { kind: "pow", base: 2, exp: 3, label: "2³", value: 8 },
  { kind: "pow", base: 3, exp: 2, label: "3²", value: 9 },
  { kind: "pow", base: 2, exp: 5, label: "2⁵", value: 32 },
  { kind: "pow", base: 4, exp: 2, label: "4²", value: 16 },
  { kind: "pow", base: 5, exp: 2, label: "5²", value: 25 },
  { kind: "pow", base: 3, exp: 3, label: "3³", value: 27 },
];

function verdict(a: number, b: number): string {
  if (a > b) return "كمية أ أكبر";
  if (b > a) return "كمية ب أكبر";
  return "متساويتان";
}

export function CmpRootsExpLab({ onInteract, compact }: Props) {
  const [indexA, setIndexA] = useState(0);
  const [indexB, setIndexB] = useState(4);
  const fire = useCallback(() => onInteract?.(), [onInteract]);
  const itemA = ITEMS[indexA]!;
  const itemB = ITEMS[indexB]!;
  const result = verdict(itemA.value, itemB.value);

  const cycle = (side: "a" | "b") => {
    if (side === "a") setIndexA((i) => (i + 1) % ITEMS.length);
    else setIndexB((i) => (i + 1) % ITEMS.length);
    fire();
  };

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#ECFDF5] to-white ring-1 ring-emerald-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-emerald-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اضغط بطاقة أ أو ب لتبديل الجذر أو الأسّ.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          راقب القيمة المبسّطة ثم الحكم — بلا آلة حاسبة.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => cycle("a")}
          className="min-h-28 rounded-2xl bg-emerald-600 px-3 py-4 text-center text-white active:scale-[0.98]"
        >
          <p className="text-[11px] font-bold text-emerald-100">كمية أ · اضغط</p>
          <p className="mt-2 text-2xl font-black tabular-nums" dir="ltr">
            {itemA.label}
          </p>
          <p className="mt-2 text-sm font-bold text-emerald-50">
            ={" "}
            <span className="tabular-nums" dir="ltr">
              {itemA.value}
            </span>
          </p>
        </button>
        <button
          type="button"
          onClick={() => cycle("b")}
          className="min-h-28 rounded-2xl bg-emerald-900 px-3 py-4 text-center text-white active:scale-[0.98]"
        >
          <p className="text-[11px] font-bold text-emerald-200">كمية ب · اضغط</p>
          <p className="mt-2 text-2xl font-black tabular-nums" dir="ltr">
            {itemB.label}
          </p>
          <p className="mt-2 text-sm font-bold text-emerald-50">
            ={" "}
            <span className="tabular-nums" dir="ltr">
              {itemB.value}
            </span>
          </p>
        </button>
      </div>

      <div className="mt-3 rounded-2xl bg-white px-3 py-4 text-center ring-1 ring-emerald-100">
        <p className="text-[11px] font-bold text-slate-500">الحكم</p>
        <p className="mt-1 text-lg font-black text-emerald-900">{result}</p>
        <p
          className="mt-2 text-xs font-bold tabular-nums text-slate-500"
          dir="ltr"
        >
          {itemA.value} مقابل {itemB.value}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {[
          { a: 0, b: 4, label: "√49 و 2³" },
          { a: 1, b: 5, label: "√64 و 3²" },
          { a: 6, b: 9, label: "2⁵ و 3³" },
          { a: 3, b: 4, label: "√36 و 2³" },
        ].map((preset) => {
          const active = indexA === preset.a && indexB === preset.b;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setIndexA(preset.a);
                setIndexB(preset.b);
                fire();
              }}
              className={`min-h-11 rounded-xl px-3 text-xs font-bold tabular-nums ring-1 transition ${
                active
                  ? "bg-emerald-700 text-white ring-emerald-700"
                  : "bg-white text-emerald-900 ring-emerald-100"
              }`}
              dir="ltr"
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
