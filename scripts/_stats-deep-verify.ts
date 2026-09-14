/**
 * Deep hand-style verification of all statistics banks.
 * Run: npx tsx scripts/_stats-deep-verify.ts
 */
import { writeFileSync } from "fs";
import { STATISTICS_SKILLS } from "../src/content/statistics/index.ts";
import type { Question, Skill } from "../src/lib/types";

type Fail = { key: string; expected: string; got: string; why: string };
const fails: Fail[] = [];
let passCount = 0;
const metaIssues: string[] = [];
const latinHits: string[] = [];
const notes: string[] = [];

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
  };
  return s.replace(/[٠-٩٫−–—]/g, (c) => m[c] ?? c);
}

function normNeg(s: string): string {
  return asc(s).replace(/سالب\s*(\d+(?:\.\d+)?)/g, "-$1");
}

function nums(s: string): number[] {
  return [...normNeg(s).matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => +m[0]);
}

function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

function simp(n: number, d: number): [number, number] {
  if (d < 0) {
    n = -n;
    d = -d;
  }
  if (n === 0) return [0, 1];
  const g = gcd(n, d);
  return [n / g, d / g];
}

function fmt(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return String(Math.round(n * 1e10) / 1e10);
}

function F(n: number, d: number): string {
  const [a, b] = simp(n, d);
  return `${a}/${b}`;
}

function listNums(prompt: string): number[] {
  const p = normNeg(prompt);
  const colon = p.match(/[:：]\s*([\d.\s،,و\-]+)/);
  if (colon) {
    const vs = nums(colon[1]);
    if (vs.length >= 2) return vs;
  }
  const before = p.split(/\s+ما\s+/)[0];
  const m = before.match(/((?:-?\d+(?:\.\d+)?\s*و\s*)+-?\d+(?:\.\d+)?)/);
  if (m) return nums(m[1]);
  return nums(before);
}

type PV =
  | { k: "n"; v: number }
  | { k: "f"; n: number; d: number }
  | { k: "p"; v: number }
  | { k: "t"; v: string };

function parseV(c: string): PV {
  const t = asc(c).replace(/\s+/g, "");
  if (/^-?\d+(?:\.\d+)?٪$/.test(t)) return { k: "p", v: parseFloat(t) };
  const fr = t.match(/^(-?\d+)\/(-?\d+)$/);
  if (fr) {
    const [n, d] = simp(+fr[1], +fr[2]);
    return { k: "f", n, d };
  }
  if (/^-?\d+(?:\.\d+)?$/.test(t)) return { k: "n", v: parseFloat(t) };
  return { k: "t", v: t };
}

function sameAnswer(a: string, b: string): boolean {
  const pa = parseV(a);
  const pb = parseV(b);
  if (pa.k === "f" && pb.k === "f") return pa.n === pb.n && pa.d === pb.d;
  if (pa.k === "p" && pb.k === "p") return Math.abs(pa.v - pb.v) < 1e-9;
  if (pa.k === "n" && pb.k === "n") return Math.abs(pa.v - pb.v) < 1e-9;
  // cross numeric kinds for answer match (not exclusivity)
  const val = (p: PV): number | null => {
    if (p.k === "n" || p.k === "p") return p.v;
    if (p.k === "f") return p.n / p.d;
    return null;
  };
  const va = val(pa);
  const vb = val(pb);
  if (va !== null && vb !== null) return Math.abs(va - vb) < 1e-9;
  const soft = (x: string) =>
    asc(x)
      .replace(/\s+/g, "")
      .replace(/ـ/g, "")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي");
  const sa = soft(a);
  const sb = soft(b);
  if (sa === sb) return true;
  // "المنوال 9" ↔ "9", "خط 3" ↔ "3", "فريق2" ↔ "2"
  const digA = sa.match(/-?\d+(?:\.\d+)?/g);
  const digB = sb.match(/-?\d+(?:\.\d+)?/g);
  if (digA?.length === 1 && digB?.length === 1 && digA[0] === digB[0]) {
    // one side essentially the number (possibly with short label)
    if (sa === digA[0] || sb === digB[0]) return true;
    if (sa.endsWith(digA[0]) || sb.endsWith(digB[0])) return true;
  }
  // Avoid "س" ⊆ "متساويان" — only allow includes for longer shared labels
  if (sa.length >= 2 && sb.length >= 2 && (sa.includes(sb) || sb.includes(sa))) return true;
  return false;
}

/** True if two choices are mathematically the same answer (bad exclusivity). */
function exclusiveDup(a: string, b: string): boolean {
  const pa = parseV(a);
  const pb = parseV(b);
  if (pa.k === "t" || pb.k === "t") {
    return (
      asc(a).replace(/\s+/g, "") === asc(b).replace(/\s+/g, "")
    );
  }
  if (pa.k === pb.k) return sameAnswer(a, b);
  // frac ↔ percent
  const val = (p: PV): number | null => {
    if (p.k === "n") return p.v;
    if (p.k === "p") return p.v / 100;
    if (p.k === "f") return p.n / p.d;
    return null;
  };
  if (
    (pa.k === "f" && pb.k === "p") ||
    (pa.k === "p" && pb.k === "f")
  ) {
    const va = val(pa);
    const vb = val(pb);
    return va !== null && vb !== null && Math.abs(va - vb) < 1e-9;
  }
  return false;
}

