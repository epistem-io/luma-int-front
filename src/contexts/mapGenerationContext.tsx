"use client";

import {
  AREA_SCOPING_TYPE,
  PANEL_COMPONENT_KEY,
  POINTING_TYPE,
  TRAINING_DATA_SEPARABILITY_URL
} from "@/constants";
import {
  fetchAvailablePredictors,
  fetchPredictorSeparability,
  latestRecommendation,
  type OptimizerProgress,
  pruneSelectedPredictors,
  recommendedAvailableIds,
  shouldAutoApplyRecommendation,
  streamPredictorOptimizer,
} from "@/lib/predictorsApi";
import { type CompositeKey, isViewOnly } from "@/lib/stepRules";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";

interface PolygonData {
  area_size: number;
  id: string;
  // session_id: string;
}

export type LULCSummaryEditSection =
  | ""
  | "predictor"
  | "random-forest"
  | "data-validation";

export type LULCParamsAccordionSection =
  | ""
  | "predictor"
  | "random-forest"
  | "data-validation";

export type DataTrainingActiveTab = "upload" | "oss";

export type PredictorOptimizerStatus = "idle" | "running" | "error";

/** Optional tuning for the separability analysis (see LumaLite Module 4). */
export interface SampleQualityOptions {
  /** Sampling scale in metres; defaults to the session's spatial resolution. */
  scale?: number;
  /** Per-class pixel cap; defaults to 5000 on the backend. */
  maxPixelsPerClass?: number;
}

export type LucCustomTab = "quick" | "excel";

// Which body the step-2 Hierarchy panel shows: the two-card picker, or one
// of the classification flows. Lives in context so InteractivePanel can swap
// the panel header (back button + title) while a flow is open.
export type LucView = "picker" | "own" | "default";

export type LucSource = "" | "quick" | "excel" | "default";

// Quick Table flow: editing rows -> locked (read-only) -> confirmed (summary,
// unlocks the Next button).
export type LucQuickPhase = "editing" | "locked" | "confirmed";

