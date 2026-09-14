"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type Fraction = {
  n: number;
  d: number;
};

const FRACTION_POOL: Fraction[] = [
  { n: 1, d: 5 },
  { n: 1, d: 4 },
  { n: 1, d: 3 },
  { n: 2, d: 5 },
  { n: 1, d: 2 },
  { n: 3, d: 5 },
  { n: 2, d: 3 },
  { n: 3, d: 4 },
  { n: 4, d: 5 },
  { n: 5, d: 6 },
];

const PAIR_PRESETS: { a: Fraction; b: Fraction; label: string }[] = [
  { a: { n: 2, d: 3 }, b: { n: 3, d: 5 }, label: "2/3 · 3/5" },
  { a: { n: 3, d: 4 }, b: { n: 5, d: 6 }, label: "3/4 · 5/6" },
  { a: { n: 1, d: 2 }, b: { n: 2, d: 5 }, label: "1/2 · 2/5" },
  { a: { n: 4, d: 5 }, b: { n: 3, d: 4 }, label: "4/5 · 3/4" },
];

function valueOf(f: Fraction) {
  return f.n / f.d;
}

function labelOf(f: Fraction) {
  return `${f.n}/${f.d}`;
}

function nearestFraction(ratio: number): Fraction {
  let best = FRACTION_POOL[0];
  let bestDist = Math.abs(valueOf(best) - ratio);
  for (const f of FRACTION_POOL) {
    const dist = Math.abs(valueOf(f) - ratio);
    if (dist < bestDist) {
      best = f;
      bestDist = dist;
    }
  }
  return best;
}

function compareLabel(a: Fraction, b: Fraction) {
  const left = a.n * b.d;
  const right = a.d * b.n;
  if (left > right) return "أ أكبر";
  if (left < right) return "ب أكبر";
  return "متساويان";
}

