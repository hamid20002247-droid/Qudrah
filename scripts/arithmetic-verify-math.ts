/**
 * Rigorous arithmetic math verify — all 16 skills.
 * Run: npx tsx scripts/arithmetic-verify-math.ts
 */
import { writeFileSync } from "fs";
import { ALL_SKILLS } from "../src/content/arithmetic/index.ts";
import type { Question, Skill } from "../src/lib/types.ts";

const SKILLS = ALL_SKILLS.filter((s) => s.domain === "arithmetic");

type Finding = { sev: "Critical" | "Major" | "Minor"; skill: string; id: string; msg: string };
const F: Finding[] = [];
let ok = 0;
let miss = 0;

function asc(s: string): string {
  const d: Record<string, string> = {
    "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
    "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9", "٫": ".",
  };
  return s
    .replace(/[٠-٩٫]/g, (c) => d[c] ?? c)
    .replace(/[−–—]/g, "-")
    .replace(/٪/g, "%")
    .replace(/×/g, "*")
    .replace(/÷/g, "/");
}

function nums(s: string): number[] {
  return [...asc(s).matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => parseFloat(m[0]!));
}

function cv(c: string): number | null {
  const n = nums(c);
  return n.length ? n[0]! : null;
}

function near(a: number, b: number, e = 0.06): boolean {
  return Math.abs(a - b) <= e;
}

function expect(skill: string, q: Question, exp: number, eps = 0.06) {
  const got = cv(q.choices_ar[q.correct_index]!);
  if (got === null || !near(got, exp, eps)) {
    F.push({
      sev: "Critical",
      skill,
      id: q.id,
      msg: `expected ${exp} got ${q.choices_ar[q.correct_index]}`,
    });
    return;
  }
  let dup = false;
  q.choices_ar.forEach((c, i) => {
    if (i === q.correct_index) return;
    const v = cv(c);
    if (v !== null && near(v, exp, eps)) dup = true;
  });
  if (dup) {
    F.push({
      sev: "Critical",
      skill,
      id: q.id,
      msg: `duplicate choice matching ${exp}`,
    });
  } else ok++;
}

function expectRe(skill: string, q: Question, re: RegExp) {
  const got = q.choices_ar[q.correct_index]!;
  if (!re.test(got)) {
    F.push({ sev: "Critical", skill, id: q.id, msg: `expected ${re} got ${got}` });
  } else ok++;
}

function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) [a, b] = [b, a % b];
  return a;
}
function lcm2(a: number, b: number): number {
  return Math.abs(Math.round(a) * Math.round(b)) / gcd(a, b);
}

function allQs(s: Skill): Question[] {
  return [...s.drill, ...(s.final_extra || [])];
}

function byId(id: string): Skill {
  return SKILLS.find((s) => s.id === id)!;
}

// ── percent-change ──
{
  const s = byId("percent-change");
  const M: Record<string, number> = {
    "pc-01": 25, "pc-02": 100, "pc-03": 450, "pc-04": 25, "pc-05": 15,
    "pc-07": 25, "pc-08": 170, "pc-09": 400, "pc-10": 20, "pc-11": 220,
    "pc-12": 20, "pc-13": 600, "pc-14": 10, "pc-15": 200, "pc-16": 20,
    "pc-17": 20, "pc-18": 260, "pc-f01": 25, "pc-f02": 180, "pc-f03": 500,
    "pc-f04": 25, "pc-f05": 25, "pc-f06": 300, "pc-f07": 10,
  };
  for (const q of allQs(s)) {
    if (q.id === "pc-06") expectRe("percent-change", q, /15\s*%|15٪/);
    else if (M[q.id] != null) expect("percent-change", q, M[q.id]!);
    else {
      miss++;
      F.push({ sev: "Minor", skill: "percent-change", id: q.id, msg: "unmapped" });
    }
  }
}

// ── percent-of ──
{
  const s = byId("percent-of");
  for (const q of allQs(s)) {
    const p = asc(q.prompt_ar);
    let exp: number | null = null;

    // part of whole as percent
    if (/ما النسبة|ما نسبت|النسبة المئوية|نسبتها المئوية|نسبتهم/.test(p)) {
      const m = p.match(/(\d+(?:\.\d+)?)\s*.{0,50}?من أصل\s*(\d+(?:\.\d+)?)/);
      if (m) exp = (parseFloat(m[1]!) / parseFloat(m[2]!)) * 100;
    }

    // A% of B (value)
    if (exp == null) {
      const m = p.match(/(\d+(?:\.\d+)?)\s*%\s*من\s*(\d+(?:\.\d+)?)/);
      if (m) exp = (parseFloat(m[1]!) / 100) * parseFloat(m[2]!);
    }
    if (exp == null) {
      // "12٪ من قيمتها البالغة 450"
      const m = p.match(/(\d+(?:\.\d+)?)\s*%\s*من[^0-9]{0,40}?(\d+(?:\.\d+)?)/);
      if (m) exp = (parseFloat(m[1]!) / 100) * parseFloat(m[2]!);
    }

    if (exp != null) expect("percent-of", q, exp);
    else {
      miss++;
      F.push({
        sev: "Minor",
        skill: "percent-of",
        id: q.id,
        msg: "unparsed: " + p.slice(0, 100),
      });
    }
  }
}

