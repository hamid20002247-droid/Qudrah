# Geometry Skills Audit — هندسة

**Date:** 2026-09-14 (pass 2 — exclusivity clear)  
**Auditor:** senior Qudurat + rigorous geometry pass  
**Scope:** 12 skills × (18 drill + 7 final_extra) = **300 questions**  
**Paths:** `src/content/geometry/*.ts` (except `index.ts`) + matching labs in `src/components/visuals/*Lab.tsx`

Skills: `angles`, `perimeter`, `rect-area`, `triangle-area`, `pythagoras`, `circle-circ`, `circle-area`, `volume`, `surface-area`, `special-triangles`, `parallel-lines`, `units-measure`

---

## Counts

| Metric | Count |
|--------|------:|
| Skills audited | 12 |
| Questions (drill + final_extra) | 300 |
| Independent recompute PASS | **300 / 300** |
| Critical found (all-time) | 1 |
| Major found (all-time) | 3 + exclusivity rewrite |
| Remaining Critical/Major | **0** |
| Remaining Minor / Info residuals | **0 (cleared)** |
| Unique IDs | 300 unique |
| Latin / `π` in student-facing text | **0** |

### Per-skill question counts

| Skill | Drill | Final | Total | Verdict |
|-------|------:|------:|------:|---------|
| angles | 18 | 7 | 25 | Pass |
| perimeter | 18 | 7 | 25 | Pass |
| rect-area | 18 | 7 | 25 | Pass |
| triangle-area | 18 | 7 | 25 | Pass |
| pythagoras | 18 | 7 | 25 | Pass (345 exclusivity cleared) |
| circle-circ | 18 | 7 | 25 | Pass |
| circle-area | 18 | 7 | 25 | Pass |
| volume | 18 | 7 | 25 | Pass |
| surface-area | 18 | 7 | 25 | Pass |
| special-triangles | 18 | 7 | 25 | Pass |
| parallel-lines | 18 | 7 | 25 | Pass |
| units-measure | 18 | 7 | 25 | Pass |

---

## Files changed (this pass)

1. `src/content/geometry/pythagoras.ts` — replaced all 3-4-5-family bank items with non-345 integer triples (or √2 forms); `py-14` answer is now 5-12-13; trick example → 5 و 12
2. `scripts/geometry-math-audit-run.ts` — EXPECTED answers updated for rewritten Pythagoras items
3. `scripts/audit-geometry.md` — residuals cleared
4. `scripts/_geo-strict-verify.ts` — strict 300/300 + 345 exclusivity checker (no noisy solve-last-number FAILs)

### Prior pass (still applied)

1. `pythagoras/py-11` — dual-correct radical trap → `√1056`
2. `rect-area/ra-14` — exclusivity (asked perimeter → ask width)
3. `surface-area/sa-17` — numeric SA vs volume comparison wording
4. `PythagorasLab` — non-345 presets; `maxLeg` 25
5. `SpecialTrianglesLab` — 4:3 drawing with ٤ك on longer base

---

## Pythagoras exclusivity rewrite (was Info residual → cleared)

| ID | Was (345-family) | Now (non-345) |
|----|------------------|---------------|
| trick example | 6-8-10 | 5-12-13 |
| py-01 | 6-8-10 | 7-24-25 |
| py-04 | 9-12-15 | 20-21-29 |
| py-06 | 9-12-15 | 9-40-41 |
| py-07 | 6-8-10 | 12-35-37 (find leg) |
| py-09 | 3-4-5 | 8-15-17 (find leg) |
| py-14 | recognize 9-12-15 | recognize **5-12-13** via a²+b² |
| py-17 | 24-32-40 | 16-63-65 |
| py-f01 | 2-1.5-2.5 (=½×345) | 2.5-6-6.5 (=½×5-12-13) |
| py-f02 | 9-12-15 | 9-40-41 (find leg) |
| py-f07 | 18-24-30 | 20-48-52 (=4×5-12-13) |

All remaining Pythagoras items use **a²+b²=c²** with non-345 triples (5-12-13 family, 8-15-17, 7-24-25, 20-21-29, 12-35-37, 9-40-41, 16-63-65, √2). Recognition of مضاعف ٣-٤-٥ stays in `special-triangles` only.

---

## Checks that passed

### Formulas

| Skill | Formula check |
|-------|----------------|
| triangle-area | نصف × ق × ع; trap “نسيان النصف” |
| circle-circ | 2×باي×ر / باي×قطر; **باي** not π |
| circle-area | باي×ر²; diameter→ر÷2; diameter-as-ر trap = 4× |
| volume | ض³ / ط×ع×ا; SA only as trap |
| surface-area | 6ض² / 2(ط ع+ط ا+ع ا); volume as trap / recover edge |
| units-measure | م↔سم ×100; م²↔سم² ×**10000**; um-07 / um-17 / um-f07 |
| angles | متممة 90 / متكاملة 180 / مثلث 180 |
| perimeter | 4ض / 2(ط+ع) |
| rect-area | ط×ع / ض² |
| pythagoras | وتر² = ض²+ض²; full recompute of rewritten bank |
| special-triangles | scale of 3-4-5 only; 5-12-13 correctly “ليس مضاعف ٣-٤-٥” |
| parallel-lines | متناظرة/متبادلة = ; متحالفة → 180− |

### Exclusivity matrix

| Boundary | Status |
|----------|--------|
| pythagoras ↔ special-triangles | **Cleared** — no 345-family triples left in Pythagoras bank |
| circle-circ ↔ circle-area | No primary ask crossing |
| volume ↔ surface-area | No primary ask crossing |
| perimeter ↔ rect-area | `ra-14` fixed |
| triangle-area ↔ pythagoras | No وتر/فيثاغورس in triangle-area |
| angles ↔ parallel-lines | Separated |

### Diameter ≠ radius / ½ / cm²↔m² / باي

- Circle skills + labs: diameter→÷2; wrong-as-diameter demos (circ ~2×, area ~4×); UI uses **باي**
- Triangle lab + copy: halves stressed
- Units: area factor **10000**; length **100**

---

## Minor / Info residuals

**(none — cleared)**

---

## Labs summary

| Lab | Result |
|-----|--------|
| AnglesLab | Pass |
| PerimeterLab | Pass |
| RectAreaLab | Pass |
| TriangleAreaLab | Pass (½ + trap) |
| PythagorasLab | Pass (non-345 presets) |
| CircleCircLab | Pass (باي + diameter trap) |
| CircleAreaLab | Pass (باي + 4× trap) |
| VolumeLab | Pass |
| SurfaceAreaLab | Pass |
| SpecialTrianglesLab | Pass (4:3 / ٤ك base) |
| ParallelLinesLab | Pass |
| UnitsMeasureLab | Pass (×100 / ×10000 / ×1e6) |

---

## Verification commands

```bash
npx tsx scripts/_geo-strict-verify.ts    # expect PASS 300/300, 345 notes none
npx tsx scripts/verify-geometry.ts       # latin_hits=0
npx tsx scripts/geometry-math-audit-run.ts  # may still show noisy false positives — prefer strict verify
```

---

*Report path: `scripts/audit-geometry.md`*
