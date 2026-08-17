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
import {
  BASEMAP_TYPE,
  GET_MOSAIC_URL,
  MOSAIC_DOWNLOAD_BLANK_ERROR_MESSAGE,
  POINTING_TYPE,
} from "@/constants";
import { toast } from "sonner";
import { XYZ } from "ol/source";
import { styles, stylesTransparentFill, svgWithColor } from "@/lib/utils";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import { Coordinate } from "ol/coordinate";
import Overlay from "ol/Overlay";
import { EventsKey } from "ol/events";
import { unByKey } from "ol/Observable";
import { set } from "zod";
import { Marker } from "@/types/marker";

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

const INCLUDED_MOSAIC = [
  "Composite - True Color (RGB)",
  "Composite - False Color Infrared (NIR/Red/Green)",
  "Composite - Land/Water (NIR/SWIR1/RED)",
];

const DEFAULT_ON_MOSAIC = "Composite - True Color (RGB)";

export interface LayerLegend {
  layer: TileLayer;
  name: string;
  url: string;
  originalOrder: number;
  currentOrder: number;
  legend: LegendItem;
}

export interface MapContextType {
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
  addMosaicLayer: (mos: { name: string; url: string }[]) => void;
  removeMosaicLayer: () => void;
  resetMosaicLayer: () => void;
  getMosaicMap: (params: {
    sessionId: string;
    startDate: string;
    endDate: string;
    landsatVersion: string;
    cloudCover: number;
    spatialResolution: string;
  }) => void;
  mosaicLayerArray: TileLayer[];
  setMosaicLayerArray: Dispatch<SetStateAction<TileLayer[]>>;
  finalLayer: TileLayer | null;
  setFinalLayer: Dispatch<SetStateAction<TileLayer | null>>;
  finalLayerVisible: boolean;
  setFinalLayerVisible: Dispatch<SetStateAction<boolean>>;
  mosaicLayerVisibilityArray: boolean[];
  setMosaicLayerVisibilityArray: Dispatch<SetStateAction<boolean[]>>;
  markerLayerVisibilityArray: string[];
  setMarkerLayerVisibilityArray: Dispatch<SetStateAction<string[]>>;
  vectorVisible: boolean;
  setVectorVisible: Dispatch<SetStateAction<boolean>>;
  markerCursor: (
    pointingType: POINTING_TYPE,
    classArray: LUCClass[],
    editOnly: boolean,
    selectedClass?: string,
  ) => void;
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
  mosaicStatistic: MosaicStatistics | null;
  setMosaicStatistic: Dispatch<SetStateAction<MosaicStatistics | null>>;
  selectedBasemap: string;
  setSelectedBasemap: Dispatch<SetStateAction<string>>;
  isLegendVisible: string[];
  setIsLegendVisible: Dispatch<SetStateAction<string[]>>;
  resetMapState: () => void;
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
  resetMosaicLayer: () => {},
  mosaicLayerArray: [],
  setMosaicLayerArray: () => {},
  finalLayer: null,
  setFinalLayer: () => {},
  finalLayerVisible: true,
  setFinalLayerVisible: () => {},
  mosaicLayerVisibilityArray: [],
  setMosaicLayerVisibilityArray: () => {},
  markerLayerVisibilityArray: [],
  setMarkerLayerVisibilityArray: () => {},
  vectorVisible: true,
  setVectorVisible: () => {},
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
  mosaicStatistic: null,
  setMosaicStatistic: () => {},
  selectedBasemap: BASEMAP_TYPE.GREY,
  setSelectedBasemap: () => {},
  isLegendVisible: [],
  setIsLegendVisible: () => {},
  resetMapState: () => {},
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
  const [mosaicStatistic, setMosaicStatistic] =
    useState<MosaicStatistics | null>(DEFAULT_VALUE.mosaicStatistic);

  const [mosaicLayerArray, setMosaicLayerArray] = useState<TileLayer[]>(
    DEFAULT_VALUE.mosaicLayerArray,
  );

  const [mosaicLayerVisibilityArray, setMosaicLayerVisibilityArray] = useState<
    boolean[]
  >(DEFAULT_VALUE.mosaicLayerVisibilityArray);

  const [markerLayerVisibilityArray, setMarkerLayerVisibilityArray] = useState<
    string[]
  >(DEFAULT_VALUE.markerLayerVisibilityArray);

  const [vectorVisible, setVectorVisible] = useState<boolean>(
    DEFAULT_VALUE.vectorVisible,
  );

  const [finalLayer, setFinalLayer] = useState<TileLayer | null>(
    DEFAULT_VALUE.finalLayer,
  );

  const [finalLayerVisible, setFinalLayerVisible] = useState<boolean>(
    DEFAULT_VALUE.finalLayerVisible,
  );

