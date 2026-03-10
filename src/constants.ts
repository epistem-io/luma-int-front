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
  YOUR_MAP = "your_map",
}

export enum AREA_SCOPING_TYPE {
  UPLOAD = "upload",
  DRAW = "draw",
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
export const AREA_SCOPING_POLYGON_AREA_LIMIT = 100000;

export const LUC_TEMPLATE_FILE_SIZE_LIMIT = 1024 * 1024 * 5;

export const DATA_TRAINING_FILE_SIZE_LIMIT = 1024 * 1024 * 5;

export const TEMPORAL_COVERAGE_ARRAY = [
  {
    value: "1",
    labelFunction: (i18n: TFunction) => i18n("byYear"),
    label: "By Year",
    // default: true,
  },
  {
    value: "2",
    labelFunction: (i18n: TFunction) => i18n("bySemester"),
    label: "By Semester (coming soon)",
    disabled: true,
  },
  {
    value: "3",
    labelFunction: (i18n: TFunction) => i18n("byQuarter"),
    label: "By Quarter (coming soon)",
    disabled: true,
  },
  {
    value: "4",
    labelFunction: (i18n: TFunction) => i18n("byMonth"),
    label: "By Month (coming soon)",
    disabled: true,
  },
  {
    value: "5",
    labelFunction: (i18n: TFunction) => i18n("customDate"),
    label: "Custom Date (coming soon)",
    disabled: true,
  },
];

export const FETCH_UPLOAD_URL = `${process.env.NEXT_PUBLIC_API_URL}/geos/aoi/upload`;
export const FETCH_POLYGON_URL = `${process.env.NEXT_PUBLIC_API_URL}/geos/aoi`;

export const GET_MOSAIC_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/luma/image-mosaic`;

export const LUC_UPLOAD_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/luma/lulc-classes/upload`;
export const LUC_UPDATE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/luma/lulc-classes`;

export const TRAINING_DATA_UPLOAD_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/luma/training-data/upload`;
export const TRAINING_DATA_UPDATE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/luma/training-data`;

export const FETCH_INPUT_SUMMARY = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/luma/input-summary`;

export const FETCH_GENERATE_MAP = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/luma/lulc-map`;

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

export const LUC_TEMPLATE_FILENAME = "classification_scheme_template.csv";

export enum POINTING_TYPE {
  EMPTY = "",
  SINGLE = "single",
  BULK = "bulk",
}
