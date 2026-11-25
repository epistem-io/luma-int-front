"use client";

import {
  AccordionContent,
  AccordionFullTrigger,
  AccordionItem,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { GlobalContext } from "@/contexts/globalContext";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import {
  formatScoreDelta,
  latestScore,
  qualityCheckBlocker,
  qualityScores,
  scoreChange,
  splitScoreTileLabel,
  type ScoreDirection,
} from "@/lib/predictorsApi";
import { cn } from "@/lib/utils";
import { ArrowRight, ChevronDown, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { ReactNode, useContext } from "react";
import {
  HintBox,
  SectionTitle,
  SummaryBox,
  SummaryChangeLink,
  SummaryField,
} from "./SummaryField";
import { sampleQualityOverallKey } from "./useSummaryLabels";
import { useStepFourProgress } from "./useStepFourProgress";
import { useStepNavigation } from "./useStepNavigation";
import { useTranslateOr } from "./useTranslateOr";

const LEVEL_STYLE: Record<
  SampleQualityOverall,
  { card: string; text: string }
> = {
  good: { card: "bg-success-50", text: "text-success-700" },
  med: { card: "bg-warning-50", text: "text-warning-700" },
  poor: { card: "bg-danger-50", text: "text-danger-800" },
};

// The tab above a column: a stronger tint of the column's colour, with a
// border, so it reads on the dark header.
const TAB_STYLE: Record<SampleQualityOverall, string> = {
  good: "border-[#7CC4A4] bg-[#A9DCC4] text-[#17603F]",
  med: "border-[#E2CF7A] bg-[#F5E7A5] text-[#8A6100]",
  poor: "border-[#E58E8E] bg-[#F5B8B8] text-[#8B1E1E]",
};

const DELTA_STYLE: Record<ScoreDirection, string> = {
  up: "bg-success-50 text-success-700",
  same: "bg-neutral-100 text-text-icons-base-second",
  down: "bg-danger-50 text-danger-800",
};

const VERDICT: Record<ScoreDirection, { key: string; fallback: string }> = {
  up: {
    key: "lulcParams.quality.wentUp",
    fallback:
      "Your score went up after selecting predictors. Continue, or try other predictors to push it further.",
  },
  same: {
    key: "lulcParams.quality.noChange",
    fallback:
      "Your score did not change with these predictors. Continue, or try other predictors.",
  },
  down: {
    key: "lulcParams.quality.wentDown",
    fallback:
      "Your score went down with these predictors. Try other predictors, or continue anyway.",
  },
};

// Step 4, second card: the sample score with the set predictors (right)
// beside the score from step 3 (left), both as Mean TD. "Yes, continue"
// ticks the card and turns it into a summary of the accepted score.
export const PredictorQualityAccordion = () => {
  const tInteractive = useTranslations("InteractivePanel");
  const translateOr = useTranslateOr();
  const { sessionId } = useContext(GlobalContext);
  const { isViewOnly } = useStepNavigation();
  const {
    isAutoPointsFlow,
    selectedPredictors,
    sampleQuality,
    predictorSeparability,
    predictorSeparabilityError,
    checkPredictorSeparability,
    isPredictorSelectionSet,
    setIsPredictorSelectionSet,
    setIsReselectingPredictors,
    setIsPredictorQualityAccepted,
    setLULCParamsOpenAccordion,
  } = useContext(MapGenerationContext);
  const { scoreState: state, quality: isDone } = useStepFourProgress();

  // The default classification does not use predictors.
  if (isAutoPointsFlow) return null;

  // Only a check of the current ticks is compared; otherwise the left
  // column falls back to the score from step 3.
  const { before, after } = qualityScores(
    sampleQuality,
    state === "result" ? predictorSeparability : null,
  );
  const change = scoreChange(before, after);
  // With both scores in, the question about them is shown.
  const hasVerdict = !!(before && after && change);
  const blocker = qualityCheckBlocker({
    isSet: isPredictorSelectionSet,
    selected: selectedPredictors,
  });

  // What the ticked card sums up: the accepted score, or the one from step 3
  // when there are no predictors to score.
  const summaryScore = latestScore(
    sampleQuality,
    predictorSeparability,
    selectedPredictors,
  );

  const check = () => checkPredictorSeparability(sessionId, selectedPredictors);

  const tryOtherPredictors = () => {
    setIsPredictorQualityAccepted(false);
    setIsPredictorSelectionSet(false);
    setIsReselectingPredictors(true);
    setLULCParamsOpenAccordion("predictor");
  };

  const acceptScore = () => {
    setIsPredictorQualityAccepted(true);
    setLULCParamsOpenAccordion("random-forest");
  };

  const overallLabel = (result: SampleQualityResult) =>
    tInteractive(sampleQualityOverallKey(result.overall));

  const recheckButton = !isViewOnly && (
    <div className="space-y-1.5">
      <Button variant="primary" disabled={blocker !== null} onClick={check}>
        {translateOr("lulcParams.quality.recheck", "Re-Check Score")}
      </Button>
      {blocker !== null && (
        <p className="font-aptos text-xs leading-4.5 text-text-icons-base-second">
          {blocker === "notSet"
            ? translateOr(
                "lulcParams.quality.needSet",
                "Set your predictors first.",
              )
            : translateOr(
                "lulcParams.quality.needPredictors",
                "Select at least one predictor to compare scores.",
              )}
        </p>
      )}
    </div>
  );

  return (
    <AccordionItem
      value="predictor-quality"
      className="rounded-xl border border-neutral-400 bg-white pb-3 last:border-b"
    >
      <AccordionFullTrigger
        icon={
          <ChevronDown className="h-5 w-5 shrink-0 text-primary-pink transition-transform duration-200" />
        }
        className="hover:no-underline p-3 pb-0"
      >
        <SectionTitle
          title={translateOr(
            "lulcParams.quality.title",
            "Predictor selection quality",
          )}
          isDone={isDone}
        />
      </AccordionFullTrigger>

      {isDone && (
        <AccordionContent className="mt-3 px-3 pb-0">
          <SummaryBox>
            {selectedPredictors.length === 0 && (
              <p className="font-aptos text-[15px] leading-5.5 text-text-icons-base-second">
                {translateOr(
                  "lulcParams.quality.noPredictors",
                  "No predictors are selected, so there is no new score to compare.",
                )}
              </p>
            )}
            {summaryScore && (
              <QualityScoreFields
                score={summaryScore}
                action={
                  !isViewOnly &&
                  selectedPredictors.length > 0 && (
                    <SummaryChangeLink
                      label={translateOr(
                        "lulcParams.quality.editScore",
                        "Edit Score",
                      )}
                      onClick={() => setIsPredictorQualityAccepted(false)}
                    />
                  )
                }
              />
            )}
          </SummaryBox>
        </AccordionContent>
      )}

      {!isDone && (
      <AccordionContent className="mt-2 space-y-4 px-3 pb-0">
        <p className="text-l-medium font-aptos text-base font-normal leading-6 text-neutral-700-baru">
          {tInteractive("dataTraining.sampleQualityDescription")}
        </p>

        <HintBox>
          {translateOr(
            "lulcParams.quality.note",
            "Change your predictors and re-check as often as you like to improve the score. Classification Model Training settings don't affect this score.",
          )}
        </HintBox>

        {/* One panel: the question about the score sits on top of the
            comparison it is about. Before a check there is no question
            and the comparison stands alone. */}
        <div
          className={cn(
            "overflow-hidden rounded-xl",
            hasVerdict &&
              "border border-primary-pink/30 bg-primary-red-pink-light",
          )}
        >
        {before && after && change && (
          <div className="space-y-2.5 p-3">
            <div className="flex flex-row flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <p className="font-aptos text-base font-bold leading-6 text-text-icons-base-main">
                {translateOr(
                  "lulcParams.quality.happyTitle",
                  "Happy with this score?",
                )}
              </p>
              <div className="flex flex-row items-center gap-x-1.5 font-aptos text-[13px] font-bold leading-5">
                <span className={LEVEL_STYLE[before.overall].text}>
                  {overallLabel(before)} {before.mean_td.toFixed(2)}
                </span>
                <ArrowRight className="size-3.5 shrink-0 text-text-icons-base-second" />
                <span className={LEVEL_STYLE[after.overall].text}>
                  {overallLabel(after)} {after.mean_td.toFixed(2)}
                </span>
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-xs leading-4",
                    DELTA_STYLE[change.direction],
                  )}
                >
                  {formatScoreDelta(change.delta)}
                </span>
              </div>
            </div>
            <p className="font-aptos text-sm leading-5 text-text-icons-base-second">
              {translateOr(
                VERDICT[change.direction].key,
                VERDICT[change.direction].fallback,
              )}
            </p>
            {!isViewOnly && (
              <div className="grid grid-cols-2 gap-x-3">
                <Button
                  variant="primary"
                  className="bg-primary-pink/60 hover:bg-primary-pink/70"
                  onClick={tryOtherPredictors}
                >
                  {translateOr(
                    "lulcParams.quality.tryOthers",
                    "No, Try other predictors",
                  )}
                </Button>
                <Button variant="primary" onClick={acceptScore}>
                  {translateOr("lulcParams.quality.continue", "Yes, continue")}
                </Button>
              </div>
            )}
          </div>
        )}

        <div className={cn("overflow-hidden", hasVerdict && "rounded-t-xl")}>
          {/* The bottom strip (pb-3) is where the columns slide up over the
              header, so their rounded top corners show against it. */}
          <div className="relative overflow-hidden bg-[#313131] pt-3 pb-3">
            {/* Same artwork as the score banner in step 3. */}
            <Image
              src="/images/banner-generate.svg"
              alt=""
              width={232}
              height={84}
              unoptimized
              className="pointer-events-none select-none absolute -top-3 right-0 z-0 h-auto w-[232px]"
            />
            <div className="relative z-10 flex flex-row items-center gap-x-2 px-3 pb-3">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-white">
                <Star className="size-3 text-white" strokeWidth={2.5} />
              </span>
              <p className="font-aptos text-lg font-bold leading-6 text-white">
                {translateOr(
                  "lulcParams.quality.compareTitle",
                  "Compare Data Training Score",
                )}
              </p>
            </div>
            <div className="relative z-10 grid grid-cols-2">
              <ColumnTab
                label={translateOr(
                  "lulcParams.quality.fromStep3",
                  "Sample Quality from Step 3:",
                )}
                level={before?.overall}
              />
              <ColumnTab
                label={translateOr(
                  "lulcParams.quality.fromStep4",
                  "Sample Quality from Step 4:",
                )}
                level={after?.overall}
              />
            </div>
          </div>

          <div className="relative z-10 -mt-3 grid grid-cols-2">
            {before ? (
              <ScoreColumn result={before} side="left" />
            ) : (
              <EmptyColumn
                side="left"
                title={translateOr(
                  "lulcParams.quality.noStep3Title",
                  "No score from step 3",
                )}
                text={translateOr(
                  "lulcParams.quality.noStep3Text",
                  "You did not check your sample score in step 3. It is filled in when you check the score here.",
                )}
              />
            )}

            {state === "result" && after && (
              <ScoreColumn result={after} side="right" />
            )}

            {state === "loading" && (
              <EmptyColumn
                side="right"
                title={translateOr(
                  "lulcParams.quality.loading",
                  "Checking the score with your predictors…",
                )}
              >
                <span className="loader sm"></span>
              </EmptyColumn>
            )}

            {state === "error" && (
              <EmptyColumn
                side="right"
                title={translateOr(
                  "lulcParams.quality.failed",
                  "The score check failed.",
                )}
                text={predictorSeparabilityError}
              >
                {recheckButton}
              </EmptyColumn>
            )}

            {(state === "empty" || state === "outdated") && (
              <EmptyColumn
                side="right"
                title={
                  state === "outdated"
                    ? translateOr(
                        "lulcParams.quality.outdatedTitle",
                        "Predictors changed",
                      )
                    : translateOr(
                        "lulcParams.quality.emptyTitle",
                        "No new score yet",
                      )
                }
                text={
                  state === "outdated"
                    ? translateOr(
                        "lulcParams.quality.outdatedText",
                        "Your predictors changed since the last check. Check the score again to compare.",
                      )
                    : translateOr(
                        "lulcParams.quality.emptyText",
                        "Check your training data quality with the predictors you selected in Step 4, then compare it with your Step 3 score.",
                      )
                }
              >
                {recheckButton}
                {/* Two blank sheets: nothing has been scored yet. */}
                <Image
                  src="/images/score-empty.svg"
                  alt=""
                  width={111}
                  height={80}
                  unoptimized
                  className="pointer-events-none h-20 w-auto select-none"
                />
              </EmptyColumn>
            )}
          </div>
        </div>
        </div>
      </AccordionContent>
      )}
    </AccordionItem>
  );
};

