"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type PiMode = "22/7" | "3.14";

const PRESETS = [
  { label: "ر = ٧", r: 7 },
  { label: "ر = ١٤", r: 14 },
  { label: "قطر = ١٠", r: 5 },
  { label: "ر = ٢١", r: 21 },
];

function circ(r: number, mode: PiMode) {
  if (mode === "22/7") return (2 * 22 * r) / 7;
  return 2 * 3.14 * r;
}

function formatNum(n: number) {
  if (Number.isInteger(n)) return String(n);
  return (Math.round(n * 100) / 100).toString();
}

export function CircleCircLab({ onInteract, compact }: Props) {
  const [r, setR] = useState(7);
  const [mode, setMode] = useState<PiMode>("22/7");
  const [showTrap, setShowTrap] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const circumference = circ(r, mode);
  const wrongAsDiameter = circ(2 * r, mode);
  const size = compact ? 150 : 180;
  const maxR = 28;
  const visualR = 28 + (r / maxR) * (size / 2 - 36);

  const setFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setR(Math.max(1, Math.round(1 + ratio * (maxR - 1))));
    fire();
  };

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#F0FDFA] to-white ring-1 ring-teal-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-teal-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اسحب شريط نصف القطر، أو اختر مثالاً جاهزاً.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          لاحظ المحيط عند تغيير ر، وفرّق بين ر والقطر.
        </p>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {(["22/7", "3.14"] as PiMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              fire();
            }}
            className={`min-h-11 rounded-xl px-3 text-sm font-bold ring-1 ${
              mode === m
                ? "bg-teal-600 text-white ring-teal-600"
                : "bg-white text-teal-900 ring-teal-100"
            }`}
          >
            باي = {m}
          </button>
        ))}
      </div>

      <div className="mt-4 flex justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={visualR}
            fill="#CCFBF1"
            stroke="#0D9488"
            strokeWidth="3"
          />
          <line
            x1={size / 2}
            y1={size / 2}
            x2={size / 2 + visualR}
            y2={size / 2}
            stroke="#0F766E"
            strokeWidth="2.5"
          />
          <circle cx={size / 2} cy={size / 2} r="4" fill="#0F766E" />
          <text
            x={size / 2 + visualR / 2}
            y={size / 2 - 8}
            textAnchor="middle"
            style={{ fontSize: 12, fontWeight: 700, fill: "#115E59" }}
          >
            ر = {r}
          </text>
        </svg>
      </div>

      <div
        ref={trackRef}
        className="relative mt-2 h-14 touch-none select-none rounded-2xl bg-teal-50 ring-1 ring-teal-100"
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          setFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (dragging.current) setFromClientX(e.clientX);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        role="slider"
        aria-valuemin={1}
        aria-valuemax={maxR}
        aria-valuenow={r}
        aria-label="نصف القطر"
      >
        <div
          className="absolute top-1/2 h-3 -translate-y-1/2 rounded-full bg-teal-400"
          style={{
            left: "8px",
            width: `calc(${((r - 1) / (maxR - 1)) * 100}% - 8px)`,
          }}
        />
        <div
          className="absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-teal-600 text-xs font-black text-white shadow"
          style={{
            left: `calc(${((r - 1) / (maxR - 1)) * 100}% - 22px)`,
          }}
          dir="ltr"
        >
          {r}
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-teal-700 px-3 py-3 text-center text-white">
        <p className="text-[11px] font-bold text-teal-100">المحيط</p>
        <p className="mt-1 text-sm font-black tabular-nums" dir="ltr">
          2 × باي × {r} = {formatNum(circumference)}
        </p>
        <p className="mt-1 text-[11px] text-teal-100">
          القطر = {2 * r} · المحيط = باي × القطر أيضاً
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          setShowTrap((v) => !v);
          fire();
        }}
        className="mt-3 min-h-11 w-full rounded-xl bg-amber-50 text-sm font-bold text-amber-900 ring-1 ring-amber-100"
      >
        {showTrap ? "إخفاء المصيدة" : "أظهر المصيدة"}
      </button>
      {showTrap && (
        <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-center text-[12px] font-bold text-amber-900 ring-1 ring-amber-100">
          إن وُضع القطر مكان ر بالخطأ: 2 × باي × {2 * r} = {formatNum(wrongAsDiameter)} — ضعف الناتج تقريباً!
        </p>
      )}

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              setR(p.r);
              fire();
            }}
            className={`min-h-11 rounded-xl px-3 text-sm font-bold ring-1 ${
              p.r === r
                ? "bg-teal-600 text-white ring-teal-600"
                : "bg-white text-teal-900 ring-teal-100"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
