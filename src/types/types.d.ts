interface ErrorableResponse {
  error?: {
    code: string;
    message: string;
  };
  // "stack": [],
  // "success": false,
  trace?: string;
}

interface GeosAoiRes extends ErrorableResponse {
  data: {
    area_size: number;
    created_date: string; // DATE ?
    id: string;
    modified_date: string; // DATE ?
    session_id: string;
  };
  geometry: {
    coordinates: [number, number][][] | [number, number][][][];
    type: string;
  };
  message: string;
}

/** One Kabupaten/Kota entry from GET /geos/aoi/regencies */
interface RegencyOption {
  code: string; // BPS code (KDPKAB), unique key
  name: string; // raw WADMKK name
  type: "kabupaten" | "kota";
  province: string;
  label: string; // "Kabupaten X" / "Kota X"
}

interface GeosRegencyListRes extends ErrorableResponse {
  data: RegencyOption[];
  message: string;
}

interface GeosRegencyAoiRes extends GeosAoiRes {
  regency: RegencyOption;
}

interface GetMosaicRes extends ErrorableResponse {
  message: string;
  results: {
    layers: {
      name: string;
      url: string;
    }[];
    statistics: {
      max: number;
      mean: number;
      min: number;
    };
    summary: {
      scene_id: string;
      tanggal_perekaman: string;
      tutupan_awan: number;
    }[];
    /** URL, "" = failed, null = not computed yet (fetch via GET_MOSAIC_DOWNLOAD_URL) */
    download_url: string | null;
  };
}

interface GetMosaicDownloadUrlRes extends ErrorableResponse {
  message: string;
  results: {
    /** "" when Earth Engine refused to build the download (e.g. > 50 MB) */
    download_url: string;
  };
}

interface MosaicStatistics {
  statistics: {
    max: number;
    mean: number;
    min: number;
  };
  summary: {
    scene_id: string;
    tanggal_perekaman: string;
    tutupan_awan: number;
  }[];
  /** URL, "" = failed, null = not computed yet (fetch lazily on download) */
  download_url: string | null;
}

interface PolygonData extends ErrorableResponse {
  area_size: number;
  id: string;
  // session_id: string;
}

interface LUCUpdateRes extends ErrorableResponse {
  message: string;
  classes: {
    class_color: string;
    class_id: number;
    class_name: string;
    id: null;
  }[];
  training_data: {
    class_color: string;
    class_id: number;
    class_name: string;
    geom: {
      coordinates: [number, number];
      type: string;
    };
  }[];
  training_data_summary: {
    class_color: string;
    class_id: number;
    class_name: string;
    total_items: number;
  }[];
  // data: {
  // };
}

interface LUCUploadRes extends ErrorableResponse {
  message: string;
  classes: [
    {
      class_color: string;
      class_id: number;
      class_name: string;
      created_date: null;
      id: null;
      modified_date: null;
      session_id: string;
    },
  ];
}

interface TrainingDataUploadRes extends ErrorableResponse {
  message: string;
  training_data: {
    class_color: string;
    class_id: number;
    class_name: string;
    geometry: {
      coordinates: [number, number];
      type: string;
    };
    // session_id: string;
  }[];
}

interface InputSummaryRes extends ErrorableResponse {
  message: string;
  data: {
    aoi: {
      id: number;
      area_size: number;
      session_id: string;
      created_date: string;
      modified_date: string;
    };
    luma_params: {
      end_date: string;
      session_id: string;
      start_date: string;
      cloud_cover: number;
      created_date: string;
      modified_date: string;
      landsat_version: string;
    };
    training_data_summary: {
      class_id: number;
      class_name: string;
      class_color: string;
      total_items: number;
    }[];
  };
}

// interface GenerateMapRes extends ErrorableResponse {
//   message: string;
//   results: {
//     layers: {
//       url: string;
//       name: string;
//     }[];
//     importance: {
//       Band: string;
//       Importance: number;
//     }[];
//     model_quality: {
//       kappa: number;
//       gmean_score: number;
//       average_f1_score: number;
//       overall_accuracy: number;
//     };
//     lulc_composition: {
//       class_id: number;
//       class_name: string;
//       class_color: string;
//       area_m2: number;
//       proportion: number;
//     }[];
//   };
// }

interface LUCClass {
  class_color: string;
  class_id: number;
  class_name: string;
}

interface QuickTableRow {
  id: string;
  classId: string;
  name: string;
  color: string;
}

interface FileObject {
  file: File;
  filename: string;
  filesize: number;
}

interface FileTrainingObject extends FileObject {
  training_data: Array<
    {
      id: string;
      geometry: {
        coordinates: [number, number];
        type: string;
      };
    } & LUCClass
  >;
}

type PredictorReasonCode = "sensor" | "date" | "bands";

// One entry of GET /luma/predictor/available.
interface PredictorOption {
  id: string;
  label: string;
  long_name: string;
  description: string;
  type: string;
  available: boolean;
  // Why it is unavailable (English, from the engine); "" when available.
  reason: string;
  reason_code: PredictorReasonCode | null;
  conflicts_with: string[];
}

interface PredictorGroup {
  key: string;
  predictors: PredictorOption[];
}

interface PredictorListing {
  groups: PredictorGroup[];
  // The selection last saved on the backend (POST /luma/predictor).
  selected: string[];
  sensor: string | null;
  start_date: string | null;
  end_date: string | null;
  // Last optimizer result of the session. Optional: absent from
  // backends without the predictor optimizer.
  recommendation?: PredictorRecommendation | null;
}

interface PredictorRankingRow {
  band: string;
  // "band" = one of the satellite bands, which are always classified.
  kind: "predictor" | "band";
  id: string | null;
  label: string;
  rank: number;
  selected: boolean;
  importance: number;
}

