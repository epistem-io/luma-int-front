import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  applyOptimizerLine,
  fetchAvailablePredictors,
  fetchPredictorDownloadUrl,
  fetchPredictorPreview,
  fetchPredictorSeparability,
  formatLegendValue,
  formatScore,
  formatShare,
  isRecommendationSelected,
  isSeparabilityStale,
  latestRecommendation,
  legendGradient,
  lowSampleCount,
  needsOptimizerRun,
  predictorLabels,
  predictorSecondaryText,
  pruneSelectedPredictors,
  recommendedAvailableIds,
  separabilitySets,
  separabilityVerdict,
  shouldAutoApplyRecommendation,
  splitNdjson,
  streamPredictorOptimizer,
  visiblePredictorGroups,
} from "./predictorsApi";

const option = (
  id: string,
  overrides: Partial<PredictorOption> = {},
): PredictorOption => ({
  id,
  label: id,
  long_name: `${id} long name`,
  description: `${id} description`,
  type: "spectral",
  available: true,
  reason: "",
  reason_code: null,
  conflicts_with: [],
  ...overrides,
});

const LISTING: PredictorListing = {
  groups: [
    {
      key: "vegetation",
      predictors: [
        option("NDVI"),
        option("EVI", { conflicts_with: ["SAVI"] }),
        option("MCARI", {
          available: false,
          reason: "Requires Sentinel-2 Red-Edge band (RE1)",
          reason_code: "sensor",
        }),
      ],
    },
    {
      key: "terrain",
      predictors: [option("ELEVATION", { label: "Elevation", type: "terrain" })],
    },
    {
      key: "radar",
      predictors: [
        option("VV", { available: false, reason_code: "sensor", type: "radar" }),
      ],
    },
  ],
  selected: ["NDVI"],
  sensor: "L8_SR",
  start_date: "2023-01-01",
  end_date: "2023-12-31",
};

const jsonResponse = (body: unknown, ok = true, status = 200) =>
  ({ ok, status, json: async () => body }) as Response;

describe("fetchAvailablePredictors", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("requests the listing for the session and unwraps results", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ message: "success", results: LISTING }),
    );

    const listing = await fetchAvailablePredictors("sess 1");

    expect(listing).toEqual(LISTING);
    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/api/v1/luma/predictor/available?");
    expect(String(url)).toContain("session_id=sess+1");
  });

  it("throws the backend's message on an error response", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        { error: { message: "luma params data (step-1) not found" } },
        false,
        400,
      ),
    );

    await expect(fetchAvailablePredictors("s1")).rejects.toThrow(
      "luma params data (step-1) not found",
    );
  });

  it("falls back to the status when the error has no message", async () => {
    fetchMock.mockResolvedValue(jsonResponse(null, false, 502));

    await expect(fetchAvailablePredictors("s1")).rejects.toThrow(
      "Request failed (502)",
    );
  });

  it("rejects a response without groups", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "success" }));

    await expect(fetchAvailablePredictors("s1")).rejects.toThrow();
  });
});

describe("visiblePredictorGroups", () => {
  it("keeps only available predictors", () => {
    const groups = visiblePredictorGroups(LISTING);

    expect(groups[0].predictors.map((p) => p.id)).toEqual(["NDVI", "EVI"]);
  });

  it("drops a group with nothing available", () => {
    expect(visiblePredictorGroups(LISTING).map((g) => g.key)).toEqual([
      "vegetation",
      "terrain",
    ]);
  });

  it("is empty without a listing", () => {
    expect(visiblePredictorGroups(null)).toEqual([]);
  });
});

describe("pruneSelectedPredictors", () => {
  it("drops ids that are unavailable or no longer listed", () => {
    expect(
      pruneSelectedPredictors(["NDVI", "MCARI", "OSAVI", "ELEVATION"], LISTING),
    ).toEqual(["NDVI", "ELEVATION"]);
  });

  it("returns the same array when nothing is dropped", () => {
    const selected = ["NDVI", "ELEVATION"];

    expect(pruneSelectedPredictors(selected, LISTING)).toBe(selected);
  });
});

