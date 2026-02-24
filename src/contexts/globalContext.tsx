"use client";

import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useState,
} from "react";

export enum SATELLITE {
  LANDSAT8 = "LC08",
  LANDSAT9 = "LC09",
}

export interface AnalysisConfig {
  start_date: string;
  end_date: string;
  landsat_version: SATELLITE;
  cloud_cover: number;
  test_timeout?: boolean;
  session_id?: string;
  training_filename?: string;
  validation_filename?: string;
  use_own_dataset?: boolean;
}

export interface AnalysisResult {
  kappa_coefficient: number;
  overall_accuracy: number;
  accuracy_assessment: string;
}

interface ContextType {
  sessionId: string;
  setSessionId: Dispatch<SetStateAction<string>>;
  polygonData: PolygonData | null;
  setPolygonData: Dispatch<SetStateAction<null | PolygonData>>;
  analysisConfig: AnalysisConfig | null;
  setAnalysisConfig: Dispatch<SetStateAction<null | AnalysisConfig>>;
  analysisResult: AnalysisResult | null;
  setAnalysisResult: Dispatch<SetStateAction<null | AnalysisResult>>;
}

const DEFAULT_VALUE: ContextType = {
  polygonData: null,
  setPolygonData: () => {},
  analysisConfig: null,
  setAnalysisConfig: () => {},
  analysisResult: null,
  setAnalysisResult: () => {},
  // sessionId: "",
  // WIP
  sessionId: "b9214cca-bcae-4d7e-983f-f6651ccb476b",
  setSessionId: () => {},
};

const GlobalContext = createContext(DEFAULT_VALUE);

const GlobalContextContainer = (props: PropsWithChildren) => {
  const [sessionId, setSessionId] = useState<string>(DEFAULT_VALUE.sessionId);
  const [polygonData, setPolygonData] = useState<null | PolygonData>(null);
  const [analysisConfig, setAnalysisConfig] = useState<null | AnalysisConfig>(
    null,
  );
  const [analysisResult, setAnalysisResult] = useState<null | AnalysisResult>(
    null,
  );

  const providedValue = {
    polygonData,
    setPolygonData,
    analysisConfig,
    setAnalysisConfig,
    analysisResult,
    setAnalysisResult,
    sessionId,
    setSessionId,
  };

  return (
    <GlobalContext.Provider value={providedValue}>
      {props.children}
    </GlobalContext.Provider>
  );
};

export { GlobalContextContainer, GlobalContext };
