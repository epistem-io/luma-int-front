"use client";

import { PANEL_COMPONENT_KEY } from "@/constants";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { MAP_PROGRESS_INDEX, type WizardStep } from "@/lib/stepRules";
import { cn } from "@/lib/utils";
import { MapIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { CSSProperties, Fragment, ReactNode, useContext } from "react";
import { useStepNavigation } from "./useStepNavigation";

const STEPS = ["basicInfo", "classes", "samples", "parameters"] as const;

const MAP_READY_INDEX = STEPS.length;

const dashedLine = (color: string): CSSProperties => ({
  backgroundImage: `linear-gradient(to right, ${color} 5px, transparent 5px)`,
  backgroundSize: "9px 2px",
  backgroundRepeat: "repeat-x",
});

// Renders a button when the step can be jumped to, a plain element otherwise.
const StepTarget = ({
  onClick,
  className,
  isCurrent,
  children,
}: {
  onClick?: () => void;
  className: string;
  isCurrent?: boolean;
  children: ReactNode;
}) =>
  onClick ? (
    <button
      type="button"
      onClick={onClick}
      className={cn(className, "cursor-pointer transition-[filter] hover:brightness-125")}
    >
      {children}
    </button>
  ) : (
    <div aria-current={isCurrent ? "step" : undefined} className={className}>
      {children}
    </div>
  );

export const StepBar = () => {
  const { progressPanelIndex: stepIndex, stepKey } =
    useContext(MapGenerationContext);
  const t = useTranslations("InteractivePanel.stepBar");
  const {
    activeStepIndex,
    filledSteps,
    isBusy,
    canJumpTo,
    goToStep,
    goToYourMap,
  } = useStepNavigation();
  // Behind the current step = done (maroon); ahead but already filled after
  // jumping back = light pink; ahead and empty = gray.
  const isFilledAhead = (index: number) =>
    index !== activeStepIndex &&
    index >= stepIndex &&
    index < STEPS.length &&
    filledSteps[(index + 1) as WizardStep];
  const isMapReady = stepIndex >= MAP_READY_INDEX;
  const canGoToMap =
    stepIndex >= MAP_PROGRESS_INDEX &&
    stepKey !== PANEL_COMPONENT_KEY.YOUR_MAP &&
    !isBusy;

  return (
    <div className="flex flex-row items-center px-6 pb-7">
      {STEPS.map((key, index) => {
        const step = (index + 1) as WizardStep;
        const isCurrent = index === activeStepIndex;
        const isDone = !isCurrent && index < stepIndex;
        const isFilled = isFilledAhead(index);

        return (
          <Fragment key={key}>
            <StepTarget
              onClick={canJumpTo(step) ? () => goToStep(step) : undefined}
              isCurrent={isCurrent}
              className={cn(
                "relative size-6 shrink-0 rounded-md ring-2 flex justify-center items-center",
                isDone &&
                  "bg-primary-red-pink-dark-hover text-primary-red-pink-light-hover ring-primary-red-pink-normal",
                isCurrent &&
                  "bg-primary-red-pink-normal text-text-icons-on-color ring-[#F2A5C3]",
                isFilled &&
                  "bg-primary-red-pink-light-hover text-primary-red-pink-normal ring-primary-red-pink-normal/50",
                !isDone &&
                  !isCurrent &&
                  !isFilled &&
                  "bg-text-icons-disabled text-text-icons-base-third ring-text-icons-on-color",
              )}
            >
              <span className="font-roboto text-lg leading-none font-semibold">
                {index + 1}
              </span>
              <span
                className={cn(
                  "absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap font-noto-sans text-sm",
                  isCurrent
                    ? "font-semibold text-[#F28AB3]"
                    : isDone
                      ? "text-primary-red-pink-light-hover"
                      : isFilled
                        ? "text-[#F2A5C3]"
                        : "text-neutrals-400",
                )}
              >
                {t(key)}
              </span>
            </StepTarget>

            {/* Line into the next step takes that step's state colour. */}
            <div
              className="flex-1 min-w-4 h-0.5 mx-1.5"
              style={dashedLine(
                index < stepIndex
                  ? "var(--color-primary-red-pink-normal)"
                  : isFilledAhead(index + 1)
                    ? "#F2A5C3"
                    : "var(--color-neutrals-500)",
              )}
            />
          </Fragment>
        );
      })}
      <StepTarget
        onClick={canGoToMap ? goToYourMap : undefined}
        isCurrent={stepKey === PANEL_COMPONENT_KEY.YOUR_MAP}
        className={cn(
          "shrink-0 flex flex-row items-center gap-1.5 px-3 py-1 rounded-lg border-[1.5px] font-noto-sans text-sm font-semibold",
          isMapReady
            ? "bg-primary-red-pink-normal border-primary-red-pink-normal text-text-icons-on-color"
            : "bg-text-icons-base-fourth border-text-icons-disabled text-text-icons-base-third",
        )}
      >
        <MapIcon size={16} />
        {t("yourMap")}
      </StepTarget>
    </div>
  );
};
