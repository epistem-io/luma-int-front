"use client";

import { useContext, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { SessionCheckpointContext } from "@/contexts/sessionCheckpointContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
}

export const SaveProjectDialog = ({ open, onOpenChange, title }: Props) => {
  const t = useTranslations("Projects");
  const { createNamedProject } = useContext(SessionCheckpointContext);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const canSubmit = name.trim() !== "" && !isSaving;

  const onSave = async () => {
    if (isSaving) return;
    if (!name.trim()) {
      setError(t("nameRequired"));
      return;
    }
    setIsSaving(true);
    const ok = await createNamedProject(name.trim());
    setIsSaving(false);
    if (ok) {
      toast.success(t("savedToast"));
      setName("");
      setError("");
      onOpenChange(false);
    } else {
      toast.error(t("saveFailedToast"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden rounded-[20px] border-0 p-0 font-pjs sm:max-w-[620px]"
      >
        {/* Banner: the navbar corner showing where the Save button lives.
            Everything is a percentage of the dialog width (design: 627 wide,
            banner 412 tall, screenshot 610 wide at x=-47 / y=110), so the
            screenshot bleeds off the left edge and is clipped by the white
            body at every size. */}
        <div
          aria-hidden="true"
          className="relative aspect-[627/412] overflow-hidden bg-gradient-to-br from-[#F8E9EE] via-[#F9DCE6] to-[#FBCADB]"
        >
          <Image
            src="/images/screen.png"
            alt=""
            width={1080}
            height={584}
            priority
            className="absolute right-[10.2%] top-[26.7%] h-auto w-[97.3%] max-w-none select-none"
          />
        </div>

        <DialogClose
          className="absolute right-5 top-5 rounded-sm text-neutral-900 outline-none transition-opacity hover:cursor-pointer hover:opacity-70 focus-visible:ring-2 focus-visible:ring-primary-pink focus-visible:ring-offset-2"
          aria-label={t("cancel")}
        >
          <X className="size-6" strokeWidth={3} />
        </DialogClose>

        <div className="flex flex-col items-center px-6 pb-8 pt-10 sm:px-9">
          <DialogTitle className="text-center text-[28px] font-bold leading-10 tracking-[-0.3px] text-primary-pink sm:text-[32px]">
            {title ?? t("saveDialogTitle")}
          </DialogTitle>
          <DialogDescription className="mt-2.5 text-center text-base leading-6 text-neutral-700">
            {t("saveDialogDescription")}
          </DialogDescription>

          <Input
            value={name}
            maxLength={256}
            aria-label={t("namePlaceholder")}
            aria-invalid={error !== ""}
            placeholder={t("namePlaceholder")}
            className="mt-7 h-11 rounded-lg px-3 text-sm placeholder:text-neutral-500"
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") void onSave();
            }}
          />
          {error && (
            <p className="mt-2 self-start text-sm text-destructive">{error}</p>
          )}

          <Button
            variant="primary"
            disabled={!canSubmit}
            className="mt-10 h-11 w-full rounded-lg"
            onClick={() => void onSave()}
          >
            {isSaving ? t("saving") : t("save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
