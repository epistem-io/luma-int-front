import { TFunction } from "./i18n/types";

export enum PANEL_COMPONENT_KEY {
  NULL = "",
  BASIC_INFORMATION = "basic_information",
  AREA_SCOPING = "area_scoping",
  BASIC_INFORMATION_SUMMARY = "basic_information_summary",
  DEFINE_LUC = "define_luc",
  DATA_TRAINING = "data_training",
  OSS = "oss",
  LULC_PARAMS = "lulc_params",
  LULC_PARAMS_SUMMARY = "lulc_params_summary",
  YOUR_MAP = "your_map",
}

export enum AREA_SCOPING_TYPE {
  UPLOAD = "upload",
  DRAW = "draw",
  REGENCY = "regency",
}

export enum BASIC_INFORMATION_ACCORDION_TYPE {
  SCOPING = "scoping",
  PERIOD = "period",
  COMPOSITE = "composite",
}

export enum BASEMAP_TYPE {
  GREY = "grey",
  OSM = "osm",
  SATELLITE = "satellite",
}

export const AREA_SCOPING_FILE_SIZE_LIMIT = 1024 * 1024 * 5;
export const AREA_SCOPING_POLYGON_AREA_LIMIT = 1000000;

export const LUC_TEMPLATE_FILE_SIZE_LIMIT = 1024 * 1024 * 5;

export const DATA_TRAINING_FILE_SIZE_LIMIT = 1024 * 1024 * 5;

export const TEMPORAL_COVERAGE_ARRAY = [
  {
    value: "1",
    labelFunction: (i18n: TFunction) => i18n("timePeriod.byYear"),
    label: "By Year",
    // default: true,
  },
  {
    value: "2",
    labelFunction: (i18n: TFunction) => i18n("timePeriod.bySemester"),
    label: "By Semester (coming soon)",
    disabled: true,
  },
  {
    value: "3",
    labelFunction: (i18n: TFunction) => i18n("timePeriod.byQuarter"),
    label: "By Quarter (coming soon)",
    disabled: true,
  },
  {
    value: "4",
    labelFunction: (i18n: TFunction) => i18n("timePeriod.byMonth"),
    label: "By Month (coming soon)",
    disabled: true,
  },
  {
    value: "5",
    labelFunction: (i18n: TFunction) => i18n("timePeriod.customDate"),
    label: "Custom Date (coming soon)",
    disabled: true,
  },
];

export const FETCH_UPLOAD_URL = `${process.env.NEXT_PUBLIC_API_URL}/geos/aoi/upload`;
export const FETCH_POLYGON_URL = `${process.env.NEXT_PUBLIC_API_URL}/geos/aoi`;
export const FETCH_REGENCY_LIST_URL = `${process.env.NEXT_PUBLIC_API_URL}/geos/aoi/regencies`;
export const FETCH_REGENCY_AOI_URL = `${process.env.NEXT_PUBLIC_API_URL}/geos/aoi/regency`;

export const GET_MOSAIC_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/luma/image-mosaic`;
export const GET_MOSAIC_DOWNLOAD_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/luma/image-mosaic/download-url`;
export const DOWNLOAD_REQUEST_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/luma/download-request`;
export const SHARE_MAP_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/luma/share-map`;

export const LUC_UPLOAD_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/luma/lulc-classes/upload`;
export const LUC_UPDATE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/luma/lulc-classes`;

export const TRAINING_DATA_UPLOAD_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/luma/training-data/upload`;
export const TRAINING_DATA_UPDATE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/luma/training-data`;
export const TRAINING_DATA_SEPARABILITY_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/luma/training-data/separability`;
export const THEMATIC_ACCURACY_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/luma/thematic-accuracy`;

// Selectable swatches for the LULC class color picker (7-column grid).
export const LULC_CLASS_COLOR_PALETTE = [
  "#14532D",
  "#3D9970",
  "#6FCF6F",
  "#8BC53F",
  "#DDE26A",
  "#D3E4AC",
  "#F2C511",
  "#1B2A5B",
  "#37474F",
  "#1565E0",
  "#19A7E8",
  "#6C63FF",
  "#00778B",
  "#17B8A6",
  "#C2477F",
  "#F43F5E",
  "#B00020",
  "#4A0E24",
  "#7B3F14",
  "#8E6E6E",
  "#D35400",
  "#FFA3AC",
  "#C9A575",
  "#FFEBD2",
  "#A855F7",
  "#DDE3EA",
  "#C9F7E8",
  "#D98A00",
];
export const PREDICTOR_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/luma/predictor`;

export const FETCH_INPUT_SUMMARY = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/luma/input-summary`;

