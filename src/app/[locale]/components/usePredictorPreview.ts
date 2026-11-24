import { GlobalContext } from "@/contexts/globalContext";
import { MapContext } from "@/contexts/mapContext";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import {
  fetchPredictorPreview,
  type PredictorPreviewOutcome,
} from "@/lib/predictorsApi";
import TileLayer from "ol/layer/Tile";
import { XYZ } from "ol/source";
import { useContext, useEffect, useRef, useState } from "react";

// Above the mosaic composites (10) and the final map (15), below the AOI
// outline (20) and the markers (100).
const PREVIEW_Z_INDEX = 16;

/**
 * Preview of one predictor on the map, for step 4's predictor section.
 *
 * Only one predictor is shown at a time: showing another replaces it. The
 * layer leaves the map when the section unmounts, and everything is dropped
 * when the predictor list is refreshed, since the imagery it was computed
 * from may have changed.
 */
export const usePredictorPreview = () => {
  const { sessionId } = useContext(GlobalContext);
  const { mapInstance } = useContext(MapContext);
  const { predictorListing } = useContext(MapGenerationContext);

  // The predictor being shown, or requested and not there yet.
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Legend data of the layer on the map.
  const [layer, setLayer] = useState<PredictorPreviewLayer | null>(null);
  // Why the active predictor cannot be shown.
  const [message, setMessage] = useState("");

  const mapLayer = useRef<TileLayer | null>(null);
  const outcomes = useRef(new Map<string, PredictorPreviewOutcome>());
  // Bumped on every show / hide, so a slow answer to an earlier click is ignored.
  const request = useRef(0);

  const removeMapLayer = () => {
    if (!mapLayer.current) return;
    mapInstance?.removeLayer(mapLayer.current);
    mapLayer.current = null;
  };

  const hide = () => {
    request.current += 1;
    removeMapLayer();
    setActiveId(null);
    setIsLoading(false);
    setLayer(null);
    setMessage("");
  };

  const show = async (predictorId: string) => {
    request.current += 1;
    const current = request.current;

    removeMapLayer();
    setActiveId(predictorId);
    setLayer(null);
    setMessage("");

    let outcome = outcomes.current.get(predictorId);
    if (!outcome) {
      setIsLoading(true);
      try {
        outcome = await fetchPredictorPreview(sessionId, predictorId);
        outcomes.current.set(predictorId, outcome);
      } catch (err) {
        if (current !== request.current) return;
        setIsLoading(false);
        setMessage(String((err as Error)?.message || err));
        return;
      }
      if (current !== request.current) return;
      setIsLoading(false);
    }

    if (!outcome.layer) {
      setMessage(outcome.reason);
      return;
    }

    const tileLayer = new TileLayer({
      source: new XYZ({ url: outcome.layer.url }),
      className: "predictor-preview",
      zIndex: PREVIEW_Z_INDEX,
    });
    mapInstance?.addLayer(tileLayer);
    mapLayer.current = tileLayer;
    setLayer(outcome.layer);
  };

  const toggle = (predictorId: string) => {
    if (activeId === predictorId) hide();
    else void show(predictorId);
  };

  // A refreshed list means the satellite or period may have changed.
  useEffect(() => {
    outcomes.current.clear();
    hide();
  }, [predictorListing]);

  // Leaving step 4 takes the layer off the map.
  useEffect(() => removeMapLayer, [mapInstance]);

  return { activeId, isLoading, layer, message, toggle, hide };
};
