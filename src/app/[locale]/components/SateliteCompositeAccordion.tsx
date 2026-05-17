import { ComingSoon } from "@/components/ComingSoon";
import {
  AccordionContent,
  AccordionFullTrigger,
  AccordionItem,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  BASIC_INFORMATION_ACCORDION_TYPE,
  SATELLITE_OPTIONS_ARRAY,
} from "@/constants";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useContext, useEffect, useState } from "react";

export const SateliteCompositeAccordion = () => {
  const {
    isEditingSatelliteComposite,
    setIsEditingSatelliteComposite,
    satelliteSource,
    setSatelliteSource,
    maximumCloudCover,
    setMaximumCloudCover,
  } = useContext(MapGenerationContext);

  const t = useTranslations("InteractivePanel");

  const isFormDisabled = !isEditingSatelliteComposite;
  const [selectedSatellite, setSelectedSatellite] = useState(satelliteSource);
  const [cloudCoverage, setCloudCoverage] = useState(maximumCloudCover);
  const [isSliding, setIsSliding] = useState(false);
  const isSubmitDisabled = !selectedSatellite || isFormDisabled;

  const sliderPosition = `${cloudCoverage}%`;
  const isAtMin = cloudCoverage <= 0;
  const isAtMax = cloudCoverage >= 100;
  const tooltipPositionClassName = isAtMin
    ? "translate-x-0"
    : isAtMax
      ? "-translate-x-full"
      : "-translate-x-1/2";

  const onSaveSatelliteComposite = () => {
    setSatelliteSource(selectedSatellite);
    setMaximumCloudCover(cloudCoverage);
    setIsEditingSatelliteComposite(false);
  };

  useEffect(() => {
    setSelectedSatellite(satelliteSource);
    setCloudCoverage(maximumCloudCover);
  }, [satelliteSource, maximumCloudCover, isEditingSatelliteComposite]);

  return (
    <AccordionItem
      value={BASIC_INFORMATION_ACCORDION_TYPE.COMPOSITE}
      className="rounded-xl border border-neutral-400 bg-white pb-3 last:border-b "
    >
      <AccordionFullTrigger
        icon={
          <ChevronDown className="h-5 w-5 shrink-0 text-primary-pink transition-transform duration-200" />
        }
        className="hover:no-underline p-3 pb-0"
      >
        <p className="font-noto-sans text-xl font-semibold leading-7 tracking-[-0.2px] text-primary-pink">
          {t("satelliteComposite.satelliteComposite")}
        </p>
      </AccordionFullTrigger>
      <AccordionContent className="mt-5 space-y-6 px-3 pb-0">
        <div className="p-0 rounded-sm bg-white mt-3 space-y-6">
          <Field className="space-y-2">
            <Label className="m-0">
              <p className="font-aptos text-sm font-regular leading-5 text-text-icons-base-main ">
                {t("satelliteComposite.satellite")}
              </p>
            </Label>
            <Select
              disabled={isFormDisabled}
              value={selectedSatellite}
              onValueChange={setSelectedSatellite}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue
                  placeholder={t(
                    "satelliteComposite.selectSatellitePlaceholder",
                  )}
                />
              </SelectTrigger>
              <SelectContent position="item-aligned">
                {SATELLITE_OPTIONS_ARRAY.map((satellite) => (
                  <SelectItem
                    key={satellite.value}
                    value={satellite.value}
                    className="capitalize"
                  >
                    {satellite.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field className="space-y-2.5">
            <Label className="m-0">
              <p className="font-aptos text-sm font-regular leading-5 text-text-icons-base-main ">
                {t("satelliteComposite.cloudCoverage")}
              </p>
            </Label>
            <div className="relative mt-1 px-0">
              {isSliding && (
                <div
                  className={`pointer-events-none absolute -top-9 z-10 rounded-md bg-primary px-2 py-1 font-aptos text-xs font-bold leading-4 text-white shadow-sm ${tooltipPositionClassName}`}
                  style={{ left: sliderPosition }}
                >
                  {cloudCoverage}%
                </div>
              )}
              <Slider
                step={10}
                value={[cloudCoverage]}
                min={0}
                max={100}
                trackBgColor="bg-neutral-300"
                disabled={isFormDisabled}
                onValueChange={(value) => {
                  setCloudCoverage(value[0] ?? 0);
                  setIsSliding(true);
                }}
                onValueCommit={() => setIsSliding(false)}
                onPointerDown={() => setIsSliding(true)}
                onPointerUp={() => setIsSliding(false)}
                onPointerLeave={() => setIsSliding(false)}
              />
            </div>
            {/* <div className="grid grid-cols-10"></div> */}
            <div className="flex flex-row justify-between">
              <div className="">
                <p className="font-aptos text-sm font-bold leading-5 text-primary-pink text-center">
                  0
                </p>
              </div>
              <div className="">
                <p className="font-aptos text-sm font-bold leading-5 text-primary-pink text-center">
                  10
                </p>
              </div>
              <div className="">
                <p className="font-aptos text-sm font-bold leading-5 text-primary-pink text-center">
                  20
                </p>
              </div>
              <div className="">
                <p className="font-aptos text-sm font-bold leading-5 text-primary-pink text-center">
                  30
                </p>
              </div>
              <div className="">
                <p className="font-aptos text-sm font-bold leading-5 text-primary-pink text-center">
                  40
                </p>
              </div>
              <div className="">
                <p className="font-aptos text-sm font-bold leading-5 text-primary-pink text-center">
                  50
                </p>
              </div>
              <div className="">
                <p className="font-aptos text-sm font-bold leading-5 text-primary-pink text-center">
                  60
                </p>
              </div>
              <div className="">
                <p className="font-aptos text-sm font-bold leading-5 text-primary-pink text-center">
                  70
                </p>
              </div>
              <div className="">
                <p className="font-aptos text-sm font-bold leading-5 text-primary-pink text-center">
                  80
                </p>
              </div>
              <div className="">
                <p className="font-aptos text-sm font-bold leading-5 text-primary-pink text-center">
                  90
                </p>
              </div>
              <div className="">
                <p className="font-aptos text-sm font-bold leading-5 text-primary-pink text-center">
                  100
                </p>
              </div>
            </div>
          </Field>
          <Button
            type="button"
            disabled={isSubmitDisabled}
            variant={"primary"}
            className="mt-2"
            onClick={onSaveSatelliteComposite}
          >
            {t("satelliteComposite.setSatelliteComposite")}
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
