import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Download, SquarePenIcon } from "lucide-react";
import { ReactNode } from "react";

// Building blocks for the step summaries and the final summary dialog.

export const SummaryHeading = ({ children }: { children: ReactNode }) => (
  <p className="font-noto-sans text-xl font-semibold leading-7 tracking-[-0.2px] text-text-icons-base-main">
    {children}
  </p>
);

type SummarySize = "md" | "sm";

const FIELD_LABEL_CLS: Record<SummarySize, string> = {
  md: "text-[15px] leading-5.5",
  sm: "text-xs leading-4.5",
};

const FIELD_VALUE_CLS: Record<SummarySize, string> = {
  md: "text-lg leading-7 tracking-[-0.18px]",
  sm: "text-sm leading-5",
};

interface SummaryFieldProps {
  label: ReactNode;
  value: ReactNode;
  className?: string;
  size?: SummarySize;
}

// Value sits at the bottom so values in the same row line up
// even when one label wraps to two lines.
export const SummaryField = ({
  label,
  value,
  className,
  size = "md",
}: SummaryFieldProps) => (
  <div className={cn("flex min-w-0 flex-col", className)}>
    <p
      className={cn(
        "font-aptos text-text-icons-base-second",
        FIELD_LABEL_CLS[size],
      )}
    >
      {label}
    </p>
    <p
      className={cn(
        "mt-auto font-noto-sans font-bold text-primary-red-pink-normal-active wrap-break-word",
        FIELD_VALUE_CLS[size],
      )}
    >
      {value}
    </p>
  </div>
);

export const PredictorChips = ({
  labels,
  size = "md",
}: {
  labels: string[];
  size?: SummarySize;
}) => (
  <div className="flex flex-wrap gap-1.5">
    {labels.map((label) => (
      <span
        key={label}
        className={cn(
          "rounded-full border border-primary-pink/30 bg-white font-aptos font-semibold text-primary-red-pink-normal-active",
          size === "md"
            ? "px-3 py-1 text-sm leading-5"
            : "px-2.5 py-0.5 text-xs leading-4.5",
        )}
      >
        {label}
      </span>
    ))}
  </div>
);

interface SummaryActionProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

// Pink "Download …" link that sits on the right of a summary heading.
export const SummaryDownloadButton = ({
  label,
  onClick,
  disabled,
}: SummaryActionProps) => (
  <Button
    variant={"ghost"}
    className="h-auto p-0 gap-1.5 shrink-0 cursor-pointer hover:bg-transparent font-aptos text-sm font-semibold text-primary-red-pink-normal hover:text-primary-red-pink-normal-active"
    disabled={disabled}
    onClick={onClick}
  >
    <Download className="size-4" />
    {label}
  </Button>
);

// Light-pink "Edit …" button between Back and Next in summary footers.
export const SummaryEditButton = ({
  label,
  onClick,
  disabled,
}: SummaryActionProps) => (
  <Button
    variant={"ghost"}
    disabled={disabled}
    onClick={onClick}
    className="shrink-0 gap-1.5 bg-primary-pink-hover text-primary-red-pink-normal hover:bg-primary-pink-hover hover:text-primary-red-pink-normal hover:brightness-95 cursor-pointer"
  >
    <SquarePenIcon className="size-4" />
    {label}
  </Button>
);
