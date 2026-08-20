import { THOUSAND_SEPARATOR } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import Circle from "ol/style/Circle";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style, { GeometryFunction } from "ol/style/Style";
import Feature from "ol/Feature";
import { MultiPoint, SimpleGeometry } from "ol/geom";
import { FeatureLike } from "ol/Feature";
import { CUSTOM_DATE_RANGE_SEPARATOR, TEMPORAL_COVERAGE_VALUE } from "@/constants";

const ISO_DATE_PARSER = /^\d{4}-\d{2}-\d{2}$/;
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenKiloByte(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

export function numberThousandSeparator(x: string | number | null | undefined) {
  if (!x || x === "") return "";
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, THOUSAND_SEPARATOR);
}

export function parseCustomDateRange(temporalCoverage: string) {
  const [startDate = "", endDate = ""] = temporalCoverage.split(CUSTOM_DATE_RANGE_SEPARATOR);
  const isValid = ISO_DATE_PARSER.test(startDate) && ISO_DATE_PARSER.test(endDate);

  return {startDate, endDate, isValid};
}

export function formatCustomDateRange(startDate: string, endDate: string) {
  return `${startDate}${CUSTOM_DATE_RANGE_SEPARATOR}${endDate}`;
}

export const toISODate = (date: Date) => {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

export const fromISODate = (value?: string) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
};

export function formatDayMonth(date: Date, locale = "en", withYear = true) {
  const month = new Intl.DateTimeFormat(locale, { month: "long" }).format(date);
  return withYear
    ? `${date.getDate()} ${month} ${date.getFullYear()}`
    : `${date.getDate()} ${month}`;
}

export function formatDateRangeText(
  startISO: string,
  endISO: string,
  locale = "en",
) {
  const start = fromISODate(startISO);
  const end = fromISODate(endISO);
  if (!start || !end) return "";

  const isSameYear = start.getFullYear() === end.getFullYear();
  return `${formatDayMonth(start, locale, !isSameYear)} - ${formatDayMonth(end, locale)}`;
}

export function getTemporalYearRange(
  temporalCoverage: string,
  temporalCoverageUnit: string,
): [number, number] | null {
  if (temporalCoverage === TEMPORAL_COVERAGE_VALUE.BY_YEAR) {
    const year = Number(temporalCoverageUnit);
    return temporalCoverageUnit !== "" && Number.isInteger(year) ? [year, year] : null;
  }

  if (temporalCoverage === TEMPORAL_COVERAGE_VALUE.CUSTOM_DATE) {
    const {startDate, endDate, isValid} = parseCustomDateRange(temporalCoverageUnit);
    if (!isValid) return null;
    return [Number(startDate.slice(0, 4)), Number(endDate.slice(0, 4))];
  }

  return null;
}

export function getTemporalPeriodText(
  temporalCoverage: string,
  temporalCoverageUnit: string,
) {
  if (temporalCoverage === TEMPORAL_COVERAGE_VALUE.CUSTOM_DATE) {
    const {startDate, endDate, isValid} = parseCustomDateRange(temporalCoverageUnit);
    return isValid ? `${startDate} - ${endDate}` : "";
  }
  return temporalCoverageUnit;
}

export function getTemporalRangeText(
  temporalCoverage: string,
  temporalCoverageUnit: string,
  locale = "en",
) {
  if (temporalCoverage === TEMPORAL_COVERAGE_VALUE.BY_YEAR) {
    return formatDateRangeText(
      `${temporalCoverageUnit}-01-01`,
      `${temporalCoverageUnit}-12-31`,
      locale,
    );
  }
  if (temporalCoverage === TEMPORAL_COVERAGE_VALUE.CUSTOM_DATE) {
    const { startDate, endDate, isValid } =
      parseCustomDateRange(temporalCoverageUnit);
    return isValid ? formatDateRangeText(startDate, endDate, locale) : "";
  }
  return `${temporalCoverage} ${temporalCoverageUnit}`;
}

export function getTemporalRangeDateStart(
  temporalCoverage: string,
  temporalCoverageUnit: string,
) {
  if (temporalCoverage === TEMPORAL_COVERAGE_VALUE.BY_YEAR) {
    return `${temporalCoverageUnit}-01-01`;
  }
  if (temporalCoverage === TEMPORAL_COVERAGE_VALUE.CUSTOM_DATE) {
    return parseCustomDateRange(temporalCoverageUnit).startDate;
  }
  return `${temporalCoverage} ${temporalCoverageUnit}`;
}

export function getTemporalRangeDateEnd(
  temporalCoverage: string,
  temporalCoverageUnit: string,
) {
  if (temporalCoverage === TEMPORAL_COVERAGE_VALUE.BY_YEAR) {
    return `${temporalCoverageUnit}-12-31`;
  }
  if (temporalCoverage === TEMPORAL_COVERAGE_VALUE.CUSTOM_DATE) {
    return parseCustomDateRange(temporalCoverageUnit).endDate;
  }
  return `${temporalCoverage} ${temporalCoverageUnit}`;
}

