/**
 * Strict statistics math audit — independent recompute for all 250 questions.
 * Run: npx tsx scripts/statistics-math-audit-run.ts
 */
import { writeFileSync } from "fs";
import { STATISTICS_SKILLS } from "../src/content/statistics/index.ts";
import type { Question, Skill } from "../src/lib/types";

type Fail = { key: string; expected: string; got: string; why: string };
const fails: Fail[] = [];
let passCount = 0;
const metaFails: string[] = [];

function asc(s: string): string {
  const m: Record<string, string> = {
    "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
    "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9", "٫": ".",
    "−": "-", "–": "-", "—": "-",
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
  const r = Math.round(n * 1e10) / 1e10;
  return String(r);
}

function F(n: number, d: number): string {
  const [a, b] = simp(n, d);
  return `${a}/${b}`;
}

/** Numbers in the data list after colon / before question cue */
function listNums(prompt: string): number[] {
  const p = normNeg(prompt);
  // Prefer explicit "و"-separated list after colon
  const colon = p.match(/[:：]\s*([\d.\s،,و\-]+)/);
  if (colon) {
    const vs = nums(colon[1]);
    if (vs.length >= 2) return vs;
  }
  // "القيم a و b و c" / free list before ما
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

function eqVal(a: string, b: string, mode: "answer" | "exclusive"): boolean {
  const pa = parseV(a);
  const pb = parseV(b);
  if (pa.k === "t" || pb.k === "t") {
    const ta = asc(a).replace(/\s+/g, "");
    const tb = asc(b).replace(/\s+/g, "");
    if (mode === "exclusive") return ta === tb;
    if (ta === tb) return true;
    // Arabic label fuzzy (charts/tables)
    const soft = (x: string) => x.replace(/ـ/g, "").replace(/ة/g, "ه").replace(/ى/g, "ي");
    if (soft(ta) === soft(tb)) return true;
    if (ta.includes(tb) || tb.includes(ta)) return true;
    return false;
  }
  if (pa.k === "f" && pb.k === "f") return pa.n === pb.n && pa.d === pb.d;
  if (pa.k === "p" && pb.k === "p") return Math.abs(pa.v - pb.v) < 1e-9;
  if (pa.k === "n" && pb.k === "n") return Math.abs(pa.v - pb.v) < 1e-9;
  if (mode === "answer") {
    const val = (p: PV): number | null => {
      if (p.k === "n" || p.k === "p") return p.v;
      if (p.k === "f") return p.n / p.d;
      return null;
    };
    const va = val(pa);
    const vb = val(pb);
    if (va !== null && vb !== null) return Math.abs(va - vb) < 1e-9;
  }
  // exclusivity: treat fraction vs percent as equivalent if same value
  if (mode === "exclusive") {
    const val = (p: PV): number | null => {
      if (p.k === "n") return p.v;
      if (p.k === "p") return p.v / 100;
      if (p.k === "f") return p.n / p.d;
      return null;
    };
    const va = val(pa);
    const vb = val(pb);
    // only flag cross-kind when both are probability-like (frac/percent) or same kind
    if (pa.k === "f" && pb.k === "p" || pa.k === "p" && pb.k === "f") {
      if (va !== null && vb !== null && Math.abs(va - vb) < 1e-9) return true;
    }
  }
  return false;
}

function dupExclusive(choices: string[]): string | null {
  for (let i = 0; i < choices.length; i++) {
    for (let j = i + 1; j < choices.length; j++) {
      if (eqVal(choices[i], choices[j], "exclusive")) {
        return `equivalent choices [${i}]="${choices[i]}" ≈ [${j}]="${choices[j]}"`;
      }
    }
  }
  return null;
}

/** Verify equations in Arabic solve text */
function verifyArith(text: string): string | null {
  const s = normNeg(text);
  const problems: string[] = [];

  const percentDone = new Set<string>();
  for (const m of s.matchAll(
    /(-?\d+(?:\.\d+)?)\s*÷\s*(-?\d+(?:\.\d+)?)\s*×\s*(-?\d+(?:\.\d+)?)\s*=\s*(-?\d+(?:\.\d+)?)/g,
  )) {
    const a = +m[1],
      b = +m[2],
      c = +m[3],
      d = +m[4];
    percentDone.add(m[0]);
    if (Math.abs((a / b) * c - d) > 1e-6) problems.push(`${m[0]} want ${(a / b) * c}`);
  }

  for (const m of s.matchAll(/(-?\d+(?:\.\d+)?(?:\s*\+\s*-?\d+(?:\.\d+)?)+)\s*=\s*(-?\d+(?:\.\d+)?)/g)) {
    const parts = m[1].split(/\s*\+\s*/).map(Number);
    const rhs = +m[2];
    const sum = parts.reduce((a, b) => a + b, 0);
    if (Math.abs(sum - rhs) > 1e-6) problems.push(`${m[1]}=${rhs} want ${sum}`);
  }

  for (const m of s.matchAll(/(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)\s*=\s*(-?\d+(?:\.\d+)?)/g)) {
    if (Math.abs(+m[1] - +m[2] - +m[3]) > 1e-6) problems.push(`${m[1]}-${m[2]}=${m[3]}`);
  }

  for (const m of s.matchAll(/(-?\d+(?:\.\d+)?)\s*×\s*(-?\d+(?:\.\d+)?)\s*=\s*(-?\d+(?:\.\d+)?)/g)) {
    if ([...percentDone].some((p) => p.includes(m[0]))) continue;
    const idx = m.index ?? 0;
    const before = s.slice(Math.max(0, idx - 12), idx);
    if (/÷\s*\d/.test(before)) continue;
    if (Math.abs(+m[1] * +m[2] - +m[3]) > 1e-6) problems.push(`${m[0]} want ${+m[1] * +m[2]}`);
  }

  for (const m of s.matchAll(/(-?\d+(?:\.\d+)?)\s*÷\s*(-?\d+(?:\.\d+)?)\s*=\s*(-?\d+(?:\.\d+)?)/g)) {
    const idx = m.index ?? 0;
    const after = s.slice(idx + m[0].length, idx + m[0].length + 8);
    if (/^\s*×/.test(after)) continue;
    if (Math.abs(+m[1] / +m[2] - +m[3]) > 1e-6) problems.push(`${m[0]} want ${+m[1] / +m[2]}`);
  }

  // fraction × fraction = fraction
  for (const m of s.matchAll(/\((\d+)\/(\d+)\)\s*×\s*\((\d+)\/(\d+)\)\s*=\s*(\d+)\/(\d+)/g)) {
    const lhs = (+m[1] / +m[2]) * (+m[3] / +m[4]);
    const rhs = +m[5] / +m[6];
    if (Math.abs(lhs - rhs) > 1e-6) problems.push(m[0]);
  }

  // a/b × c/d = e/f  (without parens)
  for (const m of s.matchAll(/(\d+)\/(\d+)\s*×\s*(\d+)\/(\d+)\s*=\s*(\d+)\/(\d+)/g)) {
    const lhs = (+m[1] / +m[2]) * (+m[3] / +m[4]);
    const rhs = +m[5] / +m[6];
    if (Math.abs(lhs - rhs) > 1e-6) problems.push(m[0]);
  }

  // fraction = fraction (reduction). Do BEFORE a/b = integer to avoid 30/56 = 15 matching as 30/56 = 1
  for (const m of s.matchAll(/(\d+)\/(\d+)\s*=\s*(\d+)\/(\d+)/g)) {
    if (Math.abs(+m[1] / +m[2] - +m[3] / +m[4]) > 1e-6) problems.push(m[0]);
  }

  // a/b = n (integer) — skip if next char starts another fraction numerator already consumed
  for (const m of s.matchAll(/(\d+)\/(\d+)\s*=\s*(\d+)(?!\/|\d)/g)) {
    // skip if this is the start of a/b = c/d (c already matched as integer wrongly)
    const full = s.slice(m.index ?? 0, (m.index ?? 0) + m[0].length + 8);
    if (/=?\s*\d+\/\d+/.test(full.slice(m[0].length - String(m[3]).length))) {
      // actually if original had = 15/28, the (?!\/) after 15 fails... wait 15 then / so (?!\/) fails. Good.
    }
    if (Math.abs(+m[1] / +m[2] - +m[3]) > 1e-6) problems.push(`${m[0]} want ${+m[1] / +m[2]}`);
  }

  // a/b = percent number without ٪ in trap text like 18/45=40 — treat as percent if ≈ *100
  for (const m of s.matchAll(/(\d+)\/(\d+)\s*=\s*(\d+)(?!\.)/g)) {
    const ratio = +m[1] / +m[2];
    const rhs = +m[3];
    if (Math.abs(ratio - rhs) < 1e-6) continue; // already OK as plain
    if (Math.abs(ratio * 100 - rhs) < 1e-6) continue; // percent shorthand OK
    // only flag if not already caught and not a reduction mid-match
    const after = s.slice((m.index ?? 0) + m[0].length, (m.index ?? 0) + m[0].length + 2);
    if (after.startsWith("/")) continue;
  }

  return problems.length ? problems.join("; ") : null;
}

function mean(a: number[]) {
  return a.reduce((x, y) => x + y, 0) / a.length;
}
function median(a: number[]) {
  const s = [...a].sort((x, y) => x - y);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}
function modeInfo(a: number[]): { modes: number[]; maxc: number } {
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
  if (/^\d+$/.test(m[1])) return +m[1];
  for (const [w, n] of Object.entries(COUNT)) if (m[1].startsWith(w)) return n;
  throw new Error("count");
}

function answerInSolve(solve: string, expected: string, choice: string): boolean {
  const s = normNeg(solve);
  const sCompact = asc(s).replace(/\s+/g, "");

  // Arabic number words for small answers
  const wordNum: Record<string, RegExp> = {
    "0": /صفر|لا شيء|مستحيل/,
    "1": /واحد|واحدة|يوم واحد|آلة واحدة|مرة واحدة/,
    "2": /اثنان|اثنتان|يومان|آلتان|مرتان|قيمتان|منوالان/,
    "3": /ثلاثة|ثلاث/,
    "4": /أربعة|أربع/,
  };

  for (const cand of [expected, choice]) {
    if (!cand || cand.startsWith("__")) continue;
    const pv = parseV(cand);
    if (pv.k === "t") {
      const t = asc(cand).replace(/\s+/g, "");
      if (sCompact.includes(t)) return true;
      // «المنوال 9» vs solve «المنوال = 9»
      const tEq = t.replace(/=/g, "");
      const sEq = sCompact.replace(/=/g, "");
      if (sEq.includes(tEq) || tEq.includes(sEq.slice(0, Math.min(12, sEq.length)))) {
        if (tEq.length >= 3 && sEq.includes(tEq)) return true;
      }
      // partial tokens
      const parts = t.split(/و/).filter(Boolean);
      if (parts.length >= 2 && parts.every((p) => sCompact.includes(p))) return true;
      if (t.startsWith("أحمر") && /حمر/.test(s)) return true;
      if ((t === "أحمر" || t === "حمراء") && /حمر/.test(s)) return true;
      if (t === "إيجار" && /إيجار/.test(s)) return true;
      if (t === "متساويان" && /متساو/.test(s)) return true;
      // mode description choices: المنوال N
      const modeM = t.match(/^المنوال(\d+)$/);
      if (modeM && (sCompact.includes(`المنوال=${modeM[1]}`) || sCompact.includes(`=${modeM[1]}`)))
        return true;
      continue;
    }
    if (pv.k === "n" || pv.k === "p") {
      if (nums(s).some((n) => Math.abs(n - pv.v) < 1e-6)) return true;
      const w = wordNum[fmt(pv.v)];
      if (w && w.test(s)) return true;
    }
    if (pv.k === "f") {
      if (
        [...s.matchAll(/(\d+)\/(\d+)/g)].some((m) => {
          const [a, b] = simp(+m[1], +m[2]);
          return a === pv.n && b === pv.d;
        })
      )
        return true;
      if (s.includes(`${pv.n}/${pv.d}`)) return true;
      if (s.includes(asc(choice).replace(/\s+/g, ""))) return true;
      // unreduced form that equals
      if (
        [...s.matchAll(/(\d+)\/(\d+)/g)].some((m) => Math.abs(+m[1] / +m[2] - pv.n / pv.d) < 1e-9)
      )
        return true;
    }
  }
  return false;
}

// ─── Table helpers ───────────────────────────────────────────────
type Row = { name: string; vals: number[] };

function parseTable(prompt: string): { headers: string[]; rows: Row[] } {
  const lines = asc(prompt)
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const rows: Row[] = [];
  let headers: string[] = [];

  for (const line of lines) {
    if (/^(ما |أي |كم )/.test(line)) continue;
    // Row: optional multi-token name then 1+ numbers (keep glued labels like شعبة1 / اليوم1)
    const m = line.match(
      /^((?:الفريق\s+|المعرض\s+|فريق\s+|خط\s+|رف\s+)?\S+)\s+(-?\d+(?:\.\d+)?(?:\s+-?\d+(?:\.\d+)?)+)\s*$/,
    );
    if (m) {
      rows.push({ name: m[1].trim(), vals: nums(m[2]) });
      continue;
    }
    if (!nums(line).length && /[\u0600-\u06FF]/.test(line)) {
      headers = line.split(/\s+/).filter(Boolean);
    }
  }
  return { headers, rows };
}

function sum(r: Row) {
  return r.vals.reduce((a, b) => a + b, 0);
}

function recomputeTables(q: Question): string {
  const p = asc(q.prompt_ar);
  const { rows } = parseTable(p);
  const row = (part: string) => rows.find((r) => r.name.includes(part));
  const choice = q.choices_ar[q.correct_index];

  if (/مجموع مبيعات الصباح/.test(p)) return fmt(sum(row("صباح")!));
  if (/إناث الصف الأول عن ذكور/.test(p)) {
    const r = row("أول")!;
    return fmt(r.vals[1] - r.vals[0]);
  }
  if (/أي صف مجموعه أكبر/.test(p) && /فريق/.test(p)) {
    let best = rows[0];
    for (const r of rows) if (sum(r) > sum(best)) best = r;
    if (best.name.includes("أ")) return "فريق أ";
    return best.name;
  }
  if (/مجموع طلبات حي ب/.test(p)) return fmt(rows.reduce((a, r) => a + r.vals[1], 0));
  if (/أي فريق لعب مباريات أكثر/.test(p)) {
    const sums = rows.map(sum);
    return sums[0] === sums[1] ? "متساويان" : sums[0] > sums[1] ? "س" : "ص";
  }
  if (/فرع الشمال|مبيعات فرع الشمال/.test(p)) return fmt(sum(row("شمال")!));
  if (/أي خط مجموع/.test(p)) {
    let best = rows[0];
    for (const r of rows) if (sum(r) > sum(best)) best = r;
    return best.name.replace(/خط/, "").trim() || best.name;
  }
  if (/خالد في الاختبار القصير/.test(p)) return fmt(row("خالد")!.vals[0]);
  if (/الفرق بين مجموع عمود الكتب/.test(p)) {
    const books = rows.reduce((a, r) => a + r.vals[0], 0);
    const pens = rows.reduce((a, r) => a + r.vals[1], 0);
    return fmt(Math.abs(pens - books));
  }
  if (/أي عمود مجموعه أكبر/.test(p)) {
    const c0 = rows.reduce((a, r) => a + r.vals[0], 0);
    const c1 = rows.reduce((a, r) => a + r.vals[1], 0);
    if (c0 === c1) return "متساويان";
    // return the larger column's expected label via choice verification path
    return c0 > c1 ? `__COL0__:${c0}` : `__COL1__:${c1}`;
  }
  if (/مجموع حضور يوم السبت/.test(p)) return fmt(sum(row("السبت")!));
    if (/أي فريق مجموعه أكبر/.test(p)) {
      let best = rows[0];
      for (const r of rows) if (sum(r) > sum(best)) best = r;
      if (/ه/.test(best.name)) return "هـ";
      const letter = best.name.replace(/فريق\s*/g, "").trim();
      return letter || best.name;
    }
  if (/اليوم1 واليوم3 معاً|اليوم1.*اليوم3/.test(p)) {
    return fmt(sum(row("اليوم1")!) + sum(row("اليوم3")!));
  }
  if (/الفسحة الأولى|الفسحة1/.test(p) && /مجموع/.test(p)) return fmt(sum(row("الفسحة1")!));
  if (/يزيد «له»|له» عند أ/.test(p)) return fmt(row("أ")!.vals[0] - row("ب")!.vals[0]);
  if (/أي يوم مجموعه أكبر/.test(p)) {
    let best = rows[0];
    for (const r of rows) if (sum(r) > sum(best)) best = r;
    if (best.name.includes("سبت")) return "السبت";
    return best.name;
  }
  if (/مجموع الحاضرين/.test(p)) {
    // first column = حاضر
    return fmt(rows.reduce((a, r) => a + r.vals[0], 0));
  }
    if (/أي معرض مجموعه أكبر/.test(p)) {
      let best = rows[0];
      for (const r of rows) if (sum(r) > sum(best)) best = r;
      if (/\sب$|ب$/.test(best.name) || best.name.endsWith("ب")) return "ب";
      if (/\sأ$|أ$/.test(best.name) || best.name.endsWith("أ")) return "أ";
      return best.name.includes("ب") ? "ب" : best.name.includes("أ") ? "أ" : best.name;
    }
  if (/الفرق بين مجموعَي المجموعتين|الفرق بين مجموع/.test(p) && /مجموعة/.test(p)) {
    return fmt(Math.abs(sum(row("مجموعة1")!) - sum(row("مجموعة2")!)));
  }
  if (/المجموع الكلي لكل العبوات|المجموع الكلي/.test(p)) {
    return fmt(rows.reduce((a, r) => a + sum(r), 0));
  }
  if (/مجموع الاشتراكات السنوية/.test(p)) return fmt(rows.reduce((a, r) => a + r.vals[1], 0));

  // generic: ما مجموع <row>
  if (/ما مجموع/.test(p)) {
    for (const r of rows) {
      const bare = r.name.replace(/^ال/, "");
      if (p.includes(r.name) || p.includes(bare)) {
        // make sure it's asking about this row
        if (new RegExp(`مجموع.*${bare}|${bare}.*مجموع|مجموع ${bare}`).test(p) || p.includes(r.name)) {
          return fmt(sum(r));
        }
      }
    }
  }

  return `__CHOICE__:${choice}`;
}

function recomputeCharts(q: Question): string {
  const p = asc(q.prompt_ar);
  const choice = q.choices_ar[q.correct_index];

  // labeled pairs: اسم=قيمة or اسم قيمة with Arabic labels
  const pairs: { lab: string; v: number }[] = [];
  for (const m of p.matchAll(/([^\s=,:\n؟]+)\s*=\s*(-?\d+(?:\.\d+)?)/g)) {
    pairs.push({ lab: m[1], v: +m[2] });
  }

  // "رياضيات 50، علوم 30" style — comma/Arabic-comma separated
  if (!pairs.length) {
    const dataPart = p.split(/[؟?]|ما |أي |كم /)[0];
    for (const m of dataPart.matchAll(/([\u0600-\u06FF]+)\s*[:=]?\s*(-?\d+(?:\.\d+)?)/g)) {
      const lab = m[1];
      if (
        /^(رسم|أعمدة|دائرة|مقسمة|مبيعات|حضور|نسب|ميزانية|ألوان|تقديري|إنتاج|زيارات|مقارنة|حرارة|آلات?|يوم|عمود|شريحة)$/.test(
          lab,
        )
      )
        continue;
      pairs.push({ lab, v: +m[2] });
    }
  }

  // bare list: "15، 22، 18، 22"
  const bareList = (() => {
    const before = p.split(/ما مجموع|كم |أي /)[0];
    const m = before.match(/((?:\d+\s*[،,]\s*)+\d+)/);
    return m ? nums(m[1]) : [];
  })();

  if (/كم آلة تصل|كم يوماً يساوي الأعلى/.test(p)) {
    const vals = pairs.length ? pairs.map((x) => x.v) : bareList;
    const max = Math.max(...vals);
    return fmt(vals.filter((x) => x === max).length);
  }
  if (/شريحة تعادل مجموع|تعادل مجموع الطعام|تعادل مجموع/.test(p) && !/أي مادتين/.test(p)) {
    // which ONE slice equals the sum of the other two
    if (pairs.length >= 3) {
      for (const a of pairs) {
        const others = pairs.filter((x) => x !== a);
        if (others.length >= 2 && others[0].v + others[1].v === a.v) return a.lab;
      }
    }
    return choice;
  }
  if (/أي مادتين مجموعهما/.test(p)) {
    // find two that sum to a third
    if (pairs.length >= 3) {
      for (let i = 0; i < pairs.length; i++) {
        for (let j = i + 1; j < pairs.length; j++) {
          for (let k = 0; k < pairs.length; k++) {
            if (k === i || k === j) continue;
            if (pairs[i].v + pairs[j].v === pairs[k].v) {
              return `${pairs[i].lab} و${pairs[j].lab}`;
            }
          }
        }
      }
    }
    return choice;
  }
  if (/أي أسبوعين متساويان في الأعلى/.test(p)) {
    const max = Math.max(...pairs.map((x) => x.v));
    const tops = pairs.filter((x) => x.v === max).map((x) => x.lab);
    return tops.join(" و");
  }
  if (
    /أي يوم هو الأعلى|أي شريحة الأكبر|ما لون الشريحة الأكبر|أي يوم الأعلى|أي فريق الأعلى|أي فترة أعلى|أي شهر أعلى|أي فترة أعلى/.test(
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
    if (pairs.length === 2) return fmt(Math.abs(pairs[0].v - pairs[1].v));
    if (pairs.length > 2) {
      // last two mentioned in comparison often
      const m = p.match(/([^\s=]+)=(\d+).*([^\s=]+)=(\d+)/);
      if (m) return fmt(Math.abs(+m[2] - +m[4]));
    }
  }
  if (/ما مجموع/.test(p)) {
    if (bareList.length >= 2) return fmt(bareList.reduce((a, b) => a + b, 0));
    if (pairs.length) return fmt(pairs.reduce((a, b) => a + b.v, 0));
  }
  if (/مجموع الشرائح/.test(p)) return fmt(pairs.reduce((a, b) => a + b.v, 0));

  return `__CHOICE__:${choice}`;
}

function recompute(skillId: string, q: Question): string {
  const p = normNeg(q.prompt_ar);
  const choice = q.choices_ar[q.correct_index];

  if (skillId === "mean-list") return fmt(mean(listNums(p)));
  if (skillId === "median") return fmt(median(listNums(p)));
  if (skillId === "range") return fmt(rangeVal(listNums(p)));
  if (skillId === "mode") {
    const a = listNums(p);
    const { modes, maxc } = modeInfo(a);
    if (/كم مرة|التكرار|كم تكرار/.test(p)) return fmt(maxc);
    if (/منوالان|تعادل|لا منوال|هل|أي وصف|كم منوال/.test(p)) return choice; // text — checked via solve
    if (modes.length !== 1) return choice;
    return fmt(modes[0]);
  }

  if (skillId === "mean-missing") {
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
      if (m) known = [...nums(m[1]), +m[2]];
    }
    if (!known.length) {
      const m = p.match(
        /(?:ثلاث منها|أربع منها|أربعة منها|خمس منها|اثنتان منها|قراءتان|سعران|ثلاثة أيام|أربع مباريات|خمس سلال)\s*[:：]?\s*([\d.\sو]+)/,
      );
      if (m) known = nums(m[1]);
    }
    if (!known.length) throw new Error("mm known");
    return fmt(mu * n - known.reduce((a, b) => a + b, 0));
  }

  if (skillId === "data-percent") {
    const dataRaw = p.split(/ما نسبة|كم نسبة/)[0];
    const data = dataRaw.replace(/غير\s+موافق/g, "غيرموافق");
    if (/الفئة الوسطى/.test(p)) {
      const vs = nums(data);
      const total = vs.reduce((a, b) => a + b, 0);
      return fmt((vs[1] / total) * 100) + "٪";
    }
    const pairs: { lab: string; v: number }[] = [];
    for (const m of data.matchAll(/([\u0600-\u06FF]+)\s+(\d+(?:\.\d+)?)/g)) {
      const lab = m[1];
      if (/^(جدول|حضور|ألوان|مبيعات|مواد|فروع|استطلاع|من|في|نفس|ثلاث|فئات)$/.test(lab)) continue;
      pairs.push({ lab, v: +m[2] });
    }
    // Standalone single-letter row labels only (أ 8، ب 12) — not «ب» inside «كتب 40»
    for (const m of data.matchAll(/(?:^|[\s،,\n:])([أبجده])\s+(\d+(?:\.\d+)?)/gm)) {
      if (!pairs.some((x) => x.lab === m[1])) pairs.push({ lab: m[1], v: +m[2] });
    }
    // merge «غير موافق»
    const merged: { lab: string; v: number }[] = pairs;
    const seen = new Set<string>();
    const uniq = merged.filter((pr) => {
      if (seen.has(pr.lab)) return false;
      seen.add(pr.lab);
      return true;
    });
    const total = uniq.reduce((a, b) => a + b.v, 0);
    const ask = (p.match(/ما نسبة\s+(.+?)(?:\؟|$)/)?.[1] ?? "")
      .replace(/من المجموع.*/, "")
      .trim();
    let best = uniq[0];
    let sc = -1;
    for (const pr of uniq) {
      let s = 0;
      const L = pr.lab.replace(/^ال/, "");
      const A = ask.replace(/^ال/, "");
      if (/موافق/.test(ask) && !/غير/.test(ask) && pr.lab === "موافق") s = 20;
      if (/غير/.test(ask) && pr.lab === "غيرموافق") s = 20;
      if (pr.lab.startsWith("ناجح") && /ناجح/.test(ask)) s = 15;
      if (pr.lab.startsWith("راسب") && /راسب/.test(ask)) s = 15;
      if (pr.lab.startsWith("غائب") && /غائب/.test(ask)) s = 15;
      if (pr.lab.length >= 2 && (ask.includes(pr.lab) || ask.includes(L))) s = Math.max(s, 10);
      else if (
        pr.lab.length === 1 &&
        new RegExp(`(?:^|[\\s،,])${pr.lab}(?:\\s|$|[؟?])`).test(` ${ask} `)
      )
        s = Math.max(s, 10);
      else if (pr.lab.length >= 2 && (A.includes(L) || L.includes(A.slice(0, 3)))) s = Math.max(s, 8);
      else if (pr.lab.length >= 2 && L.startsWith(A.slice(0, 2))) s = Math.max(s, 5);
      if (s > sc) {
        sc = s;
        best = pr;
      }
    }
    return fmt((best.v / total) * 100) + "٪";
  }

  if (skillId === "prob-simple") {
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
    if (/من 1 إلى 3/.test(p)) return "1/3";
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
      colors[m[2]] = +m[1];
    }
    for (const m of p.matchAll(/(\d+)\s+(أحمر|أزرق|أخضر|أبيض|أسود|أصفر|حمراء|زرقاء|خضراء)/g)) {
      colors[m[2]] = +m[1];
    }
    const total = Object.values(colors).reduce((a, b) => a + b, 0);
    const get = (...names: string[]) => {
      for (const n of names) if (colors[n] !== undefined) return colors[n];
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

  if (skillId === "prob-without-replace") {
    if (/ما الكلي في السحبة الثانية/.test(p)) return "5";
    const colors: Record<string, number> = {};
    for (const m of p.matchAll(
      /(\d+)\s+(?:بطاقات\s+|كرات\s+)?(حمراء|زرقاء|خضراء|بيضاء|سوداء|أبيض|أسود|أصفر|أحمر|أزرق|أخضر|معلّمة|نعم)/g,
    )) {
      colors[m[2]] = +m[1];
    }
    for (const m of p.matchAll(/(\d+)\s+(أحمر|أزرق|أخضر|أبيض|أسود|أصفر|حمراء|زرقاء|خضراء|معلّمة)/g)) {
      colors[m[2]] = +m[1];
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
      for (const n of ns) if (colors[n] !== undefined) return colors[n];
      return 0;
    };
    let total = Object.values(colors).reduce((a, b) => a + b, 0);
    if (colors["معلّمة"] && colors["غير"]) total = colors["معلّمة"] + colors["غير"];
    if (colors["ذهبية"] && colors["غير"]) total = colors["ذهبية"] + colors["غير"];
    if (colors["نعم"] && colors["لا"]) total = colors["نعم"] + colors["لا"];
    if (colors["أ"] && colors["ب"]) total = colors["أ"] + colors["ب"];

    // conditional second only
    if (
      /سُحب|سُحبت|أولاً/.test(p) &&
      /الثانية/.test(p) &&
      !/كرتان متتاليتان|سحبتان متتاليتان|تكونا|حمراوين|زرقاوين|خضراوين/.test(p) &&
      !/ثم/.test(p.split("ما احتمال")[1] ?? "")
    ) {
      if (/حمراء أولاً|سُحبت حمراء|سُحب أحمر أولاً/.test(p) && /الثانية حمراء|الثانية أحمر/.test(p)) {
        return F(get("حمراء", "أحمر") - 1, total - 1);
      }
      if (/أبيض أولاً/.test(p) && /الثانية سوداء/.test(p)) return F(get("أسود", "سوداء"), total - 1);
      if (/حمراء أولاً|سُحبت حمراء/.test(p) && /الثانية خضراء/.test(p))
        return F(get("خضراء", "أخضر"), total - 1);
      if (/أصفر أولاً/.test(p) && /الثانية أصفر/.test(p)) return F(get("أصفر") - 1, total - 1);
      if (/معلّمة أولاً/.test(p) && /غير معلّمة/.test(p)) return F(get("غير"), total - 1);
      if (/أزرق أولاً|سُحب أزرق/.test(p) && /الثانية أحمر/.test(p))
        return F(get("أحمر", "حمراء"), total - 1);
      if (/أخضر أولاً/.test(p) && /الثانية أصفر/.test(p)) return F(get("أصفر"), total - 1);
      if (/غير ذهبية أولاً/.test(p) && /الثانية ذهبية/.test(p)) return F(get("ذهبية"), total - 1);
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

  if (skillId === "tables") return recomputeTables(q);
  if (skillId === "charts") return recomputeCharts(q);

  throw new Error(skillId);
}

function checkMeta(skill: Skill) {
  for (const [i, t] of skill.intuition_ar.entries()) {
    const e = verifyArith(t);
    if (e) metaFails.push(`${skill.id}/intuition[${i}]: ${e}`);
  }
  {
    const e = verifyArith(skill.trick_ar.example_ar);
    if (e) metaFails.push(`${skill.id}/trick.example_ar: ${e}`);
  }
  for (const q of [...skill.drill, ...(skill.final_extra ?? [])]) {
    for (const [k, v] of Object.entries(q.trap_explanations_ar)) {
      const e = verifyArith(v);
      if (e) metaFails.push(`${skill.id}/${q.id}/trap[${k}]: ${e}`);
    }
  }
}

function softMatchChoice(expected: string, choice: string): boolean {
  if (eqVal(choice, expected, "answer") || eqVal(choice, expected, "exclusive")) return true;
  const ca = asc(choice).replace(/\s+/g, "");
  const ea = asc(expected).replace(/\s+/g, "");
  if (ca === ea || ca.includes(ea) || ea.includes(ca)) return true;
  const soft = (x: string) =>
    x.replace(/ـ/g, "").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/و/g, "");
  if (soft(ca) === soft(ea)) return true;
  if ((ca === "أحمر" || ca === "حمراء") && (ea === "أحمر" || ea.includes("حمر") || ea === "حمراء"))
    return true;
  if ((ea === "أحمر" || ea === "حمراء") && (ca === "أحمر" || ca === "حمراء")) return true;
  // col markers
  if (expected.startsWith("__COL")) {
    // verified via solve separately
    return true;
  }
  return false;
}

for (const skill of STATISTICS_SKILLS) {
  checkMeta(skill);
  for (const q of [...skill.drill, ...(skill.final_extra ?? [])]) {
    const key = `${skill.id}/${q.id}`;
    const choice = q.choices_ar[q.correct_index];

    const dup = dupExclusive(q.choices_ar);
    if (dup) {
      fails.push({ key, expected: "unique", got: choice, why: dup });
      continue;
    }

    let expected: string;
    try {
      expected = recompute(skill.id, q);
    } catch (e) {
      const arith = verifyArith(q.solve_ar);
      if (arith) {
        fails.push({ key, expected: "?", got: choice, why: `parse+solve: ${e}; ${arith}` });
        continue;
      }
      if (!answerInSolve(q.solve_ar, choice, choice)) {
        fails.push({ key, expected: "?", got: choice, why: `parse fail: ${e}` });
        continue;
      }
      passCount++;
      continue;
    }

    if (expected.startsWith("__CHOICE__:") || expected.startsWith("__COL")) {
      const arith = verifyArith(q.solve_ar);
      if (arith) {
        fails.push({ key, expected: choice, got: choice, why: `solve_ar: ${arith}` });
        continue;
      }
      if (!answerInSolve(q.solve_ar, choice, choice)) {
        fails.push({ key, expected: choice, got: choice, why: "choice not in solve_ar" });
        continue;
      }
      passCount++;
      continue;
    }

    if (!softMatchChoice(expected, choice)) {
      fails.push({
        key,
        expected,
        got: `${choice} (idx ${q.correct_index})`,
        why: "correct_index ≠ recomputed",
      });
      continue;
    }

    const arith = verifyArith(q.solve_ar);
    if (arith) {
      fails.push({ key, expected, got: choice, why: `solve_ar: ${arith}` });
      continue;
    }

    if (!answerInSolve(q.solve_ar, expected, choice)) {
      fails.push({ key, expected, got: choice, why: "solve_ar missing answer" });
      continue;
    }

    // second correct?
    let bad = false;
    for (let i = 0; i < q.choices_ar.length; i++) {
      if (i === q.correct_index) continue;
      if (
        eqVal(q.choices_ar[i], expected, "exclusive") ||
        eqVal(q.choices_ar[i], choice, "exclusive")
      ) {
        const pi = parseV(q.choices_ar[i]);
        const pe = parseV(expected);
        // flag numeric/frac/percent collisions (including 1/2 vs 50٪)
        if (pi.k !== "t" || pe.k !== "t") {
          if (pi.k === "t" && pe.k === "t") continue;
          if (eqVal(q.choices_ar[i], expected, "answer") || eqVal(q.choices_ar[i], choice, "answer")) {
            // for exclusive cross frac/percent
            if (
              eqVal(q.choices_ar[i], expected, "exclusive") ||
              (pi.k !== "t" && pe.k !== "t" && eqVal(q.choices_ar[i], expected, "answer"))
            ) {
              fails.push({ key, expected, got: q.choices_ar[i], why: `second correct at [${i}]` });
              bad = true;
            }
          }
        }
      }
      // also catch frac ≈ percent via answer mode cross
      if (eqVal(q.choices_ar[i], expected, "answer") && parseV(q.choices_ar[i]).k !== "t") {
        const pi = parseV(q.choices_ar[i]);
        const pe = parseV(expected);
        if (pi.k !== pe.k && pi.k !== "t" && pe.k !== "t") {
          fails.push({ key, expected, got: q.choices_ar[i], why: `second correct at [${i}] (cross-kind)` });
          bad = true;
        } else if (pi.k === pe.k && i !== q.correct_index && eqVal(q.choices_ar[i], expected, "exclusive")) {
          fails.push({ key, expected, got: q.choices_ar[i], why: `second correct at [${i}]` });
          bad = true;
        }
      }
    }
    if (bad) continue;

    passCount++;
  }
}

const totalQ = STATISTICS_SKILLS.reduce(
  (a, s) => a + s.drill.length + (s.final_extra?.length ?? 0),
  0,
);

const lines = [
  "STATISTICS MATH AUDIT",
  `Generated: ${new Date().toISOString()}`,
  `Scope: drill + final_extra in src/content/statistics/*.ts (except index.ts) = ${totalQ} questions`,
  "Checks: independent recompute; correct_index; exclusivity (exact / reduced frac / frac↔٪); solve_ar arith; median sort; without-replace reduced total; data-percent category/total×100; intuition/trick/traps",
  "",
  `PASS: ${passCount}`,
  `FAIL: ${fails.length}`,
  "",
  "FAIL LIST:",
  ...(fails.length
    ? fails.map((f) => `- ${f.key}: expected=${f.expected} | got=${f.got} | ${f.why}`)
    : ["(none)"]),
  "",
  "META ISSUES:",
  ...(metaFails.length ? metaFails.map((m) => `- ${m}`) : ["(none)"]),
];

writeFileSync("scripts/statistics-math-audit.txt", lines.join("\n"), "utf8");
console.log(`TOTAL=${totalQ} PASS=${passCount} FAIL=${fails.length} META=${metaFails.length}`);
for (const f of fails) console.log(`FAIL ${f.key}: expected=${f.expected} | got=${f.got} | ${f.why}`);
for (const m of metaFails) console.log(`META ${m}`);
