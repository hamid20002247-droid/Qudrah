"use client";

import { useCallback, useMemo, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type Op = { id: string; label: string; apply: (n: number) => number };

const OPS: Op[] = [
  { id: "add3", label: "+3 للطرفين", apply: (n) => n + 3 },
  { id: "sub2", label: "−2 للطرفين", apply: (n) => n - 2 },
  { id: "div2", label: "÷2 للطرفين", apply: (n) => n / 2 },
  { id: "mul2", label: "×2 للطرفين", apply: (n) => n * 2 },
];

const PRESETS = [
  { id: "a", left: 7, right: 7, label: "7 = 7" },
  { id: "b", left: 10, right: 10, label: "10 = 10" },
  { id: "c", left: 12, right: 12, label: "12 = 12" },
];

function formatNum(n: number): string {
  if (Number.isInteger(n)) return String(n);
  const rounded = Math.round(n * 100) / 100;
  return String(rounded);
}

export function BalanceSidesLab({ onInteract, compact }: Props) {
  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const [left, setLeft] = useState(PRESETS[0].left);
  const [right, setRight] = useState(PRESETS[0].right);
  const [trapOneSide, setTrapOneSide] = useState(false);

  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const balanced = Math.abs(left - right) < 1e-9;
  const tip = balanced ? 0 : left > right ? -12 : 12;

  const equation = useMemo(
    () => `${formatNum(left)} = ${formatNum(right)}`,
    [left, right],
  );

  const choosePreset = (id: string) => {
    const preset = PRESETS.find((item) => item.id === id) ?? PRESETS[0];
    setPresetId(id);
    setLeft(preset.left);
    setRight(preset.right);
    setTrapOneSide(false);
    fire();
  };

  const applyOp = (op: Op) => {
    setLeft((current) => op.apply(current));
    if (!trapOneSide) {
      setRight((current) => op.apply(current));
    }
    fire();
  };

  const beamY = 70;
  const panY = beamY + 38 + tip * 0.4;

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#F8FAFC] to-white ring-1 ring-slate-200 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-slate-200">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اضغط عملية لتُطبَّق على الطرفين، وراقب الميزان يبقى معتدلاً.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          جرّب مصيدة «طرف واحد فقط» لترى الميل عند كسر القاعدة.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => choosePreset(preset.id)}
            className={`min-h-11 rounded-full px-3 text-xs font-bold tabular-nums ${
              presetId === preset.id
                ? "bg-slate-800 text-amber-200 shadow-sm"
                : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
            dir="ltr"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl bg-gradient-to-b from-slate-100 to-amber-50 ring-1 ring-slate-200">
        <svg
          viewBox="0 0 320 180"
          className="mx-auto h-44 w-full max-w-md"
          role="img"
          aria-label="ميزان طرفي المعادلة"
        >
          <line
            x1="160"
            y1="40"
            x2="160"
            y2="150"
            stroke="#475569"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <polygon points="140,150 180,150 160,170" fill="#334155" />
          <g
            style={{
              transformOrigin: "160px 70px",
              transform: `rotate(${tip}deg)`,
              transition: "transform 350ms ease",
            }}
          >
            <line
              x1="60"
              y1={beamY}
              x2="260"
              y2={beamY}
              stroke="#B45309"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <line
              x1="80"
              y1={beamY}
              x2="80"
              y2={panY}
              stroke="#64748B"
              strokeWidth="3"
            />
            <line
              x1="240"
              y1={beamY}
              x2="240"
              y2={panY}
              stroke="#64748B"
              strokeWidth="3"
            />
            <ellipse
              cx="80"
              cy={panY + 10}
              rx="42"
              ry="14"
              fill="#FEF3C7"
              stroke="#B45309"
              strokeWidth="3"
            />
            <ellipse
              cx="240"
              cy={panY + 10}
              rx="42"
              ry="14"
              fill="#FEF3C7"
              stroke="#B45309"
              strokeWidth="3"
            />
            <text
              x="80"
              y={panY + 14}
              textAnchor="middle"
              className="fill-slate-900"
              style={{ fontSize: 18, fontWeight: 800 }}
              direction="ltr"
            >
              {formatNum(left)}
            </text>
            <text
              x="240"
              y={panY + 14}
              textAnchor="middle"
              className="fill-slate-900"
              style={{ fontSize: 18, fontWeight: 800 }}
              direction="ltr"
            >
              {formatNum(right)}
            </text>
          </g>
          <circle cx="160" cy="70" r="8" fill="#0F172A" />
        </svg>
      </div>

      <div
        className={`mt-3 rounded-2xl px-3 py-3 text-center ring-1 ${
          balanced
            ? "bg-amber-100 ring-amber-200 text-amber-950"
            : "bg-rose-50 ring-rose-200 text-rose-900"
        }`}
      >
        <p className="text-[11px] font-bold opacity-80">المعادلة الآن</p>
        <p className="mt-1 text-2xl font-black tabular-nums" dir="ltr">
          {equation}
        </p>
        <p className="mt-1 text-xs font-bold">
          {balanced ? "الميزان معتدل" : "الميزان مائل — الطرفان غير متساويين"}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {OPS.map((op) => (
          <button
            key={op.id}
            type="button"
            onClick={() => applyOp(op)}
            className="min-h-11 rounded-2xl bg-slate-800 px-2 text-xs font-bold text-amber-100 shadow-sm"
          >
            {op.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => {
          setTrapOneSide((current) => !current);
          fire();
        }}
        className={`mt-3 min-h-11 w-full rounded-2xl text-xs font-bold ring-1 ${
          trapOneSide
            ? "bg-rose-600 text-white ring-rose-500"
            : "bg-white text-slate-700 ring-slate-200"
        }`}
      >
        {trapOneSide
          ? "المصيدة مفعّلة: طرف واحد فقط"
          : "أظهر المصيدة: طرف واحد فقط"}
      </button>
    </div>
  );
}
