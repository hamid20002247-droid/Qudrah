"use client";

import { useCallback, useMemo, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type Op = "+" | "−" | "×" | "÷";

type TokenChip = {
  id: string;
  label: string;
  kind: "num" | "op";
  value?: number;
  op?: Op;
};

type Scenario = {
  id: string;
  title: string;
  story: string;
  chips: TokenChip[];
};

const SCENARIOS: Scenario[] = [
  {
    id: "shop-remain",
    title: "ما تبقى",
    story:
      "معك 120 ريالاً. اشتريت 3 أقلام بسعر 15 ريالاً للقلم. ما تبقى؟",
    chips: [
      { id: "s1-a", label: "120", kind: "num", value: 120 },
      { id: "s1-b", label: "−", kind: "op", op: "−" },
      { id: "s1-c", label: "3×15", kind: "num", value: 45 },
    ],
  },
  {
    id: "together",
    title: "معاً",
    story:
      "اشترى 4 علب بسعر 18 ريالاً للعلبة، ودفترين بسعر 12 ريالاً للدفتر. كم دفع معاً؟",
    chips: [
      { id: "s2-a", label: "4×18", kind: "num", value: 72 },
      { id: "s2-b", label: "+", kind: "op", op: "+" },
      { id: "s2-c", label: "2×12", kind: "num", value: 24 },
    ],
  },
  {
    id: "increase",
    title: "زيادة بمقدار",
    story:
      "كان في الصندوق 80 كتاباً. أُضيفت زيادة بمقدار 25، ثم أُخذت 40. كم بقي؟",
    chips: [
      { id: "s3-a", label: "80", kind: "num", value: 80 },
      { id: "s3-b", label: "+", kind: "op", op: "+" },
      { id: "s3-c", label: "25", kind: "num", value: 25 },
      { id: "s3-d", label: "−", kind: "op", op: "−" },
      { id: "s3-e", label: "40", kind: "num", value: 40 },
    ],
  },
  {
    id: "per-item",
    title: "لكل",
    story:
      "دفعت 90 ريالاً ثمناً لـ 6 أقلام متساوية السعر. كم سعر القلم الواحد؟",
    chips: [
      { id: "s4-a", label: "90", kind: "num", value: 90 },
      { id: "s4-b", label: "÷", kind: "op", op: "÷" },
      { id: "s4-c", label: "6", kind: "num", value: 6 },
    ],
  },
];

type BuiltToken =
  | { kind: "num"; label: string; value: number }
  | { kind: "op"; label: string; op: Op };

function applyOp(left: number, op: Op, right: number): number | null {
  if (op === "+") return left + right;
  if (op === "−") return left - right;
  if (op === "×") return left * right;
  if (op === "÷") {
    if (right === 0) return null;
    return left / right;
  }
  return null;
}

function evalLeftToRight(tokens: BuiltToken[]): number | null {
  if (tokens.length === 0) return null;
  if (tokens[0].kind !== "num") return null;

  let total = tokens[0].value;
  let i = 1;
  while (i < tokens.length) {
    const opTok = tokens[i];
    const numTok = tokens[i + 1];
    if (!opTok || opTok.kind !== "op" || !numTok || numTok.kind !== "num") {
      return null;
    }
    const next = applyOp(total, opTok.op, numTok.value);
    if (next === null) return null;
    total = next;
    i += 2;
  }
  return total;
}

function formatTotal(value: number | null): string {
  if (value === null) return "—";
  if (Number.isInteger(value)) return String(value);
  return String(Math.round(value * 100) / 100);
}

export function WordArithLab({ onInteract, compact }: Props) {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const [built, setBuilt] = useState<BuiltToken[]>([]);
  const [usedIds, setUsedIds] = useState<string[]>([]);

  const scenario = useMemo(
    () => SCENARIOS.find((item) => item.id === scenarioId) ?? SCENARIOS[0],
    [scenarioId],
  );

  const fire = useCallback(() => onInteract?.(), [onInteract]);
  const runningTotal = evalLeftToRight(built);
  const expression = built.map((token) => token.label).join(" ") || "…";

  const resetBuild = () => {
    setBuilt([]);
    setUsedIds([]);
  };

  const chooseScenario = (id: string) => {
    setScenarioId(id);
    setBuilt([]);
    setUsedIds([]);
    fire();
  };

  const tapChip = (chip: TokenChip) => {
    if (usedIds.includes(chip.id)) return;

    const expectOp = built.length % 2 === 1;
    if (expectOp && chip.kind !== "op") return;
    if (!expectOp && chip.kind !== "num") return;

    const next: BuiltToken =
      chip.kind === "num"
        ? { kind: "num", label: chip.label, value: chip.value ?? 0 }
        : { kind: "op", label: chip.label, op: chip.op ?? "+" };

    setBuilt((current) => [...current, next]);
    setUsedIds((current) => [...current, chip.id]);
    fire();
  };

  const undo = () => {
    if (built.length === 0) return;
    setBuilt((current) => current.slice(0, -1));
    setUsedIds((current) => current.slice(0, -1));
    fire();
  };

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#ECFDF5] to-white ring-1 ring-emerald-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-emerald-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اضغط الرقائق بالترتيب لتبني العبارة من القصة.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          راقب المجموع الجاري بعد كل خطوة صحيحة في التسلسل.
        </p>
      </div>

      <div className="mt-4">
        <p className="text-center text-[11px] font-bold text-slate-500">
          قصص جاهزة
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {SCENARIOS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => chooseScenario(item.id)}
              className={`min-h-11 rounded-full px-3 text-xs font-bold ${
                scenarioId === item.id
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-100">
        <p className="text-[11px] font-bold text-emerald-700">{scenario.title}</p>
        <p className="mt-1 text-sm font-bold leading-relaxed text-ink">
          {scenario.story}
        </p>
      </div>

      <div className="mt-4 rounded-2xl bg-emerald-50 px-3 py-4 text-center ring-1 ring-emerald-100">
        <p className="text-[11px] font-bold text-emerald-800">العبارة</p>
        <p
          className="mt-1 text-xl font-black tabular-nums text-emerald-950"
          dir="ltr"
        >
          {expression}
        </p>
        <p className="mt-3 text-[11px] font-bold text-emerald-800">
          المجموع الجاري
        </p>
        <p
          className="mt-1 text-3xl font-black tabular-nums text-ink"
          dir="ltr"
        >
          {formatTotal(runningTotal)}
        </p>
      </div>

      <div className="mt-4">
        <p className="text-center text-[11px] font-bold text-slate-500">
          الرقائق
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {scenario.chips.map((chip) => {
            const used = usedIds.includes(chip.id);
            const expectOp = built.length % 2 === 1;
            const allowed =
              !used &&
              ((expectOp && chip.kind === "op") ||
                (!expectOp && chip.kind === "num"));
            return (
              <button
                key={chip.id}
                type="button"
                disabled={used}
                onClick={() => tapChip(chip)}
                className={`min-h-11 min-w-14 rounded-full px-3 text-xs font-bold tabular-nums transition-colors ${
                  used
                    ? "cursor-not-allowed bg-slate-100 text-slate-400"
                    : allowed
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "bg-white text-slate-500 ring-1 ring-slate-200"
                }`}
                dir="ltr"
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex justify-center gap-2">
        <button
          type="button"
          onClick={undo}
          className="min-h-11 rounded-full bg-white px-4 text-xs font-bold text-slate-700 ring-1 ring-slate-200"
        >
          تراجع
        </button>
        <button
          type="button"
          onClick={() => {
            resetBuild();
            fire();
          }}
          className="min-h-11 rounded-full bg-white px-4 text-xs font-bold text-slate-700 ring-1 ring-slate-200"
        >
          إعادة
        </button>
      </div>
    </div>
  );
}
