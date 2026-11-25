import {
  PREDICTOR_AVAILABLE_URL,
  PREDICTOR_DOWNLOAD_URL,
  PREDICTOR_OPTIMIZE_URL,
  PREDICTOR_PREVIEW_URL,
  TRAINING_DATA_SEPARABILITY_URL,
} from "@/constants";

// Step 4's predictor options come from the backend, which knows what the
// session's satellite and period support (GET /luma/predictor/available).

// Shown for a group whose translation key does not exist yet. Translations
// are served by Tolgee, so a new group can reach the UI before its key does.
export const PREDICTOR_GROUP_FALLBACK_LABELS: Record<string, string> = {
  vegetation: "Vegetation",
  waterHumidity: "Water & humidity",
  landBuiltUp: "Land & built-up",
  terrain: "Terrain",
  radar: "Radar",
  distance: "Distance & accessibility",
  other: "Other",
};

const errorMessageFrom = (body: unknown, status: number) => {
  if (typeof body === "object" && body !== null) {
    const { message, error } = body as {
      message?: unknown;
      error?: { message?: unknown } | null;
    };
    if (typeof error?.message === "string" && error.message.trim()) {
      return error.message;
    }
    if (typeof message === "string" && message.trim()) return message;
  }
  return `Request failed (${status})`;
};

export const fetchAvailablePredictors = async (
  sessionId: string,
): Promise<PredictorListing> => {
  const params = new URLSearchParams({ session_id: sessionId });
  const response = await fetch(`${PREDICTOR_AVAILABLE_URL}?${params}`);

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(errorMessageFrom(body, response.status));
  }

  const results = (body as { results?: PredictorListing } | null)?.results;
  if (!results || !Array.isArray(results.groups)) {
    throw new Error("Unexpected response from the predictor list");
  }
  return results;
};

/** Groups as step 4 shows them: available predictors only, empty groups dropped. */
export const visiblePredictorGroups = (
  listing: PredictorListing | null,
): PredictorGroup[] =>
  (listing?.groups ?? [])
    .map((group) => ({
      ...group,
      predictors: group.predictors.filter((predictor) => predictor.available),
    }))
    .filter((group) => group.predictors.length > 0);

/**
 * The selection without ids the listing no longer offers (an old checkpoint,
 * or the satellite or period changed). Returns the same array when nothing
 * is dropped, so it is safe to pass straight to a state setter.
 */
export const pruneSelectedPredictors = (
  selected: string[],
  listing: PredictorListing,
): string[] => {
  const available = new Set(
    visiblePredictorGroups(listing).flatMap((group) =>
      group.predictors.map((predictor) => predictor.id),
    ),
  );
  const kept = selected.filter((id) => available.has(id));
  return kept.length === selected.length ? selected : kept;
};

/**
 * Labels of the selected predictors in listing order. An id the listing does
 * not know (or any id while the listing is not loaded) shows as itself.
 */
export const predictorLabels = (
  selected: string[],
  listing: PredictorListing | null,
): string[] => {
  const options = (listing?.groups ?? []).flatMap((group) => group.predictors);
  const known = new Set(options.map((predictor) => predictor.id));

  return [
    ...options
      .filter((predictor) => selected.includes(predictor.id))
      .map((predictor) => predictor.label),
    ...selected.filter((id) => !known.has(id)),
  ];
};

/** The line under a predictor's label: its long name, or what it measures. */
export const predictorSecondaryText = (predictor: PredictorOption) =>
  predictor.long_name && predictor.long_name !== predictor.label
    ? predictor.long_name
    : predictor.description;

// ---------------------------------------------------------------------------
// Predictor optimizer (GET /luma/predictor/optimize): an NDJSON stream shaped
// like /luma/lulc-map ({process, data, w, a, next}) that ends with the
// recommended predictors.

export interface OptimizerProgress {
  /** Progress so far, out of `total` (the stream's `a` and `w`). */
  done: number;
  total: number;
  /** The process running now, as the backend names it. */
  process: string;
}

export type OptimizerEvent =
  | { kind: "progress"; progress: OptimizerProgress }
  | { kind: "done"; recommendation: PredictorRecommendation }
  | { kind: "error"; message: string };

