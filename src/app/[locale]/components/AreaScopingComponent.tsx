"use client";

import { ComingSoon } from "@/components/ComingSoon";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AREA_SCOPING_FILE_SIZE_LIMIT,
  AREA_SCOPING_POLYGON_AREA_LIMIT,
  AREA_SCOPING_TYPE,
  FETCH_POLYGON_URL,
  FETCH_REGENCY_AOI_URL,
  FETCH_UPLOAD_URL,
  PANEL_COMPONENT_KEY,
} from "@/constants";
import { GlobalContext } from "@/contexts/globalContext";
import { MapContext } from "@/contexts/mapContext";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import {
  cn,
  drawStyle,
  shortenKiloByte,
  styles,
  stylesTransparentFill,
} from "@/lib/utils";
import { FileTextIcon, MapPinIcon, UploadIcon } from "lucide-react";
import { formatRegencyLabel } from "@/lib/regency";
import { AreaResultCard } from "./AreaResultCard";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Coordinate } from "ol/coordinate";
import { EventsKey } from "ol/events";
import Feature from "ol/Feature";
import { MultiPoint, MultiPolygon, Polygon, SimpleGeometry } from "ol/geom";
import { Draw } from "ol/interaction";
import VectorLayer from "ol/layer/Vector";
import { unByKey } from "ol/Observable";
import VectorSource from "ol/source/Vector";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style, { GeometryFunction } from "ol/style/Style";
import { ChangeEvent, useContext, useEffect, useRef, useState } from "react";
import { showErrorToast } from "@/components/ui/error-toast";
import { RegencyCombobox } from "./RegencyCombobox";
import { SpatialResolutionSelect } from "./SpatialResolutionSelect";

// const styles = (strokeWidth: number) => [
//   new Style({
//     stroke: new Stroke({
//       color: "rgba(204, 71, 120, 1)",
//       width: strokeWidth,
//     }),
//     fill: undefined,
//   }),
//   new Style({
//     image: new CircleStyle({
//       radius: 0,
//       fill: new Fill({
//         color: "rgba(255, 255, 255)",
//       }),
//       stroke: new Stroke({
//         color: "rgba(204, 71, 120, 1)",
//         width: strokeWidth,
//       }),
//     }),
//     geometry: function (feature: Feature) {
//       let coordinates;
//       const geometry = feature.getGeometry();
//       if (geometry instanceof SimpleGeometry) {
//         coordinates = geometry.getCoordinates();
//         if (coordinates?.length) coordinates = coordinates[0];
//       }
//       return new MultiPoint(coordinates);
//     } as GeometryFunction,
//   }),
// ];

