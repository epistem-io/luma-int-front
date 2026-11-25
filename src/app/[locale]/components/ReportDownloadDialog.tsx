"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { showErrorToast } from "@/components/ui/error-toast";
import { REPORT_REQUEST_URL } from "@/constants";
import { GlobalContext } from "@/contexts/globalContext";
import { UnauthorizedError, fetchWithAuth } from "@/lib/fetchWithAuth";
import { cn } from "@/lib/utils";
import { Check, Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useContext, useEffect, useState } from "react";
import { useTranslateOr } from "./useTranslateOr";

/** Language the report is written in, as sent to the backend. */
export type ReportLanguage = "en" | "id";

const LANGUAGES: { value: ReportLanguage; key: string; fallback: string }[] = [
  { value: "en", key: "yourMap.reportDialog.english", fallback: "English" },
  {
    value: "id",
    key: "yourMap.reportDialog.indonesian",
    fallback: "Bahasa Indonesia",
  },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Opened from "Download PDF Report" in the Your Map dialog. Three states:
// choose the report's language, wait while it is built (a quarter of a
// minute or more), and a confirmation once the file is saved.
export const ReportDownloadDialog = ({ open, onOpenChange }: Props) => {
  const commonT = useTranslations("InteractivePanel.common");
  const translateOr = useTranslateOr();
  const { sessionId, setIsLoginModalOpen } = useContext(GlobalContext);
  const [language, setLanguage] = useState<ReportLanguage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // The report that was just saved, kept so "Download again" is instant.
  const [downloaded, setDownloaded] = useState<{
    filename: string;
    blob: Blob;
  } | null>(null);

  // Each opening starts from the language choice.
  useEffect(() => {
    if (open) {
      setLanguage(null);
      setDownloaded(null);
    }
  }, [open]);

  const saveFile = (file: { filename: string; blob: Blob }) => {
    const url = URL.createObjectURL(file.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadReport = async () => {
    if (!language) return;

    if (!sessionId) {
      showErrorToast({ title: commonT("errors.noSession"), description: null });
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetchWithAuth(REPORT_REQUEST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // `language` is for the backend to write the report in; a backend
        // that does not know it yet ignores it and sends its one report.
        body: JSON.stringify({ session_id: sessionId, language }),
      });

      if (!response.ok) {
        // The backend puts its message under `error`.
        const json = await response.json().catch(() => null);
        throw new Error(
          json?.error?.message ||
            json?.message ||
            commonT("somethingWrongHappened"),
        );
      }

      // The report arrives as base64 inside JSON, not as a file response:
      // download managers (IDM) take over file responses and request them
      // again without the login, which fails.
      const json: { filename: string; mimetype: string; content: string } =
        await response.json();
      const bytes = Uint8Array.from(atob(json.content), (char) =>
        char.charCodeAt(0),
      );
      const file = {
        filename: json.filename,
        blob: new Blob([bytes], { type: json.mimetype }),
      };
      saveFile(file);
      // Stay open and say so: the browser may save the file without a sign.
      setDownloaded(file);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        setIsLoginModalOpen(true);
        return;
      }

      showErrorToast({
        title: commonT("errors.reportRequestFailed"),
        description: error instanceof Error ? error.message : null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadLabel = translateOr(
    "yourMap.reportDialog.download",
    "Download PDF Report",
  );
  const preparingLabel = translateOr(
    "yourMap.reportDialog.preparingTitle",
    "Preparing your report…",
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        // Stay open while the report is being built.
        if (!isLoading) onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[376px] gap-0 overflow-hidden rounded-2xl border-none p-0 font-pjs"
      >
        <div className="relative">
          <ReportPreviewArt />
          <button
            type="button"
            aria-label="Close dialog"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-3 cursor-pointer text-text-icons-base-main transition-opacity hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="size-5 stroke-[2.5]" />
          </button>
        </div>

        {downloaded && (
          <div className="space-y-5 px-5 pb-5 pt-2">
            <div className="space-y-2 text-center" aria-live="polite">
              <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-green-600">
                <Check className="size-6 text-white" strokeWidth={3} />
              </span>
              <DialogTitle className="text-2xl font-bold leading-8 tracking-[-0.24px] text-primary-pink">
                {translateOr(
                  "yourMap.reportDialog.doneTitle",
                  "Your report was downloaded",
                )}
              </DialogTitle>
              <DialogDescription className="text-[13px] leading-5 text-text-icons-base-second">
                {translateOr(
                  "yourMap.reportDialog.doneText",
                  "Look for this file in your downloads folder:",
                )}
              </DialogDescription>
              <p className="text-xs font-bold leading-5 text-text-icons-base-main [overflow-wrap:anywhere]">
                {downloaded.filename}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="secondary"
                className="h-9 w-full rounded-lg"
                onClick={() => saveFile(downloaded)}
              >
                {translateOr(
                  "yourMap.reportDialog.downloadAgain",
                  "Download again",
                )}
              </Button>
              <Button
                type="button"
                variant="primary"
                className="h-9 w-full rounded-lg"
                onClick={() => onOpenChange(false)}
              >
                {translateOr("yourMap.reportDialog.close", "Close")}
              </Button>
            </div>
          </div>
        )}

        {!downloaded && (
        <div className="space-y-5 px-5 pb-5 pt-2">
          <div className="space-y-2 text-center" aria-live="polite">
            <DialogTitle className="text-2xl font-bold leading-8 tracking-[-0.24px] text-primary-pink">
              {isLoading
                ? preparingLabel
                : translateOr(
                    "yourMap.reportDialog.title",
                    "Download PDF Report",
                  )}
            </DialogTitle>
            <DialogDescription className="text-[13px] leading-5 text-text-icons-base-second">
              {isLoading
                ? translateOr(
                    "yourMap.reportDialog.preparingText",
                    "We are drawing your maps and tables. This usually takes less than a minute. Please keep this window open.",
                  )
                : translateOr(
                    "yourMap.reportDialog.description",
                    "Choose the language your report will be written in. You can download it again in the other language anytime.",
                  )}
            </DialogDescription>
          </div>

          {/* A moving bar, not a percentage: the report arrives in one
              answer, so there is no real progress to show. */}
          {isLoading && (
            <div
              role="progressbar"
              aria-label={preparingLabel}
              className="h-1.5 w-full overflow-hidden rounded-full bg-primary-pink/20"
            >
              <div className="indeterminate-bar h-full w-1/4 rounded-full bg-primary-pink" />
            </div>
          )}

          <div role="radiogroup" className="grid grid-cols-2 gap-3">
            {LANGUAGES.map((option) => {
              const isSelected = language === option.value;

              return (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer flex-row items-center gap-x-2 rounded-lg border px-2.5 py-2.5 transition-colors",
                    isSelected
                      ? "border-primary-pink bg-primary-red-pink-light"
                      : "border-neutral-400 bg-white hover:bg-neutral-100",
                    isLoading && "cursor-not-allowed opacity-60",
                  )}
                >
                  <input
                    type="radio"
                    name="report-language"
                    value={option.value}
                    checked={isSelected}
                    disabled={isLoading}
                    onChange={() => setLanguage(option.value)}
                    className="size-4 shrink-0 accent-primary-pink"
                  />
                  <span
                    className={cn(
                      "whitespace-nowrap text-[13px] leading-5 text-text-icons-base-main",
                      isSelected && "font-bold",
                    )}
                  >
                    {translateOr(option.key, option.fallback)}
                  </span>
                </label>
              );
            })}
          </div>

          <Button
            type="button"
            variant="primary"
            className={cn(
              "h-9 w-full rounded-lg",
              // Busy, not switched off: keep the colour while it works.
              isLoading &&
                "disabled:bg-primary-pink disabled:text-text-icons-on-color disabled:opacity-100",
            )}
            disabled={!language || isLoading}
            onClick={() => void downloadReport()}
          >
            {isLoading && (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            )}
            {isLoading ? preparingLabel : downloadLabel}
          </Button>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// A drawn stand-in for the report preview at the top of the dialog (three
// report pages on pink). Replace it with the real artwork when it exists.
const ReportPreviewArt = () => {
  const page = "absolute rounded-xl border-[5px] border-[#1F1F1F] bg-white";
  const line = "h-1 rounded-full bg-neutrals-300";

  return (
    <div
      aria-hidden="true"
      className="relative h-[236px] overflow-hidden bg-gradient-to-b from-[#FBE6EE] to-[#F6C9DA]"
    >
      {/* a results page with the map */}
      <div className={cn(page, "left-5 top-16 h-44 w-36 p-2")}>
        <div className="h-1.5 w-16 rounded-full bg-primary-pink/70" />
        <div className="mt-2 h-20 rounded-md bg-[linear-gradient(135deg,#6FBF73_0%,#F3D667_38%,#E5795B_68%,#6FA8DC_100%)]" />
        <div className="mt-2 space-y-1">
          <div className={cn(line, "w-full")} />
          <div className={cn(line, "w-4/5")} />
        </div>
      </div>

      {/* the cover */}
      <div className={cn(page, "right-5 top-6 h-60 w-52 p-3")}>
        <div className="h-1 w-12 rounded-full bg-neutrals-400" />
        <div className="mt-2 h-2.5 w-36 rounded-full bg-primary-pink" />
        <div className="mt-1 h-2.5 w-20 rounded-full bg-primary-pink" />
        <div className="mt-3 space-y-1.5">
          <div className={cn(line, "w-full")} />
          <div className={cn(line, "w-11/12")} />
          <div className={cn(line, "w-3/4")} />
          <div className={cn(line, "w-5/6")} />
        </div>
        <div className="mt-3 h-28 rounded-md bg-primary-pink/85" />
      </div>

      {/* a page with a chart */}
      <div className={cn(page, "-bottom-3 left-2 h-24 w-32 space-y-1.5 p-2")}>
        <div className="h-1.5 w-10 rounded-full bg-primary-pink/70" />
        {["w-full", "w-3/4", "w-1/2", "w-2/3"].map((width, index) => (
          <div
            key={width}
            className={cn(
              "h-1.5 rounded-full",
              width,
              ["bg-[#6FBF73]", "bg-[#E5795B]", "bg-[#6FA8DC]", "bg-[#F3D667]"][
                index
              ],
            )}
          />
        ))}
      </div>

      {/* the artwork fades into the white content below */}
      <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-b from-transparent to-white" />
    </div>
  );
};