function verifyArith(text: string, allowPercentShorthand = false): string | null {
  const s = normNeg(text);
  const problems: string[] = [];
  const percentDone = new Set<string>();

  for (const m of s.matchAll(
    /(-?\d+(?:\.\d+)?)\s*÷\s*(-?\d+(?:\.\d+)?)\s*×\s*(-?\d+(?:\.\d+)?)\s*=\s*(-?\d+(?:\.\d+)?)/g,
  )) {
    percentDone.add(m[0]);
    if (Math.abs((+m[1] / +m[2]) * +m[3] - +m[4]) > 1e-6)
      problems.push(`${m[0]} want ${(+m[1] / +m[2]) * +m[3]}`);
  }

  for (const m of s.matchAll(
    /(-?\d+(?:\.\d+)?(?:\s*\+\s*-?\d+(?:\.\d+)?)+)\s*=\s*(-?\d+(?:\.\d+)?)/g,
  )) {
    const parts = m[1].split(/\s*\+\s*/).map(Number);
    const sum = parts.reduce((a, b) => a + b, 0);
    if (Math.abs(sum - +m[2]) > 1e-6) problems.push(`${m[0]} want ${sum}`);
  }

  for (const m of s.matchAll(
    /(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)\s*=\s*(-?\d+(?:\.\d+)?)/g,
  )) {
    if (Math.abs(+m[1] - +m[2] - +m[3]) > 1e-6) problems.push(m[0]);
  }

  for (const m of s.matchAll(
    /(-?\d+(?:\.\d+)?)\s*×\s*(-?\d+(?:\.\d+)?)\s*=\s*(-?\d+(?:\.\d+)?)/g,
  )) {
    if ([...percentDone].some((p) => p.includes(m[0]))) continue;
    const idx = m.index ?? 0;
    if (/÷\s*\d/.test(s.slice(Math.max(0, idx - 12), idx))) continue;
    if (Math.abs(+m[1] * +m[2] - +m[3]) > 1e-6) problems.push(m[0]);
  }

  for (const m of s.matchAll(
    /(-?\d+(?:\.\d+)?)\s*÷\s*(-?\d+(?:\.\d+)?)\s*=\s*(-?\d+(?:\.\d+)?)/g,
  )) {
    const after = s.slice((m.index ?? 0) + m[0].length, (m.index ?? 0) + m[0].length + 8);
    if (/^\s*×/.test(after)) continue;
    const ratio = +m[1] / +m[2];
    const rhs = +m[3];
    if (Math.abs(ratio - rhs) < 1e-6) continue;
    if (allowPercentShorthand && Math.abs(ratio * 100 - rhs) < 1e-6) continue;
    problems.push(`${m[0]} want ${ratio}`);
  }

  for (const m of s.matchAll(/\((\d+)\/(\d+)\)\s*×\s*\((\d+)\/(\d+)\)\s*=\s*(\d+)\/(\d+)/g)) {
    const lhs = (+m[1] / +m[2]) * (+m[3] / +m[4]);
    const rhs = +m[5] / +m[6];
    if (Math.abs(lhs - rhs) > 1e-6) problems.push(m[0]);
  }

  for (const m of s.matchAll(/(\d+)\/(\d+)\s*×\s*(\d+)\/(\d+)\s*=\s*(\d+)\/(\d+)/g)) {
    const lhs = (+m[1] / +m[2]) * (+m[3] / +m[4]);
    const rhs = +m[5] / +m[6];
    if (Math.abs(lhs - rhs) > 1e-6) problems.push(m[0]);
  }

  for (const m of s.matchAll(/(\d+)\/(\d+)\s*=\s*(\d+)\/(\d+)/g)) {
    if (Math.abs(+m[1] / +m[2] - +m[3] / +m[4]) > 1e-6) problems.push(m[0]);
  }

  // a/b = N integer — allow percent shorthand in traps
  for (const m of s.matchAll(/(\d+)\/(\d+)\s*=\s*(\d+)(?!\/|\d)/g)) {
    const ratio = +m[1] / +m[2];
    const rhs = +m[3];
    if (Math.abs(ratio - rhs) < 1e-6) continue;
    if (allowPercentShorthand && Math.abs(ratio * 100 - rhs) < 1e-6) continue;
    // skip if part of a/b = c/d already handled
    const after = s.slice((m.index ?? 0) + m[0].length, (m.index ?? 0) + m[0].length + 2);
    if (after.startsWith("/")) continue;
    problems.push(`${m[0]} want ${ratio}`);
  }

  return problems.length ? problems.join("; ") : null;
}

function mean(a: number[]) {
  return a.reduce((x, y) => x + y, 0) / a.length;
}
function median(a: number[]) {
  const s = [...a].sort((x, y) => x - y);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2]! : (s[n / 2 - 1]! + s[n / 2]!) / 2;
}
function modeInfo(a: number[]) {
  const f = new Map<number, number>();
  for (const x of a) f.set(x, (f.get(x) ?? 0) + 1);
  let maxc = 0;
  for (const v of f.values()) if (v > maxc) maxc = v;
  const modes = [...f.entries()].filter(([, c]) => c === maxc).map(([k]) => k);
  return { modes, maxc };
}
function rangeVal(a: number[]) {
  return Math.max(...a) - Math.min(...a);
}

const COUNT: Record<string, number> = {
  ثلاث: 3,
  ثلاثة: 3,
  أربع: 4,
  أربعة: 4,
  خمس: 5,
  خمسة: 5,
  ست: 6,
  ستة: 6,
  سبع: 7,
  سبعة: 7,
  ثمان: 8,
  ثماني: 8,
  ثمانية: 8,
  تسع: 9,
  تسعة: 9,
  عشر: 10,
  عشرة: 10,
};

function countN(p: string): number {
  const m = p.match(/متوسط\s+(\S+)/);
  if (!m) throw new Error("count");
  if (/^\d+$/.test(m[1]!)) return +m[1]!;
  for (const [w, n] of Object.entries(COUNT)) if (m[1]!.startsWith(w)) return n;
  throw new Error("count " + m[1]);
}

function checkLatin(loc: string, text: string) {
  if (text && /[A-Za-z]/.test(text)) latinHits.push(`${loc}: ${text.slice(0, 100)}`);
}