export const AreaScopingComponent = () => {
  const {
    areaScopingType,
    areaScopingPolygonArea,
    areaScopingPolygonFileName,
    areaScopingPolygonFileSize,
    areaScopingPolygonUrl,
    polygonData,
    isAreaScopingLoading,
    areaScopingPolygonError,
    areaScopingRegency,
    setAreaScopingPolygonArea,
    setAreaScopingPolygonFileName,
    setAreaScopingPolygonFileSize,
    setAreaScopingPolygonUrl,
    setAreaScopingRegency,
    setPolygonData,
    setIsAreaScopingLoading,
    setAreaScopingPolygonError,
  } = useContext(MapGenerationContext);

  const {
    setPolygon,
    polygon,
    vectorLayer,
    mapInstance,
    setVectorLayer,
    setLayerLegendArray,
    vectorSource,
  } = useContext(MapContext);

  const t = useTranslations("InteractivePanel");

  const drawInteractionRef = useRef<Draw | null>(null);

  const { sessionId, setSessionId } = useContext(GlobalContext);

  const [fileEnter, setFileEnter] = useState(false);
  const [drawInteraction, setDrawInteraction] = useState<Draw | null>(null);
  const [drawStartNumber, setDrawStartNumber] = useState<EventsKey | null>(
    null,
  );
  const [drawEndNumber, setDrawEndNumber] = useState<EventsKey | null>(null);

  const onUploadFile = (
    e: ChangeEvent<HTMLInputElement>,
    // cb: () => void,
  ) => {
    const target = e.target;
    const files = target?.files;

    if (!files) return;

    const file = files[0];

    // const blobUrl = URL.createObjectURL(file);
    setAreaScopingPolygonUrl(file);
    setAreaScopingPolygonFileSize(file.size);
    setAreaScopingPolygonFileName(file.name);
  };

  const onRemoveFile = () => {
    setAreaScopingPolygonUrl(null);
    setAreaScopingPolygonFileName("");
    setAreaScopingPolygonArea(0);
    setAreaScopingPolygonFileSize(0);
    setAreaScopingPolygonError("");
    setPolygonData(null);
    // Also drop the uploaded outline from the map (same as Reselect).
    vectorSource?.clear();
  };

  const onClickDraw = () => {
    // setPolygon(null);
    if (!vectorLayer || !mapInstance) return;

    const vSource = vectorLayer.getSource();

    if (!vSource) return;

    const updatedDraw = new Draw({
      source: vSource,
      type: "Polygon",
      // style: {
      //   "circle-radius": 5,
      //   "circle-fill-color": "rgba(204, 71, 120, 1)",
      //   "fill-color": "rgba(255, 255, 255, 0.5)",
      //   "stroke-color": "rgba(204, 71, 120, 1)",
      //   "stroke-width": 3,
      // },
      style: (feature) => drawStyle(feature),
    });

    setDrawInteraction(updatedDraw);

    const temp1 = updatedDraw.on("drawstart", () => {
      console.log("vsource clear onn drawstart");
      vectorLayer.getSource()?.clear();
      // Backspace to undo drawn polygon
      document.addEventListener("keydown", (e) => {
        if (e.key === "Backspace") {
          updatedDraw.removeLastPoint();
        }
      });
    });

    const temp2 = updatedDraw.on("drawend", (e) => {
      const feature: Feature<Polygon> = e.feature as Feature<Polygon>;
      feature.setStyle(stylesTransparentFill(3));

      const polygon = feature.getGeometry() as Polygon;
      setPolygon(polygon);

      const extent = polygon.getExtent();

      if (!extent || !mapInstance) return;

      const view = mapInstance.getView();

      view?.fit(extent, {
        padding: [150, 150, 150, 600],
      });

      submitPolygon(polygon);

      // setStage(POLYGON_STAGE.REQUEST);
      // submitPolygon(polygon);

      // Remove unused listener
      document.removeEventListener("keydown", (e) => {
        if (e.key === "Backspace") {
          updatedDraw.removeLastPoint();
        }
      });

      mapInstance.removeInteraction(updatedDraw);

      setDrawInteraction(null);

      setDrawStartNumber(null);
      setDrawEndNumber(null);
    });

    console.log("setdrawstarts");
    setDrawStartNumber(temp1);
    setDrawEndNumber(temp2);

    mapInstance.addInteraction(updatedDraw);
  };

  const submitPolygon = async (poly: Polygon) => {
    setIsAreaScopingLoading(true);

    const clone = poly?.clone();

    const transformed = clone?.transform("EPSG:3857", "EPSG:4326") as Polygon;

    if (!clone) return;

    const data = {
      type: "Feature",
      geometry: {
        type: transformed.getType(),
        coordinates: transformed.getCoordinates(),
      },
      session_id: sessionId,
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
          throw new Error(
            JSON.stringify(
              `${json?.error?.message || response.text}. Trace: ${json?.trace}`,
            ),
          );
        }

        setAreaScopingPolygonArea(json.data.area_size);

        setPolygonData({
          area_size: json.data.area_size,
          id: json.data.id,
        });

        setSessionId(json.data.session_id);

        // setDrawOrUpload(DRAW_UPLOAD.NULL);
        // setStage(POLYGON_STAGE.CONFIRMATION);
      })
      .catch((e) => {
        showErrorToast({
          title: t("common.errors.submitAreaFailed"),
          error: e,
          onRetry: () => void submitPolygon(poly),
        });
      })
      .finally(() => {
        setIsAreaScopingLoading(false);
      });
  };

  useEffect(() => {
    if (areaScopingType === AREA_SCOPING_TYPE.DRAW && !polygonData) {
      onClickDraw();
    }
  }, [polygonData]);

  useEffect(() => {
    drawInteractionRef.current = drawInteraction;
  }, [drawInteraction]);

  useEffect(() => {
    return () => {
      if (drawInteractionRef.current && mapInstance) {
        unByKey(drawStartNumber || []);
        unByKey(drawEndNumber || []);

        setDrawStartNumber(null);
        setDrawEndNumber(null);

        mapInstance.removeInteraction(drawInteractionRef.current);
        setDrawInteraction(null);
      }
    };
  }, []);

  return (
    <>
      {areaScopingType === AREA_SCOPING_TYPE.UPLOAD && (
        <div className="pb-3 space-y-4">
          <div className="flex flex-row gap-x-3 items-center">
            <Image
              src="/svgs/upload.svg"
              alt="map"
              width={24}
              height={24}
              className="size-12 shrink-0 aspect-square text-primary-pink"
            />
            <div className="space-y-2">
              <p className="font-noto-sans text-lg font-bold leading-7 text-text-icons-base-main">
                {t("areaScoping.uploadSHPFile")}
              </p>
              <p className="font-aptos text-[13px] font-regular leading-4.5 text-text-icons-base-second">
                {/* Here to generate the current <br /> condition data. */}
                {t.rich("areaScoping.uploadSHPFileDescription", {
                  br: () => <br></br>,
                })}
              </p>
            </div>
          </div>

          {isAreaScopingLoading && (
            <>
              <div className="w-full h-10 flex flex-row justify-center">
                <span className="loader "></span>
              </div>
            </>
          )}

          {!isAreaScopingLoading && (
            <>
              {areaScopingPolygonUrl && areaScopingPolygonError && (
                <AreaResultCard
                  icon={<FileTextIcon className="size-5" />}
                  title={areaScopingPolygonFileName}
                  subtitle={shortenKiloByte(areaScopingPolygonFileSize)}
                  onRemove={onRemoveFile}
                  error={{
                    title: t("common.errors.uploadFailed"),
                    description: areaScopingPolygonError,
                  }}
                />
              )}

              {/* The picked file, then (once uploaded) its area too. */}
              {areaScopingPolygonUrl &&
                !areaScopingPolygonError &&
                areaScopingPolygonFileSize <= AREA_SCOPING_FILE_SIZE_LIMIT &&
                (!polygonData ||
                  areaScopingPolygonArea <= AREA_SCOPING_POLYGON_AREA_LIMIT) && (
                  <AreaResultCard
                    icon={<FileTextIcon className="size-5" />}
                    title={areaScopingPolygonFileName}
                    subtitle={shortenKiloByte(areaScopingPolygonFileSize)}
                    areaHa={polygonData ? areaScopingPolygonArea : undefined}
                    onRemove={onRemoveFile}
                  />
                )}

              {areaScopingPolygonUrl &&
                !areaScopingPolygonError &&
                polygonData &&
                areaScopingPolygonArea > AREA_SCOPING_POLYGON_AREA_LIMIT && (
                  <AreaResultCard
                    icon={<FileTextIcon className="size-5" />}
                    title={areaScopingPolygonFileName}
                    subtitle={shortenKiloByte(areaScopingPolygonFileSize)}
                    areaHa={areaScopingPolygonArea}
                    onRemove={onRemoveFile}
                    error={{
                      title: t("common.areaTooBigError"),
                      description: t("common.areaTooBigErrorDesc", {
                        X: "1,000,000 Ha",
                      }),
                    }}
                  />
                )}

              {areaScopingPolygonUrl &&
                areaScopingPolygonFileSize > AREA_SCOPING_FILE_SIZE_LIMIT && (
                  <AreaResultCard
                    icon={<FileTextIcon className="size-5" />}
                    title={areaScopingPolygonFileName}
                    subtitle={shortenKiloByte(areaScopingPolygonFileSize)}
                    onRemove={onRemoveFile}
                    error={{
                      title: t("common.fileTooBigError", { X: "500" }),
                      description: t("common.fileTooBigErrorDesc", {
                        limit: "500MB",
                      }),
                    }}
                  />
                )}

              {!areaScopingPolygonUrl && (
                <>
                  <div
                    className={cn(
                      "p-4 border-2 border-dashed border-secondary-purple-light-hover rounded-[12px] space-y-4 transition-all duration-200 relative",
                      "min-h-40.5",
                      fileEnter && "border-primary-red-pink-normal",
                    )}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setFileEnter(true);
                    }}
                    onDragLeave={(e) => {
                      setFileEnter(false);
                    }}
                    onDragEnd={(e) => {
                      e.preventDefault();
                      setFileEnter(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setFileEnter(false);
                      if (e.dataTransfer.items) {
                        [...e.dataTransfer.items].forEach((item, i) => {
                          if (item.kind === "file") {
                            const file = item.getAsFile();
                            if (file) {
                              // const blobUrl = URL.createObjectURL(file);
                              setAreaScopingPolygonUrl(file);
                              setAreaScopingPolygonFileSize(file.size);
                              setAreaScopingPolygonFileName(file.name);
                            }
                            // console.log(`items file[${i}].name = ${file?.name}`);
                          }
                        });
                      } else {
                        // [...e.dataTransfer.files].forEach((file, i) => {
                        //   console.log(`… file[${i}].name = ${file.name}`);
                        // });
                      }
                    }}
                  >
                    {!fileEnter && (
                      <>
                        <div className="space-y-3">
                          <UploadIcon className="size-8 aspect-square text-text-icons-base-third mx-auto" />
                          <p className="font-aptos text-[13px] font-regular leading-4.5 text-text-icons-base-second text-center">
                            {/* Accepted format .zip (.shp, .shx, .dbf, .prj), .kml,
                            .kmz */}
                            {t("areaScoping.dragAndDrop")} <br />
                            {t("areaScoping.acceptedFormat", {
                              X: ".zip (.shp, .shx, .dbf, .prj), .kml, .kmz",
                            })}
                          </p>
                        </div>
                        <Label
                          htmlFor="area-scoping-file-upload"
                          className="w-50 mx-auto flex flex-row justify-center mb-0"
                        >
                          <div className="rounded-[12px] bg-primary-pink-hover hover:bg-primary-pink-hover hover:brightness-95 cursor-pointer w-full py-1.5 px-2 transition-all duration-200">
                            <p className="font-aptos text-[13px] font-semibold leading-4.5 text-primary-red-pink-normal text-center">
                              {t("areaScoping.browseFile")}
                            </p>
                          </div>
                        </Label>
                      </>
                    )}

                    {fileEnter && (
                      <>
                        <div className="absolute flex flex-col items-center justify-center gap-y-3 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                          <UploadIcon className="size-8 aspect-square text-primary-pink mx-auto" />
                          <p className="font-aptos text-[13px] font-regular leading-4.5 text-primary-pink text-center">
                            {t("areaScoping.dropHere")}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}

              <input
                id="area-scoping-file-upload"
                type="file"
                className="hidden"
                accept=".zip,.kmz,.kml"
                multiple={false}
                onChange={onUploadFile}
              />
            </>
          )}

          <SpatialResolutionSelect />
        </div>
      )}
      {areaScopingType === AREA_SCOPING_TYPE.DRAW && (
        <div className="pb-3 space-y-4">
          <div className="flex flex-row gap-x-3 items-center">
            <Image
              src="/svgs/draw-polygon-plus.svg"
              alt="map"
              width={105}
              height={90.81}
              className="w-20 shrink-0 text-primary-pink p-1"
            />
            <div className="space-y-2">
              <p className="font-noto-sans text-lg font-bold leading-7 text-text-icons-base-main">
                {t("areaScoping.drawPolygon")}
              </p>
              <p className="font-aptos text-[13px] font-regular leading-4.5 text-text-icons-base-second">
                {t("areaScoping.drawPolygonSubtitle")}
              </p>
            </div>
          </div>

          {isAreaScopingLoading && (
            <>
              <div className="w-full h-10 flex flex-row justify-center">
                <span className="loader "></span>
              </div>
            </>
          )}

          {!isAreaScopingLoading && (
            <>
              {polygonData &&
                areaScopingPolygonArea <= AREA_SCOPING_POLYGON_AREA_LIMIT && (
                  <AreaResultCard
                    icon={
                      <Image
                        src="/svgs/draw-polygon.svg"
                        alt=""
                        width={24}
                        height={20}
                        className="w-6 h-auto"
                      />
                    }
                    areaHa={areaScopingPolygonArea}
                  />
                )}

              {polygonData &&
                areaScopingPolygonArea > AREA_SCOPING_POLYGON_AREA_LIMIT && (
                  <AreaResultCard
                    icon={
                      <Image
                        src="/svgs/draw-polygon.svg"
                        alt=""
                        width={24}
                        height={20}
                        className="w-6 h-auto"
                      />
                    }
                    areaHa={areaScopingPolygonArea}
                    error={{
                      title: t("common.areaTooBigError"),
                      description: t("common.areaTooBigErrorDesc", {
                        X: "1,000,000 Ha",
                      }),
                    }}
                  />
                )}
            </>
          )}
          <SpatialResolutionSelect />
        </div>
      )}
      {areaScopingType === AREA_SCOPING_TYPE.REGENCY && (
        <div className="pb-3 space-y-4" data-testid="area-scoping-regency-panel">
          <div className="flex flex-row gap-x-3 items-center">
            <Image
              src="/svgs/regency-search.svg"
              alt="select-regency"
              width={24}
              height={24}
              className="size-12 shrink-0 aspect-square text-primary-pink"
            />
            <div className="space-y-2">
              <p className="font-noto-sans text-lg font-bold leading-7 text-text-icons-base-main">
                {t("areaScoping.selectRegency")}
              </p>
              <p className="font-aptos text-[13px] font-regular leading-4.5 text-text-icons-base-second">
                {t("areaScoping.selectRegencySubtitle")}
              </p>
            </div>
          </div>

          <RegencyCombobox
            value={areaScopingRegency}
            disabled={isAreaScopingLoading}
            onChange={(regency) => {
              setAreaScopingRegency(regency);
              // A new choice invalidates any polygon fetched for the old one
              if (polygonData) {
                setPolygonData(null);
                setAreaScopingPolygonArea(0);
                vectorSource?.clear();
              }
            }}
          />

          {isAreaScopingLoading && (
            <>
              <div className="w-full h-10 flex flex-row justify-center">
                <span className="loader "></span>
              </div>
            </>
          )}

          {!isAreaScopingLoading && (
            <>
              {polygonData &&
                areaScopingRegency &&
                areaScopingPolygonArea <= AREA_SCOPING_POLYGON_AREA_LIMIT && (
                  <AreaResultCard
                    icon={<MapPinIcon className="size-5" />}
                    title={formatRegencyLabel(areaScopingRegency)}
                    areaHa={areaScopingPolygonArea}
                  />
                )}

              {polygonData &&
                areaScopingPolygonArea > AREA_SCOPING_POLYGON_AREA_LIMIT && (
                  <AreaResultCard
                    icon={<MapPinIcon className="size-5" />}
                    title={
                      areaScopingRegency
                        ? formatRegencyLabel(areaScopingRegency)
                        : undefined
                    }
                    areaHa={areaScopingPolygonArea}
                    error={{
                      title: t("common.areaTooBigError"),
                      description: t("common.areaTooBigErrorDesc", {
                        X: "1,000,000 Ha",
                      }),
                    }}
                  />
                )}
            </>
          )}
          <SpatialResolutionSelect />
        </div>
      )}
    </>
  );
};

export const AreaScopingFooter = () => {
  const t = useTranslations("InteractivePanel");

  const {
    areaScopingType,
    areaScopingPolygonArea,
    areaScopingPolygonFileName,
    areaScopingPolygonFileSize,
    areaScopingPolygonUrl,
    areaScopingPolygonError,
    areaScopingRegency,
    polygonData,
    isAreaScopingLoading,
    setAreaScopingPolygonArea,
    setAreaScopingPolygonFileName,
    setAreaScopingPolygonFileSize,
    setAreaScopingPolygonUrl,
    setAreaScopingRegency,
    setPolygonData,
    setIsAreaScopingLoading,
    setAreaScopingPolygonError,
    setStepKey,
    spatialResolution,
  } = useContext(MapGenerationContext);

  const { sessionId, setSessionId } = useContext(GlobalContext);

  const {
    setPolygon,
    polygon,
    vectorLayer,
    mapInstance,
    setVectorLayer,
    vectorSource,
    setVectorSource,
    setLayerLegendArray,
  } = useContext(MapContext);

  const onReselect = () => {
    setAreaScopingPolygonUrl(null);
    setAreaScopingPolygonFileName("");
    setAreaScopingPolygonArea(0);
    setAreaScopingPolygonFileSize(0);
    setAreaScopingPolygonError("");
    setAreaScopingRegency(null);
    setPolygonData(null);

    if (vectorLayer && mapInstance) {
      console.log("vsource clear onreselect");
      vectorSource?.clear();
    }
  };

  const isReselectDisabled =
    isAreaScopingLoading ||
    (areaScopingType === AREA_SCOPING_TYPE.UPLOAD &&
      !areaScopingPolygonFileName &&
      !areaScopingPolygonUrl) ||
    (areaScopingType === AREA_SCOPING_TYPE.DRAW && !polygonData) ||
    (areaScopingType === AREA_SCOPING_TYPE.REGENCY && !areaScopingRegency);

  const isConfirmDisabled =
    isAreaScopingLoading ||
    !!areaScopingPolygonError ||
    spatialResolution === "" ||
    (polygonData && areaScopingPolygonArea > AREA_SCOPING_POLYGON_AREA_LIMIT) ||
    (areaScopingType === AREA_SCOPING_TYPE.DRAW && !polygonData) ||
    (areaScopingType === AREA_SCOPING_TYPE.REGENCY && !areaScopingRegency) ||
    (areaScopingType === AREA_SCOPING_TYPE.UPLOAD &&
      !areaScopingPolygonFileName &&
      areaScopingPolygonFileSize < AREA_SCOPING_FILE_SIZE_LIMIT);

  /**
   * Put a backend AOI response on the map (replacing the current vector layer),
   * fit the view to it and store area/id in context.
   * Shared by the upload and regency flows.
   */
  const applyAoiResponse = (json: GeosAoiRes) => {
    const tempPolygon =
      json.geometry.type === "MultiPolygon"
        ? new MultiPolygon(
            json.geometry.coordinates as Coordinate[][][],
          ).transform("EPSG:4326", "EPSG:3857")
        : (new Polygon(json.geometry.coordinates as Coordinate[][]).transform(
            "EPSG:4326",
            "EPSG:3857",
          ) as Polygon);

    const polygonFeature = new Feature<Polygon | MultiPolygon>(tempPolygon);
    const newVectorSource = new VectorSource({
      features: [polygonFeature],
      wrapX: false,
    });
    const newVectorLayer = new VectorLayer({
      source: newVectorSource,
      style: stylesTransparentFill(3),
    });

    newVectorLayer.setZIndex(Infinity);
    setVectorSource(newVectorSource);
    setVectorLayer(newVectorLayer);
    mapInstance?.addLayer(newVectorLayer);

    setPolygon(tempPolygon);

    setAreaScopingPolygonArea(json.data.area_size);
    setPolygonData({
      area_size: json.data.area_size,
      id: json.data.id,
    });
    setSessionId(json.data.session_id);

    const extent = newVectorSource.getExtent();
    if (!extent || !mapInstance) return;

    mapInstance.getView()?.fit(extent, {
      padding: [150, 150, 150, 600],
    });
  };

  const onSubmitShp = async () => {
    if (!areaScopingPolygonUrl) return;

    const body = new FormData();

    body.append("file", areaScopingPolygonUrl);
    body.append("session_id", sessionId);

    setIsAreaScopingLoading(true);

    fetch(FETCH_UPLOAD_URL, {
      method: "POST",
      body,
    })
      .then(async (response) => {
        const json: GeosAoiRes = await response.json();

        if (!response.ok) {
          throw new Error(
            JSON.stringify(
              `${json?.error?.message || response.text}. Trace: ${json?.trace}`,
            ),
          );
        }

        applyAoiResponse(json);
      })
      .catch((e) => {
        showErrorToast({
          title: t("common.errors.uploadFailed"),
          description: t("common.errors.uploadHint"),
          error: e,
          onRetry: () => void onSubmitShp(),
        });

        if (e?.message) {
          setAreaScopingPolygonError(e.message);
          return;
        }
      })
      .finally(() => {
        setIsAreaScopingLoading(false);
      });
  };

  /**
   * Regency flow: fetch the Kabupaten/Kota polygon, put it on the map and —
   * when it is within the area limit — return to Basic Information straight
   * away (the user only needs one Confirm click).
   */
  const onSubmitRegency = async () => {
    if (!areaScopingRegency) return;

    setIsAreaScopingLoading(true);
    setAreaScopingPolygonError("");

    fetch(FETCH_REGENCY_AOI_URL, {
      method: "POST",
      body: JSON.stringify({
        code: areaScopingRegency.code,
        session_id: sessionId,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        const json: GeosRegencyAoiRes = await response.json();

        if (!response.ok) {
          throw new Error(
            JSON.stringify(
              `${json?.error?.message || response.statusText}. Trace: ${json?.trace}`,
            ),
          );
        }

        applyAoiResponse(json);

        if (json.data.area_size <= AREA_SCOPING_POLYGON_AREA_LIMIT) {
          setStepKey(PANEL_COMPONENT_KEY.BASIC_INFORMATION);
        }
      })
      .catch((e) => {
        showErrorToast({
          title: t("common.errors.loadRegencyFailed"),
          error: e,
          onRetry: () => void onSubmitRegency(),
        });
      })
      .finally(() => {
        setIsAreaScopingLoading(false);
      });
  };

  const onClickConfirm = () => {
    if (areaScopingType === AREA_SCOPING_TYPE.DRAW) {
      setStepKey(PANEL_COMPONENT_KEY.BASIC_INFORMATION);
      return;
    }

    if (areaScopingType === AREA_SCOPING_TYPE.REGENCY) {
      if (!areaScopingRegency) return;

      if (!polygonData) {
        onSubmitRegency();
        return;
      }

      if (areaScopingPolygonArea > AREA_SCOPING_POLYGON_AREA_LIMIT) return;

      setStepKey(PANEL_COMPONENT_KEY.BASIC_INFORMATION);
      return;
    }

    if (
      !areaScopingPolygonFileName ||
      !areaScopingPolygonFileSize ||
      areaScopingPolygonFileSize > AREA_SCOPING_FILE_SIZE_LIMIT ||
      areaScopingPolygonError ||
      !areaScopingPolygonUrl
    )
      return;

    if (areaScopingType === AREA_SCOPING_TYPE.UPLOAD && !polygonData) {
      onSubmitShp();
    }

    if (
      areaScopingPolygonArea > AREA_SCOPING_POLYGON_AREA_LIMIT ||
      areaScopingPolygonError ||
      !polygonData
    )
      return;

    setStepKey(PANEL_COMPONENT_KEY.BASIC_INFORMATION);
  };

  return (
    <div className="grid grid-cols-2 gap-x-4 p-3 pt-2">
      <Button
        disabled={isReselectDisabled}
        variant="primary"
        className="bg-primary-pink/60 hover:bg-primary-pink/70"
        onClick={() => {
          onReselect();
        }}
      >
        {t("common.reselect")}
      </Button>
      <Button
        disabled={isConfirmDisabled}
        variant="primary"
        className=""
        onClick={() => {
          onClickConfirm();
        }}
      >
        {t("common.confirm")}
      </Button>
    </div>
  );
};
