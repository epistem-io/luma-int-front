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
import { ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import Image from "next/image";
import { TimePeriodAccordion } from "./TimePeriodAccordion";
import { AreaScopingAccordion } from "./AreaScopingAccordion";
import { SateliteCompositeAccordion } from "./SateliteCompositeAccordion";
import { Button } from "@/components/ui/button";
import { useContext } from "react";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { PANEL_COMPONENT_KEY } from "@/constants";
import { isScoreStaleForComposite } from "@/lib/stepRules";
import { useStepNavigation } from "./useStepNavigation";
import { useBasicInformationLabels } from "./useSummaryLabels";
import { AreaScopingSummary } from "./AreaScopingSummary";
import { TimePeriodSummary } from "./TimePeriodSummary";
import { SatelliteCompositeSummary } from "./SatelliteCompositeSummary";
import { Switch } from "@/components/ui/switch";
import {
  cn,
  getTemporalRangeDateEnd,
  getTemporalRangeDateStart,
  numberThousandSeparator,
} from "@/lib/utils";
import { useSavingTransition } from "@/lib/hooks";
import { MosaicSummary } from "./MosaicSummary";
import { MapContext } from "@/contexts/mapContext";
import { useTranslations } from "next-intl";
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
    temporalCoverageUnit,
    isBasicInformationChangeInput,
    maximumCloudCover,
    hasLeftStep1,
  } = mapGenerationContext;

  // Nothing is editable while viewed from Your Map; after the first Next to
  // step 2 only the satellite section stays editable.
  const { isViewOnly } = useStepNavigation();
  const canEditSatellite = isBasicInformationChangeInput && !isViewOnly;
  const canEditAreaAndPeriod = canEditSatellite && !hasLeftStep1;

  const t = useTranslations("InteractivePanel");
  const {
    spatialResolutionLabel,
    inputMethodLabel,
    locationLabel,
    temporalResolutionLabel,
    dateRangeLabel,
    satelliteLabel,
  } = useBasicInformationLabels();

  // const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false)

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-3">
          <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
            {t("basicInformation.summaryOfBasicInformation")}
          </p>
          <div className="p-3 rounded-xl border-[1.5px] border-dashed border-primary-pink/40 bg-primary-red-pink-light space-y-4">
            <AreaScopingSummary
              areaSizeString={`${numberThousandSeparator(areaScopingPolygonArea.toFixed(0))} Ha`}
              spatialResolutionString={spatialResolutionLabel}
              inputMethodString={inputMethodLabel}
              locationString={locationLabel}
              accordion={false}
              isEditing={canEditAreaAndPeriod}
              onClickEdit={() => {
                resetAreaScopingData({ mapContext, mapGenerationContext });
                resetMosaicLayer();
              }}
            />
            <div className="h-px w-full bg-primary-pink/25" />
            <TimePeriodSummary
              accordion={false}
              temporalResolutionLabel={temporalResolutionLabel}
              specificPeriod={temporalCoverageUnit}
              dateRange={dateRangeLabel}
              isEditing={canEditAreaAndPeriod}
              onClickEdit={() => {
                resetTimePeriodData({ mapContext, mapGenerationContext });
                resetMosaicLayer();
              }}
            />
            <div className="h-px w-full bg-primary-pink/25" />
            <SatelliteCompositeSummary
              accordion={false}
              cloudCoverageString={`${maximumCloudCover}%`}
              sateliteString={satelliteLabel}
              isEditing={canEditSatellite}
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
    setHasLeftStep1,
    sampleQuality,
    sampleQualityComposite,
    setSampleQuality,
    setSampleQualityError,
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
  const { isSaving, runWithSaving } = useSavingTransition();

  const isNextDisabled =
    isBasicInformationChangeInput || isMosaicLoading || isSaving;
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
      runWithSaving(() => {
        setHasLeftStep1(true);
        setStepKey(PANEL_COMPONENT_KEY.DEFINE_LUC);
        setProgressPanelIndex(1);
      });

      return;
    }

    // A new composite (other satellite or cloud cover) makes step 3's
    // separability score stale; the samples themselves stay valid.
    if (
      sampleQuality &&
      isScoreStaleForComposite(sampleQualityComposite, {
        satelliteSource,
        maximumCloudCover,
      })
    ) {
      setSampleQuality(null);
      setSampleQualityError("");
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
        {isPreviewingMosaic && isSaving && (
          <>
            <span className="loader sm"></span>
            {t("common.saving")}
          </>
        )}
        {isPreviewingMosaic && !isSaving && (
          <>
            {t("common.next")}
            <ArrowRight className="size-4" />
          </>
        )}
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
