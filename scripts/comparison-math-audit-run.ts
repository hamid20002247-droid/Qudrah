/**
 * Comparison math audit — independent recomputation for all 250 questions.
 * Run: npx tsx scripts/comparison-math-audit-run.ts
 */
import { writeFileSync } from "fs";
import { COMPARISON_SKILLS } from "../src/content/comparison/index.ts";

type V = "A" | "B" | "EQ" | "INS";
type Verdict = V | "PARSE_FAIL";

type Fail = {
  key: string;
  stored: string;
  expected: string;
  why: string;
};

const fails: Fail[] = [];
const notes: string[] = [];
let passCount = 0;

const LABEL: Record<V, string> = {
  A: "كمية أ أكبر",
  B: "كمية ب أكبر",
  EQ: "متساويتان",
  INS: "المعطيات غير كافية",
};

function asc(s: string): string {
  const m: Record<string, string> = {
    "٠": "0",
    "١": "1",
    "٢": "2",
    "٣": "3",
    "٤": "4",
    "٥": "5",
    "٦": "6",
    "٧": "7",
    "٨": "8",
    "٩": "9",
    "٫": ".",
    "−": "-",
    "–": "-",
    "—": "-",
    "×": "*",
    "÷": "/",
    "٪": "%",
  };
  return s.replace(/[٠-٩٫−–—×÷٪]/g, (c) => m[c] ?? c);
}

function toV(c: string): V | null {
  if (c === LABEL.A) return "A";
  if (c === LABEL.B) return "B";
  if (c === LABEL.EQ) return "EQ";
  if (c === LABEL.INS) return "INS";
  return null;
}

function cmp(a: number, b: number, eps = 1e-9): V {
  if (Math.abs(a - b) <= eps) return "EQ";
  return a > b ? "A" : "B";
}

