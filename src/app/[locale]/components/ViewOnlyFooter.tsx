"use client";

import { Button } from "@/components/ui/button";
import { MapIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useStepNavigation } from "./useStepNavigation";

// Replaces a step's own footer (Edit / Back / Next) while it is opened from
// Your Map: earlier steps are view only once a map exists.
export const ViewOnlyFooter = () => {
  const t = useTranslations("InteractivePanel");
  const { goToYourMap, isBusy } = useStepNavigation();

  return (
    <div className="p-3 pt-4">
      <Button
        variant="primary"
        className="w-full"
        disabled={isBusy}
        onClick={goToYourMap}
      >
        <MapIcon className="size-4" />
        {t("common.backToYourMap")}
      </Button>
    </div>
  );
};
