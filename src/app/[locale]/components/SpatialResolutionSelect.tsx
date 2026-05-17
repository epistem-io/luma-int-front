import { ComingSoon } from "@/components/ComingSoon";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTranslations } from "next-intl";

export const SpatialResolutionSelect = () => {
  const t = useTranslations("InteractivePanel");
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
        <RadioGroup disabled={isDisabled} className="flex flex-row gap-x-12">
          <div className="flex flex-col gap-y-2">
            <div className="flex flex-row items-center gap-x-2">
              <RadioGroupItem
                id="spatial-resolution-item-1"
                value="1"
                className="data-[state=checked]:border-primary-pink data-[state=checked]:text-primary-pink"
                indicatorClassName="fill-primary-pink"
              />
              <Label
                htmlFor="spatial-resolution-item-1"
                className="font-aptos text-md font-semibold leading-6 text-text-icons-base-third"
              >
                {t("areaScoping.30x30m2")}
              </Label>
            </div>
            <div className="flex flex-row items-center gap-x-2">
              <RadioGroupItem
                id="spatial-resolution-item-3"
                value="3"
                className="data-[state=checked]:border-primary-pink data-[state=checked]:text-primary-pink"
                indicatorClassName="fill-primary-pink"
              />
              <Label
                htmlFor="spatial-resolution-item-3"
                className="font-aptos text-md font-semibold leading-6 text-text-icons-base-third"
              >
                {t("areaScoping.100x100m2")}
              </Label>
            </div>
          </div>
          <div className="flex flex-col gap-y-2">
            <div className="flex flex-row items-center gap-x-2">
              <RadioGroupItem
                id="spatial-resolution-item-2"
                value="2"
                className="data-[state=checked]:border-primary-pink data-[state=checked]:text-primary-pink"
                indicatorClassName="fill-primary-pink"
              />
              <Label
                htmlFor="spatial-resolution-item-2"
                className="font-aptos text-md font-semibold leading-6 text-text-icons-base-third"
              >
                {t("areaScoping.500x500m2")}
              </Label>
            </div>
            <div className="flex flex-row items-center gap-x-2">
              <RadioGroupItem
                id="spatial-resolution-item-4"
                value="4"
                className="data-[state=checked]:border-primary-pink data-[state=checked]:text-primary-pink"
                indicatorClassName="fill-primary-pink"
              />
              <Label
                htmlFor="spatial-resolution-item-4"
                className="font-aptos text-md font-semibold leading-6 text-text-icons-base-third"
              >
                {t("areaScoping.1x1km2")}
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};
