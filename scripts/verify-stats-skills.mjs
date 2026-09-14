/**
 * Verify statistics skills 6–10: counts, unique choices, no equivalent fractions,
 * no Latin letters in student-facing strings, trap keys cover wrong indices.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Use ts via dynamic - instead parse JSON-like by importing after fixing generator
// We'll re-run generator with fixed traps then verify generated TS with regex.

const dir = path.join(__dirname, "../src/content/statistics");
const files = ["tables.ts", "charts.ts", "prob-simple.ts", "prob-without-replace.ts", "data-percent.ts"];

function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { const t = b; b = a % b; a = t; }
  return a || 1;
}

function parseFrac(s) {
  const m = String(s).trim().match(/^(\d+)\s*\/\s*(\d+)$/);
  if (!m) return null;
  const n = +m[1], d = +m[2];
  const g = gcd(n, d);
  return `${n / g}/${d / g}`;
}

function studentLatin(s) {
  // strip allowed: none of a-zA-Z should appear in student text
  return /[A-Za-z]/.test(s);
}

let errors = 0;
for (const file of files) {
  const text = fs.readFileSync(path.join(dir, file), "utf8");
  const drillCount = (text.match(/id: "[^"]+"/g) || []).length;
  // rough
  const qBlocks = [...text.matchAll(/\{\s*id: "([^"]+)"([\s\S]*?)\.\.\.review,/g)];
  console.log(file, "question blocks", qBlocks.length);
  if (qBlocks.length !== 25) {
    console.error("EXPECTED 25 questions in", file);
    errors++;
  }
  for (const [, id, body] of qBlocks) {
    const choicesM = body.match(/choices_ar: \[([\s\S]*?)\]/);
    const correctM = body.match(/correct_index: (\d+)/);
    const promptM = body.match(/prompt_ar: "((?:\\.|[^"\\])*)"/);
    const solveM = body.match(/solve_ar: "((?:\\.|[^"\\])*)"/);
    const trapsM = body.match(/trap_explanations_ar: \{([\s\S]*?)\}/);
    if (!choicesM || !correctM) {
      console.error(id, "missing choices/correct");
      errors++;
      continue;
    }
    const choices = [...choicesM[1].matchAll(/"((?:\\.|[^"\\])*)"/g)].map((m) => m[1]);
    const correct = +correctM[1];
    if (choices.length !== 4) {
      console.error(id, "need 4 choices", choices);
      errors++;
    }
    if (new Set(choices).size !== 4) {
      console.error(id, "duplicate choices", choices);
      errors++;
    }
    // equivalent fractions among choices
    const norms = choices.map(parseFrac);
    if (norms.every((n) => n !== null)) {
      if (new Set(norms).size !== 4) {
        console.error(id, "equivalent fraction choices", choices, norms);
        errors++;
      }
    } else {
      // check pairs that are both fracs
      for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 4; j++) {
          if (norms[i] && norms[j] && norms[i] === norms[j]) {
            console.error(id, "equivalent", choices[i], choices[j]);
            errors++;
          }
        }
      }
    }
    const trapKeys = [...(trapsM?.[1].matchAll(/(\d+):/g) || [])].map((m) => +m[1]);
    for (let i = 0; i < 4; i++) {
      if (i === correct) {
        if (trapKeys.includes(i)) {
          console.error(id, "trap on correct", i);
          errors++;
        }
      } else if (!trapKeys.includes(i)) {
        console.error(id, "missing trap for", i, "traps", trapKeys, "correct", correct);
        errors++;
      }
    }
    for (const field of [promptM?.[1], solveM?.[1], ...choices]) {
      if (!field) continue;
      const unescaped = field.replace(/\\n/g, "\n");
      if (studentLatin(unescaped)) {
        console.error(id, "Latin in student text:", unescaped.slice(0, 80));
        errors++;
      }
    }
  }
}
console.log(errors === 0 ? "VERIFY OK" : `VERIFY FAIL ${errors}`);
process.exit(errors === 0 ? 0 : 1);
