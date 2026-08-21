"use client";

import { Button } from "@/components/ui/button";
import { GlobalContext } from "@/contexts/globalContext";
import {
  MapGenerationContext,
  type DataTrainingActiveTab,
} from "@/contexts/mapGenerationContext";
import { ChangeEvent, useContext, useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { useSavingTransition } from "@/lib/hooks";
import { cn, shortenKiloByte, svgWithColor } from "@/lib/utils";
import { fromLonLat, toLonLat } from "ol/proj";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LUCClassTable } from "./LUCClassTable";
import { SampleQualityCard } from "./SampleQualityCard";
import {
  DATA_TRAINING_FILE_SIZE_LIMIT,
  LUC_UPDATE_URL,
  PANEL_COMPONENT_KEY,
  POINTING_TYPE,
  TRAINING_DATA_UPDATE_URL,
  TRAINING_DATA_UPLOAD_URL,
} from "@/constants";
import {
  AlertCircleIcon,
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  ChevronLeft,
  FileTextIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import { toast } from "sonner";
import { MapContext } from "@/contexts/mapContext";
import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionFullTrigger,
  AccordionItem,
} from "@/components/ui/accordion";
import Feature from "ol/Feature";
import { Point } from "ol/geom";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import { Input } from "@/components/ui/input";

// Separability analysis tuning bounds/defaults (same as LumaLite Module 4).
const SEPARABILITY_SCALE_DEFAULT = 30;
const SEPARABILITY_SCALE_MIN = 10;
const SEPARABILITY_SCALE_MAX = 1000;
const SEPARABILITY_MAX_PIXELS_DEFAULT = 5000;
const SEPARABILITY_MAX_PIXELS_MIN = 1000;
const SEPARABILITY_MAX_PIXELS_MAX = 10000;

