# Algebra (جبر) Audit Report

**Date:** 2026-09-14 (full recompute pass 2)  
**Auditor stance:** Saudi Qudurat exam expert + rigorous algebra educator (accuracy first)  
**Scope:** 12 skills · `src/content/algebra/*.ts` (except `index.ts`) · 12 labs · exclusivity · س/ص vars

---

## Counts

| Metric | Value |
|--------|------:|
| Skills audited | **12** |
| Questions total | **300** (18 drill + 7 final × 12) |
| Labs audited | **12** |
| Latin in student-facing copy | **0** |
| Math audit recompute (`algebra-math-audit-run`) | **300 PASS / 0 FAIL** |
| Critical found → fixed (this pass) | **0** |
| Major found → fixed (this pass) | **3** (trap text mismatches) |
| Minor / lab UX found → fixed | **2** |
| Remaining Critical / Major | **0** |

### Per-skill bank

| Skill id | Title | Drill | Final | Lab |
|----------|-------|------:|------:|-----|
| `linear-eq` | المعادلة الخطية | 18 | 7 | LinearEqLab |
| `two-step-eq` | معادلة بخطوتين | 18 | 7 | TwoStepEqLab |
| `eval-expr` | التعويض في المقدار | 18 | 7 | EvalExprLab |
| `simplify` | تبسيط المقادير | 18 | 7 | SimplifyLab |
| `inequalities` | المتباينات | 18 | 7 | InequalitiesLab |
| `arith-seq` | المتتالية الحسابية | 18 | 7 | ArithSeqLab |
| `square-patterns` | أنماط المربعات | 18 | 7 | SquarePatternsLab |
| `ages` | مسائل الأعمار | 18 | 7 | AgesLab |
| `word-to-algebra` | ترجمة اللفظي إلى جبر | 18 | 7 | WordToAlgebraLab |
| `algebra-relations` | العلاقات النسبية الجبرية | 18 | 7 | AlgebraRelationsLab |
| `balance-sides` | الإشارة والطرفين | 18 | 7 | BalanceSidesLab |
| `check-by-sub` | التحقق بالتعويض | 18 | 7 | CheckBySubLab |

---

## Verdict

Independent recompute of all 300 keys: **no wrong answers**. High-risk spots verified again:

- **Inequalities** — integer extremes; sign flip on ÷/× by negative (`ineq-13`, `ineq-14`, `ineq-f03`, `ineq-f07`)
- **Ages** — multiples, sums, past/future systems consistent
- **Eval-expr** — س² ≠ 2س traps and keys correct
- **Square-patterns vs arith-seq** — AP only as contrast traps in squares
- **Labs** — formulas and presets match pedagogy

This pass fixed mismatched **trap explanations** (feedback describing a path to a different wrong choice) and two lab UX/pedagogy issues — not answer keys.

---

## Findings fixed (this pass)

### Major (trap ↔ choice alignment)

1. **`linear-eq/lin-01`** — traps for `5` / `11` described paths to 12 / 22.  
   **Fix:** traps now match each wrong choice (ثابت 5؛ (17+5)÷2؛ 17−5).

2. **`linear-eq/lin-02`** — trap for `3` described path to 7.  
   **Fix:** distinct paths for 3 / 7 / 15.

3. **`eval-expr/ev-04`** — trap for `11` described `= 14`.  
   **Fix:** swapped/aligned: 9+3−1=11 vs 2س trap → 14 vs 3²−1=8.

### Minor / lab UX

4. **`AgesLab`** — sum modes showed tautology `س+(مجموع−س)=مجموع`.  
   **Fix:** `أب = مجموع − س = …`.

5. **`InequalitiesLab`** — exclusive presets initialized `س` on the boundary → immediate «لا تحقّق».  
   **Fix:** `demoS()` places س inside the shaded region.

---

## Accepted conventions (not defects)

- **`ن` as sequence/square rank** in `arith-seq` / `square-patterns` (and SquarePatternsLab).
- **`أ` / `ب` / `ج`** as generic coefficients in linear-eq pedagogy.
- Square skill may mention «فرق ثابت» only as a *trap*, not as the method.
- `aseq-18`: «بعد ن أشهر» = `أ₁ + ن×د` (intentional `(ن−1)` distractor).
- `balance-sides` / `check-by-sub` / `linear-eq` may share simple equations as *vehicles*.
- `ineq-17` may distribute once while isolating س.
- `sqp-f05` uses `س` as a missing-term placeholder in a square sequence.
- Check-by-sub traps that compute LHS/RHS for a wrong candidate (and happen to mention another choice’s number as an intermediate) are **OK**.

---

## Exclusivity summary

| Boundary | Status |
|----------|--------|
| Ages patterns only in `ages` | Pass |
| متتالية حسابية / فرق ثابت only in `arith-seq` | Pass |
| مربعات 1،4،9… only in `square-patterns` | Pass |
| Inequality symbols as the skill focus only in `inequalities` | Pass |
| «بسّط» bank only in `simplify` | Pass |
| Parentheses distribute-then-solve bank in `two-step-eq` | Pass |
| Word→equation QCM in `word-to-algebra` | Pass |
| س بدلالة ص in `algebra-relations` (no simplify-first) | Pass |

---

## Labs

| Lab | Math / UX note |
|-----|----------------|
| LinearEqLab | Presets solve correctly |
| TwoStepEqLab | Distribute then verify OK |
| EvalExprLab | Correct vs س²→2س trap OK |
| SimplifyLab | Like-term merge OK |
| InequalitiesLab | Boundary + shade OK; exclusive preset demo س fixed |
| ArithSeqLab | Common difference OK |
| SquarePatternsLab | `ن×ن` grid; `ن` = rank (allowed) |
| AgesLab | Father from relation; sum equation display fixed |
| WordToAlgebraLab | Chip join OK |
| AlgebraRelationsLab | `س = k·ص + b` OK |
| BalanceSidesLab | Both-sides vs one-side trap OK |
| CheckBySubLab | Substitution uniqueness OK |

All 12 wired in `VisualRenderer.tsx`.

---

## Files changed (this pass)

1. `src/content/algebra/linear-eq.ts`
2. `src/content/algebra/eval-expr.ts`
3. `src/components/visuals/AgesLab.tsx`
4. `src/components/visuals/InequalitiesLab.tsx`
5. `scripts/audit-algebra.md`

---

## Re-verification

```text
npx tsx scripts/verify-algebra.ts     → latin_hits=0, all 12 ok
npx tsx scripts/algebra-math-audit-run.ts → PASS 300 / FAIL 0
```

**Remaining issues:** none.