describe("predictorLabels", () => {
  it("uses the listing's labels, in listing order", () => {
    expect(predictorLabels(["ELEVATION", "NDVI"], LISTING)).toEqual([
      "NDVI",
      "Elevation",
    ]);
  });

  it("shows an id the listing does not know as itself, last", () => {
    expect(predictorLabels(["OSAVI", "NDVI"], LISTING)).toEqual([
      "NDVI",
      "OSAVI",
    ]);
  });

  it("shows ids when the listing is not loaded yet", () => {
    expect(predictorLabels(["NDVI", "ELEVATION"], null)).toEqual([
      "NDVI",
      "ELEVATION",
    ]);
  });
});

describe("predictorSecondaryText", () => {
  it("is the long name", () => {
    expect(predictorSecondaryText(option("NDVI"))).toBe("NDVI long name");
  });

  it("is the description when the long name is already the label", () => {
    const roads = option("DIST_ROADS", {
      label: "Distance to Main Roads (GRIP4)",
      long_name: "Distance to Main Roads (GRIP4)",
      description: "Euclidean distance to nearest main road",
    });

    expect(predictorSecondaryText(roads)).toBe(
      "Euclidean distance to nearest main road",
    );
  });
});

const recommendation = (
  overrides: Partial<PredictorRecommendation> = {},
): PredictorRecommendation => ({
  recommended: ["NDVI", "ELEVATION"],
  conflict_dropped: [],
  ranking: [],
  candidates: ["NDVI", "EVI", "ELEVATION"],
  skipped: [],
  samples: { total: 120, per_class: { "1": 60, "2": 60 } },
  created: "2026-11-23T12:00:00",
  stale: false,
  ...overrides,
});

const line = (
  process: string,
  a: number,
  data: unknown = {},
  next = "",
): GenerateMapStream => ({ process, data, w: 20, a, next });

describe("splitNdjson", () => {
  it("returns complete lines and keeps the unfinished tail", () => {
    expect(splitNdjson('{"a":1}\n{"b":2}\n{"c"')).toEqual({
      lines: ['{"a":1}', '{"b":2}'],
      rest: '{"c"',
    });
  });

  it("skips blank lines", () => {
    expect(splitNdjson('{"a":1}\n\n  \n')).toEqual({
      lines: ['{"a":1}'],
      rest: "",
    });
  });

  it("keeps everything when no line is complete yet", () => {
    expect(splitNdjson('{"a"')).toEqual({ lines: [], rest: '{"a"' });
  });
});

describe("applyOptimizerLine", () => {
  const start = { done: 0, total: 0, process: "" };

  it("takes the total from the line and adds its weight", () => {
    const event = applyOptimizerLine(
      start,
      line("preparation", 0.5, {}, "compute predictors"),
    );

    expect(event).toEqual({
      kind: "progress",
      progress: { done: 0.5, total: 20, process: "compute predictors" },
    });
  });

  it("shows what is running now, which is the line's next process", () => {
    const event = applyOptimizerLine(
      { done: 3.5, total: 20, process: "sample training data" },
      line("sample training data", 6, {}, "select predictors"),
    );

    expect(event).toMatchObject({
      progress: { done: 9.5, process: "select predictors" },
    });
  });

  it("stays on the selection step while its fits come in", () => {
    const event = applyOptimizerLine(
      { done: 9.5, total: 20, process: "select predictors" },
      line("select predictors", 1.25, { completed: 1, total: 8 }, "end"),
    );

    expect(event).toMatchObject({
      progress: { done: 10.75, process: "select predictors" },
    });
  });

  it("keeps the state on a heartbeat", () => {
    const current = { done: 3.5, total: 20, process: "sample training data" };

    expect(applyOptimizerLine(current, line("heartbeat", 0))).toEqual({
      kind: "progress",
      progress: current,
    });
  });

  it("ends with the recommendation", () => {
    const result = recommendation();

    expect(
      applyOptimizerLine(start, line("end", 0.5, { recommendation: result })),
    ).toEqual({ kind: "done", recommendation: result });
  });

  it("reports an error line", () => {
    expect(
      applyOptimizerLine(start, line("error", 0, { message: "boom" })),
    ).toEqual({ kind: "error", message: "boom" });
  });

  it("treats an end line without a recommendation as an error", () => {
    expect(applyOptimizerLine(start, line("end", 0.5))).toMatchObject({
      kind: "error",
    });
  });
});

