"use client";
import { Button } from "@/components/ui/button";
import DownloadOnTheWayModal from "@/components/DownloadOnTheWayModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DOWNLOAD_REQUEST_URL, GET_MOSAIC_URL } from "@/constants";
import { AuthContext } from "@/contexts/authContext";
import { GlobalContext } from "@/contexts/globalContext";
import { MapContext } from "@/contexts/mapContext";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { UnauthorizedError, fetchWithAuth } from "@/lib/fetchWithAuth";
import { Download, Save, Share2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useContext, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "./ConfirmDialog";

export const YourMapDialog = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const { sessionId, setSessionId, setIsLoginModalOpen } =
    useContext(GlobalContext);
  const {
    generateMapDownloadURL,
    isYourMapDialogVisible,
    setIsYourMapDialogVisible,
    resetMapGenerationState,
  } = useContext(MapGenerationContext);
  const { resetMapState } = useContext(MapContext);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCloseConfirmVisible, setIsCloseConfirmVisible] = useState(false);
  const [isDownloadOnTheWayOpen, setIsDownloadOnTheWayOpen] = useState(false);

  const t = useTranslations("InteractivePanel.yourMap");
  const commonT = useTranslations("InteractivePanel.common");

  const handlePlaceholderClick = () => {
    toast.info(commonT("featureComingSoon"));
  };

  const handleDownload = async () => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }

    if (!sessionId) {
      toast.error(commonT("somethingWrongHappened"));
      return;
    }

    try {
      setIsDownloading(true);

      const response = await fetchWithAuth(DOWNLOAD_REQUEST_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(commonT("somethingWrongHappened"));
      }

      setIsYourMapDialogVisible(false);
      setIsCloseConfirmVisible(false);
      setIsDownloadOnTheWayOpen(true);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        setIsLoginModalOpen(true);
        return;
      }

      toast.error(
        error instanceof Error
          ? error.message
          : commonT("somethingWrongHappened"),
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCloseRequest = () => {
    setIsCloseConfirmVisible(true);
  };

  const handleCloseAllModals = () => {
    setIsCloseConfirmVisible(false);
    setIsYourMapDialogVisible(false);
  };

  const handleResetAndClose = () => {
    handleCloseAllModals();
    resetMapState();
    resetMapGenerationState();
    setSessionId("");
  };

  return (
    <>
      <Dialog
        open={isYourMapDialogVisible}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseRequest();
            return;
          }

          setIsYourMapDialogVisible(open);
        }}
      >
        <DialogContent
          id="yourMapDialog"
          showCloseButton={false}
          className="w-full max-w-[950px] rounded-2xl border-none px-8 py-6 shadow-[0px_4px_5.5px_rgba(0,0,0,0.08)] gap-6"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
          onPointerDownOutside={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader className="items-center gap-3 text-center">
            <button
              type="button"
              aria-label="Close dialog"
              onClick={handleCloseRequest}
              className="absolute right-8 top-8 cursor-pointer text-text-icons-base-main transition-opacity hover:opacity-75"
            >
              <X className="size-8 stroke-[2.25]" />
            </button>
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
              disabled={isDownloading}
              variant="primary"
              className="text-l-bold h-10 rounded-[12px] border border-primary-red-pink-normal-active shadow-[0px_1px_2px_rgba(0,0,0,0.05)] text-white"
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
              disabled
              className="text-l-bold h-10 rounded-[12px] border border-[#C9C9C9] bg-neutrals-300 text-text-icons-base-third opacity-100"
            >
              {t("improveAccuracy")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isVisible={isCloseConfirmVisible}
        onCancel={handleCloseAllModals}
        onConfirm={handleResetAndClose}
        title={commonT("confirm")}
        subtitle={t("closePopup")}
        confirmButtonCaption={commonT("confirm")}
        cancelButtonCaption={commonT("cancel")}
      />

      <DownloadOnTheWayModal
        open={isDownloadOnTheWayOpen}
        onOpenChange={setIsDownloadOnTheWayOpen}
      />
    </>
  );
};