interface PredictorSkipped {
  id: string;
  label: string;
  reason: string;
}

// Result of the predictor optimizer (GET /luma/predictor/optimize).
interface PredictorRecommendation {
  recommended: string[];
  conflict_dropped: string[];
  ranking: PredictorRankingRow[];
  candidates: string[];
  skipped: PredictorSkipped[];
  samples: { total: number; per_class: Record<string, number> };
  created: string;
  // True when the imagery settings or training data changed after the run.
  stale: boolean;
}

interface PredictorPreviewClass {
  value: number;
  label: string;
  color: string;
}

// One layer of GET /luma/predictor/preview.
interface PredictorPreviewLayer {
  id: string;
  label: string;
  name: string;
  // XYZ tile URL template.
  url: string;
  // "classes" = a class map (landform); `classes` is then its legend.
  kind: "continuous" | "classes";
  min: number;
  max: number;
  // CSS colours, low to high.
  palette: string[];
  classes?: PredictorPreviewClass[];
}

// GET /luma/predictor/download-url.
interface PredictorDownloadResult {
  // "" when Earth Engine refuses the size of the request.
  download_url: string;
  bands: string[];
  skipped: PredictorSkipped[];
}

interface PredictorSeparabilitySilhouette {
  // Overall silhouette score, -1 to 1; higher = classes further apart.
  overall: number;
  level: SampleQualityOverall;
  mean_pairwise: number;
  min_pairwise: number;
  // "Class A vs Class B": the pair with the lowest score.
  worst_pair: string;
  // Share of samples that sit closer to another class than to their own.
  negative_sample_ratio: number;
}

interface PredictorSeparabilitySet {
  // "composite" = satellite bands only, "with_predictors" = plus the predictors.
  key: string;
  bands: string[];
  num_bands: number;
  td: SampleQualityResult | null;
  silhouette: PredictorSeparabilitySilhouette | null;
}

interface PredictorSeparabilityComparison {
  sets: PredictorSeparabilitySet[];
  // with_predictors minus composite, on the overall silhouette score.
  silhouette_change: number | null;
  predictors: string[];
  skipped: PredictorSkipped[];
}

// GET /luma/training-data/separability with ?predictors=.
interface PredictorSeparabilityResult {
  // The usual TD summary, computed on the bands plus the predictors.
  sample_quality: SampleQualityResult | null;
  comparison: PredictorSeparabilityComparison;
}

interface GenerateMapStream {
  process: string;
  data: unknown;
  w: number;
  a: number;
  next: string;
}

interface GenerateMapDataVisualization {
  layers: {
    name: string;
    url: string;
  }[];
}

interface GenerateMapDataLULCComp {
  lulc_composition: {
    class_id: number;
    class_name: string;
    class_color: string;
    area_m2: number;
    proportion: number;
  }[];
}

interface SampleQualityPair {
  Class1_ID: string;
  Class1_Name: string;
  Class2_ID: string;
  Class2_Name: string;
  TD_Distance: number;
  Separability_Level: string;
}

type SampleQualityOverall = "good" | "med" | "poor";

interface SampleQualityDroppedClass {
  class_id: number;
  class_name: string;
  reason: string;
}

interface SampleQualityLowSampleClass {
  class_id: number;
  class_name: string;
  pixels: number;
}

interface SampleQualityResult {
  mean_td: number;
  overall: SampleQualityOverall;
  pair_counts: {
    good: number;
    weak: number;
    poor: number;
    total: number;
  }
  classes_good: number;
  classes_total: number;
  // Optional: only returned by backends that report extraction coverage.
  classes_analyzed?: number;
  classes_dropped?: SampleQualityDroppedClass[];
  low_sample_classes?: SampleQualityLowSampleClass[];
  problem_pairs: SampleQualityPair[];
}

interface SampleQualityRes {
  message: string;
  sample_quality: SampleQualityResult | null;
  error?: {
    message: string;
  };
}

interface ThematicAccuracyPerClass {
  class_id: number;
  class_name: string;
  class_color: string;
  producer_accuracy: number;
  user_accuracy: number;
  f1_score: number;
}

interface ThematicAccuracyPoint {
  lon: number;
  lat: number;
  actual_class_id: number;
  actual_class_name: string;
  predicted_class_id: number;
  predicted_class_name: string;
  is_correct: boolean;
}

interface ThematicAccuracyResult {
  overall_accuracy: number;
  overall_accuracy_ci: number[];
  confidence_level: number;
  kappa: number;
  per_class: ThematicAccuracyPerClass[];
  confusion_matrix: number[][];
  n_total: number;
  n_correct: number;
  scale: number;
  points: ThematicAccuracyPoint[];
}

interface ThematicAccuracyRes {
  message: string;
  thematic_accuracy: ThematicAccuracyResult;
  error?: {
    message: string;
  };
}

interface GenerateMapDataFeatureImportance {
  feature_importance: { Band: string; Importance: number }[];
}

interface ModelQualityPerClass {
  class_id: number;
  class_name: string | null;
  class_color: string | null;
  recall: number;
  precision: number;
  f1_score: number;
  gmean_score: number;
}

interface GenerateMapDataEvalModelQuality {
  model_quality: {
    overall_accuracy: number;
    kappa: number;
    average_f1_score: number;
    gmean_score: number;
    // Detail fields (absent on older backend responses).
    per_class?: ModelQualityPerClass[];
    confusion_matrix?: number[][];
    actual_class_ids?: number[];
    predicted_class_ids?: number[];
  };
}

interface GenerateMapDataDownloadURL {
  download_url: string;
}
