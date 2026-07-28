"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FETCH_GENERATE_MAP, THEMATIC_ACCURACY_URL } from "@/constants";
import { UploadIcon } from "lucide-react";
import { ThematicAccuracyDetailDialog } from "./ThematicAccuracyDetailDialog";
import { GlobalContext } from "@/contexts/globalContext";
import { MapContext } from "@/contexts/mapContext";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { UnauthorizedError, fetchWithAuth } from "@/lib/fetchWithAuth";
import { cn, numberThousandSeparator } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Image from "next/image";
import TileLayer from "ol/layer/Tile";
import { XYZ } from "ol/source";
import {
  ChangeEvent,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

const VISUALIZATION = "visualization";
const CALC_LULC_COMP = "calculate lulc composition";
const FEATURE_IMPORTANCE = "feature importance";
const EVALUATE_MODEL_QUALITY = "evaluate model quality";
const DOWNLOAD_URL = "get download url";

export const YourMapComponent = () => {
  const { sessionId } = useContext(GlobalContext);

  const {
    finalLayer,
    setFinalLayer,
    finalLayerVisible,
    setFinalLayerVisible,
    mapInstance,
  } = useContext(MapContext);

  const {
    generateMapDataVisualization,
    setGenerateMapDataVisualization,
    // generateMapLULC,
    setGenerateMapLULC,
    // generateMapFeatureImportance,
    setGenerateMapFeatureImportance,
    // generateMapModelQuality,
    setGenerateMapModelQuality,
    // generateMapDownloadURL,
    setGenerateMapDownloadURL,
    isMapGenerationLoading,
    setIsMapGenerationLoading,
    progress,
    setProgress,
    totalProgress,
    setTotalProgress,
    isGenerationError,
    setIsGenerationError,
  } = useContext(MapGenerationContext);

  const handleStreamMessage = (json: GenerateMapStream) => {
    // console.log("json", json);

    if (totalProgress === 0) {
      setTotalProgress(json.w);
    }

    setProgress((prev) => prev + json.a);

    if (json.process === VISUALIZATION) {
      const data = json.data as GenerateMapDataVisualization;
      // console.log("data VISUALIZATION", data);
      setGenerateMapDataVisualization(data);

      const temp = data.layers[0];

      const xyzLayer = new TileLayer({
        source: new XYZ({
          url: temp.url,

          // Optional: Add attributions if required by the tile service provider
        }),
        className: `final`,
        zIndex: 10,
        opacity: 1,
      });

      mapInstance?.addLayer(xyzLayer);
      setFinalLayer(xyzLayer);
      setFinalLayerVisible(true);

      return;
    }

    if (json.process === CALC_LULC_COMP) {
      const data = json.data as GenerateMapDataLULCComp;
      setGenerateMapLULC(data);
      return;
    }

    if (json.process === FEATURE_IMPORTANCE) {
      const data = json.data as GenerateMapDataFeatureImportance;
      setGenerateMapFeatureImportance(data);
      return;
    }

    if (json.process === EVALUATE_MODEL_QUALITY) {
      const data = json.data as GenerateMapDataEvalModelQuality;
      setGenerateMapModelQuality(data);
      return;
    }

    if (json.process === DOWNLOAD_URL) {
      const data = json.data as GenerateMapDataDownloadURL;
      setGenerateMapDownloadURL(data);
    }
  };

  const getMapGenerationResult = () => {
    setIsMapGenerationLoading(true);
    setIsGenerationError(false);
    setTotalProgress(0);
    setProgress(0);

    const data = {
      session_id: sessionId,
    };

    fetch(`${FETCH_GENERATE_MAP}?${new URLSearchParams(data)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        // const json: GenerateMapRes = await response.json();

        if (!response.ok) {
          throw new Error(JSON.stringify(response.text));
        }

        const decoder = new TextDecoder();
        let buffer = "";

        // @ts-ignore
        for await (const chunk of response.body) {
          buffer += decoder.decode(chunk, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          lines.forEach((line) => {
            const item = line.trim();

            if (!item) return;

            // console.log("item", item);
            handleStreamMessage(JSON.parse(item));
          });
        }

        const lastChunk = buffer.trim();

        if (lastChunk) {
          handleStreamMessage(JSON.parse(lastChunk));
        }
      })
      .catch((e) => {
        setIsGenerationError(true);
        if (e instanceof UnauthorizedError) {
          toast.error("Please log in to generate your map.", {
            duration: Infinity,
            dismissible: true,
            closeButton: true,
          });
          return;
        }

        toast.error(`Error generating map: ${e}`, {
          duration: Infinity,
          dismissible: true,
          closeButton: true,
        });
      })
      .finally(() => {
        setIsMapGenerationLoading(false);
      });
  };

  const reset = () => {
    getMapGenerationResult();
  };

  useEffect(() => {
    if (generateMapDataVisualization || isMapGenerationLoading) return;
    // console.log("getagain");
    getMapGenerationResult();
  }, []);

  return (
    <>
      <div className="space-y-4">
        {/* <Button
          onClick={() => {
            reset();
          }}
        >
          reset
        </Button> */}
        {isMapGenerationLoading && (
          <div className="space-y-2">
            <div className="w-full h-20 flex flex-row justify-center">
              <span className="loader "></span>
            </div>
            <p className="text-center">
              Loading...{" "}
              {(
                (totalProgress === 0 ? 0 : progress / totalProgress) * 100
              ).toFixed(2)}
              %
            </p>
          </div>
        )}
        {!isMapGenerationLoading && (
          <>
            {isGenerationError && (
              <>
                <p className=" text-center">
                  Something wrong happened. Please try again.
                </p>
                <div className="w-full flex flex-row justify-center">
                  <Button
                    disabled={isMapGenerationLoading}
                    variant="primary"
                    className=""
                    onClick={() => {
                      getMapGenerationResult();
                    }}
                  >
                    Retry
                  </Button>
                </div>
              </>
            )}
            {!isGenerationError && (
              <>
                <div className="grid grid-cols-[3fr_4fr] gap-4 items-stretch">
                  <ModelAccuracyAssessment />
                  <LULCCompositionSummary />
                </div>
                {/* <PredictorImportances /> */}
                <div id="thematic-accuracy-card">
                  <ThematicAccuracyAssessment />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export const YourMapFooter = () => {
  const { setIsYourMapDialogVisible, isMapGenerationLoading } =
    useContext(MapGenerationContext);

  const t = useTranslations("InteractivePanel");

  return (
    <>
      <div className="grid grid-cols-2 p-3 pt-4 gap-x-4">
        <div></div>
        <Button
          onClick={() => {
            setIsYourMapDialogVisible(true);
          }}
          disabled={isMapGenerationLoading}
          variant="primary"
          className=""
        >
          {t("common.next")}
        </Button>
      </div>
    </>
  );
};

const Card = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "p-3 rounded-[12px] border border-neutral-400 bg-white",
        className,
      )}
    >
      {children}
    </div>
  );
};

const COMPOSITION_ARR = [
  {
    color: "#EFC6D5",
    name: "Semak Belukar",
    percentage: 40,
    points: 10,
  },
  {
    color: "#E080A4",
    name: "Monokultur Sawit",
    percentage: 28,
    points: 7,
  },
  {
    color: "#300",
    name: "Monokultur Karet",
    percentage: 20,
    points: 5,
  },
  {
    color: "#CC4778",
    name: "Sawah",
    percentage: 8,
    points: 2,
  },
  {
    color: "#99355A",
    name: "Hutan",
    percentage: 4,
    points: 1,
  },
];

const LULCCompositionSummary = () => {
  const { generateMapLULC } = useContext(MapGenerationContext);

  const ARR_FIRST_HALF =
    generateMapLULC?.lulc_composition.slice(
      0,
      Math.ceil(generateMapLULC?.lulc_composition.length / 2),
    ) || [];
  const ARR_SECOND_HALF =
    generateMapLULC?.lulc_composition.slice(
      Math.ceil(generateMapLULC?.lulc_composition.length / 2),
    ) || [];

  const t = useTranslations("InteractivePanel");

  return (
    <>
      <Card>
        <div className="space-y-5">
          <div className="space-y-1">
            <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
              {t("yourMap.lulcCompositionSummary")}
            </p>
            <p className="font-aptos text-md font-regular leading-6 text-neutral-700">
              {t("yourMap.lulcCompositionSummaryDescription")}
            </p>
          </div>
          <div className="flex flex-row w-full rounded-md overflow-hidden h-14">
            {generateMapLULC?.lulc_composition.length === 0 && "-"}
            {generateMapLULC?.lulc_composition.map((item, index) => (
              <div
                key={`comop-${index}`}
                style={{
                  backgroundColor: item.class_color,
                  width: `${item.proportion}%`,
                }}
                className="h-full"
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-x-3">
            <div className="space-y-3">
              {ARR_FIRST_HALF.map((item, index) => (
                <div
                  key={`compo-list-${item.class_name}-${index}`}
                  className="flex flex-row items-start"
                >
                  <div
                    className="size-4 aspect-square rounded-[4px] mt-1 mr-2 shrink-0"
                    style={{
                      backgroundColor: item.class_color,
                    }}
                  />

                  <div className="mr-1 flex-1 min-w-0">
                    <p
                      className="text-black font-aptos text-sm font-semibold leading-5 line-clamp-1 text-ellipsis"
                      title={item.class_name}
                    >
                      {item.class_name}
                    </p>
                    <div className="flex flex-row items-baseline gap-x-1.5">
                      <p
                        className="font-noto-sans text-md font-bold leading-6 text-nowrap"
                        style={{
                          color: item.class_color,
                        }}
                      >
                        {item.proportion.toFixed(0)}%
                      </p>
                      <p className="text-black font-aptos text-[13px] font-regular leading-4.5 whitespace-nowrap">
                        {numberThousandSeparator(
                          (item.area_m2 / 10000).toFixed(0),
                        )}{" "}
                        Ha
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {ARR_SECOND_HALF.map((item, index) => (
                <div
                  key={`compo-list-${item.class_name}-${index}`}
                  className="flex flex-row items-start"
                >
                  <div
                    className="size-4 aspect-square rounded-[4px] mt-1 mr-2 shrink-0"
                    style={{
                      backgroundColor: item.class_color,
                    }}
                  />

                  <div className="mr-1 flex-1 min-w-0">
                    <p
                      className="text-black font-aptos text-sm font-semibold leading-5 line-clamp-1 text-ellipsis"
                      title={item.class_name}
                    >
                      {item.class_name}
                    </p>
                    <div className="flex flex-row items-baseline gap-x-1.5">
                      <p
                        className="font-noto-sans text-md font-bold leading-6 text-nowrap"
                        style={{
                          color: item.class_color,
                        }}
                      >
                        {item.proportion.toFixed(0)}%
                      </p>
                      <p className="text-black font-aptos text-[13px] font-regular leading-4.5 whitespace-nowrap">
                        {numberThousandSeparator(
                          (item.area_m2 / 10000).toFixed(0),
                        )}{" "}
                        Ha
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

// WIP to be deleted
const PredictorImportances = () => {
  const t = useTranslations("InteractivePanel");
  const { generateMapFeatureImportance } = useContext(MapGenerationContext);
  return (
    <>
      <Card>
        <div className="space-y-5">
          <div className="space-y-1">
            <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
              {t("yourMap.predictorImportances")}
            </p>
            <p className="font-aptos text-md font-regular leading-6 text-neutral-700">
              {t("yourMap.predictorImportancesDescription")}
            </p>
          </div>

          <div className="space-y-3">
            {generateMapFeatureImportance?.feature_importance
              .slice(0, 3)
              .map((item, index) => {
                return (
                  <div
                    className="flex flex-row items-center justify-between"
                    key={`feature-importance-${index}`}
                  >
                    <div className="flex flex-row items-center gap-x-3">
                      <div className="bg-primary-red-pink-light text-primary-pink font-aptos text-md font-semibold leading-6 rounded-[12px] size-8 aspect-square flex flex-col items-center justify-center">
                        {index + 1}
                      </div>
                      <p className="font-aptos text-md font-semibold leading-6 text-text-icons-base-main">
                        {item.Band}
                      </p>
                    </div>
                    <p className="font-lato text-md font-bold leading-6 text-text-icons-base-main">
                      {item.Importance.toFixed(2)} %
                    </p>
                  </div>
                );
              })}
            {/* <div className="flex flex-row items-center justify-between">
              <div className="flex flex-row items-center gap-x-3">
                <div className="bg-primary-red-pink-light text-primary-pink font-aptos text-md font-semibold leading-6 rounded-[12px] size-8 aspect-square flex flex-col items-center justify-center">
                  2
                </div>
                <p className="font-aptos text-md font-semibold leading-6 text-text-icons-base-main">
                  Green Median
                </p>
              </div>
              <p className="font-lato text-md font-bold leading-6 text-text-icons-base-main">
                55-60 %
              </p>
            </div>
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-row items-center gap-x-3">
                <div className="bg-primary-red-pink-light text-primary-pink font-aptos text-md font-semibold leading-6 rounded-[12px] size-8 aspect-square flex flex-col items-center justify-center">
                  3
                </div>
                <p className="font-aptos text-md font-semibold leading-6 text-text-icons-base-main">
                  Temperature
                </p>
              </div>
              <p className="font-lato text-md font-bold leading-6 text-text-icons-base-main">
                51-53 %
              </p>
            </div> */}
          </div>

          {/* <div className="w-full flex flex-row justify-end">
            <Button
              variant={"ghost"}
              className="p-0 hover:bg-transparent cursor-pointer ml-auto"
              onClick={() => {
                // onResetInput();
              }}
            >
              <div className="">
                <p className="text-primary-pink font-roboto text-[15px] font-bold tracking-[-0.15px] underline">
                  {t("yourMap.showDetail")}
                </p>
              </div>
            </Button>
          </div> */}
        </div>
      </Card>
    </>
  );
};

const ModelAccuracyAssessment = () => {
  const t = useTranslations("InteractivePanel");
  const { generateMapModelQuality, selectedDefault, selectedCustom } =
    useContext(MapGenerationContext);

  return (
    <>
      <Card className="h-full">
        <div className="space-y-4 h-full flex flex-col">
          <div className="space-y-1">
            <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
              {t("yourMap.modelAccuracyAssessment")}
            </p>
            <p className="font-aptos text-md font-regular leading-6 text-neutral-700">
              {/* WIP */}
              {/* {t("yourMap.modelAccuracyAssessmentDescription")} */}
              {selectedCustom
                ? t("yourMap.modelAccuracyAssessmentDescriptionOWNCLASS")
                : selectedDefault
                  ? t("yourMap.modelAccuracyAssessmentDescriptionDEFAULTCLASS")
                  : "error"}
            </p>
          </div>

          <div className="p-2 rounded-[12px] bg-success-50 space-y-2 ">
            <div className="flex flex-row gap-x-2">
              {/* <AlertCircleIcon className="size-6 text-danger-700" /> */}
              <p className="font-aptos text-md font-bold leading-6 text-success-700">
                {t("yourMap.modelAccuracyAssessmentPercentage", {
                  X:
                    generateMapModelQuality?.model_quality.overall_accuracy.toFixed(
                      0,
                    ) || "-",
                })}
              </p>
            </div>

            <div className="bg-white rounded-md px-3 py-2">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div className="min-w-0">
                  <p className="font-aptos text-sm font-semibold leading-5 text-text-icons-base-second">
                    {t("yourMap.overallAccuracy")}
                  </p>
                  <p className="font-noto-sans text-xl font-bold leading-7 text-text-icons-base-main">
                    {generateMapModelQuality?.model_quality.overall_accuracy.toFixed(
                      1,
                    )}
                    %
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="font-aptos text-sm font-semibold leading-5 text-text-icons-base-second">
                    {t("yourMap.kappaCoefficient")}
                  </p>
                  <p className="font-noto-sans text-xl font-bold leading-7 text-text-icons-base-main">
                    {generateMapModelQuality?.model_quality.kappa.toFixed(3)}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="font-aptos text-sm font-semibold leading-5 text-text-icons-base-second">
                    {t("yourMap.averageF1Score")}
                  </p>
                  <p className="font-noto-sans text-xl font-bold leading-7 text-text-icons-base-main">
                    {generateMapModelQuality?.model_quality.average_f1_score.toFixed(
                      3,
                    )}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="font-aptos text-sm font-semibold leading-5 text-text-icons-base-second">
                    {t("yourMap.gMeanScore")}
                  </p>
                  <p className="font-noto-sans text-xl font-bold leading-7 text-text-icons-base-main">
                    {generateMapModelQuality?.model_quality.gmean_score.toFixed(
                      3,
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-row justify-end mt-auto">
            <Button
              variant={"ghost"}
              className="p-0 hover:bg-transparent cursor-pointer ml-auto"
              onClick={() => {
                document
                  .getElementById("thematic-accuracy-card")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <p className="text-primary-pink font-roboto text-[15px] font-bold tracking-[-0.15px] underline">
                {t("yourMap.showDetail")}
              </p>
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};

const ThematicAccuracyAssessment = () => {
  const t = useTranslations("InteractivePanel");
  const { sessionId } = useContext(GlobalContext);
  const {
    thematicAccuracy,
    setThematicAccuracy,
    isThematicAccuracyLoading,
    setIsThematicAccuracyLoading,
    thematicAccuracyError,
    setThematicAccuracyError,
  } = useContext(MapGenerationContext);

  const [showUpload, setShowUpload] = useState(false);
  const [fileEnter, setFileEnter] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const submitValidationFile = (file: File) => {
    setThematicAccuracyError("");
    setIsThematicAccuracyLoading(true);

    const body = new FormData();
    body.append("file", file);
    body.append("session_id", sessionId);

    fetch(THEMATIC_ACCURACY_URL, {
      method: "POST",
      body,
    })
      .then(async (response) => {
        const json: ThematicAccuracyRes = await response.json();

        if (!response.ok) {
          throw new Error(json?.error?.message || String(response.status));
        }

        setThematicAccuracy(json.thematic_accuracy);
      })
      .catch((e) => {
        setThematicAccuracyError(String(e?.message || e));
      })
      .finally(() => {
        setIsThematicAccuracyLoading(false);
      });
  };

  const onUploadValidationFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    submitValidationFile(file);

    e.target.value = "";
  };

  const kappaLabel = thematicAccuracy
    ? thematicAccuracy.kappa > 0.8
      ? t("yourMap.thematicKappaAlmostPerfect")
      : thematicAccuracy.kappa > 0.6
        ? t("yourMap.thematicKappaSubstantial")
        : thematicAccuracy.kappa > 0.4
          ? t("yourMap.thematicKappaModerate")
          : thematicAccuracy.kappa > 0.2
            ? t("yourMap.thematicKappaFair")
            : t("yourMap.thematicKappaSlight")
    : "";

  const ci = thematicAccuracy?.overall_accuracy_ci || [];
  const wrongPoints = thematicAccuracy
    ? thematicAccuracy.n_total - thematicAccuracy.n_correct
    : 0;

  return (
    <>
      <Card>
        <div className="space-y-5">
          <div className="">
            <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
              {t("yourMap.thematicAccuracyAssessment")}
            </p>
            <p className="font-aptos text-md font-regular leading-6 text-neutral-700 mt-2">
              {t("yourMap.thematicAccuracyAssessmentDescription")}
            </p>
          </div>

          {/* Result summary */}
          {thematicAccuracy && (
            <div className="space-y-2">
              <div className="p-3 rounded-[12px] bg-primary-pink-hover space-y-2">
                <p className="font-aptos text-md font-bold leading-6 text-text-icons-base-main">
                  {t("yourMap.thematicSummaryHeadline", {
                    X: (thematicAccuracy.overall_accuracy * 100).toFixed(0),
                  })}
                </p>
                <div className="bg-white rounded-md px-3 py-2">
                  <div className="grid grid-cols-4 gap-x-4">
                    <div className="min-w-0">
                      <p className="font-aptos text-sm font-semibold leading-5 text-text-icons-base-second">
                        {t("yourMap.thematicOverallAgreement")}
                      </p>
                      <p className="font-noto-sans text-xl font-bold leading-7 text-success-700">
                        {(thematicAccuracy.overall_accuracy * 100).toFixed(1)}%
                      </p>
                      <p className="font-aptos text-xs font-regular leading-4 text-text-icons-base-second">
                        {t("yourMap.thematicCI", {
                          X: (thematicAccuracy.confidence_level * 100).toFixed(
                            0,
                          ),
                          A: (ci[0] * 100 || 0).toFixed(1),
                          B: (ci[1] * 100 || 0).toFixed(1),
                        })}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="font-aptos text-sm font-semibold leading-5 text-text-icons-base-second">
                        {t("yourMap.kappaCoefficient")}
                      </p>
                      <p className="font-noto-sans text-xl font-bold leading-7 text-success-700">
                        {thematicAccuracy.kappa.toFixed(3)}
                      </p>
                      <p className="font-aptos text-xs font-regular leading-4 text-text-icons-base-second">
                        {kappaLabel}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="font-aptos text-sm font-semibold leading-5 text-text-icons-base-second">
                        {t("yourMap.thematicPointsCorrect")}
                      </p>
                      <p className="font-noto-sans text-xl font-bold leading-7 text-success-700">
                        {thematicAccuracy.n_correct}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="font-aptos text-sm font-semibold leading-5 text-text-icons-base-second">
                        {t("yourMap.thematicPointsWrong")}
                      </p>
                      <p className="font-noto-sans text-xl font-bold leading-7 text-danger-700">
                        {wrongPoints}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-row items-center justify-between">
                <Button
                  variant={"ghost"}
                  className="p-0 hover:bg-transparent cursor-pointer"
                  onClick={() => {
                    setThematicAccuracy(null);
                    setThematicAccuracyError("");
                    setShowUpload(true);
                  }}
                >
                  <p className="text-text-icons-base-second font-aptos text-[13px] font-regular underline">
                    {t("yourMap.thematicReupload")}
                  </p>
                </Button>
                <Button
                  variant={"ghost"}
                  className="p-0 hover:bg-transparent cursor-pointer"
                  onClick={() => {
                    setIsDetailOpen(true);
                  }}
                >
                  <p className="text-primary-pink font-roboto text-[15px] font-bold tracking-[-0.15px] underline">
                    {t("yourMap.showDetail")}
                  </p>
                </Button>
              </div>
            </div>
          )}

          {/* Analyzing */}
          {!thematicAccuracy && isThematicAccuracyLoading && (
            <div className="p-4 rounded-[12px] border border-neutral-400 bg-white flex flex-row items-center gap-x-3">
              <span className="loader sm"></span>
              <p className="font-aptos text-md font-regular leading-6 text-neutral-700">
                {t("yourMap.thematicLoading")}
              </p>
            </div>
          )}

          {/* Error */}
          {!thematicAccuracy &&
            !isThematicAccuracyLoading &&
            thematicAccuracyError !== "" && (
              <div className="p-4 rounded-[12px] bg-danger-50 space-y-3">
                <p className="font-aptos text-md font-bold leading-6 text-danger-800">
                  {t("yourMap.thematicErrorCaption")}
                </p>
                <p className="font-aptos text-sm font-regular leading-5 text-danger-800">
                  {thematicAccuracyError}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setThematicAccuracyError("");
                    setShowUpload(true);
                  }}
                >
                  {t("dataTraining.sampleQualityRetry")}
                </Button>
              </div>
            )}

          {/* Upload dropzone */}
          {!thematicAccuracy &&
            !isThematicAccuracyLoading &&
            thematicAccuracyError === "" &&
            showUpload && (
              <>
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
                  onDragLeave={() => {
                    setFileEnter(false);
                  }}
                  onDragEnd={(e) => {
                    e.preventDefault();
                    setFileEnter(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setFileEnter(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      submitValidationFile(file);
                    }
                  }}
                >
                  {!fileEnter && (
                    <>
                      <div className="space-y-3">
                        <UploadIcon className="size-8 aspect-square text-text-icons-base-third mx-auto" />
                        <p className="font-aptos text-[13px] font-regular leading-4.5 text-neutrals-600 text-center">
                          {t("dataTraining.dragAndDrop")} <br />
                          {t("dataTraining.acceptedFormat", {
                            X: ".zip (.shp, .shx, .dbf, .prj)",
                          })}
                        </p>
                      </div>
                      <Label
                        htmlFor="thematic-validation-file-upload"
                        className="w-50 mx-auto flex flex-row justify-center mb-0"
                      >
                        <div className="rounded-[12px] bg-primary-pink-hover hover:bg-primary-pink-hover hover:brightness-95 cursor-pointer w-full py-1.5 px-2 transition-all duration-200">
                          <p className="font-aptos text-[13px] font-semibold leading-4.5 text-primary-red-pink-normal text-center">
                            {t("dataTraining.browseFile")}
                          </p>
                        </div>
                      </Label>
                    </>
                  )}

                  {fileEnter && (
                    <div className="absolute flex flex-col items-center justify-center gap-y-3 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <UploadIcon className="size-8 aspect-square text-primary-pink mx-auto" />
                      <p className="font-aptos text-[13px] font-regular leading-4.5 text-primary-pink text-center">
                        {t("dataTraining.dropHere")}
                      </p>
                    </div>
                  )}
                </div>
                <input
                  id="thematic-validation-file-upload"
                  type="file"
                  className="hidden"
                  accept=".zip"
                  multiple={false}
                  onChange={onUploadValidationFile}
                />
              </>
            )}

          {/* Promo */}
          {!thematicAccuracy &&
            !isThematicAccuracyLoading &&
            thematicAccuracyError === "" &&
            !showUpload && (
              <div className="p-4 rounded-md bg-text-icons-base-main space-y-4 overflow-hidden">
                <p className="font-aptos text-lg font-bold leading-6.5 text-text-icons-on-color">
                  {t("yourMap.thematicPromoTitle")}
                </p>
                <p className="font-aptos text-sm font-regular leading-5 text-text-icons-on-color opacity-80">
                  {t("yourMap.thematicPromoCaption")}
                </p>
                <div className="flex flex-row justify-end">
                  <Button
                    variant={"primary"}
                    className="px-6"
                    onClick={() => {
                      setShowUpload(true);
                    }}
                  >
                    {t("yourMap.thematicValidateMap")}
                  </Button>
                </div>
                {/* Bleeds out of the card padding so it sits flush with the
                    bottom-left edge; the card's overflow-hidden crops it. */}
                <Image
                  alt="thematic accuracy assessment preview"
                  width={709}
                  height={258}
                  src="/images/thematic-accuracy.webp"
                  className="w-[95%] -ml-4 -mb-4 rounded-tr-md"
                />
              </div>
            )}
        </div>
      </Card>
      <ThematicAccuracyDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </>
  );
};
