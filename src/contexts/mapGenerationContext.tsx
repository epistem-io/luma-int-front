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

const TEMP_ARR: LUCClass[] = [
  {
    class_color: "#5a9a67",
    class_id: 1,
    class_name: "Karet",
  },
  {
    class_color: "#bbbb5a",
    class_id: 2,
    class_name: "Kelapa Sawit",
  },
  {
    class_color: "#111eda",
    class_id: 3,
    class_name: "Tubuh Air",
  },
  {
    class_color: "#da0407",
    class_id: 4,
    class_name: "Permukiman",
  },
];

// const TEMP_ARR: LUCClass[] = [
//   {
//     class_id: 1,
//     class_name: "Hunian",
//     class_color: "#FF0000",
//   },
//   {
//     class_id: 2,
//     class_name: "Hutan",
//     class_color: "#00FF00",
//   },
//   {
//     class_id: 3,
//     class_name: "Badan Air",
//     class_color: "#0000FF",
//   },
// ];

interface PolygonData {
  area_size: number;
  id: string;
  // session_id: string;
}

interface ContextType {
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
  isEditingTemporalCoverage: boolean;
  setisEditingTemporalCoverage: Dispatch<SetStateAction<boolean>>;
  temporalCoverage: string;
  setTemporalCoverage: Dispatch<SetStateAction<string>>;
  temporalCoverageUnit: string;
  setTemporalCoverageUnit: Dispatch<SetStateAction<string>>;
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
}

const DEFAULT_VALUE: ContextType = {
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
  isEditingTemporalCoverage: true,
  setisEditingTemporalCoverage: () => {},
  temporalCoverage: "",
  setTemporalCoverage: () => {},
  temporalCoverageUnit: "",
  setTemporalCoverageUnit: () => {},
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
  classArray: TEMP_ARR,
  setClassArray: () => {},
  pointingType: POINTING_TYPE.EMPTY,
  setPointingType: () => {},
  selectedClass: "",
  setSelectedClass: () => {},
  isUploadingTrainingFile: false,
  setIsUploadingTrainingFile: () => {},
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
  const [isEditingTemporalCoverage, setisEditingTemporalCoverage] = useState(
    DEFAULT_VALUE.isEditingTemporalCoverage,
  );
  const [temporalCoverage, setTemporalCoverage] = useState(
    DEFAULT_VALUE.temporalCoverage,
  );
  const [temporalCoverageUnit, setTemporalCoverageUnit] = useState(
    DEFAULT_VALUE.temporalCoverageUnit,
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

  const [LUCfile, setLUCFile] = useState<File | null>(DEFAULT_VALUE.LUCfile);
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
    isEditingTemporalCoverage,
    setisEditingTemporalCoverage,
    temporalCoverage,
    setTemporalCoverage,
    temporalCoverageUnit,
    setTemporalCoverageUnit,
    isBasicInformationChangeInput,
    setIsBasicInformationChangeInput,
    polygonData,
    setPolygonData,
    isAreaScopingLoading,
    setIsAreaScopingLoading,
    areaScopingPolygonError,
    setAreaScopingPolygonError,
    defaultArray,
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
  };

  return (
    <MapGenerationContext.Provider value={providedValue}>
      {props.children}
    </MapGenerationContext.Provider>
  );
};

export { MapGenerationContextContainer, MapGenerationContext };
