"use client";

import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FETCH_REGENCY_LIST_URL } from "@/constants";
import {
  fetchRegencyList,
  filterRegencies,
  formatRegencyLabel,
} from "@/lib/regency";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  KeyboardEvent,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface RegencyComboboxProps {
  value: RegencyOption | null;
  onChange: (regency: RegencyOption | null) => void;
  disabled?: boolean;
}

/** Cap the rendered list so typing stays snappy on the ~515-row list. */
const MAX_VISIBLE_RESULTS = 60;

/**
 * Searchable Kabupaten/Kota picker. Built on the shadcn Popover + Input
 * primitives already in the project (no cmdk dependency).
 */
export const RegencyCombobox = ({
  value,
  onChange,
  disabled = false,
}: RegencyComboboxProps) => {
  const t = useTranslations("InteractivePanel");

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [regencies, setRegencies] = useState<RegencyOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  const listRef = useRef<HTMLUListElement | null>(null);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    fetchRegencyList(FETCH_REGENCY_LIST_URL)
      .then((list) => {
        if (!cancelled) setRegencies(list);
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setLoadError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const filtered = useMemo(
    () => filterRegencies(regencies, deferredQuery),
    [regencies, deferredQuery],
  );
  const visible = filtered.slice(0, MAX_VISIBLE_RESULTS);
  const hiddenCount = filtered.length - visible.length;

  useEffect(() => {
    setActiveIndex(0);
  }, [deferredQuery]);

  useEffect(() => {
    if (!open) return;
    const item = listRef.current?.children.item(activeIndex) as
      | HTMLElement
      | null
      | undefined;
    item?.scrollIntoView?.({ block: "nearest" });
  }, [activeIndex, open]);

  const select = (regency: RegencyOption) => {
    onChange(regency);
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, visible.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = visible[activeIndex];
      if (target) select(target);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (disabled) return;
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          disabled={disabled}
          data-testid="regency-combobox-trigger"
          className={cn(
            "flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-neutral-400 bg-white px-3 text-left font-aptos text-md leading-6 shadow-xs outline-none transition-[color,box-shadow]",
            "focus-visible:border-primary-pink focus-visible:ring-[3px] focus-visible:ring-primary-pink/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            value ? "text-text-icons-base-main" : "text-neutrals-600",
          )}
        >
          <span className="truncate">
            {value
              ? formatRegencyLabel(value)
              : t("areaScoping.selectRegencyPlaceholder")}
          </span>
          <ChevronDownIcon
            className={cn(
              "size-5 shrink-0 text-text-icons-base-main transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[var(--radix-popover-trigger-width)] rounded-lg border border-neutral-400 bg-white p-0 shadow-md"
      >
        <div className="flex items-center gap-2 border-b border-neutral-300 px-3">
          <SearchIcon className="size-4 shrink-0 text-neutrals-600" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t("areaScoping.selectRegencySearchPlaceholder")}
            aria-label={t("areaScoping.selectRegencySearchPlaceholder")}
            data-testid="regency-combobox-search"
            className="h-10 border-0 px-0 shadow-none focus-visible:ring-0 font-aptos text-md"
          />
        </div>

        <ul
          ref={listRef}
          role="listbox"
          className="max-h-64 overflow-y-auto py-1"
          data-testid="regency-combobox-list"
        >
          {isLoading && (
            <li className="px-3 py-3 font-aptos text-[13px] text-neutrals-600">
              {t("areaScoping.loadingRegencies")}
            </li>
          )}

          {!isLoading && loadError && (
            <li className="px-3 py-3 font-aptos text-[13px] text-danger-700">
              <p>{t("areaScoping.loadRegenciesError")}</p>
              <button
                type="button"
                className="mt-1 underline hover:cursor-pointer"
                onClick={() => setReloadKey((k) => k + 1)}
              >
                {t("common.reselect")}
              </button>
            </li>
          )}

          {!isLoading && !loadError && visible.length === 0 && (
            <li className="px-3 py-3 font-aptos text-[13px] text-neutrals-600">
              {t("areaScoping.noRegencyFound")}
            </li>
          )}

          {!isLoading &&
            !loadError &&
            visible.map((regency, index) => {
              const isSelected = value?.code === regency.code;
              const isActive = index === activeIndex;
              return (
                <li
                  key={regency.code}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => select(regency)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-2 px-3 py-2 font-aptos text-md leading-5",
                    isActive && "bg-primary-red-pink-light-hover",
                    isSelected && "font-semibold text-primary-pink",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate">{regency.label}</span>
                    <span className="block truncate text-[12px] text-neutrals-600">
                      {regency.province}
                    </span>
                  </span>
                  {isSelected && (
                    <CheckIcon className="size-4 shrink-0 text-primary-pink" />
                  )}
                </li>
              );
            })}

          {!isLoading && !loadError && hiddenCount > 0 && (
            <li className="px-3 py-2 font-aptos text-[12px] text-neutrals-600">
              +{hiddenCount}…
            </li>
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
};
