"use client";
import { useContext, useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import { fromLonLat } from "ol/proj";
import { MapContext } from "@/contexts/mapContext";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { ImageTile } from "ol/source";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import { createRoot, Root } from "react-dom/client";
import Overlay from "ol/Overlay";
import { MarkerPopup } from "./MarkerPopup";

const Map1 = () => {
  const {
    setMapInstance,
    setVectorLayer,
    setVectorSource,
    setMarkerVectorLayer,
    setMarkerVectorSource,
    setOverlay,
    markerId,
    markerArray,
    setMarkerArray,
    markerVectorSource,
    setMarkerId,
    overlay: overlayContext,
    markerVectorLayer,
  } = useContext(MapContext);

  const [root, setRoot] = useState<Root | null>(null);

  const overlayRef = useRef(null);

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

    const markerSource = new VectorSource({
      features: [], // Start with an empty array of features
    });

    const markerLayer = new VectorLayer({
      source: markerSource,
      style: new Style({
        image: new Icon({
          anchor: [0.5, 1], // Anchor the bottom center of the icon
          src: "/images/marker.webp", // Use your own icon URL
          size: [92, 117],
          height: 30,
        }),
      }),
    });

    map1.addLayer(markerLayer);

    map1.setTarget(map1Container.current || undefined);
    setMapInstance(map1);
    setVectorLayer(vectorLayer);
    setVectorSource(source);
    setMarkerVectorLayer(markerLayer);
    setMarkerVectorSource(markerSource);
    // on component unmount remove the map refrences to avoid unexpected behaviour

    if (!overlayRef.current) return;

    const root = createRoot(overlayRef.current);

    root.render(
      <MarkerPopup
        markerId={String(markerId)}
        markerArray={markerArray}
        setMarkerArray={setMarkerArray}
        markerVectorSource={markerVectorSource}
        overlay={overlayContext}
        setMarkerId={setMarkerId}
        markerVectorLayer={markerVectorLayer}
      />,
    );
    setRoot(root);

    const overlay = new Overlay({
      element: overlayRef.current, // Use the ref's DOM element
      position: fromLonLat([0, 0]), // Set the geographic position
      positioning: "bottom-center",
      stopEvent: true, // Prevents events inside the overlay from bubbling to the map
      offset: [0, 0],
    });

    setOverlay(overlay);
    map1.addOverlay(overlay);

    return () => {
      map1.setTarget(undefined);
      setMapInstance(null);
      setVectorLayer(null);
      setVectorSource(null);
      root.unmount();
    };
  }, []);

  // useEffect(() => {
  //   console.log("markervector changed");
  // }, [markerVectorSource]);

  useEffect(() => {
    if (!root) return;
    root.render(
      <MarkerPopup
        markerId={String(markerId)}
        markerArray={markerArray}
        setMarkerArray={setMarkerArray}
        markerVectorSource={markerVectorSource}
        overlay={overlayContext}
        setMarkerId={setMarkerId}
        markerVectorLayer={markerVectorLayer}
      />,
    );
  }, [markerId, markerArray]);

  return (
    <>
      {/* <div className=""> */}
      <div
        ref={map1Container}
        className="absolute inset-0 m-4 mt-0 rounded-2xl overflow-hidden z-10"
      ></div>
      <div
        ref={overlayRef}
        id="marker-popup"
        className=""
        // className="absolute z-20 w-[150px] rounded-2xl p-3 border-2 border-primary-red-pink-normal bg-white"
        // style={{ display: "none" }}
      ></div>
      {/* </div> */}
    </>
  );
};
export default Map1;
