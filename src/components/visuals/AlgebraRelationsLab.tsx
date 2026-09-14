"use client";

import { useCallback, useMemo, useRef, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type Relation = {
  id: string;
  label: string;
  k: number;
  b: number;
  formula: string;
};

const RELATIONS: Relation[] = [
  { id: "r1", label: "س = 2ص + 1", k: 2, b: 1, formula: "س = 2ص + 1" },
  { id: "r2", label: "س = 3ص − 4", k: 3, b: -4, formula: "س = 3ص − 4" },
  { id: "r3", label: "س = ص + 8", k: 1, b: 8, formula: "س = ص + 8" },
  { id: "r4", label: "س = 5ص", k: 5, b: 0, formula: "س = 5ص" },
];

const MIN_SAD = 0;
const MAX_SAD = 10;

export function AlgebraRelationsLab({ onInteract, compact }: Props) {
  const [relationId, setRelationId] = useState(RELATIONS[0].id);
  const [sad, setSad] = useState(4);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const fire = useCallback(() => onInteract?.(), [onInteract]);
  const relation = useMemo(
    () => RELATIONS.find((item) => item.id === relationId) ?? RELATIONS[0],
    [relationId],
  );

  const seen = relation.k * sad + relation.b;
  const maxBar = Math.max(20, Math.abs(relation.k) * MAX_SAD + Math.abs(relation.b) + 2);
  const sadWidth = Math.max(8, (sad / MAX_SAD) * 100);
  const seenWidth = Math.max(8, (Math.abs(seen) / maxBar) * 100);

  const updateSad = useCallback(
    (next: number) => {
      setSad(Math.max(MIN_SAD, Math.min(MAX_SAD, Math.round(next))));
      fire();
    },
    [fire],
  );

  const setFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const rtl = getComputedStyle(track).direction === "rtl";
    const position = rtl ? rect.right - clientX : clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, position / rect.width));
    updateSad(MIN_SAD + ratio * (MAX_SAD - MIN_SAD));
  };

  const chooseRelation = (id: string) => {
    setRelationId(id);
    fire();
  };

  const pct = ((sad - MIN_SAD) / (MAX_SAD - MIN_SAD)) * 100;

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#F0FDFA] to-white ring-1 ring-teal-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-teal-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اختر علاقة، ثم اسحب قيمة ص وشاهد س تتحدّث فوراً.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          الشريطان مرتبطان: تغيّر ص يحرّك س حسب العلاقة.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {RELATIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => chooseRelation(item.id)}
            className={`min-h-11 rounded-full px-3 text-xs font-bold tabular-nums ${
              relationId === item.id
                ? "bg-teal-700 text-white shadow-sm"
                : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
            dir="ltr"
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3 rounded-2xl bg-white p-4 ring-1 ring-slate-100">
        <div className="grid grid-cols-[3rem_1fr_3rem] items-center gap-2">
          <p className="text-sm font-bold text-slate-600">ص</p>
          <div className="h-10 overflow-hidden rounded-xl bg-teal-50">
            <div
              className="h-full rounded-xl bg-teal-500 transition-[width]"
              style={{ width: `${sadWidth}%` }}
            />
          </div>
          <p
            className="text-center text-lg font-black tabular-nums text-teal-800"
            dir="ltr"
          >
            {sad}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-teal-700">
          <span className="text-lg font-black" aria-hidden>
            ↓
          </span>
          <p className="text-xs font-bold" dir="ltr">
            {relation.formula}
          </p>
        </div>

        <div className="grid grid-cols-[3rem_1fr_3rem] items-center gap-2">
          <p className="text-sm font-bold text-slate-600">س</p>
          <div className="h-10 overflow-hidden rounded-xl bg-cyan-50">
            <div
              className={`h-full rounded-xl transition-[width] ${
                seen < 0 ? "bg-rose-400" : "bg-cyan-600"
              }`}
              style={{ width: `${seenWidth}%` }}
            />
          </div>
          <p
            className="text-center text-lg font-black tabular-nums text-cyan-900"
            dir="ltr"
          >
            {seen}
          </p>
        </div>
      </div>

      <div
        ref={trackRef}
        className="relative mt-5 h-12 touch-none select-none rounded-full bg-teal-100 ring-1 ring-teal-200"
        onPointerDown={(event) => {
          event.preventDefault();
          dragging.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          setFromClientX(event.clientX);
        }}
        onPointerMove={(event) => {
          if (dragging.current) setFromClientX(event.clientX);
        }}
        onPointerUp={(event) => {
          dragging.current = false;
          try {
            event.currentTarget.releasePointerCapture(event.pointerId);
          } catch {
            /* ignore */
          }
        }}
        role="slider"
        aria-valuemin={MIN_SAD}
        aria-valuemax={MAX_SAD}
        aria-valuenow={sad}
        aria-label="قيمة ص"
        dir="ltr"
      >
        <div
          className="absolute top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-teal-700 shadow-md ring-4 ring-white"
          style={{ left: `calc(${pct}% - 18px)` }}
        />
      </div>

      <div className="mt-4 rounded-2xl bg-teal-700 px-3 py-3 text-center text-white">
        <p className="text-[11px] font-bold text-teal-100">القيم الحية</p>
        <p className="mt-1 text-lg font-black tabular-nums" dir="ltr">
          ص = {sad} ← س = {seen}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {[0, 2, 4, 6, 8].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => updateSad(value)}
            className={`min-h-11 min-w-11 rounded-full text-xs font-bold tabular-nums ${
              sad === value
                ? "bg-teal-700 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
            dir="ltr"
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}
