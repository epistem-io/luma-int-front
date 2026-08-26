import { AREA_SCOPING_TYPE, PANEL_COMPONENT_KEY } from "@/constants";

export const CHECKPOINT_VERSION = 1;

export interface CheckpointOwner {
  email: string;
  id?: string | number;
}

export interface CheckpointMarker {
  coordinates: [number, number];
  id: string;
  name: string;
  class_id: number;
  class_color: string;
}

export interface CheckpointUploadedFile {
  name: string;
  size: number;
}

export interface CheckpointDrafts {
  step: 1 | 2 | 3 | 4;
  luc?: {
    lucQuickRows: QuickTableRow[];
    defaultArray: number[];
    lucView: string;
    lucCustomTab: string;
  };
  params?: {
    selectedPredictors: string[];
    numberOfTrees: string;
    splitRatio?: number;
  };
}

export interface SessionCheckpoint {
  version: typeof CHECKPOINT_VERSION;
  savedAt: string; // ISO timestamp, stamped by the writer
  owner: CheckpointOwner;
  sessionId: string;
  lastStepWithData: 1 | 2 | 3 | 4 | 5;
  stepKey: PANEL_COMPONENT_KEY;
  progressPanelIndex: number;
  basicInfo?: {
    areaScopingType: AREA_SCOPING_TYPE;
    polygonGeoJSON: string | null;
    polygonArea: number;
    polygonFileName: string;
    polygonFileSize: number;
    polygonData: { area_size: number; id: string } | null;
    regency?: RegencyOption | null;
    spatialResolution: string;
    temporalCoverage: string;
    temporalCoverageUnit: string;
    satelliteSource: string;
    maximumCloudCover: number;
  };
  luc?: {
    lucSource: "" | "quick" | "excel" | "default";
    lucView: string;
    lucCustomTab: string;
    lucQuickPhase: "editing" | "locked" | "confirmed";
    lucExcelConfirmed: boolean;
    lucDefaultConfirmed: boolean;
    lucQuickRows: QuickTableRow[];
    defaultArray: number[];
    classArray: LUCClass[];
    LUCfilename: string;
    LUCfilesize: number;
  };
  training?: {
    method: "oss" | "upload";
    // True only when the user confirmed the sample data (step 3 recorded);
    // markers are persisted earlier because the quick/default flow auto-places
    // points on entering step 3.
    confirmed: boolean;
    markers: CheckpointMarker[];
    uploadedFiles: CheckpointUploadedFile[];
    sampleQualityConfirmed: boolean;
  };
  params?: {
    selectedPredictors: string[];
    numberOfTrees: string;
    minLeafPopulation: string;
    /** Optional so checkpoints saved before this field existed still load. */
    splitRatio?: number;
  };
  mapGenerated?: boolean;
  drafts?: CheckpointDrafts;
}

export interface CheckpointInputs {
  owner: CheckpointOwner;
  sessionId: string;
  stepKey: PANEL_COMPONENT_KEY;
  progressPanelIndex: number;
  areaScopingType: AREA_SCOPING_TYPE;
  polygonGeoJSON: string | null;
  areaScopingPolygonArea: number;
  areaScopingPolygonFileName: string;
  areaScopingPolygonFileSize: number;
  polygonData: { area_size: number; id: string } | null;
  areaScopingRegency: RegencyOption | null;
  spatialResolution: string;
  temporalCoverage: string;
  temporalCoverageUnit: string;
  satelliteSource: string;
  maximumCloudCover: number;
  lucSource: "" | "quick" | "excel" | "default";
  lucView: string;
  lucCustomTab: string;
  lucQuickPhase: "editing" | "locked" | "confirmed";
  lucExcelConfirmed: boolean;
  lucDefaultConfirmed: boolean;
  lucQuickRows: QuickTableRow[];
  defaultArray: number[];
  classArray: LUCClass[];
  LUCfilename: string;
  LUCfilesize: number;
  dataTrainingActiveTab: "upload" | "oss";
  markerArray: CheckpointMarker[];
  uploadedFiles: CheckpointUploadedFile[];
  isTrainingDataChanged: boolean;
  sampleQualityConfirmed: boolean;
  selectedPredictors: string[];
  numberOfTrees: string;
  minLeafPopulation: string;
  splitRatio: number;
  mapGenerated: boolean;
}

export const isStep1Recorded = (i: CheckpointInputs): boolean =>
  i.sessionId !== "" && i.polygonData !== null && i.temporalCoverage !== "";

export const isStep2Recorded = (i: CheckpointInputs): boolean =>
  i.lucQuickPhase === "confirmed" || i.lucDefaultConfirmed;

export const isStep3Recorded = (i: CheckpointInputs): boolean =>
  !i.isTrainingDataChanged &&
  (i.markerArray.length > 0 || i.uploadedFiles.length > 0);

export const isStep4Recorded = (i: CheckpointInputs): boolean =>
  i.stepKey === PANEL_COMPONENT_KEY.LULC_PARAMS_SUMMARY ||
  i.stepKey === PANEL_COMPONENT_KEY.YOUR_MAP;

export const isStep5Recorded = (i: CheckpointInputs): boolean => i.mapGenerated;

export function computeLastStepWithData(
  i: CheckpointInputs,
): 0 | 1 | 2 | 3 | 4 | 5 {
  if (!isStep1Recorded(i)) return 0;
  if (isStep5Recorded(i)) return 5;
  if (isStep4Recorded(i)) return 4;
  if (isStep3Recorded(i)) return 3;
  if (isStep2Recorded(i)) return 2;
  return 1;
}

