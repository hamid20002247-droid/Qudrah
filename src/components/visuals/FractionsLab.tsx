"use client";

import { useCallback, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type Fraction = {
  numerator: number;
  denominator: number;
  label: string;
};

const TOTAL = 1200;

const FIRST_PRESETS: Fraction[] = [
  { numerator: 1, denominator: 2, label: "1/2" },
  { numerator: 1, denominator: 3, label: "1/3" },
  { numerator: 1, denominator: 4, label: "1/4" },
  { numerator: 2, denominator: 5, label: "2/5" },
  { numerator: 3, denominator: 4, label: "3/4" },
];

const SECOND_PRESETS: Fraction[] = [
  { numerator: 1, denominator: 2, label: "1/2" },
  { numerator: 1, denominator: 3, label: "1/3" },
  { numerator: 1, denominator: 4, label: "1/4" },
  { numerator: 2, denominator: 5, label: "2/5" },
];

function amountOf(quantity: number, fraction: Fraction) {
  return (quantity / fraction.denominator) * fraction.numerator;
}

export function FractionsLab({ onInteract, compact }: Props) {
  const [first, setFirst] = useState(FIRST_PRESETS[1]);
  const [second, setSecond] = useState<Fraction | null>(null);

  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const firstTaken = amountOf(TOTAL, first);
  const afterFirst = TOTAL - firstTaken;
  const secondTaken = second ? amountOf(afterFirst, second) : 0;
  const remainder = afterFirst - secondTaken;

  const firstWidth = (firstTaken / TOTAL) * 100;
  const secondWidth = (secondTaken / TOTAL) * 100;
  const remainderWidth = (remainder / TOTAL) * 100;

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#F0FDFA] to-white ring-1 ring-teal-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-teal-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اضغط كسراً للأخذ الأول، ثم أضف أخذاً ثانياً إن أردت.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          راقب الجزء المأخوذ والباقي بعد كل خطوة.
        </p>
      </div>

      <div className="mt-5 text-center">
        <p className="text-[11px] font-bold text-slate-500">الكمية كلها</p>
        <p className="text-3xl font-black tabular-nums text-ink" dir="ltr">
          {TOTAL}
        </p>
      </div>

      <div
        className={`mt-4 flex w-full overflow-hidden rounded-2xl ring-2 ring-slate-200 ${
          compact ? "h-20" : "h-24"
        }`}
        dir="ltr"
        aria-label={`أُخذ أولاً ${firstTaken}، وأُخذ ثانياً ${secondTaken}، والباقي ${remainder}`}
      >
        <BarPart
          width={firstWidth}
          value={firstTaken}
          label="الأول"
          className="bg-teal-500 text-white"
        />
        {second && (
          <BarPart
            width={secondWidth}
            value={secondTaken}
            label="الثاني"
            className="bg-amber-400 text-amber-950"
          />
        )}
        <BarPart
          width={remainderWidth}
          value={remainder}
          label="الباقي"
          className="bg-slate-100 text-slate-800"
        />
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-100">
        <CalculationLine
          label="الأخذ الأول"
          calculation={`${TOTAL} ÷ ${first.denominator} × ${first.numerator} = ${firstTaken}`}
          tone="text-teal-800"
        />
        <CalculationLine
          label="بعد الأخذ الأول"
          calculation={`${TOTAL} − ${firstTaken} = ${afterFirst}`}
          tone="text-slate-700"
        />
        {second && (
          <>
            <CalculationLine
              label="الأخذ الثاني من الباقي"
              calculation={`${afterFirst} ÷ ${second.denominator} × ${second.numerator} = ${secondTaken}`}
              tone="text-amber-800"
            />
            <CalculationLine
              label="الباقي النهائي"
              calculation={`${afterFirst} − ${secondTaken} = ${remainder}`}
              tone="text-slate-900"
            />
          </>
        )}
      </div>

      <PresetGroup
        label="الأخذ الأول من الكمية كلها"
        presets={FIRST_PRESETS}
        selected={first}
        onSelect={(fraction) => {
          setFirst(fraction);
          fire();
        }}
        activeClassName="bg-teal-700 text-white"
      />

      <button
        type="button"
        onClick={() => {
          setSecond((current) => (current ? null : SECOND_PRESETS[2]));
          fire();
        }}
        className={`mt-4 flex min-h-11 w-full items-center justify-center rounded-xl text-sm font-bold ring-1 ${
          second
            ? "bg-rose-50 text-rose-800 ring-rose-100"
            : "bg-amber-50 text-amber-900 ring-amber-200"
        }`}
      >
        {second ? "احذف الأخذ الثاني" : "أضف أخذاً ثانياً من الباقي"}
      </button>

      {second && (
        <PresetGroup
          label="الأخذ الثاني من الباقي"
          presets={SECOND_PRESETS}
          selected={second}
          onSelect={(fraction) => {
            setSecond(fraction);
            fire();
          }}
          activeClassName="bg-amber-500 text-amber-950"
        />
      )}
    </div>
  );
}

function BarPart({
  width,
  value,
  label,
  className,
}: {
  width: number;
  value: number;
  label: string;
  className: string;
}) {
  return (
    <div
      className={`flex min-w-0 flex-col items-center justify-center transition-[width] duration-300 ${className}`}
      style={{ width: `${width}%` }}
    >
      <span className="text-[10px] font-bold opacity-75">{label}</span>
      <span className="text-sm font-black tabular-nums" dir="ltr">
        {value}
      </span>
    </div>
  );
}

function CalculationLine({
  label,
  calculation,
  tone,
}: {
  label: string;
  calculation: string;
  tone: string;
}) {
  return (
    <div className="flex min-h-9 items-center justify-between gap-3 border-b border-slate-100 py-2 last:border-b-0">
      <span className="text-[11px] font-bold text-slate-500">{label}</span>
      <span className={`text-sm font-black tabular-nums ${tone}`} dir="ltr">
        {calculation}
      </span>
    </div>
  );
}

function PresetGroup({
  label,
  presets,
  selected,
  onSelect,
  activeClassName,
}: {
  label: string;
  presets: Fraction[];
  selected: Fraction;
  onSelect: (fraction: Fraction) => void;
  activeClassName: string;
}) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-center text-[11px] font-bold text-slate-500">
        {label}
      </p>
      <div className="flex flex-wrap justify-center gap-2" dir="ltr">
        {presets.map((fraction) => {
          const active =
            selected.numerator === fraction.numerator &&
            selected.denominator === fraction.denominator;

          return (
            <button
              key={fraction.label}
              type="button"
              onClick={() => onSelect(fraction)}
              className={`min-h-11 min-w-12 rounded-full px-3 text-sm font-black tabular-nums ${
                active
                  ? activeClassName
                  : "bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
              dir="ltr"
            >
              {fraction.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
