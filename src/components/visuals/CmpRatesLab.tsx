"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type Mode = "speed" | "price";

type DragPadProps = {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
};

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function verdict(a: number, b: number): string {
  if (a > b) return "كمية أ أكبر";
  if (b > a) return "كمية ب أكبر";
  return "متساويتان";
}

function DragPad({
  label,
  value,
  unit,
  min,
  max,
  step,
  onChange,
}: DragPadProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const ratio = (value - min) / (max - min);

  const setFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const position = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const steps = Math.round((position * (max - min)) / step);
    onChange(Math.round((min + steps * step) * 10) / 10);
  };

  return (
    <div className="rounded-2xl bg-sky-50 p-3 ring-1 ring-sky-100">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-sky-900">{label}</p>
        <p className="text-sm font-black tabular-nums text-sky-950" dir="ltr">
          {formatNumber(value)} {unit}
        </p>
      </div>
      <div
        ref={trackRef}
        className="relative mt-3 h-12 touch-none select-none rounded-xl bg-white ring-1 ring-sky-100"
        dir="ltr"
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        onPointerDown={(event) => {
          event.preventDefault();
          dragging.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          setFromClientX(event.clientX);
        }}
        onPointerMove={(event) => {
          if (dragging.current) setFromClientX(event.clientX);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
      >
        <div
          className="absolute inset-y-2 start-2 rounded-lg bg-sky-400"
          style={{ width: `calc(${ratio * 100}% - 8px)` }}
        />
        <div
          className="absolute top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-sky-700 shadow"
          style={{ left: `calc(${ratio * 100}% - 16px)` }}
        />
      </div>
    </div>
  );
}

export function CmpRatesLab({ onInteract, compact }: Props) {
  const [mode, setMode] = useState<Mode>("speed");
  const [distA, setDistA] = useState(120);
  const [timeA, setTimeA] = useState(2);
  const [distB, setDistB] = useState(90);
  const [timeB, setTimeB] = useState(1.5);
  const [costA, setCostA] = useState(24);
  const [qtyA, setQtyA] = useState(3);
  const [costB, setCostB] = useState(35);
  const [qtyB, setQtyB] = useState(5);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const rateA =
    mode === "speed"
      ? distA / timeA
      : costA / qtyA;
  const rateB =
    mode === "speed"
      ? distB / timeB
      : costB / qtyB;
  const result = verdict(rateA, rateB);
  const unit = mode === "speed" ? "كم/ساعة" : "ريال/قطعة";

  const touch = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    fire();
  };

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#F0F9FF] to-white ring-1 ring-sky-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-sky-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اسحب القيم في البطاقتين، وراقب المعدل ثم الحكم.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          السرعة = مسافة ÷ زمن · سعر الوحدة = تكلفة ÷ كمية.
        </p>
      </div>

      <div className="mt-3 flex justify-center gap-2">
        {(
          [
            { id: "speed" as const, label: "سرعة" },
            { id: "price" as const, label: "سعر وحدة" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setMode(item.id);
              fire();
            }}
            className={`min-h-11 rounded-xl px-4 text-xs font-bold ${
              mode === item.id
                ? "bg-sky-700 text-white"
                : "bg-white text-sky-900 ring-1 ring-sky-100"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-sky-600 p-3 text-white">
          <p className="text-center text-[11px] font-bold text-sky-100">كمية أ</p>
          <div className="mt-2 space-y-2">
            {mode === "speed" ? (
              <>
                <DragPad
                  label="مسافة"
                  value={distA}
                  unit="كم"
                  min={30}
                  max={200}
                  step={10}
                  onChange={touch(setDistA)}
                />
                <DragPad
                  label="زمن"
                  value={timeA}
                  unit="ساعة"
                  min={0.5}
                  max={4}
                  step={0.5}
                  onChange={touch(setTimeA)}
                />
              </>
            ) : (
              <>
                <DragPad
                  label="تكلفة"
                  value={costA}
                  unit="ريال"
                  min={10}
                  max={80}
                  step={1}
                  onChange={touch(setCostA)}
                />
                <DragPad
                  label="كمية"
                  value={qtyA}
                  unit="قطعة"
                  min={1}
                  max={10}
                  step={1}
                  onChange={touch(setQtyA)}
                />
              </>
            )}
          </div>
          <p className="mt-3 text-center text-lg font-black tabular-nums" dir="ltr">
            {formatNumber(rateA)} {unit}
          </p>
        </div>

        <div className="rounded-2xl bg-sky-900 p-3 text-white">
          <p className="text-center text-[11px] font-bold text-sky-200">كمية ب</p>
          <div className="mt-2 space-y-2">
            {mode === "speed" ? (
              <>
                <DragPad
                  label="مسافة"
                  value={distB}
                  unit="كم"
                  min={30}
                  max={200}
                  step={10}
                  onChange={touch(setDistB)}
                />
                <DragPad
                  label="زمن"
                  value={timeB}
                  unit="ساعة"
                  min={0.5}
                  max={4}
                  step={0.5}
                  onChange={touch(setTimeB)}
                />
              </>
            ) : (
              <>
                <DragPad
                  label="تكلفة"
                  value={costB}
                  unit="ريال"
                  min={10}
                  max={80}
                  step={1}
                  onChange={touch(setCostB)}
                />
                <DragPad
                  label="كمية"
                  value={qtyB}
                  unit="قطعة"
                  min={1}
                  max={10}
                  step={1}
                  onChange={touch(setQtyB)}
                />
              </>
            )}
          </div>
          <p className="mt-3 text-center text-lg font-black tabular-nums" dir="ltr">
            {formatNumber(rateB)} {unit}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-2xl bg-white px-3 py-4 text-center ring-1 ring-sky-100">
        <p className="text-[11px] font-bold text-slate-500">الحكم</p>
        <p className="mt-1 text-lg font-black text-sky-900">{result}</p>
      </div>
    </div>
  );
}
