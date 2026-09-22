"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
  autoDemo?: boolean;
};

const PRESETS: {
  label: string;
  side: number;
  length: number;
  width: number;
}[] = [
  { label: "مربع 6 · مستطيل 9×4", side: 6, length: 9, width: 4 },
  { label: "مربع 5 · مستطيل 8×3", side: 5, length: 8, width: 3 },
  { label: "نفس المحيط 24", side: 6, length: 8, width: 4 },
  { label: "مربع 8 · مستطيل 10×6", side: 8, length: 10, width: 6 },
];

function verdict(a: number, b: number) {
  if (a > b) return "أ أكبر";
  if (b > a) return "ب أكبر";
  return "متساويتان";
}

export function CmpAreaLab({ onInteract, compact, autoDemo }: Props) {
  const [side, setSide] = useState(6);
  const [length, setLength] = useState(9);
  const [width, setWidth] = useState(4);
  const active = useRef<"side" | "length" | "width" | null>(null);
  const userTouched = useRef(false);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  useEffect(() => {
    if (!autoDemo) return;
    let i = 0;
    const id = window.setInterval(() => {
      if (userTouched.current) return;
      i = (i + 1) % PRESETS.length;
      const p = PRESETS[i]!;
      setSide(p.side);
      setLength(p.length);
      setWidth(p.width);
    }, 1500);
    return () => window.clearInterval(id);
  }, [autoDemo]);

  const areaA = side * side;
  const areaB = length * width;
  const periA = 4 * side;
  const periB = 2 * (length + width);
  const result = verdict(areaA, areaB);
  const samePeri = periA === periB;

  const setFromClientX = (
    which: "side" | "length" | "width",
    clientX: number,
    el: HTMLDivElement,
  ) => {
    userTouched.current = true;
    const rect = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const next = Math.max(2, Math.min(14, Math.round(2 + ratio * 12)));
    if (which === "side") setSide(next);
    else if (which === "length") setLength(next);
    else setWidth(next);
    fire();
  };

  const finish = (e: React.PointerEvent<HTMLDivElement>) => {
    active.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const scale = compact ? 7 : 9;
  const sq = Math.max(28, side * scale);
  const rw = Math.max(28, length * scale);
  const rh = Math.max(20, width * scale);
  const aWins = areaA > areaB;
  const bWins = areaB > areaA;

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#ECFEFF] to-white ring-1 ring-cyan-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-cyan-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اسحب شريط الضلع أو الطول أو العرض، أو اضغط مثالاً جاهزاً.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          راقب مساحتي الشكلين — حتى لو تساوى المحيطان.
        </p>
      </div>

      <div className="mt-5 text-center">
        <p className="text-[12px] font-bold text-cyan-700">حكم المساحتين</p>
        <p className="mt-1 inline-flex min-h-11 items-center rounded-2xl bg-cyan-700 px-4 text-xl font-black text-white">
          {result}
        </p>
        {samePeri && (
          <p className="mt-2 text-[12px] font-bold text-amber-700">
            المحيطان متساويان — لكن المساحتين قد تختلفان
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-center gap-6">
        <div className="text-center">
          <p className="mb-2 text-[12px] font-bold text-slate-500">كمية أ · مربع</p>
          <svg
            width={sq + 8}
            height={sq + 8}
            viewBox={`0 0 ${sq + 8} ${sq + 8}`}
            aria-hidden
          >
            <rect
              x={4}
              y={4}
              width={sq}
              height={sq}
              rx={8}
              className={
                aWins
                  ? "fill-cyan-500 stroke-cyan-800"
                  : "fill-cyan-200 stroke-cyan-500"
              }
              strokeWidth={aWins ? 3 : 2}
            />
          </svg>
          <p className="mt-1 text-sm font-black tabular-nums text-cyan-800" dir="ltr">
            {areaA}
          </p>
        </div>
        <div className="text-center">
          <p className="mb-2 text-[12px] font-bold text-slate-500">
            كمية ب · مستطيل
          </p>
          <svg
            width={rw + 8}
            height={rh + 8}
            viewBox={`0 0 ${rw + 8} ${rh + 8}`}
            aria-hidden
          >
            <rect
              x={4}
              y={4}
              width={rw}
              height={rh}
              rx={8}
              className={
                bWins
                  ? "fill-sky-500 stroke-sky-800"
                  : "fill-sky-200 stroke-sky-500"
              }
              strokeWidth={bWins ? 3 : 2}
            />
          </svg>
          <p className="mt-1 text-sm font-black tabular-nums text-sky-800" dir="ltr">
            {areaB}
          </p>
        </div>
      </div>

      <DimSlider
        label="ضلع المربع"
        value={side}
        onDown={(e) => {
          e.preventDefault();
          active.current = "side";
          e.currentTarget.setPointerCapture(e.pointerId);
          setFromClientX("side", e.clientX, e.currentTarget);
        }}
        onMove={(e) => {
          if (active.current === "side")
            setFromClientX("side", e.clientX, e.currentTarget);
        }}
        onUp={finish}
      />
      <DimSlider
        label="طول المستطيل"
        value={length}
        onDown={(e) => {
          e.preventDefault();
          active.current = "length";
          e.currentTarget.setPointerCapture(e.pointerId);
          setFromClientX("length", e.clientX, e.currentTarget);
        }}
        onMove={(e) => {
          if (active.current === "length")
            setFromClientX("length", e.clientX, e.currentTarget);
        }}
        onUp={finish}
      />
      <DimSlider
        label="عرض المستطيل"
        value={width}
        onDown={(e) => {
          e.preventDefault();
          active.current = "width";
          e.currentTarget.setPointerCapture(e.pointerId);
          setFromClientX("width", e.clientX, e.currentTarget);
        }}
        onMove={(e) => {
          if (active.current === "width")
            setFromClientX("width", e.clientX, e.currentTarget);
        }}
        onUp={finish}
      />

      <div className="mt-4 rounded-2xl bg-white p-3 text-center ring-1 ring-slate-100">
        <p className="text-sm font-black tabular-nums text-slate-700" dir="ltr">
          محيط أ = {periA} · محيط ب = {periB}
        </p>
        <p className="mt-1 text-[13px] font-bold text-cyan-950">
          السؤال عن المساحة: ضلع×ضلع مقابل طول×عرض.
        </p>
      </div>

      <div className="mt-4">
        <p className="text-center text-[11px] font-bold text-slate-500">
          أمثلة جاهزة
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                userTouched.current = true;
                setSide(p.side);
                setLength(p.length);
                setWidth(p.width);
                fire();
              }}
              className="min-h-11 rounded-full bg-white px-3 text-xs font-bold text-cyan-800 ring-1 ring-cyan-200"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DimSlider({
  label,
  value,
  onDown,
  onMove,
  onUp,
}: {
  label: string;
  value: number;
  onDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onUp: (e: React.PointerEvent<HTMLDivElement>) => void;
}) {
  return (
    <div className="mt-3">
      <div className="mb-1 flex items-center justify-between px-1">
        <p className="text-[11px] font-bold text-slate-500">{label}</p>
        <p className="text-sm font-black tabular-nums text-ink" dir="ltr">
          {value}
        </p>
      </div>
      <div
        dir="ltr"
        className="relative h-11 touch-none rounded-xl bg-cyan-50 ring-1 ring-cyan-100"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div
          className="absolute inset-y-1 left-1 rounded-lg bg-cyan-600"
          style={{ width: `calc(${((value - 2) / 12) * 100}% - 4px)` }}
        />
      </div>
    </div>
  );
}
