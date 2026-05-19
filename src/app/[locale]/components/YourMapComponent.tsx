"use client";

import { Button } from "@/components/ui/button";
import { FETCH_GENERATE_MAP } from "@/constants";
import { GlobalContext } from "@/contexts/globalContext";
import { MapContext } from "@/contexts/mapContext";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { UnauthorizedError, fetchWithAuth } from "@/lib/fetchWithAuth";
import { numberThousandSeparator } from "@/lib/utils";
import { AlertCircleIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import TileLayer from "ol/layer/Tile";
import { XYZ } from "ol/source";
import { ReactNode, useContext, useEffect } from "react";
import { toast } from "sonner";

const VISUALIZATION = "visualization";
const CALC_LULC_COMP = "calculate lulc composition";
const SAMPLE_DATA_QUALITY = "sample data quality";
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
    generateMapSampleQuality,
    setGenerateMapSampleQuality,
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

    if (json.process === SAMPLE_DATA_QUALITY) {
      const data = json.data as GenerateMapDataSampleDataQuality;
      setGenerateMapSampleQuality(data);
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
        <Button
          onClick={() => {
            reset();
          }}
        >
          reset
        </Button>
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
                <ModelAccuracyAssessment />
                <LULCCompositionSummary />
                {generateMapSampleQuality &&
                  generateMapSampleQuality.lowest_separability.result_dict
                    .length > 0 && <TrainingDataQuality />}
                {/* <PredictorImportances /> */}
                <ThematicAccuracyAssessment />
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

const Card = ({ children }: { children: ReactNode }) => {
  return (
    <div className="p-3 rounded-[12px] border border-neutral-400 bg-white">
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
          <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
            {t("yourMap.lulcCompositionSummary")}
          </p>
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
          <div className="grid grid-cols-2 gap-x-4">
            <div className="space-y-3">
              {ARR_FIRST_HALF.map((item, index) => (
                <div
                  key={`compo-list-${item.class_name}-${index}`}
                  className="flex flex-row items-start"
                >
                  <div
                    className="size-5 aspect-square rounded-full mt-1 mr-2"
                    style={{
                      backgroundColor: item.class_color,
                    }}
                  />

                  <div className="mr-1 flex-1">
                    <p className="text-black font-aptos text-lg font-semibold heading-7">
                      {item.class_name}
                    </p>
                    <p className="text-black font-aptos text-[15px]] font-regular heading-5.5">
                      {numberThousandSeparator(
                        (item.area_m2 / 10000).toFixed(0),
                      )}{" "}
                      ha
                    </p>
                  </div>

                  <p
                    className="font-noto-sans text-2xl font-bold heading-7.5 tracking-[-0.24px] text-nowrap"
                    style={{
                      color: item.class_color,
                    }}
                  >
                    {item.proportion.toFixed(0)}%
                  </p>
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
                    className="size-5 aspect-square rounded-full mt-1 mr-2"
                    style={{
                      backgroundColor: item.class_color,
                    }}
                  />

                  <div className="mr-1 flex-1">
                    <p className="text-black font-aptos text-lg font-semibold heading-7">
                      {item.class_name}
                    </p>
                    <p className="text-black font-aptos text-[15px]] font-regular heading-5.5">
                      {numberThousandSeparator(
                        (item.area_m2 / 10000).toFixed(0),
                      )}{" "}
                      ha
                    </p>
                  </div>

                  <p
                    className="font-noto-sans text-2xl font-bold heading-7.5 tracking-[-0.24px] text-nowrap"
                    style={{
                      color: item.class_color,
                    }}
                  >
                    {item.proportion.toFixed(0)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

const TrainingDataQuality = () => {
  const t = useTranslations("InteractivePanel");
  const { generateMapSampleQuality, selectedDefault, selectedCustom } =
    useContext(MapGenerationContext);

  return (
    <>
      <Card>
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
              {t("yourMap.trainingDataQuality")}
            </p>
            <p className="font-aptos text-md font-regular leading-6 text-neutral-700">
              {selectedCustom
                ? t("yourMap.trainingDataQualityDescriptionOWN")
                : selectedDefault
                  ? t("yourMap.trainingDataQualityDescriptionDEFAULT")
                  : "error"}
            </p>
          </div>

          {selectedCustom && (
            <div className="p-2 rounded-[12px] bg-danger-50 space-y-2 ">
              <div className="flex flex-row gap-x-2">
                <AlertCircleIcon className="size-6 text-danger-700" />
                <p className="font-aptos text-md font-bold leading-6 text-danger-700">
                  {t("yourMap.lowSeparabilityDetected")}
                </p>
              </div>

              <div className="bg-white rounded-md px-2 py-1 font-aptos text-sm font-regular leading-5 text-danger-800">
                <p className="font-bold">
                  {t("yourMap.lowSeparabilityCaption1")}
                </p>
                <div className="">
                  {generateMapSampleQuality?.lowest_separability?.result_dict.map(
                    (item, index) => {
                      return (
                        <div
                          className="flex flex-row gap-x-2 items-start"
                          key={`separability-${index}`}
                        >
                          <div className="size-1 aspect-square mt-2 rounded-full bg-danger-800" />
                          {/* WIP */}
                          {/* <p className="">Class [X] and Class [Y]</p> */}
                          <p className="">
                            {t("yourMap.lowSeparabilityCaption2", {
                              X: item.Class1_Name,
                              Y: item.Class2_Name,
                            })}
                          </p>
                        </div>
                      );
                    },
                  )}
                </div>
                <p className="">{t("yourMap.lowSeparabilityCaption3")}</p>
              </div>
            </div>
          )}
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
      <Card>
        <div className="space-y-4">
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

            <div className="bg-white rounded-md px-2 py-1 font-aptos text-sm font-regular leading-5 text-danger-800">
              {/* <div className="grid grid-cols-4"> */}
              <div className="flex flex-row justify-evenly">
                <div className="flex flex-col items-center">
                  <p className="font-aptos text-sm font-semibold leading-5 text-text-icons-base-second text-center">
                    {t("yourMap.overallAccuracy")}
                  </p>
                  <p className="font-noto-sans text-2xl font-bold leading-7.5 text-text-icons-base-main">
                    {generateMapModelQuality?.model_quality.overall_accuracy.toFixed(
                      0,
                    )}
                    %
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="font-aptos text-sm font-semibold leading-5 text-text-icons-base-second text-center">
                    {t("yourMap.kappaCoefficient")}
                  </p>
                  <p className="font-noto-sans text-2xl font-bold leading-7.5 text-text-icons-base-main">
                    {generateMapModelQuality?.model_quality.kappa.toFixed(2)}
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="font-aptos text-sm font-semibold leading-5 text-text-icons-base-second text-center">
                    {t("yourMap.averageF1Score")}
                  </p>
                  <p className="font-noto-sans text-2xl font-bold leading-7.5 text-text-icons-base-main">
                    {generateMapModelQuality?.model_quality.average_f1_score.toFixed(
                      2,
                    )}
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="font-aptos text-sm font-semibold leading-5 text-text-icons-base-second text-center">
                    {t("yourMap.gMeanScore")}
                  </p>
                  <p className="font-noto-sans text-2xl font-bold leading-7.5 text-text-icons-base-main">
                    {generateMapModelQuality?.model_quality.gmean_score.toFixed(
                      2,
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/*
          <div className="w-full flex flex-row justify-end">
            <Button
              variant={"ghost"}
              className="p-0 hover:bg-transparent cursor-pointer ml-auto"
              onClick={() => {
                // onResetInput();
              }}
            >
              <div className="">
                <p className="text-primary-pink font-roboto text-[15px] font-bold tracking-[-0.15px] underline">
                  {t("yourMap.showAllPredictor")}
                </p>
              </div>
            </Button>
          </div>*/}
        </div>
      </Card>
    </>
  );
};

const ThematicAccuracyAssessment = () => {
  const t = useTranslations("InteractivePanel");
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
          <div className="p-3 rounded-md bg-text-icons-base-main">
            <div className="space-y-1">
              <p className="font-aptos text-md font-bold leading-6 text-text-icons-on-color">
                {t("yourMap.ronaAdTitle")}
              </p>

              <p className="font-aptos text-sm font-regular leading-5 text-text-icons-on-color">
                {t.rich("yourMap.ronaAdDescription", {
                  b: (t) => <b>{t}</b>,
                })}
              </p>
            </div>
            <div className="w-full flex flex-row justify-center mt-[35px]">
              <Image
                alt="rona"
                width={1144}
                height={1064}
                src="/images/luma-displays.webp"
                className="w-[275px] "
              />
            </div>
            <div className="space-y-3">
              <p className="font-pjs text-sm font-medium text-text-icons-on-color">
                {t("yourMap.rona")}
              </p>
              <p className="font-pjs text-xl font-bold text-text-icons-on-color">
                {t("yourMap.ronaTagline")}
              </p>
              <Button
                className="w-full rounded-md hover:bg-primary-pink hover:cursor-default"
                variant={"primary"}
                disabled
              >
                <p className="font-aptos text-[13px]">
                  {t("yourMap.ronaComingSoon")}
                </p>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};
