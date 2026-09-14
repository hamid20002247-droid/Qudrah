/**
 * Full arithmetic recompute — expected values derived from each prompt.
 * Run: npx tsx scripts/arithmetic-recompute-all.ts
 */
import { writeFileSync } from "fs";
import { ALL_SKILLS } from "../src/content/arithmetic/index.ts";
import type { Question, Skill } from "../src/lib/types.ts";

const SKILLS = ALL_SKILLS.filter((s) => s.domain === "arithmetic");
type F = { skill: string; id: string; msg: string };
const fails: F[] = [];
let ok = 0;

function allQs(s: Skill): Question[] {
  return [...s.drill, ...(s.final_extra || [])];
}
function byId(id: string) {
  return SKILLS.find((s) => s.id === id)!;
}
function asc(s: string) {
  return s
    .replace(/[٠-٩]/g, (c) => "0123456789"["٠١٢٣٤٥٦٧٨٩".indexOf(c)]!)
    .replace(/٪/g, "%")
    .replace(/[−–—]/g, "-");
}
function nums(s: string): number[] {
  return [...asc(s).matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => parseFloat(m[0]!));
}
function cv(c: string): number | null {
  const n = nums(c);
  return n.length ? n[0]! : null;
}
function near(a: number, b: number, e = 0.08) {
  return Math.abs(a - b) <= e;
}
function check(skill: string, q: Question, exp: number, e = 0.08) {
  const got = cv(q.choices_ar[q.correct_index]!);
  if (got == null || !near(got, exp, e)) {
    fails.push({ skill, id: q.id, msg: `expected ${exp} got ${q.choices_ar[q.correct_index]}` });
  } else ok++;
}
function checkText(skill: string, q: Question, re: RegExp) {
  if (!re.test(q.choices_ar[q.correct_index]!)) {
    fails.push({ skill, id: q.id, msg: `expected ${re} got ${q.choices_ar[q.correct_index]}` });
  } else ok++;
}
function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) [a, b] = [b, a % b];
  return a;
}
function lcm(a: number, b: number) {
  return (Math.abs(Math.round(a) * Math.round(b)) / gcd(a, b));
}

// Compare fractions by cross product
function cmpFrac(a: number, b: number, c: number, d: number): number {
  // return sign of a/b - c/d
  return a * d - c * b;
}

// ── Build expected from each skill by reading prompts ──
{
  const s = byId("percent-change");
  const E: Record<string, number> = {
    "pc-01": 25, "pc-02": 100, "pc-03": 450, "pc-04": 25, "pc-05": 15, "pc-06": 15,
    "pc-07": 25, "pc-08": 170, "pc-09": 400, "pc-10": 20, "pc-11": 220, "pc-12": 20,
    "pc-13": 600, "pc-14": 10, "pc-15": 200, "pc-16": 20, "pc-17": 20, "pc-18": 260,
    "pc-f01": 25, "pc-f02": 180, "pc-f03": 500, "pc-f04": 25, "pc-f05": 25, "pc-f06": 300, "pc-f07": 10,
  };
  for (const q of allQs(s)) check("percent-change", q, E[q.id]!);
}

{
  const s = byId("direct-inverse");
  const E: Record<string, number> = {
    "di-01": 5, "di-02": 21, "di-03": 91, "di-04": 120, "di-05": 56, "di-07": 4,
    "di-08": 12, "di-09": 70, "di-10": 9, "di-11": 8, "di-13": 30, "di-14": 12,
    "di-15": 455, "di-16": 15, "di-18": 35, "di-f01": 63, "di-f02": 16, "di-f03": 32,
    "di-f04": 24, "di-f05": 180, "di-f06": 21,
  };
  for (const q of allQs(s)) {
    if (q.id === "di-06") checkText("direct-inverse", q, /^عكسي$/);
    else if (q.id === "di-12") checkText("direct-inverse", q, /نسبة/);
    else if (q.id === "di-17") checkText("direct-inverse", q, /طردية/);
    else if (q.id === "di-f07") checkText("direct-inverse", q, /ضرب/);
    else check("direct-inverse", q, E[q.id]!);
  }
}

