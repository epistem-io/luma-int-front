"use client";

import { ComingSoon } from "@/components/ComingSoon";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { cn, shortenKiloByte } from "@/lib/utils";
import {
  AlertCircleIcon,
  ChevronDown,
  FileTextIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { ChangeEvent, useContext, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import {
  DEFAULT_LUC,
  LUC_TEMPLATE_FILE_SIZE_LIMIT,
  LUC_TEMPLATE_FILENAME,
  LUC_UPDATE_URL,
  LUC_UPLOAD_URL,
  PANEL_COMPONENT_KEY,
} from "@/constants";
import { Label } from "@/components/ui/label";
import { GlobalContext } from "@/contexts/globalContext";
import { toast } from "sonner";

// const TreeBorderContainer = ({ children }: { children: React.ReactNode }) => {
//   return (
//     <div className="flex flex-row border-l pt-4  gap-x-[5px]">
//       <TreeBorder />
//       {children}
//     </div>
//   );
// };

// const TreeBorder = () => {
//   return (
//     <div className="grid grid-rows-2 w-[20px]">
//       <div className="border-b"></div>
//       <div className=""></div>
//     </div>
//   );
// };

export const DefineLUCComponent = () => {
  const t = useTranslations("AnalysisPanel");

  const {
    defaultArray,
    LUCfile,
    LUCfilename,
    LUCfilesize,
    setDefaultArray,
    setLUCFile,
    setLUCFilename,
    setLUCFilesize,
  } = useContext(MapGenerationContext);

  const [aiAccordionOpen, setAIAccordionOpen] = useState(false);
  const [fileEnter, setFileEnter] = useState(false);
  const [haveDownloadedFile, setHaveDownloadedFile] = useState(false);

  const onClickDownloadFile = () => {
    const link = document.createElement("a");
    link.href = "/csvs/" + LUC_TEMPLATE_FILENAME;
    // Set the download attribute with the desired filename
    link.download = LUC_TEMPLATE_FILENAME;

    // Append link to body, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setHaveDownloadedFile(true);
  };

  const onToggleSwitch = (num: number, checked: boolean) => {
    if (!checked) {
      setDefaultArray(defaultArray.filter((item) => item !== num));
      return;
    }
    // if (defaultArray.includes(num)) {
    //   setDefaultArray(defaultArray.filter((item) => item !== num));
    //   return;
    // }

    setDefaultArray([...defaultArray, num]);
  };

  const clearFile = () => {
    setLUCFile(null);
    setLUCFilename("");
    setLUCFilesize(0);

    const doc = document.getElementById(
      "luc-template-file-upload",
    ) as HTMLInputElement;
    if (!doc) return;

    doc.value = "";
  };

  const onResetInput = () => {
    setDefaultArray([]);
    setHaveDownloadedFile(false);

    clearFile();
  };

  const onUploadFile = (
    e: ChangeEvent<HTMLInputElement>,
    // cb: () => void,
  ) => {
    const target = e.target;
    const files = target?.files;

    console.log("fffiless", files);

    if (!files) return;

    const file = files[0];

    console.log("fffile", file);

    setLUCFile(file);
    setLUCFilename(file.name);
    setLUCFilesize(file.size);
    // const blobUrl = URL.createObjectURL(file);
    // setAreaScopingPolygonUrl(file);
    // setAreaScopingPolygonFileSize(file.size);
    // setAreaScopingPolygonFileName(file.name);
  };

  const submitFile = () => {};

  const selectedDefault = defaultArray.length > 0;
  const selectedCustom = LUCfile !== null;

  return (
    <div className="space-y-4">
      <Collapsible open={aiAccordionOpen} onOpenChange={setAIAccordionOpen}>
        <div
          className="bg-aneh p-px rounded-[13px]"
          style={{
            boxShadow:
              "0 4px 4px 0 rgba(243, 235, 126, 0.25), 0 2px 8px 0 rgba(249, 245, 195, 0.29)",
          }}
        >
          <div className="bg-white p-3 h-fit rounded-[12px]">
            <CollapsibleTrigger className="flex flex-row justify-between items-center w-full mb-3">
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
                  aiAccordionOpen ? "rotate-180" : "",
                )}
              />
            </CollapsibleTrigger>
            <div className="rounded-sm bg-background-disableds p-2">
              <ComingSoon />

              {!aiAccordionOpen && (
                <p className="font-aptos text-[15px] font-regular leading-5.5 text-neutrals-600 italic mt-3">
                  Unsure which land cover classes to choose? Let EPISTEM-AI
                  suggest the most suitable configuration
                </p>
              )}

              <CollapsibleContent className="collapsible-content-primitive mt-2">
                <div className="space-y-2">
                  <div>
                    <p className="text-m-medium italic">
                      {t("Section3.tryAICaption")}{" "}
                      <b className="font-extrabold">
                        {t("Section3.tryAICaptionCont")}
                      </b>
                    </p>
                  </div>
                  <div>
                    <Textarea
                      className="m-0"
                      defaultValue={t("Section3.tryAICaptionDefaultValue")}
                      disabled
                    />
                  </div>
                  <div className="flex flex-row justify-between items-center space-y-2">
                    <p className="text-xs-regular text-neutrals-600 m-0">
                      {t("Section3.tryAICaptionInstruction")}
                    </p>
                    <Button
                      type="button"
                      variant={"primary"}
                      disabled
                      // className="rounded-none bg-primary-pink py-1.5 px-2"
                    >
                      <p className="">
                        {t("Section3.tryAICaptionSubmitButtonLabel")}
                      </p>
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </div>
        </div>
      </Collapsible>
      <div className="rounded-[12px] bg-white p-3 border border-neutral-400 space-y-6">
        <div className="space-y-3">
          <p className="font-aptos text-xl font-bold leading-6 text-text-icons-base-main">
            Land Use/Cover Hierarchy
          </p>
          <p className="font-aptos text-md font-regular leading-6 text-neutral-700-baru">
            Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem
            IpsumLorem Ipsum Lorem Ipsum Lorem Ipsum
          </p>
        </div>
        {/* <div className="space-y-3"> */}
        <Tabs defaultValue="custom" className="gap-y-6 mb-0">
          <div className="px-1.5">
            <TabsList className="w-full">
              <TabsTrigger disabled={selectedDefault} value="custom">
                Classify your own template
              </TabsTrigger>
              <TabsTrigger disabled={selectedCustom} value="default">
                Use Default Scheme
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="custom">
            <div className="space-y-6">
              <p className="font-aptos text-md font-regular leading-6 text-neutral-700-baru">
                Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
                Lorem IpsumLorem Ipsum Lorem Ipsum Lorem Ipsum
              </p>
              {haveDownloadedFile && (
                <>
                  {LUCfile && (
                    <>
                      {LUCfilesize <= LUC_TEMPLATE_FILE_SIZE_LIMIT && (
                        <div className="px-3 py-3 rounded-[12px] border-2 border-dashed border-secondary-purple-light-active flex flex-row justify-between gap-x-4 items-center bg-purple-second">
                          <div className="flex flex-row gap-x-4 items-center">
                            <div className="rounded-[12px] bg-secondary-purple-light-hover aspect-square size-18 flex justify-center items-center">
                              <FileTextIcon className="text-secondary-purple-dark size-12 aspect-square" />
                            </div>
                            <div className="">
                              <p className="font-aptos text-lg font-bold leading-7 text-secondary-purple-dark line-clamp-1 text-ellipsis">
                                {LUCfilename}
                              </p>
                              <p className="font-aptos text-sm font-regular leading-5 text-secondary-purple-dark">
                                {shortenKiloByte(LUCfilesize)}
                              </p>
                            </div>
                          </div>

                          <div className="">
                            <Button
                              variant={"ghost"}
                              className="hover:brightness-95 cursor-pointer size-7 rounded-full"
                              onClick={() => {
                                clearFile();
                              }}
                            >
                              <Trash2Icon className="text-secondary-purple-dark size-5" />
                            </Button>
                          </div>
                        </div>
                      )}
                      {LUCfilesize > LUC_TEMPLATE_FILE_SIZE_LIMIT && (
                        <>
                          <div className="px-3 py-3 rounded-[12px] border-2 border-dashed border-danger-200 flex flex-row justify-between gap-x-4 items-center bg-danger-50">
                            <div className="flex flex-row gap-x-4 items-center">
                              <div className="rounded-[12px] bg-danger-100 aspect-square size-18 flex justify-center items-center">
                                <FileTextIcon className="text-danger-700 size-12 aspect-square" />
                              </div>
                              <div className="">
                                <p className="font-aptos text-lg font-bold leading-7 text-danger-600 line-clamp-1 text-ellipsis">
                                  {LUCfilename}
                                </p>
                                <p className="font-aptos text-sm font-regular leading-5 text-danger-600">
                                  {shortenKiloByte(LUCfilesize)}
                                </p>
                              </div>
                            </div>
                            <div className="">
                              <Button
                                variant={"ghost"}
                                className="hover:brightness-95 cursor-pointer size-7 rounded-full"
                                onClick={() => {
                                  clearFile();
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
                                  File exceeds 500MB. Please select another file
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
                    </>
                  )}
                  {!LUCfile && (
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
                                console.log("fileee", file);

                                setLUCFile(file);
                                setLUCFilename(file.name);
                                setLUCFilesize(file.size);
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
                              Accepted format .csv, .xls, .xlsx
                            </p>
                          </div>
                          <Label
                            htmlFor="luc-template-file-upload"
                            className="w-50 mx-auto flex flex-row justify-center mb-0"
                          >
                            <div className="rounded-[12px] bg-primary-pink-hover hover:bg-primary-pink-hover hover:brightness-95 cursor-pointer w-full py-1.5 px-2 transition-all duration-200">
                              <p className="font-aptos text-[13px] font-semibold leading-4.5 text-primary-red-pink-normal text-center">
                                Browse File
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
                              Drop here
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
              {!haveDownloadedFile && (
                <>
                  <Button
                    variant={"secondary"}
                    className="w-full py-1.5 px-2 text-[13px] font-semibold leading-4.5"
                    onClick={() => {
                      // setHaveDownloadedFile(true);
                      onClickDownloadFile();
                    }}
                  >
                    Download File
                  </Button>
                </>
              )}
            </div>
          </TabsContent>
          <TabsContent value="default">
            <div className="space-y-6">
              <p className="font-aptos text-md font-regular leading-6 text-neutral-700-baru">
                Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
                Lorem IpsumLorem Ipsum Lorem Ipsum Lorem Ipsum
              </p>
              <div className="space-y-5">
                <Accordion type="multiple">
                  <AccordionItem value="vegetation-acc">
                    <div className="flex flex-row items-center justify-between">
                      <div className="flex flex-row items-center space-x-2.5">
                        {/* <Switch /> */}
                        <p className="text-l-semibold text-muted-foreground">
                          {t("Section3.vegetation")}
                        </p>
                      </div>
                      <AccordionTrigger className="p-2"></AccordionTrigger>
                    </div>
                    <AccordionContent className="pl-[25px] mt-0 pb-0 pt-4 space-y-5">
                      <Accordion type="multiple">
                        <AccordionItem value="tree-based-system-acc">
                          <div className="flex flex-row items-center justify-between">
                            <div className="flex flex-row items-center space-x-2.5">
                              {/* <Switch /> */}
                              <p className="text-l-medium text-muted-foreground">
                                {t("Section3.TBS")}
                              </p>
                            </div>
                            <AccordionTrigger className="p-2"></AccordionTrigger>
                          </div>
                          <AccordionContent className="pl-[25px] mt-0 pb-0 pt-4 space-y-5">
                            <div className="flex flex-row items-center space-x-2.5">
                              <Switch
                                onCheckedChange={(checked) => {
                                  onToggleSwitch(7, checked);
                                }}
                                checked={defaultArray.includes(7)}
                              />
                              <p className="text-l-medium text-muted-foreground">
                                {t("Section3.agroforestry")}
                              </p>
                            </div>
                            {/* <div className="flex flex-row items-center space-x-2.5">
                              <Switch
                                onCheckedChange={(checked) => {
                                  onToggleSwitch(9, checked);
                                }}
                                checked={defaultArray.includes(9)}
                              />
                              <p className="text-l-medium text-muted-foreground">
                                {t("Section3.monoculturePlantation")}
                              </p>
                            </div> */}

                            <Accordion type="multiple">
                              <AccordionItem value="tree-based-system-acc">
                                <div className="flex flex-row items-center justify-between">
                                  <div className="flex flex-row items-center space-x-2.5">
                                    {/* <Switch /> */}
                                    <p className="text-l-medium text-muted-foreground">
                                      Monoculture Plantation
                                      {/* {t("Section3.TBS")} */}
                                    </p>
                                  </div>
                                  <AccordionTrigger className="p-2"></AccordionTrigger>
                                </div>
                                <AccordionContent className="pl-[25px] mt-0 pb-0 pt-4 space-y-5">
                                  <div className="flex flex-row items-center space-x-2.5">
                                    <Switch
                                      onCheckedChange={(checked) => {
                                        onToggleSwitch(8, checked);
                                      }}
                                      checked={defaultArray.includes(8)}
                                    />
                                    <p className="text-l-medium text-muted-foreground">
                                      Tree Plantation
                                    </p>
                                  </div>
                                  <div className="flex flex-row items-center space-x-2.5">
                                    <Switch
                                      onCheckedChange={(checked) => {
                                        onToggleSwitch(9, checked);
                                      }}
                                      checked={defaultArray.includes(9)}
                                    />
                                    <p className="text-l-medium text-muted-foreground">
                                      Rubber Monoculture
                                    </p>
                                  </div>
                                  <div className="flex flex-row items-center space-x-2.5">
                                    <Switch
                                      onCheckedChange={(checked) => {
                                        onToggleSwitch(10, checked);
                                      }}
                                      checked={defaultArray.includes(10)}
                                    />
                                    <p className="text-l-medium text-muted-foreground">
                                      Oil Palm Monoculture
                                    </p>
                                  </div>
                                  <div className="flex flex-row items-center space-x-2.5">
                                    <Switch
                                      onCheckedChange={(checked) => {
                                        onToggleSwitch(11, checked);
                                      }}
                                      checked={defaultArray.includes(11)}
                                    />
                                    <p className="text-l-medium text-muted-foreground">
                                      Other Monoculture
                                    </p>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>

                            <Accordion type="multiple">
                              <AccordionItem value="tree-based-system-acc">
                                <div className="flex flex-row items-center justify-between">
                                  <div className="flex flex-row items-center space-x-2.5">
                                    {/* <Switch /> */}
                                    <p className="text-l-medium text-muted-foreground">
                                      Natural Forest
                                      {/* {t("Section3.TBS")} */}
                                    </p>
                                  </div>
                                  <AccordionTrigger className="p-2"></AccordionTrigger>
                                </div>
                                <AccordionContent className="pl-[25px] mt-0 pb-0 pt-4 space-y-5">
                                  <div className="flex flex-row items-center space-x-2.5">
                                    <Switch
                                      onCheckedChange={(checked) => {
                                        onToggleSwitch(1, checked);
                                      }}
                                      checked={defaultArray.includes(1)}
                                    />
                                    <p className="text-l-medium text-muted-foreground">
                                      Undisturbed Dryland Forest
                                    </p>
                                  </div>
                                  <div className="flex flex-row items-center space-x-2.5">
                                    <Switch
                                      onCheckedChange={(checked) => {
                                        onToggleSwitch(2, checked);
                                      }}
                                      checked={defaultArray.includes(2)}
                                    />
                                    <p className="text-l-medium text-muted-foreground">
                                      Logged-Over Dryland Forest
                                    </p>
                                  </div>
                                  <div className="flex flex-row items-center space-x-2.5">
                                    <Switch
                                      onCheckedChange={(checked) => {
                                        onToggleSwitch(3, checked);
                                      }}
                                      checked={defaultArray.includes(3)}
                                    />
                                    <p className="text-l-medium text-muted-foreground">
                                      Undisturbed Mangrove Forest
                                    </p>
                                  </div>
                                  <div className="flex flex-row items-center space-x-2.5">
                                    <Switch
                                      onCheckedChange={(checked) => {
                                        onToggleSwitch(4, checked);
                                      }}
                                      checked={defaultArray.includes(4)}
                                    />
                                    <p className="text-l-medium text-muted-foreground">
                                      Logged-Over Mangrove Forest
                                    </p>
                                  </div>
                                  <div className="flex flex-row items-center space-x-2.5">
                                    <Switch
                                      onCheckedChange={(checked) => {
                                        onToggleSwitch(5, checked);
                                      }}
                                      checked={defaultArray.includes(5)}
                                    />
                                    <p className="text-l-medium text-muted-foreground">
                                      Undisturbed Swamp Forest
                                    </p>
                                  </div>
                                  <div className="flex flex-row items-center space-x-2.5">
                                    <Switch
                                      onCheckedChange={(checked) => {
                                        onToggleSwitch(6, checked);
                                      }}
                                      checked={defaultArray.includes(6)}
                                    />
                                    <p className="text-l-medium text-muted-foreground">
                                      Logged-Over Swamp Forest
                                    </p>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                      <Accordion type="multiple">
                        <AccordionItem value="non-tree-based-system-acc">
                          <div className="flex flex-row items-center justify-between">
                            <div className="flex flex-row items-center space-x-2.5">
                              {/* <Switch /> */}
                              <p className="text-l-medium text-muted-foreground">
                                {t("Section3.nonTBS")}
                              </p>
                            </div>
                            <AccordionTrigger className="p-2"></AccordionTrigger>
                          </div>
                          <AccordionContent className="pl-[25px] mt-0 pb-0 pt-4 space-y-5">
                            <div className="flex flex-row items-center space-x-2.5">
                              <Switch
                                onCheckedChange={(checked) => {
                                  onToggleSwitch(12, checked);
                                }}
                                checked={defaultArray.includes(12)}
                              />
                              <p className="text-l-medium text-muted-foreground">
                                {t("Section3.grassSavanna")}
                              </p>
                            </div>
                            <div className="flex flex-row items-center space-x-2.5">
                              <Switch
                                onCheckedChange={(checked) => {
                                  onToggleSwitch(13, checked);
                                }}
                                checked={defaultArray.includes(13)}
                              />
                              <p className="text-l-medium text-muted-foreground">
                                {t("Section3.shrub")}
                              </p>
                            </div>
                            <div className="flex flex-row items-center space-x-2.5">
                              <Switch
                                onCheckedChange={(checked) => {
                                  onToggleSwitch(14, checked);
                                }}
                                checked={defaultArray.includes(14)}
                              />
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
                        {/* <Switch /> */}
                        <p className="text-l-semibold text-muted-foreground">
                          {t("Section3.nonVegetation")}
                        </p>
                      </div>
                      <AccordionTrigger className="p-2"></AccordionTrigger>
                    </div>
                    <AccordionContent className="pl-[25px] pt-5 space-y-5">
                      <div className="flex flex-row items-center space-x-2.5">
                        <Switch
                          onCheckedChange={(checked) => {
                            onToggleSwitch(15, checked);
                          }}
                          checked={defaultArray.includes(15)}
                        />
                        <p className="text-l-medium text-muted-foreground">
                          {t("Section3.settlement")}
                        </p>
                      </div>
                      <div className="flex flex-row items-center space-x-2.5">
                        <Switch
                          onCheckedChange={(checked) => {
                            onToggleSwitch(16, checked);
                          }}
                          checked={defaultArray.includes(16)}
                        />
                        <p className="text-l-medium text-muted-foreground">
                          {t("Section3.clearedLand")}
                        </p>
                      </div>
                      <div className="flex flex-row items-center space-x-2.5">
                        <Switch
                          onCheckedChange={(checked) => {
                            onToggleSwitch(17, checked);
                          }}
                          checked={defaultArray.includes(17)}
                        />
                        <p className="text-l-medium text-muted-foreground">
                          {t("Section3.water")}
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <input
          id="luc-template-file-upload"
          type="file"
          className="hidden"
          accept=".csv,.xls,.xlsx"
          multiple={false}
          onChange={onUploadFile}
        />
        {/* </div> */}
      </div>
      <Button
        variant={"ghost"}
        className="p-0 hover:bg-transparent cursor-pointer"
        onClick={() => {
          onResetInput();
        }}
      >
        <div className="">
          <p className="text-text-icons-base-third font-roboto text-[15px] font-bold tracking-[-0.15px] underline">
            Reset input
          </p>
        </div>
      </Button>
    </div>
  );
};

export const DefineLUCFooter = () => {
  const {
    temporalCoverage,
    temporalCoverageUnit,
    setStepKey,
    // isPreviewingMosaic,
    // setIsPreviewingMosaic,
    isBasicInformationChangeInput,
    setIsBasicInformationChangeInput,
    setProgressPanelIndex,
    defaultArray,
    LUCfile,
    LUCfilesize,
    isLUCLoading,
    setIsLUCLoading,
    setClassArray,
  } = useContext(MapGenerationContext);

  const { sessionId } = useContext(GlobalContext);

  const selectedDefault = defaultArray.length > 0;
  const selectedCustom = LUCfile !== null;

  const isNextDisabled =
    (!selectedCustom && !selectedDefault) ||
    isLUCLoading ||
    (selectedCustom && LUCfilesize > LUC_TEMPLATE_FILE_SIZE_LIMIT);

  const onClickNext = async () => {
    setIsLUCLoading(true);

    if (selectedCustom) {
      const body = new FormData();

      body.append("file", LUCfile);
      body.append("session_id", sessionId);

      fetch(LUC_UPLOAD_URL, {
        method: "POST",
        body,
      })
        .then(async (response) => {
          const json: LUCUploadRes = await response.json();

          if (!response.ok) {
            throw new Error(
              JSON.stringify(
                `${json?.error?.message || response.text}. Trace: ${json?.trace}`,
              ),
            );
          }

          const arr: LUCClass[] = json.classes.map((item) => ({
            class_id: item.class_id,
            class_name: item.class_name,
            class_color: item.class_color,
          }));

          setClassArray(arr);
          setProgressPanelIndex(2);

          setStepKey(PANEL_COMPONENT_KEY.DATA_TRAINING);
          // CONTINUE
        })
        .catch((e) => {
          toast.error(`Error on submitting file: ${e}`, {
            duration: Infinity,
            dismissible: true,
            closeButton: true,
          });
        })
        .finally(() => {
          setIsLUCLoading(false);
        });

      return;
    }

    const classes = defaultArray.map((item) =>
      DEFAULT_LUC.find((item2) => item2.id === item),
    );

    fetch(LUC_UPDATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        classes,
      }),
    })
      .then(async (response) => {
        const json: LUCUpdateRes = await response.json();

        if (!response.ok) {
          throw new Error(
            JSON.stringify(
              `${json?.error?.message || response.text}. Trace: ${json?.trace}`,
            ),
          );
        }

        const arr = classes.map((item) => ({
          class_id: item?.id || -1,
          class_name: item?.name || "",
          class_color: item?.color || "",
        }));

        setClassArray(arr);
        setProgressPanelIndex(2);
        setStepKey(PANEL_COMPONENT_KEY.DATA_TRAINING);
        // CONTINUE
      })
      .catch((e) => {
        toast.error(`Error on submitting request: ${e}`, {
          duration: Infinity,
          dismissible: true,
          closeButton: true,
        });
      })
      .finally(() => {
        setIsLUCLoading(false);
      });

    return;
  };

  return (
    <div className="grid grid-cols-2 p-3 pt-4 gap-x-4">
      <div></div>
      {isLUCLoading && (
        <div className="w-full h-10 flex flex-row justify-center">
          <span className="loader sm"></span>
        </div>
      )}
      {!isLUCLoading && (
        <Button
          onClick={() => {
            // setStepKey(PANEL_COMPONENT_KEY.DEFINE_LUC);
            // setProgressPanelIndex(2);
            onClickNext();
          }}
          disabled={isNextDisabled}
          variant="primary"
          className=""
        >
          Next
        </Button>
      )}
    </div>
  );
};
