"use client"

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, formatDayMonth, fromISODate, toISODate } from "@/lib/utils";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ComponentProps } from "react";

const WEEKDAY_ANCHOR = new Date(2024, 0, 1);

interface CalendarView {
  year: number;
  month: number;
}

type PopoverContentProps = ComponentProps<typeof PopoverContent>;

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
  /** Popover placement passthrough (Radix). Defaults: bottom / start. */
  side?: PopoverContentProps["side"];
  align?: PopoverContentProps["align"];
  sideOffset?: PopoverContentProps["sideOffset"];
  alignOffset?: PopoverContentProps["alignOffset"];
  avoidCollisions?: PopoverContentProps["avoidCollisions"];
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
  side = "bottom",
  align = "start",
  sideOffset = 4,
  alignOffset,
  avoidCollisions = true,
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

  // Newest year first (same order as the "By year" select), bounded by
  // min/max when given.
  const yearOptions = useMemo(() => {
    const minYear = min ? Number(min.slice(0, 4)) : view.year - 10;
    const maxYear = max ? Number(max.slice(0, 4)) : view.year + 10;
    return Array.from(
      { length: Math.max(maxYear - minYear + 1, 1) },
      (_, i) => maxYear - i,
    );
  }, [min, max, view.year]);

  // Keep the current year visible when the (scrollable) year grid opens.
  const selectedYearRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (!isYearView) return;
    selectedYearRef.current?.scrollIntoView({ block: "center" });
  }, [isYearView]);

  const goToMonth = (delta: number) =>
    setView(({ year, month }) => {
      const next = new Date(year, month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });

  // Picking a year keeps the month unless that month falls outside min/max
  // (e.g. jumping to the min year while viewing January before min).
  const goToYear = (year: number) =>
    setView(({ month }) => {
      let nextMonth = month;
      if (min && year === Number(min.slice(0, 4))) {
        nextMonth = Math.max(nextMonth, Number(min.slice(5, 7)) - 1);
      }
      if (max && year === Number(max.slice(0, 4))) {
        nextMonth = Math.min(nextMonth, Number(max.slice(5, 7)) - 1);
      }
      return { year, month: nextMonth };
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
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        avoidCollisions={avoidCollisions}
        collisionPadding={8}
        className="w-80 rounded-xl border-neutral-400 p-4 shadow-lg"
      >
        <div className="space-y-3">
          {/* Year switcher: a pill that toggles between the month grid and
              the year grid; the chevron flips to show which one is open. */}
          <div className="flex justify-center">
            <button
              type="button"
              aria-expanded={isYearView}
              onClick={() => setIsYearView((current) => !current)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-3 py-1 font-aptos text-md font-bold leading-6 text-primary-pink transition-colors",
                "hover:bg-primary-red-pink-light",
                isYearView && "bg-primary-red-pink-light",
              )}
            >
              {view.year}
              <ChevronDown
                className={cn(
                  "size-4 transition-transform duration-200",
                  isYearView && "rotate-180",
                )}
              />
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
            // Same footprint as the month grid (weekday row + 6 week rows)
            // so the popover doesn't jump in height; scrolls when the range
            // is long (e.g. 1972 → today).
            <div className="max-h-[276px] overflow-y-auto pr-1 -mr-1">
              <div className="grid grid-cols-4 gap-2 pt-1">
                {yearOptions.map((year) => {
                  const isCurrent = year === view.year;
                  return (
                    <button
                      key={year}
                      ref={isCurrent ? selectedYearRef : undefined}
                      type="button"
                      onClick={() => {
                        goToYear(year);
                        setIsYearView(false);
                      }}
                      className={cn(
                        "h-9 rounded-lg font-aptos text-md leading-6 text-text-icons-base-main transition-colors",
                        "hover:bg-primary-red-pink-light",
                        isCurrent &&
                          "bg-primary-pink font-bold text-text-icons-on-color hover:bg-primary-pink",
                      )}
                    >
                      {year}
                    </button>
                  );
                })}
              </div>
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