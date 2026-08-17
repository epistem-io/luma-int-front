"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Field, FieldGroup, FieldSet } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  SquarePenIcon,
} from "lucide-react";
import {
  JSX,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BasicInformationComponent,
  BasicInformationFooter,
} from "./BasicInformationComponent";
import {
  AreaScopingComponent,
  AreaScopingFooter,
} from "./AreaScopingComponent";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { PANEL_COMPONENT_KEY } from "@/constants";
import {
  BasicInformationSummaryComponent,
  BasicInformationSummaryFooter,
} from "./BasicInformatioSummaryComponent";
import {
  DefineLUCComponent,
  DefineLUCFooter,
  DefineLUCLeaveDialog,
} from "./DefineLUCComponent";
import { set } from "zod";
import { MapContext } from "@/contexts/mapContext";
import {
  DataTrainingComponent,
  DataTrainingFooter,
} from "./DataTrainingComponent";
import { OSSComponent, OSSFooter } from "./OSSComponent";
import { LULCParamsComponent, LULCParamsFooter } from "./LULCParamsComponent";
import {
  LULCClassSummaryComponent,
  LULCClassSummaryFooter,
} from "./LULCClassSummaryComponent";
import { YourMapComponent, YourMapFooter } from "./YourMapComponent";
import { useTranslations } from "next-intl";
import { useObservedHeight } from "@/lib/hooks";

interface PanelComponent {
  component: JSX.Element;
  title: string;
  subtitle?: string;
  footer?: JSX.Element;
  onClickBackCallback?: () => void;
}

// const PANEL_COMPONENT_ARRAY: Record<PANEL_COMPONENT_KEY, PanelComponent> = {
//   [PANEL_COMPONENT_KEY.NULL]: {
//     component: <div>Error</div>,
//     title: "Error",
//   },
//   [PANEL_COMPONENT_KEY.BASIC_INFORMATION]: {
//     component: <BasicInformationComponent />,
//     footer: <BasicInformationFooter />,
//     title: t("basicInformation.basicInformationTitle"),
//     subtitle: t("basicInformation.basicInformationCaption"),
//   },
//   [PANEL_COMPONENT_KEY.AREA_SCOPING]: {
//     component: <AreaScopingComponent />,
//     footer: <AreaScopingFooter />,
//     title: t("areaScoping.areaScoping"),
//     onClickBackCallback: () => {
//       setAreaScopingPolygonArea(0);
//       setAreaScopingPolygonFileName("");
//       setAreaScopingPolygonFileSize(0);
//       setAreaScopingPolygonUrl(null);
//       vectorSource?.clear();
//       setPolygonData(null);

//       setStepKey(PANEL_COMPONENT_KEY.BASIC_INFORMATION);
//     },
//   },
//   [PANEL_COMPONENT_KEY.BASIC_INFORMATION_SUMMARY]: {
//     component: <BasicInformationSummaryComponent />,
//     footer: <BasicInformationSummaryFooter />,
//     title: t("basicInformation.basicInformationTitle"),
//     subtitle: t("basicInformation.basicInformationCaption"),
//   },
//   [PANEL_COMPONENT_KEY.DEFINE_LUC]: {
//     component: <DefineLUCComponent />,
//     footer: <DefineLUCFooter />,
//     title: t("defineLUC.defineLUCTitle"),
//     subtitle: t("defineLUC.defineLUCDescription"),
//   },
//   [PANEL_COMPONENT_KEY.DATA_TRAINING]: {
//     component: <DataTrainingComponent />,
//     footer: <DataTrainingFooter />,
//     title: t("dataTraining.dataTrainingTitle"),
//     subtitle: t("dataTraining.dataTrainingDescription"),
//   },
//   [PANEL_COMPONENT_KEY.OSS]: {
//     component: <OSSComponent />,
//     footer: <OSSFooter />,
//     title: t("dataTraining.onScreenSamplingPanel"),
//     subtitle: t("dataTraining.onScreenSamplingPanelDescription"),
//     onClickBackCallback: () => {
//       // removeMarkerCursor()
//       setStepKey(PANEL_COMPONENT_KEY.DATA_TRAINING);
//     },
//   },
//   [PANEL_COMPONENT_KEY.LULC_PARAMS]: {
//     component: <LULCParamsComponent />,
//     footer: <LULCParamsFooter />,
//     title: t("lulcParams.selectLULCListParams"),
//     subtitle: t("lulcParams.selectLULCListParamsDescription"),
//   },
//   [PANEL_COMPONENT_KEY.YOUR_MAP]: {
//     component: <YourMapComponent />,
//     footer: <YourMapFooter />,
//     title: t("yourMap.yourMapPanelTitle"),
//     subtitle: t("yourMap.yourMapPanelDescription"),
//   },
// };

