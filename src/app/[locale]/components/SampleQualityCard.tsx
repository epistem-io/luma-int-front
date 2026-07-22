"use client";

import { useContext } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PANEL_COMPONENT_KEY, POINTING_TYPE } from "@/constants";
import { GlobalContext } from "@/contexts/globalContext";
import { MapContext } from "@/contexts/mapContext";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";

const OVERALL_STYLE: Record<
  SampleQualityOverall,
  { card: string; label: string }
> = {
  good: {
    card: "bg-success-50",
    label: "text-success-700",
  },
  med: {
    card: "bg-warning-50",
    label: "text-warning-700",
  },
  poor: {
    card: "bg-danger-50",
    label: "text-danger-800",
  },
};

export const SampleQualityCard = () => {
  const t = useTranslations("InteractivePanel");
  const { sessionId } = useContext(GlobalContext);
  const {
    sampleQuality,
    isSampleQualityLoading,
    sampleQualityError,
    fetchSampleQuality,
    dataTrainingActiveTab,
    setSampleQuality,
    setSampleQualityError,
    setTrainingFile,
    setTrainingFilename,
    setTrainingFilesize,
    setTrainingFileError,
    setUploadedFilesArray,
    setPointingType,
    setSelectedClass,
    setIsTrainingDataChanged,
    setStepKey,
    setProgressPanelIndex,
    isUpdatingTrainingData,
  } = useContext(MapGenerationContext);
  const { setMarkerArray, markerVectorSource, markerVectorLayer } =
    useContext(MapContext);

  const clearQuality = () => {
    setSampleQuality(null);
    setSampleQualityError("");
  };

  const onClickReset = () => {
    clearQuality();
    setIsTrainingDataChanged(true);

    setMarkerArray([]);
    markerVectorSource?.clear();

    if (dataTrainingActiveTab === "upload") {
      setTrainingFile(null);
      setTrainingFilename("");
      setTrainingFilesize(0);
      setTrainingFileError("");
      setUploadedFilesArray([]);

      const doc = document.getElementById(
        "data-training-file-upload",
      ) as HTMLInputElement;
      if (doc) {
        doc.value = "";
      }
      return;
    }

    // OSS: back to choosing single/bulk pin point from scratch
    setPointingType(POINTING_TYPE.EMPTY);
    setSelectedClass("");
  };

  const onClickConfirm = () => {
    // Points are already posted before the analysis runs, so confirming
    // only advances to the next step.
    setStepKey(PANEL_COMPONENT_KEY.LULC_PARAMS);
    markerVectorLayer?.setOpacity(0);
    setProgressPanelIndex(3);
  };

  if (!isSampleQualityLoading && !sampleQuality && !sampleQualityError) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
          {t("dataTraining.sampleQualityTitle")}
        </p>
        <p className="font-aptos text-md font-regular leading-6 text-neutral-700">
          {t("dataTraining.sampleQualityDescription")}
        </p>
      </div>

      {isSampleQualityLoading && (
        <div className="p-4 rounded-[12px] border border-neutral-400 bg-white flex flex-row items-center gap-x-3">
          <span className="loader sm"></span>
          <p className="font-aptos text-md font-regular leading-6 text-neutral-700">
            {t("dataTraining.sampleQualityLoading")}
          </p>
        </div>
      )}

      {!isSampleQualityLoading && sampleQualityError !== "" && (
        <div className="p-4 rounded-[12px] bg-danger-50 space-y-3">
          <p className="font-aptos text-md font-regular leading-6 text-danger-800">
            {t("dataTraining.sampleQualityErrorCaption")}
          </p>
          <Button
            variant="outline"
            onClick={() => fetchSampleQuality(sessionId)}
          >
            {t("dataTraining.sampleQualityRetry")}
          </Button>
        </div>
      )}

      {!isSampleQualityLoading && !sampleQualityError && sampleQuality && (
        <>
          <SampleQualityResultCard result={sampleQuality} />
          <div className="grid grid-cols-2 gap-x-4 pt-1">
            <Button
              disabled={isUpdatingTrainingData}
              variant="ghost"
              className="bg-primary-pink-hover text-primary-red-pink-normal hover:brightness-95 transition-all duration-200"
              onClick={() => {
                onClickReset();
              }}
            >
              {dataTrainingActiveTab === "upload"
                ? t("dataTraining.reuploadDataTraining")
                : t("dataTraining.resetOnScreenSampling")}
            </Button>
            <Button
              disabled={isUpdatingTrainingData}
              variant="primary"
              className=""
              onClick={() => {
                onClickConfirm();
              }}
            >
              {t("dataTraining.confirmSampleQuality")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

const SampleQualityResultCard = ({
  result,
}: {
  result: SampleQualityResult;
}) => {
  const t = useTranslations("InteractivePanel");

  const style = OVERALL_STYLE[result.overall];

  const overallLabel =
    result.overall === "good"
      ? t("dataTraining.sampleQualityGood")
      : result.overall === "med"
        ? t("dataTraining.sampleQualityMed")
        : t("dataTraining.sampleQualityPoor");

  return (
    <div className={cn("p-3 rounded-[12px] space-y-3", style.card)}>
      <div className="flex flex-row justify-between items-start">
        <p className="font-aptos text-md font-semibold leading-6 text-text-icons-base-main">
          {t("dataTraining.sampleQuality")}
        </p>
        <p className="font-aptos text-sm font-regular leading-5 text-text-icons-base-second text-right">
          {t("dataTraining.sampleQualityMeanTD")}
        </p>
      </div>

      <div className="flex flex-row justify-between items-end gap-x-4">
        <div className="flex flex-row items-baseline gap-x-2">
          <p
            className={cn(
              "font-noto-sans text-4xl font-bold tracking-[-0.4px]",
              style.label,
            )}
          >
            {overallLabel}
          </p>
          <p
            className={cn(
              "font-aptos text-md font-regular leading-6",
              style.label,
            )}
          >
            {t("dataTraining.sampleQualityClassesCaption", {
              X: result.classes_good,
              Y: result.classes_total,
            })}
          </p>
        </div>
        <p
          className={cn(
            "font-noto-sans text-3xl font-bold tracking-[-0.32px]",
            style.label,
          )}
        >
          {result.mean_td.toFixed(2)}
        </p>
      </div>

      {result.problem_pairs.length > 0 && (
        <div className="bg-white rounded-md px-3 py-2 font-aptos text-sm font-regular leading-5 text-text-icons-base-main">
          <p className="font-bold">
            {t("dataTraining.sampleQualityProblemPairs")}
          </p>
          <div className="">
            {result.problem_pairs.map((item, index) => (
              <div
                className="flex flex-row gap-x-2 items-start"
                key={`sample-quality-pair-${index}`}
              >
                <div className="size-1 aspect-square mt-2 rounded-full bg-text-icons-base-main" />
                <p className="">
                  {t("dataTraining.sampleQualityPair", {
                    X: item.Class1_Name,
                    Y: item.Class2_Name,
                  })}
                </p>
              </div>
            ))}
          </div>
          <p className="">{t("dataTraining.sampleQualityAccuracyWarning")}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-x-3">
        <div className="bg-white/60 rounded-md p-2 text-center space-y-1">
          <p className="font-aptos text-sm font-regular leading-5 text-text-icons-base-second">
            {t("dataTraining.sampleQualityGoodTile")}
          </p>
          <p className="font-noto-sans text-xl font-bold text-success-700">
            {result.pair_counts.good}
          </p>
        </div>
        <div className="bg-white/60 rounded-md p-2 text-center space-y-1">
          <p className="font-aptos text-sm font-regular leading-5 text-text-icons-base-second">
            {t("dataTraining.sampleQualityWeakTile")}
          </p>
          <p className="font-noto-sans text-xl font-bold text-warning-700">
            {result.pair_counts.weak}
          </p>
        </div>
        <div className="bg-white/60 rounded-md p-2 text-center space-y-1">
          <p className="font-aptos text-sm font-regular leading-5 text-text-icons-base-second">
            {t("dataTraining.sampleQualityPoorTile")}
          </p>
          <p className="font-noto-sans text-xl font-bold text-danger-800">
            {result.pair_counts.poor}
          </p>
        </div>
      </div>
    </div>
  );
};