const SELECT_PROCESS = "select predictors";

/** Splits buffered NDJSON text into its complete lines and the unfinished tail. */
export const splitNdjson = (buffer: string) => {
  const parts = buffer.split("\n");
  const rest = parts.pop() ?? "";
  return {
    lines: parts.map((part) => part.trim()).filter(Boolean),
    rest,
  };
};

/** Folds one stream line into the progress so far. */
export const applyOptimizerLine = (
  progress: OptimizerProgress,
  line: GenerateMapStream,
): OptimizerEvent => {
  const data = (line.data ?? {}) as {
    message?: unknown;
    recommendation?: PredictorRecommendation | null;
  };

  if (line.process === "error") {
    return {
      kind: "error",
      message:
        typeof data.message === "string" && data.message
          ? data.message
          : "The predictor optimizer failed",
    };
  }

  if (line.process === "end") {
    return data.recommendation
      ? { kind: "done", recommendation: data.recommendation }
      : { kind: "error", message: "The predictor optimizer returned no result" };
  }

  // Sent while Earth Engine is busy, only to keep the connection open.
  if (line.process === "heartbeat") return { kind: "progress", progress };

  return {
    kind: "progress",
    progress: {
      done: progress.done + (line.a || 0),
      total: line.w || progress.total,
      // A line reports a finished process and names the next one. The
      // selection step reports once per model fit and is still running.
      process:
        line.process === SELECT_PROCESS
          ? SELECT_PROCESS
          : line.next || line.process,
    },
  };
};

/**
 * Runs the optimizer and resolves with its recommendation. Rejects with the
 * backend's message when the run is refused, fails midway (an `error` line)
 * or the stream ends early. Abort through `signal` to stop the run: the
 * backend then stops computing too.
 */
export const streamPredictorOptimizer = async (
  sessionId: string,
  handlers: { onProgress: (progress: OptimizerProgress) => void },
  signal?: AbortSignal,
): Promise<PredictorRecommendation> => {
  const params = new URLSearchParams({ session_id: sessionId });
  const response = await fetch(`${PREDICTOR_OPTIMIZE_URL}?${params}`, {
    signal,
  });

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    throw new Error(errorMessageFrom(body, response.status));
  }
  if (!response.body) {
    throw new Error("The predictor optimizer sent no data");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let progress: OptimizerProgress = { done: 0, total: 0, process: "" };

  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += done
        ? decoder.decode()
        : decoder.decode(value, { stream: true });

      // At the end, a last line without a trailing newline still counts.
      const { lines, rest } = splitNdjson(done ? `${buffer}\n` : buffer);
      buffer = rest;

      for (const text of lines) {
        const event = applyOptimizerLine(
          progress,
          JSON.parse(text) as GenerateMapStream,
        );
        if (event.kind === "done") return event.recommendation;
        if (event.kind === "error") throw new Error(event.message);
        progress = event.progress;
        handlers.onProgress(progress);
      }

      if (done) break;
    }
  } finally {
    void reader.cancel().catch(() => {});
  }

  throw new Error("The predictor optimizer stopped before finishing");
};

/** A run is needed when there is no result yet or it is out of date. */
export const needsOptimizerRun = (
  recommendation: PredictorRecommendation | null | undefined,
) => !recommendation || recommendation.stale;

/**
 * With fewer samples than this in its smallest class, a recommendation is
 * weak evidence: a few points are easy to tell apart by where they are.
 */
export const LOW_SAMPLE_CLASS_THRESHOLD = 10;

/**
 * The sample count of the smallest class behind a recommendation when it is
 * below the threshold; null when every class has enough, or the counts are
 * not known.
 */
export const lowSampleCount = (
  recommendation: PredictorRecommendation,
): number | null => {
  const counts = Object.values(recommendation.samples?.per_class ?? {});
  if (counts.length === 0) return null;
  const smallest = Math.min(...counts);
  return smallest < LOW_SAMPLE_CLASS_THRESHOLD ? smallest : null;
};

/**
 * Which recommendation to keep when the listing brings the saved one. A
 * listing requested just before a run finished can arrive after it with the
 * older result; the newer one wins. The same result is replaced, because the
 * listing carries its up-to-date `stale` flag.
 */
