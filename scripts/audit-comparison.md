# مقارنة — تدقيق شامل (Comparison Audit)

**Date:** 2026-09-14  
**Auditor:** senior Qudurat comparison pass (accuracy-first, full recompute)  
**Scope:** all 10 skills in `src/content/comparison/*.ts` (except `index.ts`) + all `Cmp*Lab.tsx`

---

## Counts

| Metric | Value |
|--------|------:|
| Skills audited | **10** |
| Questions total | **250** (18 drill + 7 final_extra × 10) |
| Labs audited | **10** |
| Math أ vs ب PASS | **250** |
| Math FAIL (wrong verdict) | **0** |
| PARSE_FAIL | **0** |
| Latin in student-facing AR | **0** |
| Unique question IDs (comparison) | **250 / 250** |
| Critical math verdict bugs | **0** |
| Remaining Critical | **0** |
| Remaining Major | **0** |
| Remaining Minor | **0** |

### Per skill (math + structure)

| Skill | Q | Math | Insuf as correct | Viz |
|-------|--:|------|-----------------:|-----|
| cmp-numbers | 25 | PASS | 2 | CmpNumbersLab |
| cmp-percent | 25 | PASS | 2 | CmpPercentLab |
| cmp-frac | 25 | PASS | 2 | CmpFracLab |
| cmp-area | 25 | PASS | 2 | CmpAreaLab |
| cmp-peri-area | 25 | PASS | 2 | CmpPeriAreaLab |
| cmp-algebra | 25 | PASS | 0 | CmpAlgebraLab |
| cmp-roots-exp | 25 | PASS | 0 | CmpRootsExpLab |
| cmp-rates | 25 | PASS | 0 | CmpRatesLab |
| cmp-means | 25 | PASS | 0 | CmpMeansLab |
| cmp-insufficient | 25 | PASS | 17 | CmpInsufficientLab |

Independent recompute: `npx tsx scripts/comparison-math-audit-run.ts` → `PASS=250 FAIL=0 PARSE=0 LATIN=0`.  
Hand-checked all rate time-phrases (ساعة ونصف / ساعتين ونصف / ساعة وربع / ثلاثة أرباع / نصف ساعة / N ساعات ونصف) — stored answers match true rates. Audit parser now prefers Arabic hour phrases before bare `في N ساعات` so `3 ساعات ونصف` is not misread as `3`.

---

## CmpInsufficientLab — `enoughAfter[]` (REQUIRED CHECK)

**Status: PASS — every scenario logically correct; no content change needed.**

| Scenario | Cards (order) | `enoughAfter` | Why |
|----------|---------------|---------------|-----|
| **ages** | مجموع 40 → أحمد أكبر من خالد → فرق 4 | `[false, true, true]` | Sum alone insufficient; explicit «أكبر من» is enough for direction → أ أكبر; card 3 only pins ages |
| **boxes** | مجموع 30 → كلاهما > 10 → لا فرق | `[false, false, false]` | Either box can still be heavier |
| **scores** | سارة 18 → نورة 16 → نفس الاختبار | `[false, true, true]` | One score insufficient; two scores decide أ أكبر |
| **speeds** | نفس المسافة → زمن مجهول → لا نسبة | `[false, false, false]` | Distance alone never decides speed |

Pedagogy lock: «أكبر من» alone = enough (ages card 2). Must NOT show «غير كافية» after that reveal. Matches content `ci-02` + intuition.

---

## Fixes this pass

### UX (Minor — reviewer confusion)

1. **CmpMeansLab** — `formatMean` no longer uses raw `toFixed(2)` (`7.50`). Now `String(Number(value.toFixed(2)))` → integers `7`, halves `7.5`, strip `.00`.
2. **CmpPercentLab** — slider fill uses `max(8px, calc(...% - 8px))` so min percent/base never looks like a broken negative width.
3. **CmpPeriAreaLab** — same padding-safe fill on length/width sliders at value `1`.

### Audit tooling

4. **comparison-math-audit-run.ts** — `hourPhrase` handles `N ساعات ونصف`; rate parsers prefer phrase time over bare `في N ساعات`.

### Already correct (verified, not re-changed)

- Unique IDs within comparison (`cal-*`, `cma-*`, `cmf-*`, `cmr-*`, …) = 250/250  
- Trap↔choice alignment for prior scrambled items (`ci-02`, `ci-06`, `cmr-08`, `cmr-f06`)  
- CmpAlgebraLab strip includes negative س  
- No Latin in student-facing Arabic (verify-comparison)

---

## Files changed (this pass)

1. `src/components/visuals/CmpMeansLab.tsx` — clean mean display  
2. `src/components/visuals/CmpPercentLab.tsx` — slider fill min  
3. `src/components/visuals/CmpPeriAreaLab.tsx` — slider fill min  
4. `scripts/comparison-math-audit-run.ts` — robust Arabic time phrases  
5. `scripts/audit-comparison.md` — this report  

**Content files:** no math/verdict/solve/trap edits required (250/250 already correct).

---

## Lab verdict logic (summary)

| Lab | Formula / rule | Verdict logic |
|-----|----------------|---------------|
| CmpNumbersLab | preset values | direct `a ? b` |
| CmpPercentLab | `p×base/100` | direct; trap UI shows %−% mistake |
| CmpFracLab | cross `nA×dB` vs `nB×dA` | correct for positive fractions |
| CmpAreaLab | `side²` vs `L×W` | correct; same-peri demo OK |
| CmpPeriAreaLab | `2(L+W)` vs `L×W` | numeric compare as intended |
| CmpAlgebraLab | `a1·س+a0` vs `b1·س+b0` | correct; includes negatives |
| CmpRootsExpLab | hardcoded √ / powers | values match |
| CmpRatesLab | dist/time or cost/qty | correct |
| CmpMeansLab | arithmetic mean | correct; display cleaned |
| CmpInsufficientLab | card reveal + `enoughAfter` | all 4 scenarios PASS |

---

## Remaining

**(empty)** — no Critical / Major / Minor items left in comparison scope.

Out of scope (catalog elsewhere): `ratios` + `roots` may still share IDs outside comparison.

---

## Method

1. Automated independent recompute of كمية أ / كمية ب (`comparison-math-audit-run.ts`).  
2. Manual recompute of all Arabic time-phrase + unit-price rate items.  
3. Comparison-internal question ID uniqueness = 250/250.  
4. Full `enoughAfter` logic check on all CmpInsufficientLab scenarios.  
5. Latin scan via `verify-comparison.ts` → 0 hits.  
6. UX fixes for means display + slider fill at min.

---

## Report path

`d:\qudurat\scripts\audit-comparison.md`