describe("streamPredictorOptimizer", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  // The body arrives in chunks that do not line up with the lines.
  const streamResponse = (chunks: string[]) => {
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
        controller.close();
      },
    });
    return { ok: true, status: 200, body } as unknown as Response;
  };

  const ndjson = (lines: GenerateMapStream[]) =>
    `${lines.map((item) => JSON.stringify(item)).join("\n")}\n`;

  it("reports progress and resolves with the recommendation", async () => {
    const result = recommendation();
    const text = ndjson([
      line("preparation", 0.5, {}, "compute predictors"),
      line("compute predictors", 3, {}, "sample training data"),
      line("heartbeat", 0),
      line("sample training data", 6, {}, "select predictors"),
      line("select predictors", 10, { completed: 8, total: 8 }, "end"),
      line("end", 0.5, { recommendation: result }),
    ]);
    const cut = Math.floor(text.length / 3);
    fetchMock.mockResolvedValue(
      streamResponse([
        text.slice(0, cut),
        text.slice(cut, 2 * cut),
        text.slice(2 * cut),
      ]),
    );
    const onProgress = vi.fn();
    const controller = new AbortController();

    const outcome = await streamPredictorOptimizer(
      "s1",
      { onProgress },
      controller.signal,
    );

    expect(outcome).toEqual(result);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain(
      "/api/v1/luma/predictor/optimize?session_id=s1",
    );
    expect(init.signal).toBe(controller.signal);
    const last = onProgress.mock.calls[onProgress.mock.calls.length - 1][0];
    expect(last).toEqual({
      done: 19.5,
      total: 20,
      process: "select predictors",
    });
  });

  it("rejects with the message of an error line", async () => {
    fetchMock.mockResolvedValue(
      streamResponse([
        ndjson([
          line("preparation", 0.5, {}, "compute predictors"),
          line("error", 0, {
            message: "no training sample falls on valid imagery",
          }),
        ]),
      ]),
    );

    await expect(
      streamPredictorOptimizer("s1", { onProgress: () => {} }),
    ).rejects.toThrow("no training sample falls on valid imagery");
  });

  it("rejects when the stream ends without a result", async () => {
    fetchMock.mockResolvedValue(
      streamResponse([
        ndjson([line("preparation", 0.5, {}, "compute predictors")]),
      ]),
    );

    await expect(
      streamPredictorOptimizer("s1", { onProgress: () => {} }),
    ).rejects.toThrow();
  });

  it("rejects with the backend's message when the run is refused", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        {
          error: {
            message:
              "training data (step-3) with at least two classes is required",
          },
        },
        false,
        400,
      ),
    );

    await expect(
      streamPredictorOptimizer("s1", { onProgress: () => {} }),
    ).rejects.toThrow("at least two classes");
  });
});

describe("needsOptimizerRun", () => {
  it("is needed without a result or with a stale one", () => {
    expect(needsOptimizerRun(null)).toBe(true);
    expect(needsOptimizerRun(undefined)).toBe(true);
    expect(needsOptimizerRun(recommendation({ stale: true }))).toBe(true);
  });

  it("is not needed with a current result, even an empty one", () => {
    expect(needsOptimizerRun(recommendation())).toBe(false);
    expect(needsOptimizerRun(recommendation({ recommended: [] }))).toBe(false);
  });
});

describe("lowSampleCount", () => {
  it("is the smallest class when that is below the threshold", () => {
    const result = recommendation({
      samples: { total: 13, per_class: { "1": 5, "2": 2, "3": 6 } },
    });

    expect(lowSampleCount(result)).toBe(2);
  });

  it("is null when every class has enough samples", () => {
    expect(lowSampleCount(recommendation())).toBeNull();
    expect(
      lowSampleCount(
        recommendation({
          samples: { total: 20, per_class: { "1": 10, "2": 10 } },
        }),
      ),
    ).toBeNull();
  });

  it("is null when the counts are not known", () => {
    expect(
      lowSampleCount(recommendation({ samples: { total: 0, per_class: {} } })),
    ).toBeNull();
  });
});

