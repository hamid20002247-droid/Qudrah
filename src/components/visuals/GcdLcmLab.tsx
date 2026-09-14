"use client";

import { useCallback, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

const NUMBER_OPTIONS = [4, 6, 8, 9, 10, 12, 15, 16, 18, 20, 24, 30];

const PRESETS: { label: string; a: number; b: number }[] = [
  { label: "١٢ و ١٨", a: 12, b: 18 },
  { label: "٨ و ١٢", a: 8, b: 12 },
  { label: "١٥ و ٢٥", a: 15, b: 25 },
  { label: "٩ و ١٢", a: 9, b: 12 },
];

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return (a / gcd(a, b)) * b;
}

function cycleValue(current: number, direction: 1 | -1): number {
  const index = NUMBER_OPTIONS.indexOf(current);
  const start = index >= 0 ? index : 0;
  const next =
    (start + direction + NUMBER_OPTIONS.length) % NUMBER_OPTIONS.length;
  return NUMBER_OPTIONS[next]!;
}

export function GcdLcmLab({ onInteract, compact }: Props) {
  const [a, setA] = useState(12);
  const [b, setB] = useState(18);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const g = gcd(a, b);
  const m = lcm(a, b);

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#EEF2FF] to-white ring-1 ring-indigo-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-indigo-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اضغط أحد العددين لتغييره، أو اختر زوجاً جاهزاً.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          راقب تغيّر أكبر قاسم مشترك وأصغر مضاعف مشترك مباشرة.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            setA((value) => cycleValue(value, 1));
            fire();
          }}
          className="min-h-20 rounded-2xl bg-indigo-50 px-3 py-3 text-center ring-1 ring-indigo-100 active:scale-[0.98]"
          aria-label={`العدد الأول ${a}. اضغط لتغييره`}
        >
          <p className="text-[11px] font-bold text-indigo-600">العدد الأول</p>
          <p
            className="mt-1 text-3xl font-black tabular-nums text-indigo-900"
            dir="ltr"
          >
            {a}
          </p>
        </button>
        <button
          type="button"
          onClick={() => {
            setB((value) => cycleValue(value, 1));
            fire();
          }}
          className="min-h-20 rounded-2xl bg-teal-50 px-3 py-3 text-center ring-1 ring-teal-100 active:scale-[0.98]"
          aria-label={`العدد الثاني ${b}. اضغط لتغييره`}
        >
          <p className="text-[11px] font-bold text-teal-700">العدد الثاني</p>
          <p
            className="mt-1 text-3xl font-black tabular-nums text-teal-900"
            dir="ltr"
          >
            {b}
          </p>
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-3 text-center ring-1 ring-slate-100">
          <p className="text-[11px] font-bold text-slate-500">
            أكبر قاسم مشترك
          </p>
          <p
            className="mt-1 text-2xl font-black tabular-nums text-indigo-700"
            dir="ltr"
          >
            {g}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-3 text-center ring-1 ring-slate-100">
          <p className="text-[11px] font-bold text-slate-500">
            أصغر مضاعف مشترك
          </p>
          <p
            className="mt-1 text-2xl font-black tabular-nums text-teal-700"
            dir="ltr"
          >
            {m}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-2xl bg-indigo-700 px-3 py-4 text-center text-white shadow-sm">
        <p className="text-[11px] font-bold text-indigo-100">العلاقة السريعة</p>
        <p className="mt-1 text-lg font-black tabular-nums" dir="ltr">
          {a} × {b} = {g} × {m}
        </p>
        <p className="mt-1 text-[11px] font-bold text-indigo-100">
          حاصل العددين = القاسم × المضاعف
        </p>
      </div>

      <div className="mt-4">
        <p className="text-center text-[11px] font-bold text-slate-500">
          أزواج جاهزة
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {PRESETS.map((preset) => {
            const active = a === preset.a && b === preset.b;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setA(preset.a);
                  setB(preset.b);
                  fire();
                }}
                className={`min-h-11 rounded-full px-3 text-xs font-bold ${
                  active
                    ? "bg-indigo-700 text-white shadow-sm"
                    : "bg-white text-slate-700 ring-1 ring-slate-200"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
