"use client";

import { useContext } from "react";
import { toast } from "sonner";

import LoginModal from "@/components/LoginModal";
import { GlobalContext } from "@/contexts/globalContext";
import { useTranslations } from "next-intl";

export const LoginPanel = () => {
  const commonT = useTranslations("InteractivePanel.common");
  const { isLoginModalOpen, setIsLoginModalOpen } = useContext(GlobalContext);

  const handlePlaceholderAction = () => {
    toast.info(commonT("featureComingSoon"));
  };

  return (
    <LoginModal
      open={isLoginModalOpen}
      onOpenChange={setIsLoginModalOpen}
      onSubmit={async () => {
        handlePlaceholderAction();
      }}
      onGoogleLogin={async () => {
        handlePlaceholderAction();
      }}
      onForgotPassword={handlePlaceholderAction}
      onSignUp={handlePlaceholderAction}
    />
  );
};
