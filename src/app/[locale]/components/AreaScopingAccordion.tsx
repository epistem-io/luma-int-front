"use client";

import { ComingSoon } from "@/components/ComingSoon";
import {
  AccordionContent,
  AccordionFullTrigger,
  AccordionItem,
} from "@/components/ui/accordion";
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
import {
  SectionTitle,
  SummaryBox,
  SummaryChangeLink,
  SummaryField,
} from "./SummaryField";
import { useBasicInformationLabels } from "./useSummaryLabels";

export const AreaScopingAccordion = () => {
  const mapContext = useContext(MapContext);
  const mapGenerationContext = useContext(MapGenerationContext);

  const {
    setStepKey,
    setAreaScopingType,
    polygonData,
    areaScopingPolygonArea,
    areaScopingType,
    areaScopingPolygonFileName,
    hasLeftStep1,
  } = mapGenerationContext;

  const t = useTranslations("InteractivePanel");
  const { inputMethodLabel, locationLabel, spatialResolutionLabel } =
    useBasicInformationLabels();

  const isDone =
    !!polygonData && areaScopingPolygonArea <= AREA_SCOPING_POLYGON_AREA_LIMIT;
  // Uploaded file name, or the district/city; drawn areas have neither.
  const fileOrLocation =
    areaScopingType === AREA_SCOPING_TYPE.UPLOAD
      ? areaScopingPolygonFileName
      : locationLabel;

  return (
    <AccordionItem
      value={BASIC_INFORMATION_ACCORDION_TYPE.SCOPING}
      className="rounded-xl border border-neutral-400 bg-white pb-3 last:border-b"
    >
      <AccordionFullTrigger
        icon={
          <ChevronDown className="h-5 w-5 shrink-0 text-primary-pink transition-transform duration-200" />
        }
        className="hover:no-underline p-3 pb-0"
      >
        <SectionTitle title={t("areaScoping.areaScoping")} isDone={isDone} />
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
            <div
              data-testid="area-scoping-regency-card"
              className="p-4 rounded-xl space-y-2 border border-primary-red-pink-normal hover:brightness-95 hover:cursor-pointer transition-all duration-200 bg-white"
              onClick={() => {
                setAreaScopingType(AREA_SCOPING_TYPE.REGENCY);
                setStepKey(PANEL_COMPONENT_KEY.AREA_SCOPING);
              }}
            >
              <div className="flex flex-row justify-between items-start gap-x-3">
                <div className="flex flex-row items-center gap-x-3 min-w-0">
                  <Image
                    src="/svgs/regency-search.svg"
                    alt="select-regency"
                    width={28}
                    height={28}
                    className="size-7 aspect-square text-primary-pink shrink-0"
                  />
                  <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main truncate">
                    {t("areaScoping.selectRegency")}
                  </p>
                </div>
                <ChevronRight className="size-5 text-neutral-700-baru shrink-0" />
              </div>
              <p className="font-aptos text-[13px] font-regular leading-4.5 text-neutral-700-baru">
                {t("areaScoping.selectRegencySubtitle")}
              </p>
            </div>
          </>
        )}
        {isDone && (
          <SummaryBox>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              <SummaryField
                className={fileOrLocation ? undefined : "col-span-2"}
                label={t("basicInformation.inputMethod")}
                value={inputMethodLabel}
              />
              {fileOrLocation && (
                <SummaryField
                  label={t("basicInformation.fileOrLocation")}
                  value={
                    <span className="block truncate" title={fileOrLocation}>
                      {fileOrLocation}
                    </span>
                  }
                />
              )}
              <SummaryField
                label={t("areaScoping.approximateArea")}
                value={`${numberThousandSeparator(areaScopingPolygonArea.toFixed(0))} Ha`}
              />
              <SummaryField
                label={t("areaScoping.spatialResolution")}
                value={spatialResolutionLabel ?? "-"}
              />
            </div>
            {/* The area is locked once the user has moved on to step 2. */}
            {!hasLeftStep1 && (
              <SummaryChangeLink
                label={t("common.changeInput")}
                onClick={() =>
                  resetAreaScopingData({ mapContext, mapGenerationContext })
                }
              />
            )}
          </SummaryBox>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};
