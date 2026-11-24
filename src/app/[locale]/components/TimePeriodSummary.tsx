"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ConfirmDialog } from "./ConfirmDialog";
import { useContext, useState } from "react";
import { useTranslations } from "next-intl";
import { resetTimePeriodData } from "@/lib/interactivePanelFlowHelper";
import { MapContext } from "@/contexts/mapContext";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import {
  SummaryBox,
  SummaryChangeLink,
  SummaryField,
  SummaryHeading,
} from "./SummaryField";

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
  const mapContext = useContext(MapContext);
  const mapGenerationContext = useContext(MapGenerationContext);
  const t = useTranslations("InteractivePanel");

  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  if (!accordion && !onClickEdit) {
    return "Error";
  }
  return (
    <>
      {accordion && (
        <SummaryBox>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            <SummaryField
              label={t("timePeriod.temporalResolution")}
              value={temporalResolutionLabel}
            />
            <SummaryField
              label={t("timePeriod.specificPeriod")}
              value={specificPeriod}
            />
            <SummaryField
              className="col-span-2"
              label={t("timePeriod.satelliteInputDateRange")}
              value={dateRange}
            />
          </div>
          {/* The time period is locked once the user has moved on to
              step 2. */}
          {!mapGenerationContext.hasLeftStep1 && (
            <SummaryChangeLink
              label={t("common.changeInput")}
              onClick={() =>
                resetTimePeriodData({ mapContext, mapGenerationContext })
              }
            />
          )}
        </SummaryBox>
      )}
      {!accordion && (
        <>
          <div className="space-y-3 relative">
            <SummaryHeading>
              {t("basicInformation.yourSelectedTimePeriod")}
            </SummaryHeading>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              <SummaryField
                label={t("basicInformation.temporalResolution")}
                value={temporalResolutionLabel}
              />
              <SummaryField
                label={t("basicInformation.specificPeriod")}
                value={specificPeriod}
              />
              <SummaryField
                className="col-span-2"
                label={t("basicInformation.satelliteInputDateRange")}
                value={dateRange}
              />
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
