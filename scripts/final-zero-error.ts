import { writeFileSync } from "fs";
import { ALL_SKILLS } from "../src/content/arithmetic/index.ts";

const latin = /[A-Za-z]/;
const hits: string[] = [];
const idMap = new Map<string, string>();
const dups: string[] = [];
let qCount = 0;
let missingSolve = 0;
let badChoice = 0;
let dupChoiceText = 0;
const byDomain: Record<string, number> = {};

function check(label: string, text: string) {
  if (text && latin.test(text)) hits.push(`${label}: ${text.slice(0, 100)}`);
}

for (const s of ALL_SKILLS) {
  byDomain[s.domain] = (byDomain[s.domain] || 0) + 1;
  check(`${s.id}.title`, s.title_ar);
  check(`${s.id}.hook`, s.hook_ar);
  for (const t of s.intuition_ar) check(`${s.id}.int`, t);
  check(`${s.id}.trick`, s.trick_ar.statement);
  for (const t of s.trick_ar.steps) check(`${s.id}.step`, t);
  check(`${s.id}.ex`, s.trick_ar.example_ar);
  const all = [...s.drill, ...(s.final_extra || [])];
  if (s.drill.length !== 18 || (s.final_extra || []).length !== 7) {
    hits.push(`${s.id}: bad counts drill=${s.drill.length} extra=${(s.final_extra || []).length}`);
  }
  for (const q of all) {
    qCount++;
    if (idMap.has(q.id)) dups.push(`${q.id}: ${idMap.get(q.id)} + ${s.id}`);
    else idMap.set(q.id, s.id);
    if (!q.solve_ar) missingSolve++;
    if (
      q.choices_ar.length !== 4 ||
      q.correct_index < 0 ||
      q.correct_index > 3
    ) {
      badChoice++;
    }
    if (new Set(q.choices_ar).size !== 4) {
      dupChoiceText++;
      hits.push(`${s.id}/${q.id}: duplicate choice text ${JSON.stringify(q.choices_ar)}`);
    }
    check(`${s.id}/${q.id}.p`, q.prompt_ar);
    check(`${s.id}/${q.id}.s`, q.solve_ar || "");
    for (const c of q.choices_ar) check(`${s.id}/${q.id}.c`, c);
    for (const [k, v] of Object.entries(q.trap_explanations_ar)) {
      check(`${s.id}/${q.id}.t${k}`, v);
    }
  }
}

writeFileSync(
  "scripts/final-zero-error.txt",
  [
    `ALL_SKILLS=${ALL_SKILLS.length}`,
    `BY_DOMAIN=${JSON.stringify(byDomain)}`,
    `QUESTIONS=${qCount}`,
    `UNIQUE_IDS=${idMap.size}`,
    `DUP_IDS=${dups.length}`,
    `MISSING_SOLVE=${missingSolve}`,
    `BAD_CHOICE_STRUCT=${badChoice}`,
    `DUPLICATE_CHOICE_TEXT=${dupChoiceText}`,
    `LATIN_HITS=${hits.length}`,
    "",
    ...dups,
    ...hits.slice(0, 50),
  ].join("\n"),
  "utf8"
);
