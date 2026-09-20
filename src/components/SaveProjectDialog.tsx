"use client";

import { useContext, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { SessionCheckpointContext } from "@/contexts/sessionCheckpointContext";
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title ?? t("saveDialogTitle")}</DialogTitle>
          <DialogDescription>{t("saveDialogDescription")}</DialogDescription>
        </DialogHeader>
        <Input
          value={name}
          maxLength={256}
          placeholder={t("namePlaceholder")}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") void onSave();
          }}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          variant="primary"
          disabled={isSaving}
          onClick={() => void onSave()}
        >
          {isSaving ? t("saving") : t("save")}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
