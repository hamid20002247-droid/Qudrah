"use client";

import { useCallback, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

const LEFT_PRESETS = [
  { label: "15×8", value: 120 },
  { label: "24+36", value: 60 },
  { label: "17×5", value: 85 },
  { label: "8×8", value: 64 },
  { label: "144÷12", value: 12 },
];

const RIGHT_PRESETS = [
  { label: "12×9", value: 108 },
  { label: "15×4", value: 60 },
  { label: "90−8", value: 82 },
  { label: "7×9", value: 63 },
  { label: "5×3−2", value: 13 },
];

function verdict(a: number, b: number) {
  if (a > b) return "أ أكبر";
  if (b > a) return "ب أكبر";
  return "متساويتان";
}

export function CmpNumbersLab({ onInteract, compact }: Props) {
  const [aExpr, setAExpr] = useState(LEFT_PRESETS[0]);
  const [bExpr, setBExpr] = useState(RIGHT_PRESETS[0]);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const a = aExpr.value;
  const b = bExpr.value;
  const result = verdict(a, b);

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#EEF2FF] to-white ring-1 ring-indigo-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-indigo-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اضغط شريحة لتغيير عبارة كمية أ أو كمية ب.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          احسب الناتج في كل عمود، ثم راقب حكم المقارنة.
        </p>
      </div>

      <div className="mt-5 text-center">
        <p className="text-[12px] font-bold text-indigo-700">حكم المقارنة</p>
        <p className="mt-1 inline-flex min-h-11 items-center rounded-2xl bg-indigo-700 px-4 text-xl font-black text-white">
          {result}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Column
          title="كمية أ"
          tone="indigo"
          expr={aExpr}
          presets={LEFT_PRESETS}
          onPick={(p) => {
            setAExpr(p);
            fire();
          }}
        />
        <Column
          title="كمية ب"
          tone="slate"
          expr={bExpr}
          presets={RIGHT_PRESETS}
          onPick={(p) => {
            setBExpr(p);
            fire();
          }}
        />
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4 text-center ring-1 ring-slate-100">
        <p
          className="text-sm font-black tabular-nums text-slate-700"
          dir="ltr"
        >
          {a} مقابل {b}
        </p>
        <p className="mt-2 text-[13px] font-bold leading-relaxed text-indigo-950">
          احسب كل كمية على حدة، ثم قارن الرقمين مباشرة.
        </p>
      </div>
    </div>
  );
}

function Column({
  title,
  tone,
  expr,
  presets,
  onPick,
}: {
  title: string;
  tone: "indigo" | "slate";
  expr: { label: string; value: number };
  presets: { label: string; value: number }[];
  onPick: (p: { label: string; value: number }) => void;
}) {
  const active =
    tone === "indigo"
      ? "bg-indigo-700 text-white"
      : "bg-slate-800 text-white";
  const idle = "bg-white text-slate-700 ring-1 ring-slate-200";
  const valueColor =
    tone === "indigo" ? "text-indigo-700" : "text-slate-800";

  return (
    <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-100">
      <p className="text-center text-[12px] font-bold text-slate-500">{title}</p>
      <p
        className={`mt-1 text-center text-2xl font-black tabular-nums ${valueColor}`}
        dir="ltr"
      >
        {expr.value}
      </p>
      <p className="mt-1 text-center text-[12px] font-bold text-slate-400" dir="ltr">
        {expr.label}
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {presets.map((p) => {
          const isOn = p.label === expr.label && p.value === expr.value;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => onPick(p)}
              className={`min-h-11 rounded-xl px-2 text-sm font-black tabular-nums ${
                isOn ? active : idle
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
