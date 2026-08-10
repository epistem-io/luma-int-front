"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AREA_SCOPING_TYPE } from "@/constants";
import { SessionCheckpointContext } from "@/contexts/sessionCheckpointContext";
import {
  panelToWizardStep,
  type SessionCheckpoint,
} from "@/lib/sessionCheckpoint";

interface StepCard {
  title: string;
  lines: string[];
}

type Translate = (key: string, values?: Record<string, unknown>) => string;

const buildCards = (cp: SessionCheckpoint, t: Translate): StepCard[] => {
  const cards: StepCard[] = [];

  const { basicInfo } = cp;
  cards.push({
    title: t("step1Title"),
    lines: basicInfo
      ? [
          `${t("geographicArea")}: ${
            basicInfo.areaScopingType === AREA_SCOPING_TYPE.DRAW
              ? t("drawPolygon")
              : t("uploadShp")
          } (${t("areaHa", { area: basicInfo.polygonArea.toLocaleString() })})`,
          `${t("timePeriod")}: ${basicInfo.temporalCoverage} ${basicInfo.temporalCoverageUnit}`.trim(),
          `${t("satelliteComposite")}: ${basicInfo.satelliteSource}`,
        ]
      : [],
  });

  const { luc } = cp;
  const lucMethodLine =
    luc?.lucSource === "default"
      ? t("defaultClassification")
      : `${t("ownClassification")} : ${
          luc?.lucSource === "excel" ? t("uploadedFile") : t("manualInput")
        }`;
  const lucCount =
    luc?.lucSource === "default"
      ? luc.defaultArray.length
      : (luc?.lucQuickRows.filter((r) => r.name.trim() !== "").length ?? 0);
  cards.push({
    title: t("step2Title"),
    lines: luc ? [lucMethodLine, t("totalClass", { total: lucCount })] : [],
  });

  const { training } = cp;
  cards.push({
    title: t("step3Title"),
    lines: training
      ? [
          training.method === "upload" && training.uploadedFiles.length > 0
            ? t("uploadDataSample", {
                filename: training.uploadedFiles
                  .map((f) => f.name)
                  .join(", "),
              })
            : `${t("method")}: ${t("onScreenSampling")}`,
          t("totalPoints", { total: training.markers.length }),
        ]
      : [],
  });

  const { params } = cp;
  cards.push({
    title: t("step4Title"),
    lines: params
      ? [
          `${t("predictor")}: ${
            params.selectedPredictors.length > 0
              ? params.selectedPredictors.join(", ")
              : t("defaultLabel")
          }`,
        ]
      : [],
  });

  return cards;
};

export const ResumeSessionDialog = () => {
  const {
    pendingResume,
    isRestoring,
    resumePendingSession,
    discardPendingSession,
  } = useContext(SessionCheckpointContext);
  const t = useTranslations("InteractivePanel.resumeSession");

  if (pendingResume === null) {
    // Full-screen input blocker while the satellite composite is re-fetched
    // after a resume — no edits allowed until the map is consistent again.
    if (!isRestoring) return null;
    return (
      <div className="fixed inset-0 z-50 flex cursor-wait items-center justify-center bg-black/30">
        <div className="flex items-center gap-3 rounded-xl bg-white px-6 py-4 font-aptos font-bold text-primary-pink shadow-lg">
          <Loader2 className="h-5 w-5 animate-spin" />
          {t("restoring")}
        </div>
      </div>
    );
  }

  const cards = buildCards(pendingResume, t as unknown as Translate);

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) discardPendingSession();
      }}
    >
      <DialogContent className="p-8 max-w-300 w-full rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center font-roboto text-2xl font-bold text-primary-pink">
            {t("title")}
          </DialogTitle>
          <DialogDescription className="text-center font-aptos text-md">
            {t("subtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {cards.map((card) => (
            <div
              key={card.title}
              className={
                card.lines.length > 0
                  ? "rounded-xl bg-[#FFF9FB] p-4"
                  : "rounded-xl bg-[#FAF9F9] p-4"
              }
            >
              <p
                className={
                  card.lines.length > 0
                    ? "font-aptos font-bold text-primary-pink text-center"
                    : "font-aptos font-bold text-gray-400 text-center"
                }
              >
                {card.title}
              </p>
              {card.lines.length > 0 ? (
                <ul className="mt-2 list-disc pl-5 font-aptos text-sm">
                  {card.lines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 font-aptos text-sm text-gray-400 text-center">
                  {t("notRecorded")}
                </p>
              )}
            </div>
          ))}
        </div>

        <DialogFooter className="grid grid-cols-2 gap-4">
          <Button variant="secondary" onClick={discardPendingSession}>
            {t("discard")}
          </Button>
          <Button variant="primary" onClick={resumePendingSession}>
            {t("resume", { step: panelToWizardStep(pendingResume.stepKey) })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
