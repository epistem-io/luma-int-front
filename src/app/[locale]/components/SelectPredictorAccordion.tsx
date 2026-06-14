import { ComingSoon } from "@/components/ComingSoon";
import {
  AccordionContent,
  AccordionFullTrigger,
  AccordionItem,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Upload, UploadIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import { LULC_PREDICTORS } from "./lulcPredictors";

export const SelectPredictorAccordion = () => {
  const t = useTranslations("InteractivePanel");
  const { selectedPredictors, setSelectedPredictors, selectedDefault } =
    useContext(MapGenerationContext);

  const togglePredictor = (predictorId: string, checked: boolean) => {
    setSelectedPredictors((currentPredictors) => {
      if (checked) {
        return currentPredictors.includes(predictorId)
          ? currentPredictors
          : [...currentPredictors, predictorId];
      }

      return currentPredictors.filter((currentId) => currentId !== predictorId);
    });
  };

  return (
    <AccordionItem
      value="predictor"
      className="rounded-xl border border-neutral-400 bg-white pb-3"
    >
      <AccordionFullTrigger
        icon={
          <ChevronDown className="h-5 w-5 shrink-0 text-primary-pink transition-transform duration-200" />
        }
        className="hover:no-underline p-3 pb-0"
      >
        <p className="font-noto-sans text-xl font-semibold leading-7 tracking-[-0.2px] text-primary-pink">
          {t("lulcParams.selectPredictor")}
        </p>
      </AccordionFullTrigger>
      <AccordionContent className="mt-2 space-y-5 px-3 pb-0">
        <p className="text-l-medium font-aptos text-base font-normal leading-6 text-neutral-700-baru">
          {t.rich("lulcParams.selectPredictorDesc", {
            br: () => <br></br>,
          })}
        </p>

        <div className="space-y-5">
          <div className="space-y-2.5 rounded-xl border border-neutral-400 bg-white p-3">
            {LULC_PREDICTORS.map((predictor) => {
              const checked = selectedPredictors.includes(predictor.value);
              const id = `predictor-${predictor.value}`;

              return (
                <label
                  key={id}
                  htmlFor={id}
                  className="flex cursor-pointer items-start gap-3 rounded-lg px-1 py-1.5 transition-colors hover:bg-neutral-100"
                >
                  <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={(nextChecked) =>
                      togglePredictor(predictor.value, nextChecked === true)
                    }
                    disabled={selectedDefault}
                    className={cn(
                      "mt-0.5 border-neutral-500",
                      checked &&
                        "border-primary-pink data-[state=checked]:border-primary-pink data-[state=checked]:bg-primary-pink",
                    )}
                  />
                  <div className="space-y-1">
                    <p className="text-m-semibold text-text-icons-base-second">
                      {predictor.label}
                    </p>
                    <p className="text-xs-regular text-text-icons-base-second">
                      {predictor.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>

          <ComingSoon />

          <div
            className={cn(
              "p-4 border-2 border-dashed border-secondary-purple-light-hover rounded-[12px] space-y-4 transition-all duration-200 relative",
              "min-h-40.5",
              "cursor-not-allowed",
            )}
          >
            <div className="space-y-3">
              <UploadIcon className="size-8 aspect-square text-text-icons-base-third mx-auto" />
              <p className="font-aptos text-[13px] font-regular leading-4.5 text-neutrals-600 text-center">
                {/* Drag & drop your file here to upload. <br />
                Accepted format .zip */}
                {t("lulcParams.dragAndDrop")} <br />
                {t("lulcParams.acceptedFormat", {
                  X: ".zip",
                })}
              </p>
            </div>
            <Label
              htmlFor="data-training-file-upload"
              className={cn(
                "w-50 mx-auto flex flex-row justify-center mb-0",
                true && "pointer-events-none cursor-not-allowed",
              )}
            >
              <div
                className={cn(
                  "rounded-[12px] bg-primary-pink-hover hover:bg-primary-pink-hover hover:brightness-95 cursor-pointer w-full py-1.5 px-2 transition-all duration-200",
                  true && "bg-text-icons-disabled",
                )}
              >
                <p
                  className={cn(
                    "font-aptos text-[13px] font-semibold leading-4.5 text-primary-red-pink-normal text-center",
                    true && "text-text-icons-base-third",
                  )}
                >
                  {t("lulcParams.browseFile")}
                </p>
              </div>
            </Label>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
