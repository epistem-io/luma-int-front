"use client";

import { ChevronDown, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Draw } from "ol/interaction";
import CircleStyle from "ol/style/Circle";
import { z } from "zod";
import dayjs from "dayjs";
import { zodResolver } from "@hookform/resolvers/zod";

import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "../../../components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Textarea } from "../../../components/ui/textarea";

import {
  Accordion,
  AccordionContent,
  AccordionFullTrigger,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "../../../components/ui/switch";
import { Slider } from "../../../components/ui/slider";
import { Checkbox } from "../../../components/ui/checkbox";
import { ChangeEvent, useContext, useState } from "react";
import { LayerLegend, MapContext } from "@/contexts/mapContext";
import VectorSource from "ol/source/Vector";
import { MultiPoint, MultiPolygon, Polygon, SimpleGeometry } from "ol/geom";
import Feature from "ol/Feature";
import Style, { GeometryFunction } from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Coordinate } from "ol/coordinate";
import VectorLayer from "ol/layer/Vector";
import {
  AnalysisResult,
  GlobalContext,
  SATELLITE,
} from "@/contexts/globalContext";
import { useTranslations } from "next-intl";
import TileLayer from "ol/layer/Tile";
import { ImageTile } from "ol/source";
import { clipLayerToVector } from "@/utils/mapHelper";
import { toast } from "sonner";

interface AnalysisPanelProps {
  nextStage?: () => void;
  prevStage?: () => void;
  className?: string;
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

// interface RequestForm {
//   startDate: string;
//   endDate: string;
//   satellite: SATELLITE;
//   cloudCover: number;
// }

interface GeosAoiRes {
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

interface LULCClassificationRes {
  layers: {
    name: string;
    url: string;
  }[];
  legends: Record<
    string,
    (Record<string, string> | Record<string, string[]>)[]
  >;
  message: string;
  results: {
    kappa_coefficient: number;
    overall_accuracy: number;
    accuracy_assessment: string;
  };
}

enum DRAW_UPLOAD {
  DRAW = "draw",
  UPLOAD = "upload",
}

enum POLYGON_STAGE {
  COLLECT = "collect",
  REQUEST = "request",
  CONFIRMATION = "confirmation",
}

const FETCH_POLYGON_URL = `${process.env.NEXT_PUBLIC_API_URL}/geos/aoi`;
const FETCH_UPLOAD_URL = `${process.env.NEXT_PUBLIC_API_URL}/geos/aoi/upload`;
const FETCH_LULC_URL = `${process.env.NEXT_PUBLIC_API_URL}/geos/lulc-classification
`;

const NUM_AREA_SIZE_DIVISION = 10000;

const SATELLITE_SELECTION: { label: string; value: SATELLITE }[] = [
  {
    label: "Landsat 8",
    value: SATELLITE.LANDSAT8,
  },
  {
    label: "Landsat 9",
    value: SATELLITE.LANDSAT9,
  },
];

const styles = (strokeWidth: number) => [
  new Style({
    stroke: new Stroke({
      color: "rgba(204, 71, 120, 1)",
      width: strokeWidth,
    }),
    fill: undefined,
  }),
  new Style({
    image: new CircleStyle({
      radius: 0,
      fill: new Fill({
        color: "rgba(255, 255, 255)",
      }),
      stroke: new Stroke({
        color: "rgba(204, 71, 120, 1)",
        width: strokeWidth,
      }),
    }),
    geometry: function (feature: Feature) {
      let coordinates;
      const geometry = feature.getGeometry();
      if (geometry instanceof SimpleGeometry) {
        coordinates = geometry.getCoordinates();
        if (coordinates?.length) coordinates = coordinates[0];
      }
      return new MultiPoint(coordinates);
    } as GeometryFunction,
  }),
];

const formSchema = z.object({
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  satellite: z.enum([...Object.values(SATELLITE)]),
  cloudCover: z.number().min(0).max(50),
});

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="headline-xxs-desktop-medium text-text-icons-base-main">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-text-icons-base-main transition-transform duration-200",
            isOpen ? "rotate-180" : "",
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="px-5 pb-4">{children}</div>
      </div>
      <div className="h-[1px] bg-neutral-600 mx-6" />
    </div>
  );
}

