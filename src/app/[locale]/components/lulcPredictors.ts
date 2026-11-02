export interface LULCPredictor {
  value: string;
  label: string;
  description: string;
  disabled?: boolean;
  conflictsWith?: string[];
}

export interface LULCPredictorGroup {
  key: "vegetation" | "waterHumidity" | "landBuiltUp" | "terrain";
  predictors: LULCPredictor[];
}

export const LULC_PREDICTOR_GROUPS: LULCPredictorGroup[] = [
  {
    key: "vegetation",
    predictors: [
      { value: "NDVI", label: "NDVI", description: "Normalized Difference Vegetation Index" },
      { value: "EVI", label: "EVI", description: "Enhanced Vegetation Index", conflictsWith: ["SAVI"] },
      { value: "SAVI", label: "SAVI", description: "Soil-Adjusted Vegetation Index", conflictsWith: ["EVI"] },
      { value: "MSAVI", label: "MSAVI", description: "Modified Soil-Adjusted Vegetation Index" },
      { value: "OSAVI", label: "OSAVI", description: "Optimized Soil-Adjusted Vegetation Index" },
      { value: "ARVI", label: "ARVI", description: "Atmospherically Resistant Vegetation Index" },
      { value: "GNDVI", label: "GNDVI", description: "Green Normalized Difference Vegetation Index" },
      { value: "GBNDVI", label: "GBNDVI", description: "Green-Blue Normalized Difference Vegetation Index" },
    ]
  },
  {
    key: "waterHumidity",
    predictors: [
      { value: "MNDWI", label: "MNDWI", description: "Modified Normalized Difference Water Index" },
      { value: "NDMI", label: "NDMI", description: "Normalized Difference Moisture Index" },
      { value: "AWEInsh", label: "AWEInsh", description: "Automated Water Extraction Index (no shadow)" },
    ]
  },
  {
    key: "landBuiltUp",
    predictors: [
      { value: "NDBI", label: "NDBI", description: "Normalized Difference Built-Up Index" },
      { value: "DBSI", label: "DBSI", description: "Dry Bareness Index" },
      { value: "MBI", label: "MBI", description: "Modified Bare Soil Index" },
    ]
  },
  {
    key: "terrain",
    predictors: [
      { value: "ELEVATION", label: "Elevation", description: "NASADEM elevation (reprocessed SRTM)" },
      { value: "SLOPE", label: "Slope", description: "Slope derived from NASADEM elevation" },
      { value: "ASPECT", label: "Aspect", description: "Slope direction derived from NASADEM elevation" },
    ]
  }
]

export const LULC_PREDICTORS = LULC_PREDICTOR_GROUPS.flatMap(group => group.predictors);
// export const LULC_PREDICTORS: LULCPredictor[] = [
//   {
//     value: "ELEVATION",
//     label: "Elevation",
//     description: "Shuttle Radar Topography Mission (SRTM) elevation",
//   },
//   {
//     value: "SLOPE",
//     label: "Slope",
//     description: "Shuttle Radar Topography Mission (SRTM) slope",
//   },
//   {
//     value: "NDVI",
//     label: "NDVI",
//     description: "Normalized Difference Vegetation Index",
//   },
//   {
//     value: "EVI",
//     label: "EVI",
//     description: "Enhanced Vegetation Index",
//   },
//   {
//     value: "NDBI",
//     label: "NDBI",
//     description: "Normalized Difference Built-Up Index",
//   },
//   {
//     value: "MNDWI",
//     label: "MNDWI",
//     description: "Modified Normalized Difference Water Index",
//   },
//   // {
//   //   value: "ndwi",
//   //   label: "NDWI",
//   //   description: "Normalized Difference Water Index",
//   // },
//   // {
//   //   value: "bg",
//   //   label: "BG",
//   //   description: "Normalized Difference Blue Green",
//   // },
//   // {
//   //   value: "blue",
//   //   label: "Blue",
//   //   description: "Blue band",
//   // },
//   // {
//   //   value: "green",
//   //   label: "Green",
//   //   description: "Green band",
//   // },
//   // {
//   //   value: "red",
//   //   label: "Red",
//   //   description: "Red band",
//   // },
//   // {
//   //   value: "nir",
//   //   label: "NIR",
//   //   description: "Near Infrared Band",
//   // },
//   // {
//   //   value: "distance-to-road",
//   //   label: "Distance to Road",
//   //   description: "Measuring closest road available",
//   // },
//   // {
//   //   value: "distance-to-river",
//   //   label: "Distance to River",
//   //   description: "Measuring closest river available",
//   // },
// ];
