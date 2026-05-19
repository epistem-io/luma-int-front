"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
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
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    name?: string;
    organizationName?: string;
    acceptedTerms?: string;
  }>({});

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

  useEffect(() => {
    if (!open) {
      setEmail("");
      setName("");
      setOrganizationName("");
      setAcceptedTerms(false);
      setErrors({});
    }
  }, [open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = signUpSchema.safeParse({
      email,
      name,
      organizationName,
      acceptedTerms,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      setErrors({
        email: fieldErrors.email?.[0],
        name: fieldErrors.name?.[0],
        organizationName: fieldErrors.organizationName?.[0],
        acceptedTerms: fieldErrors.acceptedTerms?.[0],
      });
      return;
    }

    setErrors({});
    await onSubmit?.(result.data);
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
                htmlFor="signup-email"
                className="font-aptos text-sm font-medium leading-5 text-text-icons-base-main"
              >
                {t("emailLabel")}
              </Label>
              <Input
                id="signup-email"
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
              <Label
                htmlFor="signup-name"
                className="font-aptos text-sm font-medium leading-5 text-text-icons-base-main"
              >
                {t("nameLabel")}
              </Label>
              <Input
                id="signup-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  if (errors.name) {
                    setErrors((current) => ({ ...current, name: undefined }));
                  }
                }}
                placeholder={t("namePlaceholder")}
                className={fieldClassName}
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name ? (
                <p className="font-aptos text-sm leading-5 text-destructive">
                  {errors.name}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="signup-organization-name"
                className="font-aptos text-sm font-medium leading-5 text-text-icons-base-main"
              >
                {t("organizationLabel")}
              </Label>
              <Input
                id="signup-organization-name"
                type="text"
                autoComplete="organization"
                value={organizationName}
                onChange={(event) => {
                  setOrganizationName(event.target.value);
                  if (errors.organizationName) {
                    setErrors((current) => ({
                      ...current,
                      organizationName: undefined,
                    }));
                  }
                }}
                placeholder={t("organizationPlaceholder")}
                className={fieldClassName}
                aria-invalid={Boolean(errors.organizationName)}
              />
              {errors.organizationName ? (
                <p className="font-aptos text-sm leading-5 text-destructive">
                  {errors.organizationName}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="signup-accepted-terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => {
                    setAcceptedTerms(checked === true);
                    if (errors.acceptedTerms) {
                      setErrors((current) => ({
                        ...current,
                        acceptedTerms: undefined,
                      }));
                    }
                  }}
                  className="mt-0.5 size-[22px] rounded-[8px] border-primary-pink data-[state=checked]:border-primary-pink data-[state=checked]:bg-primary-pink"
                  aria-invalid={Boolean(errors.acceptedTerms)}
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
              {errors.acceptedTerms ? (
                <p className="font-aptos text-sm leading-5 text-destructive">
                  {errors.acceptedTerms}
                </p>
              ) : null}
            </div>
          </div>

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
