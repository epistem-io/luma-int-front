"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Share2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { SHARE_MAP_URL } from "@/constants";
import { GlobalContext } from "@/contexts/globalContext";
import { UnauthorizedError, fetchWithAuth } from "@/lib/fetchWithAuth";

export interface ShareMapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ShareMapFormValues {
  recipientName: string;
  recipientEmail: string;
}

const fieldClassName =
  "h-10 rounded-lg border-neutral-400 bg-background-base-main px-3 font-aptos text-sm leading-5 text-text-icons-base-main placeholder:text-text-icons-base-second";

export const ShareMapDialog = ({ open, onOpenChange }: ShareMapDialogProps) => {
  const { sessionId, setIsLoginModalOpen } = useContext(GlobalContext);
  const t = useTranslations("InteractivePanel.yourMap");
  const commonT = useTranslations("InteractivePanel.common");
  const locale = useLocale();

  const shareSchema = z.object({
    recipientName: z
      .string()
      .trim()
      .min(1, { message: t("shareRecipientNameRequired") }),
    recipientEmail: z.email({ message: t("shareRecipientEmailInvalid") }),
  });

  const form = useForm<ShareMapFormValues>({
    resolver: zodResolver(shareSchema),
    defaultValues: {
      recipientName: "",
      recipientEmail: "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [form, open]);

  const isSubmitting = form.formState.isSubmitting;

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const response = await fetchWithAuth(SHARE_MAP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          recipient_name: values.recipientName,
          recipient_email: values.recipientEmail,
          language: locale,
        }),
      });

      if (!response.ok) {
        const json = await response.json().catch(() => null);
        throw new Error(json?.message || commonT("somethingWrongHappened"));
      }

      toast.success(t("shareSuccess"));
      onOpenChange(false);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        setIsLoginModalOpen(true);
        return;
      }

      toast.error(
        error instanceof Error
          ? error.message
          : commonT("somethingWrongHappened"),
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[500px] gap-4 rounded-2xl border-neutral-400 bg-background-base-main px-6 py-8 shadow-lg sm:px-8"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-[52px] items-center justify-center rounded-full border-[3px] border-primary-pink text-primary-pink">
            <Share2 className="size-7 stroke-[2.5]" aria-hidden="true" />
          </div>

          <DialogHeader className="items-center gap-3 text-center">
            <DialogTitle className="font-noto-sans text-[28px] font-bold leading-none tracking-[-0.28px] text-text-icons-base-main">
              {t("shareMap")}
            </DialogTitle>
            <DialogDescription className="max-w-[394px] font-aptos text-base leading-tight text-text-icons-base-main">
              {t("shareDialogDescription")}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Form {...form}>
            <div className="flex flex-col gap-4">
              {/* disabled lives on the Input, not the FormField: react-hook-form
                  excludes disabled fields from handleSubmit values, so
                  disabled={isSubmitting} on the Controller can strip
                  recipient_name/recipient_email from the request mid-submit. */}
              <FormField
                control={form.control}
                name="recipientName"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel className="font-aptos text-sm font-medium leading-5 text-text-icons-base-main">
                      {t("shareRecipientName")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="share-recipient-name"
                        type="text"
                        disabled={isSubmitting}
                        autoComplete="name"
                        placeholder={t("shareRecipientNamePlaceholder")}
                        className={fieldClassName}
                      />
                    </FormControl>
                    <FormMessage className="font-aptos text-sm leading-5" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recipientEmail"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel className="font-aptos text-sm font-medium leading-5 text-text-icons-base-main">
                      {t("shareRecipientEmail")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="share-recipient-email"
                        type="email"
                        disabled={isSubmitting}
                        autoComplete="email"
                        placeholder={t("shareRecipientEmailPlaceholder")}
                        className={fieldClassName}
                      />
                    </FormControl>
                    <FormMessage className="font-aptos text-sm leading-5" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="secondary"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
              >
                {commonT("cancel")}
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {t("shareSending")}
                  </>
                ) : (
                  t("shareSend")
                )}
              </Button>
            </div>
          </Form>
        </form>
      </DialogContent>
    </Dialog>
  );
};
