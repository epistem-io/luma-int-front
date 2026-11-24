import { ComingSoon } from "@/components/ComingSoon";
import {
  AccordionContent,
  AccordionFullTrigger,
  AccordionItem,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GlobalContext } from "@/contexts/globalContext";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { showErrorToast } from "@/components/ui/error-toast";
import {
  fetchPredictorDownloadUrl,
  needsOptimizerRun,
  PREDICTOR_GROUP_FALLBACK_LABELS,
  predictorLabels,
  predictorSecondaryText,
  visiblePredictorGroups,
} from "@/lib/predictorsApi";
import { cn } from "@/lib/utils";
import { saveFileFromUrl } from "@/utils/saveFileFromUrl";
import { ChevronDown, Download, Eye, EyeOff, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { useContext, useEffect, useMemo, useState } from "react";
import { PredictorPreviewLegend } from "./PredictorPreviewLegend";
import { PredictorRecommendationCard } from "./PredictorRecommendationCard";
import { PredictorSeparabilityCard } from "./PredictorSeparabilityCard";
import { usePredictorPreview } from "./usePredictorPreview";
import { useStepNavigation } from "./useStepNavigation";
import { useTranslateOr } from "./useTranslateOr";

export const SelectPredictorAccordion = () => {
  const tInteractive = useTranslations("InteractivePanel");
  const translateOr = useTranslateOr();
  const { sessionId } = useContext(GlobalContext);
  const { isViewOnly } = useStepNavigation();
  const {
    selectedPredictors,
    setSelectedPredictors,
    isAutoPointsFlow,
    predictorListing,
    isPredictorListingLoading,
    predictorListingError,
    fetchPredictorListing,
    predictorRecommendation,
    predictorOptimizerStatus,
    startPredictorOptimizer,
  } = useContext(MapGenerationContext);

  // The options depend on the satellite and period chosen in step 1, which
  // may have changed since the last visit, so they are fetched every time
  // step 4 opens. On the backend this is a lookup, not an Earth Engine call.
  useEffect(() => {
    if (sessionId) fetchPredictorListing(sessionId);
  }, [sessionId]);

  // Own classification only: once the fresh list is in, run the predictor
  // optimizer unless the session already has a result for its current
  // imagery and samples. A failed run is not retried here (the card has a
  // retry button), so this cannot loop.
  useEffect(() => {
    if (!sessionId || !predictorListing || isPredictorListingLoading) return;
    if (isAutoPointsFlow || isViewOnly) return;
    if (predictorOptimizerStatus !== "idle") return;
    if (!needsOptimizerRun(predictorRecommendation)) return;

    startPredictorOptimizer(sessionId);
  }, [predictorListing, isPredictorListingLoading]);

  const groups = useMemo(
    () => visiblePredictorGroups(predictorListing),
    [predictorListing],
  );

  const recommendedIds =
    predictorRecommendation && !predictorRecommendation.stale
      ? predictorRecommendation.recommended
      : [];

  const preview = usePredictorPreview();
  const [isDownloading, setIsDownloading] = useState(false);

  // One GeoTIFF with a band per ticked predictor.
  const downloadSelected = async () => {
    setIsDownloading(true);
    try {
      const result = await fetchPredictorDownloadUrl(
        sessionId,
        selectedPredictors,
      );
      if (!result.download_url) {
        showErrorToast({
          title: translateOr(
            "lulcParams.preview.downloadUnavailableTitle",
            "Predictor download unavailable",
          ),
          description: translateOr(
            "lulcParams.preview.downloadUnavailable",
            "Google Earth Engine could not create a download link this large. Try fewer predictors.",
          ),
        });
        return;
      }
      await saveFileFromUrl(result.download_url, "predictors.tif");
    } catch (e) {
      showErrorToast({
        title: tInteractive("common.errors.downloadFailed"),
        error: e,
        onRetry: () => void downloadSelected(),
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const groupLabel = (key: string) =>
    translateOr(
      `lulcParams.predictorGroups.${key}`,
      PREDICTOR_GROUP_FALLBACK_LABELS[key] ?? key,
    );

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
          <PredictorRecommendationCard />

          {preview.activeId && (
            <PredictorPreviewLegend
              label={
                predictorLabels([preview.activeId], predictorListing)[0] ??
                preview.activeId
              }
              layer={preview.layer}
              isLoading={preview.isLoading}
              message={preview.message}
              onHide={preview.hide}
            />
          )}

          {/* First load only: a refresh keeps the current list on screen. */}
          {isPredictorListingLoading && !predictorListing && (
            <div className="p-4 rounded-xl border border-neutral-400 bg-white flex flex-row items-center gap-x-3">
              <span className="loader sm"></span>
              <p className="font-aptos text-md font-regular leading-6 text-neutral-700">
                {translateOr(
                  "lulcParams.predictorsLoading",
                  "Checking which predictors are available…",
                )}
              </p>
            </div>
          )}

          {!isPredictorListingLoading && predictorListingError !== "" && (
            <div className="p-4 rounded-xl bg-danger-50 space-y-3">
              <p className="font-aptos text-md font-regular leading-6 text-danger-800">
                {translateOr(
                  "lulcParams.predictorsLoadFailed",
                  "The predictor list could not be loaded.",
                )}
              </p>
              <Button
                variant="outline"
                onClick={() => fetchPredictorListing(sessionId)}
              >
                {tInteractive("common.retry")}
              </Button>
            </div>
          )}

          {groups.length > 0 && (
            <div className="space-y-5 rounded-xl border border-neutral-400 bg-white p-3">
              {groups.map((group) => (
                <div key={group.key} className="space-y-2.5">
                  <p className="font-aptos text-base font-medium leading-6 text-neutral-700">
                    {groupLabel(group.key)}
                  </p>
                  {group.predictors.map((predictor) => {
                    const checked = selectedPredictors.includes(predictor.id);
                    const id = `predictor-${predictor.id}`;
                    const conflictingPredictor = predictor.conflicts_with.find(
                      (other) => selectedPredictors.includes(other),
                    );
                    // Still allow unchecking if both ended up selected.
                    const isBlockedByConflict =
                      !checked && !!conflictingPredictor;
                    const disabled = isAutoPointsFlow || isBlockedByConflict;
                    const isPreviewed = preview.activeId === predictor.id;

                    return (
                      <label
                        key={id}
                        htmlFor={id}
                        className={cn(
                          "flex items-start gap-3 rounded-lg px-1 py-1.5 transition-colors",
                          disabled
                            ? "cursor-not-allowed opacity-60"
                            : "cursor-pointer hover:bg-neutral-100",
                        )}
                      >
                        <Checkbox
                          id={id}
                          checked={checked}
                          onCheckedChange={(nextChecked) =>
                            togglePredictor(predictor.id, nextChecked === true)
                          }
                          disabled={disabled}
                          className={cn(
                            "mt-0.5 border-neutral-500",
                            checked &&
                              "border-primary-pink data-[state=checked]:border-primary-pink data-[state=checked]:bg-primary-pink",
                          )}
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-row flex-wrap items-center gap-x-2 gap-y-1">
                            <p className="text-m-semibold text-text-icons-base-second">
                              {predictor.label}
                            </p>
                            {recommendedIds.includes(predictor.id) && (
                              <span className="rounded-full bg-primary-red-pink-light px-2 py-0.5 font-aptos text-xs font-semibold leading-4 text-primary-pink">
                                {translateOr(
                                  "lulcParams.optimizer.tag",
                                  "Recommended",
                                )}
                              </span>
                            )}
                          </div>
                          <p className="text-xs-regular text-text-icons-base-second">
                            {predictorSecondaryText(predictor)}
                          </p>
                          {isBlockedByConflict && (
                            <p className="text-xs-regular text-danger-600">
                              {tInteractive("lulcParams.predictorConflict", {
                                predictor: conflictingPredictor,
                              })}
                            </p>
                          )}
                        </div>
                        {!isAutoPointsFlow && (
                          <button
                            type="button"
                            aria-pressed={isPreviewed}
                            aria-label={
                              isPreviewed
                                ? translateOr("lulcParams.preview.hide", "Hide")
                                : translateOr(
                                    "lulcParams.preview.show",
                                    "Show on the map",
                                  )
                            }
                            onClick={(event) => {
                              // Inside the row's label: keep the click from
                              // ticking the checkbox.
                              event.preventDefault();
                              preview.toggle(predictor.id);
                            }}
                            className={cn(
                              "shrink-0 rounded-md p-1.5 hover:bg-neutral-100",
                              isPreviewed
                                ? "text-primary-pink"
                                : "text-neutral-700",
                            )}
                          >
                            {isPreviewed ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </button>
                        )}
                      </label>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {groups.length > 0 && <PredictorSeparabilityCard />}

          {!isAutoPointsFlow && groups.length > 0 && (
            <Button
              variant="outline"
              className="w-full"
              disabled={selectedPredictors.length === 0 || isDownloading}
              onClick={() => void downloadSelected()}
            >
              {isDownloading ? (
                <span className="loader sm"></span>
              ) : (
                <Download className="size-4" />
              )}
              {isDownloading
                ? translateOr(
                    "lulcParams.preview.downloading",
                    "Preparing the download…",
                  )
                : translateOr(
                    "lulcParams.preview.download",
                    "Download selected predictors",
                  )}
            </Button>
          )}

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