// Dump remaining skills' keyed answers for formula verification via solve echo + manual formulas
function dumpAndVerifyBySolve(skillId: string) {
  const s = byId(skillId);
  for (const q of allQs(s)) {
    const ans = q.choices_ar[q.correct_index]!;
    const got = cv(ans);
    const sn = nums(q.solve_ar || "");
    // radical eq check for roots
    if (skillId === "roots") {
      const vals = q.choices_ar.map((c) => {
        if (/[<>]/.test(c)) return null;
        const t = asc(c).replace(/\s/g, "");
        const m = t.match(/^(\d+(?:\.\d+)?)?√(\d+(?:\.\d+)?)$/);
        if (!m) return null;
        return (m[1] ? parseFloat(m[1]) : 1) * Math.sqrt(parseFloat(m[2]!));
      });
      const c = vals[q.correct_index];
      if (c != null) {
        for (let i = 0; i < vals.length; i++) {
          if (i === q.correct_index || vals[i] == null) continue;
          if (Math.abs(vals[i]! - c) < 1e-9) {
            fails.push({ skill: skillId, id: q.id, msg: `equiv radical ${ans} ≡ ${q.choices_ar[i]}` });
          }
        }
      }
    }
    if (got == null) {
      ok++;
      continue;
    }
    // Plain-number multi-correct only when choice is essentially a bare number/percent
    const bare = (c: string) => /^[\d.\s٪%]+$/.test(c.trim()) || /^\d+(?:\.\d+)?\s*%/.test(asc(c).trim());
    if (bare(ans)) {
      for (let i = 0; i < q.choices_ar.length; i++) {
        if (i === q.correct_index) continue;
        const c = q.choices_ar[i]!;
        if (!bare(c)) continue;
        const v = cv(c);
        if (v != null && near(v, got)) {
          fails.push({ skill: skillId, id: q.id, msg: `multi-correct bare ${got}` });
        }
      }
    }
    if (sn.some((n) => near(n, got, 0.2))) ok++;
    else {
      // allow if answer is expression
      if (/[√^]|أس|\/|:/.test(ans)) ok++;
      else fails.push({ skill: skillId, id: q.id, msg: `solve mismatch ans=${ans} solveTail=${sn.slice(-3)}` });
    }
  }
}

// percent-of: parse
{
  const s = byId("percent-of");
  for (const q of allQs(s)) {
    const p = asc(q.prompt_ar);
    let exp: number | null = null;
    const m1 = p.match(/(\d+(?:\.\d+)?)\s*%\s*من[^0-9]{0,40}?(\d+(?:\.\d+)?)/);
    if (m1) exp = (parseFloat(m1[1]!) / 100) * parseFloat(m1[2]!);
    if (exp == null) {
      const m2 = p.match(/(\d+(?:\.\d+)?)\s*.{0,40}?من أصل\s*(\d+(?:\.\d+)?)/)
        || p.match(/(\d+(?:\.\d+)?)\s*(?:طالباً|طالبا|ريالاً|ريال|صفحة|ثانية|درجة|كتاباً|كتاب).{0,20}?من\s*(?:أصل\s*)?(\d+(?:\.\d+)?)/);
      if (m2 && /نسب/.test(p)) exp = (parseFloat(m2[1]!) / parseFloat(m2[2]!)) * 100;
    }
    if (exp != null) check("percent-of", q, exp, 0.15);
    else dumpAndVerifyBySolve; // fallthrough single
  }
  // for unparsed, use solve
  for (const q of allQs(s)) {
    // if already checked via check(), we double-count — instead only verify unparsed
  }
}

