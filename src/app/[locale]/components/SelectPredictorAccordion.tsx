import { ComingSoon } from "@/components/ComingSoon";
import {
  AccordionContent,
  AccordionFullTrigger,
  AccordionItem,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { GlobalContext } from "@/contexts/globalContext";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { showErrorToast } from "@/components/ui/error-toast";
import {
  defaultOpenPredictorGroups,
  fetchPredictorDownloadUrl,
  isNewSelectionToCheck,
  isRecommendationSelected,
  isSeparabilityStale,
  lowSampleCount,
  needsOptimizerRun,
  PREDICTOR_GROUP_FALLBACK_LABELS,
  predictorLabels,
  predictorNoteState,
  predictorSecondaryText,
  qualityScores,
  recommendedAvailableIds,
  visiblePredictorGroups,
} from "@/lib/predictorsApi";
import { cn } from "@/lib/utils";
import { saveFileFromUrl } from "@/utils/saveFileFromUrl";
import {
  ChevronDown,
  Eye,
  EyeOff,
  Lightbulb,
  RotateCcw,
  Upload,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { PredictorPreviewLegend } from "./PredictorPreviewLegend";
import {
  HintBox,
  PredictorChips,
  SectionTitle,
  SummaryBox,
  SummaryChangeLink,
  SummaryDownloadButton,
} from "./SummaryField";
import { usePredictorPreview } from "./usePredictorPreview";
import { sampleQualityOverallKey } from "./useSummaryLabels";
import { useStepNavigation } from "./useStepNavigation";
import { useTranslateOr } from "./useTranslateOr";

const LEVEL_BADGE: Record<SampleQualityOverall, string> = {
  good: "bg-success-50 text-success-700",
  med: "bg-warning-50 text-warning-700",
  poor: "bg-danger-50 text-danger-800",
};

// Small underlined action inside a note ("Run again", "Use recommended").
const NoteAction = ({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="cursor-pointer font-semibold text-primary-red-pink-normal underline hover:text-primary-red-pink-normal-active"
  >
    {children}
  </button>
);

// Step 4, first card. The predictors are chosen automatically (the optimizer
// runs when the step opens); the user adjusts the ticks and presses "Set
// Predictor", which turns the card into its summary and hands over to the
// Predictor selection quality card.
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
    predictorOptimizerProgress,
    predictorOptimizerError,
    startPredictorOptimizer,
    applyPredictorRecommendation,
    sampleQuality,
    predictorSeparability,
    checkPredictorSeparability,
    isPredictorSelectionSet,
    setIsPredictorSelectionSet,
    isReselectingPredictors,
    setIsReselectingPredictors,
    setIsPredictorQualityAccepted,
    setLULCParamsOpenAccordion,
  } = useContext(MapGenerationContext);

  // The options depend on the satellite and period chosen in step 1, which
  // may have changed since the last visit, so they are fetched every time
  // step 4 opens. On the backend this is a lookup, not an Earth Engine call.
  useEffect(() => {
    if (sessionId) fetchPredictorListing(sessionId);
  }, [sessionId]);

  // Own classification only: once the fresh list is in, run the predictor
  // optimizer unless the session already has a result for its current
  // imagery and samples. A failed run is not retried here (the note has a
  // retry link), so this cannot loop.
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

  // Which groups are open. Null until the user touches the list: until then
  // the groups holding a ticked predictor are open, so an automatic choice
  // that arrives late is never hidden in a closed group.
  const [openGroups, setOpenGroups] = useState<string[] | null>(null);
  const shownOpenGroups =
    openGroups ?? defaultOpenPredictorGroups(groups, selectedPredictors);

  const toggleGroup = (key: string) =>
    setOpenGroups(
      shownOpenGroups.includes(key)
        ? shownOpenGroups.filter((openKey) => openKey !== key)
        : [...shownOpenGroups, key],
    );

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
    // From the first tick on, the groups stay as the user sees them.
    setOpenGroups(shownOpenGroups);
    setSelectedPredictors((currentPredictors) => {
      if (checked) {
        return currentPredictors.includes(predictorId)
          ? currentPredictors
          : [...currentPredictors, predictorId];
      }

      return currentPredictors.filter((currentId) => currentId !== predictorId);
    });
  };

  // The default classification brings its own fixed predictors: nothing to
  // set there. A step opened from Your Map shows the summary, read-only.
  const canEdit = !isAutoPointsFlow && !isViewOnly;
  const showSummary = !isAutoPointsFlow && (isPredictorSelectionSet || isViewOnly);
  const isDone = isAutoPointsFlow || isPredictorSelectionSet || isViewOnly;

  const isReselecting = isReselectingPredictors && !!predictorSeparability;
  const canSetPredictors =
    !isReselecting ||
    isNewSelectionToCheck(predictorSeparability, selectedPredictors);

  const setPredictors = () => {
    const checkNow = isReselecting;

    preview.hide();
    setIsPredictorSelectionSet(true);
    setIsReselectingPredictors(false);
    // A changed selection needs a fresh look at its score.
    if (
      !predictorSeparability ||
      isSeparabilityStale(predictorSeparability.comparison, selectedPredictors)
    ) {
      setIsPredictorQualityAccepted(false);
    }
    // Like a step 1 section, the card stays open on its summary. A
    // reselection goes straight on to its new score.
    if (checkNow) {
      setLULCParamsOpenAccordion("predictor-quality");
      checkPredictorSeparability(sessionId, selectedPredictors);
    }
  };

  const changeInput = () => {
    setIsPredictorSelectionSet(false);
    setIsReselectingPredictors(false);
  };

  const selectedLabels = predictorLabels(selectedPredictors, predictorListing);

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
        <SectionTitle
          title={tInteractive("lulcParams.selectPredictor")}
          isDone={isDone}
        />
      </AccordionFullTrigger>

      {showSummary && (
        <AccordionContent className="mt-3 px-3 pb-0">
          <SummaryBox>
            <p className="font-noto-sans text-base font-bold leading-6 text-primary-red-pink-normal-active">
              {selectedLabels.length > 0
                ? tInteractive("lulcParams.predictorsSelected", {
                    X: selectedLabels.length,
                  })
                : tInteractive("lulcParams.noPredictorsSelected")}
            </p>
            {selectedLabels.length > 0 && (
              <PredictorChips labels={selectedLabels} />
            )}
            <div className="flex flex-row items-center justify-between gap-x-3">
              {selectedLabels.length > 0 ? (
                <SummaryDownloadButton
                  label={
                    isDownloading
                      ? translateOr(
                          "lulcParams.preview.downloading",
                          "Preparing the download…",
                        )
                      : translateOr(
                          "lulcParams.preview.download",
                          "Download selected predictors",
                        )
                  }
                  disabled={isDownloading}
                  onClick={() => void downloadSelected()}
                />
              ) : (
                <span />
              )}
              {canEdit && (
                <SummaryChangeLink
                  label={tInteractive("common.changeInput")}
                  onClick={changeInput}
                />
              )}
            </div>
          </SummaryBox>
        </AccordionContent>
      )}

      {!showSummary && (
        <AccordionContent className="mt-2 space-y-4 px-3 pb-0">
          <p className="text-l-medium font-aptos text-base font-normal leading-6 text-neutral-700-baru">
            {tInteractive.rich("lulcParams.selectPredictorDesc", {
              br: () => <br></br>,
            })}
          </p>

          {isReselecting && predictorSeparability ? (
            <ReselectBox
              checkedLabels={predictorLabels(
                predictorSeparability.comparison.predictors,
                predictorListing,
              )}
              score={qualityScores(sampleQuality, predictorSeparability).after}
            />
          ) : (
            canEdit && (
              <PredictorSelectionNote
                state={predictorNoteState(
                  predictorOptimizerStatus,
                  predictorRecommendation,
                )}
                percent={
                  predictorOptimizerProgress &&
                  predictorOptimizerProgress.total > 0
                    ? Math.min(
                        100,
                        Math.round(
                          (predictorOptimizerProgress.done /
                            predictorOptimizerProgress.total) *
                            100,
                        ),
                      )
                    : 0
                }
                error={predictorOptimizerError}
                hasRecommended={recommendedIds.length > 0}
                fewSamples={
                  predictorRecommendation
                    ? lowSampleCount(predictorRecommendation)
                    : null
                }
                canUseRecommended={
                  !!predictorRecommendation &&
                  recommendedIds.length > 0 &&
                  !isRecommendationSelected(
                    recommendedAvailableIds(
                      predictorRecommendation,
                      predictorListing,
                    ),
                    selectedPredictors,
                  )
                }
                onUseRecommended={() => {
                  // Show the groups the recommendation ticks.
                  setOpenGroups(null);
                  applyPredictorRecommendation();
                }}
                onRunAgain={() => startPredictorOptimizer(sessionId)}
              />
            )
          )}

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
            <div>
              {groups.map((group) => {
                const isOpen = shownOpenGroups.includes(group.key);

                return (
                  <Collapsible
                    key={group.key}
                    open={isOpen}
                    onOpenChange={() => toggleGroup(group.key)}
                  >
                    <CollapsibleTrigger className="flex w-full cursor-pointer flex-row items-center justify-between gap-x-3 py-2 text-left">
                      <p className="font-aptos text-base font-semibold leading-6 text-text-icons-base-main">
                        {groupLabel(group.key)}
                      </p>
                      <ChevronDown
                        className={cn(
                          "size-5 shrink-0 text-text-icons-base-second transition-transform duration-200",
                          isOpen && "rotate-180",
                        )}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="collapsible-content-primitive space-y-1 pb-2">
                      {group.predictors.map((predictor) => {
                        const checked = selectedPredictors.includes(
                          predictor.id,
                        );
                        const id = `predictor-${predictor.id}`;
                        const conflictingPredictor =
                          predictor.conflicts_with.find((other) =>
                            selectedPredictors.includes(other),
                          );
                        // Still allow unchecking if both ended up selected.
                        const isBlockedByConflict =
                          !checked && !!conflictingPredictor;
                        const disabled = !canEdit || isBlockedByConflict;
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
                                togglePredictor(
                                  predictor.id,
                                  nextChecked === true,
                                )
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
                                    ? translateOr(
                                        "lulcParams.preview.hide",
                                        "Hide",
                                      )
                                    : translateOr(
                                        "lulcParams.preview.show",
                                        "Show on the map",
                                      )
                                }
                                onClick={(event) => {
                                  // Inside the row's label: keep the click
                                  // from ticking the checkbox.
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
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          )}

          {canEdit && groups.length > 0 && (
            <Button
              variant="primary"
              disabled={!canSetPredictors}
              onClick={setPredictors}
            >
              {isReselecting
                ? translateOr(
                    "lulcParams.reselect.setAndCheck",
                    "Set Predictor & check score",
                  )
                : translateOr("lulcParams.setPredictor", "Set Predictor")}
            </Button>
          )}

          <div className="space-y-2">
            <p className="font-aptos text-base font-semibold leading-6 text-text-icons-base-main">
              {translateOr("lulcParams.predictorUploadTitle", "Upload Predictor")}
            </p>
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
      )}
    </AccordionItem>
  );
};

// The note above the list: what the automatic choice of predictors is doing.
const PredictorSelectionNote = ({
  state,
  percent,
  error,
  hasRecommended,
  fewSamples,
  canUseRecommended,
  onUseRecommended,
  onRunAgain,
}: {
  state: ReturnType<typeof predictorNoteState>;
  percent: number;
  error: string;
  hasRecommended: boolean;
  fewSamples: number | null;
  canUseRecommended: boolean;
  onUseRecommended: () => void;
  onRunAgain: () => void;
}) => {
  const translateOr = useTranslateOr();

  const runAgain = (
    <NoteAction onClick={onRunAgain}>
      {translateOr("lulcParams.optimizer.runAgain", "Run again")}
    </NoteAction>
  );

  if (state === "none") return null;

  if (state === "running") {
    return (
      <div className="flex flex-row items-start gap-x-2 rounded-r-md border-l-2 border-amber-400 bg-amber-50 px-3 py-2">
        <span className="loader sm mt-0.5 shrink-0"></span>
        <p className="font-aptos text-xs leading-4.5 text-text-icons-base-second">
          {translateOr(
            "lulcParams.optimizer.runningTitle",
            "Finding the best predictors for your samples",
          )}{" "}
          ({percent}%).{" "}
          {translateOr(
            "lulcParams.optimizer.keepChoosing",
            "You can keep choosing predictors meanwhile.",
          )}
        </p>
      </div>
    );
  }

  if (state === "failed") {
    return (
      <div className="flex flex-row gap-x-2 rounded-r-md border-l-2 border-danger-600 bg-danger-50 px-3 py-2">
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-danger-600" />
        <p className="font-aptos text-xs leading-4.5 text-danger-800">
          {translateOr(
            "lulcParams.optimizer.failed",
            "The recommendation could not be computed.",
          )}{" "}
          {error !== "" && <>{error} </>}
          {runAgain}
        </p>
      </div>
    );
  }

  if (state === "outdated") {
    return (
      <HintBox>
        {translateOr(
          "lulcParams.optimizer.stale",
          "Your imagery or samples changed since this was computed.",
        )}{" "}
        {runAgain}
      </HintBox>
    );
  }

  return (
    <HintBox>
      {hasRecommended
        ? translateOr(
            "lulcParams.optimizer.optimizedNote",
            "We have optimized the predictor selection based on your input from previous steps. You can still adjust the predictors as needed.",
          )
        : translateOr(
            "lulcParams.optimizer.none",
            "No extra predictor improved on the satellite bands.",
          )}
      {fewSamples !== null && hasRecommended && (
        <>
          {" "}
          {translateOr(
            "lulcParams.optimizer.fewSamples",
            "Based on few samples: the smallest class has only {count}. Treat this as a suggestion.",
            { count: fewSamples },
          )}
        </>
      )}
      {canUseRecommended && (
        <>
          {" "}
          <NoteAction onClick={onUseRecommended}>
            {translateOr("lulcParams.optimizer.useRecommended", "Use recommended")}
          </NoteAction>
        </>
      )}
    </HintBox>
  );
};

// Shown instead of the note after "No, try other predictors": what was
// checked last and how it scored.
const ReselectBox = ({
  checkedLabels,
  score,
}: {
  checkedLabels: string[];
  score: SampleQualityResult | null;
}) => {
  const tInteractive = useTranslations("InteractivePanel");
  const translateOr = useTranslateOr();

  return (
    <div className="space-y-1.5 rounded-xl border border-primary-pink/30 bg-primary-red-pink-light p-3">
      <div className="flex flex-row items-center justify-between gap-x-2">
        <div className="flex flex-row items-center gap-x-1.5">
          <RotateCcw className="size-4 shrink-0 text-primary-pink" />
          <p className="font-aptos text-base font-bold leading-6 text-primary-pink">
            {translateOr("lulcParams.reselect.title", "Reselect Predictor")}
          </p>
        </div>
        {score && (
          <span
            className={cn(
              "shrink-0 rounded-md px-2 py-0.5 font-aptos text-xs font-bold leading-4.5",
              LEVEL_BADGE[score.overall],
            )}
          >
            {tInteractive(sampleQualityOverallKey(score.overall))} ·{" "}
            {score.mean_td.toFixed(2)}
          </span>
        )}
      </div>
      <p className="font-aptos text-sm leading-5 text-text-icons-base-main">
        <span className="font-semibold">{checkedLabels.join(" · ")}</span>{" "}
        {translateOr("lulcParams.reselect.count", "({count} predictors)", {
          count: checkedLabels.length,
        })}
      </p>
      <p className="font-aptos text-xs leading-4.5 text-text-icons-base-second">
        {translateOr(
          "lulcParams.reselect.text",
          "Your last selection is kept below. Change at least one predictor, then check the score again.",
        )}
      </p>
    </div>
  );
};
