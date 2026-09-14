"use client";

import { useCallback, useMemo, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type EquationPreset = {
  id: string;
  title: string;
  leftLabel: string;
  rightLabel: string;
  left: (s: number) => number;
  right: (s: number) => number;
  candidates: number[];
};

const PRESETS: EquationPreset[] = [
  {
    id: "e1",
    title: "س + 5 = 12",
    leftLabel: "س + 5",
    rightLabel: "12",
    left: (s) => s + 5,
    right: () => 12,
    candidates: [5, 7, 12, 17],
  },
  {
    id: "e2",
    title: "2س = 16",
    leftLabel: "2س",
    rightLabel: "16",
    left: (s) => 2 * s,
    right: () => 16,
    candidates: [6, 8, 14, 18],
  },
  {
    id: "e3",
    title: "3س − 1 = 8",
    leftLabel: "3س − 1",
    rightLabel: "8",
    left: (s) => 3 * s - 1,
    right: () => 8,
    candidates: [2, 3, 4, 7],
  },
  {
    id: "e4",
    title: "2س + 3 = س + 9",
    leftLabel: "2س + 3",
    rightLabel: "س + 9",
    left: (s) => 2 * s + 3,
    right: (s) => s + 9,
    candidates: [3, 6, 9, 12],
  },
];

function formatNum(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return String(Math.round(n * 100) / 100);
}

export function CheckBySubLab({ onInteract, compact }: Props) {
  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const [selected, setSelected] = useState<number | null>(null);

  const fire = useCallback(() => onInteract?.(), [onInteract]);
  const preset = useMemo(
    () => PRESETS.find((item) => item.id === presetId) ?? PRESETS[0],
    [presetId],
  );

  const leftValue = selected === null ? null : preset.left(selected);
  const rightValue = selected === null ? null : preset.right(selected);
  const equal =
    leftValue !== null &&
    rightValue !== null &&
    Math.abs(leftValue - rightValue) < 1e-9;

  const choosePreset = (id: string) => {
    setPresetId(id);
    setSelected(null);
    fire();
  };

  const tapCandidate = (value: number) => {
    setSelected(value);
    fire();
  };

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#ECFDF5] to-white ring-1 ring-emerald-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-emerald-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اختر معادلة، ثم اضغط قيمة مرشّحة لـ س داخل آلة التعويض.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          راقب الطرفين: أخضر عند التساوي، أحمر عند الاختلاف.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {PRESETS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => choosePreset(item.id)}
            className={`min-h-11 rounded-full px-3 text-xs font-bold tabular-nums ${
              presetId === item.id
                ? "bg-emerald-700 text-white shadow-sm"
                : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
            dir="ltr"
          >
            {item.title}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-[1.75rem] bg-slate-900 p-4 text-white shadow-inner">
        <p className="text-center text-[11px] font-bold text-emerald-300">
          آلة التعويض
        </p>
        <p className="mt-1 text-center text-sm font-bold text-slate-300" dir="ltr">
          {preset.title}
        </p>

        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
          <div
            className={`rounded-2xl px-2 py-4 text-center ring-2 transition-colors ${
              selected === null
                ? "bg-slate-800 ring-slate-700"
                : equal
                  ? "bg-emerald-600 ring-emerald-400"
                  : "bg-rose-600 ring-rose-400"
            }`}
          >
            <p className="text-[10px] font-bold text-white/80">اليسار</p>
            <p className="mt-1 text-xs font-bold" dir="ltr">
              {preset.leftLabel}
            </p>
            <p className="mt-2 text-2xl font-black tabular-nums" dir="ltr">
              {leftValue === null ? "—" : formatNum(leftValue)}
            </p>
          </div>

          <div className="flex items-center justify-center">
            <span
              className={`text-2xl font-black ${
                selected === null
                  ? "text-slate-500"
                  : equal
                    ? "text-emerald-300"
                    : "text-rose-300"
              }`}
            >
              =
            </span>
          </div>

          <div
            className={`rounded-2xl px-2 py-4 text-center ring-2 transition-colors ${
              selected === null
                ? "bg-slate-800 ring-slate-700"
                : equal
                  ? "bg-emerald-600 ring-emerald-400"
                  : "bg-rose-600 ring-rose-400"
            }`}
          >
            <p className="text-[10px] font-bold text-white/80">اليمين</p>
            <p className="mt-1 text-xs font-bold" dir="ltr">
              {preset.rightLabel}
            </p>
            <p className="mt-2 text-2xl font-black tabular-nums" dir="ltr">
              {rightValue === null ? "—" : formatNum(rightValue)}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-slate-800 px-3 py-3 text-center">
          <p className="text-[11px] font-bold text-slate-400">قيمة س المختارة</p>
          <p className="mt-1 text-xl font-black tabular-nums text-white" dir="ltr">
            {selected === null ? "—" : selected}
          </p>
          {selected !== null ? (
            <p
              className={`mt-2 text-xs font-bold ${
                equal ? "text-emerald-300" : "text-rose-300"
              }`}
            >
              {equal ? "الطرفان متساويان — القيمة تحقق" : "غير متساويين — جرّب قيمة أخرى"}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-center text-[11px] font-bold text-slate-500">
          مرشّحات س
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {preset.candidates.map((value) => {
            const active = selected === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => tapCandidate(value)}
                className={`min-h-11 min-w-14 rounded-full px-3 text-sm font-black tabular-nums transition-colors ${
                  active
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-white text-slate-800 ring-1 ring-slate-200"
                }`}
                dir="ltr"
              >
                {value}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
