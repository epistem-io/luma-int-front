"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ConfirmDialog } from "./ConfirmDialog";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { SummaryField, SummaryHeading } from "./SummaryField";

interface Props {
  areaSizeString: string;
  spatialResolutionString?: string;
  inputMethodString?: string;
  locationString?: string;
  accordion?: boolean;
  isEditing?: boolean;
  onClickEdit?: () => void;
}

export const AreaScopingSummary = ({
  areaSizeString,
  spatialResolutionString,
  inputMethodString,
  locationString,
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
          not yet
        </div>
      )}
      {!accordion && (
        <>
          <div className="space-y-3 relative">
            <SummaryHeading>{t("basicInformation.areaOfInterest")}</SummaryHeading>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {inputMethodString && (
                <SummaryField
                  className={locationString ? undefined : "col-span-2"}
                  label={t("basicInformation.inputMethod")}
                  value={inputMethodString}
                />
              )}
              {locationString && (
                <SummaryField
                  label={t("basicInformation.location")}
                  value={locationString}
                />
              )}
              <SummaryField
                className={spatialResolutionString ? undefined : "col-span-2"}
                label={t("basicInformation.areaOfInterestSubtitle")}
                value={areaSizeString}
              />
              {spatialResolutionString && (
                <SummaryField
                  label={t("areaScoping.spatialResolution")}
                  value={spatialResolutionString}
                />
              )}
            </div>
            {isEditing && (
              <Button
                onClick={() => setIsConfirmModalVisible(true)}
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
            onCancel={() => setIsConfirmModalVisible(false)}
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
