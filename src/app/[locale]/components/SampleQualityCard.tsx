"use client";

import { useContext, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { GlobalContext } from "@/contexts/globalContext";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";

const OVERALL_STYLE: Record<
  SampleQualityOverall,
  { card: string; label: string }
> = {
  good: {
    card: "bg-success-50",
    label: "text-success-700",
  },
  med: {
    card: "bg-warning-50",
    label: "text-warning-700",
  },
  poor: {
    card: "bg-danger-50",
    label: "text-danger-800",
  },
};

export const SampleQualityCard = () => {
  const t = useTranslations("InteractivePanel");
  const { sessionId } = useContext(GlobalContext);
  const {
    sampleQuality,
    isSampleQualityLoading,
    sampleQualityError,
    fetchSampleQuality,
  } = useContext(MapGenerationContext);

  // Rendered inside the score banner; the section is collapsible and
  // re-expands whenever a new analysis starts.
  const [isOpen, setIsOpen] = useState(true);
  useEffect(() => {
    if (isSampleQualityLoading) setIsOpen(true);
  }, [isSampleQualityLoading]);

  if (!isSampleQualityLoading && !sampleQuality && !sampleQualityError) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-3">
      <div className="space-y-1">
        <CollapsibleTrigger className="w-full flex flex-row items-center justify-between gap-x-3 cursor-pointer text-left">
          <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-primary-pink">
            {t("dataTraining.sampleQualityTitle")}
          </p>
          <ChevronDown
            className={cn(
              "size-5 shrink-0 text-primary-pink transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        </CollapsibleTrigger>
        <p className="font-aptos text-md font-regular leading-6 text-neutral-700">
          {t("dataTraining.sampleQualityDescription")}
        </p>
      </div>

      <CollapsibleContent className="collapsible-content-primitive space-y-3">
      {isSampleQualityLoading && (
        <div className="p-4 rounded-[12px] border border-neutral-400 bg-white flex flex-row items-center gap-x-3">
          <span className="loader sm"></span>
          <p className="font-aptos text-md font-regular leading-6 text-neutral-700">
            {t("dataTraining.sampleQualityLoading")}
          </p>
        </div>
      )}

      {!isSampleQualityLoading && sampleQualityError !== "" && (
        <div className="p-4 rounded-[12px] bg-danger-50 space-y-3">
          <p className="font-aptos text-md font-regular leading-6 text-danger-800">
            {t("dataTraining.sampleQualityErrorCaption")}
          </p>
          <Button
            variant="outline"
            onClick={() => fetchSampleQuality(sessionId)}
          >
            {t("dataTraining.sampleQualityRetry")}
          </Button>
        </div>
      )}

      {/* No confirm / re-upload actions here anymore: a shown result is
          enough for the footer's Next, and re-running goes through the
          score banner's Recheck Score button. */}
      {!isSampleQualityLoading && !sampleQualityError && sampleQuality && (
        <SampleQualityResultCard result={sampleQuality} />
      )}
      </CollapsibleContent>
    </Collapsible>
  );
};

const SampleQualityResultCard = ({
  result,
}: {
  result: SampleQualityResult;
}) => {
  const t = useTranslations("InteractivePanel");

  const style = OVERALL_STYLE[result.overall];

  const overallLabel =
    result.overall === "good"
      ? t("dataTraining.sampleQualityGood")
      : result.overall === "med"
        ? t("dataTraining.sampleQualityMed")
        : t("dataTraining.sampleQualityPoor");

  return (
    <div className={cn("p-3 rounded-[12px] space-y-3", style.card)}>
      <div className="flex flex-row justify-between items-start">
        <p className="font-aptos text-md font-semibold leading-6 text-text-icons-base-main">
          {t("dataTraining.sampleQuality")}
        </p>
        <p className="font-aptos text-sm font-regular leading-5 text-text-icons-base-second text-right">
          {t("dataTraining.sampleQualityMeanTD")}
        </p>
      </div>

      <div className="flex flex-row justify-between items-end gap-x-4">
        <div className="flex flex-row items-baseline gap-x-2">
          <p
            className={cn(
              "font-noto-sans text-4xl font-bold tracking-[-0.4px]",
              style.label,
            )}
          >
            {overallLabel}
          </p>
          <p
            className={cn(
              "font-aptos text-md font-regular leading-6",
              style.label,
            )}
          >
            {t("dataTraining.sampleQualityClassesCaption", {
              X: result.classes_good,
              Y: result.classes_analyzed ?? result.classes_total,
            })}
          </p>
        </div>
        <p
          className={cn(
            "font-noto-sans text-3xl font-bold tracking-[-0.32px]",
            style.label,
          )}
        >
          {result.mean_td.toFixed(2)}
        </p>
      </div>

      {(result.classes_dropped?.length ?? 0) > 0 && (
        <div className="bg-white rounded-md px-3 py-2 font-aptos text-sm font-regular leading-5 text-text-icons-base-main">
          <p className="font-bold">
            {t("dataTraining.sampleQualityDroppedClasses")}
          </p>
          <div className="">
            {result.classes_dropped?.map((item) => (
              <div
                className="flex flex-row gap-x-2 items-start"
                key={`sample-quality-dropped-${item.class_id}`}
              >
                <div className="size-1 aspect-square mt-2 rounded-full bg-text-icons-base-main" />
                <p className="">{item.class_name}</p>
              </div>
            ))}
          </div>
          <p className="">{t("dataTraining.sampleQualityDroppedCaption")}</p>
        </div>
      )}

      {(result.low_sample_classes?.length ?? 0) > 0 && (
        <div className="bg-white rounded-md px-3 py-2 font-aptos text-sm font-regular leading-5 text-text-icons-base-main">
          <p className="font-bold">
            {t("dataTraining.sampleQualityLowSamples")}
          </p>
          <div className="">
            {result.low_sample_classes?.map((item) => (
              <div
                className="flex flex-row gap-x-2 items-start"
                key={`sample-quality-low-${item.class_id}`}
              >
                <div className="size-1 aspect-square mt-2 rounded-full bg-text-icons-base-main" />
                <p className="">
                  {t("dataTraining.sampleQualityLowSampleItem", {
                    X: item.class_name,
                    Y: item.pixels,
                  })}
                </p>
              </div>
            ))}
          </div>
          <p className="">{t("dataTraining.sampleQualityLowSamplesCaption")}</p>
        </div>
      )}

      {result.problem_pairs
        .slice()
        .sort((a, b) => a.TD_Distance - b.TD_Distance)
        .map((item, index) => (
          <div
            className="flex flex-row gap-x-2 items-start"
            key={`sample-quality-pair-${index}`}
          >
            <div className="size-1 aspect-square mt-2 rounded-full bg-text-icons-base-main"/>
            <p className="">
              {t("dataTraining.sampleQualityPair", {
                X: item.Class1_Name,
                Y: item.Class2_Name,
              })}{" "}
              <span className={cn("font-bold", item.TD_Distance < 1.0 ? "text-danger-800" : "text-warning-700")}>
                {t("dataTraining.sampleQualityPairTD", {
                  X: item.TD_Distance.toFixed(2),
                })}
              </span>
            </p>
          </div>
      ))}

      <div className="grid grid-cols-3 gap-x-3">
        <div className="bg-white/60 rounded-md p-2 text-center space-y-1">
          <p className="font-aptos text-sm font-regular leading-5 text-text-icons-base-second">
            {t("dataTraining.sampleQualityGoodTile")}
          </p>
          <p className="font-noto-sans text-xl font-bold text-success-700">
            {result.pair_counts.good}
          </p>
        </div>
        <div className="bg-white/60 rounded-md p-2 text-center space-y-1">
          <p className="font-aptos text-sm font-regular leading-5 text-text-icons-base-second">
            {t("dataTraining.sampleQualityWeakTile")}
          </p>
          <p className="font-noto-sans text-xl font-bold text-warning-700">
            {result.pair_counts.weak}
          </p>
        </div>
        <div className="bg-white/60 rounded-md p-2 text-center space-y-1">
          <p className="font-aptos text-sm font-regular leading-5 text-text-icons-base-second">
            {t("dataTraining.sampleQualityPoorTile")}
          </p>
          <p className="font-noto-sans text-xl font-bold text-danger-800">
            {result.pair_counts.poor}
          </p>
        </div>
      </div>
    </div>
  );
};
