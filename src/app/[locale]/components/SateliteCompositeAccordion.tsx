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
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

export const SateliteCompositeAccordion = () => {
  const t = useTranslations("InteractivePanel");

  const isFormDisabled = false;
  const isSubmitDisabled = true;

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
            <Select disabled={isFormDisabled}>
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
            <Slider
              step={10}
              defaultValue={[30]}
              min={0}
              max={100}
              className="mt-1"
              trackBgColor="bg-neutral-300"
              disabled={isFormDisabled}
            />
            <div className="flex flex-row justify-between">
              <div className="">
                <p className="font-aptos text-sm font-bold leading-5 text-text-icons-base-main text-center">
                  0%
                </p>
              </div>
              <div className="">
                <p className="font-aptos text-sm font-bold leading-5 text-text-icons-base-main text-center">
                  5%
                </p>
              </div>
              <div className="">
                <p className="font-aptos text-sm font-bold leading-5 text-text-icons-base-main text-center">
                  10%
                </p>
              </div>
              <div className="">
                <p className="font-aptos text-sm font-bold leading-5 text-text-icons-base-main text-center">
                  15%
                </p>
              </div>
              <div className="">
                <p className="font-aptos text-sm font-bold leading-5 text-text-icons-base-main text-center">
                  20%
                </p>
              </div>
              <div className="">
                <p className="font-aptos text-sm font-bold leading-5 text-text-icons-base-main text-center">
                  25%
                </p>
              </div>
              <div className="">
                <p className="font-aptos text-sm font-bold leading-5 text-text-icons-base-main text-center">
                  30%
                </p>
              </div>
            </div>
          </Field>
          <Button
            disabled={isSubmitDisabled}
            variant={"primary"}
            className="mt-2 bg-neutral-300 text-neutral-500"
          >
            {t("satelliteComposite.setSatelliteComposite")}
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
