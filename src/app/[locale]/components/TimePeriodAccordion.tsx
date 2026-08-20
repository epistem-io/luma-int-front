import {
  AccordionContent,
  AccordionFullTrigger,
  AccordionItem,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
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
  CUSTOM_DATE_RANGE_MAX,
  CUSTOM_DATE_RANGE_MIN,
  TEMPORAL_COVERAGE_ARRAY,
  TEMPORAL_COVERAGE_VALUE,
  YEAR_OPTIONS_ARRAY,
} from "@/constants";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import {
  cn,
  formatCustomDateRange,
  getTemporalPeriodText,
  getTemporalRangeText,
  parseCustomDateRange,
} from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import { useContext, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import * as z from "zod";
import { TimePeriodSummary } from "./TimePeriodSummary";
import { useLocale, useTranslations } from "next-intl";
import { TFunction } from "@/i18n/types";

export const TimePeriodAccordion = () => {
  const {
    temporalCoverage,
    setTemporalCoverage,
    temporalCoverageUnit,
    setTemporalCoverageUnit,
    isEditingTemporalCoverage,
    setisEditingTemporalCoverage,
  } = useContext(MapGenerationContext);

  const t = useTranslations("InteractivePanel");
  const locale = useLocale();

  const scopingFormSchema = z
    .object({
      temporal_coverage: z.string().min(1, "Please select a temporal coverage."),
      scoping_unit: z.string(),
      start_date: z.string(),
      end_date: z.string(),
    })
    .superRefine((data, ctx) => {
      if (data.temporal_coverage === TEMPORAL_COVERAGE_VALUE.BY_YEAR) {
        if (!data.scoping_unit) {
          ctx.addIssue({
            code: "custom",
            path: ["scoping_unit"],
            message: t("timePeriod.yearRequired"),
          });
        }
        return;
      }

      if (data.temporal_coverage !== TEMPORAL_COVERAGE_VALUE.CUSTOM_DATE) return;

      if (!data.start_date) {
        ctx.addIssue({
          code: "custom",
          path: ["start_date"],
          message: t("timePeriod.startDateRequired"),
        });
      }
      if (!data.end_date) {
        ctx.addIssue({
          code: "custom",
          path: ["end_date"],
          message: t("timePeriod.endDateRequired"),
        });
      }
      if (data.start_date && data.end_date && data.start_date > data.end_date) {
        ctx.addIssue({
          code: "custom",
          path: ["end_date"],
          message: t("timePeriod.endDateBeforeStartDate"),
        });
      }
      // ISO strings compare lexicographically — safe for bounds checks.
      const outOfBounds = [data.start_date, data.end_date].some(
        (date) =>
          date &&
          (date < CUSTOM_DATE_RANGE_MIN || date > CUSTOM_DATE_RANGE_MAX),
      );
      if (outOfBounds) {
        ctx.addIssue({
          code: "custom",
          path: ["start_date"],
          message: t("timePeriod.dateOutOfRange", {
            min: CUSTOM_DATE_RANGE_MIN,
            max: CUSTOM_DATE_RANGE_MAX,
          }),
        });
      }
    });

  const scopingForm = useForm<z.infer<typeof scopingFormSchema>>({
    resolver: zodResolver(scopingFormSchema),
    defaultValues: {
      temporal_coverage: "",
      scoping_unit: "",
      start_date: "",
      end_date: "",
    },
  });

  function onSubmitScoping(data: z.infer<typeof scopingFormSchema>) {
    const { temporal_coverage, scoping_unit, start_date, end_date } = data;

    setTemporalCoverage(temporal_coverage);
    setTemporalCoverageUnit(
      temporal_coverage === TEMPORAL_COVERAGE_VALUE.CUSTOM_DATE
        ? formatCustomDateRange(start_date, end_date)
        : scoping_unit,
    );
    setisEditingTemporalCoverage(false);
  }

  const hydrateForm = () => {
    const isCustom = temporalCoverage === TEMPORAL_COVERAGE_VALUE.CUSTOM_DATE;
    const { startDate, endDate } = parseCustomDateRange(temporalCoverageUnit);

    scopingForm.reset({
      temporal_coverage: temporalCoverage,
      scoping_unit: isCustom ? "" : temporalCoverageUnit,
      start_date: isCustom ? startDate : "",
      end_date: isCustom ? endDate : "",
    });
  };

  useEffect(() => {
    hydrateForm();
  }, []);

  useEffect(() => {
    if (!isEditingTemporalCoverage) return;
    hydrateForm();
  }, [isEditingTemporalCoverage]);

  const temporalCoverageVal = scopingForm.watch("temporal_coverage");
  const startDateVal = scopingForm.watch("start_date");
  const endDateVal = scopingForm.watch("end_date");

  // Clear whichever branch is not in use. Idempotent against hydrateForm,
  // which already blanks the inactive branch.
  useEffect(() => {
    if (temporalCoverageVal === TEMPORAL_COVERAGE_VALUE.CUSTOM_DATE) {
      scopingForm.setValue("scoping_unit", "");
    } else {
      scopingForm.setValue("start_date", "");
      scopingForm.setValue("end_date", "");
    }
  }, [temporalCoverageVal]);

  return (
    <AccordionItem
      value={BASIC_INFORMATION_ACCORDION_TYPE.PERIOD}
      className="rounded-xl border border-neutral-400 bg-white pb-3 last:border-b"
    >
      <AccordionFullTrigger
        icon={
          <ChevronDown className="h-5 w-5 shrink-0 text-primary-pink transition-transform duration-200" />
        }
        className="hover:no-underline p-3 pb-0"
      >
        <p className="font-noto-sans text-xl font-semibold leading-7 tracking-[-0.2px] text-primary-pink">
          {t("timePeriod.timePeriod")}
        </p>
      </AccordionFullTrigger>
      <AccordionContent className="mt-5 px-3 pb-0 space-y-4">
        {isEditingTemporalCoverage && (
          <>
            <div className="space-y-3">
              <p className="font-aptos text-md font-regular leading-5 text-text-icons-base-main">
                {t("timePeriod.temporalCoverageLabel")}
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
                          <SelectValue
                            placeholder={t(
                              "timePeriod.temporalCoveragePlaceholder",
                            )}
                          />
                        </SelectTrigger>
                        <SelectContent position="item-aligned">
                          {TEMPORAL_COVERAGE_ARRAY.map((item) => (
                            <SelectItem
                              key={item.value}
                              value={item.value}
                              disabled={item.disabled}
                            >
                              {item.labelFunction(t as TFunction)}
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

              {temporalCoverageVal === TEMPORAL_COVERAGE_VALUE.BY_YEAR && (
                <Controller
                  name="scoping_unit"
                  control={scopingForm.control}
                  render={({ field, fieldState }) => (
                    <FieldGroup className="mt-4">
                      <Field data-invalid={fieldState.invalid}>
                        <Label className="m-0">
                          <p className="font-aptos text-[15px] font-regular leading-4.5 text-text-icons-base-main">
                            {t("timePeriod.year")}
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
                            <SelectValue
                              placeholder={t("timePeriod.byYearPlaceholder")}
                            />
                          </SelectTrigger>
                          {/* Dropdown anchored under the trigger (popper),
                              capped in height, with the years laid out as a
                              4-column grid like the date picker's year view
                              instead of one long single-column list. */}
                          <SelectContent
                            position="popper"
                            align="start"
                            className="max-h-72 w-[var(--radix-select-trigger-width)] rounded-xl border-neutral-400 shadow-lg"
                          >
                            <div className="grid grid-cols-4 gap-1 p-1">
                              {YEAR_OPTIONS_ARRAY.map((item) => (
                                <SelectItem
                                  key={item.value}
                                  value={item.value}
                                  className={cn(
                                    "h-9 justify-center rounded-lg px-0 pr-0 font-aptos text-md leading-6 text-text-icons-base-main",
                                    "cursor-pointer focus:bg-primary-red-pink-light focus:text-primary-pink",
                                    "data-[state=checked]:bg-primary-pink data-[state=checked]:font-bold data-[state=checked]:text-text-icons-on-color data-[state=checked]:focus:bg-primary-pink",
                                    // Hide the check-mark slot; the filled
                                    // pill already marks the selection.
                                    "[&>span:first-child]:hidden",
                                  )}
                                >
                                  {item.label}
                                </SelectItem>
                              ))}
                            </div>
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    </FieldGroup>
                  )}
                />
              )}

              {temporalCoverageVal === TEMPORAL_COVERAGE_VALUE.CUSTOM_DATE && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {(
                    [
                      {
                        name: "start_date",
                        label: t("timePeriod.startDate"),
                        min: CUSTOM_DATE_RANGE_MIN,
                        max: endDateVal || CUSTOM_DATE_RANGE_MAX,
                      },
                      {
                        name: "end_date",
                        label: t("timePeriod.endDate"),
                        min: startDateVal || CUSTOM_DATE_RANGE_MIN,
                        max: CUSTOM_DATE_RANGE_MAX,
                      },
                    ] as const
                  ).map(({ name, label, min, max }) => (
                    <Controller
                      key={name}
                      name={name}
                      control={scopingForm.control}
                      render={({ field, fieldState }) => (
                        <FieldGroup>
                          <Field data-invalid={fieldState.invalid}>
                            <Label htmlFor={name} className="m-0">
                              <p className="font-noto-sans text-lg font-semibold leading-6 text-primary-500">
                                {label}
                              </p>
                            </Label>
                            {/* The calendar opens over its own field row
                                (top edge at the label), left-aligned to the
                                field: Start Date at the panel's left edge,
                                End Date from the right column outward. */}
                            <DatePicker
                              id={name}
                              value={field.value}
                              onChange={field.onChange}
                              min={min}
                              max={max}
                              placeholder={t("timePeriod.selectDate")}
                              invalid={fieldState.invalid}
                              side="bottom"
                              align="start"
                              sideOffset={-72}
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        </FieldGroup>
                      )}
                    />
                  ))}
                </div>
              )}

              <Button variant={"primary"} className="mt-4">
                {t("timePeriod.setTimePeriod")}
              </Button>
            </form>
          </>
        )}
        {!isEditingTemporalCoverage && (
          <TimePeriodSummary
            temporalResolutionLabel={
              TEMPORAL_COVERAGE_ARRAY.find(
                (item) => item.value === temporalCoverage,
              )?.labelFunction(t as TFunction) || "Error"
            }
            specificPeriod={getTemporalPeriodText(
              temporalCoverage,
              temporalCoverageUnit,
            )}
            dateRange={getTemporalRangeText(
              temporalCoverage,
              temporalCoverageUnit,
              locale,
            )}
          />
        )}
      </AccordionContent>
    </AccordionItem>
  );
};