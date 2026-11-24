import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Download, Lightbulb, SquarePenIcon } from "lucide-react";
import { ReactNode } from "react";

// Building blocks for the step summaries and the final summary dialog.

// Title of a step 1 input section (area, time period, satellite), with a
// status circle: empty pink outline until the section is filled in, then a
// green tick.
export const SectionTitle = ({
  title,
  isDone,
}: {
  title: string;
  isDone: boolean;
}) => (
  <div className="flex flex-row items-center gap-x-2">
    <span
      aria-hidden="true"
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-full",
        isDone
          ? "bg-green-600"
          : "border-[1.5px] border-primary-pink/70 bg-white",
      )}
    >
      {isDone && <Check className="size-3.5 text-white" strokeWidth={3} />}
    </span>
    <p className="font-noto-sans text-xl font-semibold leading-7 tracking-[-0.2px] text-primary-pink">
      {title}
    </p>
  </div>
);

// Yellow tip box with a lightbulb, for "good to know before you choose" notes.
export const HintBox = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-row gap-x-2 rounded-r-md border-l-2 border-amber-400 bg-amber-50 px-3 py-2">
    <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-500" />
    <p className="font-aptos text-xs leading-4.5 text-text-icons-base-second">
      {children}
    </p>
  </div>
);

// Bold run inside a HintBox's rich text (t.rich "b" tag).
export const hintBold = (chunks: ReactNode) => (
  <strong className="font-semibold text-text-icons-base-main">{chunks}</strong>
);

// Pink dashed box holding a filled section's summary fields.
export const SummaryBox = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "space-y-2 rounded-xl border-[1.5px] border-dashed border-primary-pink/40 bg-primary-red-pink-light p-3",
      className,
    )}
  >
    {children}
  </div>
);

// Small "Change input" link at the bottom right of a SummaryBox.
export const SummaryChangeLink = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) => (
  <div className="flex flex-row justify-end">
    <Button
      variant={"ghost"}
      className="h-auto p-0 cursor-pointer font-aptos text-xs font-regular leading-4.5 text-text-icons-base-third underline hover:bg-transparent hover:text-text-icons-base-second"
      onClick={onClick}
    >
      {label}
    </Button>
  </div>
);

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

// Pink "Edit …" link that sits next to SummaryDownloadButton on a summary
// heading row (same weight as the download link, pencil instead of arrow).
export const SummaryEditLink = ({
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
    <SquarePenIcon className="size-4" />
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