describe("recommendedAvailableIds", () => {
  it("keeps the recommended ids the listing still offers, in order", () => {
    const result = recommendation({
      recommended: ["ELEVATION", "MCARI", "NDVI"],
    });

    expect(recommendedAvailableIds(result, LISTING)).toEqual([
      "ELEVATION",
      "NDVI",
    ]);
  });

  it("is empty without a listing", () => {
    expect(recommendedAvailableIds(recommendation(), null)).toEqual([]);
  });
});

describe("isRecommendationSelected", () => {
  it("compares as sets", () => {
    expect(
      isRecommendationSelected(["NDVI", "ELEVATION"], ["ELEVATION", "NDVI"]),
    ).toBe(true);
    expect(isRecommendationSelected(["NDVI", "ELEVATION"], ["NDVI"])).toBe(
      false,
    );
    expect(isRecommendationSelected(["NDVI"], ["NDVI", "EVI"])).toBe(false);
  });

  it("is false for an empty recommendation", () => {
    expect(isRecommendationSelected([], [])).toBe(false);
  });
});

describe("shouldAutoApplyRecommendation", () => {
  const base = {
    recommendation: recommendation(),
    selected: [] as string[],
    appliedCreated: null as string | null,
  };

  it("applies a current result to an empty selection", () => {
    expect(shouldAutoApplyRecommendation(base)).toBe(true);
  });

  it("never overwrites what the user selected", () => {
    expect(shouldAutoApplyRecommendation({ ...base, selected: ["EVI"] })).toBe(
      false,
    );
  });

  it("applies each result only once, so clearing the selection sticks", () => {
    expect(
      shouldAutoApplyRecommendation({
        ...base,
        appliedCreated: "2026-11-23T12:00:00",
      }),
    ).toBe(false);
  });

  it("does not apply a stale or empty result, or none", () => {
    expect(
      shouldAutoApplyRecommendation({
        ...base,
        recommendation: recommendation({ stale: true }),
      }),
    ).toBe(false);
    expect(
      shouldAutoApplyRecommendation({
        ...base,
        recommendation: recommendation({ recommended: [] }),
      }),
    ).toBe(false);
    expect(
      shouldAutoApplyRecommendation({ ...base, recommendation: null }),
    ).toBe(false);
  });
});

describe("latestRecommendation", () => {
  it("takes the listing's result when there is none yet", () => {
    const saved = recommendation();

    expect(latestRecommendation(null, saved)).toBe(saved);
  });

  it("keeps the current result when the listing has none or an older one", () => {
    const current = recommendation({ created: "2026-11-23T12:05:00" });
    const older = recommendation({ created: "2026-11-23T12:00:00" });

    expect(latestRecommendation(current, null)).toBe(current);
    expect(latestRecommendation(current, undefined)).toBe(current);
    expect(latestRecommendation(current, older)).toBe(current);
  });

  it("replaces the same result, which brings its up-to-date stale flag", () => {
    const current = recommendation();
    const refreshed = recommendation({ stale: true });

    expect(latestRecommendation(current, refreshed)).toBe(refreshed);
  });
});

const previewLayer = (
  overrides: Partial<PredictorPreviewLayer> = {},
): PredictorPreviewLayer => ({
  id: "NDVI",
  label: "NDVI",
  name: "Predictor - NDVI",
  url: "https://tiles/NDVI/{z}/{x}/{y}",
  kind: "continuous",
  min: 0.11,
  max: 0.83,
  palette: ["#8c510a", "#1b7837"],
  ...overrides,
});

