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
  useEffect,
  useRef,
  useState,
} from "react";
import TileLayer from "ol/layer/Tile";
import { GET_MOSAIC_URL, POINTING_TYPE } from "@/constants";
import { toast } from "sonner";
import { XYZ } from "ol/source";
import {
  getTemporalRangeDateEnd,
  getTemporalRangeDateStart,
  styles,
  stylesTransparentFill,
} from "@/lib/utils";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import { Coordinate } from "ol/coordinate";
import Overlay from "ol/Overlay";
import { EventsKey } from "ol/events";
import { unByKey } from "ol/Observable";

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

interface SingleColor {
  name: string;
  color: string;
}

interface Gradient {
  name: string;
  color: string[];
}

interface LegendItem {
  isVisible: boolean;
  opacity: number;
  items: (SingleColor | Gradient)[];
  // constrainToPolygon: boolean;
}

export interface LayerLegend {
  layer: TileLayer;
  name: string;
  url: string;
  originalOrder: number;
  currentOrder: number;
  legend: LegendItem;
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
  markerVectorSource: VectorSource | null;
  setMarkerVectorSource: Dispatch<SetStateAction<null | VectorSource>>;
  markerVectorLayer: VectorLayer | null;
  setMarkerVectorLayer: Dispatch<SetStateAction<null | VectorLayer>>;
  layerLegendArray: LayerLegend[];
  setLayerLegendArray: Dispatch<SetStateAction<LayerLegend[]>>;
  mosaicData: {
    name: string;
    url: string;
  }[];
  setMosaicData: Dispatch<SetStateAction<{ name: string; url: string }[]>>;
  isPreviewingMosaic: boolean;
  setIsPreviewingMosaic: Dispatch<SetStateAction<boolean>>;
  isMosaicLoading: boolean;
  setIsMosaicLoading: Dispatch<SetStateAction<boolean>>;
  addMosaicLayer: () => void;
  removeMosaicLayer: () => void;
  getMosaicMap: (params: {
    sessionId: string;
    polygonData: PolygonData | null;
    temporalCoverage: string;
    temporalCoverageUnit: string;
  }) => void;
  markerCursor: (pointingType: POINTING_TYPE, selectedClass?: string) => void;
  removeMarkerCursor: () => void;
  overlay: Overlay | null;
  setOverlay: Dispatch<SetStateAction<Overlay | null>>;
  markerId: string;
  setMarkerId: Dispatch<SetStateAction<string>>;
  markerArray: Marker[];
  setMarkerArray: Dispatch<SetStateAction<Marker[]>>;
  // from map generation
  pointingType: POINTING_TYPE;
  setPointingType: Dispatch<SetStateAction<POINTING_TYPE>>;
  renderArrayToMarkerVector: (arr: Marker[]) => void;
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
  markerVectorSource: null,
  setMarkerVectorSource: () => {},
  markerVectorLayer: null,
  setMarkerVectorLayer: () => {},
  layerLegendArray: [],
  setLayerLegendArray: () => {},
  mosaicData: [],
  setMosaicData: () => {},
  isPreviewingMosaic: false,
  setIsPreviewingMosaic: () => {},
  isMosaicLoading: false,
  setIsMosaicLoading: () => {},
  addMosaicLayer: () => {},
  removeMosaicLayer: () => {},
  getMosaicMap: () => {},
  markerCursor: () => {},
  removeMarkerCursor: () => {},
  overlay: null,
  setOverlay: () => {},
  markerId: "",
  setMarkerId: () => {},
  pointingType: POINTING_TYPE.EMPTY,
  setPointingType: () => {},
  markerArray: [],
  setMarkerArray: () => {},
  renderArrayToMarkerVector: () => {},
};

const MapContext = createContext(DEFAULT_VALUE);

