"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { ReactNode, useContext, useEffect, useState } from "react";
import { FETCH_INPUT_SUMMARY, PANEL_COMPONENT_KEY } from "@/constants";
import { GlobalContext } from "@/contexts/globalContext";
import { showErrorToast } from "@/components/ui/error-toast";
import { useTranslations } from "next-intl";
import { cn, numberThousandSeparator } from "@/lib/utils";
import { MapContext } from "@/contexts/mapContext";
import { ClassSummaryTable } from "./ClassSummaryTable";
import { PredictorChips, SummaryField } from "./SummaryField";
import {
  sampleQualityOverallKey,
  useBasicInformationLabels,
  useClassificationSchemeLabels,
  useSampleDataSummary,
  useSelectedPredictorLabels,
} from "./useSummaryLabels";

// Joins the non-empty parts with a middle dot: "Landsat 8 · 15%".
const joinParts = (...parts: (string | undefined | false)[]) =>
  parts.filter(Boolean).join(" · ");

const SummaryCard = ({
  steps,
  title,
  children,
  className,
}: {
  steps: number[];
  title: string;
  children: ReactNode;
  className?: string;
}) => (
  <section
    className={cn(
      "rounded-xl border border-primary-pink/20 bg-primary-red-pink-light p-4 space-y-4",
      className,
    )}
  >
    <div className="flex flex-row items-center gap-x-2.5">
      <div className="flex flex-row gap-x-1">
        {steps.map((step) => (
          <span
            key={step}
            className="flex size-6 items-center justify-center rounded-md bg-primary-red-pink-dark-hover font-roboto text-sm font-semibold text-white"
          >
            {step}
          </span>
        ))}
      </div>
      <p className="font-noto-sans text-lg font-semibold leading-7 text-text-icons-base-main">
        {title}
      </p>
    </div>
    {children}
  </section>
);

