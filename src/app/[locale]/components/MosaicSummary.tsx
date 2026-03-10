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
import { useContext, useEffect, useState } from "react";
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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { MapContext } from "@/contexts/mapContext";
import { useTranslations } from "next-intl";

export const MosaicSummary = () => {
  const { temporalCoverage, temporalCoverageUnit, polygonData } =
    useContext(MapGenerationContext);

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
    mosaicStatistic,
  } = useContext(MapContext);

  const t = useTranslations("InteractivePanel");

  // const handlePreviewMosaic = async (val: boolean) => {
  //   // console.log("val", val);

  //   if (val) {
  //     if (mosaicData.length === 0) {
  //       getMosaicMap({
  //         sessionId,
  //         polygonData,
  //         temporalCoverage,
  //         temporalCoverageUnit,
  //       });

  //       return;
  //     }

  //     // addMosaicLayer();

  //     return;
  //   }

  //   removeMosaicLayer();

  //   return;
  // };

  useEffect(() => {
    // getMosaicMap({
    //   sessionId,
    //   polygonData,
    //   temporalCoverage,
    //   temporalCoverageUnit,
    // });
  }, []);

  return (
    <div className="space-y-0">
      <div className="space-y-3">
        <div className="">
          <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
            {t("mosaicMap")}
          </p>
          <div className="flex flex-row items-center justify-between">
            <p className="font-aptos text-md font-regular leading-6 text-neutral-700-baru">
              Mosaic Summary
            </p>
            <div className="flex flex-row gap-x-3 items-center pb-1">
              {/* {isMosaicLoading && (
                // <div className="w-full h-10 flex flex-row justify-center">
                <span className="loader sm "></span>
                // </div>
              )}
              {!isMosaicLoading && (
                <Label htmlFor="preview-mosaic-map">
                  <p className="font-aptos text-md font-regular leading-6 text-neutral-700-baru">
                    {t("previewMosaicMap")}
                  </p>
                </Label>
              )}
              <Switch
                checked={isPreviewingMosaic}
                // onCheckedChange={(val) => {
                //   handlePreviewMosaic(val);
                // }}
                disabled={true}
                id="preview-mosaic-map"
              /> */}
            </div>
          </div>
          <div className="mt-2">
            <div className="border border-text-icons-disabled rounded-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-purple-second">
                  <TableRow>
                    <TableHead className="text-black font-aptos text-xs font-semibold leading-4.5 text-center">
                      {/* {t("featureID")} */}#
                    </TableHead>
                    <TableHead className="text-black font-aptos text-xs font-semibold leading-4.5 text-center">
                      {/* {t("featureID")} */}
                      Scene ID
                    </TableHead>
                    <TableHead className="text-black font-aptos text-xs font-semibold leading-4.5 text-center">
                      {/* {t("lulcClass")} */}
                      Tanggal Perekaman
                    </TableHead>
                    <TableHead className="text-black font-aptos text-xs font-semibold leading-4.5 text-center w-25">
                      {/* {t("numberOfPoints")} */}
                      Tutupan Awan (%)
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-black font-aptos text-xs font-regular leading-4.5 bg-white">
                  {mosaicStatistic?.summary?.map((item, index) => (
                    <TableRow key={`mosaic row ${index}`}>
                      <TableCell className="font-aptos! text-center">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-aptos! text-center">
                        {item.scene_id}
                      </TableCell>
                      <TableCell className="font-aptos! text-center">
                        {item.tanggal_perekaman}
                      </TableCell>
                      <TableCell className="font-aptos! text-center max-w-25">
                        {item.tutupan_awan}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        <div className="">
          <p className="font-aptos text-md font-regular leading-6 text-neutral-700-baru">
            Statistik Tutupan Awan
          </p>
          <div className="flex flex-row justify-between items-center">
            <div className="">
              <p className="font-pjs text-xs font-semibold leading-4.5 text-text-icons-base-second">
                Minimum
              </p>
              <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-secondary-purple-dark">
                {mosaicStatistic?.statistics?.min}%
              </p>
            </div>
            <div className="">
              <p className="font-pjs text-xs font-semibold leading-4.5 text-text-icons-base-second">
                Rata-rata
              </p>
              <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-secondary-purple-dark">
                {mosaicStatistic?.statistics?.mean}%
              </p>
            </div>
            <div className="">
              <p className="font-pjs text-xs font-semibold leading-4.5 text-text-icons-base-second">
                Maksimum
              </p>
              <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-secondary-purple-dark">
                {mosaicStatistic?.statistics?.max}%
              </p>
            </div>
          </div>
          <div className="w-full flex flex-row justify-end">
            <Button
              variant={"ghost"}
              className="p-0 hover:bg-transparent cursor-pointer ml-auto"
              disabled={isMosaicLoading}
              onClick={async () => {
                // onResetInput();

                const fileUrl = mosaicStatistic?.download_url || "";
                const response = await fetch(fileUrl);
                const blob = await response.blob();
                const filename = response.headers
                  .get("content-disposition")
                  ?.split("filename=")[1];
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.download = filename || "mosaic-map";
                a.style.display = "none";
                a.href = url;
                // a.download = "mosaic-map";
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
              }}
            >
              <div className="">
                <p className="text-neutral-700-baru font-aptos text-md font-regular leading-6 underline">
                  Download Mosaic Map
                </p>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
