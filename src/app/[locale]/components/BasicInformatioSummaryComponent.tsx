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
import { useContext } from "react";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import {
  PANEL_COMPONENT_KEY,
  SATELLITE_OPTIONS_ARRAY,
  TEMPORAL_COVERAGE_ARRAY,
} from "@/constants";
import { AreaScopingSummary } from "./AreaScopingSummary";
import { TimePeriodSummary } from "./TimePeriodSummary";
import { SatelliteCompositeSummary } from "./SatelliteCompositeSummary";
import { Switch } from "@/components/ui/switch";
import {
  cn,
  getTemporalRangeDateEnd,
  getTemporalRangeDateStart,
  getTemporalRangeText,
  numberThousandSeparator,
} from "@/lib/utils";
import { MosaicSummary } from "./MosaicSummary";
import { MapContext } from "@/contexts/mapContext";
import { useTranslations } from "next-intl";
import { TFunction } from "@/i18n/types";
import { GlobalContext } from "@/contexts/globalContext";
import {
  goToCompositeEditFlow,
  resetAreaScopingData,
  resetTimePeriodData,
} from "@/lib/interactivePanelFlowHelper";

export const BasicInformationSummaryComponent = () => {
  const mapContext = useContext(MapContext);
  const { isPreviewingMosaic, resetMosaicLayer } = mapContext;

  const mapGenerationContext = useContext(MapGenerationContext);
  const {
    areaScopingPolygonArea,
    temporalCoverage,
    temporalCoverageUnit,
    isBasicInformationChangeInput,
    satelliteSource,
    maximumCloudCover,
  } = mapGenerationContext;

  const t = useTranslations("InteractivePanel");

  // const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false)

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
            {t("basicInformation.summaryOfBasicInformation")}
          </p>
          <div className="px-3 py-3 rounded-[12px] border-2 border-dashed border-secondary-purple-light-active bg-purple-second space-y-4">
            <AreaScopingSummary
              areaSizeString={`${numberThousandSeparator(areaScopingPolygonArea.toFixed(0))} Ha`}
              accordion={false}
              isEditing={isBasicInformationChangeInput}
              onClickEdit={() => {
                resetAreaScopingData({ mapContext, mapGenerationContext });
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
                resetTimePeriodData({ mapContext, mapGenerationContext });
                resetMosaicLayer();
              }}
            />
            <div className="h-0.5 w-full bg-secondary-purple-light-active" />
            <SatelliteCompositeSummary
              accordion={false}
              cloudCoverageString={`${maximumCloudCover}%`}
              sateliteString={
                SATELLITE_OPTIONS_ARRAY.find(
                  (item) => item.value === satelliteSource,
                )?.label ?? satelliteSource
              }
              isEditing={isBasicInformationChangeInput}
              onClickEdit={() => {
                goToCompositeEditFlow({ mapContext, mapGenerationContext });
                resetMosaicLayer();
              }}
            />
          </div>
        </div>
        {isPreviewingMosaic && !isBasicInformationChangeInput && (
          <MosaicSummary />
        )}
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
    setStepKey,
    isBasicInformationChangeInput,
    setIsBasicInformationChangeInput,
    setProgressPanelIndex,
    temporalCoverage,
    temporalCoverageUnit,
    spatialResolution,
    satelliteSource,
    maximumCloudCover,
  } = useContext(MapGenerationContext);

  const {
    isPreviewingMosaic,
    // setIsPreviewingMosaic,
    removeMosaicLayer,
    isMosaicLoading,
    getMosaicMap,
  } = useContext(MapContext);

  const { sessionId } = useContext(GlobalContext);

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

  const onNextClick = () => {
    if (isPreviewingMosaic) {
      setStepKey(PANEL_COMPONENT_KEY.DEFINE_LUC);
      setProgressPanelIndex(1);

      return;
    }

    getMosaicMap({
      sessionId,
      startDate: getTemporalRangeDateStart(
        temporalCoverage,
        temporalCoverageUnit,
      ),
      endDate: getTemporalRangeDateEnd(temporalCoverage, temporalCoverageUnit),
      landsatVersion: satelliteSource,
      cloudCover: maximumCloudCover,
      spatialResolution: spatialResolution,
    });
  };

  return (
    <div className="grid grid-cols-2 p-3 pt-4 gap-x-4">
      <Button
        onClick={() => {
          onCancelClick();
        }}
        // disabled={isNextDisabled}
        disabled={isCancelDisabled || isMosaicLoading}
        variant="secondary"
        className={cn()}
      >
        {/* {isPreviewingMosaic || isBasicInformationChangeInput */}
        {/* {isBasicInformationChangeInput ? "Cancel" : "Change Input"} */}
        {isBasicInformationChangeInput
          ? t("common.changeInputCancelFooter")
          : t("common.changeInput")}
      </Button>
      <Button
        onClick={() => {
          onNextClick();
        }}
        disabled={isNextDisabled || isMosaicLoading}
        variant="primary"
        className=""
      >
        {isPreviewingMosaic && t("common.next")}
        {!isPreviewingMosaic && (
          <>
            {isMosaicLoading && (
              <div className="w-full h-10 flex flex-row justify-center items-center">
                <span className="loader sm"></span>
              </div>
            )}
            {!isMosaicLoading && t("basicInformation.previewMosaicMap")}
          </>
        )}
      </Button>
    </div>
  );
};