const clampInt = (raw: string, fallback: number, min: number, max: number) => {
  const parsed = parseInt(raw, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
};

export const DataTrainingComponent = () => {
  const { sessionId } = useContext(GlobalContext);

  const {
    setMarkerArray,
    markerArray,
    renderArrayToMarkerVector,
    removeMarkerCursor,
    markerCursor,
    markerVectorLayer,
    markerVectorSource,
  } = useContext(MapContext);

  const {
    classArray,
    pointingType,
    selectedClass,
    setSelectedClass,
    setPointingType,
    setStepKey,
    isUploadingTrainingFile,
    setIsUploadingTrainingFile,
    dataTrainingActiveTab,
    setDataTrainingActiveTab,
    selectedDefault,
    selectedCustom,
    lucSource,
    isAutoPointsFlow,
    trainingFile,
    trainingFilename,
    trainingFilesize,
    trainingFileError,
    uploadedFilesArray,
    setTrainingFile,
    setTrainingFilename,
    setTrainingFilesize,
    setTrainingFileError,
    setUploadedFilesArray,
    setIsTrainingDataChanged,
    quickManualSampling,
    fetchSampleQuality,
    sampleQuality,
    sampleQualityGenerated,
    setSampleQualityGenerated,
    setSampleQuality,
    sampleQualityError,
    setSampleQualityError,
    isSampleQualityLoading,
    isUpdatingTrainingData,
    setIsUpdatingTrainingData,
    spatialResolution,
  } = useContext(MapGenerationContext);

  // Optional separability-analysis tuning (mirrors LumaLite Module 4):
  // sampling scale defaults to the session's spatial resolution, the
  // per-class pixel cap to 5000. Both are plain text inputs so the user can
  // clear/retype freely; values are parsed + clamped when the analysis runs.
  const [isScoreParamsOpen, setIsScoreParamsOpen] = useState(false);
  const [separabilityScale, setSeparabilityScale] = useState(
    spatialResolution || String(SEPARABILITY_SCALE_DEFAULT),
  );
  const [separabilityMaxPixels, setSeparabilityMaxPixels] = useState(
    String(SEPARABILITY_MAX_PIXELS_DEFAULT),
  );

  const t = useTranslations("InteractivePanel");

  const [fileEnter, setFileEnter] = useState(false);
  // The summary starts (and stays) expanded — a separability result no
  // longer collapses it; the user can still toggle it manually.
  const [summaryAccordionValue, setSummaryAccordionValue] =
    useState("lulc-table");
  const qualityViewRef = useRef<HTMLDivElement | null>(null);

  // Once the quality result is shown, scroll it into view.
  useEffect(() => {
    if (sampleQuality) {
      requestAnimationFrame(() => {
        qualityViewRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }, [sampleQuality]);
  const startPointingButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (dataTrainingActiveTab !== "oss") return;

    requestAnimationFrame(() => {
      startPointingButtonRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }, [dataTrainingActiveTab]);

  // useEffect(() => {
  //   console.log("upll", uploadedFilesArray);
  // }, [uploadedFilesArray]);

  const onClickStartPointing = () => {
    removeMarkerCursor();
    setIsTrainingDataChanged(true);
    // Editing points invalidates any previous separability result: hide it
    // so the user has to recheck the score. sampleQualityGenerated stays
    // true so the banner keeps its "Recheck Score" / regenerate wording.
    setSampleQuality(null);
    setSampleQualityError("");
    setStepKey(PANEL_COMPONENT_KEY.OSS);
  };

  const submitFile = (fileObj: FileObject) => {
    setIsTrainingDataChanged(true);
    setTrainingFileError("");

    if (!fileObj) return;

    setTrainingFile(fileObj.file);
    setTrainingFilename(fileObj.filename);
    setTrainingFilesize(fileObj.filesize);

    if (fileObj.filesize > DATA_TRAINING_FILE_SIZE_LIMIT) return;

    setIsUploadingTrainingFile(true);

    const body = new FormData();

    body.append("file", fileObj.file);
    body.append("session_id", sessionId);

    fetch(TRAINING_DATA_UPLOAD_URL, {
      method: "POST",
      body,
    })
      .then(async (response) => {
        const json: TrainingDataUploadRes = await response.json();

        if (!response.ok) {
          setTrainingFileError(json?.error?.message || String(response.text));
          throw new Error(
            JSON.stringify(
              `${json?.error?.message || response.text}. Trace: ${json?.trace}`,
            ),
          );
        }

        const training_data = json.training_data.map((item) => ({
          ...item,
          id: crypto.randomUUID(),
        }));

        setUploadedFilesArray((prev) => [
          ...prev,
          {
            file: fileObj.file,
            filename: fileObj.filename,
            filesize: fileObj.filesize,
            training_data,
          },
        ]);

        const tempMarkerArray = [
          ...markerArray,
          ...training_data.map((item) => ({
            coordinates: [
              fromLonLat(item.geometry.coordinates)[0],
              fromLonLat(item.geometry.coordinates)[1],
            ] as [number, number],
            id: item.id,
            // WIP NAME WITH POINT
            name: item.class_name,
            class_id: item.class_id,
            class_color: item.class_color,
          })),
        ];

        const tempMarkerWithFeature = tempMarkerArray.map((item) => ({
          ...item,
          map_feature: new Feature({
            geometry: new Point(item.coordinates),
            id: item.id,
            property: {
              class_name: item.name,
            },
          }),
        }));

        tempMarkerWithFeature.forEach((item) => {
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

        setMarkerArray(tempMarkerWithFeature);

        renderArrayToMarkerVector(tempMarkerWithFeature);

        // The upload endpoint only parses the file; like the OSS flow, the
        // parsed points are posted and the separability analysis is run
        // on demand from the score banner's Check Score button
        // (onConfirmSampleData), not automatically after upload.

        setTrainingFile(null);
        setTrainingFilename("");
        setTrainingFilesize(0);
        // console.log("jjson", json);
      })
      .catch((e) => {
        toast.error(`Error on uploading file: ${e}`, {
          duration: Infinity,
          dismissible: true,
          closeButton: true,
        });
        // console.log("errorr", e);
      })
      .finally(() => {
        setIsUploadingTrainingFile(false);
      });
  };

  const onUploadFile = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.target;
    const files = target?.files;

    if (!files) return;

    const file = files[0];

    // setTrainingFile(file);
    // setTrainingFilename(file.name);
    // setTrainingFilesize(file.size);

    submitFile({
      file,
      filename: file.name,
      filesize: file.size,
    });
  };

  const canSampleManually =
    lucSource !== "default" &&
    (lucSource === "quick" || !quickManualSampling);
  const syncClassesIfNeeded = () => {
    if (lucSource !== "excel") return Promise.resolve();

    return fetch(LUC_UPDATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        classes: classArray.map((item) => ({
          id: item.class_id,
          class: item.class_name,
          color: item.class_color,
        })),
      }),
    }).then(async (response) => {
      if (!response.ok) {
        const json = await response.json().catch(() => null);
        throw new Error(String(json?.error?.message || response.status));
      }
    });
  };

  // OSS flow: posting the pinned points and running the separability analysis
  // both happen here, on the score banner's Generate button (End Pointing
  // only returns to this panel).
  const onConfirmSampleData = () => {
    setIsUpdatingTrainingData(true);
    syncClassesIfNeeded()
      .then(() =>
        fetch(TRAINING_DATA_UPDATE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: sessionId,
            training_data: markerArray.map((item) => ({
              class_id: item?.class_id,
              geometry: {
                type: "Point",
                coordinates: toLonLat(item?.coordinates),
              },
            })),
          }),
        }),
      )
      .then(async (response) => {
        if (!response.ok) {
          const json = await response.json().catch(() => null);
          throw new Error(String(json?.error?.message || response.status));
        }
        setIsTrainingDataChanged(false);
        fetchSampleQuality(sessionId, {
          scale: clampInt(
            separabilityScale,
            Number(spatialResolution) || SEPARABILITY_SCALE_DEFAULT,
            SEPARABILITY_SCALE_MIN,
            SEPARABILITY_SCALE_MAX,
          ),
          maxPixelsPerClass: clampInt(
            separabilityMaxPixels,
            SEPARABILITY_MAX_PIXELS_DEFAULT,
            SEPARABILITY_MAX_PIXELS_MIN,
            SEPARABILITY_MAX_PIXELS_MAX,
          ),
        });
      })
      .catch((e) => {
        toast.error(`Error on submitting request: ${e}`, {
          duration: Infinity,
          dismissible: true,
          closeButton: true,
        });
      })
      .finally(() => {
        setIsUpdatingTrainingData(false);
      });
  };

  const isConfirmSampleDataDisabled =
    markerArray.length === 0 || isUpdatingTrainingData || isSampleQualityLoading;

  const isNextDisabled =
    !pointingType || (pointingType === POINTING_TYPE.BULK && !selectedClass);

  const isFormDisabled = isUploadingTrainingFile || trainingFileError !== "";

  useEffect(() => {
    markerVectorLayer?.setOpacity(1);
    if (canSampleManually) {
      markerCursor(pointingType, classArray, true);
    }
  }, []);

  const renderUploadedFilesList = () =>
    uploadedFilesArray.map((item, index) => {
      return (
        <div
          key={`uploaded-file-${item.filename}-${index}`}
          className="px-3 py-3 rounded-[12px] border-2 border-dashed border-secondary-purple-light-active grid grid-cols-12 gap-x-4 items-center bg-purple-second"
        >
          <div className="flex flex-row gap-x-4 items-center col-span-10">
            <div className="rounded-[12px] bg-secondary-purple-light-hover aspect-square size-18 flex justify-center items-center">
              <FileTextIcon className="text-secondary-purple-dark size-12 aspect-square" />
            </div>
            <div className="min-w-0">
              <p className="font-aptos text-lg font-bold leading-7 text-secondary-purple-dark line-clamp-1 text-ellipsis">
                {item.filename}
              </p>
              <p className="font-aptos text-sm font-regular leading-5 text-secondary-purple-dark">
                {shortenKiloByte(item.filesize)}
              </p>
            </div>
          </div>

          {/* Removing the file is how the user re-uploads: it clears the
              points and any separability result so the banner resets. */}
          <div className="col-span-2 flex flex-row justify-end">
            <Button
              disabled={isUploadingTrainingFile}
              variant={"ghost"}
              className="hover:brightness-95 cursor-pointer size-7 rounded-full"
              onClick={() => {
                setTrainingFile(null);
                setTrainingFilename("");
                setTrainingFilesize(0);
                setTrainingFileError("");

                setUploadedFilesArray([]);

                setMarkerArray([]);
                markerVectorSource?.clear();

                setSampleQuality(null);
                setSampleQualityError("");
                setSampleQualityGenerated(false);
                setIsScoreParamsOpen(false);

                const doc = document.getElementById(
                  "data-training-file-upload",
                ) as HTMLInputElement;
                if (!doc) return;

                doc.value = "";
              }}
            >
              <Trash2Icon className="text-secondary-purple-dark size-5" />
            </Button>
          </div>
        </div>
      );
    });

  const hasQualityContent =
    isSampleQualityLoading || sampleQuality !== null || !!sampleQualityError;

  const isScoreButtonDisabled =
    isConfirmSampleDataDisabled || isUploadingTrainingFile;

  const renderScoreBanner = () => (
    <div
      ref={qualityViewRef}
      className="rounded-[12px] overflow-hidden border border-neutral-400"
    >
      <div
        className={cn(
          "relative bg-[#313131]",
          hasQualityContent ? "min-h-[56px]" : "min-h-[120px]",
        )}
      >
        {/* Decorative artwork as background: hugs the card's bottom-right
            corner (the SVG is pre-cropped at 232x84 with the art bleeding
            off its bottom). */}
        {/* Full header uses the tall artwork; the compact (result) header
            uses a wide, short crop of the same art so it fills the single
            row without being scaled down. */}
        {hasQualityContent ? (
          <Image
            src="/images/banner-generate-compact.svg"
            alt=""
            width={232}
            height={56}
            unoptimized
            className="pointer-events-none select-none absolute top-0 right-0 z-0 h-full w-auto"
          />
        ) : (
          <Image
            src="/images/banner-generate.svg"
            alt=""
            width={232}
            height={84}
            unoptimized
            className="pointer-events-none select-none absolute bottom-0 right-0 z-0 w-[232px] h-auto"
          />
        )}
        <div
          className={cn(
            "relative z-10 p-4 max-w-[calc(100%-150px)]",
            hasQualityContent ? "py-3.5" : "space-y-1.5",
          )}
        >
          <div className="flex flex-row items-center gap-x-2">
            <BadgeCheck className="size-5 shrink-0 text-white" />
            <p className="font-aptos text-lg font-bold leading-6 text-white">
              {t("dataTraining.sampleScoreTitle")}
            </p>
          </div>
          {!hasQualityContent && (
            <p className="font-aptos text-sm font-regular leading-5 text-neutral-400">
              {sampleQualityGenerated
                ? t("dataTraining.sampleScoreRegenCaption")
                : t("dataTraining.sampleScoreCaption")}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          aria-expanded={isScoreParamsOpen}
          className={cn(
            // Same look/hover as the secondary button variant (light pink,
            // slightly brighter on hover) instead of going grey.
            "absolute z-10 right-3 h-8 px-4 rounded-[8px] bg-primary-pink-hover text-primary-red-pink-normal font-bold hover:bg-primary-red-pink-light-hover hover:text-primary-red-pink-normal hover:brightness-105 transition-all duration-200",
            hasQualityContent ? "top-3" : "bottom-3",
            "disabled:opacity-100 disabled:bg-neutral-200 disabled:text-neutral-500",
          )}
          disabled={isScoreButtonDisabled}
          onClick={() => {
            if (!isScoreParamsOpen) {
              setIsScoreParamsOpen(true);
              return;
            }
            // Collapse the params again so a later Recheck Score goes
            // through the same expand → run flow.
            setIsScoreParamsOpen(false);
            onConfirmSampleData();
          }}
        >
          {isUpdatingTrainingData || isSampleQualityLoading ? (
            <span className="loader sm"></span>
          ) : (
            <>
              {sampleQualityGenerated
                ? t("dataTraining.recheckScore")
                : t("dataTraining.checkScore")}
              {!isScoreParamsOpen && <ChevronDown className="size-4" />}
            </>
          )}
        </Button>
      </div>

      {/* Body: the analysis (loading / result / error) once it exists,
          otherwise the optional parameter form. Opening the form (Recheck)
          hides the previous result until the new run starts. */}
      {hasQualityContent && !isScoreParamsOpen && (
        <div className="bg-white px-4 pt-4 pb-5">
          <SampleQualityCard />
        </div>
      )}

      {isScoreParamsOpen && (
        <div className="bg-primary-red-pink-light/60 px-4 pt-4 pb-5 space-y-4">
          <div className="space-y-0.5">
            <p className="font-aptos text-lg font-bold leading-6 text-text-icons-base-main">
              {t("dataTraining.separabilityParamsTitle")}
            </p>
            <p className="font-aptos text-md font-regular leading-6 text-text-icons-base-second">
              {t("dataTraining.separabilityParamsDescription")}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="separability-scale"
                className="m-0 font-aptos text-md font-regular leading-6 text-text-icons-base-main"
              >
                {t("dataTraining.separabilityScaleLabel")}
              </Label>
              <Input
                id="separability-scale"
                type="number"
                inputMode="numeric"
                min={SEPARABILITY_SCALE_MIN}
                max={SEPARABILITY_SCALE_MAX}
                step={10}
                value={separabilityScale}
                onChange={(e) => setSeparabilityScale(e.target.value)}
                onBlur={() =>
                  setSeparabilityScale(
                    String(
                      clampInt(
                        separabilityScale,
                        Number(spatialResolution) || SEPARABILITY_SCALE_DEFAULT,
                        SEPARABILITY_SCALE_MIN,
                        SEPARABILITY_SCALE_MAX,
                      ),
                    ),
                  )
                }
                className="h-11 rounded-[8px] bg-white font-aptos text-md"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="separability-max-pixels"
                className="m-0 font-aptos text-md font-regular leading-6 text-text-icons-base-main"
              >
                {t("dataTraining.separabilityMaxPixelsLabel")}
              </Label>
              <Input
                id="separability-max-pixels"
                type="number"
                inputMode="numeric"
                min={SEPARABILITY_MAX_PIXELS_MIN}
                max={SEPARABILITY_MAX_PIXELS_MAX}
                step={500}
                value={separabilityMaxPixels}
                onChange={(e) => setSeparabilityMaxPixels(e.target.value)}
                onBlur={() =>
                  setSeparabilityMaxPixels(
                    String(
                      clampInt(
                        separabilityMaxPixels,
                        SEPARABILITY_MAX_PIXELS_DEFAULT,
                        SEPARABILITY_MAX_PIXELS_MIN,
                        SEPARABILITY_MAX_PIXELS_MAX,
                      ),
                    ),
                  )
                }
                className="h-11 rounded-[8px] bg-white font-aptos text-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const minSamplesHint = (
    <div className="rounded-r-[8px] border-l-2 border-primary-red-pink-normal bg-primary-red-pink-normal/10 px-2.5 py-2">
      <div className="flex flex-row items-center gap-x-2">
        <Image src="/svgs/idea.svg" alt="" width={20} height={20} />
        <p className="font-aptos text-[13px] leading-[18px] text-primary-pink">
          {t("dataTraining.minSamplesNotEnforced")}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-4">
        {/* {selectedDefault && <LUCClassTable summary={false} />} */}
        {/* Score banner (+ optional analysis params / the analysis result)
            lives above the tabs, so it's visible in both flows at all times. */}
        {canSampleManually && renderScoreBanner()}
        {canSampleManually && (
          <div className="rounded-[12px] bg-white p-3 py-5 border border-neutral-400 space-y-6">
            <Tabs
              value={dataTrainingActiveTab}
              onValueChange={(value) =>
                setDataTrainingActiveTab(value as DataTrainingActiveTab)
              }
              className="gap-y-3 mb-0"
            >
              <div className="px-0 py-0">
                <TabsList className="w-full px-1.5">
                  <TabsTrigger value="upload">
                    {t("dataTraining.uploadDataTraining")}
                  </TabsTrigger>
                  <TabsTrigger value="oss">
                    {t("dataTraining.onScreenSampling")}
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="upload">
                <div className="space-y-6">
                  <p className="font-aptos text-md font-regular leading-6 text-neutral-700">
                    {t("dataTraining.uploadDataTrainingDescription")}
                  </p>
                  {minSamplesHint}
                  <div className="space-y-6">
                    {uploadedFilesArray.length === 0 && (
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
                                  // const blobUrl = URL.createObjectURL(file);
                                  // setAreaScopingPolygonUrl(file);
                                  // setAreaScopingPolygonFileSize(file.size);
                                  // setAreaScopingPolygonFileName(file.name);
                                  // console.log("fileee", file);

                                  // setTrainingFile(file);
                                  // setTrainingFilename(file.name);
                                  // setTrainingFilesize(file.size);

                                  submitFile({
                                    file,
                                    filename: file.name,
                                    filesize: file.size,
                                  });
                                }
                                // console.log(`items file[${i}].name = ${file?.name}`);
                              }
                            });
                          } else {
                            [...e.dataTransfer.files].forEach((file, i) => {
                              console.log(`… file[${i}].name = ${file.name}`);
                            });
                          }
                        }}
                      >
                        {!fileEnter && (
                          <>
                            <div className="space-y-3">
                              <UploadIcon className="size-8 aspect-square text-text-icons-base-third mx-auto" />
                              <p className="font-aptos text-[13px] font-regular leading-4.5 text-neutrals-600 text-center">
                                {/* Drag & drop your file here to upload. <br />
                            Accepted format .zip */}
                                {t("dataTraining.dragAndDrop")} <br />
                                {t("dataTraining.acceptedFormat", {
                                  X: ".zip",
                                })}
                              </p>
                            </div>
                            <Label
                              htmlFor="data-training-file-upload"
                              className={cn(
                                "w-50 mx-auto flex flex-row justify-center mb-0",
                                isFormDisabled &&
                                  "pointer-events-none cursor-not-allowed",
                              )}
                            >
                              <div
                                className={cn(
                                  "rounded-[12px] bg-primary-pink-hover hover:bg-primary-pink-hover hover:brightness-95 cursor-pointer w-full py-1.5 px-2 transition-all duration-200",
                                  isFormDisabled &&
                                    "bg-text-icons-disabled text-text-icons-base-third",
                                )}
                              >
                                <p className="font-aptos text-[13px] font-semibold leading-4.5 text-primary-red-pink-normal text-center">
                                  {t("dataTraining.browseFile")}
                                </p>
                              </div>
                            </Label>
                          </>
                        )}

                        {fileEnter && !isFormDisabled && (
                          <>
                            <div className="absolute flex flex-col items-center justify-center gap-y-3 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                              <UploadIcon className="size-8 aspect-square text-primary-pink mx-auto" />
                              <p className="font-aptos text-[13px] font-regular leading-4.5 text-primary-pink text-center">
                                {t("dataTraining.dropHere")}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    {renderUploadedFilesList()}
                    {trainingFile && (
                      <>
                        {trainingFilesize <= DATA_TRAINING_FILE_SIZE_LIMIT &&
                          !trainingFileError && (
                            <div className="px-3 py-3 rounded-[12px] border-2 border-dashed border-secondary-purple-light-active grid grid-cols-12 gap-x-4 items-center bg-purple-second">
                              <div className="col-span-10 flex flex-row gap-x-4 items-center">
                                <div className="rounded-[12px] bg-secondary-purple-light-hover aspect-square size-18 flex justify-center items-center">
                                  <FileTextIcon className="text-secondary-purple-dark size-12 aspect-square" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-aptos text-lg font-bold leading-7 text-secondary-purple-dark line-clamp-1 text-ellipsis">
                                    {trainingFilename}
                                  </p>
                                  <p className="font-aptos text-sm font-regular leading-5 text-secondary-purple-dark">
                                    {shortenKiloByte(trainingFilesize)}
                                  </p>
                                </div>
                              </div>

                              <div className="col-span-2 flex flex-row justify-end">
                                {isUploadingTrainingFile && (
                                  <div className="w-full h-10 flex flex-row justify-center">
                                    <span className="loader sm"></span>
                                  </div>
                                )}
                                {!isUploadingTrainingFile && (
                                  <Button
                                    disabled={isUploadingTrainingFile}
                                    variant={"ghost"}
                                    className="hover:brightness-95 cursor-pointer size-7 rounded-full"
                                    onClick={() => {
                                      setTrainingFile(null);
                                      setTrainingFilename("");
                                      setTrainingFilesize(0);
                                      setTrainingFileError("");

                                      const doc = document.getElementById(
                                        "data-training-file-upload",
                                      ) as HTMLInputElement;
                                      if (!doc) return;

                                      doc.value = "";
                                    }}
                                  >
                                    <Trash2Icon className="text-secondary-purple-dark size-5" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        {trainingFileError && (
                          <>
                            <div className="px-3 py-3 rounded-[12px] border-2 border-dashed border-danger-200 grid grid-cols-12 gap-x-4 items-center bg-danger-50">
                              <div className="flex flex-row gap-x-4 items-center col-span-10">
                                <div className="rounded-[12px] bg-danger-100 aspect-square size-18 flex justify-center items-center">
                                  <FileTextIcon className="text-danger-700 size-12 aspect-square" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-aptos text-lg font-bold leading-7 text-danger-600 line-clamp-1 text-ellipsis">
                                    {trainingFilename}
                                  </p>
                                  <p className="font-aptos text-sm font-regular leading-5 text-danger-600">
                                    {shortenKiloByte(trainingFilesize)}
                                  </p>
                                </div>
                              </div>
                              <div className="col-span-2 flex flex-row justify-end">
                                <Button
                                  disabled={isUploadingTrainingFile}
                                  variant={"ghost"}
                                  className="hover:brightness-95 cursor-pointer size-7 rounded-full"
                                  onClick={() => {
                                    setTrainingFile(null);
                                    setTrainingFilename("");
                                    setTrainingFilesize(0);
                                    setTrainingFileError("");

                                    const doc = document.getElementById(
                                      "data-training-file-upload",
                                    ) as HTMLInputElement;
                                    if (!doc) return;

                                    doc.value = "";
                                  }}
                                >
                                  <Trash2Icon className="text-danger-700 size-5" />
                                </Button>
                              </div>
                            </div>
                            <div className="px-3 py-3 rounded-[12px] border-danger-700 flex flex-row justify-between gap-x-4 items-center bg-danger-700">
                              <div className="flex flex-row gap-x-4 items-center">
                                <div className="rounded-[12px] bg-danger-500 aspect-square size-18 flex justify-center items-center">
                                  <AlertCircleIcon className="text-danger-100 size-12 aspect-square" />
                                </div>
                                <div className="">
                                  <p className="font-aptos text-lg font-bold leading-7 text-danger-50">
                                    {t("common.fileError")}
                                  </p>
                                  <p className="font-aptos text-sm font-regular leading-5 text-danger-50">
                                    {trainingFileError}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                        {trainingFilesize > DATA_TRAINING_FILE_SIZE_LIMIT &&
                          !trainingFileError && (
                            <>
                              <div className="px-3 py-3 rounded-[12px] border-2 border-dashed border-danger-200 grid grid-cols-12 gap-x-4 items-center bg-danger-50">
                                <div className="flex flex-row gap-x-4 items-center col-span-10">
                                  <div className="rounded-[12px] bg-danger-100 aspect-square size-18 flex justify-center items-center">
                                    <FileTextIcon className="text-danger-700 size-12 aspect-square" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-aptos text-lg font-bold leading-7 text-danger-600 line-clamp-1 text-ellipsis">
                                      {trainingFilename}
                                    </p>
                                    <p className="font-aptos text-sm font-regular leading-5 text-danger-600">
                                      {shortenKiloByte(trainingFilesize)}
                                    </p>
                                  </div>
                                </div>
                                <div className="col-span-2 flex flex-row justify-end">
                                  <Button
                                    disabled={isUploadingTrainingFile}
                                    variant={"ghost"}
                                    className="hover:brightness-95 cursor-pointer size-7 rounded-full"
                                    onClick={() => {
                                      setTrainingFile(null);
                                      setTrainingFilename("");
                                      setTrainingFilesize(0);

                                      const doc = document.getElementById(
                                        "data-training-file-upload",
                                      ) as HTMLInputElement;
                                      if (!doc) return;

                                      doc.value = "";
                                    }}
                                  >
                                    <Trash2Icon className="text-danger-700 size-5" />
                                  </Button>
                                </div>
                              </div>
                              <div className="px-3 py-3 rounded-[12px] border-danger-700 flex flex-row justify-between gap-x-4 items-center bg-danger-700">
                                <div className="flex flex-row gap-x-4 items-center">
                                  <div className="rounded-[12px] bg-danger-500 aspect-square size-18 flex justify-center items-center">
                                    <AlertCircleIcon className="text-danger-100 size-12 aspect-square" />
                                  </div>
                                  <div className="">
                                    <p className="font-aptos text-lg font-bold leading-7 text-danger-50">
                                      {t("common.fileTooBigError", {
                                        X: "500",
                                      })}
                                    </p>
                                    <p className="font-aptos text-sm font-regular leading-5 text-danger-50">
                                      {t("common.fileTooBigErrorDesc", {
                                        limit: "500MB",
                                      })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                      </>
                    )}
                  </div>
                </div>
                <input
                  id="data-training-file-upload"
                  type="file"
                  className="hidden"
                  accept=".zip"
                  multiple={false}
                  onChange={onUploadFile}
                />
              </TabsContent>
              <TabsContent value="oss">
                <div className="space-y-6">
                  <p className="font-aptos text-md font-regular leading-6 text-neutral-700">
                    {t("dataTraining.onScreenSamplingDescription")}
                  </p>
                  {minSamplesHint}
                  <Tabs defaultValue="pinpoint" className="gap-y-3 mb-0">
                    <div className="px-0">
                      <TabsList className="w-full bg-transparent rounded-none border-0 p-0 gap-0">
                        <TabsTrigger
                          value="pinpoint"
                          className="font-aptos data-[state=active]:text-text-icons-base-main text-[15px] text-text-icons-base-third font-semibold leading-4.5 data-[state=active]:bg-transparent border-0 border-b-4 data-[state=active]:border-b-primary-pink rounded-none"
                        >
                          {t("dataTraining.pinPoint")}
                        </TabsTrigger>
                        <TabsTrigger
                          disabled
                          value="draw"
                          className="font-aptos data-[state=active]:text-text-icons-base-main text-[15px] text-text-icons-base-third font-semibold leading-4.5 data-[state=active]:bg-transparent border-0 border-b-4 data-[state=active]:border-b-primary-pink border-b-text-icons-disabled rounded-none"
                        >
                          {t("areaScoping.drawPolygon")}
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    <TabsContent value="pinpoint">
                      <div className="mt-4 space-y-5.5">
                        <div className="">
                          {/* <p className="text-text-icons-base-main font-aptos text-xl font-bold leading-6">
                            {t("dataTraining.pinYourPoint")}
                          </p> */}
                          <p className="text-text-icons-base-second font-aptos text-[13px] font-regular leading-4.5">
                            {t("dataTraining.pinYourPointDescription")}
                          </p>
                        </div>
                        <RadioGroup
                          onValueChange={(val: POINTING_TYPE) => {
                            setPointingType(val);
                          }}
                          value={pointingType}
                          // defaultValue="single"
                          className="space-y-3"
                        >
                          <Label
                            htmlFor="single-radio"
                            className=" mb-0 hover:brightness-95 cursor-pointer bg-white transition-all duration-200"
                          >
                            <div
                              className={cn(
                                "p-3 flex flex-row items-center gap-x-3 rounded-[12px] border-2 border-text-icons-disabled",
                                pointingType === POINTING_TYPE.SINGLE &&
                                  "border-primary-pink",
                              )}
                            >
                              <div className="">
                                <RadioGroupItem
                                  value={POINTING_TYPE.SINGLE}
                                  id="single-radio"
                                  className={cn(
                                    "size-5.5 border-text-icons-disabled border-2",
                                    pointingType === POINTING_TYPE.SINGLE &&
                                      "border-primary-red-pink-normal-active",
                                  )}
                                  indicatorClassName="size-4 text-primary-pink fill-primary-pink"
                                />
                              </div>
                              <div className="">
                                <Image
                                  src="/images/single-point.webp"
                                  width={164}
                                  height={140}
                                  alt="Single Point"
                                  className="w-22.5"
                                />
                              </div>
                              <div className="">
                                <p className="font-aptos text-md font-bold leading-6 text-text-icons-base-main">
                                  {t("dataTraining.singlePoint")}
                                </p>
                                <p className="font-aptos text-[13px] font-regular leading-4.5 text-text-icons-base-second">
                                  {t("dataTraining.singlePointDescription")}
                                </p>
                              </div>
                            </div>
                          </Label>
                          <Label
                            htmlFor="bulk-radio"
                            className=" mb-0 hover:brightness-95 cursor-pointer bg-white transition-all duration-200"
                          >
                            <div
                              className={cn(
                                "p-3 rounded-[12px] border-2 border-text-icons-disabled flex flex-col gap-y-4",
                                pointingType === POINTING_TYPE.BULK &&
                                  "border-primary-pink",
                              )}
                            >
                              <div className="flex flex-row items-center gap-x-3">
                                <div className="">
                                  <RadioGroupItem
                                    value={POINTING_TYPE.BULK}
                                    id="bulk-radio"
                                    className={cn(
                                      "size-5.5 border-text-icons-disabled border-2",
                                      pointingType === POINTING_TYPE.BULK &&
                                        "border-primary-red-pink-normal-active",
                                    )}
                                    indicatorClassName="size-4 text-primary-pink fill-primary-pink"
                                  />
                                </div>
                                <div className="">
                                  <Image
                                    src="/images/bulk-point.webp"
                                    width={165}
                                    height={102}
                                    alt="Bulk Point"
                                    className="w-22.5"
                                  />
                                </div>
                                <div className="">
                                  <p className="font-aptos text-md font-bold leading-6 text-text-icons-base-main">
                                    {t("dataTraining.bulkPoint")}
                                  </p>
                                  <p className="font-aptos text-[13px] font-regular leading-4.5 text-text-icons-base-second">
                                    {t("dataTraining.bulkPointDescription")}
                                  </p>
                                </div>
                              </div>
                              {pointingType === "bulk" && (
                                <div className="ml-8 space-y-2">
                                  <p className="font-aptos text-[15px] font-regular leading-4.5">
                                    {t("dataTraining.selectLULCClass")}
                                  </p>
                                  <Select
                                    value={selectedClass}
                                    onValueChange={setSelectedClass}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue
                                        placeholder={t(
                                          "dataTraining.selectLULCClassPlaceholder",
                                        )}
                                      />
                                    </SelectTrigger>
                                    <SelectContent position="item-aligned">
                                      {classArray.map((item) => (
                                        <SelectItem
                                          key={`key-${item.class_id}`}
                                          value={String(item.class_id)}
                                          // disabled={item.disabled}
                                        >
                                          {item.class_name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>
                          </Label>
                          <Button
                            ref={startPointingButtonRef}
                            disabled={isNextDisabled}
                            variant={"primary"}
                            className="text-[16px]"
                            onClick={() => {
                              onClickStartPointing();
                            }}
                          >
                            {t("dataTraining.startPointing")}
                          </Button>
                        </RadioGroup>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
        <Accordion
          type="single"
          collapsible
          value={summaryAccordionValue}
          onValueChange={setSummaryAccordionValue}
        >
          <AccordionItem
            value={"lulc-table"}
            className="rounded-xl border border-neutral-400  bg-white pb-3 last:border-b"
          >
            <AccordionFullTrigger
              icon={
                <ChevronDown className="h-5 w-5 shrink-0 text-primary-pink transition-transform duration-200" />
              }
              className="hover:no-underline p-3 pb-0"
            >
              <p className="font-noto-sans text-xl font-semibold leading-7 tracking-[-0.2px] text-primary-pink">
                {t("dataTraining.recordedLULC")}
              </p>
            </AccordionFullTrigger>
            <AccordionContent className="mt-2 space-y-6 px-3 pb-0">
              <p className="text-text-icons-base-second font-aptos text-[13px] font-regular leading-4.5">
                {selectedCustom
                  ? t("dataTraining.recordedLULCDescriptionOWNCLASS")
                  : selectedDefault
                    ? t("dataTraining.recordedLULCDescriptionDEFAULTCLASS")
                    : "error"}
              </p>
              <LUCClassTable summary={false} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
};

export const DataTrainingFooter = () => {
  const {
    setStepKey,
    setProgressPanelIndex,
    isUploadingTrainingFile,
    isUpdatingTrainingData,
    setIsUpdatingTrainingData,
    lucSource,
    classArray,
    isTrainingDataChanged,
    setIsTrainingDataChanged,
    quickManualSampling,
    isSampleQualityLoading,
  } = useContext(MapGenerationContext);

  const { sessionId } = useContext(GlobalContext);

  const { markerVectorLayer, markerArray } = useContext(MapContext);

  const t = useTranslations("InteractivePanel");
  const { isSaving, runWithSaving } = useSavingTransition();

  const isNextDisabled =
    isUploadingTrainingFile ||
    isUpdatingTrainingData ||
    (lucSource === "excel" && classArray.length === 0) ||
    // Only block while the separability analysis is still running; a shown
    // result needs no explicit confirmation to move on.
    isSampleQualityLoading;

  const isBackDisabled = isUploadingTrainingFile || isUpdatingTrainingData;

  // Same class-sync as the Generate button: the uploaded-classes flow never
  // posted its edited scheme, and POST /training-data validates class_ids
  // against the backend's stored classes.
  const syncClassesIfNeeded = () => {
    if (lucSource !== "excel") return Promise.resolve();

    return fetch(LUC_UPDATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        classes: classArray.map((item) => ({
          id: item.class_id,
          class: item.class_name,
          color: item.class_color,
        })),
      }),
    }).then(async (response) => {
      if (!response.ok) {
        const json = await response.json().catch(() => null);
        throw new Error(String(json?.error?.message || response.status));
      }
    });
  };

  const updateLULC = () => {
    setIsUpdatingTrainingData(true);
    syncClassesIfNeeded()
      .then(() =>
        fetch(TRAINING_DATA_UPDATE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: sessionId,
            training_data: markerArray.map((item) => ({
              class_id: item?.class_id,
              geometry: {
                type: "Point",
                coordinates: toLonLat(item?.coordinates),
              },
            })),
          }),
        }),
      )
      .then(async (response) => {
        if (!response.ok) {
          const json = await response.json().catch(() => null);
          throw new Error(String(json?.error?.message || response.status));
        }
        setStepKey(PANEL_COMPONENT_KEY.LULC_PARAMS);
        markerVectorLayer?.setOpacity(0);
        setProgressPanelIndex(3);
        setIsTrainingDataChanged(false);
      })
      .catch((e) => {
        toast.error(`Error on submitting request: ${e}`, {
          duration: Infinity,
          dismissible: true,
          closeButton: true,
        });
      })
      .finally(() => {
        setIsUpdatingTrainingData(false);
      });
  };

  const onClickNext = () => {
    // console.log("istraining chaned", isTrainingDataChanged);
    // return;
    if (!isTrainingDataChanged) {
      setStepKey(PANEL_COMPONENT_KEY.LULC_PARAMS);
      markerVectorLayer?.setOpacity(0);
      setProgressPanelIndex(3);
      return;
    }

    // Only the uploaded-excel custom flow posts the user-placed markers.
    // Quick table + default use the server's auto-placed training points.
    if (lucSource === "excel" || quickManualSampling) {
      updateLULC();
      return;
    }

    setStepKey(PANEL_COMPONENT_KEY.LULC_PARAMS);
    markerVectorLayer?.setOpacity(0);
    setProgressPanelIndex(3);
    setIsTrainingDataChanged(false);
    return;
  };

  const onClickBack = () => {
    setProgressPanelIndex(1);
    markerVectorLayer?.setOpacity(0);
    setStepKey(PANEL_COMPONENT_KEY.DEFINE_LUC);
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
        <Button
          onClick={() => {
            runWithSaving(onClickNext);
          }}
          disabled={isNextDisabled || isSaving}
          variant="primary"
          className=""
        >
          {!isUpdatingTrainingData && isSaving && (
            <>
              <span className="loader sm"></span>
              {t("common.saving")}
            </>
          )}
          {!isUpdatingTrainingData && !isSaving && (
            <>
              {t("common.next")}
              <ArrowRight className="size-4" />
            </>
          )}
          {isUpdatingTrainingData && (
            <div className="w-full h-10 flex flex-row justify-center items-center">
              <span className="loader sm"></span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};
