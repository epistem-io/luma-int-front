"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronDown, CircleAlert, Copy, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface ErrorToastOptions {
  /** What failed. Already translated, e.g. t("common.errors.uploadFailed"). */
  title: string;
  /**
   * What the user can do. Already translated. Omit for the generic
   * common.errorToast.defaultHint; pass null when the title already says it.
   */
  description?: string | null;
  /** The caught error. Shown only under "Show details", never in the headline. */
  error?: unknown;
  /** Adds a Retry button; the toast then stays until the user acts on it. */
  onRetry?: () => void;
  /** Auto-dismiss in ms when there is no Retry. Default 15 s. */
  duration?: number;
  /** Stable id: the same failure replaces the toast instead of stacking. Defaults to the title. */
  id?: string;
}

const ERROR_TOAST_DURATION = 15_000;

export const errorPaletteToastStyle = {
  "--info-bg": "rgba(255, 239, 238, 1)",
  "--info-border": "rgba(254, 161, 155, 1)",
  "--info-text": "rgba(144, 31, 27, 1)",
} as React.CSSProperties;

/** Turns whatever was thrown into one readable line for the details panel. */
export const describeError = (error: unknown): string => {
  if (error === undefined || error === null || error === "") return "";
  let text: string;
  if (error instanceof Error) text = error.message;
  else if (typeof error === "string") text = error;
  else {
    try {
      text = JSON.stringify(error);
    } catch {
      text = String(error);
    }
  }
  // Callers used to throw new Error(JSON.stringify(`...`)), which wraps the
  // message in quotes; strip them and a leading "Error:" prefix.
  return text
    .trim()
    .replace(/^"+|"+$/g, "")
    .replace(/^Error:\s*/i, "");
};

export const showErrorToast = ({
  title,
  description,
  error,
  onRetry,
  duration = ERROR_TOAST_DURATION,
  id,
}: ErrorToastOptions) => {
  const detail = describeError(error);
  if (detail) console.error(`[error-toast] ${title}:`, error);

  return toast.custom(
    (toastId) => (
      <ErrorToast
        toastId={toastId}
        title={title}
        description={description}
        detail={detail}
        onRetry={onRetry}
      />
    ),
    {
      id: id ?? title,
      duration: onRetry ? Infinity : duration,
      closeButton: false,
    },
  );
};

interface ErrorToastProps {
  toastId: string | number;
  title: string;
  description?: string | null;
  detail: string;
  onRetry?: () => void;
}

const ErrorToast = ({
  toastId,
  title,
  description,
  detail,
  onRetry,
}: ErrorToastProps) => {
  const t = useTranslations("InteractivePanel.common");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const hint =
    description === null ? "" : (description ?? t("errorToast.defaultHint"));

  const dismiss = () => toast.dismiss(toastId);

  const copyDetail = async () => {
    try {
      await navigator.clipboard.writeText(detail);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    } catch {
      // Clipboard can be refused (insecure context); the text stays selectable.
    }
  };

  return (
    <div
      role="alert"
      className="error-toast w-full rounded-xl border border-danger-200 bg-danger-50 p-4 font-aptos text-text-icons-base-main shadow-[0_8px_24px_rgba(144,31,27,0.18)]"
    >
      <div className="flex items-start gap-3">
        <CircleAlert
          className="mt-0.5 size-6 shrink-0 text-danger-700"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-md font-bold leading-6 text-danger-800">{title}</p>
          {hint && <p className="text-sm leading-5 text-danger-800">{hint}</p>}
        </div>
        <button
          type="button"
          aria-label={t("errorToast.dismiss")}
          onClick={dismiss}
          className="-mr-1 -mt-1 shrink-0 rounded-md p-1.5 text-danger-800 transition-colors hover:cursor-pointer hover:bg-danger-100"
        >
          <X className="size-4" />
        </button>
      </div>

      {(onRetry || detail) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 pl-9">
          {onRetry && (
            <button
              type="button"
              onClick={() => {
                dismiss();
                onRetry();
              }}
              className="h-8 rounded-md border border-danger-200 bg-white px-3 text-sm font-semibold text-danger-800 transition-colors hover:cursor-pointer hover:bg-danger-100"
            >
              {t("retry")}
            </button>
          )}
          {detail && (
            <button
              type="button"
              aria-expanded={isDetailOpen}
              onClick={() => setIsDetailOpen((open) => !open)}
              className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-sm font-semibold text-danger-800 transition-colors hover:cursor-pointer hover:bg-danger-100"
            >
              {isDetailOpen
                ? t("errorToast.hideDetails")
                : t("errorToast.showDetails")}
              <ChevronDown
                className={cn(
                  "size-4 transition-transform",
                  isDetailOpen && "rotate-180",
                )}
              />
            </button>
          )}
        </div>
      )}

      {isDetailOpen && detail && (
        <div className="mt-2 ml-9 rounded-md border border-danger-200 bg-white p-2">
          <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-4 text-text-icons-base-main">
            {detail}
          </pre>
          <div className="mt-1 flex justify-end">
            <button
              type="button"
              onClick={() => void copyDetail()}
              className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-xs font-semibold text-text-icons-base-second hover:cursor-pointer hover:bg-neutral-100"
            >
              {isCopied ? (
                <Check className="size-3.5" />
              ) : (
                <Copy className="size-3.5" />
              )}
              {isCopied ? t("errorToast.copied") : t("errorToast.copy")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
