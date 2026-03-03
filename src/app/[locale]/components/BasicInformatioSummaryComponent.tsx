// "use client";

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
import { useContext, useState } from "react";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import {
  BASIC_INFORMATION_ACCORDION_TYPE,
  PANEL_COMPONENT_KEY,
  TEMPORAL_COVERAGE_ARRAY,
} from "@/constants";
import { AreaScopingSummary } from "./AreaScopingSummary";
import { TimePeriodSummary } from "./TimePeriodSummary";
import { SatelliteCompositeSummary } from "./SatelliteCompositeSummary";
import { Switch } from "@/components/ui/switch";
import { cn, getTemporalRangeText, numberThousandSeparator } from "@/lib/utils";
import { MosaicSummary } from "./MosaicSummary";
import { MapContext } from "@/contexts/mapContext";
import { ConfirmDialog } from "./ConfirmDialog";
import { useTranslations } from "next-intl";
import { TFunction } from "@/i18n/types";

export const BasicInformationSummaryComponent = () => {
  const { resetMosaicLayer } = useContext(MapContext);

  const {
    basicInformationOpenAccordion,
    areaScopingPolygonArea,
    setBasicInformationOpenAccordion,
    temporalCoverage,
    temporalCoverageUnit,
    // isPreviewingMosaic,
    // setIsPreviewingMosaic,
    isBasicInformationChangeInput,
    setIsBasicInformationChangeInput,
    setStepKey,
    setTemporalCoverage,
    setTemporalCoverageUnit,
    setisEditingTemporalCoverage,
    setAreaScopingPolygonUrl,
    setAreaScopingPolygonFileName,
    setAreaScopingPolygonArea,
    setAreaScopingPolygonFileSize,
    setAreaScopingPolygonError,
    setPolygonData,
  } = useContext(MapGenerationContext);

  const { vectorSource } = useContext(MapContext);

  const t = useTranslations("InteractivePanel");

  // const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false)

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
            {t("summaryOfBasicInformation")}
          </p>
          <div className="px-3 py-3 rounded-[12px] border-2 border-dashed border-secondary-purple-light-active bg-purple-second space-y-4">
            <AreaScopingSummary
              areaSizeString={`${numberThousandSeparator(areaScopingPolygonArea.toFixed(0))} Ha`}
              accordion={false}
              isEditing={isBasicInformationChangeInput}
              onClickEdit={() => {
                // DELETE AREA & POLYGON
                setAreaScopingPolygonUrl(null);
                setAreaScopingPolygonFileName("");
                setAreaScopingPolygonArea(0);
                setAreaScopingPolygonFileSize(0);
                setAreaScopingPolygonError("");
                setPolygonData(null);

                vectorSource?.clear();

                setBasicInformationOpenAccordion(
                  BASIC_INFORMATION_ACCORDION_TYPE.SCOPING,
                );
                setStepKey(PANEL_COMPONENT_KEY.BASIC_INFORMATION);
                setIsBasicInformationChangeInput(false);

                resetMosaicLayer();
              }}
            />
            <div className="h-0.5 w-full bg-secondary-purple-light-active" />
            <TimePeriodSummary
              accordion={false}
              temporalResolutionLabel={
                TEMPORAL_COVERAGE_ARRAY.find(
                  (item) => item.value === temporalCoverage,
                )?.labelFunction(t as TFunction) || "Error"
              }
              specificPeriod={temporalCoverageUnit}
              dateRange={getTemporalRangeText(
                temporalCoverage,
                temporalCoverageUnit,
              )}
              isEditing={isBasicInformationChangeInput}
              onClickEdit={() => {
                setTemporalCoverage("");
                setTemporalCoverageUnit("");
                setisEditingTemporalCoverage(true);

                setBasicInformationOpenAccordion(
                  BASIC_INFORMATION_ACCORDION_TYPE.PERIOD,
                );
                setStepKey(PANEL_COMPONENT_KEY.BASIC_INFORMATION);
                setIsBasicInformationChangeInput(false);

                resetMosaicLayer();
              }}
            />
            <div className="h-0.5 w-full bg-secondary-purple-light-active" />
            <SatelliteCompositeSummary
              accordion={false}
              cloudCoverageString="-"
              sateliteString="-"
              isEditing={isBasicInformationChangeInput}
              onClickEdit={() => {
                setBasicInformationOpenAccordion(
                  BASIC_INFORMATION_ACCORDION_TYPE.COMPOSITE,
                );
                setStepKey(PANEL_COMPONENT_KEY.BASIC_INFORMATION);
                setIsBasicInformationChangeInput(false);

                resetMosaicLayer();
              }}
            />
          </div>
        </div>
        <MosaicSummary />
      </div>
      {/* <Accordion
        value={basicInformationOpenAccordion}
        onValueChange={setBasicInformationOpenAccordion}
        type="single"
        collapsible
        className="space-y-4"
      >
        <AreaScopingAccordion />
        <TimePeriodAccordion />
        <SateliteCompositeAccordion />
      </Accordion> */}
      {/* <ConfirmDialog
        isVisible={true}
        onCancel={() => {}}
        onConfirm={() => {}}
        title={"Are You Sure Want to Change the Input?"}
        subtitle="Data yang sudah ada pada part yang anda pilih akan hilang, selain itu akan tetap ada"
        confirmButtonCaption="Change Input"
        cancelButtonCaption="Cancel Change Input"
      /> */}
    </>
  );
};

export const BasicInformationSummaryFooter = () => {
  const {
    temporalCoverage,
    temporalCoverageUnit,
    setStepKey,
    // isPreviewingMosaic,
    // setIsPreviewingMosaic,
    isBasicInformationChangeInput,
    setIsBasicInformationChangeInput,
    setProgressPanelIndex,
  } = useContext(MapGenerationContext);

  const {
    isPreviewingMosaic,
    // setIsPreviewingMosaic,
    removeMosaicLayer,
    isMosaicLoading,
  } = useContext(MapContext);

  const t = useTranslations("InteractivePanel");

  const isNextDisabled = isBasicInformationChangeInput || isMosaicLoading;
  // isPreviewingMosaic || isBasicInformationChangeInput || isMosaicLoading;
  const isCancelDisabled = isMosaicLoading;

  const onCancelClick = () => {
    // if (isPreviewingMosaic) {
    //   removeMosaicLayer();
    //   return;
    // }

    if (isBasicInformationChangeInput) {
      setIsBasicInformationChangeInput(false);
      return;
    }

    setIsBasicInformationChangeInput(true);
  };

  return (
    <div className="grid grid-cols-2 p-3 pt-4 gap-x-4">
      <Button
        onClick={() => {
          onCancelClick();
        }}
        // disabled={isNextDisabled}
        disabled={isCancelDisabled}
        variant="primary"
        className={cn()}
      >
        {/* {isPreviewingMosaic || isBasicInformationChangeInput */}
        {/* {isBasicInformationChangeInput ? "Cancel" : "Change Input"} */}
        {t("changeInput")}
      </Button>
      <Button
        onClick={() => {
          setStepKey(PANEL_COMPONENT_KEY.DEFINE_LUC);
          setProgressPanelIndex(1);
        }}
        disabled={isNextDisabled}
        variant="primary"
        className=""
      >
        {t("next")}
      </Button>
    </div>
  );
};
