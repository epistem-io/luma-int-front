"use client";

import {
  AREA_SCOPING_TYPE,
  SATELLITE_OPTIONS_ARRAY,
  TEMPORAL_COVERAGE_ARRAY,
} from "@/constants";
import { MapContext } from "@/contexts/mapContext";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { TFunction } from "@/i18n/types";
import { formatRegencyLabel } from "@/lib/regency";
import { getTemporalRangeText } from "@/lib/utils";
import { getClassInputMethods } from "@/lib/lucFlow";
import { useLocale, useTranslations } from "next-intl";
import { useContext, useMemo } from "react";
import { LULC_PREDICTORS } from "./lulcPredictors";

// Display strings shared by the step summaries and the final summary dialog,
// so each input is worded the same everywhere it is summarised.

export const useBasicInformationLabels = () => {
  const t = useTranslations("InteractivePanel");
  const locale = useLocale();
  const {
    areaScopingType,
    areaScopingRegency,
    spatialResolution,
    temporalCoverage,
    temporalCoverageUnit,
    satelliteSource,
  } = useContext(MapGenerationContext);

  // Same wording as the resolution picker (AreaScopingAccordion /
  // SpatialResolutionSelect); falls back to the raw value for unknown ones.
  const spatialResolutionLabelMap: Record<string, string> = {
    "10": t("areaScoping.10x10m2"),
    "30": t("areaScoping.30x30m2"),
    "100": t("areaScoping.100x100m2"),
    "500": t("areaScoping.500x500m2"),
    "1000": t("areaScoping.1x1km2"),
  };

  const inputMethodLabelMap: Record<AREA_SCOPING_TYPE, string> = {
    [AREA_SCOPING_TYPE.UPLOAD]: t("basicInformation.inputMethodUpload"),
    [AREA_SCOPING_TYPE.DRAW]: t("basicInformation.inputMethodDraw"),
    [AREA_SCOPING_TYPE.REGENCY]: t("basicInformation.inputMethodRegency"),
  };

  return {
    spatialResolutionLabel: spatialResolution
      ? (spatialResolutionLabelMap[spatialResolution] ??
        `${spatialResolution} m`)
      : undefined,
    inputMethodLabel: inputMethodLabelMap[areaScopingType],
    // Only the district/city picker gives a named place.
    locationLabel:
      areaScopingType === AREA_SCOPING_TYPE.REGENCY && areaScopingRegency
        ? formatRegencyLabel(areaScopingRegency)
        : undefined,
    temporalResolutionLabel:
      TEMPORAL_COVERAGE_ARRAY.find(
        (item) => item.value === temporalCoverage,
      )?.labelFunction(t as TFunction) || "Error",
    dateRangeLabel: getTemporalRangeText(
      temporalCoverage,
      temporalCoverageUnit,
      locale,
    ),
    satelliteLabel:
      SATELLITE_OPTIONS_ARRAY.find((item) => item.value === satelliteSource)
        ?.label ?? satelliteSource,
  };
};

export const useClassificationSchemeLabels = () => {
  const t = useTranslations("InteractivePanel");
  const { lucSource, lucQuickRows } = useContext(MapGenerationContext);

  // Own classes may mix uploaded and typed rows: name every method used,
  // e.g. "Upload Classes + Manual Input".
  const methods = getClassInputMethods(lucQuickRows, lucSource);
  const inputMethodLabel =
    lucSource === "excel" || lucSource === "quick"
      ? [
          methods.upload && t("defineLUC.excelTemplateTab"),
          methods.manual && t("defineLUC.quickTableTab"),
        ]
          .filter(Boolean)
          .join(" + ") || undefined
      : undefined;

  return {
    schemeLabel:
      lucSource === "default"
        ? t("defineLUC.useDefaultScheme")
        : t("defineLUC.classifyOwnTemplate"),
    inputMethodLabel,
  };
};

export const useSampleDataSummary = () => {
  const t = useTranslations("InteractivePanel");
  const { markerArray } = useContext(MapContext);
  const { classArray, uploadedFilesArray, lucSource } =
    useContext(MapGenerationContext);

  const ossPointCount = markerArray.filter(
    (marker) => marker.source === "oss",
  ).length;
  const hasUpload = uploadedFilesArray.length > 0;

  // The default scheme uses Luma's auto-placed reference points; own
  // classes come from uploaded files, on-screen sampling, or both.
  const sourceLabel =
    lucSource === "default"
      ? t("dataTraining.sourceReference")
      : hasUpload && ossPointCount > 0
        ? t("dataTraining.sourceUploadAndOss")
        : hasUpload
          ? t("dataTraining.sourceUpload")
          : ossPointCount > 0
            ? t("dataTraining.sourceOss")
            : "-";

  const classRows = useMemo(
    () =>
      classArray.map((item) => ({
        name: item.class_name,
        color: item.class_color,
        points: markerArray.filter((marker) => marker.class_id === item.class_id)
          .length,
      })),
    [classArray, markerArray],
  );

  return {
    sourceLabel,
    hasUpload,
    uploadedFileNames: uploadedFilesArray.map((file) => file.filename).join(", "),
    ossPointCount,
    totalPoints: markerArray.length,
    classRows,
  };
};

export const useSelectedPredictorLabels = () => {
  const { selectedPredictors } = useContext(MapGenerationContext);

  return useMemo(
    () =>
      LULC_PREDICTORS.filter((predictor) =>
        selectedPredictors.includes(predictor.value),
      ).map((predictor) => predictor.label),
    [selectedPredictors],
  );
};

export const sampleQualityOverallKey = (overall: SampleQualityOverall) =>
  overall === "good"
    ? "dataTraining.sampleQualityGood"
    : overall === "med"
      ? "dataTraining.sampleQualityMed"
      : "dataTraining.sampleQualityPoor";
