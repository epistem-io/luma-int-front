"use client";

import {
  AREA_SCOPING_TYPE,
  PANEL_COMPONENT_KEY,
  POINTING_TYPE,
} from "@/constants";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useState,
} from "react";

interface PolygonData {
  area_size: number;
  id: string;
  // session_id: string;
}

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
  //
  polygonData: PolygonData | null;
  setPolygonData: Dispatch<SetStateAction<null | PolygonData>>;
  areaScopingPolygonError: string;
  setAreaScopingPolygonError: Dispatch<SetStateAction<string>>;
  // LUC
  defaultArray: number[];
  selectedDefault: boolean;
  selectedCustom: boolean;
  LUCfile: File | null;
  LUCfilename: string;
  LUCfilesize: number;
  isLUCLoading: boolean;
  haveDownloadedFile: boolean;
  setDefaultArray: Dispatch<SetStateAction<number[]>>;
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
  setTrainingFile: Dispatch<SetStateAction<File | null>>;
  setTrainingFilename: Dispatch<SetStateAction<string>>;
  setTrainingFilesize: Dispatch<SetStateAction<number>>;
  setTrainingFileError: Dispatch<SetStateAction<string>>;
  setUploadedFilesArray: Dispatch<SetStateAction<FileTrainingObject[]>>;
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
  generateMapSampleQuality: GenerateMapDataSampleDataQuality | null;
  setGenerateMapSampleQuality: Dispatch<
    SetStateAction<GenerateMapDataSampleDataQuality | null>
  >;
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
  summaryData: InputSummaryRes | null;
  setSummaryData: Dispatch<SetStateAction<InputSummaryRes | null>>;
  isDefineLULCChanged: boolean;
  setIsDefineLULCChanged: Dispatch<SetStateAction<boolean>>;
  isTrainingDataChanged: boolean;
  setIsTrainingDataChanged: Dispatch<SetStateAction<boolean>>;
  isLULCParamsChanged: boolean;
  setIsLULCParamsChanged: Dispatch<SetStateAction<boolean>>;
  isYourMapDialogVisible: boolean;
  setIsYourMapDialogVisible: Dispatch<SetStateAction<boolean>>;
  selectedPredictors: string[];
  setSelectedPredictors: Dispatch<SetStateAction<string[]>>;
  numberOfTrees: string;
  setNumberOfTrees: Dispatch<SetStateAction<string>>;
  numberOfTreesError: string;
  setNumberOfTreesError: Dispatch<SetStateAction<string>>;
  minLeafPopulation: string;
  setMinLeafPopulation: Dispatch<SetStateAction<string>>;
  minLeafPopulationError: string;
  setMinLeafPopulationError: Dispatch<SetStateAction<string>>;
  resetMapGenerationState: () => void;
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
  satelliteSource: "L8_SR",
  setSatelliteSource: () => {},
  maximumCloudCover: 30,
  setMaximumCloudCover: () => {},
  isBasicInformationChangeInput: false,
  setIsBasicInformationChangeInput: () => {},
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
  LUCfile: null,
  LUCfilename: "",
  LUCfilesize: 0,
  isLUCLoading: false,
  haveDownloadedFile: false,
  setDefaultArray: () => {},
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
  setTrainingFile: () => {},
  setTrainingFilename: () => {},
  setTrainingFilesize: () => {},
  setTrainingFileError: () => {},
  setUploadedFilesArray: () => {},
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
  generateMapSampleQuality: null,
  setGenerateMapSampleQuality: () => {},
  generateMapFeatureImportance: null,
  setGenerateMapFeatureImportance: () => {},
  generateMapModelQuality: null,
  setGenerateMapModelQuality: () => {},
  generateMapDownloadURL: null,
  setGenerateMapDownloadURL: () => {},
  summaryData: null,
  setSummaryData: () => {},
  isDefineLULCChanged: true,
  setIsDefineLULCChanged: () => {},
  isTrainingDataChanged: true,
  setIsTrainingDataChanged: () => {},
  isLULCParamsChanged: true,
  setIsLULCParamsChanged: () => {},
  isYourMapDialogVisible: false,
  setIsYourMapDialogVisible: () => {},
  selectedPredictors: [],
  setSelectedPredictors: () => {},
  numberOfTrees: "150",
  setNumberOfTrees: () => {},
  numberOfTreesError: "",
  setNumberOfTreesError: () => {},
  minLeafPopulation: "1",
  setMinLeafPopulation: () => {},
  minLeafPopulationError: "",
  setMinLeafPopulationError: () => {},
  resetMapGenerationState: () => {},
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
  const selectedDefault = defaultArray.length > 0;

  const [LUCfile, setLUCFile] = useState<File | null>(DEFAULT_VALUE.LUCfile);
  const selectedCustom = !selectedDefault && LUCfile !== null;
  const [LUCfilename, setLUCFilename] = useState<string>(
    DEFAULT_VALUE.LUCfilename,
  );
  const [LUCfilesize, setLUCFilesize] = useState<number>(
    DEFAULT_VALUE.LUCfilesize,
  );

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

  const [generateMapSampleQuality, setGenerateMapSampleQuality] = useState(
    DEFAULT_VALUE.generateMapSampleQuality,
  );

  const [generateMapFeatureImportance, setGenerateMapFeatureImportance] =
    useState(DEFAULT_VALUE.generateMapFeatureImportance);

  const [generateMapModelQuality, setGenerateMapModelQuality] = useState(
    DEFAULT_VALUE.generateMapModelQuality,
  );

  const [generateMapDownloadURL, setGenerateMapDownloadURL] = useState(
    DEFAULT_VALUE.generateMapDownloadURL,
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

  const [isLULCParamsChanged, setIsLULCParamsChanged] = useState(
    DEFAULT_VALUE.isLULCParamsChanged,
  );

  const [selectedPredictors, setSelectedPredictors] = useState<string[]>(
    DEFAULT_VALUE.selectedPredictors,
  );

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
    setPolygonData(DEFAULT_VALUE.polygonData);
    setAreaScopingPolygonError(DEFAULT_VALUE.areaScopingPolygonError);
    setDefaultArray(DEFAULT_VALUE.defaultArray);
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
    setClassArray(DEFAULT_VALUE.classArray);
    setPointingType(DEFAULT_VALUE.pointingType);
    setSelectedClass(DEFAULT_VALUE.selectedClass);
    setIsUploadingTrainingFile(DEFAULT_VALUE.isUploadingTrainingFile);
    setIsUpdatingTrainingData(DEFAULT_VALUE.isUpdatingTrainingData);
    setIsSummaryDialogOpen(DEFAULT_VALUE.isSummaryDialogOpen);
    setGenerateMapDataVisualization(DEFAULT_VALUE.generateMapDataVisualization);
    setGenerateMapLULC(DEFAULT_VALUE.generateMapLULC);
    setGenerateMapSampleQuality(DEFAULT_VALUE.generateMapSampleQuality);
    setGenerateMapFeatureImportance(DEFAULT_VALUE.generateMapFeatureImportance);
    setGenerateMapModelQuality(DEFAULT_VALUE.generateMapModelQuality);
    setGenerateMapDownloadURL(DEFAULT_VALUE.generateMapDownloadURL);
    setSummaryData(DEFAULT_VALUE.summaryData);
    setIsDefineLULCChanged(DEFAULT_VALUE.isDefineLULCChanged);
    setIsTrainingDataChanged(DEFAULT_VALUE.isTrainingDataChanged);
    setIsLULCParamsChanged(DEFAULT_VALUE.isLULCParamsChanged);
    setIsYourMapDialogVisible(DEFAULT_VALUE.isYourMapDialogVisible);
    setSelectedPredictors(DEFAULT_VALUE.selectedPredictors);
    setNumberOfTrees(DEFAULT_VALUE.numberOfTrees);
    setNumberOfTreesError(DEFAULT_VALUE.numberOfTreesError);
    setMinLeafPopulation(DEFAULT_VALUE.minLeafPopulation);
    setMinLeafPopulationError(DEFAULT_VALUE.minLeafPopulationError);

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
    polygonData,
    setPolygonData,
    isAreaScopingLoading,
    setIsAreaScopingLoading,
    areaScopingPolygonError,
    setAreaScopingPolygonError,
    defaultArray,
    selectedDefault,
    selectedCustom,
    LUCfile,
    LUCfilename,
    LUCfilesize,
    isLUCLoading,
    setDefaultArray,
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
    setTrainingFile,
    setTrainingFilename,
    setTrainingFilesize,
    setTrainingFileError,
    setUploadedFilesArray,
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
    isSummaryDialogOpen,
    setIsSummaryDialogOpen,
    // mapGenerationResult,
    // setMapGenerationResult,
    generateMapDataVisualization,
    setGenerateMapDataVisualization,
    generateMapLULC,
    setGenerateMapLULC,
    generateMapSampleQuality,
    setGenerateMapSampleQuality,
    generateMapFeatureImportance,
    setGenerateMapFeatureImportance,
    generateMapModelQuality,
    setGenerateMapModelQuality,
    generateMapDownloadURL,
    setGenerateMapDownloadURL,
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
    numberOfTrees,
    setNumberOfTrees,
    numberOfTreesError,
    setNumberOfTreesError,
    minLeafPopulation,
    setMinLeafPopulation,
    minLeafPopulationError,
    setMinLeafPopulationError,
    resetMapGenerationState,
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
