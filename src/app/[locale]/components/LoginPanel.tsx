"use client";

import { useContext, useState } from "react";
import { toast } from "sonner";

import LoginModal from "@/components/LoginModal";
import { LOGIN_URL } from "@/constants";
import { AuthContext, AuthUser } from "@/contexts/authContext";
import { GlobalContext } from "@/contexts/globalContext";
import { useTranslations } from "next-intl";

interface LoginResponseUser {
  email: string;
  fullname?: string;
  organization_name?: string;
}

interface LoginResponse {
  api_key: string;
  api_key_expires?: string;
  user: LoginResponseUser;
}

const normalizeLoginUser = (identity: LoginResponseUser): AuthUser => ({
  email: identity.email,
  name: identity.fullname,
  organizationName: identity.organization_name,
});

export const LoginPanel = () => {
  const commonT = useTranslations("InteractivePanel.common");
  const { login } = useContext(AuthContext);
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    setIsSignUpModalOpen,
  } = useContext(GlobalContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlaceholderAction = () => {
    toast.info(commonT("featureComingSoon"));
  };

  const handleLoginSubmit = async (values: {
    email: string;
    password: string;
  }) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
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

      const data = (await response.json()) as LoginResponse;
      const token = data.api_key;

      if (!token) {
        throw new Error("Login succeeded but no auth token was returned.");
      }

      const user = normalizeLoginUser(data.user);

      login({
        token,
        expiresAt: data.api_key_expires,
        user,
      });

      setIsLoginModalOpen(false);
      toast.success(`Signed in as ${user.email}`);
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
    <LoginModal
      open={isLoginModalOpen}
      onOpenChange={setIsLoginModalOpen}
      onSubmit={handleLoginSubmit}
      onGoogleLogin={async () => {
        handlePlaceholderAction();
      }}
      onForgotPassword={handlePlaceholderAction}
      onSignUp={() => {
        setIsLoginModalOpen(false);
        setIsSignUpModalOpen(true);
      }}
      isSubmitting={isSubmitting}
    />
  );
};
