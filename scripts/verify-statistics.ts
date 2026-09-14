import { writeFileSync } from "fs";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { STATISTICS_SKILLS } from "../src/content/statistics/index.ts";
import { ALL_SKILLS } from "../src/content/arithmetic/index.ts";
import {
  isSkillLive,
  liveSkillCountInField,
  getFieldById,
} from "../src/content/catalog/fields.ts";

const latin = /[A-Za-z]/;
const hits: string[] = [];

function check(label: string, text: string) {
  if (text && latin.test(text)) hits.push(`${label}: ${text.slice(0, 160)}`);
}

const counts: string[] = [];
for (const s of STATISTICS_SKILLS) {
  const drill = s.drill.length;
  const extra = s.final_extra?.length ?? 0;
  const missingSolve = [...s.drill, ...(s.final_extra || [])].filter(
    (q) => !q.solve_ar
  ).length;
  const badChoices = [...s.drill, ...(s.final_extra || [])].filter(
    (q) => q.choices_ar.length !== 4 || q.correct_index < 0 || q.correct_index > 3
  ).length;
  counts.push(
    `${s.id}: drill=${drill} extra=${extra} live=${isSkillLive(s.id)} viz=${
      s.visual.kind === "custom" ? s.visual.component : "?"
    } missingSolve=${missingSolve} badChoices=${badChoices}`
  );

  check(`${s.id}.title`, s.title_ar);
  check(`${s.id}.hook`, s.hook_ar);
  check(`${s.id}.icon`, s.icon);
  for (const t of s.intuition_ar) check(`${s.id}.int`, t);
  check(`${s.id}.trick`, s.trick_ar.statement);
  for (const t of s.trick_ar.steps) check(`${s.id}.step`, t);
  check(`${s.id}.ex`, s.trick_ar.example_ar);
  for (const q of [...s.drill, ...(s.final_extra || [])]) {
    check(`${s.id}/${q.id}.p`, q.prompt_ar);
    check(`${s.id}/${q.id}.s`, q.solve_ar || "");
    for (const c of q.choices_ar) check(`${s.id}/${q.id}.c`, c);
    for (const [k, v] of Object.entries(q.trap_explanations_ar)) {
      check(`${s.id}/${q.id}.t${k}`, v);
    }
  }
}

// Lab Arabic strings with Latin (same-line)
const labDir = "src/components/visuals";
const labFiles = [
  "MeanListLab.tsx",
  "MeanMissingLab.tsx",
  "MedianLab.tsx",
  "ModeLab.tsx",
  "RangeLab.tsx",
  "TablesLab.tsx",
  "ChartsLab.tsx",
  "ProbSimpleLab.tsx",
  "ProbWithoutReplaceLab.tsx",
  "DataPercentLab.tsx",
];
for (const f of labFiles) {
  const path = join(labDir, f);
  try {
    const lines = readFileSync(path, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const re =
        /(["'`])((?:\\.|(?!\1).)*[\u0600-\u06FF](?:\\.|(?!\1).)*)\1/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(line))) {
        const text = m[2]!;
        // ignore ${js} expressions containing Latin var names by stripping ${...}
        const cleaned = text.replace(/\$\{[^}]+\}/g, "");
        if (latin.test(cleaned)) hits.push(`lab/${f}:${i + 1}: ${cleaned.slice(0, 120)}`);
      }
    }
  } catch {
    hits.push(`MISSING_LAB: ${f}`);
  }
}

const field = getFieldById("statistics");
writeFileSync(
  "scripts/statistics-verify.txt",
  [
    `STATISTICS_SKILLS=${STATISTICS_SKILLS.length}`,
    `ALL_SKILLS=${ALL_SKILLS.length}`,
    `catalog live=${field ? liveSkillCountInField(field) : "missing"}`,
    `latin_hits=${hits.length}`,
    "",
    ...counts,
    "",
    ...hits.slice(0, 80),
  ].join("\n"),
  "utf8"
);
