import { Button } from "@/components/ui/button";
import Image from "next/image";
import { StepBar } from "./StepBar";
import { ProgressPanel } from "./ProgressPanel";
import { InteractivePanel } from "./InteractivePanel";
import { FinalSummaryDialog } from "./FinalSummaryDialog";

export const NewFloatingPanel = () => {
  return (
    <div className="relative flex flex-col gap-y-3">
      <ProgressPanel />
      <InteractivePanel />

      <FinalSummaryDialog />
    </div>
  );
};
