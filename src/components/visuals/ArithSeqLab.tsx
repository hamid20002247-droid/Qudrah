"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

const PRESETS: { label: string; a: number; d: number }[] = [
  { label: "3، 7، 11…", a: 3, d: 4 },
  { label: "20، 15، 10…", a: 20, d: -5 },
  { label: "5، 8، 11…", a: 5, d: 3 },
  { label: "12، 9، 6…", a: 12, d: -3 },
];

const D_MIN = -8;
const D_MAX = 8;

export function ArithSeqLab({ onInteract, compact }: Props) {
  const [a, setA] = useState(3);
  const [d, setD] = useState(4);
  const [flash, setFlash] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const terms = [a, a + d, a + 2 * d, a + 3 * d, a + 4 * d, a + 5 * d];
  const nextThree = [a + 3 * d, a + 4 * d, a + 5 * d];

  useEffect(() => {
    setFlash(true);
    const t = window.setTimeout(() => setFlash(false), 420);
    return () => window.clearTimeout(t);
  }, [a, d]);

  const setDFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const raw = Math.round(D_MIN + ratio * (D_MAX - D_MIN));
    const next = raw === 0 ? (d > 0 ? 1 : -1) : raw;
    setD(Math.max(D_MIN, Math.min(D_MAX, next === 0 ? 1 : next)));
    fire();
  };

  const bumpD = (delta: number) => {
    setD((current) => {
      let next = current + delta;
      if (next === 0) next += delta;
      return Math.max(D_MIN, Math.min(D_MAX, next));
    });
    fire();
  };

  const pct = ((d - D_MIN) / (D_MAX - D_MIN)) * 100;

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#EFF6FF] to-white ring-1 ring-sky-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-sky-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اسحب الفرق أو اضغط +/−، وشاهد الحجارة تتقدّم على المسار.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          لاحظ أن الفرق ثابت بين كل حدّ والذي يليه.
        </p>
      </div>

      <div className="mt-4 text-center">
        <p className="text-[12px] font-bold text-sky-700">الفرق المشترك</p>
        <p
          className="mt-1 text-2xl font-black tabular-nums text-ink sm:text-3xl"
          dir="ltr"
        >
          الفرق = {d}
        </p>
      </div>

      <div
        className="relative mt-5 overflow-hidden rounded-2xl bg-sky-50 px-2 py-5 ring-1 ring-sky-100"
        aria-label="حجارة المتتالية"
      >
        <div
          className="pointer-events-none absolute inset-x-4 top-1/2 h-1 -translate-y-1/2 rounded-full bg-sky-200"
          aria-hidden
        />
        <div className="relative flex items-center justify-between gap-1" dir="ltr">
          {terms.map((term, index) => {
            const isNew = index >= 3;
            return (
              <div
                key={`${term}-${index}`}
                className={`flex flex-col items-center transition-transform duration-300 ${
                  isNew && flash ? "scale-110" : "scale-100"
                }`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-black tabular-nums shadow-sm sm:h-14 sm:w-14 ${
                    isNew
                      ? "bg-sky-600 text-white ring-2 ring-sky-800"
                      : "bg-white text-sky-900 ring-2 ring-sky-300"
                  }`}
                >
                  {term}
                </div>
                <span className="mt-1 text-[10px] font-bold text-slate-500">
                  {index + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-sky-700 px-3 py-3 text-center text-white">
        <p className="text-[11px] font-bold text-sky-100">الحدود الثلاثة التالية</p>
        <p className="mt-1 text-lg font-black tabular-nums" dir="ltr">
          {nextThree.join(" ، ")}
        </p>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => bumpD(-1)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg font-black text-slate-700 ring-1 ring-slate-200"
          aria-label="إنقاص الفرق"
        >
          −
        </button>
        <div
          ref={trackRef}
          className="relative h-11 flex-1 touch-none overflow-hidden rounded-full bg-sky-100 ring-1 ring-sky-200"
          onPointerDown={(e) => {
            e.preventDefault();
            dragging.current = true;
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            setDFromClientX(e.clientX);
          }}
          onPointerMove={(e) => {
            if (!dragging.current) return;
            setDFromClientX(e.clientX);
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
          aria-valuemin={D_MIN}
          aria-valuemax={D_MAX}
          aria-valuenow={d}
          aria-label="الفرق المشترك"
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-sky-400/50"
            style={{ width: `${pct}%` }}
          />
          <div
            className="absolute top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-white shadow ring-2 ring-sky-600"
            style={{ left: `calc(${pct}% - 16px)` }}
          />
        </div>
        <button
          type="button"
          onClick={() => bumpD(1)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg font-black text-slate-700 ring-1 ring-slate-200"
          aria-label="زيادة الفرق"
        >
          +
        </button>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => {
            setA((v) => v + 1);
            fire();
          }}
          className="min-h-11 rounded-full bg-white px-3 text-xs font-bold text-slate-700 ring-1 ring-slate-200"
        >
          الحد الأول +1
        </button>
        <button
          type="button"
          onClick={() => {
            setA((v) => v - 1);
            fire();
          }}
          className="min-h-11 rounded-full bg-white px-3 text-xs font-bold text-slate-700 ring-1 ring-slate-200"
        >
          الحد الأول −1
        </button>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {PRESETS.map((preset) => {
          const active = preset.a === a && preset.d === d;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setA(preset.a);
                setD(preset.d);
                fire();
              }}
              className={`min-h-11 rounded-full px-3 text-xs font-bold tabular-nums ${
                active
                  ? "bg-sky-800 text-white"
                  : "bg-white text-slate-700 ring-1 ring-slate-200"
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
