"use client";

import { useCallback, useMemo, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type Kind = "s" | "const";

type Chip = {
  id: string;
  kind: Kind;
  coef: number;
  selected: boolean;
};

type Preset = {
  label: string;
  chips: { kind: Kind; coef: number }[];
};

const PRESETS: Preset[] = [
  {
    label: "3س + 5 − س + 2",
    chips: [
      { kind: "s", coef: 3 },
      { kind: "const", coef: 5 },
      { kind: "s", coef: -1 },
      { kind: "const", coef: 2 },
    ],
  },
  {
    label: "4س + 2س − 3",
    chips: [
      { kind: "s", coef: 4 },
      { kind: "s", coef: 2 },
      { kind: "const", coef: -3 },
    ],
  },
  {
    label: "7 − 2س + س + 1",
    chips: [
      { kind: "const", coef: 7 },
      { kind: "s", coef: -2 },
      { kind: "s", coef: 1 },
      { kind: "const", coef: 1 },
    ],
  },
  {
    label: "5س − 4س + 8 − 3",
    chips: [
      { kind: "s", coef: 5 },
      { kind: "s", coef: -4 },
      { kind: "const", coef: 8 },
      { kind: "const", coef: -3 },
    ],
  },
];

function chipLabel(kind: Kind, coef: number): string {
  if (kind === "const") return String(coef);
  if (coef === 1) return "س";
  if (coef === -1) return "−س";
  return `${coef}س`;
}

function makeChips(preset: Preset): Chip[] {
  return preset.chips.map((chip, index) => ({
    id: `${index}-${chip.kind}-${chip.coef}`,
    kind: chip.kind,
    coef: chip.coef,
    selected: false,
  }));
}

function simplifyText(chips: Chip[]): string {
  const sSum = chips.filter((c) => c.kind === "s").reduce((a, c) => a + c.coef, 0);
  const cSum = chips
    .filter((c) => c.kind === "const")
    .reduce((a, c) => a + c.coef, 0);
  const parts: string[] = [];
  if (sSum !== 0) {
    if (sSum === 1) parts.push("س");
    else if (sSum === -1) parts.push("−س");
    else parts.push(`${sSum}س`);
  }
  if (cSum !== 0 || parts.length === 0) {
    if (parts.length === 0) parts.push(String(cSum));
    else parts.push(cSum > 0 ? `+ ${cSum}` : `− ${Math.abs(cSum)}`);
  }
  return parts.join(" ");
}

export function SimplifyLab({ onInteract, compact }: Props) {
  const [presetIndex, setPresetIndex] = useState(0);
  const [chips, setChips] = useState<Chip[]>(() => makeChips(PRESETS[0]!));
  const [mergedFlash, setMergedFlash] = useState(false);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const result = useMemo(() => simplifyText(chips), [chips]);
  const fullyMerged =
    chips.filter((c) => c.kind === "s").length <= 1 &&
    chips.filter((c) => c.kind === "const").length <= 1;

  const applyPreset = (index: number) => {
    setPresetIndex(index);
    setChips(makeChips(PRESETS[index]!));
    setMergedFlash(false);
    fire();
  };

  const tryMergeSelected = (nextChips: Chip[]) => {
    const selected = nextChips.filter((c) => c.selected);
    if (selected.length < 2) {
      setChips(nextChips);
      return;
    }
    const kind = selected[0]!.kind;
    if (!selected.every((c) => c.kind === kind)) {
      setChips(nextChips.map((c) => ({ ...c, selected: false })));
      return;
    }
    const sum = selected.reduce((a, c) => a + c.coef, 0);
    const remaining = nextChips.filter((c) => !c.selected);
    const merged: Chip = {
      id: `m-${kind}-${sum}-${Date.now()}`,
      kind,
      coef: sum,
      selected: false,
    };
    setChips([...remaining, merged]);
    setMergedFlash(true);
    window.setTimeout(() => setMergedFlash(false), 500);
    fire();
  };

  const toggleChip = (id: string) => {
    const next = chips.map((c) =>
      c.id === id ? { ...c, selected: !c.selected } : c,
    );
    const selected = next.filter((c) => c.selected);
    if (selected.length >= 2 && selected.every((c) => c.kind === selected[0]!.kind)) {
      tryMergeSelected(next);
    } else {
      setChips(next);
      fire();
    }
  };

  const autoMerge = () => {
    const sSum = chips.filter((c) => c.kind === "s").reduce((a, c) => a + c.coef, 0);
    const cSum = chips
      .filter((c) => c.kind === "const")
      .reduce((a, c) => a + c.coef, 0);
    const next: Chip[] = [];
    if (sSum !== 0) next.push({ id: "auto-s", kind: "s", coef: sSum, selected: false });
    if (cSum !== 0 || next.length === 0) {
      next.push({ id: "auto-c", kind: "const", coef: cSum, selected: false });
    }
    setChips(next);
    setMergedFlash(true);
    window.setTimeout(() => setMergedFlash(false), 500);
    fire();
  };

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#F5F3FF] to-white ring-1 ring-violet-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-violet-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اضغط بلاطات من نفس النوع لدمجها، أو استخدم الدمج التلقائي.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          الحدود المتشابهة فقط تُجمع — س مع س، والأعداد مع الأعداد.
        </p>
      </div>

      <div
        className={`mt-4 flex flex-wrap content-start justify-center gap-2 rounded-2xl bg-violet-50/80 p-3 ring-1 ring-violet-100 ${
          compact ? "min-h-24" : "min-h-28"
        }`}
      >
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => toggleChip(chip.id)}
            className={`flex min-h-11 min-w-[3.25rem] items-center justify-center rounded-2xl px-3 text-sm font-black tabular-nums transition active:scale-[0.97] ${
              chip.selected
                ? "bg-violet-700 text-white ring-2 ring-violet-300"
                : chip.kind === "s"
                  ? "bg-violet-500 text-white"
                  : "bg-white text-violet-950 ring-1 ring-violet-200"
            } ${mergedFlash && fullyMerged ? "scale-105" : ""}`}
            dir="ltr"
          >
            {chipLabel(chip.kind, chip.coef)}
          </button>
        ))}
      </div>

      <div
        className={`mt-3 rounded-2xl px-3 py-3 text-center ${
          fullyMerged
            ? "bg-violet-700 text-white"
            : "bg-white text-violet-950 ring-1 ring-violet-100"
        }`}
      >
        <p className="text-[11px] font-bold opacity-80">الناتج بعد التبسيط</p>
        <p className="mt-1 text-xl font-black tabular-nums" dir="ltr">
          {result}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={autoMerge}
          className="min-h-11 rounded-xl bg-violet-700 px-4 text-xs font-black text-white"
        >
          دمج تلقائي
        </button>
        {PRESETS.map((p, index) => {
          const active = index === presetIndex;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(index)}
              className={`min-h-11 rounded-xl px-3 text-xs font-bold tabular-nums ring-1 transition ${
                active
                  ? "bg-violet-600 text-white ring-violet-600"
                  : "bg-white text-violet-900 ring-violet-100"
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
