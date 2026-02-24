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
import { PANEL_COMPONENT_KEY } from "@/constants";

export const FinalSummaryDialog = () => {
  // const [isVisible, setIsVisible] = useState(false);
  const {
    isSummaryDialogOpen,
    setIsSummaryDialogOpen,
    setStepKey,
    setProgressPanelIndex,
  } = useContext(MapGenerationContext);

  useEffect(() => {
    console.log("isSummaryDialogOpen", isSummaryDialogOpen);
  }, [isSummaryDialogOpen]);

  const onCancel = () => {
    setIsSummaryDialogOpen(false);
  };

  const onConfirm = () => {
    setStepKey(PANEL_COMPONENT_KEY.YOUR_MAP);
    setProgressPanelIndex(5);
    setIsSummaryDialogOpen(false);
  };

  const CLASS_ARR = [
    "Sawah",
    "Hutan",
    "Badan Air",
    "Kelapa Sawit",
    "Hunian",
    "Ladang",
    "Semak",
  ];

  const CLASS_ARR_FIRST_HALF = CLASS_ARR.slice(
    0,
    Math.ceil(CLASS_ARR.length / 2),
  );
  const CLASS_ARR_SECOND_HALF = CLASS_ARR.slice(
    Math.ceil(CLASS_ARR.length / 2),
  );

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
            Ready to generate your map?
          </DialogTitle>
          <DialogDescription className="text-center font-aptos text-md font-regular text-text-icons-base-main pr-8">
            We’ll generate your land use and land cover map based on the inputs
            you’ve defined in the previous steps.
          </DialogDescription>
          <div className="py-10 space-y-7.5 w-full max-h-[calc(100vh-250px)] overflow-y-scroll pr-4 mr-4">
            <div className="space-y-2">
              <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main text-center">
                Summary of Basic Information
              </p>
              <div className="p-3 rounded-[12px] border-2 border-dashed border-secondary-purple-light-active grid grid-cols-3 bg-purple-second">
                <div className="">
                  <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
                    Area of Interest
                  </p>
                  <div className="grid grid-cols-2 gap-y-1 gap-x-3">
                    <div className="col-span-2">
                      <p className="font-aptos text-text-icons-base-second text-[15px] font-semibold heading-4.5">
                        Location :
                      </p>
                      <p className="font-aptos text-lg font-bold heading-7 text-secondary-purple-normal-hover heading-7">
                        Surabaya, East Java
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="font-aptos text-text-icons-base-second text-[15px] font-semibold heading-4.5">
                        Your selected area has total area approximately:
                      </p>
                      <p className="font-aptos text-lg font-bold heading-7 text-secondary-purple-normal-hover heading-7">
                        5.422.222 Ha
                      </p>
                    </div>
                  </div>
                </div>
                <div className="">
                  <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
                    Time Period
                  </p>
                  <div className="grid grid-cols-2 gap-y-1 gap-x-3">
                    <div className="col-span-1">
                      <p className="font-aptos text-text-icons-base-second text-[15px] font-semibold heading-4.5">
                        Temporal Resolution
                      </p>
                      <p className="font-aptos text-lg font-bold heading-7 text-secondary-purple-normal-hover heading-7">
                        Yearly
                      </p>
                    </div>
                    <div className="col-span-1">
                      <p className="font-aptos text-text-icons-base-second text-[15px] font-semibold heading-4.5">
                        Specific Period
                      </p>
                      <p className="font-aptos text-lg font-bold heading-7 text-secondary-purple-normal-hover heading-7">
                        2020
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="font-aptos text-text-icons-base-second text-[15px] font-semibold heading-4.5">
                        Date Range of Satellite Input
                      </p>
                      <p className="font-aptos text-lg font-bold heading-7 text-secondary-purple-normal-hover heading-7">
                        1 January - 31 December 2020
                      </p>
                    </div>
                  </div>
                </div>
                <div className="">
                  <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
                    Satelite Composite
                  </p>
                  <div className="grid grid-cols-2 gap-y-1 gap-x-3">
                    <div className="col-span-1">
                      <p className="font-aptos text-text-icons-base-second text-[15px] font-semibold heading-4.5">
                        Satelite
                      </p>
                      <p className="font-aptos text-lg font-bold heading-7 text-secondary-purple-normal-hover heading-7">
                        Landsat 08
                      </p>
                    </div>
                    <div className="col-span-1">
                      <p className="font-aptos text-text-icons-base-second text-[15px] font-semibold heading-4.5">
                        Cloud Coverage
                      </p>
                      <p className="font-aptos text-lg font-bold heading-7 text-secondary-purple-normal-hover heading-7">
                        15%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main text-center">
                Summary of LULC Class and Sampling
              </p>
              <div className="p-3 rounded-[12px] border-2 border-dashed border-secondary-purple-light-active grid grid-cols-3 bg-purple-second">
                <div className="">
                  <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
                    Total Class
                  </p>
                  <div className="grid grid-cols-2 gap-y-1 gap-x-3">
                    <div className="col-span-2">
                      <p className="font-aptos text-lg font-bold heading-7 text-secondary-purple-normal-hover heading-7">
                        {CLASS_ARR.length} Class
                      </p>
                    </div>
                    <div className="col-span-2">
                      <div className="grid grid-cols-2 gap-x-3">
                        <div className="col-span-1">
                          {CLASS_ARR_FIRST_HALF.map((item, index) => {
                            return (
                              <div key={`${item}${index}`}>
                                <div className="flex flex-row items-center gap-x-2">
                                  <div className="size-2 aspect-square bg-secondary-purple-normal-hover rounded-full" />
                                  <p className="font-aptos text-lg font-bold heading-7 text-secondary-purple-normal-hover heading-7">
                                    {item}
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
                                <div className="flex flex-row items-center gap-x-2">
                                  <div className="size-2 aspect-square bg-secondary-purple-normal-hover rounded-full" />
                                  <p className="font-aptos text-lg font-bold heading-7 text-secondary-purple-normal-hover heading-7">
                                    {item}
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
                        Time Period
                      </p>
                      <div className="grid grid-cols-2 gap-y-1 gap-x-3">
                        <div className="col-span-2">
                          <p className="font-aptos text-lg font-bold heading-7 text-secondary-purple-normal-hover heading-7">
                            16 Points
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <LUCClassTable />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>
        <div className="grid grid-cols-1 mt-0 pr-8">
          <Button
            onClick={() => {
              onConfirm();
            }}
            variant={"primary"}
          >
            Generate Map
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
