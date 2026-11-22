"use client";

import { Button } from "@/components/ui/button";
import { PANEL_COMPONENT_KEY } from "@/constants";
import { MapContext } from "@/contexts/mapContext";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { downloadCsv } from "@/lib/csv";
import { useSavingTransition } from "@/lib/hooks";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useContext, useEffect } from "react";
import { ClassSummaryTable } from "./ClassSummaryTable";
import { SampleQualityResultCard } from "./SampleQualityCard";
import {
  SummaryDownloadButton,
  SummaryEditButton,
  SummaryField,
  SummaryHeading,
} from "./SummaryField";
import { useSampleDataSummary } from "./useSummaryLabels";
import { useStepNavigation } from "./useStepNavigation";

// Step 3's last screen: what sample data was recorded, its separability
// result, and the per-class point counts. Editing goes back to the
// DATA_TRAINING panel with everything kept.
export const DataTrainingSummaryComponent = () => {
  const t = useTranslations("InteractivePanel");
  const { sampleQuality } = useContext(MapGenerationContext);
  const { markerVectorLayer } = useContext(MapContext);
  const {
    sourceLabel,
    hasUpload,
    uploadedFileNames,
    ossPointCount,
    totalPoints,
    classRows,
  } = useSampleDataSummary();

  const { isViewOnly } = useStepNavigation();

  // Coming back from step 4 hides the markers; show them again here. Not
  // while browsing from Your Map, where the generated map stays as it is.
  useEffect(() => {
    if (isViewOnly) return;
    markerVectorLayer?.setOpacity(1);
  }, [markerVectorLayer, isViewOnly]);

  const onDownloadCsv = () => {
    downloadCsv(
      "lulc-sample-summary.csv",
      ["ID", "Land Cover Class", "Color", "Points"],
      classRows.map((row, index) => [
        index + 1,
        row.name,
        row.color.toUpperCase(),
        row.points,
      ]),
    );
  };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl border-[1.5px] border-dashed border-primary-pink/40 bg-primary-red-pink-light space-y-3">
        <SummaryHeading>{t("dataTraining.sampleData")}</SummaryHeading>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          <SummaryField label={t("dataTraining.source")} value={sourceLabel} />
          {hasUpload && (
            <SummaryField
              label={t("dataTraining.uploadedFile")}
              value={uploadedFileNames}
            />
          )}
          {ossPointCount > 0 && (
            <SummaryField
              label={t("dataTraining.pointsAddedOnMap")}
              value={t("dataTraining.pointCount", { X: ossPointCount })}
            />
          )}
          <SummaryField
            label={t("dataTraining.totalSamples")}
            value={`${t("dataTraining.pointCount", { X: totalPoints })} · ${t(
              "defineLUC.classCount",
              { X: classRows.length },
            )}`}
          />
        </div>
      </div>

      {sampleQuality && (
        <div className="space-y-2">
          <SummaryHeading>{t("dataTraining.sampleQualityTitle")}</SummaryHeading>
          <SampleQualityResultCard result={sampleQuality} />
        </div>
      )}

      <div className="space-y-2">
        <div className="flex flex-row items-center justify-between gap-x-3">
          <SummaryHeading>{t("defineLUC.recordedClasses")}</SummaryHeading>
          <SummaryDownloadButton
            label={t("defineLUC.downloadCsv")}
            onClick={onDownloadCsv}
          />
        </div>
        <ClassSummaryTable rows={classRows} showPoints />
      </div>
    </div>
  );
};

export const DataTrainingSummaryFooter = () => {
  const t = useTranslations("InteractivePanel");
  const { setStepKey, setProgressPanelIndex } = useContext(MapGenerationContext);
  const { markerVectorLayer } = useContext(MapContext);
  const { isSaving, runWithSaving } = useSavingTransition();

  const { goToStep } = useStepNavigation();
  const onClickBack = () => goToStep(2);

  const onClickEdit = () => {
    setStepKey(PANEL_COMPONENT_KEY.DATA_TRAINING);
  };

  const onClickNext = () => {
    markerVectorLayer?.setOpacity(0);
    setProgressPanelIndex(3);
    setStepKey(PANEL_COMPONENT_KEY.LULC_PARAMS);
  };

  return (
    <div className="p-3 pt-4 gap-x-2 flex flex-row">
      <Button
        disabled={isSaving}
        onClick={onClickBack}
        variant={"outline"}
        size={"icon"}
        className="shrink-0"
      >
        <ChevronLeft className="text-primary-pink size-4" />
      </Button>
      <SummaryEditButton
        label={t("dataTraining.editSamples")}
        disabled={isSaving}
        onClick={onClickEdit}
      />
      <Button
        onClick={() => runWithSaving(onClickNext)}
        disabled={isSaving}
        variant="primary"
        className="flex-1"
      >
        {isSaving ? (
          <>
            <span className="loader sm"></span>
            {t("common.saving")}
          </>
        ) : (
          <>
            {t("common.next")}
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>
    </div>
  );
};
