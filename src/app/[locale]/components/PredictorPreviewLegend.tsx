"use client";

import { Button } from "@/components/ui/button";
import { formatLegendValue, legendGradient } from "@/lib/predictorsApi";
import { useTranslateOr } from "./useTranslateOr";

const TEXT = "font-aptos text-sm font-regular leading-5 text-neutral-700";

// What the previewed predictor looks like on the map: a colour ramp with the
// range the backend stretched it to, or the colours of its classes.
export const PredictorPreviewLegend = ({
  label,
  layer,
  isLoading,
  message,
  onHide,
}: {
  /** Name of the predictor being previewed. */
  label: string;
  /** Null while loading, or when it could not be shown. */
  layer: PredictorPreviewLayer | null;
  isLoading: boolean;
  /** Why it could not be shown; "" otherwise. */
  message: string;
  onHide: () => void;
}) => {
  const translateOr = useTranslateOr();

  return (
    <div className="p-3 rounded-xl border border-neutral-400 bg-white space-y-3">
      <div className="flex flex-row items-center justify-between gap-x-3">
        <p className="font-aptos text-base font-semibold leading-6 text-text-icons-base-main">
          {translateOr("lulcParams.preview.onTheMap", "On the map")}: {label}
        </p>
        <Button variant="outline" size="sm" onClick={onHide}>
          {translateOr("lulcParams.preview.hide", "Hide")}
        </Button>
      </div>

      {isLoading && (
        <div className="flex flex-row items-center gap-x-3">
          <span className="loader sm"></span>
          <p className={TEXT}>
            {translateOr("lulcParams.preview.drawing", "Drawing it on the map…")}
          </p>
        </div>
      )}

      {!isLoading && message !== "" && (
        <p className="font-aptos text-sm font-regular leading-5 text-danger-800">
          {translateOr(
            "lulcParams.preview.unavailable",
            "This predictor cannot be shown",
          )}
          : {message}
        </p>
      )}

      {layer?.kind === "continuous" && (
        <div className="flex flex-row items-center gap-x-3">
          <p className={TEXT}>{formatLegendValue(layer.min)}</p>
          <div
            className="h-3 flex-1 rounded-full border border-neutral-400"
            style={{ background: legendGradient(layer.palette) }}
          />
          <p className={TEXT}>{formatLegendValue(layer.max)}</p>
        </div>
      )}

      {layer?.kind === "classes" && (
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          {(layer.classes ?? []).map((item) => (
            <div
              key={`preview-class-${item.value}`}
              className="flex flex-row items-center gap-x-2"
            >
              <span
                className="size-3 shrink-0 rounded-sm border border-neutral-400"
                style={{ background: item.color }}
              />
              <p className={TEXT}>{item.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
