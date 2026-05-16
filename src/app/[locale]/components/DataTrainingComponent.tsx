"use client";

import { Button } from "@/components/ui/button";
import { GlobalContext } from "@/contexts/globalContext";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { cn, shortenKiloByte, svgWithColor } from "@/lib/utils";
import { fromLonLat, toLonLat } from "ol/proj";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LUCClassTable } from "./LUCClassTable";
import {
  DATA_TRAINING_FILE_SIZE_LIMIT,
  LUC_UPDATE_URL,
  PANEL_COMPONENT_KEY,
  POINTING_TYPE,
  TRAINING_DATA_UPDATE_URL,
  TRAINING_DATA_UPLOAD_URL,
} from "@/constants";
import {
  AlertCircleIcon,
  ChevronDown,
  ChevronLeft,
  FileTextIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import { toast } from "sonner";
import { MapContext } from "@/contexts/mapContext";
import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionFullTrigger,
  AccordionItem,
} from "@/components/ui/accordion";
import Feature from "ol/Feature";
import { Point } from "ol/geom";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";

export const DataTrainingComponent = () => {
  const { sessionId } = useContext(GlobalContext);

  const {
    setMarkerArray,
    markerArray,
    renderArrayToMarkerVector,
    removeMarkerCursor,
    markerCursor,
    markerVectorLayer,
    markerVectorSource,
  } = useContext(MapContext);

  const {
    classArray,
    pointingType,
    selectedClass,
    setSelectedClass,
    setPointingType,
    setStepKey,
    isUploadingTrainingFile,
    setIsUploadingTrainingFile,
    defaultArray,
    LUCfile,
    trainingFile,
    trainingFilename,
    trainingFilesize,
    trainingFileError,
    uploadedFilesArray,
    setTrainingFile,
    setTrainingFilename,
    setTrainingFilesize,
    setTrainingFileError,
    setUploadedFilesArray,
    setIsTrainingDataChanged,
  } = useContext(MapGenerationContext);

  const t = useTranslations("InteractivePanel");

  const [fileEnter, setFileEnter] = useState(false);

  // useEffect(() => {
  //   console.log("upll", uploadedFilesArray);
  // }, [uploadedFilesArray]);

  const onClickStartPointing = () => {
    removeMarkerCursor();
    setIsTrainingDataChanged(true);
    setStepKey(PANEL_COMPONENT_KEY.OSS);
  };

  const submitFile = (fileObj: FileObject) => {
    setIsTrainingDataChanged(true);
    setTrainingFileError("");

    if (!fileObj) return;

    setTrainingFile(fileObj.file);
    setTrainingFilename(fileObj.filename);
    setTrainingFilesize(fileObj.filesize);

    if (fileObj.filesize > DATA_TRAINING_FILE_SIZE_LIMIT) return;

    setIsUploadingTrainingFile(true);

    const body = new FormData();

    body.append("file", fileObj.file);
    body.append("session_id", sessionId);

    fetch(TRAINING_DATA_UPLOAD_URL, {
      method: "POST",
      body,
    })
      .then(async (response) => {
        const json: TrainingDataUploadRes = await response.json();

        if (!response.ok) {
          setTrainingFileError(json?.error?.message || String(response.text));
          throw new Error(
            JSON.stringify(
              `${json?.error?.message || response.text}. Trace: ${json?.trace}`,
            ),
          );
        }

        const training_data = json.training_data.map((item) => ({
          ...item,
          id: crypto.randomUUID(),
        }));

        setUploadedFilesArray((prev) => [
          ...prev,
          {
            file: fileObj.file,
            filename: fileObj.filename,
            filesize: fileObj.filesize,
            training_data,
          },
        ]);

        const tempMarkerArray = [
          ...markerArray,
          ...training_data.map((item) => ({
            coordinates: [
              fromLonLat(item.geometry.coordinates)[0],
              fromLonLat(item.geometry.coordinates)[1],
            ] as [number, number],
            id: item.id,
            // WIP NAME WITH POINT
            name: item.class_name,
            class_id: item.class_id,
            class_color: item.class_color,
          })),
        ];

        const tempMarkerWithFeature = tempMarkerArray.map((item) => ({
          ...item,
          map_feature: new Feature({
            geometry: new Point(item.coordinates),
            id: item.id,
            property: {
              class_name: item.name,
            },
          }),
        }));

        tempMarkerWithFeature.forEach((item) => {
          item.map_feature.setStyle(
            new Style({
              image: new Icon({
                anchor: [0.5, 1], // Anchor the bottom center of the icon
                src: svgWithColor(item.class_color),
                // src: "/images/marker.webp", // Use your own icon URL
                size: [92, 117],
                height: 30,
              }),
            }),
          );
        });

        setMarkerArray(tempMarkerWithFeature);

        renderArrayToMarkerVector(tempMarkerWithFeature);

        setTrainingFile(null);
        setTrainingFilename("");
        setTrainingFilesize(0);
        // console.log("jjson", json);
      })
      .catch((e) => {
        toast.error(`Error on uploading file: ${e}`, {
          duration: Infinity,
          dismissible: true,
          closeButton: true,
        });
        // console.log("errorr", e);
      })
      .finally(() => {
        setIsUploadingTrainingFile(false);
      });
  };

  const onUploadFile = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.target;
    const files = target?.files;

    if (!files) return;

    const file = files[0];

    // setTrainingFile(file);
    // setTrainingFilename(file.name);
    // setTrainingFilesize(file.size);

    submitFile({
      file,
      filename: file.name,
      filesize: file.size,
    });
  };

  const isNextDisabled =
    !pointingType || (pointingType === POINTING_TYPE.BULK && !selectedClass);

  const isFormDisabled = isUploadingTrainingFile || trainingFileError !== "";

  const selectedDefault = defaultArray.length > 0;
  const selectedCustom = LUCfile !== null;

  useEffect(() => {
    markerVectorLayer?.setOpacity(1);
    // if (markerArray.length > 0) {
    //   // console.log("markerarr", markerArray);
    //   renderArrayToMarkerVector(markerArray);
    //   return;
    // }

    if (selectedDefault) return;

    if (selectedCustom) {
      markerCursor(pointingType, classArray, true);
      return;
    }
  }, []);

  // useEffect(() => {
  //   console.log("marker arrya", markerArray);
  // }, [markerArray]);

  return (
    <>
      <div className="space-y-4">
        {/* {selectedDefault && <LUCClassTable summary={false} />} */}
        {selectedCustom && (
          <div className="rounded-[12px] bg-white p-3 py-5 border border-neutral-400 space-y-6">
            <Tabs defaultValue="upload" className="gap-y-3 mb-0">
              <div className="px-0 py-0">
                <TabsList className="w-full px-1.5">
                  <TabsTrigger value="upload">
                    {t("dataTraining.uploadDataTraining")}
                  </TabsTrigger>
                  <TabsTrigger value="oss">
                    {t("dataTraining.onScreenSampling")}
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="upload">
                <div className="space-y-6">
                  <p className="font-aptos text-md font-regular leading-6 text-neutral-700">
                    {t("dataTraining.uploadDataTrainingDescription")}
                  </p>
                  <div className="space-y-6">
                    {uploadedFilesArray.length === 0 && (
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
                                  // setAreaScopingPolygonUrl(file);
                                  // setAreaScopingPolygonFileSize(file.size);
                                  // setAreaScopingPolygonFileName(file.name);
                                  // console.log("fileee", file);

                                  // setTrainingFile(file);
                                  // setTrainingFilename(file.name);
                                  // setTrainingFilesize(file.size);

                                  submitFile({
                                    file,
                                    filename: file.name,
                                    filesize: file.size,
                                  });
                                }
                                // console.log(`items file[${i}].name = ${file?.name}`);
                              }
                            });
                          } else {
                            [...e.dataTransfer.files].forEach((file, i) => {
                              console.log(`… file[${i}].name = ${file.name}`);
                            });
                          }
                        }}
                      >
                        {!fileEnter && (
                          <>
                            <div className="space-y-3">
                              <UploadIcon className="size-8 aspect-square text-text-icons-base-third mx-auto" />
                              <p className="font-aptos text-[13px] font-regular leading-4.5 text-neutrals-600 text-center">
                                {/* Drag & drop your file here to upload. <br />
                            Accepted format .zip */}
                                {t("dataTraining.dragAndDrop")} <br />
                                {t("dataTraining.acceptedFormat", {
                                  X: ".zip",
                                })}
                              </p>
                            </div>
                            <Label
                              htmlFor="data-training-file-upload"
                              className={cn(
                                "w-50 mx-auto flex flex-row justify-center mb-0",
                                isFormDisabled &&
                                  "pointer-events-none cursor-not-allowed",
                              )}
                            >
                              <div
                                className={cn(
                                  "rounded-[12px] bg-primary-pink-hover hover:bg-primary-pink-hover hover:brightness-95 cursor-pointer w-full py-1.5 px-2 transition-all duration-200",
                                  isFormDisabled &&
                                    "bg-text-icons-disabled text-text-icons-base-third",
                                )}
                              >
                                <p className="font-aptos text-[13px] font-semibold leading-4.5 text-primary-red-pink-normal text-center">
                                  {t("dataTraining.browseFile")}
                                </p>
                              </div>
                            </Label>
                          </>
                        )}

                        {fileEnter && !isFormDisabled && (
                          <>
                            <div className="absolute flex flex-col items-center justify-center gap-y-3 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                              <UploadIcon className="size-8 aspect-square text-primary-pink mx-auto" />
                              <p className="font-aptos text-[13px] font-regular leading-4.5 text-primary-pink text-center">
                                {t("dataTraining.dropHere")}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    {uploadedFilesArray.map((item, index) => {
                      return (
                        <div
                          key={`uploaded-file-${item.filename}-${index}`}
                          className="px-3 py-3 rounded-[12px] border-2 border-dashed border-secondary-purple-light-active grid grid-cols-12 gap-x-4 items-center bg-purple-second"
                        >
                          <div className="flex flex-row gap-x-4 items-center col-span-10">
                            <div className="rounded-[12px] bg-secondary-purple-light-hover aspect-square size-18 flex justify-center items-center">
                              <FileTextIcon className="text-secondary-purple-dark size-12 aspect-square" />
                            </div>
                            <div className="">
                              <p className="font-aptos text-lg font-bold leading-7 text-secondary-purple-dark line-clamp-1 text-ellipsis">
                                {item.filename}
                              </p>
                              <p className="font-aptos text-sm font-regular leading-5 text-secondary-purple-dark">
                                {shortenKiloByte(item.filesize)}
                              </p>
                            </div>
                          </div>

                          <div className="col-span-2 flex flex-row justify-end">
                            <Button
                              disabled={isUploadingTrainingFile}
                              variant={"ghost"}
                              className="hover:brightness-95 cursor-pointer size-7 rounded-full"
                              onClick={() => {
                                setTrainingFile(null);
                                setTrainingFilename("");
                                setTrainingFilesize(0);
                                setTrainingFileError("");

                                setUploadedFilesArray([]);

                                setMarkerArray([]);
                                markerVectorSource?.clear();

                                const doc = document.getElementById(
                                  "data-training-file-upload",
                                ) as HTMLInputElement;
                                if (!doc) return;

                                doc.value = "";
                              }}
                            >
                              <Trash2Icon className="text-secondary-purple-dark size-5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    {trainingFile && (
                      <>
                        {trainingFilesize <= DATA_TRAINING_FILE_SIZE_LIMIT &&
                          !trainingFileError && (
                            <div className="px-3 py-3 rounded-[12px] border-2 border-dashed border-secondary-purple-light-active grid grid-cols-12 gap-x-4 items-center bg-purple-second">
                              <div className="col-span-10 flex flex-row gap-x-4 items-center">
                                <div className="rounded-[12px] bg-secondary-purple-light-hover aspect-square size-18 flex justify-center items-center">
                                  <FileTextIcon className="text-secondary-purple-dark size-12 aspect-square" />
                                </div>
                                <div className="">
                                  <p className="font-aptos text-lg font-bold leading-7 text-secondary-purple-dark line-clamp-1 text-ellipsis">
                                    {trainingFilename}
                                  </p>
                                  <p className="font-aptos text-sm font-regular leading-5 text-secondary-purple-dark">
                                    {shortenKiloByte(trainingFilesize)}
                                  </p>
                                </div>
                              </div>

                              <div className="col-span-2 flex flex-row justify-end">
                                {isUploadingTrainingFile && (
                                  <div className="w-full h-10 flex flex-row justify-center">
                                    <span className="loader sm"></span>
                                  </div>
                                )}
                                {!isUploadingTrainingFile && (
                                  <Button
                                    disabled={isUploadingTrainingFile}
                                    variant={"ghost"}
                                    className="hover:brightness-95 cursor-pointer size-7 rounded-full"
                                    onClick={() => {
                                      setTrainingFile(null);
                                      setTrainingFilename("");
                                      setTrainingFilesize(0);
                                      setTrainingFileError("");

                                      const doc = document.getElementById(
                                        "data-training-file-upload",
                                      ) as HTMLInputElement;
                                      if (!doc) return;

                                      doc.value = "";
                                    }}
                                  >
                                    <Trash2Icon className="text-secondary-purple-dark size-5" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        {trainingFileError && (
                          <>
                            <div className="px-3 py-3 rounded-[12px] border-2 border-dashed border-danger-200 grid grid-cols-12 gap-x-4 items-center bg-danger-50">
                              <div className="flex flex-row gap-x-4 items-center col-span-10">
                                <div className="rounded-[12px] bg-danger-100 aspect-square size-18 flex justify-center items-center">
                                  <FileTextIcon className="text-danger-700 size-12 aspect-square" />
                                </div>
                                <div className="">
                                  <p className="font-aptos text-lg font-bold leading-7 text-danger-600 line-clamp-1 text-ellipsis">
                                    {trainingFilename}
                                  </p>
                                  <p className="font-aptos text-sm font-regular leading-5 text-danger-600">
                                    {shortenKiloByte(trainingFilesize)}
                                  </p>
                                </div>
                              </div>
                              <div className="col-span-2 flex flex-row justify-end">
                                <Button
                                  disabled={isUploadingTrainingFile}
                                  variant={"ghost"}
                                  className="hover:brightness-95 cursor-pointer size-7 rounded-full"
                                  onClick={() => {
                                    setTrainingFile(null);
                                    setTrainingFilename("");
                                    setTrainingFilesize(0);
                                    setTrainingFileError("");

                                    const doc = document.getElementById(
                                      "data-training-file-upload",
                                    ) as HTMLInputElement;
                                    if (!doc) return;

                                    doc.value = "";
                                  }}
                                >
                                  <Trash2Icon className="text-danger-700 size-5" />
                                </Button>
                              </div>
                            </div>
                            <div className="px-3 py-3 rounded-[12px] border-danger-700 flex flex-row justify-between gap-x-4 items-center bg-danger-700">
                              <div className="flex flex-row gap-x-4 items-center">
                                <div className="rounded-[12px] bg-danger-500 aspect-square size-18 flex justify-center items-center">
                                  <AlertCircleIcon className="text-danger-100 size-12 aspect-square" />
                                </div>
                                <div className="">
                                  <p className="font-aptos text-lg font-bold leading-7 text-danger-50">
                                    {t("common.fileError")}
                                  </p>
                                  <p className="font-aptos text-sm font-regular leading-5 text-danger-50">
                                    {trainingFileError}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                        {trainingFilesize > DATA_TRAINING_FILE_SIZE_LIMIT &&
                          !trainingFileError && (
                            <>
                              <div className="px-3 py-3 rounded-[12px] border-2 border-dashed border-danger-200 grid grid-cols-12 gap-x-4 items-center bg-danger-50">
                                <div className="flex flex-row gap-x-4 items-center col-span-10">
                                  <div className="rounded-[12px] bg-danger-100 aspect-square size-18 flex justify-center items-center">
                                    <FileTextIcon className="text-danger-700 size-12 aspect-square" />
                                  </div>
                                  <div className="">
                                    <p className="font-aptos text-lg font-bold leading-7 text-danger-600 line-clamp-1 text-ellipsis">
                                      {trainingFilename}
                                    </p>
                                    <p className="font-aptos text-sm font-regular leading-5 text-danger-600">
                                      {shortenKiloByte(trainingFilesize)}
                                    </p>
                                  </div>
                                </div>
                                <div className="col-span-2 flex flex-row justify-end">
                                  <Button
                                    disabled={isUploadingTrainingFile}
                                    variant={"ghost"}
                                    className="hover:brightness-95 cursor-pointer size-7 rounded-full"
                                    onClick={() => {
                                      setTrainingFile(null);
                                      setTrainingFilename("");
                                      setTrainingFilesize(0);

                                      const doc = document.getElementById(
                                        "data-training-file-upload",
                                      ) as HTMLInputElement;
                                      if (!doc) return;

                                      doc.value = "";
                                    }}
                                  >
                                    <Trash2Icon className="text-danger-700 size-5" />
                                  </Button>
                                </div>
                              </div>
                              <div className="px-3 py-3 rounded-[12px] border-danger-700 flex flex-row justify-between gap-x-4 items-center bg-danger-700">
                                <div className="flex flex-row gap-x-4 items-center">
                                  <div className="rounded-[12px] bg-danger-500 aspect-square size-18 flex justify-center items-center">
                                    <AlertCircleIcon className="text-danger-100 size-12 aspect-square" />
                                  </div>
                                  <div className="">
                                    <p className="font-aptos text-lg font-bold leading-7 text-danger-50">
                                      {t("common.fileTooBigError", {
                                        X: "500",
                                      })}
                                    </p>
                                    <p className="font-aptos text-sm font-regular leading-5 text-danger-50">
                                      {t("common.fileTooBigErrorDesc", {
                                        limit: "500MB",
                                      })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                      </>
                    )}
                  </div>
                </div>
                <input
                  id="data-training-file-upload"
                  type="file"
                  className="hidden"
                  accept=".zip"
                  multiple={false}
                  onChange={onUploadFile}
                />
              </TabsContent>
              <TabsContent value="oss">
                <div className="space-y-6">
                  <p className="font-aptos text-md font-regular leading-6 text-neutral-700">
                    {t("dataTraining.onScreenSamplingDescription")}
                  </p>
                  {/* <div className="space-y-2">
                    <p className="text-text-icons-base-main font-aptos text-xl font-bold leading-6">
                      {t("dataTraining.recordedLULC")}
                    </p>
                    <LUCClassTable summary={false} />
                  </div> */}
                  <Tabs defaultValue="pinpoint" className="gap-y-3 mb-0">
                    <div className="px-0">
                      <TabsList className="w-full bg-transparent rounded-none border-0 p-0 gap-0">
                        <TabsTrigger
                          value="pinpoint"
                          className="font-aptos data-[state=active]:text-text-icons-base-main text-[15px] text-text-icons-base-third font-semibold leading-4.5 data-[state=active]:bg-transparent border-0 border-b-4 data-[state=active]:border-b-primary-pink rounded-none"
                        >
                          {t("dataTraining.pinPoint")}
                        </TabsTrigger>
                        <TabsTrigger
                          disabled
                          value="draw"
                          className="font-aptos data-[state=active]:text-text-icons-base-main text-[15px] text-text-icons-base-third font-semibold leading-4.5 data-[state=active]:bg-transparent border-0 border-b-4 data-[state=active]:border-b-primary-pink border-b-text-icons-disabled rounded-none"
                        >
                          {t("areaScoping.drawPolygon")}
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    <TabsContent value="pinpoint">
                      <div className="mt-4 space-y-5.5">
                        <div className="">
                          {/* <p className="text-text-icons-base-main font-aptos text-xl font-bold leading-6">
                            {t("dataTraining.pinYourPoint")}
                          </p> */}
                          <p className="text-text-icons-base-second font-aptos text-[13px] font-regular leading-4.5">
                            {t("dataTraining.pinYourPointDescription")}
                          </p>
                        </div>
                        <RadioGroup
                          onValueChange={(val: POINTING_TYPE) => {
                            setPointingType(val);
                          }}
                          value={pointingType}
                          // defaultValue="single"
                          className="space-y-3"
                        >
                          <Label
                            htmlFor="single-radio"
                            className=" mb-0 hover:brightness-95 cursor-pointer bg-white transition-all duration-200"
                          >
                            <div
                              className={cn(
                                "p-3 flex flex-row items-center gap-x-3 rounded-[12px] border-2 border-text-icons-disabled",
                                pointingType === POINTING_TYPE.SINGLE &&
                                  "border-primary-pink",
                              )}
                            >
                              <div className="">
                                <RadioGroupItem
                                  value={POINTING_TYPE.SINGLE}
                                  id="single-radio"
                                  className={cn(
                                    "size-5.5 border-text-icons-disabled border-2",
                                    pointingType === POINTING_TYPE.SINGLE &&
                                      "border-primary-red-pink-normal-active",
                                  )}
                                  indicatorClassName="size-4 text-primary-pink fill-primary-pink"
                                />
                              </div>
                              <div className="">
                                <Image
                                  src="/images/single-point.webp"
                                  width={164}
                                  height={140}
                                  alt="Single Point"
                                  className="w-22.5"
                                />
                              </div>
                              <div className="">
                                <p className="font-aptos text-md font-bold leading-6 text-text-icons-base-main">
                                  {t("dataTraining.singlePoint")}
                                </p>
                                <p className="font-aptos text-[13px] font-regular leading-4.5 text-text-icons-base-second">
                                  {t("dataTraining.singlePointDescription")}
                                </p>
                              </div>
                            </div>
                          </Label>
                          <Label
                            htmlFor="bulk-radio"
                            className=" mb-0 hover:brightness-95 cursor-pointer bg-white transition-all duration-200"
                          >
                            <div
                              className={cn(
                                "p-3 rounded-[12px] border-2 border-text-icons-disabled flex flex-col gap-y-4",
                                pointingType === POINTING_TYPE.BULK &&
                                  "border-primary-pink",
                              )}
                            >
                              <div className="flex flex-row items-center gap-x-3">
                                <div className="">
                                  <RadioGroupItem
                                    value={POINTING_TYPE.BULK}
                                    id="bulk-radio"
                                    className={cn(
                                      "size-5.5 border-text-icons-disabled border-2",
                                      pointingType === POINTING_TYPE.BULK &&
                                        "border-primary-red-pink-normal-active",
                                    )}
                                    indicatorClassName="size-4 text-primary-pink fill-primary-pink"
                                  />
                                </div>
                                <div className="">
                                  <Image
                                    src="/images/bulk-point.webp"
                                    width={165}
                                    height={102}
                                    alt="Bulk Point"
                                    className="w-22.5"
                                  />
                                </div>
                                <div className="">
                                  <p className="font-aptos text-md font-bold leading-6 text-text-icons-base-main">
                                    {t("dataTraining.bulkPoint")}
                                  </p>
                                  <p className="font-aptos text-[13px] font-regular leading-4.5 text-text-icons-base-second">
                                    {t("dataTraining.bulkPointDescription")}
                                  </p>
                                </div>
                              </div>
                              {pointingType === "bulk" && (
                                <div className="ml-8 space-y-2">
                                  <p className="font-aptos text-[15px] font-regular leading-4.5">
                                    {t("dataTraining.selectLULCClass")}
                                  </p>
                                  <Select
                                    value={selectedClass}
                                    onValueChange={setSelectedClass}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue
                                        placeholder={t(
                                          "dataTraining.selectLULCClassPlaceholder",
                                        )}
                                      />
                                    </SelectTrigger>
                                    <SelectContent position="item-aligned">
                                      {classArray.map((item) => (
                                        <SelectItem
                                          key={`key-${item.class_id}`}
                                          value={String(item.class_id)}
                                          // disabled={item.disabled}
                                        >
                                          {item.class_name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>
                          </Label>
                          <Button
                            disabled={isNextDisabled}
                            variant={"primary"}
                            className="text-[16px]"
                            onClick={() => {
                              onClickStartPointing();
                            }}
                          >
                            {t("dataTraining.startPointing")}
                          </Button>
                        </RadioGroup>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
        <Accordion type="single" collapsible>
          <AccordionItem
            value={"lulc-table"}
            className="rounded-xl border border-neutral-400  bg-white pb-3 last:border-b"
          >
            <AccordionFullTrigger
              icon={
                <ChevronDown className="h-5 w-5 shrink-0 text-primary-pink transition-transform duration-200" />
              }
              className="hover:no-underline p-3 pb-0"
            >
              <p className="font-noto-sans text-xl font-semibold leading-7 tracking-[-0.2px] text-primary-pink">
                {t("dataTraining.recordedLULC")}
              </p>
            </AccordionFullTrigger>
            <AccordionContent className="mt-2 space-y-6 px-3 pb-0">
              <p className="text-text-icons-base-second font-aptos text-[13px] font-regular leading-4.5">
                {selectedCustom
                  ? t("dataTraining.recordedLULCDescriptionOWNCLASS")
                  : selectedDefault
                    ? t("dataTraining.recordedLULCDescriptionDEFAULTCLASS")
                    : "error"}
              </p>
              <LUCClassTable summary={false} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
};

export const DataTrainingFooter = () => {
  const {
    setStepKey,
    setProgressPanelIndex,
    isUploadingTrainingFile,
    isUpdatingTrainingData,
    setIsUpdatingTrainingData,
    LUCfile,
    classArray,
    isTrainingDataChanged,
    setIsTrainingDataChanged,
  } = useContext(MapGenerationContext);

  const { sessionId } = useContext(GlobalContext);

  const { markerVectorLayer, markerArray } = useContext(MapContext);

  const t = useTranslations("InteractivePanel");

  const selectedCustom = LUCfile !== null;

  const isNextDisabled =
    isUploadingTrainingFile ||
    isUpdatingTrainingData ||
    (selectedCustom && classArray.length === 0);

  const isBackDisabled = isUploadingTrainingFile || isUpdatingTrainingData;

  const updateLULC = () => {
    setIsUpdatingTrainingData(true);
    fetch(TRAINING_DATA_UPDATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        training_data: markerArray.map((item) => ({
          class_id: item?.class_id,
          geometry: {
            type: "Point",
            // coordinates: [item?.coordinates[0], item?.coordinates[1]],
            coordinates: toLonLat(item?.coordinates),
          },
        })),
      }),
    })
      .then(async (response) => {
        setStepKey(PANEL_COMPONENT_KEY.LULC_PARAMS);
        markerVectorLayer?.setOpacity(0);
        setProgressPanelIndex(3);
        setIsTrainingDataChanged(false);
      })
      .catch((e) => {
        toast.error(`Error on submitting request: ${e}`, {
          duration: Infinity,
          dismissible: true,
          closeButton: true,
        });
      })
      .finally(() => {
        setIsUpdatingTrainingData(false);
      });
  };

  const onClickNext = () => {
    // console.log("istraining chaned", isTrainingDataChanged);
    // return;
    if (!isTrainingDataChanged) {
      setStepKey(PANEL_COMPONENT_KEY.LULC_PARAMS);
      markerVectorLayer?.setOpacity(0);
      setProgressPanelIndex(3);
      return;
    }

    if (selectedCustom) {
      updateLULC();
      return;
    }

    setStepKey(PANEL_COMPONENT_KEY.LULC_PARAMS);
    markerVectorLayer?.setOpacity(0);
    setProgressPanelIndex(3);
    setIsTrainingDataChanged(false);
    return;
  };

  const onClickBack = () => {
    setProgressPanelIndex(1);
    markerVectorLayer?.setOpacity(0);
    setStepKey(PANEL_COMPONENT_KEY.DEFINE_LUC);
  };

  return (
    <div className="p-3 pt-4 gap-x-4 flex flex-row">
      <Button
        disabled={isBackDisabled}
        onClick={() => {
          onClickBack();
        }}
        variant={"outline"}
        size={"icon"}
      >
        <ChevronLeft className="text-primary-pink size-4" />
      </Button>
      <div className="grid grid-cols-2 gap-x-4 w-full">
        <div></div>
        <Button
          onClick={() => {
            onClickNext();
          }}
          disabled={isNextDisabled}
          variant="primary"
          className=""
        >
          {!isUpdatingTrainingData && t("common.next")}
          {isUpdatingTrainingData && (
            <div className="w-full h-10 flex flex-row justify-center items-center">
              <span className="loader sm"></span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};
