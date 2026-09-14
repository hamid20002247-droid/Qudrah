/**
 * Verify skill banks: drill=18, final_extra=7, solve_ar present, unique correct choice.
 * Run: npx tsx scripts/verify-skills.ts
 */
import { readdirSync } from "fs";
import { join } from "path";

const REQUIRED = [
  "percent-of",
  "direct-inverse",
  "buy-sell",
  "average",
  "fractions",
  "rate-distance",
  "work-rate",
] as const;

async function loadSkill(id: string) {
  const path = join(process.cwd(), "src/content/arithmetic", `${id}.ts`);
  const mod = await import(path);
  const key = Object.keys(mod).find((k) => typeof mod[k] === "object" && mod[k]?.drill);
  if (!key) throw new Error(`No skill export in ${id}.ts`);
  return mod[key] as {
    id: string;
    title_ar: string;
    timing?: { excellent_sec: number };
    trick_ar: { time_target_sec: number };
    drill: Array<{
      id: string;
      choices_ar: string[];
      correct_index: number;
      solve_ar?: string;
    }>;
    final_extra?: Array<{
      id: string;
      choices_ar: string[];
      correct_index: number;
      solve_ar?: string;
    }>;
  };
}

function checkBank(
  label: string,
  qs: Array<{
    id: string;
    choices_ar: string[];
    correct_index: number;
    solve_ar?: string;
  }>,
  expected: number
) {
  const errors: string[] = [];
  if (qs.length !== expected) {
    errors.push(`${label}: expected ${expected} got ${qs.length}`);
  }
  const ids = new Set<string>();
  for (const q of qs) {
    if (ids.has(q.id)) errors.push(`duplicate id ${q.id}`);
    ids.add(q.id);
    if (!q.solve_ar || q.solve_ar.trim().length < 8) {
      errors.push(`${q.id}: missing/short solve_ar`);
    }
    if (q.choices_ar.length !== 4) {
      errors.push(`${q.id}: need 4 choices`);
    }
    if (q.correct_index < 0 || q.correct_index > 3) {
      errors.push(`${q.id}: bad correct_index`);
    }
    const uniq = new Set(q.choices_ar);
    if (uniq.size !== q.choices_ar.length) {
      errors.push(`${q.id}: duplicate choices ${q.choices_ar.join("|")}`);
    }
  }
  return errors;
}

async function main() {
  const allErrors: string[] = [];
  for (const id of REQUIRED) {
    try {
      const skill = await loadSkill(id);
      console.log(`\n✔ loaded ${skill.id} — ${skill.title_ar}`);
      if (skill.id !== id) {
        allErrors.push(`${id}: export id is ${skill.id}`);
      }
      if (
        skill.timing &&
        skill.trick_ar.time_target_sec !== skill.timing.excellent_sec
      ) {
        allErrors.push(`${id}: time_target_sec !== excellent_sec`);
      }
      allErrors.push(...checkBank(`${id}.drill`, skill.drill, 18));
      allErrors.push(
        ...checkBank(`${id}.final_extra`, skill.final_extra ?? [], 7)
      );
    } catch (e) {
      allErrors.push(`${id}: ${(e as Error).message}`);
      console.log(`\n✖ ${id} not ready`);
    }
  }
  const labs = [
    "PercentOfLab",
    "DirectInverseLab",
    "BuySellLab",
    "AverageLab",
    "FractionsLab",
    "RateDistanceLab",
    "WorkRateLab",
  ];
  for (const lab of labs) {
    const p = join(process.cwd(), "src/components/visuals", `${lab}.tsx`);
    try {
      readdirSync(join(process.cwd(), "src/components/visuals"));
      const { existsSync } = await import("fs");
      if (!existsSync(p)) allErrors.push(`missing lab ${lab}.tsx`);
      else console.log(`✔ lab ${lab}.tsx`);
    } catch {
      allErrors.push(`lab check failed ${lab}`);
    }
  }
  if (allErrors.length) {
    console.log("\nERRORS:");
    allErrors.forEach((e) => console.log(" -", e));
    process.exit(1);
  }
  console.log("\nAll 7 skills structure OK");
}

main();
