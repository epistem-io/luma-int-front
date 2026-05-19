"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (values: {
    email: string;
    password: string;
  }) => void | Promise<void>;
  onGoogleLogin?: () => void | Promise<void>;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
  isSubmitting?: boolean;
  isGoogleLoading?: boolean;
}

const fieldClassName =
  "h-10 rounded-lg border-neutral-400 bg-background-base-main px-3 font-aptos text-sm leading-5 text-text-icons-base-main placeholder:text-text-icons-base-second";

export default function LoginModal({
  open,
  onOpenChange,
  onSubmit,
  onGoogleLogin,
  onForgotPassword,
  onSignUp,
  isSubmitting = false,
  isGoogleLoading = false,
}: LoginModalProps) {
  const t = useTranslations("LoginModal");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const loginSchema = z.object({
    email: z.email({ message: t("errors.invalidEmail") }),
    password: z.string().min(8, { message: t("errors.passwordMin") }),
  });

  useEffect(() => {
    if (!open) {
      setEmail("");
      setPassword("");
      setErrors({});
    }
  }, [open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    setErrors({});
    await onSubmit?.({ email, password });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[400px] gap-0 overflow-hidden rounded-2xl border-neutral-400 bg-background-base-main p-0 shadow-lg"
      >
        <DialogHeader className="gap-1.5 p-6 text-left">
          <DialogTitle className="lp-hea">{t("title")}</DialogTitle>
          <DialogDescription className="font-aptos text-sm leading-5 text-text-icons-base-second">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex flex-col gap-4 px-6 pb-6">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="login-email"
                className="font-aptos text-sm font-medium leading-5 text-text-icons-base-main"
              >
                {t("emailLabel")}
              </Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (errors.email) {
                    setErrors((current) => ({ ...current, email: undefined }));
                  }
                }}
                placeholder={t("emailPlaceholder")}
                className={fieldClassName}
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email ? (
                <p className="font-aptos text-sm leading-5 text-destructive">
                  {errors.email}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <Label
                  htmlFor="login-password"
                  className="font-aptos text-sm font-medium leading-5 text-text-icons-base-main"
                >
                  {t("passwordLabel")}
                </Label>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="font-aptos text-sm leading-5 text-text-icons-base-main underline underline-offset-2 transition-opacity hover:cursor-pointer hover:opacity-75"
                >
                  {t("forgotPassword")}
                </button>
              </div>

              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (errors.password) {
                    setErrors((current) => ({
                      ...current,
                      password: undefined,
                    }));
                  }
                }}
                placeholder={t("passwordPlaceholder")}
                className={fieldClassName}
                aria-invalid={Boolean(errors.password)}
              />
              {errors.password ? (
                <p className="font-aptos text-sm leading-5 text-destructive">
                  {errors.password}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-2 px-6 pb-6">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="text-m-semibold h-10 rounded-[12px] text-white"
            >
              {t("submit")}
            </Button>

            {/* <Button
              type="button"
              variant="outline"
              disabled={isGoogleLoading}
              onClick={onGoogleLogin}
              className={cn(
                "text-m-semibold h-10 rounded-[12px] border-neutral-400 bg-background-base-main text-text-icons-base-main hover:bg-background-base-main hover:text-text-icons-base-main",
                "disabled:border-neutral-400 disabled:bg-background-base-main disabled:text-text-icons-base-second",
              )}
            >
              {t("google")}
            </Button> */}
          </div>
        </form>

        <div className="px-6 pb-6 text-center">
          <p className="font-aptos text-sm leading-5 text-text-icons-base-main">
            {t("noAccount")}{" "}
            <button
              type="button"
              onClick={onSignUp}
              className="font-aptos text-sm leading-5 text-text-icons-base-main underline underline-offset-2 transition-opacity hover:cursor-pointer hover:opacity-75"
            >
              {t("signUp")}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
