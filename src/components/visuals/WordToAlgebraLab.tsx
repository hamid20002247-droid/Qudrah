"use client";

import { useCallback, useMemo, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type Chip = {
  id: string;
  label: string;
  piece: string;
};

type Preset = {
  id: string;
  title: string;
  sentence: string;
  chips: Chip[];
  target: string;
};

const PRESETS: Preset[] = [
  {
    id: "p1",
    title: "أمثال وزيادة",
    sentence: "ثلاثة أمثال س تزيد بـ 5 وتساوي 20",
    chips: [
      { id: "a", label: "ثلاثة أمثال س", piece: "3س" },
      { id: "b", label: "يزيد بـ 5", piece: "+ 5" },
      { id: "c", label: "يساوي 20", piece: "= 20" },
    ],
    target: "3س + 5 = 20",
  },
  {
    id: "p2",
    title: "نقص بسيط",
    sentence: "س ينقص بـ 4 ويساوي 11",
    chips: [
      { id: "a", label: "س", piece: "س" },
      { id: "b", label: "ينقص بـ 4", piece: "− 4" },
      { id: "c", label: "يساوي 11", piece: "= 11" },
    ],
    target: "س − 4 = 11",
  },
  {
    id: "p3",
    title: "ضعف",
    sentence: "ضعف س يساوي 18",
    chips: [
      { id: "a", label: "ضعف س", piece: "2س" },
      { id: "b", label: "يساوي 18", piece: "= 18" },
    ],
    target: "2س = 18",
  },
  {
    id: "p4",
    title: "فرق",
    sentence: "فرق ضعفي س و 5 يساوي 11",
    chips: [
      { id: "a", label: "ضعف س", piece: "2س" },
      { id: "b", label: "فرق مع 5", piece: "− 5" },
      { id: "c", label: "يساوي 11", piece: "= 11" },
    ],
    target: "2س − 5 = 11",
  },
];

function joinPieces(pieces: string[]): string {
  if (pieces.length === 0) return "…";
  return pieces.join(" ").replace(/\s+/g, " ").trim();
}

export function WordToAlgebraLab({ onInteract, compact }: Props) {
  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const [builtIds, setBuiltIds] = useState<string[]>([]);

  const fire = useCallback(() => onInteract?.(), [onInteract]);
  const preset = useMemo(
    () => PRESETS.find((item) => item.id === presetId) ?? PRESETS[0],
    [presetId],
  );

  const pieces = builtIds
    .map((id) => preset.chips.find((chip) => chip.id === id)?.piece)
    .filter((piece): piece is string => Boolean(piece));
  const preview = joinPieces(pieces);
  const matched = preview === preset.target;

  const choosePreset = (id: string) => {
    setPresetId(id);
    setBuiltIds([]);
    fire();
  };

  const tapChip = (chip: Chip) => {
    if (builtIds.includes(chip.id)) return;
    setBuiltIds((current) => [...current, chip.id]);
    fire();
  };

  const undo = () => {
    setBuiltIds((current) => current.slice(0, -1));
    fire();
  };

  const reset = () => {
    setBuiltIds([]);
    fire();
  };

  const fillTarget = () => {
    setBuiltIds(preset.chips.map((chip) => chip.id));
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
          اضغط الرقائق بالترتيب لتبني المعادلة من الجملة.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          راقب المعاينة تتحول من ألفاظ إلى رموز جبرية.
        </p>
      </div>

      <div className="mt-4">
        <p className="text-center text-[11px] font-bold text-slate-500">
          جمل جاهزة
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {PRESETS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => choosePreset(item.id)}
              className={`min-h-11 rounded-full px-3 text-xs font-bold ${
                presetId === item.id
                  ? "bg-indigo-700 text-white shadow-sm"
                  : "bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-100">
        <p className="text-[11px] font-bold text-indigo-700">{preset.title}</p>
        <p className="mt-1 text-sm font-bold leading-relaxed text-ink">
          {preset.sentence}
        </p>
      </div>

      <div
        className={`mt-4 rounded-2xl px-3 py-4 text-center ring-1 transition-colors ${
          matched
            ? "bg-indigo-600 text-white ring-indigo-500"
            : "bg-indigo-50 text-indigo-950 ring-indigo-100"
        }`}
      >
        <p
          className={`text-[11px] font-bold ${
            matched ? "text-indigo-100" : "text-indigo-800"
          }`}
        >
          معاينة المعادلة
        </p>
        <p
          className="mt-1 text-2xl font-black tabular-nums tracking-wide"
          dir="ltr"
        >
          {preview}
        </p>
        {matched ? (
          <p className="mt-2 text-xs font-bold text-indigo-100">مطابقة للجملة</p>
        ) : null}
      </div>

      <div className="mt-4">
        <p className="text-center text-[11px] font-bold text-slate-500">
          رقائق الترجمة
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {preset.chips.map((chip) => {
            const used = builtIds.includes(chip.id);
            return (
              <button
                key={chip.id}
                type="button"
                disabled={used}
                onClick={() => tapChip(chip)}
                className={`min-h-11 rounded-full px-3 text-xs font-bold transition-colors ${
                  used
                    ? "cursor-not-allowed bg-slate-100 text-slate-400"
                    : "bg-indigo-700 text-white shadow-sm"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={undo}
          className="min-h-11 rounded-full bg-white px-4 text-xs font-bold text-slate-700 ring-1 ring-slate-200"
        >
          تراجع
        </button>
        <button
          type="button"
          onClick={reset}
          className="min-h-11 rounded-full bg-white px-4 text-xs font-bold text-slate-700 ring-1 ring-slate-200"
        >
          إعادة
        </button>
        <button
          type="button"
          onClick={fillTarget}
          className="min-h-11 rounded-full bg-indigo-100 px-4 text-xs font-bold text-indigo-800 ring-1 ring-indigo-200"
        >
          أظهر البناء
        </button>
      </div>
    </div>
  );
}
