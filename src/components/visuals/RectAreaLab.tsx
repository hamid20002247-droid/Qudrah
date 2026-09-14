"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type Shape = "square" | "rect";
type Mode = "sides" | "from-peri";

const PRESETS: {
  label: string;
  shape: Shape;
  mode: Mode;
  length: number;
  width: number;
  peri?: number;
}[] = [
  { label: "مربع 6", shape: "square", mode: "sides", length: 6, width: 6 },
  { label: "مستطيل 9×4", shape: "rect", mode: "sides", length: 9, width: 4 },
  {
    label: "من المحيط",
    shape: "rect",
    mode: "from-peri",
    length: 10,
    width: 4,
    peri: 28,
  },
];

export function RectAreaLab({ onInteract, compact }: Props) {
  const [shape, setShape] = useState<Shape>("rect");
  const [mode, setMode] = useState<Mode>("sides");
  const [length, setLength] = useState(9);
  const [width, setWidth] = useState(4);
  const [peri, setPeri] = useState(28);
  const activeDim = useRef<"length" | "width" | "peri">("length");
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const derivedWidth =
    mode === "from-peri" && shape === "rect"
      ? peri / 2 - length
      : shape === "square"
        ? length
        : width;
  const area =
    shape === "square" ? length * length : length * Math.max(0, derivedWidth);
  const validFromPeri = mode !== "from-peri" || derivedWidth > 0;

  const applyValue = (value: number) => {
    if (activeDim.current === "peri") {
      setPeri(Math.max(12, Math.min(48, value)));
    } else if (shape === "square" || activeDim.current === "length") {
      const next = Math.max(2, Math.min(16, value));
      setLength(next);
      if (shape === "square") setWidth(next);
    } else {
      setWidth(Math.max(2, Math.min(16, value)));
    }
    fire();
  };

  const setFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    if (activeDim.current === "peri") {
      applyValue(Math.round(12 + ratio * 36));
    } else {
      applyValue(Math.round(2 + ratio * 14));
    }
  };

  const currentValue =
    activeDim.current === "peri"
      ? peri
      : shape === "square" || activeDim.current === "length"
        ? length
        : width;

  const bump = (delta: number) => applyValue(currentValue + delta);

  const scale = compact ? 8 : 10;
  const drawW = Math.max(40, length * scale);
  const drawH = Math.max(28, Math.max(1, derivedWidth) * scale);

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#EFF6FF] to-white ring-1 ring-sky-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-sky-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اسحب الشريط أو اضغط +/− لتغيير الأبعاد، أو ابدأ من المحيط.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          راقب المساحة = الطول ضرب العرض (أو الضلع ضرب نفسه للمربع).
        </p>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => {
            setShape("square");
            setMode("sides");
            setWidth(length);
            fire();
          }}
          className={`min-h-11 rounded-full px-3 text-xs font-bold ${
            shape === "square" && mode === "sides"
              ? "bg-sky-700 text-white"
              : "bg-white text-slate-700 ring-1 ring-slate-200"
          }`}
        >
          مربع
        </button>
        <button
          type="button"
          onClick={() => {
            setShape("rect");
            setMode("sides");
            fire();
          }}
          className={`min-h-11 rounded-full px-3 text-xs font-bold ${
            shape === "rect" && mode === "sides"
              ? "bg-sky-700 text-white"
              : "bg-white text-slate-700 ring-1 ring-slate-200"
          }`}
        >
          مستطيل
        </button>
        <button
          type="button"
          onClick={() => {
            setShape("rect");
            setMode("from-peri");
            activeDim.current = "peri";
            fire();
          }}
          className={`min-h-11 rounded-full px-3 text-xs font-bold ${
            mode === "from-peri"
              ? "bg-sky-700 text-white"
              : "bg-white text-slate-700 ring-1 ring-slate-200"
          }`}
        >
          من المحيط
        </button>
      </div>

      <div className="mt-5 flex min-h-36 items-center justify-center">
        <svg
          width={drawW + 48}
          height={drawH + 40}
          viewBox={`0 0 ${drawW + 48} ${drawH + 40}`}
          className="max-w-full"
          aria-label="شكل المساحة"
        >
          <rect
            x={24}
            y={16}
            width={drawW}
            height={drawH}
            rx={6}
            fill={validFromPeri ? "#BAE6FD" : "#FEE2E2"}
            stroke={validFromPeri ? "#0284C7" : "#DC2626"}
            strokeWidth={3}
          />
          <text
            x={24 + drawW / 2}
            y={12}
            textAnchor="middle"
            className="fill-sky-900 text-[12px] font-bold"
            direction="ltr"
          >
            {length}
          </text>
          <text
            x={14}
            y={16 + drawH / 2}
            textAnchor="middle"
            className="fill-sky-900 text-[12px] font-bold"
            direction="ltr"
            transform={`rotate(-90 14 ${16 + drawH / 2})`}
          >
            {validFromPeri ? derivedWidth : "؟"}
          </text>
        </svg>
      </div>

      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {mode === "from-peri" ? (
          <>
            <button
              type="button"
              onClick={() => {
                activeDim.current = "peri";
                fire();
              }}
              className="min-h-11 rounded-full bg-white px-3 text-xs font-bold text-slate-700 ring-1 ring-slate-200"
            >
              تعديل المحيط
            </button>
            <button
              type="button"
              onClick={() => {
                activeDim.current = "length";
                fire();
              }}
              className="min-h-11 rounded-full bg-white px-3 text-xs font-bold text-slate-700 ring-1 ring-slate-200"
            >
              تعديل طول معلوم
            </button>
          </>
        ) : (
          <>
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
          </>
        )}
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
          className="relative h-11 flex-1 touch-none overflow-hidden rounded-full bg-sky-100 ring-1 ring-sky-200"
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
          aria-valuenow={currentValue}
          aria-label="مقياس البعد"
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-sky-500"
            style={{
              width: `${
                activeDim.current === "peri"
                  ? ((peri - 12) / 36) * 100
                  : ((currentValue - 2) / 14) * 100
              }%`,
            }}
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

      <div className="mt-4 rounded-2xl bg-sky-600 px-3 py-4 text-center text-white shadow-sm">
        <p className="text-[11px] font-bold text-sky-100">المساحة</p>
        <p className="mt-1 text-xl font-black tabular-nums" dir="ltr">
          {!validFromPeri
            ? "أبعاد غير صالحة"
            : shape === "square"
              ? `${length} × ${length} = ${area}`
              : mode === "from-peri"
                ? `${length} × ${derivedWidth} = ${area}`
                : `${length} × ${width} = ${area}`}
        </p>
        {mode === "from-peri" && validFromPeri && (
          <p className="mt-1 text-[12px] text-sky-100">
            العرض = نصف المحيط ناقص الطول ={" "}
            <span className="tabular-nums" dir="ltr">
              {peri / 2} − {length} = {derivedWidth}
            </span>
          </p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {PRESETS.map((preset) => {
          const active =
            shape === preset.shape &&
            mode === preset.mode &&
            length === preset.length &&
            (preset.mode === "from-peri"
              ? peri === preset.peri
              : width === preset.width);
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setShape(preset.shape);
                setMode(preset.mode);
                setLength(preset.length);
                setWidth(preset.width);
                if (preset.peri) setPeri(preset.peri);
                activeDim.current =
                  preset.mode === "from-peri" ? "peri" : "length";
                fire();
              }}
              className={`min-h-11 rounded-full px-3 text-xs font-bold ${
                active
                  ? "bg-sky-800 text-white"
                  : "bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              <span dir="ltr">{preset.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
