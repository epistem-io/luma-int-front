"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { Download, FolderOpen, Loader2, UploadCloud, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

export type MosaicDownloadDestination = "drive" | "device"

export interface MosaicDownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (destination: MosaicDownloadDestination) => void;
  isSubmitting?: boolean;
}

export const MosaicDownloadDialog = ({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting = false
}: MosaicDownloadDialogProps) => {
  const t = useTranslations("InteractivePanel.basicInformation")
  const [destination, setDestination] = useState<MosaicDownloadDestination | "">(
    "",
  );

  useEffect(() => {
    if (!open) setDestination("")
  }, [open]);

  const options = [
    {
      value: "drive" as const,
      icon: UploadCloud,
      title: t("downloadDialogDriveTitle"),
      description: t("downloadDialogDriveDescription"),
      disabled: true,
    },
    {
      value: "device" as const,
      icon: FolderOpen,
      title: t("downloadDialogDeviceTitle"),
      description: t("downloadDialogDeviceDescription"),
      disabled: false,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[560px] gap-5 rounded-2xl border-neutral-400 bg-background-base-main px-8 py-7 shadow-lg"
      >
        <button
          type="button"
          aria-label="Close Dialog"
          onClick={() => onOpenChange(false)}
          className="absolute right-6 top-6 cursor-pointer text-text-icons-base-main transtion-opacity hover:opacity-75"
        >
          <X className="size-6 stroke-[2.25]" />
        </button>
      
        <DialogHeader className="items-center gap-2 text-center">
          <DialogTitle className="text-center font-noto-sans text-[28px] font-bold leading-none tracking-[-0.28px] text-primary-pink">
            {t("downloadDialogTitle")}
          </DialogTitle>

          <DialogDescription className="max-w-[420px] text-center font-aptos text-base leading-tight text-text-icons-base-main">
            {t("downloadDialogDescription")}
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={destination}
          onValueChange={(value) =>
            setDestination(value as MosaicDownloadDestination)
          }
          className="gap-3"
        >
          {options.map(
            ({ value, icon: Icon, title, description, disabled }) => (
              <Label
                key={value}
                htmlFor={`mosaic-download-${value}`}
                aria-disabled={disabled}
                className={cn(
                  "flex flex-row items-center gap-4 rounded-xl border p-4 transition-colors",
                  disabled
                    ? "cursor-not-allowed border-neutral-400 bg-neutrals-300/40"
                    : "cursor-pointer",
                  !disabled && destination === value
                    ? "border-primary-pink bg-primary-pink/5"
                    : !disabled && "border-neutral-400 hover:border-primary-pink/60",
                )}
              >
                <RadioGroupItem
                  id={`mosaic-download-${value}`}
                  value={value}
                  disabled={disabled}
                  className="size-5 border-neutral-500 data-[state=checked]:border-primary-pink"
                  indicatorClassName="fill-primary-pink size-2.5"
                />
                <Icon
                  className={cn(
                    "size-8 shrink-0 stroke-[1.75]",
                    disabled ? "text-text-icons-base-third" : "text-primary-pink",
                  )}
                  aria-hidden="true"
                />
                <div className="flex flex-col gap-0.5">
                  <div className="flex flex-row items-center gap-2">
                    <p
                      className={cn(
                        "font-aptos text-base font-bold leading-5",
                        disabled
                          ? "text-text-icons-base-third"
                          : "text-text-icons-base-main",
                      )}
                    >
                      {title}
                    </p>
                    {disabled && (
                      <span className="rounded-full bg-neutrals-300 px-2 py-0.5 font-aptos text-xs font-semibold leading-4 text-text-icons-base-third">
                        {t("downloadDialogComingSoon")}
                      </span>
                    )}
                  </div>
                  <p
                    className={cn(
                      "font-aptos text-sm font-regular leading-5",
                      disabled
                        ? "text-text-icons-base-third"
                        : "text-text-icons-base-second",
                    )}
                  >
                    {description}
                  </p>
                </div>
              </Label>
            ),
          )}
        </RadioGroup>

        <Button
          type="button"
          variant="primary"
          disabled={!destination || isSubmitting}
          onClick={() => destination && onConfirm(destination)}
          className="h-11 w-full rounded-xl"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          {t("downloadDialogConfirm")}
        </Button>
      </DialogContent>
    </Dialog>
  )
}