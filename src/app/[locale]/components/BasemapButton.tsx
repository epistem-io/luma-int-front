"use client";

import { MapContext } from "@/contexts/mapContext";
import Image from "next/image";
import { useContext } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BASEMAP_TYPE } from "@/constants";
import { cn } from "@/lib/utils";

export const BasemapButton = () => {
  const { mapInstance, setSelectedBasemap, selectedBasemap } =
    useContext(MapContext);

  const onClickBasemap = (key: string) => {
    if (!mapInstance) return;

    setSelectedBasemap(key);

    mapInstance?.getLayers().forEach((layer) => {
      if (
        layer.get("name") !== BASEMAP_TYPE.GREY &&
        layer.get("name") !== BASEMAP_TYPE.OSM &&
        layer.get("name") !== BASEMAP_TYPE.SATELLITE
      )
        return;
      if (layer.get("name") === key) {
        layer.setVisible(true);
      } else {
        layer.setVisible(false);
      }
    });
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          {/* <Button variant="outline">Open Popover</Button> */}

          <div className="border border-neutrals-300 rounded-md bg-neutral-100 flex flex-col z-11 overflow-hidden">
            <div
              // onClick={() => {
              //   const view = mapInstance?.getView();

              //   if (!view) return;

              //   const zoom = view?.getZoom();

              //   if (!zoom) return;

              //   view.animate({
              //     zoom: zoom + 1,
              //   });
              // }}
              className="p-2 transition-all duration-300 hover:cursor-pointer hover:brightness-95 bg-neutral-100"
            >
              {/* <Layers2 className="text-primary-500 stroke-3" /> */}
              <Image
                src="/svgs/layer.svg"
                unoptimized
                alt="layer"
                width={20}
                height={20}
                className=" size-5 aspect-square"
              />
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent
          side="left"
          className="border border-neutrals-300 rounded-md! bg-neutral-100 p-4 min-w-0 w-auto"
        >
          {/* <PopoverHeader>
      <PopoverTitle>Title</PopoverTitle>
      <PopoverDescription>Description text here.</PopoverDescription>
    </PopoverHeader> */}
          <p className="font-aptos text-xl font-bold leading-6 text-text-icons-base-main">
            Base Map
          </p>
          <div className=" flex flex-row gap-x-0.5 mt-6">
            <div className="flex flex-col gap-y-2">
              <div
                className={cn(
                  "size-20 aspect-square p-1 hover:cursor-pointer hover:brightness-105 transition-all duration-200",
                )}
                onClick={() => {
                  onClickBasemap(BASEMAP_TYPE.GREY);
                }}
                title="Gray"
              >
                <Image
                  className={cn(
                    " rounded-xs overflow-hidden",
                    selectedBasemap === BASEMAP_TYPE.GREY &&
                      "border-2 border-primary-pink",
                  )}
                  src="/images/grey.webp"
                  alt="grey"
                  width={256}
                  height={256}
                />
              </div>
              <p className="font-pjs text-xs font-regular leading-4.5 text-neutral-700-baru text-center">
                Grey
              </p>
            </div>
            <div className="flex flex-col gap-y-2">
              <div
                className={cn(
                  "size-20 aspect-square p-1 hover:cursor-pointer hover:brightness-105 transition-all duration-200",
                )}
                onClick={() => {
                  onClickBasemap(BASEMAP_TYPE.OSM);
                }}
                title="OSM"
              >
                <Image
                  className={cn(
                    " rounded-xs overflow-hidden",
                    selectedBasemap === BASEMAP_TYPE.OSM &&
                      "border-2 border-primary-pink",
                  )}
                  src="/images/osm.webp"
                  alt="osm"
                  width={256}
                  height={256}
                />
              </div>
              <p className="font-pjs text-xs font-regular leading-4.5 text-neutral-700-baru text-center">
                OSM
              </p>
            </div>
            <div className="flex flex-col gap-y-2">
              <div
                className={cn(
                  "size-20 aspect-square p-1 hover:cursor-pointer hover:brightness-105 transition-all duration-200",
                )}
                onClick={() => {
                  onClickBasemap(BASEMAP_TYPE.SATELLITE);
                }}
                title="Satellite"
              >
                <Image
                  className={cn(
                    " rounded-xs overflow-hidden",
                    selectedBasemap === BASEMAP_TYPE.SATELLITE &&
                      "border-2 border-primary-pink",
                  )}
                  src="/images/satellite.webp"
                  alt="satellite"
                  width={256}
                  height={256}
                />
              </div>
              <p className="font-pjs text-xs font-regular leading-4.5 text-neutral-700-baru text-center">
                Satellite
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};