export function AnalysisPanel({ nextStage = () => {} }: AnalysisPanelProps) {
  const t = useTranslations("AnalysisPanel");

  const {
    setPolygon,
    polygon,
    vectorLayer,
    mapInstance,
    setVectorLayer,
    setLayerLegendArray,
  } = useContext(MapContext);

  const {
    polygonData,
    setPolygonData,
    analysisConfig,
    setAnalysisConfig,
    setAnalysisResult,
  } = useContext(GlobalContext);

  const [stage, setStage] = useState<POLYGON_STAGE>(POLYGON_STAGE.COLLECT);
  const [drawOrUpload, setDrawOrUpload] = useState<"" | DRAW_UPLOAD>("");
  const [polygonLoading, setPolygonLoading] = useState(false);
  const [LULCLoading, setLULCLoading] = useState(false);

  const defaultValues = !!analysisConfig
    ? {
        startDate: analysisConfig.start_date,
        endDate: analysisConfig.end_date,
        satellite: analysisConfig.landsat_version,
        cloudCover: analysisConfig.cloud_cover,
      }
    : {
        startDate: dayjs().startOf("y").format("YYYY-MM-DD"),
        endDate: dayjs().endOf("y").format("YYYY-MM-DD"),
        satellite: SATELLITE.LANDSAT8,
        cloudCover: 1,
      };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
    disabled: LULCLoading,
  });

  const onClickDraw = () => {
    setDrawOrUpload(DRAW_UPLOAD.DRAW);
    setPolygon(null);

    if (!vectorLayer || !mapInstance) return;

    const vSource = vectorLayer.getSource();

    if (!vSource) return;

    const updatedDraw = new Draw({
      source: vSource,
      type: "Polygon",
      style: {
        "circle-radius": 5,
        "circle-fill-color": "rgba(204, 71, 120, 1)",
        "stroke-color": "rgba(204, 71, 120, 1)",
        "stroke-width": 3,
      },
    });

    updatedDraw.on("drawstart", () => {
      vectorLayer.getSource()?.clear();
      // Backspace to undo drawn polygon
      document.addEventListener("keydown", (e) => {
        if (e.key === "Backspace") {
          updatedDraw.removeLastPoint();
        }
      });
    });

    updatedDraw.on("drawend", (e) => {
      const feature: Feature<Polygon> = e.feature as Feature<Polygon>;
      feature.setStyle(styles(3));
      const polygon = feature.getGeometry() as Polygon;

      setPolygon(polygon);

      const extent = polygon.getExtent();

      if (!extent || !mapInstance) return;

      const view = mapInstance.getView();

      view?.fit(extent, {
        padding: [150, 150, 150, 600],
      });

      setStage(POLYGON_STAGE.REQUEST);
      submitPolygon(polygon);

      // Remove unused listener
      document.removeEventListener("keydown", (e) => {
        if (e.key === "Backspace") {
          updatedDraw.removeLastPoint();
        }
      });
    });

    mapInstance.addInteraction(updatedDraw);
  };

  const onClickUpload = () => {
    setDrawOrUpload(DRAW_UPLOAD.UPLOAD);
  };

  const onUploadFile = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.target;
    const files = target?.files;

    if (!files) return;

    setPolygonLoading(true);

    const body = new FormData();
    body.append("file", files[0]);
    body.append("session_id", String(polygonData?.session_id));

    fetch(FETCH_UPLOAD_URL, {
      method: "POST",
      body,
      // headers: {
      //   "Content-Type": "multipart/form-data",
      // },
    })
      .then(async (response) => {
        const json: GeosAoiRes = await response.json();

        if (!response.ok) {
          throw new Error(JSON.stringify(json?.message || response.text));
        }

        if (json.geometry.type === "MultiPolygon") {
          const coordinates = json.geometry.coordinates as Coordinate[][][];

          const tempPolygon = new MultiPolygon(coordinates).transform(
            "EPSG:4326",
            "EPSG:3857",
          );

          const polygonFeature = new Feature<MultiPolygon>(tempPolygon);
          const vectorSource = new VectorSource({
            features: [polygonFeature],
          });
          const vectorLayer = new VectorLayer({
            source: vectorSource,
            style: styles(3),
          });

          vectorLayer.setZIndex(Infinity);
          setVectorLayer(vectorLayer);
          mapInstance?.addLayer(vectorLayer);

          setPolygon(tempPolygon);

          const extent = vectorSource.getExtent();

          if (!extent || !mapInstance) return;

          const view = mapInstance.getView();

          view?.fit(extent, {
            padding: [150, 150, 150, 600],
          });

          setPolygonData({
            area_size: json.data.area_size,
            id: json.data.id,
            session_id: json.data.session_id,
          });

          setStage(POLYGON_STAGE.CONFIRMATION);
        }

        const coordinates = json.geometry.coordinates as Coordinate[][];

        const tempPolygon = new Polygon(coordinates).transform(
          "EPSG:4326",
          "EPSG:3857",
        ) as Polygon;
        const polygonFeature = new Feature<Polygon>(tempPolygon);
        const vectorSource = new VectorSource({
          features: [polygonFeature],
        });
        const vectorLayer = new VectorLayer({
          source: vectorSource,
          style: styles(3),
        });

        vectorLayer.setZIndex(Infinity);
        setVectorLayer(vectorLayer);
        mapInstance?.addLayer(vectorLayer);

        setPolygon(tempPolygon);

        const extent = vectorSource.getExtent();

        if (!extent || !mapInstance) return;

        const view = mapInstance.getView();

        view?.fit(extent, {
          padding: [150, 150, 150, 600],
        });

        setPolygonData({
          area_size: json.data.area_size,
          id: json.data.id,
          session_id: json.data.session_id,
        });

        // const wmsSource = new ImageTile({
        //   url: "https://earthengine.googleapis.com/v1/projects/earthengine-legacy/maps/ef9090a913bd2204898ba04c7f375bca-a98a3c6c10a5c5ca4023fcf7e21b46de/tiles/{z}/{x}/{y}",
        // });

        // const imgLayer = new TileLayer({
        //   source: wmsSource,
        //   className: `added-layer`,
        // });

        // mapInstance.addLayer(imgLayer);

        // clipLayerToVector(imgLayer, vectorLayer);

        setStage(POLYGON_STAGE.CONFIRMATION);
      })
      .catch((e) => {
        toast.error(`Error on uploading file: ${e}`, {
          duration: Infinity,
          dismissible: true,
          closeButton: true,
        });
        console.log("errorr", e);
      })
      .finally(() => {
        setPolygonLoading(false);
      });
  };

  const onClickReselect = () => {
    vectorLayer?.getSource()?.clear();

    setDrawOrUpload("");
    setStage(POLYGON_STAGE.COLLECT);
    setPolygon(null);
  };

  const submitPolygon = async (poly: Polygon) => {
    setPolygonLoading(true);

    const clone = poly?.clone();

    const transformed = clone?.transform("EPSG:3857", "EPSG:4326") as Polygon;

    if (!clone) return;

    const data = {
      type: "Feature",
      geometry: {
        type: transformed.getType(),
        coordinates: transformed.getCoordinates(),
      },
      session_id: "",
    };

    fetch(FETCH_POLYGON_URL, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        const json: GeosAoiRes = await response.json();

        if (!response.ok) {
          throw new Error(JSON.stringify(json?.message || response.text));
        }

        setPolygonData({
          area_size: json.data.area_size,
          id: json.data.id,
          session_id: json.data.session_id,
        });
        setStage(POLYGON_STAGE.CONFIRMATION);
      })
      .catch((e) => {
        toast.error(`Error on submitting polygon: ${e}`, {
          duration: Infinity,
          dismissible: true,
          closeButton: true,
        });
        console.log("errorr", e);
      })
      .finally(() => {
        setPolygonLoading(false);
      });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (polygonLoading) return;

    setLULCLoading(true);

    const { startDate, endDate, satellite, cloudCover } = values;

    const data = {
      session_id: polygonData?.session_id || "",
      start_date: startDate,
      end_date: endDate,
      landsat_version: satellite,
      cloud_cover: cloudCover,
      test_timeout: true,
    };

    setAnalysisConfig(data);

    fetch(FETCH_LULC_URL, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        const json: LULCClassificationRes = await response.json();

        if (!response.ok) {
          throw new Error(JSON.stringify(json?.message || response.text));
        }

        // const wmsSource = new ImageTile({
        //   url: "https://earthengine.googleapis.com/v1/projects/earthengine-legacy/maps/ef9090a913bd2204898ba04c7f375bca-a98a3c6c10a5c5ca4023fcf7e21b46de/tiles/{z}/{x}/{y}",
        // });

        // const imgLayer = new TileLayer({
        //   source: wmsSource,
        //   className: `added-layer`,
        // });

        // mapInstance.addLayer(imgLayer);

        const arr: LayerLegend[] = json.layers.map((item, index) => ({
          name: item.name,
          url: item.url,
          currentOrder: index,
          originalOrder: index,
          layer: new TileLayer({
            source: new ImageTile({
              url: item.url,
            }),
            className: "added-layer",
            // properties: {
            //   visible: true,
            // },
          }),
          legend: {
            isVisible: true,
            opacity: 100,
            items: json.legends[item.name].map((ite) => {
              const arr: (
                | { name: string; color: string }
                | { name: string; color: string[] }
              )[] = [];

              Object.entries(ite).forEach(([key, value]) => {
                arr.push({
                  name: key,
                  color: value,
                });
              });

              return arr[0];
            }),
          },
        }));

        arr.map((item) => {
          if (!vectorLayer) return;

          mapInstance?.addLayer(item.layer);

          clipLayerToVector(item.layer, vectorLayer);
        });

        // console.log("leg arr", arr);

        setLayerLegendArray(arr);

        const { kappa_coefficient, overall_accuracy, accuracy_assessment } =
          json.results;

        const result: AnalysisResult = {
          kappa_coefficient,
          overall_accuracy,
          accuracy_assessment,
        };

        setAnalysisResult(result);

        nextStage();
      })
      .catch((e) => {
        toast.error(`Error on LULC Classification: ${e}`, {
          duration: Infinity,
          dismissible: true,
          closeButton: true,
        });
      })
      .finally(() => {
        setLULCLoading(false);
      });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <div className="bg-white z-30 mb-32">
          <CollapsibleSection
            title={t("Section1.scopeYourArea")}
            defaultOpen={true}
          >
            <div className="space-y-5">
              {stage === POLYGON_STAGE.CONFIRMATION && (
                <div className="rounded-md space-y-4 bg-[rgba(253,247,249,1)] [box-shadow:0_2px_8px_0_rgba(87,_86,_86,_0.08)] p-3 border border-neutral-400">
                  <p className="text-l-semibold text-text-icons-light-base-second">
                    Your selected location has total area approximately:
                  </p>
                  <p className="headline-xxs-desktop-semibold text-text-icons-base-main text-center">
                    {(
                      (polygonData?.area_size || 0) / NUM_AREA_SIZE_DIVISION
                    ).toLocaleString()}{" "}
                    ha
                  </p>
                  <button
                    disabled={LULCLoading}
                    type="button"
                    onClick={() => {
                      onClickReselect();
                    }}
                    className="w-full border border-primary-pink bg-white disabled:border-muted-foreground disabled:text-muted-foreground text-primary-pink disabled:hover:brightness-100 disabled:hover:cursor-not-allowed py-1.5 px-2 cursor-pointer hover:brightness-95 transition-all duration-300"
                  >
                    <p className="text-xs-semibold ">Reselect</p>
                  </button>
                </div>
              )}

              {polygonLoading && stage !== POLYGON_STAGE.CONFIRMATION && (
                <div className="w-full h-10 flex flex-row justify-center">
                  <span className="loader "></span>
                </div>
              )}

              {!polygonLoading && stage !== POLYGON_STAGE.CONFIRMATION && (
                <>
                  {drawOrUpload === "" && (
                    <div className="grid grid-cols-2 space-x-4">
                      <button
                        type="button"
                        onClick={() => {
                          onClickDraw();
                        }}
                        className="border border-primary-pink p-4 hover:brightness-95 hover:cursor-pointer bg-white transition-all duration-300"
                      >
                        <Image
                          src="/images/polygon-draw.svg"
                          unoptimized
                          alt="Draw"
                          width={29.33}
                          height={25}
                          className="object-contain h-6 w-auto"
                        />
                        <p className="text-l-bold text-text-icons-base-main mt-3 text-left">
                          {t("Section1.drawPolygon")}
                        </p>
                        <p className="text-xs-regular text-neutral-700 mt-2 text-left">
                          {t("Section1.drawPolygonDesc")}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onClickUpload();
                        }}
                        className="border border-primary-pink p-4 hover:brightness-95 hover:cursor-pointer bg-white transition-all duration-300"
                      >
                        <Image
                          src="/images/upload.svg"
                          unoptimized
                          alt="Upload"
                          width={16}
                          height={16}
                          className="object-contain h-6 w-auto"
                        />
                        <p className="text-l-bold text-text-icons-base-main mt-3 text-left">
                          {t("Section1.uploadSHP")}
                        </p>
                        <p className="text-xs-regular text-neutral-700 mt-2 text-left">
                          {t("Section1.uploadSHPDesc")}
                        </p>
                      </button>
                    </div>
                  )}

                  {drawOrUpload === DRAW_UPLOAD.DRAW && (
                    <div className="flex flex-row space-x-[27px] p-5">
                      <Image
                        src="/images/polygon-draw-plus.svg"
                        unoptimized
                        alt="Draw Plus"
                        width={74}
                        height={64}
                        className="object-contain h-16 w-auto"
                      />
                      <div className="space-y-2">
                        <p className="text-l-bold text-text-icons-base-main">
                          {t("Section1.drawPolygon")}
                        </p>
                        <p className="text-xs-regular text-text-icons-light-base-second">
                          {t("Section1.drawPolygonInstruction")}
                        </p>
                        <button
                          type="button"
                          className="py-1.5 px-2 w-full bg-primary-pink cursor-pointer hover:brightness-105 transition-all duration-300"
                        >
                          <p className="text-xs-semibold text-text-icons-on-color">
                            {t("Section1.finishDrawing")}
                          </p>
                        </button>
                      </div>
                    </div>
                  )}

                  {drawOrUpload === DRAW_UPLOAD.UPLOAD && (
                    <>
                      <div className="p-6 border border-dashed rounded-sm border-[rgba(184,187,199,1)] bg-white space-y-4">
                        <div className="flex flex-row space-x-[27px]">
                          <Image
                            src="/images/upload-file.svg"
                            unoptimized
                            alt="Upload File"
                            width={64}
                            height={64}
                            className="object-contain h-16 w-auto"
                          />
                          <div className="space-y-2">
                            <p className="text-l-bold text-text-icons-base-main">
                              {t("Section1.uploadSHP")}
                            </p>
                            <p className="text-xs-regular text-text-icons-light-base-second">
                              {t("Section1.uploadSHPInstruction")}
                            </p>
                          </div>
                        </div>

                        <div className=""></div>
                        <label htmlFor="file-upload">
                          <div className="py-1.5 px-2 w-full bg-primary-pink cursor-pointer hover:brightness-105 transition-all duration-300">
                            <p className="text-xs-semibold text-text-icons-on-color text-center">
                              {t("Section1.uploadSHPInstructionCont")}
                            </p>
                          </div>
                        </label>
                      </div>

                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept=".zip,.kmz,.kml"
                        multiple={false}
                        onChange={onUploadFile}
                      />
                    </>
                  )}
                </>
              )}

              <div className="space-y-4">
                <p className="bold-body-400 text-[#002F3D]">
                  {t("Section1.spatialResolution")}
                </p>
                <RadioGroup defaultValue="">
                  <div className="grid grid-rows-2 space-y-6">
                    <div className="grid grid-cols-2 space-x-6">
                      <div className="">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            disabled
                            className="border-neutral-700"
                            indicatorClassName="fill-primary-pink text-primary-pink"
                            value="30"
                            id="spatial-resolution-30"
                          />
                          <Label
                            className="text-muted-foreground"
                            htmlFor="spatial-resolution-30"
                          >
                            30 x 30 m²
                          </Label>
                        </div>
                      </div>
                      <div className="">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            disabled
                            className="border-neutral-700"
                            indicatorClassName="fill-primary-pink text-primary-pink"
                            value="100"
                            id="spatial-resolution-100"
                          />
                          <Label
                            className="text-muted-foreground"
                            htmlFor="spatial-resolution-100"
                          >
                            100 x 100 m²
                          </Label>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 space-x-6">
                      <div className="">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            disabled
                            className="border-neutral-700"
                            indicatorClassName="fill-primary-pink text-primary-pink"
                            value="500"
                            id="spatial-resolution-500"
                          />
                          <Label
                            className="text-muted-foreground"
                            htmlFor="spatial-resolution-500"
                          >
                            500 x 500 m²
                          </Label>
                        </div>
                      </div>
                      <div className="">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            disabled
                            className="border-neutral-700"
                            indicatorClassName="fill-primary-pink text-primary-pink"
                            value="1000"
                            id="spatial-resolution-1000"
                          />
                          <Label
                            className="text-muted-foreground"
                            htmlFor="spatial-resolution-1000"
                          >
                            1 x 1 km²
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title={t("Section2.selectTimePeriod")}>
            <div className="space-y-5 border border-neutral-400 p-3">
              <p className="text-l-bold text-text-icons-base-main">
                {t("Section2.temporalCoverage")}
              </p>
              <div className="space-y-2">
                <Label htmlFor="time-period" className="">
                  <p className="text-m-medium text-neutral-900">
                    {t("Section2.timePeriodLabel")}
                  </p>
                </Label>
                <Select defaultValue={t("Section2.timePeriodDefault")} disabled>
                  <SelectTrigger
                    id="time-period"
                    className="w-full rounded-none border-neutral-400"
                  >
                    <SelectValue placeholder={t("Section2.timePeriod")} />
                  </SelectTrigger>
                  <SelectContent>
                    {/* <SelectItem value="light">Light</SelectItem> */}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time-period-month" className="">
                  <p className="text-m-medium text-neutral-900">
                    {t("Section2.select")}
                  </p>
                </Label>
                <div className="grid grid-cols-2 space-x-2">
                  <div>
                    <Select disabled>
                      <SelectTrigger
                        id="time-period-month"
                        className="w-full rounded-none border-neutral-400"
                      >
                        <SelectValue placeholder={t("Section2.month")} />
                      </SelectTrigger>
                      <SelectContent></SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select disabled>
                      <SelectTrigger
                        id="time-period-year"
                        className="w-full rounded-none border-neutral-400"
                      >
                        <SelectValue placeholder={t("Section2.year")} />
                      </SelectTrigger>
                      <SelectContent></SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <hr className="bg-neutral-600" />
              <div className="flex flex-col">
                <div className="py-2 px-4 bg-neutral-100">
                  <p className="text-l-bold text-text-icons-base-main">
                    {t("Section2.satelliteTemporalExtent")}
                  </p>
                </div>
                <div className="pt-5 p-3 grid grid-cols-2 space-x-3 border border-t-0">
                  <div className="">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <p className="text-m-semibold">
                              {t("Section2.startDate")}
                            </p>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="datepicker shadow-none border-0"
                              type="date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="">
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <p className="text-m-semibold">
                              {t("Section2.endDate")}
                            </p>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="datepicker shadow-none border-0"
                              type="date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title={t("Section3.defineLC")}>
            <div className="space-y-5">
              <Collapsible>
                <div className="bg-aneh p-[1px] [box-shadow:0_4px_4px_0_rgba(243,_235,_126,_0.25),_0_2px_8px_0_rgba(249,_245,_195,_0.29)]">
                  <div className="bg-neutral-100 p-3 h-fit">
                    <CollapsibleTrigger className="flex flex-row justify-between items-center w-full">
                      <div className="flex flex-row space-x-2 items-center">
                        <div className="w-fit p-2 rounded-sm border border-primary-300">
                          <Image
                            src="/images/shimmer.svg"
                            unoptimized
                            alt="Draw"
                            width={16}
                            height={16}
                            className="object-contain h-4 w-auto text-primary-500"
                          />
                        </div>
                        <p className="text-l-bold">{t("Section3.tryAI")}</p>
                      </div>

                      <ChevronDown
                        className={cn(
                          "h-5 w-5 text-text-icons-base-main transition-transform duration-200",
                        )}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="pt-4 space-y-2">
                        <p className="text-m-medium italic">
                          {t("Section3.tryAICaption")}
                          <br />
                          <b className="font-extrabold">
                            {t("Section3.tryAICaptionCont")}
                          </b>
                        </p>
                        <Textarea
                          defaultValue={t("Section3.tryAICaptionDefaultValue")}
                          disabled
                        />
                        <div className="flex flex-row justify-between items-center">
                          <p className="text-xs-regular text-neutrals-600">
                            {t("Section3.tryAICaptionInstruction")}
                          </p>
                          <button
                            type="button"
                            className="rounded-none bg-primary-pink py-1.5 px-2"
                          >
                            <p className="text-xs-semibold text-text-icons-on-color">
                              {t("Section3.tryAICaptionSubmitButtonLabel")}
                            </p>
                          </button>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </div>
              </Collapsible>

              <div className="p-5 border border-neutral-400 bg-neutral-100 space-y-6">
                <p className="text-l-bold text-text-icons-base-main">
                  {t("Section3.LUHierarchy")}
                </p>
                <div className="space-y-4">
                  <Accordion type="multiple">
                    <AccordionItem value="vegetation-acc">
                      <div className="flex flex-row items-center justify-between">
                        <div className="flex flex-row items-center space-x-2.5">
                          <Switch disabled />
                          <p className="text-l-semibold text-muted-foreground">
                            {t("Section3.vegetation")}
                          </p>
                        </div>
                        <AccordionTrigger className="p-2"></AccordionTrigger>
                      </div>
                      <AccordionContent className="pl-[25px] mt-4 space-y-4">
                        <Accordion type="multiple">
                          <AccordionItem value="tree-based-system-acc">
                            <div className="flex flex-row items-center justify-between">
                              <div className="flex flex-row items-center space-x-2.5">
                                <Switch disabled />
                                <p className="text-l-medium text-muted-foreground">
                                  {t("Section3.TBS")}
                                </p>
                              </div>
                              <AccordionTrigger className="p-2"></AccordionTrigger>
                            </div>
                            <AccordionContent className="pl-[25px] mt-4 space-y-4">
                              <div className="flex flex-row items-center space-x-2.5">
                                <Switch disabled />
                                <p className="text-l-medium text-muted-foreground">
                                  {t("Section3.agroforestry")}
                                </p>
                              </div>
                              <div className="flex flex-row items-center space-x-2.5">
                                <Switch disabled />
                                <p className="text-l-medium text-muted-foreground">
                                  {t("Section3.monoculturePlantation")}
                                </p>
                              </div>
                              <div className="flex flex-row items-center space-x-2.5">
                                <Switch disabled />
                                <p className="text-l-medium text-muted-foreground">
                                  {t("Section3.naturalForest")}
                                </p>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                        <Accordion type="multiple">
                          <AccordionItem value="non-tree-based-system-acc">
                            <div className="flex flex-row items-center justify-between">
                              <div className="flex flex-row items-center space-x-2.5">
                                <Switch disabled />
                                <p className="text-l-medium text-muted-foreground">
                                  {t("Section3.nonTBS")}
                                </p>
                              </div>
                              <AccordionTrigger className="p-2"></AccordionTrigger>
                            </div>
                            <AccordionContent className="pl-[25px] pt-5 space-y-4">
                              <div className="flex flex-row items-center space-x-2.5">
                                <Switch disabled />
                                <p className="text-l-medium text-muted-foreground">
                                  {t("Section3.grassSavanna")}
                                </p>
                              </div>
                              <div className="flex flex-row items-center space-x-2.5">
                                <Switch disabled />
                                <p className="text-l-medium text-muted-foreground">
                                  {t("Section3.shrub")}
                                </p>
                              </div>
                              <div className="flex flex-row items-center space-x-2.5">
                                <Switch disabled />
                                <p className="text-l-medium text-muted-foreground">
                                  {t("Section3.cropland")}
                                </p>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <Accordion type="multiple">
                    <AccordionItem value="non-vegetation-acc">
                      <div className="flex flex-row items-center justify-between">
                        <div className="flex flex-row items-center space-x-2.5">
                          <Switch disabled />
                          <p className="text-l-semibold text-muted-foreground">
                            {t("Section3.nonVegetation")}
                          </p>
                        </div>
                        <AccordionTrigger className="p-2"></AccordionTrigger>
                      </div>
                      <AccordionContent className="pl-[25px] pt-5 space-y-5">
                        <div className="flex flex-row items-center space-x-2.5">
                          <Switch disabled />
                          <p className="text-l-medium text-muted-foreground">
                            {t("Section3.settlement")}
                          </p>
                        </div>
                        <div className="flex flex-row items-center space-x-2.5">
                          <Switch disabled />
                          <p className="text-l-medium text-muted-foreground">
                            {t("Section3.clearedLand")}
                          </p>
                        </div>
                        <div className="flex flex-row items-center space-x-2.5">
                          <Switch disabled />
                          <p className="text-l-medium text-muted-foreground">
                            {t("Section3.water")}
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title={t("Section4.selectLULCParams")}>
            <Accordion type="multiple">
              <div className="space-y-5">
                <AccordionItem value="satelite-composite">
                  <div className="p-3 border border-neutral-400 bg-neutral-100">
                    <AccordionFullTrigger className=" hover:no-underline">
                      <p className="text-l-bold ">
                        {t("Section4.satelliteComposite")}
                      </p>
                    </AccordionFullTrigger>
                    <AccordionContent className="space-y-5 pb-0">
                      <div className="mt-5 space-y-2">
                        <FormField
                          control={form.control}
                          name="satellite"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                <p className="regular-caption-300">
                                  {t("Section4.satellite")}
                                </p>
                              </FormLabel>
                              <Select
                                disabled={field.disabled}
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger
                                    id="satelite-select"
                                    className="w-full rounded-sm border-neutral-400"
                                  >
                                    <SelectValue placeholder="Theme" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {SATELLITE_SELECTION.map((item) => (
                                    <SelectItem
                                      key={`satellite-select-${item.value}`}
                                      value={item.value}
                                    >
                                      {item.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="cloudCover"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                <p className="regular-caption-300">
                                  {t("Section4.cloudCoverage")}
                                </p>
                              </FormLabel>

                              <FormControl>
                                <div className="px-2">
                                  <Slider
                                    id="cloud-coverage"
                                    onValueChange={(val: number[]) => {
                                      field.onChange(val[0]);
                                    }}
                                    defaultValue={[field.value]}
                                    min={0}
                                    max={50}
                                    step={1}
                                    disabled={field.disabled}
                                  />
                                  <div className="flex flex-row justify-between mt-2">
                                    <div className="">
                                      <p className="bold-caption-300 text-primary-500 text-center">
                                        0%
                                      </p>
                                    </div>
                                    <div className="">
                                      <p className="bold-caption-300 text-primary-500 text-center">
                                        10%
                                      </p>
                                    </div>
                                    <div className="">
                                      <p className="bold-caption-300 text-primary-500 text-center">
                                        20%
                                      </p>
                                    </div>
                                    <div className="">
                                      <p className="bold-caption-300 text-primary-500 text-center">
                                        30%
                                      </p>
                                    </div>
                                    <div className="">
                                      <p className="bold-caption-300 text-primary-500 text-center">
                                        40%
                                      </p>
                                    </div>
                                    <div className="">
                                      <p className="bold-caption-300 text-primary-500 text-center">
                                        50%
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </div>
                </AccordionItem>
                <AccordionItem value="select-predictor">
                  <div className="p-3 border border-neutral-400 bg-neutral-100">
                    <AccordionFullTrigger className=" hover:no-underline">
                      <p className="text-l-bold ">
                        {t("Section4.selectPredictor")}
                      </p>
                    </AccordionFullTrigger>
                    <AccordionContent className="pt-5 pb-0 space-y-5">
                      <div className="space-y-2.5">
                        <div className="flex flex-row space-x-3">
                          <Checkbox disabled className="mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-m-semibold text-neutrals-800">
                              Elevation
                            </p>
                            <p className="text-xs-regular text-neutrals-600">
                              Shuttle Radar Topography Mission (SRTM) elevation
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-row space-x-3">
                          <Checkbox disabled className="mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-m-semibold text-neutrals-800">
                              Slope
                            </p>
                            <p className="text-xs-regular text-neutrals-600">
                              Shuttle Radar Topography Mission (SRTM) slope
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-row space-x-3">
                          <Checkbox disabled className="mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-m-semibold text-neutrals-800">
                              NDVI
                            </p>
                            <p className="text-xs-regular text-neutrals-600">
                              Normalized Difference Vegetation Index
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-row space-x-3">
                          <Checkbox disabled className="mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-m-semibold text-neutrals-800">
                              NDWI
                            </p>
                            <p className="text-xs-regular text-neutrals-600">
                              Normalized Difference Water Index
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-row space-x-3">
                          <Checkbox disabled className="mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-m-semibold text-neutrals-800">
                              BG
                            </p>
                            <p className="text-xs-regular text-neutrals-600">
                              Normalized Difference Blue Green
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-row space-x-3">
                          <Checkbox disabled className="mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-m-semibold text-neutrals-800">
                              Blue
                            </p>
                            <p className="text-xs-regular text-neutrals-600">
                              Blue band
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-row space-x-3">
                          <Checkbox disabled className="mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-m-semibold text-neutrals-800">
                              Green
                            </p>
                            <p className="text-xs-regular text-neutrals-600">
                              Green band
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-row space-x-3">
                          <Checkbox disabled className="mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-m-semibold text-neutrals-800">
                              Red
                            </p>
                            <p className="text-xs-regular text-neutrals-600">
                              Red band
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-row space-x-3">
                          <Checkbox disabled className="mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-m-semibold text-neutrals-800">
                              NIR
                            </p>
                            <p className="text-xs-regular text-neutrals-600">
                              Near Infrared Band
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-row space-x-3">
                          <Checkbox disabled className="mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-m-semibold text-neutrals-800">
                              Distance to Road
                            </p>
                            <p className="text-xs-regular text-neutrals-600">
                              Measuring closest road available
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-row space-x-3">
                          <Checkbox disabled className="mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-m-semibold text-neutrals-800">
                              Distance to River
                            </p>
                            <p className="text-xs-regular text-neutrals-600">
                              Measuring closest river available
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-xl border border-dashed border-[rgba(184,187,199,1)] p-6 space-y-4 brightness-90 cursor-not-allowed">
                        <p className="text-l-bold text-[#002F3D] text-center">
                          {t("Section4.selectPredictorDesc")}
                        </p>
                        <div className="p-2 rounded-full border-neutral-600 border mx-auto w-fit">
                          <Upload className="text-text-icons-base-main h-5 w-5" />
                        </div>
                        <div className="text-center">
                          <p className="text-l-medium text-text-icons-base-main">
                            {t("Section4.fileUploadDesc1")}{" "}
                            <b className="text-primary-pink underline">
                              {t("Section4.fileUploadDesc2")}
                            </b>{" "}
                            {t("Section4.fileUploadDesc3")}
                          </p>
                          <p className="text-s-medium text-text-icons-light-base-second">
                            {t("Section4.fileUploadSupportedFiles")}
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </div>
                </AccordionItem>
                <AccordionItem value="random-forest">
                  <div className="p-3 border border-neutral-400 bg-neutral-100">
                    <AccordionFullTrigger className=" hover:no-underline">
                      <p className="text-l-bold ">{t("Section4.RFVariable")}</p>
                    </AccordionFullTrigger>
                    <AccordionContent className="pt-5">
                      <div className="grid grid-cols-2 space-x-5">
                        <div className="space-y-2">
                          <Label>
                            <p className="regular-caption-300 text-neutrals-900">
                              {t("Section4.nOfTree")}
                            </p>
                          </Label>
                          <Input className="" disabled />
                          <p className="regular-caption-200 text-neutrals-600">
                            {t("Section4.fillWNum", { min: 10, max: 500 })}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label>
                            <p className="regular-caption-300 text-neutrals-900">
                              {t("Section4.minLeafPop")}
                            </p>
                          </Label>
                          <Input className="" disabled />
                          <p className="regular-caption-200 text-neutrals-600">
                            {t("Section4.fillWNum", { min: 1, max: 50 })}
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </div>
                </AccordionItem>
              </div>
            </Accordion>
          </CollapsibleSection>
        </div>

        <div className="fixed bottom-0 p-4 w-[455px] bg-neutral-100 [box-shadow:0_0_12px_0_rgba(0,_84,_109,_0.24)]">
          <button
            disabled={!polygon || !polygonData || polygonLoading || LULCLoading}
            type="submit"
            className="w-full disabled:bg-muted-foreground disabled:hover:cursor-not-allowed disabled:hover:brightness-100 bg-primary-pink py-1.5 px-2 cursor-pointer hover:brightness-95 transition-all duration-300 flex flex-row space-x-2 items-center justify-center"
          >
            <p className="text-xs-semibold text-white">{t("generateMap")}</p>
            {/* <div className="w-full h-10 flex flex-row justify-center">
                          </div> */}
            {LULCLoading && <span className="loader sm "></span>}
          </button>
        </div>
      </form>
    </Form>
  );
}
