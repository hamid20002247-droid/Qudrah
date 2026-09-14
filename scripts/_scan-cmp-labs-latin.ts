import fs from "fs";

const files = [
  "src/components/visuals/CmpNumbersLab.tsx",
  "src/components/visuals/CmpPercentLab.tsx",
  "src/components/visuals/CmpFracLab.tsx",
  "src/components/visuals/CmpAreaLab.tsx",
  "src/components/visuals/CmpPeriAreaLab.tsx",
];

const skip =
  /className|import |from |use[A-Z]|function |const |type |return |dir=|aria-|role=|style=|key=|on[A-Z]|compact|Props|Fraction|PRESETS|Machine|Meter|Dim|Column|Stepper|fill=|stroke|viewBox|width=|height=|rx=|svg|button|span|div|p>|label|tone|active|idle|valueColor|which|clientX|setPointer|preventDefault|releasePointer|Math\.|React\.|useState|useRef|useCallback|export |"use client"|tabular-nums|pointer|touch-none|select-none|overflow|rounded|absolute|relative|inset|flex|grid|items-|justify-|gap-|mt-|mb-|px-|py-|min-h|text-|bg-|ring-|from-|to-|white|slate|indigo|teal|violet|cyan|amber|orange|fuchsia|sky|rose|ink|w-full|h-|sm:|transition/;

let hits = 0;
for (const f of files) {
  const lines = fs.readFileSync(f, "utf8").split(/\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (skip.test(line)) continue;
    if (/[A-Za-z]/.test(line) && /[\u0600-\u06FF]/.test(line)) {
      console.log(`${f}:${i + 1}: ${line.trim()}`);
      hits++;
    }
  }
}
console.log(hits === 0 ? "LABS_AR_OK" : `LABS_HITS=${hits}`);