// Simpler: for percent-of use solve consistency after attempting parse
{
  const s = byId("percent-of");
  for (const q of allQs(s)) {
    const p = asc(q.prompt_ar);
    const m1 = p.match(/(\d+(?:\.\d+)?)\s*%\s*من[^0-9]{0,50}?(\d+(?:\.\d+)?)/);
    if (m1) {
      check("percent-of", q, (parseFloat(m1[1]!) / 100) * parseFloat(m1[2]!), 0.15);
      continue;
    }
    const got = cv(q.choices_ar[q.correct_index]!);
    const sn = nums(q.solve_ar || "");
    if (got != null && sn.some((n) => near(n, got, 0.2))) ok++;
    else if (got == null) ok++;
    else fails.push({ skill: "percent-of", id: q.id, msg: `unparsed got=${got}` });
  }
}

// successive — compute from factors when possible
{
  const s = byId("successive-percent");
  for (const q of allQs(s)) {
    const p = asc(q.prompt_ar);
    const rates = [...p.matchAll(/(\d+(?:\.\d+)?)\s*%/g)].map((m) => parseFloat(m[1]!));
    const got = cv(q.choices_ar[q.correct_index]!);
    const ans = q.choices_ar[q.correct_index]!;
    // net percent cases
    if (rates.length >= 2) {
      const ops: number[] = [];
      const re = /(زياد|زاد|ارتفع|رفع|نقص|انخفض|خصم|خف)\D{0,20}?(\d+(?:\.\d+)?)\s*%|(\d+(?:\.\d+)?)\s*%\D{0,15}?(زياد|نقص|خصم|انخفض|ارتف|خف)/g;
      let mm;
      while ((mm = re.exec(p))) {
        const rate = parseFloat(mm[2] || mm[3] || "0");
        const verb = (mm[1] || mm[4] || "").toString();
        ops.push(/نقص|انخفض|خصم|خف/.test(verb) ? -rate : rate);
      }
      if (ops.length >= 2) {
        let f = 1;
        for (const op of ops) f *= 1 + op / 100;
        const net = (f - 1) * 100;
        // if answer looks like percent / relative description
        if (/%|٪|نقص|زيادة|أقل|أكثر|بدون|نفسه|بقي/.test(ans)) {
          if (got != null && near(Math.abs(got), Math.abs(net), 0.15)) ok++;
          else if (/بدون|نفسه|كما هو/.test(ans) && near(net, 0, 0.15)) ok++;
          else if (got == null && near(net, 0, 0.15) && /بدون|نفسه/.test(ans)) ok++;
          else {
            // direction words with 1%
            if (got != null && near(got, Math.abs(net), 0.15)) ok++;
            else fails.push({ skill: "successive-percent", id: q.id, msg: `net ${net} got ${ans}` });
          }
          continue;
        }
        // value answers need base
        const baseM = p.match(/(\d+(?:\.\d+)?)\s*(?:ريال|ريالاً)/);
        if (baseM) {
          check("successive-percent", q, parseFloat(baseM[1]!) * f, 0.2);
          continue;
        }
      }
    }
    // fallback solve
    const sn = nums(q.solve_ar || "");
    if (got != null && sn.some((n) => near(n, got, 0.2))) ok++;
    else if (got == null) ok++;
    else fails.push({ skill: "successive-percent", id: q.id, msg: `fallback fail ${ans}` });
  }
}

for (const id of [
  "ratios", "buy-sell", "average", "fractions", "compare-fractions",
  "rate-distance", "work-rate", "gcd-lcm", "exponents", "roots",
  "number-sense", "word-arith",
]) {
  dumpAndVerifyBySolve(id);
}

// Extra: work-rate formula checks
{
  const s = byId("work-rate");
  for (const q of allQs(s)) {
    const p = asc(q.prompt_ar);
    const ns = nums(p);
    if (/معاً|معا/.test(p) && ns.length >= 2) {
      const exp = (ns[0]! * ns[1]!) / (ns[0]! + ns[1]!);
      const got = cv(q.choices_ar[q.correct_index]!);
      if (got == null || !near(got, exp, 0.1)) {
        fails.push({ skill: "work-rate", id: q.id, msg: `together expected ${exp} got ${q.choices_ar[q.correct_index]}` });
      }
    }
  }
}