  const [selectedBasemap, setSelectedBasemap] = useState(
    DEFAULT_VALUE.selectedBasemap,
  );

  const [isLegendVisible, setIsLegendVisible] = useState(
    DEFAULT_VALUE.isLegendVisible,
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
  const markerIdRef = useRef(markerId);
  const clickListenerRef = useRef(mapClickListener);
  const pointerListenerRef = useRef(mapPointerListener);
  const cursorVectorRef = useRef(cursorVectorLayer);

  const getMosaicMap = async ({
    sessionId,
    startDate,
    endDate,
    landsatVersion,
    cloudCover,
    spatialResolution,
  }: {
    sessionId: string;
    startDate: string;
    endDate: string;
    landsatVersion: string;
    cloudCover: number;
    spatialResolution: string;
  }) => {
    setIsMosaicLoading(true);

    if (
      !sessionId ||
      !startDate ||
      !endDate ||
      !landsatVersion ||
      Number.isNaN(cloudCover) ||
      Number.isNaN(spatialResolution)
    ) {
      setIsMosaicLoading(false);
      return;
    }

    const body = {
      session_id: sessionId,
      start_date: startDate,
      end_date: endDate,
      landsat_version: landsatVersion,
      cloud_cover: String(cloudCover),
      spatial_resolution: String(spatialResolution),
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

        // console.log("jsonn", json);

        const tempLayers = json.results.layers.filter((item) => {
          return INCLUDED_MOSAIC.includes(item.name);
        });

        addMosaicLayer(tempLayers);
        setMosaicData(tempLayers);
        // addMosaicLayer(json.results.layers);
        // setMosaicData(json.results.layers);

        const temp: MosaicStatistics = {
          statistics: json.results.statistics,
          summary: json.results.summary,
          download_url: json.results.download_url,
        };

        if (temp.download_url === "") {
          toast.error(MOSAIC_DOWNLOAD_BLANK_ERROR_MESSAGE);
        }

        setMosaicStatistic(temp);

        setIsLegendVisible(["legend-accordion"]);
      })
      .catch((e) => {
        toast.error(`Error on generating image mosaic: ${e}`, {
          duration: Infinity,
          dismissible: true,
          closeButton: true,
        });
      })
      .finally(() => {
        setIsMosaicLoading(false);
      });
  };

  const addMosaicLayer = (mos: { name: string; url: string }[]) => {
    // const arr: { name: string; url: string }[] = mosaicData;
    const arr: { name: string; url: string }[] = mos;

    if (arr.length === 0) return;

    const temp: TileLayer[] = [];
    const tempVisArr: boolean[] = [];

    arr.forEach((item) => {
      // filter only Composite - True Color (RGB)

      // if (item.name !== "Composite - True Color (RGB)") return;

      console.log("add mosaic", item);
      if (!INCLUDED_MOSAIC.includes(item.name)) return;

      const xyzLayer = new TileLayer({
        source: new XYZ({
          url: item.url,

          // Optional: Add attributions if required by the tile service provider
        }),
        className: `mosaic`,
        zIndex: 10,
        opacity: item.name === DEFAULT_ON_MOSAIC ? 1 : 0,
      });

      // console.log("xlayer", xyzLayer);
      temp.push(xyzLayer);
      tempVisArr.push(item.name === DEFAULT_ON_MOSAIC);

      mapInstance?.addLayer(xyzLayer);
    });

    vectorLayer?.setStyle(stylesTransparentFill(3));
    setIsPreviewingMosaic(true);
    setMosaicLayerArray(temp);
    setMosaicLayerVisibilityArray(tempVisArr);
    // setMosaicLayerVisibilityArray(temp.map(() => false));

    return;
  };

  const removeMosaicLayer = () => {
    if (!mosaicData) return;

    mapInstance?.getAllLayers().forEach((layer) => {
      if (!layer.getClassName().includes("mosaic")) return;
      mapInstance?.removeLayer(layer);
    });

    setMosaicLayerArray([]);
    setMosaicLayerVisibilityArray([]);
    // vectorLayer?.setStyle(styles(3));
    setIsPreviewingMosaic(false);
  };

  const resetMosaicLayer = () => {
    removeMosaicLayer();
    setMosaicLayerArray([]);
    setMosaicLayerVisibilityArray([]);
    setMosaicData([]);
    setMosaicStatistic(null);
  };

