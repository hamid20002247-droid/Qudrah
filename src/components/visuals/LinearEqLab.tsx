"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type Preset = {
  label: string;
  a: number;
  b: number;
  c: number;
};

/** أس + ب = ج — بدون أقواس */
const PRESETS: Preset[] = [
  { label: "2س + 3 = 11", a: 2, b: 3, c: 11 },
  { label: "3س − 5 = 10", a: 3, b: -5, c: 10 },
  { label: "س + 7 = 12", a: 1, b: 7, c: 12 },
  { label: "5س − 2 = 18", a: 5, b: -2, c: 18 },
];

function formatTerm(coef: number, withPlus = false): string {
  if (coef === 0) return "";
  const sign =
    coef > 0 ? (withPlus ? " + " : "") : " − ";
  const abs = Math.abs(coef);
  if (abs === 1) return `${sign}س`;
  return `${sign}${abs}س`;
}

function formatConst(n: number, withPlus = false): string {
  if (n === 0) return "";
  if (n > 0) return withPlus ? ` + ${n}` : `${n}`;
  return ` − ${Math.abs(n)}`;
}

function equationText(a: number, b: number, c: number): string {
  const left =
    a === 0
      ? formatConst(b) || "0"
      : `${a === 1 ? "س" : a === -1 ? "−س" : `${a}س`}${formatConst(b, true)}`;
  return `${left} = ${c}`;
}

export function LinearEqLab({ onInteract, compact }: Props) {
  const [presetIndex, setPresetIndex] = useState(0);
  const preset = PRESETS[presetIndex]!;
  const solution = (preset.c - preset.b) / preset.a;
  const [s, setS] = useState(solution);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const leftVal = preset.a * s + preset.b;
  const balanced = leftVal === preset.c;
  const tip = Math.max(-18, Math.min(18, (leftVal - preset.c) * 1.2));

  const applyPreset = (index: number) => {
    const next = PRESETS[index]!;
    setPresetIndex(index);
    setS((next.c - next.b) / next.a);
    fire();
  };

  const setFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const next = Math.round(-2 + ratio * 14);
    setS(next);
    fire();
  };

  const bump = (delta: number) => {
    setS((current) => Math.max(-2, Math.min(12, current + delta)));
    fire();
  };

  const w = 320;
  const h = compact ? 150 : 170;
  const cx = w / 2;
  const fulcrumY = h - 28;
  const beamY = fulcrumY - 36;
  const panDrop = 48;

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#EEF2FF] to-white ring-1 ring-indigo-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-indigo-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اسحب شريط س أو اضغط +/− حتى تتوازن الكفتان.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          راقب الطرف الأيسر وهو يقترب من الطرف الأيمن.
        </p>
      </div>

      <svg
        viewBox={`0 0 ${w} ${h}`}
        className={`mx-auto mt-4 w-full ${compact ? "max-h-40" : "max-h-48"}`}
        role="img"
        aria-label="ميزان معادلة خطية"
      >
        <line
          x1={cx}
          y1={fulcrumY}
          x2={cx}
          y2={beamY}
          stroke="#64748B"
          strokeWidth="3"
        />
        <polygon
          points={`${cx - 14},${fulcrumY} ${cx + 14},${fulcrumY} ${cx},${fulcrumY - 16}`}
          fill="#475569"
        />
        <g transform={`rotate(${tip} ${cx} ${beamY})`}>
          <line
            x1={40}
            y1={beamY}
            x2={w - 40}
            y2={beamY}
            stroke="#334155"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* left pan */}
          <line
            x1={70}
            y1={beamY}
            x2={70}
            y2={beamY + panDrop}
            stroke="#6366F1"
            strokeWidth="2"
          />
          <ellipse
            cx={70}
            cy={beamY + panDrop + 8}
            rx={42}
            ry={12}
            fill="#C7D2FE"
            stroke="#4F46E5"
            strokeWidth="2"
          />
          <text
            x={70}
            y={beamY + panDrop + 12}
            textAnchor="middle"
            className="fill-indigo-900 font-black"
            style={{ fontSize: 13 }}
            direction="ltr"
          >
            {leftVal}
          </text>
          <text
            x={70}
            y={beamY + 18}
            textAnchor="middle"
            className="fill-indigo-700 font-bold"
            style={{ fontSize: 11 }}
          >
            {formatTerm(preset.a).replace(/^ − /, "−") || "س"}
            {formatConst(preset.b, true)}
          </text>
          {/* right pan */}
          <line
            x1={w - 70}
            y1={beamY}
            x2={w - 70}
            y2={beamY + panDrop}
            stroke="#6366F1"
            strokeWidth="2"
          />
          <ellipse
            cx={w - 70}
            cy={beamY + panDrop + 8}
            rx={42}
            ry={12}
            fill="#E2E8F0"
            stroke="#475569"
            strokeWidth="2"
          />
          <text
            x={w - 70}
            y={beamY + panDrop + 12}
            textAnchor="middle"
            className="fill-slate-800 font-black"
            style={{ fontSize: 13 }}
            direction="ltr"
          >
            {preset.c}
          </text>
        </g>
      </svg>

      <div
        className={`mt-2 rounded-2xl px-3 py-3 text-center ${
          balanced
            ? "bg-indigo-700 text-white"
            : "bg-white text-indigo-950 ring-1 ring-indigo-100"
        }`}
      >
        <p className="text-[11px] font-bold opacity-80">المعادلة</p>
        <p className="mt-1 text-lg font-black tabular-nums" dir="ltr">
          {equationText(preset.a, preset.b, preset.c)}
        </p>
        <p className="mt-1 text-sm font-bold tabular-nums" dir="ltr">
          س = {s}
          {balanced ? "  ·  صح ✓" : ""}
        </p>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => bump(-1)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-lg font-black text-indigo-900"
          aria-label="إنقاص س"
        >
          −
        </button>
        <div
          ref={trackRef}
          className="relative h-11 flex-1 touch-none rounded-full bg-indigo-50 ring-1 ring-indigo-100"
          onPointerDown={(e) => {
            dragging.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            setFromClientX(e.clientX);
          }}
          onPointerMove={(e) => {
            if (!dragging.current) return;
            setFromClientX(e.clientX);
          }}
          onPointerUp={() => {
            dragging.current = false;
          }}
          onPointerCancel={() => {
            dragging.current = false;
          }}
          role="slider"
          aria-valuemin={-2}
          aria-valuemax={12}
          aria-valuenow={s}
          aria-label="قيمة س"
        >
          <div
            className="absolute top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-indigo-600 shadow-md ring-2 ring-white"
            style={{
              left: `calc(${((s + 2) / 14) * 100}% - 18px)`,
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => bump(1)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-lg font-black text-indigo-900"
          aria-label="زيادة س"
        >
          +
        </button>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {PRESETS.map((p, index) => {
          const active = index === presetIndex;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(index)}
              className={`min-h-11 rounded-xl px-3 text-xs font-bold tabular-nums ring-1 transition ${
                active
                  ? "bg-indigo-600 text-white ring-indigo-600"
                  : "bg-white text-indigo-900 ring-indigo-100"
              }`}
              dir="ltr"
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
