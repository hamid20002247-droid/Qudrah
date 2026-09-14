import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const dir = "src/components/visuals";
const hits: string[] = [];
const latin = /[A-Za-zπΣ]/;

for (const f of readdirSync(dir).filter((x) => x.endsWith("Lab.tsx"))) {
  const src = readFileSync(join(dir, f), "utf8");
  const lines = src.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    // skip imports / types / pure code identifiers without Arabic UI
    if (/^\s*(import|export|type |const |let |function |return |if |else|for |while)/.test(line)) {
      continue;
    }
    // student-facing: Arabic on line + Latin, or known English UI words
    const hasAr = /[\u0600-\u06FF]/.test(line);
    const hasLatin = latin.test(line);
    if (!hasLatin) continue;
    if (
      /className=|style=\{|from |useState|useCallback|useRef|dir=|key=|type="button"|onClick|onKeyDown|disabled=|role=|aria-valuenow|compact \?|active:|hover:|sm:|md:|lg:|bg-|text-|ring-|rounded-|flex |grid |absolute |relative |transition|shadow|opacity|translate|pointer-events|select-none|tabular-nums|font-|min-h|max-w|gap-|px-|py-|mt-|mb-|ms-|me-|w-|h-|left:|width:|ArrowLeft|ArrowRight|requestSmartMode/.test(
        line
      ) &&
      !hasAr
    ) {
      continue;
    }
    if (hasAr && hasLatin) {
      // allow digits-only math like 2^3 if Latin is only in code wrappers — strip JSX attrs
      const stripped = line
        .replace(/className="[^"]*"/g, "")
        .replace(/className=\{`[^`]*`\}/g, "")
        .replace(/style=\{\{[^}]*\}\}/g, "")
        .replace(/dir="[^"]*"/g, "")
        .replace(/type="[^"]*"/g, "")
        .replace(/role="[^"]*"/g, "");
      if (latin.test(stripped) && /[\u0600-\u06FF]/.test(stripped)) {
        hits.push(`${f}:${i + 1}: ${stripped.trim().slice(0, 140)}`);
      }
    }
  }
}

writeFileSync(
  "scripts/latin-lab-hits.txt",
  `count=${hits.length}\n${hits.join("\n")}`,
  "utf8"
);
