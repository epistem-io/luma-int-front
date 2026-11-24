"use client";

import { useContext, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { GlobalContext } from "@/contexts/globalContext";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import {
  formatScore,
  formatShare,
  isSeparabilityStale,
  separabilitySets,
  separabilityVerdict,
  type SeparabilityVerdict,
} from "@/lib/predictorsApi";
import { cn } from "@/lib/utils";
import { SampleQualityResultCard } from "./SampleQualityCard";
import { sampleQualityOverallKey } from "./useSummaryLabels";
import { useStepNavigation } from "./useStepNavigation";
import { useTranslateOr } from "./useTranslateOr";

const CARD = "p-3 rounded-xl border border-neutral-400 bg-white space-y-3";
const TITLE =
  "font-aptos text-base font-semibold leading-6 text-text-icons-base-main";
const TEXT = "font-aptos text-sm font-regular leading-5 text-neutral-700";

const LEVEL_STYLE: Record<SampleQualityOverall, string> = {
  good: "text-success-700",
  med: "text-warning-700",
  poor: "text-danger-800",
};

const VERDICT: Record<
  Exclude<SeparabilityVerdict, "unknown">,
  { key: string; fallback: string; style: string }
> = {
  better: {
    key: "lulcParams.separability.verdictBetter",
    fallback: "These predictors separate your classes better.",
    style: "text-success-700",
  },
  same: {
    key: "lulcParams.separability.verdictSame",
    fallback: "These predictors make little difference.",
    style: "text-warning-700",
  },
  worse: {
    key: "lulcParams.separability.verdictWorse",
    fallback:
      "These predictors make your classes harder to separate. Try a different set.",
    style: "text-danger-800",
  },
};

// Step 4, under the predictor list: how well the training classes separate
// with the ticked predictors, against the satellite bands alone. A nudge,
// not a gate: Next works without it.
export const PredictorSeparabilityCard = () => {
  const tInteractive = useTranslations("InteractivePanel");
  const translateOr = useTranslateOr();
  const { sessionId } = useContext(GlobalContext);
  const { isViewOnly } = useStepNavigation();
  const {
    isAutoPointsFlow,
    selectedPredictors,
    predictorSeparability,
    isPredictorSeparabilityLoading,
    predictorSeparabilityError,
    checkPredictorSeparability,
  } = useContext(MapGenerationContext);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // The default classification does not use predictors.
  if (isAutoPointsFlow) return null;

  const check = () => checkPredictorSeparability(sessionId, selectedPredictors);
  const canCheck = selectedPredictors.length > 0 && !isViewOnly;

  if (isPredictorSeparabilityLoading) {
    return (
      <div className={cn(CARD, "flex flex-row items-center gap-x-3 space-y-0")}>
        <span className="loader sm"></span>
        <p className={TEXT}>
          {translateOr(
            "lulcParams.separability.loading",
            "Checking separability… this reads every predictor at your training samples.",
          )}
        </p>
      </div>
    );
  }

  if (predictorSeparabilityError !== "") {
    return (
      <div className="p-3 rounded-xl bg-danger-50 space-y-3">
        <p className="font-aptos text-base font-semibold leading-6 text-danger-800">
          {translateOr(
            "lulcParams.separability.failed",
            "The separability check failed.",
          )}
        </p>
        <p className="font-aptos text-sm font-regular leading-5 text-danger-800">
          {predictorSeparabilityError}
        </p>
        {canCheck && (
          <Button variant="outline" onClick={check}>
            {tInteractive("common.retry")}
          </Button>
        )}
      </div>
    );
  }

  if (!predictorSeparability) {
    if (isViewOnly) return null;

    return (
      <div className={CARD}>
        <p className={TITLE}>
          {translateOr(
            "lulcParams.separability.introTitle",
            "Do these predictors help?",
          )}
        </p>
        <p className={TEXT}>
          {translateOr(
            "lulcParams.separability.intro",
            "Check how well your classes separate with the ticked predictors before generating the map.",
          )}
        </p>
        <div className="flex flex-row justify-end">
          <Button variant="outline" disabled={!canCheck} onClick={check}>
            {translateOr("lulcParams.separability.check", "Check separability")}
          </Button>
        </div>
      </div>
    );
  }

  const { comparison, sample_quality: sampleQuality } = predictorSeparability;
  const { before, after } = separabilitySets(comparison);
  const verdict = separabilityVerdict(comparison.silhouette_change);
  const isStale = isSeparabilityStale(comparison, selectedPredictors);

  const scoreColumn = (
    heading: string,
    silhouette: PredictorSeparabilitySilhouette | null | undefined,
  ) => (
    <div className="flex-1 rounded-md bg-neutral-100 p-2 text-center space-y-1">
      <p className={TEXT}>{heading}</p>
      {silhouette ? (
        <p
          className={cn(
            "font-noto-sans text-2xl font-bold",
            LEVEL_STYLE[silhouette.level],
          )}
        >
          {formatScore(silhouette.overall)}{" "}
          <span className="font-aptos text-sm font-semibold">
            {tInteractive(sampleQualityOverallKey(silhouette.level))}
          </span>
        </p>
      ) : (
        <p className={TEXT}>-</p>
      )}
    </div>
  );

  return (
    <div className={CARD}>
      <p className={TITLE}>
        {translateOr("lulcParams.separability.title", "Class separability")}
      </p>

      {verdict !== "unknown" && (
        <p
          className={cn(
            "font-aptos text-sm font-semibold leading-5",
            VERDICT[verdict].style,
          )}
        >
          {translateOr(VERDICT[verdict].key, VERDICT[verdict].fallback)}
        </p>
      )}

      <div className="flex flex-row items-stretch gap-x-2">
        {scoreColumn(
          translateOr("lulcParams.separability.before", "Satellite bands only"),
          before?.silhouette,
        )}
        {scoreColumn(
          translateOr("lulcParams.separability.after", "With predictors"),
          after?.silhouette,
        )}
      </div>

      {before?.silhouette && after?.silhouette && (
        <div className="space-y-1">
          <p className={TEXT}>
            {translateOr("lulcParams.separability.hardestPair", "Hardest pair")}
            : {after.silhouette.worst_pair} (
            {formatScore(after.silhouette.min_pairwise)})
          </p>
          <p className={TEXT}>
            {translateOr(
              "lulcParams.separability.wrongSide",
              "Samples closer to another class",
            )}
            : {formatShare(before.silhouette.negative_sample_ratio)} →{" "}
            {formatShare(after.silhouette.negative_sample_ratio)}
          </p>
        </div>
      )}

      {comparison.skipped.length > 0 && (
        <p className={TEXT}>
          {translateOr("lulcParams.separability.notIncluded", "Not included")}
          :{" "}
          {comparison.skipped
            .map((item) => `${item.label} (${item.reason})`)
            .join(", ")}
        </p>
      )}

      {isStale && (
        <p className="font-aptos text-sm font-regular leading-5 text-warning-700">
          {translateOr(
            "lulcParams.separability.stale",
            "The ticked predictors changed since this check.",
          )}
        </p>
      )}

      {sampleQuality && (
        <Collapsible
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          className="space-y-2"
        >
          <CollapsibleTrigger className="flex flex-row items-center gap-x-1 cursor-pointer">
            <p className="font-aptos text-sm font-semibold leading-5 text-primary-pink">
              {translateOr("lulcParams.separability.details", "Details")}
            </p>
            <ChevronDown
              className={cn(
                "size-4 text-primary-pink transition-transform duration-200",
                isDetailsOpen && "rotate-180",
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="collapsible-content-primitive space-y-2">
            <p className={TEXT}>
              {translateOr(
                "lulcParams.separability.tdNote",
                "Mean TD always rises when bands are added, so compare the scores above instead.",
              )}
            </p>
            <SampleQualityResultCard result={sampleQuality} />
          </CollapsibleContent>
        </Collapsible>
      )}

      {canCheck && (
        <div className="flex flex-row justify-end">
          <Button variant="outline" onClick={check}>
            {translateOr("lulcParams.separability.checkAgain", "Check again")}
          </Button>
        </div>
      )}
    </div>
  );
};