describe("fetchPredictorPreview", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("asks for one predictor and returns its layer", async () => {
    const layer = previewLayer();
    fetchMock.mockResolvedValue(
      jsonResponse({ results: { layers: [layer], skipped: [] } }),
    );

    const outcome = await fetchPredictorPreview("s1", "NDVI");

    expect(outcome).toEqual({ layer, reason: "" });
    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/api/v1/luma/predictor/preview?");
    expect(String(url)).toContain("session_id=s1");
    expect(String(url)).toContain("predictors=NDVI");
  });

  it("returns the reason when the backend could not produce it", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        results: {
          layers: [],
          skipped: [
            {
              id: "VV",
              label: "VV",
              reason: "no data for this area and period",
            },
          ],
        },
      }),
    );

    expect(await fetchPredictorPreview("s1", "VV")).toEqual({
      layer: null,
      reason: "no data for this area and period",
    });
  });

  it("throws the backend's message on an error response", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        { error: { message: "invalid input: predictor" } },
        false,
        400,
      ),
    );

    await expect(fetchPredictorPreview("s1", "NOPE")).rejects.toThrow(
      "invalid input: predictor",
    );
  });

  it("rejects a response that mentions the predictor nowhere", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ results: { layers: [], skipped: [] } }),
    );

    await expect(fetchPredictorPreview("s1", "NDVI")).rejects.toThrow();
  });
});

describe("fetchPredictorDownloadUrl", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("sends the ids comma-separated and returns the result", async () => {
    const results = {
      download_url: "https://download/predictors",
      bands: ["NDVI", "ELEVATION"],
      skipped: [],
    };
    fetchMock.mockResolvedValue(jsonResponse({ results }));

    expect(await fetchPredictorDownloadUrl("s1", ["NDVI", "ELEVATION"])).toEqual(
      results,
    );
    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/api/v1/luma/predictor/download-url?");
    expect(new URL(String(url), "http://x").searchParams.get("predictors")).toBe(
      "NDVI,ELEVATION",
    );
  });

  it("keeps an empty link, which means Earth Engine refused the size", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        results: { download_url: "", bands: ["NDVI"], skipped: [] },
      }),
    );

    expect((await fetchPredictorDownloadUrl("s1", ["NDVI"])).download_url).toBe(
      "",
    );
  });

  it("throws the backend's message on an error response", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: { message: "please input: predictors" } }, false, 400),
    );

    await expect(fetchPredictorDownloadUrl("s1", [])).rejects.toThrow(
      "please input: predictors",
    );
  });
});

describe("legendGradient", () => {
  it("runs the palette from left to right", () => {
    expect(legendGradient(["#8c510a", "#f6e8c3", "#1b7837"])).toBe(
      "linear-gradient(to right, #8c510a, #f6e8c3, #1b7837)",
    );
  });

  it("still makes a gradient from a single colour", () => {
    expect(legendGradient(["#000000"])).toBe(
      "linear-gradient(to right, #000000, #000000)",
    );
  });
});

describe("formatLegendValue", () => {
  it("keeps two decimals for small values", () => {
    expect(formatLegendValue(0.1135)).toBe("0.11");
    expect(formatLegendValue(-0.5)).toBe("-0.5");
  });

  it("keeps one decimal for tens", () => {
    expect(formatLegendValue(-25)).toBe("-25");
    expect(formatLegendValue(12.34)).toBe("12.3");
  });

  it("rounds large values", () => {
    expect(formatLegendValue(1520.4)).toBe("1520");
    expect(formatLegendValue(43210)).toBe("43210");
  });
});

const silhouette = (
  overall: number,
  overrides: Partial<PredictorSeparabilitySilhouette> = {},
): PredictorSeparabilitySilhouette => ({
  overall,
  level: "poor",
  mean_pairwise: 0.3,
  min_pairwise: 0.02,
  worst_pair: "Forest vs Agroforest",
  negative_sample_ratio: 0.19,
  ...overrides,
});

