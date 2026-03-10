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
import { useContext, useEffect, useMemo, useState } from "react";

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

const LULC_ARR = [
  { color: "#296736", name: "Hutan" },
  { color: "#7DD070", name: "Sawah" },
  { color: "#16A900", name: "Semak" },
  { color: "#3586CE", name: "Badan Air" },
  { color: "#EBE47A", name: "Ladang" },
];

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
    isPreviewingMosaic,
    isLegendVisible,
    setIsLegendVisible,
  } = useContext(MapContext);

  const { polygonData, generateMapLULC } = useContext(MapGenerationContext);

  const t = useTranslations("Legends");
  const tInteractive = useTranslations("InteractivePanel");

  const [visArr, setVisArr] = useState<boolean[]>([]);
  const [accordionArr, setAccordionArr] = useState<string[]>([]);

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

  useEffect(() => {
    if (!isPreviewingMosaic) {
      return;
    }

    if (accordionArr.includes("composite")) {
      return;
    }

    const temp = [...accordionArr, "composite"];

    setAccordionArr(temp);
  }, [isPreviewingMosaic]);

  const legendVisible = useMemo(() => {
    return isLegendVisible;
  }, [isLegendVisible]);

  return (
    <div className="fixed right-8 bottom-8 z-40 w-[300px]">
      <div
        className={cn(
          "bg-white rounded-md transition-all duration-300 ease-in-out overflow-hidden",
          // isExpanded ? "h-[455px]" : "h-[40px]",
        )}
      >
        <Accordion
          value={legendVisible}
          onValueChange={(val) => {
            console.log("vall", val);
            setIsLegendVisible(val);
          }}
          type="multiple"
        >
          <AccordionItem className="" value="legend-accordion">
            <AccordionContent className="p-3">
              <div className="space-y-6 max-h-[360px] overflow-y-scroll">
                <div className="">
                  <p className="font-noto-sans text-xl font-semibold leading-7 tracking-[-0.2px] text-text-icons-base-main">
                    {tInteractive("layerAndComposites")}
                  </p>
                  <p className="font-aptos text-neutral-700-baru text-md font-regular leading-6">
                    {tInteractive("layerAndCompositesSubtitle")}
                  </p>
                </div>
                <div className="space-y-6">
                  {/* {finalLayer && (
                    <div className="space-y-4">
                      <p className="font-aptos text-md font-regular leading-6 text-text-icons-base-main">
                        Generated Map
                      </p>
                      <div className="space-y-6">
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
                    </div>
                  )} */}
                  {/* {polygonData && vectorLayer && (
                    <div className="space-y-4">
                      <p className="font-aptos text-md font-regular leading-6 text-text-icons-base-main">
                        Area of Interest
                      </p>
                      <div className="space-y-6">
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
                    </div>
                  )} */}
                  {/* {mosaicLayerArray.length > 0 && (
                    <div className="space-y-4">
                      <p className="font-aptos text-md font-regular leading-6 text-text-icons-base-main">
                        Mosaic Band
                      </p>
                      <div className="space-y-6">
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

                                    const temp = [
                                      ...mosaicLayerVisibilityArray,
                                    ];
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
                  )} */}
                  <Accordion
                    type="multiple"
                    value={accordionArr}
                    onValueChange={(val) => {
                      setAccordionArr(val);
                    }}
                    className="space-y-4"
                  >
                    {polygonData && vectorLayer && (
                      <AccordionItem value="aoi" className="border-b-0">
                        <AccordionFullTrigger>
                          <p className="font-aptos text-[15px]] font-bold leading-5.5 text-text-icons-base-main">
                            {tInteractive("areaOfInterest")}
                          </p>
                        </AccordionFullTrigger>
                        <AccordionContent>
                          <div className="mt-4">
                            <div className="space-y-6">
                              <div className="flex flex-row gap-x-1.5 items-start">
                                {/* <GripVertical className="size-4 min-h-4 min-w-4 aspect-square text-text-icons-base-main" /> */}
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
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                    {mosaicLayerArray.length > 0 && (
                      <AccordionItem value="composite" className="border-b-0">
                        <AccordionFullTrigger>
                          <p className="font-aptos text-[15px]] font-bold leading-5.5 text-text-icons-base-main">
                            {tInteractive("composite")}
                          </p>
                        </AccordionFullTrigger>
                        <AccordionContent>
                          <div className="mt-4">
                            <div className="space-y-6">
                              {mosaicLayerArray.map((item, index) => {
                                const mosaicDat = mosaicData[index];
                                const mosaicVis =
                                  mosaicLayerVisibilityArray[index];
                                return (
                                  <div
                                    key={`mosaic-layer-${index}`}
                                    className="flex flex-row gap-x-1.5 items-start"
                                  >
                                    {/* <GripVertical className="size-4 min-h-4 min-w-4 aspect-square text-text-icons-base-main" /> */}
                                    <Switch
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          item.setOpacity(1);

                                          const temp = [
                                            ...mosaicLayerVisibilityArray,
                                          ];
                                          temp[index] = true;
                                          setMosaicLayerVisibilityArray(temp);
                                          return;
                                        }

                                        item.setOpacity(0);

                                        const temp = [
                                          ...mosaicLayerVisibilityArray,
                                        ];
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
                        </AccordionContent>
                      </AccordionItem>
                    )}
                    {generateMapLULC && generateMapLULC?.lulc_composition && (
                      <AccordionItem value="lulc" className="border-b-0">
                        <AccordionFullTrigger>
                          <p className="font-aptos text-[15px]] font-bold leading-5.5 text-text-icons-base-main">
                            {tInteractive("lulcClass")}
                          </p>
                        </AccordionFullTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-3 gap-3 mt-4">
                            {generateMapLULC.lulc_composition.map(
                              (item, index) => {
                                return (
                                  <div
                                    className="flex flex-row gap-x-2 items-center"
                                    key={`lulc-${index}`}
                                  >
                                    <div
                                      className="size-4 aspect-square rounded-[4px]"
                                      style={{
                                        backgroundColor: item.class_color,
                                      }}
                                    />
                                    <p className="font-aptos text-sm font-regular leading-5 text-text-icons-base-main">
                                      {item.class_name}
                                    </p>
                                  </div>
                                );
                              },
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                    {mosaicLayerArray.length > 0 && (
                      <AccordionItem value="cloud_cover" className="border-b-0">
                        <AccordionFullTrigger>
                          <p className="font-aptos text-[15px]] font-bold leading-5.5 text-text-icons-base-main">
                            {tInteractive("cloudCoverage")}
                          </p>
                        </AccordionFullTrigger>
                        <AccordionContent>
                          <div className="mt-4">
                            <p className="font-aptos text-sm font-regular leading-5 text-text-icons-base-third">
                              {tInteractive("cloudCoverageLegendDescription")}
                            </p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                  </Accordion>
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
                {tInteractive("layerAndComposites")}
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
