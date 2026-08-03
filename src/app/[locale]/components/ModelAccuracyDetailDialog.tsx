"use client";

import { ReactNode, useContext, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";

// Collapsible card wrapper — same section chrome as the thematic accuracy
// detail dialog.
const DetailSection = ({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
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
      <CollapsibleContent className="pt-3">{children}</CollapsibleContent>
    </Collapsible>
  );
};

// Dataframe-style table (grey header, optional leading index column,
// bordered cells, right-aligned numbers) matching the reference design.
const DataTable = ({
  headers,
  rows,
  showIndex = false,
  headerVariant = "default",
}: {
  headers: { label: string; align?: "left" | "right" }[];
  rows: (string | number)[][];
  showIndex?: boolean;
  headerVariant?: "default" | "secondary";
}) => {
  const alignClass = (align?: "left" | "right") =>
    align === "right" ? "text-right" : "text-left";
  const headerBg =
    headerVariant === "secondary" ? "bg-[#FAEDF2]" : "bg-[#F7F8FA]";

  return (
    <div className="rounded-[8px] border border-[#E4E5EA] overflow-x-auto bg-white">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {showIndex && (
              <th
                className={cn(
                  "w-12 px-3 py-2 border-b border-r border-[#E4E5EA]",
                  headerBg,
                )}
              />
            )}
            {headers.map((h) => (
              <th
                key={h.label}
                className={cn(
                  "px-3 py-2 border-b border-r border-[#E4E5EA] last:border-r-0 font-aptos text-sm font-regular leading-5 text-[#7D8398] whitespace-nowrap",
                  headerBg,
                  alignClass(h.align),
                )}
              >
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            // eslint-disable-next-line react/no-array-index-key
            <tr key={`row-${rowIndex}`}>
              {showIndex && (
                <td className="px-3 py-2 border-b border-r border-[#EFEFF3] font-aptos text-sm font-regular leading-5 text-[#7D8398] text-right">
                  {rowIndex}
                </td>
              )}
              {row.map((cell, cellIndex) => (
                <td
                  key={`cell-${rowIndex}-${cellIndex}`}
                  className={cn(
                    "px-3 py-2 border-b border-r border-[#EFEFF3] last:border-r-0 font-aptos text-sm font-regular leading-5 text-text-icons-base-main",
                    alignClass(headers[cellIndex]?.align),
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Model accuracy detail: overall metrics, confusion-matrix heatmap, matrix
// summary, and per-class metrics — derived from the enriched model_quality
// payload of the map-generation stream. Mirrors the thematic detail dialog.
export const ModelAccuracyDetailDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const t = useTranslations("InteractivePanel");
  const { generateMapModelQuality } = useContext(MapGenerationContext);

  const quality = generateMapModelQuality?.model_quality;
  const perClass = useMemo(() => quality?.per_class ?? [], [quality]);
  const matrix = useMemo(() => quality?.confusion_matrix ?? [], [quality]);

  // The errorMatrix axes are indexed by class id 0..max; keep only indexes
  // that belong to the scheme or actually hold samples, so the tables don't
  // fill up with all-zero filler rows.
  const displayClasses = useMemo(() => {
    const kept: { class_id: number; class_name: string }[] = [];
    const size = Math.max(perClass.length, matrix.length);
    for (let i = 0; i < size; i += 1) {
      const named = perClass[i]?.class_name;
      const rowSum = matrix[i]?.reduce((a, b) => a + b, 0) ?? 0;
      const colSum = matrix.reduce((a, row) => a + (row[i] ?? 0), 0);
      if (named || rowSum > 0 || colSum > 0) {
        kept.push({ class_id: i, class_name: named ?? `Class ${i}` });
      }
    }
    return kept;
  }, [perClass, matrix]);

  if (!quality?.per_class?.length) return null;

  const cell = (actualId: number, predictedId: number) =>
    matrix[actualId]?.[predictedId] ?? 0;

  const rowTotal = (actualId: number) =>
    (matrix[actualId] || []).reduce((acc, v) => acc + v, 0);

  // Heatmap shading: white-blue -> dark navy, scaled to the largest cell.
  const maxCellValue = displayClasses.reduce(
    (acc, a) =>
      displayClasses.reduce(
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

  const classLabel = (classId: number) => {
    const entry = displayClasses.find((c) => c.class_id === classId);
    return `${classId} : ${entry?.class_name ?? `Class ${classId}`}`;
  };

  // Largest off-diagonal cells = the most common misclassifications (top 5).
  const misclassifications = displayClasses
    .flatMap((a) =>
      displayClasses
        .filter((b) => b.class_id !== a.class_id)
        .map((b) => ({
          actual: a.class_id,
          predicted: b.class_id,
          count: cell(a.class_id, b.class_id),
        })),
    )
    .filter((pair) => pair.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const downloadRawData = () => {
    const header = [
      "class_id",
      "class_name",
      "recall_producers_accuracy",
      "precision_users_accuracy",
      "f1_score",
      "gmean_score",
      "correct_predictions",
      "total_samples",
    ];
    const rows = displayClasses.map((c) => {
      const entry = perClass[c.class_id];
      return [
        c.class_id,
        c.class_name,
        entry?.recall ?? 0,
        entry?.precision ?? 0,
        entry?.f1_score ?? 0,
        entry?.gmean_score ?? 0,
        cell(c.class_id, c.class_id),
        rowTotal(c.class_id),
      ];
    });
    const csv = [header, ...rows]
      .map((row) =>
        row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "model_accuracy_raw_data.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Redraws the confusion-matrix heatmap onto a canvas and downloads a PNG.
  // Same rendering as the thematic dialog's chart download.
  const downloadChart = () => {
    const n = displayClasses.length;
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

    displayClasses.forEach((a, i) => {
      // Cells
      displayClasses.forEach((b, j) => {
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
    displayClasses.forEach((b, j) => {
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
      link.download = "model_accuracy_confusion_matrix.png";
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] sm:max-w-[1600px] max-h-[96vh] overflow-y-auto">
        <DialogTitle className="text-primary-pink font-aptos text-2xl font-bold tracking-[-0.24px] pr-8">
          {t("yourMap.modelAccuracyDetailTitle")}
        </DialogTitle>

        <div className="space-y-4">
          <div className="grid grid-cols-[210px_1fr] gap-4 items-stretch">
            {/* Overall model accuracy */}
            <DetailSection title={t("yourMap.modelOverallResultTitle")}>
              <div className="flex flex-col gap-y-8 p-5 border-8 border-[#FFF5F8] rounded-[12px]">
                <div>
                  <p className="font-aptos text-sm font-semibold leading-5 text-text-icons-base-second">
                    {t("yourMap.overallAccuracy")}
                  </p>
                  <p className="font-noto-sans text-xl font-bold leading-7 text-success-700">
                    {quality.overall_accuracy.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="font-aptos text-sm font-semibold leading-5 text-text-icons-base-second">
                    {t("yourMap.kappaCoefficient")}
                  </p>
                  <p className="font-noto-sans text-xl font-bold leading-7 text-success-700">
                    {quality.kappa.toFixed(3)}
                  </p>
                </div>
                <div>
                  <p className="font-aptos text-sm font-semibold leading-5 text-text-icons-base-second">
                    {t("yourMap.averageF1Score")}
                  </p>
                  <p className="font-noto-sans text-xl font-bold leading-7 text-success-700">
                    {quality.average_f1_score.toFixed(3)}
                  </p>
                </div>
                <div>
                  <p className="font-aptos text-sm font-semibold leading-5 text-text-icons-base-second">
                    {t("yourMap.gMeanScore")}
                  </p>
                  <p className="font-noto-sans text-xl font-bold leading-7 text-success-700">
                    {quality.gmean_score.toFixed(3)}
                  </p>
                </div>
              </div>
            </DetailSection>

            {/* Class-level accuracy metrics */}
            <DetailSection
              title={t("yourMap.classLevelAccuracy")}
              className="min-w-0"
            >
              <div className="space-y-3">
                <p className="font-aptos text-sm font-regular leading-5 text-neutral-700">
                  {t("yourMap.classLevelAccuracyIntro")}
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-2">
                  <ul className="list-disc pl-5">
                    <li className="font-aptos text-sm font-regular leading-5 text-neutral-700">
                      {t.rich("yourMap.classLevelRecallBullet", {
                        b: (chunks) => (
                          <b className="font-semibold">{chunks}</b>
                        ),
                      })}
                    </li>
                  </ul>
                  <ul className="list-disc pl-5">
                    <li className="font-aptos text-sm font-regular leading-5 text-neutral-700">
                      {t.rich("yourMap.classLevelPrecisionBullet", {
                        b: (chunks) => (
                          <b className="font-semibold">{chunks}</b>
                        ),
                      })}
                    </li>
                  </ul>
                </div>
                <DataTable
                  showIndex
                  headers={[
                    { label: t("yourMap.detailClassId"), align: "right" },
                    { label: t("yourMap.detailClassName") },
                    { label: t("yourMap.recallHeader"), align: "right" },
                    { label: t("yourMap.precisionHeader"), align: "right" },
                    { label: t("yourMap.f1Header"), align: "right" },
                    { label: t("yourMap.gmeanHeader"), align: "right" },
                  ]}
                  rows={displayClasses.map((c) => {
                    const entry = perClass[c.class_id];
                    return [
                      c.class_id,
                      c.class_name,
                      ((entry?.recall ?? 0) * 100).toFixed(1),
                      ((entry?.precision ?? 0) * 100).toFixed(1),
                      ((entry?.f1_score ?? 0) * 100).toFixed(1),
                      ((entry?.gmean_score ?? 0) * 100).toFixed(1),
                    ];
                  })}
                />
              </div>
            </DetailSection>
          </div>

          {/* Error matrix summary: three tables, mirroring LumaLite's
              "Ringkasan Matriks Kesalahan" section. */}
          <DetailSection
            title={t("yourMap.errorMatrixSummary")}
            className="min-w-0"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                {/* Table 1: per-class summary from the matrix */}
                <div className="space-y-1.5 min-w-0">
                  <p className="font-aptos text-sm font-semibold leading-5 text-text-icons-base-main">
                    {t("yourMap.classLevelSummary")}
                  </p>
                  <DataTable
                    showIndex
                    headerVariant="secondary"
                    headers={[
                      { label: t("yourMap.thematicClassColumn") },
                      {
                        label: t("yourMap.thematicCorrectPredictions"),
                        align: "right",
                      },
                      {
                        label: t("yourMap.thematicTotalSamples"),
                        align: "right",
                      },
                      {
                        label: t("yourMap.thematicClassAccuracy"),
                        align: "right",
                      },
                    ]}
                    rows={displayClasses.map((c) => {
                      const correct = cell(c.class_id, c.class_id);
                      const total = rowTotal(c.class_id);
                      return [
                        c.class_name,
                        correct,
                        total,
                        total > 0 ? ((correct / total) * 100).toFixed(1) : 0,
                      ];
                    })}
                  />
                </div>

                {/* Table 2: most common misclassifications (top 5) */}
                <div className="space-y-1.5 min-w-0">
                  <p className="font-aptos text-sm font-semibold leading-5 text-text-icons-base-main">
                    {t("yourMap.commonMisclassifications")}
                  </p>
                  {misclassifications.length > 0 ? (
                    <DataTable
                      showIndex
                      headerVariant="secondary"
                      headers={[
                        { label: t("yourMap.actualHeader") },
                        { label: t("yourMap.predictedHeader") },
                      ]}
                      rows={misclassifications.map((pair) => [
                        classLabel(pair.actual),
                        classLabel(pair.predicted),
                      ])}
                    />
                  ) : (
                    <div className="rounded-md bg-success-50 px-3 py-2">
                      <p className="font-aptos text-sm font-regular leading-5 text-success-700 text-center">
                        {t("yourMap.thematicMinimalErrors")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Table 3: per-class recall/F1/G-mean, full width */}
              <DataTable
                showIndex
                headerVariant="secondary"
                headers={[
                  { label: t("yourMap.detailClassId"), align: "right" },
                  { label: t("yourMap.detailClassName") },
                  { label: t("yourMap.recallHeader"), align: "right" },
                  { label: t("yourMap.f1Header"), align: "right" },
                  { label: t("yourMap.gmeanHeader"), align: "right" },
                ]}
                rows={displayClasses.map((c) => {
                  const entry = perClass[c.class_id];
                  return [
                    c.class_id,
                    c.class_name,
                    ((entry?.recall ?? 0) * 100).toFixed(1),
                    ((entry?.f1_score ?? 0) * 100).toFixed(1),
                    ((entry?.gmean_score ?? 0) * 100).toFixed(1),
                  ];
                })}
              />
            </div>
          </DetailSection>

          {/* Confusion matrix heatmap */}
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
                      {displayClasses.map((a) => (
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
                          {displayClasses.map((b) => {
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
                        {displayClasses.map((b) => (
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

          {/* Downloads */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="primary"
              className="w-full"
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
