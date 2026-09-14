"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

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

export function RatioLab({ onInteract, compact }: Props) {
  const total = 120;
  const [partA, setPartA] = useState(48);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const partB = total - partA;
  const g = gcd(partA, partB);
  const rA = partA / g;
  const rB = partB / g;

  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const setFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const rtl = getComputedStyle(el).direction === "rtl";
    const ratio = rtl
      ? (rect.right - clientX) / rect.width
      : (clientX - rect.left) / rect.width;
    const raw = Math.round(ratio * total);
    const clamped = Math.max(16, Math.min(total - 16, raw));
    setPartA(Math.round(clamped / 4) * 4);
    fire();
  };

  const pctA = (partA / total) * 100;

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#F0F9FF] to-white ring-1 ring-sky-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-sky-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اسحب الخط الأسود يميناً أو يساراً بين اللونين.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          الكمية كلها ثابتة ({total}). تتحرّك الحصص فقط.
        </p>
      </div>

      <div className="mt-5 text-center">
        <p className="text-3xl font-black tabular-nums text-ink" dir="ltr">
          {rA} : {rB}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          النسبة المبسّطة
        </p>
      </div>

      <div
        ref={trackRef}
        className="relative mt-5 h-20 touch-none overflow-hidden rounded-2xl ring-2 ring-slate-200"
        onPointerDown={(e) => {
          e.preventDefault();
          dragging.current = true;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          setFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          setFromClientX(e.clientX);
        }}
        onPointerUp={(e) => {
          dragging.current = false;
          try {
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
          } catch {
            /* ignore */
          }
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
        role="slider"
        aria-valuemin={16}
        aria-valuemax={total - 16}
        aria-valuenow={partA}
        aria-label="فاصل النسبة"
      >
        <div
          className="absolute inset-y-0 start-0 flex items-center justify-center bg-teal-500"
          style={{ width: `${pctA}%` }}
        >
          <span className="text-base font-black tabular-nums text-white" dir="ltr">
            {partA}
          </span>
        </div>
        <div
          className="absolute inset-y-0 end-0 flex items-center justify-center bg-amber-400"
          style={{ width: `${100 - pctA}%` }}
        >
          <span className="text-base font-black tabular-nums text-amber-950" dir="ltr">
            {partB}
          </span>
        </div>
        <div
          className="absolute top-0 z-10 flex h-full w-6 -translate-x-1/2 cursor-ew-resize items-center justify-center bg-ink shadow-md"
          style={{ insetInlineStart: `${pctA}%` }}
        >
          <span className="h-8 w-1 rounded-full bg-white/70" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-teal-50 p-3 text-center ring-1 ring-teal-100">
          <p className="text-[11px] font-bold text-teal-700">الحصة أ</p>
          <p className="text-2xl font-black tabular-nums text-teal-900" dir="ltr">
            {partA}
          </p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-3 text-center ring-1 ring-amber-100">
          <p className="text-[11px] font-bold text-amber-800">الحصة ب</p>
          <p className="text-2xl font-black tabular-nums text-amber-950" dir="ltr">
            {partB}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-slate-50 px-3 py-3 text-center text-[13px] leading-relaxed text-slate-700 ring-1 ring-slate-100">
        الأجزاء {rA}+{rB}={rA + rB} ← {total}÷{rA + rB} = حصة الجزء ← اضرب
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {[
          { a: 40, label: "1:2" },
          { a: 48, label: "2:3" },
          { a: 30, label: "1:3" },
          { a: 60, label: "1:1" },
        ].map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              setPartA(p.a);
              fire();
            }}
            className={`min-h-10 rounded-full px-3 text-xs font-bold ${
              partA === p.a
                ? "bg-sky-700 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
