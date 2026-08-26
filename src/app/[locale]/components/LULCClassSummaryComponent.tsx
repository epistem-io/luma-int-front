"use client";

import { Button } from "@/components/ui/button";
import {
  LULCParamsAccordionSection,
  LULCSummaryEditSection,
  MapGenerationContext,
} from "@/contexts/mapGenerationContext";
import { PANEL_COMPONENT_KEY, PREDICTOR_URL } from "@/constants";
import { type ReactNode, useContext, useMemo, useState } from "react";
import { useSavingTransition } from "@/lib/hooks";
import { useTranslations } from "next-intl";
import { LULC_PREDICTORS } from "./lulcPredictors";
import { ConfirmDialog } from "./ConfirmDialog";
import Image from "next/image";
import { GlobalContext } from "@/contexts/globalContext";
import { toast } from "sonner";

interface SectionWrapperProps {
  title: string;
  isEditing: boolean;
  isEditDisabled?: boolean;
  onEdit?: () => void;
  children: ReactNode;
}

const LULCSummarySection = ({
  title,
  isEditing,
  isEditDisabled = false,
  onEdit,
  children,
}: SectionWrapperProps) => {
  return (
    <section className="space-y-2 relative">
      <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
        {title}
      </p>
      {children}
      {isEditing && (
        <Button
          onClick={onEdit}
          variant="ghost"
          className="absolute top-0 right-0 p-1 rounded-full"
          size="icon"
          disabled={isEditDisabled}
        >
          <Image
            src="/svgs/fa-edit.svg"
            alt="edit"
            width={18}
            height={16}
            className="h-4 w-4.5"
          />
        </Button>
      )}
    </section>
  );
};

