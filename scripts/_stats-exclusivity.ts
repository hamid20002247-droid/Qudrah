/** Exclusive-choice + edge-case spot check for statistics banks */
import { STATISTICS_SKILLS } from "../src/content/statistics/index.ts";

function asc(s: string) {
  return s
    .replace(/[٠-٩]/g, (c) => "0123456789"["٠١٢٣٤٥٦٧٨٩".indexOf(c)]!)
    .replace(/[−–—]/g, "-");
}
function simp(n: number, d: number): [number, number] {
  const g = (a: number, b: number): number => {
    a = Math.abs(Math.round(a));
    b = Math.abs(Math.round(b));
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a || 1;
  };
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const G = g(n, d);
  return [n / G, d / G];
}
type PV =
  | { k: "n"; v: number }
  | { k: "f"; n: number; d: number }
  | { k: "p"; v: number }
  | { k: "t" };
function parse(c: string): PV {
  const t = asc(c).replace(/\s+/g, "");
  if (/^-?\d+(?:\.\d+)?٪$/.test(t)) return { k: "p", v: parseFloat(t) };
  const fr = t.match(/^(-?\d+)\/(-?\d+)$/);
  if (fr) {
    const [n, d] = simp(+fr[1]!, +fr[2]!);
    return { k: "f", n, d };
  }
  if (/^-?\d+(?:\.\d+)?$/.test(t)) return { k: "n", v: parseFloat(t) };
  return { k: "t" };
}
function val(p: PV): number | null {
  if (p.k === "n") return p.v;
  if (p.k === "p") return p.v / 100;
  if (p.k === "f") return p.n / p.d;
  return null;
}
function equiv(a: string, b: string): boolean {
  const pa = parse(a);
  const pb = parse(b);
  if (pa.k === "t" || pb.k === "t") return asc(a).replace(/\s+/g, "") === asc(b).replace(/\s+/g, "");
  if (pa.k === "f" && pb.k === "f") return pa.n === pb.n && pa.d === pb.d;
  if (pa.k === pb.k) return Math.abs(val(pa)! - val(pb)!) < 1e-9;
  // frac ↔ percent, frac ↔ int (2/2 ≈ 1), percent alone
  if (
    (pa.k === "f" && pb.k === "p") ||
    (pa.k === "p" && pb.k === "f") ||
    (pa.k === "f" && pb.k === "n") ||
    (pa.k === "n" && pb.k === "f")
  ) {
    return Math.abs(val(pa)! - val(pb)!) < 1e-9;
  }
  return false;
}

const dups: string[] = [];
for (const s of STATISTICS_SKILLS) {
  for (const q of [...s.drill, ...(s.final_extra || [])]) {
    for (let i = 0; i < q.choices_ar.length; i++) {
      for (let j = i + 1; j < q.choices_ar.length; j++) {
        if (equiv(q.choices_ar[i]!, q.choices_ar[j]!)) {
          dups.push(
            `${s.id}/${q.id}: [${i}]=${q.choices_ar[i]} ≈ [${j}]=${q.choices_ar[j]} (correct=${q.correct_index})`,
          );
        }
      }
    }
  }
}
console.log("EQUIV_PAIRS", dups.length);
for (const d of dups) console.log(d);

// Spot-check median even/odd
const med = STATISTICS_SKILLS.find((s) => s.id === "median")!;
function nums(prompt: string) {
  const p = asc(prompt);
  const colon = p.match(/[:：]\s*([\d.\s،,و\-]+)/);
  const body = colon ? colon[1]! : p.split(/\s+ما\s+/)[0]!;
  return [...body.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => +m[0]!);
}
function median(a: number[]) {
  const s = [...a].sort((x, y) => x - y);
  return s.length % 2 ? s[(s.length - 1) / 2]! : (s[s.length / 2 - 1]! + s[s.length / 2]!) / 2;
}
console.log("\nMEDIAN SPOT:");
for (const q of [...med.drill, ...med.final_extra!]) {
  const a = nums(q.prompt_ar);
  const m = median(a);
  const choice = q.choices_ar[q.correct_index]!;
  const ok = Math.abs(+choice - m) < 1e-9;
  if (!ok) console.log("FAIL", q.id, a, "sorted", [...a].sort((x, y) => x - y), "med", m, "got", choice);
  else if (a.length % 2 === 0) console.log("OK even", q.id, [...a].sort((x, y) => x - y), "=", m);
}

// Spot-check without-replace second-draw denominators in solve text
const pwr = STATISTICS_SKILLS.find((s) => s.id === "prob-without-replace")!;
console.log("\nPWR SOLVES:");
for (const q of [...pwr.drill, ...pwr.final_extra!]) {
  console.log(q.id, "→", q.choices_ar[q.correct_index], "|", q.solve_ar);
}