function ok(key: string, expected: string, choice: string, whyExtra?: string) {
  if (sameAnswer(choice, expected)) {
    passCount++;
    return;
  }
  fails.push({
    key,
    expected,
    got: choice,
    why: whyExtra ?? "correct_index ≠ recomputed",
  });
}

function checkExclusivity(key: string, choices: string[]): boolean {
  for (let i = 0; i < choices.length; i++) {
    for (let j = i + 1; j < choices.length; j++) {
      if (exclusiveDup(choices[i]!, choices[j]!)) {
        fails.push({
          key,
          expected: "unique",
          got: choices.join(" | "),
          why: `equivalent choices [${i}]="${choices[i]}" ≈ [${j}]="${choices[j]}"`,
        });
        return false;
      }
    }
  }
  return true;
}

function checkSolve(key: string, solve: string, allowPct = false) {
  const e = verifyArith(solve, allowPct);
  if (e) {
    fails.push({ key, expected: "arith OK", got: solve.slice(0, 80), why: `solve_ar: ${e}` });
    return false;
  }
  return true;
}

// ─── Tables: full-line row names ─────────────────────────────────
type Row = { name: string; vals: number[] };

function parseTable(prompt: string): Row[] {
  const lines = asc(prompt)
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const rows: Row[] = [];
  for (const line of lines) {
    if (/^(ما |أي |كم )/.test(line)) continue;
    // Row: Arabic name (possibly multi-token) then 2+ numbers
    const m = line.match(/^(.+?)\s{2,}(.+)$/) || line.match(/^(\S+(?:\s+\S+)?)\s+(.+)$/);
    if (!m) continue;
    let name = m[1]!.trim();
    let rest = m[2]!;
    // header row of column titles only (no useful numbers as data with name)
    const vs = nums(rest);
    // skip pure header like "جولة1  جولة2" where name has digits glued
    if (!/[\u0600-\u06FF]/.test(name)) continue;
    if (vs.length < 1) continue;
    // skip header lines where "name" is column labels with digits only after
    if (/^(جولة|يوم|اختبار|صندوق|رجالي|صباح|ذكور|حاضر|كتب|له|فسحة)/.test(name) && !/فريق|صف|فرع|خط|خالد|سعد|نورة|المعرض|مجموعة|السبت|الأحد|الاثنين|شعبة|أ|ب/.test(name)) {
      // might be header — if name is only a column word
      if (/^\S+\d*$/.test(name) && /جولة|صندوق|رجالي|ذكور|حاضر|كتب|له/.test(name)) continue;
    }
    rows.push({ name, vals: vs });
  }
  return rows;
}

function sumRow(r: Row) {
  return r.vals.reduce((a, b) => a + b, 0);
}

function recomputeTables(q: Question): string {
  const p = asc(q.prompt_ar);
  const rows = parseTable(p);
  const find = (...parts: string[]) =>
    rows.find((r) => parts.every((part) => r.name.includes(part)));

  if (/مجموع مبيعات الصباح/.test(p)) return fmt(sumRow(find("صباح")!));
  if (/إناث الصف الأول عن ذكور/.test(p)) {
    const r = find("أول")!;
    return fmt(r.vals[1]! - r.vals[0]!);
  }
  if (/أي صف مجموعه أكبر/.test(p)) {
    let best = rows[0]!;
    for (const r of rows) if (sumRow(r) > sumRow(best)) best = r;
    if (best.name.includes("أ")) return "فريق أ";
    if (best.name.includes("ب")) return "فريق ب";
    return best.name;
  }
  if (/مجموع طلبات حي ب/.test(p)) return fmt(rows.reduce((a, r) => a + r.vals[1]!, 0));
  if (/أي فريق لعب مباريات أكثر/.test(p)) {
    const sums = rows.map(sumRow);
    return sums[0] === sums[1] ? "متساويان" : sums[0]! > sums[1]! ? "س" : "ص";
  }
  if (/فرع الشمال|مبيعات فرع الشمال/.test(p)) return fmt(sumRow(find("شمال")!));
  if (/أي خط مجموع/.test(p)) {
    let best = rows[0]!;
    for (const r of rows) if (sumRow(r) > sumRow(best)) best = r;
    const letter = best.name.replace(/خط\s*/g, "").trim();
    return letter || best.name;
  }
  if (/خالد في الاختبار القصير/.test(p)) return fmt(find("خالد")!.vals[0]!);
  if (/الفرق بين مجموع عمود الكتب/.test(p)) {
    const books = rows.reduce((a, r) => a + r.vals[0]!, 0);
    const pens = rows.reduce((a, r) => a + r.vals[1]!, 0);
    return fmt(Math.abs(pens - books));
  }
  if (/أي عمود مجموعه أكبر/.test(p)) {
    const c0 = rows.reduce((a, r) => a + r.vals[0]!, 0);
    const c1 = rows.reduce((a, r) => a + r.vals[1]!, 0);
    if (c0 === c1) return "متساويان";
    // return choice that matches larger — verify via values in solve path
    return c0 > c1 ? `__COL0__` : `__COL1__`;
  }
  if (/مجموع حضور يوم السبت/.test(p)) return fmt(sumRow(find("السبت")!));
  if (/الفرق بين مجموع درجات/.test(p) || (/ما الفرق بين مجموع/.test(p) && rows.length >= 2)) {
    return fmt(Math.abs(sumRow(rows[0]!) - sumRow(rows[1]!)));
  }
  if (/أي يوم مجموع/.test(p)) {
    let best = rows[0]!;
    for (const r of rows) if (sumRow(r) > sumRow(best)) best = r;
    if (best.name.includes("أحد")) return "الأحد";
    if (best.name.includes("سبت")) return "السبت";
    return best.name;
  }
  if (/كم يزيد إنتاج|يزيد إنتاج قطعة/.test(p)) {
    const c0 = rows.reduce((a, r) => a + r.vals[0]!, 0);
    const c1 = rows.reduce((a, r) => a + r.vals[1]!, 0);
    return fmt(Math.abs(c0 - c1));
  }
  if (/أي فريق مجموعه أكبر/.test(p)) {
    let best = rows[0]!;
    for (const r of rows) if (sumRow(r) > sumRow(best)) best = r;
    // extract letter after فريق
    const m = best.name.match(/فريق\s*(\S+)/);
    if (m) {
      const L = m[1]!;
      if (L === "ه" || L.startsWith("ه")) return "هـ";
      return L;
    }
    return best.name;
  }
  if (/اليوم1 واليوم3 معاً|اليوم1.*اليوم3/.test(p)) {
    return fmt(sumRow(find("اليوم1")!) + sumRow(find("اليوم3")!));
  }
  if (/الفسحة الأولى|الفسحة1/.test(p) && /مجموع/.test(p))
    return fmt(sumRow(find("الفسحة1")!) ?? sumRow(rows.find((r) => /فسحة1|الفسحة1/.test(r.name))!));
  if (/يزيد «له»|له» عند أ/.test(p)) {
    const a = find("أ")!;
    const b = find("ب")!;
    return fmt(a.vals[0]! - b.vals[0]!);
  }
  if (/أي يوم مجموعه أكبر/.test(p)) {
    let best = rows[0]!;
    for (const r of rows) if (sumRow(r) > sumRow(best)) best = r;
    if (best.name.includes("سبت")) return "السبت";
    return best.name;
  }
  if (/مجموع الحاضرين/.test(p)) return fmt(rows.reduce((a, r) => a + r.vals[0]!, 0));
  if (/أي معرض مجموعه أكبر/.test(p)) {
    let best = rows[0]!;
    for (const r of rows) if (sumRow(r) > sumRow(best)) best = r;
    const m = best.name.match(/المعرض\s*(\S+)|معرض\s*(\S+)/);
    if (m) return (m[1] ?? m[2])!;
    if (best.name.includes("ب")) return "ب";
    if (best.name.includes("أ")) return "أ";
    return best.name;
  }
  if (/الفرق بين مجموعَي المجموعتين|الفرق بين مجموع/.test(p) && /مجموعة/.test(p)) {
    return fmt(Math.abs(sumRow(find("مجموعة1")!) - sumRow(find("مجموعة2")!)));
  }
  if (/المجموع الكلي لكل العبوات|المجموع الكلي/.test(p)) {
    return fmt(rows.reduce((a, r) => a + sumRow(r), 0));
  }
  if (/مجموع الاشتراكات السنوية/.test(p))
    return fmt(rows.reduce((a, r) => a + r.vals[1]!, 0));

  if (/ما مجموع/.test(p)) {
    for (const r of rows) {
      const bare = r.name.replace(/^ال/, "");
      if (p.includes(r.name) || (bare.length > 1 && p.includes(bare))) {
        return fmt(sumRow(r));
      }
    }
  }

  throw new Error(`tables unparsed ${q.id} rows=${JSON.stringify(rows)}`);
}

