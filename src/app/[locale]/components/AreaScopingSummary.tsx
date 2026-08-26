"use client";

import { Button } from "@/components/ui/button";
import { AccordionContent } from "@radix-ui/react-accordion";
import Image from "next/image";
import { ConfirmDialog } from "./ConfirmDialog";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface Props {
  areaSizeString: string;
  spatialResolutionString?: string;
  accordion?: boolean;
  isEditing?: boolean;
  onClickEdit?: () => void;
}

export const AreaScopingSummary = ({
  areaSizeString,
  spatialResolutionString,
  accordion = true,
  isEditing = false,
  onClickEdit,
}: Props) => {
  if (!accordion && !onClickEdit) {
    return "Error";
  }

  const t = useTranslations("InteractivePanel");

  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  return (
    <>
      {accordion && (
        <div className="px-3 py-3 rounded-[12px] border-2 border-dashed border-secondary-purple-light-active bg-purple-second">
          not yet
        </div>
      )}
      {!accordion && (
        <>
          <div className="space-y-2 relative">
            <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
              {t("basicInformation.areaOfInterest")}
            </p>
            <div className="gap-y-5 grid grid-cols-2">
              <div
                className={cn(
                  "space-y-0",
                  spatialResolutionString ? "col-span-1" : "col-span-2",
                )}
              >
                <p className="font-aptos text-[15px] font-semibold leading-5.5 text-text-icons-base-second">
                  {t("basicInformation.areaOfInterestSubtitle")}
                </p>
                <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-secondary-purple-dark">
                  {areaSizeString}
                </p>
              </div>
              {spatialResolutionString && (
                <div className="space-y-0 col-span-1">
                  <p className="font-aptos text-[15px] font-semibold leading-5.5 text-text-icons-base-second">
                    {t("areaScoping.spatialResolution")}
                  </p>
                  <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-secondary-purple-dark">
                    {spatialResolutionString}
                  </p>
                </div>
              )}
            </div>
            {isEditing && (
              <Button
                onClick={() => {
                  setIsConfirmModalVisible(true);
                }}
                variant={"ghost"}
                className="absolute top-0 right-0 p-1 rounded-full cursor-pointer"
                size={"icon"}
              >
                <Image
                  src="/svgs/fa-edit.svg"
                  alt="edit"
                  width={18}
                  height={16}
                  className="h-4 w-4.5"
                />
              </Button>
            )}
          </div>

          <ConfirmDialog
            isVisible={isConfirmModalVisible}
            onCancel={() => {
              setIsConfirmModalVisible(false);
            }}
            onConfirm={() => {
              if (!onClickEdit) return;
              setIsConfirmModalVisible(false);
              onClickEdit();
            }}
            title={t("common.changeInput")}
            subtitle={t("common.confirmSubtitle")}
            confirmButtonCaption={t("common.changeInput")}
            cancelButtonCaption={t("common.cancelChangeInput")}
          />
        </>
      )}
    </>
  );
};
