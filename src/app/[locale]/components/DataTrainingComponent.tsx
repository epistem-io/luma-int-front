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
import { cn, shortenKiloByte } from "@/lib/utils";
import { fromLonLat } from "ol/proj";

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
  PANEL_COMPONENT_KEY,
  POINTING_TYPE,
  TRAINING_DATA_UPLOAD_URL,
} from "@/constants";
import {
  AlertCircleIcon,
  FileTextIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import { toast } from "sonner";
import { MapContext } from "@/contexts/mapContext";

export const DataTrainingComponent = () => {
  const { sessionId } = useContext(GlobalContext);

  const { setMarkerArray, markerArray, renderArrayToMarkerVector } =
    useContext(MapContext);

  const {
    classArray,
    pointingType,
    selectedClass,
    setSelectedClass,
    setPointingType,
    setStepKey,
    isUploadingTrainingFile,
    setIsUploadingTrainingFile,
  } = useContext(MapGenerationContext);

  const [fileEnter, setFileEnter] = useState(false);

  const [trainingFile, setTrainingFile] = useState<File | null>(null);
  const [trainingFilename, setTrainingFilename] = useState<string>("");
  const [trainingFilesize, setTrainingFilesize] = useState<number>(0);

  const [trainingFileError, setTrainingFileError] = useState<string>("");

  // const [isUploadingTrainingFile, setIsUploadingTrainingFile] = useState(false);

  const [uploadedFilesArray, setUploadedFilesArray] = useState<
    FileTrainingObject[]
  >([]);

  // useEffect(() => {
  //   console.log("upll", uploadedFilesArray);
  // }, [uploadedFilesArray]);

  const onClickStartPointing = () => {
    setStepKey(PANEL_COMPONENT_KEY.OSS);
  };

  const submitFile = (fileObj: FileObject) => {
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
          })),
        ];

        setMarkerArray(tempMarkerArray);

        renderArrayToMarkerVector(tempMarkerArray);

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

  return (
    <>
      <div className="">
        <div className="rounded-[12px] bg-white p-3 py-5 border border-neutral-400 space-y-6">
          <Tabs defaultValue="upload" className="gap-y-3 mb-0">
            <div className="px-1.5">
              <TabsList className="w-full">
                <TabsTrigger value="upload">
                  Upload Data Training File
                </TabsTrigger>
                <TabsTrigger value="oss">On Screen Sampling</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="upload">
              <div className="space-y-6">
                <p className="font-aptos text-md font-regular leading-6 text-neutral-700">
                  Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
                  Lorem IpsumLorem Ipsum Lorem Ipsum Lorem Ipsum
                </p>
                <div className="space-y-6">
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
                            Drag & drop your file here to upload. <br />
                            Accepted format .zip
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
                              Browse File
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
                            Drop here
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  {uploadedFilesArray.map((item, index) => {
                    return (
                      <div
                        key={`uploaded-file-${item.filename}-${index}`}
                        className="px-3 py-3 rounded-[12px] border-2 border-dashed border-secondary-purple-light-active flex flex-row justify-between gap-x-4 items-center bg-purple-second"
                      >
                        <div className="flex flex-row gap-x-4 items-center">
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

                        <div className="">
                          {/* {!isUploadingTrainingFile && (
                          )} */}
                          <Button
                            disabled={isUploadingTrainingFile}
                            variant={"ghost"}
                            className="hover:brightness-95 cursor-pointer size-7 rounded-full"
                            onClick={() => {
                              // setTrainingFile(null);
                              // setTrainingFilename("");
                              // setTrainingFilesize(0);
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
                          <div className="px-3 py-3 rounded-[12px] border-2 border-dashed border-secondary-purple-light-active flex flex-row justify-between gap-x-4 items-center bg-purple-second">
                            <div className="flex flex-row gap-x-4 items-center">
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

                            <div className="">
                              {isUploadingTrainingFile && (
                                <div className="">
                                  <div className="loader"></div>
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
                          <div className="px-3 py-3 rounded-[12px] border-2 border-dashed border-danger-200 flex flex-row justify-between gap-x-4 items-center bg-danger-50">
                            <div className="flex flex-row gap-x-4 items-center">
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
                            <div className="">
                              <Button
                                disabled={isUploadingTrainingFile}
                                variant={"ghost"}
                                className="hover:brightness-95 cursor-pointer size-7 rounded-full"
                                onClick={() => {
                                  setTrainingFile(null);
                                  setTrainingFilename("");
                                  setTrainingFilesize(0);
                                  setTrainingFileError("");
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
                                  Something wrong with the file
                                </p>
                                <p className="font-aptos text-sm font-regular leading-5 text-danger-50">
                                  {trainingFileError}
                                </p>
                              </div>
                            </div>
                            {/* <div className="">
                              <Button
                                variant={"ghost"}
                                className="hover:brightness-95 cursor-pointer size-7 rounded-full"
                                onClick={() => {
                                  setLUCFile(null);
                                  setLUCFilename("");
                                  setLUCFilesize(0);
                                }}
                              >
                                <Trash2Icon className="text-white size-5" />
                              </Button>
                            </div> */}
                          </div>
                        </>
                      )}
                      {trainingFilesize > DATA_TRAINING_FILE_SIZE_LIMIT &&
                        !trainingFileError && (
                          <>
                            <div className="px-3 py-3 rounded-[12px] border-2 border-dashed border-danger-200 flex flex-row justify-between gap-x-4 items-center bg-danger-50">
                              <div className="flex flex-row gap-x-4 items-center">
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
                              <div className="">
                                <Button
                                  disabled={isUploadingTrainingFile}
                                  variant={"ghost"}
                                  className="hover:brightness-95 cursor-pointer size-7 rounded-full"
                                  onClick={() => {
                                    setTrainingFile(null);
                                    setTrainingFilename("");
                                    setTrainingFilesize(0);
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
                                    The file is too big
                                  </p>
                                  <p className="font-aptos text-sm font-regular leading-5 text-danger-50">
                                    File exceeds 500MB. Please select another
                                    file
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
                  Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
                  Lorem IpsumLorem Ipsum Lorem Ipsum Lorem Ipsum
                </p>
                <div className="space-y-2">
                  <p className="text-text-icons-base-main font-aptos text-xl font-bold leading-6">
                    Recorded LULC Feature
                  </p>
                  <LUCClassTable />
                </div>
                <Tabs defaultValue="pinpoint" className="gap-y-3 mb-0">
                  <div className="px-0">
                    <TabsList className="w-full bg-transparent rounded-none border-0 p-0 gap-0">
                      <TabsTrigger
                        value="pinpoint"
                        className="font-aptos data-[state=active]:text-text-icons-base-main text-[15px] text-text-icons-base-third font-semibold leading-4.5 data-[state=active]:bg-transparent border-0 border-b-4 data-[state=active]:border-b-primary-pink rounded-none"
                      >
                        Pin Point
                      </TabsTrigger>
                      <TabsTrigger
                        disabled
                        value="draw"
                        className="font-aptos data-[state=active]:text-text-icons-base-main text-[15px] text-text-icons-base-third font-semibold leading-4.5 data-[state=active]:bg-transparent border-0 border-b-4 data-[state=active]:border-b-primary-pink border-b-text-icons-disabled rounded-none"
                      >
                        Draw Polygon
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="pinpoint">
                    <div className="mt-4 space-y-5.5">
                      <div className="">
                        <p className="text-text-icons-base-main font-aptos text-xl font-bold leading-6">
                          Pin Your Point
                        </p>
                        <p className="text-text-icons-base-second font-aptos text-[13px] font-regular leading-4.5">
                          Select a point on the map, and select LULC class
                          information, then click “Add Feature” to save it.
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
                                Single Point Input
                              </p>
                              <p className="font-aptos text-[13px] font-regular leading-4.5 text-text-icons-base-second">
                                You can add multiple points (up to 10 points) at
                                once and assign the same class to all selected
                                points.
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
                                  Bulk Point Input
                                </p>
                                <p className="font-aptos text-[13px] font-regular leading-4.5 text-text-icons-base-second">
                                  You can add multiple points (up to 10 points)
                                  at once and assign the same class to all
                                  selected points.
                                </p>
                              </div>
                            </div>
                            {pointingType === "bulk" && (
                              <div className="ml-8 space-y-2">
                                <p className="font-aptos text-[15px] font-regular leading-4.5">
                                  Select LULC Class
                                </p>
                                <Select
                                  value={selectedClass}
                                  onValueChange={setSelectedClass}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select LULC Class" />
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
                          Start Pointing
                        </Button>
                      </RadioGroup>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export const DataTrainingFooter = () => {
  const { setStepKey, setProgressPanelIndex, isUploadingTrainingFile } =
    useContext(MapGenerationContext);

  const { sessionId } = useContext(GlobalContext);

  const isNextDisabled = isUploadingTrainingFile;

  const onClickNext = () => {
    setStepKey(PANEL_COMPONENT_KEY.LULC_PARAMS);
    setProgressPanelIndex(3);
  };

  return (
    <div className="grid grid-cols-2 p-3 pt-4 gap-x-4">
      <div></div>
      <Button
        onClick={() => {
          onClickNext();
        }}
        disabled={isNextDisabled}
        variant="primary"
        className=""
      >
        Next
      </Button>
    </div>
  );
};
