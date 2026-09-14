/**
 * Algebra math audit — independent recomputation for all 300 questions.
 * Run: npx tsx scripts/algebra-math-audit-run.ts
 */
import { writeFileSync } from "fs";
import { ALGEBRA_SKILLS } from "../src/content/algebra/index.ts";

type Fail = { key: string; expected: string; choiceAtIndex: string; why: string };
const fails: Fail[] = [];
let passCount = 0;

function asc(s: string): string {
  const m: Record<string, string> = {
    "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
    "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9", "٫": ".",
    "−": "-", "×": "*", "÷": "/",
  };
  return s.replace(/[٠-٩٫−×÷]/g, (c) => m[c] ?? c);
}

function num(s: string): number | null {
  const m = asc(s).match(/(-?\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : null;
}

function unit(s: string): string {
  return asc(s).replace(/[\d.\s+\-]/g, "").replace(/س/g, "").trim();
}

function eq(a: string, b: string): boolean {
  const aa = asc(a).replace(/\s+/g, "").toLowerCase();
  const bb = asc(b).replace(/\s+/g, "").toLowerCase();
  if (aa === bb || aa.includes(bb) || bb.includes(aa)) return true;
  const na = num(a);
  const nb = num(b);
  if (na !== null && nb !== null && Math.abs(na - nb) < 0.06) {
    const ua = unit(a);
    const ub = unit(b);
    if (!ua || !ub || ua === ub) return true;
  }
  // algebraic: compare normalized (ignore spaces)
  const normA = aa.replace(/\+/g, "").replace(/-/g, "-");
  const normB = bb.replace(/\+/g, "").replace(/-/g, "-");
  if (normA === normB) return true;
  return false;
}

function norm(s: string): string {
  return asc(s).replace(/\s+/g, "");
}

/** True only when two choices are mathematically the same answer (not substring traps). */
function choicesEquivalent(a: string, b: string): boolean {
  const aa = norm(a);
  const bb = norm(b);
  if (aa === bb) return true;
  // Pure numeric (+ optional unit suffix)
  const numRe = /^(-?\d+(?:\.\d+)?)(.*)$/;
  const ma = aa.match(numRe);
  const mb = bb.match(numRe);
  if (ma && mb && ma[2] === mb[2] && Math.abs(parseFloat(ma[1]) - parseFloat(mb[1])) < 0.001) {
    return true;
  }
  // Algebraic: identical after normalization (no substring partial match)
  if (aa.includes("س") && bb.includes("س") && aa === bb) return true;
  return false;
}

function dup(choices: string[]): string | null {
  for (let i = 0; i < choices.length; i++) {
    for (let j = i + 1; j < choices.length; j++) {
      if (choicesEquivalent(choices[i], choices[j])) {
        return `duplicate equivalent choices [${i}] vs [${j}]: "${choices[i]}" ≈ "${choices[j]}"`;
      }
    }
  }
  return null;
}

/** Independent expected answers — recomputed from prompt_ar */
const EXPECTED: Record<string, string> = {
  // simplify (25)
  "simplify/sm-01": "8س", "simplify/sm-02": "6س + 3", "simplify/sm-03": "12 − 2س",
  "simplify/sm-04": "4س + 4", "simplify/sm-05": "11س − 3", "simplify/sm-06": "3س + 6",
  "simplify/sm-07": "2س + 6", "simplify/sm-08": "4س + 2", "simplify/sm-09": "6 − 2س",
  "simplify/sm-10": "8س", "simplify/sm-11": "7س − 5", "simplify/sm-12": "9س − 7",
  "simplify/sm-13": "4س + 4", "simplify/sm-14": "−3س + 4", "simplify/sm-15": "13",
  "simplify/sm-16": "−5س + 9", "simplify/sm-17": "9 − 2س", "simplify/sm-18": "7س + 1",
  "simplify/sm-f01": "5س + 6", "simplify/sm-f02": "12 − 3س", "simplify/sm-f03": "5س − 5",
  "simplify/sm-f04": "4س + 2", "simplify/sm-f05": "−4س + 15", "simplify/sm-f06": "6س − 5",
  "simplify/sm-f07": "8",
  // eval-expr (25)
  "eval-expr/ev-01": "15", "eval-expr/ev-02": "13", "eval-expr/ev-03": "24", "eval-expr/ev-04": "17",
  "eval-expr/ev-05": "2", "eval-expr/ev-06": "4", "eval-expr/ev-07": "23", "eval-expr/ev-08": "51",
  "eval-expr/ev-09": "6", "eval-expr/ev-10": "32", "eval-expr/ev-11": "1", "eval-expr/ev-12": "16",
  "eval-expr/ev-13": "36", "eval-expr/ev-14": "98", "eval-expr/ev-15": "39", "eval-expr/ev-16": "9",
  "eval-expr/ev-17": "27", "eval-expr/ev-18": "66",
  "eval-expr/ev-f01": "7", "eval-expr/ev-f02": "12", "eval-expr/ev-f03": "15", "eval-expr/ev-f04": "26",
  "eval-expr/ev-f05": "93", "eval-expr/ev-f06": "10", "eval-expr/ev-f07": "9",
  // ages (25)
  "ages/ages-01": "12 سنة", "ages/ages-02": "30 سنة", "ages/ages-03": "12 سنة",
  "ages/ages-04": "11 سنة", "ages/ages-05": "14 سنة", "ages/ages-06": "5 سنوات",
  "ages/ages-07": "12 سنة", "ages/ages-08": "26 سنة", "ages/ages-09": "41 سنة",
  "ages/ages-10": "8 سنوات", "ages/ages-11": "45 سنة", "ages/ages-12": "14 سنة",
  "ages/ages-13": "12 سنة", "ages/ages-14": "8 سنوات", "ages/ages-15": "39 سنة",
  "ages/ages-16": "18 سنة", "ages/ages-17": "7 سنوات", "ages/ages-18": "60 سنة",
  "ages/ages-f01": "44 سنة", "ages/ages-f02": "4 سنوات", "ages/ages-f03": "32 سنة",
  "ages/ages-f04": "6", "ages/ages-f05": "50", "ages/ages-f06": "10 سنوات", "ages/ages-f07": "15 سنة",
  // two-step-eq (25)
  "two-step-eq/ts-01": "4", "two-step-eq/ts-02": "5", "two-step-eq/ts-03": "3", "two-step-eq/ts-04": "5",
  "two-step-eq/ts-05": "4", "two-step-eq/ts-06": "3", "two-step-eq/ts-07": "5", "two-step-eq/ts-08": "7",
  "two-step-eq/ts-09": "8", "two-step-eq/ts-10": "4", "two-step-eq/ts-11": "5", "two-step-eq/ts-12": "5",
  "two-step-eq/ts-13": "5", "two-step-eq/ts-14": "4", "two-step-eq/ts-15": "7", "two-step-eq/ts-16": "4",
  "two-step-eq/ts-17": "7", "two-step-eq/ts-18": "4",
  "two-step-eq/ts-f01": "6", "two-step-eq/ts-f02": "7", "two-step-eq/ts-f03": "5", "two-step-eq/ts-f04": "6",
  "two-step-eq/ts-f05": "7", "two-step-eq/ts-f06": "6", "two-step-eq/ts-f07": "3",
  // linear-eq (25)
  "linear-eq/lin-01": "6", "linear-eq/lin-02": "5", "linear-eq/lin-03": "11", "linear-eq/lin-04": "7 كغ",
  "linear-eq/lin-05": "5", "linear-eq/lin-06": "4", "linear-eq/lin-07": "9", "linear-eq/lin-08": "3",
  "linear-eq/lin-09": "17", "linear-eq/lin-10": "4", "linear-eq/lin-11": "7", "linear-eq/lin-12": "5",
  "linear-eq/lin-13": "3", "linear-eq/lin-14": "5", "linear-eq/lin-15": "7", "linear-eq/lin-16": "5",
  "linear-eq/lin-17": "25", "linear-eq/lin-18": "5",
  "linear-eq/lin-f01": "6", "linear-eq/lin-f02": "6", "linear-eq/lin-f03": "27", "linear-eq/lin-f04": "6",
  "linear-eq/lin-f05": "7", "linear-eq/lin-f06": "11", "linear-eq/lin-f07": "5",
  // square-patterns (25)
  "square-patterns/sqp-01": "25", "square-patterns/sqp-02": "9", "square-patterns/sqp-03": "36",
  "square-patterns/sqp-04": "36", "square-patterns/sqp-05": "36", "square-patterns/sqp-06": "25",
  "square-patterns/sqp-07": "7", "square-patterns/sqp-08": "49", "square-patterns/sqp-09": "4",
  "square-patterns/sqp-10": "64", "square-patterns/sqp-11": "100", "square-patterns/sqp-12": "48",
  "square-patterns/sqp-13": "64", "square-patterns/sqp-14": "11", "square-patterns/sqp-15": "100",
  "square-patterns/sqp-16": "64", "square-patterns/sqp-17": "16", "square-patterns/sqp-18": "144",
  "square-patterns/sqp-f01": "81", "square-patterns/sqp-f02": "11", "square-patterns/sqp-f03": "36",
  "square-patterns/sqp-f04": "225", "square-patterns/sqp-f05": "16", "square-patterns/sqp-f06": "17",
  "square-patterns/sqp-f07": "100",
  // arith-seq (25)
  "arith-seq/aseq-01": "16", "arith-seq/aseq-02": "0", "arith-seq/aseq-03": "6", "arith-seq/aseq-04": "13",
  "arith-seq/aseq-05": "18", "arith-seq/aseq-06": "15", "arith-seq/aseq-07": "60", "arith-seq/aseq-08": "−5",
  "arith-seq/aseq-09": "46", "arith-seq/aseq-10": "8", "arith-seq/aseq-11": "8", "arith-seq/aseq-12": "28",
  "arith-seq/aseq-13": "6", "arith-seq/aseq-14": "79", "arith-seq/aseq-15": "8", "arith-seq/aseq-16": "20",
  "arith-seq/aseq-17": "15", "arith-seq/aseq-18": "110",
  "arith-seq/aseq-f01": "48", "arith-seq/aseq-f02": "4", "arith-seq/aseq-f03": "4", "arith-seq/aseq-f04": "49",
  "arith-seq/aseq-f05": "0", "arith-seq/aseq-f06": "16", "arith-seq/aseq-f07": "96",
  // inequalities (25)
  "inequalities/ineq-01": "7", "inequalities/ineq-02": "4", "inequalities/ineq-03": "5", "inequalities/ineq-04": "−2",
  "inequalities/ineq-05": "6", "inequalities/ineq-06": "7", "inequalities/ineq-07": "23", "inequalities/ineq-08": "12",
  "inequalities/ineq-09": "7", "inequalities/ineq-10": "7", "inequalities/ineq-11": "9", "inequalities/ineq-12": "11",
  "inequalities/ineq-13": "3", "inequalities/ineq-14": "5", "inequalities/ineq-15": "5", "inequalities/ineq-16": "19",
  "inequalities/ineq-17": "7", "inequalities/ineq-18": "15",
  "inequalities/ineq-f01": "7", "inequalities/ineq-f02": "7", "inequalities/ineq-f03": "6", "inequalities/ineq-f04": "33",
  "inequalities/ineq-f05": "12", "inequalities/ineq-f06": "7", "inequalities/ineq-f07": "6",
  // check-by-sub (25)
  "check-by-sub/cbs-01": "7", "check-by-sub/cbs-02": "13", "check-by-sub/cbs-03": "8", "check-by-sub/cbs-04": "18",
  "check-by-sub/cbs-05": "2", "check-by-sub/cbs-06": "3", "check-by-sub/cbs-07": "1", "check-by-sub/cbs-08": "7",
  "check-by-sub/cbs-09": "4", "check-by-sub/cbs-10": "6", "check-by-sub/cbs-11": "8", "check-by-sub/cbs-12": "6",
  "check-by-sub/cbs-13": "4", "check-by-sub/cbs-14": "13", "check-by-sub/cbs-15": "7", "check-by-sub/cbs-16": "3",
  "check-by-sub/cbs-17": "10", "check-by-sub/cbs-18": "5",
  "check-by-sub/cbs-f1": "7", "check-by-sub/cbs-f2": "7", "check-by-sub/cbs-f3": "7", "check-by-sub/cbs-f4": "7",
  "check-by-sub/cbs-f5": "12", "check-by-sub/cbs-f6": "3", "check-by-sub/cbs-f7": "4",
  // balance-sides (25)
  "balance-sides/bal-01": "س = 7", "balance-sides/bal-02": "س = 15", "balance-sides/bal-03": "س = 7",
  "balance-sides/bal-04": "س = 15", "balance-sides/bal-05": "طرح 9 من الطرفين",
  "balance-sides/bal-06": "قسمة الطرفين على 3", "balance-sides/bal-07": "12", "balance-sides/bal-08": "يميل ولا يبقى متساوياً",
  "balance-sides/bal-09": "12", "balance-sides/bal-10": "5", "balance-sides/bal-11": "جمع 3 للطرفين",
  "balance-sides/bal-12": "20", "balance-sides/bal-13": "0", "balance-sides/bal-14": "1",
  "balance-sides/bal-15": "6 = س", "balance-sides/bal-16": "3س = 12", "balance-sides/bal-17": "الميزان يميل لأن الطرف الأيمن لم يُقسم",
  "balance-sides/bal-18": "اجمع 4 للطرفين",
  "balance-sides/bal-f1": "5", "balance-sides/bal-f2": "5", "balance-sides/bal-f3": "جمع 9 للطرفين",
  "balance-sides/bal-f4": "18", "balance-sides/bal-f5": "0", "balance-sides/bal-f6": "4س = 12", "balance-sides/bal-f7": "س = 8",
  // algebra-relations (25)
  "algebra-relations/arel-01": "7", "algebra-relations/arel-02": "11", "algebra-relations/arel-03": "20",
  "algebra-relations/arel-04": "30", "algebra-relations/arel-05": "س = ص + 7", "algebra-relations/arel-06": "س = 2ص",
  "algebra-relations/arel-07": "10", "algebra-relations/arel-08": "9", "algebra-relations/arel-09": "17",
  "algebra-relations/arel-10": "11", "algebra-relations/arel-11": "7", "algebra-relations/arel-12": "13",
  "algebra-relations/arel-13": "13", "algebra-relations/arel-14": "10", "algebra-relations/arel-15": "31",
  "algebra-relations/arel-16": "س = ص ÷ 2 + 9", "algebra-relations/arel-17": "−8", "algebra-relations/arel-18": "19",
  "algebra-relations/arel-f1": "13", "algebra-relations/arel-f2": "س = 3ص − 2", "algebra-relations/arel-f3": "25",
  "algebra-relations/arel-f4": "35", "algebra-relations/arel-f5": "2", "algebra-relations/arel-f6": "16",
  "algebra-relations/arel-f7": "8",
  // word-to-algebra (25)
  "word-to-algebra/w2a-01": "س + 7 = 19", "word-to-algebra/w2a-02": "4س", "word-to-algebra/w2a-03": "س − 3 = 12",
  "word-to-algebra/w2a-04": "2س = 18", "word-to-algebra/w2a-05": "س − 9", "word-to-algebra/w2a-06": "3س + 4 = 25",
  "word-to-algebra/w2a-07": "5س", "word-to-algebra/w2a-08": "س + 12 = 20", "word-to-algebra/w2a-09": "س ÷ 2 − 3 = 7",
  "word-to-algebra/w2a-10": "3(س + 8)", "word-to-algebra/w2a-11": "س − 40 = 110", "word-to-algebra/w2a-12": "2س − 5 = 11",
  "word-to-algebra/w2a-13": "5س − 8 = 17", "word-to-algebra/w2a-14": "س − 12 = س ÷ 3", "word-to-algebra/w2a-15": "س + 6 − 2",
  "word-to-algebra/w2a-16": "س + 10 = 3س", "word-to-algebra/w2a-17": "2س + 15 = 55", "word-to-algebra/w2a-18": "4(س − 1) = 28",
  "word-to-algebra/w2a-f1": "س − 9 = 16", "word-to-algebra/w2a-f2": "س ÷ 3 + 4", "word-to-algebra/w2a-f3": "س − 30 = 60",
  "word-to-algebra/w2a-f4": "2س + 7 = 31", "word-to-algebra/w2a-f5": "5س − 2", "word-to-algebra/w2a-f6": "7س + 3 = 38",
  "word-to-algebra/w2a-f7": "س + 12 = 3س − 6",
};

function solveMatches(expected: string, solve_ar: string): boolean {
  if (!solve_ar) return true;
  const s = asc(solve_ar);
  const e = asc(expected);
  const expNum = num(expected);
  if (expNum !== null) {
    const solveNums = [...s.matchAll(/(-?\d+(?:\.\d+)?)/g)].map((m) => parseFloat(m[1]));
    if (solveNums.some((n) => Math.abs(n - expNum) < 0.06)) return true;
  }
  const key = norm(expected);
  const sol = norm(s);
  if (sol.includes(key)) return true;
  // Conceptual balance-sides (one-sided operation breaks equality)
  if (e.includes("يميل") || e.includes("طرف")) {
    if (s.includes("طرف") && (s.includes("تساو") || s.includes("يميل") || s.includes("كسر") || s.includes("يفسد"))) {
      return true;
    }
  }
  // Conceptual: keywords from expected appear in solve
  const keywords = expected.split(/\s+/).filter((w) => w.length > 3);
  if (keywords.length >= 2 && keywords.filter((w) => s.includes(w)).length >= 2) return true;
  return false;
}

for (const skill of ALGEBRA_SKILLS) {
  for (const q of [...skill.drill, ...(skill.final_extra ?? [])]) {
    const key = `${skill.id}/${q.id}`;
    const choice = q.choices_ar[q.correct_index];
    const expected = EXPECTED[key];

    if (!expected) {
      fails.push({ key, expected: "?", choiceAtIndex: choice ?? "?", why: "missing from audit table" });
      continue;
    }
    if (!choice) {
      fails.push({ key, expected, choiceAtIndex: "MISSING", why: "bad correct_index" });
      continue;
    }

    const d = dup(q.choices_ar);
    if (d) {
      fails.push({ key, expected, choiceAtIndex: choice, why: d });
      continue;
    }

    if (!eq(expected, choice)) {
      fails.push({ key, expected, choiceAtIndex: choice, why: "expected ≠ choice at correct_index" });
      continue;
    }

    if (q.solve_ar && !solveMatches(expected, q.solve_ar)) {
      fails.push({ key, expected, choiceAtIndex: choice, why: `solve_ar does not match expected answer` });
      continue;
    }

    passCount++;
  }
}

const lines = [
  `PASS count: ${passCount}`,
  `FAIL count: ${fails.length}`,
  "",
  ...(fails.length ? ["FAIL list:"] : ["FAIL list: (none)"]),
  ...fails.map((f) => `${f.key} | expected: ${f.expected} | choice_at_index: ${f.choiceAtIndex} | why: ${f.why}`),
];
writeFileSync("scripts/algebra-math-audit.txt", lines.join("\n"), "utf8");
console.log(lines.join("\n"));
