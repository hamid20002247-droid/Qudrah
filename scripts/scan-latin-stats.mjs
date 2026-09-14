import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/content/statistics");
const skipExact = new Set([
  "tables",
  "charts",
  "prob-simple",
  "prob-without-replace",
  "data-percent",
  "statistics",
  "probability",
  "easy",
  "mid",
  "hard",
  "style-modeled-practice-2024",
  "approved",
  "founder",
  "2026-09-13T00:00:00.000Z",
]);

let bad = 0;
for (const f of ["tables.ts", "charts.ts", "prob-simple.ts", "prob-without-replace.ts", "data-percent.ts"]) {
  const t = fs.readFileSync(path.join(dir, f), "utf8");
  const re = /"((?:\\.|[^"\\])*)"/g;
  let m;
  while ((m = re.exec(t))) {
    const s = m[1].replace(/\\n/g, "\n");
    if (skipExact.has(s)) continue;
    if (/^(tbl|cht|ps|pwr|dp)-/.test(s)) continue;
    if (/[A-Za-z]/.test(s)) {
      console.log(f, "→", s.slice(0, 100));
      bad++;
    }
  }
}
console.log(bad === 0 ? "LATIN SCAN OK" : `LATIN FAIL ${bad}`);
process.exit(bad === 0 ? 0 : 1);
