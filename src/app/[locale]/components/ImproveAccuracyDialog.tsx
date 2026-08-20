"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PANEL_COMPONENT_KEY } from "@/constants";
import { MapContext } from "@/contexts/mapContext";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode, useContext } from "react";

interface ImproveAccuracyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface OptionCardProps {
  title: string;
  description: string;
  effortLabel: string;
  impactLabel: string;
  notes: ReactNode[];
  buttonLabel: string;
  disabled?: boolean;
  onAction?: () => void;
}

const boldChunk = (chunks: ReactNode) => (
  <b className="font-semibold">{chunks}</b>
);

const OptionCard = ({
  title,
  description,
  effortLabel,
  impactLabel,
  notes,
  buttonLabel,
  disabled = false,
  onAction,
}: OptionCardProps) => {
  const t = useTranslations("InteractivePanel.yourMap");

  return (
    <div
      className={cn(
        "flex flex-col gap-5 rounded-2xl border p-6",
        disabled
          ? "border-neutral-400 bg-neutrals-100"
          : "border-primary-pink bg-primary-pink/5",
      )}
    >
      <p
        className={cn(
          "text-center font-noto-sans text-2xl font-bold leading-8 tracking-[-0.24px]",
          disabled ? "text-text-icons-base-third" : "text-text-icons-base-main",
        )}
      >
        {title}
      </p>
      <p
        className={cn(
          "text-center font-aptos text-base font-regular leading-6",
          disabled
            ? "text-text-icons-base-third"
            : "text-text-icons-base-second",
        )}
      >
        {description}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <span
          className={cn(
            "rounded-full bg-white px-4 py-2 text-center font-aptos text-base font-bold leading-5",
            disabled ? "text-text-icons-base-third" : "text-success-700",
          )}
        >
          {effortLabel}
        </span>
        <span
          className={cn(
            "rounded-full bg-white px-4 py-2 text-center font-aptos text-base font-bold leading-5",
            disabled ? "text-text-icons-base-third" : "text-warning-700",
          )}
        >
          {impactLabel}
        </span>
      </div>
      <div
        className={cn(
          "flex-1 rounded-xl bg-white p-4",
          disabled && "text-text-icons-base-third",
        )}
      >
        <p
          className={cn(
            "font-aptos text-base font-regular leading-6",
            disabled
              ? "text-text-icons-base-third"
              : "text-text-icons-base-second",
          )}
        >
          {t("improveNotesTitle")}
        </p>
        <ul className="list-disc pl-5">
          {notes.map((note, index) => (
            <li
              // Static list, order never changes.
              // biome-ignore lint/suspicious/noArrayIndexKey: static content
              key={index}
              className={cn(
                "font-aptos text-base font-regular leading-6",
                disabled
                  ? "text-text-icons-base-third"
                  : "text-text-icons-base-second",
              )}
            >
              {note}
            </li>
          ))}
        </ul>
      </div>
      <Button
        type="button"
        variant="primary"
        disabled={disabled}
        onClick={onAction}
        className={cn(
          "h-12 w-full rounded-xl text-base font-bold",
          disabled &&
            "border border-[#C9C9C9] bg-neutrals-300 text-text-icons-base-third opacity-100",
        )}
      >
        {buttonLabel}
      </Button>
    </div>
  );
};

export const ImproveAccuracyDialog = ({
  open,
  onOpenChange,
}: ImproveAccuracyDialogProps) => {
  const t = useTranslations("InteractivePanel.yourMap");

  const {
    setIsYourMapDialogVisible,
    setIsImprovementMode,
    setLULCParamsOpenAccordion,
    setStepKey,
    setProgressPanelIndex,
    setGenerateMapDataVisualization,
    setGenerateMapLULC,
    setGenerateMapFeatureImportance,
    setGenerateMapModelQuality,
    setGenerateMapDownloadURL,
    setProgress,
    setTotalProgress,
    setIsGenerationError,
    setThematicAccuracy,
    setThematicAccuracyError,
  } = useContext(MapGenerationContext);
  const { mapInstance, finalLayer, setFinalLayer } = useContext(MapContext);

  const onResetParameters = () => {
    // Clear the step-5 result so returning to step 5 regenerates the map with
    // the reconfigured parameters instead of showing the stale one.
    if (finalLayer) {
      mapInstance?.removeLayer(finalLayer);
    }
    setFinalLayer(null);
    setGenerateMapDataVisualization(null);
    setGenerateMapLULC(null);
    setGenerateMapFeatureImportance(null);
    setGenerateMapModelQuality(null);
    setGenerateMapDownloadURL(null);
    setProgress(0);
    setTotalProgress(0);
    setIsGenerationError(false);
    setThematicAccuracy(null);
    setThematicAccuracyError("");

    setIsImprovementMode(true);
    setLULCParamsOpenAccordion("predictor");
    setStepKey(PANEL_COMPONENT_KEY.LULC_PARAMS);
    setProgressPanelIndex(3);

    onOpenChange(false);
    setIsYourMapDialogVisible(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[1000px] gap-6 rounded-2xl border-none bg-background-base-main px-8 py-7 shadow-lg"
      >
        <button
          type="button"
          aria-label="Close dialog"
          onClick={() => onOpenChange(false)}
          className="absolute right-8 top-8 cursor-pointer text-text-icons-base-main transition-opacity hover:opacity-75"
        >
          <X className="size-7 stroke-[2.25]" />
        </button>

        <DialogHeader className="items-center gap-3 text-center">
          <DialogTitle className="text-center font-noto-sans text-[32px] font-bold leading-none tracking-[-0.32px] text-primary-pink">
            {t("improveDialogTitle")}
          </DialogTitle>
          <DialogDescription className="max-w-[640px] text-center font-aptos text-base leading-normal text-text-icons-base-main">
            {t("improveDialogSubtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <OptionCard
            title={t("improveResetTitle")}
            description={t("improveResetDescription")}
            effortLabel={t("improveResetEffort")}
            impactLabel={t("improveResetImpact")}
            notes={[
              t("improveResetNoteData"),
              t.rich("improveResetNoteTime", { b: boldChunk }),
              t.rich("improveResetNoteBoost", { b: boldChunk }),
            ]}
            buttonLabel={t("improveResetButton")}
            onAction={onResetParameters}
          />
          <OptionCard
            title={t("improveFixTitle")}
            description={t("improveFixDescription")}
            effortLabel={t("improveFixEffort")}
            impactLabel={t("improveFixImpact")}
            notes={[
              t("improveFixNoteData"),
              t("improveFixNoteReset"),
              t.rich("improveFixNoteTime", { b: boldChunk }),
              t.rich("improveFixNoteBoost", { b: boldChunk }),
            ]}
            buttonLabel={t("improveFixButton")}
            disabled
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
