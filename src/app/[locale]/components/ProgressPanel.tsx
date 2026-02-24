"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { StepBar } from "./StepBar";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { useContext } from "react";

export const ProgressPanel = () => {
  const { progressPanelIndex } = useContext(MapGenerationContext);

  return (
    <div className="bg-content-gray rounded-2xl w-120.75 p-4">
      <div className="space-y-7.5">
        <div className="flex flex-row justify-between w-full">
          <Button
            disabled
            className="py-1 px-3 flex flex-row gap-2 items-center bg-gray-500 hover:cursor-pointer disabled:bg-gray-500 disabled:opacity-100 rounded-md"
          >
            <Image
              src="/svgs/map.svg"
              alt="map"
              width={24}
              height={24}
              className="h-6 aspect-square text-text-icons-on-color!"
            />
            <p className="font-noto-sans text-xl font-semibold leading-7 tracking-[-0.2px]">
              Generate LULC Map
            </p>
          </Button>
          <Button className="py-1 px-1 aspect-square flex flex-row gap-2 items-center bg-content-gray hover:cursor-pointer">
            <Image
              src="/svgs/search-map.svg"
              alt="search-map"
              width={24}
              height={24}
              className="size-6 aspect-square text-text-icons-on-color!"
            />
          </Button>
          <Button className="py-1 px-1 aspect-square flex flex-row gap-2 items-center bg-content-gray hover:cursor-pointer">
            <Image
              src="/svgs/share.svg"
              alt="share"
              width={24}
              height={24}
              className="h-6 aspect-square text-text-icons-on-color!"
            />
          </Button>
        </div>
        <StepBar stepIndex={progressPanelIndex} />
      </div>
    </div>
  );
};
