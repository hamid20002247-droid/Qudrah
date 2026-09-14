"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type Preset = {
  label: string;
  k: number;
  inner: number;
  sign: "+" | "−";
  right: number;
};

const PRESETS: Preset[] = [
  { label: "2(س + 3) = 14", k: 2, inner: 3, sign: "+", right: 14 },
  { label: "3(س − 1) = 12", k: 3, inner: 1, sign: "−", right: 12 },
  { label: "4(س + 2) = 20", k: 4, inner: 2, sign: "+", right: 20 },
  { label: "5(س − 2) = 15", k: 5, inner: 2, sign: "−", right: 15 },
];

function solutionOf(p: Preset): number {
  const distributed = p.sign === "+" ? p.k * p.inner : -p.k * p.inner;
  return (p.right - distributed) / p.k;
}

export function TwoStepEqLab({ onInteract, compact }: Props) {
  const [presetIndex, setPresetIndex] = useState(0);
  const preset = PRESETS[presetIndex]!;
  const [expanded, setExpanded] = useState(false);
  const [s, setS] = useState(solutionOf(preset));
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const distributedConst =
    preset.sign === "+" ? preset.k * preset.inner : -preset.k * preset.inner;
  const leftVal = preset.k * s + distributedConst;
  const trueEq = leftVal === preset.right;

  const applyPreset = (index: number) => {
    const next = PRESETS[index]!;
    setPresetIndex(index);
    setExpanded(false);
    setS(solutionOf(next));
    fire();
  };

  const setFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setS(Math.round(-1 + ratio * 12));
    fire();
  };

  const bump = (delta: number) => {
    setS((current) => Math.max(-1, Math.min(11, current + delta)));
    fire();
  };

  const groupedLabel = `${preset.k}(س ${preset.sign} ${preset.inner}) = ${preset.right}`;
  const expandedLabel = `${preset.k}س ${distributedConst >= 0 ? "+" : "−"} ${Math.abs(distributedConst)} = ${preset.right}`;

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#EEF2FF] to-white ring-1 ring-indigo-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-indigo-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اضغط «وسّع» لتوزيع القوس، ثم اسحب س حتى تتحقق المساواة.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          راقب تحويل المجموعة إلى حدود منفصلة قبل الحل.
        </p>
      </div>

      <div className={`mt-4 flex flex-wrap items-center justify-center gap-2 ${compact ? "min-h-16" : "min-h-20"}`}>
        {!expanded ? (
          <>
            <span
              className="flex min-h-11 items-center rounded-2xl bg-indigo-600 px-3 text-sm font-black text-white tabular-nums"
              dir="ltr"
            >
              {preset.k}
            </span>
            <span className="text-lg font-black text-indigo-400">×</span>
            <span
              className="flex min-h-11 items-center gap-1 rounded-2xl border-2 border-dashed border-indigo-400 bg-indigo-50 px-3 text-sm font-black text-indigo-950 tabular-nums"
              dir="ltr"
            >
              <span className="rounded-lg bg-white px-2 py-1 ring-1 ring-indigo-100">س</span>
              <span>{preset.sign}</span>
              <span className="rounded-lg bg-white px-2 py-1 ring-1 ring-indigo-100">
                {preset.inner}
              </span>
            </span>
            <span className="text-lg font-black text-slate-400">=</span>
            <span
              className="flex min-h-11 items-center rounded-2xl bg-slate-700 px-3 text-sm font-black text-white tabular-nums"
              dir="ltr"
            >
              {preset.right}
            </span>
          </>
        ) : (
          <>
            <span
              className="flex min-h-11 items-center rounded-2xl bg-indigo-600 px-3 text-sm font-black text-white tabular-nums animate-[pulse_0.6s_ease-out]"
              dir="ltr"
            >
              {preset.k}س
            </span>
            <span className="text-lg font-black text-indigo-400">
              {distributedConst >= 0 ? "+" : "−"}
            </span>
            <span
              className="flex min-h-11 items-center rounded-2xl bg-violet-500 px-3 text-sm font-black text-white tabular-nums"
              dir="ltr"
            >
              {Math.abs(distributedConst)}
            </span>
            <span className="text-lg font-black text-slate-400">=</span>
            <span
              className="flex min-h-11 items-center rounded-2xl bg-slate-700 px-3 text-sm font-black text-white tabular-nums"
              dir="ltr"
            >
              {preset.right}
            </span>
          </>
        )}
      </div>

      <div className="mt-3 flex justify-center">
        <button
          type="button"
          onClick={() => {
            setExpanded(true);
            fire();
          }}
          disabled={expanded}
          className={`min-h-11 rounded-xl px-5 text-sm font-black transition ${
            expanded
              ? "bg-slate-100 text-slate-400"
              : "bg-indigo-700 text-white active:scale-[0.98]"
          }`}
        >
          {expanded ? "تم التوسيع" : "وسّع"}
        </button>
      </div>

      <div
        className={`mt-3 rounded-2xl px-3 py-3 text-center ${
          expanded && trueEq
            ? "bg-indigo-700 text-white"
            : "bg-white text-indigo-950 ring-1 ring-indigo-100"
        }`}
      >
        <p className="text-[11px] font-bold opacity-80">
          {expanded ? "بعد التوزيع" : "قبل التوزيع"}
        </p>
        <p className="mt-1 text-base font-black tabular-nums" dir="ltr">
          {expanded ? expandedLabel : groupedLabel}
        </p>
        {expanded && (
          <p className="mt-1 text-sm font-bold tabular-nums" dir="ltr">
            الطرف الأيسر عند س={s}: {leftVal}
            {trueEq ? "  ·  صح ✓" : ""}
          </p>
        )}
      </div>

      {expanded && (
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
            aria-valuemin={-1}
            aria-valuemax={11}
            aria-valuenow={s}
            aria-label="قيمة س"
          >
            <div
              className="absolute top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-indigo-600 shadow-md ring-2 ring-white"
              style={{
                left: `calc(${((s + 1) / 12) * 100}% - 18px)`,
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
      )}

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
