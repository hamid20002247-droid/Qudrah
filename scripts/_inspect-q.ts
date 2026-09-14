import { writeFileSync } from "fs";
import { STATISTICS_SKILLS } from "../src/content/statistics/index.ts";

const ids = new Set([
  "tbl-10", "tbl-12", "tbl-17", "tbl-18", "tbl-f01",
  "cht-04", "cht-09", "cht-11", "cht-16", "cht-18", "cht-f04", "cht-f05",
  "ps-06", "dp-f07",
]);

const lines: string[] = [];
for (const s of STATISTICS_SKILLS) {
  for (const q of [...s.drill, ...(s.final_extra ?? [])]) {
    if (!ids.has(q.id)) continue;
    lines.push(`--- ${s.id}/${q.id} ci=${q.correct_index}`);
    lines.push(`P: ${q.prompt_ar.replace(/\n/g, " | ")}`);
    lines.push(`C: ${q.choices_ar.join(" / ")}`);
    lines.push(`S: ${q.solve_ar}`);
    lines.push("");
  }
}
writeFileSync("scripts/_inspect.txt", lines.join("\n"), "utf8");
console.log("ok", lines.length);
