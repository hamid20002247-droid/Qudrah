import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { ALL_SKILLS } from "../src/content/arithmetic/index.ts";
import { SKILL_FIELDS } from "../src/content/catalog/fields.ts";
import {
  generateExamQuestions,
  OFFICIAL_MIX_60,
} from "../src/lib/mock/generators.ts";

const latin = /[A-Za-z]/;
const hits: string[] = [];

function check(label: string, text: string) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t && latin.test(t)) hits.push(`${label}: ${t.slice(0, 180)}`);
}

for (const s of ALL_SKILLS) {
  check(`${s.id}.title`, s.title_ar);
  check(`${s.id}.hook`, s.hook_ar);
  check(`${s.id}.icon`, s.icon);
  for (const t of s.intuition_ar) check(`${s.id}.intuition`, t);
  check(`${s.id}.trick`, s.trick_ar.statement);
  for (const t of s.trick_ar.steps) check(`${s.id}.step`, t);
  check(`${s.id}.example`, s.trick_ar.example_ar);
  for (const q of [...s.drill, ...(s.final_extra || [])]) {
    check(`${s.id}/${q.id}.prompt`, q.prompt_ar);
    check(`${s.id}/${q.id}.solve`, q.solve_ar || "");
    for (const c of q.choices_ar) check(`${s.id}/${q.id}.choice`, c);
    for (const [k, v] of Object.entries(q.trap_explanations_ar)) {
      check(`${s.id}/${q.id}.trap${k}`, v);
    }
  }
}

for (const f of SKILL_FIELDS) {
  check(`field.${f.id}.title`, f.title_ar);
  check(`field.${f.id}.sub`, f.subtitle_ar);
  check(`field.${f.id}.blurb`, f.blurb_ar);
  check(`field.${f.id}.mark`, f.mark);
  check(`field.${f.id}.share`, f.share_label);
  for (const sk of f.skills) {
    check(`catalog.${sk.id}.title`, sk.title_ar);
    check(`catalog.${sk.id}.hook`, sk.hook_ar);
  }
}

for (const seed of [1, 7, 11, 42, 99, 2026]) {
  const qs = generateExamQuestions(seed, OFFICIAL_MIX_60, new Set(), 60);
  for (const q of qs) {
    check(`mock${seed}/${q.id}.prompt`, q.prompt_ar);
    check(`mock${seed}/${q.id}.solve`, q.solve_ar || "");
    for (const c of q.choices_ar) check(`mock${seed}/${q.id}.choice`, c);
    for (const [k, v] of Object.entries(q.trap_explanations_ar || {})) {
      check(`mock${seed}/${q.id}.trap${k}`, v);
    }
  }
}

// Labs: only same-line string/template literals containing Arabic
const labDir = "src/components/visuals";
for (const f of readdirSync(labDir).filter((x) => x.endsWith("Lab.tsx"))) {
  const lines = readFileSync(join(labDir, f), "utf8").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const re = /(["'`])((?:\\.|(?!\1).)*[\u0600-\u06FF](?:\\.|(?!\1).)*)\1/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line))) {
      check(`lab/${f}:${i + 1}`, m[2]!);
    }
  }
}

writeFileSync(
  "scripts/latin-hits.txt",
  `count=${hits.length}\n${hits.join("\n")}`,
  "utf8"
);
