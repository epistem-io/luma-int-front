import type { MapGenerationContextType } from "@/contexts/mapGenerationContext";
import type { MapContextType } from "@/contexts/mapContext";
import {
  BASIC_INFORMATION_ACCORDION_TYPE,
  PANEL_COMPONENT_KEY,
  POINTING_TYPE,
} from "@/constants";

interface InteractivePanelFlowHelperParams {
  mapContext: MapContextType;
  mapGenerationContext: MapGenerationContextType;
}

export const resetAreaScopingData = ({
  mapContext,
  mapGenerationContext,
}: InteractivePanelFlowHelperParams) => {
  mapGenerationContext.setAreaScopingPolygonUrl(null);
  mapGenerationContext.setAreaScopingPolygonFileName("");
  mapGenerationContext.setAreaScopingPolygonArea(0);
  mapGenerationContext.setAreaScopingPolygonFileSize(0);
  mapGenerationContext.setAreaScopingPolygonError("");
  mapGenerationContext.setAreaScopingRegency(null);
  mapGenerationContext.setPolygonData(null);

  mapContext.vectorSource?.clear();

  mapGenerationContext.setBasicInformationOpenAccordion(
    BASIC_INFORMATION_ACCORDION_TYPE.SCOPING,
  );
  mapGenerationContext.setStepKey(PANEL_COMPONENT_KEY.BASIC_INFORMATION);
  mapGenerationContext.setIsBasicInformationChangeInput(false);

  // mapContext.resetMosaicLayer();
};

export const resetTimePeriodData = ({
  mapContext,
  mapGenerationContext,
}: InteractivePanelFlowHelperParams) => {
  mapGenerationContext.setTemporalCoverage("");
  mapGenerationContext.setTemporalCoverageUnit("");
  mapGenerationContext.setisEditingTemporalCoverage(true);

  mapGenerationContext.setBasicInformationOpenAccordion(
    BASIC_INFORMATION_ACCORDION_TYPE.PERIOD,
  );
  mapGenerationContext.setStepKey(PANEL_COMPONENT_KEY.BASIC_INFORMATION);
  mapGenerationContext.setIsBasicInformationChangeInput(false);

  // mapContext.resetMosaicLayer();
};

// Step 2's "Reset classification" / "Leave & discard": back to the scheme
// picker with nothing entered.
export const resetClassificationInputs = ({
  mapContext,
  mapGenerationContext,
}: InteractivePanelFlowHelperParams) => {
  mapGenerationContext.setIsDefineLULCChanged(true);
  mapGenerationContext.setDefaultArray([]);
  mapGenerationContext.setLucQuickRows([]);
  mapGenerationContext.setLucCustomTab("quick");
  mapGenerationContext.setLucQuickPhase("editing");
  mapGenerationContext.setLucDefaultConfirmed(false);
  mapGenerationContext.setLucView("picker");
  mapGenerationContext.setHaveDownloadedFile(false);

  // Step 3 samples are left alone here: the cleared classArray forces the
  // next Next through the "clears your sample data" warning and
  // resetSampleData, so they are never removed without that warning.
  mapGenerationContext.setClassArray([]);
  // Steps 3–4 can't be jumped to until step 2 is confirmed again.
  mapGenerationContext.setFurthestProgressIndex((furthest) =>
    Math.min(furthest, 1),
  );
  mapGenerationContext.setPointingType(POINTING_TYPE.EMPTY);
  mapContext.setPointingType(POINTING_TYPE.EMPTY);
  mapGenerationContext.setSelectedClass("");
  mapGenerationContext.setQuickManualSampling(false);

  mapGenerationContext.setLUCFile(null);
  mapGenerationContext.setLUCFilename("");
  mapGenerationContext.setLUCFilesize(0);
  mapGenerationContext.setLucExcelConfirmed(false);

  const doc = document.getElementById(
    "luc-template-file-upload",
  ) as HTMLInputElement | null;
  if (doc) doc.value = "";
};

// Changing step 2's classes invalidates step 3: uploaded files, points and
// the separability score all refer to the old classes, so the user uploads
// or samples again (the default scheme's reference points are re-placed by
// the class submit that follows).
export const resetSampleData = ({
  mapContext,
  mapGenerationContext,
}: InteractivePanelFlowHelperParams) => {
  mapGenerationContext.setUploadedFilesArray([]);
  mapGenerationContext.setTrainingFile(null);
  mapGenerationContext.setTrainingFilename("");
  mapGenerationContext.setTrainingFilesize(0);
  mapGenerationContext.setTrainingFileError("");

  mapContext.setMarkerArray([]);
  mapContext.markerVectorSource?.clear();
  mapContext.setMarkerLayerVisibilityArray([]);

  mapGenerationContext.setSampleQuality(null);
  mapGenerationContext.setSampleQualityError("");
  mapGenerationContext.setSampleQualityGenerated(false);
  mapGenerationContext.setSampleQualityConfirmed(false);
  mapGenerationContext.setIsTrainingDataChanged(true);
  // Step 4 can't be jumped to until step 3 is done again.
  mapGenerationContext.setFurthestProgressIndex((furthest) =>
    Math.min(furthest, 2),
  );
};

export const goToCompositeEditFlow = ({
  mapContext,
  mapGenerationContext,
}: InteractivePanelFlowHelperParams) => {
  mapGenerationContext.setSatelliteSource("");
  mapGenerationContext.setMaximumCloudCover(30);
  mapGenerationContext.setIsEditingSatelliteComposite(true);
  mapGenerationContext.setBasicInformationOpenAccordion(
    BASIC_INFORMATION_ACCORDION_TYPE.COMPOSITE,
  );
  mapGenerationContext.setStepKey(PANEL_COMPONENT_KEY.BASIC_INFORMATION);
  mapGenerationContext.setIsBasicInformationChangeInput(false);

  // mapContext.resetMosaicLayer();
};
