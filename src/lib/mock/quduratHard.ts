/**
 * Generators modeled on real Qiyas/Qudurat quantitative style
 * (multi-step successive %, identities, comparisons, clean integers).
 * Used for mock exams 1–5.
 */
import type { Difficulty, Question, SubPattern } from "@/lib/types";
import { mulberry32, pick, pickPrefer, randInt, shuffle, type Rng } from "./rng";

const META = {
  source: "qudrah-qudurat-style-bank-2026-v4",
  review_status: "approved" as const,
  reviewed_by: "generator",
  reviewed_at: "2026-09-23T12:00:00.000Z",
};

export type GenQ = Question & { fingerprint: string };

function pct(n: number): string {
  return `${Math.round(n)}٪`;
}

function num(n: number): string {
  if (!Number.isFinite(n)) return "0";
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

function steps(...lines: string[]): string {
  return lines.map((l, i) => `${i + 1}) ${l}`).join("\n");
}

type ChoiceItem = { value: string; note: string | null };

function buildChoices(
  rng: Rng,
  correct: string,
  traps: string[],
  trapNotes?: string[]
): { choices_ar: string[]; correct_index: number; notes: (string | null)[] } {
  const items: ChoiceItem[] = [{ value: correct, note: null }];
  traps.forEach((t, i) => {
    if (!t || t === correct || t.includes("undefined") || t.includes("NaN")) return;
    if (items.some((x) => x.value === t)) return;
    items.push({
      value: t,
      note: trapNotes?.[i] ?? "خيار شائع لكنه غير صحيح لهذا السؤال.",
    });
  });
  let guard = 0;
  while (items.length < 4 && guard < 24) {
    const filler = String(randInt(rng, 2, 280));
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

export function isCleanGenQ(q: GenQ): boolean {
  const blob = [
    q.prompt_ar,
    q.solve_ar,
    ...q.choices_ar,
    String(q.correct_index),
  ].join("|");
  if (/undefined|NaN|null|Infinity/i.test(blob)) return false;
  if (q.choices_ar.length !== 4) return false;
  if (new Set(q.choices_ar).size !== 4) return false;
  if (q.correct_index < 0 || q.correct_index > 3) return false;
  if (!q.choices_ar.every((c) => c && String(c).trim().length > 0)) return false;
  return true;
}

// ─── Authentic multi-step percent / successive ───────────

/** مثل سؤال السيارة: نقص كسر ثم كسر من السعر الحالي */
function genFracSuccessivePrice(rng: Rng, seq: number): GenQ {
  const base = pick(rng, [60000, 72000, 80000, 90000, 96000, 120000]);
  // year1: lose a/b of price; year2: lose c/d of CURRENT
  const fracs: [number, number][] = [
    [1, 3],
    [1, 4],
    [1, 5],
    [2, 5],
    [1, 2],
  ];
  const [a, b] = pick(rng, fracs);
  const [c, d] = pickPrefer(
    rng,
    fracs.filter(([x, y]) => !(x === a && y === b)),
    fracs
  );
  const after1 = (base * (b - a)) / b;
  if (!Number.isInteger(after1)) {
    // force clean with 1/3 then 1/4 of 90000
    const b0 = 90000;
    const a1 = (b0 * 2) / 3;
    const a2 = (a1 * 3) / 4;
    return makeQ(
      `qh-frac-price-${seq}`,
      `qh-fp:90000:1/3:1/4`,
      `سيارة سعرها ${b0} ريالاً انخفض سعرها في السنة الأولى بنسبة الثلث، وفي السنة الثانية انخفض ربع سعرها الحالي. أوجد السعر بعد السنة الثانية.`,
      num(a2),
      [num(35000), num(a1), num(b0 * (1 - 1 / 3 - 1 / 4))],
      steps(
        `بعد السنة الأولى يبقى ${(b0 * 2) / 3} من السعر: ${b0} × 2/3 = ${a1}.`,
        `بعد السنة الثانية يبقى 3/4 من السعر الحالي: ${a1} × 3/4 = ${a2}.`,
        `لا تُجمع الكسور على الأصل مباشرة (ذلك يعطي ${b0 * (1 - 1 / 3 - 1 / 4)} وهو خطأ).`,
        `الإجابة = ${a2}.`
      ),
      "successive",
      "hard",
      rng,
      [
        "جمعت الكسور وطرحتهما من الأصل مرة واحدة.",
        "حسبت السنة الأولى فقط.",
        "طبّقت الخصم الثاني على السعر الأصلي.",
      ]
    );
  }
  const after2 = (after1 * (d - c)) / d;
  if (!Number.isInteger(after2)) {
    return genFracSuccessivePrice(mulberry32(seq * 17 + 3), seq + 1);
  }
  const naive = Math.round(base * (1 - a / b - c / d));
  const label1 =
    a === 1 && b === 2
      ? "النصف"
      : a === 1 && b === 3
        ? "الثلث"
        : a === 1 && b === 4
          ? "الربع"
          : a === 1 && b === 5
            ? "الخُمس"
            : `${a}/${b}`;
  const label2 =
    c === 1 && d === 2
      ? "نصف"
      : c === 1 && d === 3
        ? "ثلث"
        : c === 1 && d === 4
          ? "ربع"
          : c === 1 && d === 5
            ? "خُمس"
            : `${c}/${d}`;
  return makeQ(
    `qh-frac-price-${seq}`,
    `qh-fp:${base}:${a}/${b}:${c}/${d}`,
    `سيارة سعرها ${base} ريالاً انخفض سعرها في السنة الأولى بنسبة ${label1}، وفي السنة الثانية انخفض ${label2} سعرها الحالي. أوجد السعر بعد السنة الثانية.`,
    num(after2),
    [num(naive), num(after1), num(Math.round(after1 * (1 - c / d) - 5000))],
    steps(
      `السنة الأولى: يتبقى ${(b - a)}/${b} من ${base} = ${after1}.`,
      `السنة الثانية: يتبقى ${(d - c)}/${d} من ${after1} = ${after2}.`,
      `الخصم الثاني يُحسب من السعر بعد الخصم الأول وليس من الأصل.`,
      `الإجابة = ${after2}.`
    ),
    "successive",
    "hard",
    rng
  );
}

/** زيادة ثم نقص بنسب مختلفة — لا إلغاء */
function genSuccessivePctHard(rng: Rng, seq: number): GenQ {
  const base = randInt(rng, 40, 160) * 10;
  const up = pick(rng, [20, 25, 30, 40]);
  const down = pickPrefer(
    rng,
    [10, 20, 25, 30, 40].filter((x) => x !== up),
    [10, 20, 25]
  );
  const mid = Math.round(base * (1 + up / 100));
  const final = Math.round(mid * (1 - down / 100));
  const naive = Math.round(base * (1 + (up - down) / 100));
  return makeQ(
    `qh-suc-pct-${seq}`,
    `qh-suc:${base}:${up}:${down}`,
    `عدد يساوي ${base} زاد بنسبة ${up}٪ ثم نقص بنسبة ${down}٪ من قيمته بعد الزيادة. ما الناتج النهائي؟`,
    num(final),
    [num(base), num(naive), num(mid)],
    steps(
      `بعد الزيادة: ${base} × (1 + ${up}/100) = ${mid}.`,
      `بعد النقص: ${mid} × (1 − ${down}/100) = ${final}.`,
      `لا تُطرح النسبتان (${up}−${down}) ثم تُطبَّق على الأصل (ذلك يعطي ${naive}).`,
      `الإجابة = ${final}.`
    ),
    "successive",
    "hard",
    rng,
    [
      "ظننت أن الزيادة والنقص بنفس الفكرة يلغيان بعضهما أو يُطرحان.",
      "توقفت بعد الزيادة.",
      "طبّقت النقص على الأصل مباشرة.",
    ]
  );
}

/** نسبة من نسبة */
function genPctOfPct(rng: Rng, seq: number): GenQ {
  const p1 = pick(rng, [20, 25, 40, 50]);
  const p2 = pick(rng, [10, 20, 25, 40, 50]);
  const bases = [100, 200, 400, 500, 800, 1000].filter(
    (b) => (b * p1) % 100 === 0 && (((b * p1) / 100) * p2) % 100 === 0
  );
  const base = pickPrefer(rng, bases, [200, 400, 1000]);
  const part = (base * p1) / 100;
  const ans = (part * p2) / 100;
  return makeQ(
    `qh-pctof-${seq}`,
    `qh-pctof:${base}:${p1}:${p2}`,
    `ما قيمة ${p2}٪ من ${p1}٪ من ${base}؟`,
    num(ans),
    [
      num((base * (p1 + p2)) / 100),
      num((base * p1 * p2) / 100),
      num(part),
    ],
    steps(
      `${p1}٪ من ${base} = ${base} × ${p1}/100 = ${part}.`,
      `${p2}٪ من ${part} = ${part} × ${p2}/100 = ${ans}.`,
      `يمكن أيضاً: ${base} × (${p1}/100) × (${p2}/100) = ${ans}.`,
      `لا تجمع النسبتين ولا تضربهما في الأصل دون ÷100 مرتين.`,
      `الإجابة = ${ans}.`
    ),
    "percent",
    "hard",
    rng
  );
}

/** إيجاد الأصل بعد زيادة */
function genFindBase(rng: Rng, seq: number): GenQ {
  const p = pick(rng, [20, 25, 30, 40]);
  const base = randInt(rng, 40, 200) * 5;
  const neu = Math.round(base * (1 + p / 100));
  return makeQ(
    `qh-base-${seq}`,
    `qh-base:${base}:${p}`,
    `زاد السعر بنسبة ${p}٪ فأصبح ${neu}. ما السعر الأصلي؟`,
    num(base),
    [
      num(neu - Math.round((neu * p) / 100)),
      num(Math.round(neu * (1 - p / 100))),
      num(neu),
    ],
    steps(
      `السعر الجديد = الأصل × (1 + ${p}/100).`,
      `الأصل = ${neu} ÷ ${1 + p / 100} = ${base}.`,
      `خطأ شائع: طرح ${p}٪ من ${neu} مباشرة فيعطي ${neu - Math.round((neu * p) / 100)}.`,
      `الإجابة = ${base}.`
    ),
    "percent",
    "hard",
    rng
  );
}

/** خصمان متتاليان */
function genDoubleDiscount(rng: Rng, seq: number): GenQ {
  const base = randInt(rng, 50, 200) * 10;
  const p1 = pick(rng, [10, 15, 20, 25]);
  const p2 = pickPrefer(
    rng,
    [10, 15, 20, 25].filter((x) => x !== p1),
    [10, 20]
  );
  const mid = Math.round(base * (1 - p1 / 100));
  const final = Math.round(mid * (1 - p2 / 100));
  const naive = Math.round(base * (1 - (p1 + p2) / 100));
  return makeQ(
    `qh-dd-${seq}`,
    `qh-dd:${base}:${p1}:${p2}`,
    `سعر ${base} خُفض بنسبة ${p1}٪ ثم بنسبة ${p2}٪ إضافية على السعر بعد الخصم الأول. السعر النهائي؟`,
    num(final),
    [num(naive), num(mid), num(base - Math.round((base * (p1 + p2)) / 100))],
    steps(
      `بعد الخصم الأول: ${base} × (1 − ${p1}/100) = ${mid}.`,
      `بعد الخصم الثاني: ${mid} × (1 − ${p2}/100) = ${final}.`,
      `جمع النسبتين ${p1}+${p2} ثم طرحهما من الأصل يعطي ${naive} وهو خطأ.`,
      `الإجابة = ${final}.`
    ),
    "percent",
    "hard",
    rng
  );
}

// ─── Ratio / work / fractions ────────────────────────────

function genRatioThreeHard(rng: Rng, seq: number): GenQ {
  const a = randInt(rng, 2, 5);
  const b = randInt(rng, 2, 6);
  const c = randInt(rng, 2, 6);
  const unit = randInt(rng, 5, 18);
  const total = (a + b + c) * unit;
  const ask = pick(rng, [0, 1, 2] as const);
  const shares = [a * unit, b * unit, c * unit] as const;
  const labels = ["الأول", "الثاني", "الثالث"] as const;
  return makeQ(
    `qh-r3-${seq}`,
    `qh-r3:${total}:${a}:${b}:${c}:${ask}`,
    `قُسّم مبلغ ${total} بنسبة ${a}:${b}:${c}. نصيب ${labels[ask]}؟`,
    num(shares[ask]),
    [num(shares[(ask + 1) % 3]!), num(unit), num(Math.round(total / 3))],
    steps(
      `مجموع الأجزاء = ${a}+${b}+${c} = ${a + b + c}.`,
      `قيمة الجزء الواحد = ${total} ÷ ${a + b + c} = ${unit}.`,
      `نصيب ${labels[ask]} = ${[a, b, c][ask]} × ${unit} = ${shares[ask]}.`,
      `الإجابة = ${shares[ask]}.`
    ),
    "ratio",
    "hard",
    rng
  );
}

function genInverseWorkHard(rng: Rng, seq: number): GenQ {
  const w1 = pick(rng, [2, 3, 4, 5, 6]);
  const d1 = pick(rng, [6, 8, 9, 10, 12, 15]);
  const work = w1 * d1;
  const candidates = [2, 3, 4, 5, 6, 8, 9, 10].filter(
    (x) => x !== w1 && work % x === 0
  );
  const w2 = pickPrefer(rng, candidates, [w1 * 2].filter((x) => work % x === 0));
  const d2 = work / w2;
  if (!Number.isInteger(d2) || d2 <= 0) {
    return makeQ(
      `qh-work-${seq}`,
      `qh-work:4:12:6`,
      `4 عمال ينجزون عملاً في 12 يوماً. كم يوماً يحتاج 6 عمال لنفس العمل (بنفس المعدل)؟`,
      num(8),
      [num(18), num(9), num(6)],
      steps(
        `كمية العمل ثابتة: 4 × 12 = 48 يوم·عامل.`,
        `للعمال الستة: عدد الأيام = 48 ÷ 6 = 8.`,
        `التناسب عكسي: كلما زاد العمال قلّ الزمن.`,
        `الإجابة = 8.`
      ),
      "ratio",
      "hard",
      rng
    );
  }
  return makeQ(
    `qh-work-${seq}`,
    `qh-work:${w1}:${d1}:${w2}`,
    `${w1} عمال ينجزون عملاً في ${d1} يوماً. كم يوماً يحتاج ${w2} عمال لنفس العمل (بنفس المعدل)؟`,
    num(d2),
    [num(d1 + w2), num(Math.round((w1 * d1) / (w2 - 1))), num(d1)],
    steps(
      `كمية العمل = ${w1} × ${d1} = ${work} يوم·عامل.`,
      `عدد الأيام مع ${w2} عمال = ${work} ÷ ${w2} = ${d2}.`,
      `العلاقة عكسية بين عدد العمال وعدد الأيام.`,
      `الإجابة = ${d2}.`
    ),
    "ratio",
    "hard",
    rng
  );
}

/** كسر ثم كسر من الباقي */
function genFracChainHard(rng: Rng, seq: number): GenQ {
  const whole = pick(rng, [60, 80, 90, 120, 150, 180, 240]);
  const d1 = pick(rng, [2, 3, 4, 5]);
  const d2 = pickPrefer(
    rng,
    [2, 3, 4, 5].filter((d) => d !== d1),
    [2, 3, 4]
  );
  const first = whole / d1;
  if (!Number.isInteger(first)) {
    return genFracChainHard(mulberry32(seq * 11 + 5), seq + 1);
  }
  const left = whole - first;
  const second = left / d2;
  if (!Number.isInteger(second)) {
    return genFracChainHard(mulberry32(seq * 13 + 7), seq + 1);
  }
  const remain = left - second;
  return makeQ(
    `qh-fchain-${seq}`,
    `qh-fc:${whole}:${d1}:${d2}`,
    `مبلغ ${whole}. أُخذ منه 1/${d1}، ثم أُخذ من الباقي 1/${d2}. كم تبقّى؟`,
    num(remain),
    [num(left), num(second), num(first)],
    steps(
      `المأخوذ أولاً = ${whole} ÷ ${d1} = ${first}.`,
      `الباقي بعد الأولى = ${whole} − ${first} = ${left}.`,
      `المأخوذ ثانياً = ${left} ÷ ${d2} = ${second}.`,
      `المتبقي = ${left} − ${second} = ${remain}.`,
      `الإجابة = ${remain}.`
    ),
    "fraction",
    "hard",
    rng
  );
}

// ─── Algebra (Qudurat style) ─────────────────────────────

/** إذا كان 3×عدد = 7 فما 21×العدد؟ */
function genScaleProduct(rng: Rng, seq: number): GenQ {
  const k = pick(rng, [2, 3, 4, 5]);
  const m = pick(rng, [5, 7, 9, 11]);
  const factor = pick(rng, [3, 4, 5, 6, 7]);
  const ans = m * factor;
  // k * n = m  ⇒  (k*factor)*n = m*factor
  return makeQ(
    `qh-scale-${seq}`,
    `qh-scale:${k}:${m}:${factor}`,
    `إذا كان ناتج ضرب عدد ما في ${k} هو ${m}، فما ناتج ضرب هذا العدد في ${k * factor}؟`,
    num(ans),
    [num(m), num(k * factor), num(m * k)],
    steps(
      `ليكن العدد س، إذن ${k}س = ${m} ⇒ س = ${m}/${k}.`,
      `المطلوب: (${k * factor})س = ${factor} × (${k}س) = ${factor} × ${m} = ${ans}.`,
      `لاحظ أن المضاعف ${factor} يُضرب في الناتج مباشرة دون إيجاد س صراحة.`,
      `الإجابة = ${ans}.`
    ),
    "algebra",
    "hard",
    rng,
    [
      "أجبت بالناتج الأصلي دون مضاعفة.",
      "أجبت بمعامل الضرب الجديد.",
      "ضربت العددين الأصليين في بعض.",
    ]
  );
}

function genLinearTwoSide(rng: Rng, seq: number): GenQ {
  const x = randInt(rng, 2, 14);
  const a = randInt(rng, 2, 6);
  let c = randInt(rng, 2, 7);
  if (c === a) c = a + 1; // avoid identity / division by zero
  const b = randInt(rng, 1, 9);
  const left = a * (x + b);
  const k = left - c * x;
  return makeQ(
    `qh-lin-${seq}`,
    `qh-lin:${a}:${b}:${c}:${k}`,
    `حل المعادلة: ${a}(س + ${b}) = ${c}س ${k < 0 ? "−" : "+"} ${Math.abs(k)}`,
    num(x),
    [num(x + 1), num(b), num(Math.abs(k))],
    steps(
      `وسّع القوس: ${a}س + ${a * b} = ${c}س ${k < 0 ? "−" : "+"} ${Math.abs(k)}.`,
      `انقل حدود س: ${a}س − ${c}س = ${k} − ${a * b}.`,
      `${a - c}س = ${k - a * b}.`,
      `س = ${x}.`,
      `الإجابة = ${x}.`
    ),
    "algebra",
    "hard",
    rng
  );
}

function genAgeHard(rng: Rng, seq: number): GenQ {
  // Clean classic: father 3× son(10), when 2×? → 10 years
  const presets: {
    son: number;
    k: number;
    m: number;
    y: number;
  }[] = [
    { son: 10, k: 3, m: 2, y: 10 },
    { son: 8, k: 4, m: 2, y: 8 },
    { son: 12, k: 3, m: 2, y: 12 },
    { son: 6, k: 5, m: 3, y: 6 },
    { son: 9, k: 4, m: 2, y: 9 },
  ];
  const p = pick(rng, presets);
  const father = p.k * p.son;
  return makeQ(
    `qh-age-${seq}`,
    `qh-age:${p.son}:${p.k}:${p.m}`,
    `عمر الأب الآن ${p.k} أمثال عمر ابنه (${p.son} سنوات). بعد كم سنة يصبح عمر الأب ${p.m} أمثال عمر الابن؟`,
    num(p.y),
    [num(p.son), num(father - p.son), num(p.y + p.son)],
    steps(
      `عمر الأب الآن = ${p.k} × ${p.son} = ${father}.`,
      `بعد س سنة: ${father}+س = ${p.m}(${p.son}+س).`,
      `${father}+س = ${p.m * p.son} + ${p.m}س.`,
      `${father} − ${p.m * p.son} = ${p.m}س − س ⇒ ${father - p.m * p.son} = ${(p.m - 1)}س.`,
      `س = ${p.y}.`,
      `فرق العمر ثابت (${father - p.son}) ولا يساوي عدد السنوات مباشرة في كل الحالات.`,
      `الإجابة = ${p.y}.`
    ),
    "algebra",
    "hard",
    rng
  );
}

function genEvalQuad(rng: Rng, seq: number): GenQ {
  const x = randInt(rng, 2, 9);
  const a = randInt(rng, 2, 5);
  const b = randInt(rng, 1, 8);
  const c = randInt(rng, 1, 6);
  const ans = a * x * x - b * x + c;
  return makeQ(
    `qh-quad-${seq}`,
    `qh-quad:${a}:${x}:${b}:${c}`,
    `إذا كان س = ${x}، فما قيمة ${a}س² − ${b}س + ${c}؟`,
    num(ans),
    [
      num(a * x - b * x + c),
      num(a * x * x + b * x + c),
      num((a - b) * x + c),
    ],
    steps(
      `احسب س² أولاً: ${x}² = ${x * x}.`,
      `${a} × ${x * x} = ${a * x * x}.`,
      `${b} × ${x} = ${b * x}.`,
      `الناتج = ${a * x * x} − ${b * x} + ${c} = ${ans}.`,
      `الإجابة = ${ans}.`
    ),
    "algebra",
    "hard",
    rng
  );
}

// ─── Comparison (core of Qudurat) ────────────────────────

function genIdentityCompare(rng: Rng, seq: number): GenQ {
  // x²−y² vs (x−y)(x+y) → equal always
  return makeQ(
    `qh-id-${seq}`,
    `qh-id:diff-sq`,
    `قارن بين القيمة الأولى: س² − ص² ، والقيمة الثانية: (س − ص)(س + ص)`,
    "متساويتان",
    ["أ أكبر", "ب أكبر", "المعطيات غير كافية"],
    steps(
      `متطابقة شهيرة: س² − ص² = (س − ص)(س + ص).`,
      `القيمتان متساويتان دائماً لأي س وص.`,
      `لا نحتاج قيماً عددية.`,
      `الإجابة = متساويتان.`
    ),
    "comparison",
    "hard",
    rng
  );
}

function genTriangleAnglesCompare(rng: Rng, seq: number): GenQ {
  return makeQ(
    `qh-tri-cmp-${seq}`,
    `qh-tri-cmp:180`,
    `قارن بين: القيمة الأولى = مجموع قياسات زوايا مثلث قائم الزاوية، والقيمة الثانية = مجموع قياسات زوايا مثلث منفرج الزاوية.`,
    "متساويتان",
    ["أ أكبر", "ب أكبر", "المعطيات غير كافية"],
    steps(
      `مجموع زوايا أي مثلث في المستوى = 180° دائماً.`,
      `سواء كان المثلث قائماً أو منفرجاً أو حادّاً فالمجموع واحد.`,
      `القيمتان متساويتان.`,
      `الإجابة = متساويتان.`
    ),
    "comparison",
    "hard",
    rng
  );
}

function genAlgCompareNums(rng: Rng, seq: number): GenQ {
  const a = randInt(rng, 3, 12);
  const b = randInt(rng, 3, 12);
  const left = a * a + b * b;
  const right = (a + b) * (a + b);
  // left < right always for positive a,b since (a+b)² = a²+b²+2ab
  return makeQ(
    `qh-cmp-ab-${seq}`,
    `qh-cmp-ab:${a}:${b}`,
    `قارن بين القيمة الأولى: ${a}² + ${b}² ، والقيمة الثانية: (${a} + ${b})²`,
    "ب أكبر",
    ["أ أكبر", "متساويتان", "المعطيات غير كافية"],
    steps(
      `القيمة الأولى = ${a}² + ${b}² = ${left}.`,
      `القيمة الثانية = (${a}+${b})² = ${a + b}² = ${right}.`,
      `أو بالقاعدة: (أ+ب)² = أ² + ب² + 2أب، والحد 2أب موجب.`,
      `إذن الثانية أكبر.`,
      `الإجابة = ب أكبر.`
    ),
    "comparison",
    "hard",
    rng
  );
}

function genPctCompare(rng: Rng, seq: number): GenQ {
  const baseA = pick(rng, [80, 100, 120, 160]);
  const baseB = pickPrefer(
    rng,
    [80, 100, 120, 160, 200].filter((x) => x !== baseA),
    [100, 200]
  );
  const p = pick(rng, [10, 20, 25]);
  const valA = Math.round((baseA * p) / 100);
  const valB = Math.round((baseB * p) / 100);
  let correct: string;
  if (valA > valB) correct = "أ أكبر";
  else if (valB > valA) correct = "ب أكبر";
  else correct = "متساويتان";
  return makeQ(
    `qh-pct-cmp-${seq}`,
    `qh-pct-cmp:${baseA}:${baseB}:${p}`,
    `قارن بين: القيمة الأولى = ${p}٪ من ${baseA}، والقيمة الثانية = ${p}٪ من ${baseB}.`,
    correct,
    ["أ أكبر", "ب أكبر", "متساويتان", "المعطيات غير كافية"].filter(
      (t) => t !== correct
    ),
    steps(
      `${p}٪ من ${baseA} = ${valA}.`,
      `${p}٪ من ${baseB} = ${valB}.`,
      `نقارن ${valA} و ${valB}.`,
      `الإجابة = ${correct}.`
    ),
    "comparison",
    "hard",
    rng
  );
}

// ─── Geometry ────────────────────────────────────────────

function genRhombusArea(rng: Rng, seq: number): GenQ {
  const d1 = pick(rng, [4, 6, 8, 10, 12]);
  const d2 = pickPrefer(
    rng,
    [4, 6, 8, 10, 12, 14].filter((x) => x !== d1),
    [6, 10]
  );
  const area = (d1 * d2) / 2;
  if (!Number.isInteger(area)) {
    return genRhombusArea(mulberry32(seq * 19 + 2), seq + 1);
  }
  return makeQ(
    `qh-rhomb-${seq}`,
    `qh-rhomb:${d1}:${d2}`,
    `معين طولا قطريه ${d1} سم و ${d2} سم. أوجد مساحته.`,
    num(area),
    [num(d1 + d2), num(d1 * d2), num((d1 * d2) / 4)],
    steps(
      `مساحة المعين = (القطر الأول × القطر الثاني) ÷ 2.`,
      `المساحة = (${d1} × ${d2}) ÷ 2 = ${d1 * d2} ÷ 2 = ${area}.`,
      `لا تُجمع القطران ولا يُضربان دون القسمة على 2.`,
      `الإجابة = ${area}.`
    ),
    "geometry",
    "hard",
    rng
  );
}

function genPythagClean(rng: Rng, seq: number): GenQ {
  const triples: [number, number, number][] = [
    [3, 4, 5],
    [5, 12, 13],
    [6, 8, 10],
    [7, 24, 25],
    [8, 15, 17],
    [9, 12, 15],
  ];
  const [a, b, c] = pick(rng, triples);
  const k = pick(rng, [1, 2]);
  const A = a * k;
  const B = b * k;
  const C = c * k;
  const mode = pick(rng, ["hyp", "leg"] as const);
  if (mode === "hyp") {
    return makeQ(
      `qh-py-${seq}`,
      `qh-py-h:${A}:${B}`,
      `مثلث قائم الزاوية ضلعاه القائمـان ${A} و ${B}. ما طول الوتر؟`,
      num(C),
      [num(A + B), num(C + k), num(Math.abs(B - A))],
      steps(
        `نظرية فيثاغورس: الوتر² = ${A}² + ${B}².`,
        `${A}² + ${B}² = ${A * A} + ${B * B} = ${A * A + B * B}.`,
        `الوتر = √${A * A + B * B} = ${C}.`,
        `الإجابة = ${C}.`
      ),
      "geometry",
      "hard",
      rng
    );
  }
  return makeQ(
    `qh-py-${seq}`,
    `qh-py-l:${C}:${A}`,
    `مثلث قائم الوتر فيه ${C} وأحد الضلعين القائمين ${A}. ما طول الضلع الآخر؟`,
    num(B),
    [num(C - A), num(C + A), num(A)],
    steps(
      `الضلع² = الوتر² − الضلع المعلوم².`,
      `= ${C}² − ${A}² = ${C * C} − ${A * A} = ${C * C - A * A}.`,
      `الضلع = √${C * C - A * A} = ${B}.`,
      `الإجابة = ${B}.`
    ),
    "geometry",
    "hard",
    rng
  );
}

function genCircleArea(rng: Rng, seq: number): GenQ {
  const r = pick(rng, [3, 4, 5, 6, 7, 10]);
  const ask = pick(rng, ["area", "circ"] as const);
  if (ask === "area") {
    // leave π symbolic as multiple
    const ans = `${r * r}π`;
    return makeQ(
      `qh-cir-${seq}`,
      `qh-cir-a:${r}`,
      `دائرة نصف قطرها ${r}. مساحتها بدلالة π؟`,
      ans,
      [`${2 * r}π`, `${r * 2 * r}`, num(Math.PI * r * r)],
      steps(
        `مساحة الدائرة = π ر².`,
        `= π × ${r}² = ${r * r}π.`,
        `لا تخلط مع المحيط 2πر.`,
        `الإجابة = ${ans}.`
      ),
      "geometry",
      "hard",
      rng
    );
  }
  const ans = `${2 * r}π`;
  return makeQ(
    `qh-cir-${seq}`,
    `qh-cir-c:${r}`,
    `دائرة نصف قطرها ${r}. محيطها بدلالة π؟`,
    ans,
    [`${r * r}π`, `${r}π`, num(2 * Math.PI * r)],
    steps(
      `محيط الدائرة = 2πر.`,
      `= 2 × π × ${r} = ${2 * r}π.`,
      `الإجابة = ${ans}.`
    ),
    "geometry",
    "hard",
    rng
  );
}

function genRectDiagArea(rng: Rng, seq: number): GenQ {
  const w = pick(rng, [6, 8, 9, 10, 12]);
  const h = pickPrefer(
    rng,
    [4, 5, 6, 8, 9, 12].filter((x) => x !== w),
    [4, 5, 8]
  );
  const area = w * h;
  const peri = 2 * (w + h);
  const ask = pick(rng, ["area", "peri"] as const);
  if (ask === "area") {
    return makeQ(
      `qh-rect-${seq}`,
      `qh-rect-a:${w}:${h}`,
      `مستطيل طوله ${w} وعرضه ${h}. مساحته؟`,
      num(area),
      [num(peri), num(w + h), num(w * h + w)],
      steps(
        `مساحة المستطيل = الطول × العرض.`,
        `= ${w} × ${h} = ${area}.`,
        `لا تخلط مع المحيط 2(ط+ع) = ${peri}.`,
        `الإجابة = ${area}.`
      ),
      "geometry",
      "hard",
      rng
    );
  }
  return makeQ(
    `qh-rect-${seq}`,
    `qh-rect-p:${w}:${h}`,
    `مستطيل طوله ${w} وعرضه ${h}. محيطه؟`,
    num(peri),
    [num(area), num(w + h), num(2 * w + h)],
    steps(
      `محيط المستطيل = 2(الطول + العرض).`,
      `= 2(${w} + ${h}) = 2×${w + h} = ${peri}.`,
      `الإجابة = ${peri}.`
    ),
    "geometry",
    "hard",
    rng
  );
}

// ─── Number sense / combinatorics ────────────────────────

/** أطفال وهدايا: n(n-1)=12 */
function genGiftsKids(rng: Rng, seq: number): GenQ {
  const presets: { n: number; gifts: number }[] = [
    { n: 4, gifts: 12 },
    { n: 5, gifts: 20 },
    { n: 6, gifts: 30 },
    { n: 3, gifts: 6 },
  ];
  const p = pick(rng, presets);
  return makeQ(
    `qh-gift-${seq}`,
    `qh-gift:${p.n}`,
    `كل طفل يوزّع هدية واحدة على كل طفل آخر، وبلغ مجموع الهدايا ${p.gifts}. كم عدد الأطفال؟`,
    num(p.n),
    [num(p.n + 1), num(p.n - 1), num(p.gifts / 2)],
    steps(
      `إذا كان العدد ن، فكل طفل يعطي (ن−1) هدية.`,
      `المجموع = ن(ن−1) = ${p.gifts}.`,
      `نجرب: ${p.n}×${p.n - 1} = ${p.gifts}.`,
      `الإجابة = ${p.n}.`
    ),
    "number_sense",
    "hard",
    rng
  );
}

function genCompareProducts(rng: Rng, seq: number): GenQ {
  const a = randInt(rng, 12, 40);
  const b = randInt(rng, 12, 40);
  const left = a * b;
  const right = (a + 1) * (b - 1);
  const L = `${a}×${b}`;
  const R = `${a + 1}×${b - 1}`;
  const correct = left === right ? "متساويان" : left > right ? L : R;
  return makeQ(
    `qh-ns-${seq}`,
    `qh-ns:${a}:${b}`,
    `أيّهما أكبر: ${L} أم ${R}؟`,
    correct,
    [left > right ? R : L, "متساويان", String(Math.max(left, right))].filter(
      (t) => t !== correct
    ),
    steps(
      `${L} = ${left}.`,
      `${R} = ${right}.`,
      `ملاحظة: (أ+1)(ب−1) = أب −أ +ب −1 = أب + (ب−أ−1).`,
      `المقارنة العددية تعطي: ${correct}.`,
      `الإجابة = ${correct}.`
    ),
    "number_sense",
    "hard",
    rng
  );
}

// ─── Rate / average / buy-sell ───────────────────────────

function genRateRest(rng: Rng, seq: number): GenQ {
  const speed = pick(rng, [40, 50, 60, 72, 80]);
  const hours = pick(rng, [2, 3, 4]);
  const restMin = pick(rng, [30, 40, 45, 60]);
  const dist = speed * hours;
  const totalH = hours + restMin / 60;
  const avg = Math.round((dist / totalH) * 100) / 100;
  return makeQ(
    `qh-rate-${seq}`,
    `qh-rate:${speed}:${hours}:${restMin}`,
    `سيارة سرعتها ${speed} كم/س سارت ${hours} ساعات ثم توقفت ${restMin} دقيقة. متوسط السرعة للرحلة كلها (شاملاً التوقف)؟`,
    num(avg),
    [num(speed), num(dist), num(Math.round(speed * (hours / totalH)))],
    steps(
      `المسافة = ${speed} × ${hours} = ${dist} كم.`,
      `زمن التوقف = ${restMin}/60 = ${restMin / 60} ساعة.`,
      `الزمن الكلي = ${hours} + ${restMin / 60} = ${totalH} ساعة.`,
      `متوسط السرعة = المسافة ÷ الزمن الكلي = ${dist} ÷ ${totalH} = ${avg}.`,
      `لا تأخذ سرعة السير ${speed} كمتوسط للرحلة.`,
      `الإجابة = ${avg}.`
    ),
    "rate",
    "hard",
    rng
  );
}

function genAvgMissing(rng: Rng, seq: number): GenQ {
  const n = pick(rng, [4, 5, 6]);
  const target = randInt(rng, 60, 90);
  const known: number[] = [];
  let sum = 0;
  for (let i = 0; i < n - 1; i++) {
    const v = randInt(rng, target - 15, target + 15);
    known.push(v);
    sum += v;
  }
  const missing = target * n - sum;
  return makeQ(
    `qh-avg-${seq}`,
    `qh-avg:${n}:${target}:${known.join(",")}`,
    `متوسط ${n} درجات يجب أن يكون ${target}. إذا كانت الدرجات المعروفة: ${known.join("، ")}، فما الدرجة الناقصة؟`,
    num(missing),
    [
      num(target),
      num(Math.round(sum / (n - 1))),
      num(target * n - known[0]!),
    ],
    steps(
      `مجموع الدرجات المطلوب = ${target} × ${n} = ${target * n}.`,
      `مجموع المعروف = ${known.join(" + ")} = ${sum}.`,
      `الدرجة الناقصة = ${target * n} − ${sum} = ${missing}.`,
      `الإجابة = ${missing}.`
    ),
    "average",
    "hard",
    rng
  );
}

function genBuySellHard(rng: Rng, seq: number): GenQ {
  const cost = randInt(rng, 40, 120) * 5;
  const markup = pick(rng, [20, 25, 30, 40]);
  const discount = pickPrefer(
    rng,
    [10, 15, 20, 25].filter((x) => x !== markup),
    [10, 20]
  );
  const listed = Math.round(cost * (1 + markup / 100));
  const paid = Math.round(listed * (1 - discount / 100));
  const profit = paid - cost;
  const ask = pick(rng, ["paid", "profit"] as const);
  if (ask === "paid") {
    return makeQ(
      `qh-bs-${seq}`,
      `qh-bs-p:${cost}:${markup}:${discount}`,
      `تكلفة سلعة ${cost}. وُضعت بنسبة ربح ${markup}٪ ثم خُفض السعر بنسبة ${discount}٪. كم دفع المشتري؟`,
      num(paid),
      [num(listed), num(cost), num(Math.round(cost * (1 + (markup - discount) / 100)))],
      steps(
        `سعر القائمة = ${cost} × (1+${markup}/100) = ${listed}.`,
        `بعد الخصم = ${listed} × (1−${discount}/100) = ${paid}.`,
        `لا تطرح نسبتي الربح والخصم من التكلفة مباشرة.`,
        `الإجابة = ${paid}.`
      ),
      "buy_sell",
      "hard",
      rng
    );
  }
  return makeQ(
    `qh-bs-${seq}`,
    `qh-bs-r:${cost}:${markup}:${discount}`,
    `تكلفة سلعة ${cost}. وُضعت بنسبة ربح ${markup}٪ ثم خُفض السعر بنسبة ${discount}٪. كم ربح البائع؟`,
    num(profit),
    [num(paid), num(listed - cost), num(Math.round((cost * markup) / 100))],
    steps(
      `سعر القائمة = ${listed}.`,
      `سعر البيع = ${paid}.`,
      `الربح = سعر البيع − التكلفة = ${paid} − ${cost} = ${profit}.`,
      `الإجابة = ${profit}.`
    ),
    "buy_sell",
    "hard",
    rng
  );
}

// ─── Statistics / probability ────────────────────────────

function genProbNoReplace(rng: Rng, seq: number): GenQ {
  const red = pick(rng, [3, 4, 5, 6, 7, 8]);
  const blue = pick(rng, [2, 3, 4, 5, 6]);
  const total = red + blue;
  const nume = red * (red - 1);
  const den = total * (total - 1);
  const ans = simplifyFrac(nume, den);
  return makeQ(
    `qh-prob-${seq}`,
    `qh-prob:${red}:${blue}`,
    `كيس فيه ${red} كرات حمراء و ${blue} زرقاء. سُحبت كرتان بالتتابع دون إرجاع. احتمال أن تكونا حمراوين؟`,
    ans,
    [
      simplifyFrac(red, total),
      simplifyFrac(red * red, total * total),
      simplifyFrac(red, total - 1),
    ],
    steps(
      `احتمال الأولى حمراء = ${red}/${total}.`,
      `بعد سحب حمراء دون إرجاع يبقى ${red - 1} حمراء من ${total - 1}.`,
      `الاحتمال = (${red}/${total}) × (${red - 1}/${total - 1}) = ${simplifyFrac(nume, den)}.`,
      `لا تستخدم الاحتمال مع إرجاع (${red}/${total})².`,
      `الإجابة = ${ans}.`
    ),
    "probability",
    "hard",
    rng
  );
}

function genMedianHard(rng: Rng, seq: number): GenQ {
  const mid = randInt(rng, 20, 60);
  const data = [
    mid - 12,
    mid - 5,
    mid,
    mid + 4,
    mid + 11,
  ];
  // shuffle display order
  const shown = shuffle(rng, [...data]);
  return makeQ(
    `qh-med-${seq}`,
    `qh-med:${data.join(",")}`,
    `أوجد الوسيط للبيانات: ${shown.join("، ")}`,
    num(mid),
    [num(data[0]!), num(Math.round(data.reduce((a, b) => a + b, 0) / 5)), num(data[4]!)],
    steps(
      `رتّب تصاعدياً: ${data.join("، ")}.`,
      `عدد القيم فردي (5)، فالوسيط هو القيمة الوسطى.`,
      `الوسيط = ${mid}.`,
      `لا تخلط مع المتوسط الحسابي.`,
      `الإجابة = ${mid}.`
    ),
    "statistics",
    "hard",
    rng
  );
}

function genTablePctHard(rng: Rng, seq: number): GenQ {
  const y1 = pick(rng, [40, 50, 60, 70, 80]);
  const grow = pick(rng, [20, 25, 28, 30, 35, 40]);
  const y2 = Math.round(y1 * (1 + grow / 100));
  // ask percent increase
  const p = Math.round(((y2 - y1) / y1) * 100);
  return makeQ(
    `qh-stat-${seq}`,
    `qh-stat:${y1}:${y2}`,
    `زاد عدد المصانع من ${y1} إلى ${y2}. نسبة الزيادة؟`,
    pct(p),
    [
      pct(Math.round(((y2 - y1) / y2) * 100)),
      pct(y2 - y1),
      pct(Math.round((y2 / y1) * 100)),
    ],
    steps(
      `مقدار الزيادة = ${y2} − ${y1} = ${y2 - y1}.`,
      `نسبة الزيادة = الزيادة ÷ العدد الأصلي = ${y2 - y1} ÷ ${y1} = ${p}٪.`,
      `خطأ شائع: القسمة على العدد الجديد ${y2}.`,
      `الإجابة = ${p}٪.`
    ),
    "statistics",
    "hard",
    rng
  );
}

// ─── Registry ────────────────────────────────────────────

type GenFn = (rng: Rng, seq: number) => GenQ;

export const QUDURAT_HARD_GENS: Record<SubPattern, GenFn[]> = {
  percent: [genPctOfPct, genFindBase, genDoubleDiscount, genPctOfPct],
  ratio: [genRatioThreeHard, genInverseWorkHard, genRatioThreeHard],
  successive: [genFracSuccessivePrice, genSuccessivePctHard, genFracSuccessivePrice],
  average: [genAvgMissing, genAvgMissing],
  buy_sell: [genBuySellHard, genBuySellHard],
  fraction: [genFracChainHard, genFracChainHard],
  rate: [genRateRest, genRateRest],
  number_sense: [genGiftsKids, genCompareProducts, genGiftsKids],
  algebra: [
    genScaleProduct,
    genLinearTwoSide,
    genAgeHard,
    genEvalQuad,
    genScaleProduct,
    genLinearTwoSide,
  ],
  geometry: [
    genRhombusArea,
    genPythagClean,
    genCircleArea,
    genRectDiagArea,
    genRhombusArea,
    genPythagClean,
  ],
  statistics: [genMedianHard, genTablePctHard, genMedianHard],
  probability: [genProbNoReplace, genProbNoReplace],
  comparison: [
    genIdentityCompare,
    genTriangleAnglesCompare,
    genAlgCompareNums,
    genPctCompare,
    genIdentityCompare,
  ],
};

export function genQuduratHard(
  pattern: SubPattern,
  rng: Rng,
  seq: number
): GenQ {
  const pool = QUDURAT_HARD_GENS[pattern];
  if (!pool?.length) {
    return genScaleProduct(rng, seq);
  }
  let q = pick(rng, pool)(rng, seq);
  for (let i = 0; i < 8 && !isCleanGenQ(q); i++) {
    q = pick(rng, pool)(mulberry32(seq * 31 + i * 97), seq + i + 1);
  }
  return q;
}
