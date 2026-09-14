"use client";

import { useCallback, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type Bag = { red: number; blue: number };

const PRESETS: { label: string; bag: Bag }[] = [
  { label: "4 أحمر + 2 أزرق", bag: { red: 4, blue: 2 } },
  { label: "3 أحمر + 3 أزرق", bag: { red: 3, blue: 3 } },
  { label: "5 أحمر + 1 أزرق", bag: { red: 5, blue: 1 } },
];

export function ProbWithoutReplaceLab({ onInteract, compact }: Props) {
  const [start, setStart] = useState<Bag>({ red: 4, blue: 2 });
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [firstColor, setFirstColor] = useState<"red" | "blue" | null>(null);
  const [trapAsReplace, setTrapAsReplace] = useState(false);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const total0 = start.red + start.blue;
  const after: Bag =
    firstColor === null
      ? start
      : firstColor === "red"
        ? { red: start.red - 1, blue: start.blue }
        : { red: start.red, blue: start.blue - 1 };
  const total1 = after.red + after.blue;

  const trueSecondRed =
    firstColor === "red"
      ? `${start.red - 1} ÷ ${total0 - 1}`
      : firstColor === "blue"
        ? `${start.red} ÷ ${total0 - 1}`
        : "—";
  const trapSecondRed = `${start.red} ÷ ${total0}`;

  const resetDraw = () => {
    setStep(0);
    setFirstColor(null);
    fire();
  };

  const draw = (color: "red" | "blue") => {
    if (step !== 0) return;
    if (color === "red" && start.red <= 0) return;
    if (color === "blue" && start.blue <= 0) return;
    setFirstColor(color);
    setStep(1);
    fire();
  };

  const goSecond = () => {
    if (step === 1) {
      setStep(2);
      fire();
    }
  };

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#EEF2FF] to-white ring-1 ring-indigo-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-indigo-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اضغط كرة لسحبها أولاً (تُزال من الكيس)، ثم تابع للسحبة الثانية.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          لاحظ تحديث الأعداد بعد السحبة الأولى — بلا إرجاع.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <div className="rounded-2xl bg-indigo-50 px-3 py-2 text-center ring-1 ring-indigo-100">
          <p className="text-[10px] font-bold text-indigo-600">قبل السحب</p>
          <p className="text-sm font-black text-indigo-950">
            أحمر{" "}
            <span dir="ltr" className="tabular-nums">
              {start.red}
            </span>{" "}
            · أزرق{" "}
            <span dir="ltr" className="tabular-nums">
              {start.blue}
            </span>{" "}
            · كلي{" "}
            <span dir="ltr" className="tabular-nums">
              {total0}
            </span>
          </p>
        </div>
        {step >= 1 && (
          <div className="rounded-2xl bg-rose-50 px-3 py-2 text-center ring-1 ring-rose-100">
            <p className="text-[10px] font-bold text-rose-600">
              بعد السحبة الأولى
            </p>
            <p className="text-sm font-black text-rose-950">
              أحمر{" "}
              <span dir="ltr" className="tabular-nums">
                {after.red}
              </span>{" "}
              · أزرق{" "}
              <span dir="ltr" className="tabular-nums">
                {after.blue}
              </span>{" "}
              · كلي{" "}
              <span dir="ltr" className="tabular-nums">
                {total1}
              </span>
            </p>
          </div>
        )}
      </div>

      <div
        className="mt-4 flex min-h-28 flex-wrap items-center justify-center gap-2 rounded-3xl bg-indigo-50/70 p-4 ring-1 ring-indigo-100"
        aria-label="كيس السحب"
      >
        {step === 0 &&
          Array.from({ length: start.red }).map((_, i) => (
            <button
              key={`r-${i}`}
              type="button"
              onClick={() => draw("red")}
              className="h-11 w-11 rounded-full bg-rose-500 shadow-sm ring-2 ring-white active:scale-95"
              aria-label="سحب أحمر"
            />
          ))}
        {step === 0 &&
          Array.from({ length: start.blue }).map((_, i) => (
            <button
              key={`b-${i}`}
              type="button"
              onClick={() => draw("blue")}
              className="h-11 w-11 rounded-full bg-indigo-500 shadow-sm ring-2 ring-white active:scale-95"
              aria-label="سحب أزرق"
            />
          ))}
        {step >= 1 &&
          Array.from({ length: after.red }).map((_, i) => (
            <span
              key={`ar-${i}`}
              className="h-11 w-11 rounded-full bg-rose-400 ring-2 ring-white"
            />
          ))}
        {step >= 1 &&
          Array.from({ length: after.blue }).map((_, i) => (
            <span
              key={`ab-${i}`}
              className="h-11 w-11 rounded-full bg-indigo-400 ring-2 ring-white"
            />
          ))}
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {step === 0 && (
          <p className="w-full text-center text-xs font-bold text-slate-500">
            الخطوة 1: اختر لون السحبة الأولى
          </p>
        )}
        {step === 1 && (
          <button
            type="button"
            onClick={goSecond}
            className="min-h-11 rounded-full bg-indigo-600 px-4 text-xs font-bold text-white"
          >
            اعرض احتمال السحبة الثانية
          </button>
        )}
        {step >= 1 && (
          <button
            type="button"
            onClick={resetDraw}
            className="min-h-11 rounded-full bg-white px-4 text-xs font-bold text-slate-700 ring-1 ring-slate-200"
          >
            أعد السحب
          </button>
        )}
      </div>

      {step === 2 && firstColor && (
        <div className="mt-4 space-y-2">
          <div className="rounded-2xl bg-indigo-600 px-3 py-3 text-center text-white">
            <p className="text-[11px] font-bold text-indigo-100">
              احتمال أحمر في السحبة الثانية (بلا إرجاع)
            </p>
            <p className="mt-1 text-xl font-black tabular-nums" dir="ltr">
              {trueSecondRed}
            </p>
          </div>
          {trapAsReplace && (
            <div className="rounded-2xl bg-rose-600 px-3 py-3 text-center text-white">
              <p className="text-[11px] font-bold text-rose-100">
                مصيدة: كأنّه بإرجاع
              </p>
              <p className="mt-1 text-xl font-black tabular-nums" dir="ltr">
                {trapSecondRed}
              </p>
              <p className="mt-1 text-[11px] text-rose-50">
                المقام لم ينقص — وهذا خطأ هنا
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 flex justify-center">
        <button
          type="button"
          onClick={() => {
            setTrapAsReplace((v) => !v);
            fire();
          }}
          className={`min-h-11 rounded-full px-4 text-xs font-bold ${
            trapAsReplace
              ? "bg-rose-600 text-white"
              : "bg-white text-rose-700 ring-1 ring-rose-200"
          }`}
        >
          {trapAsReplace ? "إخفاء مصيدة الإرجاع" : "أظهر المصيدة: كأنّه بإرجاع"}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {PRESETS.map((preset) => {
          const active =
            preset.bag.red === start.red && preset.bag.blue === start.blue;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setStart(preset.bag);
                setStep(0);
                setFirstColor(null);
                fire();
              }}
              className={`min-h-11 rounded-full px-3 text-xs font-bold ${
                active
                  ? "bg-indigo-700 text-white"
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
