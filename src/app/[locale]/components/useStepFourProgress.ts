import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { stepFourProgress, stepFourScoreState } from "@/lib/predictorsApi";
import { useContext } from "react";

/**
 * Step 4's three cards (predictors, their score, the model settings): which
 * are ticked, and whether Next may be pressed. Shared by the cards and the
 * footer so they cannot disagree.
 */
export const useStepFourProgress = () => {
  const {
    isAutoPointsFlow,
    selectedPredictors,
    predictorSeparability,
    isPredictorSeparabilityLoading,
    predictorSeparabilityError,
    isPredictorSelectionSet,
    isPredictorQualityAccepted,
    isModelSettingsSet,
  } = useContext(MapGenerationContext);

  const scoreState = stepFourScoreState({
    isLoading: isPredictorSeparabilityLoading,
    error: predictorSeparabilityError,
    check: predictorSeparability,
    selected: selectedPredictors,
  });

  return {
    scoreState,
    ...stepFourProgress({
      isAutoPointsFlow,
      isSelectionSet: isPredictorSelectionSet,
      selected: selectedPredictors,
      isQualityAccepted: isPredictorQualityAccepted,
      scoreState,
      isModelSet: isModelSettingsSet,
    }),
  };
};
