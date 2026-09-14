"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type Mode = "lt" | "gt" | "lte" | "gte";

const LINE_MIN = -5;
const LINE_MAX = 8;
const BOUNDARY_DEFAULT = 3;

const PRESETS: { label: string; mode: Mode; boundary: number }[] = [
  { label: "س < 5", mode: "lt", boundary: 5 },
  { label: "س ≥ −2", mode: "gte", boundary: -2 },
  { label: "س ≤ 3", mode: "lte", boundary: 3 },
  { label: "س > 1", mode: "gt", boundary: 1 },
];

const MODE_LABELS: { id: Mode; label: string }[] = [
  { id: "lt", label: "أصغر من" },
  { id: "gt", label: "أكبر من" },
  { id: "lte", label: "≤" },
  { id: "gte", label: "≥" },
];

function satisfies(value: number, mode: Mode, boundary: number): boolean {
  if (mode === "lt") return value < boundary;
  if (mode === "gt") return value > boundary;
  if (mode === "lte") return value <= boundary;
  return value >= boundary;
}

function modeSymbol(mode: Mode): string {
  if (mode === "lt") return "<";
  if (mode === "gt") return ">";
  if (mode === "lte") return "≤";
  return "≥";
}

function isInclusive(mode: Mode): boolean {
  return mode === "lte" || mode === "gte";
}

/** Demo س that satisfies the preset (exclusive modes avoid the boundary). */
function demoS(mode: Mode, boundary: number): number {
  if (mode === "lt") return Math.max(LINE_MIN, boundary - 1);
  if (mode === "gt") return Math.min(LINE_MAX, boundary + 1);
  return Math.max(LINE_MIN, Math.min(LINE_MAX, boundary));
}

export function InequalitiesLab({ onInteract, compact }: Props) {
  const [mode, setMode] = useState<Mode>("lt");
  const [boundary, setBoundary] = useState(BOUNDARY_DEFAULT);
  const [s, setS] = useState(1);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const integers = Array.from(
    { length: LINE_MAX - LINE_MIN + 1 },
    (_, i) => LINE_MIN + i,
  );

  const padL = 28;
  const padR = 28;
  const width = 360;
  const height = compact ? 88 : 100;
  const y = height / 2;
  const span = LINE_MAX - LINE_MIN;

  const toX = (v: number) => padL + ((v - LINE_MIN) / span) * (width - padL - padR);

  const setFromClientX = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    const raw = LINE_MIN + ratio * span;
    const next = Math.round(Math.max(LINE_MIN, Math.min(LINE_MAX, raw)));
    setS(next);
    fire();
  };

  const shadeLeft = mode === "lt" || mode === "lte";
  const bx = toX(boundary);
  const sx = toX(s);
  const ok = satisfies(s, mode, boundary);

  const shadeX1 = shadeLeft ? padL : bx;
  const shadeX2 = shadeLeft ? bx : width - padR;

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#FFFBEB] to-white ring-1 ring-amber-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-amber-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اسحب دائرة س على خط الأعداد، أو اختر نمطاً جاهزاً.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          راقب التظليل والرقاقات التي تحقّق الشرط.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {MODE_LABELS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setMode(item.id);
              fire();
            }}
            className={`min-h-11 rounded-full px-3 text-xs font-bold ${
              mode === item.id
                ? "bg-amber-800 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 text-center">
        <p className="text-[12px] font-bold text-amber-800">المتباينة</p>
        <p
          className="mt-1 text-2xl font-black tabular-nums text-ink sm:text-3xl"
          dir="ltr"
        >
          س {modeSymbol(mode)} {boundary}
        </p>
        <p className="mt-1 text-sm font-bold text-slate-600">
          {ok ? "س الحالية تحقّق الشرط" : "س الحالية لا تحقّق الشرط"}
        </p>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="mt-4 w-full touch-none select-none"
        role="slider"
        aria-valuemin={LINE_MIN}
        aria-valuemax={LINE_MAX}
        aria-valuenow={s}
        aria-label="موضع س على خط الأعداد"
        onPointerDown={(e) => {
          e.preventDefault();
          dragging.current = true;
          (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
          setFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          setFromClientX(e.clientX);
        }}
        onPointerUp={(e) => {
          dragging.current = false;
          try {
            (e.currentTarget as SVGSVGElement).releasePointerCapture(e.pointerId);
          } catch {
            /* ignore */
          }
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
      >
        <rect
          x={Math.min(shadeX1, shadeX2)}
          y={y - 18}
          width={Math.abs(shadeX2 - shadeX1)}
          height={36}
          rx={8}
          fill="#F59E0B"
          opacity={0.22}
        />
        <line
          x1={padL}
          y1={y}
          x2={width - padR}
          y2={y}
          stroke="#1E293B"
          strokeWidth={3}
          strokeLinecap="round"
        />
        {integers.map((n) => (
          <g key={n}>
            <line
              x1={toX(n)}
              y1={y - 7}
              x2={toX(n)}
              y2={y + 7}
              stroke="#64748B"
              strokeWidth={2}
            />
            <text
              x={toX(n)}
              y={y + 26}
              textAnchor="middle"
              className="fill-slate-500"
              style={{ fontSize: 11, fontWeight: 700 }}
            >
              {n}
            </text>
          </g>
        ))}
        <circle
          cx={bx}
          cy={y}
          r={10}
          fill={isInclusive(mode) ? "#1E293B" : "white"}
          stroke="#1E293B"
          strokeWidth={3}
        />
        <circle
          cx={sx}
          cy={y}
          r={14}
          fill={ok ? "#F59E0B" : "#94A3B8"}
          stroke="#1E293B"
          strokeWidth={3}
          className="transition-[cx] duration-75"
        />
        <text
          x={sx}
          y={y - 22}
          textAnchor="middle"
          className="fill-ink"
          style={{ fontSize: 13, fontWeight: 900 }}
        >
          س
        </text>
      </svg>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {integers.map((n) => {
          const lit = satisfies(n, mode, boundary);
          return (
            <button
              key={n}
              type="button"
              onClick={() => {
                setS(n);
                fire();
              }}
              className={`flex h-11 min-w-11 items-center justify-center rounded-xl text-sm font-black tabular-nums transition-colors ${
                lit
                  ? "bg-amber-500 text-white ring-2 ring-amber-700"
                  : "bg-slate-100 text-slate-400 ring-1 ring-slate-200"
              } ${s === n ? "scale-105" : ""}`}
              dir="ltr"
              aria-label={`العدد ${n}${lit ? " يحقق" : " لا يحقق"}`}
            >
              {n}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => {
            setBoundary((b) => Math.max(LINE_MIN + 1, b - 1));
            fire();
          }}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg font-black ring-1 ring-slate-200"
          aria-label="إنقاص الحد"
        >
          −
        </button>
        <p className="text-sm font-bold text-slate-600">
          حدّ الفاصل:{" "}
          <span className="tabular-nums text-ink" dir="ltr">
            {boundary}
          </span>
        </p>
        <button
          type="button"
          onClick={() => {
            setBoundary((b) => Math.min(LINE_MAX - 1, b + 1));
            fire();
          }}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg font-black ring-1 ring-slate-200"
          aria-label="زيادة الحد"
        >
          +
        </button>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {PRESETS.map((preset) => {
          const active =
            preset.mode === mode && preset.boundary === boundary;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setMode(preset.mode);
                setBoundary(preset.boundary);
                setS(demoS(preset.mode, preset.boundary));
                fire();
              }}
              className={`min-h-11 rounded-full px-3 text-xs font-bold tabular-nums ${
                active
                  ? "bg-ink text-white"
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
