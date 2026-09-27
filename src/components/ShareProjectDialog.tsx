"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { shareProject } from "@/lib/projectsApi";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface Props {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShareProjectDialog = ({
  projectId,
  open,
  onOpenChange,
}: Props) => {
  const t = useTranslations("Projects");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  // Mockup shows the button greyed out until an email is typed.
  const canShare = email.trim() !== "" && !isSharing;

  const onShare = async () => {
    if (isSharing) return;
    if (!email.trim()) {
      setError(t("emailRequired"));
      return;
    }
    setIsSharing(true);
    try {
      const recipient = email.trim();
      const { invited } = await shareProject(projectId, recipient);
      toast.success(
        invited ? t("invitedToast", { email: recipient }) : t("sharedToast"),
      );
      setEmail("");
      setError("");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[min(540px,calc(100%-2rem))] gap-0 overflow-hidden rounded-2xl border-neutral-400 bg-background-base-main p-0 shadow-lg"
      >
        {/* Hero artwork, flush with the rounded top edge and cropped like the
            mockup (the PNG is 1200x729; 3:2 trims a little off both sides). */}
        <div className="relative aspect-[3/2] w-full">
          <Image
            src="/images/share.png"
            alt=""
            fill
            priority
            sizes="(max-width: 640px) 100vw, 540px"
            className="object-cover object-center"
          />
          <button
            type="button"
            aria-label={t("cancel")}
            onClick={() => onOpenChange(false)}
            className="absolute right-5 top-5 cursor-pointer rounded-full p-1 text-text-icons-base-main transition-opacity hover:opacity-75"
          >
            <X className="size-6 stroke-[2.25]" />
          </button>
        </div>

        <div className="flex flex-col gap-6 px-8 pb-8 pt-7">
          <DialogHeader className="items-center gap-3 text-center">
            <DialogTitle className="text-center font-noto-sans text-[32px] font-bold leading-none tracking-[-0.32px] text-primary-pink">
              {t("shareDialogTitle")}
            </DialogTitle>
            <DialogDescription className="text-center font-aptos text-base leading-tight text-text-icons-base-second">
              {t("shareDialogDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Input
                type="email"
                value={email}
                autoComplete="email"
                aria-invalid={error !== ""}
                placeholder={t("emailPlaceholder")}
                className="h-11 rounded-lg border-neutral-400 bg-background-base-main px-4 font-aptos text-base leading-5 text-text-icons-base-main placeholder:text-text-icons-base-second md:text-base"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void onShare();
                }}
              />
              {error && (
                <p className="font-aptos text-sm leading-5 text-destructive">
                  {error}
                </p>
              )}
            </div>

            <Button
              type="button"
              variant="primary"
              disabled={!canShare}
              onClick={() => void onShare()}
              className="h-11 w-full rounded-lg"
            >
              {isSharing ? t("sharing") : t("shareDialogTitle")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};