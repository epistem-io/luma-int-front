"use client";

import { Button } from "@/components/ui/button";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { PANEL_COMPONENT_KEY } from "@/constants";
import { useContext, useMemo } from "react";
import { useTranslations } from "next-intl";
import { LULC_PREDICTORS } from "./lulcPredictors";

export const LULCClassSummaryComponent = () => {
  const { selectedPredictors, numberOfTrees, minLeafPopulation } =
    useContext(MapGenerationContext);
  const t = useTranslations("InteractivePanel");

  const selectedPredictorDetails = useMemo(() => {
    return LULC_PREDICTORS.filter((predictor) =>
      selectedPredictors.includes(predictor.value),
    );
  }, [selectedPredictors]);

  return (
    <div className="space-y-3">
      <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
        {t("lulcParams.summaryTitle")}
      </p>
      <div className="space-y-4 rounded-[12px] border-2 border-dashed border-secondary-purple-light-active bg-purple-second px-3 py-3">
        <section className="space-y-2">
          <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
            {t("lulcParams.predictorSummary")}
          </p>
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
        </section>

        <div className="h-0.5 w-full bg-secondary-purple-light-active" />

        <section className="space-y-2">
          <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
            {t("lulcParams.RFVariableSummary")}
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <div>
              <p className="font-aptos text-[15px] font-semibold leading-[22px] text-text-icons-base-second">
                {t("lulcParams.nOfTree")}
              </p>
              <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-secondary-purple-normal-hover">
                {numberOfTrees}
              </p>
            </div>
            <div>
              <p className="font-aptos text-[15px] font-semibold leading-[22px] text-text-icons-base-second">
                {t("lulcParams.minLeafPop")}
              </p>
              <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-secondary-purple-normal-hover">
                {minLeafPopulation}
              </p>
            </div>
          </div>
        </section>

        <div className="h-0.5 w-full bg-secondary-purple-light-active" />

        <section className="space-y-2">
          <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
            {t("lulcParams.dataValidation")}
          </p>
          <div>
            <p className="font-aptos text-[15px] font-semibold leading-[22px] text-text-icons-base-second">
              {t("lulcParams.uploadedFile")}
            </p>
            <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-secondary-purple-normal-hover">
              {t("lulcParams.validationFilePlaceholder")}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export const LULCClassSummaryFooter = () => {
  const { setStepKey, setProgressPanelIndex, setIsSummaryDialogOpen } =
    useContext(MapGenerationContext);
  const t = useTranslations("InteractivePanel");

  return (
    <div className="grid grid-cols-2 gap-x-4 p-3 pt-4">
      <Button
        onClick={() => {
          setStepKey(PANEL_COMPONENT_KEY.LULC_PARAMS);
          setProgressPanelIndex(3);
        }}
        variant="secondary"
      >
        {t("common.changeInput")}
      </Button>
      <Button
        onClick={() => {
          setIsSummaryDialogOpen(true);
        }}
        variant="primary"
      >
        {t("finalSummary.generateMap")}
      </Button>
    </div>
  );
};
