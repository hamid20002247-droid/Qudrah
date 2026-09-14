# Arithmetic (حساب) Content Audit Report

**Date:** 2026-09-14  
**Scope:** All 16 skills in `src/content/arithmetic/*.ts` (excluding `index.ts`) + matching `*Lab.tsx` visuals  
**Questions audited:** 400 (18 drill + 7 final_extra × 16)  
**Priority:** Mathematical accuracy first; then MSA / no Latin A–Z; exclusivity per `docs/SKILL_AUTHORING.md` §0 and `docs/KAMI_SKILLS_ROADMAP.md`

---

## Executive summary

| Severity | Found | Fixed in source |
|----------|------:|----------------:|
| **Critical** | **7** | **7** |
| **Major** | **4** | **4** |
| **Minor** | **9** | **1** (typo); rest documented |

**Overall verdict:** After fixes, arithmetic banks are mathematically sound for drill/final recomputation. The two highest-impact defects were (1) **multiple correct answers** in roots simplify items (unsimplified radicals equal to the keyed answer), and (2) **colliding question IDs** `rt-*` shared by `ratios` and `roots` (breaks mock uniqueness / analytics by `q.id`).

**Structure / language scan:** All 16 skills have drill=18, final_extra=7, `solve_ar` present, 4 unique choices, timing aligned. Student-facing Latin A–Z in skill copy: **0 hits**.

**Files fixed:**
- `src/content/arithmetic/roots.ts` — Critical
- `src/content/arithmetic/percent-change.ts` — Major exclusivity
- `src/content/arithmetic/gcd-lcm.ts` — Minor MSA typo

---

## Severity definitions used

- **Critical:** Wrong keyed answer, ≥2 mathematically correct choices, false mathematical statement in teaching copy/viz, or ID collision that can drop/confuse questions in shared pools.
- **Major:** Exclusivity breach (primary pattern belongs to another skill title), seriously misleading solve, or viz math that teaches the wrong rule.
- **Minor:** Typo, soft title overlap allowed by roadmap, tagging, style, non-blocking wording.

---

## Global findings

| ID | Sev | Finding | Action |
|----|-----|---------|--------|
| G1 | Critical | Question IDs `rt-01`…`rt-f07` duplicated across `ratios` and `roots` (25 IDs). Mock `buildMockSet` dedupes by `q.id`, so one skill’s items silently exclude the other. | Fixed: renamed roots → `ro-*` |
| G2 | — | Latin A–Z in student strings (skills): none | Pass |
| G3 | Minor | Soft exclusivity: map-scale / workers — **cleared in follow-up** (see Residual status) | Cleared |
| G4 | Minor | `roots` uses `sub_pattern: "number_sense"` — **intentional** (no dedicated SubPattern; see Residual status) | Documented OK |

---

## Per-skill findings

### 1. `percent-change` — التغيّر المئوي
**Lab:** `PercentChangeLab.tsx` — Δ/base vs Δ/new trap math correct; Arabic UI OK.

| Sev | Item | Notes |
|-----|------|-------|
| Major | pc-05, pc-12, pc-17, pc-f05 | Were pure «الجزء = س٪ من الكل» (percent-of). **Rewritten** to من→إلى percent-change. |
| — | Remaining 21 Qs | Recomputed OK (incl. reverse after ±٪). |
| Minor | pc-03, pc-08, pc-13… | Discount framing — **cleared in follow-up** (rewritten to من→إلى / reverse ±٪). |

**Copy:** Hook/intuition/trick MSA, math correct, exclusivity improved after rewrite.

---

### 2. `percent-of` — النسبة من العدد
**Lab:** `PercentOfLab.tsx` — OK.

| Sev | Notes |
|-----|-------|
| — | All 25 recomputed (س٪ من عدد / جزء÷كل). No Critical/Major. |

---

### 3. `successive-percent` — النسب المتتالية
**Lab:** `SuccessiveLab.tsx` — factors × sequential; net % correct (e.g. +20 then −20 → −4٪).

| Sev | Notes |
|-----|-------|
| — | All 25 recomputed (factors, reverse to original, net %). No Critical/Major. Exclusivity vs single percent-change: good. |

---

### 4. `ratios` — النسب والتناسب
**Lab:** `RatioLab.tsx` — OK.

