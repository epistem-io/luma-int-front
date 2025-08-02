"use client";
import { useContext, useEffect, useRef } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import { fromLonLat } from "ol/proj";
import { MapContext } from "@/contexts/mapContext";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { ImageTile } from "ol/source";

const Map1 = () => {
  const { setMapInstance, setVectorLayer, setVectorSource } =
    useContext(MapContext);

  const map1Container = useRef<HTMLDivElement | null>(null);
  // on component mount create the map and set the map refrences to the state
  useEffect(() => {
    const source = new VectorSource({ wrapX: false });
    const vectorLayer = new VectorLayer({ source });

    const baseMapOSM = new TileLayer({
      source: new ImageTile({
        url: "https://{a-c}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
        crossOrigin: "anonymous",
      }),
      className: "basemap",
    });

    const labelMapOSM = new TileLayer({
      source: new ImageTile({
        url: "https://{a-c}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png",
        crossOrigin: "anonymous",
      }),
      className: "basemap",
    });

    const map1 = new Map({
      layers: [baseMapOSM, labelMapOSM, vectorLayer],
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
