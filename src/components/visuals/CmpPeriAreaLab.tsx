"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

const PRESETS: { label: string; length: number; width: number }[] = [
  { label: "مربع 4", length: 4, width: 4 },
  { label: "مربع 5", length: 5, width: 5 },
  { label: "مستطيل 6×4", length: 6, width: 4 },
  { label: "مستطيل 8×2", length: 8, width: 2 },
  { label: "مستطيل 10×3", length: 10, width: 3 },
];

function verdict(a: number, b: number) {
  if (a > b) return "أ أكبر";
  if (b > a) return "ب أكبر";
  return "متساويتان";
}

export function CmpPeriAreaLab({ onInteract, compact }: Props) {
  const [length, setLength] = useState(6);
  const [width, setWidth] = useState(4);
  const active = useRef<"length" | "width" | null>(null);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const peri = 2 * (length + width);
  const area = length * width;
  const result = verdict(peri, area);

  const setFromClientX = (
    which: "length" | "width",
    clientX: number,
    el: HTMLDivElement,
  ) => {
    const rect = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const next = Math.max(1, Math.min(12, Math.round(1 + ratio * 11)));
    if (which === "length") setLength(next);
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

  const scale = compact ? 10 : 12;
  const rw = Math.max(36, length * scale);
  const rh = Math.max(24, width * scale);
  const maxMeter = Math.max(peri, area, 1);

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#FFFBEB] to-white ring-1 ring-amber-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-amber-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اسحب شريط الطول أو العرض، أو اضغط شكلاً جاهزاً.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          قارن رقم المحيط برقم المساحة لنفس الشكل فقط.
        </p>
      </div>

      <div className="mt-5 text-center">
        <p className="text-[12px] font-bold text-amber-700">حكم المقارنة الرقمية</p>
        <p className="mt-1 inline-flex min-h-11 items-center rounded-2xl bg-amber-700 px-4 text-xl font-black text-white">
          {result}
        </p>
        <p className="mt-2 text-[12px] font-bold text-slate-500">
          مقارنة رقمية فقط — الوحدات مختلفة في المعنى
        </p>
      </div>

      <div className="mt-5 flex justify-center">
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
            rx={10}
            className="fill-amber-200 stroke-amber-700"
            strokeWidth={2}
          />
        </svg>
      </div>
      <p className="mt-2 text-center text-sm font-black tabular-nums text-ink" dir="ltr">
        {length} × {width}
      </p>

      <Meter
        label="كمية أ · المحيط"
        value={peri}
        max={maxMeter}
        tone="amber"
      />
      <Meter
        label="كمية ب · المساحة"
        value={area}
        max={maxMeter}
        tone="orange"
      />

      <DimRow
        label="الطول"
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
      <DimRow
        label="العرض"
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
        <p
          className="text-sm font-black tabular-nums text-amber-950"
          dir="ltr"
        >
          محيط = 2×({length}+{width}) = {peri} · مساحة = {length}×{width} = {area}
        </p>
      </div>

      <div className="mt-4">
        <p className="text-center text-[11px] font-bold text-slate-500">
          أشكال جاهزة
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setLength(p.length);
                setWidth(p.width);
                fire();
              }}
              className="min-h-11 rounded-full bg-white px-3 text-xs font-bold text-amber-900 ring-1 ring-amber-200"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Meter({
  label,
  value,
  max,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  tone: "amber" | "orange";
}) {
  const fill = tone === "amber" ? "bg-amber-500" : "bg-orange-500";
  return (
    <div className="mt-3 rounded-2xl bg-white p-3 ring-1 ring-slate-100">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[12px] font-bold text-slate-500">{label}</p>
        <p className="text-lg font-black tabular-nums text-ink" dir="ltr">
          {value}
        </p>
      </div>
      <div className="h-10 overflow-hidden rounded-xl bg-slate-100" dir="ltr">
        <div
          className={`flex h-full items-center justify-end px-2 ${fill}`}
          style={{ width: `${Math.max(8, (value / max) * 100)}%` }}
        >
          <span className="text-xs font-black text-white tabular-nums">{value}</span>
        </div>
      </div>
    </div>
  );
}

function DimRow({
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
        <p className="text-sm font-black tabular-nums" dir="ltr">
          {value}
        </p>
      </div>
      <div
        dir="ltr"
        className="relative h-11 touch-none rounded-xl bg-amber-50 ring-1 ring-amber-100"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div
          className="absolute inset-y-1 left-1 rounded-lg bg-amber-600"
          style={{
            width: `max(8px, calc(${((value - 1) / 11) * 100}% - 8px))`,
          }}
        />
      </div>
    </div>
  );
}
