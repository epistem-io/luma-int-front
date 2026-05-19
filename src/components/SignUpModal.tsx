"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Label } from "@/components/ui/label";

export interface SignUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (values: {
    email: string;
    name: string;
    organizationName: string;
    acceptedTerms: boolean;
  }) => void | Promise<void>;
  onSignIn?: () => void;
  isSubmitting?: boolean;
}

interface SignUpFormValues {
  email: string;
  name: string;
  organizationName: string;
  acceptedTerms: boolean;
}

const fieldClassName =
  "h-10 rounded-lg border-neutral-400 bg-background-base-main px-3 font-aptos text-sm leading-5 text-text-icons-base-main placeholder:text-text-icons-base-second";

export default function SignUpModal({
  open,
  onOpenChange,
  onSubmit,
  onSignIn,
  isSubmitting = false,
}: SignUpModalProps) {
  const t = useTranslations("SignUpModal");

  const signUpSchema = z.object({
    email: z.email({ message: t("errors.invalidEmail") }),
    name: z
      .string()
      .trim()
      .min(1, { message: t("errors.nameRequired") }),
    organizationName: z
      .string()
      .trim()
      .min(1, { message: t("errors.organizationRequired") }),
    acceptedTerms: z
      .boolean()
      .refine((value) => value, { message: t("errors.acceptTerms") }),
  });

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      name: "",
      organizationName: "",
      acceptedTerms: false,
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [form, open]);

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
                        id="signup-email"
                        type="email"
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
                name="name"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel className="font-aptos text-sm font-medium leading-5 text-text-icons-base-main">
                      {t("nameLabel")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="signup-name"
                        type="text"
                        autoComplete="name"
                        placeholder={t("namePlaceholder")}
                        className={fieldClassName}
                      />
                    </FormControl>
                    <FormMessage className="font-aptos text-sm leading-5" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organizationName"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel className="font-aptos text-sm font-medium leading-5 text-text-icons-base-main">
                      {t("organizationLabel")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="signup-organization-name"
                        type="text"
                        autoComplete="organization"
                        placeholder={t("organizationPlaceholder")}
                        className={fieldClassName}
                      />
                    </FormControl>
                    <FormMessage className="font-aptos text-sm leading-5" />
                  </FormItem>
                )}
              />

              <Controller
                control={form.control}
                name="acceptedTerms"
                render={({ field, fieldState }) => (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="signup-accepted-terms"
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked === true);
                        }}
                        className="mt-0.5 size-[22px] rounded-[8px] border-primary-pink data-[state=checked]:border-primary-pink data-[state=checked]:bg-primary-pink"
                        aria-invalid={fieldState.invalid}
                      />
                      <Label
                        htmlFor="signup-accepted-terms"
                        className="font-aptos text-sm leading-5 text-text-icons-base-second"
                      >
                        <span>
                          {t.rich("termsLabel", {
                            terms: (chunks) => (
                              <span className="text-primary-pink">{chunks}</span>
                            ),
                            privacy: (chunks) => (
                              <span className="text-primary-pink">{chunks}</span>
                            ),
                          })}
                        </span>
                      </Label>
                    </div>
                    {fieldState.error?.message ? (
                      <p className="font-aptos text-sm leading-5 text-destructive">
                        {fieldState.error.message}
                      </p>
                    ) : null}
                  </div>
                )}
              />
            </div>
          </Form>

          <div className="flex flex-col gap-4 px-6 pb-6">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="text-m-semibold h-10 rounded-[12px] text-white"
            >
              {t("submit")}
            </Button>

            <p className="text-center font-aptos text-sm leading-5 text-text-icons-base-second">
              {t("hasAccount")}{" "}
              <button
                type="button"
                onClick={onSignIn}
                className="font-bold text-primary-pink transition-opacity hover:cursor-pointer hover:opacity-75"
              >
                {t("signIn")}
              </button>
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
