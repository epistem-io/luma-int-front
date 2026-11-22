"use client";

import { PANEL_COMPONENT_KEY } from "@/constants";
import { MapContext } from "@/contexts/mapContext";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { useIsSavingTransitionPending } from "@/lib/hooks";
import { panelToWizardStep } from "@/lib/sessionCheckpoint";
import { canSkipClassSubmit, getConfirmedClasses } from "@/lib/lucFlow";
import {
  canJumpForward,
  canJumpToStep,
  getDirtySteps,
  getFilledSteps,
  getStepTarget,
  isNavigationBusy,
  isViewOnly as getIsViewOnly,
  MAP_PROGRESS_INDEX,
  type WizardStep,
} from "@/lib/stepRules";
import { useContext } from "react";

// The one place that moves between steps, so the step bar and every Back
// button behave the same (panel, progress index, sample-point visibility).
export const useStepNavigation = () => {
  const {
    stepKey,
    setStepKey,
    progressPanelIndex,
    setProgressPanelIndex,
    isLUCLoading,
    isUploadingTrainingFile,
    isUpdatingTrainingData,
    isSampleQualityLoading,
    isMapGenerationLoading,
    furthestProgressIndex,
    isBasicInformationChangeInput,
    lucQuickPhase,
    lucDefaultConfirmed,
    lucSource,
    defaultArray,
    lucQuickRows,
    classArray,
    isTrainingDataChanged,
    uploadedFilesArray,
  } = useContext(MapGenerationContext);
  const { markerVectorLayer, isPreviewingMosaic, markerArray } =
    useContext(MapContext);
  const isSavingTransition = useIsSavingTransitionPending();

  const isMapFlow = progressPanelIndex >= MAP_PROGRESS_INDEX;
  const isViewOnly = getIsViewOnly(progressPanelIndex, stepKey);
  // While browsing from Your Map the viewed step is "current"; otherwise
  // the step the user is working on.
  const activeStepIndex = isViewOnly
    ? panelToWizardStep(stepKey) - 1
    : progressPanelIndex;
  const isBusy = isNavigationBusy({
    isLUCLoading,
    isUploadingTrainingFile,
    isUpdatingTrainingData,
    isSampleQualityLoading,
    isMapGenerationLoading,
    isSavingTransition,
    stepKey,
  });

  // Forward jumps (to a step already reached) must not skip work that only
  // a step's Next does, so every step they pass has to be saved.
  const isStep2Confirmed = lucQuickPhase === "confirmed" || lucDefaultConfirmed;
  const hasSamples = markerArray.length > 0 || uploadedFilesArray.length > 0;
  const dirtySteps = getDirtySteps({
    stepKey,
    isPreviewingMosaic,
    isBasicInformationChangeInput,
    isStep2Confirmed,
    classesMatchSubmitted: canSkipClassSubmit(
      getConfirmedClasses({ lucSource, defaultArray, lucQuickRows }),
      classArray,
    ),
    isTrainingDataChanged,
    hasSamples,
  });
  const filledSteps = getFilledSteps({
    furthestProgressIndex,
    isStep2Confirmed,
    hasSamples,
  });

  const canJumpTo = (step: WizardStep) =>
    !isBusy &&
    step - 1 !== activeStepIndex &&
    (canJumpToStep(step, progressPanelIndex) ||
      canJumpForward({
        step,
        progressPanelIndex,
        furthestProgressIndex,
        dirtySteps,
      }));

  // Sample points are hidden by default; the step 3 summary shows them
  // again itself (except in view-only mode, where the map stays as is).
  const goToStep = (step: WizardStep) => {
    const target = getStepTarget(step);
    markerVectorLayer?.setOpacity(0);
    // Browsing from Your Map keeps the map's progress so it stays view-only.
    if (!isMapFlow) setProgressPanelIndex(target.progressPanelIndex);
    setStepKey(target.stepKey);
  };

  const goToYourMap = () => {
    markerVectorLayer?.setOpacity(0);
    setStepKey(PANEL_COMPONENT_KEY.YOUR_MAP);
  };

  return {
    isViewOnly,
    activeStepIndex,
    filledSteps,
    isBusy,
    canJumpTo,
    goToStep,
    goToYourMap,
  };
};
