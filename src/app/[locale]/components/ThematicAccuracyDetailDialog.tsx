"use client";

import { ReactNode, useContext, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChevronDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { MapContext } from "@/contexts/mapContext";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import OlMap from "ol/Map";
import View from "ol/View";
import Feature from "ol/Feature";
import { Point } from "ol/geom";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { fromLonLat } from "ol/proj";
import { OSM } from "ol/source";
import VectorSource from "ol/source/Vector";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";

// Collapsible card wrapper shared by every section of the detail dialog.
// forceMount keeps the children in the DOM while collapsed (needed by the
// embedded OpenLayers map, which must not be unmounted).
const DetailSection = ({
  title,
  children,
  className,
  forceMount,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  forceMount?: boolean;
}) => {
  return (
    <Collapsible
      defaultOpen
      className={cn("rounded-[12px] border border-neutral-400 p-3", className)}
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="w-full flex flex-row items-center justify-between gap-x-3 cursor-pointer [&[data-state=open]>svg]:rotate-180"
        >
          <p className="font-aptos text-md font-bold leading-6 text-primary-pink text-left">
            {title}
          </p>
          <ChevronDown className="size-5 shrink-0 text-primary-pink transition-transform duration-200" />
        </button>
      </CollapsibleTrigger>
      {forceMount ? (
        <CollapsibleContent
          forceMount
          className="pt-3 data-[state=closed]:hidden"
        >
          {children}
        </CollapsibleContent>
      ) : (
        <CollapsibleContent className="pt-3">{children}</CollapsibleContent>
      )}
    </Collapsible>
  );
};

export const ThematicAccuracyDetailDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const t = useTranslations("InteractivePanel");
  const { thematicAccuracy } = useContext(MapGenerationContext);
  const { vectorSource } = useContext(MapContext);

  const errorMapTargetRef = useRef<HTMLDivElement | null>(null);
  const errorMapRef = useRef<OlMap | null>(null);

  // Embedded error map: OSM basemap + yellow AOI outline + green/red
  // validation points. Built when the dialog opens, torn down on close.
  useEffect(() => {
    if (!open || !thematicAccuracy || thematicAccuracy.points.length === 0) {
      return;
    }

    const raf = requestAnimationFrame(() => {
      if (!errorMapTargetRef.current || errorMapRef.current) return;

      const pointFeatures = thematicAccuracy.points.map((point) => {
        const feature = new Feature({
          geometry: new Point(fromLonLat([point.lon, point.lat])),
        });
        feature.setStyle(
          new Style({
            image: new CircleStyle({
              radius: 7,
              fill: new Fill({
                color: point.is_correct ? "#2ECC71" : "#E74C3C",
              }),
              stroke: new Stroke({ color: "#FFFFFF", width: 2 }),
            }),
          }),
        );
        return feature;
      });
      const pointSource = new VectorSource({ features: pointFeatures });

      // Clone the session AOI from the main map for the yellow outline.
      const aoiFeatures = (vectorSource?.getFeatures() || []).map((f) => {
        const clone = f.clone();
        clone.setStyle(
          new Style({
            stroke: new Stroke({ color: "#FFE600", width: 3 }),
            fill: new Fill({ color: "rgba(0, 0, 0, 0)" }),
          }),
        );
        return clone;
      });
      const aoiSource = new VectorSource({ features: aoiFeatures });

      const map = new OlMap({
        target: errorMapTargetRef.current,
        layers: [
          new TileLayer({ source: new OSM({ crossOrigin: "anonymous" }) }),
          new VectorLayer({ source: aoiSource }),
          new VectorLayer({ source: pointSource }),
        ],
        view: new View({
          center: fromLonLat([0, 0]),
          zoom: 2,
        }),
      });
      errorMapRef.current = map;

      map.getView().fit(pointSource.getExtent(), {
        padding: [50, 50, 50, 50],
        maxZoom: 15,
      });

      // Recompute size after the dialog's open animation settles.
      setTimeout(() => {
        map.updateSize();
      }, 250);
    });

    return () => {
      cancelAnimationFrame(raf);
      if (errorMapRef.current) {
        errorMapRef.current.setTarget(undefined);
        errorMapRef.current = null;
      }
    };
  }, [open, thematicAccuracy, vectorSource]);

  if (!thematicAccuracy) return null;

  const result = thematicAccuracy;
  const classes = result.per_class;

  const cell = (actualId: number, predictedId: number) =>
    result.confusion_matrix[actualId]?.[predictedId] ?? 0;

  const rowTotal = (actualId: number) =>
    (result.confusion_matrix[actualId] || []).reduce((acc, v) => acc + v, 0);

  // Heatmap shading: white-blue -> dark navy, scaled to the largest cell.
  const maxCellValue = classes.reduce(
    (acc, a) =>
      classes.reduce(
        (acc2, b) => Math.max(acc2, cell(a.class_id, b.class_id)),
        acc,
      ),
    0,
  );

  const heatRatio = (value: number) =>
    maxCellValue > 0 ? value / maxCellValue : 0;

  const heatColor = (value: number) => {
    const ratio = heatRatio(value);
    const from = [242, 247, 252];
    const to = [18, 54, 94];
    const mix = from.map((f, i) => Math.round(f + (to[i] - f) * ratio));
    return `rgb(${mix[0]}, ${mix[1]}, ${mix[2]})`;
  };

  const wrongPoints = result.n_total - result.n_correct;
  const errorRate =
    result.n_total > 0 ? (wrongPoints / result.n_total) * 100 : 0;

  // Largest off-diagonal cell = the most common misclassification.
  let commonError: { actual: string; predicted: string; count: number } | null =
    null;
  classes.forEach((a) => {
    classes.forEach((b) => {
      if (a.class_id === b.class_id) return;
      const count = cell(a.class_id, b.class_id);
      if (count > 0 && count > (commonError?.count || 0)) {
        commonError = {
          actual: a.class_name,
          predicted: b.class_name,
          count,
        };
      }
    });
  });

  const downloadRawData = () => {
    const header = [
      "lon",
      "lat",
      "actual_class_id",
      "actual_class_name",
      "predicted_class_id",
      "predicted_class_name",
      "is_correct",
    ];
    const rows = result.points.map((p) => [
      p.lon,
      p.lat,
      p.actual_class_id,
      p.actual_class_name,
      p.predicted_class_id,
      p.predicted_class_name,
      p.is_correct,
    ]);
    const csv = [header, ...rows]
      .map((row) =>
        row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "thematic_accuracy_raw_data.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Redraws the confusion-matrix heatmap onto a canvas and downloads a PNG.
  const downloadChart = () => {
    const n = classes.length;
    if (n === 0) return;

    const cellW = 96;
    const cellH = 56;
    const padding = 24;
    const yAxisTitleW = 28;
    const rowLabelW = 210;
    const titleH = 48;
    const xLabelH = 160;
    const axisTitleH = 32;
    const legendGap = 20;
    const legendW = 70;

    const gridX = padding + yAxisTitleW + rowLabelW;
    const gridY = padding + titleH;
    const width = gridX + n * cellW + legendGap + legendW + padding;
    const height = gridY + n * cellH + xLabelH + axisTitleH + padding;

    const canvas = document.createElement("canvas");
    const scale = 2;
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(scale, scale);

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = "#1F2430";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      t("yourMap.thematicMatrixChartTitle"),
      width / 2,
      padding + titleH / 2 - 10,
    );

    classes.forEach((a, i) => {
      // Cells
      classes.forEach((b, j) => {
        const value = cell(a.class_id, b.class_id);
        ctx.fillStyle = heatColor(value);
        ctx.fillRect(gridX + j * cellW, gridY + i * cellH, cellW, cellH);

        ctx.fillStyle = heatRatio(value) > 0.55 ? "#FFFFFF" : "#1F2430";
        ctx.font = "600 12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          String(value),
          gridX + j * cellW + cellW / 2,
          gridY + i * cellH + cellH / 2,
        );
      });

      // Row label
      ctx.fillStyle = "#5A6272";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(
        t("yourMap.thematicMatrixActualLabel", {
          X: a.class_id,
          Y: a.class_name,
        }),
        gridX - 12,
        gridY + i * cellH + cellH / 2,
      );
    });

    // Rotated predicted-class labels
    classes.forEach((b, j) => {
      ctx.save();
      ctx.translate(gridX + j * cellW + cellW / 2, gridY + n * cellH + 12);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = "#5A6272";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(
        t("yourMap.thematicMatrixPredictedLabel", {
          X: b.class_id,
          Y: b.class_name,
        }),
        0,
        0,
      );
      ctx.restore();
    });

    // Axis titles
    ctx.save();
    ctx.translate(padding + 8, gridY + (n * cellH) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = "#5A6272";
    ctx.font = "13px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(t("yourMap.thematicMatrixAxisActual"), 0, 0);
    ctx.restore();

    ctx.fillStyle = "#5A6272";
    ctx.font = "13px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      t("yourMap.thematicMatrixAxisPredicted"),
      gridX + (n * cellW) / 2,
      height - padding - axisTitleH / 2 + 10,
    );

    // Color-scale legend
    const legendX = gridX + n * cellW + legendGap;
    const legendH = n * cellH;
    const gradient = ctx.createLinearGradient(0, gridY, 0, gridY + legendH);
    gradient.addColorStop(0, "rgb(18, 54, 94)");
    gradient.addColorStop(1, "rgb(242, 247, 252)");
    ctx.fillStyle = gradient;
    ctx.fillRect(legendX, gridY, 16, legendH);

    ctx.fillStyle = "#5A6272";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(String(maxCellValue), legendX + 22, gridY + 6);
    ctx.fillText(
      String(Math.round(maxCellValue / 2)),
      legendX + 22,
      gridY + legendH / 2,
    );
    ctx.fillText("0", legendX + 22, gridY + legendH - 6);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "confusion_matrix_chart.png";
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  const ci = result.overall_accuracy_ci || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] sm:max-w-[1600px] max-h-[96vh] overflow-y-auto">
        <DialogTitle className="text-primary-pink font-aptos text-2xl font-bold tracking-[-0.24px] pr-8">
          {t("yourMap.thematicDetailTitle")}
        </DialogTitle>

        <div className="space-y-4">
          <div className="grid grid-cols-[210px_1fr] gap-4 items-stretch">
            {/* Accuracy result summary */}
            <DetailSection title={t("yourMap.thematicDetailResultTitle")}>
              <div className="flex flex-col gap-y-8 p-5 border-8 border-[#FFF5F8] rounded-[12px]">
                <div>
                  <p className="font-aptos text-sm font-semibold leading-5 text-text-icons-base-second">
                    {t("yourMap.overallAccuracy")}
                  </p>
                  <p className="font-noto-sans text-xl font-bold leading-7 text-success-700">
                    {(result.overall_accuracy * 100).toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="font-aptos text-sm font-semibold leading-5 text-text-icons-base-second">
                    {t("yourMap.kappaCoefficient")}
                  </p>
                  <p className="font-noto-sans text-xl font-bold leading-7 text-success-700">
                    {result.kappa.toFixed(3)}
                  </p>
                </div>
                <div>
                  <p className="font-aptos text-sm font-semibold leading-5 text-text-icons-base-second">
                    {t("yourMap.thematicConfidenceInterval")}
                  </p>
                  <p className="font-noto-sans text-xl font-bold leading-7 text-text-icons-base-main">
                    {(ci[0] * 100 || 0).toFixed(1)}% -{" "}
                    {(ci[1] * 100 || 0).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="font-aptos text-sm font-semibold leading-5 text-text-icons-base-second">
                    {t("yourMap.thematicSampleSize")}
                  </p>
                  <p className="font-noto-sans text-xl font-bold leading-7 text-text-icons-base-main">
                    {t("yourMap.thematicLocations", { X: result.n_total })}
                  </p>
                </div>
              </div>
            </DetailSection>

            {/* Confusion matrix */}
            <DetailSection
              title={t("yourMap.thematicDetailMatrixTitle")}
              className="min-w-0"
            >
              <div className="overflow-x-auto">
                <div className="min-w-[560px] space-y-3 pt-2">
                  <p className="font-aptos text-md font-bold leading-6 text-text-icons-base-main text-center">
                    {t("yourMap.thematicMatrixChartTitle")}
                  </p>
                  <div className="flex flex-row items-stretch gap-x-2">
                    {/* Y axis title */}
                    <div className="flex items-center justify-center w-6 shrink-0">
                      <p className="-rotate-90 whitespace-nowrap font-aptos text-sm font-regular text-text-icons-base-second">
                        {t("yourMap.thematicMatrixAxisActual")}
                      </p>
                    </div>

                    {/* Heatmap grid */}
                    <div className="flex-1 min-w-0">
                      {classes.map((a) => (
                        <div
                          key={`hm-row-${a.class_id}`}
                          className="flex flex-row items-stretch"
                        >
                          <div className="w-44 shrink-0 flex items-center justify-end pr-3">
                            <p className="font-aptos text-xs font-regular text-text-icons-base-second text-right">
                              {t("yourMap.thematicMatrixActualLabel", {
                                X: a.class_id,
                                Y: a.class_name,
                              })}
                            </p>
                          </div>
                          {classes.map((b) => {
                            const value = cell(a.class_id, b.class_id);
                            return (
                              <div
                                key={`hm-cell-${a.class_id}-${b.class_id}`}
                                className="flex-1 min-w-16 h-14 flex items-center justify-center"
                                style={{ backgroundColor: heatColor(value) }}
                              >
                                <p
                                  className={cn(
                                    "font-aptos text-xs font-semibold",
                                    heatRatio(value) > 0.55
                                      ? "text-white"
                                      : "text-text-icons-base-main",
                                  )}
                                >
                                  {value}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      ))}

                      {/* X labels (rotated) */}
                      <div className="flex flex-row">
                        <div className="w-44 shrink-0" />
                        {classes.map((b) => (
                          <div
                            key={`hm-x-${b.class_id}`}
                            className="flex-1 min-w-16 h-36 pt-2 overflow-visible"
                          >
                            <p className="rotate-45 origin-top-left whitespace-nowrap font-aptos text-xs font-regular text-text-icons-base-second ml-8">
                              {t("yourMap.thematicMatrixPredictedLabel", {
                                X: b.class_id,
                                Y: b.class_name,
                              })}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* X axis title */}
                      <p className="font-aptos text-sm font-regular text-text-icons-base-second text-center">
                        {t("yourMap.thematicMatrixAxisPredicted")}
                      </p>
                    </div>

                    {/* Color scale */}
                    <div className="flex flex-row items-start gap-x-1.5 shrink-0 pt-4">
                      <div
                        className="w-4 h-44 rounded-sm"
                        style={{
                          background:
                            "linear-gradient(to bottom, rgb(18, 54, 94), rgb(242, 247, 252))",
                        }}
                      />
                      <div className="h-44 flex flex-col justify-between">
                        <p className="font-aptos text-xs font-regular text-text-icons-base-second">
                          {maxCellValue}
                        </p>
                        <p className="font-aptos text-xs font-regular text-text-icons-base-second">
                          {Math.round(maxCellValue / 2)}
                        </p>
                        <p className="font-aptos text-xs font-regular text-text-icons-base-second">
                          0
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DetailSection>
          </div>

          <div className="grid grid-cols-2 gap-4 items-start">
            {/* Per-class summary from the matrix */}
            <DetailSection
              title={t("yourMap.thematicDetailMatrixSummaryTitle")}
              className="min-w-0"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-aptos text-xs font-bold text-text-icons-base-main">
                      {t("yourMap.thematicNoColumn")}
                    </TableHead>
                    <TableHead className="font-aptos text-xs font-bold text-text-icons-base-main">
                      {t("yourMap.thematicClassColumn")}
                    </TableHead>
                    <TableHead className="font-aptos text-xs font-bold text-text-icons-base-main text-center">
                      {t("yourMap.thematicCorrectPredictions")}
                    </TableHead>
                    <TableHead className="font-aptos text-xs font-bold text-text-icons-base-main text-center">
                      {t("yourMap.thematicTotalSamples")}
                    </TableHead>
                    <TableHead className="font-aptos text-xs font-bold text-text-icons-base-main text-center">
                      {t("yourMap.thematicClassAccuracy")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((c, index) => {
                    const correct = cell(c.class_id, c.class_id);
                    const total = rowTotal(c.class_id);
                    return (
                      <TableRow key={`cm-summary-${c.class_id}`}>
                        <TableCell className="font-aptos text-sm">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-aptos text-sm">
                          {c.class_name}
                        </TableCell>
                        <TableCell className="font-aptos text-sm text-center">
                          {correct}
                        </TableCell>
                        <TableCell className="font-aptos text-sm text-center">
                          {total}
                        </TableCell>
                        <TableCell className="font-aptos text-sm text-center">
                          {total > 0 ? ((correct / total) * 100).toFixed(1) : 0}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <div className="space-y-2 mt-4">
                <p className="font-aptos text-sm font-semibold leading-5 text-text-icons-base-main">
                  {t("yourMap.thematicCommonErrorTitle")}
                </p>
                {commonError ? (
                  <div className="rounded-md bg-danger-50 px-3 py-2">
                    <p className="font-aptos text-sm font-regular leading-5 text-danger-800 text-center">
                      {t("yourMap.thematicCommonErrorCaption", {
                        A: (commonError as { actual: string }).actual,
                        B: (commonError as { predicted: string }).predicted,
                        X: (commonError as { count: number }).count,
                      })}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md bg-success-50 px-3 py-2">
                    <p className="font-aptos text-sm font-regular leading-5 text-success-700 text-center">
                      {t("yourMap.thematicMinimalErrors")}
                    </p>
                  </div>
                )}
              </div>
            </DetailSection>

            {/* Per-class accuracy metrics */}
            <DetailSection
              title={t("yourMap.thematicDetailPerClassTitle")}
              className="min-w-0"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-aptos text-xs font-bold text-text-icons-base-main">
                      {t("yourMap.thematicClassIdColumn")}
                    </TableHead>
                    <TableHead className="font-aptos text-xs font-bold text-text-icons-base-main">
                      {t("yourMap.thematicClassNameColumn")}
                    </TableHead>
                    <TableHead className="font-aptos text-xs font-bold text-text-icons-base-main text-center">
                      {t("yourMap.thematicProducerAccuracy")}
                    </TableHead>
                    <TableHead className="font-aptos text-xs font-bold text-text-icons-base-main text-center">
                      {t("yourMap.thematicUserAccuracy")}
                    </TableHead>
                    <TableHead className="font-aptos text-xs font-bold text-text-icons-base-main text-center">
                      {t("yourMap.thematicF1Score")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((c) => (
                    <TableRow key={`per-class-${c.class_id}`}>
                      <TableCell className="font-aptos text-sm">
                        {c.class_id}
                      </TableCell>
                      <TableCell className="font-aptos text-sm">
                        {c.class_name}
                      </TableCell>
                      <TableCell className="font-aptos text-sm text-center">
                        {(c.producer_accuracy * 100).toFixed(1)}
                      </TableCell>
                      <TableCell className="font-aptos text-sm text-center">
                        {(c.user_accuracy * 100).toFixed(1)}
                      </TableCell>
                      <TableCell className="font-aptos text-sm text-center">
                        {c.f1_score.toFixed(3)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DetailSection>
          </div>

          {/* Error map visualization */}
          {result.points.length > 0 && (
            <DetailSection
              title={t("yourMap.thematicDetailMapTitle")}
              forceMount
            >
              <div className="space-y-3">
                <div className="flex flex-row items-center gap-x-4">
                  <div className="flex flex-row items-center gap-x-1.5">
                    <div className="size-3 rounded-full bg-[#2ECC71] border border-white" />
                    <p className="font-aptos text-sm font-regular leading-5 text-text-icons-base-second">
                      {t("yourMap.thematicLegendCorrect")}
                    </p>
                  </div>
                  <div className="flex flex-row items-center gap-x-1.5">
                    <div className="size-3 rounded-full bg-[#E74C3C] border border-white" />
                    <p className="font-aptos text-sm font-regular leading-5 text-text-icons-base-second">
                      {t("yourMap.thematicLegendWrong")}
                    </p>
                  </div>
                </div>
                <div
                  ref={errorMapTargetRef}
                  className="w-full h-[500px] rounded-md overflow-hidden"
                />
              </div>
            </DetailSection>
          )}

          {/* Points summary + classification error detail */}
          <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 items-start">
            <div className="flex flex-col items-start p-2 gap-y-2 border-8 border-[#FFF5F8] rounded-[12px]">
              <div className="grid grid-cols-3 gap-x-8 px-2">
                <div>
                  <p className="font-aptos text-sm font-semibold leading-5 text-text-icons-base-second">
                    {t("yourMap.thematicCorrectPoints")}
                  </p>
                  <p className="font-noto-sans text-xl font-bold leading-7 text-success-700">
                    {result.n_correct}
                  </p>
                </div>
                <div>
                  <p className="font-aptos text-sm font-semibold leading-5 text-text-icons-base-second">
                    {t("yourMap.thematicWrongPoints")}
                  </p>
                  <p className="font-noto-sans text-xl font-bold leading-7 text-danger-700">
                    {wrongPoints}
                  </p>
                </div>
                <div>
                  <p className="font-aptos text-sm font-semibold leading-5 text-text-icons-base-second">
                    {t("yourMap.thematicErrorRate")}
                  </p>
                  <p className="font-noto-sans text-xl font-bold leading-7 text-text-icons-base-main">
                    {errorRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 min-w-0">
              <p className="font-aptos text-md font-bold leading-6 text-primary-pink">
                {t("yourMap.thematicErrorDetailTitle")}
              </p>
              {commonError ? (
                <div className="rounded-md bg-danger-50 px-3 py-3">
                  <p className="font-aptos text-sm font-regular leading-5 text-danger-800 text-center">
                    {t("yourMap.thematicCommonErrorCaption", {
                      A: (commonError as { actual: string }).actual,
                      B: (commonError as { predicted: string }).predicted,
                      X: (commonError as { count: number }).count,
                    })}
                  </p>
                </div>
              ) : (
                <div className="rounded-md bg-success-50 px-3 py-3">
                  <p className="font-aptos text-sm font-regular leading-5 text-success-700 text-center">
                    {t("yourMap.thematicMinimalErrors")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Downloads */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="primary"
              className="w-full"
              disabled={result.points.length === 0}
              onClick={() => {
                downloadRawData();
              }}
            >
              {t("yourMap.thematicDownloadRawData")}
            </Button>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => {
                downloadChart();
              }}
            >
              {t("yourMap.thematicDownloadChart")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
