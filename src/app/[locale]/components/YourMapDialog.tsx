"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { Download, Save, Share2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useContext, useState } from "react";
import { toast } from "sonner";

export const YourMapDialog = () => {
  const {
    generateMapDownloadURL,
    isYourMapDialogVisible,
    setIsYourMapDialogVisible,
  } = useContext(MapGenerationContext);
  const [isDownloading, setIsDownloading] = useState(false);

  const t = useTranslations("InteractivePanel.yourMap");
  const commonT = useTranslations("InteractivePanel.common");

  const handlePlaceholderClick = () => {
    toast.info(commonT("featureComingSoon"));
  };

  const handleDownload = async () => {
    const fileUrl = generateMapDownloadURL?.download_url;

    if (!fileUrl) {
      toast.error(commonT("somethingWrongHappened"));
      return;
    }

    try {
      setIsDownloading(true);

      const response = await fetch(fileUrl);

      if (!response.ok) {
        throw new Error("Failed to download generated map");
      }

      const blob = await response.blob();
      const filename =
        response.headers
          .get("content-disposition")
          ?.split("filename=")[1]
          ?.replaceAll('"', "") || "generated-map";
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = filename;
      anchor.style.display = "none";

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : commonT("somethingWrongHappened"),
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog
      open={isYourMapDialogVisible}
      onOpenChange={(open) => {
        setIsYourMapDialogVisible(open);
      }}
    >
      <DialogContent
        id="yourMapDialog"
        showCloseButton={false}
        className="w-full max-w-[950px] rounded-2xl border-none px-8 py-6 shadow-[0px_4px_5.5px_rgba(0,0,0,0.08)] gap-6"
      >
        <DialogHeader className="items-center gap-3 text-center">
          <DialogClose asChild>
            <button
              type="button"
              aria-label="Close dialog"
              className="absolute right-8 top-8 cursor-pointer text-text-icons-base-main transition-opacity hover:opacity-75"
            >
              <X className="size-8 stroke-[2.25]" />
            </button>
          </DialogClose>
          <DialogTitle className="max-w-[412px] font-aptos text-[32px] font-bold leading-none tracking-[-0.32px] text-primary-pink text-center">
            {t("followUpDialogTitle")}
          </DialogTitle>
          <DialogDescription className="max-w-[784px] font-aptos text-base font-normal leading-normal text-text-icons-base-main text-center">
            {t.rich("followUpDialogDescription", {
              br: () => <></>,
            })}
          </DialogDescription>
        </DialogHeader>
        <div className="mx-auto mt-0 flex w-full max-w-[490px] flex-col gap-3">
          <Button
            onClick={handleDownload}
            disabled={!generateMapDownloadURL?.download_url || isDownloading}
            variant="primary"
            className="text-l-bold h-10 rounded-[12px] border border-primary-red-pink-normal-active shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
          >
            <Download className="size-4" />
            {t("downloadMap")}
          </Button>
          <Button
            type="button"
            disabled
            className="text-l-bold h-10 rounded-[12px] border border-[#C9C9C9] bg-neutrals-300 text-text-icons-base-third opacity-100"
          >
            <Share2 className="size-4" />
            {t("shareMap")}
          </Button>
          <Button
            type="button"
            disabled
            className="text-l-bold h-10 rounded-[12px] border border-[#C9C9C9] bg-neutrals-300 text-text-icons-base-third opacity-100"
          >
            <Save className="size-4" />
            {t("saveToMyAccount")}
          </Button>
          <Button
            type="button"
            onClick={handlePlaceholderClick}
            variant="secondary"
            className="text-l-bold h-10 rounded-[12px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] text-primary-red-pink-normal"
          >
            {t("improveAccuracy")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
