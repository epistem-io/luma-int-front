"use client";

import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useContext } from "react";

interface Props {
  // stepIndex: number;
}

const NUMBER_OF_STEPS = 5;

export const StepBar = ({}: Props) => {
  const { progressPanelIndex: stepIndex } = useContext(MapGenerationContext);

  const steps = Array.from(
    { length: NUMBER_OF_STEPS },
    (_, index) => index + 1,
  );

  return (
    <div className="flex flex-row justify-between items-center relative">
      {steps.map((step, index) => (
        <div
          key={`stepbar-${step}`}
          className={cn(
            "rounded-md aspect-square w-6 flex justify-center items-center z-20",
            {
              "bg-primary-red-pink-normal text-text-icons-on-color":
                // past or current step
                index <= stepIndex,
              "bg-text-icons-disabled text-text-icons-base-third border-[0.8px] border-text-icons-disabled":
                // future step
                index > stepIndex,
            },
          )}
        >
          {
            // past step
            index < stepIndex && (
              <Check size={16} className="text-text-icons-on-color stroke-3" />
            )
          }
          {
            // current and future step
            index >= stepIndex && (
              <p className="font-roboto text-md font-semibold tracking-[-0.16px]">
                {step}
              </p>
            )
          }
        </div>
      ))}
      <div className="absolute w-full h-px border-text-icons-disabled progress-border"></div>
    </div>
  );
};
