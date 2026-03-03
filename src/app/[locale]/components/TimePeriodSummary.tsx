"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ConfirmDialog } from "./ConfirmDialog";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface Props {
  temporalResolutionLabel: string;
  specificPeriod: string;
  dateRange: string;
  accordion?: boolean;
  isEditing?: boolean;
  onClickEdit?: () => void;
}

export const TimePeriodSummary = ({
  temporalResolutionLabel,
  specificPeriod,
  dateRange,
  accordion = true,
  isEditing = false,
  onClickEdit,
}: Props) => {
  const t = useTranslations("InteractivePanel");

  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  if (!accordion && !onClickEdit) {
    return "Error";
  }
  return (
    <>
      {accordion && (
        <div className="px-3 py-3 rounded-[12px] border-2 border-dashed border-secondary-purple-light-active bg-purple-second">
          <div className="space-y-3">
            <p className="font-aptos text-lg font-semibold leading-7 text-text-icons-base-main">
              {t("yourSelectedTimePeriod")}
            </p>
            <div className="gap-y-5 grid grid-cols-2">
              <div className="space-y-1 col-span-1">
                <p className="font-aptos text-[15px] font-semibold leading-5.5 text-text-icons-base-third">
                  {t("temporalResolution")}
                </p>
                <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-secondary-purple-dark">
                  {temporalResolutionLabel}
                </p>
              </div>
              <div className="space-y-1 col-span-1">
                <p className="font-aptos text-[15px] font-semibold leading-5.5 text-text-icons-base-third">
                  {t("specificPeriod")}
                </p>
                <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-secondary-purple-dark">
                  {specificPeriod}
                </p>
              </div>
              <div className="space-y-1 col-span-2">
                <p className="font-aptos text-[15px] font-semibold leading-5.5 text-text-icons-base-third">
                  {t("satelliteInputDateRange")}
                </p>
                <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-secondary-purple-dark">
                  {dateRange}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {!accordion && (
        <>
          <div className="space-y-2 relative">
            <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
              {t("timePeriod")}
            </p>
            <div className="gap-y-5 grid grid-cols-2">
              <div className="space-y-1 col-span-1">
                <p className="font-aptos text-[15px] font-semibold leading-5.5 text-text-icons-base-third">
                  {t("temporalResolution")}
                </p>
                <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-secondary-purple-dark">
                  {temporalResolutionLabel}
                </p>
              </div>
              <div className="space-y-1 col-span-1">
                <p className="font-aptos text-[15px] font-semibold leading-5.5 text-text-icons-base-third">
                  {t("specificPeriod")}
                </p>
                <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-secondary-purple-dark">
                  {specificPeriod}
                </p>
              </div>
              <div className="space-y-1 col-span-2">
                <p className="font-aptos text-[15px] font-semibold leading-5.5 text-text-icons-base-third">
                  {t("satelliteInputDateRange")}
                </p>
                <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-secondary-purple-dark">
                  {dateRange}
                </p>
              </div>
            </div>
            {isEditing && (
              <Button
                variant={"ghost"}
                className="absolute top-0 right-0 p-1 rounded-full cursor-pointer"
                size={"icon"}
                onClick={() => {
                  setIsConfirmModalVisible(true);
                }}
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
            title={t("changeInput")}
            subtitle={t("confirmSubtitle")}
            confirmButtonCaption={t("changeInput")}
            cancelButtonCaption={t("cancelChangeInput")}
          />
        </>
      )}
    </>
  );
};