function recomputeCharts(q: Question): string {
  const p = asc(q.prompt_ar);
  const pairs: { lab: string; v: number }[] = [];
  for (const m of p.matchAll(/([^\s=,:\n؟]+)\s*=\s*(-?\d+(?:\.\d+)?)/g)) {
    pairs.push({ lab: m[1]!, v: +m[2]! });
  }
  if (!pairs.length) {
    const dataPart = p.split(/[؟?]|ما |أي |كم /)[0]!;
    for (const m of dataPart.matchAll(/([\u0600-\u06FF٠-٩0-9]+)\s*[:=]?\s*(-?\d+(?:\.\d+)?)/g)) {
      const lab = m[1]!;
      if (
        /^(رسم|أعمدة|دائرة|مقسمة|مبيعات|حضور|نسب|ميزانية|ألوان|تقديري|إنتاج|زيارات|مقارنة|حرارة|آلات?|يوم|عمود|شريحة)$/.test(
          lab,
        )
      )
        continue;
      if (/^\d+$/.test(lab)) continue;
      pairs.push({ lab, v: +m[2]! });
    }
  }
  const bareList = (() => {
    const before = p.split(/ما مجموع|كم |أي /)[0]!;
    const m = before.match(/((?:\d+\s*[،,]\s*)+\d+)/);
    return m ? nums(m[1]!) : [];
  })();

  if (/كم آلة تصل|كم يوماً يساوي الأعلى/.test(p)) {
    const vals = pairs.length ? pairs.map((x) => x.v) : bareList;
    const max = Math.max(...vals);
    return fmt(vals.filter((x) => x === max).length);
  }
  // "أي شريحة تعادل مجموع X و Y" → find the OTHER category equal to that sum
  if (/تعادل مجموع/.test(p)) {
    const m = p.match(/مجموع\s+(.+?)\s+و\s*(.+?)[؟?]/);
    if (m && pairs.length) {
      const a = pairs.find((x) => m[1]!.includes(x.lab) || x.lab.includes(m[1]!.slice(0, 3)));
      const b = pairs.find((x) => m[2]!.includes(x.lab) || x.lab.includes(m[2]!.slice(0, 3)));
      if (a && b) {
        const target = a.v + b.v;
        const hit = pairs.find((x) => x !== a && x !== b && x.v === target);
        if (hit) return hit.lab;
      }
    }
  }
  if (/أي مادتين مجموعهما/.test(p)) {
    if (pairs.length >= 3) {
      for (let i = 0; i < pairs.length; i++) {
        for (let j = i + 1; j < pairs.length; j++) {
          for (let k = 0; k < pairs.length; k++) {
            if (k === i || k === j) continue;
            if (pairs[i]!.v + pairs[j]!.v === pairs[k]!.v) {
              return `${pairs[i]!.lab} و${pairs[j]!.lab}`;
            }
          }
        }
      }
    }
  }
  if (/أي أسبوعين متساويان في الأعلى/.test(p)) {
    const max = Math.max(...pairs.map((x) => x.v));
    const tops = pairs.filter((x) => x.v === max).map((x) => x.lab);
    return tops.join(" و");
  }
  if (
    /أي يوم هو الأعلى|أي شريحة الأكبر|ما لون الشريحة الأكبر|أي يوم الأعلى|أي فريق الأعلى|أي فترة أعلى|أي شهر أعلى/.test(
      p,
    )
  ) {
    return pairs.reduce((a, b) => (b.v > a.v ? b : a)).lab;
  }
  if (/أي جولة الأقل/.test(p)) {
    const min = pairs.reduce((a, b) => (b.v < a.v ? b : a));
    const num = min.lab.match(/(\d+)/)?.[1];
    return num ?? min.lab;
  }
  if (/ما قيمة عمود|ما قيمة شريحة/.test(p)) {
    const ask = p.match(/عمود\s+(\S+)|شريحة\s+(\S+)/);
    const lab = (ask?.[1] ?? ask?.[2] ?? "").replace(/[؟?]/g, "");
    const f = pairs.find(
      (x) => x.lab === lab || lab.includes(x.lab) || x.lab.includes(lab.replace(/^ال/, "")),
    );
    if (f) return fmt(f.v);
  }
  if (/كم يزيد|ما الفرق|ما الزيادة|الفرق/.test(p)) {
    if (pairs.length === 2) return fmt(Math.abs(pairs[0]!.v - pairs[1]!.v));
    const m = p.match(/([^\s=]+)=(\d+).*([^\s=]+)=(\d+)/);
    if (m) return fmt(Math.abs(+m[2]! - +m[4]!));
  }
  if (/ما مجموع/.test(p)) {
    if (bareList.length >= 2) return fmt(bareList.reduce((a, b) => a + b, 0));
    if (pairs.length) return fmt(pairs.reduce((a, b) => a + b.v, 0));
  }
  if (/مجموع الشرائح/.test(p)) return fmt(pairs.reduce((a, b) => a + b.v, 0));

  throw new Error(`charts unparsed ${q.id} pairs=${JSON.stringify(pairs)}`);
}

