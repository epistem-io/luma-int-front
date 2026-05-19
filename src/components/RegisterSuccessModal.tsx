"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export interface RegisterSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: () => void;
}

export default function RegisterSuccessModal({
  open,
  onOpenChange,
  onConfirm,
}: RegisterSuccessModalProps) {
  const t = useTranslations("RegisterSuccessModal");

  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[500px] gap-4 rounded-2xl border-neutral-400 bg-background-base-main px-6 py-8 shadow-lg sm:px-8"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-[52px] items-center justify-center rounded-full border-[3px] border-primary-pink text-primary-pink">
            <Check className="size-7 stroke-[3]" aria-hidden="true" />
          </div>

          <div className="flex flex-col items-center gap-3">
            <DialogTitle className="font-noto-sans text-[28px] font-bold leading-none tracking-[-0.28px] text-text-icons-base-main">
              {t("title")}
            </DialogTitle>
            <DialogDescription className="max-w-[394px] font-aptos text-[20px] leading-tight text-text-icons-base-main">
              {t("description")}
            </DialogDescription>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={handleConfirm}
            className="text-m-semibold h-10 min-w-20 rounded-[12px] px-4 text-white"
          >
            {t("confirm")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
