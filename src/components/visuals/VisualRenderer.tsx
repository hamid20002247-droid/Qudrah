"use client";

import type { VisualSpec } from "@/lib/types";
import { track } from "@/lib/analytics";
import { PercentChangeLab } from "./PercentChangeLab";
import { PercentOfLab } from "./PercentOfLab";
import { RatioLab } from "./RatioLab";
import { SuccessiveLab } from "./SuccessiveLab";
import { DirectInverseLab } from "./DirectInverseLab";
import { BuySellLab } from "./BuySellLab";
import { AverageLab } from "./AverageLab";
import { FractionsLab } from "./FractionsLab";
import { CompareFractionsLab } from "./CompareFractionsLab";
import { RateDistanceLab } from "./RateDistanceLab";
import { WorkRateLab } from "./WorkRateLab";
import { GcdLcmLab } from "./GcdLcmLab";
import { ExponentsLab } from "./ExponentsLab";
import { RootsLab } from "./RootsLab";
import { NumberSenseLab } from "./NumberSenseLab";
import { WordArithLab } from "./WordArithLab";
import { AnglesLab } from "./AnglesLab";
import { PerimeterLab } from "./PerimeterLab";
import { RectAreaLab } from "./RectAreaLab";
import { TriangleAreaLab } from "./TriangleAreaLab";
import { PythagorasLab } from "./PythagorasLab";
import { CircleCircLab } from "./CircleCircLab";
import { CircleAreaLab } from "./CircleAreaLab";
import { VolumeLab } from "./VolumeLab";
import { SurfaceAreaLab } from "./SurfaceAreaLab";
import { SpecialTrianglesLab } from "./SpecialTrianglesLab";
import { ParallelLinesLab } from "./ParallelLinesLab";
import { UnitsMeasureLab } from "./UnitsMeasureLab";
import { LinearEqLab } from "./LinearEqLab";
import { TwoStepEqLab } from "./TwoStepEqLab";
import { EvalExprLab } from "./EvalExprLab";
import { SimplifyLab } from "./SimplifyLab";
import { InequalitiesLab } from "./InequalitiesLab";
import { ArithSeqLab } from "./ArithSeqLab";
import { SquarePatternsLab } from "./SquarePatternsLab";
import { AgesLab } from "./AgesLab";
import { WordToAlgebraLab } from "./WordToAlgebraLab";
import { AlgebraRelationsLab } from "./AlgebraRelationsLab";
import { BalanceSidesLab } from "./BalanceSidesLab";
import { CheckBySubLab } from "./CheckBySubLab";
import { MeanListLab } from "./MeanListLab";
import { MeanMissingLab } from "./MeanMissingLab";
import { MedianLab } from "./MedianLab";
import { ModeLab } from "./ModeLab";
import { RangeLab } from "./RangeLab";
import { TablesLab } from "./TablesLab";
import { ChartsLab } from "./ChartsLab";
import { ProbSimpleLab } from "./ProbSimpleLab";
import { ProbWithoutReplaceLab } from "./ProbWithoutReplaceLab";
import { DataPercentLab } from "./DataPercentLab";
import { CmpNumbersLab } from "./CmpNumbersLab";
import { CmpPercentLab } from "./CmpPercentLab";
import { CmpFracLab } from "./CmpFracLab";
import { CmpAreaLab } from "./CmpAreaLab";
import { CmpPeriAreaLab } from "./CmpPeriAreaLab";
import { CmpAlgebraLab } from "./CmpAlgebraLab";
import { CmpRootsExpLab } from "./CmpRootsExpLab";
import { CmpRatesLab } from "./CmpRatesLab";
import { CmpMeansLab } from "./CmpMeansLab";
import { CmpInsufficientLab } from "./CmpInsufficientLab";

type Props = {
  spec: VisualSpec;
  skillId?: string;
  onInteract?: () => void;
  compact?: boolean;
  autoDemo?: boolean;
};

