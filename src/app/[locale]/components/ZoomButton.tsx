"use client";

import { MapContext } from "@/contexts/mapContext";
import { Minus, Plus } from "lucide-react";
import { useContext } from "react";

export const ZoomButton = () => {
  const { mapInstance } = useContext(MapContext);
  return (
    <div className="border border-neutrals-300 rounded-md bg-neutral-100 flex flex-col z-11 overflow-hidden">
      <div
        onClick={() => {
          const view = mapInstance?.getView();

          if (!view) return;

          const zoom = view?.getZoom();

          if (!zoom) return;

          view.animate({
            zoom: zoom + 1,
          });
        }}
        className="p-1.5 pb-2 transition-all duration-300 hover:cursor-pointer hover:brightness-95 bg-neutral-100"
      >
        <Plus className="text-primary-500 stroke-3" />
      </div>
      <hr className="bg-primary-200" />
      <div
        onClick={() => {
          const view = mapInstance?.getView();

          if (!view) return;

          const zoom = view?.getZoom();

          if (!zoom) return;

          view.animate({
            zoom: zoom - 1,
          });
        }}
        className="p-1.5 pt-2 transition-all duration-300 hover:cursor-pointer hover:brightness-95 bg-neutral-100"
      >
        <Minus className="text-primary-500 stroke-3" />
      </div>
    </div>
  );
};
