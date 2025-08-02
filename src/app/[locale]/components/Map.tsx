"use client";
import { useContext, useEffect, useRef } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import { MapContext } from "@/contexts/mapContext";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { ImageTile, ImageWMS, Source, TileArcGISRest, XYZ } from "ol/source";
import ImageLayer from "ol/layer/Image";
import { getVectorContext } from "ol/render";
import Feature from "ol/Feature";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import TileSource from "ol/source/Tile";

const Map1 = () => {
  const { setMapInstance, setVectorLayer, setVectorSource } =
    useContext(MapContext);

  const map1Container = useRef<HTMLDivElement | null>(null);
  // on component mount create the map and set the map refrences to the state
  useEffect(() => {
    const source = new VectorSource({ wrapX: false });
    const vectorLayer = new VectorLayer({ source });

    const baseMapOSM = new TileLayer({
      // source: new OSM({ crossOrigin: "anonymous",  }),

      // source: new TileArcGISRest({
      //   url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      //   crossOrigin: "anonymous",
      // }),

      // source: new XYZ({
      //   url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      // }),

      source: new ImageTile({
        url: "https://{a-c}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
      }),
      className: "basemap",
      // properties: {
      //   name: BASEMAP_OSM_LAYER,
      // },
    });

    const map1 = new Map({
      layers: [baseMapOSM, vectorLayer],
      view: new View({
        //Coordinate System: WGS 84 / Pseudo-Mercator-EPSG:3857
        center: fromLonLat([106.808191, -6.245126]), // Longitude, Latitude
        zoom: 5,
      }),
    });

    map1.setTarget(map1Container.current || undefined);
    setMapInstance(map1);
    setVectorLayer(vectorLayer);
    setVectorSource(source);
    // on component unmount remove the map refrences to avoid unexpected behaviour

    return () => {
      map1.setTarget(undefined);
      setMapInstance(null);
      setVectorLayer(null);
      setVectorSource(null);
    };
  }, []);
  return (
    <>
      <div ref={map1Container} className="absolute inset-0"></div>
    </>
  );
};
export default Map1;