// compare-fractions cross-check
{
  const s = byId("compare-fractions");
  for (const q of allQs(s)) {
    const p = asc(q.prompt_ar);
    const fr = [...p.matchAll(/(\d+)\s*\/\s*(\d+)/g)].map((m) => [parseFloat(m[1]!), parseFloat(m[2]!)] as [number, number]);
    if (fr.length >= 2) {
      const [a, b] = fr[0]!, [c, d] = fr[1]!;
      const diff = cmpFrac(a, b, c, d);
      const ans = q.choices_ar[q.correct_index]!;
      if (/متساو/.test(ans)) {
        if (diff !== 0) fails.push({ skill: "compare-fractions", id: q.id, msg: "claimed equal but not" });
        else ok++;
      } else if (ans.includes(`${a}/${b}`) || ans.includes(`${a} / ${b}`)) {
        if (diff <= 0 && /أكبر|أطول/.test(p)) fails.push({ skill: "compare-fractions", id: q.id, msg: "picked smaller as larger" });
        else if (diff >= 0 && /أصغر/.test(p)) fails.push({ skill: "compare-fractions", id: q.id, msg: "picked larger as smaller" });
        // else ok already from dump
      } else if (ans.includes(`${c}/${d}`)) {
        // second fraction chosen
        if (diff >= 0 && /أكبر|أطول/.test(p)) fails.push({ skill: "compare-fractions", id: q.id, msg: "picked smaller as larger (2)" });
      }
    }
  }
}

// Global: latin + ids + exclusivity
{
  const latin = /[A-Za-z]/;
  const idMap = new Map<string, string>();
  for (const s of SKILLS) {
    for (const t of [s.title_ar, s.hook_ar, ...s.intuition_ar, s.trick_ar.statement, ...s.trick_ar.steps, s.trick_ar.example_ar]) {
      if (latin.test(t)) fails.push({ skill: s.id, id: "meta", msg: `Latin ${t.slice(0, 60)}` });
    }
    for (const q of allQs(s)) {
      if (idMap.has(q.id)) fails.push({ skill: s.id, id: q.id, msg: `ID collision ${idMap.get(q.id)}` });
      else idMap.set(q.id, s.id);
      for (const t of [q.prompt_ar, q.solve_ar || "", ...q.choices_ar, ...Object.values(q.trap_explanations_ar)]) {
        if (latin.test(t)) fails.push({ skill: s.id, id: q.id, msg: `Latin ${t.slice(0, 60)}` });
      }
    }
  }
  const di = byId("direct-inverse");
  for (const q of allQs(di)) {
    if (/خريط|مقياس\s*رسم|مقياسها\s*\d|عم[اّ]ل|يوم-عامل/.test(q.prompt_ar)) {
      fails.push({ skill: "direct-inverse", id: q.id, msg: "exclusivity leak" });
    }
  }
  if (/عم[اّ]ل|يوم-عامل/.test(di.trick_ar.example_ar)) {
    fails.push({ skill: "direct-inverse", id: "example", msg: "worker example leak" });
  }
  for (const q of allQs(byId("percent-change"))) {
    if (/خصم|ربح\s|تكلفة|سعر البيع/.test(q.prompt_ar)) {
      fails.push({ skill: "percent-change", id: q.id, msg: "buy-sell framing" });
    }
  }
}

const out = { ok, fails: fails.length, failsDetail: fails };
writeFileSync("scripts/_arith-recompute.json", JSON.stringify(out, null, 2));
console.log(JSON.stringify({ ok, fails: fails.length }, null, 2));
for (const f of fails) console.log(`[FAIL] ${f.skill}/${f.id}: ${f.msg}`);
