"use client";

import {
  Accordion,
  AccordionContent,
  AccordionFullTrigger,
  AccordionItem,
} from "@/components/ui/accordion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { MapContext } from "@/contexts/mapContext";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { cn } from "@/lib/utils";
import { ChevronDown, Eye, EyeOff, GripVertical } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";

function colorsToStyle(colors: string[]) {
  const len = colors.length;

  if (len === 1) {
    return {
      background: `${colors[0]}`,
    };
  }

  const str = colors
    .map((color, index) => `${color} ${(100 / (len - 1)) * index}%`)
    .join(",");

  return {
    background: `linear-gradient(270deg, ${str} )`,
  };
}

export const LegendPanelNew = () => {
  const {
    layerLegendArray,
    mosaicLayerArray,
    mosaicLayerVisibilityArray,
    mosaicData,
    setMosaicLayerVisibilityArray,
    vectorLayer,
    vectorVisible,
    setVectorVisible,
    finalLayer,
    finalLayerVisible,
    setFinalLayerVisible,
  } = useContext(MapContext);

  const { polygonData } = useContext(MapGenerationContext);

  const t = useTranslations("Legends");
  const tInteractive = useTranslations("InteractivePanel");

  const [visArr, setVisArr] = useState<boolean[]>([]);

  useEffect(() => {
    const arr: boolean[] = [];

    layerLegendArray.toReversed().forEach((item) => {
      arr.push(item.layer.getVisible());
    });

    setVisArr(arr);
  }, [layerLegendArray]);

  const toggleVis = (ind: number) => {
    const arr = [...visArr];

    arr[ind] = !arr[ind];

    setVisArr(arr);
  };

  return (
    <div className="fixed right-4 bottom-4 z-40 w-[300px]">
      <div
        className={cn(
          "bg-white rounded-md transition-all duration-300 ease-in-out overflow-hidden",
          // isExpanded ? "h-[455px]" : "h-[40px]",
        )}
      >
        <Accordion type="multiple">
          <AccordionItem className="" value="legend-accordion">
            <AccordionContent className="p-3">
              <div className="space-y-5 max-h-[360px] overflow-y-scroll">
                <div className="">
                  <p className="font-noto-sans text-xl font-semibold leading-7 tracking-[-0.2px] text-text-icons-base-main">
                    Legend
                  </p>
                  <p className="font-aptos text-neutral-700-baru text-md font-regular leading-6">
                    Showing all currently active layers on the map, drag and
                    drop to reorder.
                  </p>
                </div>
                <div className="space-y-3">
                  {finalLayer && (
                    <>
                      <p className="font-aptos text-md font-regular leading-6 text-text-icons-base-main">
                        Generated Map
                      </p>
                      <div className="space-y-8">
                        <div className="flex flex-row gap-x-1.5 items-start">
                          <GripVertical className="size-4 min-h-4 min-w-4 aspect-square text-text-icons-base-main" />
                          <Switch
                            onCheckedChange={(checked) => {
                              if (checked) {
                                finalLayer.setOpacity(1);
                                setFinalLayerVisible(true);

                                // const temp = [...mosaicLayerVisibilityArray];
                                // temp[index] = true;
                                // setMosaicLayerVisibilityArray(temp);
                                return;
                              }

                              finalLayer.setOpacity(0);
                              setFinalLayerVisible(false);

                              // const temp = [...mosaicLayerVisibilityArray];
                              // temp[index] = false;
                              // setMosaicLayerVisibilityArray(temp);
                            }}
                            checked={finalLayerVisible}
                          />
                          <p className="font-aptos text-sm text-text-icons-base-main font-regular leading-5 text-wrap">
                            Generated Map
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                  {polygonData && vectorLayer && (
                    <>
                      <p className="font-aptos text-md font-regular leading-6 text-text-icons-base-main">
                        Area of Interest
                      </p>
                      <div className="space-y-8">
                        <div className="flex flex-row gap-x-1.5 items-start">
                          <GripVertical className="size-4 min-h-4 min-w-4 aspect-square text-text-icons-base-main" />
                          <Switch
                            onCheckedChange={(checked) => {
                              if (checked) {
                                vectorLayer.setOpacity(1);
                                setVectorVisible(true);

                                // const temp = [...mosaicLayerVisibilityArray];
                                // temp[index] = true;
                                // setMosaicLayerVisibilityArray(temp);
                                return;
                              }

                              vectorLayer.setOpacity(0);
                              setVectorVisible(false);

                              // const temp = [...mosaicLayerVisibilityArray];
                              // temp[index] = false;
                              // setMosaicLayerVisibilityArray(temp);
                            }}
                            checked={vectorVisible}
                          />
                          <p className="font-aptos text-sm text-text-icons-base-main font-regular leading-5 text-wrap">
                            Polygon
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                  {mosaicLayerArray.length > 0 && (
                    <p className="font-aptos text-md font-regular leading-6 text-text-icons-base-main">
                      Mosaic Band
                    </p>
                  )}
                  <div className="space-y-8">
                    {mosaicLayerArray.map((item, index) => {
                      const mosaicDat = mosaicData[index];
                      const mosaicVis = mosaicLayerVisibilityArray[index];
                      return (
                        <div
                          key={`mosaic-layer-${index}`}
                          className="flex flex-row gap-x-1.5 items-start"
                        >
                          <GripVertical className="size-4 min-h-4 min-w-4 aspect-square text-text-icons-base-main" />
                          <Switch
                            onCheckedChange={(checked) => {
                              if (checked) {
                                item.setOpacity(1);

                                const temp = [...mosaicLayerVisibilityArray];
                                temp[index] = true;
                                setMosaicLayerVisibilityArray(temp);
                                return;
                              }

                              item.setOpacity(0);

                              const temp = [...mosaicLayerVisibilityArray];
                              temp[index] = false;
                              setMosaicLayerVisibilityArray(temp);
                            }}
                            checked={mosaicVis}
                          />
                          <p className="font-aptos text-sm text-text-icons-base-main font-regular leading-5 text-wrap">
                            {mosaicDat.name}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </AccordionContent>
            <AccordionFullTrigger
              icon={
                <ChevronDown className="h-4 w-4 shrink-0 text-text-icons-on-color transition-transform duration-200" />
              }
              className="px-6 py-2.5 hover:no-underline z-40 bg-primary-red-pink-normal"
            >
              <p className="font-aptos text-xl font-extrabold leading-6 text-text-icons-on-color">
                {tInteractive("legend")}
              </p>
              {/* <p className="bold-body-400">{tInteractive("legend")}</p> */}
            </AccordionFullTrigger>
            {/* <hr className="h-[1px] w-full bg-neutral-400" /> */}
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};