export const FinalSummaryDialog = () => {
  const {
    isSummaryDialogOpen,
    setIsSummaryDialogOpen,
    setStepKey,
    setProgressPanelIndex,
    summaryData,
    setSummaryData,
    setIsImprovementMode,
    areaScopingPolygonArea,
    maximumCloudCover,
    numberOfTrees,
    minLeafPopulation,
    splitRatio,
    sampleQuality,
  } = useContext(MapGenerationContext);
  const { mosaicStatistic } = useContext(MapContext);
  const { sessionId } = useContext(GlobalContext);

  const t = useTranslations("InteractivePanel");
  const basic = useBasicInformationLabels();
  const scheme = useClassificationSchemeLabels();
  const { sourceLabel } = useSampleDataSummary();
  const predictorLabels = useSelectedPredictorLabels();

  const [isLoading, setIsLoading] = useState(false);

  const onCancel = () => {
    setIsSummaryDialogOpen(false);
  };

  const onConfirm = () => {
    setIsImprovementMode(false);
    setStepKey(PANEL_COMPONENT_KEY.YOUR_MAP);
    setProgressPanelIndex(5);
    setIsSummaryDialogOpen(false);
  };

  const getSummary = () => {
    setIsLoading(true);

    fetch(
      `${FETCH_INPUT_SUMMARY}?${new URLSearchParams({ session_id: sessionId })}`,
      { method: "GET" },
    )
      .then(async (response) => {
        const json: InputSummaryRes = await response.json();

        if (!response.ok) {
          throw new Error(JSON.stringify(json?.message || response.text));
        }

        setSummaryData(json);
      })
      .catch((e) => {
        showErrorToast({
          title: t("common.errors.loadSummaryFailed"),
          error: e,
          onRetry: getSummary,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (!isSummaryDialogOpen) return;

    getSummary();
  }, [isSummaryDialogOpen]);

  // The class table and totals come from the backend's view of the training
  // data, which is what the map is generated from.
  const classRows = (summaryData?.data.training_data_summary ?? []).map(
    (item) => ({
      name: item.class_name,
      color: item.class_color,
      points: item.total_items,
    }),
  );
  const totalPoints = classRows.reduce((acc, row) => acc + row.points, 0);
  const areaSize = summaryData?.data.aoi.area_size ?? areaScopingPolygonArea;

  return (
    <Dialog open={isSummaryDialogOpen} onOpenChange={() => onCancel()}>
      <DialogContent
        id="finalSummaryDialog"
        className="p-8 max-w-260 w-full rounded-2xl gap-6"
      >
        <DialogHeader>
          <DialogTitle className="text-center text-primary-pink font-aptos text-[32px] font-bold tracking-[-0.32px]">
            {t("finalSummary.finalSummaryTitle")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("finalSummary.finalSummarySubtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(100vh-260px)] overflow-y-auto">
          {isLoading ? (
            <div className="w-full h-10 flex flex-row justify-center">
              <span className="loader"></span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 items-start">
              <div className="space-y-4">
                <SummaryCard
                  steps={[1]}
                  title={t("basicInformation.basicInformationTitle")}
                >
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <SummaryField
                      size="sm"
                      label={t("finalSummary.areaOfInterest")}
                      value={joinParts(
                        basic.locationLabel,
                        basic.inputMethodLabel,
                      )}
                    />
                    <SummaryField
                      size="sm"
                      label={t("finalSummary.areaOfInterestSubtitle")}
                      value={`${numberThousandSeparator(areaSize.toFixed(0))} Ha`}
                    />
                    {basic.spatialResolutionLabel && (
                      <SummaryField
                        size="sm"
                        label={t("areaScoping.spatialResolution")}
                        value={basic.spatialResolutionLabel}
                      />
                    )}
                    <SummaryField
                      size="sm"
                      label={t("finalSummary.yourSelectedTimePeriod")}
                      value={joinParts(
                        basic.temporalResolutionLabel,
                        basic.dateRangeLabel,
                      )}
                    />
                    <SummaryField
                      size="sm"
                      label={t("finalSummary.satelliteAndCloud")}
                      value={joinParts(
                        basic.satelliteLabel,
                        `${maximumCloudCover}%`,
                      )}
                    />
                    {mosaicStatistic && (
                      <SummaryField
                        size="sm"
                        label={t("finalSummary.mosaic")}
                        value={t("finalSummary.mosaicValue", {
                          X: mosaicStatistic.summary.length,
                          Y: mosaicStatistic.statistics.mean.toFixed(2),
                        })}
                      />
                    )}
                  </div>
                </SummaryCard>

                <SummaryCard
                  steps={[4]}
                  title={t("finalSummary.mappingParameters")}
                >
                  <div className="space-y-2">
                    <p className="font-aptos text-xs leading-4.5 text-text-icons-base-second">
                      {t("lulcParams.predictorsSelected", {
                        X: predictorLabels.length,
                      })}
                    </p>
                    <PredictorChips labels={predictorLabels} size="sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <SummaryField
                      size="sm"
                      label={t("lulcParams.RFVariableSummary")}
                      value={t("finalSummary.rfValue", {
                        trees: numberOfTrees.trim(),
                        leaf: minLeafPopulation.trim(),
                      })}
                    />
                    <SummaryField
                      size="sm"
                      label={t("lulcParams.splitRatioSummary")}
                      value={`${splitRatio}% / ${100 - splitRatio}%`}
                    />
                  </div>
                </SummaryCard>
              </div>

              <SummaryCard
                steps={[2, 3]}
                title={t("finalSummary.classesAndSamples")}
              >
                <div className="grid grid-cols-4 gap-x-4 gap-y-3">
                  <SummaryField
                    size="sm"
                    label={t("defineLUC.scheme")}
                    value={joinParts(
                      scheme.schemeLabel,
                      scheme.inputMethodLabel,
                    )}
                  />
                  <SummaryField
                    size="sm"
                    label={t("finalSummary.totalClass")}
                    value={t("defineLUC.classCount", { X: classRows.length })}
                  />
                  <SummaryField
                    size="sm"
                    label={t("dataTraining.totalSamples")}
                    value={joinParts(
                      t("dataTraining.pointCount", { X: totalPoints }),
                      sourceLabel !== "-" && sourceLabel,
                    )}
                  />
                  {sampleQuality && (
                    <SummaryField
                      size="sm"
                      label={t("dataTraining.sampleQuality")}
                      value={joinParts(
                        t(sampleQualityOverallKey(sampleQuality.overall)),
                        `${t("dataTraining.sampleQualityMeanTD")} ${sampleQuality.mean_td.toFixed(2)}`,
                      )}
                    />
                  )}
                </div>
                <ClassSummaryTable
                  rows={classRows}
                  showPoints
                  className="max-h-80"
                />
              </SummaryCard>
            </div>
          )}
        </div>

        <div className="flex flex-row gap-x-3">
          <Button
            variant={"outline"}
            onClick={onCancel}
            className="px-6 text-primary-pink font-aptos font-bold hover:bg-primary-pink-hover hover:text-primary-pink cursor-pointer"
          >
            {t("finalSummary.backToEdit")}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            variant={"primary"}
            className="flex-1"
          >
            {t("finalSummary.generateMap")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