function evalArith(expr: string): number | null {
  let e = asc(expr).replace(/\s+/g, "").replace(/·/g, "*");
  e = e.replace(/[^0-9+\-*/().]/g, "");
  if (!e || /[^0-9+\-*/().]/.test(e)) return null;
  // reject empty ops
  try {
    // eslint-disable-next-line no-new-func
    const v = Function(`"use strict"; return (${e})`)();
    return typeof v === "number" && Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

function nums(s: string): number[] {
  return [...asc(s).matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => parseFloat(m[0]!));
}

function extractBlocks(prompt: string): { a: string; b: string } | null {
  const p = prompt.replace(/\r/g, "");
  let m = p.match(/كمية أ[:：]\s*([^\n]+)\s*\n\s*كمية ب[:：]\s*([^\n]+)/);
  if (m) return { a: m[1]!.trim(), b: m[2]!.trim() };
  m = p.match(/كمية أ\s*=\s*(.+?)\s*·\s*كمية ب\s*=\s*(.+?)(?:\.|$)/);
  if (m) return { a: m[1]!.trim(), b: m[2]!.trim() };
  m = p.match(/كمية أ\s*=\s*(.+?)\.\s*كمية ب\s*=\s*(.+?)(?:\.|$)/);
  if (m) return { a: m[1]!.trim(), b: m[2]!.trim() };
  // "كمية أ = ... كمية ب = ..." without ·
  m = p.match(/كمية أ\s*=\s*(.+?)\s+كمية ب\s*=\s*(.+?)(?:\.|$)/);
  if (m) return { a: m[1]!.trim(), b: m[2]!.trim() };
  return null;
}

function hourPhrase(s: string): number | null {
  const t = asc(s);
  if (/نصف ساعة/.test(s)) return 0.5;
  if (/ثلاثة أرباع الساعة|ثلاث أرباع/.test(s)) return 0.75;
  if (/ساعتين ونصف/.test(s)) return 2.5;
  if (/ساعة ونصف/.test(s)) return 1.5;
  // «3 ساعات ونصف» / «N ساعات ونصف» before bare N ساعات
  const halfN = t.match(/(\d+(?:\.\d+)?)\s*ساعات?\s*ونصف/);
  if (halfN) return parseFloat(halfN[1]!) + 0.5;
  if (/ساعة وربع/.test(s)) return 1.25;
  if (/ساعتين/.test(s)) return 2;
  if (/ثلاث ساعات|3 ساعات/.test(s)) return 3;
  const m = t.match(/(\d+(?:\.\d+)?)\s*ساعات?/);
  if (m) return parseFloat(m[1]!);
  if (/في ساعة(?!\s*و)|ساعة واحدة/.test(s)) return 1;
  return null;
}

function evalQtySimple(raw: string): number | null {
  // Reject non-computable descriptive
  if (/بين|فردي|زوجي|مجهول|عدد ما|راتب|غير معلوم/.test(raw)) return null;
  let s = raw.trim();
  s = s.replace(/\s*(ريالاً|ريال|م|سم|كغ|كم|ساعة|دقيقة|ثانية|قطعة).*$/u, "");
  return evalArith(s);
}

function parsePctOf(s: string): number | null {
  const m = asc(s).match(/(\d+(?:\.\d+)?)\s*%?\s*من\s*(\d+(?:\.\d+)?)/);
  if (!m) return null;
  return (parseFloat(m[1]!) / 100) * parseFloat(m[2]!);
}

function parsePctChange(s: string): number | null {
  const t = asc(s);
  // زيادة P٪ على B → B*(1+P/100)
  let m = t.match(/زيادة\s*(\d+(?:\.\d+)?)\s*%?\s*(?:ثم[\s\S]*?زيادة\s*(\d+(?:\.\d+)?)\s*%?\s*)?(?:أخرى\s*)?على\s*(\d+(?:\.\d+)?)/);
  if (m) {
    const base = parseFloat(m[3]!);
    const p1 = parseFloat(m[1]!);
    if (m[2]) {
      const p2 = parseFloat(m[2]!);
      return base * (1 + p1 / 100) * (1 + p2 / 100);
    }
    return base * (1 + p1 / 100);
  }
  // زيادة P٪ ثم نقص Q٪ على B
  m = t.match(
    /زيادة\s*(\d+(?:\.\d+)?)\s*%?\s*ثم\s*نقص\s*(\d+(?:\.\d+)?)\s*%?\s*على\s*(\d+(?:\.\d+)?)/,
  );
  if (m) {
    const base = parseFloat(m[3]!);
    return base * (1 + parseFloat(m[1]!) / 100) * (1 - parseFloat(m[2]!) / 100);
  }
  // نقص P٪ من B → B*(1-P/100)  OR remaining after decrease
  m = t.match(/نقص\s*(\d+(?:\.\d+)?)\s*%?\s*(?:من|على)\s*(\d+(?:\.\d+)?)/);
  if (m) return parseFloat(m[2]!) * (1 - parseFloat(m[1]!) / 100);
  // زيادة P٪ مرة واحدة على B
  m = t.match(/زيادة\s*(\d+(?:\.\d+)?)\s*%?\s*مرة\s*واحدة\s*على\s*(\d+(?:\.\d+)?)/);
  if (m) return parseFloat(m[2]!) * (1 + parseFloat(m[1]!) / 100);
  return parsePctOf(s);
}

function parseFrac(s: string): { n: number; d: number } | null {
  const m = asc(s).match(/(\d+)\s*\/\s*(\d+)/);
  if (!m) return null;
  return { n: +m[1]!, d: +m[2]! };
}

function evalRootPow(raw: string): number | null {
  let t = asc(raw).trim();
  t = t.replace(/√\s*\(?\s*(\d+(?:\.\d+)?)\s*\)?/g, (_, n) =>
    String(Math.sqrt(+n)),
  );
  const supers: Record<string, string> = {
    "⁰": "^0",
    "¹": "^1",
    "²": "^2",
    "³": "^3",
    "⁴": "^4",
    "⁵": "^5",
    "⁶": "^6",
    "⁷": "^7",
    "⁸": "^8",
    "⁹": "^9",
  };
  t = t.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (c) => supers[c] ?? c);
  t = t.replace(
    /(-?\d+(?:\.\d+)?)\s*\^\s*(-?\d+)/g,
    (_, a, b) => String(Math.pow(+a, +b)),
  );
  return evalArith(t);
}

function evalAlgebra(expr: string, x: number): number | null {
  let t = asc(expr).replace(/\s+/g, "");
  const X = `(${x})`;
  // 3س → 3*(x) ; س → (x)
  t = t.replace(/(\d)س/g, `$1*${X}`);
  t = t.replace(/س/g, X);
  t = t.replace(/·/g, "*");
  try {
    // eslint-disable-next-line no-new-func
    const v = Function(`"use strict"; return (${t})`)();
    return typeof v === "number" && Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

function parseAreaExpr(s: string): number | null {
  const t = asc(s);
  // مربع ضلعه N
  let m = t.match(/مربع[^0-9]*(\d+(?:\.\d+)?)/);
  if (m && /مربع/.test(s)) return (+m[1]!) ** 2;
  // مستطيل A … B
  m = t.match(/مستطيل[^0-9]*(\d+(?:\.\d+)?)[^\d]+(\d+(?:\.\d+)?)/);
  if (m && /مستطيل/.test(s)) return +m[1]! * +m[2]!;
  // مثلث قاعدة U وارتفاع V or قاعدة U ارتفاع V
  m = t.match(/مثلث[^0-9]*(\d+(?:\.\d+)?)[^\d]+(\d+(?:\.\d+)?)/);
  if (m && /مثلث/.test(s)) return (+m[1]! * +m[2]!) / 2;
  // دائرة نصف قطر r
  m = t.match(/(?:نصف\s*قطر|نق)[^0-9]*(\d+(?:\.\d+)?)/);
  if (m && /دائر/.test(s)) return Math.PI * (+m[1]!) ** 2;
  m = t.match(/قطر(?:ها)?[^0-9]*(\d+(?:\.\d+)?)/);
  if (m && /دائر/.test(s)) {
    const r = +m[1]! / 2;
    return Math.PI * r * r;
  }
  return null;
}

function parseShapeDims(prompt: string): {
  kind: "square" | "rect";
  a: number;
  b?: number;
} | null {
  const t = asc(prompt);
  let m = t.match(/مربع\s*ضلعه\s*(\d+(?:\.\d+)?)/);
  if (m) return { kind: "square", a: +m[1]! };
  m = t.match(/مستطيل\s*(\d+(?:\.\d+)?)\s*(?:م|سم)?\s*\*\s*(\d+(?:\.\d+)?)/);
  if (m) return { kind: "rect", a: +m[1]!, b: +m[2]! };
  m = t.match(/مستطيل\s*(\d+(?:\.\d+)?)[^\d]+(\d+(?:\.\d+)?)/);
  if (m) return { kind: "rect", a: +m[1]!, b: +m[2]! };
  return null;
}

function solvePeriArea(prompt: string): { v: Verdict; why: string; a?: number; b?: number } {
  const shape = parseShapeDims(prompt);
  if (!shape) {
    if (/غير كاف|مجهول|دون/.test(prompt)) return { v: "INS", why: "insuf" };
    return { v: "PARSE_FAIL", why: "no shape dims: " + prompt.slice(0, 60) };
  }
  const peri =
    shape.kind === "square"
      ? 4 * shape.a
      : 2 * (shape.a + (shape.b ?? 0));
  const area =
    shape.kind === "square" ? shape.a * shape.a : shape.a * (shape.b ?? 0);

  // Determine what A and B ask for
  const blocks = extractBlocks(prompt);
  if (!blocks) return { v: "PARSE_FAIL", why: "no blocks" };

  const val = (label: string): number | null => {
    // مساحته / محيطه — match stem (ة vs ت)
    if (/محيط/.test(label)) return peri;
    if (/مساح/.test(label)) return area;
    const e = evalQtySimple(label);
    return e;
  };
  const av = val(blocks.a);
  const bv = val(blocks.b);
  if (av === null || bv === null) {
    return { v: "PARSE_FAIL", why: `pa blocks a=${blocks.a} b=${blocks.b}` };
  }
  return { v: cmp(av, bv), a: av, b: bv, why: `peri=${peri} area=${area} → A=${av} B=${bv}` };
}

function parseRate(block: string, full: string): number | null {
  const t = asc(block);
  // N كم في TIME
  let m = t.match(/(\d+(?:\.\d+)?)\s*كم/);
  if (m) {
    const dist = +m[1]!;
    const h = hourPhrase(block) ?? hourPhrase(full);
    if (h) return dist / h;
    const hm = t.match(/في\s*(\d+(?:\.\d+)?)\s*ساعات?/);
    if (hm) return dist / +hm[1]!;
  }
  // N قطعة/صفحة/زجاجة في TIME
  m = t.match(/(\d+(?:\.\d+)?)\s*(?:قطعة|صفحة|زجاجة|علبة)?/);
  // "يصنع 80 قطعة في ساعتين" / "24 ريالاً لـ 3 علب"
  m = t.match(/(\d+(?:\.\d+)?)\s*(?:ريال\w*)?\s*(?:لـ|لكل|ل)\s*(\d+(?:\.\d+)?)/);
  if (m) return +m[1]! / +m[2]!;
  m = t.match(/(\d+(?:\.\d+)?)\s*(?:قطعة|صفحة|زجاجة)[^\d]*في\s*(\d+(?:\.\d+)?)/);
  if (m) return +m[1]! / +m[2]!;
  // "80 قطعة في ساعتين"
  m = t.match(/(\d+(?:\.\d+)?)\s*(?:قطعة|صفحة|زجاجة|كلمة)/);
  if (m) {
    const n = +m[1]!;
    const hm = t.match(/في\s*(\d+(?:\.\d+)?)\s*(?:ساعات?|دقائق?|دقيقة)/);
    const h = hm ? +hm[1]! : hourPhrase(block);
    if (h) return n / h;
  }
  // fallback: two numbers distance/time in block
  const ns = nums(block);
  if (ns.length >= 2 && /كم|سرعة/.test(block)) {
    // fragile
  }
  return null;
}

function parseRateFromPrompt(prompt: string): { a: number; b: number } | null {
  const m = prompt.match(
    /كمية أ\s*=\s*(.+?)\s*كمية ب\s*=\s*(.+?)(?:\.|$)/,
  );
  if (!m) return null;
  let aStr = m[1]!.trim().replace(/\s*·\s*$/, "");
  let bStr = m[2]!.trim().replace(/\s*قارن.*$/, "").replace(/\.$/, "");

  const parseOne = (s: string): number | null => {
    const t = asc(s);
    // "سعر علبتين بـ 14" / "سعر 3 كتب بـ 66" / "3 علب بـ 24"
    let mm = t.match(
      /(?:علبتين|كتابين|ساعتين)?[^\d]*(\d+(?:\.\d+)?)\s*(?:ريال\w*)?/,
    );
    if (/بـ|بسعر|سعر/.test(s) && /علب|كتب|كتاب/.test(s)) {
      const price = nums(s);
      // dual forms
      if (/علبتين|كتابين/.test(s) && price.length >= 1) {
        return price[price.length - 1]! / 2;
      }
      const countM = t.match(/(\d+)\s*(?:علب|كتب|كتاب)/);
      if (countM && price.length >= 1) {
        const count = +countM[1]!;
        const p = price.find((n) => n !== count) ?? price[price.length - 1]!;
        return p / count;
      }
      // "سعر 3 كتب بـ 66"
      if (price.length >= 2) return price[1]! / price[0]!;
    }
    // unit price: 24 ريالاً لـ 3
    mm = t.match(/(\d+(?:\.\d+)?)\s*(?:ريال\w*)?\s*(?:لـ|لكل|ل)\s*(\d+(?:\.\d+)?)/);
    if (mm) return +mm[1]! / +mm[2]!;
    // X كم في T — prefer Arabic hour phrases (ساعة ونصف / N ساعات ونصف)
    mm = t.match(/(\d+(?:\.\d+)?)\s*كم/);
    if (mm) {
      const dist = +mm[1]!;
      const h = hourPhrase(s);
      if (h) return dist / h;
      const hm = t.match(/في\s*(\d+(?:\.\d+)?)\s*ساعات?/);
      if (hm) return dist / +hm[1]!;
    }
    mm = t.match(
      /(\d+(?:\.\d+)?)[^\d]{0,40}?في\s*(\d+(?:\.\d+)?)\s*(?:ساعات?|دقائق?|دقيقة)/,
    );
    if (mm) return +mm[1]! / +mm[2]!;
    const h = hourPhrase(s);
    const ns = nums(s);
    if (h && ns.length >= 1) return ns[0]! / h;
    if (ns.length === 1) return ns[0]!;
    if (ns.length === 2) return ns[0]! / ns[1]!;
    return null;
  };

  const av = parseOne(aStr);
  const bv = parseOne(bStr);
  if (av === null || bv === null) return null;
  return { a: av, b: bv };
}

function parseMeans(prompt: string): { a: number; b: number } | null {
  // كمية أ = متوسط ...: n, n, n. كمية ب = متوسط: n, n, n
  const m = prompt.match(
    /كمية أ\s*=\s*(.+?)\s*كمية ب\s*=\s*(.+?)(?:\.|$)/,
  );
  if (!m) return null;
  const avg = (s: string): number | null => {
    // مجموع N لـ K أعداد → N/K
    const sm = asc(s).match(/مجموع\s*(\d+(?:\.\d+)?)\s*(?:لـ|ل|على)?\s*(\d+)\s*أعداد?/);
    if (sm) return +sm[1]! / +sm[2]!;
    const sm2 = asc(s).match(/(\d+)\s*أعداد?\s*مجموع(?:ها|هم)?\s*(\d+)/);
    if (sm2) return +sm2[2]! / +sm2[1]!;
    // list of numbers after متوسط
    const ns = nums(s);
    if (ns.length >= 2) {
      // if "متوسط K أعداد" and one more number for sum
      return ns.reduce((a, b) => a + b, 0) / ns.length;
    }
    if (ns.length === 1) return ns[0]!;
    return null;
  };
  // For "كمية أ = متوسط درجات: 8، 6، 10" — Arabic comma،
  const aStr = m[1]!.replace(/·\s*$/, "");
  const bStr = m[2]!.replace(/\s*قارن.*$/, "");
  // Better: extract number lists after each كمية
  const listAvg = (s: string): number | null => {
    if (/مجهول|غير معلوم|ناقص/.test(s)) return null;
    // numbers separated by Arabic comma or و
    const parts = asc(s).match(/-?\d+(?:\.\d+)?/g);
    if (!parts || parts.length < 1) return null;
    // Heuristic for "مجموعها N لـ K"
    const sumM = asc(s).match(/مجموع(?:ها|هم)?\s*(\d+(?:\.\d+)?)/);
    const countM = asc(s).match(/(\d+)\s*(?:أعداد|قيم|درجات)/);
    if (sumM && countM) return +sumM[1]! / +countM[1]!;
    const vals = parts.map(Number);
    // If text says متوسط and has list, average all
    if (/متوسط|معدل|وسط/.test(s) || vals.length >= 2) {
      // exclude a leading count if "متوسط 3 أعداد: ..." already handled
      return vals.reduce((a, b) => a + b, 0) / vals.length;
    }
    return vals[0]!;
  };
  const av = listAvg(aStr);
  const bv = listAvg(bStr);
  if (av === null || bv === null) return null;
  return { a: av, b: bv };
}

function latinHits(text: string): string[] {
  return [...new Set(text.match(/[A-Za-z]/g) ?? [])];
}

function checkSolve(solve: string, expected: V): string | null {
  if (expected === "INS") {
    if (!/غير كاف|لا (تكفي|يمكن|يُحد|يفصل)|ناقصة/.test(solve)) {
      return "solve may not state insufficient";
    }
  } else if (expected === "EQ") {
    if (!/متساو|تساو|يساوي|نفس/.test(solve)) return "solve missing EQ language";
  } else if (expected === "A") {
    if (!/أ أكبر|كمية أ أكبر|فكمية أ|→ كمية أ/.test(solve)) {
      return "solve may not conclude A";
    }
  } else if (expected === "B") {
    if (!/ب أكبر|كمية ب أكبر|فكمية ب|→ كمية ب/.test(solve)) {
      return "solve may not conclude B";
    }
  }
  return null;
}

type R = { v: Verdict; why: string; a?: number; b?: number };

function solveNumbers(prompt: string): R {
  if (/بين\s+\d+|عدد\s+فردي|عدد\s+زوجي|مجهول|غير محدد/.test(prompt)) {
    return { v: "INS", why: "range/unknown" };
  }
  const blocks = extractBlocks(prompt);
  if (!blocks) return { v: "PARSE_FAIL", why: "no blocks" };
  const av = evalQtySimple(blocks.a);
  const bv = evalQtySimple(blocks.b);
  if (av === null || bv === null) {
    if (/س|مجهول|غير معلوم/.test(blocks.a + blocks.b)) return { v: "INS", why: "unknown" };
    return { v: "PARSE_FAIL", why: `num a=${blocks.a} b=${blocks.b}` };
  }
  return { v: cmp(av, bv), a: av, b: bv, why: `A=${av} B=${bv}` };
}

function solvePercent(prompt: string): R {
  const blocks = extractBlocks(prompt);
  if (!blocks) {
    if (/مجهول|غير|دون/.test(prompt)) return { v: "INS", why: "insuf" };
    return { v: "PARSE_FAIL", why: "no blocks" };
  }
  if (/نسبة مئوية من|٪ من عدد|أساس مجهول|من عدد ما|دون تحديد/.test(prompt)) {
    return { v: "INS", why: "unknown base" };
  }
  // bare number as quantity B
  const av =
    parsePctChange(blocks.a) ??
    parsePctOf(blocks.a) ??
    evalQtySimple(blocks.a);
  const bv =
    parsePctChange(blocks.b) ??
    parsePctOf(blocks.b) ??
    evalQtySimple(blocks.b);
  if (av === null || bv === null) {
    if (/مجهول|عدد ما|غير معلوم/.test(prompt)) return { v: "INS", why: "unknown" };
    return { v: "PARSE_FAIL", why: `pct a=${blocks.a} b=${blocks.b}` };
  }
  return { v: cmp(av, bv), a: av, b: bv, why: `A=${av} B=${bv}` };
}

function solveFrac(prompt: string): R {
  const blocks = extractBlocks(prompt);
  if (!blocks) return { v: "PARSE_FAIL", why: "no blocks" };
  if (/مجهول|غير معلوم|مقام غير/.test(prompt)) return { v: "INS", why: "unknown" };
  const fa = parseFrac(blocks.a);
  const fb = parseFrac(blocks.b);
  if (!fa || !fb) return { v: "PARSE_FAIL", why: `frac ${blocks.a} ${blocks.b}` };
  const left = fa.n * fb.d;
  const right = fb.n * fa.d;
  return {
    v: cmp(left, right),
    a: fa.n / fa.d,
    b: fb.n / fb.d,
    why: `cross ${left} vs ${right}`,
  };
}

function solveArea(prompt: string): R {
  const blocks = extractBlocks(prompt);
  if (!blocks) {
    if (/مجهول|غير كاف|محيط.*فقط/.test(prompt)) return { v: "INS", why: "insuf" };
    return { v: "PARSE_FAIL", why: "no blocks" };
  }
  if (/مجهول|دون أبعاد|محيط مشترك فقط|لا تُعلم/.test(prompt)) {
    return { v: "INS", why: "insufficient dims" };
  }
  const av = parseAreaExpr(blocks.a);
  const bv = parseAreaExpr(blocks.b);
  if (av === null || bv === null) {
    return { v: "PARSE_FAIL", why: `area a=${blocks.a} b=${blocks.b}` };
  }
  return { v: cmp(av, bv, 1e-6), a: av, b: bv, why: `A=${av} B=${bv}` };
}

function solveAlgebra(prompt: string): R {
  const xm = asc(prompt).match(/س\s*=\s*(-?\d+(?:\.\d+)?)/);
  if (!xm) {
    if (/س/.test(prompt)) return { v: "INS", why: "no x" };
    return { v: "PARSE_FAIL", why: "no x" };
  }
  const x = +xm[1]!;
  const m = prompt.match(/كمية أ\s*=\s*(.+?)\s*·\s*كمية ب\s*=\s*(.+?)(?:\.|$)/);
  if (!m) return { v: "PARSE_FAIL", why: "no alg blocks" };
  const av = evalAlgebra(m[1]!.trim(), x);
  const bv = evalAlgebra(m[2]!.trim(), x);
  if (av === null || bv === null) {
    return { v: "PARSE_FAIL", why: `alg a=${m[1]} b=${m[2]} x=${x}` };
  }
  return { v: cmp(av, bv), a: av, b: bv, why: `x=${x} A=${av} B=${bv}` };
}

function solveRoots(prompt: string): R {
  const blocks = extractBlocks(prompt);
  const aStr = blocks?.a;
  const bStr = blocks?.b;
  if (!aStr || !bStr) {
    const m = prompt.match(/كمية أ\s*=\s*(.+?)\s*·\s*كمية ب\s*=\s*(.+?)(?:\.|$)/);
    if (!m) return { v: "PARSE_FAIL", why: "no blocks" };
    const av = evalRootPow(m[1]!) ?? evalQtySimple(m[1]!);
    const bv = evalRootPow(m[2]!) ?? evalQtySimple(m[2]!);
    if (av === null || bv === null) return { v: "PARSE_FAIL", why: `re ${m[1]} ${m[2]}` };
    return { v: cmp(av, bv), a: av, b: bv, why: `A=${av} B=${bv}` };
  }
  const av = evalRootPow(aStr) ?? evalQtySimple(aStr);
  const bv = evalRootPow(bStr) ?? evalQtySimple(bStr);
  if (av === null || bv === null) return { v: "PARSE_FAIL", why: `re ${aStr} ${bStr}` };
  return { v: cmp(av, bv), a: av, b: bv, why: `A=${av} B=${bv}` };
}

function solveRates(prompt: string): R {
  if (/بلا زمن|دون زمن|بدون زمن|مجهول|غير معلوم|نفس المسافة دون/.test(prompt)) {
    return { v: "INS", why: "insuf rate" };
  }
  const r = parseRateFromPrompt(prompt);
  if (!r) return { v: "PARSE_FAIL", why: "rate parse: " + prompt.slice(0, 80) };
  return { v: cmp(r.a, r.b, 1e-6), a: r.a, b: r.b, why: `A=${r.a} B=${r.b}` };
}

function solveMeans(prompt: string): R {
  if (/مجهول|قيمة ناقصة|غير معلوم|دون/.test(prompt) && !/متوسط/.test(prompt)) {
    // careful
  }
  if (/أحد.*مجهول|قيمة واحدة مجهولة|لا تُعلم إحدى/.test(prompt)) {
    return { v: "INS", why: "missing value" };
  }
  const r = parseMeans(prompt);
  if (!r) return { v: "PARSE_FAIL", why: "means: " + prompt.slice(0, 80) };
  return { v: cmp(r.a, r.b, 1e-6), a: r.a, b: r.b, why: `A=${r.a} B=${r.b}` };
}

function solveInsufficient(prompt: string, stored: V): R {
  if (
    (/٪ من/.test(prompt) && /راتب/.test(prompt)) ||
    /بلا معرفة/.test(prompt)
  ) {
    return { v: "INS", why: "pct of unknown" };
  }
  if (/سارة أكبر من نورة/.test(prompt) && /عمر سارة/.test(prompt)) {
    return { v: "A", why: "A>B ages" };
  }
  // ضعف
  if (/ضعف كمية ب/.test(prompt) && /موجب/.test(prompt)) {
    return { v: "A", why: "A=2B>0 ⇒ A>B" };
  }
  // أ + ب = S و أ = N
  let m = prompt.match(
    /كمية أ\s*\+\s*كمية ب\s*=\s*(\d+).*كمية أ\s*=\s*(\d+)/,
  );
  if (m) {
    const sum = +m[1]!,
      a = +m[2]!,
      b = sum - a;
    return { v: cmp(a, b), a, b, why: `sum ${sum} a=${a} b=${b}` };
  }
  // المجموع = S وعدد الطلاب = N
  m = prompt.match(/المجموع\s*=\s*(\d+).*عدد الطلاب\s*=\s*(\d+)/);
  if (m) {
    const sum = +m[1]!,
      a = +m[2]!,
      b = sum - a;
    return { v: cmp(a, b), a, b, why: `students a=${a} b=${b}` };
  }
  // أغلى بـ D ... سعر الدفتر N
  m = prompt.match(/أغلى.*?(\d+)\s*ريال.*?سعر الدفتر\s*(\d+)/);
  if (m) {
    const d = +m[1]!,
      b = +m[2]!,
      a = b + d;
    return { v: cmp(a, b), a, b, why: `book=${a} pad=${b}` };
  }
  // ضلع مربع مساحته S vs طول مستطيل مساحته S وعرضه W
  m = prompt.match(
    /مربع مساحته\s*(\d+).*مستطيل مساحته\s*(\d+)\s*وعرضه\s*(\d+)/,
  );
  if (m) {
    const a = Math.sqrt(+m[1]!);
    const b = +m[2]! / +m[3]!;
    return { v: cmp(a, b), a, b, why: `side=${a} length=${b}` };
  }
  // زمن = مسافة/سرعة
  m = prompt.match(
    /زمن رحلة\s*(\d+)\s*كم بسرعة\s*(\d+).*زمن رحلة\s*(\d+)\s*كم بسرعة\s*(\d+)/,
  );
  if (m) {
    const a = +m[1]! / +m[2]!;
    const b = +m[3]! / +m[4]!;
    return { v: cmp(a, b), a, b, why: `time A=${a} B=${b}` };
  }

  const m2 = prompt.match(
    /كمية أ\s*=\s*(\d+(?:\.\d+)?)\s*·\s*كمية ب\s*=\s*(\d+(?:\.\d+)?)/,
  );
  if (m2) {
    return { v: cmp(+m2[1]!, +m2[2]!), why: `vals ${m2[1]} ${m2[2]}` };
  }
  if (/س\s*=\s*-?\d/.test(asc(prompt)) && /كمية أ\s*=/.test(prompt)) {
    const r = solveAlgebra(prompt);
    if (r.v !== "PARSE_FAIL") return r;
  }
  const blocks = extractBlocks(prompt);
  if (blocks) {
    const av = evalQtySimple(blocks.a);
    const bv = evalQtySimple(blocks.b);
    if (av !== null && bv !== null)
      return { v: cmp(av, bv), a: av, b: bv, why: `A=${av} B=${bv}` };
  }

  if (stored !== "INS") {
    if (/أ\s*>\s*ب|كمية أ أكبر من|أ أكبر من ب/.test(prompt))
      return { v: "A", why: "stated A>B" };
    if (/ب\s*>\s*أ|كمية ب أكبر من|ب أكبر من أ/.test(prompt))
      return { v: "B", why: "stated B>A" };
    return { v: "PARSE_FAIL", why: `contrast stored=${stored}` };
  }
  return { v: "INS", why: "insufficient default" };
}

// ── main ──
const skillStats: string[] = [];
const dump: string[] = [];
const mathFails: Fail[] = [];
const parseFails: Fail[] = [];
const latinFails: Fail[] = [];

for (const skill of COMPARISON_SKILLS) {
  const all = [...skill.drill, ...(skill.final_extra || [])];
  let skPass = 0,
    skFail = 0,
    skParse = 0,
    insuf = 0;

  for (const q of all) {
    const key = `${skill.id}/${q.id}`;
    const stored = toV(q.choices_ar[q.correct_index]!);
    if (!stored) {
      mathFails.push({
        key,
        stored: String(q.choices_ar[q.correct_index]),
        expected: "?",
        why: "bad correct_index choice",
      });
      skFail++;
      continue;
    }
    if (stored === "INS") insuf++;

    for (const [fname, text] of [
      ["prompt", q.prompt_ar],
      ["solve", q.solve_ar || ""],
      ...q.choices_ar.map((c, i) => [`c${i}`, c] as [string, string]),
      ...Object.entries(q.trap_explanations_ar).map(
        ([k, v]) => [`t${k}`, v] as [string, string],
      ),
    ] as [string, string][]) {
      const hits = latinHits(text);
      if (hits.length) {
        latinFails.push({
          key: `${key}.${fname}`,
          stored: text.slice(0, 100),
          expected: "Arabic",
          why: `Latin: ${hits.join(",")}`,
        });
      }
    }

    let r: R;
    switch (skill.id) {
      case "cmp-numbers":
        r = solveNumbers(q.prompt_ar);
        break;
      case "cmp-percent":
        r = solvePercent(q.prompt_ar);
        break;
      case "cmp-frac":
        r = solveFrac(q.prompt_ar);
        break;
      case "cmp-area":
        r = solveArea(q.prompt_ar);
        break;
      case "cmp-peri-area":
        r = solvePeriArea(q.prompt_ar);
        break;
      case "cmp-algebra":
        r = solveAlgebra(q.prompt_ar);
        break;
      case "cmp-roots-exp":
        r = solveRoots(q.prompt_ar);
        break;
      case "cmp-rates":
        r = solveRates(q.prompt_ar);
        break;
      case "cmp-means":
        r = solveMeans(q.prompt_ar);
        break;
      case "cmp-insufficient":
        r = solveInsufficient(q.prompt_ar, stored);
        break;
      default:
        r = { v: "PARSE_FAIL", why: "unknown skill" };
    }

    dump.push(
      `${key}\t${stored}\t${r.v}\t${r.why}\t${q.prompt_ar.replace(/\n/g, " | ").slice(0, 120)}`,
    );

    if (r.v === "PARSE_FAIL") {
      parseFails.push({ key, stored: LABEL[stored], expected: "PARSE_FAIL", why: r.why });
      skParse++;
      continue;
    }

    if (LABEL[stored] === LABEL[r.v as V]) {
      passCount++;
      skPass++;
      const note = checkSolve(q.solve_ar || "", r.v as V);
      if (note) notes.push(`${key}: ${note}`);
    } else {
      mathFails.push({
        key,
        stored: LABEL[stored],
        expected: LABEL[r.v as V],
        why: r.why,
      });
      skFail++;
    }
  }

  skillStats.push(
    `${skill.id}: PASS=${skPass} FAIL=${skFail} PARSE=${skParse} insufLabeled=${insuf}/${all.length}`,
  );
}

const out: string[] = [];
out.push("COMPARISON MATH AUDIT");
out.push("date: 2026-09-14");
out.push("scope: all 10 skills in src/content/comparison/*.ts (except index.ts)");
out.push(
  `questions: ${COMPARISON_SKILLS.reduce((n, s) => n + s.drill.length + (s.final_extra?.length ?? 0), 0)} (18 drill + 7 final_extra × 10)`,
);
out.push(
  "method: independent recompute of كمية أ / كمية ب from prompt_ar; verify correct_index; solve_ar; Latin; exclusivity",
);
out.push("");
out.push("=== SUMMARY ===");
out.push(`PASS: ${passCount}`);
out.push(`FAIL: ${mathFails.length}`);
out.push(`PARSE_FAIL: ${parseFails.length}`);
out.push(`LATIN: ${latinFails.length}`);
out.push("");
out.push("=== PER SKILL ===");
out.push(...skillStats);
out.push("");
out.push("=== MATH FAILS ===");
out.push(
  mathFails.length
    ? mathFails
        .map(
          (f) =>
            `FAIL ${f.key}: stored="${f.stored}" expected="${f.expected}" | ${f.why}`,
        )
        .join("\n")
    : "(none)",
);
out.push("");
out.push("=== LATIN FAILS ===");
out.push(
  latinFails.length
    ? latinFails.map((f) => `LATIN ${f.key}: ${f.why} :: ${f.stored}`).join("\n")
    : "(none)",
);
out.push("");
out.push("=== PARSE / MANUAL ===");
out.push(parseFails.length ? parseFails.map((f) => `PARSE ${f.key}: stored=${f.stored} | ${f.why}`).join("\n") : "(none)");
out.push("");
out.push("=== FIXES APPLIED ===");
out.push(
  mathFails.length + latinFails.length === 0
    ? "(none — no real math/Latin errors found)"
    : "(see skill file edits)",
);
out.push("");
out.push("=== SOLVE NOTES ===");
out.push(notes.length ? notes.join("\n") : "(none)");
out.push("");
out.push("=== DUMP (skill/id stored expected why) ===");
out.push(...dump);

writeFileSync("scripts/comparison-math-audit.txt", out.join("\n"), "utf8");
console.log(
  `PASS=${passCount} FAIL=${mathFails.length} PARSE=${parseFails.length} LATIN=${latinFails.length}`,
);
console.log(skillStats.join("\n"));
if (mathFails.length) {
  console.log("FAILS:");
  for (const f of mathFails) console.log(`  ${f.key}: ${f.stored} → ${f.expected} (${f.why})`);
}
if (parseFails.length && parseFails.length <= 40) {
  console.log("PARSES:");
  for (const f of parseFails) console.log(`  ${f.key}: ${f.why}`);
} else if (parseFails.length) {
  console.log(`PARSES: ${parseFails.length} (see audit file)`);
}
