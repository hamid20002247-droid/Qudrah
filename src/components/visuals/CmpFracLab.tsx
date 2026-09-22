"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
  autoDemo?: boolean;
};

type Fraction = { n: number; d: number };

const PRESETS: { a: Fraction; b: Fraction; label: string }[] = [
  { a: { n: 2, d: 3 }, b: { n: 3, d: 5 }, label: "2/3 · 3/5" },
  { a: { n: 3, d: 4 }, b: { n: 5, d: 6 }, label: "3/4 · 5/6" },
  { a: { n: 1, d: 2 }, b: { n: 2, d: 5 }, label: "1/2 · 2/5" },
  { a: { n: 4, d: 5 }, b: { n: 3, d: 4 }, label: "4/5 · 3/4" },
];

const N_OPTS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const D_OPTS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12];

function verdict(left: number, right: number) {
  if (left > right) return "أ أكبر";
  if (right > left) return "ب أكبر";
  return "متساويتان";
}

export function CmpFracLab({ onInteract, compact, autoDemo }: Props) {
  const [a, setA] = useState<Fraction>({ n: 2, d: 3 });
  const [b, setB] = useState<Fraction>({ n: 3, d: 5 });
  const drag = useRef<"aN" | "aD" | "bN" | "bD" | null>(null);
  const userTouched = useRef(false);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  useEffect(() => {
    if (!autoDemo) return;
    let i = 0;
    const id = window.setInterval(() => {
      if (userTouched.current) return;
      i = (i + 1) % PRESETS.length;
      const p = PRESETS[i]!;
      setA(p.a);
      setB(p.b);
    }, 1400);
    return () => window.clearInterval(id);
  }, [autoDemo]);

  const crossA = a.n * b.d;
  const crossB = b.n * a.d;
  const result = verdict(crossA, crossB);

  const bump = (which: "aN" | "aD" | "bN" | "bD", dir: 1 | -1) => {
    userTouched.current = true;
    if (which === "aN") {
      const i = N_OPTS.indexOf(a.n);
      const next = N_OPTS[Math.max(0, Math.min(N_OPTS.length - 1, i + dir))];
      setA((f) => ({ ...f, n: Math.min(next, f.d - 0) || next }));
    } else if (which === "aD") {
      const i = D_OPTS.indexOf(a.d);
      const next = D_OPTS[Math.max(0, Math.min(D_OPTS.length - 1, i + dir))];
      setA((f) => ({ n: Math.min(f.n, next), d: next }));
    } else if (which === "bN") {
      const i = N_OPTS.indexOf(b.n);
      const next = N_OPTS[Math.max(0, Math.min(N_OPTS.length - 1, i + dir))];
      setB((f) => ({ ...f, n: next }));
    } else {
      const i = D_OPTS.indexOf(b.d);
      const next = D_OPTS[Math.max(0, Math.min(D_OPTS.length - 1, i + dir))];
      setB((f) => ({ n: Math.min(f.n, next), d: next }));
    }
    fire();
  };

  const setFromBar = (
    which: "a" | "b",
    clientX: number,
    el: HTMLDivElement,
  ) => {
    userTouched.current = true;
    const rect = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(0.95, (clientX - rect.left) / rect.width));
    const d = which === "a" ? a.d : b.d;
    const n = Math.max(1, Math.min(d, Math.round(ratio * d)));
    if (which === "a") setA({ n, d });
    else setB({ n, d });
    fire();
  };

  const finish = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#F5F3FF] to-white ring-1 ring-violet-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-violet-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اسحب شريط الكسر، أو اضغط +/− لتغيير البسط والمقام.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          راقب حاصلَي الضرب التبادلي ثم الحكم.
        </p>
      </div>

      <div className="mt-5 text-center">
        <p className="text-[12px] font-bold text-violet-700">حكم المقارنة</p>
        <p className="mt-1 inline-flex min-h-11 items-center rounded-2xl bg-violet-700 px-4 text-xl font-black text-white">
          {result}
        </p>
        <p
          className="mt-2 text-sm font-black tabular-nums text-slate-600"
          dir="ltr"
        >
          أ×مقام ب = {crossA} &nbsp;·&nbsp; ب×مقام أ = {crossB}
        </p>
      </div>

      <FracPanel
        title="كمية أ"
        f={a}
        tone="violet"
        compact={compact}
        onBarDown={(e) => {
          e.preventDefault();
          drag.current = "aN";
          e.currentTarget.setPointerCapture(e.pointerId);
          setFromBar("a", e.clientX, e.currentTarget);
        }}
        onBarMove={(e) => {
          if (drag.current === "aN")
            setFromBar("a", e.clientX, e.currentTarget);
        }}
        onBarUp={finish}
        onBumpN={(d) => bump("aN", d)}
        onBumpD={(d) => bump("aD", d)}
      />

      <FracPanel
        title="كمية ب"
        f={b}
        tone="fuchsia"
        compact={compact}
        onBarDown={(e) => {
          e.preventDefault();
          drag.current = "bN";
          e.currentTarget.setPointerCapture(e.pointerId);
          setFromBar("b", e.clientX, e.currentTarget);
        }}
        onBarMove={(e) => {
          if (drag.current === "bN")
            setFromBar("b", e.clientX, e.currentTarget);
        }}
        onBarUp={finish}
        onBumpN={(d) => bump("bN", d)}
        onBumpD={(d) => bump("bD", d)}
      />

      <div className="mt-4 rounded-2xl bg-white p-3 text-center ring-1 ring-slate-100">
        <p className="text-[13px] font-bold leading-relaxed text-violet-950">
          اضرب بسط أ في مقام ب، وبسط ب في مقام أ؛ الأكبر ناتجاً هو الكسر الأكبر.
        </p>
      </div>

      <div className="mt-4">
        <p className="text-center text-[11px] font-bold text-slate-500">
          مقارنات جاهزة
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                userTouched.current = true;
                setA(p.a);
                setB(p.b);
                fire();
              }}
              className="min-h-11 rounded-full bg-white px-3 text-xs font-bold tabular-nums text-violet-800 ring-1 ring-violet-200"
              dir="ltr"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FracPanel({
  title,
  f,
  tone,
  compact,
  onBarDown,
  onBarMove,
  onBarUp,
  onBumpN,
  onBumpD,
}: {
  title: string;
  f: Fraction;
  tone: "violet" | "fuchsia";
  compact?: boolean;
  onBarDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onBarMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onBarUp: (e: React.PointerEvent<HTMLDivElement>) => void;
  onBumpN: (d: 1 | -1) => void;
  onBumpD: (d: 1 | -1) => void;
}) {
  const fill = tone === "violet" ? "bg-violet-600" : "bg-fuchsia-600";
  const ring =
    tone === "violet" ? "ring-violet-100" : "ring-fuchsia-100";
  const width = `${(f.n / f.d) * 100}%`;

  return (
    <div className={`mt-4 rounded-2xl bg-white p-3 ring-1 ${ring}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[12px] font-bold text-slate-500">{title}</p>
        <p className="text-lg font-black tabular-nums text-ink" dir="ltr">
          {f.n}/{f.d}
        </p>
      </div>
      <div
        dir="ltr"
        className={`relative touch-none overflow-hidden rounded-xl bg-slate-100 ${
          compact ? "h-12" : "h-14"
        }`}
        onPointerDown={onBarDown}
        onPointerMove={onBarMove}
        onPointerUp={onBarUp}
        onPointerCancel={onBarUp}
      >
        <div className={`h-full ${fill}`} style={{ width }} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Stepper label="البسط" value={f.n} onMinus={() => onBumpN(-1)} onPlus={() => onBumpN(1)} />
        <Stepper label="المقام" value={f.d} onMinus={() => onBumpD(-1)} onPlus={() => onBumpD(1)} />
      </div>
    </div>
  );
}

function Stepper({
  label,
  value,
  onMinus,
  onPlus,
}: {
  label: string;
  value: number;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-2 text-center">
      <p className="text-[11px] font-bold text-slate-500">{label}</p>
      <div className="mt-1 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={onMinus}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg font-black ring-1 ring-slate-200"
        >
          −
        </button>
        <span className="min-w-8 text-lg font-black tabular-nums" dir="ltr">
          {value}
        </span>
        <button
          type="button"
          onClick={onPlus}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg font-black ring-1 ring-slate-200"
        >
          +
        </button>
      </div>
    </div>
  );
}
