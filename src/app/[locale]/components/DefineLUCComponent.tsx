"use client";

import { ComingSoon } from "@/components/ComingSoon";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { cn, shortenKiloByte, svgWithColor } from "@/lib/utils";
import {
  ChevronDown,
  ChevronLeft,
  FileTextIcon,
  PlusIcon,
  SquarePenIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { ChangeEvent, useContext, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  LucCustomTab,
  MapGenerationContext,
} from "@/contexts/mapGenerationContext";
import {
  DEFAULT_LUC,
  LUC_TEMPLATE_FILE_SIZE_LIMIT,
  LUC_TEMPLATE_FILENAME,
  LUC_UPDATE_URL,
  LUC_UPLOAD_URL,
  LULC_CLASS_COLOR_PALETTE,
  PANEL_COMPONENT_KEY,
  POINTING_TYPE
} from "@/constants";
import { Label } from "@/components/ui/label";
import { GlobalContext } from "@/contexts/globalContext";
import { toast } from "sonner";
import { Marker } from "@/types/marker";
import Feature from "ol/Feature";
import { Point } from "ol/geom";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import { MapContext } from "@/contexts/mapContext";
import { fromLonLat } from "ol/proj";

// const TreeBorderContainer = ({ children }: { children: React.ReactNode }) => {
//   return (
//     <div className="flex flex-row border-l pt-4  gap-x-[5px]">
//       <TreeBorder />
//       {children}
//     </div>
//   );
// };

// const TreeBorder = () => {
//   return (
//     <div className="grid grid-rows-2 w-[20px]">
//       <div className="border-b"></div>
//       <div className=""></div>
//     </div>
//   );
// };

// Fallback palette for auto-assigning a color to a new Quick Table row.
// Auto-assigned colors for new rows, cycled in order.
const QUICK_TABLE_COLORS = [
  "#EFC6D5",
  "#CC4778",
  "#FB7C54",
  "#FBC12D",
  "#A2A9F1",
  "#8E9231",
  "#00DF82",
  "#015F4D",
  "#043DCD",
  "#0372FF",
];

export const DefineLUCComponent = () => {
  const t = useTranslations("InteractivePanel");

  const {
    defaultArray,
    selectedDefault,
    selectedCustom,
    lucQuickRows,
    lucCustomTab,
    lucQuickPhase,
    isLUCLoading,
    setLucQuickRows,
    setLucCustomTab,
    setLucQuickPhase,
    setLucExcelConfirmed,
    setIsLUCLoading,
    LUCfile,
    spatialResolution,
    LUCfilename,
    LUCfilesize,
    setDefaultArray,
    setLUCFile,
    setLUCFilename,
    setLUCFilesize,
    haveDownloadedFile,
    setHaveDownloadedFile,
    setIsDefineLULCChanged,
    setClassArray,
    setPointingType,
    setSelectedClass,
    setQuickManualSampling
  } = useContext(MapGenerationContext);

  const {
    markerArray,
    setMarkerArray,
    markerLayerVisibilityArray,
    setMarkerLayerVisibilityArray,
    markerVectorSource,
    setPointingType: setMapPointingType,
  } = useContext(MapContext);

  const { sessionId } = useContext(GlobalContext);

  // const [aiAccordionOpen, setAIAccordionOpen] = useState(false);
  const [fileEnter, setFileEnter] = useState(false);
  // Quick Table flow phases. "locked" freezes rows (read-only); "confirmed"
  // swaps to the read-only Recorded LULC Feature summary and enables Next.
  const isQuickLocked = lucQuickPhase === "locked";
  const isQuickConfirmed = lucQuickPhase === "confirmed";

  // The table starts read-only; the pencil button above it toggles edit mode
  // (row inputs + per-row delete + add row).
  const [isQuickTableEditing, setIsQuickTableEditing] = useState(false);
  const canEditQuickRows = isQuickTableEditing && !isQuickLocked;

  // Which row's color-palette popover is open (row id), if any.
  const [colorPopoverRowId, setColorPopoverRowId] = useState<string | null>(
    null,
  );

  // Once confirmed, the tabs are replaced by the read-only Recorded LULC
  // Feature summary and Next is enabled.
  const isConfirmed = isQuickConfirmed;
  const summaryRows: { classId: string; name: string; color: string }[] =
    lucQuickRows.map((r) => ({
      classId: r.classId,
      name: r.name,
      color: r.color,
    }));

  // Re-render the marker layer, omitting any class whose name is in the
  // hidden list. Mirrors LUCClassTable so the eye toggle behaves the same
  // wherever markers exist on the map.
  const rerenderMarkers = (hiddenClassNames: string[]) => {
    if (!markerVectorSource) return;
    markerVectorSource.clear();

    markerArray.forEach((item) => {
      if (hiddenClassNames.includes(item.name)) return;
      const markerFeature = new Feature({
        geometry: new Point(item.coordinates),
        id: item.id,
      });
      markerFeature.setStyle(
        new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src: svgWithColor(item.class_color),
            size: [92, 117],
            height: 30,
          }),
        }),
      );
      markerVectorSource.addFeature(markerFeature);
    });
    markerVectorSource.changed();
  };

  // Duplicate class names (case-insensitive, trimmed) — flagged inline and
  // block the Next button in DefineLUCFooter.
  const quickDuplicateNames = (() => {
    const counts = new Map<string, number>();
    lucQuickRows.forEach((r) => {
      const key = r.name.trim().toLowerCase();
      if (!key) return;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return counts;
  })();

  const isQuickRowDuplicate = (name: string) => {
    const key = name.trim().toLowerCase();
    return key !== "" && (quickDuplicateNames.get(key) ?? 0) > 1;
  };


  // Only allow locking/confirming a Quick Table with at least one named row
  // and no duplicate names, so a confirmed table always yields a valid submit.
  const hasQuickDuplicates = Array.from(quickDuplicateNames.values()).some(
    (count) => count > 1,
  );
  const canLockQuick =
    lucQuickRows.some((r) => r.name.trim() !== "") && !hasQuickDuplicates;

  const addQuickRow = () => {
    setIsDefineLULCChanged(true);
    setLucQuickRows((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        classId: "",
        name: "",
        color: QUICK_TABLE_COLORS[prev.length % QUICK_TABLE_COLORS.length],
      },
    ]);
  };

  const updateQuickRow = (id: string, patch: Partial<QuickTableRow>) => {
    setIsDefineLULCChanged(true);
    setLucQuickRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );
  };

  const removeQuickRow = (id: string) => {
    setIsDefineLULCChanged(true);
    setLucQuickRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Upload + parse the excel template, then load the parsed classes straight
  // into the editable Quick Table so the user can still tweak / add rows.
  const importExcel = (file: File) => {
    setIsDefineLULCChanged(true);
    setIsLUCLoading(true);

    const body = new FormData();
    body.append("file", file);
    body.append("session_id", sessionId);

    fetch(LUC_UPLOAD_URL, {
      method: "POST",
      body,
    })
      .then(async (response) => {
        const json: LUCUploadRes = await response.json();

        if (!response.ok) {
          throw new Error(
            JSON.stringify(
              `${json?.error?.message || response.text}. Trace: ${json?.trace}`,
            ),
          );
        }

        // Merge with whatever is already in the table (e.g. manual input):
        // uploaded classes get IDs continuing after the current highest ID.
        setLucQuickRows((prev) => {
          const maxId = prev.reduce((acc, r) => {
            const n = parseInt(r.classId, 10);
            return Number.isFinite(n) && n > acc ? n : acc;
          }, 0);

          const uploadedRows: QuickTableRow[] = json.classes.map(
            (item, index) => ({
              id: crypto.randomUUID(),
              classId: String(maxId + index + 1),
              name: item.class_name,
              color: item.class_color,
            }),
          );

          return [...prev, ...uploadedRows];
        });
        setLucQuickPhase("editing");
        setLUCFile(file);
        setLUCFilename(file.name);
        setLUCFilesize(file.size);
      })
      .catch((e) => {
        toast.error(`Error on reading file: ${e}`, {
          duration: Infinity,
          dismissible: true,
          closeButton: true,
        });
      })
      .finally(() => {
        setIsLUCLoading(false);
      });
  };

  const onClickDownloadFile = () => {
    const link = document.createElement("a");
    link.href = "/csvs/" + LUC_TEMPLATE_FILENAME;
    // Set the download attribute with the desired filename
    link.download = LUC_TEMPLATE_FILENAME;

    // Append link to body, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setHaveDownloadedFile(true);
  };

  const onToggleSwitch = (num: number, checked: boolean) => {
    setIsDefineLULCChanged(true);

    if (!checked) {
      setDefaultArray(defaultArray.filter((item) => item !== num));
      return;
    }
    // if (defaultArray.includes(num)) {
    //   setDefaultArray(defaultArray.filter((item) => item !== num));
    //   return;
    // }

    setDefaultArray([...defaultArray, num]);
  };

  const clearFile = () => {
    setIsDefineLULCChanged(true);
    setLUCFile(null);
    setLUCFilename("");
    setLUCFilesize(0);
    setLucExcelConfirmed(false);

    const doc = document.getElementById(
      "luc-template-file-upload",
    ) as HTMLInputElement;
    if (!doc) return;

    doc.value = "";
  };

  const onResetInput = () => {
    setIsDefineLULCChanged(true);
    setDefaultArray([]);
    setLucQuickRows([]);
    setLucCustomTab("quick");
    setLucQuickPhase("editing");
    setHaveDownloadedFile(false);

    setMarkerLayerVisibilityArray([]);
    setMarkerArray([]);
    markerVectorSource?.clear();

    setClassArray([]);
    setPointingType(POINTING_TYPE.EMPTY);
    setMapPointingType(POINTING_TYPE.EMPTY);
    setSelectedClass("");
    setQuickManualSampling(false)
    clearFile();
  };

  const onUploadFile = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.target;
    const files = target?.files;

    if (!files) return;

    const file = files[0];
    if (!file) return;

    importExcel(file);

    // Allow re-selecting the same file later (onChange won't fire otherwise).
    target.value = "";
  };

  const submitFile = () => {};

  // Clears the uploaded file AND the parsed rows, returning the Excel tab to
  // the dropzone — the preview card's trash button is a "start over".
  const clearUploadedTemplate = () => {
    setIsDefineLULCChanged(true);
    setLUCFile(null);
    setLUCFilename("");
    setLUCFilesize(0);
    setLucQuickRows([]);
    setLucQuickPhase("editing");
    setLucExcelConfirmed(false);

    setMarkerLayerVisibilityArray([]);
    setMarkerArray([]);
    markerVectorSource?.clear();

    const doc = document.getElementById(
      "luc-template-file-upload",
    ) as HTMLInputElement;
    if (doc) doc.value = "";
  };

  // The editable class table (rows + add/lock/confirm controls). Shared by the
  // Manual Input tab and the Excel Template tab (rendered beneath the preview
  // card there) so the two views stay in sync without duplicating JSX.
  const renderQuickTable = () => (
    <>
      <div className="space-y-2">
        {lucQuickRows.length > 0 && (
          <div className="flex flex-row items-center justify-between">
            <p className="font-aptos text-md font-semibold leading-6 text-text-icons-base-second">
              {t("defineLUC.classRecordedCount", { X: lucQuickRows.length })}
            </p>
            <Button
              variant={"ghost"}
              size={"icon"}
              disabled={isQuickLocked}
              className={cn(
                "p-0 hover:brightness-95 cursor-pointer size-7 rounded-md",
                isQuickTableEditing && "bg-primary-pink-hover",
              )}
              onClick={() => setIsQuickTableEditing((prev) => !prev)}
            >
              <SquarePenIcon className="text-primary-red-pink-normal size-4" />
            </Button>
          </div>
        )}
      <div className="rounded-[12px] border border-neutral-400 overflow-hidden">
        <div className="flex bg-[#FAEDF2] border-b border-neutral-300 text-xs">
          <div className="w-[75px] shrink-0 px-1 py-0.5 flex items-center justify-center">
            <p className="font-aptos text-md font-bold leading-6 text-text-icons-base-main text-center">
              {t("defineLUC.idClassHeader")}
            </p>
          </div>
          <div className="w-[160px] flex-1 px-1 py-0.5 border-l border-neutral-300 flex items-center justify-center">
            <p className="font-aptos text-md font-bold leading-6 text-text-icons-base-main text-center">
              {t("defineLUC.lulcClassHeader")}
            </p>
          </div>
          <div className="w-[160px] shrink-0 px-1 py-0.5 border-l border-neutral-300 flex items-center justify-center">
            <p className="font-aptos text-md font-bold leading-6 text-text-icons-base-main text-center whitespace-nowrap">
              {t("defineLUC.colorClassHeader")}
            </p>
          </div>
          {canEditQuickRows && (
            <div className="w-6 shrink-0 border-l border-neutral-300" />
          )}
        </div>

        {lucQuickRows.length === 0 && (
          <div className="px-3 py-3">
            <p className="font-aptos text-md font-regular leading-6 text-neutral-500 text-center text-sm">
              {t("defineLUC.quickTableEmptyHint")}
            </p>
          </div>
        )}

        {lucQuickRows.map((row) => {
          const duplicate = isQuickRowDuplicate(row.name);
          return (
            <div
              key={row.id}
              className="flex border-b border-neutral-200 last:border-b-0"
            >
              <div className="w-[75px] shrink-0 px-1 py-0.5 flex items-center justify-center">
                <Input
                  value={row.classId}
                  inputMode="numeric"
                  readOnly={!canEditQuickRows}
                  className="h-7 text-center"
                  onChange={(e) =>
                    updateQuickRow(row.id, {
                      classId: e.target.value,
                    })
                  }
                />
              </div>
              <div className="w-[160px] flex-1 px-1 py-0.5 border-l border-neutral-200 flex flex-col justify-center">
                <Input
                  value={row.name}
                  aria-invalid={duplicate}
                  readOnly={!canEditQuickRows}
                  className="max-w-[231px] h-7"
                  onChange={(e) =>
                    updateQuickRow(row.id, { name: e.target.value })
                  }
                />
                {duplicate && (
                  <p className="mt-1 font-aptos text-xs font-regular leading-4 text-danger-600">
                    {t("defineLUC.duplicateClassError")}
                  </p>
                )}
              </div>
              <div className="w-[160px] shrink-0 px-1 py-0.5 border-l border-neutral-200 flex items-center justify-start pl-6 gap-x-2">
                <Popover
                  open={colorPopoverRowId === row.id}
                  onOpenChange={(isOpen) => {
                    setColorPopoverRowId(isOpen ? row.id : null);
                  }}
                >
                  <PopoverTrigger asChild disabled={!canEditQuickRows}>
                    <button
                      type="button"
                      className={cn(
                        "size-7 shrink-0 rounded-md border border-neutral-300",
                        !canEditQuickRows
                          ? "cursor-default"
                          : "cursor-pointer hover:brightness-95 transition-all duration-200",
                      )}
                      style={{ backgroundColor: row.color }}
                    />
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-auto p-4 space-y-3 rounded-[12px]"
                  >
                    <p className="font-aptos text-md font-bold leading-6 text-text-icons-base-main">
                      {t("defineLUC.selectClassColor")}
                    </p>
                    <div className="grid grid-cols-7 gap-2">
                      {LULC_CLASS_COLOR_PALETTE.map((color) => (
                        <button
                          key={`palette-${row.id}-${color}`}
                          type="button"
                          className={cn(
                            "size-9 rounded-md cursor-pointer hover:brightness-95 transition-all duration-200",
                            row.color.toLowerCase() === color.toLowerCase()
                              ? "ring-2 ring-primary-pink ring-offset-1"
                              : "border border-neutral-200",
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => {
                            updateQuickRow(row.id, { color });
                            setColorPopoverRowId(null);
                          }}
                        />
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                <p className="font-aptos text-sm font-regular leading-5 text-text-icons-base-main uppercase">
                  {row.color.replace(/^#/, "")}
                </p>
              </div>
              {canEditQuickRows && (
                <div className="w-6 shrink-0 border-l border-neutral-200 flex items-center justify-center">
                  <Button
                    variant={"ghost"}
                    size={"icon"}
                    className="p-0 hover:brightness-95 cursor-pointer size-7 rounded-full"
                    onClick={() => removeQuickRow(row.id)}
                  >
                    <Trash2Icon className="text-text-icons-base-third size-4" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}

        {lucQuickRows.length > 0 && canEditQuickRows && (
          <button
            type="button"
            onClick={addQuickRow}
            className="w-full flex flex-row items-center justify-center gap-x-1.5 py-2.5 border-t border-neutral-200 hover:brightness-95 transition-all duration-200 cursor-pointer"
          >
            <PlusIcon className="size-4 text-primary-red-pink-normal" />
            <p className="font-aptos text-[13px] font-semibold leading-4.5 text-primary-red-pink-normal">
              {t("defineLUC.addClass")}
            </p>
          </button>
        )}
      </div>
      </div>

      {lucQuickRows.length === 0 ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => {
              // First row: drop straight into edit mode.
              setIsQuickTableEditing(true);
              addQuickRow();
            }}
            className="flex flex-row items-center justify-center gap-x-1.5 w-[200px] h-7 rounded-[12px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:brightness-95 transition-all duration-200 cursor-pointer"
          >
            <PlusIcon className="size-4 text-primary-red-pink-normal" />
            <p className="font-aptos text-[13px] font-semibold leading-4.5 text-primary-red-pink-normal">
              {t("defineLUC.addClass")}
            </p>
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={!isQuickLocked && !canLockQuick}
          onClick={() => {
            const nextPhase = isQuickLocked ? "confirmed" : "locked";
            setLucQuickPhase(nextPhase);
            setIsQuickTableEditing(false);
            // The excel flow gates Next on lucExcelConfirmed; both flows now
            // confirm through this same Lock -> Confirm button.
            setLucExcelConfirmed(nextPhase === "confirmed");
          }}
          className="w-full py-3 rounded-[12px] bg-primary-red-pink-normal hover:brightness-95 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100"
        >
          <p className="font-lato text-md font-bold leading-6 text-white text-center">
            {isQuickLocked
              ? t("defineLUC.confirmLULCClass")
              : t("defineLUC.lockLULCClass")}
          </p>
        </button>
      )}
    </>
  );

  // Compact file-preview card shown atop the parsed table after a successful
  // upload. On the editable Excel tab it's removable (trash clears the file +
  // parsed rows); on the read-only confirmed summary it's display-only.
  const renderUploadedTemplateCard = ({ removable = true } = {}) => (
    <div className="px-3 py-3 rounded-[12px] border-2 border-dashed border-secondary-purple-light-active grid grid-cols-12 gap-x-4 items-center bg-purple-second">
      <div
        className={cn(
          "flex flex-row items-center gap-x-4",
          removable ? "col-span-10" : "col-span-12",
        )}
      >
        <div className="rounded-[12px] bg-secondary-purple-light-hover aspect-square size-18 flex justify-center items-center">
          <FileTextIcon className="text-secondary-purple-dark size-12 aspect-square" />
        </div>
        <div className="min-w-0">
          <p className="overflow-hidden text-ellipsis whitespace-nowrap font-aptos text-lg font-bold leading-7 text-secondary-purple-dark">
            {LUCfilename}
          </p>
          <p className="font-aptos text-sm font-regular leading-5 text-secondary-purple-dark">
            {shortenKiloByte(LUCfilesize)}
          </p>
        </div>
      </div>

      {removable && (
        <div className="col-span-2 flex flex-row justify-end">
          <Button
            variant={"ghost"}
            className="hover:brightness-95 cursor-pointer size-7 rounded-full"
            onClick={clearUploadedTemplate}
          >
            <Trash2Icon className="text-secondary-purple-dark size-5" />
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/*
      <Collapsible open={aiAccordionOpen} onOpenChange={setAIAccordionOpen}>
        <div
          className="bg-aneh p-px rounded-[13px]"
          style={{
            boxShadow:
              "0 4px 4px 0 rgba(243, 235, 126, 0.25), 0 2px 8px 0 rgba(249, 245, 195, 0.29)",
          }}
        >
          <div className="bg-white p-3 h-fit rounded-[12px]">
            <CollapsibleTrigger className="flex flex-row justify-between items-center w-full mb-3">
              <div className="flex flex-row space-x-2 items-center">
                <div className="w-fit p-2 rounded-sm border border-primary-300">
                  <Image
                    src="/images/shimmer.svg"
                    unoptimized
                    alt="Draw"
                    width={16}
                    height={16}
                    className="object-contain h-4 w-auto text-primary-500"
                  />
                </div>
                <p className="text-l-bold">{t("defineLUC.tryAI")}</p>
              </div>

              <ChevronDown
                className={cn(
                  "h-5 w-5 text-text-icons-base-main transition-transform duration-200",
                  aiAccordionOpen ? "rotate-180" : "",
                )}
              />
            </CollapsibleTrigger>
            <div className="rounded-sm bg-background-disableds p-2">
              <ComingSoon />

              {!aiAccordionOpen && (
                <p className="font-aptos text-[15px] font-regular leading-5.5 text-neutrals-600 italic mt-3">
                  {t("defineLUC.tryAITagline")}
                </p>
              )}

              <CollapsibleContent className="collapsible-content-primitive mt-2">
                <div className="space-y-2">
                  <div>
                    <p className="text-m-medium italic">
                      {t("defineLUC.tryAICaption")}{" "}
                      <b className="font-extrabold">
                        {t("defineLUC.tryAICaptionCont")}
                      </b>
                    </p>
                  </div>
                  <div>
                    <Textarea
                      className="m-0"
                      defaultValue={t("defineLUC.tryAICaptionDefaultValue")}
                      disabled
                    />
                  </div>
                  <div className="flex flex-row justify-between items-center space-y-2">
                    <p className="text-xs-regular text-neutrals-600 m-0">
                      {t("defineLUC.tryAICaptionInstruction")}
                    </p>
                    <Button
                      type="button"
                      variant={"primary"}
                      disabled
                      // className="rounded-none bg-primary-pink py-1.5 px-2"
                    >
                      <p className="">
                        {t("defineLUC.tryAICaptionSubmitButtonLabel")}
                      </p>
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </div>
        </div>
      </Collapsible>
          */}
      <div className="rounded-[12px] bg-white p-3 border border-neutral-400 space-y-6">
        <div className="space-y-3">
          <p className="font-aptos text-xl font-bold leading-6 text-text-icons-base-main">
            {t("defineLUC.LUCHierarchy")}
          </p>
          <p className="font-aptos text-md font-regular leading-6 text-neutral-700-baru">
            {t("defineLUC.LUCHierarchyDescription")}
          </p>
        </div>
        {/* <div className="space-y-3"> */}
        {isConfirmed ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex flex-row items-center justify-between">
                <p className="font-aptos text-md font-semibold leading-6 text-text-icons-base-second">
                  {t("defineLUC.classRecordedCount", { X: summaryRows.length })}
                </p>
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  className="p-0 hover:brightness-95 cursor-pointer size-7 rounded-md"
                  onClick={() => {
                    // Back to the editable table so rows can be adjusted;
                    // Next locks again until the user re-confirms.
                    setLucQuickPhase("editing");
                    setLucExcelConfirmed(false);
                    setIsQuickTableEditing(true);
                  }}
                >
                  <SquarePenIcon className="text-primary-red-pink-normal size-4" />
                </Button>
              </div>
              <div className="rounded-[12px] border border-neutral-400 overflow-hidden">
                <div className="flex bg-[#FAEDF2] border-b border-neutral-300">
                  <div className="w-[75px] shrink-0 px-1 py-2 flex items-center justify-center">
                    <p className="font-aptos text-md font-bold leading-6 text-text-icons-base-main text-center">
                      {t("defineLUC.noColumnHeader")}
                    </p>
                  </div>
                  <div className="flex-1 px-1 py-2 border-l border-neutral-300 flex items-center justify-center">
                    <p className="font-aptos text-md font-bold leading-6 text-text-icons-base-main text-center">
                      {t("defineLUC.lulcClassHeader")}
                    </p>
                  </div>
                  <div className="w-[160px] shrink-0 px-1 py-2 border-l border-neutral-300 flex items-center justify-center">
                    <p className="font-aptos text-md font-bold leading-6 text-text-icons-base-main text-center whitespace-nowrap">
                      {t("defineLUC.colorClassHeader")}
                    </p>
                  </div>
                </div>
                {summaryRows.map((row, index) => (
                  <div
                    key={`${row.classId}-${index}`}
                    className="flex border-b border-neutral-200 last:border-b-0"
                  >
                    <div className="w-[75px] shrink-0 px-1 py-2 flex items-center justify-center">
                      <p className="font-aptos text-sm font-regular leading-5 text-text-icons-base-main text-center">
                        {index + 1}
                      </p>
                    </div>
                    <div className="flex-1 px-1 py-2 border-l border-neutral-200 flex items-center justify-center">
                      <p className="font-aptos text-sm font-regular leading-5 text-text-icons-base-main text-center">
                        {row.name}
                      </p>
                    </div>
                    <div className="w-[160px] shrink-0 px-1 py-2 border-l border-neutral-200 flex items-center justify-start pl-6 gap-x-2">
                      <span
                        className="size-7 shrink-0 rounded-md border border-neutral-300"
                        style={{ backgroundColor: row.color }}
                      />
                      <p className="font-aptos text-sm font-regular leading-5 text-text-icons-base-main uppercase">
                        {row.color.replace(/^#/, "")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {LUCfilename && renderUploadedTemplateCard({ removable: false })}
          </div>
        ) : (
          <Tabs
            defaultValue={
              selectedCustom ? "custom" : selectedDefault ? "default" : "custom"
            }
            className="gap-y-6 mb-0"
          >
          <div className="px-0 py-0">
            <TabsList className="w-full">
              <TabsTrigger disabled={selectedDefault} value="custom">
                {t("defineLUC.classifyOwnTemplate")}
              </TabsTrigger>
              <TabsTrigger
                disabled={selectedCustom || spatialResolution !== "100"}
                value="default"
              >
                {t("defineLUC.useDefaultScheme")}
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="custom">
            <Tabs
              value={lucCustomTab}
              onValueChange={(value) => setLucCustomTab(value as LucCustomTab)}
              className="gap-y-6 mb-0"
            >
              <div className="px-0 py-0">
                <TabsList
                  variant="line"
                  className="w-full border-0 bg-transparent p-0 rounded-none"
                >
                  <TabsTrigger
                    value="quick"
                    className="text-[#4A5468] data-[state=active]:text-[#CC4778] after:bg-[#CC4778]"
                  >
                    {t("defineLUC.quickTableTab")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="excel"
                    className="text-[#4A5468] data-[state=active]:text-[#CC4778] after:bg-[#CC4778]"
                  >
                    {t("defineLUC.excelTemplateTab")}
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="quick">
                <div className="space-y-6">
                  <p className="font-aptos text-md font-regular leading-6 text-neutral-700-baru">
                    {t("defineLUC.quickTableDescription")}
                  </p>
                  {renderQuickTable()}
                </div>
              </TabsContent>

              <TabsContent value="excel">
            <div className="space-y-6">
              <p className="font-aptos text-md font-regular leading-6 text-neutral-700-baru">
                {t("defineLUC.classifyOwnTemplateDescription")}
              </p>
              {haveDownloadedFile &&
                (LUCfile ? (
                  <>
                    {renderUploadedTemplateCard()}
                    {renderQuickTable()}
                  </>
                ) : (
                    <div
                      className={cn(
                        "p-4 border-2 border-dashed border-secondary-purple-light-hover rounded-[12px] space-y-4 transition-all duration-200 relative",
                        "min-h-40.5",
                        fileEnter && "border-primary-red-pink-normal",
                      )}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setFileEnter(true);
                      }}
                      onDragLeave={(e) => {
                        setFileEnter(false);
                      }}
                      onDragEnd={(e) => {
                        e.preventDefault();
                        setFileEnter(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setFileEnter(false);
                        if (e.dataTransfer.items) {
                          [...e.dataTransfer.items].forEach((item, i) => {
                            if (item.kind === "file") {
                              const file = item.getAsFile();
                              if (file) {
                                importExcel(file);
                              }
                              // console.log(`items file[${i}].name = ${file?.name}`);
                            }
                          });
                        } else {
                          // [...e.dataTransfer.files].forEach((file, i) => {
                          //   console.log(`… file[${i}].name = ${file.name}`);
                          // });
                        }
                      }}
                    >
                      {!fileEnter && (
                        <>
                          <div className="space-y-3">
                            <UploadIcon className="size-8 aspect-square text-text-icons-base-third mx-auto" />
                            <p className="font-aptos text-[13px] font-regular leading-4.5 text-neutrals-600 text-center">
                              {/* Drag & drop your file here to upload. <br />
                              Accepted format .csv, .xls, .xlsx */}
                              {t("defineLUC.dragAndDrop")} <br />
                              {t("defineLUC.acceptedFormat", {
                                X: ".csv, .xls, .xlsx",
                              })}
                            </p>
                          </div>
                          <Label
                            htmlFor="luc-template-file-upload"
                            className="w-50 mx-auto flex flex-row justify-center mb-0"
                          >
                            <div className="rounded-[12px] bg-primary-pink-hover hover:bg-primary-pink-hover hover:brightness-95 cursor-pointer w-full py-1.5 px-2 transition-all duration-200">
                              <p className="font-aptos text-[13px] font-semibold leading-4.5 text-primary-red-pink-normal text-center">
                                {t("defineLUC.browseFile")}
                              </p>
                            </div>
                          </Label>
                        </>
                      )}

                      {fileEnter && (
                        <>
                          <div className="absolute flex flex-col items-center justify-center gap-y-3 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <UploadIcon className="size-8 aspect-square text-primary-pink mx-auto" />
                            <p className="font-aptos text-[13px] font-regular leading-4.5 text-primary-pink text-center">
                              {t("defineLUC.useDefaultSchemeDescription")}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
              {!haveDownloadedFile && !LUCfile && (
                <>
                  <Button
                    variant={"secondary"}
                    className="w-full py-1.5 px-2 text-[13px] font-semibold leading-4.5"
                    onClick={() => {
                      // setHaveDownloadedFile(true);
                      onClickDownloadFile();
                    }}
                  >
                    {t("defineLUC.downloadFile")}
                  </Button>
                </>
              )}
              {isLUCLoading && (
                <div className="w-full flex flex-row justify-center items-center py-2">
                  <span className="loader md"></span>
                </div>
              )}
            </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
          <TabsContent value="default">
            <div className="space-y-6">
              <p className="font-aptos text-md font-regular leading-6 text-neutral-700-baru">
                {t("defineLUC.useDefaultSchemeDescription")}
              </p>
              <div className="space-y-5">
                <Accordion type="multiple">
                  <AccordionItem value="vegetation-acc">
                    <div className="flex flex-row items-center justify-between">
                      <div className="flex flex-row items-center space-x-2.5">
                        {/* <Switch /> */}
                        <p className="text-l-semibold text-muted-foreground">
                          {t("defineLUC.vegetation")}
                        </p>
                      </div>
                      <AccordionTrigger className="p-2"></AccordionTrigger>
                    </div>
                    <AccordionContent className="pl-[25px] mt-0 pb-0 pt-4 space-y-5">
                      <Accordion type="multiple">
                        <AccordionItem value="tree-based-system-acc">
                          <div className="flex flex-row items-center justify-between">
                            <div className="flex flex-row items-center space-x-2.5">
                              {/* <Switch /> */}
                              <p className="text-l-medium text-muted-foreground">
                                {t("defineLUC.treeBasedSystem")}
                              </p>
                            </div>
                            <AccordionTrigger className="p-2"></AccordionTrigger>
                          </div>
                          <AccordionContent className="pl-[25px] mt-0 pb-0 pt-4 space-y-5">
                            {/* <div className="flex flex-row items-center space-x-2.5">
                              <Switch
                                onCheckedChange={(checked) => {
                                  onToggleSwitch(9, checked);
                                }}
                                checked={defaultArray.includes(9)}
                              />
                              <p className="text-l-medium text-muted-foreground">
                                {t("defineLUC.monoculturePlantation")}
                              </p>
                            </div> */}

                            <Accordion type="multiple">
                              <AccordionItem value="tree-based-system-acc">
                                <div className="flex flex-row items-center justify-between">
                                  <div className="flex flex-row items-center space-x-2.5">
                                    {/* <Switch /> */}
                                    <p className="text-l-medium text-muted-foreground">
                                      {t("defineLUC.naturalForest")}
                                      {/* {t("TBS")} */}
                                    </p>
                                  </div>
                                  <AccordionTrigger className="p-2"></AccordionTrigger>
                                </div>
                                <AccordionContent className="pl-[25px] mt-0 pb-0 pt-4 space-y-5">
                                  <div className="flex flex-row items-center space-x-2.5">
                                    <Switch
                                      onCheckedChange={(checked) => {
                                        onToggleSwitch(1, checked);
                                      }}
                                      checked={defaultArray.includes(1)}
                                    />
                                    <p className="text-l-medium text-muted-foreground">
                                      {t("defineLUC.undisturbedDryLandForest")}
                                    </p>
                                  </div>
                                  <div className="flex flex-row items-center space-x-2.5">
                                    <Switch
                                      onCheckedChange={(checked) => {
                                        onToggleSwitch(2, checked);
                                      }}
                                      checked={defaultArray.includes(2)}
                                    />
                                    <p className="text-l-medium text-muted-foreground">
                                      {t("defineLUC.loggedOverDryLandForest")}
                                    </p>
                                  </div>
                                  <div className="flex flex-row items-center space-x-2.5">
                                    <Switch
                                      onCheckedChange={(checked) => {
                                        onToggleSwitch(3, checked);
                                      }}
                                      checked={defaultArray.includes(3)}
                                    />
                                    <p className="text-l-medium text-muted-foreground">
                                      {t("defineLUC.undisturbedMangroveForest")}
                                    </p>
                                  </div>
                                  <div className="flex flex-row items-center space-x-2.5">
                                    <Switch
                                      onCheckedChange={(checked) => {
                                        onToggleSwitch(4, checked);
                                      }}
                                      checked={defaultArray.includes(4)}
                                    />
                                    <p className="text-l-medium text-muted-foreground">
                                      {t("defineLUC.loggedOverMangroveForest")}
                                    </p>
                                  </div>
                                  <div className="flex flex-row items-center space-x-2.5">
                                    <Switch
                                      onCheckedChange={(checked) => {
                                        onToggleSwitch(5, checked);
                                      }}
                                      checked={defaultArray.includes(5)}
                                    />
                                    <p className="text-l-medium text-muted-foreground">
                                      {t("defineLUC.undisturbedSwampForest")}
                                    </p>
                                  </div>
                                  <div className="flex flex-row items-center space-x-2.5">
                                    <Switch
                                      onCheckedChange={(checked) => {
                                        onToggleSwitch(6, checked);
                                      }}
                                      checked={defaultArray.includes(6)}
                                    />
                                    <p className="text-l-medium text-muted-foreground">
                                      {t("defineLUC.loggedOverSwampForest")}
                                    </p>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>

                            <Accordion type="multiple">
                              <AccordionItem value="tree-based-system-acc">
                                <div className="flex flex-row items-center justify-between">
                                  <div className="flex flex-row items-center space-x-2.5">
                                    {/* <Switch /> */}
                                    <p className="text-l-medium text-muted-foreground">
                                      {t("defineLUC.monoculturePlantation")}
                                      {/* {t("TBS")} */}
                                    </p>
                                  </div>
                                  <AccordionTrigger className="p-2"></AccordionTrigger>
                                </div>
                                <AccordionContent className="pl-[25px] mt-0 pb-0 pt-4 space-y-5">
                                  <div className="flex flex-row items-center space-x-2.5">
                                    <Switch
                                      onCheckedChange={(checked) => {
                                        onToggleSwitch(8, checked);
                                      }}
                                      checked={defaultArray.includes(8)}
                                    />
                                    <p className="text-l-medium text-muted-foreground">
                                      {t("defineLUC.treePlantation")}
                                    </p>
                                  </div>
                                  <div className="flex flex-row items-center space-x-2.5">
                                    <Switch
                                      onCheckedChange={(checked) => {
                                        onToggleSwitch(9, checked);
                                      }}
                                      checked={defaultArray.includes(9)}
                                    />
                                    <p className="text-l-medium text-muted-foreground">
                                      {t("defineLUC.rubberPlantation")}
                                    </p>
                                  </div>
                                  <div className="flex flex-row items-center space-x-2.5">
                                    <Switch
                                      onCheckedChange={(checked) => {
                                        onToggleSwitch(10, checked);
                                      }}
                                      checked={defaultArray.includes(10)}
                                    />
                                    <p className="text-l-medium text-muted-foreground">
                                      {t("defineLUC.oilPalmPlantation")}
                                    </p>
                                  </div>
                                  <div className="flex flex-row items-center space-x-2.5">
                                    <Switch
                                      onCheckedChange={(checked) => {
                                        onToggleSwitch(11, checked);
                                      }}
                                      checked={defaultArray.includes(11)}
                                    />
                                    <p className="text-l-medium text-muted-foreground">
                                      {t("defineLUC.otherPlantation")}
                                    </p>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>

                            <div className="flex flex-row items-center space-x-2.5">
                              <Switch
                                onCheckedChange={(checked) => {
                                  onToggleSwitch(7, checked);
                                }}
                                checked={defaultArray.includes(7)}
                              />
                              <p className="text-l-medium text-muted-foreground">
                                {t("defineLUC.agroforestry")}
                              </p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                      <Accordion type="multiple">
                        <AccordionItem value="non-tree-based-system-acc">
                          <div className="flex flex-row items-center justify-between">
                            <div className="flex flex-row items-center space-x-2.5">
                              {/* <Switch /> */}
                              <p className="text-l-medium text-muted-foreground">
                                {t("defineLUC.nonTreeBasedSystem")}
                              </p>
                            </div>
                            <AccordionTrigger className="p-2"></AccordionTrigger>
                          </div>
                          <AccordionContent className="pl-[25px] mt-0 pb-0 pt-4 space-y-5">
                            <div className="flex flex-row items-center space-x-2.5">
                              <Switch
                                onCheckedChange={(checked) => {
                                  onToggleSwitch(12, checked);
                                }}
                                checked={defaultArray.includes(12)}
                              />
                              <p className="text-l-medium text-muted-foreground">
                                {t("defineLUC.grassSavanna")}
                              </p>
                            </div>
                            <div className="flex flex-row items-center space-x-2.5">
                              <Switch
                                onCheckedChange={(checked) => {
                                  onToggleSwitch(13, checked);
                                }}
                                checked={defaultArray.includes(13)}
                              />
                              <p className="text-l-medium text-muted-foreground">
                                {t("defineLUC.shrub")}
                              </p>
                            </div>
                            <div className="flex flex-row items-center space-x-2.5">
                              <Switch
                                onCheckedChange={(checked) => {
                                  onToggleSwitch(14, checked);
                                }}
                                checked={defaultArray.includes(14)}
                              />
                              <p className="text-l-medium text-muted-foreground">
                                {t("defineLUC.cropland")}
                              </p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Accordion type="multiple">
                  <AccordionItem value="non-vegetation-acc">
                    <div className="flex flex-row items-center justify-between">
                      <div className="flex flex-row items-center space-x-2.5">
                        {/* <Switch /> */}
                        <p className="text-l-semibold text-muted-foreground">
                          {t("defineLUC.nonVegetation")}
                        </p>
                      </div>
                      <AccordionTrigger className="p-2"></AccordionTrigger>
                    </div>
                    <AccordionContent className="pl-[25px] pt-5 space-y-5">
                      <div className="flex flex-row items-center space-x-2.5">
                        <Switch
                          onCheckedChange={(checked) => {
                            onToggleSwitch(15, checked);
                          }}
                          checked={defaultArray.includes(15)}
                        />
                        <p className="text-l-medium text-muted-foreground">
                          {t("defineLUC.settlement")}
                        </p>
                      </div>
                      <div className="flex flex-row items-center space-x-2.5">
                        <Switch
                          onCheckedChange={(checked) => {
                            onToggleSwitch(16, checked);
                          }}
                          checked={defaultArray.includes(16)}
                        />
                        <p className="text-l-medium text-muted-foreground">
                          {t("defineLUC.clearedLand")}
                        </p>
                      </div>
                      <div className="flex flex-row items-center space-x-2.5">
                        <Switch
                          onCheckedChange={(checked) => {
                            onToggleSwitch(17, checked);
                          }}
                          checked={defaultArray.includes(17)}
                        />
                        <p className="text-l-medium text-muted-foreground">
                          {t("defineLUC.water")}
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </TabsContent>
          </Tabs>
        )}

        <input
          id="luc-template-file-upload"
          type="file"
          className="hidden"
          accept=".csv,.xls,.xlsx"
          multiple={false}
          onChange={onUploadFile}
        />
        {/* </div> */}
      </div>
      <Button
        variant={"ghost"}
        className="p-0 hover:bg-transparent cursor-pointer"
        onClick={() => {
          onResetInput();
        }}
      >
        <div className="">
          <p className="text-text-icons-base-third font-roboto text-[15px] font-bold tracking-[-0.15px] underline">
            {t("defineLUC.resetInput")}
          </p>
        </div>
      </Button>
    </div>
  );
};

export const DefineLUCFooter = () => {
  const {
    setStepKey,
    setProgressPanelIndex,
    defaultArray,
    selectedDefault,
    selectedCustom,
    lucSource,
    lucQuickRows,
    lucQuickPhase,
    lucExcelConfirmed,
    LUCfilesize,
    isLUCLoading,
    setIsLUCLoading,
    setClassArray,
    setLUCFile,
    setLUCFilename,
    setLUCFilesize,
    setDefaultArray,
    setIsDefineLULCChanged,
    setDataTrainingActiveTab,
    isDefineLULCChanged,
    setQuickManualSampling
  } = useContext(MapGenerationContext);

  const { setMarkerArray, renderArrayToMarkerVector, markerVectorSource } =
    useContext(MapContext);

  const t = useTranslations("InteractivePanel");

  const { sessionId } = useContext(GlobalContext);

  const validQuickRows = lucQuickRows.filter((r) => r.name.trim() !== "");

  const hasDuplicateQuickNames = (() => {
    const seen = new Set<string>();
    for (const r of validQuickRows) {
      const key = r.name.trim().toLowerCase();
      if (seen.has(key)) return true;
      seen.add(key);
    }
    return false;
  })();

  const isNextDisabled =
    (!selectedCustom && !selectedDefault) ||
    isLUCLoading ||
    (lucSource === "excel" &&
      (LUCfilesize > LUC_TEMPLATE_FILE_SIZE_LIMIT || !lucExcelConfirmed)) ||
    (lucSource === "quick" &&
      (hasDuplicateQuickNames || lucQuickPhase !== "confirmed"));

  const isBackDisabled = isLUCLoading;

  const onClickNext = async () => {
    if (!isDefineLULCChanged) {
      setDataTrainingActiveTab("upload");
      setStepKey(PANEL_COMPONENT_KEY.DATA_TRAINING);
      // WIP NEED CONFIRM
      setProgressPanelIndex(2);
      return;
    }

    if (lucSource === "excel") {
      // The file was already uploaded + parsed when it was selected, so Next
      // just advances to the Data Training step. Seed classArray from the
      // confirmed rows the way main seeds it from the upload response — the
      // Data Training step and On-Screen Sampling read it for the class list.
      // No LUC_UPDATE_URL call here: that endpoint auto-places training
      // points, and the excel flow places them manually.
      setClassArray(
        validQuickRows.map((r) => ({
          class_id: Number(r.classId.trim()) || -1,
          class_name: r.name.trim(),
          class_color: r.color,
        })),
      );

      setMarkerArray([]);
      markerVectorSource?.clear();

      setIsDefineLULCChanged(false);
      setProgressPanelIndex(2);
      setDataTrainingActiveTab("upload");
      setStepKey(PANEL_COMPONENT_KEY.DATA_TRAINING);
      return;
    }

    setIsLUCLoading(true);

    // Quick table and default scheme both submit as JSON and get default
    // training points auto-placed; they differ only in the class source.
    // Quick-table class ids are user-typed strings; the backend parses them
    // to integers, so invalid ids surface as a submit error toast.
    const classes: { id: string | number; name: string; color: string }[] =
      lucSource === "quick"
        ? validQuickRows.map((r) => ({
            id: r.classId.trim(),
            name: r.name.trim(),
            color: r.color,
          }))
        : defaultArray
            .map((item) => DEFAULT_LUC.find((item2) => item2.id === item))
            .filter((item): item is (typeof DEFAULT_LUC)[number] =>
              Boolean(item),
            )
            .map((item) => ({
              id: item.id,
              name: item.name,
              color: item.color,
            }));

    fetch(LUC_UPDATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        classes: classes.map((item) => ({
          id: item.id,
          class: item.name,
          color: item.color,
        })),
      }),
    })
      .then(async (response) => {
        const json: LUCUpdateRes = await response.json();

        if (!response.ok) {
          throw new Error(
            JSON.stringify(
              `${json?.error?.message || response.text}. Trace: ${json?.trace}`,
            ),
          );
        }

        const arr = classes.map((item) => ({
          class_id: Number(item.id) || -1,
          class_name: item.name || "",
          class_color: item.color || "",
        }));

        setClassArray(arr);

        const markerArr: Marker[] = json.training_data.map((item) => {
          const uuid = crypto.randomUUID();
          const coord = [
            fromLonLat(item.geom.coordinates)[0],
            fromLonLat(item.geom.coordinates)[1],
          ] as [number, number];
          return {
            class_color: item.class_color,
            class_id: item.class_id,
            coordinates: coord,
            name: item.class_name,
            id: uuid,
            map_feature: new Feature({
              geometry: new Point(coord),
              id: uuid,
              property: {
                class_name: item.class_name,
              },
            }),
          };
        });

        markerArr.forEach((item) => {
          if (!item.map_feature) return;
          item.map_feature.setStyle(
            new Style({
              image: new Icon({
                anchor: [0.5, 1], // Anchor the bottom center of the icon
                src: svgWithColor(item.class_color),
                // src: "/images/marker.webp", // Use your own icon URL
                size: [92, 117],
                height: 30,
              }),
            }),
          );
        });

        setMarkerArray(markerArr);

        renderArrayToMarkerVector(markerArr);

        setQuickManualSampling(lucSource === "quick" && markerArr.length === 0);

        setIsDefineLULCChanged(false);
        setProgressPanelIndex(2);
        setDataTrainingActiveTab("upload");
        setStepKey(PANEL_COMPONENT_KEY.DATA_TRAINING);
      })
      .catch((e) => {
        toast.error(`Error on submitting request: ${e}`, {
          duration: Infinity,
          dismissible: true,
          closeButton: true,
        });
      })
      .finally(() => {
        setIsLUCLoading(false);
      });

    return;
  };

  const clearFile = () => {
    setLUCFile(null);
    setLUCFilename("");
    setLUCFilesize(0);

    const doc = document.getElementById(
      "luc-template-file-upload",
    ) as HTMLInputElement;
    if (!doc) return;

    doc.value = "";
  };

  const onClickBack = () => {
    // setDefaultArray([]);
    // clearFile();

    setProgressPanelIndex(0);
    setStepKey(PANEL_COMPONENT_KEY.BASIC_INFORMATION_SUMMARY);
  };

  return (
    <div className="p-3 pt-4 gap-x-4 flex flex-row">
      <Button
        disabled={isBackDisabled}
        onClick={() => {
          onClickBack();
        }}
        variant={"outline"}
        size={"icon"}
      >
        <ChevronLeft className="text-primary-pink size-4" />
      </Button>
      <div className="grid grid-cols-2 gap-x-4 w-full">
        <div></div>
        {isLUCLoading && (
          <div className="w-full h-10 flex flex-row justify-center items-center">
            <span className="loader md"></span>
          </div>
        )}
        {!isLUCLoading && (
          <Button
            onClick={() => {
              // setStepKey(PANEL_COMPONENT_KEY.DEFINE_LUC);
              // setProgressPanelIndex(2);
              onClickNext();
            }}
            disabled={isNextDisabled}
            variant="primary"
            className=""
          >
            {t("common.next")}
          </Button>
        )}
      </div>
    </div>
  );
};