| Sev | Notes |
|-----|-------|
| Critical | Shared IDs with roots (see G1) — fixed on roots side. |
| — | All 25 ratio-split / proportion / map scale recomputed OK. |
| Minor | Map-scale overlap with `direct-inverse`. |

---

### 5. `direct-inverse` — التناسب الطردي والعكسي
**Lab:** `DirectInverseLab.tsx` — OK.

| Sev | Notes |
|-----|-------|
| — | All 25 recomputed (direct ratio; inverse product). Conceptual items (di-06, di-12, di-17, di-f07) correct. |
| Minor | Workers/days also in `work-rate` by roadmap design. |

---

### 6. `buy-sell` — الربح والخصم
**Lab:** `BuySellLab.tsx` — profit from cost; discount from list; trap divides profit by selling price correctly shown as wrong.

| Sev | Notes |
|-----|-------|
| — | All 25 recomputed. No Critical/Major. |

---

### 7. `average` — المتوسط الحسابي
**Lab:** `AverageLab.tsx` — sum/n live update OK.

| Sev | Notes |
|-----|-------|
| — | All 25 recomputed (list mean, missing value, merge groups, add-one). No Critical/Major. |

---

### 8. `fractions` — الكسور في المسائل
**Lab:** `FractionsLab.tsx` — OK.

| Sev | Notes |
|-----|-------|
| — | All 25 recomputed (take fraction, remainder, sequential from remainder, sum of parts of whole). No Critical/Major. |

---

### 9. `compare-fractions` — مقارنة الكسور
**Lab:** `CompareFractionsLab.tsx` — OK.

| Sev | Notes |
|-----|-------|
| — | All 25 cross-products / same numerator/denominator recomputed. No Critical/Major. |

---

### 10. `rate-distance` — السرعة والمسافة والزمن
**Lab:** `RateDistanceLab.tsx` — م = س×ز OK.

| Sev | Notes |
|-----|-------|
| — | All 25 OK including unit conversion and harmonic mean (rd-16, rd-17). No Critical/Major. |

---

### 11. `work-rate` — العمل والإنجاز
**Lab:** `WorkRateLab.tsx` — OK.

| Sev | Notes |
|-----|-------|
| — | All 25 OK (worker-days + combined rates 1/أ+1/ب). No Critical/Major. |

---

### 12. `gcd-lcm` — القواسم والمضاعفات
**Lab:** `GcdLcmLab.tsx` — OK.

| Sev | Item | Notes |
|-----|------|-------|
| Minor | gl-11 | «وأخر» → «وآخر» **fixed**. |
| — | All 25 GCD/LCM contexts recomputed OK. |

---

### 13. `exponents` — الأسس والقوى
**Lab:** `ExponentsLab.tsx` — OK.

| Sev | Notes |
|-----|-------|
| — | All 25 OK (multiply/divide same base, power of power, zero/negative exponents). Notation uses `^` / أس (no Latin letters). |

---

### 14. `roots` — الجذور والتقدير
**Lab:** `RootsLab.tsx` — bounds between consecutive squares correct; Arabic UI OK.

| Sev | Item | Notes |
|-----|------|-------|
| Critical | ro-05 (was rt-05) | `√45` ≡ `3√5` → trap changed to `√40` |
| Critical | ro-09 | `√48` ≡ `4√3` → `√36` |
| Critical | ro-16 | `√175` ≡ `5√7` → `√70` |
| Critical | ro-18 | `√98` ≡ `7√2` → `√50` |
| Critical | ro-f03 | `√180` ≡ `6√5` → `√90` |
| Critical | ro-f05 | `2√12` ≡ `4√3` → `2√3` |
| Critical | IDs | Renamed `rt-*` → `ro-*` (see G1) |
| — | Remaining items | Perfect squares, between-bounds, comparisons OK |

---

### 15. `number-sense` — الحس العددي
**Lab:** `NumberSenseLab.tsx` — OK.

| Sev | Notes |
|-----|-------|
| — | All 25 OK ((ن−1)(ن+1), order of operations, nearest 10/100). No Critical/Major. |

---

### 16. `word-arith` — المسائل اللفظية الحسابية
**Lab:** `WordArithLab.tsx` — OK.

