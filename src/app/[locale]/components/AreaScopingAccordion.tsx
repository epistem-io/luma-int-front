"use client";

import { ComingSoon } from "@/components/ComingSoon";
import {
  AccordionContent,
  AccordionFullTrigger,
  AccordionItem,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AREA_SCOPING_POLYGON_AREA_LIMIT,
  AREA_SCOPING_TYPE,
  BASIC_INFORMATION_ACCORDION_TYPE,
  PANEL_COMPONENT_KEY,
} from "@/constants";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { numberThousandSeparator } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useContext } from "react";
import { Controller, useForm } from "react-hook-form";

import * as z from "zod";
import { SpatialResolutionSelect } from "./SpatialResolutionSelect";
import { resetAreaScopingData } from "@/lib/interactivePanelFlowHelper";
import { MapContext } from "@/contexts/mapContext";

export const AreaScopingAccordion = () => {
  const mapContext = useContext(MapContext);
  const mapGenerationContext = useContext(MapGenerationContext);

  const {
    setStepKey,
    setAreaScopingType,
    polygonData,
    areaScopingPolygonArea,
  } = mapGenerationContext;

  const t = useTranslations("InteractivePanel");

  return (
    <AccordionItem
      value={BASIC_INFORMATION_ACCORDION_TYPE.SCOPING}
      className="rounded-xl border border-neutral-400 bg-white pb-3"
    >
      <AccordionFullTrigger
        icon={
          <ChevronDown className="h-5 w-5 shrink-0 text-primary-pink transition-transform duration-200" />
        }
        className="hover:no-underline p-3 pb-0"
      >
        <p className="font-noto-sans text-xl font-semibold leading-7 tracking-[-0.2px] text-primary-pink">
          {t("areaScoping.areaScoping")}
        </p>
      </AccordionFullTrigger>
      <AccordionContent className="mt-5 space-y-6 px-3 pb-0">
        {!polygonData && (
          <>
            <div className="grid grid-cols-2 gap-x-3">
              <div
                className="p-4 rounded-xl space-y-2 border border-primary-red-pink-normal hover:brightness-95 hover:cursor-pointer transition-all duration-200 bg-white"
                onClick={() => {
                  setAreaScopingType(AREA_SCOPING_TYPE.UPLOAD);
                  setStepKey(PANEL_COMPONENT_KEY.AREA_SCOPING);
                }}
              >
                <div className="flex flex-row justify-between items-start">
                  <Image
                    src="/svgs/upload.svg"
                    alt="upload"
                    width={28}
                    height={28}
                    className="size-7 aspect-square text-primary-pink"
                  />
                  <ChevronRight className="size-5 text-neutral-700-baru" />
                </div>
                <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
                  {t("areaScoping.uploadSHP")}
                </p>
                <p className="font-aptos text-[13px] font-regular leading-4.5 text-neutral-700-baru">
                  {t("areaScoping.uploadSHPSubtitle")}
                </p>
              </div>
              <div
                className="p-4 rounded-xl space-y-2 border border-primary-red-pink-normal hover:brightness-95 hover:cursor-pointer transition-all duration-200 bg-white"
                onClick={() => {
                  setAreaScopingType(AREA_SCOPING_TYPE.DRAW);
                  setStepKey(PANEL_COMPONENT_KEY.AREA_SCOPING);
                }}
              >
                <div className="flex flex-row justify-between items-start">
                  <Image
                    src="/svgs/draw-polygon.svg"
                    alt="draw-polygon"
                    width={29.33}
                    height={24}
                    className="size-7 aspect-square text-primary-pink"
                  />
                  <ChevronRight className="size-5 text-neutral-700-baru" />
                </div>
                <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
                  {t("areaScoping.drawPolygon")}
                </p>
                <p className="font-aptos text-[13px] font-regular leading-4.5 text-neutral-700-baru">
                  {t("areaScoping.drawPolygonDescription")}
                </p>
              </div>
            </div>
            <SpatialResolutionSelect />
            {/* <div className="p-3 rounded-xl space-y-2 bg-text-icons-base-fourth">
              <ComingSoon />
              <div className="">
                <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-third">
                  {t("areaScoping.spatialResolution")}
                </p>
                <p className="text-l-regular text-text-icons-base-third">
                  {t("areaScoping.spatialResolutionSubtitle")}
                </p>
              </div>
              <div className="">
                <RadioGroup
                  disabled
                  className="flex flex-row gap-x-12"
                  // className="grid grid-cols-2 gap-x-12 gap-y-2"
                >
                  <div className="flex flex-col gap-y-2">
                    <div className="flex flex-row items-center gap-x-2">
                      <RadioGroupItem value="1" />
                      <Label className="font-aptos text-md font-semibold leading-6 text-text-icons-base-third">
                        {t("areaScoping.30x30m2")}
                      </Label>
                    </div>
                    <div className="flex flex-row items-center gap-x-2">
                      <RadioGroupItem value="3" />
                      <Label className="font-aptos text-md font-semibold leading-6 text-text-icons-base-third">
                        {t("areaScoping.100x100m2")}
                      </Label>
                    </div>
                  </div>
                  <div className="flex flex-col gap-y-2">
                    <div className="flex flex-row items-center gap-x-2">
                      <RadioGroupItem value="2" />
                      <Label className="font-aptos text-md font-semibold leading-6 text-text-icons-base-third">
                        {t("areaScoping.500x500m2")}
                      </Label>
                    </div>
                    <div className="flex flex-row items-center gap-x-2">
                      <RadioGroupItem value="4" />
                      <Label className="font-aptos text-md font-semibold leading-6 text-text-icons-base-third">
                        {t("areaScoping.1x1km2")}
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div> */}
          </>
        )}
        {polygonData &&
          areaScopingPolygonArea <= AREA_SCOPING_POLYGON_AREA_LIMIT && (
            <div className="px-3 py-3 rounded-[12px] border-2 border-dashed border-secondary-purple-light-active bg-purple-second">
              <div className="space-y-3 col-span-2 text-center w-full">
                <p className="font-aptos text-lg font-semibold leading-7 text-text-icons-base-main">
                  {t("areaScoping.selectedAreaHasTotalArea")}
                </p>
                <p className="font-noto-sans text-[32px] font-bold leading-10 tracking-[-0.48px] text-secondary-purple-dark">
                  {numberThousandSeparator(areaScopingPolygonArea.toFixed(0))}{" "}
                  Ha
                </p>
              </div>

              <div className="flex flex-row justify-end">
                <Button
                  variant={"ghost"}
                  className="p-0 hover:bg-transparent cursor-pointer ml-auto h-fit"
                  // disabled={isMosaicLoading}
                  onClick={async () => {
                    // onResetInput();
                    resetAreaScopingData({
                      mapContext,
                      mapGenerationContext,
                    });
                  }}
                >
                  <div className="">
                    <p className="text-text-icons-base-third font-aptos text-md font-regular leading-6 underline">
                      {/* WIP dict */}
                      Reselect Time Period
                    </p>
                  </div>
                </Button>
              </div>
            </div>
          )}
      </AccordionContent>
    </AccordionItem>
  );
};
