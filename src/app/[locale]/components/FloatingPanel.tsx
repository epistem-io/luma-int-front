"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AnalysisPanel } from "./AnalysisPanel";
import { EvaluatePanel } from "./EvaluatePanel";
import { useTranslations } from "next-intl";

interface FloatingPanelProps {
  children?: React.ReactNode;
  className?: string;
}

enum PANEL_STAGE {
  ANALYSIS = "analysis",
  EVALUATE = "evaluate",
}

export function FloatingPanel({ className }: FloatingPanelProps) {
  const t = useTranslations();

  const titleArr = [
    {
      key: PANEL_STAGE.ANALYSIS,
      message: t("AnalysisPanel.title"),
    },
    {
      key: PANEL_STAGE.EVALUATE,
      message: t("EvaluationPanel.title"),
    },
  ];

  const [panelStage, setPanelStage] = useState<PANEL_STAGE>(
    PANEL_STAGE.ANALYSIS,
    // PANEL_STAGE.EVALUATE,
  );

  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="fixed left-0 top-16 z-40 h-[calc(100vh-8rem)]">
      <div
        className={cn(
          "h-full bg-background shadow-lg transition-all duration-300 ease-in-out overflow-hidden",
          isExpanded ? "w-[455px]" : "w-0",
          className,
        )}
      >
        <div className="h-full overflow-hidden relative">
          <div
            className={cn(
              "w-[455px] bg-[#F6F6F6] sticky top-0 z-40",
              isExpanded ? "opacity-100" : "opacity-0",
            )}
          >
            <p className="py-[18px] px-5 headline-xxs-desktop-bold text-text-icons-base-main">
              {titleArr.find((item) => item.key === panelStage)?.message ||
                t("error")}
            </p>
          </div>
          <div
            className={cn(
              "h-full w-[455px] overflow-y-scroll pt-0 transition-opacity duration-300 relative",
              isExpanded ? "opacity-100" : "opacity-0",
            )}
          >
            {panelStage === PANEL_STAGE.ANALYSIS && (
              <AnalysisPanel
                nextStage={() => setPanelStage(PANEL_STAGE.EVALUATE)}
              />
            )}
            {panelStage === PANEL_STAGE.EVALUATE && (
              <EvaluatePanel
                prevStage={() => {
                  setPanelStage(PANEL_STAGE.ANALYSIS);
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Toggle Button - positioned relative to panel edge */}
      <button
        name="openClosePanel"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "absolute top-0.5 z-50 flex h-[62px] px-0.5 items-center justify-center rounded-r-md bg-[#EEEFF3] transition-all duration-300 ease-in-out hover:bg-accent cursor-pointer",
          isExpanded ? "left-[455px]" : "left-0",
        )}
        style={{
          boxShadow: "4px 0 12px -4px rgba(0, 0, 0, 0.12)",
        }}
      >
        {isExpanded ? (
          <ChevronLeft className="h-6 w-6" />
        ) : (
          <ChevronRight className="h-6 w-6" />
        )}
      </button>
    </div>
  );
}
