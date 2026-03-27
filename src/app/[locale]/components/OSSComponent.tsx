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
  const { setStepKey } = useContext(MapGenerationContext);
  const { markerArray, setMarkerId, overlay, removeMarkerCursor } =
    useContext(MapContext);

  const { sessionId } = useContext(GlobalContext);

  const t = useTranslations("InteractivePanel");

  const allMarkerClassFilled = markerArray.every(
    (item) => item.class_id !== -1,
  );

  const isNextDisabled = !allMarkerClassFilled;

  const onClickNext = () => {
    setMarkerId("");
    overlay?.setPosition(undefined);

    // removeMarkerCursor();

    setStepKey(PANEL_COMPONENT_KEY.DATA_TRAINING);
  };

  return (
    <div className="grid grid-cols-2 p-3 pt-4 gap-x-4">
      <div></div>
      {/* {isLUCLoading && (
          <div className="w-full h-10 flex flex-row justify-center">
            <span className="loader sm"></span>
          </div>
        )} */}
      {/* {!isLUCLoading && (
        )} */}
      <Button
        onClick={() => {
          // setStepKey(PANEL_COMPONENT_KEY.DEFINE_LUC);
          // setProgressPanelIndex(2);
          onClickNext();
        }}
        disabled={isNextDisabled}
        variant="primary"
        className=""
      >
        {t("endPointing")}
      </Button>
    </div>
  );
};
