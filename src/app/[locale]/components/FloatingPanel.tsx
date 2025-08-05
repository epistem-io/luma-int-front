"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AnalysisPanel } from "./AnalysisPanel";
import { EvaluatePanel } from "./EvaluatePanel";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface FloatingPanelProps {
  children?: React.ReactNode;
  className?: string;
}

enum PANEL_STAGE {
  ANALYSIS = "analysis",
  EVALUATE = "evaluate",
}

export enum ROUTE_KEYS {
  AREA = "area",
  TIME = "time",
  LAND = "land",
  LULC = "lulc",
}

const routeArr = [
  {
    selectedImage: "/images/section-area-selected.svg",
    image: "/images/section-area.svg",
    label: "Area",
    key: ROUTE_KEYS.AREA,
  },
  {
    selectedImage: "/images/section-time-selected.svg",
    image: "/images/section-time.svg",
    label: "Time",
    key: ROUTE_KEYS.TIME,
  },
  {
    selectedImage: "/images/section-land-selected.svg",
    image: "/images/section-land.svg",
    label: "LandUse",
    key: ROUTE_KEYS.LAND,
  },
  {
    selectedImage: "/images/section-lulc-selected.svg",
    image: "/images/section-lulc.svg",
    label: "LULC List",
    key: ROUTE_KEYS.LULC,
  },
];

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
  const [selected, setSelected] = useState<ROUTE_KEYS | "">(ROUTE_KEYS.AREA);

  const onClickExpand = () => {
    const temp = !isExpanded;

    if (!temp) {
      setSelected("");
    }

    setIsExpanded(temp);
  };

  const onClickGroup = (key: ROUTE_KEYS | "") => {
    if (selected === key) {
      setSelected("");
      setIsExpanded(false);
      return;
    }

    if (!isExpanded) {
      setIsExpanded(true);
    }

    setSelected(key);
  };

  return (
    <>
      {panelStage === PANEL_STAGE.ANALYSIS && (
        <div className="fixed left-0 top-[66px] z-50 w-[88px] h-[calc(100vh-66px)] bg-[#F8FCFD] pt-5 shadow">
          <div className="">
            {routeArr.map((item, index) => {
              const isSelected = item.key === selected;
              return (
                <button
                  onClick={() => {
                    onClickGroup(item.key);
                  }}
                  className={cn(
                    "w-full flex flex-col items-center p-3 px-4 pb-2 hover:brightness-95 hover:cursor-pointer transition-all duration-300 space-y-1",
                    isSelected ? "bg-[#CC4778]" : "bg-[#F8FCFD]",
                  )}
                  key={`sidebar-${item.key}`}
                >
                  {isSelected && (
                    <Image
                      src={item.selectedImage}
                      className=""
                      width={36}
                      height={36}
                      alt={`${item.label} selected`}
                    />
                  )}
                  {!isSelected && (
                    <Image
                      src={item.image}
                      className=""
                      width={36}
                      height={36}
                      alt={`${item.label}`}
                    />
                  )}
                  <p
                    className={cn(
                      "font-noto-sans text-center text-sm font-semibold leading-5 tracking-tight",
                      isSelected ? "text-white" : "text-[#C2C0C0]",
                    )}
                  >
                    {item.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
      {panelStage === PANEL_STAGE.ANALYSIS && (
        <div
          className={cn(
            "fixed top-[90px] z-40 max-h-[calc(100vh-8rem-48px)] left-[112px]",
          )}
        >
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
                  "w-[455px] pt-0 transition-opacity duration-300 relative",
                  isExpanded ? "opacity-100" : "opacity-0",
                )}
              >
                <AnalysisPanel
                  selected={selected}
                  nextStage={() => setPanelStage(PANEL_STAGE.EVALUATE)}
                />
              </div>
            </div>
          </div>

          {/* Toggle Button - positioned relative to panel edge */}
          {true && (
            <button
              name="openClosePanel"
              onClick={() => {
                onClickExpand();
              }}
              className={cn(
                "absolute top-0 z-50 flex h-[62px] px-0.5 items-center justify-center rounded-r-md bg-[#EEEFF3] transition-all duration-300 ease-in-out hover:bg-accent cursor-pointer",
                isExpanded ? "left-[455px] opacity-100" : "left-0 opacity-0",
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
          )}
        </div>
      )}

      {panelStage === PANEL_STAGE.EVALUATE && (
        <div
          className={cn(
            "fixed top-[90px] z-40 max-h-[calc(100vh-8rem-48px)] left-[24px]",
          )}
        >
          <div
            className={cn(
              "h-full bg-background shadow-lg transition-all duration-300 ease-in-out overflow-hidden w-[455px]",
              className,
            )}
          >
            <div className="h-full overflow-hidden relative">
              <div
                className={cn(
                  "w-[455px] bg-[#F6F6F6] sticky top-0 z-40 opacity-100",
                )}
              >
                <p className="py-[18px] px-5 headline-xxs-desktop-bold text-text-icons-base-main">
                  {titleArr.find((item) => item.key === panelStage)?.message ||
                    t("error")}
                </p>
              </div>
              <div
                className={cn(
                  "w-[455px] pt-0 transition-opacity duration-300 relative opacity-100",
                )}
              >
                <EvaluatePanel
                  prevStage={() => {
                    setPanelStage(PANEL_STAGE.ANALYSIS);
                    setSelected(ROUTE_KEYS.AREA);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
