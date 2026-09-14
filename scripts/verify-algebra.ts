import { writeFileSync } from "fs";
import { ALGEBRA_SKILLS } from "../src/content/algebra/index.ts";
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
  if (text && latin.test(text)) hits.push(`${label}: ${text.slice(0, 140)}`);
}

for (const s of ALGEBRA_SKILLS) {
  const drill = s.drill.length;
  const extra = s.final_extra?.length ?? 0;
  const ok =
    drill === 18 &&
    extra === 7 &&
    s.domain === "algebra" &&
    s.review_status === "approved" &&
    Boolean(s.timing) &&
    s.drill.every((q) => q.solve_ar && q.choices_ar.length === 4);
  counts.push(
    `${s.id}: drill=${drill} extra=${extra} domain=${s.domain} live=${isSkillLive(s.id)} viz=${typeof s.visual === "object" && "component" in s.visual ? s.visual.component : "?"} ok=${ok}`
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

const field = getFieldById("algebra");
writeFileSync(
  "scripts/algebra-verify.txt",
  [
    `ALGEBRA_SKILLS=${ALGEBRA_SKILLS.length}`,
    `ALL_SKILLS=${ALL_SKILLS.length}`,
    `algebra live=${field ? liveSkillCountInField(field) : "missing"}`,
    `latin_hits=${hits.length}`,
    "",
    ...counts,
    "",
    ...hits.slice(0, 50),
  ].join("\n"),
  "utf8"
);