// Sub-panels can't be landed on directly after a refresh (they depend on
// transient map interactions); fall back to their parent panel.
export function toResumePanel(
  stepKey: PANEL_COMPONENT_KEY,
): PANEL_COMPONENT_KEY {
  switch (stepKey) {
    case PANEL_COMPONENT_KEY.NULL:
    case PANEL_COMPONENT_KEY.AREA_SCOPING:
      return PANEL_COMPONENT_KEY.BASIC_INFORMATION;
    case PANEL_COMPONENT_KEY.OSS:
      return PANEL_COMPONENT_KEY.DATA_TRAINING;
    default:
      return stepKey;
  }
}

export function panelToWizardStep(
  stepKey: PANEL_COMPONENT_KEY,
): 1 | 2 | 3 | 4 | 5 {
  switch (stepKey) {
    case PANEL_COMPONENT_KEY.DEFINE_LUC:
      return 2;
    case PANEL_COMPONENT_KEY.DATA_TRAINING:
    case PANEL_COMPONENT_KEY.OSS:
      return 3;
    case PANEL_COMPONENT_KEY.LULC_PARAMS:
    case PANEL_COMPONENT_KEY.LULC_PARAMS_SUMMARY:
      return 4;
    case PANEL_COMPONENT_KEY.YOUR_MAP:
      return 5;
    default:
      // BASIC_INFORMATION, AREA_SCOPING, BASIC_INFORMATION_SUMMARY, NULL
      return 1;
  }
}

export function buildDrafts(i: CheckpointInputs): CheckpointDrafts | undefined {
  if (i.stepKey === PANEL_COMPONENT_KEY.DEFINE_LUC && !isStep2Recorded(i)) {
    return {
      step: 2,
      luc: {
        lucQuickRows: i.lucQuickRows,
        defaultArray: i.defaultArray,
        lucView: i.lucView,
        lucCustomTab: i.lucCustomTab,
      },
    };
  }
  if (i.stepKey === PANEL_COMPONENT_KEY.LULC_PARAMS && !isStep4Recorded(i)) {
    return {
      step: 4,
      params: {
        selectedPredictors: i.selectedPredictors,
        numberOfTrees: i.numberOfTrees,
        splitRatio: i.splitRatio,
      },
    };
  }
  return undefined;
}

export function buildCheckpoint(
  i: CheckpointInputs,
  drafts?: CheckpointDrafts,
): SessionCheckpoint | null {
  const lastStep = computeLastStepWithData(i);
  if (lastStep === 0) return null;

  // Resume where the user actually was, not at the last confirmed step.
  const checkpoint: SessionCheckpoint = {
    version: CHECKPOINT_VERSION,
    savedAt: "",
    owner: i.owner,
    sessionId: i.sessionId,
    lastStepWithData: lastStep,
    stepKey: toResumePanel(i.stepKey),
    progressPanelIndex: i.progressPanelIndex,
    basicInfo: {
      areaScopingType: i.areaScopingType,
      polygonGeoJSON: i.polygonGeoJSON,
      polygonArea: i.areaScopingPolygonArea,
      polygonFileName: i.areaScopingPolygonFileName,
      polygonFileSize: i.areaScopingPolygonFileSize,
      polygonData: i.polygonData,
      regency: i.areaScopingRegency,
      spatialResolution: i.spatialResolution,
      temporalCoverage: i.temporalCoverage,
      temporalCoverageUnit: i.temporalCoverageUnit,
      satelliteSource: i.satelliteSource,
      maximumCloudCover: i.maximumCloudCover,
    },
  };

  if (isStep2Recorded(i)) {
    checkpoint.luc = {
      lucSource: i.lucSource,
      lucView: i.lucView,
      lucCustomTab: i.lucCustomTab,
      lucQuickPhase: i.lucQuickPhase,
      lucExcelConfirmed: i.lucExcelConfirmed,
      lucDefaultConfirmed: i.lucDefaultConfirmed,
      lucQuickRows: i.lucQuickRows,
      defaultArray: i.defaultArray,
      classArray: i.classArray,
      LUCfilename: i.LUCfilename,
      LUCfilesize: i.LUCfilesize,
    };
  }

  if (i.markerArray.length > 0 || i.uploadedFiles.length > 0) {
    checkpoint.training = {
      method: i.dataTrainingActiveTab === "oss" ? "oss" : "upload",
      confirmed: isStep3Recorded(i),
      markers: i.markerArray,
      uploadedFiles: i.uploadedFiles,
      sampleQualityConfirmed: i.sampleQualityConfirmed,
    };
  }

  if (isStep4Recorded(i)) {
    checkpoint.params = {
      selectedPredictors: i.selectedPredictors,
      numberOfTrees: i.numberOfTrees,
      minLeafPopulation: i.minLeafPopulation,
      splitRatio: i.splitRatio,
    };
  }

  if (isStep5Recorded(i)) {
    checkpoint.mapGenerated = true;
  }

  if (drafts) {
    checkpoint.drafts = drafts;
  }

  return checkpoint;
}

export function isCheckpointOwner(
  cp: SessionCheckpoint,
  user: { email: string } | null | undefined,
): boolean {
  if (!user) return false;
  return (
    cp.owner.email.trim().toLowerCase() === user.email.trim().toLowerCase()
  );
}

export function shouldOfferResume(
  cp: SessionCheckpoint | null,
  user: { email: string } | null | undefined,
  currentSessionId: string,
): cp is SessionCheckpoint {
  return (
    cp !== null &&
    currentSessionId === "" &&
    cp.lastStepWithData >= 1 &&
    isCheckpointOwner(cp, user)
  );
}
