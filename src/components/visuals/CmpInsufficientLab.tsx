"use client";

import { useCallback, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type Scenario = {
  id: string;
  title: string;
  question: string;
  cards: string[];
  /** بعد كل بطاقة: هل يكفي للحسم؟ */
  enoughAfter: boolean[];
  /** الحكم النهائي إن وُجدت بيانات كافية */
  finalVerdict: string | null;
};

const SCENARIOS: Scenario[] = [
  {
    id: "ages",
    title: "عمران",
    question: "كمية أ = عمر أحمد · كمية ب = عمر خالد",
    cards: [
      "مجموع عمريهما 40 سنة.",
      "أحمد أكبر من خالد.",
      "أحمد يكبر خالد بـ 4 سنوات.",
    ],
    // المجموع وحده لا يكفي؛ «أكبر من» يكفي للحكم الاتجاهي
    enoughAfter: [false, true, true],
    finalVerdict: "كمية أ أكبر",
  },
  {
    id: "boxes",
    title: "صندوقان",
    question: "كمية أ = وزن الصندوق الأول · كمية ب = وزن الثاني",
    cards: [
      "الوزن الإجمالي 30 كغ.",
      "كلا الصندوقين أثقل من 10 كغ.",
      "لا معلومات أخرى عن الفرق.",
    ],
    enoughAfter: [false, false, false],
    finalVerdict: null,
  },
  {
    id: "scores",
    title: "درجتان",
    question: "كمية أ = درجة سارة · كمية ب = درجة نورة",
    cards: [
      "سارة حصلت على 18 من 20.",
      "نورة حصلت على 16 من 20.",
      "الاختبار نفسه للجميع.",
    ],
    // درجة واحدة لا تكفي؛ بعد درجتين يمكن الحسم
    enoughAfter: [false, true, true],
    finalVerdict: "كمية أ أكبر",
  },
  {
    id: "speeds",
    title: "سيارتان",
    question: "كمية أ = سرعة السيارة الأولى · كمية ب = سرعة الثانية",
    cards: [
      "كلاهما قطعتا نفس المسافة.",
      "الزمن غير معلوم لأي منهما.",
      "لا نسبة بين الزمنين.",
    ],
    enoughAfter: [false, false, false],
    finalVerdict: null,
  },
];

export function CmpInsufficientLab({ onInteract, compact }: Props) {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const fire = useCallback(() => onInteract?.(), [onInteract]);
  const scenario = SCENARIOS[scenarioIndex]!;
  const enough = revealed === 0 ? false : scenario.enoughAfter[revealed - 1]!;
  const canRevealMore = revealed < scenario.cards.length;

  const revealNext = () => {
    if (!canRevealMore) return;
    setRevealed((n) => n + 1);
    fire();
  };

  const resetCards = () => {
    setRevealed(0);
    fire();
  };

  const pickScenario = (index: number) => {
    setScenarioIndex(index);
    setRevealed(0);
    fire();
  };

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#FFF1F2] via-white to-slate-50 ring-1 ring-rose-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/95 px-3 py-2.5 ring-1 ring-rose-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اكشف بطاقات المعطيات واحدةً تلو الأخرى.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          بعد كل بطاقة: هل يكفي الحسم بين أ و ب؟ أم ما زال ناقصاً؟
        </p>
      </div>

      <div className="mt-4 rounded-2xl bg-slate-800 px-3 py-4 text-center text-white">
        <p className="text-[11px] font-bold text-rose-200">سيناريو · {scenario.title}</p>
        <p className="mt-2 text-sm font-bold leading-snug">{scenario.question}</p>
      </div>

      <div className="mt-3 space-y-2">
        {scenario.cards.map((card, index) => {
          const open = index < revealed;
          return (
            <div
              key={`${scenario.id}-${index}`}
              className={`rounded-2xl px-3 py-3 transition ${
                open
                  ? "bg-white ring-1 ring-rose-200"
                  : "bg-slate-100 ring-1 ring-slate-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black tabular-nums ${
                    open
                      ? "bg-rose-600 text-white"
                      : "bg-slate-300 text-slate-600"
                  }`}
                  dir="ltr"
                >
                  {index + 1}
                </span>
                <p
                  className={`pt-1.5 text-sm font-bold leading-snug ${
                    open ? "text-ink" : "text-slate-400"
                  }`}
                >
                  {open ? card : "بطاقة مغلقة — اكشف التالي"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className={`mt-3 rounded-2xl px-3 py-4 text-center ${
          revealed === 0
            ? "bg-slate-100 ring-1 ring-slate-200"
            : enough
              ? "bg-emerald-600 text-white"
              : "bg-rose-600 text-white"
        }`}
      >
        {revealed === 0 ? (
          <p className="text-sm font-bold text-slate-600">
            ابدأ بكشف البطاقة الأولى
          </p>
        ) : enough ? (
          <>
            <p className="text-[11px] font-bold text-emerald-100">الآن يمكن الحسم</p>
            <p className="mt-1 text-lg font-black">
              {scenario.finalVerdict ?? "يمكن المقارنة"}
            </p>
          </>
        ) : (
          <>
            <p className="text-[11px] font-bold text-rose-100">ما زال ناقصاً</p>
            <p className="mt-1 text-lg font-black">المعطيات غير كافية</p>
          </>
        )}
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={revealNext}
          disabled={!canRevealMore}
          className={`min-h-11 rounded-xl px-4 text-xs font-bold ${
            canRevealMore
              ? "bg-rose-700 text-white"
              : "bg-slate-200 text-slate-400"
          }`}
        >
          {canRevealMore ? "اكشف بطاقة" : "اكتملت البطاقات"}
        </button>
        <button
          type="button"
          onClick={resetCards}
          className="min-h-11 rounded-xl bg-white px-4 text-xs font-bold text-slate-700 ring-1 ring-slate-200"
        >
          أعد الإخفاء
        </button>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {SCENARIOS.map((item, index) => {
          const active = index === scenarioIndex;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => pickScenario(index)}
              className={`min-h-11 rounded-xl px-3 text-xs font-bold ${
                active
                  ? "bg-slate-800 text-white"
                  : "bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              {item.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}
