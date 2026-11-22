import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { SummaryField, SummaryHeading } from "./SummaryField";

interface Props {
  sateliteString: string;
  cloudCoverageString: string;
  isEditing?: boolean;
  onClickEdit?: () => void;
  accordion?: boolean;
}

export const SatelliteCompositeSummary = ({
  accordion = true,
  sateliteString,
  cloudCoverageString,
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
      <div className="space-y-3 relative">
        <SummaryHeading>{t("basicInformation.satelliteComposite")}</SummaryHeading>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          <SummaryField
            label={t("basicInformation.satellite")}
            value={sateliteString}
          />
          <SummaryField
            label={t("basicInformation.cloudCoverage")}
            value={cloudCoverageString}
          />
        </div>
        {isEditing && (
          <Button
            variant={"ghost"}
            className="absolute top-0 right-0 p-1 rounded-full cursor-pointer"
            size={"icon"}
            onClick={() => setIsConfirmModalVisible(true)}
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
  );
};
