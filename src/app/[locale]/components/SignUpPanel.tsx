"use client";

import { useContext } from "react";
import { toast } from "sonner";

import SignUpModal from "@/components/SignUpModal";
import { GlobalContext } from "@/contexts/globalContext";
import { useTranslations } from "next-intl";

export const SignUpPanel = () => {
  const commonT = useTranslations("InteractivePanel.common");
  const {
    isSignUpModalOpen,
    setIsSignUpModalOpen,
    setIsLoginModalOpen,
  } = useContext(GlobalContext);

  const handlePlaceholderAction = () => {
    toast.info(commonT("featureComingSoon"));
  };

  return (
    <SignUpModal
      open={isSignUpModalOpen}
      onOpenChange={setIsSignUpModalOpen}
      onSubmit={async () => {
        handlePlaceholderAction();
      }}
      onSignIn={() => {
        setIsSignUpModalOpen(false);
        setIsLoginModalOpen(true);
      }}
    />
  );
};