| Sev | Notes |
|-----|-------|
| — | All 25 multi-step word problems recomputed OK. |
| Minor | Light fraction («ربع») in wa-14 allowed as light mix per roadmap P2 skill. |

---

## Labs summary

| Lab | Math | Arabic UI | Issues |
|-----|------|-----------|--------|
| PercentChangeLab | Pass | Pass | — |
| PercentOfLab | Pass | Pass | — |
| SuccessiveLab | Pass | Pass | — |
| RatioLab | Pass | Pass | — |
| DirectInverseLab | Pass | Pass | — |
| BuySellLab | Pass | Pass | — |
| AverageLab | Pass | Pass | — |
| FractionsLab | Pass | Pass | — |
| CompareFractionsLab | Pass | Pass | — |
| RateDistanceLab | Pass | Pass | — |
| WorkRateLab | Pass | Pass | — |
| GcdLcmLab | Pass | Pass | — |
| ExponentsLab | Pass | Pass | — |
| RootsLab | Pass | Pass | — |
| NumberSenseLab | Pass | Pass | — |
| WordArithLab | Pass | Pass | — |

No Critical/Major lab defects requiring code changes.

---

## Fixes applied (detail)

### `roots.ts`
1. Renamed all question ids `rt-*` → `ro-*`.
2. Replaced six equivalent distractors (see table above).
3. Updated matching trap explanations.

### `percent-change.ts`
Rewrote pc-05, pc-12, pc-17, pc-f05 into من→إلى percent-change items (answers recomputed and verified).

### `gcd-lcm.ts`
Fixed «وأخر» → «وآخر» in gl-11 prompt.

---

## Counts for parent handoff

| Metric | Value |
|--------|------:|
| Critical | **7** (all fixed) |
| Major | **4** (all fixed) |
| Minor | **9** (1 fixed; 8 documented) |
| Files fixed | `roots.ts`, `percent-change.ts`, `gcd-lcm.ts` |
| Report path | `scripts/audit-arithmetic.md` |

---

## Residual status — ALL CLEARED (2026-09-14 follow-up)

| # | Residual | Resolution |
|---|----------|------------|
| 1 | Soft exclusivity: map-scale in `ratios` AND `direct-inverse` | **Cleared.** Map-scale kept only in `ratios`. Rewrote `di-02`, `di-13`, `di-f03` to non-map direct contexts (machine/print/recipe). |
| 2 | Workers/days in `direct-inverse` AND `work-rate` | **Cleared.** Worker-days kept only in `work-rate`. Rewrote `di-06`, `di-07`, `di-f02` + trick example to speed/time inverse contexts. |
| 3 | `roots.sub_pattern` | **Cleared / intentional.** No `roots` value exists in `SubPattern` (`src/lib/types.ts`). Kept `"number_sense"` (closest valid bucket). Do **not** invent patterns; `"geometry"` would be wrong. |
| 4 | percent-change vs buy-sell framing | **Cleared.** Rewrote `pc-03`, `pc-06`, `pc-08`, `pc-13` away from خصم/متجر framing into من→إلى or reverse percent-change. |
| 5 | Recompute every question | **Cleared.** Full recompute pass (`scripts/arithmetic-recompute-all.ts`); no wrong `correct_index` / multi-correct / `solve_ar` defects found beyond prior roots fixes. |
| 6 | Labs math/display | **Cleared.** No Critical/Major lab math defects. |
| 7 | Latin A–Z in student text | **Cleared.** Scan = **0** (skills + arith labs Arabic strings; template `${}` interpolations excluded). |
| 8 | Unique question IDs | **Cleared.** 400 unique IDs across all arithmetic files (`ro-*` vs `rt-*` already separated). |

**Remaining issues:** none.

### Follow-up files touched (residual clear)
- `src/content/arithmetic/direct-inverse.ts`
- `src/content/arithmetic/percent-change.ts`
- `src/content/arithmetic/compare-fractions.ts` (cf-17: removed «خريطة» wording)
- `src/content/arithmetic/exponents.ts` (ex-13: «مقياس علمي» → «تعبير علمي»)
- `scripts/arithmetic-verify-math.ts` (stale pc expected values)
- `scripts/arithmetic-recompute-all.ts` / `scripts/arithmetic-deep-verify.ts` (verify harnesses)
