"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type Pair = {
  label: string;
  a1: number;
  a0: number;
  b1: number;
  b0: number;
  exprA: string;
  exprB: string;
};

const PAIRS: Pair[] = [
  {
    label: "3س+1 و 2س+5",
    a1: 3,
    a0: 1,
    b1: 2,
    b0: 5,
    exprA: "3س + 1",
    exprB: "2س + 5",
  },
  {
    label: "4س و س+9",
    a1: 4,
    a0: 0,
    b1: 1,
    b0: 9,
    exprA: "4س",
    exprB: "س + 9",
  },
  {
    label: "2س−3 و س+4",
    a1: 2,
    a0: -3,
    b1: 1,
    b0: 4,
    exprA: "2س − 3",
    exprB: "س + 4",
  },
  {
    label: "5س−2 و 3س+6",
    a1: 5,
    a0: -2,
    b1: 3,
    b0: 6,
    exprA: "5س − 2",
    exprB: "3س + 6",
  },
];

const STRIP = [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8];

function verdict(a: number, b: number): string {
  if (a > b) return "كمية أ أكبر";
  if (b > a) return "كمية ب أكبر";
  return "متساويتان";
}

export function CmpAlgebraLab({ onInteract, compact }: Props) {
  const [pairIndex, setPairIndex] = useState(0);
  const [s, setS] = useState(3);
  const dragIndex = useRef<number | null>(null);
  const fire = useCallback(() => onInteract?.(), [onInteract]);
  const pair = PAIRS[pairIndex]!;
  const valA = pair.a1 * s + pair.a0;
  const valB = pair.b1 * s + pair.b0;
  const result = verdict(valA, valB);

  const pickS = (value: number) => {
    setS(value);
    fire();
  };

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#EEF2FF] to-white ring-1 ring-indigo-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-indigo-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اسحب قيمة س على الشريط، وراقب مقدارَي أ و ب.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          الحكم يتغيّر مع س — عوّض ثم قارن.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-indigo-600 px-3 py-4 text-center text-white">
          <p className="text-[11px] font-bold text-indigo-100">كمية أ</p>
          <p className="mt-1 text-sm font-black tabular-nums" dir="ltr">
            {pair.exprA}
          </p>
          <p className="mt-2 text-2xl font-black tabular-nums" dir="ltr">
            {valA}
          </p>
        </div>
        <div className="rounded-2xl bg-indigo-900 px-3 py-4 text-center text-white">
          <p className="text-[11px] font-bold text-indigo-200">كمية ب</p>
          <p className="mt-1 text-sm font-black tabular-nums" dir="ltr">
            {pair.exprB}
          </p>
          <p className="mt-2 text-2xl font-black tabular-nums" dir="ltr">
            {valB}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-2xl bg-white px-3 py-3 text-center ring-1 ring-indigo-100">
        <p className="text-[11px] font-bold text-slate-500">
          عند س = <span className="tabular-nums text-indigo-900" dir="ltr">{s}</span>
        </p>
        <p className="mt-1 text-lg font-black text-indigo-900">{result}</p>
      </div>

      <div
        className="mt-3 flex touch-none gap-1 overflow-x-auto pb-1"
        onPointerLeave={() => {
          dragIndex.current = null;
        }}
      >
        {STRIP.map((value) => {
          const active = value === s;
          return (
            <button
              key={value}
              type="button"
              onPointerDown={(e) => {
                dragIndex.current = value;
                e.currentTarget.setPointerCapture(e.pointerId);
                pickS(value);
              }}
              onPointerEnter={() => {
                if (dragIndex.current === null) return;
                pickS(value);
              }}
              onPointerUp={() => {
                dragIndex.current = null;
              }}
              className={`flex h-11 min-w-11 flex-1 items-center justify-center rounded-xl text-sm font-black tabular-nums transition ${
                active
                  ? "bg-indigo-600 text-white"
                  : "bg-indigo-50 text-indigo-900 ring-1 ring-indigo-100"
              }`}
              dir="ltr"
            >
              {value}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {PAIRS.map((p, index) => {
          const active = index === pairIndex;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setPairIndex(index);
                fire();
              }}
              className={`min-h-11 rounded-xl px-3 text-xs font-bold tabular-nums ring-1 transition ${
                active
                  ? "bg-indigo-700 text-white ring-indigo-700"
                  : "bg-white text-indigo-900 ring-indigo-100"
              }`}
              dir="ltr"
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