export interface MapGenerationContextType {
  progressPanelIndex: number;
  setProgressPanelIndex: Dispatch<SetStateAction<number>>;
  stepKey: PANEL_COMPONENT_KEY;
  setStepKey: Dispatch<SetStateAction<PANEL_COMPONENT_KEY>>;
  basicInformationOpenAccordion: string;
  setBasicInformationOpenAccordion: Dispatch<SetStateAction<string>>;
  areaScopingType: AREA_SCOPING_TYPE;
  setAreaScopingType: Dispatch<SetStateAction<AREA_SCOPING_TYPE>>;
  areaScopingPolygonUrl: File | null;
  setAreaScopingPolygonUrl: Dispatch<SetStateAction<File | null>>;
  areaScopingPolygonFileName: string;
  setAreaScopingPolygonFileName: Dispatch<SetStateAction<string>>;
  areaScopingPolygonArea: number;
  setAreaScopingPolygonArea: Dispatch<SetStateAction<number>>;
  areaScopingPolygonFileSize: number;
  setAreaScopingPolygonFileSize: Dispatch<SetStateAction<number>>;
  areaScopingRegency: RegencyOption | null;
  setAreaScopingRegency: Dispatch<SetStateAction<RegencyOption | null>>;
  spatialResolution: string;
  setSpatialResolution: Dispatch<SetStateAction<string>>;
  isEditingTemporalCoverage: boolean;
  setisEditingTemporalCoverage: Dispatch<SetStateAction<boolean>>;
  temporalCoverage: string;
  setTemporalCoverage: Dispatch<SetStateAction<string>>;
  temporalCoverageUnit: string;
  setTemporalCoverageUnit: Dispatch<SetStateAction<string>>;
  isEditingSatelliteComposite: boolean;
  setIsEditingSatelliteComposite: Dispatch<SetStateAction<boolean>>;
  satelliteSource: string;
  setSatelliteSource: Dispatch<SetStateAction<string>>;
  maximumCloudCover: number;
  setMaximumCloudCover: Dispatch<SetStateAction<number>>;
  isAreaScopingLoading: boolean;
  setIsAreaScopingLoading: Dispatch<SetStateAction<boolean>>;
  isBasicInformationChangeInput: boolean;
  setIsBasicInformationChangeInput: Dispatch<SetStateAction<boolean>>;
  isLULCSummaryChangeInput: boolean;
  setIsLULCSummaryChangeInput: Dispatch<SetStateAction<boolean>>;
  selectedLULCSummaryEditSection: LULCSummaryEditSection;
  setSelectedLULCSummaryEditSection: Dispatch<
    SetStateAction<LULCSummaryEditSection>
  >;
  lulcParamsOpenAccordion: LULCParamsAccordionSection;
  setLULCParamsOpenAccordion: Dispatch<
    SetStateAction<LULCParamsAccordionSection>
  >;
  //
  polygonData: PolygonData | null;
  setPolygonData: Dispatch<SetStateAction<null | PolygonData>>;
  areaScopingPolygonError: string;
  setAreaScopingPolygonError: Dispatch<SetStateAction<string>>;
  // LUC
  defaultArray: number[];
  selectedDefault: boolean;
  selectedCustom: boolean;
  lucSource: LucSource;
  isAutoPointsFlow: boolean;
  lucQuickRows: QuickTableRow[];
  lucCustomTab: LucCustomTab;
  lucQuickPhase: LucQuickPhase;
  lucExcelConfirmed: boolean;
  lucDefaultConfirmed: boolean;
  lucView: LucView;
  LUCfile: File | null;
  LUCfilename: string;
  LUCfilesize: number;
  isLUCLoading: boolean;
  haveDownloadedFile: boolean;
  setDefaultArray: Dispatch<SetStateAction<number[]>>;
  setLucQuickRows: Dispatch<SetStateAction<QuickTableRow[]>>;
  setLucCustomTab: Dispatch<SetStateAction<LucCustomTab>>;
  setLucQuickPhase: Dispatch<SetStateAction<LucQuickPhase>>;
  setLucExcelConfirmed: Dispatch<SetStateAction<boolean>>;
  setLucDefaultConfirmed: Dispatch<SetStateAction<boolean>>;
  setLucView: Dispatch<SetStateAction<LucView>>;
  setLUCFile: Dispatch<SetStateAction<File | null>>;
  setLUCFilename: Dispatch<SetStateAction<string>>;
  setLUCFilesize: Dispatch<SetStateAction<number>>;
  setIsLUCLoading: Dispatch<SetStateAction<boolean>>;
  setHaveDownloadedFile: Dispatch<SetStateAction<boolean>>;
  //
  trainingFile: File | null;
  trainingFilename: string;
  trainingFilesize: number;
  trainingFileError: string;
  uploadedFilesArray: FileTrainingObject[];
  dataTrainingActiveTab: DataTrainingActiveTab;
  setTrainingFile: Dispatch<SetStateAction<File | null>>;
  setTrainingFilename: Dispatch<SetStateAction<string>>;
  setTrainingFilesize: Dispatch<SetStateAction<number>>;
  setTrainingFileError: Dispatch<SetStateAction<string>>;
  setUploadedFilesArray: Dispatch<SetStateAction<FileTrainingObject[]>>;
  setDataTrainingActiveTab: Dispatch<SetStateAction<DataTrainingActiveTab>>;
  classArray: LUCClass[];
  setClassArray: Dispatch<SetStateAction<LUCClass[]>>;
  pointingType: POINTING_TYPE;
  setPointingType: Dispatch<SetStateAction<POINTING_TYPE>>;
  selectedClass: string;
  setSelectedClass: Dispatch<SetStateAction<string>>;
  isUploadingTrainingFile: boolean;
  setIsUploadingTrainingFile: Dispatch<SetStateAction<boolean>>;
  isUpdatingTrainingData: boolean;
  setIsUpdatingTrainingData: Dispatch<SetStateAction<boolean>>;
  isSummaryDialogOpen: boolean;
  setIsSummaryDialogOpen: Dispatch<SetStateAction<boolean>>;
  // mapGenerationResult: GenerateMapRes | null;
  // setMapGenerationResult: Dispatch<SetStateAction<null | GenerateMapRes>>;
  generateMapDataVisualization: GenerateMapDataVisualization | null;
  setGenerateMapDataVisualization: Dispatch<
    SetStateAction<GenerateMapDataVisualization | null>
  >;
  generateMapLULC: GenerateMapDataLULCComp | null;
  setGenerateMapLULC: Dispatch<SetStateAction<GenerateMapDataLULCComp | null>>;
  generateMapFeatureImportance: GenerateMapDataFeatureImportance | null;
  setGenerateMapFeatureImportance: Dispatch<
    SetStateAction<GenerateMapDataFeatureImportance | null>
  >;
  generateMapModelQuality: GenerateMapDataEvalModelQuality | null;
  setGenerateMapModelQuality: Dispatch<
    SetStateAction<GenerateMapDataEvalModelQuality | null>
  >;
  generateMapDownloadURL: GenerateMapDataDownloadURL | null;
  setGenerateMapDownloadURL: Dispatch<
    SetStateAction<GenerateMapDataDownloadURL | null>
  >;
  isMapGenerationLoading: boolean;
  setIsMapGenerationLoading: Dispatch<SetStateAction<boolean>>;
  progress: number;
  setProgress: Dispatch<SetStateAction<number>>;
  totalProgress: number;
  setTotalProgress: Dispatch<SetStateAction<number>>;
  isGenerationError: boolean;
  setIsGenerationError: Dispatch<SetStateAction<boolean>>;
  summaryData: InputSummaryRes | null;
  setSummaryData: Dispatch<SetStateAction<InputSummaryRes | null>>;
  isDefineLULCChanged: boolean;
  setIsDefineLULCChanged: Dispatch<SetStateAction<boolean>>;
  isTrainingDataChanged: boolean;
  setIsTrainingDataChanged: Dispatch<SetStateAction<boolean>>;
  sampleQuality: SampleQualityResult | null;
  setSampleQuality: Dispatch<SetStateAction<SampleQualityResult | null>>;
  isSampleQualityLoading: boolean;
  setIsSampleQualityLoading: Dispatch<SetStateAction<boolean>>;
  sampleQualityError: string;
  setSampleQualityError: Dispatch<SetStateAction<string>>;
  // Whether the user has acknowledged the current separability result via
  // Confirm Sample Quality; gates Next on the Data Training step.
  sampleQualityConfirmed: boolean;
  setSampleQualityConfirmed: Dispatch<SetStateAction<boolean>>;
  // Whether an analysis has ever completed this session — survives Edit
  // (which clears the result) so the score banner can say "Regenerate".
  sampleQualityGenerated: boolean;
  setSampleQualityGenerated: Dispatch<SetStateAction<boolean>>;
  fetchSampleQuality: (
    sessionId: string,
    options?: SampleQualityOptions,
  ) => void;
  thematicAccuracy: ThematicAccuracyResult | null;
  setThematicAccuracy: Dispatch<SetStateAction<ThematicAccuracyResult | null>>;
  isThematicAccuracyLoading: boolean;
  setIsThematicAccuracyLoading: Dispatch<SetStateAction<boolean>>;
  thematicAccuracyError: string;
  setThematicAccuracyError: Dispatch<SetStateAction<string>>;
  isLULCParamsChanged: boolean;
  setIsLULCParamsChanged: Dispatch<SetStateAction<boolean>>;
  isYourMapDialogVisible: boolean;
  setIsYourMapDialogVisible: Dispatch<SetStateAction<boolean>>;
  selectedPredictors: string[];
  setSelectedPredictors: Dispatch<SetStateAction<string[]>>;
  /** Step 4's predictor options from the backend; null until loaded. */
  predictorListing: PredictorListing | null;
  isPredictorListingLoading: boolean;
  predictorListingError: string;
  fetchPredictorListing: (sessionId: string) => void;
  /** Last result of the predictor optimizer; null when it has not run. */
  predictorRecommendation: PredictorRecommendation | null;
  predictorOptimizerStatus: PredictorOptimizerStatus;
  /** Progress of the running optimizer; null before its first line. */
  predictorOptimizerProgress: OptimizerProgress | null;
  predictorOptimizerError: string;
  startPredictorOptimizer: (sessionId: string) => void;
  applyPredictorRecommendation: () => void;
  /** Last separability check with predictors; null when none was run. */
  predictorSeparability: PredictorSeparabilityResult | null;
  isPredictorSeparabilityLoading: boolean;
  predictorSeparabilityError: string;
  checkPredictorSeparability: (
    sessionId: string,
    predictorIds: string[],
  ) => void;
  numberOfTrees: string;
  setNumberOfTrees: Dispatch<SetStateAction<string>>;
  numberOfTreesError: string;
  setNumberOfTreesError: Dispatch<SetStateAction<string>>;
  minLeafPopulation: string;
  setMinLeafPopulation: Dispatch<SetStateAction<string>>;
  minLeafPopulationError: string;
  setMinLeafPopulationError: Dispatch<SetStateAction<string>>;
  /** Training share of the sample split, in percent (10-90). */
  splitRatio: number;
  setSplitRatio: Dispatch<SetStateAction<number>>;
  /** True while the user is redoing step 4 via "Improve Accuracy" from step 5. */
  isImprovementMode: boolean;
  setIsImprovementMode: Dispatch<SetStateAction<boolean>>;
  /** Set on step 1's first Next; from then on only the satellite is editable. */
  hasLeftStep1: boolean;
  setHasLeftStep1: Dispatch<SetStateAction<boolean>>;
  /** Furthest progress index reached; the step bar may jump forward to it. */
  furthestProgressIndex: number;
  setFurthestProgressIndex: Dispatch<SetStateAction<number>>;
  /** Satellite + cloud cover the current sample-quality score was computed on. */
  sampleQualityComposite: CompositeKey | null;
  resetMapGenerationState: () => void;
  quickManualSampling: boolean;
  setQuickManualSampling: Dispatch<SetStateAction<boolean>>;
}

