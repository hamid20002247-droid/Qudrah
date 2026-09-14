import { writeFileSync } from "fs";
import { readFileSync } from "fs";
import { join } from "path";
import { COMPARISON_SKILLS } from "../src/content/comparison/index.ts";
import { ALL_SKILLS } from "../src/content/arithmetic/index.ts";
import {
  isSkillLive,
  liveSkillCountInField,
  getFieldById,
} from "../src/content/catalog/fields.ts";

const latin = /[A-Za-z]/;
const hits: string[] = [];
const counts: string[] = [];

function check(label: string, text: string) {
  if (text && latin.test(text)) hits.push(`${label}: ${text.slice(0, 160)}`);
}

const CHOICE_SET = new Set([
  "كمية أ أكبر",
  "كمية ب أكبر",
  "متساويتان",
  "المعطيات غير كافية",
]);

for (const s of COMPARISON_SKILLS) {
  const drill = s.drill.length;
  const extra = s.final_extra?.length ?? 0;
  const allQ = [...s.drill, ...(s.final_extra || [])];
  const missingSolve = allQ.filter((q) => !q.solve_ar).length;
  const badChoices = allQ.filter(
    (q) =>
      q.choices_ar.length !== 4 ||
      q.correct_index < 0 ||
      q.correct_index > 3 ||
      !q.choices_ar.every((c) => CHOICE_SET.has(c))
  ).length;
  const insuf = allQ.filter(
    (q) => q.choices_ar[q.correct_index] === "المعطيات غير كافية"
  ).length;
  counts.push(
    `${s.id}: drill=${drill} extra=${extra} live=${isSkillLive(s.id)} viz=${
      s.visual.kind === "custom" ? s.visual.component : "?"
    } missingSolve=${missingSolve} badChoices=${badChoices} insufCorrect=${insuf}`
  );

  check(`${s.id}.title`, s.title_ar);
  check(`${s.id}.hook`, s.hook_ar);
  check(`${s.id}.icon`, s.icon);
  for (const t of s.intuition_ar) check(`${s.id}.int`, t);
  check(`${s.id}.trick`, s.trick_ar.statement);
  for (const t of s.trick_ar.steps) check(`${s.id}.step`, t);
  check(`${s.id}.ex`, s.trick_ar.example_ar);
  for (const q of allQ) {
    check(`${s.id}/${q.id}.p`, q.prompt_ar);
    check(`${s.id}/${q.id}.s`, q.solve_ar || "");
    for (const c of q.choices_ar) check(`${s.id}/${q.id}.c`, c);
    for (const [k, v] of Object.entries(q.trap_explanations_ar)) {
      check(`${s.id}/${q.id}.t${k}`, v);
    }
  }
}

const labFiles = [
  "CmpNumbersLab.tsx",
  "CmpPercentLab.tsx",
  "CmpFracLab.tsx",
  "CmpAreaLab.tsx",
  "CmpPeriAreaLab.tsx",
  "CmpAlgebraLab.tsx",
  "CmpRootsExpLab.tsx",
  "CmpRatesLab.tsx",
  "CmpMeansLab.tsx",
  "CmpInsufficientLab.tsx",
];
for (const f of labFiles) {
  const path = join("src/components/visuals", f);
  try {
    const lines = readFileSync(path, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const re =
        /(["'`])((?:\\.|(?!\1).)*[\u0600-\u06FF](?:\\.|(?!\1).)*)\1/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(line))) {
        const cleaned = m[2]!.replace(/\$\{[^}]+\}/g, "");
        if (latin.test(cleaned))
          hits.push(`lab/${f}:${i + 1}: ${cleaned.slice(0, 120)}`);
      }
    }
  } catch {
    hits.push(`MISSING_LAB: ${f}`);
  }
}

const field = getFieldById("comparison");
writeFileSync(
  "scripts/comparison-verify.txt",
  [
    `COMPARISON_SKILLS=${COMPARISON_SKILLS.length}`,
    `ALL_SKILLS=${ALL_SKILLS.length}`,
    `catalog live=${field ? liveSkillCountInField(field) : "missing"}`,
    `latin_hits=${hits.length}`,
    "",
    ...counts,
    "",
    ...hits.slice(0, 60),
  ].join("\n"),
  "utf8"
);
