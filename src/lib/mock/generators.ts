import type { Difficulty, Question, SubPattern } from "@/lib/types";
import { mulberry32, pick, pickPrefer, randInt, shuffle, type Rng } from "./rng";
import { genQuduratHard, isCleanGenQ } from "./quduratHard";

const META = {
  source: "qudrah-generated-full-kami-bank-2026-v4-qudurat",
  review_status: "approved" as const,
  reviewed_by: "generator",
  reviewed_at: "2026-09-23T12:00:00.000Z",
};

export type GenQ = Question & { fingerprint: string };

function pct(n: number): string {
  return `${Math.round(n)}٪`;
}

function num(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return String(Math.round(n * 100) / 100);
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function simplifyFrac(n: number, d: number): string {
  const g = gcd(n, d);
  return `${n / g}/${d / g}`;
}

type ChoiceItem = { value: string; note: string | null };

/**
 * Build 4 unique choices with notes glued to trap values
 * so shuffle never mis-labels explanations.
 */
function buildChoices(
  rng: Rng,
  correct: string,
  traps: string[],
  trapNotes?: string[]
): { choices_ar: string[]; correct_index: number; notes: (string | null)[] } {
  const items: ChoiceItem[] = [{ value: correct, note: null }];
  traps.forEach((t, i) => {
    if (!t || t === correct) return;
    if (items.some((x) => x.value === t)) return;
    items.push({
      value: t,
      note: trapNotes?.[i] ?? "خيار شائع لكنه غير صحيح لهذا السؤال.",
    });
  });
  let guard = 0;
  while (items.length < 4 && guard < 16) {
    const filler = String(randInt(rng, 2, 220));
    if (!items.some((x) => x.value === filler)) {
      items.push({
        value: filler,
        note: "رقم قريب يُختار بالتخمين دون خطوات صحيحة.",
      });
    }
    guard++;
  }
  const four = shuffle(rng, items.slice(0, 4));
  return {
    choices_ar: four.map((x) => x.value),
    correct_index: four.findIndex((x) => x.value === correct),
    notes: four.map((x) => x.note),
  };
}

function makeQ(
  id: string,
  fingerprint: string,
  prompt_ar: string,
  correct: string,
  traps: string[],
  solve_ar: string,
  sub_pattern: SubPattern,
  difficulty: Difficulty,
  rng: Rng,
  trapNotes?: string[]
): GenQ {
  const { choices_ar, correct_index, notes } = buildChoices(
    rng,
    correct,
    traps,
    trapNotes
  );
  const trap_explanations_ar: Record<number, string> = {};
  notes.forEach((note, i) => {
    if (i !== correct_index && note) trap_explanations_ar[i] = note;
  });
  // Guarantee correct_index is valid
  const safeIndex =
    correct_index >= 0 ? correct_index : choices_ar.indexOf(correct);
  return {
    id,
    fingerprint,
    prompt_ar,
    choices_ar,
    correct_index: safeIndex < 0 ? 0 : safeIndex,
    trap_explanations_ar,
    solve_ar,
    difficulty,
    sub_pattern,
    ...META,
  };
}

// ─── حساب — معظمها متوسط/صعب متعدد الخطوات ───────────────

/** نسبة الزيادة — غالباً مع خطوة وسيطة (لا سؤال مباشر فقط) */
function genPercentUp(rng: Rng, seq: number): GenQ {
  const base = randInt(rng, 80, 360) * 5;
  const p = pick(rng, [12, 15, 16, 20, 25, 30, 35, 40]);
  const neu = Math.round(base * (1 + p / 100));
  const wrongNew = Math.round(((neu - base) / neu) * 100);
  // Multi-step: ask increase amount then imply %, or two prices
  if (rng() > 0.4) {
    const extra = randInt(rng, 2, 9) * 5;
    const paid = neu + extra;
    return makeQ(
      `g-pct-up2-${seq}`,
      `pct-up2:${base}:${p}:${extra}`,
      `سلعة كان سعرها ${base} ريالاً فارتفع بنسبة ${p}٪، ثم دُفعت رسوم توصيل ${extra}. كم المبلغ الكلي المدفوع؟`,
      num(paid),
      [
        num(neu),
        num(base + extra),
        num(Math.round(base * (1 + p / 100) - extra)),
      ],
      `بعد الزيادة: ${base}×(1+${p}/100)=${neu}. الكلي مع الرسوم = ${neu}+${extra}=${paid}.`,
      "percent",
      "hard",
      rng,
      [
        "نسيت إضافة رسوم التوصيل.",
        "أضفت الرسوم على السعر الأصلي قبل الزيادة.",
        "طرحت الرسوم بدل إضافتها.",
      ]
    );
  }
  return makeQ(
    `g-pct-up-${seq}`,
    `pct-up:${base}:${p}`,
    `ارتفع سعر سلعة من ${base} إلى ${neu} ريالاً. نسبة الزيادة؟`,
    pct(p),
    [
      pct(wrongNew),
      pct(p + 5),
      pct(Math.round(((neu - base) / ((base + neu) / 2)) * 100)),
    ],
    `الزيادة = ${neu - base}. النسبة = الزيادة ÷ الأصل = ${neu - base} ÷ ${base} = ${p}٪.`,
    "percent",
    "mid",
    rng,
    [
      "قسّمت على الرقم الجديد بدل الأصل.",
      "زدت النسبة تقديرياً.",
      "استخدمت متوسط القيمين كمقام.",
    ]
  );
}

/** إيجاد الأصل بعد نسبة — عكس الاتجاه */
function genPercentFindBase(rng: Rng, seq: number): GenQ {
  const p = pick(rng, [20, 25, 30, 40]);
  const neu = randInt(rng, 24, 80) * 5;
  const base = Math.round(neu / (1 + p / 100));
  // ensure clean
  const check = Math.round(base * (1 + p / 100));
  if (check !== neu) {
    // force clean: pick base first
    const b2 = randInt(rng, 40, 200) * 5;
    const n2 = Math.round(b2 * (1 + p / 100));
    return makeQ(
      `g-pct-base-${seq}`,
      `pct-base:${b2}:${p}`,
      `زاد السعر بنسبة ${p}٪ فأصبح ${n2}. ما السعر الأصلي؟`,
      num(b2),
      [num(n2 - Math.round((n2 * p) / 100)), num(Math.round(n2 * (1 - p / 100))), num(n2)],
      `الأصل × (1 + ${p}/100) = ${n2} ⇒ الأصل = ${n2} ÷ ${1 + p / 100} = ${b2}.`,
      "percent",
      "hard",
      rng,
      ["طرحت النسبة من السعر الجديد مباشرة.", "ضربت بعامل النقص بدل القسمة.", "أخذت السعر الجديد كما هو."]
    );
  }
  return makeQ(
    `g-pct-base-${seq}`,
    `pct-base:${base}:${p}`,
    `زاد السعر بنسبة ${p}٪ فأصبح ${neu}. ما السعر الأصلي؟`,
    num(base),
    [num(neu - Math.round((neu * p) / 100)), num(Math.round(neu * (1 - p / 100))), num(neu)],
    `الأصل = ${neu} ÷ (1+${p}/100) = ${base}.`,
    "percent",
    "hard",
    rng,
    ["طرحت النسبة من الجديد.", "طبّقت عامل نقص على الجديد.", "ظننت أن الجديد هو الأصل."]
  );
}

/** نسبة من نسبة — مركب */
function genPercentOfPercent(rng: Rng, seq: number): GenQ {
  const base = randInt(rng, 20, 100) * 10;
  const p1 = pick(rng, [20, 25, 40, 50]);
  const p2 = pick(rng, [10, 20, 25, 40]);
  const part = Math.round((base * p1) / 100);
  const ans = Math.round((part * p2) / 100);
  return makeQ(
    `g-pct-ofp-${seq}`,
    `pct-ofp:${base}:${p1}:${p2}`,
    `ما قيمة ${p2}٪ من ${p1}٪ من ${base}؟`,
    num(ans),
    [num(Math.round((base * (p1 + p2)) / 100)), num(Math.round((base * p1 * p2) / 100)), num(part)],
    `أولاً ${p1}٪ من ${base} = ${part}. ثم ${p2}٪ من ${part} = ${ans}.`,
    "percent",
    "hard",
    rng,
    ["جمعت النسبتين ثم طبّقت على الأصل.", "ضربت النسبتين في الأصل دون ÷100 مرتين.", "توقفت عند الخطوة الأولى."]
  );
}

function genPercentDown(rng: Rng, seq: number): GenQ {
  const base = randInt(rng, 80, 480) * 4;
  const p = pick(rng, [10, 15, 20, 25, 30, 40]);
  const neu = Math.round(base * (1 - p / 100));
  const wrongNew = Math.round(((base - neu) / neu) * 100);
  if (rng() > 0.45) {
    // two successive discounts — classic trap
    const p2 = pick(rng, [10, 15, 20, 25].filter((x) => x !== p));
    const after = Math.round(neu * (1 - p2 / 100));
    const naive = Math.round(base * (1 - (p + p2) / 100));
    return makeQ(
      `g-pct-dn2-${seq}`,
      `pct-dn2:${base}:${p}:${p2}`,
      `سعر ${base} خُفض بنسبة ${p}٪ ثم بنسبة ${p2}٪ إضافية على السعر بعد الخصم الأول. السعر النهائي؟`,
      num(after),
      [num(naive), num(neu), num(base - Math.round((base * (p + p2)) / 100))],
      `بعد الخصم الأول: ${neu}. ثم ×(1−${p2}/100)=${after}. لا تُجمع النسبتان (${naive}).`,
      "percent",
      "hard",
      rng,
      [
        "جمعت نسبتي الخصم وطبّقتهما مرة واحدة على الأصل.",
        "حسبت الخصم الأول فقط.",
        "طرحت مجموع النسب من الأصل كمبالغ ثابتة.",
      ]
    );
  }
  return makeQ(
    `g-pct-dn-${seq}`,
    `pct-dn:${base}:${p}`,
    `انخفض سعر من ${base} إلى ${neu}. نسبة النقص؟`,
    pct(p),
    [pct(wrongNew), pct(p + 5), pct(100 - p)],
    `النقص = ${base - neu}. النسبة ÷ الأصل ${base} = ${p}٪.`,
    "percent",
    "mid",
    rng,
    [
      "قسّمت على السعر بعد النقص.",
      "زدت النسبة.",
      "حسبت ما تبقى بدل نسبة النقص.",
    ]
  );
}

/** زيادة ثم نقص — مصيدة «يلغي بعض» */
function genSuccessive(rng: Rng, seq: number): GenQ {
  const base = randInt(rng, 20, 120) * 10;
  const a = pick(rng, [10, 20, 25, 30]);
  const b = pick(rng, [10, 20, 25, 30]);
  const upFirst = rng() > 0.45;
  const result = upFirst
    ? Math.round(base * (1 + a / 100) * (1 - b / 100))
    : Math.round(base * (1 - a / 100) * (1 + b / 100));
  const naive = Math.round(base * (1 + (upFirst ? a - b : b - a) / 100));
  const prompt = upFirst
    ? `عدد يساوي ${base} زاد بنسبة ${a}٪ ثم نقص بنسبة ${b}٪. ما الناتج النهائي؟`
    : `عدد يساوي ${base} نقص بنسبة ${a}٪ ثم زاد بنسبة ${b}٪. ما الناتج النهائي؟`;
  return makeQ(
    `g-suc-${seq}`,
    `suc:${base}:${a}:${b}:${upFirst ? 1 : 0}`,
    prompt,
    num(result),
    [num(base), num(naive), num(Math.round(base * (1 + a / 100)))],
    `المعاملات تتضاعف ولا تُطرح. الناتج = ${result} (وليس ${naive}).`,
    "successive",
    a === b ? "hard" : "mid",
    rng,
    ["ظننت أن الزيادة والنقص بنفس النسبة يعيدان الأصل.", "طرحت النسبتين ثم طبّقت مرة واحدة.", "حسبت الخطوة الأولى فقط."]
  );
}

/** نسبة صافية بعد عمليتين متتاليتين */
function genSuccessiveNet(rng: Rng, seq: number): GenQ {
  const a = pick(rng, [20, 25, 30]);
  const b = pick(rng, [10, 20, 25]);
  const factor = (1 + a / 100) * (1 - b / 100);
  const net = Math.round((factor - 1) * 1000) / 10;
  const netStr = Number.isInteger(net) ? pct(net) : `${net}٪`;
  const trapCancel = a === b ? pct(0) : pct(a - b);
  return makeQ(
    `g-suc-net-${seq}`,
    `suc-net:${a}:${b}`,
    `زاد عدد بنسبة ${a}٪ ثم نقص بنسبة ${b}٪. نسبة التغيّر الصافي تقريباً؟`,
    netStr,
    [trapCancel, pct(a), pct(-b)],
    `العامل = 1.${String(a).padStart(2, "0")} × 0.${100 - b} = ${factor.toFixed(4)}. التغيّر ≈ ${netStr}.`,
    "successive",
    "hard",
    rng,
    ["طرحت النسبتين مباشرة.", "أخذت نسبة الزيادة فقط.", "أخذت نسبة النقص فقط."]
  );
}

function genRatioSplit(rng: Rng, seq: number): GenQ {
  const r1 = randInt(rng, 2, 7);
  let r2 = randInt(rng, 2, 8);
  if (r2 === r1) r2 += 1;
  const parts = r1 + r2;
  const unit = randInt(rng, 6, 30);
  const total = parts * unit;
  const small = Math.min(r1, r2) * unit;
  const large = Math.max(r1, r2) * unit;
  const diff = large - small;
  const mode = pick(rng, ["small", "large", "diff"] as const);
  if (mode === "diff") {
    return makeQ(
      `g-ratio-d-${seq}`,
      `ratio-d:${total}:${r1}:${r2}`,
      `قُسّم مبلغ ${total} بنسبة ${r1}:${r2}. ما الفرق بين النصيبين؟`,
      num(diff),
      [num(small), num(large), num(unit)],
      `الجزء الواحد = ${unit}. الفرق = |${r1}-${r2}| × ${unit} = ${diff}.`,
      "ratio",
      "mid",
      rng
    );
  }
  const askSmall = mode === "small";
  return makeQ(
    `g-ratio-${seq}`,
    `ratio:${total}:${r1}:${r2}:${askSmall ? 0 : 1}`,
    askSmall
      ? `قُسّم ${total} بنسبة ${r1}:${r2}. نصيب الأصغر؟`
      : `قُسّم ${total} بنسبة ${r1}:${r2}. نصيب الأكبر؟`,
    num(askSmall ? small : large),
    [num(askSmall ? large : small), num(total / 2), num(unit)],
    `مجموع الأجزاء ${parts}. الجزء = ${unit}. المطلوب = ${askSmall ? small : large}.`,
    "ratio",
    "mid",
    rng
  );
}

/** نسبة ثلاثية */
function genRatioThree(rng: Rng, seq: number): GenQ {
  const a = randInt(rng, 2, 5);
  const b = randInt(rng, 2, 6);
  const c = randInt(rng, 2, 6);
  const unit = randInt(rng, 4, 15);
  const total = (a + b + c) * unit;
  const ask = pick(rng, [0, 1, 2] as const);
  const shares = [a * unit, b * unit, c * unit];
  const labels = ["الأول", "الثاني", "الثالث"];
  return makeQ(
    `g-ratio3-${seq}`,
    `ratio3:${total}:${a}:${b}:${c}:${ask}`,
    `قُسّم ${total} بنسبة ${a}:${b}:${c}. نصيب ${labels[ask]}؟`,
    num(shares[ask]!),
    [num(shares[(ask + 1) % 3]!), num(unit), num(total / 3)],
    `مجموع الأجزاء ${a + b + c}. الجزء = ${unit}. نصيب ${labels[ask]} = ${shares[ask]}.`,
    "ratio",
    "hard",
    rng
  );
}

/** تناسب عكسي — عمال/أيام */
function genInverseWork(rng: Rng, seq: number): GenQ {
  const w1 = pick(rng, [2, 3, 4, 5, 6]);
  const d1 = pick(rng, [6, 8, 9, 10, 12, 15]);
  const w2 = pickPrefer(
    rng,
    [w1 * 2, w1 * 3, w1 + 2].filter((x) => x !== w1 && x > 0),
    [w1 * 2]
  );
  const work = w1 * d1;
  const d2 = work / w2;
  if (!Number.isInteger(d2)) {
    // force integer
    const w2b = pickPrefer(
      rng,
      [2, 3, 4, 5, 6].filter((x) => work % x === 0 && x !== w1),
      [w1]
    );
    const d2b = work / w2b;
    if (!Number.isInteger(d2b) || w2b === w1) {
      return makeQ(
        `g-inv-${seq}`,
        `inv:4:12:6`,
        `4 عمال ينجزون عملاً في 12 يوماً. كم يوماً يحتاج 6 عمال لنفس العمل؟`,
        num(8),
        [num(18), num(9), num(6)],
        `1) كمية العمل = 4×12 = 48. 2) الأيام مع 6 عمال = 48÷6 = 8. 3) الإجابة = 8.`,
        "ratio",
        "hard",
        rng
      );
    }
    return makeQ(
      `g-work-${seq}`,
      `work:${w1}:${d1}:${w2b}`,
      `إذا أنجز ${w1} عمال عملاً في ${d1} أيام، فكم يوماً يحتاج ${w2b} عمال لإنجاز العمل نفسه (بنفس الكفاءة)؟`,
      num(d2b),
      [num(d1), num(Math.round((d1 * w2b) / w1)), num(w1 * d1)],
      `العمل ثابت = ${w1}×${d1} = ${work} يوم-عامل. الزمن = ${work}÷${w2b} = ${d2b}.`,
      "ratio",
      "hard",
      rng,
      ["ظننت التناسب طردياً.", "ضربت بدل القسمة.", "خلطت عدد العمال بالأيام."]
    );
  }
  return makeQ(
    `g-work-${seq}`,
    `work:${w1}:${d1}:${w2}`,
    `إذا أنجز ${w1} عمال عملاً في ${d1} أيام، فكم يوماً يحتاج ${w2} عمال لإنجاز العمل نفسه (بنفس الكفاءة)؟`,
    num(d2),
    [num(d1), num(Math.round((d1 * w2) / w1)), num(work)],
    `يوم-عامل = ${work}. الزمن = ${work}÷${w2} = ${d2}.`,
    "ratio",
    "hard",
    rng,
    ["تناسب طردي بالخطأ.", "ضربت الأعداد.", "أخذت حاصل يوم-عامل كإجابة."]
  );
}

/** متوسط مع عدد ناقص */
function genAverageMissing(rng: Rng, seq: number): GenQ {
  const n = pick(rng, [4, 5, 6]);
  const avg = randInt(rng, 12, 40);
  const sum = avg * n;
  const known = Array.from({ length: n - 1 }, () => randInt(rng, avg - 8, avg + 12));
  const knownSum = known.reduce((a, b) => a + b, 0);
  const missing = sum - knownSum;
  return makeQ(
    `g-avg-miss-${seq}`,
    `avg-miss:${avg}:${n}:${known.join("-")}`,
    `متوسط ${n} أعداد يساوي ${avg}. إذا كانت ${n - 1} منها: ${known.join("، ")}، فما العدد الناقص؟`,
    num(missing),
    [num(avg), num(sum - known[0]!), num(Math.round(knownSum / (n - 1)))],
    `المجموع الكلي = ${avg}×${n} = ${sum}. الناقص = ${sum} − ${knownSum} = ${missing}.`,
    "average",
    "hard",
    rng,
    ["أخذت المتوسط نفسه.", "نقصت عدداً واحداً فقط من المجموع.", "أخذت متوسط الأعداد المعروفة."]
  );
}

/** إضافة قيمة تغيّر المتوسط */
function genAverageShift(rng: Rng, seq: number): GenQ {
  const n = pick(rng, [4, 5]);
  const avg1 = randInt(rng, 10, 25);
  const avg2 = avg1 + pick(rng, [2, 3, 4, 5]);
  const added = avg2 * (n + 1) - avg1 * n;
  return makeQ(
    `g-avg-sh-${seq}`,
    `avg-sh:${n}:${avg1}:${avg2}`,
    `متوسط ${n} أعداد هو ${avg1}. أُضيف عدد فصار المتوسط ${avg2}. ما العدد المضاف؟`,
    num(added),
    [num(avg2), num(avg2 - avg1), num(avg1 * n)],
    `مجموع الأول = ${avg1 * n}. مجموع بعد الإضافة = ${avg2 * (n + 1)}. المضاف = ${added}.`,
    "average",
    "hard",
    rng,
    ["أخذت المتوسط الجديد.", "أخذت فرق المتوسطين فقط.", "أخذت المجموع القديم."]
  );
}

function genAverage(rng: Rng, seq: number): GenQ {
  if (rng() > 0.35) return genAverageMissing(rng, seq);
  return genAverageShift(rng, seq);
}

function genBuySell(rng: Rng, seq: number): GenQ {
  if (rng() > 0.4) return genBuySellPair(rng, seq);
  const cost = randInt(rng, 40, 120) * 5;
  const markup = pick(rng, [20, 25, 30, 40]);
  const discount = pick(rng, [10, 15, 20, 25]);
  const listed = Math.round(cost * (1 + markup / 100));
  const paid = Math.round(listed * (1 - discount / 100));
  const profit = paid - cost;
  const ask = pick(rng, ["paid", "profit"] as const);
  if (ask === "profit") {
    return makeQ(
      `g-bs-mp-${seq}`,
      `bs-mp:${cost}:${markup}:${discount}`,
      `تكلفة سلعة ${cost}. وُضعت للبيع بربح ${markup}٪ ثم خُفض السعر بخصم ${discount}٪ من سعر البيع. صافي الربح؟`,
      num(profit),
      [
        num(listed - cost),
        num(paid),
        num(Math.round(cost * (markup - discount) / 100)),
      ],
      `سعر العرض = ${listed}. بعد الخصم يدفع ${paid}. الربح = ${paid}−${cost}=${profit}.`,
      "buy_sell",
      "hard",
      rng,
      [
        "حسبت الربح قبل الخصم.",
        "أجبت بالسعر المدفوع بدل الربح.",
        "طرحت نسبتي الربح والخصم من التكلفة مباشرة.",
      ]
    );
  }
  return makeQ(
    `g-bs-paid-${seq}`,
    `bs-paid:${cost}:${markup}:${discount}`,
    `تكلفة ${cost}، ربح معلن ${markup}٪، ثم خصم ${discount}٪ للمشتري على سعر البيع. كم يدفع المشتري؟`,
    num(paid),
    [
      num(listed),
      num(Math.round(cost * (1 + (markup - discount) / 100))),
      num(cost),
    ],
    `سعر البيع قبل الخصم = ${listed}. بعد الخصم = ${listed}×(1−${discount}/100)=${paid}.`,
    "buy_sell",
    "hard",
    rng,
    [
      "نسيت تطبيق الخصم.",
      "طبّقت فرق النسبتين على التكلفة مرة واحدة.",
      "أجبت بالتكلفة.",
    ]
  );
}

/** ربح وخسارة على قطعتين */
function genBuySellPair(rng: Rng, seq: number): GenQ {
  const c1 = randInt(rng, 8, 25) * 10;
  const c2 = randInt(rng, 8, 25) * 10;
  const p1 = pick(rng, [10, 20, 25]);
  const p2 = pick(rng, [10, 20, 25]);
  const sell1 = Math.round(c1 * (1 + p1 / 100));
  const sell2 = Math.round(c2 * (1 - p2 / 100));
  const net = sell1 + sell2 - c1 - c2;
  const label = net >= 0 ? "صافي الربح" : "صافي الخسارة";
  const ans = Math.abs(net);
  return makeQ(
    `g-bs-pair-${seq}`,
    `bs-pair:${c1}:${c2}:${p1}:${p2}`,
    `سلعتان تكلفتهما ${c1} و ${c2}. بيعت الأولى بربح ${p1}٪ والثانية بخسارة ${p2}٪. ${label}؟`,
    num(ans),
    [num(Math.abs(sell1 - c1)), num(Math.abs(sell2 - c2)), num(c1 + c2)],
    `البيع الكلي ${sell1 + sell2} − التكلفة ${c1 + c2} = ${net}. المطلوب ${ans}.`,
    "buy_sell",
    "hard",
    rng
  );
}

function genFraction(rng: Rng, seq: number): GenQ {
  // Chain / of-remainder is Qudrat-level; plain leftover is too easy
  if (rng() > 0.2) return genFractionChain(rng, seq);
  const den = pick(rng, [3, 4, 5, 6, 8]);
  const nume = randInt(rng, 1, den - 1);
  const whole = den * randInt(rng, 18, 60);
  const first = (whole * nume) / den;
  const left = whole - first;
  const other = pickPrefer(
    rng,
    [2, 3, 4].filter((d) => left % d === 0),
    [2, 3, 4]
  );
  const share = left / other;
  if (!Number.isInteger(share)) {
    return genFractionChain(rng, seq);
  }
  return makeQ(
    `g-frac-left2-${seq}`,
    `frac-left2:${nume}:${den}:${whole}:${other}`,
    `مبلغ ${whole} أُخذ منه ${nume}/${den}، ثم قُسّم الباقي بالتساوي على ${other} أشخاص. نصيب الواحد من الباقي؟`,
    num(share),
    [num(left), num(first), num(whole / other)],
    `المأخوذ = ${first}. الباقي = ${left}. نصيب الواحد = ${left}÷${other}=${share}.`,
    "fraction",
    "hard",
    rng,
    [
      "أجبت بالباقي كله.",
      "أجبت بالمأخوذ.",
      "قسّمت المبلغ الأصلي على عدد الأشخاص.",
    ]
  );
}

/** كسر من الباقي */
function genFractionChain(rng: Rng, seq: number): GenQ {
  const whole = pick(rng, [60, 80, 90, 120, 150, 180, 240]);
  const d1 = pick(rng, [2, 3, 4, 5]);
  const d2 = pick(rng, [2, 3, 4].filter((d) => d !== d1));
  const after1 = whole - whole / d1;
  if (!Number.isInteger(after1) || after1 % d2 !== 0) {
    // fallback clean numbers
    const w = 120;
    const a = 120 / 3;
    const rem = 120 - a;
    const b = rem / 4;
    const left = rem - b;
    return makeQ(
      `g-frac-ch-${seq}`,
      `frac-ch:120:3:4`,
      `مبلغ 120 أُخذ منه ثلثه، ثم ربع ما تبقى. كم يتبقى في النهاية؟`,
      num(left),
      [num(b), num(rem), num(a)],
      `بعد الثلث يتبقى ${rem}. ربع المتبقي ${b}. النهائي ${left}.`,
      "fraction",
      "hard",
      rng
    );
  }
  const take2 = after1 / d2;
  const left = after1 - take2;
  return makeQ(
    `g-frac-ch-${seq}`,
    `frac-ch:${whole}:${d1}:${d2}`,
    `مبلغ ${whole} أُخذ منه 1/${d1}، ثم 1/${d2} مما تبقى. كم يتبقى؟`,
    num(left),
    [num(take2), num(after1), num(whole / d1)],
    `بعد الأولى يتبقى ${after1}. ثم يُؤخذ ${take2}. النهائي ${left}.`,
    "fraction",
    "hard",
    rng
  );
}

function genRate(rng: Rng, seq: number): GenQ {
  // Harmonic mean / meeting problems > plain time
  if (rng() > 0.35) {
    const s1 = pick(rng, [40, 50, 60, 72]);
    const s2 = pickPrefer(
      rng,
      [60, 80, 90, 100].filter((x) => x !== s1),
      [60, 80, 90]
    );
    const leg = pickPrefer(
      rng,
      [60, 90, 120, 180].filter((d) => d % s1 === 0 || (2 * d) % s1 === 0),
      [60, 120, 180]
    );
    const t = leg / s1 + leg / s2;
    const avg = Math.round(((2 * leg) / t) * 100) / 100;
    const arith = (s1 + s2) / 2;
    return makeQ(
      `g-rate-avg-${seq}`,
      `rate-avg:${s1}:${s2}:${leg}`,
      `قطع سائق المسافة ${leg} كم بسرعة ${s1} ثم عاد نفس المسافة بسرعة ${s2}. متوسط سرعته للرحلة ذهاباً وإياباً؟`,
      num(avg),
      [num(arith), num(s1), num(s2)],
      `الزمن الكلي = ${leg}/${s1} + ${leg}/${s2}. المتوسط = المسافة الكلية ÷ الزمن ≈ ${avg} (وليس متوسط السرعتين ${arith}).`,
      "rate",
      "hard",
      rng,
      [
        "أخذت المتوسط الحسابي للسرعتين.",
        "أخذت سرعة الذهاب فقط.",
        "أخذت سرعة الإياب فقط.",
      ]
    );
  }
  const speed = pick(rng, [45, 50, 60, 72, 80, 90]);
  const hours = pick(rng, [2, 2.5, 3, 3.5, 4]);
  const dist = speed * hours;
  const rest = pick(rng, [20, 30, 40, 45]);
  const totalTime = hours + rest / 60;
  const avg = Math.round((dist / totalTime) * 100) / 100;
  return makeQ(
    `g-rate-rest-${seq}`,
    `rate-rest:${speed}:${hours}:${rest}`,
    `سيارة سرعتها ${speed} كم/س سارت ${hours} ساعة ثم توقفت ${rest} دقيقة. متوسط السرعة للرحلة كلها (بما فيها التوقف)؟`,
    num(avg),
    [num(speed), num(dist), num(Math.round(speed * (hours / totalTime)))],
    `المسافة = ${dist} كم. الزمن الكلي = ${hours}+${rest}/60 = ${totalTime} س. المتوسط = ${dist}÷${totalTime}≈${avg}.`,
    "rate",
    "hard",
    rng,
    [
      "تجاهلت زمن التوقف وأخذت سرعة السير.",
      "أجبت بالمسافة.",
      "قسّمت خطأ على زمن السير فقط مع رقم معدّل.",
    ]
  );
}

function genNumberSense(rng: Rng, seq: number): GenQ {
  const a = randInt(rng, 15, 45);
  const b = randInt(rng, 15, 45);
  const left = a * b;
  const right = (a + 1) * (b - 1);
  const L = `${a}×${b}`;
  const R = `${a + 1}×${b - 1}`;
  const correct = left === right ? "متساويان" : left > right ? L : R;
  return makeQ(
    `g-ns-${seq}`,
    `ns:${a}:${b}`,
    `أيّهما أكبر: ${L} أم ${R}؟`,
    correct,
    [left > right ? R : L, "متساويان", String(Math.max(left, right))].filter(
      (t) => t !== correct
    ),
    `${L}=${left} و${R}=${right}. لاحظ أن (أ+1)(ب−1)=أب −أ +ب −1.`,
    "number_sense",
    "mid",
    rng
  );
}

function genNumberSenseHard(rng: Rng, seq: number): GenQ {
  const n = pick(rng, [25, 36, 49, 64, 81, 100]);
  const root = Math.round(Math.sqrt(n));
  // compare (root+1)^2 vs n+something
  const bump = pick(rng, [2 * root, 2 * root + 1, root]);
  const left = n + bump;
  const right = (root + 1) ** 2;
  let correct: string;
  if (left > right) correct = `أكبر من ${(root + 1)}²`;
  else if (left < right) correct = `أصغر من ${(root + 1)}²`;
  else correct = `يساوي ${(root + 1)}²`;
  return makeQ(
    `g-ns-h-${seq}`,
    `ns-h:${n}:${bump}`,
    `قارن ${n} + ${bump} مع ${(root + 1)}²:`,
    correct,
    [
      `أكبر من ${(root + 1)}²`,
      `أصغر من ${(root + 1)}²`,
      `يساوي ${(root + 1)}²`,
      "لا يمكن المقارنة",
    ].filter((t) => t !== correct),
    `${(root + 1)}² = ${right}. و ${n}+${bump}=${left}.`,
    "number_sense",
    "hard",
    rng
  );
}

// ─── جبر ────────────────────────────────────────────────

function genLinearEq(rng: Rng, seq: number): GenQ {
  // Prefer two-sided / distribute form — single-step ax+b=c is too easy for Qudrat
  if (rng() > 0.25) return genLinearEqHard(rng, seq);
  const a = randInt(rng, 3, 9);
  const x = randInt(rng, 3, 16);
  const b = randInt(rng, 2, 20);
  const d = randInt(rng, 2, 7);
  // a x + b = d x + c  → c = a x + b - d x
  const c = a * x + b - d * x;
  return makeQ(
    `g-alg-eq-${seq}`,
    `alg-eq2:${a}:${b}:${d}:${c}`,
    `إذا كان ${a}س + ${b} = ${d}س + ${c}، فما قيمة س؟`,
    num(x),
    [num(x + 1), num(Math.abs(c - b)), num(a + d)],
    `انقل حدود س: ${a}س − ${d}س = ${c} − ${b} ⇒ ${(a - d)}س = ${c - b} ⇒ س = ${x}.`,
    "algebra",
    "hard",
    rng,
    [
      "جمعت المعاملات بدل طرحها.",
      "طرحت الثوابت بالاتجاه المعاكس.",
      "أخذت حاصل جمع الطرفين.",
    ]
  );
}

/** معادلة بخطوتين مع أقواس */
function genLinearEqHard(rng: Rng, seq: number): GenQ {
  const x = randInt(rng, 2, 12);
  const a = randInt(rng, 2, 5);
  const b = randInt(rng, 1, 8);
  let c = randInt(rng, 2, 6);
  if (c === a) c = a + 1;
  // a(x+b) = c*x + k  → choose k so integer
  const left = a * (x + b);
  const k = left - c * x;
  return makeQ(
    `g-alg-eqh-${seq}`,
    `alg-eqh:${a}:${b}:${c}:${k}`,
    `حلّ: ${a}(س + ${b}) = ${c}س ${k < 0 ? "−" : "+"} ${Math.abs(k)}`,
    num(x),
    [num(x + 1), num(b), num(Math.abs(k))],
    `1) وسّع: ${a}س + ${a * b} = ${c}س ${k < 0 ? "−" : "+"} ${Math.abs(k)}. 2) ${a - c}س = ${k - a * b}. 3) س = ${x}.`,
    "algebra",
    "hard",
    rng
  );
}

function genEvalExpr(rng: Rng, seq: number): GenQ {
  const x = randInt(rng, 2, 10);
  const a = randInt(rng, 2, 5);
  const b = randInt(rng, 1, 8);
  const c = randInt(rng, 1, 6);
  // a x^2 - b x + c
  const ans = a * x * x - b * x + c;
  return makeQ(
    `g-alg-ev-${seq}`,
    `alg-ev:${a}:${x}:${b}:${c}`,
    `إذا س = ${x}، فما قيمة ${a}س² − ${b}س + ${c}؟`,
    num(ans),
    [num(a * x - b * x + c), num(a * x * x + b * x + c), num((a - b) * x + c)],
    `${a}×${x}² − ${b}×${x} + ${c} = ${ans}.`,
    "algebra",
    "hard",
    rng,
    ["نسيت تربيع س.", "جمعت حد الوسط بدل طرحه.", "خلطت المعاملات."]
  );
}

function genInequality(rng: Rng, seq: number): GenQ {
  const a = pick(rng, [2, 3, 4, 5]);
  const bound = randInt(rng, 6, 20) * a;
  const ans = bound / a;
  return makeQ(
    `g-alg-ineq-${seq}`,
    `alg-ineq:${a}:${bound}`,
    `ما أكبر عدد صحيح س يحقق: ${a}س < ${bound}؟`,
    num(ans - 1),
    [num(ans), num(ans + 1), num(bound - a)],
    `س < ${ans}، فأكبر صحيح هو ${ans - 1}.`,
    "algebra",
    "mid",
    rng,
    ["أخذت حد المساواة.", "زدت واحداً بالخطأ.", "طرحت المعامل من الطرف."]
  );
}

function genSequence(rng: Rng, seq: number): GenQ {
  if (rng() > 0.45) {
    // geometric-ish or second difference style: n^2 pattern
    const start = randInt(rng, 1, 4);
    const terms = [start ** 2, (start + 1) ** 2, (start + 2) ** 2, (start + 3) ** 2];
    const next = (start + 4) ** 2;
    return makeQ(
      `g-alg-seq2-${seq}`,
      `alg-seq2:${start}`,
      `ما العدد التالي: ${terms.join("، ")}، …؟`,
      num(next),
      [num(next + 2 * (start + 4) + 1), num(terms[3]! + (terms[3]! - terms[2]!)), num(start + 4)],
      `مربعات متتالية. التالي = (${start + 4})² = ${next}.`,
      "algebra",
      "hard",
      rng
    );
  }
  const start = randInt(rng, 3, 20);
  const d = randInt(rng, 3, 11);
  const terms = [start, start + d, start + 2 * d, start + 3 * d];
  const next = start + 4 * d;
  return makeQ(
    `g-alg-seq-${seq}`,
    `alg-seq:${start}:${d}`,
    `ما العدد التالي في المتتالية: ${terms.join("، ")}، …؟`,
    num(next),
    [num(next + d), num(next - 1), num(start * 5)],
    `فرق ثابت = ${d}. التالي = ${next}.`,
    "algebra",
    "mid",
    rng
  );
}

/** عمر — جبر لفظي */
function genAge(rng: Rng, seq: number): GenQ {
  const son = randInt(rng, 6, 16);
  const k = pick(rng, [2, 3, 4]);
  const father = k * son;
  const years = randInt(rng, 4, 10);
  // After years, father will be m times son — solve for years OR ask future ages
  const mode = pick(rng, ["now", "future-ratio", "ago"] as const);
  if (mode === "future-ratio") {
    // father + y = m (son + y) — pick m < k so solvable with positive y
    const m = k === 4 ? 3 : 2;
    // f+y = m(s+y) → ks + y = m s + m y → y(1-m) = ms - ks → y = (k-m)s/(m-1)
    const y = ((k - m) * son) / (m - 1);
    if (!Number.isInteger(y) || y <= 0) {
      // fallback clean: son=10, k=3, m=2 → y=10
      const s2 = 10;
      const y2 = 10;
      return makeQ(
        `g-alg-age-fr-${seq}`,
        `age-fr:10:3:2`,
        `عمر الأب الآن 3 أمثال عمر ابنه (الابن 10). بعد كم سنة يصبح عمر الأب مثلي عمر الابن؟`,
        num(y2),
        [num(5), num(15), num(20)],
        `الآن الأب 30. نريد 30+س = 2(10+س) ⇒ س = 10.`,
        "algebra",
        "hard",
        rng,
        [
          "ظننت أن الفرق يتغيّر مع الزمن.",
          "حوّلت الأمثال دون معادلة.",
          "أضفت الأعمار بدل حل المعادلة.",
        ]
      );
    }
    return makeQ(
      `g-alg-age-fr-${seq}`,
      `age-fr:${son}:${k}:${m}`,
      `عمر الأب الآن ${k} أمثال عمر ابنه (${son} سنة). بعد كم سنة يصبح عمر الأب ${m} أمثال عمر الابن؟`,
      num(y),
      [num(years), num(father - son), num(son * m)],
      `الآن الأب ${father}. المعادلة: ${father}+س = ${m}(${son}+س) ⇒ س = ${y}.`,
      "algebra",
      "hard",
      rng,
      [
        "استخدمت فرق العمر مباشرة كإجابة.",
        "ضربت عمر الابن في المثل الجديد.",
        "اخترت سنوات عشوائية من السؤال.",
      ]
    );
  }
  if (mode === "ago") {
    const ago = Math.min(years, son - 2);
    if (ago <= 0) {
      return genAge(rng, seq + 1);
    }
    return makeQ(
      `g-alg-age-ago-${seq}`,
      `age-ago:${son}:${k}:${ago}`,
      `عمر الأب الآن ${father} والابن ${son}. قبل ${ago} سنوات، كم كان مجموع عمريهما؟`,
      num(father + son - 2 * ago),
      [num(father + son - ago), num(father + son), num(father - son)],
      `كلٌ ينقص ${ago}، فالمجموع ينقص ${2 * ago}. الناتج = ${father + son - 2 * ago}.`,
      "algebra",
      "hard",
      rng,
      [
        "نقصت السنوات من مجموع واحد فقط.",
        "نسيت طرح السنوات.",
        "حسبت فرق العمر بدل المجموع.",
      ]
    );
  }
  return makeQ(
    `g-alg-age-${seq}`,
    `age:${son}:${k}:${years}`,
    `عمر الأب ${k} أمثال عمر ابنه، ومجموعهما ${father + son}. بعد ${years} سنوات، ما مجموع عمريهما؟`,
    num(father + son + 2 * years),
    [num(father + son + years), num(father + years), num(son + years)],
    `الآن المجموع ${father + son}. بعد ${years} سنة يزيد المجموع بـ ${2 * years} = ${father + son + 2 * years}.`,
    "algebra",
    "hard",
    rng,
    [
      "أضفت السنوات مرة واحدة فقط للمجموع.",
      "أخذت عمر الأب لاحقاً فقط.",
      "أخذت عمر الابن لاحقاً فقط.",
    ]
  );
}

function genAlgCompare(rng: Rng, seq: number): GenQ {
  const x = randInt(rng, 3, 14);
  const aExpr = 2 * x + 5;
  const bExpr = 3 * x - 2;
  let correct: string;
  if (aExpr > bExpr) correct = "أ أكبر";
  else if (bExpr > aExpr) correct = "ب أكبر";
  else correct = "متساويتان";
  return makeQ(
    `g-alg-cmp-${seq}`,
    `alg-cmp:${x}`,
    `إذا س = ${x}:\nكمية أ: 2س + 5\nكمية ب: 3س − 2\nأيّ العبارتين صحيحة؟`,
    correct,
    ["أ أكبر", "ب أكبر", "متساويتان", "المعطيات غير كافية"].filter(
      (t) => t !== correct
    ),
    `أ = ${aExpr}، ب = ${bExpr}.`,
    "comparison",
    "mid",
    rng
  );
}

function genAlgCompareHard(rng: Rng, seq: number): GenQ {
  const x = randInt(rng, 2, 9);
  // أ: س²  ب: 5س − 4
  const a = x * x;
  const b = 5 * x - 4;
  let correct: string;
  if (a > b) correct = "أ أكبر";
  else if (b > a) correct = "ب أكبر";
  else correct = "متساويتان";
  return makeQ(
    `g-alg-cmph-${seq}`,
    `alg-cmph:${x}`,
    `إذا س = ${x}:\nكمية أ: س²\nكمية ب: 5س − 4\nأيّ العبارتين صحيحة؟`,
    correct,
    ["أ أكبر", "ب أكبر", "متساويتان", "المعطيات غير كافية"].filter(
      (t) => t !== correct
    ),
    `أ = ${a}، ب = ${b}.`,
    "comparison",
    "hard",
    rng
  );
}

// ─── هندسة ──────────────────────────────────────────────

function genRectArea(rng: Rng, seq: number): GenQ {
  const l = randInt(rng, 6, 24);
  const w = randInt(rng, 4, 18);
  if (rng() > 0.5) {
    const area = l * w;
    const peri = 2 * (l + w);
    // give peri + one side, ask area — harder
    return makeQ(
      `g-geo-ra2-${seq}`,
      `geo-ra2:${l}:${w}`,
      `مستطيل محيطه ${peri} وطوله ${l}. ما مساحته؟`,
      num(area),
      [num(peri), num(l * l), num(2 * l + w)],
      `العرض = ${peri}/2 − ${l} = ${w}. المساحة = ${l}×${w} = ${area}.`,
      "geometry",
      "hard",
      rng,
      ["خلطت المحيط بالمساحة.", "ربّعت الطول.", "جمعت بعدين فقط."]
    );
  }
  const area = l * w;
  return makeQ(
    `g-geo-ra-${seq}`,
    `geo-ra:${l}:${w}`,
    `مستطيل طوله ${l} وعرضه ${w}. مساحته؟`,
    num(area),
    [num(2 * (l + w)), num(l + w), num(l * w + l)],
    `المساحة = ${l}×${w} = ${area}.`,
    "geometry",
    "mid",
    rng
  );
}

function genTriangleArea(rng: Rng, seq: number): GenQ {
  const b = randInt(rng, 4, 18) * 2;
  const h = randInt(rng, 4, 16);
  const area = (b * h) / 2;
  return makeQ(
    `g-geo-ta-${seq}`,
    `geo-ta:${b}:${h}`,
    `مثلث قاعدته ${b} وارتفاعه ${h}. مساحته؟`,
    num(area),
    [num(b * h), num(b + h), num((b * h) / 4)],
    `½ × ${b} × ${h} = ${area}.`,
    "geometry",
    "mid",
    rng,
    ["نسيت النصف.", "جمعت القاعدة والارتفاع.", "قسّمت على 4."]
  );
}

/** فيثاغورس — تجنّب مضاعفات 3-4-5 الشهيرة */
function genPythagoras(rng: Rng, seq: number): GenQ {
  const triples = [
    [5, 12, 13],
    [7, 24, 25],
    [8, 15, 17],
    [9, 40, 41],
    [11, 60, 61],
    [12, 35, 37],
  ] as const;
  const t = pick(rng, [...triples]);
  const k = pick(rng, [1, 2]);
  const a = t[0] * k;
  const b = t[1] * k;
  const c = t[2] * k;
  const mode = pick(rng, ["hyp", "leg", "area"] as const);
  if (mode === "area") {
    const area = (a * b) / 2;
    return makeQ(
      `g-geo-py-ar-${seq}`,
      `geo-py-ar:${a}:${b}`,
      `مثلث قائم الزاوية ضلعاه القائمة ${a} و ${b}. مساحته؟`,
      num(area),
      [num(a * b), num(a + b), num(c)],
      `المساحة = ½×${a}×${b} = ${area}. (الوتر ${c} غير مطلوب للمساحة).`,
      "geometry",
      "hard",
      rng,
      [
        "نسيت النصف فأجبت بحاصل الضلعين.",
        "جمعت الضلعين.",
        "أجبت بطول الوتر.",
      ]
    );
  }
  if (mode === "hyp") {
    return makeQ(
      `g-geo-py-${seq}`,
      `geo-py:${a}:${b}`,
      `مثلث قائم الزاوية ضلعاه القائمة ${a} و ${b}. طول الوتر؟`,
      num(c),
      [num(a + b), num(Math.abs(b - a)), num(a * b)],
      `الوتر² = ${a}²+${b}² = ${c}² ⇒ الوتر = ${c}.`,
      "geometry",
      "hard",
      rng,
      ["جمعت الضلعين.", "طرحت الضلعين.", "ضربت الضلعين."]
    );
  }
  return makeQ(
    `g-geo-py2-${seq}`,
    `geo-py2:${c}:${a}`,
    `مثلث قائم الوتر فيه ${c} وأحد ضلعي القائمة ${a}. طول الضلع الآخر؟`,
    num(b),
    [num(c - a), num(c + a), num(Math.round(Math.sqrt(c * c + a * a)))],
    `الضلع² = ${c}² − ${a}² = ${b}² ⇒ ${b}.`,
    "geometry",
    "hard",
    rng,
    [
      "طرحت الضلعين بدل فيثاغورس.",
      "جمعت الوتر مع الضلع.",
      "جمعت المربعات بدل طرحها.",
    ]
  );
}

function genPerimeter(rng: Rng, seq: number): GenQ {
  const s = randInt(rng, 4, 20);
  const area = s * s;
  // reverse: area → perimeter (avoids trivial “4×side”)
  return makeQ(
    `g-geo-sq-${seq}`,
    `geo-sq:${s}`,
    `مربع مساحته ${area}. ما محيطه؟`,
    num(4 * s),
    [num(area), num(2 * s), num(s)],
    `الضلع = √${area} = ${s}. المحيط = 4×${s} = ${4 * s}.`,
    "geometry",
    "mid",
    rng,
    ["أجبت بالمساحة.", "حسبت ضلعين فقط.", "أخذت الضلع."]
  );
}

function genAngles(rng: Rng, seq: number): GenQ {
  if (rng() > 0.5) {
    const a = randInt(rng, 20, 70);
    return makeQ(
      `g-geo-ang2-${seq}`,
      `geo-ang2:${a}`,
      `زاويتان متتامتان، إحداهما ${a}°. ما قياس الأخرى؟`,
      `${90 - a}°`,
      [`${180 - a}°`, `${a}°`, `${90 + a}°`],
      `المتامتان مجموعهما 90°. الأخرى = ${90 - a}°.`,
      "geometry",
      "mid",
      rng,
      ["خلطت مع المتكاملتين (180).", "كرّرت نفس الزاوية.", "جمعت مع 90."]
    );
  }
  let a = randInt(rng, 25, 75);
  let b = randInt(rng, 25, 75);
  let c = 180 - a - b;
  if (c <= 10) {
    a = 40;
    b = 55;
    c = 85;
  }
  return makeQ(
    `g-geo-ang-${seq}`,
    `geo-ang:${a}:${b}`,
    `في مثلث زاويتان ${a}° و ${b}°. قياس الزاوية الثالثة؟`,
    `${c}°`,
    [`${a + b}°`, `${180 - a}°`, `${90}°`],
    `مجموع زوايا المثلث 180°. الثالثة = ${c}°.`,
    "geometry",
    "mid",
    rng
  );
}

function genCircle(rng: Rng, seq: number): GenQ {
  const r = pick(rng, [3, 4, 5, 6, 7, 8, 10, 14]);
  if (rng() > 0.45 && (r % 7 === 0 || r === 7 || r === 14)) {
    const area = (22 * r * r) / 7;
    const circ = (2 * 22 * r) / 7;
    if (rng() > 0.5) {
      return makeQ(
        `g-geo-cir-c-${seq}`,
        `geo-circ:${r}`,
        `دائرة نصف قطرها ${r}. محيطها تقريباً (باي = 22/7)؟`,
        num(circ),
        [num(area), num(22 * r), num(r * r)],
        `2 × باي × ر = 2×(22/7)×${r} = ${circ}.`,
        "geometry",
        "mid",
        rng
      );
    }
    return makeQ(
      `g-geo-cir-${seq}`,
      `geo-cir:${r}`,
      `دائرة نصف قطرها ${r}. مساحتها تقريباً (باي = 22/7)؟`,
      num(area),
      [num(circ), num(r * r), num(22 * r)],
      `باي × ر² = (22/7)×${r}² = ${area}.`,
      "geometry",
      "mid",
      rng
    );
  }
  // diameter given
  const d = r * 2;
  const area = Math.round(3.14 * r * r * 100) / 100;
  return makeQ(
    `g-geo-cir-d-${seq}`,
    `geo-cir-d:${d}`,
    `دائرة قطرها ${d}. مساحتها تقريباً (باي = 3.14)؟`,
    num(area),
    [
      num(Math.round(3.14 * d * d * 100) / 100),
      num(Math.round(3.14 * d * 100) / 100),
      num(d * d),
    ],
    `نصف القطر = ${r}. المساحة ≈ 3.14×${r}² = ${area}.`,
    "geometry",
    "hard",
    rng,
    ["استخدمت القطر بدل نصف القطر في ر².", "حسبت المحيط.", "ربّعت القطر دون باي."]
  );
}

function genVolume(rng: Rng, seq: number): GenQ {
  const a = randInt(rng, 2, 10);
  const b = randInt(rng, 2, 10);
  const c = randInt(rng, 2, 10);
  const v = a * b * c;
  if (rng() > 0.5) {
    // cube
    const s = randInt(rng, 3, 12);
    return makeQ(
      `g-geo-cube-${seq}`,
      `geo-cube:${s}`,
      `مكعب طول حرفه ${s}. حجمه؟`,
      num(s ** 3),
      [num(6 * s * s), num(s * s), num(4 * s)],
      `الحجم = ${s}³ = ${s ** 3}.`,
      "geometry",
      "mid",
      rng,
      ["حسبت المساحة الجانبية.", "حسبت مساحة الوجه.", "حسبت المحيط."]
    );
  }
  return makeQ(
    `g-geo-vol-${seq}`,
    `geo-vol:${a}:${b}:${c}`,
    `متوازي مستطيلات أبعاده ${a} و ${b} و ${c}. حجمه؟`,
    num(v),
    [num(a * b + c), num(2 * (a * b + b * c + a * c)), num(a + b + c)],
    `الحجم = ${a}×${b}×${c} = ${v}.`,
    "geometry",
    "mid",
    rng
  );
}

function genGeoCompare(rng: Rng, seq: number): GenQ {
  const s = randInt(rng, 4, 14);
  const area = s * s;
  const peri = 4 * s;
  let correct: string;
  if (area > peri) correct = "أ أكبر";
  else if (peri > area) correct = "ب أكبر";
  else correct = "متساويتان";
  return makeQ(
    `g-geo-cmp-${seq}`,
    `geo-cmp:${s}`,
    `مربع ضلعه ${s}:\nكمية أ: المساحة\nكمية ب: المحيط\nأيّ العبارتين صحيحة؟`,
    correct,
    ["أ أكبر", "ب أكبر", "متساويتان", "المعطيات غير كافية"].filter(
      (t) => t !== correct
    ),
    `المساحة ${area}، المحيط ${peri}.`,
    "comparison",
    "mid",
    rng
  );
}

function genGeoCompareHard(rng: Rng, seq: number): GenQ {
  const r = pick(rng, [3, 4, 5, 6, 7]);
  const area = Math.round(3.14 * r * r);
  const circ = Math.round(2 * 3.14 * r);
  let correct: string;
  if (area > circ) correct = "أ أكبر";
  else if (circ > area) correct = "ب أكبر";
  else correct = "متساويتان";
  return makeQ(
    `g-geo-cmph-${seq}`,
    `geo-cmph:${r}`,
    `دائرة نصف قطرها ${r} (باي≈3.14):\nكمية أ: المساحة تقريباً\nكمية ب: المحيط تقريباً\nأيّ العبارتين صحيحة؟`,
    correct,
    ["أ أكبر", "ب أكبر", "متساويتان", "المعطيات غير كافية"].filter(
      (t) => t !== correct
    ),
    `المساحة ≈ ${area}، المحيط ≈ ${circ}.`,
    "comparison",
    "hard",
    rng
  );
}

// ─── إحصاء واحتمال ──────────────────────────────────────

function genMedian(rng: Rng, seq: number): GenQ {
  const a = randInt(rng, 5, 20);
  const b = a + randInt(rng, 2, 8);
  const c = b + randInt(rng, 2, 8);
  const d = c + randInt(rng, 2, 8);
  const e = d + randInt(rng, 2, 8);
  const vals = shuffle(rng, [a, b, c, d, e]);
  const sorted = [...vals].sort((x, y) => x - y);
  const med = sorted[2]!;
  return makeQ(
    `g-stat-med-${seq}`,
    `stat-med:${vals.join("-")}`,
    `ما وسيط الأعداد: ${vals.join("، ")}؟`,
    num(med),
    [num(sorted[0]!), num(Math.round(vals.reduce((s, v) => s + v, 0) / 5)), num(sorted[4]!)],
    `بعد الترتيب: ${sorted.join("، ")}. الوسيط = ${med}.`,
    "statistics",
    "mid",
    rng,
    ["أخذت أصغر قيمة.", "خلطت مع المتوسط.", "أخذت أكبر قيمة."]
  );
}

function genRange(rng: Rng, seq: number): GenQ {
  const vals = Array.from({ length: 6 }, () => randInt(rng, 10, 90));
  const mn = Math.min(...vals);
  const mx = Math.max(...vals);
  return makeQ(
    `g-stat-rng-${seq}`,
    `stat-rng:${vals.join("-")}`,
    `ما مدى الأعداد: ${vals.join("، ")}؟`,
    num(mx - mn),
    [num(mx), num(mn), num(Math.round(vals.reduce((a, b) => a + b, 0) / vals.length))],
    `المدى = الأكبر − الأصغر = ${mx} − ${mn} = ${mx - mn}.`,
    "statistics",
    "mid",
    rng
  );
}

function genMode(rng: Rng, seq: number): GenQ {
  const mode = randInt(rng, 3, 15);
  const other = mode + randInt(rng, 1, 5);
  const vals = shuffle(rng, [mode, mode, mode, other, other + 1, other]);
  return makeQ(
    `g-stat-mode-${seq}`,
    `stat-mode:${vals.join("-")}`,
    `ما منوال الأعداد: ${vals.join("، ")}؟`,
    num(mode),
    [num(other), num(other + 1), num(Math.round((mode + other) / 2))],
    `الأكثر تكراراً هو ${mode}.`,
    "statistics",
    "mid",
    rng
  );
}

function genProbability(rng: Rng, seq: number): GenQ {
  const red = randInt(rng, 2, 9);
  const blue = randInt(rng, 2, 9);
  const total = red + blue;
  const ans = simplifyFrac(red, total);
  return makeQ(
    `g-prob-${seq}`,
    `prob:${red}:${blue}`,
    `كيس فيه ${red} كرات حمراء و ${blue} زرقاء. احتمال سحب حمراء عشوائياً؟`,
    ans,
    [simplifyFrac(blue, total), `${red}/${blue}`, pct(Math.round((red / total) * 100))],
    `الاحتمال = ${red}/${total} = ${ans}.`,
    "probability",
    "mid",
    rng,
    ["احتمال الزرقاء.", "نسبة حمراء لزرقاء.", "حوّلت لنسبة مئوية."]
  );
}

/** بدون إرجاع */
function genProbabilityHard(rng: Rng, seq: number): GenQ {
  const red = randInt(rng, 3, 8);
  const blue = randInt(rng, 2, 7);
  const total = red + blue;
  // P(red then red)
  const nume = red * (red - 1);
  const den = total * (total - 1);
  const ans = simplifyFrac(nume, den);
  return makeQ(
    `g-prob-h-${seq}`,
    `prob-h:${red}:${blue}`,
    `كيس فيه ${red} حمراء و ${blue} زرقاء. سُحبت كرتان بالتتابع دون إرجاع. احتمال أن تكونا حمراوين؟`,
    ans,
    [
      simplifyFrac(red, total),
      simplifyFrac(red * red, total * total),
      simplifyFrac(red, total - 1),
    ],
    `(${red}/${total}) × (${red - 1}/${total - 1}) = ${ans}.`,
    "probability",
    "hard",
    rng,
    ["حسبت سحبة واحدة فقط.", "ظننت السحب مع إرجاع.", "نسيت تحديث المقام."]
  );
}

function genTablePct(rng: Rng, seq: number): GenQ {
  const boys = randInt(rng, 25, 70);
  const girls = randInt(rng, 25, 70);
  const total = boys + girls;
  const p = Math.round((boys / total) * 100);
  return makeQ(
    `g-stat-tab-${seq}`,
    `stat-tab:${boys}:${girls}`,
    `فصل فيه ${boys} طالباً و ${girls} طالبة. نسبة الطلاب تقريباً من مجموع الفصل؟`,
    pct(p),
    [pct(Math.round((girls / total) * 100)), pct(boys), pct(Math.round((boys / girls) * 100))],
    `${boys} ÷ ${total} ≈ ${p}٪.`,
    "statistics",
    "mid",
    rng,
    ["حسبت نسبة الطالبات.", "أخذت العدد كنسبة.", "قسّمت على عدد الطالبات."]
  );
}

// ─── Registry — أوزان نحو الصعب ─────────────────────────

type GenFn = (rng: Rng, seq: number) => GenQ;

export const PATTERN_GENS: Record<SubPattern, GenFn[]> = {
  percent: [
    genPercentUp,
    genPercentDown,
    genPercentFindBase,
    genPercentOfPercent,
    genPercentFindBase,
    genPercentOfPercent,
  ],
  ratio: [genRatioSplit, genRatioThree, genInverseWork, genRatioThree, genInverseWork],
  successive: [genSuccessive, genSuccessiveNet, genSuccessiveNet, genSuccessive],
  average: [genAverageMissing, genAverageShift, genAverageMissing],
  buy_sell: [genBuySell, genBuySellPair, genBuySellPair],
  fraction: [genFraction, genFractionChain, genFractionChain],
  rate: [genRate, genRate],
  number_sense: [genNumberSenseHard, genNumberSense, genNumberSenseHard],
  algebra: [
    genLinearEq,
    genLinearEqHard,
    genEvalExpr,
    genInequality,
    genSequence,
    genAge,
    genLinearEqHard,
    genEvalExpr,
  ],
  geometry: [
    genRectArea,
    genTriangleArea,
    genPerimeter,
    genAngles,
    genCircle,
    genVolume,
    genPythagoras,
    genPythagoras,
    genGeoCompareHard,
  ],
  statistics: [genMedian, genMode, genTablePct, genRange, genAverageMissing],
  probability: [genProbabilityHard, genProbability, genProbabilityHard],
  comparison: [
    genAlgCompareHard,
    genGeoCompareHard,
    genAlgCompare,
    genGeoCompare,
    genAlgCompareHard,
  ],
};

/** Hard-only pool — used heavily for exams 1–5. */
export const PATTERN_GENS_HARD: Record<SubPattern, GenFn[]> = {
  percent: [genPercentOfPercent, genPercentFindBase, genPercentDown, genPercentUp],
  ratio: [genRatioThree, genInverseWork, genRatioThree],
  successive: [genSuccessiveNet, genSuccessive, genSuccessiveNet],
  average: [genAverageMissing, genAverageShift],
  buy_sell: [genBuySellPair, genBuySell],
  fraction: [genFractionChain, genFraction],
  rate: [genRate],
  number_sense: [genNumberSenseHard],
  algebra: [genLinearEqHard, genEvalExpr, genLinearEq, genAge, genSequence],
  geometry: [genPythagoras, genVolume, genCircle, genGeoCompareHard, genAngles],
  statistics: [genAverageMissing, genTablePct, genMedian],
  probability: [genProbabilityHard],
  comparison: [genAlgCompareHard, genGeoCompareHard],
};

export type ExamMix = Partial<Record<SubPattern, number>>;

/**
 * Official-like mix for scientific-track quantitative (~60 Q):
 * حساب ~40%, هندسة ~24%, جبر ~23%, إحصاء/تحليل ~13%
 */
export const OFFICIAL_MIX_60: ExamMix = {
  percent: 6,
  ratio: 5,
  successive: 3,
  average: 2,
  buy_sell: 2,
  fraction: 2,
  rate: 2,
  number_sense: 2,
  algebra: 12,
  geometry: 12,
  comparison: 4,
  statistics: 5,
  probability: 3,
};

/** Qudurat-like mix for exams 1–5 (heavier successive, comparison, algebra). */
export const HARD_OPENING_MIX_60: ExamMix = {
  percent: 5,
  ratio: 4,
  successive: 6,
  average: 3,
  buy_sell: 3,
  fraction: 3,
  rate: 3,
  number_sense: 3,
  algebra: 12,
  geometry: 10,
  comparison: 6,
  statistics: 1,
  probability: 1,
};

function sumMix(mix: ExamMix): number {
  return Object.values(mix).reduce((a, c) => a + (c ?? 0), 0);
}

/** 20 exam blueprints — first 5 start from HARD_OPENING_MIX. */
export const EXAM_BLUEPRINTS: { id: string; mix: ExamMix }[] = Array.from(
  { length: 20 },
  (_, i) => {
    const rng = mulberry32(1000 + i * 97);
    const mix: ExamMix = {
      ...(i < 5 ? HARD_OPENING_MIX_60 : OFFICIAL_MIX_60),
    };
    const bump = (a: SubPattern, b: SubPattern) => {
      if ((mix[a] ?? 0) < 2) return;
      mix[a] = (mix[a] ?? 0) - 1;
      mix[b] = (mix[b] ?? 0) + 1;
    };
    if (rng() > 0.5) bump("percent", "ratio");
    if (rng() > 0.5) bump("algebra", "geometry");
    if (rng() > 0.55) bump("statistics", "probability");
    if (rng() > 0.6) bump("geometry", "comparison");
    if (rng() > 0.5) bump("successive", "percent");
    if (rng() > 0.55) bump("fraction", "rate");
    if (rng() > 0.6) bump("buy_sell", "average");
    let total = sumMix(mix);
    while (total < 60) {
      mix.algebra = (mix.algebra ?? 0) + 1;
      total++;
    }
    while (total > 60) {
      const keys = (Object.keys(mix) as SubPattern[]).filter(
        (k) => (mix[k] ?? 0) > 1
      );
      const k = pick(rng, keys);
      mix[k] = (mix[k] ?? 0) - 1;
      total--;
    }
    return { id: `e${String(i + 1).padStart(2, "0")}`, mix };
  }
);

export const MOCK_EXAM_SIZE = 60;
export const MOCK_BANK_SIZE = EXAM_BLUEPRINTS.length;
/** First 20 finishes walk the bank; after that remix forever. */
export const MOCK_REMIX_AFTER = 20;

export type GenerateExamOptions = {
  /** 0 = normal pool, 1 = always hard pool. Exams 1–5 use ~0.9. */
  hardBias?: number;
};

function genForPattern(
  pattern: SubPattern,
  rng: Rng,
  seq: number,
  hardBias: number
): GenQ {
  // Exams 1–5 (hardBias ≈ 1): authentic Qudurat-style bank only
  if (hardBias >= 0.85) {
    return genQuduratHard(pattern, rng, seq) as GenQ;
  }
  const useHard = rng() < hardBias;
  const pool = useHard
    ? PATTERN_GENS_HARD[pattern] ?? PATTERN_GENS[pattern]
    : PATTERN_GENS[pattern];
  return pick(rng, pool)(rng, seq);
}

function looksBroken(q: GenQ): boolean {
  if (!isCleanGenQ(q as Parameters<typeof isCleanGenQ>[0])) return true;
  const blob = [q.prompt_ar, q.solve_ar, ...q.choices_ar].join("|");
  return /undefined|NaN|null|Infinity/i.test(blob);
}

function expandMix(mix: ExamMix, size: number, rng: Rng): SubPattern[] {
  const plan: SubPattern[] = [];
  for (const [pat, count] of Object.entries(mix) as [SubPattern, number][]) {
    for (let i = 0; i < (count ?? 0); i++) plan.push(pat);
  }
  const fillers: SubPattern[] = [
    "algebra",
    "geometry",
    "successive",
    "comparison",
  ];
  while (plan.length < size) plan.push(pick(rng, fillers));
  return shuffle(rng, plan).slice(0, size);
}

export function generateExamQuestions(
  seed: number,
  mix: ExamMix,
  avoid: Set<string>,
  size = MOCK_EXAM_SIZE,
  opts?: GenerateExamOptions
): GenQ[] {
  const hardBias = Math.min(1, Math.max(0, opts?.hardBias ?? 0.55));
  const rng = mulberry32(seed);
  const plan = expandMix(mix, size, rng);
  const out: GenQ[] = [];
  let seq = seed % 100000;

  for (const pat of plan) {
    let chosen: GenQ | null = null;
    for (let attempt = 0; attempt < 64; attempt++) {
      seq += 1 + Math.floor(rng() * 19);
      const cand = genForPattern(
        pat,
        mulberry32(seed + seq * 9973),
        seq,
        hardBias
      );
      if (looksBroken(cand)) continue;
      // Prefer tagged hard when bias is high
      if (
        hardBias >= 0.75 &&
        cand.difficulty !== "hard" &&
        attempt < 24
      ) {
        continue;
      }
      if (!avoid.has(cand.fingerprint)) {
        chosen = cand;
        break;
      }
    }
    if (!chosen || looksBroken(chosen)) {
      seq += 131;
      chosen = genForPattern(pat, mulberry32(seed + seq), seq, 1);
      let guard = 0;
      while (looksBroken(chosen) && guard < 12) {
        seq += 17;
        chosen = genForPattern(pat, mulberry32(seed + seq * 13), seq, 1);
        guard++;
      }
    }
    // Validate: exactly 4 choices, one correct, no undefined
    if (
      looksBroken(chosen) ||
      chosen.choices_ar.length !== 4 ||
      chosen.correct_index < 0 ||
      chosen.correct_index > 3 ||
      new Set(chosen.choices_ar).size !== 4
    ) {
      seq += 19;
      chosen = genQuduratHard(pat, mulberry32(seed + seq * 41), seq) as GenQ;
    }
    avoid.add(chosen.fingerprint);
    out.push({
      ...chosen,
      id: `exam-${seed}-${out.length + 1}`,
    });
  }
  return out;
}

export function generateRemixExam(
  seed: number,
  avoid: Set<string>,
  size = MOCK_EXAM_SIZE
): GenQ[] {
  const a = EXAM_BLUEPRINTS[seed % EXAM_BLUEPRINTS.length]!.mix;
  const b = EXAM_BLUEPRINTS[(seed * 7) % EXAM_BLUEPRINTS.length]!.mix;
  const mixed: ExamMix = {};
  const keys = new Set([
    ...Object.keys(a),
    ...Object.keys(b),
  ]) as Set<SubPattern>;
  for (const k of keys) {
    mixed[k] = Math.round(((a[k] ?? 0) + (b[k] ?? 0)) / 2);
  }
  let total = sumMix(mixed);
  while (total < size) {
    mixed.percent = (mixed.percent ?? 0) + 1;
    total++;
  }
  while (total > size) {
    const k = (Object.keys(mixed) as SubPattern[]).find(
      (x) => (mixed[x] ?? 0) > 1
    )!;
    mixed[k] = (mixed[k] ?? 0) - 1;
    total--;
  }
  return generateExamQuestions(seed ^ 0x9e3779b9, mixed, avoid, size);
}
