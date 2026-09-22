"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { renameProject } from "@/lib/projectsApi";
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
  currentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRenamed: (id: string, name: string) => void;
}

export const RenameProjectDialog = ({
  projectId,
  currentName,
  open,
  onOpenChange,
  onRenamed,
}: Props) => {
  const t = useTranslations("Projects");
  const [name, setName] = useState(currentName);
  const [error, setError] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  const onRename = async () => {
    if (isRenaming) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t("nameRequired"));
      return;
    }
    // Unchanged name: nothing to do.
    if (trimmed === currentName) {
      onOpenChange(false);
      return;
    }
    setIsRenaming(true);
    try {
      await renameProject(projectId, trimmed);
      toast.success(t("renamedToast"));
      onRenamed(projectId, trimmed);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsRenaming(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("renameDialogTitle")}</DialogTitle>
          <DialogDescription>{t("renameDialogDescription")}</DialogDescription>
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
            if (e.key === "Enter") void onRename();
          }}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          variant="primary"
          disabled={isRenaming || name.trim() === ""}
          onClick={() => void onRename()}
        >
          {isRenaming ? t("renaming") : t("rename")}
        </Button>
      </DialogContent>
    </Dialog>
  );
};