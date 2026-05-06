import { ComingSoon } from "@/components/ComingSoon";
import {
  AccordionContent,
  AccordionFullTrigger,
  AccordionItem,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ChevronDown, ChevronRight, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useContext } from "react";
import { Controller, useForm } from "react-hook-form";

import * as z from "zod";

export const SelectPredictorAccordion = () => {
  const {
    setStepKey,
    setAreaScopingType,
    polygonData,
    areaScopingPolygonArea,
  } = useContext(MapGenerationContext);

  const t = useTranslations("AnalysisPanel");

  const tInteractive = useTranslations("InteractivePanel");

  return (
    <AccordionItem
      value={"predictor"}
      className="rounded-xl border border-neutral-400 bg-white pb-3"
    >
      <AccordionFullTrigger
        icon={
          <ChevronDown className="h-5 w-5 shrink-0 text-primary-pink transition-transform duration-200" />
        }
        className="hover:no-underline p-3 pb-0"
      >
        <p className="font-noto-sans text-xl font-semibold leading-7 tracking-[-0.2px] text-primary-pink">
          {tInteractive("lulcParams.selectPredictor")}
        </p>
      </AccordionFullTrigger>
      <AccordionContent className="mt-5 space-y-6 px-3 pb-0">
        <div className="rounded-md p-2 space-y-5 bg-background-disableds">
          <ComingSoon />
          <div className="space-y-5">
            <div className="space-y-2.5">
              <div className="flex flex-row space-x-3">
                <Checkbox
                  disabled
                  className="mt-0.5 border-text-icons-base-third"
                />
                <div className="space-y-1">
                  <p className="text-m-semibold text-text-icons-base-third">
                    Elevation
                  </p>
                  <p className="text-xs-regular text-text-icons-base-third">
                    Shuttle Radar Topography Mission (SRTM) elevation
                  </p>
                </div>
              </div>
              <div className="flex flex-row space-x-3">
                <Checkbox
                  disabled
                  className="mt-0.5 border-text-icons-base-third"
                />
                <div className="space-y-1">
                  <p className="text-m-semibold text-text-icons-base-third">
                    Slope
                  </p>
                  <p className="text-xs-regular text-text-icons-base-third">
                    Shuttle Radar Topography Mission (SRTM) slope
                  </p>
                </div>
              </div>
              <div className="flex flex-row space-x-3">
                <Checkbox
                  disabled
                  className="mt-0.5 border-text-icons-base-third"
                />
                <div className="space-y-1">
                  <p className="text-m-semibold text-text-icons-base-third">
                    NDVI
                  </p>
                  <p className="text-xs-regular text-text-icons-base-third">
                    Normalized Difference Vegetation Index
                  </p>
                </div>
              </div>
              <div className="flex flex-row space-x-3">
                <Checkbox
                  disabled
                  className="mt-0.5 border-text-icons-base-third"
                />
                <div className="space-y-1">
                  <p className="text-m-semibold text-text-icons-base-third">
                    NDWI
                  </p>
                  <p className="text-xs-regular text-text-icons-base-third">
                    Normalized Difference Water Index
                  </p>
                </div>
              </div>
              <div className="flex flex-row space-x-3">
                <Checkbox
                  disabled
                  className="mt-0.5 border-text-icons-base-third"
                />
                <div className="space-y-1">
                  <p className="text-m-semibold text-text-icons-base-third">
                    BG
                  </p>
                  <p className="text-xs-regular text-text-icons-base-third">
                    Normalized Difference Blue Green
                  </p>
                </div>
              </div>
              <div className="flex flex-row space-x-3">
                <Checkbox
                  disabled
                  className="mt-0.5 border-text-icons-base-third"
                />
                <div className="space-y-1">
                  <p className="text-m-semibold text-text-icons-base-third">
                    Blue
                  </p>
                  <p className="text-xs-regular text-text-icons-base-third">
                    Blue band
                  </p>
                </div>
              </div>
              <div className="flex flex-row space-x-3">
                <Checkbox
                  disabled
                  className="mt-0.5 border-text-icons-base-third"
                />
                <div className="space-y-1">
                  <p className="text-m-semibold text-text-icons-base-third">
                    Green
                  </p>
                  <p className="text-xs-regular text-text-icons-base-third">
                    Green band
                  </p>
                </div>
              </div>
              <div className="flex flex-row space-x-3">
                <Checkbox
                  disabled
                  className="mt-0.5 border-text-icons-base-third"
                />
                <div className="space-y-1">
                  <p className="text-m-semibold text-text-icons-base-third">
                    Red
                  </p>
                  <p className="text-xs-regular text-text-icons-base-third">
                    Red band
                  </p>
                </div>
              </div>
              <div className="flex flex-row space-x-3">
                <Checkbox
                  disabled
                  className="mt-0.5 border-text-icons-base-third"
                />
                <div className="space-y-1">
                  <p className="text-m-semibold text-text-icons-base-third">
                    NIR
                  </p>
                  <p className="text-xs-regular text-text-icons-base-third">
                    Near Infrared Band
                  </p>
                </div>
              </div>
              <div className="flex flex-row space-x-3">
                <Checkbox
                  disabled
                  className="mt-0.5 border-text-icons-base-third"
                />
                <div className="space-y-1">
                  <p className="text-m-semibold text-text-icons-base-third">
                    Distance to Road
                  </p>
                  <p className="text-xs-regular text-text-icons-base-third">
                    Measuring closest road available
                  </p>
                </div>
              </div>
              <div className="flex flex-row space-x-3">
                <Checkbox
                  disabled
                  className="mt-0.5 border-text-icons-base-third"
                />
                <div className="space-y-1">
                  <p className="text-m-semibold text-text-icons-base-third">
                    Distance to River
                  </p>
                  <p className="text-xs-regular text-text-icons-base-third">
                    Measuring closest river available
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-background-disableds rounded-xl border border-dashed border-[rgba(184,187,199,1)] p-6 space-y-4 cursor-not-allowed">
              <p className="text-l-bold text-text-icons-base-third text-center">
                {/* <p className="text-l-bold text-[#002F3D] text-center"> */}
                {t("Section4.selectPredictorDesc")}
              </p>
              <div className="p-2 rounded-full border-neutral-600 border mx-auto w-fit">
                <Upload className="text-text-icons-base-third h-5 w-5" />
              </div>
              <div className="text-center">
                <p className="text-l-medium text-text-icons-base-third">
                  {t("Section4.fileUploadDesc1")}{" "}
                  <b className="text-primary-pink underline">
                    {t("Section4.fileUploadDesc2")}
                  </b>{" "}
                  {t("Section4.fileUploadDesc3")}
                </p>
                <p className="text-s-medium text-text-icons-light-base-second">
                  {t("Section4.fileUploadSupportedFiles")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