const DEFAULT_VALUE: MapGenerationContextType = {
  progressPanelIndex: 0,
  setProgressPanelIndex: () => {},
  stepKey: PANEL_COMPONENT_KEY.BASIC_INFORMATION,
  // WIP
  // stepKey: PANEL_COMPONENT_KEY.YOUR_MAP,
  // stepKey: PANEL_COMPONENT_KEY.DATA_TRAINING,
  // stepKey: PANEL_COMPONENT_KEY.LULC_PARAMS,
  setStepKey: () => {},
  basicInformationOpenAccordion: "",
  setBasicInformationOpenAccordion: () => {},
  areaScopingType: AREA_SCOPING_TYPE.UPLOAD,
  setAreaScopingType: () => {},
  areaScopingPolygonUrl: null,
  setAreaScopingPolygonUrl: () => {},
  areaScopingPolygonFileName: "",
  setAreaScopingPolygonFileName: () => {},
  areaScopingPolygonArea: 0,
  setAreaScopingPolygonArea: () => {},
  areaScopingPolygonFileSize: 0,
  setAreaScopingPolygonFileSize: () => {},
  areaScopingRegency: null,
  setAreaScopingRegency: () => {},
  spatialResolution: "",
  setSpatialResolution: () => {},
  isEditingTemporalCoverage: true,
  setisEditingTemporalCoverage: () => {},
  temporalCoverage: "",
  setTemporalCoverage: () => {},
  temporalCoverageUnit: "",
  setTemporalCoverageUnit: () => {},
  isEditingSatelliteComposite: true,
  setIsEditingSatelliteComposite: () => {},
  satelliteSource: "",
  setSatelliteSource: () => {},
  maximumCloudCover: 30,
  setMaximumCloudCover: () => {},
  isBasicInformationChangeInput: false,
  setIsBasicInformationChangeInput: () => {},
  isLULCSummaryChangeInput: false,
  setIsLULCSummaryChangeInput: () => {},
  selectedLULCSummaryEditSection: "",
  setSelectedLULCSummaryEditSection: () => {},
  lulcParamsOpenAccordion: "",
  setLULCParamsOpenAccordion: () => {},
  isAreaScopingLoading: false,
  setIsAreaScopingLoading: () => {},
  areaScopingPolygonError: "",
  setAreaScopingPolygonError: () => {},
  //
  polygonData: null,
  setPolygonData: () => {},
  // LUC
  defaultArray: [],
  selectedDefault: false,
  selectedCustom: false,
  lucSource: "",
  isAutoPointsFlow: false,
  lucQuickRows: [],
  lucCustomTab: "quick",
  lucQuickPhase: "editing",
  lucExcelConfirmed: false,
  lucDefaultConfirmed: false,
  lucView: "picker" as LucView,
  LUCfile: null,
  LUCfilename: "",
  LUCfilesize: 0,
  isLUCLoading: false,
  haveDownloadedFile: false,
  setDefaultArray: () => {},
  setLucQuickRows: () => {},
  setLucCustomTab: () => {},
  setLucQuickPhase: () => {},
  setLucExcelConfirmed: () => {},
  setLucDefaultConfirmed: () => {},
  setLucView: () => {},
  setLUCFile: () => {},
  setLUCFilename: () => {},
  setLUCFilesize: () => {},
  setIsLUCLoading: () => {},
  setHaveDownloadedFile: () => {},
  //
  trainingFile: null,
  trainingFilename: "",
  trainingFilesize: 0,
  trainingFileError: "",
  uploadedFilesArray: [],
  dataTrainingActiveTab: "upload",
  setTrainingFile: () => {},
  setTrainingFilename: () => {},
  setTrainingFilesize: () => {},
  setTrainingFileError: () => {},
  setUploadedFilesArray: () => {},
  setDataTrainingActiveTab: () => {},
  // classArray: TEMP_ARR,
  classArray: [],
  setClassArray: () => {},
  pointingType: POINTING_TYPE.EMPTY,
  setPointingType: () => {},
  selectedClass: "",
  setSelectedClass: () => {},
  isUploadingTrainingFile: false,
  setIsUploadingTrainingFile: () => {},
  isUpdatingTrainingData: false,
  setIsUpdatingTrainingData: () => {},
  isSummaryDialogOpen: false,
  setIsSummaryDialogOpen: () => {},
  // mapGenerationResult: null,
  // setMapGenerationResult: () => {},
  generateMapDataVisualization: null,
  setGenerateMapDataVisualization: () => {},
  generateMapLULC: null,
  setGenerateMapLULC: () => {},
  generateMapFeatureImportance: null,
  setGenerateMapFeatureImportance: () => {},
  generateMapModelQuality: null,
  setGenerateMapModelQuality: () => {},
  generateMapDownloadURL: null,
  setGenerateMapDownloadURL: () => {},
  isMapGenerationLoading: false,
  setIsMapGenerationLoading: () => {},
  progress: 0,
  setProgress: () => {},
  totalProgress: 0,
  setTotalProgress: () => {},
  isGenerationError: false,
  setIsGenerationError: () => {},
  summaryData: null,
  setSummaryData: () => {},
  isDefineLULCChanged: true,
  setIsDefineLULCChanged: () => {},
  isTrainingDataChanged: true,
  setIsTrainingDataChanged: () => {},
  sampleQuality: null,
  setSampleQuality: () => {},
  isSampleQualityLoading: false,
  setIsSampleQualityLoading: () => {},
  sampleQualityError: "",
  sampleQualityConfirmed: false,
  setSampleQualityConfirmed: () => {},
  sampleQualityGenerated: false,
  setSampleQualityGenerated: () => {},
  setSampleQualityError: () => {},
  fetchSampleQuality: () => {},
  thematicAccuracy: null,
  setThematicAccuracy: () => {},
  isThematicAccuracyLoading: false,
  setIsThematicAccuracyLoading: () => {},
  thematicAccuracyError: "",
  setThematicAccuracyError: () => {},
  isLULCParamsChanged: true,
  setIsLULCParamsChanged: () => {},
  isYourMapDialogVisible: false,
  setIsYourMapDialogVisible: () => {},
  selectedPredictors: [],
  setSelectedPredictors: () => {},
  predictorListing: null,
  isPredictorListingLoading: false,
  predictorListingError: "",
  fetchPredictorListing: () => {},
  predictorRecommendation: null,
  predictorOptimizerStatus: "idle",
  predictorOptimizerProgress: null,
  predictorOptimizerError: "",
  startPredictorOptimizer: () => {},
  applyPredictorRecommendation: () => {},
  predictorSeparability: null,
  isPredictorSeparabilityLoading: false,
  predictorSeparabilityError: "",
  checkPredictorSeparability: () => {},
  numberOfTrees: "150",
  setNumberOfTrees: () => {},
  numberOfTreesError: "",
  setNumberOfTreesError: () => {},
  minLeafPopulation: "1",
  setMinLeafPopulation: () => {},
  minLeafPopulationError: "",
  setMinLeafPopulationError: () => {},
  splitRatio: 70,
  setSplitRatio: () => {},
  isImprovementMode: false,
  setIsImprovementMode: () => {},
  hasLeftStep1: false,
  setHasLeftStep1: () => {},
  furthestProgressIndex: 0,
  setFurthestProgressIndex: () => {},
  sampleQualityComposite: null,
  resetMapGenerationState: () => {},
  quickManualSampling: false,
  setQuickManualSampling: () => {},
};

