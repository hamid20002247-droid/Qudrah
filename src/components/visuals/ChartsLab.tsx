"use client";

import { useCallback, useMemo, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type Mode = "bars" | "pie";

const BAR_PRESETS = [
  { label: "مبيعات", names: ["السبت", "الأحد", "الإثنين", "الثلاثاء"], values: [4, 7, 5, 9] },
  { label: "حضور", names: ["صباح", "ظهر", "عصر", "مساء"], values: [12, 8, 10, 6] },
  { label: "نقاط", names: ["جولة 1", "جولة 2", "جولة 3"], values: [3, 8, 5] },
];

const PIE_PRESETS = [
  { label: "ألوان", names: ["أحمر", "أزرق", "أخضر"], values: [40, 35, 25] },
  { label: "مواد", names: ["رياضيات", "علوم", "عربي"], values: [50, 30, 20] },
];

const MAX_BAR = 16;
const COLORS = ["#0ea5e9", "#06b6d4", "#38bdf8", "#0284c7"];

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polar(cx, cy, r, endAngle);
  const end = polar(cx, cy, r, startAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${end.x} ${end.y} A ${r} ${r} 0 ${large} 1 ${start.x} ${start.y} Z`;
}

export function ChartsLab({ onInteract, compact }: Props) {
  const [mode, setMode] = useState<Mode>("bars");
  const [barPreset, setBarPreset] = useState(0);
  const [piePreset, setPiePreset] = useState(0);
  const [values, setValues] = useState(BAR_PRESETS[0].values.slice());
  const [names, setNames] = useState(BAR_PRESETS[0].names.slice());
  const [selected, setSelected] = useState(0);
  const [compare, setCompare] = useState<number | null>(1);

  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const loadBars = (index: number) => {
    const preset = BAR_PRESETS[index];
    setBarPreset(index);
    setValues(preset.values.slice());
    setNames(preset.names.slice());
    setSelected(0);
    setCompare(preset.values.length > 1 ? 1 : null);
    fire();
  };

  const loadPie = (index: number) => {
    const preset = PIE_PRESETS[index];
    setPiePreset(index);
    setValues(preset.values.slice());
    setNames(preset.names.slice());
    setSelected(0);
    setCompare(null);
    fire();
  };

  const bumpBar = (index: number) => {
    setValues((current) =>
      current.map((value, i) =>
        i === index ? (value >= MAX_BAR ? 2 : value + 1) : value,
      ),
    );
    fire();
  };

  const pickBar = (index: number) => {
    if (selected === index) return;
    if (compare === null) {
      setCompare(index);
    } else if (compare === index) {
      setCompare(null);
    } else {
      setSelected(index);
      setCompare(null);
    }
    fire();
  };

  const minIndex = values.indexOf(Math.min(...values));
  const maxIndex = values.indexOf(Math.max(...values));
  const delta =
    compare !== null ? Math.abs(values[selected] - values[compare]) : null;

  const pieSlices = useMemo(() => {
    const total = values.reduce((a, b) => a + b, 0) || 1;
    let angle = 0;
    return values.map((value) => {
      const sweep = (value / total) * 360;
      const start = angle;
      const end = angle + sweep;
      angle = end;
      return { start, end, value, share: Math.round((value / total) * 100) };
    });
  }, [values]);

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#ECFEFF] to-white ring-1 ring-cyan-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-cyan-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اضغط العمود لزيادة ارتفاعه، واضغط اسم الفترة لاختيارها والمقارنة.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          راقب الأعلى والأقل والفرق. ويمكنك التبديل إلى دائرة من 3 شرائح.
        </p>
      </div>

      <div className="mt-3 flex justify-center gap-2">
        {(
          [
            ["bars", "أعمدة"],
            ["pie", "دائرة"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setMode(id);
              if (id === "bars") loadBars(barPreset);
              else loadPie(piePreset);
            }}
            className={`min-h-11 rounded-full px-4 text-xs font-bold ${
              mode === id
                ? "bg-sky-600 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "bars" ? (
        <>
          <svg
            viewBox="0 0 320 180"
            className="mt-4 h-auto w-full"
            role="img"
            aria-label="رسم أعمدة تفاعلي"
          >
            <line
              x1="28"
              y1="150"
              x2="300"
              y2="150"
              stroke="#cbd5e1"
              strokeWidth="2"
            />
            {values.map((value, index) => {
              const barW = Math.min(48, 220 / values.length);
              const gap = (260 - barW * values.length) / (values.length + 1);
              const x = 40 + gap + index * (barW + gap);
              const h = (value / MAX_BAR) * 110;
              const y = 150 - h;
              const isSel = selected === index;
              const isCmp = compare === index;
              return (
                <g key={`${names[index]}-${index}`}>
                  <rect
                    x={x}
                    y={y}
                    width={barW}
                    height={Math.max(h, 4)}
                    rx="8"
                    fill={
                      isSel
                        ? "#0284c7"
                        : isCmp
                          ? "#67e8f9"
                          : COLORS[index % COLORS.length]
                    }
                    className="cursor-pointer"
                    onClick={() => bumpBar(index)}
                  />
                  <text
                    x={x + barW / 2}
                    y={y - 8}
                    textAnchor="middle"
                    fill="#0f172a"
                    fontSize="12"
                    fontWeight="800"
                  >
                    {value}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {names.map((name, index) => (
              <button
                key={name}
                type="button"
                onClick={() => pickBar(index)}
                className={`min-h-11 rounded-full px-3 text-xs font-bold ${
                  selected === index
                    ? "bg-sky-700 text-white"
                    : compare === index
                      ? "bg-cyan-200 text-cyan-950"
                      : "bg-white text-slate-700 ring-1 ring-slate-200"
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-white p-2 ring-1 ring-slate-100">
              <p className="text-[10px] font-bold text-slate-500">أعلى</p>
              <p className="text-sm font-black text-sky-800">
                {names[maxIndex]}{" "}
                <span dir="ltr" className="tabular-nums">
                  {values[maxIndex]}
                </span>
              </p>
            </div>
            <div className="rounded-2xl bg-white p-2 ring-1 ring-slate-100">
              <p className="text-[10px] font-bold text-slate-500">أقل</p>
              <p className="text-sm font-black text-sky-800">
                {names[minIndex]}{" "}
                <span dir="ltr" className="tabular-nums">
                  {values[minIndex]}
                </span>
              </p>
            </div>
            <div className="rounded-2xl bg-sky-600 p-2 text-white">
              <p className="text-[10px] font-bold text-sky-100">فرق</p>
              <p className="text-sm font-black tabular-nums" dir="ltr">
                {delta !== null ? delta : "—"}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {BAR_PRESETS.map((preset, index) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => loadBars(index)}
                className={`min-h-11 rounded-full px-3 text-xs font-bold ${
                  index === barPreset
                    ? "bg-sky-700 text-white"
                    : "bg-white text-slate-700 ring-1 ring-slate-200"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <svg viewBox="0 0 200 200" className="h-44 w-44" aria-label="دائرة نسب">
              {pieSlices.map((slice, i) => (
                <path
                  key={names[i]}
                  d={slicePath(
                    100,
                    100,
                    selected === i ? 92 : 84,
                    slice.start,
                    slice.end,
                  )}
                  fill={COLORS[i % COLORS.length]}
                  stroke="#fff"
                  strokeWidth="2"
                  className="cursor-pointer"
                  onClick={() => {
                    setSelected(i);
                    fire();
                  }}
                />
              ))}
            </svg>
            <div className="space-y-2">
              {names.map((name, i) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setSelected(i);
                    fire();
                  }}
                  className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 text-xs font-bold ${
                    selected === i
                      ? "bg-sky-600 text-white"
                      : "bg-white text-slate-700 ring-1 ring-slate-200"
                  }`}
                >
                  <span>{name}</span>
                  <span dir="ltr" className="tabular-nums">
                    {values[i]} ({pieSlices[i].share}٪)
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {PIE_PRESETS.map((preset, index) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => loadPie(index)}
                className={`min-h-11 rounded-full px-3 text-xs font-bold ${
                  index === piePreset
                    ? "bg-sky-700 text-white"
                    : "bg-white text-slate-700 ring-1 ring-slate-200"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
