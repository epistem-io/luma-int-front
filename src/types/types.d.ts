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
  download_url: string;
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

interface GenerateMapDataSampleDataQuality {
  lowest_separability: {
    min_td: number;
    result_dict: {
      Class1_ID: string;
      Class1_Name: string;
      Class2_ID: string;
      Class2_Name: string;
      Interpretation: string;
      Separability_Level: string;
      TD_Distance: number;
    }[];
  };
}

interface GenerateMapDataFeatureImportance {
  feature_importance: { Band: string; Importance: number }[];
}

interface GenerateMapDataEvalModelQuality {
  model_quality: {
    overall_accuracy: number;
    kappa: number;
    average_f1_score: number;
    gmean_score: number;
  };
}

interface GenerateMapDataDownloadURL {
  download_url: string;
}
