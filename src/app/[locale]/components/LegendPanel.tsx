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
import { MapContext } from "@/contexts/mapContext";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
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

export const LegendPanel = () => {
  const { layerLegendArray } = useContext(MapContext);

  const t = useTranslations("Legends");

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
    <div className="fixed right-4 bottom-4 z-40 w-[250px]">
      <div
        className={cn(
          "bg-neutral-100 border border-neutral-400 rounded-md shadow-lg transition-all duration-300 ease-in-out overflow-hidden",
          // isExpanded ? "h-[455px]" : "h-[40px]",
        )}
      >
        <Accordion type="multiple">
          <AccordionItem className="" value="legend-accordion">
            <AccordionFullTrigger className="px-4 py-1.5 hover:no-underline shadow z-40">
              <p className="bold-body-400">
                {t("legend")}
                {"  "}
                <span className="regular-body-400">
                  {t("activeLayer", { numOfLayer: layerLegendArray.length })}
                  {/* ({layerLegendArray.length} active layers) */}
                </span>
              </p>
            </AccordionFullTrigger>
            {/* <hr className="h-[1px] w-full bg-neutral-400" /> */}
            <AccordionContent className="py-2 space-y-2 max-h-[50vh] overflow-y-scroll">
              {layerLegendArray.toReversed().map((item, index, arr) => {
                const { name, layer } = item;

                // const [isVisible, setIsVisible] = useState(layer.getVisible());
                const visible = visArr[index];

                return (
                  <div
                    key={`legend-${item.name}-${index}`}
                    className="flex flex-col space-y-0.5"
                  >
                    <div className="px-4 grid grid-cols-12">
                      <div className="col-span-8">
                        <p className="text-l-semibold text-left">{name}</p>
                      </div>

                      <div className="col-span-4 ml-auto flex flex-row items-baseline space-x-0.5 pt-0.5 pl-4">
                        <div
                          className="p-0.5 rounded-full hover:cursor-pointer bg-neutral-100 hover:brightness-95 flex flex-row items-center justify-center h-fit"
                          onClick={() => {
                            // legend.isVisible = !legend.isVisible;
                            layer.setVisible(!visible);
                            toggleVis(index);
                            // layer.setProperties({
                            //   visible,
                            // });
                          }}
                        >
                          {visible && (
                            <Eye className="h-4 w-4 fill-black text-white" />
                          )}
                          {!visible && (
                            <EyeOff className="h-4 w-4 fill-black text-white" />
                          )}
                        </div>
                        <Popover>
                          <PopoverTrigger>
                            <div className="p-0.5 rounded-full hover:cursor-pointer bg-neutral-100 hover:brightness-95 flex flex-row items-center justify-center h-fit">
                              <Image
                                src="/images/opacity.svg"
                                alt="opacity"
                                className="h-4 w-4"
                                width={16}
                                height={16}
                              />
                              {/* <X className="h-4 w-4 text-[rgba(108,117,125)]" /> */}
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="space-y-1">
                            <p className="">Opacity</p>
                            <Slider
                              onValueChange={(val: number[]) => {
                                layer.setOpacity(val[0] / 100);
                              }}
                              min={0}
                              max={100}
                              defaultValue={[layer.getOpacity() * 100]}
                              step={1}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="px-4 space-y-1 w-full">
                      {item.legend.items.map((lItem, lIndex) => {
                        return (
                          <div
                            key={`legend-item-${item.name}-${lIndex}`}
                            className="flex flex-row items-center space-x-2 w-full"
                          >
                            {!(lItem.color instanceof Array) && (
                              <>
                                <div
                                  className="h-4 w-4 rounded-full border border-black"
                                  style={{
                                    backgroundColor: lItem.color,
                                  }}
                                ></div>
                                <p className="">{lItem.name}</p>
                              </>
                            )}
                            {lItem.color instanceof Array && (
                              <div className=" w-full space-y-1">
                                <p className="">{lItem.name}</p>

                                <div
                                  className="w-full h-4 border border-black"
                                  style={colorsToStyle(lItem.color)}
                                ></div>
                                {/* {lItem.color.map((col) => (
                                  <p>{col}</p>
                                ))} */}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {index + 1 !== arr.length && (
                      <hr className="mt-2 h-[1px] w-full bg-neutral-400" />
                    )}
                  </div>
                );
              })}
              <div className=""></div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};
