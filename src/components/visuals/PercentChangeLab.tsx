"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

const BASE = 80;
const MIN_V = 40;
const MAX_V = 160;
const CHART_H = 200;

/** Pixel height for a value inside the chart. */
function hFor(v: number) {
  return Math.max(28, ((v - 0) / MAX_V) * (CHART_H - 8));
}

/**
 * Percent change lab — drag the green bar by its handle.
 * Layout uses fixed pixel heights (no % height inside flex) to avoid collapse.
 */
export function PercentChangeLab({ onInteract, compact }: Props) {
  const [neu, setNeu] = useState(100);
  const [showTrap, setShowTrap] = useState(false);
  const dragging = useRef(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const delta = neu - BASE;
  const correctPct = Math.round((delta / BASE) * 1000) / 10;
  const trapPct = Math.round((delta / neu) * 1000) / 10;
  const isUp = delta >= 0;

  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const setFromClientY = (clientY: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = 1 - (clientY - rect.top) / rect.height;
    const raw = ratio * MAX_V;
    const clamped = Math.round(Math.max(MIN_V, Math.min(MAX_V, raw)));
    setNeu(clamped);
    fire();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setFromClientY(e.clientY);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    setFromClientY(e.clientY);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const baseH = hFor(BASE);
  const newH = hFor(neu);

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#ECFDF5] to-white ring-1 ring-teal-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      {/* How to use — not the concept */}
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-teal-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اسحب المقبض الأسود على العمود الأخضر لأعلى أو لأسفل.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          راقب الرقم الأخضر والصندوق أسفل الرسم.
        </p>
      </div>

      {/* Chart */}
      <div className="mt-5 flex items-end justify-center gap-8">
        {/* Base column */}
        <div className="flex w-[42%] flex-col items-center">
          <p className="mb-2 text-xs font-bold text-slate-500">الأصل</p>
          <div
            className="relative w-full"
            style={{ height: CHART_H }}
            aria-hidden
          >
            <div className="absolute inset-x-0 bottom-0 top-0 rounded-2xl bg-slate-100" />
            <div
              className="absolute inset-x-2 bottom-0 rounded-t-xl bg-slate-400"
              style={{ height: baseH }}
            />
            <p
              className="absolute inset-x-0 text-center text-lg font-black tabular-nums text-slate-800"
              style={{ bottom: baseH + 6 }}
              dir="ltr"
            >
              {BASE}
            </p>
          </div>
        </div>

        {/* New column — interactive */}
        <div className="flex w-[42%] flex-col items-center">
          <p className="mb-2 text-xs font-bold text-teal-700">الجديد</p>
          <div
            ref={trackRef}
            className="relative w-full touch-none select-none"
            style={{ height: CHART_H }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            role="slider"
            aria-valuemin={MIN_V}
            aria-valuemax={MAX_V}
            aria-valuenow={neu}
            aria-label="قيمة الجديد"
          >
            <div className="absolute inset-x-0 bottom-0 top-0 rounded-2xl bg-teal-50 ring-1 ring-teal-100" />
            <div
              className={`absolute inset-x-2 bottom-0 rounded-t-xl shadow-md ${
                isUp ? "bg-teal-500" : "bg-rose-500"
              }`}
              style={{ height: newH }}
            />
            {/* drag handle — sits on top of bar */}
            <div
              className="absolute left-1/2 z-10 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-ink text-white shadow-lg"
              style={{ bottom: newH - 18 }}
            >
              <span className="text-sm font-bold leading-none">↕</span>
            </div>
            <p
              className="pointer-events-none absolute inset-x-0 text-center text-lg font-black tabular-nums text-ink"
              style={{ bottom: newH + 22 }}
              dir="ltr"
            >
              {neu}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] text-slate-400">
        أو اختر مثالاً جاهزاً بالأسفل
      </p>

      {/* Live numbers */}
      <div className="mt-3 rounded-2xl bg-white p-4 ring-1 ring-slate-100">
        <p className="text-center text-sm text-slate-600">
          التغيّر ={" "}
          <span className="font-black tabular-nums text-ink" dir="ltr">
            {neu} − {BASE} = {delta > 0 ? `+${delta}` : delta}
          </span>
        </p>
        <div className="mt-3 rounded-xl bg-teal-50 px-3 py-3 text-center ring-1 ring-teal-100">
          <p className="text-[11px] font-bold text-teal-700">الحساب الصحيح</p>
          <p className="mt-1 text-xl font-black tabular-nums text-ink" dir="ltr">
            {delta} ÷ {BASE} = {correctPct}%
          </p>
          <p className="mt-1 text-[12px] text-teal-800">
            نقسم على <span className="font-bold underline">الأصل</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowTrap((v) => !v);
            fire();
          }}
          className="mt-3 flex min-h-11 w-full items-center justify-center rounded-xl bg-rose-50 text-sm font-bold text-rose-800 ring-1 ring-rose-100"
        >
          {showTrap ? "إخفاء المصيدة" : "أظهر المصيدة الشائعة"}
        </button>

        {showTrap && (
          <div className="mt-3 rounded-xl bg-rose-50 px-3 py-3 text-center ring-1 ring-rose-200">
            <p className="text-[11px] font-bold text-rose-700">غلط شائع</p>
            <p
              className="mt-1 text-lg font-black tabular-nums text-rose-900 line-through"
              dir="ltr"
            >
              {delta} ÷ {neu} = {trapPct}%
            </p>
            <p className="mt-2 text-xs leading-relaxed text-rose-800">
              القسمة على الرقم الجديد تعطي نسبة خاطئة.
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {[
          { label: "80→100", v: 100 },
          { label: "80→60", v: 60 },
          { label: "80→120", v: 120 },
        ].map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              setNeu(p.v);
              fire();
            }}
            className={`min-h-10 rounded-full px-3 text-xs font-bold tabular-nums ${
              neu === p.v
                ? "bg-teal-600 text-white"
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
