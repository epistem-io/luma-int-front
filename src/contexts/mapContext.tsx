"use client";

import { MultiPolygon, Polygon } from "ol/geom";
import Map from "ol/Map";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useState,
} from "react";

// interface LayerItem {
//   citation: string;
//   content_date: string;
//   data_format: string;
//   description: string;
//   disclaimer: string;
//   format: string;
//   id: number;
//   layers: string;
//   matrix_set: string;
//   name: string;
//   service: string;
//   source: string;
//   source_link: string;
//   spatial_resolution: string;
//   srs: string;
//   styles: string;
//   url: string;
//   version: string;
//   short_description?: string;
//   // WIP
//   // child: LayerItemChildResDto[];
//   // child: LayerItemResDto[];
//   // has_child: boolean;
//   // parent_id?: number;
//   // parent_name?: string;
// }

interface LegendItem {
  isVisible: boolean;
  // opacity: number;
  // constrainToPolygon: boolean;
}

export interface LayerLegend {
  // layer: LayerItem;
  name: string;
  url: string;
  originalOrder: number;
  currentOrder: number;
  legend?: LegendItem;
}

interface MapContextType {
  mapInstance: Map | null;
  setMapInstance: Dispatch<SetStateAction<null | Map>>;
  polygon: MultiPolygon | Polygon | null;
  setPolygon: Dispatch<SetStateAction<null | Polygon | MultiPolygon>>;
  vectorSource: VectorSource | null;
  setVectorSource: Dispatch<SetStateAction<null | VectorSource>>;
  vectorLayer: VectorLayer | null;
  setVectorLayer: Dispatch<SetStateAction<null | VectorLayer>>;
  layerLegendArray: LayerLegend[];
  setLayerLegendArray: Dispatch<SetStateAction<LayerLegend[]>>;
}

const DEFAULT_VALUE: MapContextType = {
  mapInstance: null,
  setMapInstance: () => {},
  polygon: null,
  setPolygon: () => {},
  vectorSource: null,
  setVectorSource: () => {},
  vectorLayer: null,
  setVectorLayer: () => {},
  layerLegendArray: [],
  setLayerLegendArray: () => {},
};

const MapContext = createContext(DEFAULT_VALUE);

const MapContextContainer = (props: PropsWithChildren) => {
  const [mapInstance, setMapInstance] = useState<Map | null>(null);
  const [polygon, setPolygon] = useState<MultiPolygon | Polygon | null>(null);
  const [vectorSource, setVectorSource] = useState<VectorSource | null>(null);
  const [vectorLayer, setVectorLayer] = useState<VectorLayer | null>(null);

  const [layerLegendArray, setLayerLegendArray] = useState<LayerLegend[]>([]);

  const providedValue = {
    mapInstance,
    setMapInstance,
    polygon,
    setPolygon,
    vectorSource,
    setVectorSource,
    vectorLayer,
    setVectorLayer,
    layerLegendArray,
    setLayerLegendArray,
  };

  return (
    <MapContext.Provider value={providedValue}>
      {props.children}
    </MapContext.Provider>
  );
};

export { MapContextContainer, MapContext };
