# Statistics skills audit — إحصاء واحتمالات

**Date:** 2026-09-14 (re-audit + minors closed)  
**Scope:** `src/content/statistics/*.ts` (except `index.ts`) + matching labs under `src/components/visuals/`  
**Auditor stance:** Saudi Qudurat quantitative + statistics/probability educator; accuracy first.

---

## Counts

| Metric | Value |
|--------|------:|
| Skills | **10** |
| Questions (drill + final_extra) | **250** |
| Per skill | **18 drill + 7 final_extra = 25** |
| Math recompute PASS | **250 / 250** |
| Choice exclusivity failures | **0** |
| Latin `P(` / A–Z in student-facing Arabic | **0** |
| Critical found | **0** |
| Major found (previously fixed) | **2** |
| Minor found (fixed this pass) | **2** |
| Remaining open | **0** |

### Per-skill question counts

| Skill | id | Q | Math | Exclusivity | Latin |
|-------|-----|--:|:----:|:-----------:|:-----:|
| المتوسط من قائمة | `mean-list` | 25 | ✓ | ✓ | ✓ |
| العدد الناقص من المتوسط | `mean-missing` | 25 | ✓ | ✓ | ✓ |
| الوسيط | `median` | 25 | ✓ | ✓ | ✓ |
| المنوال | `mode` | 25 | ✓ | ✓ | ✓ |
| المدى | `range` | 25 | ✓ | ✓ | ✓ |
| قراءة الجداول | `tables` | 25 | ✓ | ✓ | ✓ |
| قراءة الرسوم | `charts` | 25 | ✓ | ✓ | ✓ |
| الاحتمال البسيط | `prob-simple` | 25 | ✓ | ✓ | ✓ |
| احتمال بلا إرجاع | `prob-without-replace` | 25 | ✓ | ✓ | ✓ |
| نسب من بيانات | `data-percent` | 25 | ✓ | ✓ | ✓ |

---

## Labs (verified)

| Lab | Check | Result |
|-----|--------|--------|
| `MedianLab` | Odd → single middle; even → mean of two middles; bank 13 odd / 12 even | **PASS** |
| `ProbWithoutReplaceLab` | After draw: color −1 and total −1; trap “بإرجاع” keeps old denominator | **PASS** |
| `DataPercentLab` | فئة ÷ مجموع × 100; presets match bank | **PASS** |
| `MeanListLab` | sum ÷ count live | **PASS** |
| `MeanMissingLab` | missing / added modes; target mean match | **PASS** |
| `ModeLab` | max frequency; **tie lists values** (e.g. منوالان: 3 و 5) | **PASS** |
| `RangeLab` | max − min | **PASS** |
| `ProbSimpleLab` | مطلوب ÷ كلي with simplify | **PASS** |
| `TablesLab` / `ChartsLab` | Arabic UI; day labels full names | **PASS** |

---

## Targeted verifications

### Median (even / odd)

- Independent recompute on all 25: **PASS**
- Spot-check even lists (`md-02` … `md-f06`): mid-pair mean correct (incl. 5.5, 37.5)
- Odd lists: single middle after sort

### Without-replace denominators

- All 25 `pwr-*` solves rechecked: first fraction uses original total; second uses **n−1** (and color −1 when same color)
- Conditional second-draw items use updated totals (e.g. `pwr-03` → 2/5 not 3/6)
- Impossible case `pwr-04` (زرقاوين with one blue) → 0

### Data-percent

- All 25: category ÷ total × 100 matches `correct_index`
- No equivalent % / fraction choice pairs in the same question

### Latin / `P()`

- Student-facing strings: **no A–Z**, **no `P(`**
- Probability phrased as Arabic «الاحتمال = …» with digit fractions (`3/8`)

---

## Findings fixed

### Major 1 — `mean-list` / `ml-05` (impossible die faces) — prior pass

- Context changed from نرد to جولات نقاط (mean still 6).

### Major 2 — `prob-without-replace` / `pwr-13` (wrong trap) — prior pass

- Trap for `2/5` explains conditional path confusion, not a false “same as correct” claim.

### Minor 1 — Charts day abbreviations — **fixed this pass**

- «إثن / ثلاث / أربع» → «الإثنين / الثلاثاء / الأربعاء» (and السبت / الأحد) in bank + `ChartsLab` preset.
- Touched: `cht-01`, `cht-03`, `cht-08`, `cht-14`, `cht-f07`, trick example, lab مبيعات preset.

### Minor 2 — `ModeLab` bimodal wording — **fixed this pass**

- Was: «أكثر من منوال (تعادل في التكرار)»
- Now: «منوالان: 3 و 5» / «مناويل: …» listing tied values; multimodal bars highlighted.

---

## Remaining

_(empty)_

---

## Skill-boundary notes (OK)

| Skill teaches | Does not teach |
|---------------|----------------|
| `mean-list` | missing/added value (`mean-missing`) |
| `mean-missing` | plain list mean only |
| `median` | mean / mode / range as primary |
| `mode` | includes bimodal wording item (`mo-f05`) — in-skill |
| `range` | sort-for-median |
| `tables` | percent-of-total (`data-percent`) |
| `charts` | percent-of-slice as % skill |
| `prob-simple` | without-replace / two draws |
| `prob-without-replace` | single-draw only |
| `data-percent` | row/column lookup without % |

---

## Files changed (this pass)

1. `src/content/statistics/charts.ts` — full weekday names
2. `src/components/visuals/ChartsLab.tsx` — مبيعات day labels
3. `src/components/visuals/ModeLab.tsx` — tie shows values; highlight all modes
4. `scripts/audit-statistics.md` — this report

Prior majors (already in tree): `mean-list.ts`, `prob-without-replace.ts`

---

## Verification commands

- `npx tsx scripts/statistics-math-audit-run.ts` → **PASS 250 / FAIL 0**
- `npx tsx scripts/_stats-deep-verify.ts` → **PASS 250**; Latin 0; META 0
- `npx tsx scripts/_stats-exclusivity.ts` → **EQUIV_PAIRS 0**; median even OK; without-replace solves OK
- `npx tsx scripts/verify-statistics.ts` → **latin_hits=0**; all 10 live; 18+7 each

---

## Verdict

**ZERO errors remaining** for all 10 إحصاء skills (250 questions + labs). Minors closed. Report path: `scripts/audit-statistics.md`.