const MapContextContainer = (props: PropsWithChildren) => {
  const [mapInstance, setMapInstance] = useState<Map | null>(null);
  const [polygon, setPolygon] = useState<MultiPolygon | Polygon | null>(null);
  const [vectorSource, setVectorSource] = useState<VectorSource | null>(null);
  const [vectorLayer, setVectorLayer] = useState<VectorLayer | null>(null);
  const [markerVectorSource, setMarkerVectorSource] =
    useState<VectorSource | null>(null);
  const [markerVectorLayer, setMarkerVectorLayer] =
    useState<VectorLayer | null>(null);

  const [layerLegendArray, setLayerLegendArray] = useState<LayerLegend[]>([]);

  const [isMosaicLoading, setIsMosaicLoading] = useState<boolean>(false);

  const [mosaicData, setMosaicData] = useState<{ name: string; url: string }[]>(
    [],
  );
  const [isPreviewingMosaic, setIsPreviewingMosaic] = useState(
    DEFAULT_VALUE.isPreviewingMosaic,
  );
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const [markerId, setMarkerId] = useState<string>("");
  const [markerArray, setMarkerArray] = useState<Marker[]>([]);
  const [pointingType, setPointingType] = useState<POINTING_TYPE>(
    DEFAULT_VALUE.pointingType,
  );

  // NON VALUE
  const [cursorVectorLayer, setCursorVectorLayer] =
    useState<VectorLayer | null>(null);
  const [mapHoverOverMarker, setMapHoverOverMarker] = useState<boolean>(false);
  const [mapClickListener, setMapClickListener] = useState<EventsKey | null>(
    null,
  );
  const [mapPointerListener, setMapPointerListener] =
    useState<EventsKey | null>(null);
  // const [mapClickListener, setMapClickListener] = useState<EventsKey[]>([]);
  // const [mapPointerListener, setMapPointerListener] = useState<EventsKey[]>([]);

  const markerArrRef = useRef(markerArray);
  const clickListenerRef = useRef(mapClickListener);
  const pointerListenerRef = useRef(mapPointerListener);
  const cursorVectorRef = useRef(cursorVectorLayer);

  const getMosaicMap = async ({
    sessionId,
    polygonData,
    temporalCoverage,
    temporalCoverageUnit,
  }: {
    sessionId: string;
    polygonData: PolygonData | null;
    temporalCoverage: string;
    temporalCoverageUnit: string;
  }) => {
    setIsMosaicLoading(true);

    if (
      !sessionId ||
      !polygonData ||
      !temporalCoverage ||
      !temporalCoverageUnit
    ) {
      return;
    }

    const body = {
      session_id: sessionId,
      start_date: getTemporalRangeDateStart(
        temporalCoverage,
        temporalCoverageUnit,
      ),
      end_date: getTemporalRangeDateEnd(temporalCoverage, temporalCoverageUnit),
    };

    fetch(`${GET_MOSAIC_URL}?${new URLSearchParams(body)}`, {
      method: "GET",
    })
      .then(async (response) => {
        const json: GetMosaicRes = await response.json();

        if (!response.ok) {
          throw new Error(
            JSON.stringify(
              `${json?.error?.message || response.text}. Trace: ${json?.trace}`,
            ),
          );
        }

        addMosaicLayer(json.layers);
        setMosaicData(json.layers);
      })
      .catch((e) => {
        toast.error(`Error on upload training data: ${e}`, {
          duration: Infinity,
          dismissible: true,
          closeButton: true,
        });
      })
      .finally(() => {
        setIsMosaicLoading(false);
      });
  };

  const addMosaicLayer = (mos?: { name: string; url: string }[]) => {
    const arr: { name: string; url: string }[] = mos || mosaicData;

    if (arr.length === 0) return;

    arr.forEach((item) => {
      // WIP filter only Composite - True Color (RGB)

      if (item.name !== "Composite - True Color (RGB)") return;

      const xyzLayer = new TileLayer({
        source: new XYZ({
          url: item.url,

          // Optional: Add attributions if required by the tile service provider
        }),
        className: "mosaic",
      });

      console.log("xlayer", xyzLayer);

      mapInstance?.addLayer(xyzLayer);
    });

    vectorLayer?.setStyle(stylesTransparentFill(3));
    setIsPreviewingMosaic(true);

    return;
  };

  const removeMosaicLayer = () => {
    if (!mosaicData) return;

    mapInstance?.getAllLayers().forEach((layer) => {
      if (!layer.getClassName().includes("mosaic")) return;
      mapInstance?.removeLayer(layer);
    });

    vectorLayer?.setStyle(styles(3));
    setIsPreviewingMosaic(false);
  };

  const insertMarkerArr = (marker: Marker) => {
    console.log("markerArray", markerArray);
    const newMarkerArray = [...markerArray];
    newMarkerArray.push(marker);
    setMarkerArray(newMarkerArray);
  };

  const markerCursor = (
    pointingTypes: POINTING_TYPE,
    selectedClass?: string,
  ) => {
    if (!mapInstance) return;

    console.log("runmarkercursor");

    const markerFeature = new Feature({
      geometry: new Point([0, 0]),
      id: "cursor-marker",
    });

    markerFeature.setStyle(
      new Style({
        image: new Icon({
          anchor: [0.5, 1], // Anchor the bottom center of the icon
          src: "/images/marker.webp", // Use your own icon URL
          size: [92, 117],
          height: 30,
        }),
      }),
    );

    const vs = new VectorSource({
      features: [markerFeature],
    });

    const vl = new VectorLayer({
      source: vs,
      properties: { name: "marker layer" },
    });

    const coordinates = [
      [
        [103.81516541187864, -1.9806709940286882],
        [103.88695800260311, -1.9809016481710402],
        [103.88677102945067, -2.0400266607815385],
        [103.81497586409175, -2.039794504395401],
        [103.81516541187864, -1.9806709940286882],
      ],
    ] as Coordinate[][];

    // vectorSource?.clear();

    const tempPolygon = new Polygon(coordinates).transform(
      "EPSG:4326",
      "EPSG:3857",
    ) as Polygon;

    if (!polygon) {
      const polygonFeature = new Feature<Polygon>(tempPolygon);
      const newVectorSource = new VectorSource({
        features: [polygonFeature],
        wrapX: false,
      });

      const newVectorLayer = new VectorLayer({
        source: newVectorSource,
        style: stylesTransparentFill(3),
        properties: { name: "polygon layer" },
      });

      newVectorLayer.setZIndex(Infinity);
      setVectorSource(newVectorSource);
      setVectorLayer(newVectorLayer);
      mapInstance?.addLayer(newVectorLayer);

      setPolygon(tempPolygon);

      const extent = newVectorSource.getExtent();

      if (!extent || !mapInstance) return;

      const view = mapInstance.getView();

      view?.fit(extent, {
        padding: [150, 150, 150, 600],
      });
    }

    mapInstance.addLayer(vl);
    setCursorVectorLayer(vl);

    const pointerKey = mapInstance.on("pointermove", async function (evt) {
      // Get the current map coordinates from the event
      const newCoordinates = evt.coordinate;

      // console.log("newCoordinates", newCoordinates);

      const polygonGeometry = polygon || tempPolygon;

      if (!polygonGeometry) {
        // console.log("no polygon geometry");
        return;
      }

      if (!polygonGeometry.intersectsCoordinate(newCoordinates)) {
        // console.log("no intersect");
        return;
      }

      let featt = await markerVectorLayer?.getFeatures(evt.pixel);

      featt?.forEach((feature) => {
        // console.log("feat marker layer", feature);
      });

      if (featt?.length) {
        // console.log("tembus");
        // Update the marker feature's geometry with the new coordinates
        markerFeature.setStyle(
          new Style({
            image: new Icon({
              anchor: [0.5, 1], // Anchor the bottom center of the icon
              src: "/images/marker.webp", // Use your own icon URL
              size: [92, 117],
              height: 30,
              opacity: 0,
            }),
          }),
        );

        mapInstance.getTargetElement().style.cursor = "pointer";
        setMapHoverOverMarker(true);

        return;
      }

      setMapHoverOverMarker(false);
      markerFeature.setStyle(
        new Style({
          image: new Icon({
            anchor: [0.5, 1], // Anchor the bottom center of the icon
            src: "/images/marker.webp", // Use your own icon URL
            size: [92, 117],
            height: 30,
            // opacity: 0,
          }),
        }),
      );

      mapInstance.getTargetElement().style.cursor = "";

      // console.log("tembus");
      // Update the marker feature's geometry with the new coordinates
      markerFeature.getGeometry()?.setCoordinates(newCoordinates);
    });

    const clickKey = mapInstance.on("singleclick", async function (evt) {
      const newCoordinates = evt.coordinate;

      let featt = await markerVectorLayer?.getFeatures(evt.pixel);

      featt?.forEach((feature) => {
        console.log("feat marker layer", feature);
      });

      if (featt?.length) {
        const el = featt[0];
        const id = el.getProperties().id;
        console.log("ell", el, el.getProperties().id, el.getGeometry());

        const geom = el.getGeometry() as Point;
        overlay?.setPosition(geom.getCoordinates());

        console.log("markerid", id);
        setMarkerId(id);
        return;
      }

      if (markerArrRef.current.some((item) => item.class_id === -1)) {
        return;
      }

      overlay?.setPosition(undefined);

      const uuid = crypto.randomUUID();

      const markerFeature = new Feature({
        geometry: new Point(newCoordinates),
        id: uuid,
      });

      if (!markerVectorSource) return;

      setMarkerArray([
        ...markerArrRef.current,
        {
          class_id:
            pointingTypes === POINTING_TYPE.SINGLE ? -1 : Number(selectedClass),
          coordinates: [newCoordinates[0], newCoordinates[1]],
          id: uuid,
          name: `Point ${markerArrRef.current.length + 1}`,
        },
      ]);

      markerVectorSource?.addFeature(markerFeature);
      if (pointingTypes === POINTING_TYPE.SINGLE) {
        setMarkerId(uuid);
        overlay?.setPosition(newCoordinates);

        return;
      }
    });

    // unByKey([pointerKey, clickKey]);

    // console.log("set events key", clickKey, pointerKey);

    // setMapClickListener(() => {
    //   console.log("runn");
    //   unByKey(clickKey);
    // });
    // setMapPointerListener(() => {
    //   console.log("runn");
    //   unByKey(pointerKey);
    // });
    setMapClickListener(clickKey);
    setMapPointerListener(pointerKey);
    // setMapClickListener([...mapClickListener, clickKey]);
    // setMapPointerListener([...mapPointerListener, pointerKey]);
  };

  const removeMarkerCursor = () => {
    // console.log(
    //   "listener",
    //   pointerListenerRef.current,
    //   clickListenerRef.current,
    // );

    unByKey(pointerListenerRef.current || []);
    unByKey(clickListenerRef.current || []);

    // if (mapPointerListener) {
    //   console.log("mapPointerListener", mapPointerListener);
    //   mapPointerListener();
    // }
    // if (mapClickListener) {
    //   console.log("mapClickListener", mapClickListener);
    //   mapClickListener();
    // }

    // console.log("mapp", mapInstance);
    // console.log("mapp", mapInstance);
    // console.log("cursorvector", cursorVectorRef.current);

    cursorVectorRef.current?.getSource()?.clear();
    cursorVectorRef.current?.dispose();

    // console.log("mapp", mapInstance);
    setCursorVectorLayer(null);

    if (!mapInstance || !cursorVectorRef.current) return;

    // console.log("pass");
    mapInstance?.removeLayer(cursorVectorRef.current);
    setCursorVectorLayer(null);

    // mapInstance?.removeLayer(cursorVectorLayer);
    // setCursorVectorLayer(null);

    // mapInstance.un("pointermove", async function (evt) {
    //   // Get the current map coordinates from the event
    //   const newCoordinates = evt.coordinate;

    //   // console.log("newCoordinates", newCoordinates);

    //   const polygonGeometry = polygon || tempPolygon;

    //   if (!polygonGeometry) {
    //     // console.log("no polygon geometry");
    //     return;
    //   }

    //   if (!polygonGeometry.intersectsCoordinate(newCoordinates)) {
    //     // console.log("no intersect");
    //     return;
    //   }

    //   let featt = await markerVectorLayer?.getFeatures(evt.pixel);

    //   featt?.forEach((feature) => {
    //     // console.log("feat marker layer", feature);
    //   });

    //   if (featt?.length) {
    //     // console.log("tembus");
    //     // Update the marker feature's geometry with the new coordinates
    //     markerFeature.setStyle(
    //       new Style({
    //         image: new Icon({
    //           anchor: [0.5, 1], // Anchor the bottom center of the icon
    //           src: "/images/marker.webp", // Use your own icon URL
    //           size: [92, 117],
    //           height: 30,
    //           opacity: 0,
    //         }),
    //       }),
    //     );

    //     mapInstance.getTargetElement().style.cursor = "pointer";
    //     setMapHoverOverMarker(true);

    //     return;
    //   }

    //   setMapHoverOverMarker(false);
    //   markerFeature.setStyle(
    //     new Style({
    //       image: new Icon({
    //         anchor: [0.5, 1], // Anchor the bottom center of the icon
    //         src: "/images/marker.webp", // Use your own icon URL
    //         size: [92, 117],
    //         height: 30,
    //         // opacity: 0,
    //       }),
    //     }),
    //   );

    //   mapInstance.getTargetElement().style.cursor = "";

    //   // console.log("tembus");
    //   // Update the marker feature's geometry with the new coordinates
    //   markerFeature.getGeometry()?.setCoordinates(newCoordinates);
    // });

    // mapInstance.un("singleclick", async function (evt) {
    //   const newCoordinates = evt.coordinate;

    //   let featt = await markerVectorLayer?.getFeatures(evt.pixel);

    //   featt?.forEach((feature) => {
    //     console.log("feat marker layer", feature);
    //   });

    //   if (featt?.length) {
    //     const el = featt[0];
    //     const id = el.getProperties().id;
    //     console.log("ell", el, el.getProperties().id, el.getGeometry());

    //     const geom = el.getGeometry() as Point;
    //     overlay?.setPosition(geom.getCoordinates());

    //     console.log("markerid", id);
    //     setMarkerId(id);
    //     return;
    //   }

    //   if (markerArrRef.current.some((item) => item.class_id === -1)) {
    //     return;
    //   }

    //   overlay?.setPosition(undefined);

    //   const uuid = crypto.randomUUID();

    //   const markerFeature = new Feature({
    //     geometry: new Point(newCoordinates),
    //     id: uuid,
    //   });

    //   if (!markerVectorSource) return;

    //   setMarkerArray([
    //     ...markerArrRef.current,
    //     {
    //       class_id: -1,
    //       coordinates: [newCoordinates[0], newCoordinates[1]],
    //       id: uuid,
    //       name: `Point ${markerArrRef.current.length + 1}`,
    //     },
    //   ]);

    //   markerVectorSource?.addFeature(markerFeature);
    //   if (pointingTypes === POINTING_TYPE.SINGLE) {
    //     setMarkerId(uuid);
    //     overlay?.setPosition(newCoordinates);

    //     return;
    //   }
    // });
  };

  const renderArrayToMarkerVector = (arr: Marker[]) => {
    if (!arr || arr.length === 0) return;

    if (!markerVectorSource) return;

    markerVectorSource.clear();

    arr.forEach((item) => {
      const markerFeature = new Feature({
        geometry: new Point(item.coordinates),
        id: item.id,
      });

      markerFeature.setStyle(
        new Style({
          image: new Icon({
            anchor: [0.5, 1], // Anchor the bottom center of the icon
            src: "/images/marker.webp", // Use your own icon URL
            size: [92, 117],
            height: 30,
          }),
        }),
      );

      markerVectorSource.addFeature(markerFeature);
    });

    markerVectorSource.changed();

    // console.log("mvs", markerVectorSource);
  };

  useEffect(() => {
    markerArrRef.current = markerArray;
  }, [markerArray]);

  useEffect(() => {
    pointerListenerRef.current = mapPointerListener;
  }, [mapPointerListener]);

  useEffect(() => {
    clickListenerRef.current = mapClickListener;
  }, [mapClickListener]);

  useEffect(() => {
    cursorVectorRef.current = cursorVectorLayer;
  }, [cursorVectorLayer]);

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
    mosaicData,
    setMosaicData,
    isPreviewingMosaic,
    setIsPreviewingMosaic,
    isMosaicLoading,
    setIsMosaicLoading,
    addMosaicLayer,
    removeMosaicLayer,
    getMosaicMap,
    markerCursor,
    removeMarkerCursor,
    markerVectorSource,
    setMarkerVectorSource,
    markerVectorLayer,
    setMarkerVectorLayer,
    overlay,
    setOverlay,
    markerId,
    setMarkerId,
    markerArray,
    setMarkerArray,
    pointingType,
    setPointingType,
    renderArrayToMarkerVector,
  };

  return (
    <MapContext.Provider value={providedValue}>
      {props.children}
    </MapContext.Provider>
  );
};

export { MapContextContainer, MapContext };