  const resetMapState = () => {
    removeMarkerCursor();
    resetMosaicLayer();

    overlay?.setPosition(undefined);
    markerVectorSource?.clear();
    vectorSource?.clear();

    if (finalLayer) {
      mapInstance?.removeLayer(finalLayer);
    }

    mapInstance?.getAllLayers().forEach((layer) => {
      const className = layer.getClassName?.() || "";

      if (className.includes("final")) {
        mapInstance.removeLayer(layer);
      }
    });

    if (mapInstance) {
      mapInstance.getTargetElement().style.cursor = "";
    }

    vectorLayer?.setStyle(styles(3));
    markerVectorLayer?.setOpacity(1);

    setPolygon(null);
    setMarkerArray([]);
    setMarkerId("");
    setPointingType(DEFAULT_VALUE.pointingType);
    setFinalLayer(null);
    setFinalLayerVisible(DEFAULT_VALUE.finalLayerVisible);
    setMosaicLayerVisibilityArray(DEFAULT_VALUE.mosaicLayerVisibilityArray);
    setMarkerLayerVisibilityArray(DEFAULT_VALUE.markerLayerVisibilityArray);
    setVectorVisible(DEFAULT_VALUE.vectorVisible);
    setIsLegendVisible(DEFAULT_VALUE.isLegendVisible);
  };

  const insertMarkerArr = (marker: Marker) => {
    console.log("markerArray", markerArray);
    const newMarkerArray = [...markerArray];
    newMarkerArray.push(marker);
    setMarkerArray(newMarkerArray);
  };

  const markerCursor = (
    pointingTypes: POINTING_TYPE,
    classArray: LUCClass[],
    editOnly: boolean = false,
    selectedClass?: string,
  ) => {
    if (!mapInstance) return;

    // console.log("runmarkercursor");

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
      zIndex: 150,
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

    if (!editOnly) {
      setCursorVectorLayer(vl);
    }

    const pointerKey = mapInstance.on("pointermove", async function (evt) {
      // Get the current map coordinates from the event
      if (editOnly) return;

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
        // console.log("ell", el, el.getProperties().id, el.getGeometry());

        const geom = el.getGeometry() as Point;
        overlay?.setPosition(geom.getCoordinates());

        // console.log("markerid", id);
        setMarkerId(id);
        return;
      }

      console.log("featt, markerid", featt?.length, markerIdRef.current);

      if (editOnly && markerIdRef.current) {
        setMarkerId("");
        overlay?.setPosition(undefined);
        return;
      }

      if (editOnly) return;

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

      const selectedClassColor =
        classArray.find((item) => item.class_id === Number(selectedClass))
          ?.class_color || "#000000";

      console.log(
        "selected color",
        classArray.find((item) => item.class_id === Number(selectedClass))
          ?.class_color,
      );

      markerFeature.setStyle(
        new Style({
          image: new Icon({
            anchor: [0.5, 1], // Anchor the bottom center of the icon
            src: svgWithColor(selectedClassColor),
            // src: "/images/marker.webp", // Use your own icon URL
            size: [92, 117],
            height: 30,
          }),
        }),
      );

      setMarkerArray([
        ...markerArrRef.current,
        {
          class_id:
            pointingTypes === POINTING_TYPE.SINGLE ? -1 : Number(selectedClass),
          coordinates: [newCoordinates[0], newCoordinates[1]],
          id: uuid,
          name: `Point ${markerArrRef.current.length + 1}`,
          class_color:
            pointingTypes === POINTING_TYPE.SINGLE
              ? ""
              : classArray.find(
                  (item) => item.class_id === Number(selectedClass),
                )?.class_color || "",
          map_feature: markerFeature,
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
    if (!markerVectorSource) return;

    markerVectorSource.clear();

    if (!arr || arr.length === 0) {
      markerVectorSource.addFeature(new Feature());
      return;
    };
    
    arr.forEach((item) => {
      const markerFeature =
        item.map_feature ||
        new Feature({
          geometry: new Point(item.coordinates),
          id: item.id,
          property: {
            class_name: item.name,
          },
        });

      markerFeature.setStyle(
        new Style({
          image: new Icon({
            anchor: [0.5, 1], // Anchor the bottom center of the icon
            src: svgWithColor(item.class_color),
            // src: "/images/marker.webp", // Use your own icon URL
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

  useEffect(() => {
    markerIdRef.current = markerId;
  }, [markerId]);

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
    mosaicStatistic,
    setMosaicStatistic,
    resetMosaicLayer,
    mosaicLayerArray,
    setMosaicLayerArray,
    mosaicLayerVisibilityArray,
    setMosaicLayerVisibilityArray,
    markerLayerVisibilityArray,
    setMarkerLayerVisibilityArray,
    vectorVisible,
    setVectorVisible,
    finalLayer,
    setFinalLayer,
    finalLayerVisible,
    setFinalLayerVisible,
    selectedBasemap,
    setSelectedBasemap,
    isLegendVisible,
    setIsLegendVisible,
    resetMapState,
  };

  return (
    <MapContext.Provider value={providedValue}>
      {props.children}
    </MapContext.Provider>
  );
};

export { MapContextContainer, MapContext };
