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

export function getTemporalRangeText(
  temporalCoverage: string,
  temporalCoverageUnit: string,
) {
  if (temporalCoverage === "1") {
    return `1 January - 31 December ${temporalCoverageUnit}`;
  }
  return `${temporalCoverage} ${temporalCoverageUnit}`;
}

export function getTemporalRangeDateStart(
  temporalCoverage: string,
  temporalCoverageUnit: string,
) {
  if (temporalCoverage === "1") {
    return `${temporalCoverageUnit}-01-01`;
  }
  return `${temporalCoverage} ${temporalCoverageUnit}`;
}

export function getTemporalRangeDateEnd(
  temporalCoverage: string,
  temporalCoverageUnit: string,
) {
  if (temporalCoverage === "1") {
    return `${temporalCoverageUnit}-12-31`;
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
