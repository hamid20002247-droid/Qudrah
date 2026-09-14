/**
 * Geometry math audit — full independent recomputation for all 300 questions.
 * Run: npx tsx scripts/geometry-math-audit-run.ts
 */
import { writeFileSync } from "fs";
import { GEOMETRY_SKILLS } from "../src/content/geometry/index.ts";

type Fail = { key: string; expected: string; choiceAtIndex: string; why: string };
const fails: Fail[] = [];
let passCount = 0;

function asc(s: string): string {
  const m: Record<string, string> = {
    "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
    "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9", "٫": ".",
  };
  return s.replace(/[٠-٩٫]/g, (c) => m[c] ?? c);
}

function num(s: string): number | null {
  const m = asc(s).match(/(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : null;
}

function unit(s: string): string {
  return asc(s).replace(/[\d.\s√+\-°]/g, "").trim();
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
  if (aa.includes("√") && bb.includes("√")) {
    const ra = aa.replace(/[^\d√]/g, "");
    const rb = bb.replace(/[^\d√]/g, "");
    if (ra === rb || bb.includes(ra.slice(0, 3))) return true;
  }
  return false;
}

function dup(choices: string[]): string | null {
  for (let i = 0; i < choices.length; i++) {
    for (let j = i + 1; j < choices.length; j++) {
      const ni = num(choices[i]);
      const nj = num(choices[j]);
      if (ni !== null && nj !== null && Math.abs(ni - nj) < 0.001 && unit(choices[i]) === unit(choices[j])) {
        return `duplicate equivalent choices [${i}] vs [${j}]`;
      }
    }
  }
  return null;
}

/** Expected answer text for every question (independent recomputation) */
const EXPECTED: Record<string, string> = {
  // units-measure (25)
  "units-measure/um-01": "300",
  "units-measure/um-02": "2.5",
  "units-measure/um-03": "20000",
  "units-measure/um-04": "0.5",
  "units-measure/um-05": "0.75",
  "units-measure/um-06": "3000",
  "units-measure/um-07": "10000",
  "units-measure/um-08": "400",
  "units-measure/um-09": "1.5",
  "units-measure/um-10": "80000",
  "units-measure/um-11": "120",
  "units-measure/um-12": "عامل الطول",
  "units-measure/um-13": "0.25",
  "units-measure/um-14": "2",
  "units-measure/um-15": "40000",
  "units-measure/um-16": "180",
  "units-measure/um-17": "100",
  "units-measure/um-18": "650",
  "units-measure/um-f01": "4.2",
  "units-measure/um-f02": "7000",
  "units-measure/um-f03": "90",
  "units-measure/um-f04": "3000000",
  "units-measure/um-f05": "0.3",
  "units-measure/um-f06": "275",
  "units-measure/um-f07": "20000",
  // angles (25)
  "angles/ang-01": "62",
  "angles/ang-02": "63",
  "angles/ang-03": "70",
  "angles/ang-04": "49",
  "angles/ang-05": "85",
  "angles/ang-06": "70",
  "angles/ang-07": "36",
  "angles/ang-08": "135",
  "angles/ang-09": "60",
  "angles/ang-10": "80",
  "angles/ang-11": "23",
  "angles/ang-12": "70",
  "angles/ang-13": "56",
  "angles/ang-14": "80",
  "angles/ang-15": "90",
  "angles/ang-16": "49",
  "angles/ang-17": "115",
  "angles/ang-18": "70",
  "angles/ang-f01": "18",
  "angles/ang-f02": "60",
  "angles/ang-f03": "45",
  "angles/ang-f04": "30",
  "angles/ang-f05": "38",
  "angles/ang-f06": "72",
  "angles/ang-f07": "180",
  // perimeter (25)
  "perimeter/per-01": "28",
  "perimeter/per-02": "34",
  "perimeter/per-03": "9",
  "perimeter/per-04": "15",
  "perimeter/per-05": "18",
  "perimeter/per-06": "30",
  "perimeter/per-07": "16",
  "perimeter/per-08": "40",
  "perimeter/per-09": "12",
  "perimeter/per-10": "17",
  "perimeter/per-11": "30",
  "perimeter/per-12": "6",
  "perimeter/per-13": "10",
  "perimeter/per-14": "9",
  "perimeter/per-15": "22",
  "perimeter/per-16": "22",
  "perimeter/per-17": "42",
  "perimeter/per-18": "50",
  "perimeter/per-f01": "32",
  "perimeter/per-f02": "20",
  "perimeter/per-f03": "72",
  "perimeter/per-f04": "40",
  "perimeter/per-f05": "8",
  "perimeter/per-f06": "60",
  "perimeter/per-f07": "50",
  // rect-area (25)
  "rect-area/ra-01": "40",
  "rect-area/ra-02": "81",
  "rect-area/ra-03": "36",
  "rect-area/ra-04": "96",
  "rect-area/ra-05": "8",
  "rect-area/ra-06": "8",
  "rect-area/ra-07": "30.25",
  "rect-area/ra-08": "44",
  "rect-area/ra-09": "150",
  "rect-area/ra-10": "9",
  "rect-area/ra-11": "98",
  "rect-area/ra-12": "49",
  "rect-area/ra-13": "10",
  "rect-area/ra-14": "6",
  "rect-area/ra-15": "11",
  "rect-area/ra-16": "180",
  "rect-area/ra-17": "80",
  "rect-area/ra-18": "25",
  "rect-area/ra-f01": "108",
  "rect-area/ra-f02": "144",
  "rect-area/ra-f03": "15",
  "rect-area/ra-f04": "200",
  "rect-area/ra-f05": "25",
  "rect-area/ra-f06": "30",
  "rect-area/ra-f07": "10",
  // triangle-area (25)
  "triangle-area/ta-01": "30",
  "triangle-area/ta-02": "20",
  "triangle-area/ta-03": "42",
  "triangle-area/ta-04": "63",
  "triangle-area/ta-05": "6",
  "triangle-area/ta-06": "10",
  "triangle-area/ta-07": "40",
  "triangle-area/ta-08": "36",
  "triangle-area/ta-09": "18",
  "triangle-area/ta-10": "60",
  "triangle-area/ta-11": "30",
  "triangle-area/ta-12": "8",
  "triangle-area/ta-13": "35",
  "triangle-area/ta-14": "100",
  "triangle-area/ta-15": "33",
  "triangle-area/ta-16": "6",
  "triangle-area/ta-17": "36",
  "triangle-area/ta-18": "150",
  "triangle-area/ta-f01": "14",
  "triangle-area/ta-f02": "18",
  "triangle-area/ta-f03": "75",
  "triangle-area/ta-f04": "26",
  "triangle-area/ta-f05": "10",
  "triangle-area/ta-f06": "77",
  "triangle-area/ta-f07": "10",
  // pythagoras (25) — non-345 triples preferred (a²+b² method)
  "pythagoras/py-01": "25",
  "pythagoras/py-02": "13",
  "pythagoras/py-03": "12",
  "pythagoras/py-04": "29",
  "pythagoras/py-05": "17",
  "pythagoras/py-06": "41",
  "pythagoras/py-07": "35",
  "pythagoras/py-08": "7√2",
  "pythagoras/py-09": "15",
  "pythagoras/py-10": "29",
  "pythagoras/py-11": "34",
  "pythagoras/py-12": "24",
  "pythagoras/py-13": "17",
  "pythagoras/py-14": "5",
  "pythagoras/py-15": "25√2",
  "pythagoras/py-16": "24",
  "pythagoras/py-17": "65",
  "pythagoras/py-18": "37",
  "pythagoras/py-f01": "6.5",
  "pythagoras/py-f02": "40",
  "pythagoras/py-f03": "24",
  "pythagoras/py-f04": "6√2",
  "pythagoras/py-f05": "41",
  "pythagoras/py-f06": "21",
  "pythagoras/py-f07": "52",
  // circle-circ (25)
  "circle-circ/cc-01": "44",
  "circle-circ/cc-02": "88",
  "circle-circ/cc-03": "31.4",
  "circle-circ/cc-04": "18.84",
  "circle-circ/cc-05": "44",
  "circle-circ/cc-06": "132",
  "circle-circ/cc-07": "62.8",
  "circle-circ/cc-08": "7",
  "circle-circ/cc-09": "220",
  "circle-circ/cc-10": "22",
  "circle-circ/cc-11": "31.4",
  "circle-circ/cc-12": "20",
  "circle-circ/cc-13": "176",
  "circle-circ/cc-14": "157",
  "circle-circ/cc-15": "28",
  "circle-circ/cc-16": "9.42",
  "circle-circ/cc-17": "132",
  "circle-circ/cc-18": "25.12",
  "circle-circ/cc-f01": "22",
  "circle-circ/cc-f02": "18.84",
  "circle-circ/cc-f03": "17.5",
  "circle-circ/cc-f04": "157",
  "circle-circ/cc-f05": "66",
  "circle-circ/cc-f06": "4",
  "circle-circ/cc-f07": "308",
  // circle-area (25)
  "circle-area/ca-01": "154",
  "circle-area/ca-02": "78.5",
  "circle-area/ca-03": "154",
  "circle-area/ca-04": "314",
  "circle-area/ca-05": "314",
  "circle-area/ca-06": "616",
  "circle-area/ca-07": "38.5",
  "circle-area/ca-08": "28.26",
  "circle-area/ca-09": "7",
  "circle-area/ca-10": "78.5",
  "circle-area/ca-11": "1386",
  "circle-area/ca-12": "5",
  "circle-area/ca-13": "616",
  "circle-area/ca-14": "28.26",
  "circle-area/ca-15": "7.065",
  "circle-area/ca-16": "28",
  "circle-area/ca-17": "3850",
  "circle-area/ca-18": "القطر",
  "circle-area/ca-f01": "50.24",
  "circle-area/ca-f02": "154",
  "circle-area/ca-f03": "10",
  "circle-area/ca-f04": "2464",
  "circle-area/ca-f05": "1962.5",
  "circle-area/ca-f06": "7546",
  "circle-area/ca-f07": "50.24",
  // volume (25)
  "volume/vo-01": "64",
  "volume/vo-02": "30",
  "volume/vo-03": "216",
  "volume/vo-04": "80",
  "volume/vo-05": "27",
  "volume/vo-06": "6000",
  "volume/vo-07": "5",
  "volume/vo-08": "160",
  "volume/vo-09": "512",
  "volume/vo-10": "0.48",
  "volume/vo-11": "6",
  "volume/vo-12": "1000",
  "volume/vo-13": "48",
  "volume/vo-14": "4",
  "volume/vo-15": "8",
  "volume/vo-16": "225",
  "volume/vo-17": "250",
  "volume/vo-18": "6",
  "volume/vo-f01": "8",
  "volume/vo-f02": "42",
  "volume/vo-f03": "729",
  "volume/vo-f04": "72",
  "volume/vo-f05": "4",
  "volume/vo-f06": "10",
  "volume/vo-f07": "6",
  // surface-area (25)
  "surface-area/sa-01": "54",
  "surface-area/sa-02": "96",
  "surface-area/sa-03": "62",
  "surface-area/sa-04": "150",
  "surface-area/sa-05": "68",
  "surface-area/sa-06": "4",
  "surface-area/sa-07": "114",
  "surface-area/sa-08": "24",
  "surface-area/sa-09": "148",
  "surface-area/sa-10": "54",
  "surface-area/sa-11": "64",
  "surface-area/sa-12": "5",
  "surface-area/sa-13": "76",
  "surface-area/sa-14": "600",
  "surface-area/sa-15": "94",
  "surface-area/sa-16": "40",
  "surface-area/sa-17": "المساحة",
  "surface-area/sa-18": "2",
  "surface-area/sa-f01": "294",
  "surface-area/sa-f02": "106",
  "surface-area/sa-f03": "3",
  "surface-area/sa-f04": "120",
  "surface-area/sa-f05": "المكعب",
  "surface-area/sa-f06": "82",
  "surface-area/sa-f07": "384",
  // special-triangles (25)
  "special-triangles/st-01": "5",
  "special-triangles/st-02": "10",
  "special-triangles/st-03": "8",
  "special-triangles/st-04": "15",
  "special-triangles/st-05": "12",
  "special-triangles/st-06": "6",
  "special-triangles/st-07": "20",
  "special-triangles/st-08": "16",
  "special-triangles/st-09": "12",
  "special-triangles/st-10": "30",
  "special-triangles/st-11": "25",
  "special-triangles/st-12": "12",
  "special-triangles/st-13": "18",
  "special-triangles/st-14": "10",
  "special-triangles/st-15": "35",
  "special-triangles/st-16": "32",
  "special-triangles/st-17": "5",
  "special-triangles/st-18": "40",
  "special-triangles/st-f01": "12",
  "special-triangles/st-f02": "20",
  "special-triangles/st-f03": "45",
  "special-triangles/st-f04": "30",
  "special-triangles/st-f05": "75",
  "special-triangles/st-f06": "5",
  "special-triangles/st-f07": "28",
  // parallel-lines (25)
  "parallel-lines/pl-01": "70",
  "parallel-lines/pl-02": "40",
  "parallel-lines/pl-03": "115",
  "parallel-lines/pl-04": "110",
  "parallel-lines/pl-05": "85",
  "parallel-lines/pl-06": "متساويتان",
  "parallel-lines/pl-07": "58",
  "parallel-lines/pl-08": "108",
  "parallel-lines/pl-09": "45",
  "parallel-lines/pl-10": "المتحالفتان",
  "parallel-lines/pl-11": "125",
  "parallel-lines/pl-12": "97",
  "parallel-lines/pl-13": "50",
  "parallel-lines/pl-14": "30",
  "parallel-lines/pl-15": "120",
  "parallel-lines/pl-16": "134",
  "parallel-lines/pl-17": "112",
  "parallel-lines/pl-18": "المتبادلة",
  "parallel-lines/pl-f01": "90",
  "parallel-lines/pl-f02": "138",
  "parallel-lines/pl-f03": "30",
  "parallel-lines/pl-f04": "60",
  "parallel-lines/pl-f05": "180",
  "parallel-lines/pl-f06": "25",
  "parallel-lines/pl-f07": "62",
};

for (const skill of GEOMETRY_SKILLS) {
  for (const q of [...skill.drill, ...(skill.final_extra ?? [])]) {
    const key = `${skill.id}/${q.id}`;
    const choice = q.choices_ar[q.correct_index];
    const expected = EXPECTED[key];

    if (!expected) {
      fails.push({ key, expected: "?", choiceAtIndex: choice, why: "missing from audit table" });
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

    // solve_ar sanity: last number in solve should match when numeric
    if (q.solve_ar) {
      const solveNums = [...asc(q.solve_ar).matchAll(/(\d+(?:\.\d+)?)/g)].map((m) => m[1]);
      const expNum = num(expected);
      const solveLast = solveNums.length ? parseFloat(solveNums[solveNums.length - 1]) : null;
      if (expNum !== null && solveLast !== null && Math.abs(expNum - solveLast) > 0.1 && !expected.includes("√") && !expected.includes("الم")) {
        fails.push({ key, expected, choiceAtIndex: choice, why: `solve_ar ends with ${solveLast}, expected ${expNum}` });
        continue;
      }
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
writeFileSync("scripts/geometry-math-audit.txt", lines.join("\n"), "utf8");
console.log(lines.join("\n"));
