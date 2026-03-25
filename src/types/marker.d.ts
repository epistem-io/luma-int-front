import Feature from "ol/Feature";

interface Marker {
  coordinates: [number, number];
  id: string;
  name: string;
  class_id: number;
  class_color: string;
  map_feature?: Feature;
}