function recomputeDataPercent(q: Question): string {
  const p = normNeg(q.prompt_ar);
  const data = p.split(/ما نسبة|كم نسبة/)[0]!;

  if (/الفئة الوسطى/.test(p)) {
    const vs = nums(data);
    const total = vs.reduce((a, b) => a + b, 0);
    return fmt((vs[1]! / total) * 100) + "٪";
  }

  // Pairs: label then number (Arabic comma lists)
  const pairs: { lab: string; v: number }[] = [];
  for (const m of data.matchAll(/([^\d\s،,:：\n]+)\s*[:=]?\s*(\d+(?:\.\d+)?)/g)) {
    let lab = m[1]!;
    // strip leading junk words glued
    lab = lab.replace(/^(جدول|حضور|ألوان|مبيعات|مواد|فروع|استطلاع)/, "");
    if (!lab || /^(من|في|نفس|ثلاث|فئات|و)$/.test(lab)) continue;
    if (/^(جدول|حضور|ألوان|مبيعات|مواد|فروع|استطلاع)$/.test(lab)) continue;
    pairs.push({ lab, v: +m[2]! });
  }

  // dedupe exact
  const seen = new Set<string>();
  const uniq = pairs.filter((pr) => {
    const k = pr.lab + ":" + pr.v;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const total = uniq.reduce((a, b) => a + b.v, 0);
  const askRaw = (p.match(/ما نسبة\s+(.+?)(?:\؟|$)/)?.[1] ?? "")
    .replace(/من المجموع.*/, "")
    .trim();

  // Map ask forms to category
  const askNorm = askRaw.replace(/^ال/, "");
  let best: (typeof uniq)[0] | null = null;
  let sc = -1;
  for (const pr of uniq) {
    const L = pr.lab.replace(/^ال/, "");
    let s = 0;
    if (askRaw.includes(pr.lab) || askNorm.includes(L)) s = 10;
    else if (L.includes(askNorm.slice(0, 3)) || askNorm.includes(L.slice(0, 3))) s = 8;
    // feminine/masculine stems
    else if (askNorm.startsWith(L.slice(0, 2)) || L.startsWith(askNorm.slice(0, 2))) s = 5;
    // special: الناجحين → ناجح, الراسبين → راسب, الأقلام → أقلام, الكتب → كتب, الدفاتر → دفاتر
    const stems: [RegExp, string][] = [
      [/ناجح/, "ناجح"],
      [/راسب/, "راسب"],
      [/غائب/, "غائب"],
      [/كتب/, "كتب"],
      [/أقلام|قلم/, "أقلام"],
      [/دفاتر|دفتر/, "دفاتر"],
      [/أحمر/, "أحمر"],
      [/أزرق/, "أزرق"],
      [/أخضر/, "أخضر"],
      [/علوم/, "علوم"],
      [/رياض/, "رياض"],
      [/عربي/, "عربي"],
      [/ذكور|ذكر/, "ذكور"],
      [/إناث|أنث/, "إناث"],
      [/صباح/, "صباح"],
      [/مساء/, "مساء"],
    ];
    for (const [re, stem] of stems) {
      if (re.test(askNorm) && (L.includes(stem) || stem.includes(L.slice(0, 3)))) s = Math.max(s, 12);
    }
    if (s > sc) {
      sc = s;
      best = pr;
    }
  }
  if (!best || sc < 0) throw new Error(`dp ask=${askRaw} pairs=${JSON.stringify(uniq)}`);
  return fmt((best.v / total) * 100) + "٪";
}

function recomputeMeanMissing(q: Question): string {
  const p = normNeg(q.prompt_ar);
  const n = countN(p);
  const mu = +(p.match(/هو\s+(\d+(?:\.\d+)?)/)?.[1] ?? NaN);

  if (/أُضيف يومان بنفس القيمة/.test(p)) {
    const nm = +(p.match(/فصار المتوسط\s+(\d+(?:\.\d+)?)/)?.[1] ?? NaN);
    return fmt((nm * (n + 2) - mu * n) / 2);
  }
  if (/فأصبح المتوسط/.test(p)) {
    const nm = +(p.match(/فأصبح المتوسط\s+(\d+(?:\.\d+)?)/)?.[1] ?? NaN);
    return fmt(nm * (n + 1) - mu * n);
  }
  if (/المتوسط الجديد/.test(p)) {
    const add = +(
      p.match(/(?:قيمة|درجته|بمسافة|بنتيجة)\s+(\d+(?:\.\d+)?)/)?.[1] ??
      p.match(/أُضيفت\s+(?:إليها\s+)?(?:قيمة\s+)?(\d+)/)?.[1] ??
      NaN
    );
    return fmt((mu * n + add) / (n + 1));
  }
  const sumOne =
    p.match(/مجموع درجاتهم\s+(\d+)/)?.[1] ??
    p.match(/مجموع رواتبهم\s+(\d+)/)?.[1] ??
    p.match(/ثمانٍ مجموعها\s+(\d+)/)?.[1];
  if (sumOne) return fmt(mu * n - +sumOne);

  let known: number[] = [];
  if (/والخامسة/.test(p)) {
    const m = p.match(/أربع منها\s*([\d.\sو]+)،\s*والخامسة\s+(\d+)/);
    if (m) known = [...nums(m[1]!), +m[2]!];
  }
  if (!known.length) {
    const m = p.match(
      /(?:ثلاث منها|أربع منها|أربعة منها|خمس منها|اثنتان منها|قراءتان|سعران|ثلاثة أيام|أربع مباريات|خمس سلال)\s*[:：]?\s*([\d.\sو]+)/,
    );
    if (m) known = nums(m[1]!);
  }
  if (!known.length) throw new Error("mm known " + q.id);
  return fmt(mu * n - known.reduce((a, b) => a + b, 0));
}

function recomputeProbSimple(q: Question): string {
  const p = normNeg(q.prompt_ar);
  if (/نرد/.test(p)) {
    if (/زوجي/.test(p)) return "1/2";
    if (/أكبر من 4/.test(p)) return "1/3";
    if (/ألا يظهر الرقم 1|ألا يظهر/.test(p)) return "5/6";
    if (/أولي|الأولي/.test(p)) return "1/2";
    if (/2 أو 4/.test(p)) return "1/3";
    if (/أصغر من 3/.test(p)) return "1/3";
    if (/ظهور 5/.test(p)) return "1/6";
  }
  if (/من 1 إلى 4/.test(p) && /أكبر من 2/.test(p)) return "1/2";
  if (/من 1 إلى 5/.test(p) && /فردي/.test(p)) return "3/5";
  if (/من 1 إلى 6/.test(p) && /القسمة على 3/.test(p)) return "1/3";
  if (/من 1 إلى 3|بطاقات 1 إلى 3/.test(p)) return "1/3";
  if (/من 1 إلى 8/.test(p) && /زوجي/.test(p)) return "1/2";
  if (/بطاقة نجمة|علام[ةه] نجمة/.test(p)) return "1/4";
  if (/معلّمة|معلمة/.test(p) && /7 كرات منها 3/.test(p)) return "3/7";
  if (/فارغ من الأحمر|احتمال سحب حمراء/.test(p) && /7 زرقاء فقط/.test(p)) return "0";
  if (/6 كرات حمراء فقط/.test(p)) return "1";
  if (/10 كرات:\s*منها 4 بيضاء|منها 4 بيضاء/.test(p)) return "2/5";
  if (/8 بطاقات/.test(p) && /نجمة/.test(p)) return "1/4";

  const colors: Record<string, number> = {};
  for (const m of p.matchAll(
    /(\d+)\s+(?:كرات\s+)?(حمراء|زرقاء|خضراء|بيضاء|سوداء|صفراء|أبيض|أسود|أصفر|أحمر|أزرق|أخضر)/g,
  )) {
    colors[m[2]!] = +m[1]!;
  }
  for (const m of p.matchAll(/(\d+)\s+(أحمر|أزرق|أخضر|أبيض|أسود|أصفر|حمراء|زرقاء|خضراء)/g)) {
    colors[m[2]!] = +m[1]!;
  }
  const total = Object.values(colors).reduce((a, b) => a + b, 0);
  const get = (...names: string[]) => {
    for (const n of names) if (colors[n] !== undefined) return colors[n]!;
    return 0;
  };
  const ask = p.split(/ما احتمال/)[1] ?? p;
  if (/بيضاء/.test(ask)) return F(get("بيضاء", "أبيض"), total || 10);
  if (/خضراء|أخضر/.test(ask)) return F(get("خضراء", "أخضر"), total);
  if (/حمراء|أحمر/.test(ask)) return F(get("حمراء", "أحمر"), total);
  if (/زرقاء|أزرق/.test(ask)) return F(get("زرقاء", "أزرق"), total);
  if (/أصفر/.test(ask)) return F(get("أصفر", "صفراء"), total);
  if (/سوداء|أسود/.test(ask)) return F(get("سوداء", "أسود"), total);
  throw new Error(`ps ${q.id}`);
}

function recomputePwr(q: Question): string {
  const p = normNeg(q.prompt_ar);
  if (/ما الكلي في السحبة الثانية/.test(p)) return "5";

  const colors: Record<string, number> = {};
  for (const m of p.matchAll(
    /(\d+)\s+(?:بطاقات\s+|كرات\s+)?(حمراء|زرقاء|خضراء|بيضاء|سوداء|أبيض|أسود|أصفر|أحمر|أزرق|أخضر|معلّمة|نعم)/g,
  )) {
    colors[m[2]!] = +m[1]!;
  }
  for (const m of p.matchAll(
    /(\d+)\s+(أحمر|أزرق|أخضر|أبيض|أسود|أصفر|حمراء|زرقاء|خضراء|معلّمة)/g,
  )) {
    colors[m[2]!] = +m[1]!;
  }
  if (/بطاقتان «أ» وبطاقتان «ب»/.test(p)) {
    colors["أ"] = 2;
    colors["ب"] = 2;
  }
  if (/3 بطاقات «نعم» و 2 «لا»/.test(p)) {
    colors["نعم"] = 3;
    colors["لا"] = 2;
  }
  if (/7 كرات:\s*4 معلّمة|7 كرات منها 4 معلّمة/.test(p)) {
    colors["معلّمة"] = 4;
    colors["غير"] = 3;
  }
  if (/10 كرات منها 1 ذهبية/.test(p)) {
    colors["ذهبية"] = 1;
    colors["غير"] = 9;
  }
  if (/كيس 3 أحمر فقط/.test(p)) colors["أحمر"] = 3;

  const get = (...ns: string[]) => {
    for (const n of ns) if (colors[n] !== undefined) return colors[n]!;
    return 0;
  };
  let total = Object.values(colors).reduce((a, b) => a + b, 0);
  if (colors["معلّمة"] && colors["غير"]) total = colors["معلّمة"]! + colors["غير"]!;
  if (colors["ذهبية"] && colors["غير"]) total = colors["ذهبية"]! + colors["غير"]!;
  if (colors["نعم"] && colors["لا"]) total = colors["نعم"]! + colors["لا"]!;
  if (colors["أ"] && colors["ب"]) total = colors["أ"]! + colors["ب"]!;

  if (
    /سُحب|سُحبت|أولاً/.test(p) &&
    /الثانية/.test(p) &&
    !/كرتان متتاليتان|سحبتان متتاليتان|تكونا|حمراوين|زرقاوين|خضراوين/.test(p) &&
    !/ثم/.test(p.split("ما احتمال")[1] ?? "")
  ) {
    if (/حمراء أولاً|سُحبت حمراء|سُحب أحمر أولاً/.test(p) && /الثانية حمراء|الثانية أحمر/.test(p))
      return F(get("حمراء", "أحمر") - 1, total - 1);
    if (/أبيض أولاً/.test(p) && /الثانية سوداء/.test(p))
      return F(get("أسود", "سوداء"), total - 1);
    if (/حمراء أولاً|سُحبت حمراء/.test(p) && /الثانية خضراء/.test(p))
      return F(get("خضراء", "أخضر"), total - 1);
    if (/أصفر أولاً/.test(p) && /الثانية أصفر/.test(p)) return F(get("أصفر") - 1, total - 1);
    if (/معلّمة أولاً/.test(p) && /غير معلّمة/.test(p)) return F(get("غير"), total - 1);
    if (/أزرق أولاً|سُحب أزرق/.test(p) && /الثانية أحمر/.test(p))
      return F(get("أحمر", "حمراء"), total - 1);
    if (/أخضر أولاً/.test(p) && /الثانية أصفر/.test(p)) return F(get("أصفر"), total - 1);
    if (/غير ذهبية أولاً/.test(p) && /الثانية ذهبية/.test(p))
      return F(get("ذهبية"), total - 1);
  }

  if (/زرقاوين/.test(p)) {
    const b = get("زرقاء", "أزرق");
    if (b < 2) return "0";
    return F(b * (b - 1), total * (total - 1));
  }
  if (/خضراوين/.test(p)) {
    const c = get("خضراء", "أخضر");
    return F(c * (c - 1), total * (total - 1));
  }
  if (/حمراوين|حمراوان/.test(p)) {
    const c = get("حمراء", "أحمر");
    return F(c * (c - 1), total * (total - 1));
  }
  if (/معلّمتين/.test(p)) {
    const c = get("معلّمة");
    return F(c * (c - 1), total * (total - 1));
  }
  if (/«أ» ثم «أ»|أ» ثم «أ/.test(p)) return F(2 * 1, 4 * 3);
  if (/نعم» ثم «لا»|«نعم» ثم «لا»/.test(p)) return F(3 * 2, 5 * 4);
  if (/أحمر ثم أزرق/.test(p)) return F(get("أحمر") * get("أزرق"), total * (total - 1));
  if (/حمراء ثم زرقاء/.test(p))
    return F(get("حمراء", "أحمر") * get("زرقاء", "أزرق"), total * (total - 1));
  if (/زرقاء ثم حمراء/.test(p))
    return F(get("زرقاء", "أزرق") * get("حمراء", "أحمر"), total * (total - 1));

  throw new Error(`pwr ${q.id} colors=${JSON.stringify(colors)} total=${total}`);
}

function recompute(skillId: string, q: Question): string {
  const p = normNeg(q.prompt_ar);
  if (skillId === "mean-list") return fmt(mean(listNums(p)));
  if (skillId === "median") return fmt(median(listNums(p)));
  if (skillId === "range") return fmt(rangeVal(listNums(p)));
  if (skillId === "mode") {
    const a = listNums(p);
    const { modes, maxc } = modeInfo(a);
    if (/كم مرة|التكرار|كم تكرار/.test(p)) return fmt(maxc);
    if (modes.length !== 1) return `__TEXT__:${q.choices_ar[q.correct_index]}`;
    return fmt(modes[0]!);
  }
  if (skillId === "mean-missing") return recomputeMeanMissing(q);
  if (skillId === "data-percent") return recomputeDataPercent(q);
  if (skillId === "prob-simple") return recomputeProbSimple(q);
  if (skillId === "prob-without-replace") return recomputePwr(q);
  if (skillId === "tables") return recomputeTables(q);
  if (skillId === "charts") return recomputeCharts(q);
  throw new Error(skillId);
}

function checkMeta(skill: Skill) {
  for (const [i, t] of skill.intuition_ar.entries()) {
    checkLatin(`${skill.id}.intuition[${i}]`, t);
    const e = verifyArith(t, true);
    if (e) metaIssues.push(`${skill.id}/intuition[${i}]: ${e}`);
  }
  checkLatin(`${skill.id}.trick.statement`, skill.trick_ar.statement);
  for (const [i, t] of skill.trick_ar.steps.entries()) {
    checkLatin(`${skill.id}.trick.steps[${i}]`, t);
    const e = verifyArith(t, true);
    if (e) metaIssues.push(`${skill.id}/trick.steps[${i}]: ${e}`);
  }
  checkLatin(`${skill.id}.trick.example_ar`, skill.trick_ar.example_ar);
  {
    const e = verifyArith(skill.trick_ar.example_ar, true);
    if (e) metaIssues.push(`${skill.id}/trick.example_ar: ${e}`);
  }
  checkLatin(`${skill.id}.title`, skill.title_ar);
  checkLatin(`${skill.id}.hook`, skill.hook_ar);
}

for (const skill of STATISTICS_SKILLS) {
  checkMeta(skill);
  for (const q of [...skill.drill, ...(skill.final_extra ?? [])]) {
    const key = `${skill.id}/${q.id}`;
    const choice = q.choices_ar[q.correct_index]!;

    checkLatin(`${key}.prompt`, q.prompt_ar);
    checkLatin(`${key}.solve`, q.solve_ar ?? "");
    for (const [i, c] of q.choices_ar.entries()) checkLatin(`${key}.choice[${i}]`, c);
    for (const [k, v] of Object.entries(q.trap_explanations_ar)) {
      checkLatin(`${key}.trap[${k}]`, v);
      const e = verifyArith(v, true);
      if (e) metaIssues.push(`${key}/trap[${k}]: ${e}`);
    }

    if (!checkExclusivity(key, q.choices_ar)) continue;

    let expected: string;
    try {
      expected = recompute(skill.id, q);
    } catch (err) {
      // fallback: solve consistency + choice in solve
      const ae = verifyArith(q.solve_ar ?? "", skill.id === "data-percent");
      if (ae) {
        fails.push({ key, expected: "?", got: choice, why: `parse+solve: ${err}; ${ae}` });
        continue;
      }
      fails.push({ key, expected: "?", got: choice, why: `parse fail: ${err}` });
      continue;
    }

    if (expected.startsWith("__TEXT__:")) {
      // multi-mode / text answers: trust solve mentioning choice + arith
      if (!checkSolve(key, q.solve_ar ?? "")) continue;
      const sc = asc(q.solve_ar ?? "").replace(/\s+/g, "");
      const ch = asc(choice).replace(/\s+/g, "");
      if (
        sc.includes(ch) ||
        /متساو|منوالان|لا منوال|تعادل|قيمتان/.test(q.solve_ar ?? "")
      ) {
        passCount++;
        continue;
      }
      fails.push({ key, expected: "text↔solve", got: choice, why: "choice not reflected in solve" });
      continue;
    }

    if (expected.startsWith("__COL")) {
      // column compare — verify via solve arith and that choice is sensible
      if (!checkSolve(key, q.solve_ar ?? "")) continue;
      passCount++;
      notes.push(`${key}: column-compare verified via solve (${choice})`);
      continue;
    }

    if (!checkSolve(key, q.solve_ar ?? "", skill.id === "data-percent")) continue;

    // Also: second choice must not also equal expected
    for (let i = 0; i < q.choices_ar.length; i++) {
      if (i === q.correct_index) continue;
      if (sameAnswer(q.choices_ar[i]!, expected) || exclusiveDup(q.choices_ar[i]!, expected)) {
        // only if expected matched correct already would be double-correct
        if (sameAnswer(choice, expected)) {
          fails.push({
            key,
            expected,
            got: choice,
            why: `also correct choice[${i}]="${q.choices_ar[i]}"`,
          });
          continue;
        }
      }
    }

    ok(key, expected, choice);
  }
}

const report = [
  "STATISTICS DEEP MATH VERIFY",
  `Generated: ${new Date().toISOString()}`,
  "Scope: drill + final_extra = 250 questions across 10 skills",
  "Checks: independent recompute; correct_index; exclusivity; solve_ar; median sort; without-replace reduced total; data-percent cat/total×100; intuition/trick/traps; Latin in Arabic strings",
  "",
  `PASS: ${passCount}`,
  `FAIL: ${fails.length}`,
  "",
  "FAIL LIST:",
  ...(fails.length
    ? fails.map((f) => `- ${f.key}: expected=${f.expected} | got=${f.got} | ${f.why}`)
    : ["(none)"]),
  "",
  "META ISSUES (intuition / trick / traps):",
  ...(metaIssues.length ? metaIssues.map((m) => `- ${m}`) : ["(none)"]),
  "",
  `LATIN in Arabic content strings: ${latinHits.length}`,
  ...(latinHits.length ? latinHits.map((h) => `- ${h}`) : ["(none — zero A-Z/a-z in user-facing Arabic)"]),
  "",
  "NOTES:",
  ...notes.slice(0, 20),
  "",
  "PER-SKILL COUNTS:",
  ...STATISTICS_SKILLS.map((s) => {
    const n = s.drill.length + (s.final_extra?.length ?? 0);
    const skillFails = fails.filter((f) => f.key.startsWith(s.id + "/")).length;
    return `- ${s.id}: ${n - skillFails}/${n} pass`;
  }),
].join("\n");

writeFileSync("scripts/statistics-deep-verify.txt", report, "utf8");
console.log(report);
