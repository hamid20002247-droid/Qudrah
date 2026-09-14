"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

const PRESETS = [
  { label: "قاعدة 8 ارتفاع 6", base: 8, height: 6 },
  { label: "قاعدة 10 ارتفاع 5", base: 10, height: 5 },
  { label: "قاعدة 12 ارتفاع 7", base: 12, height: 7 },
];

export function TriangleAreaLab({ onInteract, compact }: Props) {
  const [base, setBase] = useState(8);
  const [height, setHeight] = useState(6);
  const [showTrap, setShowTrap] = useState(false);
  const [activeDim, setActiveDim] = useState<"base" | "height">("base");
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const area = (base * height) / 2;
  const trapWithoutHalf = base * height;

  const applyValue = (value: number) => {
    const clamped = Math.max(2, Math.min(16, value));
    if (activeDim === "base") setBase(clamped);
    else setHeight(clamped);
    fire();
  };

  const setFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    applyValue(Math.round(2 + ratio * 14));
  };

  const current = activeDim === "base" ? base : height;
  const bump = (delta: number) => applyValue(current + delta);

  const scale = compact ? 10 : 12;
  const svgW = Math.max(80, base * scale);
  const svgH = Math.max(50, height * scale);
  const tipX = 24 + svgW * 0.35;

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#FFF1F2] to-white ring-1 ring-rose-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-rose-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اسحب الشريط أو اضغط +/− لتغيير القاعدة أو الارتفاع.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          راقب المساحة = نصف ضرب القاعدة ضرب الارتفاع.
        </p>
      </div>

      <div className="mt-5 flex min-h-40 items-center justify-center">
        <svg
          width={svgW + 56}
          height={svgH + 48}
          viewBox={`0 0 ${svgW + 56} ${svgH + 48}`}
          className="max-w-full"
          aria-label="مثلث المساحة"
        >
          <line
            x1={24}
            y1={16 + svgH}
            x2={24 + svgW}
            y2={16 + svgH}
            stroke="#9F1239"
            strokeWidth={3}
          />
          <line
            x1={tipX}
            y1={16}
            x2={tipX}
            y2={16 + svgH}
            stroke="#FB7185"
            strokeWidth={2}
            strokeDasharray="4 4"
          />
          <polygon
            points={`${24},${16 + svgH} ${24 + svgW},${16 + svgH} ${tipX},16`}
            fill="#FECDD3"
            stroke="#E11D48"
            strokeWidth={3}
          />
          <text
            x={24 + svgW / 2}
            y={16 + svgH + 18}
            textAnchor="middle"
            className="fill-rose-900 text-[12px] font-bold"
            direction="ltr"
          >
            {base}
          </text>
          <text
            x={tipX + 14}
            y={16 + svgH / 2}
            textAnchor="start"
            className="fill-rose-900 text-[12px] font-bold"
            direction="ltr"
          >
            {height}
          </text>
        </svg>
      </div>

      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => {
            setActiveDim("base");
            fire();
          }}
          className={`min-h-11 rounded-full px-3 text-xs font-bold ${
            activeDim === "base"
              ? "bg-rose-700 text-white"
              : "bg-white text-slate-700 ring-1 ring-slate-200"
          }`}
        >
          تعديل القاعدة
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveDim("height");
            fire();
          }}
          className={`min-h-11 rounded-full px-3 text-xs font-bold ${
            activeDim === "height"
              ? "bg-rose-700 text-white"
              : "bg-white text-slate-700 ring-1 ring-slate-200"
          }`}
        >
          تعديل الارتفاع
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => bump(-1)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg font-black text-slate-700 ring-1 ring-slate-200"
          aria-label="إنقاص"
        >
          −
        </button>
        <div
          ref={trackRef}
          className="relative h-11 flex-1 touch-none overflow-hidden rounded-full bg-rose-100 ring-1 ring-rose-200"
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
          aria-valuemin={2}
          aria-valuemax={16}
          aria-valuenow={current}
          aria-label="مقياس البعد"
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-rose-500"
            style={{ width: `${((current - 2) / 14) * 100}%` }}
          />
        </div>
        <button
          type="button"
          onClick={() => bump(1)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg font-black text-slate-700 ring-1 ring-slate-200"
          aria-label="زيادة"
        >
          +
        </button>
      </div>

      <div className="mt-4 rounded-2xl bg-rose-600 px-3 py-4 text-center text-white shadow-sm">
        <p className="text-[11px] font-bold text-rose-100">مساحة المثلث</p>
        <p className="mt-1 text-xl font-black tabular-nums" dir="ltr">
          ½ × {base} × {height} = {Number.isInteger(area) ? area : area.toFixed(1)}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {PRESETS.map((preset) => {
          const active = base === preset.base && height === preset.height;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setBase(preset.base);
                setHeight(preset.height);
                fire();
              }}
              className={`min-h-11 rounded-full px-3 text-xs font-bold ${
                active
                  ? "bg-rose-800 text-white"
                  : "bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              <span dir="ltr">{preset.label}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => {
            setShowTrap((v) => !v);
            fire();
          }}
          className="min-h-11 rounded-full bg-white px-3 text-xs font-bold text-slate-700 ring-1 ring-slate-200"
        >
          {showTrap ? "أخفِ المصيدة" : "أظهر المصيدة"}
        </button>
      </div>

      {showTrap && (
        <p className="mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-center text-[12px] font-bold text-amber-900 ring-1 ring-amber-100">
          بدون النصف تحصل على{" "}
          <span className="tabular-nums" dir="ltr">
            {trapWithoutHalf}
          </span>{" "}
          — وهذا خطأ شائع. لا تنسَ النصف.
        </p>
      )}
    </div>
  );
}