export const InteractivePanel = () => {
  const {
    stepKey,
    setStepKey,
    progressPanelIndex,
    polygonData,
    setAreaScopingPolygonArea,
    setAreaScopingPolygonFileName,
    setAreaScopingPolygonFileSize,
    setAreaScopingPolygonUrl,
    setAreaScopingRegency,
    setPolygonData,
    setSpatialResolution,
    selectedDefault,
    selectedCustom,
    lucView,
    setLucView,
    lucQuickPhase,
    lucDefaultConfirmed,
    lucQuickRows,
    LUCfile,
  } = useContext(MapGenerationContext);

  // Only the Own Classification flow guards back-navigation with the
  // leave-confirmation dialog (DefineLUCLeaveDialog below); the Default
  // Scheme flow keeps its toggles and returns to the picker silently.
  const [isLucLeaveDialogOpen, setIsLucLeaveDialogOpen] = useState(false);
  const hasOwnLucInputs = lucQuickRows.length > 0 || LUCfile !== null;

  // While a step-2 classification flow is open (and not yet confirmed), the
  // panel header becomes the flow header: back button + Hierarchy title.
  // "locked" is the confirmed summary's inline edit mode, which keeps the
  // normal step header like "confirmed" does.
  const isLucFlowView =
    lucView !== "picker" && lucQuickPhase === "editing" && !lucDefaultConfirmed;

  const t = useTranslations("InteractivePanel");

  const { vectorSource, removeMarkerCursor } = useContext(MapContext);

  const PANEL_COMPONENT_ARRAY: Record<PANEL_COMPONENT_KEY, PanelComponent> =
    useMemo(() => {
      return {
        [PANEL_COMPONENT_KEY.NULL]: {
          component: <div>Error</div>,
          title: "Error",
        },
        [PANEL_COMPONENT_KEY.BASIC_INFORMATION]: {
          component: <BasicInformationComponent />,
          footer: <BasicInformationFooter />,
          title: t("basicInformation.basicInformationTitle"),
          subtitle: t("basicInformation.basicInformationCaption"),
        },
        [PANEL_COMPONENT_KEY.AREA_SCOPING]: {
          component: <AreaScopingComponent />,
          footer: <AreaScopingFooter />,
          title: t("areaScoping.areaScoping"),
          onClickBackCallback: () => {
            setAreaScopingPolygonArea(0);
            setAreaScopingPolygonFileName("");
            setAreaScopingPolygonFileSize(0);
            setAreaScopingPolygonUrl(null);
            setAreaScopingRegency(null);
            vectorSource?.clear();
            setPolygonData(null);
            setSpatialResolution("");

            setStepKey(PANEL_COMPONENT_KEY.BASIC_INFORMATION);
          },
        },
        [PANEL_COMPONENT_KEY.BASIC_INFORMATION_SUMMARY]: {
          component: <BasicInformationSummaryComponent />,
          footer: <BasicInformationSummaryFooter />,
          title: t("basicInformation.basicInformationTitle"),
          subtitle: t("basicInformation.basicInformationCaption"),
        },
        [PANEL_COMPONENT_KEY.DEFINE_LUC]: {
          component: <DefineLUCComponent />,
          footer: <DefineLUCFooter />,
          title: isLucFlowView
            ? t("defineLUC.LUCHierarchy")
            : t("defineLUC.defineLUCTitle"),
          subtitle: isLucFlowView
            ? undefined
            : t("defineLUC.defineLUCDescription"),
          onClickBackCallback: isLucFlowView
            ? () => {
                if (lucView === "own" && hasOwnLucInputs) {
                  setIsLucLeaveDialogOpen(true);
                  return;
                }
                setLucView("picker");
              }
            : undefined,
        },
        [PANEL_COMPONENT_KEY.DATA_TRAINING]: {
          component: <DataTrainingComponent />,
          footer: <DataTrainingFooter />,
          title: t("dataTraining.dataTrainingTitle"),
          subtitle: selectedCustom
            ? t("dataTraining.dataTrainingDescriptionOWNCLASS")
            : selectedDefault
              ? t("dataTraining.dataTrainingDescriptionDEFAULTCLASS")
              : "Error",
        },
        [PANEL_COMPONENT_KEY.OSS]: {
          component: <OSSComponent />,
          footer: <OSSFooter />,
          title: t("dataTraining.onScreenSamplingPanel"),
          subtitle: t("dataTraining.onScreenSamplingPanelDescription"),
          onClickBackCallback: () => {
            // removeMarkerCursor()
            setStepKey(PANEL_COMPONENT_KEY.DATA_TRAINING);
          },
        },
        [PANEL_COMPONENT_KEY.LULC_PARAMS]: {
          component: <LULCParamsComponent />,
          footer: <LULCParamsFooter />,
          title: t("lulcParams.selectLULCListParams"),
          subtitle: t("lulcParams.selectLULCListParamsDescription"),
        },
        [PANEL_COMPONENT_KEY.LULC_PARAMS_SUMMARY]: {
          component: <LULCClassSummaryComponent />,
          footer: <LULCClassSummaryFooter />,
          title: t("lulcParams.selectLULCListParams"),
          subtitle: t("lulcParams.selectLULCListParamsDescription"),
        },
        [PANEL_COMPONENT_KEY.YOUR_MAP]: {
          component: <YourMapComponent />,
          footer: <YourMapFooter />,
          title: t("yourMap.yourMapPanelTitle"),
          subtitle: t("yourMap.yourMapPanelDescription"),
        },
      };
    }, [selectedCustom, selectedDefault, isLucFlowView, lucView, hasOwnLucInputs]);

  const [isOpen, setIsOpen] = useState(true);
  // const [subtitleHeight, setSubtitleHeight] = useState(0);
  // const [footerHeight, setFooterHeight] = useState(0);

  const interactiveComponent = useMemo(() => {
    return PANEL_COMPONENT_ARRAY[stepKey];
  }, [stepKey, PANEL_COMPONENT_ARRAY]);

  // const subtitleRef = useRef<null | HTMLDivElement>(null);
  // const footerRef = useRef<null | HTMLDivElement>(null);

  // useEffect(() => {
  //   console.log("subtitleHeight footerHeight", subtitleHeight, footerHeight);
  //   setSubtitleHeight(subtitleRef.current?.clientHeight || 0);
  //   setFooterHeight(footerRef.current?.clientHeight || 0);
  // }, [subtitleRef.current?.clientHeight, footerRef.current?.clientHeight]);

  // useEffect(() => {
  //   if (!subtitleRef.current) return;

  //   const observer = new ResizeObserver((entries) => {
  //     for (let entry of entries) {
  //       // Use contentRect or borderBoxSize for height
  //       setSubtitleHeight(entry.target.clientHeight);
  //       console.log("subtitleHeight", subtitleHeight);
  //     }
  //   });

  //   observer.observe(subtitleRef.current);

  //   return () => observer.disconnect();
  // }, []);

  // useEffect(() => {
  //   if (!footerRef.current) return;

  //   const observer = new ResizeObserver((entries) => {
  //     for (let entry of entries) {
  //       // Use contentRect or borderBoxSize for height
  //       setFooterHeight(entry.target.clientHeight);
  //       console.log("footerHeight", footerHeight);
  //     }
  //   });

  //   observer.observe(footerRef.current);

  //   return () => observer.disconnect();
  // }, []);

  // useEffect(() => {
  //   setSubtitleHeight(subtitleRef.current?.clientHeight || 0);
  //   setFooterHeight(footerRef.current?.clientHeight || 0);
  //   // console.log(
  //   //   "heightt sub footer",
  //   //   subtitleRef.current?.clientHeight,
  //   //   footerRef.current?.clientHeight,
  //   // );
  //   // setStepKey(PANEL_COMPONENT_KEY.BASIC_INFORMATION);
  // }, []);

  const { ref: subtitleRef, height: subtitleHeight } =
    useObservedHeight<HTMLDivElement>();

  const { ref: footerRef, height: footerHeight } =
    useObservedHeight<HTMLDivElement>();

  const { ref: titleRef, height: titleHeight } =
    useObservedHeight<HTMLDivElement>();

  useEffect(() => {
    console.log(
      "subtitleHeight footerHeight, titleHeight",
      subtitleHeight,
      footerHeight,
      titleHeight,
    );
    // setSubtitleHeight(subtitleRef.current?.clientHeight || 0);
    // setFooterHeight(footerRef.current?.clientHeight || 0);
  }, [subtitleHeight, footerHeight, titleHeight]);

  return (
    <>
      <DefineLUCLeaveDialog
        open={isLucLeaveDialogOpen}
        onOpenChange={setIsLucLeaveDialogOpen}
      />
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="relative">
      <div
        className={cn(
          "bg-background-base-main rounded-2xl pt-4 border-[1.5px] border-[#E7E6E6] space-y-0",
          // On 1080p-and-smaller screens the panel slims to w-120 for steps
          // 1-4; step 5 and anything wider than 1920px keep the full w-150.
          // (Step 5 runs with index 5 — the map-generation flow skips 4.)
          progressPanelIndex >= 4 ? "w-150" : "w-120 min-[1921px]:w-150",
          !isOpen && "pb-4",
        )}
        style={{
          boxShadow:
            "0 1px 3px 0 rgba(0, 0, 0, 0.10), 0 1px 2px -1px rgba(0, 0, 0, 0.10)",
        }}
      >
        <div
          className={cn(
            "flex flex-col items-center justify-center relative px-4",
          )}
        >
          <div ref={titleRef}>
            <p className="text-primary-pink text-2xl font-roboto font-bold tracking-[-0.24px] text-center">
              {interactiveComponent.title}
            </p>
          </div>
          <div className="absolute right-4 top-0">
            <CollapsibleTrigger asChild>
              <Button
                size={"icon-sm"}
                className="rounded-md bg-text-icons-base-fourth hover:bg-text-icons-base-fourth hover:cursor-pointer transition-all duration-200 hover:brightness-90 p-0 aspect-square"
              >
                <ChevronDown
                  className={cn(
                    "text-primary-pink size-7 transition-all duration-300",
                    isOpen ? "rotate-180" : "",
                  )}
                />
              </Button>
            </CollapsibleTrigger>
          </div>
          {interactiveComponent.onClickBackCallback && isOpen && (
            <div className="absolute left-4 top-0">
              <Button
                size={"icon"}
                className="rounded-full bg-transparent hover:bg-text-icons-base-fourth hover:cursor-pointer transition-all duration-200 hover:brightness-90 p-0 aspect-square shadow-none"
                onClick={() => {
                  if (!interactiveComponent.onClickBackCallback) return;

                  interactiveComponent.onClickBackCallback();
                }}
              >
                <ChevronLeft className={cn("text-primary-pink size-8")} />
              </Button>
            </div>
          )}
        </div>
        <CollapsibleContent
          // forceMount={stepKey === PANEL_COMPONENT_KEY.YOUR_MAP}
          className={cn("collapsible-content-primitive relative pt-2", {
            "h-full": isOpen,
          })}
        >
          {interactiveComponent.subtitle && (
            <div ref={subtitleRef} className="">
              <div className="pb-4 px-4">
                <p className="text-neutral-700-baru text-center font-aptos text-md font-regular leading-6">
                  {interactiveComponent.subtitle}
                </p>
              </div>
              {/* Step-2 summary edit-mode banner: lives at the panel level
                  so it spans the full panel width, border to border. Inside
                  the measured subtitle wrapper so the scroll-area height
                  budget accounts for it. */}
              {stepKey === PANEL_COMPONENT_KEY.DEFINE_LUC &&
                lucQuickPhase === "locked" && (
                  <div
                    className="px-4 py-3 space-y-1 mb-3"
                    style={{
                      background:
                        "linear-gradient(90deg, #FAEDF2 0%, #FFF3F7 100%)",
                    }}
                  >
                    <div className="flex flex-row items-center gap-x-2">
                      <SquarePenIcon className="size-4 text-primary-red-pink-normal" />
                      <p className="font-aptos text-md font-bold leading-6 text-primary-red-pink-normal">
                        {t("defineLUC.editMode")}
                      </p>
                    </div>
                    <p className="font-aptos text-sm font-regular leading-5 text-text-icons-base-second">
                      {t("defineLUC.editModeCaption")}
                    </p>
                  </div>
                )}
            </div>
          )}
          <div
            className="overflow-y-auto overflow-x-hidden px-4 pb-3"
            style={{
              // 270px = navbar + progress panel + gaps + a 12px bottom
              // breathing margin (measured; the old constants over-reserved
              // ~20px and needlessly clipped short content). The min() caps
              // the whole panel at 885px on tall screens (861 = 885 minus
              // the panel's own vertical chrome).
              maxHeight: `calc(min(100vh - 270px, 861px) - ${titleHeight}px - ${footerHeight}px - ${subtitleHeight}px)`,
            }}
          >
            {interactiveComponent.component}
          </div>
          <div ref={footerRef} className="">
            {interactiveComponent.footer}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
    </>
    // <div className="h-full">
    // </div>
  );
};