export function CompareFractionsLab({ onInteract, compact }: Props) {
  const [a, setA] = useState<Fraction>({ n: 2, d: 3 });
  const [b, setB] = useState<Fraction>({ n: 3, d: 5 });
  const activeBar = useRef<"a" | "b" | null>(null);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const left = a.n * b.d;
  const right = a.d * b.n;
  const result = compareLabel(a, b);

  const setFromClientX = (
    which: "a" | "b",
    clientX: number,
    el: HTMLDivElement,
  ) => {
    const rect = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const next = nearestFraction(ratio);
    if (which === "a") setA(next);
    else setB(next);
    fire();
  };

  const finishDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    activeBar.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#EEF2FF] to-white ring-1 ring-indigo-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-indigo-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اسحب أو اضغط على شريط أ وشريط ب لتغيير الكسرين.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          راقب أيّ الشريطين أطول، وقارن حاصلَي الضرب التبادلي.
        </p>
      </div>

      <div className="mt-5 text-center">
        <p className="text-[12px] font-bold text-indigo-700">نتيجة المقارنة</p>
        <p className="mt-1 text-3xl font-black text-ink">{result}</p>
        <p
          className="mt-2 text-sm font-black tabular-nums text-slate-600"
          dir="ltr"
        >
          {a.n}×{b.d} = {left} &nbsp;·&nbsp; {a.d}×{b.n} = {right}
        </p>
      </div>

      <FractionBar
        label="أ"
        fraction={a}
        tone="indigo"
        compact={compact}
        onPointerDown={(e) => {
          e.preventDefault();
          activeBar.current = "a";
          e.currentTarget.setPointerCapture(e.pointerId);
          setFromClientX("a", e.clientX, e.currentTarget);
        }}
        onPointerMove={(e) => {
          if (activeBar.current === "a") {
            setFromClientX("a", e.clientX, e.currentTarget);
          }
        }}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
      />

      <FractionBar
        label="ب"
        fraction={b}
        tone="amber"
        compact={compact}
        onPointerDown={(e) => {
          e.preventDefault();
          activeBar.current = "b";
          e.currentTarget.setPointerCapture(e.pointerId);
          setFromClientX("b", e.clientX, e.currentTarget);
        }}
        onPointerMove={(e) => {
          if (activeBar.current === "b") {
            setFromClientX("b", e.clientX, e.currentTarget);
          }
        }}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
      />

      <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-100">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <p className="text-[11px] font-bold text-slate-500">الكسر أ</p>
            <p
              className="mt-1 text-2xl font-black tabular-nums text-indigo-700"
              dir="ltr"
            >
              {labelOf(a)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500">الكسر ب</p>
            <p
              className="mt-1 text-2xl font-black tabular-nums text-amber-700"
              dir="ltr"
            >
              {labelOf(b)}
            </p>
          </div>
        </div>
        <p className="mt-3 rounded-xl bg-indigo-50 px-3 py-2.5 text-center text-[13px] font-bold leading-relaxed text-indigo-950 ring-1 ring-indigo-100">
          اضرب بسط أ في مقام ب، وبسط ب في مقام أ؛ الأكبر ناتجاً هو الكسر الأكبر.
        </p>
      </div>

      <div className="mt-4">
        <p className="text-center text-[11px] font-bold text-slate-500">
          مقارنات جاهزة
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {PAIR_PRESETS.map((pair) => {
            const active =
              a.n === pair.a.n &&
              a.d === pair.a.d &&
              b.n === pair.b.n &&
              b.d === pair.b.d;
            return (
              <button
                key={pair.label}
                type="button"
                onClick={() => {
                  setA(pair.a);
                  setB(pair.b);
                  fire();
                }}
                className={`min-h-11 min-w-16 rounded-full px-3 text-xs font-bold tabular-nums ${
                  active
                    ? "bg-indigo-700 text-white shadow-sm"
                    : "bg-white text-slate-700 ring-1 ring-slate-200"
                }`}
                dir="ltr"
              >
                {pair.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FractionBar({
  label,
  fraction,
  tone,
  compact,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: {
  label: string;
  fraction: Fraction;
  tone: "indigo" | "amber";
  compact?: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => void;
}) {
  const pct = valueOf(fraction) * 100;
  const fill =
    tone === "indigo"
      ? "bg-gradient-to-r from-indigo-600 to-violet-500"
      : "bg-gradient-to-r from-amber-400 to-orange-400";
  const ring =
    tone === "indigo" ? "ring-indigo-200" : "ring-amber-200";
  const badge =
    tone === "indigo" ? "text-indigo-800" : "text-amber-900";

  return (
    <div className="mt-4">
      <div className="mb-1.5 flex items-center justify-between px-1">
        <span className={`text-[12px] font-bold ${badge}`}>الشريط {label}</span>
        <span className="text-sm font-black tabular-nums text-ink" dir="ltr">
          {labelOf(fraction)}
        </span>
      </div>
      <div
        dir="ltr"
        className={`relative touch-none select-none overflow-hidden rounded-2xl bg-slate-100 ring-2 ${ring} ${
          compact ? "h-14" : "h-16"
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        role="slider"
        tabIndex={0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-valuetext={`الكسر ${labelOf(fraction)}`}
        aria-label={`شريط الكسر ${label}`}
      >
        <div
          className={`absolute inset-y-0 left-0 flex items-center justify-end ${fill} transition-[width] duration-75`}
          style={{ width: `${pct}%` }}
        >
          <span
            className="px-2 text-sm font-black tabular-nums text-white"
            dir="ltr"
          >
            {labelOf(fraction)}
          </span>
        </div>
        <div
          className="absolute top-0 z-10 flex h-full w-6 -translate-x-1/2 cursor-ew-resize items-center justify-center bg-ink shadow-md"
          style={{ left: `${pct}%` }}
        >
          <span className="h-8 w-1 rounded-full bg-white/80" />
        </div>
      </div>
    </div>
  );
}