export const latestRecommendation = (
  current: PredictorRecommendation | null,
  incoming: PredictorRecommendation | null | undefined,
) => {
  if (!incoming) return current;
  if (!current) return incoming;
  return incoming.created >= current.created ? incoming : current;
};

/** The recommended ids that the listing still offers, in recommended order. */
export const recommendedAvailableIds = (
  recommendation: PredictorRecommendation,
  listing: PredictorListing | null,
): string[] =>
  listing
    ? [...pruneSelectedPredictors(recommendation.recommended, listing)]
    : [];

/** Whether the selection is exactly the recommendation. */
export const isRecommendationSelected = (
  recommended: string[],
  selected: string[],
) =>
  recommended.length > 0 &&
  recommended.length === selected.length &&
  recommended.every((id) => selected.includes(id));

/**
 * Whether a recommendation should be ticked automatically: only a current
 * one, only into an empty selection, and each result only once, so that a
 * user who clears the selection on purpose keeps it empty.
 */
export const shouldAutoApplyRecommendation = (input: {
  recommendation: PredictorRecommendation | null | undefined;
  selected: string[];
  /** `created` of the last result that was applied automatically. */
  appliedCreated: string | null;
}) =>
  !!input.recommendation &&
  !input.recommendation.stale &&
  input.recommendation.recommended.length > 0 &&
  input.selected.length === 0 &&
  input.recommendation.created !== input.appliedCreated;

// ---------------------------------------------------------------------------
// Preview on the map (GET /luma/predictor/preview) and GeoTIFF download
// (GET /luma/predictor/download-url).

export interface PredictorPreviewOutcome {
  /** The tile layer and its legend; null when the backend could not produce it. */
  layer: PredictorPreviewLayer | null;
  /** Why there is no layer (for example no radar scene in the period). */
  reason: string;
}

const getResults = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(errorMessageFrom(body, response.status));
  }

  const results = (body as { results?: T } | null)?.results;
  if (!results) throw new Error("Unexpected response");
  return results;
};

/** One predictor per request, so that each preview stays fast. */
export const fetchPredictorPreview = async (
  sessionId: string,
  predictorId: string,
): Promise<PredictorPreviewOutcome> => {
  const params = new URLSearchParams({
    session_id: sessionId,
    predictors: predictorId,
  });
  const results = await getResults<{
    layers?: PredictorPreviewLayer[];
    skipped?: PredictorSkipped[];
  }>(`${PREDICTOR_PREVIEW_URL}?${params}`);

  const layer = results.layers?.find((item) => item.id === predictorId);
  if (layer) return { layer, reason: "" };

  const skipped = results.skipped?.find((item) => item.id === predictorId);
  if (skipped) return { layer: null, reason: skipped.reason };

  throw new Error("Unexpected response from the predictor preview");
};

/** `download_url` is "" when Earth Engine refuses the size of the request. */
export const fetchPredictorDownloadUrl = (
  sessionId: string,
  predictorIds: string[],
): Promise<PredictorDownloadResult> => {
  const params = new URLSearchParams({
    session_id: sessionId,
    predictors: predictorIds.join(","),
  });
  return getResults<PredictorDownloadResult>(
    `${PREDICTOR_DOWNLOAD_URL}?${params}`,
  );
};

/** CSS background of a legend's colour ramp, low to high. */
export const legendGradient = (palette: string[]) => {
  const stops = palette.length === 1 ? [palette[0], palette[0]] : palette;
  return `linear-gradient(to right, ${stops.join(", ")})`;
};

/** A legend number without noise: 0.1135 -> "0.11", 12.34 -> "12.3", 1520.4 -> "1520". */
export const formatLegendValue = (value: number) => {
  const magnitude = Math.abs(value);
  const decimals = magnitude >= 100 ? 0 : magnitude >= 10 ? 1 : 2;
  return String(Number(value.toFixed(decimals)));
};

// ---------------------------------------------------------------------------
// Separability with predictors (GET /luma/training-data/separability with
// ?predictors=): the usual result computed on the satellite bands plus the
// ticked predictors, and a before/after comparison.

