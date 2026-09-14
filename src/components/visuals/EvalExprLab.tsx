"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type Preset = {
  label: string;
  /** معاملات: س²، س، ثابت */
  a2: number;
  a1: number;
  a0: number;
};

const PRESETS: Preset[] = [
  { label: "س² + 3س − 1", a2: 1, a1: 3, a0: -1 },
  { label: "س² − 2س + 4", a2: 1, a1: -2, a0: 4 },
  { label: "2س² + س", a2: 2, a1: 1, a0: 0 },
  { label: "س² + 5", a2: 1, a1: 0, a0: 5 },
];

const STRIP = [-3, -2, -1, 0, 1, 2, 3, 4, 5];

function exprText(p: Preset): string {
  const parts: string[] = [];
  if (p.a2 !== 0) {
    parts.push(p.a2 === 1 ? "س²" : p.a2 === -1 ? "−س²" : `${p.a2}س²`);
  }
  if (p.a1 !== 0) {
    const abs = Math.abs(p.a1);
    const body = abs === 1 ? "س" : `${abs}س`;
    if (parts.length === 0) parts.push(p.a1 < 0 ? `−${body}` : body);
    else parts.push(p.a1 < 0 ? `− ${body}` : `+ ${body}`);
  }
  if (p.a0 !== 0 || parts.length === 0) {
    const abs = Math.abs(p.a0);
    if (parts.length === 0) parts.push(String(p.a0));
    else parts.push(p.a0 < 0 ? `− ${abs}` : `+ ${abs}`);
  }
  return parts.join(" ");
}

function evalCorrect(p: Preset, s: number): number {
  return p.a2 * s * s + p.a1 * s + p.a0;
}

/** مصيدة نسيان التربيع: س² → 2س */
function evalTrap(p: Preset, s: number): number {
  return p.a2 * (2 * s) + p.a1 * s + p.a0;
}

export function EvalExprLab({ onInteract, compact }: Props) {
  const [presetIndex, setPresetIndex] = useState(0);
  const [s, setS] = useState(3);
  const [showTrap, setShowTrap] = useState(false);
  const dragIndex = useRef<number | null>(null);
  const fire = useCallback(() => onInteract?.(), [onInteract]);
  const preset = PRESETS[presetIndex]!;
  const correct = evalCorrect(preset, s);
  const trapped = evalTrap(preset, s);

  const pickS = (value: number) => {
    setS(value);
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
          اسحب أو اضغط قيمة س على الشريط، وراقب ناتج المقدار.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          جرّب زر المصيدة لترى خطأ نسيان تربيع س.
        </p>
      </div>

      <div
        className={`mt-4 rounded-2xl bg-teal-700 px-3 py-4 text-center text-white ${
          compact ? "py-3" : "py-4"
        }`}
      >
        <p className="text-[11px] font-bold text-teal-100">آلة التعويض</p>
        <p className="mt-1 text-lg font-black tabular-nums" dir="ltr">
          {exprText(preset)}
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="rounded-xl bg-white/15 px-3 py-2 font-bold">
            خانة س²
          </span>
          <span className="rounded-xl bg-white/15 px-3 py-2 font-bold">
            خانة س
          </span>
          <span className="rounded-xl bg-white/15 px-3 py-2 font-bold">
            ثابت
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-white p-3 text-center ring-1 ring-teal-100">
          <p className="text-[11px] font-bold text-slate-500">س</p>
          <p className="text-2xl font-black tabular-nums text-teal-900" dir="ltr">
            {s}
          </p>
        </div>
        <div className="rounded-2xl bg-teal-600 p-3 text-center text-white">
          <p className="text-[11px] font-bold text-teal-100">الناتج الصحيح</p>
          <p className="text-2xl font-black tabular-nums" dir="ltr">
            {correct}
          </p>
        </div>
      </div>

      {showTrap && (
        <div className="mt-2 rounded-2xl bg-amber-50 px-3 py-3 text-center ring-1 ring-amber-200">
          <p className="text-[11px] font-bold text-amber-800">
            لو نُسي التربيع (س² ← 2س)
          </p>
          <p className="mt-1 text-xl font-black tabular-nums text-amber-950" dir="ltr">
            {trapped}
            {trapped !== correct ? "  ·  خطأ شائع" : ""}
          </p>
        </div>
      )}

      <div
        className="mt-3 flex touch-none gap-1 overflow-x-auto pb-1"
        onPointerLeave={() => {
          dragIndex.current = null;
        }}
      >
        {STRIP.map((value) => {
          const active = value === s;
          return (
            <button
              key={value}
              type="button"
              onPointerDown={(e) => {
                dragIndex.current = value;
                e.currentTarget.setPointerCapture(e.pointerId);
                pickS(value);
              }}
              onPointerEnter={() => {
                if (dragIndex.current === null) return;
                pickS(value);
              }}
              onPointerUp={() => {
                dragIndex.current = null;
              }}
              className={`flex h-11 min-w-11 flex-1 items-center justify-center rounded-xl text-sm font-black tabular-nums transition ${
                active
                  ? "bg-teal-600 text-white"
                  : "bg-teal-50 text-teal-900 ring-1 ring-teal-100"
              }`}
              dir="ltr"
            >
              {value}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => {
            setShowTrap((v) => !v);
            fire();
          }}
          className={`min-h-11 rounded-xl px-3 text-xs font-bold ${
            showTrap
              ? "bg-amber-600 text-white"
              : "bg-white text-teal-900 ring-1 ring-teal-200"
          }`}
        >
          {showTrap ? "إخفاء المصيدة" : "نسيت التربيع؟"}
        </button>
        {PRESETS.map((p, index) => {
          const active = index === presetIndex;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setPresetIndex(index);
                setShowTrap(false);
                fire();
              }}
              className={`min-h-11 rounded-xl px-3 text-xs font-bold tabular-nums ring-1 transition ${
                active
                  ? "bg-teal-700 text-white ring-teal-700"
                  : "bg-white text-teal-900 ring-teal-100"
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
