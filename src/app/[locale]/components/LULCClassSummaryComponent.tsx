"use client";

import { Button } from "@/components/ui/button";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { PANEL_COMPONENT_KEY, PREDICTOR_URL } from "@/constants";
import { useContext, useState } from "react";
import { useSavingTransition } from "@/lib/hooks";
import { useTranslations } from "next-intl";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { GlobalContext } from "@/contexts/globalContext";
import { showErrorToast } from "@/components/ui/error-toast";
import {
  PredictorChips,
  SummaryEditButton,
  SummaryField,
  SummaryHeading,
} from "./SummaryField";
import { latestScore } from "@/lib/predictorsApi";
import { QualityScoreFields } from "./PredictorQualityAccordion";
import { useSelectedPredictorLabels } from "./useSummaryLabels";
import { useStepNavigation } from "./useStepNavigation";
import { useTranslateOr } from "./useTranslateOr";

// Step 4's last screen: the chosen predictors, their latest score, Random
// Forest settings and training/testing split. "Edit" reopens the parameter
// form with the current values kept.
export const LULCClassSummaryComponent = () => {
  const {
    numberOfTrees,
    minLeafPopulation,
    splitRatio,
    isAutoPointsFlow,
    selectedPredictors,
    sampleQuality,
    predictorSeparability,
  } = useContext(MapGenerationContext);
  const t = useTranslations("InteractivePanel");
  const translateOr = useTranslateOr();
  const predictorLabels = useSelectedPredictorLabels();
  // The latest score calculation: with the predictors when they were
  // checked, otherwise the one from step 3.
  const score = isAutoPointsFlow
    ? null
    : latestScore(sampleQuality, predictorSeparability, selectedPredictors);

  return (
    <div className="p-3 rounded-xl border-[1.5px] border-dashed border-primary-pink/40 bg-primary-red-pink-light space-y-4">
      <section className="space-y-2">
        <SummaryHeading>{t("lulcParams.predictorSummary")}</SummaryHeading>
        {predictorLabels.length > 0 ? (
          <>
            <p className="font-noto-sans text-base font-bold leading-6 text-primary-red-pink-normal-active">
              {t("lulcParams.predictorsSelected", {
                X: predictorLabels.length,
              })}
            </p>
            <PredictorChips labels={predictorLabels} />
          </>
        ) : (
          <p className="font-aptos text-[15px] leading-5.5 text-text-icons-base-second">
            {t("lulcParams.noPredictorsSelected")}
          </p>
        )}
      </section>

      {score && (
        <>
          <div className="h-px w-full bg-primary-pink/25" />

          <section className="space-y-3">
            <SummaryHeading>
              {translateOr(
                "lulcParams.quality.title",
                "Predictor selection quality",
              )}
            </SummaryHeading>
            <QualityScoreFields score={score} />
          </section>
        </>
      )}

      <div className="h-px w-full bg-primary-pink/25" />

      <section className="space-y-3">
        <SummaryHeading>{t("lulcParams.RFVariableSummary")}</SummaryHeading>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          <SummaryField
            label={t("lulcParams.nOfTree")}
            value={numberOfTrees.trim() || "-"}
          />
          <SummaryField
            label={t("lulcParams.minLeafPop")}
            value={minLeafPopulation.trim() || "-"}
          />
        </div>
      </section>

      <div className="h-px w-full bg-primary-pink/25" />

      <section className="space-y-3">
        <SummaryHeading>{t("lulcParams.splitRatioSummary")}</SummaryHeading>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          <SummaryField
            label={t("lulcParams.training")}
            value={`${splitRatio}%`}
          />
          <SummaryField
            label={t("lulcParams.testing")}
            value={`${100 - splitRatio}%`}
          />
        </div>
      </section>
    </div>
  );
};

export const LULCClassSummaryFooter = () => {
  const {
    setIsSummaryDialogOpen,
    setIsLULCSummaryChangeInput,
    setSelectedLULCSummaryEditSection,
    setLULCParamsOpenAccordion,
    setStepKey,
    setProgressPanelIndex,
    selectedPredictors,
    numberOfTrees,
    minLeafPopulation,
    splitRatio,
  } = useContext(MapGenerationContext);
  const { sessionId } = useContext(GlobalContext);
  const t = useTranslations("InteractivePanel");
  const [isLoading, setIsLoading] = useState(false);
  const { isSaving, runWithSaving } = useSavingTransition();

  const isBusy = isLoading || isSaving;

  const { goToStep } = useStepNavigation();
  const onClickBack = () => goToStep(3);

  // Back to the parameter form; predictors and Random Forest values stay as
  // they are (no reset), and its Next returns here.
  const onClickEdit = () => {
    setIsLULCSummaryChangeInput(false);
    setSelectedLULCSummaryEditSection("");
    setLULCParamsOpenAccordion("");
    setStepKey(PANEL_COMPONENT_KEY.LULC_PARAMS);
  };

  const onClickGenerate = async () => {
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
      showErrorToast({
        title: t("common.errors.submitPredictorsFailed"),
        error: e,
        onRetry: () => void onClickGenerate(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-3 pt-4 gap-x-2 flex flex-row">
      <Button
        disabled={isBusy}
        onClick={onClickBack}
        variant={"outline"}
        size={"icon"}
        className="shrink-0"
      >
        <ChevronLeft className="text-primary-pink size-4" />
      </Button>
      <SummaryEditButton
        label={t("lulcParams.edit")}
        disabled={isBusy}
        onClick={onClickEdit}
      />
      <Button
        onClick={() => runWithSaving(onClickGenerate)}
        variant="primary"
        className="flex-1"
        disabled={isBusy}
      >
        {isBusy ? (
          <>
            <span className="loader sm"></span>
            {t("common.saving")}
          </>
        ) : (
          // "Next", as on the other summary screens: the map itself is
          // started from the final summary dialog this opens.
          <>
            {t("common.next")}
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>
    </div>
  );
};
