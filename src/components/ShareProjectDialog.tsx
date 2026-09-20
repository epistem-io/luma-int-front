"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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

  const onShare = async () => {
    if (isSharing) return;
    if (!email.trim()) {
      setError(t("emailRequired"));
      return;
    }
    setIsSharing(true);
    try {
      await shareProject(projectId, email.trim());
      toast.success(t("sharedToast"));
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("shareDialogTitle")}</DialogTitle>
          <DialogDescription>{t("shareDialogDescription")}</DialogDescription>
        </DialogHeader>
        <Input
          type="email"
          value={email}
          placeholder={t("emailPlaceholder")}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") void onShare();
          }}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          variant="primary"
          disabled={isSharing}
          onClick={() => void onShare()}
        >
          {isSharing ? t("sharing") : t("share")}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