// Score, Mean TD and the classes note of one score, as summary fields. Used
// by this card once it is ticked and by step 4's last screen.
export const QualityScoreFields = ({
  score,
  action,
}: {
  score: SampleQualityResult;
  /** Sits at the right of the last row (the "Edit Score" link). */
  action?: ReactNode;
}) => {
  const t = useTranslations("InteractivePanel");
  const translateOr = useTranslateOr();

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 gap-x-4">
        <SummaryField
          label={translateOr("lulcParams.quality.score", "Score")}
          value={t(sampleQualityOverallKey(score.overall))}
        />
        <SummaryField
          label={t("dataTraining.sampleQualityMeanTD")}
          value={score.mean_td.toFixed(2)}
        />
      </div>
      <div className="flex flex-row items-end justify-between gap-x-3">
        <SummaryField
          label={translateOr("lulcParams.quality.summaryNote", "Note")}
          value={t("dataTraining.sampleQualityClassesCaption", {
            X: score.classes_good,
            Y: score.classes_analyzed ?? score.classes_total,
          })}
        />
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
};

// The coloured label above a column, sitting on the dark header: narrower
// than the column, like a folder tab.
const ColumnTab = ({
  label,
  level,
}: {
  label: string;
  level?: SampleQualityOverall;
}) => (
  <div
    className={cn(
      "mx-4 flex items-center justify-center rounded-t-lg border border-b-0 px-2 py-1.5 text-center font-aptos text-[11px] font-bold leading-4",
      level
        ? TAB_STYLE[level]
        : "border-neutrals-400 bg-neutrals-300 text-text-icons-base-second",
    )}
  >
    {label}
  </div>
);

