import { COMPARISON_SKILLS } from "../src/content/comparison/index";

const CHOICES = [
  "كمية أ أكبر",
  "كمية ب أكبر",
  "متساويتان",
  "المعطيات غير كافية",
];
const latinRe = /[A-Za-z]/;
const errors: string[] = [];
const confirmations: string[] = [];

for (const skill of COMPARISON_SKILLS) {
  const drill = skill.drill.length;
  const extra = skill.final_extra?.length ?? 0;
  if (drill !== 18) errors.push(`${skill.id} drill=${drill}`);
  if (extra !== 7) errors.push(`${skill.id} final_extra=${extra}`);
  if (skill.domain !== "comparison") errors.push(`${skill.id} domain`);
  if (skill.trick_ar.time_target_sec !== skill.timing?.excellent_sec) {
    errors.push(`${skill.id} timing mismatch`);
  }
  let insuff = 0;
  const all = [...skill.drill, ...(skill.final_extra ?? [])];
  for (const q of all) {
    if (q.choices_ar.join("|") !== CHOICES.join("|")) {
      errors.push(`${q.id} bad choices`);
    }
    if (q.correct_index < 0 || q.correct_index > 3) {
      errors.push(`${q.id} bad index`);
    }
    if (q.sub_pattern !== "comparison") errors.push(`${q.id} sub_pattern`);
    if (!q.solve_ar) errors.push(`${q.id} missing solve`);
    if (q.correct_index === 3) insuff++;
    for (const field of [
      q.prompt_ar,
      q.solve_ar ?? "",
      ...q.choices_ar,
      ...Object.values(q.trap_explanations_ar),
    ]) {
      if (latinRe.test(field)) {
        errors.push(`${q.id} LATIN '${field.match(latinRe)?.[0]}' :: ${field.slice(0, 100)}`);
      }
    }
  }
  for (const field of [
    ...skill.intuition_ar,
    skill.trick_ar.statement,
    ...skill.trick_ar.steps,
    skill.trick_ar.example_ar,
    skill.hook_ar,
    skill.title_ar,
  ]) {
    if (latinRe.test(field)) errors.push(`${skill.id} LATIN meta: ${field}`);
  }
  if (insuff > 2) errors.push(`${skill.id} too many insufficient: ${insuff}`);
  confirmations.push(
    `${skill.id}: drill=${drill} final_extra=${extra} total=${drill + extra} insufficient=${insuff} timing=${[
      skill.timing?.excellent_sec,
      skill.timing?.good_sec,
      skill.timing?.ok_sec,
      skill.timing?.slow_sec,
    ].join("/")}`,
  );
}

const checks: [string, number][] = [
  ["cn-01", 2],
  ["cn-02", 0],
  ["cn-03", 1],
  ["cn-04", 0],
  ["cn-05", 2],
  ["cn-06", 2],
  ["cn-07", 0],
  ["cn-08", 1],
  ["cn-09", 2],
  ["cn-10", 0],
  ["cn-11", 2],
  ["cn-12", 0],
  ["cn-13", 0],
  ["cn-14", 0],
  ["cn-15", 2],
  ["cn-16", 0],
  ["cn-17", 3],
  ["cn-18", 2],
  ["cn-f01", 1],
  ["cn-f02", 2],
  ["cn-f03", 0],
  ["cn-f04", 2],
  ["cn-f05", 2],
  ["cn-f06", 3],
  ["cn-f07", 2],
  ["cp-01", 0],
  ["cp-02", 2],
  ["cp-03", 0],
  ["cp-04", 1],
  ["cp-05", 1],
  ["cp-06", 2],
  ["cp-07", 0],
  ["cp-08", 0],
  ["cp-09", 2],
  ["cp-10", 2],
  ["cp-11", 0],
  ["cp-12", 0],
  ["cp-13", 2],
  ["cp-14", 1],
  ["cp-15", 2],
  ["cp-16", 1],
  ["cp-17", 3],
  ["cp-18", 2],
  ["cp-f01", 1],
  ["cp-f02", 2],
  ["cp-f03", 0],
  ["cp-f04", 0],
  ["cp-f05", 0],
  ["cp-f06", 3],
  ["cp-f07", 2],
  ["cf-01", 0],
  ["cf-02", 1],
  ["cf-03", 0],
  ["cf-04", 0],
  ["cf-05", 0],
  ["cf-06", 1],
  ["cf-07", 1],
  ["cf-08", 1],
  ["cf-09", 2],
  ["cf-10", 1],
  ["cf-11", 1],
  ["cf-12", 0],
  ["cf-13", 1],
  ["cf-14", 1],
  ["cf-15", 1],
  ["cf-16", 2],
  ["cf-17", 3],
  ["cf-18", 0],
  ["cf-f01", 0],
  ["cf-f02", 0],
  ["cf-f03", 1],
  ["cf-f04", 2],
  ["cf-f05", 1],
  ["cf-f06", 3],
  ["cf-f07", 0],
  ["ca-01", 2],
  ["ca-02", 0],
  ["ca-03", 0],
  ["ca-04", 0],
  ["ca-05", 0],
  ["ca-06", 0],
  ["ca-07", 0],
  ["ca-08", 1],
  ["ca-09", 2],
  ["ca-10", 0],
  ["ca-11", 0],
  ["ca-12", 1],
  ["ca-13", 0],
  ["ca-14", 0],
  ["ca-15", 0],
  ["ca-16", 0],
  ["ca-17", 3],
  ["ca-18", 2],
  ["ca-f01", 0],
  ["ca-f02", 0],
  ["ca-f03", 0],
  ["ca-f04", 0],
  ["ca-f05", 1],
  ["ca-f06", 3],
  ["ca-f07", 0],
  ["cpa-01", 2],
  ["cpa-02", 1],
  ["cpa-03", 0],
  ["cpa-04", 1],
  ["cpa-05", 0],
  ["cpa-06", 1],
  ["cpa-07", 1],
  ["cpa-08", 1],
  ["cpa-09", 1],
  ["cpa-10", 0],
  ["cpa-11", 1],
  ["cpa-12", 0],
  ["cpa-13", 0],
  ["cpa-14", 1],
  ["cpa-15", 0],
  ["cpa-16", 0],
  ["cpa-17", 3],
  ["cpa-18", 1],
  ["cpa-f01", 1],
  ["cpa-f02", 0],
  ["cpa-f03", 1],
  ["cpa-f04", 0],
  ["cpa-f05", 1],
  ["cpa-f06", 3],
  ["cpa-f07", 1],
];

const byId = new Map(
  COMPARISON_SKILLS.flatMap((s) =>
    [...s.drill, ...(s.final_extra ?? [])].map((q) => [q.id, q] as const),
  ),
);

for (const [id, idx] of checks) {
  const q = byId.get(id);
  if (!q) {
    errors.push(`missing ${id}`);
    continue;
  }
  if (q.correct_index !== idx) {
    errors.push(`${id} expected ${idx} got ${q.correct_index}`);
  }
}

console.log(confirmations.join("\n"));
console.log("---");
if (errors.length) {
  console.log("ERRORS:\n" + errors.join("\n"));
  process.exit(1);
} else {
  console.log(`ALL_OK skills=${COMPARISON_SKILLS.length} checks=${checks.length}`);
}
