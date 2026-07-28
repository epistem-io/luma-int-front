import { ComingSoon } from "@/components/ComingSoon";
import {
  AccordionContent,
  AccordionFullTrigger,
  AccordionItem,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { cn } from "@/lib/utils";
import { ChevronDown, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import { LULC_PREDICTORS } from "./lulcPredictors";

export const SelectPredictorAccordion = () => {
  const t = useTranslations("AnalysisPanel");
  const tInteractive = useTranslations("InteractivePanel");
  const { selectedPredictors, setSelectedPredictors, isAutoPointsFlow } =
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
      className="rounded-xl border border-neutral-400 bg-white pb-3 last:border-b"
    >
      <AccordionFullTrigger
        icon={
          <ChevronDown className="h-5 w-5 shrink-0 text-primary-pink transition-transform duration-200" />
        }
        className="hover:no-underline p-3 pb-0"
      >
        <p className="font-noto-sans text-xl font-semibold leading-7 tracking-[-0.2px] text-primary-pink">
          {tInteractive("lulcParams.selectPredictor")}
        </p>
      </AccordionFullTrigger>
      <AccordionContent className="mt-2 space-y-5 px-3 pb-0">
        <p className="text-l-medium font-aptos text-base font-normal leading-6 text-neutral-700-baru">
          {tInteractive.rich("lulcParams.selectPredictorDesc", {
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
                    disabled={isAutoPointsFlow}
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

          <div className="rounded-xl bg-white p-0">
            <div className="space-y-4 rounded-xl border border-dashed border-[rgba(184,187,199,1)] p-6 cursor-not-allowed">
              <p className="text-l-bold text-text-icons-base-third text-center">
                {t("Section4.selectPredictorDesc")}
              </p>
              <div className="mx-auto w-fit rounded-full border border-neutral-600 p-2">
                <Upload className="h-5 w-5 text-text-icons-base-third" />
              </div>
              <div className="text-center">
                <p className="text-l-medium text-text-icons-base-third">
                  {t("Section4.fileUploadDesc1")}{" "}
                  <b className="text-primary-pink underline">
                    {t("Section4.fileUploadDesc2")}
                  </b>{" "}
                  {t("Section4.fileUploadDesc3")}
                </p>
                <p className="text-s-medium text-text-icons-light-base-second">
                  {t("Section4.fileUploadSupportedFiles")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
