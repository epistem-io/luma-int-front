import { ComingSoon } from "@/components/ComingSoon";
import {
  AccordionContent,
  AccordionFullTrigger,
  AccordionItem,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useContext, useState } from "react";
import {
  SectionTitle,
  SummaryBox,
  SummaryChangeLink,
  SummaryField,
  SummaryHeading,
} from "./SummaryField";
import { useStepNavigation } from "./useStepNavigation";

const SPLIT_RATIO_TICKS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

export const RandomForestAccordion = () => {
  const {
    numberOfTrees,
    setNumberOfTrees,
    numberOfTreesError,
    setNumberOfTreesError,
    minLeafPopulation,
    setMinLeafPopulation,
    minLeafPopulationError,
    setMinLeafPopulationError,
    splitRatio,
    setSplitRatio,
    isAutoPointsFlow,
    isModelSettingsSet,
    setIsModelSettingsSet,
  } = useContext(MapGenerationContext);
  const { isViewOnly } = useStepNavigation();

  // The default classification fixes these settings: nothing to set. A
  // step opened from Your Map shows the summary, read-only.
  const showSummary = !isAutoPointsFlow && (isModelSettingsSet || isViewOnly);
  const isDone = isAutoPointsFlow || isModelSettingsSet || isViewOnly;

  const [hasSlid, setHasSlid] = useState(false);

  const tInteractive = useTranslations("InteractivePanel");

  const validateField = (
    value: string,
    min: number,
    max: number,
    fieldLabel: string,
  ) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return tInteractive("lulcParams.rfFieldRequired", { field: fieldLabel });
    }

    if (!/^\d+$/.test(trimmedValue)) {
      return tInteractive("lulcParams.rfFieldInteger", { field: fieldLabel });
    }

    const parsedValue = Number(trimmedValue);

    if (parsedValue < min || parsedValue > max) {
      return tInteractive("lulcParams.rfFieldRange", {
        field: fieldLabel,
        min,
        max,
      });
    }

    return "";
  };

  // Validates and applies both fields; on success the card is ticked and
  // shows its summary. Going on to the last screen is the footer's Next.
  const onClickSetVariable = () => {
    const treesError = validateField(
      numberOfTrees,
      10,
      500,
      tInteractive("lulcParams.nOfTree"),
    );
    const minLeafError = validateField(
      minLeafPopulation,
      1,
      50,
      tInteractive("lulcParams.minLeafPop"),
    );

    setNumberOfTreesError(treesError);
    setMinLeafPopulationError(minLeafError);

    if (treesError || minLeafError) {
      return;
    }

    setNumberOfTrees(numberOfTrees.trim());
    setMinLeafPopulation(minLeafPopulation.trim());
    setIsModelSettingsSet(true);
  };

  return (
    <AccordionItem
      value={"random-forest"}
      // last:border-b overrides the ui primitive's last:border-b-0, which
      // would otherwise strip this card's bottom border.
      className="rounded-xl border border-neutral-400 bg-white pb-3 last:border-b"
    >
      <AccordionFullTrigger
        icon={
          <ChevronDown className="h-5 w-5 shrink-0 text-primary-pink transition-transform duration-200" />
        }
        className="hover:no-underline p-3 pb-0"
      >
        <SectionTitle
          title={tInteractive("lulcParams.RFVariable")}
          isDone={isDone}
        />
      </AccordionFullTrigger>

      {showSummary && (
        <AccordionContent className="mt-3 px-3 pb-0">
          <SummaryBox className="space-y-3">
            <SummaryHeading>
              {tInteractive("lulcParams.RFVariableSummary")}
            </SummaryHeading>
            <div className="grid grid-cols-2 gap-x-4">
              <SummaryField
                label={tInteractive("lulcParams.nOfTree")}
                value={numberOfTrees.trim() || "-"}
              />
              <SummaryField
                label={tInteractive("lulcParams.minLeafPop")}
                value={minLeafPopulation.trim() || "-"}
              />
            </div>
            <div className="h-px w-full bg-primary-pink/25" />
            <SummaryHeading>
              {tInteractive("lulcParams.splitRatioSummary")}
            </SummaryHeading>
            <div className="relative">
              <div className="grid grid-cols-2 gap-x-4">
                <SummaryField
                  label={tInteractive("lulcParams.training")}
                  value={`${splitRatio}%`}
                />
                <SummaryField
                  label={tInteractive("lulcParams.testing")}
                  value={`${100 - splitRatio}%`}
                />
              </div>
              {!isViewOnly && (
                <div className="absolute bottom-0 right-0">
                  <SummaryChangeLink
                    label={tInteractive("common.changeInput")}
                    onClick={() => setIsModelSettingsSet(false)}
                  />
                </div>
              )}
            </div>
          </SummaryBox>
        </AccordionContent>
      )}

      {!showSummary && (
      <AccordionContent className="mt-2 space-y-6 px-3 pb-3">
        <div className="">
          <p className="text-l-medium font-aptos text-base font-normal leading-6 text-neutral-700-baru">
            {tInteractive.rich("lulcParams.RFVariableDesc", {
              br: () => <br></br>,
            })}
          </p>
        </div>
        <div
          className={cn(
            "rounded-md p-0 space-y-5 bg-white",
            isAutoPointsFlow && "cursor-not-allowed",
          )}
        >
          <div className="grid grid-cols-2 space-x-5">
            <div className="space-y-2">
              <Label>
                <p className="text-text-icons-base-second font-aptos text-sm font-regular heading-5">
                  {tInteractive("lulcParams.nOfTree")}
                </p>
              </Label>
              <Input
                type="text"
                disabled={isAutoPointsFlow}
                value={numberOfTrees}
                onChange={(e) => {
                  setNumberOfTrees(e.target.value);
                }}
                aria-invalid={Boolean(numberOfTreesError)}
                className={cn(
                  "border-neutrals-400 bg-neutrals-100",
                  numberOfTreesError && "border-destructive",
                )}
              />
              {numberOfTreesError ? (
                <p className="font-aptos text-xs font-regular heading4 text-destructive">
                  {numberOfTreesError}
                </p>
              ) : (
                <p className="font-aptos text-xs font-regular heading4 text-text-icons-base-second">
                  {tInteractive("lulcParams.fillWNum", { min: 10, max: 500 })}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>
                <p className="text-text-icons-base-second font-aptos text-sm font-regular heading-5">
                  {tInteractive("lulcParams.minLeafPop")}
                </p>
              </Label>
              <Input
                type="text"
                disabled={isAutoPointsFlow}
                value={minLeafPopulation}
                onChange={(e) => {
                  setMinLeafPopulation(e.target.value);
                }}
                aria-invalid={Boolean(minLeafPopulationError)}
                className={cn(
                  "border-neutrals-400 bg-neutrals-100",
                  minLeafPopulationError && "border-destructive",
                )}
              />
              {minLeafPopulationError ? (
                <p className="font-aptos text-xs font-regular heading4 text-destructive">
                  {minLeafPopulationError}
                </p>
              ) : (
                <p className="font-aptos text-xs font-regular heading4 text-text-icons-base-second">
                  {tInteractive("lulcParams.fillWNum", { min: 1, max: 50 })}
                </p>
              )}
            </div>
          </div>
          {/* Split ratio: training share in percent. */}
          <div className="space-y-3">
            <p className="font-aptos text-lg font-bold leading-6 text-text-icons-base-main">
              {tInteractive("lulcParams.splitRatio")}
            </p>
            <Slider
              step={10}
              min={0}
              max={100}
              value={[splitRatio]}
              disabled={isAutoPointsFlow}
              trackBgColor="bg-neutral-300"
              rangeBgColor={hasSlid ? "border-primary-pink bg-primary-pink": "border-[#F2D0DD] bg-[#FFE3ED]"}
              thumbBgColor={hasSlid ? "border-primary-pink bg-primary-pink": "border-[#F2D0DD] bg-[#FFE3ED]"}
              className="cursor-pointer data-[disabled]:cursor-not-allowed"
              onValueChange={(value) => {
                setSplitRatio(value[0] ?? 70);
                setHasSlid(true);
              }}
            />
            <div className="relative mx-2 h-5">
              {SPLIT_RATIO_TICKS.map((tick) => (
                <p
                  key={tick}
                  className="absolute top-0 -translate-x-1/2 font-aptos text-sm font-bold leading-5 text-primary-pink"
                  style={{left: `${tick}%`}}
                >
                  {tick}
                </p>
              ))}
            </div>
            <div className="grid grid-cols-2 space-x-5">
              <div className="space-y-1">
                <p className="font-aptos text-base font-regular leading-6 text-text-icons-base-second">
                  {tInteractive("lulcParams.training")}
                </p>
                <p className="font-noto-sans text-3xl font-regular leading-9 text-text-icons-base-main">
                  {splitRatio}%
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-aptos text-base font-regular leading-6 text-text-icons-base-second">
                  {tInteractive("lulcParams.testing")}
                </p>
                <p className="font-noto-sans text-3xl font-regular leading-9 text-text-icons-base-main">
                  {100 - splitRatio}%
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-start">
          <Button
            variant="primary"
            disabled={isAutoPointsFlow}
            onClick={() => {
              onClickSetVariable();
            }}
          >
            {tInteractive("lulcParams.setVariable")}
          </Button>
        </div>
      </AccordionContent>
      )}
    </AccordionItem>
  );
};
