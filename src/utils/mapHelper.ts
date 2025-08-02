import Feature from "ol/Feature";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import Map from "ol/Map";
import { getVectorContext } from "ol/render";
import RenderEvent from "ol/render/Event";
import Fill from "ol/style/Fill";
import Style from "ol/style/Style";

export const clipLayerToVector = (layer: TileLayer, vector: VectorLayer) => {
  layer.on("postrender", function (e: RenderEvent) {
    const vectorContext = getVectorContext(e);
    const context = e.context;
    if (context instanceof CanvasRenderingContext2D && vector) {
      context.globalCompositeOperation = "destination-in";

      vector?.getSource()?.forEachFeature(function (feature: Feature) {
        vectorContext.drawFeature(
          feature,
          new Style({
            fill: new Fill({
              color: "black",
            }),
          }),
        );
      });
      context.globalCompositeOperation = "source-over";
    }
  });
};

export const clearMap = (map: Map) => {
  map.getAllLayers().forEach((layer) => {
    if (layer.getClassName().includes("added-layer")) map.removeLayer(layer);
  });
};
