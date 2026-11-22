import { PANEL_COMPONENT_KEY } from "@/constants";

// Rules for moving between the mapping steps and for which earlier work a
// change invalidates. Kept free of React so they can be unit-tested.

export type WizardStep = 1 | 2 | 3 | 4;

// progressPanelIndex once the map flow has started (step 4 uses index 3 and
// the flow skips 4).
export const MAP_PROGRESS_INDEX = 5;

export interface CompositeKey {
  satelliteSource: string;
  maximumCloudCover: number;
}

// Once a map exists, earlier steps can be opened but not changed.
export const isViewOnly = (
  progressPanelIndex: number,
  stepKey: PANEL_COMPONENT_KEY,
) =>
  progressPanelIndex >= MAP_PROGRESS_INDEX &&
  stepKey !== PANEL_COMPONENT_KEY.YOUR_MAP;

const STEP_TARGETS: Record<
  WizardStep,
  { stepKey: PANEL_COMPONENT_KEY; progressPanelIndex: number }
> = {
  1: {
    stepKey: PANEL_COMPONENT_KEY.BASIC_INFORMATION_SUMMARY,
    progressPanelIndex: 0,
  },
  2: { stepKey: PANEL_COMPONENT_KEY.DEFINE_LUC, progressPanelIndex: 1 },
  3: {
    stepKey: PANEL_COMPONENT_KEY.DATA_TRAINING_SUMMARY,
    progressPanelIndex: 2,
  },
  4: {
    stepKey: PANEL_COMPONENT_KEY.LULC_PARAMS_SUMMARY,
    progressPanelIndex: 3,
  },
};

// The panel (each step's summary) and progress index a step jump lands on.
export const getStepTarget = (step: WizardStep) => STEP_TARGETS[step];

// Earlier steps can always be jumped to; after the map exists, any step.
// Forward jumps before the map go through canJumpForward.
export const canJumpToStep = (step: WizardStep, progressPanelIndex: number) =>
  progressPanelIndex >= MAP_PROGRESS_INDEX || step - 1 < progressPanelIndex;

// Steps 1–3 with changes only their Next can process (composite preview,
// class submit + step 3 reset, sample upload). A forward jump past one of
// them would skip that work.
export type DirtySteps = Record<1 | 2 | 3, boolean>;

export const getDirtySteps = (input: {
  stepKey: PANEL_COMPONENT_KEY;
  isPreviewingMosaic: boolean;
  isBasicInformationChangeInput: boolean;
  isStep2Confirmed: boolean;
  classesMatchSubmitted: boolean;
  isTrainingDataChanged: boolean;
  hasSamples: boolean;
}): DirtySteps => ({
  1:
    !input.isPreviewingMosaic ||
    input.isBasicInformationChangeInput ||
    input.stepKey === PANEL_COMPONENT_KEY.BASIC_INFORMATION ||
    input.stepKey === PANEL_COMPONENT_KEY.AREA_SCOPING,
  2: !input.isStep2Confirmed || !input.classesMatchSubmitted,
  3: input.isTrainingDataChanged || !input.hasSamples,
});

// Steps that are reached and still hold their data (step 2: confirmed
// classes, step 3: samples, step 4: reached). The step bar shows filled
// steps ahead of the user in their own colour.
export const getFilledSteps = (input: {
  furthestProgressIndex: number;
  isStep2Confirmed: boolean;
  hasSamples: boolean;
}): Record<WizardStep, boolean> => ({
  1: true,
  2: input.furthestProgressIndex >= 1 && input.isStep2Confirmed,
  3: input.furthestProgressIndex >= 2 && input.hasSamples,
  4: input.furthestProgressIndex >= 3,
});

// Jump ahead to a step already reached, as long as the current step and
// every step in between are saved.
export const canJumpForward = (input: {
  step: WizardStep;
  progressPanelIndex: number;
  furthestProgressIndex: number;
  dirtySteps: DirtySteps;
}) => {
  const targetIndex = input.step - 1;
  if (
    targetIndex <= input.progressPanelIndex ||
    targetIndex > input.furthestProgressIndex
  ) {
    return false;
  }
  for (let step = input.progressPanelIndex + 1; step < input.step; step++) {
    if (input.dirtySteps[step as keyof DirtySteps]) return false;
  }
  return true;
};

export const isNavigationBusy = (flags: {
  isLUCLoading: boolean;
  isUploadingTrainingFile: boolean;
  isUpdatingTrainingData: boolean;
  isSampleQualityLoading: boolean;
  isMapGenerationLoading: boolean;
  /** A footer action (useSavingTransition) is still running. */
  isSavingTransition: boolean;
  stepKey: PANEL_COMPONENT_KEY;
}) =>
  flags.isLUCLoading ||
  flags.isUploadingTrainingFile ||
  flags.isUpdatingTrainingData ||
  flags.isSampleQualityLoading ||
  flags.isMapGenerationLoading ||
  flags.isSavingTransition ||
  flags.stepKey === PANEL_COMPONENT_KEY.OSS;

// Step 3 work the user would lose by changing classes. Auto-placed
// reference points (default scheme) are placed again, so they don't count.
export const hasUserSampleWork = (input: {
  uploadedFileCount: number;
  ossPointCount: number;
  hasScore: boolean;
}) => input.uploadedFileCount > 0 || input.ossPointCount > 0 || input.hasScore;

// A separability score belongs to the composite it was computed on.
export const isScoreStaleForComposite = (
  scored: CompositeKey | null,
  current: CompositeKey,
) =>
  scored !== null &&
  (scored.satelliteSource !== current.satelliteSource ||
    scored.maximumCloudCover !== current.maximumCloudCover);