export const styles = (strokeWidth: number) => [
  new Style({
    stroke: new Stroke({
      color: "rgba(204, 71, 120, 1)",
      width: strokeWidth,
    }),
    // fill: undefined,
    fill: new Fill({
      color: "rgba(255, 255, 255, 0.5)",
    }),
  }),
  new Style({
    image: new CircleStyle({
      radius: 0,
      fill: new Fill({
        color: "rgba(255, 255, 255)",
      }),
      stroke: new Stroke({
        color: "rgba(204, 71, 120, 1)",
        // color: "rgba(7, 127, 104, 1)",
        width: strokeWidth,
      }),
    }),
    geometry: function (feature: Feature) {
      let coordinates;
      const geometry = feature.getGeometry();
      if (geometry instanceof SimpleGeometry) {
        coordinates = geometry.getCoordinates();
        if (coordinates?.length) coordinates = coordinates[0];
      }
      return new MultiPoint(coordinates);
    } as GeometryFunction,
  }),
];

export const stylesTransparentFill = (strokeWidth: number) => [
  new Style({
    stroke: new Stroke({
      color: "rgba(204, 71, 120, 1)",
      width: strokeWidth,
    }),
    // fill: undefined,
    fill: new Fill({
      color: "rgba(255, 255, 255, 0.0)",
    }),
  }),
  new Style({
    image: new CircleStyle({
      radius: 0,
      fill: new Fill({
        color: "rgba(255, 255, 255)",
      }),
      stroke: new Stroke({
        color: "rgba(204, 71, 120, 1)",
        // color: "rgba(7, 127, 104, 1)",
        width: strokeWidth,
      }),
    }),
    geometry: function (feature: Feature) {
      let coordinates;
      const geometry = feature.getGeometry();
      if (geometry instanceof SimpleGeometry) {
        coordinates = geometry.getCoordinates();
        if (coordinates?.length) coordinates = coordinates[0];
      }
      return new MultiPoint(coordinates);
    } as GeometryFunction,
  }),
];

export const drawStyle = (feature: FeatureLike) => {
  var geometry = feature.getGeometry();

  if (!geometry) return;

  const fill = new Fill({
    color: "rgba(204, 71, 120, 1)",
  });
  const stroke = new Stroke({
    color: "rgba(204, 71, 120, 1)",
    width: 3,
  });

  // console.log("geometry", geometry.getType());
  if (geometry.getType() === "Point") {
    var styles = [
      new Style({
        image: new Circle({
          fill: fill,
          stroke: stroke,
          radius: 3,
        }),
        fill: fill,
        stroke: stroke,
      }),
    ];
    return styles;
  }
  if (geometry.getType() === "LineString") {
    var styles = [
      new Style({
        stroke: new Stroke({
          color: "rgba(255, 255, 255, 1)",
          width: 3,
        }),
      }),
      new Style({
        stroke: new Stroke({
          color: "rgba(204, 71, 120, 1)",
          width: 3,
        }),
      }),
    ];
    return styles;
  }
  if (geometry.getType() === "Polygon") {
    var styles = [
      new Style({
        fill: new Fill({
          color: [255, 255, 255, 0.5],
        }),
      }),
    ];
    return styles;
  }
  return;
};

export const svgWithColor = (color: string = "#000") => {
  const svg = `<?xml version="1.0" encoding="UTF-8"?><svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="92" height="117"><path d="M0 0 C0.85851562 0.42410156 1.71703125 0.84820313 2.6015625 1.28515625 C14.2971966 7.62765269 21.48749829 18.26761598 25.375 30.875 C27.36943266 40.76491866 26.29772593 50.5676398 23 60 C22.75636719 60.77214844 22.51273437 61.54429688 22.26171875 62.33984375 C16.39544458 79.04899436 -0.68380725 104.84190363 -17 113 C-20.08203125 113.5625 -20.08203125 113.5625 -24 113 C-27.28862708 110.71577736 -29.94428695 107.9026612 -32.6875 105 C-33.47624512 104.18490967 -34.26499023 103.36981934 -35.07763672 102.5300293 C-51.60961359 85.14701794 -66.76008412 64.55063202 -66.47314453 39.60253906 C-65.93878097 26.05570079 -60.01075414 15.16925543 -50.34375 5.85546875 C-36.43047661 -5.15920601 -15.96736444 -8.29372813 0 0 Z M-36.4375 30.0625 C-40.2615433 35.49118273 -40.68452454 40.50183745 -40 47 C-38.21020063 52.91145165 -35.04503582 56.56937564 -30 60 C-24.79320083 62.37701701 -19.41278374 63.07130617 -13.921875 61.34765625 C-7.64096735 58.55480991 -3.47852741 54.22587799 -0.625 48 C0.99315873 40.23283812 -0.50513341 34.97330605 -4.6875 28.3125 C-9.1147315 23.8852685 -13.71968669 21.78019859 -20 21.5 C-27.25854556 21.85624763 -31.9913337 24.32789596 -36.4375 30.0625 Z " fill="${color}" transform="translate(66,4)"/></svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
};