export const LULCClassSummaryComponent = () => {
  const {
    selectedPredictors,
    numberOfTrees,
    minLeafPopulation,
    splitRatio,
    isLULCSummaryChangeInput,
    selectedLULCSummaryEditSection,
    setSelectedLULCSummaryEditSection,
    setSelectedPredictors,
    setNumberOfTrees,
    setNumberOfTreesError,
    setMinLeafPopulation,
    setMinLeafPopulationError,
    setIsLULCSummaryChangeInput,
    setLULCParamsOpenAccordion,
    setStepKey,
    setProgressPanelIndex,
  } = useContext(MapGenerationContext);
  const t = useTranslations("InteractivePanel");

  const formattedNumberOfTrees = numberOfTrees.trim();
  const formattedMinLeafPopulation = minLeafPopulation.trim();

  const selectedPredictorDetails = useMemo(() => {
    return LULC_PREDICTORS.filter((predictor) =>
      selectedPredictors.includes(predictor.value),
    );
  }, [selectedPredictors]);

  const closeConfirmDialog = () => {
    setSelectedLULCSummaryEditSection("");
  };

  const navigateToLULCParams = (
    accordionSection: LULCParamsAccordionSection,
  ) => {
    setLULCParamsOpenAccordion(accordionSection);
    setIsLULCSummaryChangeInput(false);
    setSelectedLULCSummaryEditSection("");
    setStepKey(PANEL_COMPONENT_KEY.LULC_PARAMS);
    setProgressPanelIndex(3);
  };

  const onConfirmChangeInput = () => {
    switch (selectedLULCSummaryEditSection) {
      case "predictor":
        setSelectedPredictors([]);
        navigateToLULCParams("predictor");
        return;
      case "random-forest":
        setNumberOfTrees("150");
        setNumberOfTreesError("");
        setMinLeafPopulation("1");
        setMinLeafPopulationError("");
        navigateToLULCParams("random-forest");
        return;
      default:
        closeConfirmDialog();
    }
  };

  const openSectionConfirm = (section: LULCSummaryEditSection) => {
    setSelectedLULCSummaryEditSection(section);
  };

  return (
    <>
      <div className="space-y-3">
        <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
          {t("lulcParams.summaryTitle")}
        </p>
        <div className="space-y-4 rounded-[12px] border-2 border-dashed border-secondary-purple-light-active bg-purple-second px-3 py-3">
          <LULCSummarySection
            title={t("lulcParams.predictorSummary")}
            isEditing={isLULCSummaryChangeInput}
            onEdit={() => {
              openSectionConfirm("predictor");
            }}
          >
            {selectedPredictorDetails.length > 0 ? (
              <div className="space-y-2">
                {selectedPredictorDetails.map((predictor) => (
                  <div key={predictor.value} className="flex gap-2">
                    <div className="mt-2 size-2 shrink-0 rounded-full bg-secondary-purple-normal-hover" />
                    <div className="space-y-0.5">
                      <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-secondary-purple-normal-hover">
                        {predictor.label}
                      </p>
                      <p className="font-aptos text-[15px] font-semibold leading-[22px] text-text-icons-base-second">
                        {predictor.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-aptos text-[15px] font-semibold leading-[22px] text-text-icons-base-second">
                {t("lulcParams.noPredictorsSelected")}
              </p>
            )}
          </LULCSummarySection>

          <div className="h-0.5 w-full bg-secondary-purple-light-active" />

          <LULCSummarySection
            title={t("lulcParams.RFVariableSummary")}
            isEditing={isLULCSummaryChangeInput}
            onEdit={() => {
              openSectionConfirm("random-forest");
            }}
          >
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <div>
                <p className="font-aptos text-[15px] font-semibold leading-[22px] text-text-icons-base-second">
                  {t("lulcParams.nOfTree")}
                </p>
                <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-secondary-purple-normal-hover">
                  {formattedNumberOfTrees || "-"}
                </p>
              </div>
              <div>
                <p className="font-aptos text-[15px] font-semibold leading-[22px] text-text-icons-base-second">
                  {t("lulcParams.minLeafPop")}
                </p>
                <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-secondary-purple-normal-hover">
                  {formattedMinLeafPopulation || "-"}
                </p>
              </div>
              <div>
                <p className="font-aptos text-[15px] font-semibold leading-[22px] text-text-icons-base-second">
                  {t("lulcParams.splitRatioSummary")}
                </p>
                <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-secondary-purple-normal-hover">
                  {splitRatio}% / {100 - splitRatio}%
                </p>
              </div>
            </div>
          </LULCSummarySection>
        </div>
      </div>

      <ConfirmDialog
        isVisible={selectedLULCSummaryEditSection !== ""}
        onCancel={closeConfirmDialog}
        onConfirm={onConfirmChangeInput}
        title={t("common.changeInput")}
        subtitle={t("common.confirmSubtitle")}
        confirmButtonCaption={t("common.changeInput")}
        cancelButtonCaption={t("common.cancelChangeInput")}
      />
    </>
  );
};

export const LULCClassSummaryFooter = () => {
  const {
    setIsSummaryDialogOpen,
    isLULCSummaryChangeInput,
    setIsLULCSummaryChangeInput,
    setSelectedLULCSummaryEditSection,
    selectedPredictors,
    numberOfTrees,
    minLeafPopulation,
    splitRatio,
  } = useContext(MapGenerationContext);
  const { sessionId } = useContext(GlobalContext);
  const t = useTranslations("InteractivePanel");
  const [isLoading, setIsLoading] = useState(false);
  const { isSaving, runWithSaving } = useSavingTransition();

  const onChangeInputClick = () => {
    if (isLULCSummaryChangeInput) {
      setIsLULCSummaryChangeInput(false);
      setSelectedLULCSummaryEditSection("");
      return;
    }

    setIsLULCSummaryChangeInput(true);
  };

  const onClickNext = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(PREDICTOR_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          min_leaf: Number(minLeafPopulation.trim()),
          ntrees: Number(numberOfTrees.trim()),
          split_ratio: splitRatio / 100,
          predictors: selectedPredictors,
        }),
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(JSON.stringify(json?.message || response.statusText));
      }

      setIsSummaryDialogOpen(true);
    } catch (e) {
      toast.error(`Error submitting predictors: ${e}`, {
        duration: Infinity,
        dismissible: true,
        closeButton: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-x-4 p-3 pt-4">
      <Button onClick={onChangeInputClick} variant="secondary">
        {isLULCSummaryChangeInput
          ? t("common.changeInputCancelFooter")
          : t("common.changeInput")}
      </Button>
      <Button
        onClick={() => runWithSaving(onClickNext)}
        variant="primary"
        disabled={isLULCSummaryChangeInput || isLoading || isSaving}
      >
        {isLoading || isSaving ? (
          <>
            <span className="loader sm"></span>
            {t("common.saving")}
          </>
        ) : (
          t("common.next")
        )}
      </Button>
    </div>
  );
};
