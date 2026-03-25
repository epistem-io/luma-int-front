import { Accordion } from "@/components/ui/accordion";
import { SelectPredictorAccordion } from "./SelectPredictorAccordion";
import { RandomForestAccordion } from "./RandomForestAccordion";
import { DataValidationAccordion } from "./DataValidationAccordion";
import { useContext } from "react";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { PANEL_COMPONENT_KEY } from "@/constants";
import { Button } from "@/components/ui/button";
import { FinalSummaryDialog } from "./FinalSummaryDialog";
import { ChevronLeft } from "lucide-react";

export const LULCParamsComponent = () => {
  return (
    <>
      <Accordion
        // value={basicInformationOpenAccordion}
        // onValueChange={setBasicInformationOpenAccordion}
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
  const { setStepKey, setProgressPanelIndex, setIsSummaryDialogOpen } =
    useContext(MapGenerationContext);

  const isNextDisabled = false;

  const isBackDisabled = false;

  const onClickNext = () => {
    // setStepKey(PANEL_COMPONENT_KEY.LULC_PARAMS);
    // setProgressPanelIndex(4);
    setIsSummaryDialogOpen(true);
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
          Next
        </Button>
      </div>
    </div>
  );
};
