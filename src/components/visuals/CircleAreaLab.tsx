"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
  autoDemo?: boolean;
};

type PiMode = "22/7" | "3.14";

const PRESETS = [
  { label: "ر = ٧", r: 7 },
  { label: "ر = ٥", r: 5 },
  { label: "قطر = ١٤", r: 7 },
  { label: "ر = ١٠", r: 10 },
];

function area(r: number, mode: PiMode) {
  if (mode === "22/7") return (22 * r * r) / 7;
  return 3.14 * r * r;
}

function formatNum(n: number) {
  if (Number.isInteger(n)) return String(n);
  return (Math.round(n * 1000) / 1000).toString();
}

export function CircleAreaLab({ onInteract, compact, autoDemo }: Props) {
  const [r, setR] = useState(7);
  const [mode, setMode] = useState<PiMode>("22/7");
  const [showTrap, setShowTrap] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const userTouched = useRef(false);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  useEffect(() => {
    if (!autoDemo) return;
    const frames = [7, 10, 14, 5, 12, 7];
    let i = 0;
    const id = window.setInterval(() => {
      if (userTouched.current) return;
      i = (i + 1) % frames.length;
      setR(frames[i]!);
    }, 1300);
    return () => window.clearInterval(id);
  }, [autoDemo]);

  const value = area(r, mode);
  const wrong = area(2 * r, mode);
  const size = compact ? 150 : 180;
  const maxR = 28;
  const visualR = 28 + (r / maxR) * (size / 2 - 36);

  const setFromClientX = (clientX: number) => {
    userTouched.current = true;
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setR(Math.max(1, Math.round(1 + ratio * (maxR - 1))));
    fire();
  };

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#EFF6FF] to-white ring-1 ring-sky-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-sky-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اسحب لتغيير نصف القطر، ثم قارن المساحة.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          المساحة تكبر بسرعة عند زيادة ر لأن ر تُربَّع.
        </p>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {(["22/7", "3.14"] as PiMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              userTouched.current = true;
              setMode(m);
              fire();
            }}
            className={`min-h-11 rounded-xl px-3 text-sm font-bold ring-1 ${
              mode === m
                ? "bg-sky-600 text-white ring-sky-600"
                : "bg-white text-sky-900 ring-sky-100"
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
            fill="#BAE6FD"
            stroke="#0284C7"
            strokeWidth="3"
          />
          <line
            x1={size / 2}
            y1={size / 2}
            x2={size / 2 + visualR}
            y2={size / 2}
            stroke="#0369A1"
            strokeWidth="2.5"
          />
          <circle cx={size / 2} cy={size / 2} r="4" fill="#0369A1" />
          <text
            x={size / 2}
            y={size / 2 + 4}
            textAnchor="middle"
            style={{ fontSize: 13, fontWeight: 800, fill: "#0C4A6E" }}
          >
            ر² = {r * r}
          </text>
        </svg>
      </div>

      <div
        ref={trackRef}
        className="relative mt-2 h-14 touch-none select-none rounded-2xl bg-sky-50 ring-1 ring-sky-100"
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
          className="absolute top-1/2 h-3 -translate-y-1/2 rounded-full bg-sky-400"
          style={{
            left: "8px",
            width: `calc(${((r - 1) / (maxR - 1)) * 100}% - 8px)`,
          }}
        />
        <div
          className="absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-sky-600 text-xs font-black text-white shadow"
          style={{
            left: `calc(${((r - 1) / (maxR - 1)) * 100}% - 22px)`,
          }}
          dir="ltr"
        >
          {r}
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-sky-700 px-3 py-3 text-center text-white">
        <p className="text-[11px] font-bold text-sky-100">المساحة</p>
        <p className="mt-1 text-sm font-black tabular-nums" dir="ltr">
          باي × {r}² = {formatNum(value)}
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
          وضع القطر {2 * r} مكان ر يعطي باي × {2 * r}² = {formatNum(wrong)} — أربعة أضعاف المساحة!
        </p>
      )}

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              userTouched.current = true;
              setR(p.r);
              fire();
            }}
            className={`min-h-11 rounded-xl px-3 text-sm font-bold ring-1 ${
              p.r === r
                ? "bg-sky-600 text-white ring-sky-600"
                : "bg-white text-sky-900 ring-sky-100"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
