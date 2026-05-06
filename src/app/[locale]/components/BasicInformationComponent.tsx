import { ComingSoon } from "@/components/ComingSoon";
import {
  Accordion,
  AccordionContent,
  AccordionFullTrigger,
  AccordionItem,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronDown, ChevronRight } from "lucide-react";
import Image from "next/image";
import { TimePeriodAccordion } from "./TimePeriodAccordion";
import { AreaScopingAccordion } from "./AreaScopingAccordion";
import { SateliteCompositeAccordion } from "./SateliteCompositeAccordion";
import { Button } from "@/components/ui/button";
import { useContext } from "react";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import {
  AREA_SCOPING_POLYGON_AREA_LIMIT,
  PANEL_COMPONENT_KEY,
} from "@/constants";
import { useTranslations } from "next-intl";

export const BasicInformationComponent = () => {
  const { basicInformationOpenAccordion, setBasicInformationOpenAccordion } =
    useContext(MapGenerationContext);

  return (
    <>
      <Accordion
        value={basicInformationOpenAccordion}
        onValueChange={setBasicInformationOpenAccordion}
        type="single"
        collapsible
        className="space-y-4"
      >
        <AreaScopingAccordion />
        <TimePeriodAccordion />
        <SateliteCompositeAccordion />
      </Accordion>
    </>
  );
};

export const BasicInformationFooter = () => {
  const {
    temporalCoverage,
    temporalCoverageUnit,
    setStepKey,
    polygonData,
    areaScopingPolygonArea,
  } = useContext(MapGenerationContext);

  const t = useTranslations("InteractivePanel");

  const isNextDisabled =
    !temporalCoverage ||
    !temporalCoverageUnit ||
    !polygonData ||
    areaScopingPolygonArea >= AREA_SCOPING_POLYGON_AREA_LIMIT;

  return (
    <div className="flex flex-row justify-end p-3 pt-2">
      <Button
        onClick={() => {
          setStepKey(PANEL_COMPONENT_KEY.BASIC_INFORMATION_SUMMARY);
        }}
        disabled={isNextDisabled}
        variant="primary"
        className="w-39.25"
      >
        {t("common.next")}
      </Button>
    </div>
  );
};
