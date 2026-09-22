"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
  autoDemo?: boolean;
};

const PRESETS = [
  { label: "٥ و ١٢", a: 5, b: 12 },
  { label: "٨ و ١٥", a: 8, b: 15 },
  { label: "٧ و ٢٤", a: 7, b: 24 },
  { label: "٢٠ و ٢١", a: 20, b: 21 },
];

export function PythagorasLab({ onInteract, compact, autoDemo }: Props) {
  const [a, setA] = useState(8);
  const [b, setB] = useState(15);
  const drag = useRef<"a" | "b" | null>(null);
  const userTouched = useRef(false);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  useEffect(() => {
    if (!autoDemo) return;
    const frames = [
      { a: 8, b: 15 },
      { a: 6, b: 8 },
      { a: 5, b: 12 },
      { a: 9, b: 12 },
      { a: 7, b: 24 },
      { a: 8, b: 15 },
    ];
    let i = 0;
    const id = window.setInterval(() => {
      if (userTouched.current) return;
      i = (i + 1) % frames.length;
      const f = frames[i]!;
      setA(f.a);
      setB(f.b);
    }, 1400);
    return () => window.clearInterval(id);
  }, [autoDemo]);

  const c2 = a * a + b * b;
  const c = Math.sqrt(c2);
  const cNice = Number.isInteger(c) ? String(c) : c.toFixed(1);

  const maxLeg = 25;
  const scale = compact ? 5 : 6;
  const pad = 28;
  const w = pad * 2 + maxLeg * scale;
  const h = pad * 2 + maxLeg * scale;
  const ox = pad;
  const oy = h - pad;

  const setFromPointer = (which: "a" | "b", clientX: number, clientY: number, svg: SVGSVGElement) => {
    userTouched.current = true;
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * w;
    const y = ((clientY - rect.top) / rect.height) * h;
    if (which === "a") {
      const next = Math.round(Math.max(3, Math.min(maxLeg, (x - ox) / scale)));
      setA(next);
    } else {
      const next = Math.round(Math.max(3, Math.min(maxLeg, (oy - y) / scale)));
      setB(next);
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
          اسحب طرف الضلع الأفقي أو الرأسي لتغيير طوله.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          راقب كيف يتغيّر الوتر عندما يتغيّر أحد الضلعين القائمين.
        </p>
      </div>

      <svg
        viewBox={`0 0 ${w} ${h}`}
        className={`mx-auto mt-4 w-full touch-none ${compact ? "max-h-44" : "max-h-56"}`}
        role="img"
        aria-label="مثلث قائم تفاعلي"
        onPointerMove={(e) => {
          if (!drag.current) return;
          setFromPointer(drag.current, e.clientX, e.clientY, e.currentTarget);
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerLeave={() => {
          drag.current = null;
        }}
      >
        <polygon
          points={`${ox},${oy} ${ox + a * scale},${oy} ${ox},${oy - b * scale}`}
          fill="#A5F3FC"
          stroke="#0891B2"
          strokeWidth="2.5"
        />
        <rect
          x={ox}
          y={oy - 12}
          width="12"
          height="12"
          fill="none"
          stroke="#0E7490"
          strokeWidth="2"
        />
        <circle
          cx={ox + a * scale}
          cy={oy}
          r="12"
          fill="#0891B2"
          className="cursor-ew-resize"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            drag.current = "a";
            setFromPointer("a", e.clientX, e.clientY, e.currentTarget.ownerSVGElement!);
          }}
        />
        <circle
          cx={ox}
          cy={oy - b * scale}
          r="12"
          fill="#0E7490"
          className="cursor-ns-resize"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            drag.current = "b";
            setFromPointer("b", e.clientX, e.clientY, e.currentTarget.ownerSVGElement!);
          }}
        />
        <text
          x={ox + (a * scale) / 2}
          y={oy + 20}
          textAnchor="middle"
          className="fill-cyan-900 text-[11px] font-bold"
          style={{ fontSize: 12 }}
        >
          {a}
        </text>
        <text
          x={ox - 16}
          y={oy - (b * scale) / 2}
          textAnchor="middle"
          className="fill-cyan-900 text-[11px] font-bold"
          style={{ fontSize: 12 }}
        >
          {b}
        </text>
        <text
          x={ox + (a * scale) / 2 + 8}
          y={oy - (b * scale) / 2 - 4}
          textAnchor="middle"
          className="fill-teal-800 text-[11px] font-black"
          style={{ fontSize: 13 }}
        >
          {cNice}
        </text>
      </svg>

      <div className="mt-3 rounded-2xl bg-cyan-700 px-3 py-3 text-center text-white">
        <p className="text-[11px] font-bold text-cyan-100">فيثاغورس</p>
        <p className="mt-1 text-sm font-black tabular-nums" dir="ltr">
          {a}² + {b}² = {c2} = ({cNice})²
        </p>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {PRESETS.map((p) => {
          const active = p.a === a && p.b === b;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                userTouched.current = true;
                setA(p.a);
                setB(p.b);
                fire();
              }}
              className={`min-h-11 rounded-xl px-3 text-sm font-bold ring-1 transition ${
                active
                  ? "bg-cyan-600 text-white ring-cyan-600"
                  : "bg-white text-cyan-900 ring-cyan-100"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
