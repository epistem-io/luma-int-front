"use client";

import { ComingSoon } from "@/components/ComingSoon";
import {
  Accordion,
  AccordionContent,
  AccordionFullTrigger,
  AccordionItem,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronDown, ChevronRight } from "lucide-react";
import Image from "next/image";
import { TimePeriodAccordion } from "./TimePeriodAccordion";
import { AreaScopingAccordion } from "./AreaScopingAccordion";
import { SateliteCompositeAccordion } from "./SateliteCompositeAccordion";
import { Button } from "@/components/ui/button";
import { useContext, useState } from "react";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import {
  BASIC_INFORMATION_ACCORDION_TYPE,
  PANEL_COMPONENT_KEY,
  TEMPORAL_COVERAGE_ARRAY,
} from "@/constants";
import { AreaScopingSummary } from "./AreaScopingSummary";
import { TimePeriodSummary } from "./TimePeriodSummary";
import { SatelliteCompositeSummary } from "./SatelliteCompositeSummary";
import { Switch } from "@/components/ui/switch";
import { cn, numberThousandSeparator } from "@/lib/utils";
import { GlobalContext } from "@/contexts/globalContext";
import { toast } from "sonner";
import TileLayer from "ol/layer/Tile";
import { XYZ } from "ol/source";
import { MapContext } from "@/contexts/mapContext";

export const MosaicSummary = () => {
  const {
    basicInformationOpenAccordion,
    areaScopingPolygonArea,
    setBasicInformationOpenAccordion,
    temporalCoverage,
    temporalCoverageUnit,
    isBasicInformationChangeInput,
    setIsBasicInformationChangeInput,
    setStepKey,
    setTemporalCoverage,
    setTemporalCoverageUnit,
    setisEditingTemporalCoverage,
    setAreaScopingPolygonUrl,
    setAreaScopingPolygonFileName,
    setAreaScopingPolygonArea,
    setAreaScopingPolygonFileSize,
    setAreaScopingPolygonError,
    setPolygonData,
    polygonData,
  } = useContext(MapGenerationContext);

  const { sessionId } = useContext(GlobalContext);

  const {
    mapInstance,
    mosaicData,
    getMosaicMap,
    isPreviewingMosaic,
    setIsPreviewingMosaic,
    addMosaicLayer,
    removeMosaicLayer,
    isMosaicLoading,
  } = useContext(MapContext);

  const handlePreviewMosaic = async (val: boolean) => {
    // console.log("val", val);

    if (val) {
      if (mosaicData.length === 0) {
        getMosaicMap({
          sessionId,
          polygonData,
          temporalCoverage,
          temporalCoverageUnit,
        });

        return;
      }

      addMosaicLayer();

      return;
    }

    removeMosaicLayer();

    return;
  };

  return (
    <div className="space-y-3">
      <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
        Mosaic Map
      </p>
      <div className="">
        <div className="flex flex-row gap-x-3 items-center pb-1">
          <Switch
            checked={isPreviewingMosaic}
            onCheckedChange={(val) => {
              handlePreviewMosaic(val);
            }}
            disabled={isMosaicLoading}
            id="preview-mosaic-map"
          />
          {isMosaicLoading && (
            // <div className="w-full h-10 flex flex-row justify-center">
            <span className="loader sm "></span>
            // </div>
          )}
          {!isMosaicLoading && (
            <Label htmlFor="preview-mosaic-map">
              <p className="font-aptos text-md font-regular leading-6 text-neutral-700-baru">
                Preview Mosaic Map
              </p>
            </Label>
          )}
        </div>
      </div>
    </div>
  );
};