const MapGenerationContext = createContext(DEFAULT_VALUE);

const MapGenerationContextContainer = (props: PropsWithChildren) => {
  const [progressPanelIndex, setProgressPanelIndex] = useState(
    DEFAULT_VALUE.progressPanelIndex,
  );
  const [stepKey, setStepKey] = useState(DEFAULT_VALUE.stepKey);
  const [basicInformationOpenAccordion, setBasicInformationOpenAccordion] =
    useState(DEFAULT_VALUE.basicInformationOpenAccordion);
  const [areaScopingType, setAreaScopingType] = useState(
    DEFAULT_VALUE.areaScopingType,
  );
  const [areaScopingPolygonUrl, setAreaScopingPolygonUrl] = useState(
    DEFAULT_VALUE.areaScopingPolygonUrl,
  );
  const [areaScopingPolygonFileName, setAreaScopingPolygonFileName] = useState(
    DEFAULT_VALUE.areaScopingPolygonFileName,
  );
  const [areaScopingPolygonArea, setAreaScopingPolygonArea] = useState(
    DEFAULT_VALUE.areaScopingPolygonArea,
  );
  const [areaScopingPolygonFileSize, setAreaScopingPolygonFileSize] = useState(
    DEFAULT_VALUE.areaScopingPolygonFileSize,
  );
  const [areaScopingRegency, setAreaScopingRegency] = useState<
    RegencyOption | null
  >(DEFAULT_VALUE.areaScopingRegency);
  const [spatialResolution, setSpatialResolution] = useState(
    DEFAULT_VALUE.spatialResolution,
  );
  const [isEditingTemporalCoverage, setisEditingTemporalCoverage] = useState(
    DEFAULT_VALUE.isEditingTemporalCoverage,
  );
  const [temporalCoverage, setTemporalCoverage] = useState(
    DEFAULT_VALUE.temporalCoverage,
  );
  const [temporalCoverageUnit, setTemporalCoverageUnit] = useState(
    DEFAULT_VALUE.temporalCoverageUnit,
  );
  const [isEditingSatelliteComposite, setIsEditingSatelliteComposite] =
    useState(DEFAULT_VALUE.isEditingSatelliteComposite);
  const [satelliteSource, setSatelliteSource] = useState(
    DEFAULT_VALUE.satelliteSource,
  );
  const [maximumCloudCover, setMaximumCloudCover] = useState(
    DEFAULT_VALUE.maximumCloudCover,
  );
  const [isBasicInformationChangeInput, setIsBasicInformationChangeInput] =
    useState(DEFAULT_VALUE.isBasicInformationChangeInput);
  const [isLULCSummaryChangeInput, setIsLULCSummaryChangeInput] = useState(
    DEFAULT_VALUE.isLULCSummaryChangeInput,
  );
  const [selectedLULCSummaryEditSection, setSelectedLULCSummaryEditSection] =
    useState(DEFAULT_VALUE.selectedLULCSummaryEditSection);
  const [lulcParamsOpenAccordion, setLULCParamsOpenAccordion] = useState(
    DEFAULT_VALUE.lulcParamsOpenAccordion,
  );
  const [isAreaScopingLoading, setIsAreaScopingLoading] = useState(
    DEFAULT_VALUE.isAreaScopingLoading,
  );
  const [areaScopingPolygonError, setAreaScopingPolygonError] = useState(
    DEFAULT_VALUE.areaScopingPolygonError,
  );

  // LUC

  const [defaultArray, setDefaultArray] = useState<number[]>(
    DEFAULT_VALUE.defaultArray,
  );

  const [LUCfile, setLUCFile] = useState<File | null>(DEFAULT_VALUE.LUCfile);
  const [LUCfilename, setLUCFilename] = useState<string>(
    DEFAULT_VALUE.LUCfilename,
  );
  const [LUCfilesize, setLUCFilesize] = useState<number>(
    DEFAULT_VALUE.LUCfilesize,
  );

  const [lucQuickRows, setLucQuickRows] = useState<QuickTableRow[]>(
    DEFAULT_VALUE.lucQuickRows,
  );
  const [lucCustomTab, setLucCustomTab] = useState<LucCustomTab>(
    DEFAULT_VALUE.lucCustomTab,
  );
  const [lucQuickPhase, setLucQuickPhase] = useState<LucQuickPhase>(
    DEFAULT_VALUE.lucQuickPhase,
  );
  const [lucExcelConfirmed, setLucExcelConfirmed] = useState(
    DEFAULT_VALUE.lucExcelConfirmed,
  );
  const [lucDefaultConfirmed, setLucDefaultConfirmed] = useState(
    DEFAULT_VALUE.lucDefaultConfirmed,
  );
  const [lucView, setLucView] = useState<LucView>(DEFAULT_VALUE.lucView);

  const hasValidQuickRows = lucQuickRows.some((r) => r.name.trim() !== "");

  // Single source of truth for how LULC classes were defined. Priority:
  const lucSource: LucSource =
    defaultArray.length > 0
      ? "default"
      : LUCfile !== null
        ? "excel"
        : hasValidQuickRows
          ? "quick"
          : "";

  const selectedDefault = lucSource === "default";
  // "custom" = user-defined classes (quick table or uploaded excel). Drives
  // the outer custom-vs-default tab locking.
  const selectedCustom = lucSource === "excel" || lucSource === "quick";
  // Only the default scheme gets reference training points auto-placed; the
  // quick table and uploaded excel both place points manually.
  const isAutoPointsFlow = lucSource === "default";

  const [isLUCLoading, setIsLUCLoading] = useState(DEFAULT_VALUE.isLUCLoading);

  const [haveDownloadedFile, setHaveDownloadedFile] = useState(
    DEFAULT_VALUE.haveDownloadedFile,
  );

  const [classArray, setClassArray] = useState(DEFAULT_VALUE.classArray);

  const [pointingType, setPointingType] = useState(DEFAULT_VALUE.pointingType);
  const [selectedClass, setSelectedClass] = useState(
    DEFAULT_VALUE.selectedClass,
  );
  //

  const [trainingFile, setTrainingFile] = useState<File | null>(
    DEFAULT_VALUE.trainingFile,
  );
  const [trainingFilename, setTrainingFilename] = useState<string>(
    DEFAULT_VALUE.trainingFilename,
  );
  const [trainingFilesize, setTrainingFilesize] = useState<number>(
    DEFAULT_VALUE.trainingFilesize,
  );

  const [trainingFileError, setTrainingFileError] = useState<string>(
    DEFAULT_VALUE.trainingFileError,
  );

  const [uploadedFilesArray, setUploadedFilesArray] = useState<
    FileTrainingObject[]
  >(DEFAULT_VALUE.uploadedFilesArray);
  const [dataTrainingActiveTab, setDataTrainingActiveTab] =
    useState<DataTrainingActiveTab>(DEFAULT_VALUE.dataTrainingActiveTab);

  //

  const [isUploadingTrainingFile, setIsUploadingTrainingFile] = useState(
    DEFAULT_VALUE.isUploadingTrainingFile,
  );

  const [isUpdatingTrainingData, setIsUpdatingTrainingData] = useState(
    DEFAULT_VALUE.isUpdatingTrainingData,
  );

  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(
    DEFAULT_VALUE.isSummaryDialogOpen,
  );

  const [generateMapDataVisualization, setGenerateMapDataVisualization] =
    useState(DEFAULT_VALUE.generateMapDataVisualization);

  const [generateMapLULC, setGenerateMapLULC] = useState(
    DEFAULT_VALUE.generateMapLULC,
  );

  const [generateMapFeatureImportance, setGenerateMapFeatureImportance] =
    useState(DEFAULT_VALUE.generateMapFeatureImportance);

  const [generateMapModelQuality, setGenerateMapModelQuality] = useState(
    DEFAULT_VALUE.generateMapModelQuality,
  );

  const [generateMapDownloadURL, setGenerateMapDownloadURL] = useState(
    DEFAULT_VALUE.generateMapDownloadURL,
  );

  const [isMapGenerationLoading, setIsMapGenerationLoading] = useState(
    DEFAULT_VALUE.isMapGenerationLoading,
  );
  const [progress, setProgress] = useState(DEFAULT_VALUE.progress);
  const [totalProgress, setTotalProgress] = useState(
    DEFAULT_VALUE.totalProgress,
  );
  const [isGenerationError, setIsGenerationError] = useState(
    DEFAULT_VALUE.isGenerationError,
  );

  const [summaryData, setSummaryData] = useState<InputSummaryRes | null>(
    DEFAULT_VALUE.summaryData,
  );

  const [polygonData, setPolygonData] = useState<null | PolygonData>(null);

  const [isYourMapDialogVisible, setIsYourMapDialogVisible] = useState(
    DEFAULT_VALUE.isYourMapDialogVisible,
  );

  // FLOW

  const [isDefineLULCChanged, setIsDefineLULCChanged] = useState(
    DEFAULT_VALUE.isDefineLULCChanged,
  );

  const [isTrainingDataChanged, setIsTrainingDataChanged] = useState(
    DEFAULT_VALUE.isTrainingDataChanged,
  );

  const [sampleQuality, setSampleQuality] = useState(DEFAULT_VALUE.sampleQuality);
  const [sampleQualityComposite, setSampleQualityComposite] = useState(
    DEFAULT_VALUE.sampleQualityComposite,
  );

  const [isSampleQualityLoading, setIsSampleQualityLoading] = useState(
    DEFAULT_VALUE.isSampleQualityLoading,
  );

  const [sampleQualityError, setSampleQualityError] = useState(
    DEFAULT_VALUE.sampleQualityError,
  );
  const [sampleQualityConfirmed, setSampleQualityConfirmed] = useState(
    DEFAULT_VALUE.sampleQualityConfirmed,
  );
  const [sampleQualityGenerated, setSampleQualityGenerated] = useState(
    DEFAULT_VALUE.sampleQualityGenerated,
  );

  const [thematicAccuracy, setThematicAccuracy] = useState(
    DEFAULT_VALUE.thematicAccuracy,
  );

  const [isThematicAccuracyLoading, setIsThematicAccuracyLoading] = useState(
    DEFAULT_VALUE.isThematicAccuracyLoading,
  );

  const [thematicAccuracyError, setThematicAccuracyError] = useState(
    DEFAULT_VALUE.thematicAccuracyError,
  );

  const fetchSampleQuality = (
    sessionId: string,
    options?: SampleQualityOptions,
  ) => {
    setIsSampleQualityLoading(true);
    setSampleQualityError("");
    setSampleQuality(null);
    // A fresh result always needs a fresh confirmation.
    setSampleQualityConfirmed(false);

    // Optional analysis tuning (both fall back to the backend defaults:
    // scale = session spatial resolution, max pixels per class = 5000).
    const params = new URLSearchParams({ session_id: sessionId });
    if (options?.scale) params.set("scale", String(options.scale));
    if (options?.maxPixelsPerClass) {
      params.set("max_pixels_per_class", String(options.maxPixelsPerClass));
    }

    // The score is only valid for the composite it ran on (see
    // isScoreStaleForComposite); remember which one that was.
    const composite = { satelliteSource, maximumCloudCover };

    fetch(`${TRAINING_DATA_SEPARABILITY_URL}?${params}`)
      .then(async (res) => {
        const json: SampleQualityRes = await res.json();

        if (!res.ok) {
          throw new Error(json?.error?.message || String(res.status));
        }

        setSampleQuality(json.sample_quality);
        setSampleQualityComposite(composite);
        setSampleQualityGenerated(true);
      })
      .catch((err) => {
        setSampleQualityError(String(err?.message || err));
      })
      .finally(() => {
        setIsSampleQualityLoading(false);
      });
  };
  const [isLULCParamsChanged, setIsLULCParamsChanged] = useState(
    DEFAULT_VALUE.isLULCParamsChanged,
  );

  const [selectedPredictors, setSelectedPredictors] = useState<string[]>(
    DEFAULT_VALUE.selectedPredictors,
  );

  const [predictorListing, setPredictorListing] =
    useState<PredictorListing | null>(DEFAULT_VALUE.predictorListing);
  const [isPredictorListingLoading, setIsPredictorListingLoading] = useState(
    DEFAULT_VALUE.isPredictorListingLoading,
  );
  const [predictorListingError, setPredictorListingError] = useState(
    DEFAULT_VALUE.predictorListingError,
  );

  // Step 4's predictor options: what the backend says the session's
  // satellite and period support.
  const fetchPredictorListing = (sessionId: string) => {
    setIsPredictorListingLoading(true);
    setPredictorListingError("");

    fetchAvailablePredictors(sessionId)
      .then((listing) => {
        setPredictorListing(listing);
        // The listing also carries the session's saved optimizer result.
        setPredictorRecommendation((current) =>
          latestRecommendation(current, listing.recommendation),
        );
        // Drop what the session can no longer use (an old checkpoint, or the
        // satellite or period changed since the selection was made).
        setSelectedPredictors((current) =>
          pruneSelectedPredictors(current, listing),
        );
      })
      .catch((err) => {
        // Without a fresh answer the old options may be wrong: hide them.
        setPredictorListing(null);
        setPredictorListingError(String(err?.message || err));
      })
      .finally(() => {
        setIsPredictorListingLoading(false);
      });
  };

  const [predictorRecommendation, setPredictorRecommendation] =
    useState<PredictorRecommendation | null>(
      DEFAULT_VALUE.predictorRecommendation,
    );
  const [predictorOptimizerStatus, setPredictorOptimizerStatus] =
    useState<PredictorOptimizerStatus>(DEFAULT_VALUE.predictorOptimizerStatus);
  const [predictorOptimizerProgress, setPredictorOptimizerProgress] =
    useState<OptimizerProgress | null>(
      DEFAULT_VALUE.predictorOptimizerProgress,
    );
  const [predictorOptimizerError, setPredictorOptimizerError] = useState(
    DEFAULT_VALUE.predictorOptimizerError,
  );
  // The running request: a second start is ignored and a reset can stop it.
  const predictorOptimizerAbort = useRef<AbortController | null>(null);
  // `created` of the last result that was ticked automatically; each result
  // is applied at most once (see shouldAutoApplyRecommendation).
  const appliedPredictorRecommendation = useRef<string | null>(null);

  // The predictor optimizer runs here rather than in the step 4 panel, so
  // that moving between steps does not stop a run of several minutes.
  const startPredictorOptimizer = (sessionId: string) => {
    if (predictorOptimizerAbort.current) return;

    const controller = new AbortController();
    predictorOptimizerAbort.current = controller;
    setPredictorOptimizerStatus("running");
    setPredictorOptimizerProgress(null);
    setPredictorOptimizerError("");

    streamPredictorOptimizer(
      sessionId,
      { onProgress: setPredictorOptimizerProgress },
      controller.signal,
    )
      .then((recommendation) => {
        setPredictorRecommendation(recommendation);
        setPredictorOptimizerStatus("idle");
      })
      .catch((err) => {
        // Aborted by a session reset, which has already cleared the state.
        if (controller.signal.aborted) return;
        setPredictorOptimizerError(String(err?.message || err));
        setPredictorOptimizerStatus("error");
      })
      .finally(() => {
        if (predictorOptimizerAbort.current === controller) {
          predictorOptimizerAbort.current = null;
        }
      });
  };

  // "Use recommended": replace the selection with the recommendation.
  const applyPredictorRecommendation = () => {
    if (!predictorRecommendation) return;
    appliedPredictorRecommendation.current = predictorRecommendation.created;
    setSelectedPredictors(
      recommendedAvailableIds(predictorRecommendation, predictorListing),
    );
  };

  // Pre-selection: a current recommendation is ticked for a user who has
  // not chosen anything. Never for the default classification or once a map
  // exists, and never over an existing selection.
  useEffect(() => {
    if (!predictorRecommendation || !predictorListing) return;
    if (isAutoPointsFlow || isViewOnly(progressPanelIndex, stepKey)) return;
    if (
      !shouldAutoApplyRecommendation({
        recommendation: predictorRecommendation,
        selected: selectedPredictors,
        appliedCreated: appliedPredictorRecommendation.current,
      })
    ) {
      return;
    }

    appliedPredictorRecommendation.current = predictorRecommendation.created;
    setSelectedPredictors(
      recommendedAvailableIds(predictorRecommendation, predictorListing),
    );
  }, [predictorRecommendation, predictorListing]);

  const [predictorSeparability, setPredictorSeparability] =
    useState<PredictorSeparabilityResult | null>(
      DEFAULT_VALUE.predictorSeparability,
    );
  const [isPredictorSeparabilityLoading, setIsPredictorSeparabilityLoading] =
    useState(DEFAULT_VALUE.isPredictorSeparabilityLoading);
  const [predictorSeparabilityError, setPredictorSeparabilityError] = useState(
    DEFAULT_VALUE.predictorSeparabilityError,
  );
  // Bumped per check and on reset, so an answer to an older check is ignored.
  const predictorSeparabilityRequest = useRef(0);

  // Step 4: class separability with the ticked predictors, against the
  // satellite bands alone. Kept here so the result survives a step change.
  const checkPredictorSeparability = (
    sessionId: string,
    predictorIds: string[],
  ) => {
    predictorSeparabilityRequest.current += 1;
    const current = predictorSeparabilityRequest.current;
    setIsPredictorSeparabilityLoading(true);
    setPredictorSeparabilityError("");

    fetchPredictorSeparability(sessionId, predictorIds)
      .then((result) => {
        if (current !== predictorSeparabilityRequest.current) return;
        setPredictorSeparability(result);
      })
      .catch((err) => {
        if (current !== predictorSeparabilityRequest.current) return;
        setPredictorSeparabilityError(String(err?.message || err));
      })
      .finally(() => {
        if (current !== predictorSeparabilityRequest.current) return;
        setIsPredictorSeparabilityLoading(false);
      });
  };

  const [numberOfTrees, setNumberOfTrees] = useState<string>(
    DEFAULT_VALUE.numberOfTrees,
  );

  const [numberOfTreesError, setNumberOfTreesError] = useState<string>(
    DEFAULT_VALUE.numberOfTreesError,
  );

  const [minLeafPopulation, setMinLeafPopulation] = useState<string>(
    DEFAULT_VALUE.minLeafPopulation,
  );

  const [minLeafPopulationError, setMinLeafPopulationError] = useState<string>(
    DEFAULT_VALUE.minLeafPopulationError,
  );

  const [splitRatio, setSplitRatio] = useState<number>(
    DEFAULT_VALUE.splitRatio,
  );

  const [quickManualSampling, setQuickManualSampling] = useState(
    DEFAULT_VALUE.quickManualSampling,
  );

  const [isImprovementMode, setIsImprovementMode] = useState(
    DEFAULT_VALUE.isImprovementMode,
  );

  const [hasLeftStep1, setHasLeftStep1] = useState(DEFAULT_VALUE.hasLeftStep1);

  const [furthestProgressIndex, setFurthestProgressIndex] = useState(
    DEFAULT_VALUE.furthestProgressIndex,
  );
  // Moving forward raises the mark; only step resets lower it.
  useEffect(() => {
    setFurthestProgressIndex((furthest) =>
      Math.max(furthest, progressPanelIndex),
    );
  }, [progressPanelIndex]);

  const resetMapGenerationState = () => {
    setProgressPanelIndex(DEFAULT_VALUE.progressPanelIndex);
    setStepKey(DEFAULT_VALUE.stepKey);
    setBasicInformationOpenAccordion(
      DEFAULT_VALUE.basicInformationOpenAccordion,
    );
    setAreaScopingType(DEFAULT_VALUE.areaScopingType);
    setAreaScopingPolygonUrl(DEFAULT_VALUE.areaScopingPolygonUrl);
    setAreaScopingPolygonFileName(DEFAULT_VALUE.areaScopingPolygonFileName);
    setAreaScopingPolygonArea(DEFAULT_VALUE.areaScopingPolygonArea);
    setAreaScopingPolygonFileSize(DEFAULT_VALUE.areaScopingPolygonFileSize);
    setAreaScopingRegency(DEFAULT_VALUE.areaScopingRegency);
    setSpatialResolution(DEFAULT_VALUE.spatialResolution);
    setisEditingTemporalCoverage(DEFAULT_VALUE.isEditingTemporalCoverage);
    setTemporalCoverage(DEFAULT_VALUE.temporalCoverage);
    setTemporalCoverageUnit(DEFAULT_VALUE.temporalCoverageUnit);
    setIsEditingSatelliteComposite(DEFAULT_VALUE.isEditingSatelliteComposite);
    setSatelliteSource(DEFAULT_VALUE.satelliteSource);
    setMaximumCloudCover(DEFAULT_VALUE.maximumCloudCover);
    setIsAreaScopingLoading(DEFAULT_VALUE.isAreaScopingLoading);
    setIsBasicInformationChangeInput(
      DEFAULT_VALUE.isBasicInformationChangeInput,
    );
    setIsLULCSummaryChangeInput(DEFAULT_VALUE.isLULCSummaryChangeInput);
    setSelectedLULCSummaryEditSection(
      DEFAULT_VALUE.selectedLULCSummaryEditSection,
    );
    setLULCParamsOpenAccordion(DEFAULT_VALUE.lulcParamsOpenAccordion);
    setPolygonData(DEFAULT_VALUE.polygonData);
    setAreaScopingPolygonError(DEFAULT_VALUE.areaScopingPolygonError);
    setDefaultArray(DEFAULT_VALUE.defaultArray);
    setLucQuickRows(DEFAULT_VALUE.lucQuickRows);
    setLucCustomTab(DEFAULT_VALUE.lucCustomTab);
    setLucQuickPhase(DEFAULT_VALUE.lucQuickPhase);
    setLucExcelConfirmed(DEFAULT_VALUE.lucExcelConfirmed);
    setLucDefaultConfirmed(DEFAULT_VALUE.lucDefaultConfirmed);
    setLucView(DEFAULT_VALUE.lucView);
    setLUCFile(DEFAULT_VALUE.LUCfile);
    setLUCFilename(DEFAULT_VALUE.LUCfilename);
    setLUCFilesize(DEFAULT_VALUE.LUCfilesize);
    setIsLUCLoading(DEFAULT_VALUE.isLUCLoading);
    setHaveDownloadedFile(DEFAULT_VALUE.haveDownloadedFile);
    setTrainingFile(DEFAULT_VALUE.trainingFile);
    setTrainingFilename(DEFAULT_VALUE.trainingFilename);
    setTrainingFilesize(DEFAULT_VALUE.trainingFilesize);
    setTrainingFileError(DEFAULT_VALUE.trainingFileError);
    setUploadedFilesArray(DEFAULT_VALUE.uploadedFilesArray);
    setDataTrainingActiveTab(DEFAULT_VALUE.dataTrainingActiveTab);
    setClassArray(DEFAULT_VALUE.classArray);
    setPointingType(DEFAULT_VALUE.pointingType);
    setSelectedClass(DEFAULT_VALUE.selectedClass);
    setIsUploadingTrainingFile(DEFAULT_VALUE.isUploadingTrainingFile);
    setIsUpdatingTrainingData(DEFAULT_VALUE.isUpdatingTrainingData);
    setIsSummaryDialogOpen(DEFAULT_VALUE.isSummaryDialogOpen);
    setGenerateMapDataVisualization(DEFAULT_VALUE.generateMapDataVisualization);
    setGenerateMapLULC(DEFAULT_VALUE.generateMapLULC);
    setGenerateMapFeatureImportance(DEFAULT_VALUE.generateMapFeatureImportance);
    setGenerateMapModelQuality(DEFAULT_VALUE.generateMapModelQuality);
    setGenerateMapDownloadURL(DEFAULT_VALUE.generateMapDownloadURL);
    setIsMapGenerationLoading(DEFAULT_VALUE.isMapGenerationLoading);
    setProgress(DEFAULT_VALUE.progress);
    setTotalProgress(DEFAULT_VALUE.totalProgress);
    setIsGenerationError(DEFAULT_VALUE.isGenerationError);
    setSummaryData(DEFAULT_VALUE.summaryData);
    setIsDefineLULCChanged(DEFAULT_VALUE.isDefineLULCChanged);
    setIsTrainingDataChanged(DEFAULT_VALUE.isTrainingDataChanged);
    setSampleQuality(DEFAULT_VALUE.sampleQuality);
    setIsSampleQualityLoading(DEFAULT_VALUE.isSampleQualityLoading);
    setSampleQualityError(DEFAULT_VALUE.sampleQualityError);
    setSampleQualityConfirmed(DEFAULT_VALUE.sampleQualityConfirmed);
    setSampleQualityGenerated(DEFAULT_VALUE.sampleQualityGenerated);
    setThematicAccuracy(DEFAULT_VALUE.thematicAccuracy);
    setIsThematicAccuracyLoading(DEFAULT_VALUE.isThematicAccuracyLoading);
    setThematicAccuracyError(DEFAULT_VALUE.thematicAccuracyError);
    setIsLULCParamsChanged(DEFAULT_VALUE.isLULCParamsChanged);
    setIsYourMapDialogVisible(DEFAULT_VALUE.isYourMapDialogVisible);
    setSelectedPredictors(DEFAULT_VALUE.selectedPredictors);
    setPredictorListing(DEFAULT_VALUE.predictorListing);
    setIsPredictorListingLoading(DEFAULT_VALUE.isPredictorListingLoading);
    setPredictorListingError(DEFAULT_VALUE.predictorListingError);
    predictorOptimizerAbort.current?.abort();
    predictorOptimizerAbort.current = null;
    appliedPredictorRecommendation.current = null;
    setPredictorRecommendation(DEFAULT_VALUE.predictorRecommendation);
    setPredictorOptimizerStatus(DEFAULT_VALUE.predictorOptimizerStatus);
    setPredictorOptimizerProgress(DEFAULT_VALUE.predictorOptimizerProgress);
    setPredictorOptimizerError(DEFAULT_VALUE.predictorOptimizerError);
    predictorSeparabilityRequest.current += 1;
    setPredictorSeparability(DEFAULT_VALUE.predictorSeparability);
    setIsPredictorSeparabilityLoading(
      DEFAULT_VALUE.isPredictorSeparabilityLoading,
    );
    setPredictorSeparabilityError(DEFAULT_VALUE.predictorSeparabilityError);
    setNumberOfTrees(DEFAULT_VALUE.numberOfTrees);
    setNumberOfTreesError(DEFAULT_VALUE.numberOfTreesError);
    setMinLeafPopulation(DEFAULT_VALUE.minLeafPopulation);
    setMinLeafPopulationError(DEFAULT_VALUE.minLeafPopulationError);
    setSplitRatio(DEFAULT_VALUE.splitRatio);
    setQuickManualSampling(DEFAULT_VALUE.quickManualSampling);
    setIsImprovementMode(DEFAULT_VALUE.isImprovementMode);
    setHasLeftStep1(DEFAULT_VALUE.hasLeftStep1);
    setFurthestProgressIndex(DEFAULT_VALUE.furthestProgressIndex);
    setSampleQualityComposite(DEFAULT_VALUE.sampleQualityComposite);

    if (typeof document === "undefined") return;

    [
      "area-scoping-file-upload",
      "luc-template-file-upload",
      "data-training-file-upload",
    ].forEach((id) => {
      const input = document.getElementById(id) as HTMLInputElement | null;

      if (input) {
        input.value = "";
      }
    });
  };

  const providedValue = {
    progressPanelIndex,
    setProgressPanelIndex,
    stepKey,
    setStepKey,
    basicInformationOpenAccordion,
    setBasicInformationOpenAccordion,
    areaScopingType,
    setAreaScopingType,
    areaScopingPolygonUrl,
    setAreaScopingPolygonUrl,
    areaScopingPolygonFileName,
    setAreaScopingPolygonFileName,
    areaScopingPolygonArea,
    setAreaScopingPolygonArea,
    areaScopingPolygonFileSize,
    setAreaScopingPolygonFileSize,
    areaScopingRegency,
    setAreaScopingRegency,
    spatialResolution,
    setSpatialResolution,
    isEditingTemporalCoverage,
    setisEditingTemporalCoverage,
    temporalCoverage,
    setTemporalCoverage,
    temporalCoverageUnit,
    setTemporalCoverageUnit,
    isEditingSatelliteComposite,
    setIsEditingSatelliteComposite,
    satelliteSource,
    setSatelliteSource,
    maximumCloudCover,
    setMaximumCloudCover,
    isBasicInformationChangeInput,
    setIsBasicInformationChangeInput,
    isLULCSummaryChangeInput,
    setIsLULCSummaryChangeInput,
    selectedLULCSummaryEditSection,
    setSelectedLULCSummaryEditSection,
    lulcParamsOpenAccordion,
    setLULCParamsOpenAccordion,
    polygonData,
    setPolygonData,
    isAreaScopingLoading,
    setIsAreaScopingLoading,
    areaScopingPolygonError,
    setAreaScopingPolygonError,
    defaultArray,
    selectedDefault,
    selectedCustom,
    lucSource,
    isAutoPointsFlow,
    lucQuickRows,
    lucCustomTab,
    lucQuickPhase,
    lucExcelConfirmed,
    lucDefaultConfirmed,
    lucView,
    LUCfile,
    LUCfilename,
    LUCfilesize,
    isLUCLoading,
    setDefaultArray,
    setLucQuickRows,
    setLucCustomTab,
    setLucQuickPhase,
    setLucExcelConfirmed,
    setLucDefaultConfirmed,
    setLucView,
    setLUCFile,
    setLUCFilename,
    setLUCFilesize,
    setIsLUCLoading,
    haveDownloadedFile,
    setHaveDownloadedFile,
    trainingFile,
    trainingFilename,
    trainingFilesize,
    trainingFileError,
    uploadedFilesArray,
    dataTrainingActiveTab,
    setTrainingFile,
    setTrainingFilename,
    setTrainingFilesize,
    setTrainingFileError,
    setUploadedFilesArray,
    setDataTrainingActiveTab,
    classArray,
    setClassArray,
    pointingType,
    setPointingType,
    selectedClass,
    setSelectedClass,
    isUploadingTrainingFile,
    setIsUploadingTrainingFile,
    isUpdatingTrainingData,
    setIsUpdatingTrainingData,
    sampleQuality,
    setSampleQuality,
    isSampleQualityLoading,
    setIsSampleQualityLoading,
    sampleQualityError,
    setSampleQualityError,
    sampleQualityConfirmed,
    setSampleQualityConfirmed,
    sampleQualityGenerated,
    setSampleQualityGenerated,
    fetchSampleQuality,
    thematicAccuracy,
    setThematicAccuracy,
    isThematicAccuracyLoading,
    setIsThematicAccuracyLoading,
    thematicAccuracyError,
    setThematicAccuracyError,
    isSummaryDialogOpen,
    setIsSummaryDialogOpen,
    // mapGenerationResult,
    // setMapGenerationResult,
    generateMapDataVisualization,
    setGenerateMapDataVisualization,
    generateMapLULC,
    setGenerateMapLULC,
    generateMapFeatureImportance,
    setGenerateMapFeatureImportance,
    generateMapModelQuality,
    setGenerateMapModelQuality,
    generateMapDownloadURL,
    setGenerateMapDownloadURL,
    isMapGenerationLoading,
    setIsMapGenerationLoading,
    progress,
    setProgress,
    totalProgress,
    setTotalProgress,
    isGenerationError,
    setIsGenerationError,
    summaryData,
    setSummaryData,
    isDefineLULCChanged,
    setIsDefineLULCChanged,
    isTrainingDataChanged,
    setIsTrainingDataChanged,
    isLULCParamsChanged,
    setIsLULCParamsChanged,
    isYourMapDialogVisible,
    setIsYourMapDialogVisible,
    selectedPredictors,
    setSelectedPredictors,
    predictorListing,
    isPredictorListingLoading,
    predictorListingError,
    fetchPredictorListing,
    predictorRecommendation,
    predictorOptimizerStatus,
    predictorOptimizerProgress,
    predictorOptimizerError,
    startPredictorOptimizer,
    applyPredictorRecommendation,
    predictorSeparability,
    isPredictorSeparabilityLoading,
    predictorSeparabilityError,
    checkPredictorSeparability,
    numberOfTrees,
    setNumberOfTrees,
    numberOfTreesError,
    setNumberOfTreesError,
    minLeafPopulation,
    setMinLeafPopulation,
    minLeafPopulationError,
    setMinLeafPopulationError,
    splitRatio,
    setSplitRatio,
    isImprovementMode,
    setIsImprovementMode,
    hasLeftStep1,
    setHasLeftStep1,
    furthestProgressIndex,
    setFurthestProgressIndex,
    sampleQualityComposite,
    resetMapGenerationState,
    quickManualSampling,
    setQuickManualSampling,
  };

  // useEffect(() => {
  //   console.log("class array", classArray);
  // }, [classArray]);

  return (
    <MapGenerationContext.Provider value={providedValue}>
      {props.children}
    </MapGenerationContext.Provider>
  );
};

export { MapGenerationContextContainer, MapGenerationContext };
