import { Accordion } from "@/components/ui/accordion";
import { SelectPredictorAccordion } from "./SelectPredictorAccordion";
import { RandomForestAccordion } from "./RandomForestAccordion";
import { DataValidationAccordion } from "./DataValidationAccordion";
import { useContext } from "react";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { PANEL_COMPONENT_KEY } from "@/constants";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";

export const LULCParamsComponent = () => {
  const { lulcParamsOpenAccordion, setLULCParamsOpenAccordion } =
    useContext(MapGenerationContext);

  return (
    <>
      <Accordion
        value={lulcParamsOpenAccordion}
        onValueChange={(value) => {
          setLULCParamsOpenAccordion(value as typeof lulcParamsOpenAccordion);
        }}
        type="single"
        collapsible
        className="space-y-4"
      >
        <SelectPredictorAccordion />
        <RandomForestAccordion />
        <DataValidationAccordion />
        {/* <AreaScopingAccordion />
        <TimePeriodAccordion />
        <SateliteCompositeAccordion /> */}
      </Accordion>
    </>
  );
};
export const LULCParamsFooter = () => {
  const {
    numberOfTrees,
    setNumberOfTrees,
    setNumberOfTreesError,
    minLeafPopulation,
    setMinLeafPopulation,
    setMinLeafPopulationError,
    setLULCParamsOpenAccordion,
    setStepKey,
    setProgressPanelIndex,
  } = useContext(MapGenerationContext);
  const t = useTranslations("InteractivePanel");

  const isNextDisabled = false;

  const isBackDisabled = false;

  const validateRandomForestField = (
    value: string,
    min: number,
    max: number,
    fieldLabel: string,
  ) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return t("lulcParams.rfFieldRequired", { field: fieldLabel });
    }

    if (!/^\d+$/.test(trimmedValue)) {
      return t("lulcParams.rfFieldInteger", { field: fieldLabel });
    }

    const parsedValue = Number(trimmedValue);

    if (parsedValue < min || parsedValue > max) {
      return t("lulcParams.rfFieldRange", {
        field: fieldLabel,
        min,
        max,
      });
    }

    return "";
  };

  const onClickNext = () => {
    const trimmedNumberOfTrees = numberOfTrees.trim();
    const trimmedMinLeafPopulation = minLeafPopulation.trim();
    const numberOfTreesError = validateRandomForestField(
      numberOfTrees,
      10,
      500,
      t("lulcParams.nOfTree"),
    );
    const minLeafPopulationError = validateRandomForestField(
      minLeafPopulation,
      1,
      50,
      t("lulcParams.minLeafPop"),
    );

    setNumberOfTreesError(numberOfTreesError);
    setMinLeafPopulationError(minLeafPopulationError);

    if (numberOfTreesError || minLeafPopulationError) {
      return;
    }

    setNumberOfTrees(trimmedNumberOfTrees);
    setMinLeafPopulation(trimmedMinLeafPopulation);
    setLULCParamsOpenAccordion("");
    setStepKey(PANEL_COMPONENT_KEY.LULC_PARAMS_SUMMARY);
    setProgressPanelIndex(3);
  };

  const onClickBack = () => {
    setStepKey(PANEL_COMPONENT_KEY.DATA_TRAINING);
    setProgressPanelIndex(2);
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
        {/* {isLUCLoading && (
          <div className="w-full h-10 flex flex-row justify-center">
            <span className="loader sm"></span>
          </div>
        )} */}
        {/* {!isLUCLoading && (
        )} */}
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
      </div>
    </div>
  );
};
