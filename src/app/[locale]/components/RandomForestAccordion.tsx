import { ComingSoon } from "@/components/ComingSoon";
import {
  AccordionContent,
  AccordionFullTrigger,
  AccordionItem,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PANEL_COMPONENT_KEY } from "@/constants";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useContext } from "react";

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
    setLULCParamsOpenAccordion,
    setStepKey,
    setProgressPanelIndex,
    isAutoPointsFlow,
  } = useContext(MapGenerationContext);

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

  // Validates and applies both fields; on success it behaves exactly like
  // the footer's Next: collapse the accordion and open the mapping-parameter
  // summary view.
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
    setLULCParamsOpenAccordion("");
    setStepKey(PANEL_COMPONENT_KEY.LULC_PARAMS_SUMMARY);
    setProgressPanelIndex(3);
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
        <p className="font-noto-sans text-xl font-semibold leading-7 tracking-[-0.2px] text-primary-pink">
          {tInteractive("lulcParams.RFVariable")}
        </p>
      </AccordionFullTrigger>
      <AccordionContent className="mt-2 space-y-6 px-3 pb-3">
        <div className="">
          <p className="text-l-medium font-aptos text-base font-normal leading-6 text-neutral-700-baru">
            {tInteractive.rich("lulcParams.RFVariableDesc", {
              br: () => <br></br>,
            })}
          </p>
        </div>
        <div className="rounded-md p-0 space-y-5 bg-white cursor-not-allowed">
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
    </AccordionItem>
  );
};
