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
} from "lucide-react";
import { JSX, useContext, useEffect, useMemo, useRef, useState } from "react";
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
import { DefineLUCComponent, DefineLUCFooter } from "./DefineLUCComponent";
import { set } from "zod";
import { MapContext } from "@/contexts/mapContext";
import {
  DataTrainingComponent,
  DataTrainingFooter,
} from "./DataTrainingComponent";
import { OSSComponent, OSSFooter } from "./OSSComponent";
import { LULCParamsComponent, LULCParamsFooter } from "./LULCParamsComponent";
import { YourMapComponent, YourMapFooter } from "./YourMapComponent";

interface PanelComponent {
  component: JSX.Element;
  title: string;
  subtitle?: string;
  footer?: JSX.Element;
  onClickBackCallback?: () => void;
}

const DEFAULT = "area_scoping";

export const InteractivePanel = () => {
  const {
    stepKey,
    setStepKey,
    polygonData,
    setAreaScopingPolygonArea,
    setAreaScopingPolygonFileName,
    setAreaScopingPolygonFileSize,
    setAreaScopingPolygonUrl,
    setPolygonData,
  } = useContext(MapGenerationContext);

  const { vectorSource, removeMarkerCursor } = useContext(MapContext);

  const PANEL_COMPONENT_ARRAY: Record<PANEL_COMPONENT_KEY, PanelComponent> = {
    [PANEL_COMPONENT_KEY.NULL]: {
      component: <div>Error</div>,
      title: "Error",
    },
    [PANEL_COMPONENT_KEY.BASIC_INFORMATION]: {
      component: <BasicInformationComponent />,
      footer: <BasicInformationFooter />,
      title: "Basic Information",
      subtitle:
        "Start by providing the fundamental details needed to generate your LULC map.In this step, you'll:",
    },
    [PANEL_COMPONENT_KEY.AREA_SCOPING]: {
      component: <AreaScopingComponent />,
      footer: <AreaScopingFooter />,
      title: "Area Scoping",
      onClickBackCallback: () => {
        setAreaScopingPolygonArea(0);
        setAreaScopingPolygonFileName("");
        setAreaScopingPolygonFileSize(0);
        setAreaScopingPolygonUrl(null);
        vectorSource?.clear();
        setPolygonData(null);

        setStepKey(PANEL_COMPONENT_KEY.BASIC_INFORMATION);
      },
    },
    [PANEL_COMPONENT_KEY.BASIC_INFORMATION_SUMMARY]: {
      component: <BasicInformationSummaryComponent />,
      footer: <BasicInformationSummaryFooter />,
      title: "Basic Information",
      subtitle:
        "Start by providing the fundamental details needed to generate your LULC map.In this step, you'll:",
    },
    [PANEL_COMPONENT_KEY.DEFINE_LUC]: {
      component: <DefineLUCComponent />,
      footer: <DefineLUCFooter />,
      title: "Define Land Use/Cover Classes",
      subtitle:
        "Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem IpsumLorem Ipsum Lorem Ipsum Lorem Ipsum",
    },
    [PANEL_COMPONENT_KEY.DATA_TRAINING]: {
      component: <DataTrainingComponent />,
      footer: <DataTrainingFooter />,
      title: "Data Training",
      subtitle:
        "Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem IpsumLorem Ipsum Lorem Ipsum Lorem Ipsum",
    },
    [PANEL_COMPONENT_KEY.OSS]: {
      component: <OSSComponent />,
      footer: <OSSFooter />,
      title: "On Screen Sampling",
      subtitle:
        "Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem IpsumLorem Ipsum Lorem Ipsum Lorem Ipsum",
      onClickBackCallback: () => {
        // removeMarkerCursor()
        setStepKey(PANEL_COMPONENT_KEY.DATA_TRAINING);
      },
    },
    [PANEL_COMPONENT_KEY.LULC_PARAMS]: {
      component: <LULCParamsComponent />,
      footer: <LULCParamsFooter />,
      title: "Select LULC List Parameters",
      subtitle:
        "Default settings are automatically applied for optimal results. Adjust these step only if you want more specialized analysis.",
    },
    [PANEL_COMPONENT_KEY.YOUR_MAP]: {
      component: <YourMapComponent />,
      footer: <YourMapFooter />,
      title: "Your Map",
      subtitle:
        "Your LULC map is ready. This map reflects the area, time period, and all settings you defined in the previous steps.",
    },
  };

  const [isOpen, setIsOpen] = useState(true);
  const [subtitleHeight, setSubtitleHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);

  const interactiveComponent = useMemo(() => {
    return PANEL_COMPONENT_ARRAY[stepKey];
  }, [stepKey]);

  const subtitleRef = useRef<null | HTMLDivElement>(null);
  const footerRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    setSubtitleHeight(subtitleRef.current?.clientHeight || 0);
    setFooterHeight(footerRef.current?.clientHeight || 0);
    // console.log(
    //   "heightt sub footer",
    //   subtitleRef.current?.clientHeight,
    //   footerRef.current?.clientHeight,
    // );
  }, [stepKey]);

  useEffect(() => {
    setSubtitleHeight(subtitleRef.current?.clientHeight || 0);
    setFooterHeight(footerRef.current?.clientHeight || 0);
    // console.log(
    //   "heightt sub footer",
    //   subtitleRef.current?.clientHeight,
    //   footerRef.current?.clientHeight,
    // );
    // setStepKey(PANEL_COMPONENT_KEY.BASIC_INFORMATION);
  }, []);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="relative">
      <div
        className={cn(
          "bg-background-base-main rounded-2xl w-120.75 pt-4 space-y-0",
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
          <p className="text-primary-pink text-2xl font-roboto font-bold tracking-[-0.24px] text-center">
            {interactiveComponent.title}
          </p>
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
          className={cn("collapsible-content-primitive relative pt-4", {
            "h-full": isOpen,
          })}
        >
          {interactiveComponent.subtitle && (
            <div ref={subtitleRef} className="pb-4 px-4">
              <p className="text-neutral-700-baru text-center font-aptos text-md font-regular leading-6">
                {interactiveComponent.subtitle}
              </p>
            </div>
          )}
          <div
            className="overflow-scroll px-4"
            style={{
              // max-h-[calc(100vh-114px-123px-12px-16px-32px-16px-48px)]
              // maxHeight: `calc(100vh - 114px - 123px - 12px - 16px - ${footerHeight}px - ${subtitleHeight}px)`,
              // maxHeight: `calc(100vh - 114px - 123px - 12px - 16px - 32px - 16px - 32px - ${footerHeight}px - ${subtitleHeight}px)`,
              // maxHeight: `calc(100vh - 114px - 123px - 12px - 16px - 32px - 16px - 32px - 60px - ${subtitleHeight}px)`,

              // maxHeight: `calc(100vh - 114px - 123px - 12px - 16px - 32px - 16px - 16px - 8px - ${footerHeight}px - ${subtitleHeight}px)`,
              maxHeight: `calc(100vh - 114px - 123px - 12px - 16px - 32px - 16px - ${footerHeight}px - ${subtitleHeight}px)`,
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
    // <div className="h-full">
    // </div>
  );
};
