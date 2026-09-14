"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type Mode = "complement" | "supplement" | "triangle";

const PRESETS: { label: string; mode: Mode; a: number }[] = [
  { label: "متتامتان", mode: "complement", a: 35 },
  { label: "متكاملتان", mode: "supplement", a: 110 },
  { label: "مثلث", mode: "triangle", a: 50 },
];

export function AnglesLab({ onInteract, compact }: Props) {
  const [mode, setMode] = useState<Mode>("complement");
  const [angleA, setAngleA] = useState(35);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const maxA = mode === "complement" ? 80 : mode === "supplement" ? 160 : 120;
  const minA = mode === "triangle" ? 20 : 10;

  const angleB =
    mode === "complement"
      ? 90 - angleA
      : mode === "supplement"
        ? 180 - angleA
        : Math.max(20, Math.min(80, 180 - angleA - 60));
  const angleC = mode === "triangle" ? 180 - angleA - angleB : 0;
  const sum =
    mode === "complement"
      ? angleA + angleB
      : mode === "supplement"
        ? angleA + angleB
        : angleA + angleB + angleC;

  const setFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    const raw = Math.round(minA + ratio * (maxA - minA));
    setAngleA(Math.max(minA, Math.min(maxA, raw)));
    fire();
  };

  const bump = (delta: number) => {
    setAngleA((current) => Math.max(minA, Math.min(maxA, current + delta)));
    fire();
  };

  const relationLabel =
    mode === "complement"
      ? "متتامتان (مجموعهما 90)"
      : mode === "supplement"
        ? "متكاملتان (مجموعهما 180)"
        : "زوايا المثلث (مجموعها 180)";

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#FFF7ED] to-white ring-1 ring-orange-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-orange-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اسحب الشريط أو اضغط +/− لتغيير الزاوية الأولى.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          راقب كيف تتكيّف الزاوية الأخرى ليبقى المجموع ثابتاً.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {(
          [
            { id: "complement" as const, label: "متتامتان" },
            { id: "supplement" as const, label: "متكاملتان" },
            { id: "triangle" as const, label: "مثلث" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setMode(item.id);
              setAngleA(item.id === "complement" ? 35 : item.id === "supplement" ? 110 : 50);
              fire();
            }}
            className={`min-h-11 rounded-full px-3 text-xs font-bold ${
              mode === item.id
                ? "bg-orange-700 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-center gap-3" aria-label="زوايا">
        <div className="rounded-2xl bg-orange-50 px-4 py-3 text-center ring-1 ring-orange-100">
          <p className="text-[11px] font-bold text-slate-500">الزاوية أ</p>
          <p className="text-2xl font-black tabular-nums text-orange-900" dir="ltr">
            {angleA}°
          </p>
        </div>
        <div className="rounded-2xl bg-amber-50 px-4 py-3 text-center ring-1 ring-amber-100">
          <p className="text-[11px] font-bold text-slate-500">الزاوية ب</p>
          <p className="text-2xl font-black tabular-nums text-amber-900" dir="ltr">
            {angleB}°
          </p>
        </div>
        {mode === "triangle" && (
          <div className="rounded-2xl bg-yellow-50 px-4 py-3 text-center ring-1 ring-yellow-100">
            <p className="text-[11px] font-bold text-slate-500">الزاوية ج</p>
            <p className="text-2xl font-black tabular-nums text-yellow-900" dir="ltr">
              {angleC}°
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => bump(-5)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg font-black text-slate-700 ring-1 ring-slate-200"
          aria-label="إنقاص الزاوية"
        >
          −
        </button>
        <div
          ref={trackRef}
          className="relative h-11 flex-1 touch-none overflow-hidden rounded-full bg-orange-100 ring-1 ring-orange-200"
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
          aria-valuemin={minA}
          aria-valuemax={maxA}
          aria-valuenow={angleA}
          aria-label="مقياس الزاوية أ"
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-orange-500"
            style={{ width: `${((angleA - minA) / (maxA - minA)) * 100}%` }}
          />
          <div
            className="absolute top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-white shadow ring-2 ring-orange-600"
            style={{
              left: `calc(${((angleA - minA) / (maxA - minA)) * 100}% - 16px)`,
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => bump(5)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg font-black text-slate-700 ring-1 ring-slate-200"
          aria-label="زيادة الزاوية"
        >
          +
        </button>
      </div>

      <div className="mt-4 rounded-2xl bg-orange-600 px-3 py-4 text-center text-white shadow-sm">
        <p className="text-[11px] font-bold text-orange-100">{relationLabel}</p>
        <p className="mt-1 text-xl font-black tabular-nums" dir="ltr">
          {mode === "triangle"
            ? `${angleA} + ${angleB} + ${angleC} = ${sum}`
            : `${angleA} + ${angleB} = ${sum}`}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {PRESETS.map((preset) => {
          const active = mode === preset.mode && angleA === preset.a;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setMode(preset.mode);
                setAngleA(preset.a);
                fire();
              }}
              className={`min-h-11 rounded-full px-3 text-xs font-bold ${
                active
                  ? "bg-orange-800 text-white"
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
