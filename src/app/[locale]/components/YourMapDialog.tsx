"use client";
import { Button } from "@/components/ui/button";
import { showErrorToast } from "@/components/ui/error-toast";
import DownloadOnTheWayModal from "@/components/DownloadOnTheWayModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DOWNLOAD_REQUEST_URL } from "@/constants";
import { AuthContext } from "@/contexts/authContext";
import { GlobalContext } from "@/contexts/globalContext";
import { MapContext } from "@/contexts/mapContext";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { SessionCheckpointContext } from "@/contexts/sessionCheckpointContext";
import { UnauthorizedError, fetchWithAuth } from "@/lib/fetchWithAuth";
import { cn } from "@/lib/utils";
import { Download, Save, SquareArrowOutUpRight, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useContext, useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { ImproveAccuracyDialog } from "./ImproveAccuracyDialog";
import { ReportDownloadDialog } from "./ReportDownloadDialog";
import { ShareMapDialog } from "./ShareMapDialog";
import { useTranslateOr } from "./useTranslateOr";

// Every action in the dialog: same height and corners.
const ACTION_BUTTON = "h-9 w-full rounded-lg font-aptos text-sm font-bold";
const PRIMARY_ACTION =
  "border border-primary-red-pink-normal-active text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]";

export const YourMapDialog = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const { sessionId, setSessionId, setIsLoginModalOpen } =
    useContext(GlobalContext);
  const {
    isYourMapDialogVisible,
    setIsYourMapDialogVisible,
    resetMapGenerationState,
  } = useContext(MapGenerationContext);
  const { resetMapState } = useContext(MapContext);
  const { clearCheckpoint } = useContext(SessionCheckpointContext);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCloseConfirmVisible, setIsCloseConfirmVisible] = useState(false);
  const [isDownloadOnTheWayOpen, setIsDownloadOnTheWayOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isImproveOpen, setIsImproveOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const t = useTranslations("InteractivePanel.yourMap");
  const commonT = useTranslations("InteractivePanel.common");
  const translateOr = useTranslateOr();

  // Downloading, sharing and the report need an account and a session.
  const canActOnMap = () => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return false;
    }

    if (!sessionId) {
      showErrorToast({ title: commonT("errors.noSession"), description: null });
      return false;
    }

    return true;
  };

  const handleDownload = async () => {
    if (!canActOnMap()) return;

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

      // The generic message is already the hint; only keep a real error
      // (e.g. a network failure) for the details panel.
      const generic = commonT("somethingWrongHappened");
      showErrorToast({
        title: commonT("errors.downloadRequestFailed"),
        error:
          error instanceof Error && error.message !== generic
            ? error
            : undefined,
        onRetry: () => void handleDownload(),
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    if (canActOnMap()) setIsShareOpen(true);
  };

  // The report's language is chosen in its own dialog, which also downloads it.
  const handleOpenReport = () => {
    if (canActOnMap()) setIsReportOpen(true);
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
    clearCheckpoint();
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
          className="w-full max-w-[740px] rounded-2xl border-none px-8 py-7 shadow-[0px_4px_5.5px_rgba(0,0,0,0.08)] gap-6"
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
              className="absolute right-6 top-6 cursor-pointer text-text-icons-base-main transition-opacity hover:opacity-75"
            >
              <X className="size-6 stroke-[2.5]" />
            </button>
            <DialogTitle className="px-8 font-aptos text-[28px] font-bold leading-9 tracking-[-0.28px] text-primary-pink text-center">
              {t("followUpDialogTitle")}
            </DialogTitle>
            <DialogDescription className="max-w-[560px] font-aptos text-sm font-normal leading-5 text-text-icons-base-main text-center">
              {t.rich("followUpDialogDescription", {
                br: () => <br />,
              })}
            </DialogDescription>
          </DialogHeader>

          {/* Refine first, then keep (save, share), then take away (the two
              downloads, side by side). */}
          <div className="mx-auto flex w-full max-w-[392px] flex-col gap-2.5">
            <Button
              type="button"
              onClick={() => setIsImproveOpen(true)}
              variant="secondary"
              className={ACTION_BUTTON}
            >
              {t("improveAccuracy")}
            </Button>
            <Button
              type="button"
              disabled
              className={cn(
                ACTION_BUTTON,
                "border border-[#C9C9C9] bg-neutrals-300 text-text-icons-base-third opacity-100",
              )}
            >
              <Save className="size-4" />
              {t("saveToMyAccount")}
            </Button>
            <Button
              type="button"
              onClick={handleShare}
              variant="primary"
              className={cn(ACTION_BUTTON, PRIMARY_ACTION)}
            >
              <SquareArrowOutUpRight className="size-4" />
              {t("shareMap")}
            </Button>
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                variant="primary"
                className={cn(ACTION_BUTTON, PRIMARY_ACTION)}
              >
                <Download className="size-4" />
                {t("downloadMap")}
              </Button>
              <Button
                type="button"
                onClick={handleOpenReport}
                variant="primary"
                className={cn(ACTION_BUTTON, PRIMARY_ACTION)}
              >
                <Download className="size-4" />
                {translateOr("yourMap.downloadReport", "Download PDF Report")}
              </Button>
            </div>
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

      <ShareMapDialog open={isShareOpen} onOpenChange={setIsShareOpen} />

      <ImproveAccuracyDialog
        open={isImproveOpen}
        onOpenChange={setIsImproveOpen}
      />

      <ReportDownloadDialog open={isReportOpen} onOpenChange={setIsReportOpen} />
    </>
  );
};
