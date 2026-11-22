"use client";

import { useObservedHeight } from "@/lib/hooks";
import { ProgressPanel } from "./ProgressPanel";
import { InteractivePanel } from "./InteractivePanel";
import { FinalSummaryDialog } from "./FinalSummaryDialog";
import { YourMapDialog } from "./YourMapDialog";

export const NewFloatingPanel = () => {
  // The interactive panel sizes its scroll area from the space left under
  // the progress panel, so measure it instead of hard-coding its height.
  const { ref: progressPanelRef, height: progressPanelHeight } =
    useObservedHeight<HTMLDivElement>();

  return (
    <div className="relative flex flex-col gap-y-3">
      <div ref={progressPanelRef}>
        <ProgressPanel />
      </div>
      <InteractivePanel progressPanelHeight={progressPanelHeight} />

      <FinalSummaryDialog />
      <YourMapDialog />
    </div>
  );
};
