"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type DragPadProps = {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  color: "teal" | "amber";
  onChange: (value: number) => void;
};

const PRESETS = [
  { label: "داخل المدينة", speed: 60, time: 1 },
  { label: "رحلة قصيرة", speed: 80, time: 1.5 },
  { label: "طريق سريع", speed: 100, time: 2 },
];

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function DragPad({
  label,
  value,
  unit,
  min,
  max,
  step,
  color,
  onChange,
}: DragPadProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const ratio = (value - min) / (max - min);
  const tone =
    color === "teal"
      ? {
          panel: "bg-teal-50 ring-teal-100",
          text: "text-teal-900",
          fill: "bg-teal-500",
        }
      : {
          panel: "bg-amber-50 ring-amber-100",
          text: "text-amber-950",
          fill: "bg-amber-400",
        };

  const setFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const position = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const steps = Math.round((position * (max - min)) / step);
    onChange(Math.round((min + steps * step) * 100) / 100);
  };

  const moveBy = (amount: number) => {
    onChange(Math.max(min, Math.min(max, value + amount)));
  };

  return (
    <div className={`rounded-2xl p-3 ring-1 ${tone.panel}`}>
      <div className="flex items-center justify-between gap-3">
        <p className={`text-xs font-bold ${tone.text}`}>{label}</p>
        <p
          className={`text-lg font-black tabular-nums ${tone.text}`}
          dir="ltr"
        >
          {formatNumber(value)} {unit}
        </p>
      </div>

      <div
        ref={trackRef}
        className="relative mt-3 h-14 touch-none select-none rounded-xl bg-white ring-1 ring-black/5"
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
        onPointerUp={(event) => {
          dragging.current = false;
          try {
            event.currentTarget.releasePointerCapture(event.pointerId);
          } catch {
            // The pointer may already have been released.
          }
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowUp") {
            event.preventDefault();
            moveBy(step);
          }
          if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
            event.preventDefault();
            moveBy(-step);
          }
        }}
      >
        <div
          className={`absolute inset-y-0 left-0 rounded-xl ${tone.fill}`}
          style={{ width: `${ratio * 100}%` }}
        />
        <div
          className="absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950 text-white shadow-lg"
          style={{ left: `${ratio * 100}%` }}
          aria-hidden
        >
          <span className="text-base font-black">↔</span>
        </div>
      </div>
    </div>
  );
}

export function RateDistanceLab({ onInteract, compact }: Props) {
  const [speed, setSpeed] = useState(80);
  const [time, setTime] = useState(1.5);
  const fire = useCallback(() => onInteract?.(), [onInteract]);
  const distance = Math.round(speed * time * 10) / 10;

  const updateSpeed = (value: number) => {
    setSpeed(value);
    fire();
  };

  const updateTime = (value: number) => {
    setTime(value);
    fire();
  };

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-sky-50 to-white ring-1 ring-sky-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-sky-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اسحب مقبض السرعة ومقبض الزمن، أو اختر مثالاً جاهزاً.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          راقب المسافة وهي تتغيّر عند تحريك أي منهما.
        </p>
      </div>

      <div className={`mt-4 grid gap-3 ${compact ? "" : "sm:grid-cols-2"}`}>
        <DragPad
          label="السرعة"
          value={speed}
          unit="كم/س"
          min={20}
          max={120}
          step={10}
          color="teal"
          onChange={updateSpeed}
        />
        <DragPad
          label="الزمن"
          value={time}
          unit="ساعة"
          min={0.5}
          max={4}
          step={0.5}
          color="amber"
          onChange={updateTime}
        />
      </div>

      <div className="mt-4 rounded-2xl bg-slate-950 px-4 py-5 text-center text-white shadow-sm">
        <p className="text-xs font-bold text-slate-300">المسافة</p>
        <p className="mt-1 text-4xl font-black tabular-nums" dir="ltr">
          {formatNumber(distance)} كم
        </p>
        <p
          className="mt-3 text-sm font-bold tabular-nums text-sky-200"
          dir="ltr"
        >
          {formatNumber(speed)} × {formatNumber(time)} ={" "}
          {formatNumber(distance)}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {PRESETS.map((preset) => {
          const active = speed === preset.speed && time === preset.time;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setSpeed(preset.speed);
                setTime(preset.time);
                fire();
              }}
              className={`min-h-11 rounded-full px-3 text-xs font-bold ${
                active
                  ? "bg-sky-700 text-white"
                  : "bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
