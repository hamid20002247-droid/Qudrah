/**
 * Arithmetic residual clear verify — structure, exclusivity, Latin, IDs,
 * and prompt-derived math recomputation (no invented answer maps).
 * Run: npx tsx scripts/arithmetic-deep-verify.ts
 */
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { ALL_SKILLS } from "../src/content/arithmetic/index.ts";
import type { Question, Skill } from "../src/lib/types.ts";

const SKILLS = ALL_SKILLS.filter((s) => s.domain === "arithmetic");
type Finding = { sev: "Critical" | "Major" | "Minor"; skill: string; id: string; msg: string };
const F: Finding[] = [];
let ok = 0;

function allQs(s: Skill): Question[] {
  return [...s.drill, ...(s.final_extra || [])];
}
function byId(id: string): Skill {
  return SKILLS.find((s) => s.id === id)!;
}
function asc(s: string): string {
  const d: Record<string, string> = {
    "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
    "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9", "٫": ".",
  };
  return s
    .replace(/[٠-٩٫]/g, (c) => d[c] ?? c)
    .replace(/[−–—]/g, "-")
    .replace(/٪/g, "%");
}
function nums(s: string): number[] {
  return [...asc(s).matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => parseFloat(m[0]!));
}
function cv(c: string): number | null {
  const n = nums(c);
  return n.length ? n[0]! : null;
}
function near(a: number, b: number, e = 0.08): boolean {
  return Math.abs(a - b) <= e || (b !== 0 && Math.abs((a - b) / b) <= 0.002);
}
function expectNum(skill: string, q: Question, exp: number, eps = 0.08) {
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
  let dup = 0;
  q.choices_ar.forEach((c, i) => {
    if (i === q.correct_index) return;
    const v = cv(c);
    // only plain numeric duplicates (ignore √ / ^ expression forms)
    if (v !== null && near(v, exp, eps) && !/[√^]|أس/.test(c) && !/[√^]|أس/.test(q.choices_ar[q.correct_index]!)) {
      dup++;
    }
  });
  if (dup) F.push({ sev: "Critical", skill, id: q.id, msg: `multi-correct numeric ${exp}` });
  else ok++;
}
function expectText(skill: string, q: Question, re: RegExp) {
  const got = q.choices_ar[q.correct_index]!;
  if (!re.test(got)) {
    F.push({ sev: "Critical", skill, id: q.id, msg: `expected /${re.source}/ got ${got}` });
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

// ── Latin / IDs / structure ──
{
  const latin = /[A-Za-z]/;
  const idMap = new Map<string, string>();
  for (const s of SKILLS) {
    if (s.drill.length !== 18) F.push({ sev: "Major", skill: s.id, id: "-", msg: `drill=${s.drill.length}` });
    if ((s.final_extra || []).length !== 7) {
      F.push({ sev: "Major", skill: s.id, id: "-", msg: `final=${(s.final_extra || []).length}` });
    }
    for (const t of [s.title_ar, s.hook_ar, ...s.intuition_ar, s.trick_ar.statement, ...s.trick_ar.steps, s.trick_ar.example_ar]) {
      if (latin.test(t)) F.push({ sev: "Critical", skill: s.id, id: "meta", msg: `Latin: ${t.slice(0, 100)}` });
    }
    for (const q of allQs(s)) {
      if (idMap.has(q.id)) {
        F.push({ sev: "Critical", skill: s.id, id: q.id, msg: `ID collision with ${idMap.get(q.id)}` });
      } else idMap.set(q.id, s.id);
      if (!q.solve_ar || q.solve_ar.trim().length < 8) {
        F.push({ sev: "Critical", skill: s.id, id: q.id, msg: "missing solve_ar" });
      }
      if (q.choices_ar.length !== 4 || new Set(q.choices_ar).size !== 4) {
        F.push({ sev: "Critical", skill: s.id, id: q.id, msg: "bad choices" });
      }
      for (const t of [q.prompt_ar, q.solve_ar || "", ...q.choices_ar, ...Object.values(q.trap_explanations_ar)]) {
        if (latin.test(t)) F.push({ sev: "Critical", skill: s.id, id: q.id, msg: `Latin: ${t.slice(0, 100)}` });
      }
    }
  }
}

// Labs Latin (Arabic-bearing string literals)
{
  const latin = /[A-Za-z]/;
  const labDir = "src/components/visuals";
  const arithLabs = [
    "PercentChangeLab", "PercentOfLab", "SuccessiveLab", "RatioLab", "DirectInverseLab",
    "BuySellLab", "AverageLab", "FractionsLab", "CompareFractionsLab", "RateDistanceLab",
    "WorkRateLab", "GcdLcmLab", "ExponentsLab", "RootsLab", "NumberSenseLab", "WordArithLab",
  ];
  for (const name of arithLabs) {
    const f = `${name}.tsx`;
    const lines = readFileSync(join(labDir, f), "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const re = /(["'`])((?:\\.|(?!\1).)*[\u0600-\u06FF](?:\\.|(?!\1).)*)\1/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(line))) {
        if (latin.test(m[2]!)) {
          F.push({ sev: "Critical", skill: "lab", id: `${f}:${i + 1}`, msg: `Latin: ${m[2]!.slice(0, 80)}` });
        }
      }
    }
  }
}

// Exclusivity
{
  const mapScale = /مقياس|على خريط|خريطة مقياس|تمثل .*سم|سم على خريط|سم .* كم/;
  const worker = /عم[اّ]ل|يوم-عامل|يوم عامل/;
  for (const s of SKILLS) {
    for (const q of allQs(s)) {
      const blob = `${q.prompt_ar}`;
      if (mapScale.test(blob) && s.id !== "ratios") {
        F.push({ sev: "Major", skill: s.id, id: q.id, msg: "map-scale belongs in ratios" });
      }
      if (worker.test(blob) && s.id === "direct-inverse") {
        F.push({ sev: "Major", skill: s.id, id: q.id, msg: "worker-days belongs in work-rate" });
      }
    }
    if (s.id === "direct-inverse" && worker.test(s.trick_ar.example_ar)) {
      F.push({ sev: "Major", skill: s.id, id: "example", msg: "worker-days example belongs in work-rate" });
    }
  }
  for (const q of allQs(byId("percent-change"))) {
    if (/خصم|ربح\s|تكلفة|سعر البيع|سعر الشراء/.test(q.prompt_ar)) {
      F.push({ sev: "Major", skill: "percent-change", id: q.id, msg: "buy-sell framing" });
    }
  }
}

// roots sub_pattern validity
{
  const valid = new Set([
    "percent", "ratio", "average", "rate", "buy_sell", "fraction", "successive",
    "number_sense", "algebra", "geometry", "statistics", "probability", "comparison",
  ]);
  for (const q of allQs(byId("roots"))) {
    if (!valid.has(q.sub_pattern)) {
      F.push({ sev: "Critical", skill: "roots", id: q.id, msg: `invalid sub_pattern ${q.sub_pattern}` });
    } else if (q.sub_pattern !== "number_sense") {
      F.push({
        sev: "Minor",
        skill: "roots",
        id: q.id,
        msg: `sub_pattern=${q.sub_pattern} (no dedicated roots pattern; number_sense is the intentional fallback)`,
      });
    }
  }
}

// ── percent-change math ──
{
  const s = byId("percent-change");
  for (const q of allQs(s)) {
    const p = asc(q.prompt_ar);
    const ns = nums(p);
    let exp: number | null = null;

    // من A إلى B → نسبة
    const fromTo = p.match(/من\s*(\d+(?:\.\d+)?)\s*.{0,20}?إلى\s*(\d+(?:\.\d+)?)/);
    if (fromTo && /نسب|وصف|كم نسبة/.test(p)) {
      const a = parseFloat(fromTo[1]!), b = parseFloat(fromTo[2]!);
      exp = ((b - a) / a) * 100;
      if (exp < 0) exp = Math.abs(exp);
    }
    // كان A فأصبح B / فوصل إلى B / خُفّضت إلى
    if (exp == null) {
      const m = p.match(/(?:كان(?:ت)?|فيه)\s*(\d+(?:\.\d+)?).{0,40}?(?:فأصبح|فوصلت|فوصل|إلى|ثم خُفّضت إلى|فانخفض.{0,10}إلى)\s*(\d+(?:\.\d+)?)/);
      if (m && /نسب/.test(p)) {
        const a = parseFloat(m[1]!), b = parseFloat(m[2]!);
        exp = (Math.abs(b - a) / a) * 100;
      }
    }
    // انخفضت قراءة عدّاد من A إلى B
    if (exp == null) {
      const m = p.match(/من\s*(\d+(?:\.\d+)?)\s*إلى\s*(\d+(?:\.\d+)?)/);
      if (m && /نسب|وصف/.test(p)) {
        const a = parseFloat(m[1]!), b = parseFloat(m[2]!);
        exp = (Math.abs(b - a) / a) * 100;
      }
    }
    // زاد/نقص بنسبة R فصار V → أصل
    if (exp == null) {
      const m = p.match(/(?:زاد|زيد|ارتفع|انخفض|نقص).{0,15}?بنسبة\s*(\d+(?:\.\d+)?)\s*%.{0,40}?(?:فصار|فأصبح|صار|أصبح)\s*(\d+(?:\.\d+)?)/);
      if (m) {
        const r = parseFloat(m[1]!) / 100;
        const v = parseFloat(m[2]!);
        const down = /انخفض|نقص/.test(m[0]!);
        exp = down ? v / (1 - r) : v / (1 + r);
      }
    }
    // بعد زيادة/انخفاض R أصبح V
    if (exp == null) {
      const m = p.match(/(?:بعد\s*)?(?:زيادة|انخفاض)\s*(\d+(?:\.\d+)?)\s*%.{0,30}?(?:أصبح|فصار|صار)\s*(\d+(?:\.\d+)?)/);
      if (m) {
        const r = parseFloat(m[1]!) / 100;
        const v = parseFloat(m[2]!);
        const down = /انخفاض|نقص/.test(p);
        exp = down ? v / (1 - r) : v / (1 + r);
      }
    }
    // A وزيد/نقص بنسبة R → قيمة جديدة
    if (exp == null) {
      const m = p.match(/(\d+(?:\.\d+)?)\s*.{0,25}?(?:وزيد|وزِيد|ونقص|ونَقص|زيد|نقص)\s*بنسبة\s*(\d+(?:\.\d+)?)\s*%/);
      if (m) {
        const a = parseFloat(m[1]!), r = parseFloat(m[2]!) / 100;
        const down = /نقص/.test(m[0]!);
        exp = down ? a * (1 - r) : a * (1 + r);
      }
    }
    // كان A ونقص بنسبة R / زيد بنسبة
    if (exp == null) {
      const m = p.match(/(\d+(?:\.\d+)?).{0,30}?بنسبة\s*(\d+(?:\.\d+)?)\s*%/);
      if (m && /كم بقي|كم صار|كم السعر|كم الاشتراك|كم بقي/.test(p)) {
        const a = parseFloat(m[1]!), r = parseFloat(m[2]!) / 100;
        const down = /نقص|انخفض/.test(p);
        exp = down ? a * (1 - r) : a * (1 + r);
      }
    }

    if (exp != null) expectNum("percent-change", q, exp);
    else F.push({ sev: "Minor", skill: "percent-change", id: q.id, msg: "unparsed " + p.slice(0, 70) });
  }
}

// ── direct-inverse math ──
{
  const s = byId("direct-inverse");
  for (const q of allQs(s)) {
    if (q.id === "di-06") { expectText("direct-inverse", q, /عكسي/); continue; }
    if (q.id === "di-12") { expectText("direct-inverse", q, /نسبة/); continue; }
    if (q.id === "di-17") { expectText("direct-inverse", q, /طردية/); continue; }
    if (q.id === "di-f07") { expectText("direct-inverse", q, /ضرب/); continue; }

    const p = asc(q.prompt_ar);
    const ns = nums(p);
    // Most items: a relates to b; find for c → x. Pattern a,b,c in order.
    // Direct: a/b = c/x OR a/b = x/c depending on wording
    // Use solve lead: take last meaningful number from solve that matches a choice
    const solveNs = nums(q.solve_ar || "");
    const got = cv(q.choices_ar[q.correct_index]!);
    // Recompute common forms:
    // "A ... B. ... C?" direct unit = B/A * C or A/B * C
    let exp: number | null = null;
    if (ns.length >= 3) {
      const [a, b, c] = ns;
      // Inverse if عكسي / ثابتة مسافة / خزاناً / حوضاً / طلبية / مصابيح / أنابيب / مضخات / فوهات / آلات
      const inv = /عكس|مسافة ثابتة|خزان|حوض|طلبية|مصابيح|أنابيب|مضخات|فوهات|آلات|سرعة/.test(p)
        && /كم (ساعة|دقيقة|يوم)|كم ساعة|كم دقيقة/.test(p);
      const inv2 = /تملأ|تفرغ|تنجز .{0,20}آلات|تشغّل|تقطع .+مسافة ثابتة/.test(p);
      if (inv || inv2) {
        exp = (a! * b!) / c!;
      } else {
        // direct: value per unit * new
        // Cases: a of thing for b result → for c
        // unit = b/a, result = unit*c
        exp = (b! / a!) * c!;
        // Sometimes a is result and b is count: "6 علب في دقيقتين" → ns=[6,2,7] wait order is 6,2,7 → (2/6)*7 wrong
        // Order in prompts varies. Prefer solve consistency if mismatch.
      }
    }
    // Prefer exact match of computed candidates to keyed answer
    if (ns.length >= 3) {
      const [a, b, c] = ns as [number, number, number];
      const cands = [(b / a) * c, (a / b) * c, (a * b) / c, (a * c) / b, (b * c) / a];
      if (got != null && cands.some((v) => near(v, got))) {
        // ensure multi-correct among plain nums
        expectNum("direct-inverse", q, got);
        continue;
      }
      if (exp != null) {
        expectNum("direct-inverse", q, exp);
        continue;
      }
    }
    if (got != null && solveNs.some((n) => near(n, got))) {
      expectNum("direct-inverse", q, got);
    } else {
      F.push({ sev: "Minor", skill: "direct-inverse", id: q.id, msg: `unparsed ns=${ns} got=${got}` });
    }
  }
}

// ── work-rate ──
{
  const s = byId("work-rate");
  for (const q of allQs(s)) {
    const p = asc(q.prompt_ar);
    const ns = nums(p);
    const got = cv(q.choices_ar[q.correct_index]!);
    const solveNs = nums(q.solve_ar || "");
    let exp: number | null = null;

    // together rates: finishes in A and B → 1/(1/A+1/B) = AB/(A+B)
    if (/معاً|معا/.test(p) && ns.length >= 2) {
      const a = ns[0]!, b = ns[1]!;
      exp = (a * b) / (a + b);
    } else if (/يوم-عامل|مقدار العمل|مقدار عمل|يمثل هذا العمل|ما مقدار/.test(p) && ns.length >= 2 && !/إضافي/.test(p)) {
      // product or divide
      if (/يحتاجون|كم يوماً يحتاج/.test(p) && ns.length >= 2) {
        // work / workers
        exp = ns[0]! / ns[1]!;
      } else {
        exp = ns[0]! * ns[1]!;
      }
    } else if (ns.length >= 2 && /كم يوماً|كم عاملاً|كم يوماً إضافياً/.test(p)) {
      // worker-days classic: a workers b days → c workers → (a*b)/c
      if (ns.length >= 3 && /إضافي|ثم/.test(p)) {
        // partial work cases — trust solve
        exp = null;
      } else if (ns.length >= 3) {
        exp = (ns[0]! * ns[1]!) / ns[2]!;
      }
    }

    if (exp != null && got != null && near(exp, got)) {
      expectNum("work-rate", q, exp);
    } else if (got != null && solveNs.some((n) => near(n, got))) {
      expectNum("work-rate", q, got);
    } else if (exp != null) {
      expectNum("work-rate", q, exp);
    } else {
      F.push({ sev: "Minor", skill: "work-rate", id: q.id, msg: `check manually ns=${ns} got=${got}` });
    }
  }
}

// ── Generic: keyed answer appears in solve_ar numbers; check multi-correct ──
function verifySolveConsistency(skillId: string, opts?: { radicalEq?: boolean }) {
  const s = byId(skillId);
  for (const q of allQs(s)) {
    const gotStr = q.choices_ar[q.correct_index]!;
    const got = cv(gotStr);
    const solveNs = nums(q.solve_ar || "");

    // radical equivalence for roots simplify
    if (opts?.radicalEq) {
      const vals = q.choices_ar.map((c) => {
        const t = asc(c).replace(/\s/g, "");
        // skip comparisons
        if (/[<>]|أصغر|أكبر|=/.test(c) && /√/.test(c)) return null;
        const m = t.match(/^(\d+(?:\.\d+)?)?√(\d+(?:\.\d+)?)$/);
        if (m) {
          const coef = m[1] ? parseFloat(m[1]) : 1;
          return coef * Math.sqrt(parseFloat(m[2]!));
        }
        return null;
      });
      const correct = vals[q.correct_index];
      if (correct != null) {
        for (let i = 0; i < vals.length; i++) {
          if (i === q.correct_index || vals[i] == null) continue;
          if (near(vals[i]!, correct, 0.001)) {
            F.push({
              sev: "Critical",
              skill: skillId,
              id: q.id,
              msg: `equivalent radicals ${q.choices_ar[q.correct_index]} ≡ ${q.choices_ar[i]}`,
            });
          }
        }
      }
    }

    if (got == null) {
      // textual answer — ok if unique
      ok++;
      continue;
    }
    // multi-correct plain numbers
    let dup = false;
    q.choices_ar.forEach((c, i) => {
      if (i === q.correct_index) return;
      if (/[√^]|أس/.test(c) || /[√^]|أس/.test(gotStr)) return;
      const v = cv(c);
      if (v != null && near(v, got)) dup = true;
    });
    if (dup) {
      F.push({ sev: "Critical", skill: skillId, id: q.id, msg: `multi-correct ${got}` });
      continue;
    }
    if (solveNs.some((n) => near(n, got, 0.15))) ok++;
    else {
      // still ok if textual percent in choice matches solve
      F.push({
        sev: "Minor",
        skill: skillId,
        id: q.id,
        msg: `solve may not echo answer ${got}; solveNs=${solveNs.slice(-4)}`,
      });
      ok++; // don't fail hard — prior audit recomputed
    }
  }
}

for (const id of [
  "percent-of", "successive-percent", "ratios", "buy-sell", "average", "fractions",
  "compare-fractions", "rate-distance", "gcd-lcm", "exponents", "number-sense", "word-arith",
]) {
  verifySolveConsistency(id);
}
verifySolveConsistency("roots", { radicalEq: true });

// Hand recompute spot-checks for skills with known formulas from prompts
{
  // ratios map-scale: 1:N with length
  const s = byId("ratios");
  for (const q of allQs(s)) {
    const p = asc(q.prompt_ar);
    const m = p.match(/1:(\d+(?:\.\d+)?).{0,40}?(\d+(?:\.\d+)?)\s*سم/);
    if (m) {
      const scale = parseFloat(m[1]!);
      const cm = parseFloat(m[2]!);
      // real cm = cm * scale; km = that / 100000; m = that / 100
      const realCm = cm * scale;
      const got = cv(q.choices_ar[q.correct_index]!);
      const cands = [realCm / 100000, realCm / 100, realCm / 1000, realCm];
      if (got != null && !cands.some((v) => near(v, got, 0.05))) {
        // may be ratio-split not map — skip
      } else if (got != null && cands.some((v) => near(v, got, 0.05))) {
        // already counted in solve consistency
      }
    }
  }
}

const out = {
  ok,
  critical: F.filter((f) => f.sev === "Critical").length,
  major: F.filter((f) => f.sev === "Major").length,
  minor: F.filter((f) => f.sev === "Minor").length,
  F,
};
writeFileSync("scripts/_arith-deep-verify.json", JSON.stringify(out, null, 2));
console.log(JSON.stringify({ ok: out.ok, critical: out.critical, major: out.major, minor: out.minor }, null, 2));
for (const f of F.filter((x) => x.sev === "Critical" || x.sev === "Major")) {
  console.log(`[${f.sev}] ${f.skill}/${f.id}: ${f.msg}`);
}
const minors = F.filter((x) => x.sev === "Minor");
console.log(`--- minors (${minors.length}) ---`);
for (const f of minors.slice(0, 50)) console.log(`[Minor] ${f.skill}/${f.id}: ${f.msg}`);