// The outer top corner of a column is rounded; the inner one is square,
// so the two columns read as one sheet.
const COLUMN_CORNER = { left: "rounded-tl-xl", right: "rounded-tr-xl" };

// A column without a score: a short message, and what to do about it.
const EmptyColumn = ({
  side,
  title,
  text,
  children,
}: {
  side: "left" | "right";
  title: string;
  text?: string;
  children?: ReactNode;
}) => (
  <div className={cn("bg-neutral-100 p-2", COLUMN_CORNER[side])}>
    <div className="flex h-full flex-col items-center gap-y-3 rounded-lg bg-white px-3 py-5 text-center">
      <p className="font-aptos text-sm font-bold leading-5 text-text-icons-base-main">
        {title}
      </p>
      {text && (
        <p className="font-aptos text-xs leading-4.5 text-text-icons-base-second">
          {text}
        </p>
      )}
      {children}
    </div>
  </div>
);

// The step 3 score card, narrowed to half the panel.
const ScoreColumn = ({
  result,
  side,
}: {
  result: SampleQualityResult;
  side: "left" | "right";
}) => {
  const t = useTranslations("InteractivePanel");
  const style = LEVEL_STYLE[result.overall];
  const lowSampleClasses = result.low_sample_classes ?? [];

  return (
    <div className={cn("space-y-2 p-3", style.card, COLUMN_CORNER[side])}>
      <div className="flex flex-row items-start justify-between gap-x-2">
        <p
          className={cn(
            "font-noto-sans text-3xl font-bold leading-9 tracking-[-0.32px]",
            style.text,
          )}
        >
          {t(sampleQualityOverallKey(result.overall))}
        </p>
        <div className="text-right">
          <p className="font-aptos text-[10px] leading-3.5 text-text-icons-base-second">
            {t("dataTraining.sampleQualityMeanTD")}
          </p>
          <p
            className={cn(
              "font-noto-sans text-base font-bold leading-5",
              style.text,
            )}
          >
            {result.mean_td.toFixed(2)}
          </p>
        </div>
      </div>

      <p className={cn("font-aptos text-xs leading-4.5", style.text)}>
        {t("dataTraining.sampleQualityClassesCaption", {
          X: result.classes_good,
          Y: result.classes_analyzed ?? result.classes_total,
        })}
      </p>

      {lowSampleClasses.length > 0 && (
        <div className="space-y-1 rounded-md bg-white px-2.5 py-2 font-aptos text-xs leading-4.5 text-text-icons-base-main">
          <p className="font-bold">{t("dataTraining.sampleQualityLowSamples")}</p>
          <ul className="list-disc space-y-0.5 pl-4">
            {lowSampleClasses.map((item) => (
              <li key={`quality-low-${item.class_id}`}>
                {t("dataTraining.sampleQualityLowSampleItem", {
                  X: item.class_name,
                  Y: item.pixels,
                })}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-3 gap-x-1.5">
        {(
          [
            ["dataTraining.sampleQualityGoodTile", "good", "text-success-700"],
            ["dataTraining.sampleQualityWeakTile", "weak", "text-warning-700"],
            ["dataTraining.sampleQualityPoorTile", "poor", "text-danger-800"],
          ] as const
        ).map(([labelKey, countKey, countStyle]) => {
          const [name, range] = splitScoreTileLabel(t(labelKey));

          return (
          <div
            key={countKey}
            className="flex flex-col gap-y-0.5 rounded-md bg-white/60 px-1 py-1.5 text-center"
          >
            <p className="font-aptos text-[11px] leading-4 text-text-icons-base-second">
              {name}
              {range !== "" && (
                <>
                  <br />
                  {range}
                </>
              )}
            </p>
            <p
              className={cn(
                "mt-auto font-noto-sans text-lg font-bold leading-6",
                countStyle,
              )}
            >
              {result.pair_counts[countKey]}
            </p>
          </div>
          );
        })}
      </div>
    </div>
  );
};
