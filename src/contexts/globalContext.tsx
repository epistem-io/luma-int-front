"use client";

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
  session_id: string;
}

export enum SATELLITE {
  LANDSAT8 = "LC08",
  LANDSAT9 = "LC09",
}

export interface AnalysisConfig {
  session_id: string;
  start_date: string;
  end_date: string;
  landsat_version: SATELLITE;
  cloud_cover: number;
}

export interface AnalysisResult {
  kappa_coefficient: number;
  overall_accuracy: number;
  accuracy_assessment: string;
}

interface ContextType {
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
};

const GlobalContext = createContext(DEFAULT_VALUE);

const GlobalContextContainer = (props: PropsWithChildren) => {
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
  };

  return (
    <GlobalContext.Provider value={providedValue}>
      {props.children}
    </GlobalContext.Provider>
  );
};

export { GlobalContextContainer, GlobalContext };
