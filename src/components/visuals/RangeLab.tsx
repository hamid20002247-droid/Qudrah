"use client";

import { useCallback, useRef, useState, type PointerEvent } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

const LINE_MIN = 0;
const LINE_MAX = 20;

const PRESETS: { label: string; points: number[] }[] = [
  { label: "درجات", points: [4, 9, 12, 7, 15] },
  { label: "مسافات", points: [2, 8, 5, 14, 11] },
  { label: "أسعار", points: [6, 6, 18, 10, 3] },
];

export function RangeLab({ onInteract, compact }: Props) {
  const [points, setPoints] = useState([4, 9, 12, 7, 15]);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragKind = useRef<"min" | "max" | null>(null);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const minVal = Math.min(...points);
  const maxVal = Math.max(...points);
  const range = maxVal - minVal;

  const pct = (v: number) =>
    ((v - LINE_MIN) / (LINE_MAX - LINE_MIN)) * 100;

  const valueFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(LINE_MIN + ratio * (LINE_MAX - LINE_MIN));
  };

  const moveMarker = (kind: "min" | "max", clientX: number) => {
    const next = valueFromClientX(clientX);
    if (next === null) return;
    setPoints((current) => {
      const sorted = [...current].sort((a, b) => a - b);
      const minIndex = current.indexOf(sorted[0]!);
      const maxIndex = current.lastIndexOf(sorted[sorted.length - 1]!);
      const targetIndex = kind === "min" ? minIndex : maxIndex;
      return current.map((v, i) => (i === targetIndex ? next : v));
    });
    fire();
  };

  const onPointerDown = (kind: "min" | "max", e: PointerEvent) => {
    dragKind.current = kind;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    moveMarker(kind, e.clientX);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragKind.current) return;
    moveMarker(dragKind.current, e.clientX);
  };

  const onPointerUp = () => {
    dragKind.current = null;
  };

  const tapAdd = (e: React.MouseEvent) => {
    if (dragKind.current) return;
    const next = valueFromClientX(e.clientX);
    if (next === null) return;
    setPoints((current) =>
      current.length >= 8 ? [...current.slice(1), next] : [...current, next],
    );
    fire();
  };

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-slate-50 to-rose-50/40 ring-1 ring-slate-200 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-slate-200">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اسحب علامتي الأصغر والأكبر، أو اضغط على الخط لإضافة نقطة.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          المدى = الأكبر ناقص الأصغر.
        </p>
      </div>

      <div
        ref={trackRef}
        className="relative mt-8 mb-6 h-16 select-none"
        onClick={tapAdd}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        aria-label="خط الأعداد"
      >
        <div
          className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-200"
          aria-hidden
        />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-rose-400"
          style={{
            left: `${pct(minVal)}%`,
            width: `${Math.max(0, pct(maxVal) - pct(minVal))}%`,
          }}
          aria-hidden
        />
        {points.map((p, i) => (
          <span
            key={`${p}-${i}`}
            className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-500"
            style={{ left: `${pct(p)}%` }}
            aria-hidden
          />
        ))}
        <button
          type="button"
          className="absolute top-1/2 z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-slate-700 text-[11px] font-black text-white shadow"
          style={{ left: `${pct(minVal)}%` }}
          onPointerDown={(e) => onPointerDown("min", e)}
          aria-label={`الأصغر ${minVal}`}
        >
          <span className="tabular-nums" dir="ltr">
            {minVal}
          </span>
        </button>
        <button
          type="button"
          className="absolute top-1/2 z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-rose-600 text-[11px] font-black text-white shadow"
          style={{ left: `${pct(maxVal)}%` }}
          onPointerDown={(e) => onPointerDown("max", e)}
          aria-label={`الأكبر ${maxVal}`}
        >
          <span className="tabular-nums" dir="ltr">
            {maxVal}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-white p-3 text-center ring-1 ring-slate-100">
          <p className="text-[11px] font-bold text-slate-500">الأصغر</p>
          <p className="text-xl font-black tabular-nums text-slate-800" dir="ltr">
            {minVal}
          </p>
        </div>
        <div className="rounded-2xl bg-rose-600 p-3 text-center text-white shadow-sm">
          <p className="text-[11px] font-bold text-rose-100">المدى</p>
          <p className="text-xl font-black tabular-nums" dir="ltr">
            {range}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-3 text-center ring-1 ring-slate-100">
          <p className="text-[11px] font-bold text-slate-500">الأكبر</p>
          <p className="text-xl font-black tabular-nums text-rose-700" dir="ltr">
            {maxVal}
          </p>
        </div>
      </div>

      <p className="mt-2 text-center text-[12px] font-bold tabular-nums text-slate-600" dir="ltr">
        {maxVal} − {minVal} = {range}
      </p>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {PRESETS.map((preset) => {
          const active =
            preset.points.length === points.length &&
            preset.points.every((v, i) => v === points[i]);
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setPoints(preset.points);
                fire();
              }}
              className={`min-h-11 rounded-full px-3 text-xs font-bold ${
                active
                  ? "bg-slate-800 text-white"
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
