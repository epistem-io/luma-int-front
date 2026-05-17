import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";

interface Props {
  sateliteString: string;
  cloudCoverageString: string;
  isEditing?: boolean;
  onClickEdit?: () => void;
  // dateRange: string;
  accordion?: boolean;
}

export const SatelliteCompositeSummary = ({
  // temporalResolutionLabel,
  // specificPeriod,
  // dateRange,
  accordion = true,
  sateliteString,
  cloudCoverageString,
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
      <div className="space-y-2 relative">
        <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
          {t("basicInformation.satelliteComposite")}
        </p>
        <div className="gap-y-5 grid grid-cols-2">
          <div className="space-y-1 col-span-1">
            <p className="font-aptos text-[15px] font-semibold leading-5.5 text-text-icons-base-third">
              {t("basicInformation.satellite")}
            </p>
            <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-secondary-purple-dark">
              {sateliteString}
            </p>
          </div>
          <div className="space-y-1 col-span-1">
            <p className="font-aptos text-[15px] font-semibold leading-5.5 text-text-icons-base-third">
              {t("basicInformation.cloudCoverage")}
            </p>
            <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-secondary-purple-dark">
              {cloudCoverageString}
            </p>
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
  );
};
