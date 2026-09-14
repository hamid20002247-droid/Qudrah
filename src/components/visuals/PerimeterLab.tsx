"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type Shape = "square" | "rect";

const PRESETS: { label: string; shape: Shape; length: number; width: number }[] = [
  { label: "مربع 5", shape: "square", length: 5, width: 5 },
  { label: "مستطيل 8×3", shape: "rect", length: 8, width: 3 },
  { label: "مستطيل 12×4", shape: "rect", length: 12, width: 4 },
];

export function PerimeterLab({ onInteract, compact }: Props) {
  const [shape, setShape] = useState<Shape>("rect");
  const [length, setLength] = useState(8);
  const [width, setWidth] = useState(3);
  const [showTrap, setShowTrap] = useState(false);
  const activeDim = useRef<"length" | "width">("length");
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const sideL = shape === "square" ? length : length;
  const sideW = shape === "square" ? length : width;
  const perimeter = shape === "square" ? 4 * length : 2 * (length + width);
  const fakeArea = sideL * sideW;

  const applyDim = (value: number) => {
    const clamped = Math.max(2, Math.min(16, value));
    if (shape === "square" || activeDim.current === "length") {
      setLength(clamped);
      if (shape === "square") setWidth(clamped);
    } else {
      setWidth(clamped);
    }
    fire();
  };

  const setFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    applyDim(Math.round(2 + ratio * 14));
  };

  const bump = (delta: number) => {
    const current =
      shape === "square" || activeDim.current === "length" ? length : width;
    applyDim(current + delta);
  };

  const scale = compact ? 8 : 10;
  const svgW = Math.max(40, sideL * scale);
  const svgH = Math.max(28, sideW * scale);

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#ECFDF5] to-white ring-1 ring-emerald-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-emerald-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اختر الشكل، ثم اسحب الشريط أو اضغط +/− لتغيير الضلع.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          راقب المحيط وهو مجموع أطوال الأضلاع حول الشكل.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => {
            setShape("square");
            setWidth(length);
            fire();
          }}
          className={`min-h-11 rounded-full px-3 text-xs font-bold ${
            shape === "square"
              ? "bg-emerald-700 text-white"
              : "bg-white text-slate-700 ring-1 ring-slate-200"
          }`}
        >
          مربع
        </button>
        <button
          type="button"
          onClick={() => {
            setShape("rect");
            if (width === length) setWidth(Math.max(2, length - 3));
            fire();
          }}
          className={`min-h-11 rounded-full px-3 text-xs font-bold ${
            shape === "rect"
              ? "bg-emerald-700 text-white"
              : "bg-white text-slate-700 ring-1 ring-slate-200"
          }`}
        >
          مستطيل
        </button>
      </div>

      <div className="mt-5 flex min-h-36 items-center justify-center">
        <svg
          width={svgW + 48}
          height={svgH + 40}
          viewBox={`0 0 ${svgW + 48} ${svgH + 40}`}
          className="max-w-full"
          aria-label="شكل المحيط"
        >
          <rect
            x={24}
            y={16}
            width={svgW}
            height={svgH}
            rx={6}
            fill="#D1FAE5"
            stroke="#059669"
            strokeWidth={3}
          />
          <text
            x={24 + svgW / 2}
            y={12}
            textAnchor="middle"
            className="fill-emerald-900 text-[12px] font-bold"
            direction="ltr"
          >
            {sideL}
          </text>
          <text
            x={14}
            y={16 + svgH / 2}
            textAnchor="middle"
            className="fill-emerald-900 text-[12px] font-bold"
            direction="ltr"
            transform={`rotate(-90 14 ${16 + svgH / 2})`}
          >
            {sideW}
          </text>
        </svg>
      </div>

      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => {
            activeDim.current = "length";
            fire();
          }}
          className="min-h-11 rounded-full bg-white px-3 text-xs font-bold text-slate-700 ring-1 ring-slate-200"
        >
          تعديل الطول
        </button>
        {shape === "rect" && (
          <button
            type="button"
            onClick={() => {
              activeDim.current = "width";
              fire();
            }}
            className="min-h-11 rounded-full bg-white px-3 text-xs font-bold text-slate-700 ring-1 ring-slate-200"
          >
            تعديل العرض
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => bump(-1)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg font-black text-slate-700 ring-1 ring-slate-200"
          aria-label="إنقاص الضلع"
        >
          −
        </button>
        <div
          ref={trackRef}
          className="relative h-11 flex-1 touch-none overflow-hidden rounded-full bg-emerald-100 ring-1 ring-emerald-200"
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
          aria-valuenow={
            shape === "square" || activeDim.current === "length" ? length : width
          }
          aria-label="مقياس الضلع"
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-emerald-500"
            style={{
              width: `${(((shape === "square" || activeDim.current === "length" ? length : width) - 2) / 14) * 100}%`,
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => bump(1)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg font-black text-slate-700 ring-1 ring-slate-200"
          aria-label="زيادة الضلع"
        >
          +
        </button>
      </div>

      <div className="mt-4 rounded-2xl bg-emerald-600 px-3 py-4 text-center text-white shadow-sm">
        <p className="text-[11px] font-bold text-emerald-100">المحيط</p>
        <p className="mt-1 text-xl font-black tabular-nums" dir="ltr">
          {shape === "square"
            ? `4 × ${length} = ${perimeter}`
            : `2 × (${length} + ${width}) = ${perimeter}`}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {PRESETS.map((preset) => {
          const active =
            shape === preset.shape &&
            length === preset.length &&
            width === preset.width;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setShape(preset.shape);
                setLength(preset.length);
                setWidth(preset.width);
                fire();
              }}
              className={`min-h-11 rounded-full px-3 text-xs font-bold ${
                active
                  ? "bg-emerald-800 text-white"
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
          المساحة هنا{" "}
          <span className="tabular-nums" dir="ltr">
            {fakeArea}
          </span>{" "}
          — ليست المحيط. لا تخلط بينهما.
        </p>
      )}
    </div>
  );
}
