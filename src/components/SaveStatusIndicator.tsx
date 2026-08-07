"use client";

import { Check, ChevronDown, Loader2 } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useContext, useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AuthContext } from "@/contexts/authContext";
import { SessionCheckpointContext } from "@/contexts/sessionCheckpointContext";

const REFRESH_INTERVAL_MS = 30_000;

export const SaveStatusIndicator = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const { saveStatus, lastSavedAt, recordedSteps } = useContext(
    SessionCheckpointContext,
  );
  const t = useTranslations("InteractivePanel.saveIndicator");
  const format = useFormatter();

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (saveStatus !== "saved") return;
    const id = setInterval(() => setNow(new Date()), REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [saveStatus]);

  if (!isAuthenticated || saveStatus === "idle") return null;

  if (saveStatus === "saving") {
    return (
      <div className="flex items-center gap-2 rounded-[8px] bg-primary-red-pink-light px-2.5 py-1.5 font-aptos text-sm font-bold text-primary-pink">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t("saving")}
      </div>
    );
  }

  const savedAtDate = lastSavedAt ? new Date(lastSavedAt) : now;
  const stepLabels = [
    t("step1"),
    t("step2"),
    t("step3"),
    t("step4"),
    t("step5"),
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-[8px] bg-success-50 px-2.5 py-1.5 font-aptos text-sm font-bold text-success-700 cursor-pointer"
        >
          <span className="h-2 w-2 rounded-full bg-success-700" />
          {t("saved", { time: format.relativeTime(savedAtDate, now) })}
          <ChevronDown className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 font-aptos">
        <p className="text-sm font-bold">{t("lastSavedTitle")}</p>
        <p className="text-sm text-gray-600">
          {format.dateTime(savedAtDate, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
        <p className="mt-3 text-sm font-bold">{t("recordedStepsTitle")}</p>
        <ul className="mt-1 space-y-1">
          {stepLabels.map((label, index) => (
            <li
              key={label}
              className={
                recordedSteps[index]
                  ? "flex items-center gap-2 text-sm text-success-700"
                  : "flex items-center gap-2 text-sm text-gray-400"
              }
            >
              {recordedSteps[index] ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="inline-block h-4 w-4" />
              )}
              {label}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
};
