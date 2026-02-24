import {
  AccordionContent,
  AccordionFullTrigger,
  AccordionItem,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BASIC_INFORMATION_ACCORDION_TYPE,
  TEMPORAL_COVERAGE_ARRAY,
} from "@/constants";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { cn, getTemporalRangeText } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import { useContext, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import * as z from "zod";
import { TimePeriodSummary } from "./TimePeriodSummary";

const YEAR_ARRAY = [
  {
    value: "2020",
    label: "2020",
  },
  {
    value: "2021",
    label: "2021",
  },
  {
    value: "2022",
    label: "2022",
  },
  {
    value: "2023",
    label: "2023",
  },
  {
    value: "2024",
    label: "2024",
  },
  {
    value: "2025",
    label: "2025",
  },
];

export const TimePeriodAccordion = () => {
  const {
    temporalCoverage,
    setTemporalCoverage,
    temporalCoverageUnit,
    setTemporalCoverageUnit,
    isEditingTemporalCoverage,
    setisEditingTemporalCoverage,
  } = useContext(MapGenerationContext);

  const scopingFormSchema = z.object({
    temporal_coverage: z.string().min(1, "Please select a temporal coverage."),
    scoping_unit: z.string().min(1, "Please select one."),
  });

  const scopingForm = useForm<z.infer<typeof scopingFormSchema>>({
    resolver: zodResolver(scopingFormSchema),
    defaultValues: {
      temporal_coverage: "",
      scoping_unit: "",
    },
  });

  function onSubmitScoping(data: z.infer<typeof scopingFormSchema>) {
    // Do something with the form values.
    console.log(data);

    const { temporal_coverage, scoping_unit } = data;

    setTemporalCoverage(temporal_coverage);
    setTemporalCoverageUnit(scoping_unit);
    setisEditingTemporalCoverage(false);
  }

  useEffect(() => {
    scopingForm.reset({
      temporal_coverage: temporalCoverage,
      scoping_unit: temporalCoverageUnit,
    });
  }, []);

  const temporalCoverageVal = scopingForm.watch("temporal_coverage");

  return (
    <AccordionItem
      value={BASIC_INFORMATION_ACCORDION_TYPE.PERIOD}
      className="rounded-xl border border-neutral-400 bg-white pb-3"
    >
      <AccordionFullTrigger
        icon={
          <ChevronDown className="h-5 w-5 shrink-0 text-primary-pink transition-transform duration-200" />
        }
        className="hover:no-underline p-3 pb-0"
      >
        <p className="font-noto-sans text-xl font-semibold leading-7 tracking-[-0.2px] text-primary-pink">
          Time Period
        </p>
      </AccordionFullTrigger>
      <AccordionContent className="mt-5 px-3 pb-0 space-y-4">
        {isEditingTemporalCoverage && (
          <>
            <div className="space-y-3">
              <p className="font-noto-sans text-lg font-medium leading-6 tracking-[-0.18px] text-text-icons-base-main">
                Temporal Coverage
              </p>
              <p className="font-aptos text-md font-regular leading-5 text-text-icons-base-main">
                What time period would you like to be shown on the land use and
                land cover (LULC) map?
              </p>
            </div>
            <form onSubmit={scopingForm.handleSubmit(onSubmitScoping)}>
              <Controller
                name="temporal_coverage"
                control={scopingForm.control}
                render={({ field, fieldState }) => (
                  <FieldGroup>
                    <Field
                      orientation="responsive"
                      data-invalid={fieldState.invalid}
                    >
                      <Select
                        name={field.name}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          aria-invalid={fieldState.invalid}
                          className="w-full"
                        >
                          <SelectValue placeholder="Select Temporal Coverage" />
                        </SelectTrigger>
                        <SelectContent position="item-aligned">
                          {TEMPORAL_COVERAGE_ARRAY.map((item) => (
                            <SelectItem
                              key={item.value}
                              value={item.value}
                              disabled={item.disabled}
                            >
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  </FieldGroup>
                )}
              />
              {temporalCoverageVal === "1" && (
                <>
                  <Controller
                    name="scoping_unit"
                    control={scopingForm.control}
                    render={({ field, fieldState }) => (
                      <FieldGroup className="mt-4">
                        <Field
                          data-invalid={fieldState.invalid}
                          // className={cn("space-y-2")}
                        >
                          <Label className="m-0">
                            <p className="font-aptos text-[15px] font-regular leading-4.5 text-text-icons-base-main ">
                              Year
                            </p>
                          </Label>
                          <Select
                            name={field.name}
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger
                              aria-invalid={fieldState.invalid}
                              className="w-full"
                            >
                              <SelectValue placeholder="Select Year" />
                            </SelectTrigger>
                            <SelectContent position="item-aligned">
                              {YEAR_ARRAY.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      </FieldGroup>
                    )}
                  />
                </>
              )}
              <Button variant={"primary"} className="mt-4">
                Set Time Period
              </Button>
            </form>
          </>
        )}
        {!isEditingTemporalCoverage && (
          <TimePeriodSummary
            temporalResolutionLabel={
              TEMPORAL_COVERAGE_ARRAY.find(
                (item) => item.value === temporalCoverage,
              )?.label || "Error"
            }
            specificPeriod={temporalCoverageUnit}
            dateRange={getTemporalRangeText(
              temporalCoverage,
              temporalCoverageUnit,
            )}
          />
        )}
      </AccordionContent>
    </AccordionItem>
  );
};
