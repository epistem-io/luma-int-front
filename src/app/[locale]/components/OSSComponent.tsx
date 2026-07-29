import { Button } from "@/components/ui/button";
import { GlobalContext } from "@/contexts/globalContext";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { useContext, useEffect, useState } from "react";
import { LUCClassTable } from "./LUCClassTable";
import { MapContext } from "@/contexts/mapContext";
import { PANEL_COMPONENT_KEY, POINTING_TYPE } from "@/constants";
import { useTranslations } from "next-intl";

export const OSSComponent = () => {
  const { pointingType, selectedClass, classArray } =
    useContext(MapGenerationContext);

  const { markerCursor, removeMarkerCursor, setPointingType } =
    useContext(MapContext);

  // const [hasCalledMarkerCursor, setHasCalledMarkerCursor] = useState(false);

  useEffect(() => {
    // if (hasCalledMarkerCursor) return;

    // setHasCalledMarkerCursor(true);
    // console.log("markerCursor", pointingType);
    // setPointingType(pointingType);
    markerCursor(pointingType, classArray, false, selectedClass);

    return () => {
      // console.log("cleanup marker cursor");
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
  const { setStepKey, setDataTrainingActiveTab } =
    useContext(MapGenerationContext);
  const { markerArray, setMarkerId, overlay, removeMarkerCursor } =
    useContext(MapContext);

  const { sessionId } = useContext(GlobalContext);

  const t = useTranslations("InteractivePanel");

  const allMarkerClassFilled = markerArray.every(
    (item) => item.class_id !== -1,
  );

  // End Pointing unlocks once at least one point exists and every point has a
  // class; it only returns to the sampling panel — posting and the quality
  // analysis happen there via the score banner's Generate button.
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
      <div></div>
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
