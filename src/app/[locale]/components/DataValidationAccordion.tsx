import { ComingSoon } from "@/components/ComingSoon";
import {
  AccordionContent,
  AccordionFullTrigger,
  AccordionItem,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
import { cn, numberThousandSeparator } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronRight, Upload, UploadIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useContext } from "react";
import { Controller, useForm } from "react-hook-form";

import * as z from "zod";

export const DataValidationAccordion = () => {
  const {
    setStepKey,
    setAreaScopingType,
    polygonData,
    areaScopingPolygonArea,
  } = useContext(MapGenerationContext);

  const t = useTranslations("AnalysisPanel");

  return (
    <AccordionItem
      value={"data-validation"}
      className="rounded-xl border border-neutral-400 bg-white pb-3 last:border-b"
    >
      <AccordionFullTrigger
        icon={
          <ChevronDown className="h-5 w-5 shrink-0 text-primary-pink transition-transform duration-200" />
        }
        className="hover:no-underline p-3 pb-0"
      >
        <p className="font-noto-sans text-xl font-semibold leading-7 tracking-[-0.2px] text-primary-pink">
          Data Validation
        </p>
      </AccordionFullTrigger>
      <AccordionContent className="mt-5 space-y-6 px-3 pb-0">
        <ComingSoon />
        <div
          className={cn(
            "p-4 border-2 border-dashed border-secondary-purple-light-hover rounded-[12px] space-y-4 transition-all duration-200 relative",
            "min-h-40.5",
            "cursor-not-allowed",
          )}
        >
          <div className="space-y-3">
            <UploadIcon className="size-8 aspect-square text-text-icons-base-third mx-auto" />
            <p className="font-aptos text-[13px] font-regular leading-4.5 text-neutrals-600 text-center">
              Drag & drop your file here to upload. <br />
              Accepted format .zip
            </p>
          </div>
          <Label
            htmlFor="data-training-file-upload"
            className={cn(
              "w-50 mx-auto flex flex-row justify-center mb-0",
              true && "pointer-events-none cursor-not-allowed",
            )}
          >
            <div
              className={cn(
                "rounded-[12px] bg-primary-pink-hover hover:bg-primary-pink-hover hover:brightness-95 cursor-pointer w-full py-1.5 px-2 transition-all duration-200",
                true && "bg-text-icons-disabled",
              )}
            >
              <p
                className={cn(
                  "font-aptos text-[13px] font-semibold leading-4.5 text-primary-red-pink-normal text-center",
                  true && "text-text-icons-base-third",
                )}
              >
                Browse File
              </p>
            </div>
          </Label>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
