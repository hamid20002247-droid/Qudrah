/**
 * Dump arithmetic skills for manual/semi-auto audit + Latin/structure checks.
 * Full math recomputation lives in per-skill verify helpers below / separate pass.
 * Run: npx tsx scripts/arithmetic-math-audit-run.ts
 */
import { writeFileSync } from "fs";
import { ALL_SKILLS } from "../src/content/arithmetic/index.ts";

const SKILLS = ALL_SKILLS.filter((s) => s.domain === "arithmetic");

const latin = /[A-Za-z]/;
const hits: string[] = [];
const struct: string[] = [];

function check(label: string, text: string) {
  if (text && latin.test(text)) {
    hits.push(`${label}: ${text.replace(/\s+/g, " ").slice(0, 160)}`);
  }
}

type Row = {
  skill: string;
  id: string;
  prompt: string;
  choices: string[];
  correct_index: number;
  solve: string;
};

const rows: Row[] = [];
let dump = "";

for (const s of SKILLS) {
  dump += `\n======== ${s.id} | ${s.title_ar} ========\n`;
  dump += `HOOK: ${s.hook_ar}\n`;
  dump += `INTUITION:\n${s.intuition_ar.map((x) => `  - ${x}`).join("\n")}\n`;
  dump += `TRICK: ${s.trick_ar.statement}\n`;
  dump += `STEPS:\n${s.trick_ar.steps.map((x) => `  - ${x}`).join("\n")}\n`;
  dump += `EXAMPLE: ${s.trick_ar.example_ar}\n`;
  check(`${s.id}.title`, s.title_ar);
  check(`${s.id}.hook`, s.hook_ar);
  for (const t of s.intuition_ar) check(`${s.id}.intuition`, t);
  check(`${s.id}.trick`, s.trick_ar.statement);
  for (const t of s.trick_ar.steps) check(`${s.id}.step`, t);
  check(`${s.id}.example`, s.trick_ar.example_ar);

  if (s.drill.length !== 18) struct.push(`${s.id} drill=${s.drill.length}`);
  if ((s.final_extra || []).length !== 7) {
    struct.push(`${s.id} final=${(s.final_extra || []).length}`);
  }
  if (s.timing && s.trick_ar.time_target_sec !== s.timing.excellent_sec) {
    struct.push(`${s.id} time mismatch`);
  }

  for (const q of [...s.drill, ...(s.final_extra || [])]) {
    if (!q.solve_ar || q.solve_ar.trim().length < 8) {
      struct.push(`${q.id} missing solve`);
    }
    if (q.choices_ar.length !== 4) struct.push(`${q.id} choices`);
    if (new Set(q.choices_ar).size !== 4) {
      struct.push(`${q.id} dup choices: ${q.choices_ar.join(" | ")}`);
    }
    check(`${q.id}.p`, q.prompt_ar);
    check(`${q.id}.s`, q.solve_ar || "");
    q.choices_ar.forEach((c) => check(`${q.id}.c`, c));
    for (const v of Object.values(q.trap_explanations_ar || {})) {
      check(`${q.id}.t`, v);
    }
    dump += `\n--- ${q.id} idx=${q.correct_index} ---\n`;
    dump += `Q: ${q.prompt_ar}\n`;
    q.choices_ar.forEach((c, i) => {
      dump += `  [${i}${i === q.correct_index ? "*" : ""}] ${c}\n`;
    });
    dump += `SOLVE: ${q.solve_ar || ""}\n`;
    rows.push({
      skill: s.id,
      id: q.id,
      prompt: q.prompt_ar,
      choices: q.choices_ar,
      correct_index: q.correct_index,
      solve: q.solve_ar || "",
    });
  }
}

writeFileSync("scripts/_arith-dump.txt", dump, "utf8");
writeFileSync("scripts/_arith-questions.json", JSON.stringify(rows, null, 2), "utf8");
writeFileSync(
  "scripts/_arith-latin.txt",
  `count=${hits.length}\n${hits.join("\n")}`,
  "utf8"
);
writeFileSync(
  "scripts/_arith-struct.txt",
  struct.length ? struct.join("\n") : "OK",
  "utf8"
);
console.log(`skills=${SKILLS.length} questions=${rows.length}`);
console.log(`latin=${hits.length} struct=${struct.length || "OK"}`);
