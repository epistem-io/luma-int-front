"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { CircleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

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
  /** Server-side failure to show inside the dialog; null or undefined hides it. */
  errorMessage?: string | null;
  /** Called when the user edits a field or the form resets, so the message clears. */
  onErrorClear?: () => void;
}

interface LoginFormValues {
  email: string;
  password: string;
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
  errorMessage,
  onErrorClear,
}: LoginModalProps) {
  const t = useTranslations("LoginModal");
  const tCommon = useTranslations("InteractivePanel.common");

  const loginSchema = z.object({
    email: z.email({ message: t("errors.invalidEmail") }),
    password: z.string().min(8, { message: t("errors.passwordMin") }),
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [form, open]);

  // Any edit (or the reset on close) clears a server error, so a stale
  // message never sits next to what the user is retyping.
  useEffect(() => {
    if (!errorMessage) return;
    const subscription = form.watch(() => onErrorClear?.());
    return () => subscription.unsubscribe();
  }, [errorMessage, form, onErrorClear]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit?.(values);
  });

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
          <Form {...form}>
            <div className="flex flex-col gap-4 px-6 pb-6">
              {errorMessage && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-danger-200 bg-danger-50 p-3"
                >
                  <CircleAlert
                    className="mt-0.5 size-5 shrink-0 text-danger-700"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 space-y-0.5">
                    <p className="font-aptos text-sm font-bold leading-5 text-danger-800">
                      {tCommon("errors.loginFailed")}
                    </p>
                    <p className="font-aptos text-sm leading-5 text-danger-800">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* disabled lives on the Input, not the FormField: react-hook-form
                  excludes disabled fields from handleSubmit values, so
                  disabled={isSubmitting} on the Controller can strip
                  email/password from the request mid-submit. */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel className="font-aptos text-sm font-medium leading-5 text-text-icons-base-main">
                      {t("emailLabel")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="login-email"
                        type="email"
                        disabled={isSubmitting}
                        autoComplete="email"
                        placeholder={t("emailPlaceholder")}
                        className={fieldClassName}
                      />
                    </FormControl>
                    <FormMessage className="font-aptos text-sm leading-5" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <FormLabel className="font-aptos text-sm font-medium leading-5 text-text-icons-base-main">
                        {t("passwordLabel")}
                      </FormLabel>
                      <button
                        type="button"
                        onClick={onForgotPassword}
                        className="font-aptos text-sm leading-5 text-text-icons-base-main underline underline-offset-2 transition-opacity hover:cursor-pointer hover:opacity-75"
                      >
                        {t("forgotPassword")}
                      </button>
                    </div>

                    <FormControl>
                      <Input
                        {...field}
                        id="login-password"
                        type="password"
                        disabled={isSubmitting}
                        autoComplete="current-password"
                        placeholder={t("passwordPlaceholder")}
                        className={fieldClassName}
                      />
                    </FormControl>
                    <FormMessage className="font-aptos text-sm leading-5" />
                  </FormItem>
                )}
              />
            </div>
          </Form>

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
