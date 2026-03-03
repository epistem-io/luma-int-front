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
import { numberThousandSeparator } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronRight, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useContext } from "react";
import { Controller, useForm } from "react-hook-form";

import * as z from "zod";

export const RandomForestAccordion = () => {
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
      value={"random-forest"}
      className="rounded-xl border border-neutral-400 bg-white pb-3"
    >
      <AccordionFullTrigger
        icon={
          <ChevronDown className="h-5 w-5 shrink-0 text-primary-pink transition-transform duration-200" />
        }
        className="hover:no-underline p-3 pb-0"
      >
        <p className="font-noto-sans text-xl font-semibold leading-7 tracking-[-0.2px] text-primary-pink">
          {tInteractive("RFVariable")}
        </p>
      </AccordionFullTrigger>
      <AccordionContent className="mt-5 space-y-6 px-3 pb-0">
        <div className="rounded-md p-2 space-y-5 bg-background-disableds cursor-not-allowed">
          <ComingSoon />
          <div className="grid grid-cols-2 space-x-5">
            <div className="space-y-2">
              <Label>
                <p className="text-text-icons-base-third font-aptos text-sm font-regular heading-5">
                  {t("Section4.nOfTree")}
                </p>
              </Label>
              <Input className="" disabled />
              <p className="font-aptos text-xs font-regular heading4 text-neutrals-600">
                {t("Section4.fillWNum", { min: 10, max: 500 })}
              </p>
            </div>
            <div className="space-y-2">
              <Label>
                <p className="text-text-icons-base-third font-aptos text-sm font-regular heading-5">
                  {t("Section4.minLeafPop")}
                </p>
              </Label>
              <Input className="" disabled />
              <p className="font-aptos text-xs font-regular heading4 text-neutrals-600">
                {t("Section4.fillWNum", { min: 1, max: 50 })}
              </p>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
