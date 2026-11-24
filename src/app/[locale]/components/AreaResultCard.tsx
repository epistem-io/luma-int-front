"use client";

import { Button } from "@/components/ui/button";
import { cn, numberThousandSeparator } from "@/lib/utils";
import { CircleAlert, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  title?: string;
  subtitle?: string;
  /** Shown once the backend has measured the area. */
  areaHa?: number;
  onRemove?: () => void;
  /** Turns the card red and attaches a red banner explaining the problem. */
  error?: { title: string; description?: string };
}

// Result of step 1's area input (uploaded file, drawn polygon or chosen
// district): what was picked and its approximate size, in the summary pink,
// or in red with the reason underneath when it can't be used.
export const AreaResultCard = ({
  icon,
  title,
  subtitle,
  areaHa,
  onRemove,
  error,
}: Props) => {
  const t = useTranslations("InteractivePanel");
  const isError = !!error;
  const valueCls = isError
    ? "text-danger-600"
    : "text-primary-red-pink-normal-active";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border-[1.5px] border-dashed",
        isError ? "border-danger-200" : "border-primary-pink/40",
      )}
    >
      <div
        className={cn(
          "flex flex-row items-center gap-x-3 p-3",
          isError ? "bg-danger-50" : "bg-primary-red-pink-light",
        )}
      >
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            isError
              ? "bg-danger-100 text-danger-600"
              : "bg-primary-red-pink-light-hover text-primary-red-pink-normal",
          )}
        >
          {icon}
        </div>
        {title && (
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "truncate font-noto-sans text-sm font-bold leading-5",
                valueCls,
              )}
              title={title}
            >
              {title}
            </p>
            {subtitle && (
              <p className="font-aptos text-xs leading-4.5 text-text-icons-base-second">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {areaHa !== undefined && (
          <div className={cn("shrink-0", !title && "flex-1")}>
            <p
              className={cn(
                "font-noto-sans text-sm font-bold leading-5",
                valueCls,
              )}
            >
              {numberThousandSeparator(areaHa.toFixed(0))} Ha
            </p>
            <p className="font-aptos text-xs leading-4.5 text-text-icons-base-second">
              {t("areaScoping.approximateArea")}
            </p>
          </div>
        )}
        {!title && areaHa === undefined && <div className="flex-1" />}
        {onRemove && (
          <Button
            variant={"ghost"}
            size={"icon"}
            aria-label={t("areaScoping.removeFile")}
            className={cn(
              "size-8 shrink-0 cursor-pointer rounded-full",
              isError
                ? "hover:bg-danger-100"
                : "hover:bg-primary-red-pink-light-hover",
            )}
            onClick={onRemove}
          >
            <Trash2Icon
              className={cn(
                "size-5",
                isError ? "text-danger-600" : "text-primary-red-pink-normal",
              )}
            />
          </Button>
        )}
      </div>
      {error && (
        <div
          role="alert"
          className="flex flex-row items-center gap-x-3 bg-danger-600 px-3 py-2.5"
        >
          <CircleAlert className="size-6 shrink-0 text-white" />
          <div className="min-w-0">
            <p className="font-noto-sans text-sm font-bold leading-5 text-white">
              {error.title}
            </p>
            {error.description && (
              <p className="font-aptos text-xs leading-4.5 text-white/90">
                {error.description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
