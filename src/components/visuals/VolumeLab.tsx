"use client";

import { useCallback, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type Mode = "cube" | "box";

const CUBE_PRESETS = [2, 3, 4, 5, 6];
const BOX_PRESETS = [
  { label: "٥×٣×٢", l: 5, w: 3, h: 2 },
  { label: "٨×٥×٤", l: 8, w: 5, h: 4 },
  { label: "١٠×٤×٢", l: 10, w: 4, h: 2 },
];

export function VolumeLab({ onInteract, compact }: Props) {
  const [mode, setMode] = useState<Mode>("box");
  const [side, setSide] = useState(4);
  const [l, setL] = useState(5);
  const [w, setW] = useState(3);
  const [h, setH] = useState(2);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const volume = mode === "cube" ? side * side * side : l * w * h;

  const bump = (setter: (n: number) => void, value: number, max = 12) => {
    setter(value >= max ? 1 : value + 1);
    fire();
  };

  const depth = compact ? 18 : 24;
  const scale = compact ? 10 : 12;
  const boxL = mode === "cube" ? side : l;
  const boxW = mode === "cube" ? side : w;
  const boxH = mode === "cube" ? side : h;
  const svgW = boxL * scale + depth + 40;
  const svgH = boxH * scale + depth + 40;
  const ox = 20;
  const oy = svgH - 20;

  const front = [
    [ox, oy],
    [ox + boxL * scale, oy],
    [ox + boxL * scale, oy - boxH * scale],
    [ox, oy - boxH * scale],
  ];
  const top = [
    [ox, oy - boxH * scale],
    [ox + boxL * scale, oy - boxH * scale],
    [ox + boxL * scale + depth, oy - boxH * scale - depth],
    [ox + depth, oy - boxH * scale - depth],
  ];
  const sideFace = [
    [ox + boxL * scale, oy],
    [ox + boxL * scale + depth, oy - depth],
    [ox + boxL * scale + depth, oy - boxH * scale - depth],
    [ox + boxL * scale, oy - boxH * scale],
  ];

  const poly = (pts: number[][]) => pts.map((p) => p.join(",")).join(" ");

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#F0F9FF] to-white ring-1 ring-slate-200 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-slate-200">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اضغط أي بُعد لزيادته، أو بدّل بين المكعب والصندوق.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          الحجم = ضرب الأبعاد الثلاثة — راقب الرقم وهو يتغيّر.
        </p>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        <button
          type="button"
          onClick={() => {
            setMode("cube");
            fire();
          }}
          className={`min-h-11 rounded-xl px-3 text-sm font-bold ring-1 ${
            mode === "cube"
              ? "bg-slate-800 text-white ring-slate-800"
              : "bg-white text-slate-800 ring-slate-200"
          }`}
        >
          مكعب
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("box");
            fire();
          }}
          className={`min-h-11 rounded-xl px-3 text-sm font-bold ring-1 ${
            mode === "box"
              ? "bg-slate-800 text-white ring-slate-800"
              : "bg-white text-slate-800 ring-slate-200"
          }`}
        >
          متوازي مستطيلات
        </button>
      </div>

      <div className="mt-4 flex justify-center">
        <svg
          width={Math.max(svgW, 160)}
          height={Math.max(svgH, 120)}
          viewBox={`0 0 ${Math.max(svgW, 160)} ${Math.max(svgH, 120)}`}
          aria-hidden
        >
          <polygon points={poly(top)} fill="#CBD5E1" stroke="#334155" strokeWidth="2" />
          <polygon points={poly(sideFace)} fill="#94A3B8" stroke="#334155" strokeWidth="2" />
          <polygon points={poly(front)} fill="#E2E8F0" stroke="#334155" strokeWidth="2" />
        </svg>
      </div>

      {mode === "cube" ? (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => bump(setSide, side)}
            className="min-h-11 min-w-28 rounded-2xl bg-slate-100 px-4 py-2 text-center ring-1 ring-slate-200"
          >
            <p className="text-[11px] font-bold text-slate-500">الضلع</p>
            <p className="text-xl font-black tabular-nums text-slate-900" dir="ltr">
              {side}
            </p>
          </button>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => bump(setL, l)}
            className="min-h-11 rounded-2xl bg-slate-100 px-2 py-2 text-center ring-1 ring-slate-200"
          >
            <p className="text-[11px] font-bold text-slate-500">الطول</p>
            <p className="text-lg font-black tabular-nums text-slate-900" dir="ltr">
              {l}
            </p>
          </button>
          <button
            type="button"
            onClick={() => bump(setW, w)}
            className="min-h-11 rounded-2xl bg-slate-100 px-2 py-2 text-center ring-1 ring-slate-200"
          >
            <p className="text-[11px] font-bold text-slate-500">العرض</p>
            <p className="text-lg font-black tabular-nums text-slate-900" dir="ltr">
              {w}
            </p>
          </button>
          <button
            type="button"
            onClick={() => bump(setH, h)}
            className="min-h-11 rounded-2xl bg-slate-100 px-2 py-2 text-center ring-1 ring-slate-200"
          >
            <p className="text-[11px] font-bold text-slate-500">الارتفاع</p>
            <p className="text-lg font-black tabular-nums text-slate-900" dir="ltr">
              {h}
            </p>
          </button>
        </div>
      )}

      <div className="mt-4 rounded-2xl bg-slate-800 px-3 py-3 text-center text-white">
        <p className="text-[11px] font-bold text-slate-300">الحجم</p>
        <p className="mt-1 text-sm font-black tabular-nums" dir="ltr">
          {mode === "cube"
            ? `${side} × ${side} × ${side} = ${volume}`
            : `${l} × ${w} × ${h} = ${volume}`}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {mode === "cube"
          ? CUBE_PRESETS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSide(s);
                  fire();
                }}
                className={`min-h-11 rounded-xl px-3 text-sm font-bold ring-1 ${
                  side === s
                    ? "bg-slate-800 text-white ring-slate-800"
                    : "bg-white text-slate-800 ring-slate-200"
                }`}
              >
                ض = {s}
              </button>
            ))
          : BOX_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setL(p.l);
                  setW(p.w);
                  setH(p.h);
                  fire();
                }}
                className={`min-h-11 rounded-xl px-3 text-sm font-bold ring-1 ${
                  l === p.l && w === p.w && h === p.h
                    ? "bg-slate-800 text-white ring-slate-800"
                    : "bg-white text-slate-800 ring-slate-200"
                }`}
              >
                {p.label}
              </button>
            ))}
      </div>
    </div>
  );
}
