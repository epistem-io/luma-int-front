import type { MapGenerationContextType } from "@/contexts/mapGenerationContext";
import type { MapContextType } from "@/contexts/mapContext";
import {
  BASIC_INFORMATION_ACCORDION_TYPE,
  PANEL_COMPONENT_KEY,
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
