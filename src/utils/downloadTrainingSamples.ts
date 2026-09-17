import { toLonLat } from 'ol/proj';
import * as shpwrite from "@mapbox/shp-write";

type SampleMarker = {
  coordinates: [number, number];
  class_id: number;
};

type LulcClass = { class_id: number; class_name: string };

export const downloadTrainingSamplesShapefile = async (
  markerArray: SampleMarker[],
  classArray: LulcClass[],
  filename: "training_samples"
) => {

  const classNameById = new Map(
    classArray.map((item) => [item.class_id, item.class_name])
  );

  const geojson = {
    type: "FeatureCollection" as const,
    features: markerArray
      .filter((m) => m.class_id !== -1 && classNameById.has(m.class_id))
      .map((m) => ({
        type: "Feature" as const,
        properties: {
          class_name: classNameById.get(m.class_id) ?? "",
        },
        geometry: {
          type: "Point" as const,
          coordinates: toLonLat(m.coordinates),
        },
      }))
  };

  const blob = await shpwrite.zip<Blob>(geojson, {
    outputType: "blob",
    compression: "DEFLATE",
    types: { point: "training_samples" },
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}