export const fetchPredictorSeparability = async (
  sessionId: string,
  predictorIds: string[],
): Promise<PredictorSeparabilityResult> => {
  const params = new URLSearchParams({
    session_id: sessionId,
    predictors: predictorIds.join(","),
  });
  const response = await fetch(`${TRAINING_DATA_SEPARABILITY_URL}?${params}`);

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(errorMessageFrom(body, response.status));
  }

  const { sample_quality, comparison } = (body ?? {}) as {
    sample_quality?: SampleQualityResult | null;
    comparison?: PredictorSeparabilityComparison | null;
  };
  // Null when the backend had nothing to analyse (fewer than two classes,
  // or no sample on valid imagery).
  if (!comparison) {
    throw new Error("The analysis returned no result for these samples");
  }
  return { sample_quality: sample_quality ?? null, comparison };
};

/** A change in the overall score smaller than this counts as no change. */
export const SEPARABILITY_CHANGE_THRESHOLD = 0.02;

export type SeparabilityVerdict = "better" | "same" | "worse" | "unknown";

/** What the predictors did to class separability, from the change in the overall score. */
export const separabilityVerdict = (
  change: number | null | undefined,
): SeparabilityVerdict => {
  if (change === null || change === undefined) return "unknown";
  if (change >= SEPARABILITY_CHANGE_THRESHOLD) return "better";
  if (change <= -SEPARABILITY_CHANGE_THRESHOLD) return "worse";
  return "same";
};

/** The satellite-bands-only set and the with-predictors set of a comparison. */
export const separabilitySets = (
  comparison: PredictorSeparabilityComparison,
) => ({
  before: comparison.sets.find((set) => set.key === "composite") ?? null,
  after: comparison.sets.find((set) => set.key === "with_predictors") ?? null,
});

/**
 * Whether a check no longer matches the ticked predictors. A predictor the
 * backend had to skip still counts as analysed: checking again would skip
 * it again.
 */
export const isSeparabilityStale = (
  comparison: PredictorSeparabilityComparison,
  selected: string[],
) => {
  const analysed = new Set([
    ...comparison.predictors,
    ...comparison.skipped.map((item) => item.id),
  ]);
  return (
    analysed.size !== selected.length ||
    selected.some((id) => !analysed.has(id))
  );
};

export const formatScore = (value: number) => value.toFixed(2);

export const formatShare = (ratio: number) => `${Math.round(ratio * 100)}%`;

// ---------------------------------------------------------------------------
// Step 4 layout: the Predictor Selection card and the Predictor selection
// quality card, which sets the score with predictors beside the score from
// step 3 (both are the usual Mean TD summary).

/** What the note at the top of the Predictor Selection card is about. */
export type PredictorNoteState =
  | "running"
  | "failed"
  | "outdated"
  | "ready"
  | "none";

/** Follows the automatic choice of predictors. */
export const predictorNoteState = (
  status: "idle" | "running" | "error",
  recommendation: PredictorRecommendation | null | undefined,
): PredictorNoteState => {
  if (status === "running") return "running";
  if (status === "error") return "failed";
  if (!recommendation) return "none";
  return recommendation.stale ? "outdated" : "ready";
};

/**
 * The groups shown open until the user opens or closes one: those that hold
 * a ticked predictor, so an automatic choice is never hidden in a closed
 * group, or the first group when nothing is ticked.
 */
export const defaultOpenPredictorGroups = (
  groups: PredictorGroup[],
  selected: string[],
): string[] => {
  const withTicks = groups
    .filter((group) =>
      group.predictors.some((predictor) => selected.includes(predictor.id)),
    )
    .map((group) => group.key);
  if (withTicks.length > 0) return withTicks;
  return groups.length > 0 ? [groups[0].key] : [];
};

/**
 * The two scores the quality card compares. Before a step 4 check, the left
 * one is the score from step 3 (when the user ran it there). A check returns
 * the satellite-bands-only score of the same run, which then replaces it so
 * that both sides are computed the same way.
 */
export const qualityScores = (
  stepThree: SampleQualityResult | null,
  check: PredictorSeparabilityResult | null,
): { before: SampleQualityResult | null; after: SampleQualityResult | null } => {
  if (!check) return { before: stepThree, after: null };

  const sets = separabilitySets(check.comparison);
  return {
    before: sets.before?.td ?? stepThree,
    after: sets.after?.td ?? check.sample_quality,
  };
};

