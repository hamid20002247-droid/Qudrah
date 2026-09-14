"use client";

import { useCallback, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type Bag = { red: number; blue: number; green: number };

const PRESETS: { label: string; bag: Bag }[] = [
  { label: "متساوٍ", bag: { red: 3, blue: 3, green: 3 } },
  { label: "أحمر كثير", bag: { red: 5, blue: 2, green: 1 } },
  { label: "قليل", bag: { red: 2, blue: 4, green: 2 } },
];

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function ProbSimpleLab({ onInteract, compact }: Props) {
  const [bag, setBag] = useState<Bag>({ red: 4, blue: 3, green: 2 });
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const total = bag.red + bag.blue + bag.green;
  const g = gcd(bag.red, total);
  const simpNum = total === 0 ? 0 : bag.red / g;
  const simpDen = total === 0 ? 1 : total / g;

  const bump = (color: keyof Bag, delta: number) => {
    setBag((current) => {
      const next = Math.max(0, Math.min(8, current[color] + delta));
      const nextBag = { ...current, [color]: next };
      if (nextBag.red + nextBag.blue + nextBag.green === 0) return current;
      return nextBag;
    });
    fire();
  };

  const colors: { key: keyof Bag; label: string; fill: string; ring: string }[] =
    [
      { key: "red", label: "أحمر", fill: "bg-rose-500", ring: "ring-rose-200" },
      { key: "blue", label: "أزرق", fill: "bg-sky-500", ring: "ring-sky-200" },
      {
        key: "green",
        label: "أخضر",
        fill: "bg-emerald-500",
        ring: "ring-emerald-200",
      },
    ];

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#ECFDF5] to-white ring-1 ring-emerald-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-emerald-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اضغط + أو − لتغيير عدد الكرات من كل لون.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          راقب احتمال الأحمر = المطلوب ÷ الكلي وهو يُبسَّط تلقائياً.
        </p>
      </div>

      <div
        className="mt-5 flex min-h-28 flex-wrap items-center justify-center gap-2 rounded-3xl bg-emerald-50/80 p-4 ring-1 ring-emerald-100"
        aria-label="كيس الكرات"
      >
        {colors.map(({ key, fill }) =>
          Array.from({ length: bag[key] }).map((_, i) => (
            <button
              key={`${key}-${i}`}
              type="button"
              onClick={() => bump(key, -1)}
              className={`h-11 w-11 rounded-full ${fill} shadow-sm ring-2 ring-white active:scale-95`}
              aria-label={`إزالة كرة`}
            />
          )),
        )}
        {total === 0 && (
          <p className="text-sm font-bold text-slate-400">الكيس فارغ</p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {colors.map(({ key, label, fill, ring }) => (
          <div
            key={key}
            className={`rounded-2xl bg-white p-2 text-center ring-1 ${ring}`}
          >
            <div className={`mx-auto mb-2 h-3 w-3 rounded-full ${fill}`} />
            <p className="text-[11px] font-bold text-slate-600">{label}</p>
            <p className="text-xl font-black tabular-nums text-ink" dir="ltr">
              {bag[key]}
            </p>
            <div className="mt-1 flex justify-center gap-1">
              <button
                type="button"
                onClick={() => bump(key, -1)}
                className="min-h-11 min-w-11 rounded-xl bg-slate-100 text-lg font-black text-slate-700"
                aria-label={`إنقاص ${label}`}
              >
                −
              </button>
              <button
                type="button"
                onClick={() => bump(key, 1)}
                className="min-h-11 min-w-11 rounded-xl bg-emerald-600 text-lg font-black text-white"
                aria-label={`زيادة ${label}`}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-emerald-600 px-3 py-4 text-center text-white shadow-sm">
        <p className="text-[11px] font-bold text-emerald-100">
          احتمال الأحمر
        </p>
        <p className="mt-1 text-xl font-black tabular-nums" dir="ltr">
          {bag.red} ÷ {total} = {simpNum} ÷ {simpDen}
        </p>
        <p className="mt-1 text-[12px] text-emerald-50">
          المطلوب ÷ الكلي
        </p>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {PRESETS.map((preset) => {
          const active =
            preset.bag.red === bag.red &&
            preset.bag.blue === bag.blue &&
            preset.bag.green === bag.green;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setBag(preset.bag);
                fire();
              }}
              className={`min-h-11 rounded-full px-3 text-xs font-bold ${
                active
                  ? "bg-emerald-700 text-white"
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
