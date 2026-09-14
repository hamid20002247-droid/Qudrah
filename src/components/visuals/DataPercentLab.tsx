"use client";

import { useCallback, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type Preset = {
  label: string;
  categories: { name: string; value: number }[];
};

const PRESETS: Preset[] = [
  {
    label: "مبيعات",
    categories: [
      { name: "كتب", value: 40 },
      { name: "أقلام", value: 25 },
      { name: "دفاتر", value: 35 },
    ],
  },
  {
    label: "حضور",
    categories: [
      { name: "ناجح", value: 48 },
      { name: "راسب", value: 12 },
      { name: "غائب", value: 20 },
    ],
  },
  {
    label: "ألوان",
    categories: [
      { name: "أحمر", value: 15 },
      { name: "أزرق", value: 35 },
      { name: "أخضر", value: 50 },
    ],
  },
];

export function DataPercentLab({ onInteract, compact }: Props) {
  const [presetIndex, setPresetIndex] = useState(0);
  const [selected, setSelected] = useState(0);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const preset = PRESETS[presetIndex];
  const total = preset.categories.reduce((s, c) => s + c.value, 0);
  const cat = preset.categories[selected];
  const percent = total === 0 ? 0 : (cat.value / total) * 100;
  const percentRounded = Math.round(percent * 10) / 10;
  const maxVal = Math.max(...preset.categories.map((c) => c.value), 1);

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#F5F3FF] to-white ring-1 ring-violet-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-violet-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اضغط فئة لمعرفة نسبتها من المجموع.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          الصيغة: الفئة ÷ المجموع × 100.
        </p>
      </div>

      <div className="mt-5 flex min-h-40 items-end justify-center gap-2">
        {preset.categories.map((category, index) => {
          const active = selected === index;
          return (
            <button
              key={category.name}
              type="button"
              onClick={() => {
                setSelected(index);
                fire();
              }}
              className={`flex min-h-11 min-w-14 flex-1 flex-col items-center justify-end rounded-2xl px-1 pt-2 ring-1 active:scale-[0.98] ${
                active
                  ? "bg-violet-100 ring-violet-300"
                  : "bg-violet-50 ring-violet-100"
              }`}
              aria-label={`${category.name}: ${category.value}`}
            >
              <span
                className="mb-1 font-black tabular-nums text-violet-950"
                dir="ltr"
              >
                {category.value}
              </span>
              <span
                className={`w-full rounded-t-xl transition-[height] ${
                  active ? "bg-violet-600" : "bg-violet-400"
                }`}
                style={{
                  height: Math.max(28, (category.value / maxVal) * 112),
                }}
                aria-hidden
              />
              <span className="mt-2 pb-1 text-[11px] font-bold text-violet-900">
                {category.name}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-3 text-center ring-1 ring-slate-100">
          <p className="text-[11px] font-bold text-slate-500">الفئة</p>
          <p className="text-lg font-black text-ink">{cat.name}</p>
          <p className="text-xl font-black tabular-nums text-violet-800" dir="ltr">
            {cat.value}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-3 text-center ring-1 ring-slate-100">
          <p className="text-[11px] font-bold text-slate-500">المجموع</p>
          <p className="text-2xl font-black tabular-nums text-ink" dir="ltr">
            {total}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-2xl bg-violet-600 px-3 py-4 text-center text-white shadow-sm">
        <p className="text-[11px] font-bold text-violet-100">
          الفئة ÷ المجموع × 100
        </p>
        <p className="mt-1 text-xl font-black tabular-nums" dir="ltr">
          {cat.value} ÷ {total} × 100 ={" "}
          {Number.isInteger(percent) ? percent : percentRounded}٪
        </p>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {PRESETS.map((item, index) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              setPresetIndex(index);
              setSelected(0);
              fire();
            }}
            className={`min-h-11 rounded-full px-3 text-xs font-bold ${
              index === presetIndex
                ? "bg-violet-700 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