export function VisualRenderer({
  spec,
  skillId,
  onInteract,
  compact,
  autoDemo,
}: Props) {
  const fire = () => {
    onInteract?.();
    if (skillId) track("visual_interacted", { skill_id: skillId });
  };

  if (spec.kind === "custom") {
    switch (spec.component) {
      case "percent-change-lab":
        return (
          <PercentChangeLab
            onInteract={fire}
            compact={compact}
            autoDemo={autoDemo}
          />
        );
      case "percent-of-lab":
        return (
          <PercentOfLab
            onInteract={fire}
            compact={compact}
            autoDemo={autoDemo}
          />
        );
      case "ratio-lab":
        return <RatioLab onInteract={fire} compact={compact} />;
      case "successive-lab":
        return (
          <SuccessiveLab
            onInteract={fire}
            compact={compact}
            autoDemo={autoDemo}
          />
        );
      case "direct-inverse-lab":
        return <DirectInverseLab onInteract={fire} compact={compact} />;
      case "buy-sell-lab":
        return <BuySellLab onInteract={fire} compact={compact} />;
      case "average-lab":
        return <AverageLab onInteract={fire} compact={compact} />;
      case "fractions-lab":
        return <FractionsLab onInteract={fire} compact={compact} />;
      case "compare-fractions-lab":
        return <CompareFractionsLab onInteract={fire} compact={compact} />;
      case "rate-distance-lab":
        return <RateDistanceLab onInteract={fire} compact={compact} />;
      case "work-rate-lab":
        return <WorkRateLab onInteract={fire} compact={compact} />;
      case "gcd-lcm-lab":
        return <GcdLcmLab onInteract={fire} compact={compact} />;
      case "exponents-lab":
        return <ExponentsLab onInteract={fire} compact={compact} />;
      case "roots-lab":
        return <RootsLab onInteract={fire} compact={compact} />;
      case "number-sense-lab":
        return <NumberSenseLab onInteract={fire} compact={compact} />;
      case "word-arith-lab":
        return <WordArithLab onInteract={fire} compact={compact} />;
      case "angles-lab":
        return <AnglesLab onInteract={fire} compact={compact} />;
      case "perimeter-lab":
        return <PerimeterLab onInteract={fire} compact={compact} />;
      case "rect-area-lab":
        return <RectAreaLab onInteract={fire} compact={compact} />;
      case "triangle-area-lab":
        return <TriangleAreaLab onInteract={fire} compact={compact} />;
      case "pythagoras-lab":
        return (
          <PythagorasLab
            onInteract={fire}
            compact={compact}
            autoDemo={autoDemo}
          />
        );
      case "circle-circ-lab":
        return <CircleCircLab onInteract={fire} compact={compact} />;
      case "circle-area-lab":
        return (
          <CircleAreaLab
            onInteract={fire}
            compact={compact}
            autoDemo={autoDemo}
          />
        );
      case "volume-lab":
        return <VolumeLab onInteract={fire} compact={compact} />;
      case "surface-area-lab":
        return <SurfaceAreaLab onInteract={fire} compact={compact} />;
      case "special-triangles-lab":
        return <SpecialTrianglesLab onInteract={fire} compact={compact} />;
      case "parallel-lines-lab":
        return <ParallelLinesLab onInteract={fire} compact={compact} />;
      case "units-measure-lab":
        return <UnitsMeasureLab onInteract={fire} compact={compact} />;
      case "linear-eq-lab":
        return <LinearEqLab onInteract={fire} compact={compact} />;
      case "two-step-eq-lab":
        return <TwoStepEqLab onInteract={fire} compact={compact} />;
      case "eval-expr-lab":
        return <EvalExprLab onInteract={fire} compact={compact} />;
      case "simplify-lab":
        return <SimplifyLab onInteract={fire} compact={compact} />;
      case "inequalities-lab":
        return <InequalitiesLab onInteract={fire} compact={compact} />;
      case "arith-seq-lab":
        return <ArithSeqLab onInteract={fire} compact={compact} />;
      case "square-patterns-lab":
        return <SquarePatternsLab onInteract={fire} compact={compact} />;
      case "ages-lab":
        return <AgesLab onInteract={fire} compact={compact} />;
      case "word-to-algebra-lab":
        return <WordToAlgebraLab onInteract={fire} compact={compact} />;
      case "algebra-relations-lab":
        return <AlgebraRelationsLab onInteract={fire} compact={compact} />;
      case "balance-sides-lab":
        return <BalanceSidesLab onInteract={fire} compact={compact} />;
      case "check-by-sub-lab":
        return <CheckBySubLab onInteract={fire} compact={compact} />;
      case "mean-list-lab":
        return <MeanListLab onInteract={fire} compact={compact} />;
      case "mean-missing-lab":
        return <MeanMissingLab onInteract={fire} compact={compact} />;
      case "median-lab":
        return <MedianLab onInteract={fire} compact={compact} />;
      case "mode-lab":
        return <ModeLab onInteract={fire} compact={compact} />;
      case "range-lab":
        return <RangeLab onInteract={fire} compact={compact} />;
      case "tables-lab":
        return <TablesLab onInteract={fire} compact={compact} />;
      case "charts-lab":
        return <ChartsLab onInteract={fire} compact={compact} />;
      case "prob-simple-lab":
        return <ProbSimpleLab onInteract={fire} compact={compact} />;
      case "prob-without-replace-lab":
        return <ProbWithoutReplaceLab onInteract={fire} compact={compact} />;
      case "data-percent-lab":
        return <DataPercentLab onInteract={fire} compact={compact} />;
      case "cmp-numbers-lab":
        return <CmpNumbersLab onInteract={fire} compact={compact} />;
      case "cmp-percent-lab":
        return <CmpPercentLab onInteract={fire} compact={compact} />;
      case "cmp-frac-lab":
        return (
          <CmpFracLab
            onInteract={fire}
            compact={compact}
            autoDemo={autoDemo}
          />
        );
      case "cmp-area-lab":
        return (
          <CmpAreaLab
            onInteract={fire}
            compact={compact}
            autoDemo={autoDemo}
          />
        );
      case "cmp-peri-area-lab":
        return <CmpPeriAreaLab onInteract={fire} compact={compact} />;
      case "cmp-algebra-lab":
        return <CmpAlgebraLab onInteract={fire} compact={compact} />;
      case "cmp-roots-exp-lab":
        return <CmpRootsExpLab onInteract={fire} compact={compact} />;
      case "cmp-rates-lab":
        return <CmpRatesLab onInteract={fire} compact={compact} />;
      case "cmp-means-lab":
        return <CmpMeansLab onInteract={fire} compact={compact} />;
      case "cmp-insufficient-lab":
        return <CmpInsufficientLab onInteract={fire} compact={compact} />;
      default:
        return null;
    }
  }

  if (spec.kind === "percent_bar") {
    return <PercentChangeLab onInteract={fire} compact={compact} />;
  }
  if (spec.kind === "ratio_split") {
    return <RatioLab onInteract={fire} compact={compact} />;
  }
  if (spec.kind === "successive_percent") {
    return <SuccessiveLab onInteract={fire} compact={compact} />;
  }
  if (spec.kind === "weighted_avg") {
    return <AverageLab onInteract={fire} compact={compact} />;
  }
  if (spec.kind === "buy_sell") {
    return <BuySellLab onInteract={fire} compact={compact} />;
  }
  if (spec.kind === "fraction_bars") {
    return <FractionsLab onInteract={fire} compact={compact} />;
  }
  if (spec.kind === "rate_work") {
    return <RateDistanceLab onInteract={fire} compact={compact} />;
  }

  return (
    <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">
      التصوّر غير متاح لهذه المهارة في النسخة الحالية.
    </div>
  );
}
