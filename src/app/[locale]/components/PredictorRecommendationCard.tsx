"use client";

import { useContext } from "react";
import { Button } from "@/components/ui/button";
import { GlobalContext } from "@/contexts/globalContext";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import {
  isRecommendationSelected,
  lowSampleCount,
  predictorLabels,
  recommendedAvailableIds,
} from "@/lib/predictorsApi";
import { PredictorChips } from "./SummaryField";
import { useStepNavigation } from "./useStepNavigation";
import { useTranslateOr } from "./useTranslateOr";

// What the card says while each backend process is running.
const ACTIVITY: Record<string, { key: string; fallback: string }> = {
  "compute predictors": {
    key: "lulcParams.optimizer.stepCompute",
    fallback: "Computing the candidate predictors…",
  },
  "sample training data": {
    key: "lulcParams.optimizer.stepSample",
    fallback: "Reading them at your training samples…",
  },
  "select predictors": {
    key: "lulcParams.optimizer.stepSelect",
    fallback: "Comparing predictors…",
  },
};
const DEFAULT_ACTIVITY = {
  key: "lulcParams.optimizer.stepPrepare",
  fallback: "Preparing…",
};

const CARD = "p-3 rounded-xl border border-neutral-400 bg-white space-y-3";
const TITLE =
  "font-aptos text-base font-semibold leading-6 text-text-icons-base-main";
const TEXT = "font-aptos text-sm font-regular leading-5 text-neutral-700";

// Top of step 4's predictor section: the predictor optimizer's progress,
// then its recommendation. The run itself lives in MapGenerationContext.
export const PredictorRecommendationCard = () => {
  const translateOr = useTranslateOr();
  const { sessionId } = useContext(GlobalContext);
  const { isViewOnly } = useStepNavigation();
  const {
    isAutoPointsFlow,
    selectedPredictors,
    predictorListing,
    predictorRecommendation,
    predictorOptimizerStatus,
    predictorOptimizerProgress,
    predictorOptimizerError,
    startPredictorOptimizer,
    applyPredictorRecommendation,
  } = useContext(MapGenerationContext);

  // The default classification does not use predictors.
  if (isAutoPointsFlow) return null;

  if (predictorOptimizerStatus === "running") {
    const progress = predictorOptimizerProgress;
    const percent =
      progress && progress.total > 0
        ? Math.min(100, Math.round((progress.done / progress.total) * 100))
        : 0;
    const activity = ACTIVITY[progress?.process ?? ""] ?? DEFAULT_ACTIVITY;

    return (
      <div className={CARD}>
        <div className="flex flex-row items-center gap-x-3">
          <span className="loader sm"></span>
          <p className={TITLE}>
            {translateOr(
              "lulcParams.optimizer.runningTitle",
              "Finding the best predictors for your samples",
            )}
          </p>
        </div>
        <div className="space-y-1.5">
          <div className="flex flex-row justify-between gap-x-3">
            <p className={TEXT}>
              {translateOr(activity.key, activity.fallback)}
            </p>
            <p className={TEXT}>{percent}%</p>
          </div>
          <div
            className="h-1.5 w-full rounded-full bg-primary-pink/20"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
          >
            <div
              className="h-full rounded-full bg-primary-pink transition-[width] duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
        <p className={TEXT}>
          {translateOr(
            "lulcParams.optimizer.keepChoosing",
            "You can keep choosing predictors meanwhile.",
          )}
        </p>
      </div>
    );
  }

  const runAgainButton = !isViewOnly && (
    <Button
      variant="outline"
      onClick={() => startPredictorOptimizer(sessionId)}
    >
      {translateOr("lulcParams.optimizer.runAgain", "Run again")}
    </Button>
  );

  if (predictorOptimizerStatus === "error") {
    return (
      <div className="p-3 rounded-xl bg-danger-50 space-y-3">
        <p className="font-aptos text-base font-semibold leading-6 text-danger-800">
          {translateOr(
            "lulcParams.optimizer.failed",
            "The recommendation could not be computed.",
          )}
        </p>
        {predictorOptimizerError !== "" && (
          <p className="font-aptos text-sm font-regular leading-5 text-danger-800">
            {predictorOptimizerError}
          </p>
        )}
        {runAgainButton}
      </div>
    );
  }

  if (!predictorRecommendation) return null;

  const recommendedIds = recommendedAvailableIds(
    predictorRecommendation,
    predictorListing,
  );
  const isSelected = isRecommendationSelected(recommendedIds, selectedPredictors);
  // Few samples make the ranking unreliable: say so next to the result.
  const fewSamples = lowSampleCount(predictorRecommendation);

  return (
    <div className={CARD}>
      <p className={TITLE}>
        {translateOr(
          "lulcParams.optimizer.title",
          "Recommended for your samples",
        )}
      </p>

      {recommendedIds.length > 0 ? (
        <PredictorChips
          labels={predictorLabels(recommendedIds, predictorListing)}
        />
      ) : (
        <p className={TEXT}>
          {translateOr(
            "lulcParams.optimizer.none",
            "No extra predictor improved on the satellite bands.",
          )}
        </p>
      )}

      {predictorRecommendation.stale && (
        <p className="font-aptos text-sm font-regular leading-5 text-warning-700">
          {translateOr(
            "lulcParams.optimizer.stale",
            "Your imagery or samples changed since this was computed.",
          )}
        </p>
      )}

      {fewSamples !== null && recommendedIds.length > 0 && (
        <p className="font-aptos text-sm font-regular leading-5 text-warning-700">
          {translateOr(
            "lulcParams.optimizer.fewSamples",
            "Based on few samples: the smallest class has only {count}. Treat this as a suggestion.",
            { count: fewSamples },
          )}
        </p>
      )}

      <div className="flex flex-row flex-wrap items-center justify-between gap-2">
        {isSelected ? (
          <p className={TEXT}>
            {translateOr(
              "lulcParams.optimizer.selectedForYou",
              "Selected for you.",
            )}
          </p>
        ) : (
          recommendedIds.length > 0 &&
          !isViewOnly && (
            <Button variant="outline" onClick={applyPredictorRecommendation}>
              {translateOr(
                "lulcParams.optimizer.useRecommended",
                "Use recommended",
              )}
            </Button>
          )
        )}
        {runAgainButton}
      </div>
    </div>
  );
};
