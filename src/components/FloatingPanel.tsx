"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CircleAlert,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "./ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Textarea } from "./ui/textarea";

import {
  Accordion,
  AccordionContent,
  AccordionFullTrigger,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { Checkbox } from "./ui/checkbox";

interface FloatingPanelProps {
  children?: React.ReactNode;
  className?: string;
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="">
      <button
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

export function FloatingPanel({ className }: FloatingPanelProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)]">
      {/* Panel */}
      <div
        className={cn(
          "h-full bg-background shadow-lg transition-all duration-300 ease-in-out overflow-hidden",
          isExpanded ? "w-[455px]" : "w-0",
          className,
        )}
      >
        <div className="h-full overflow-hidden relative">
          <div
            className={cn(
              "w-[455px] h-[64px] bg-[#F6F6F6] sticky top-0 z-40",
              isExpanded ? "opacity-100" : "opacity-0",
            )}
          >
            <p className="py-[18px] px-5 headline-xxs-desktop-bold text-text-icons-base-main">
              Land Use/Cover Area Analysis
            </p>
          </div>
          <div
            className={cn(
              "h-full w-[455px] overflow-y-scroll pt-0 transition-opacity duration-300 relative",
              isExpanded ? "opacity-100" : "opacity-0",
            )}
          >
            <div className="bg-white z-30 mb-32">
              <CollapsibleSection title="Scope Your Area" defaultOpen={true}>
                <div className="space-y-5">
                  <div className="grid grid-cols-2 space-x-4">
                    <button className="border border-primary-pink p-4 hover:brightness-95 hover:cursor-pointer bg-white transition-all duration-300">
                      <Image
                        src="/images/polygon-draw.svg"
                        alt="Draw"
                        width={29.33}
                        height={25}
                        className="object-contain h-6 w-auto"
                      />
                      <p className="text-l-bold text-text-icons-base-main mt-3 text-left">
                        Draw Polygon
                      </p>
                      <p className="text-xs-regular text-neutral-700 mt-2 text-left">
                        Draw the area by forming a polygon based on the desired
                        point on map
                      </p>
                    </button>
                    <button className="border border-primary-pink p-4 hover:brightness-95 hover:cursor-pointer bg-white transition-all duration-300">
                      <Image
                        src="/images/upload.svg"
                        alt="Upload"
                        width={24}
                        height={24}
                        className="object-contain h-6 w-auto"
                      />
                      <p className="text-l-bold text-text-icons-base-main mt-3 text-left">
                        Upload SHP
                      </p>
                      <p className="text-xs-regular text-neutral-700 mt-2 text-left">
                        Upload a previously owned SHP format file for specific
                        geofencing areas
                      </p>
                    </button>
                  </div>
                  <div className="space-y-4">
                    <p className="bold-body-400 text-[#002F3D]">
                      Spatial Resolution:
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
                                30 x 30 m2
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
                                100 x 100 m2
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
                                500 x 500 m2
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
                                1 x 1 km2
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Select Time Period ">
                <div className="space-y-5 border border-neutral-400 p-3">
                  <p className="text-l-bold text-text-icons-base-main">
                    Temporal Coverage
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="time-period" className="">
                      <p className="text-m-medium text-neutral-900">
                        What time period would you like to be shown on the land
                        use and land cover (LULC) map?
                      </p>
                    </Label>
                    <Select disabled>
                      <SelectTrigger
                        id="time-period"
                        className="w-full rounded-none border-neutral-400"
                      >
                        <SelectValue placeholder="Time Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time-period-month" className="">
                      <p className="text-m-medium text-neutral-900">Select</p>
                    </Label>
                    <div className="grid grid-cols-2 space-x-2">
                      <div>
                        <Select disabled>
                          <SelectTrigger
                            id="time-period-month"
                            className="w-full rounded-none border-neutral-400"
                          >
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Select disabled>
                          <SelectTrigger
                            id="time-period-year"
                            className="w-full rounded-none border-neutral-400"
                          >
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <hr className="bg-neutral-600" />
                  <div className="flex flex-col">
                    <div className="py-2 px-4 bg-neutral-100">
                      <p className="text-l-bold text-text-icons-base-main">
                        Satellite Temporal Extent
                      </p>
                    </div>
                    <div className="pt-5 p-3 grid grid-cols-2 space-x-3 border border-t-0">
                      <div className="">
                        <Label>
                          <p className="text-m-semibold">Start Date</p>
                        </Label>
                        <div className="mt-2.5">
                          <Input
                            className="datepicker shadow-none border-0"
                            type="date"
                          />
                        </div>
                      </div>
                      <div className="">
                        <Label>
                          <p className="text-m-semibold">End Date</p>
                        </Label>
                        <div className="mt-2.5">
                          <Input
                            className="datepicker shadow-none border-0"
                            type="date"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Define Land Use/Cover Classes">
                <div className="space-y-5">
                  <Collapsible>
                    <div className="bg-aneh p-[1px] [box-shadow:0_4px_4px_0_rgba(243,_235,_126,_0.25),_0_2px_8px_0_rgba(249,_245,_195,_0.29)]">
                      <div className="bg-neutral-100 p-3 h-fit">
                        <CollapsibleTrigger className="flex flex-row justify-between items-center w-full">
                          <div className="flex flex-row space-x-2 items-center">
                            <div className="w-fit p-2 rounded-sm border border-primary-300">
                              <Image
                                src="/images/shimmer.svg"
                                alt="Draw"
                                width={16}
                                height={16}
                                className="object-contain h-4 w-auto text-primary-500"
                              />
                            </div>
                            <p className="text-l-bold">
                              Try EPISTEM-AI Recommendation
                            </p>
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
                              Please define the output you want to see on area.
                              It can be the condition, classification,
                              geographical of area, etc.
                              <br />
                              <b className="font-extrabold">
                                Let’s our AI process the most suitable LULC list
                                for you!
                              </b>
                            </p>
                            <Textarea disabled />
                            <div className="flex flex-row justify-between items-center">
                              <p className="text-xs-regular text-neutrals-600">
                                Max 500 charachter
                              </p>
                              <button className="rounded-none bg-primary-pink py-1.5 px-2">
                                <p className="text-xs-semibold text-text-icons-on-color">
                                  Go
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
                      Land Use/Cover Hierarchy
                    </p>
                    <div className="space-y-4">
                      <Accordion type="multiple">
                        <AccordionItem value="vegetation-acc">
                          <div className="flex flex-row items-center justify-between">
                            <div className="flex flex-row items-center space-x-2.5">
                              <Switch disabled />
                              <p className="text-l-semibold text-muted-foreground">
                                Vegetation
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
                                      Tree Based System
                                    </p>
                                  </div>
                                  <AccordionTrigger className="p-2"></AccordionTrigger>
                                </div>
                                <AccordionContent className="pl-[25px] mt-4 space-y-4">
                                  <div className="flex flex-row items-center space-x-2.5">
                                    <Switch disabled />
                                    <p className="text-l-medium text-muted-foreground">
                                      Agroforestry
                                    </p>
                                  </div>
                                  <div className="flex flex-row items-center space-x-2.5">
                                    <Switch disabled />
                                    <p className="text-l-medium text-muted-foreground">
                                      Monoculture Plantation
                                    </p>
                                  </div>
                                  <div className="flex flex-row items-center space-x-2.5">
                                    <Switch disabled />
                                    <p className="text-l-medium text-muted-foreground">
                                      Natural Forest
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
                                      Non-Tree Based System
                                    </p>
                                  </div>
                                  <AccordionTrigger className="p-2"></AccordionTrigger>
                                </div>
                                <AccordionContent className="pl-[25px] pt-5 space-y-4">
                                  <div className="flex flex-row items-center space-x-2.5">
                                    <Switch disabled />
                                    <p className="text-l-medium text-muted-foreground">
                                      Grass or Savanna
                                    </p>
                                  </div>
                                  <div className="flex flex-row items-center space-x-2.5">
                                    <Switch disabled />
                                    <p className="text-l-medium text-muted-foreground">
                                      Shrub
                                    </p>
                                  </div>
                                  <div className="flex flex-row items-center space-x-2.5">
                                    <Switch disabled />
                                    <p className="text-l-medium text-muted-foreground">
                                      Cropland
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
                                Non-Vegetation
                              </p>
                            </div>
                            <AccordionTrigger className="p-2"></AccordionTrigger>
                          </div>
                          <AccordionContent className="pl-[25px] pt-5 space-y-5">
                            <div className="flex flex-row items-center space-x-2.5">
                              <Switch disabled />
                              <p className="text-l-medium text-muted-foreground">
                                Settlement
                              </p>
                            </div>
                            <div className="flex flex-row items-center space-x-2.5">
                              <Switch disabled />
                              <p className="text-l-medium text-muted-foreground">
                                Cleared Land
                              </p>
                            </div>
                            <div className="flex flex-row items-center space-x-2.5">
                              <Switch disabled />
                              <p className="text-l-medium text-muted-foreground">
                                Waterbody
                              </p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Select LULC List Parameters">
                <Accordion type="multiple">
                  <div className="space-y-5">
                    <AccordionItem value="satelite-composite">
                      <div className="p-3 border border-neutral-400 bg-neutral-100">
                        <AccordionFullTrigger className=" hover:no-underline">
                          <p className="text-l-bold ">Satelite Composite</p>
                        </AccordionFullTrigger>
                        <AccordionContent className="space-y-5">
                          <div className="mt-5 space-y-2">
                            <Label htmlFor="satelite-select">
                              <p className="regular-caption-300">Satelite</p>
                            </Label>
                            <Select>
                              <SelectTrigger
                                id="satelite-select"
                                className="w-full rounded-sm border-neutral-400"
                              >
                                <SelectValue placeholder="Theme" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cloud-coverage">
                              <p className="regular-caption-300">
                                Cloud Coverage
                              </p>
                            </Label>
                            <div className="px-1">
                              <Slider
                                id="cloud-coverage"
                                defaultValue={[10]}
                                min={0}
                                max={30}
                                step={1}
                              />
                              <div className="flex flex-row justify-between mt-2">
                                <div className="">
                                  <p className="bold-caption-300 text-primary-500 text-center">
                                    0%
                                  </p>
                                </div>
                                <div className="">
                                  <p className="bold-caption-300 text-primary-500 text-center">
                                    5%
                                  </p>
                                </div>
                                <div className="">
                                  <p className="bold-caption-300 text-primary-500 text-center">
                                    10%
                                  </p>
                                </div>
                                <div className="">
                                  <p className="bold-caption-300 text-primary-500 text-center">
                                    15%
                                  </p>
                                </div>
                                <div className="">
                                  <p className="bold-caption-300 text-primary-500 text-center">
                                    20%
                                  </p>
                                </div>
                                <div className="">
                                  <p className="bold-caption-300 text-primary-500 text-center">
                                    25%
                                  </p>
                                </div>
                                <div className="">
                                  <p className="bold-caption-300 text-primary-500 text-center">
                                    30%
                                  </p>
                                </div>
                              </div>
                              <div className="mt-5 py-2 px-3 bg-semantics-error-100 border border-semantics-error-500 flex flex-row space-x-2">
                                <div className="mt-0.5">
                                  <CircleAlert
                                    className="h-5 w-5"
                                    color="rgba(255, 239, 237, 1)"
                                    fill="rgba(193, 17, 1, 1)"
                                  />
                                </div>
                                <div className="text-semantics-error-900">
                                  <p className="">
                                    <span className="text-l-semibold">
                                      Error:
                                    </span>
                                    <br />
                                    <span className="text-s-regular">
                                      The cloud coverage within this area is
                                      greater than 30%. Use other satellite or
                                      change the time range of analysis to fix.
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </div>
                    </AccordionItem>
                    <AccordionItem value="select-predictor">
                      <div className="p-3 border border-neutral-400 bg-neutral-100">
                        <AccordionFullTrigger className=" hover:no-underline">
                          <p className="text-l-bold ">Select Predictor</p>
                        </AccordionFullTrigger>
                        <AccordionContent className="pt-5 space-y-5">
                          <div className="space-y-2.5">
                            <div className="flex flex-row space-x-3">
                              <Checkbox disabled className="mt-0.5" />
                              <div className="space-y-1">
                                <p className="text-m-semibold text-neutrals-800">
                                  Elevation
                                </p>
                                <p className="text-xs-regular text-neutrals-600">
                                  Shuttle Radar Topography Mission (SRTM)
                                  elevation
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
                              Provide predictors by your own data
                            </p>
                            <div className="p-2 rounded-full border-neutral-600 border mx-auto w-fit">
                              <Upload className="text-text-icons-base-main h-5 w-5" />
                            </div>
                            <div className="text-center">
                              <p className="text-l-medium text-text-icons-base-main">
                                Drag and Drop or{" "}
                                <b className="text-primary-pink underline">
                                  choose your file
                                </b>{" "}
                                for upload
                              </p>
                              <p className="text-s-medium text-text-icons-light-base-second">
                                Supported Format file: SHP or KML
                              </p>
                            </div>
                          </div>
                        </AccordionContent>
                      </div>
                    </AccordionItem>
                    <AccordionItem value="random-forest">
                      <div className="p-3 border border-neutral-400 bg-neutral-100">
                        <AccordionFullTrigger className=" hover:no-underline">
                          <p className="text-l-bold ">
                            Classify The Random Forest Variable
                          </p>
                        </AccordionFullTrigger>
                        <AccordionContent className="pt-5">
                          <div className="grid grid-cols-2 space-x-5">
                            <div className="space-y-2">
                              <Label>
                                <p className="regular-caption-300 text-neutrals-900">
                                  Number of Trees
                                </p>
                              </Label>
                              <Input className="" disabled />
                              <p className="regular-caption-200 text-neutrals-600">
                                Fill with number, range 10-500
                              </p>
                            </div>
                            <div className="space-y-2">
                              <Label>
                                <p className="regular-caption-300 text-neutrals-900">
                                  Minimum Leaf Population
                                </p>
                              </Label>
                              <Input className="" disabled />
                              <p className="regular-caption-200 text-neutrals-600">
                                Fill with number, range 1-50
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
          </div>
        </div>
      </div>

      {/* Toggle Button - positioned relative to panel edge */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "absolute top-0.5 z-50 flex h-[62px] px-0.5 items-center justify-center rounded-r-md bg-[#EEEFF3] transition-all duration-300 ease-in-out hover:bg-accent cursor-pointer",
          isExpanded ? "left-[455px]" : "left-0",
        )}
        style={{
          boxShadow: "4px 0 12px -4px rgba(0, 0, 0, 0.12)",
        }}
      >
        {isExpanded ? (
          <ChevronLeft className="h-6 w-6" />
        ) : (
          <ChevronRight className="h-6 w-6" />
        )}
      </button>
    </div>
  );
}
