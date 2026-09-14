"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

const PRESETS: {
  label: string;
  pA: number;
  baseA: number;
  pB: number;
  baseB: number;
}[] = [
  { label: "20٪ من 80", pA: 20, baseA: 80, pB: 25, baseB: 60 },
  { label: "10٪ من 150", pA: 10, baseA: 150, pB: 15, baseB: 100 },
  { label: "30٪ من 200", pA: 30, baseA: 200, pB: 40, baseB: 140 },
  { label: "25٪ من 120", pA: 25, baseA: 120, pB: 20, baseB: 160 },
];

function verdict(a: number, b: number) {
  if (a > b) return "أ أكبر";
  if (b > a) return "ب أكبر";
  return "متساويتان";
}

export function CmpPercentLab({ onInteract, compact }: Props) {
  const [pA, setPA] = useState(20);
  const [baseA, setBaseA] = useState(80);
  const [pB, setPB] = useState(25);
  const [baseB, setBaseB] = useState(60);
  const [showTrap, setShowTrap] = useState(false);
  const active = useRef<"pA" | "baseA" | "pB" | "baseB" | null>(null);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const valA = (pA * baseA) / 100;
  const valB = (pB * baseB) / 100;
  const trapGuess = Math.abs(pA - pB);
  const result = verdict(valA, valB);

  const setFromClientX = (
    which: "pA" | "baseA" | "pB" | "baseB",
    clientX: number,
    el: HTMLDivElement,
  ) => {
    const rect = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    if (which === "pA" || which === "pB") {
      const next = Math.round((5 + ratio * 55) / 5) * 5;
      if (which === "pA") setPA(next);
      else setPB(next);
    } else {
      const next = Math.round((40 + ratio * 200) / 10) * 10;
      if (which === "baseA") setBaseA(next);
      else setBaseB(next);
    }
    fire();
  };

  const finish = (e: React.PointerEvent<HTMLDivElement>) => {
    active.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#F0FDFA] to-white ring-1 ring-teal-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-teal-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اسحب شريط النسبة أو الأساس في كل آلة، أو اضغط مثالاً جاهزاً.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          قارن ناتجي الآلتين — لا تطرح النسبتين من بعضهما.
        </p>
      </div>

      <div className="mt-5 text-center">
        <p className="text-[12px] font-bold text-teal-700">حكم المقارنة</p>
        <p className="mt-1 inline-flex min-h-11 items-center rounded-2xl bg-teal-700 px-4 text-xl font-black text-white">
          {result}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Machine
          title="كمية أ"
          percent={pA}
          base={baseA}
          value={valA}
          onDragPercent={(e, el) => {
            active.current = "pA";
            e.currentTarget.setPointerCapture(e.pointerId);
            setFromClientX("pA", e.clientX, el);
          }}
          onDragBase={(e, el) => {
            active.current = "baseA";
            e.currentTarget.setPointerCapture(e.pointerId);
            setFromClientX("baseA", e.clientX, el);
          }}
          onMovePercent={(e, el) => {
            if (active.current === "pA") setFromClientX("pA", e.clientX, el);
          }}
          onMoveBase={(e, el) => {
            if (active.current === "baseA")
              setFromClientX("baseA", e.clientX, el);
          }}
          onUp={finish}
        />
        <Machine
          title="كمية ب"
          percent={pB}
          base={baseB}
          value={valB}
          onDragPercent={(e, el) => {
            active.current = "pB";
            e.currentTarget.setPointerCapture(e.pointerId);
            setFromClientX("pB", e.clientX, el);
          }}
          onDragBase={(e, el) => {
            active.current = "baseB";
            e.currentTarget.setPointerCapture(e.pointerId);
            setFromClientX("baseB", e.clientX, el);
          }}
          onMovePercent={(e, el) => {
            if (active.current === "pB") setFromClientX("pB", e.clientX, el);
          }}
          onMoveBase={(e, el) => {
            if (active.current === "baseB")
              setFromClientX("baseB", e.clientX, el);
          }}
          onUp={finish}
        />
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-100">
        <p className="text-center text-[12px] font-bold text-slate-500">
          عرض العوامل
        </p>
        <p
          className="mt-2 text-center text-sm font-black tabular-nums text-teal-900"
          dir="ltr"
        >
          {pA}/100 × {baseA} = {valA} &nbsp;·&nbsp; {pB}/100 × {baseB} = {valB}
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          setShowTrap((v) => !v);
          fire();
        }}
        className={`mt-3 min-h-11 w-full rounded-2xl px-3 text-sm font-bold ${
          showTrap
            ? "bg-rose-600 text-white"
            : "bg-white text-rose-700 ring-1 ring-rose-200"
        }`}
      >
        {showTrap ? "إخفاء المصيدة" : "أظهر المصيدة: اطرح النسب"}
      </button>
      {showTrap && (
        <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2.5 text-center text-[13px] font-bold leading-relaxed text-rose-900 ring-1 ring-rose-100">
          خطأ شائع: طرح {pA}٪ − {pB}٪ = {trapGuess} نقطة. المقارنة الصحيحة
          للناتجين العدديين لا للفرق بين النسب.
        </p>
      )}

      <div className="mt-4">
        <p className="text-center text-[11px] font-bold text-slate-500">
          أمثلة جاهزة
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setPA(p.pA);
                setBaseA(p.baseA);
                setPB(p.pB);
                setBaseB(p.baseB);
                fire();
              }}
              className="min-h-11 rounded-full bg-white px-3 text-xs font-bold text-teal-800 ring-1 ring-teal-200"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Machine({
  title,
  percent,
  base,
  value,
  onDragPercent,
  onDragBase,
  onMovePercent,
  onMoveBase,
  onUp,
}: {
  title: string;
  percent: number;
  base: number;
  value: number;
  onDragPercent: (e: React.PointerEvent<HTMLDivElement>, el: HTMLDivElement) => void;
  onDragBase: (e: React.PointerEvent<HTMLDivElement>, el: HTMLDivElement) => void;
  onMovePercent: (e: React.PointerEvent<HTMLDivElement>, el: HTMLDivElement) => void;
  onMoveBase: (e: React.PointerEvent<HTMLDivElement>, el: HTMLDivElement) => void;
  onUp: (e: React.PointerEvent<HTMLDivElement>) => void;
}) {
  return (
    <div className="rounded-2xl bg-teal-50/80 p-3 ring-1 ring-teal-100">
      <p className="text-center text-[12px] font-bold text-teal-800">{title}</p>
      <p
        className="mt-1 text-center text-2xl font-black tabular-nums text-teal-900"
        dir="ltr"
      >
        {value}
      </p>
      <p className="mt-1 text-center text-[12px] font-bold text-slate-500" dir="ltr">
        {percent}٪ من {base}
      </p>

      <p className="mt-3 text-[11px] font-bold text-slate-500">النسبة</p>
      <div
        dir="ltr"
        className="relative mt-1 h-11 touch-none rounded-xl bg-white ring-1 ring-teal-200"
        onPointerDown={(e) => {
          e.preventDefault();
          onDragPercent(e, e.currentTarget);
        }}
        onPointerMove={(e) => onMovePercent(e, e.currentTarget)}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div
          className="absolute inset-y-1 left-1 rounded-lg bg-teal-600"
          style={{
            width: `max(8px, calc(${(percent / 60) * 100}% - 8px))`,
          }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-xs font-black tabular-nums text-teal-950">
          {percent}٪
        </span>
      </div>

      <p className="mt-3 text-[11px] font-bold text-slate-500">الأساس</p>
      <div
        dir="ltr"
        className="relative mt-1 h-11 touch-none rounded-xl bg-white ring-1 ring-teal-200"
        onPointerDown={(e) => {
          e.preventDefault();
          onDragBase(e, e.currentTarget);
        }}
        onPointerMove={(e) => onMoveBase(e, e.currentTarget)}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div
          className="absolute inset-y-1 left-1 rounded-lg bg-cyan-500"
          style={{
            width: `max(8px, calc(${((base - 40) / 200) * 100}% - 8px))`,
          }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-xs font-black tabular-nums text-slate-800">
          {base}
        </span>
      </div>
    </div>
  );
}
