"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { useContext, useEffect, useState } from "react";
import { LUCClassTable } from "./LUCClassTable";
import {
  FETCH_INPUT_SUMMARY,
  PANEL_COMPONENT_KEY,
  TEMPORAL_COVERAGE_ARRAY,
} from "@/constants";
import { GlobalContext } from "@/contexts/globalContext";
import { toast } from "sonner";
import { set } from "zod";
import { useTranslations } from "next-intl";
import { TFunction } from "@/i18n/types";
import { getTemporalRangeText, numberThousandSeparator } from "@/lib/utils";
import { MapContext } from "@/contexts/mapContext";

export const FinalSummaryDialog = () => {
  // const [isVisible, setIsVisible] = useState(false);
  const {
    isSummaryDialogOpen,
    setIsSummaryDialogOpen,
    setStepKey,
    setProgressPanelIndex,
    temporalCoverage,
    temporalCoverageUnit,
    summaryData,
    setSummaryData,
  } = useContext(MapGenerationContext);

  const { resetMosaicLayer } = useContext(MapContext);

  const { sessionId } = useContext(GlobalContext);

  const t = useTranslations("InteractivePanel");

  // useEffect(() => {
  //   console.log("isSummaryDialogOpen", isSummaryDialogOpen);
  // }, [isSummaryDialogOpen]);

  const [isLoading, setIsLoading] = useState(false);
  // const [summaryData, setSummaryData] = useState<InputSummaryRes | null>(null);

  const onCancel = () => {
    setIsSummaryDialogOpen(false);
  };

  const onConfirm = () => {
    setStepKey(PANEL_COMPONENT_KEY.YOUR_MAP);
    // resetMosaicLayer();
    setProgressPanelIndex(5);
    setIsSummaryDialogOpen(false);
  };

  const getSummary = () => {
    setIsLoading(true);

    const data = {
      session_id: sessionId,
    };

    fetch(`${FETCH_INPUT_SUMMARY}?${new URLSearchParams(data)}`, {
      method: "GET",
    })
      .then(async (response) => {
        const json: InputSummaryRes = await response.json();

        if (!response.ok) {
          throw new Error(JSON.stringify(json?.message || response.text));
        }

        console.log("jsson", json);

        setSummaryData(json);
      })
      .catch((e) => {
        toast.error(`Error fetching summary: ${e}`, {
          duration: Infinity,
          dismissible: true,
          closeButton: true,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // const CLASS_ARR = [
  //   "Sawah",
  //   "Hutan",
  //   "Badan Air",
  //   "Kelapa Sawit",
  //   "Hunian",
  //   "Ladang",
  //   "Semak",
  // ];

  const CLASS_ARR_FIRST_HALF =
    summaryData?.data.training_data_summary.slice(
      0,
      Math.ceil(summaryData?.data.training_data_summary.length / 2),
    ) || [];
  const CLASS_ARR_SECOND_HALF =
    summaryData?.data.training_data_summary.slice(
      Math.ceil(summaryData?.data.training_data_summary.length / 2),
    ) || [];

  useEffect(() => {
    if (!isSummaryDialogOpen) return;

    getSummary();
  }, [isSummaryDialogOpen]);

  return (
    <Dialog
      open={isSummaryDialogOpen}
      onOpenChange={() => {
        onCancel();
      }}
    >
      <DialogContent
        id="finalSummaryDialog"
        className="p-8 pr-0 max-w-250 w-full rounded-2xl"
      >
        <DialogHeader className="flex flex-col gap-x-3 items-center">
          <DialogTitle className="text-center text-primary-pink font-aptos text-[32px] font-bold tracking-[-0.32px] pr-8">
            {t("finalSummary.finalSummaryTitle")}
          </DialogTitle>
          <DialogDescription className="text-center font-aptos text-md font-regular text-text-icons-base-main pr-8">
            {t("finalSummary.finalSummarySubtitle")}
          </DialogDescription>
          <div className="py-10 space-y-7.5 w-full max-h-[calc(100vh-250px)] overflow-y-scroll pr-4 mr-4">
            {isLoading && (
              <div className="w-full h-10 flex flex-row justify-center">
                <span className="loader "></span>
              </div>
            )}
            {!isLoading && (
              <>
                <div className="space-y-2">
                  <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main text-center">
                    {t("finalSummary.summaryOfBasicInformation")}
                  </p>
                  <div className="p-3 rounded-[12px] border-2 border-dashed border-secondary-purple-light-active grid grid-cols-3 bg-purple-second">
                    <div className="">
                      <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
                        {t("finalSummary.areaOfInterest")}
                      </p>
                      <div className="grid grid-cols-2 gap-y-1 gap-x-3">
                        {/*
                        <div className="col-span-2">
                          <p className="font-aptos text-text-icons-base-second text-[15px] font-semibold heading-4.5">
                            {t("finalSummary.location")} :
                          </p>
                          <p className="font-aptos text-lg font-bold heading-7 text-secondary-purple-normal-hover heading-7">
                            
                            Surabaya
                          </p>
                        </div>
                        */}
                        <div className="col-span-2">
                          <p className="font-aptos text-text-icons-base-second text-[15px] font-semibold heading-4.5">
                            {t("finalSummary.areaOfInterestSubtitle")}
                          </p>
                          <p className="font-aptos text-lg font-bold heading-7 text-secondary-purple-normal-hover heading-7">
                            {numberThousandSeparator(
                              (summaryData?.data.aoi.area_size || 0).toFixed(0),
                            )}{" "}
                            ha
                            {/* {summaryData?.data.aoi.area_size} m<sup>2</sup> */}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="">
                      <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
                        {t("finalSummary.yourSelectedTimePeriod")}
                      </p>
                      <div className="grid grid-cols-2 gap-y-1 gap-x-3">
                        <div className="col-span-1">
                          <p className="font-aptos text-text-icons-base-second text-[15px] font-semibold heading-4.5">
                            {t("finalSummary.temporalResolution")}
                          </p>
                          <p className="font-aptos text-lg font-bold heading-7 text-secondary-purple-normal-hover heading-7">
                            {/* WIP NO RESOLUTION */}
                            {/* {summaryData?.data.luma_params} */}
                            {TEMPORAL_COVERAGE_ARRAY.find(
                              (item) => item.value === temporalCoverage,
                            )?.labelFunction(t as TFunction) || "Error"}
                          </p>
                        </div>
                        <div className="col-span-1">
                          <p className="font-aptos text-text-icons-base-second text-[15px] font-semibold heading-4.5">
                            {t("finalSummary.specificPeriod")}
                          </p>
                          <p className="font-aptos text-lg font-bold heading-7 text-secondary-purple-normal-hover heading-7">
                            {/* WIP NO PERIOD */}
                            {/* {summaryData?.data} */}
                            {temporalCoverageUnit}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="">
                      <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
                        {t("finalSummary.satelliteComposite")}
                      </p>
                      <div className="grid grid-cols-2 gap-y-1 gap-x-3">
                        <div className="col-span-1">
                          <p className="font-aptos text-text-icons-base-second text-[15px] font-semibold heading-4.5">
                            {t("finalSummary.satellite")}
                          </p>
                          <p className="font-aptos text-lg font-bold heading-7 text-secondary-purple-normal-hover heading-7">
                            {summaryData?.data.luma_params.landsat_version}
                          </p>
                        </div>
                        <div className="col-span-1">
                          <p className="font-aptos text-text-icons-base-second text-[15px] font-semibold heading-4.5">
                            {t("finalSummary.cloudCoverage")}
                          </p>
                          <p className="font-aptos text-lg font-bold heading-7 text-secondary-purple-normal-hover heading-7">
                            {summaryData?.data.luma_params.cloud_cover}%
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="font-aptos text-text-icons-base-second text-[15px] font-semibold heading-4.5">
                            {t("finalSummary.satelliteInputDateRange")}
                          </p>
                          <p className="font-aptos text-lg font-bold heading-7 text-secondary-purple-normal-hover heading-7">
                            {/* WIP NO RANGE */}
                            {/* 1 January - 31 December 2020 */}
                            {getTemporalRangeText(
                              temporalCoverage,
                              temporalCoverageUnit,
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main text-center">
                    {t("finalSummary.summaryOfLULCSampling")}
                  </p>
                  <div className="p-3 rounded-[12px] border-2 border-dashed border-secondary-purple-light-active grid grid-cols-3 bg-purple-second">
                    <div className="">
                      <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
                        {t("finalSummary.totalClass")}
                      </p>
                      <div className="grid grid-cols-2 gap-y-1 gap-x-3">
                        <div className="col-span-2">
                          <p className="font-aptos text-lg font-bold heading-7 text-secondary-purple-normal-hover heading-7">
                            {summaryData?.data.training_data_summary.length}{" "}
                            {t("finalSummary.class")}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <div className="grid grid-cols-2 gap-x-3">
                            <div className="col-span-1">
                              {CLASS_ARR_FIRST_HALF.map((item, index) => {
                                return (
                                  <div key={`${item}${index}`}>
                                    <div className="flex flex-row items-start gap-x-2">
                                      <div className="size-2 aspect-square shrink-0 bg-secondary-purple-normal-hover rounded-full mt-2.5" />
                                      <p className="font-aptos text-lg font-bold heading-7 text-secondary-purple-normal-hover min-w-0">
                                        {item.class_name}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="col-span-1">
                              {CLASS_ARR_SECOND_HALF.map((item, index) => {
                                return (
                                  <div key={`${item}${index}`}>
                                    <div className="flex flex-row items-start gap-x-2">
                                      <div className="size-2 aspect-square shrink-0 bg-secondary-purple-normal-hover rounded-full mt-2.5" />
                                      <p className="font-aptos text-lg font-bold heading-7 text-secondary-purple-normal-hover min-w-0">
                                        {item.class_name}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="flex flex-row gap-x-3.5 items-start">
                        <div className="">
                          <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
                            {t("finalSummary.totalSamplePoints")}
                          </p>
                          <div className="grid grid-cols-2 gap-y-1 gap-x-3">
                            <div className="col-span-2">
                              <p className="font-aptos text-lg font-bold heading-7 text-secondary-purple-normal-hover heading-7">
                                {summaryData?.data.training_data_summary.reduce(
                                  (acc, cur) => acc + cur.total_items,
                                  0,
                                )}{" "}
                                {t("finalSummary.points")}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1">
                          <LUCClassTable summary />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogHeader>
        <div className="grid grid-cols-1 mt-0 pr-8">
          <Button
            onClick={() => {
              onConfirm();
            }}
            disabled={isLoading}
            variant={"primary"}
          >
            {t("finalSummary.generateMap")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