const comparison = (
  overrides: Partial<PredictorSeparabilityComparison> = {},
): PredictorSeparabilityComparison => ({
  sets: [
    {
      key: "composite",
      bands: ["BLUE", "GREEN", "RED"],
      num_bands: 3,
      td: null,
      silhouette: silhouette(0.2),
    },
    {
      key: "with_predictors",
      bands: ["BLUE", "GREEN", "RED", "NDVI", "elevation"],
      num_bands: 5,
      td: null,
      silhouette: silhouette(0.45, { level: "med" }),
    },
  ],
  silhouette_change: 0.25,
  predictors: ["NDVI", "ELEVATION"],
  skipped: [],
  ...overrides,
});

describe("fetchPredictorSeparability", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("asks for the analysis with the ticked predictors", async () => {
    const body = { message: "success", sample_quality: null, comparison: comparison() };
    fetchMock.mockResolvedValue(jsonResponse(body));

    const result = await fetchPredictorSeparability("s1", ["NDVI", "ELEVATION"]);

    expect(result).toEqual({
      sample_quality: null,
      comparison: body.comparison,
    });
    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/api/v1/luma/training-data/separability?");
    const params = new URL(String(url), "http://x").searchParams;
    expect(params.get("session_id")).toBe("s1");
    expect(params.get("predictors")).toBe("NDVI,ELEVATION");
  });

  it("rejects when the backend had nothing to analyse", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ message: "success", sample_quality: null, comparison: null }),
    );

    await expect(fetchPredictorSeparability("s1", ["NDVI"])).rejects.toThrow();
  });

  it("throws the backend's message on an error response", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        { error: { message: "predictors could not be computed" } },
        false,
        400,
      ),
    );

    await expect(fetchPredictorSeparability("s1", ["NDVI"])).rejects.toThrow(
      "predictors could not be computed",
    );
  });
});

describe("separabilityVerdict", () => {
  it("is better or worse beyond the threshold", () => {
    expect(separabilityVerdict(0.25)).toBe("better");
    expect(separabilityVerdict(0.02)).toBe("better");
    expect(separabilityVerdict(-0.02)).toBe("worse");
    expect(separabilityVerdict(-0.3)).toBe("worse");
  });

  it("is the same within the threshold", () => {
    expect(separabilityVerdict(0.019)).toBe("same");
    expect(separabilityVerdict(0)).toBe("same");
    expect(separabilityVerdict(-0.019)).toBe("same");
  });

  it("is unknown without a change", () => {
    expect(separabilityVerdict(null)).toBe("unknown");
    expect(separabilityVerdict(undefined)).toBe("unknown");
  });
});

describe("separabilitySets", () => {
  it("finds the two sets by key, whatever their order", () => {
    const value = comparison();
    const reversed = { ...value, sets: [...value.sets].reverse() };

    const { before, after } = separabilitySets(reversed);

    expect(before?.key).toBe("composite");
    expect(after?.key).toBe("with_predictors");
  });

  it("gives null for a missing set", () => {
    expect(separabilitySets(comparison({ sets: [] }))).toEqual({
      before: null,
      after: null,
    });
  });
});

describe("isSeparabilityStale", () => {
  it("is current while the ticked predictors are the analysed ones", () => {
    expect(isSeparabilityStale(comparison(), ["ELEVATION", "NDVI"])).toBe(false);
  });

  it("is stale once a predictor is added or removed", () => {
    expect(isSeparabilityStale(comparison(), ["NDVI"])).toBe(true);
    expect(isSeparabilityStale(comparison(), ["NDVI", "ELEVATION", "EVI"])).toBe(
      true,
    );
    expect(isSeparabilityStale(comparison(), ["NDVI", "EVI"])).toBe(true);
  });

  it("counts a skipped predictor as analysed", () => {
    const value = comparison({
      predictors: ["NDVI"],
      skipped: [{ id: "VV", label: "VV", reason: "no data" }],
    });

    expect(isSeparabilityStale(value, ["NDVI", "VV"])).toBe(false);
  });
});

describe("formatScore and formatShare", () => {
  it("shows a score with two decimals", () => {
    expect(formatScore(0.2)).toBe("0.20");
    expect(formatScore(-0.018)).toBe("-0.02");
  });

  it("shows a ratio as a whole percentage", () => {
    expect(formatShare(0.19)).toBe("19%");
    expect(formatShare(0.076)).toBe("8%");
  });
});
