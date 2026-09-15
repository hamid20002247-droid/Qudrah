"use client";

import { MathText } from "@/components/ui/MathText";

type Props = {
  choices: string[];
  selected: number | null;
  correctIndex?: number;
  showResult?: boolean;
  /** When false, wrong answers only mark the chosen option — don't reveal the key. */
  revealCorrect?: boolean;
  disabled?: boolean;
  onSelect: (index: number) => void;
};

export function ChoiceList({
  choices,
  selected,
  correctIndex,
  showResult,
  revealCorrect = true,
  disabled,
  onSelect,
}: Props) {
  return (
    <div className="flex flex-col gap-3 pb-2" role="listbox">
      {choices.map((c, i) => {
        let styles =
          "bg-white text-ink ring-1 ring-slate-200 hover:ring-teal-300 active:scale-[0.99]";
        let badge =
          "bg-slate-100 text-slate-600";

        if (showResult && correctIndex !== undefined && selected !== null) {
          const isCorrectChoice = i === correctIndex;
          const isChosen = i === selected;
          const chosenOk = selected === correctIndex;

          if (revealCorrect) {
            if (isCorrectChoice) {
              styles = "bg-green-50 text-green-900 ring-2 ring-green-500";
              badge = "bg-green-500 text-white";
            } else if (isChosen) {
              styles = "bg-red-50 text-red-900 ring-2 ring-red-500";
              badge = "bg-red-500 text-white";
            } else {
              styles = "bg-white text-slate-500 ring-1 ring-slate-100";
            }
          } else {
            if (isChosen && chosenOk) {
              styles = "bg-green-50 text-green-900 ring-2 ring-green-500";
              badge = "bg-green-500 text-white";
            } else if (isChosen && !chosenOk) {
              styles = "bg-red-50 text-red-900 ring-2 ring-red-500";
              badge = "bg-red-500 text-white";
            } else {
              styles = "bg-white text-slate-500 ring-1 ring-slate-100";
            }
          }
        } else if (selected === i) {
          styles = "bg-teal-50 text-teal-950 ring-2 ring-teal-500";
          badge = "bg-teal-600 text-white";
        }

        return (
          <button
            key={i}
            type="button"
            disabled={disabled || showResult}
            onClick={() => onSelect(i)}
            className={`flex min-h-[52px] w-full scroll-mb-[7.5rem] items-center gap-3 rounded-2xl px-4 py-3.5 text-start text-[17px] font-semibold transition ${styles} disabled:cursor-default`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums ${badge}`}
            >
              {i + 1}
            </span>
            <span className="leading-snug">
              <MathText text={c} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
