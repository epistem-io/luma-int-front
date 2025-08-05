"use client";

// import {
//   Table,
//   TableBody,
//   TableCaption,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
import { GlobalContext } from "@/contexts/globalContext";
import { MapContext } from "@/contexts/mapContext";
import { clearMap } from "@/utils/mapHelper";
import { Info, SlidersHorizontal, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { useContext } from "react";

interface EvaluatePanelProps {
  nextStage?: () => void;
  prevStage?: () => void;
  className?: string;
}

// function compareNumbers(a: number, b: number) {
//   return a - b;
// }

export function EvaluatePanel({ prevStage = () => {} }: EvaluatePanelProps) {
  const { analysisResult } = useContext(GlobalContext);
  const { mapInstance, setLayerLegendArray } = useContext(MapContext);

  // const { layerLegendArray } = useContext(MapContext);
  const t = useTranslations("EvaluationPanel");

  const onClickAdjustParameter = () => {
    if (!mapInstance) return;

    clearMap(mapInstance);
    setLayerLegendArray([]);

    prevStage();
  };

  return (
    // <Form {...form}>
    //   <form onSubmit={form.handleSubmit(onSubmit)} className="">

    //   </form>
    // </Form>
    <>
      <div className="bg-white z-30">
        <div className="px-6 pt-4 pb-12">
          {/* HIDE DULU */}
          {/* <div className="space-y-1">
            <p className="headline-xxs-desktop-medium text-text-icons-base-main">
              Top 3 Predictor Land Cover/Use Class Ranked by Relative Importance
              in the Map Generated
            </p>
            <p className="text-s-regular text-neutral-700-baru">
              The variable importance plot highlights that NDVI 25th percentile,
              Green median, and Temperature are the most influential predictors
              in the model, contributing the highest relative importance among
              the top 15 variables
            </p>
          </div>
          <div className="mt-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead className="text-center">
                    Land Use/Cover Class
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {layerLegendArray
                  .sort((a, b) =>
                    compareNumbers(a.originalOrder, b.originalOrder),
                  )
                  .map((item, index) => (
                    <TableRow className="py-3 h-14">
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="text-center">{item.name}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div> */}
          <div className="p-3 rounded-md bg-[rgba(253,247,249,1)] border border-neutral-400 space-y-3">
            <p className="text-m-semibold text-text-icons-base-main">
              {t("accuracyTitle")}
            </p>
            <hr className="bg-neutral-900 h-[1px] w-full" />
            <p className="text-center font-lato font-bold text-[22px] text-[rgba(239,162,47,1)]">
              {Number((analysisResult?.overall_accuracy || 0) * 100).toFixed(2)}
              %
            </p>
            <p className="text-left text-text-icons-base-main font-lato font-medium text-sm">
              Dengan koefisien Kappa{" "}
              {Number((analysisResult?.kappa_coefficient || 0) * 1).toFixed(2)},{" "}
              {analysisResult?.accuracy_assessment}
            </p>
          </div>
          <div className="p-3 rounded-md bg-[rgba(253,247,249,1)] border border-neutral-400 space-y-3 mt-5">
            <div className="flex flex-row items-center space-x-2">
              <div className="mt-0.5">
                <Info
                  className="h-5 w-5"
                  fill="rgba(37, 37, 37, 1)"
                  color="rgba(253, 247, 249, 1)"
                />
              </div>
              <p className="text-m-semibold text-text-icons-base-main">
                {t("improveAccuracy")}
              </p>
            </div>
            <div className="grid grid-cols-2 space-x-3">
              <div className="">
                <button
                  type="button"
                  disabled
                  // onClick={() => {
                  //   onClickReselect();
                  // }}
                  className="w-full h-full border border-primary-pink bg-white disabled:border-muted-foreground disabled:text-muted-foreground text-primary-pink disabled:hover:brightness-100 disabled:hover:cursor-not-allowed py-1.5 px-2 cursor-pointer hover:brightness-95 transition-all duration-300 flex flex-row justify-center items-center space-x-2"
                >
                  <p className="text-xs-semibold ">{t("readjustParameter")}</p>
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="">
                <button
                  type="button"
                  disabled
                  // onClick={() => {
                  //   onClickReselect();
                  // }}
                  className="w-full h-full border border-primary-pink bg-white disabled:border-muted-foreground disabled:text-muted-foreground text-primary-pink disabled:hover:brightness-100 disabled:hover:cursor-not-allowed py-1.5 px-2 cursor-pointer hover:brightness-95 transition-all duration-300 flex flex-row justify-center items-center space-x-2"
                >
                  <p className="text-xs-semibold ">{t("uploadNewData")}</p>
                  <Upload className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            onClickAdjustParameter();
          }}
          className="absolute bottom-0 w-full disabled:bg-muted-foreground disabled:hover:cursor-not-allowed disabled:hover:brightness-100 bg-primary-pink p-2 cursor-pointer hover:brightness-95 transition-all duration-300 flex flex-row space-x-2 items-center justify-center mt-3"
        >
          <p className="text-xs-semibold text-white">
            {t("readjustParameter")}
          </p>
        </button>
      </div>

      {/* <div className="fixed bottom-0 p-4 w-[455px] bg-neutral-100 [box-shadow:0_0_12px_0_rgba(0,_84,_109,_0.24)]">
      </div> */}
    </>
  );
}
