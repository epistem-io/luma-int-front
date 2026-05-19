"use client";

import { useContext, useState } from "react";
import { toast } from "sonner";

import RegisterSuccessModal from "@/components/RegisterSuccessModal";
import SignUpModal from "@/components/SignUpModal";
import { GlobalContext } from "@/contexts/globalContext";
import { useTranslations } from "next-intl";
import { SIGNUP_URL } from "@/constants";

export const SignUpPanel = () => {
  const commonT = useTranslations("InteractivePanel.common");
  const {
    isSignUpModalOpen,
    setIsSignUpModalOpen,
    setIsLoginModalOpen,
  } = useContext(GlobalContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegisterSuccessModalOpen, setIsRegisterSuccessModalOpen] =
    useState(false);

  const handleSignUpSubmit = async (values: {
    email: string;
    name: string;
    organizationName: string;
    acceptedTerms: boolean;
  }) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(SIGNUP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          fullname: values.name,
          organization_name: values.organizationName,
        }),
      });

      if (!response.ok) {
        let errorMessage = commonT("somethingWrongHappened");

        try {
          const data = await response.json();

          if (typeof data?.message === "string" && data.message.trim()) {
            errorMessage = data.message;
          }
        } catch {
          // Fall back to the generic error message when the response body is absent.
        }

        throw new Error(errorMessage);
      }

      setIsSignUpModalOpen(false);
      setIsRegisterSuccessModalOpen(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message.trim()
          ? error.message
          : commonT("somethingWrongHappened");

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SignUpModal
        open={isSignUpModalOpen}
        onOpenChange={setIsSignUpModalOpen}
        onSubmit={handleSignUpSubmit}
        onSignIn={() => {
          setIsSignUpModalOpen(false);
          setIsLoginModalOpen(true);
        }}
        isSubmitting={isSubmitting}
      />

      <RegisterSuccessModal
        open={isRegisterSuccessModalOpen}
        onOpenChange={setIsRegisterSuccessModalOpen}
      />
    </>
  );
};
