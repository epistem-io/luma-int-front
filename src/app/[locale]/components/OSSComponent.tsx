import { Button } from "@/components/ui/button";
import { GlobalContext } from "@/contexts/globalContext";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { useContext, useEffect, useState } from "react";
import { LUCClassTable } from "./LUCClassTable";
import { MapContext } from "@/contexts/mapContext";
import { PANEL_COMPONENT_KEY, POINTING_TYPE } from "@/constants";
import { useTranslations } from "next-intl";
import { DownloadIcon } from "lucide-react";
import { downloadTrainingSamplesShapefile } from "@/utils/downloadTrainingSamples";

export const OSSComponent = () => {
  const { pointingType, selectedClass, classArray } =
    useContext(MapGenerationContext);

  const { markerCursor, removeMarkerCursor, setPointingType } =
    useContext(MapContext);

  useEffect(() => {
    markerCursor(pointingType, classArray, false, selectedClass);

    return () => {
      removeMarkerCursor();
    };
  }, []);

  return (
    <div>
      <LUCClassTable />
    </div>
  );
};

export const OSSFooter = () => {
  const { setStepKey, setDataTrainingActiveTab, classArray } =
    useContext(MapGenerationContext);
  const { markerArray, setMarkerId, overlay, removeMarkerCursor } =
    useContext(MapContext);

  const { sessionId } = useContext(GlobalContext);

  const t = useTranslations("InteractivePanel");

  const allMarkerClassFilled = markerArray.every(
    (item) => item.class_id !== -1,
  );

  const isNextDisabled = markerArray.length === 0 || !allMarkerClassFilled;

  const onClickNext = () => {
    setMarkerId("");
    overlay?.setPosition(undefined);
    setDataTrainingActiveTab("oss");

    // removeMarkerCursor();

    setStepKey(PANEL_COMPONENT_KEY.DATA_TRAINING);
  };

  return (
    <div className="grid grid-cols-2 p-3 pt-4 gap-x-4">
      <Button
        variant="outline"
        disabled={isNextDisabled}
        onClick={() => 
          downloadTrainingSamplesShapefile(markerArray, classArray, `training-samples-${sessionId}`)
        }
      >
        <DownloadIcon className="size-4" />
        {t("dataTraining.downloadSamples")}
      </Button>
      <Button
        onClick={() => {
          onClickNext();
        }}
        disabled={isNextDisabled}
        variant="primary"
        className=""
      >
        {t("dataTraining.endPointing")}
      </Button>
    </div>
  );
};
