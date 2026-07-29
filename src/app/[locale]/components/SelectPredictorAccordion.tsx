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

          {/* Whole disabled-upload section shares one grey container: the
              coming-soon notice on top, the dashed dropzone below. */}
          <div className="rounded-xl bg-text-icons-disabled p-2 space-y-2 cursor-not-allowed">
            <ComingSoon />
            <div className="rounded-xl border-2 border-dashed border-neutral-300 bg-[#E8EAED] p-6 space-y-4">
              <Upload className="size-8 mx-auto text-text-icons-base-third" />
              <div className="text-center space-y-0.5">
                <p className="font-aptos text-md font-regular leading-6 text-text-icons-base-third">
                  {tInteractive("lulcParams.predictorUploadDragDrop")}
                </p>
                <p className="font-aptos text-md font-regular leading-6 text-text-icons-base-third">
                  {tInteractive("lulcParams.predictorUploadFormat")}
                </p>
              </div>
              <div className="mx-auto w-[220px] rounded-full bg-white py-2">
                <p className="font-aptos text-[13px] font-semibold leading-4.5 text-text-icons-base-third text-center">
                  {tInteractive("lulcParams.predictorUploadBrowse")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