export const FETCH_GENERATE_MAP = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/luma/lulc-map`;

export const SIGNUP_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/account/signup`;
export const LOGIN_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/account/login`;

export const THOUSAND_SEPARATOR = ".";

export const DEFAULT_LUC = [
  {
    id: 1,
    name: "Undisturbed dry-land forest",
    color: "#006400",
  },
  {
    id: 2,
    name: "Logged-over dry-land forest",
    color: "#228B22",
  },
  { id: 3, name: "Undisturbed mangrove", color: "#4169E1" },
  { id: 4, name: "Logged-over mangrove", color: "#87CEEB" },
  { id: 5, name: "Undisturbed swamp forest", color: "#2E8B57" },
  { id: 6, name: "Logged-over swamp forest", color: "#8FBC8F" },
  { id: 7, name: "Agroforestry", color: "#9ACD32" },
  { id: 8, name: "Plantation forest", color: "#32CD32" },
  { id: 9, name: "Rubber monoculture", color: "#8B4513" },
  { id: 10, name: "Oil palm monoculture", color: "#FF8C00" },
  { id: 11, name: "Other monoculture", color: "#DAA520" },
  { id: 12, name: "Grass/savanna", color: "#ADFF2F" },
  { id: 13, name: "Shrub", color: "#90EE90" },
  { id: 14, name: "Cropland", color: "#FFFF00" },
  { id: 15, name: "Settlement", color: "#FF0000" },
  { id: 16, name: "Cleared land", color: "#D2B48C" },
  { id: 17, name: "Waterbody", color: "#0000FF" },
];

export const SATELLITE_OPTIONS_ARRAY = [
  // {
  //   value: "L1_RAW",
  //   label: "Landsat 1",
  // },
  // {
  //   value: "L2_RAW",
  //   label: "Landsat 2",
  // },
  // {
  //   value: "L3_RAW",
  //   label: "Landsat 3",
  // },
  {
    value: "L4_SR",
    label: "Landsat 4",
    startYear: 1982,
    endYear: 1993,
  },
  {
    value: "L5_SR",
    label: "Landsat 5",
    startYear: 1984,
    endYear: 2012,
  },
  {
    value: "L7_SR",
    label: "Landsat 7",
    startYear: 1999,
    endYear: 2021,
  },
  {
    value: "L8_SR",
    label: "Landsat 8",
    startYear: 2013,
  },
  {
    value: "L9_SR",
    label: "Landsat 9",
    startYear: 2021,
  },
];

// Year range selectable in the Time Period step: from the earliest satellite
// start year up to the latest year with (mostly) complete imagery.
export const SATELLITE_MIN_YEAR = Math.min(
  ...SATELLITE_OPTIONS_ARRAY.map((satellite) => satellite.startYear),
);
export const SATELLITE_MAX_YEAR = 2025;

export const YEAR_OPTIONS_ARRAY = Array.from(
  { length: SATELLITE_MAX_YEAR - SATELLITE_MIN_YEAR + 1 },
  (_, index) => {
    const year = String(SATELLITE_MAX_YEAR - index);
    return { value: year, label: year };
  },
);

export const getAvailableSatelliteOptionsByYear = (year?: number) => {
  if (!year) return [];

  return SATELLITE_OPTIONS_ARRAY.filter((satellite) => {
    const isAfterStartYear = year >= satellite.startYear;
    const isBeforeEndYear =
      satellite.endYear === undefined || year <= satellite.endYear;

    return isAfterStartYear && isBeforeEndYear;
  });
};

export const LUC_TEMPLATE_FILENAME = "classification_scheme_template.xlsx";
// export const LUC_TEMPLATE_FILENAME = "classification_scheme_template.csv";

export const MOSAIC_DOWNLOAD_BLANK_ERROR_MESSAGE =
  "Failed to create Mosaic image download link due to Google Earth Engine limitation";

export enum POINTING_TYPE {
  EMPTY = "",
  SINGLE = "single",
  BULK = "bulk",
}
