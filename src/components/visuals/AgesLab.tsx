"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type Relation = "triple" | "double" | "sum48" | "sum60";

const PRESETS: {
  label: string;
  relation: Relation;
  son: number;
}[] = [
  { label: "أب = 3×ابن", relation: "triple", son: 12 },
  { label: "أب = 2×ابن", relation: "double", son: 15 },
  { label: "مجموع 48", relation: "sum48", son: 12 },
  { label: "مجموع 60", relation: "sum60", son: 15 },
];

function fatherFrom(son: number, relation: Relation): number {
  if (relation === "triple") return 3 * son;
  if (relation === "double") return 2 * son;
  if (relation === "sum48") return 48 - son;
  return 60 - son;
}

function relationText(relation: Relation): string {
  if (relation === "triple") return "عمر الأب = 3 × عمر الابن";
  if (relation === "double") return "عمر الأب = 2 × عمر الابن";
  if (relation === "sum48") return "عمر الأب + عمر الابن = 48";
  return "عمر الأب + عمر الابن = 60";
}

function equationWithSin(son: number, relation: Relation): string {
  if (relation === "triple") return `أب = 3 × س = ${3 * son} ، س = ${son}`;
  if (relation === "double") return `أب = 2 × س = ${2 * son} ، س = ${son}`;
  if (relation === "sum48") return `أب = 48 − س = ${48 - son} ، س = ${son}`;
  return `أب = 60 − س = ${60 - son} ، س = ${son}`;
}

const SON_MIN = 5;
const SON_MAX = 25;
const BAR_MAX = 75;

export function AgesLab({ onInteract, compact }: Props) {
  const [relation, setRelation] = useState<Relation>("triple");
  const [son, setSon] = useState(12);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const father = fatherFrom(son, relation);
  const maxBar = Math.max(BAR_MAX, father + 5);

  const setSonFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    let next = Math.round(SON_MIN + ratio * (SON_MAX - SON_MIN));
    if (relation === "sum48") next = Math.min(next, 40);
    if (relation === "sum60") next = Math.min(next, 50);
    if (relation === "triple" || relation === "double") {
      /* father grows freely */
    }
    setSon(Math.max(SON_MIN, Math.min(SON_MAX, next)));
    fire();
  };

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#FFF7ED] to-white ring-1 ring-orange-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-orange-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اسحب عمر الابن، وراقب عمود الأب يتغيّر حسب العلاقة.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          لاحظ المعادلة: عمر الابن = س.
        </p>
      </div>

      <div className="mt-4 text-center">
        <p className="text-[12px] font-bold text-orange-700">العلاقة</p>
        <p className="mt-1 text-lg font-black text-ink">{relationText(relation)}</p>
        <p
          className="mt-2 text-sm font-bold tabular-nums text-orange-900"
          dir="ltr"
        >
          {equationWithSin(son, relation)}
        </p>
      </div>

      <div
        className={`mt-5 flex items-end justify-center gap-8 ${
          compact ? "min-h-36" : "min-h-44"
        }`}
        aria-label="أعماد الأعمار"
      >
        <div className="flex w-24 flex-col items-center">
          <span
            className="mb-2 text-lg font-black tabular-nums text-orange-900"
            dir="ltr"
          >
            {father}
          </span>
          <div
            className="flex w-16 items-end justify-center rounded-t-2xl bg-orange-100 ring-1 ring-orange-200"
            style={{ height: compact ? 140 : 168 }}
          >
            <div
              className="w-12 rounded-t-xl bg-gradient-to-t from-orange-700 to-orange-400 transition-[height] duration-150"
              style={{
                height: Math.max(24, (father / maxBar) * (compact ? 128 : 156)),
              }}
            />
          </div>
          <p className="mt-2 text-sm font-bold text-orange-900">أب</p>
        </div>

        <div className="flex w-24 flex-col items-center">
          <span
            className="mb-2 text-lg font-black tabular-nums text-amber-900"
            dir="ltr"
          >
            {son}
          </span>
          <div
            className="flex w-16 items-end justify-center rounded-t-2xl bg-amber-50 ring-1 ring-amber-200"
            style={{ height: compact ? 140 : 168 }}
          >
            <div
              className="w-12 rounded-t-xl bg-gradient-to-t from-amber-600 to-amber-300 transition-[height] duration-150"
              style={{
                height: Math.max(24, (son / maxBar) * (compact ? 128 : 156)),
              }}
            />
          </div>
          <p className="mt-2 text-sm font-bold text-amber-900">ابن</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setSon((v) => Math.max(SON_MIN, v - 1));
            fire();
          }}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg font-black ring-1 ring-slate-200"
          aria-label="إنقاص عمر الابن"
        >
          −
        </button>
        <div
          ref={trackRef}
          className="relative h-11 flex-1 touch-none overflow-hidden rounded-full bg-orange-100 ring-1 ring-orange-200"
          onPointerDown={(e) => {
            e.preventDefault();
            dragging.current = true;
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            setSonFromClientX(e.clientX);
          }}
          onPointerMove={(e) => {
            if (!dragging.current) return;
            setSonFromClientX(e.clientX);
          }}
          onPointerUp={(e) => {
            dragging.current = false;
            try {
              (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
            } catch {
              /* ignore */
            }
          }}
          onPointerCancel={() => {
            dragging.current = false;
          }}
          role="slider"
          aria-valuemin={SON_MIN}
          aria-valuemax={SON_MAX}
          aria-valuenow={son}
          aria-label="عمر الابن"
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-orange-400/60"
            style={{
              width: `${((son - SON_MIN) / (SON_MAX - SON_MIN)) * 100}%`,
            }}
          />
          <div
            className="absolute top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-white shadow ring-2 ring-orange-600"
            style={{
              left: `calc(${((son - SON_MIN) / (SON_MAX - SON_MIN)) * 100}% - 16px)`,
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setSon((v) => Math.min(SON_MAX, v + 1));
            fire();
          }}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg font-black ring-1 ring-slate-200"
          aria-label="زيادة عمر الابن"
        >
          +
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-white p-3 text-center ring-1 ring-slate-100">
          <p className="text-[11px] font-bold text-slate-500">عمر الابن س</p>
          <p className="text-xl font-black tabular-nums text-ink" dir="ltr">
            {son}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-3 text-center ring-1 ring-slate-100">
          <p className="text-[11px] font-bold text-slate-500">عمر الأب</p>
          <p className="text-xl font-black tabular-nums text-orange-800" dir="ltr">
            {father}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {PRESETS.map((preset) => {
          const active = preset.relation === relation && preset.son === son;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setRelation(preset.relation);
                setSon(preset.son);
                fire();
              }}
              className={`min-h-11 rounded-full px-3 text-xs font-bold ${
                active
                  ? "bg-orange-800 text-white"
                  : "bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