export type ScoreDirection = "up" | "same" | "down";

/**
 * The change in Mean TD from the left score to the right one, at the two
 * decimals the scores are shown with.
 */
export const scoreChange = (
  before: SampleQualityResult | null,
  after: SampleQualityResult | null,
): { delta: number; direction: ScoreDirection } | null => {
  if (!before || !after) return null;

  // + 0 turns a rounded -0 into 0.
  const delta = Math.round((after.mean_td - before.mean_td) * 100) / 100 + 0;
  return {
    delta,
    direction: delta > 0 ? "up" : delta < 0 ? "down" : "same",
  };
};

/** "+0.52", "-0.12", "0.00". */
export const formatScoreDelta = (delta: number) =>
  `${delta > 0 ? "+" : ""}${delta.toFixed(2)}`;

export type StepFourScoreState =
  | "loading"
  | "error"
  | "result"
  | "outdated"
  | "empty";

/** What the "Sample Quality from Step 4" column shows. */
export const stepFourScoreState = (input: {
  isLoading: boolean;
  error: string;
  check: PredictorSeparabilityResult | null;
  selected: string[];
}): StepFourScoreState => {
  if (input.isLoading) return "loading";
  if (input.error !== "") return "error";
  if (!input.check) return "empty";
  return isSeparabilityStale(input.check.comparison, input.selected)
    ? "outdated"
    : "result";
};

/** Why the score cannot be checked yet; null when it can. */
export const qualityCheckBlocker = (input: {
  /** "Set Predictor" was pressed for the current ticks. */
  isSet: boolean;
  selected: string[];
}): "notSet" | "noPredictors" | null => {
  if (!input.isSet) return "notSet";
  if (input.selected.length === 0) return "noPredictors";
  return null;
};

/**
 * Reselecting: "Set Predictor & check score" needs at least one ticked
 * predictor and a selection that differs from the one last checked.
 */
export const isNewSelectionToCheck = (
  check: PredictorSeparabilityResult | null,
  selected: string[],
) =>
  selected.length > 0 &&
  (!check || isSeparabilityStale(check.comparison, selected));

/**
 * The score the user ended up with: the one with predictors when the ticked
 * predictors were checked, otherwise the one from step 3. Null when no score
 * was ever computed.
 */
export const latestScore = (
  stepThree: SampleQualityResult | null,
  check: PredictorSeparabilityResult | null,
  selected: string[],
): SampleQualityResult | null => {
  const current =
    check && !isSeparabilityStale(check.comparison, selected) ? check : null;
  const { before, after } = qualityScores(stepThree, current);
  return after ?? before;
};

/**
 * Step 4's three cards: which are done (ticked), and whether Next may be
 * pressed, which needs all three.
 */
export const stepFourProgress = (input: {
  isAutoPointsFlow: boolean;
  /** "Set Predictor" was pressed. */
  isSelectionSet: boolean;
  selected: string[];
  /** "Yes, continue" was pressed on the score comparison. */
  isQualityAccepted: boolean;
  scoreState: StepFourScoreState;
  /** "Set Variable" was pressed. */
  isModelSet: boolean;
}) => {
  // The default classification fixes the predictors and the model settings.
  if (input.isAutoPointsFlow) {
    return { selection: true, quality: true, model: true, canContinue: true };
  }

  const selection = input.isSelectionSet;
  // Without predictors there is no new score to compare, so none is needed.
  const quality =
    selection &&
    (input.selected.length === 0 ||
      (input.isQualityAccepted && input.scoreState === "result"));
  const model = input.isModelSet;

  return { selection, quality, model, canContinue: selection && quality && model };
};

/**
 * A count tile's label ("Good > 1.8") as its name and its range, so the
 * tile can show them on two lines. A label with no range, or with nothing
 * before it, stays whole.
 */
export const splitScoreTileLabel = (label: string): [string, string] => {
  const match = label.match(/^(.*?)\s*((?:[<>\u2264\u2265]=?\s*)?\d.*)$/);
  return match && match[1] ? [match[1], match[2]] : [label, ""];
};
