"use client";

import { useCallback, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type Relation = "corresponding" | "alternate" | "consecutive";

const PRESETS: { label: string; angle: number; relation: Relation }[] = [
  { label: "متناظرة ٧٠°", angle: 70, relation: "corresponding" },
  { label: "متبادلة ٥٥°", angle: 55, relation: "alternate" },
  { label: "متحالفة ٦٥°", angle: 65, relation: "consecutive" },
  { label: "متناظرة ١٢٠°", angle: 120, relation: "corresponding" },
];

export function ParallelLinesLab({ onInteract, compact }: Props) {
  const [angle, setAngle] = useState(70);
  const [relation, setRelation] = useState<Relation>("corresponding");
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const result =
    relation === "consecutive" ? 180 - angle : angle;

  const relationLabel =
    relation === "corresponding"
      ? "متناظرة → تساوي"
      : relation === "alternate"
        ? "متبادلة → تساوي"
        : "متحالفة → تكامل ١٨٠°";

  const bumpAngle = () => {
    setAngle((v) => (v >= 150 ? 30 : v + 10));
    fire();
  };

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#EEF2FF] to-white ring-1 ring-indigo-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-indigo-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اضغط الزاوية لتغييرها، واختر نوع العلاقة.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          لاحظ: متناظرة/متبادلة تتساويان، والمتحالفة تكمل ١٨٠°.
        </p>
      </div>

      <div className="mt-5 flex min-h-40 items-center justify-center">
        <svg viewBox="0 0 240 150" className="h-40 w-full max-w-sm" aria-label="توازي وقاطع">
          <line x1="20" y1="45" x2="220" y2="45" stroke="#4338CA" strokeWidth="3" />
          <line x1="20" y1="110" x2="220" y2="110" stroke="#4338CA" strokeWidth="3" />
          <line x1="70" y1="20" x2="160" y2="140" stroke="#0F172A" strokeWidth="3" />
          <path
            d="M 95 45 L 108 45 L 112 58"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2.5"
          />
          <text x="118" y="52" className="fill-amber-700 text-[12px] font-black">
            {angle}°
          </text>
          <path
            d="M 125 110 L 138 110 L 133 98"
            fill="none"
            stroke="#059669"
            strokeWidth="2.5"
          />
          <text x="145" y="105" className="fill-emerald-700 text-[12px] font-black">
            {result}°
          </text>
        </svg>
      </div>

      <button
        type="button"
        onClick={bumpAngle}
        className="mx-auto flex min-h-11 w-full max-w-xs items-center justify-center rounded-2xl bg-white ring-1 ring-indigo-100"
      >
        <span className="text-[11px] font-bold text-slate-500">الزاوية المعطاة · اضغط للزيادة</span>
        <span className="mr-2 text-2xl font-black tabular-nums text-ink" dir="ltr">
          {angle}°
        </span>
      </button>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {(
          [
            { id: "corresponding" as const, label: "متناظرة" },
            { id: "alternate" as const, label: "متبادلة" },
            { id: "consecutive" as const, label: "متحالفة" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setRelation(item.id);
              fire();
            }}
            className={`min-h-11 rounded-full px-3 text-xs font-bold ${
              relation === item.id
                ? "bg-indigo-700 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-2xl bg-indigo-700 px-3 py-3 text-center text-white">
        <p className="text-[11px] font-bold text-indigo-100">{relationLabel}</p>
        <p className="mt-1 text-2xl font-black tabular-nums" dir="ltr">
          {result}°
        </p>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              setAngle(preset.angle);
              setRelation(preset.relation);
              fire();
            }}
            className="min-h-11 rounded-full bg-white px-3 text-xs font-bold text-slate-700 ring-1 ring-slate-200"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
