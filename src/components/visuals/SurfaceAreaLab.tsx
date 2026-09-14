"use client";

import { useCallback, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type Shape = "cube" | "box";

type Preset = {
  label: string;
  shape: Shape;
  a: number;
  b: number;
  c: number;
};

const PRESETS: Preset[] = [
  { label: "مكعب ٣", shape: "cube", a: 3, b: 3, c: 3 },
  { label: "صندوق ٢×٣×٤", shape: "box", a: 2, b: 3, c: 4 },
  { label: "مكعب ٥", shape: "cube", a: 5, b: 5, c: 5 },
  { label: "صندوق ١×٤×٦", shape: "box", a: 1, b: 4, c: 6 },
];

export function SurfaceAreaLab({ onInteract, compact }: Props) {
  const [shape, setShape] = useState<Shape>("box");
  const [a, setA] = useState(2);
  const [b, setB] = useState(3);
  const [c, setC] = useState(4);
  const [showTrap, setShowTrap] = useState(false);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const length = shape === "cube" ? a : a;
  const width = shape === "cube" ? a : b;
  const height = shape === "cube" ? a : c;

  const face1 = length * width;
  const face2 = length * height;
  const face3 = width * height;
  const surface = 2 * (face1 + face2 + face3);
  const volume = length * width * height;

  const bump = (which: "a" | "b" | "c") => {
    if (shape === "cube") {
      setA((v) => (v >= 8 ? 1 : v + 1));
    } else if (which === "a") {
      setA((v) => (v >= 8 ? 1 : v + 1));
    } else if (which === "b") {
      setB((v) => (v >= 8 ? 1 : v + 1));
    } else {
      setC((v) => (v >= 8 ? 1 : v + 1));
    }
    fire();
  };

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#ECFEFF] to-white ring-1 ring-cyan-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-cyan-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اضغط الأبعاد لتغييرها، أو اختر مثالاً جاهزاً.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          راقب مجموع الوجوه — وقارن بالحجم عند إظهار المصيدة.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => {
            setShape("cube");
            setA(3);
            fire();
          }}
          className={`min-h-11 rounded-full px-4 text-xs font-bold ${
            shape === "cube"
              ? "bg-cyan-700 text-white"
              : "bg-white text-slate-700 ring-1 ring-slate-200"
          }`}
        >
          مكعب
        </button>
        <button
          type="button"
          onClick={() => {
            setShape("box");
            setA(2);
            setB(3);
            setC(4);
            fire();
          }}
          className={`min-h-11 rounded-full px-4 text-xs font-bold ${
            shape === "box"
              ? "bg-cyan-700 text-white"
              : "bg-white text-slate-700 ring-1 ring-slate-200"
          }`}
        >
          متوازي مستطيلات
        </button>
      </div>

      <div className="mt-5 flex min-h-36 items-center justify-center">
        <svg viewBox="0 0 200 140" className="h-36 w-full max-w-xs" aria-hidden>
          <polygon
            points="40,90 100,120 160,90 100,60"
            fill="#A5F3FC"
            stroke="#0E7490"
            strokeWidth="2"
          />
          <polygon
            points="40,90 40,50 100,20 100,60"
            fill="#67E8F9"
            stroke="#0E7490"
            strokeWidth="2"
          />
          <polygon
            points="100,60 100,20 160,50 160,90"
            fill="#22D3EE"
            stroke="#0E7490"
            strokeWidth="2"
          />
          <text x="95" y="95" textAnchor="middle" className="fill-cyan-950 text-[11px] font-bold">
            {surface}
          </text>
        </svg>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => bump("a")}
          className="min-h-11 rounded-2xl bg-white p-2 text-center ring-1 ring-cyan-100"
        >
          <p className="text-[10px] font-bold text-slate-500">طول</p>
          <p className="text-xl font-black tabular-nums text-ink" dir="ltr">
            {length}
          </p>
        </button>
        <button
          type="button"
          onClick={() => bump(shape === "cube" ? "a" : "b")}
          className="min-h-11 rounded-2xl bg-white p-2 text-center ring-1 ring-cyan-100"
        >
          <p className="text-[10px] font-bold text-slate-500">عرض</p>
          <p className="text-xl font-black tabular-nums text-ink" dir="ltr">
            {width}
          </p>
        </button>
        <button
          type="button"
          onClick={() => bump(shape === "cube" ? "a" : "c")}
          className="min-h-11 rounded-2xl bg-white p-2 text-center ring-1 ring-cyan-100"
        >
          <p className="text-[10px] font-bold text-slate-500">ارتفاع</p>
          <p className="text-xl font-black tabular-nums text-ink" dir="ltr">
            {height}
          </p>
        </button>
      </div>

      <div className="mt-3 rounded-2xl bg-cyan-700 px-3 py-3 text-center text-white">
        <p className="text-[11px] font-bold text-cyan-100">المساحة السطحية</p>
        <p className="mt-1 text-sm font-bold tabular-nums" dir="ltr">
          2×({face1}+{face2}+{face3}) = {surface}
        </p>
      </div>

      {showTrap && (
        <div className="mt-2 rounded-2xl bg-amber-50 px-3 py-2 text-center ring-1 ring-amber-200">
          <p className="text-[11px] font-bold text-amber-800">مصيدة الحجم</p>
          <p className="text-lg font-black tabular-nums text-amber-950" dir="ltr">
            {length}×{width}×{height} = {volume}
          </p>
          <p className="text-[11px] text-amber-700">الحجم ≠ المساحة السطحية</p>
        </div>
      )}

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              setShape(preset.shape);
              setA(preset.a);
              setB(preset.b);
              setC(preset.c);
              fire();
            }}
            className="min-h-11 rounded-full bg-white px-3 text-xs font-bold text-slate-700 ring-1 ring-slate-200"
          >
            {preset.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setShowTrap((v) => !v);
            fire();
          }}
          className="min-h-11 rounded-full bg-amber-100 px-3 text-xs font-bold text-amber-900 ring-1 ring-amber-200"
        >
          {showTrap ? "إخفاء المصيدة" : "أظهر المصيدة"}
        </button>
      </div>
    </div>
  );
}
