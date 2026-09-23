"use client";

import { useTranslations } from "next-intl";
import { useContext } from "react";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/contexts/authContext";
import { GlobalContext } from "@/contexts/globalContext";
import { SessionCheckpointContext } from "@/contexts/sessionCheckpointContext";

export const RestoreProgressBanner = () => {
  const { isAuthenticated, isHydrated } = useContext(AuthContext);
  const { sessionId, setIsLoginModalOpen } = useContext(GlobalContext);
  const { hasUnclaimedCheckpoint } = useContext(SessionCheckpointContext);
  const t = useTranslations("SaveProgress");

  // Only for anonymous returners: saved-but-unclaimed work exists and no
  // analysis is in progress in this tab.
  if (
    !isHydrated ||
    isAuthenticated ||
    !hasUnclaimedCheckpoint ||
    sessionId !== ""
  ) {
    return null;
  }

  return (
    <div className="absolute left-1/2 top-8 z-30 flex -translate-x-1/2 items-center gap-3 rounded-[8px] bg-white px-4 py-2 shadow-md">
      <span className="font-aptos text-sm text-gray-700">{t("bannerText")}</span>
      <Button
        type="button"
        size="sm"
        className="bg-primary-pink text-white hover:cursor-pointer hover:bg-primary-pink/90"
        onClick={() => setIsLoginModalOpen(true)}
      >
        {t("bannerAction")}
      </Button>
    </div>
  );
};