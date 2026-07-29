export interface LULCPredictor {
  value: string;
  label: string;
  description: string;
}

export const LULC_PREDICTORS: LULCPredictor[] = [
  {
    value: "ELEVATION",
    label: "Elevation",
    description: "Shuttle Radar Topography Mission (SRTM) elevation",
  },
  {
    value: "SLOPE",
    label: "Slope",
    description: "Shuttle Radar Topography Mission (SRTM) slope",
  },
  {
    value: "NDVI",
    label: "NDVI",
    description: "Normalized Difference Vegetation Index",
  },
  {
    value: "EVI",
    label: "EVI",
    description: "Enhanced Vegetation Index",
  },
  {
    value: "NDBI",
    label: "NDBI",
    description: "Normalized Difference Built-Up Index",
  },
  {
    value: "MNDWI",
    label: "MNDWI",
    description: "Modified Normalized Difference Water Index",
  },
  // {
  //   value: "ndwi",
  //   label: "NDWI",
  //   description: "Normalized Difference Water Index",
  // },
  // {
  //   value: "bg",
  //   label: "BG",
  //   description: "Normalized Difference Blue Green",
  // },
  // {
  //   value: "blue",
  //   label: "Blue",
  //   description: "Blue band",
  // },
  // {
  //   value: "green",
  //   label: "Green",
  //   description: "Green band",
  // },
  // {
  //   value: "red",
  //   label: "Red",
  //   description: "Red band",
  // },
  // {
  //   value: "nir",
  //   label: "NIR",
  //   description: "Near Infrared Band",
  // },
  // {
  //   value: "distance-to-road",
  //   label: "Distance to Road",
  //   description: "Measuring closest road available",
  // },
  // {
  //   value: "distance-to-river",
  //   label: "Distance to River",
  //   description: "Measuring closest river available",
  // },
];
