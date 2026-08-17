"use client"

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, formatDayMonth, fromISODate, toISODate } from "@/lib/utils";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

const WEEKDAY_ANCHOR = new Date(2024, 0, 1);

interface CalendarView {
  year: number;
  month: number;
}

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  showYear?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  id?: string;
}

export const DatePicker = ({
  value,
  onChange,
  min,
  max,
  placeholder = "-",
  showYear = true,
  invalid = false,
  disabled = false,
  id,
}: DatePickerProps) => {
  const locale = useLocale();
  const t = useTranslations("InteractivePanel");

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [isYearView, setIsYearView] = useState(false);
  const [view, setView] = useState<CalendarView>({year: 2000, month: 0});
  const [todayIso, setTodayIso] = useState("");

  useEffect(() => {
    setTodayIso(toISODate(new Date()));
  }, []);

  useEffect(() => {
    if (!open) return;

    const today = new Date();
    const clamped = min && toISODate(today) < min ? fromISODate(min) : max && toISODate(today) > max ? fromISODate(max) : today;
    const base = fromISODate(value) ?? clamped ?? today;

    setDraft(value);
    setIsYearView(false);
    setView({year: base.getFullYear(), month: base.getMonth()});
  }, [open]);

  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, {month: "long"}),
  [locale]);
  const weekdayFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, {weekday: "short"}),
    [locale],
  );

  const weekdays = useMemo(
    () =>
      Array.from({length: 7}, (_, i) =>
        weekdayFormatter
          .format(
            new Date(
              WEEKDAY_ANCHOR.getFullYear(),
              WEEKDAY_ANCHOR.getMonth(),
              WEEKDAY_ANCHOR.getDate() + i,
            ),
          )
          .slice(0, 2),
    ),
    [weekdayFormatter],
  );

  const cells = useMemo(() => {
    const { year, month } = view;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // JS weeks start on Sunday; shift so Monday is column 0.
    const leading = (new Date(year, month, 1).getDay() + 6) % 7;
    const weeks = Math.ceil((leading + daysInMonth) / 7);

    return Array.from(
      { length: weeks * 7 },
      (_, i) => new Date(year, month, 1 - leading + i),
    );
  }, [view]);

  const yearOptions = useMemo(() => {
    const minYear = min ? Number(min.slice(0, 4)) : view.year - 10;
    const maxYear = max ? Number(max.slice(0, 4)) : view.year + 10;
    return Array.from(
      { length: Math.max(maxYear - minYear + 1, 1) },
      (_, i) => minYear + i,
    );
  }, [min, max, view.year]);

  const goToMonth = (delta: number) =>
    setView(({ year, month }) => {
      const next = new Date(year, month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });

  // Last day of the previous month / first day of the next month.
  const isPrevDisabled =
    !!min && toISODate(new Date(view.year, view.month, 0)) < min;
  const isNextDisabled =
    !!max && toISODate(new Date(view.year, view.month + 1, 1)) > max;

  const selectedDate = fromISODate(value);
  const triggerLabel = selectedDate
    ? formatDayMonth(selectedDate, locale, showYear)
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-invalid={invalid}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg text-left outline-none",
            "focus-visible:ring-[3px] focus-visible:ring-primary-pink/40",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-pink text-text-icons-on-color",
              invalid && "bg-text-icons-danger",
            )}
          >
            <CalendarDays className="size-4.5" />
          </span>
          <span
            className={cn(
              "font-aptos text-md font-regular leading-6 text-text-icons-base-main",
              !selectedDate && "text-text-icons-base-third",
            )}
          >
            {triggerLabel}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-80 rounded-xl border-neutral-400 p-4 shadow-lg"
      >
        <div className="space-y-3">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setIsYearView((current) => !current)}
              className="font-aptos text-md font-bold leading-6 text-primary-pink hover:underline"
            >
              {view.year}
            </button>
          </div>

          {!isYearView && (
            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="rounded-lg border-neutral-400"
                disabled={isPrevDisabled}
                onClick={() => goToMonth(-1)}
                aria-label={t("timePeriod.previousMonth")}
              >
                <ChevronLeft className="size-4 text-text-icons-base-main" />
              </Button>
              <p className="font-noto-sans text-lg font-semibold leading-6 text-text-icons-base-main">
                {monthFormatter.format(new Date(view.year, view.month, 1))}
              </p>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="rounded-lg border-neutral-400"
                disabled={isNextDisabled}
                onClick={() => goToMonth(1)}
                aria-label={t("timePeriod.nextMonth")}
              >
                <ChevronRight className="size-4 text-text-icons-base-main" />
              </Button>
            </div>
          )}

          {isYearView ? (
            <div className="grid grid-cols-4 gap-2 pt-1">
              {yearOptions.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => {
                    setView((current) => ({ ...current, year }));
                    setIsYearView(false);
                  }}
                  className={cn(
                    "rounded-lg py-2 font-aptos text-md leading-6 text-text-icons-base-main hover:bg-primary-red-pink-light",
                    year === view.year &&
                      "bg-primary-red-pink-light font-bold text-primary-pink",
                  )}
                >
                  {year}
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7">
                {weekdays.map((weekday) => (
                  <p
                    key={weekday}
                    className="py-1 text-center font-aptos text-[13px] font-regular leading-5 text-text-icons-base-third"
                  >
                    {weekday}
                  </p>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-1">
                {cells.map((date) => {
                  const iso = toISODate(date);
                  const isOutsideMonth = date.getMonth() !== view.month;
                  const isOutOfBounds =
                    (!!min && iso < min) || (!!max && iso > max);
                  const isDisabled = isOutsideMonth || isOutOfBounds;
                  const isSelected = iso === draft;

                  return (
                    <button
                      key={iso}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => setDraft(iso)}
                      className={cn(
                        "relative flex h-9 items-center justify-center rounded-lg font-aptos text-md leading-6 text-text-icons-base-main transition-colors",
                        "hover:bg-primary-red-pink-light",
                        isDisabled &&
                          "cursor-not-allowed text-text-icons-base-third hover:bg-transparent",
                        isOutOfBounds && "text-text-icons-disabled",
                        isSelected &&
                          "bg-primary-red-pink-light font-bold text-primary-pink hover:bg-primary-red-pink-light-hover",
                      )}
                    >
                      {date.getDate()}
                      {iso === todayIso && !isOutsideMonth && (
                        <span className="absolute bottom-1 h-0.5 w-4 rounded-full bg-warning-700" />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              size="primary"
              onClick={() => setOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="primary"
              disabled={!draft}
              onClick={() => {
                onChange(draft);
                setOpen(false);
              }}
            >
              {t("common.save")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}