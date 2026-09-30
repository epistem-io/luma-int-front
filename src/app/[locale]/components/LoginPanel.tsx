"use client";

import { useContext, useState } from "react";
import { toast } from "sonner";

import LoginModal from "@/components/LoginModal";
import { LOGIN_URL } from "@/constants";
import { AuthContext } from "@/contexts/authContext";
import { GlobalContext } from "@/contexts/globalContext";
import { type LoginResponse, normalizeLoginUser } from "@/lib/loginResponse";
import { useTranslations } from "next-intl";
const LOGIN_ERROR_KEYS = {
  ERR_EMAIL_NOT_REGISTERED: "errors.emailNotRegistered",
  ERR_WRONG_PASSWORD: "errors.wrongPassword",
  ERR_ACCOUNT_NOT_ACTIVATED: "errors.accountNotActivated",
} as const;

export const LoginPanel = () => {
  const commonT = useTranslations("InteractivePanel.common");
  const t = useTranslations("LoginModal");
  const { login } = useContext(AuthContext);
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    setIsSignUpModalOpen,
  } = useContext(GlobalContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handlePlaceholderAction = () => {
    toast.info(commonT("featureComingSoon"));
  };

  const handleLoginSubmit = async (values: {
    email: string;
    password: string;
  }) => {
    setIsSubmitting(true);
    setLoginError(null);

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
          const data = await response.json().catch(() => null);
          const code: unknown = data?.error?.code;
          if (typeof code === "string" && code in LOGIN_ERROR_KEYS) {
            errorMessage = t(
              LOGIN_ERROR_KEYS[code as keyof typeof LOGIN_ERROR_KEYS],
            );
          }
        } catch {
          // No JSON body: keep the generic message.
        }

        throw new Error(errorMessage);
      }

      const data = (await response.json()) as LoginResponse;
      const token = data.api_key;

      if (!token) {
        throw new Error(commonT("somethingWrongHappened"));
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
      // fetch rejects with a TypeError when the network is down; its text
      // ("Failed to fetch") is not useful to show.
      const errorMessage =
        error instanceof TypeError
          ? t("errors.network")
          : error instanceof Error && error.message.trim()
            ? error.message
            : commonT("somethingWrongHappened");

      // Shown inside the login dialog, next to the fields, instead of a toast.
      setLoginError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LoginModal
      open={isLoginModalOpen}
      onOpenChange={(open) => {
        setIsLoginModalOpen(open);
        if (!open) setLoginError(null);
      }}
      onSubmit={handleLoginSubmit}
      onGoogleLogin={async () => {
        handlePlaceholderAction();
      }}
      onForgotPassword={handlePlaceholderAction}
      onSignUp={() => {
        setLoginError(null);
        setIsLoginModalOpen(false);
        setIsSignUpModalOpen(true);
      }}
      isSubmitting={isSubmitting}
      errorMessage={loginError}
      onErrorClear={() => setLoginError(null)}
    />
  );
};