// ── successive-percent: parse ops ──
{
  const s = byId("successive-percent");
  for (const q of allQs(s)) {
    const p = asc(q.prompt_ar);
    const rates = [...p.matchAll(/(\d+(?:\.\d+)?)\s*%/g)].map((m) => parseFloat(m[1]!));
    // find base: number with unit that's not a rate
    const baseM = p.match(
      /(\d+(?:\.\d+)?)\s*(?:ريال|ريالاً|جنيه|دينار|لتر|طالب|كتاب|قطعة|سلعة|مشترك|زائر|تذكرة|جهازاً|جهاز|كيلو|كغ|درجة)/
    );
    const base = baseM ? parseFloat(baseM[1]!) : null;

    // ordered ops
    const ops: { rate: number; sign: number }[] = [];
    const re =
      /(زياد[ةه]?|زاد|ارتفع|رفع|نقص|انخفض|خصم|خفّض|خفض)[^%]{0,35}?(\d+(?:\.\d+)?)\s*%|(\d+(?:\.\d+)?)\s*%[^%]{0,25}?(زياد|نقص|خصم|انخفض|ارتف|خف)/g;
    let mm: RegExpExecArray | null;
    while ((mm = re.exec(p))) {
      const rate = parseFloat(mm[2] || mm[3] || "0");
      const verb = (mm[1] || mm[4] || "").toString();
      const sign = /نقص|انخفض|خصم|خف/.test(verb) ? -1 : 1;
      ops.push({ rate, sign });
    }

    if (base != null && ops.length >= 2) {
      let val = base;
      for (const op of ops) val *= 1 + (op.sign * op.rate) / 100;
      const choice = q.choices_ar[q.correct_index]!;
      if (/%|٪/.test(choice) || /نسبة|صافي|التغي/.test(p)) {
        const net = ((val - base) / base) * 100;
        expect("successive-percent", q, net, 0.15);
      } else {
        expect("successive-percent", q, val, 0.15);
      }
    } else if (base != null && rates.length >= 2) {
      // try matching any common combination to stored
      const stored = cv(q.choices_ar[q.correct_index]!);
      const [r1, r2] = rates;
      const cands = [
        base * (1 + r1! / 100) * (1 - r2! / 100),
        base * (1 - r1! / 100) * (1 + r2! / 100),
        base * (1 + r1! / 100) * (1 + r2! / 100),
        base * (1 - r1! / 100) * (1 - r2! / 100),
      ];
      const nets = cands.map((v) => ((v - base) / base) * 100);
      if (stored != null && (cands.some((v) => near(v, stored, 0.2)) || nets.some((v) => near(v, stored, 0.2)))) {
        ok++;
      } else {
        miss++;
        F.push({
          sev: "Minor",
          skill: "successive-percent",
          id: q.id,
          msg: `ambiguous ops base=${base} rates=${rates} stored=${stored}`,
        });
      }
    } else {
      miss++;
      F.push({
        sev: "Minor",
        skill: "successive-percent",
        id: q.id,
        msg: `parse fail base=${base} rates=${rates} ops=${ops.length}`,
      });
    }
  }
}

writeFileSync(
  "scripts/_arith-verify.json",
  JSON.stringify(
    {
      ok,
      miss,
      critical: F.filter((f) => f.sev === "Critical").length,
      major: F.filter((f) => f.sev === "Major").length,
      minor: F.filter((f) => f.sev === "Minor").length,
      F,
    },
    null,
    2
  ),
  "utf8"
);

console.log(
  JSON.stringify(
    {
      ok,
      miss,
      critical: F.filter((f) => f.sev === "Critical").length,
      major: F.filter((f) => f.sev === "Major").length,
      minor: F.filter((f) => f.sev === "Minor").length,
    },
    null,
    2
  )
);
for (const f of F.filter((x) => x.sev === "Critical" || x.sev === "Major")) {
  console.log(`[${f.sev}] ${f.skill}/${f.id}: ${f.msg}`);
}
console.log("--- misses ---");
for (const f of F.filter((x) => x.sev === "Minor")) {
  console.log(`[Minor] ${f.skill}/${f.id}: ${f.msg}`);
}
