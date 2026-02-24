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
  layers: {
    name: string;
    url: string;
  }[];
}

interface PolygonData extends ErrorableResponse {
  area_size: number;
  id: string;
  // session_id: string;
}

interface LUCUpdateRes extends ErrorableResponse {
  message: string;
  data: {};
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

interface LUCClass {
  class_color: string;
  class_id: number;
  class_name: string;
}

interface Marker {
  coordinates: [number, number];
  id: string;
  name: string;
  class_id: number;
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
