"use client";

import { useCallback, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

const MULTIPLIERS = [1, 2, 3, 4, 5, 6];

export function SpecialTrianglesLab({ onInteract, compact }: Props) {
  const [k, setK] = useState(2);
  const [hide, setHide] = useState<"a" | "b" | "c">("c");
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const a = 3 * k;
  const b = 4 * k;
  const c = 5 * k;

  const display = (value: number, which: "a" | "b" | "c") =>
    hide === which ? "?" : String(value);

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#F0FDF4] to-white ring-1 ring-emerald-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-emerald-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          غيّر المضاعف، واضغط ضلعاً لإخفائه ثم اكتشفه بالنسبة.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          لاحظ أن الأضلاع تبقى بنسبة ٣ : ٤ : ٥.
        </p>
      </div>

      <div className="mt-5 flex min-h-40 items-center justify-center">
        <svg viewBox="0 0 220 160" className="h-40 w-full max-w-sm" aria-label="مثلث خاص">
          {/* قائم: الأفقي = ٤ك (أطول)، الرأسي = ٣ك — نسبة ٤:٣ */}
          <polygon
            points="40,130 160,130 40,40"
            fill="#D1FAE5"
            stroke="#047857"
            strokeWidth="3"
          />
          <text
            x="100"
            y="148"
            textAnchor="middle"
            className="fill-emerald-900 text-[14px] font-black"
          >
            {display(b, "b")}
          </text>
          <text
            x="22"
            y="90"
            textAnchor="middle"
            className="fill-emerald-900 text-[14px] font-black"
          >
            {display(a, "a")}
          </text>
          <text
            x="118"
            y="72"
            textAnchor="middle"
            className="fill-emerald-900 text-[14px] font-black"
          >
            {display(c, "c")}
          </text>
        </svg>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        {(
          [
            { key: "a" as const, label: "٣×ك", value: a },
            { key: "b" as const, label: "٤×ك", value: b },
            { key: "c" as const, label: "٥×ك", value: c },
          ] as const
        ).map((side) => (
          <button
            key={side.key}
            type="button"
            onClick={() => {
              setHide(side.key);
              fire();
            }}
            className={`min-h-11 rounded-2xl p-2 text-center ring-1 ${
              hide === side.key
                ? "bg-emerald-700 text-white ring-emerald-700"
                : "bg-white text-ink ring-emerald-100"
            }`}
          >
            <p className="text-[10px] font-bold opacity-80">{side.label}</p>
            <p className="text-xl font-black tabular-nums" dir="ltr">
              {display(side.value, side.key)}
            </p>
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-2xl bg-emerald-700 px-3 py-3 text-center text-white">
        <p className="text-[11px] font-bold text-emerald-100">المضاعف ك</p>
        <p className="text-2xl font-black tabular-nums" dir="ltr">
          {k}
        </p>
        <p className="mt-1 text-sm font-bold tabular-nums" dir="ltr">
          {a} — {b} — {c}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {MULTIPLIERS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setK(value);
              fire();
            }}
            className={`min-h-11 min-w-11 rounded-full text-xs font-bold ${
              k === value
                ? "bg-emerald-800 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
          >
            <span dir="ltr">{value}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
