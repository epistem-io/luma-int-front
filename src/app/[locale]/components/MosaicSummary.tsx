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
import { SummaryDownloadButton } from "./SummaryField";
import Image from "next/image";
import { TimePeriodAccordion } from "./TimePeriodAccordion";
import { AreaScopingAccordion } from "./AreaScopingAccordion";
import { SateliteCompositeAccordion } from "./SateliteCompositeAccordion";
import { Button } from "@/components/ui/button";
import { useContext, useEffect, useState } from "react";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import {
  BASIC_INFORMATION_ACCORDION_TYPE,
  GET_MOSAIC_DOWNLOAD_URL,
  PANEL_COMPONENT_KEY,
  TEMPORAL_COVERAGE_ARRAY,
} from "@/constants";
import { AreaScopingSummary } from "./AreaScopingSummary";
import { TimePeriodSummary } from "./TimePeriodSummary";
import { SatelliteCompositeSummary } from "./SatelliteCompositeSummary";
import { Switch } from "@/components/ui/switch";
import { cn, numberThousandSeparator } from "@/lib/utils";
import { GlobalContext } from "@/contexts/globalContext";
import { showErrorToast } from "@/components/ui/error-toast";
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
import { MosaicDownloadDialog } from "./MosaicDownloadDialog";

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

  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const [isFetchingDownloadUrl, setIsFetchingDownloadUrl] = useState(false);

  const isDownloadMosaicDisabled =
    isMosaicLoading ||
    isFetchingDownloadUrl ||
    (!!mosaicStatistic && mosaicStatistic.download_url === "");

  /**
   * With the backend fast path, /image-mosaic returns download_url = null and
   * the GeoTIFF link is built only when the user actually asks for it.
   */
  const resolveMosaicDownloadUrl = async (): Promise<string> => {
    if (mosaicStatistic?.download_url) return mosaicStatistic.download_url;
    if (mosaicStatistic?.download_url === "") return "";

    const response = await fetch(
      `${GET_MOSAIC_DOWNLOAD_URL}?${new URLSearchParams({ session_id: sessionId })}`,
    );
    const json: GetMosaicDownloadUrlRes = await response.json();
    if (!response.ok) {
      throw new Error(
        `${json?.error?.message || response.statusText}. Trace: ${json?.trace}`,
      );
    }
    return json.results?.download_url ?? "";
  };

  const downloadMosaicToDevice = async () => {
    const fileUrl = await resolveMosaicDownloadUrl();
    if (!fileUrl) {
      showErrorToast({
        title: t("common.errors.mosaicDownloadUnavailableTitle"),
        description: t("common.errors.mosaicDownloadUnavailable"),
      });
      return;
    }
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
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }

  const handleConfirmDownload = async () => {
    setIsFetchingDownloadUrl(true);
    try {
      await downloadMosaicToDevice();
      setIsDownloadDialogOpen(false);
    } catch (e) {
      showErrorToast({
        title: t("common.errors.downloadFailed"),
        error: e,
        onRetry: () => void handleConfirmDownload(),
      });
    } finally {
      setIsFetchingDownloadUrl(false);
    }
  };

  const headCls =
    "h-9 px-3 text-left font-aptos text-xs font-semibold leading-4.5 text-text-icons-base-second";
  const cellCls =
    "px-3 py-2.5 text-left font-aptos! text-xs leading-4.5 text-text-icons-base-main";
  const statLabelCls =
    "font-aptos text-[13px] leading-4.5 text-text-icons-base-second";
  const statValueCls =
    "font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-primary-red-pink-normal-active";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-row items-center justify-between gap-x-3">
          <p className="font-noto-sans text-xl font-semibold leading-7 tracking-[-0.2px] text-text-icons-base-main">
            {t("basicInformation.compositeSummaryTitle")}
          </p>
          <SummaryDownloadButton
            label={t("basicInformation.downloadMosaicMap")}
            disabled={isDownloadMosaicDisabled}
            onClick={() => setIsDownloadDialogOpen(true)}
          />
        </div>

        <div className="rounded-lg border border-text-icons-disabled overflow-hidden">
          <Table>
            <TableHeader className="bg-primary-red-pink-light">
              <TableRow className="border-0 hover:bg-transparent">
                <TableHead className={`${headCls} w-10`}>
                  {t("basicInformation.numberColumn")}
                </TableHead>
                <TableHead className={headCls}>
                  {t("basicInformation.sceneIDcolumn")}
                </TableHead>
                <TableHead className={headCls}>
                  {t("basicInformation.tanggalPerekamanColumn")}
                </TableHead>
                <TableHead className={headCls}>
                  {t("basicInformation.tutupanAwanColumn")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mosaicStatistic?.summary?.map((item, index) => (
                <TableRow
                  key={`mosaic row ${index}`}
                  className="border-0 bg-white even:bg-text-icons-base-fourth"
                >
                  <TableCell className={cellCls}>{index + 1}</TableCell>
                  <TableCell className={cellCls}>{item.scene_id}</TableCell>
                  <TableCell className={cellCls}>
                    {item.tanggal_perekaman}
                  </TableCell>
                  <TableCell className={cellCls}>{item.tutupan_awan}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="space-y-1">
        <p className="font-aptos text-sm font-semibold leading-5 text-neutral-700">
          {t("basicInformation.statistikTutupanAwan")}
        </p>
        <div className="flex flex-row justify-between items-center">
          <div>
            <p className={statLabelCls}>{t("basicInformation.minimum")}</p>
            <p className={statValueCls}>{mosaicStatistic?.statistics?.min.toFixed(2)}%</p>
          </div>
          <div>
            <p className={statLabelCls}>{t("basicInformation.rataRata")}</p>
            <p className={statValueCls}>
              {mosaicStatistic?.statistics?.mean.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className={statLabelCls}>{t("basicInformation.maksimum")}</p>
            <p className={statValueCls}>{mosaicStatistic?.statistics?.max.toFixed(2)}%</p>
          </div>
        </div>
      </div>

      <MosaicDownloadDialog
        open={isDownloadDialogOpen}
        onOpenChange={setIsDownloadDialogOpen}
        onConfirm={handleConfirmDownload}
        isSubmitting={isFetchingDownloadUrl}
      />
    </div>
  );
};
