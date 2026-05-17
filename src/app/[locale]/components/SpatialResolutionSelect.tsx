import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTranslations } from "next-intl";
import { useContext } from "react";

const SPATIAL_RESOLUTION_OPTIONS = [
  {
    id: "spatial-resolution-item-1",
    value: "30",
    labelKey: "areaScoping.30x30m2",
  },
  {
    id: "spatial-resolution-item-3",
    value: "100",
    labelKey: "areaScoping.100x100m2",
  },
  {
    id: "spatial-resolution-item-2",
    value: "500",
    labelKey: "areaScoping.500x500m2",
  },
  {
    id: "spatial-resolution-item-4",
    value: "1000",
    labelKey: "areaScoping.1x1km2",
  },
] as const;

export const SpatialResolutionSelect = () => {
  const t = useTranslations("InteractivePanel");
  const { spatialResolution, setSpatialResolution } =
    useContext(MapGenerationContext);
  const isDisabled = false;
  return (
    <div className="p-0 rounded-xl space-y-2 bg-white">
      <div className="">
        <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
          {t("areaScoping.spatialResolution")}:
        </p>
        <p className="text-l-regular text-text-icons-base-third">
          {t("areaScoping.spatialResolutionSubtitle")}
        </p>
      </div>
      <div className="">
        <RadioGroup
          disabled={isDisabled}
          className="grid grid-cols-2 gap-x-12 gap-y-2"
          value={spatialResolution}
          onValueChange={setSpatialResolution}
        >
          {SPATIAL_RESOLUTION_OPTIONS.flat().map((option) => (
            <div key={option.id} className="flex flex-row items-center gap-x-2">
              <RadioGroupItem
                id={option.id}
                value={option.value}
                className="border-text-icons-base-second data-[state=checked]:border-primary-pink data-[state=checked]:text-primary-pink"
                indicatorClassName="fill-primary-pink"
              />
              <Label
                htmlFor={option.id}
                className="font-aptos text-md font-semibold leading-6 text-text-icons-base-third"
              >
                {t(option.labelKey)}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
};
