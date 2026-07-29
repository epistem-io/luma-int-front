import { unstable_cache } from "next/cache";
import { routing } from "./routing";

type Locale = (typeof routing.locales)[number];
type IntlMessages = Record<string, unknown>;

const TOLGEE_REVALIDATE_SECONDS = 300;
const lastSuccessfulMessages = new Map<Locale, IntlMessages>();

type TolgeeKeyTranslation = {
  languageTag?: string;
  text?: unknown;
};

type TolgeeKeyItem = {
  keyName?: string;
  text?: unknown;
  translation?: unknown;
  translations?: TolgeeKeyTranslation[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getTolgeeConfig() {
  const apiUrl = process.env.TOLGEE_API_URL?.trim().replace(/\/$/, "");
  const apiKey = process.env.TOLGEE_API_KEY?.trim();
  const projectId =
    process.env.TOLGEE_PROJECT_ID?.trim() ||
    extractProjectIdFromUrl(process.env.TOLGEE_PROJECT_URL);

  if (!apiUrl) {
    throw new Error("Missing TOLGEE_API_URL environment variable.");
  }

  if (!apiKey) {
    throw new Error("Missing TOLGEE_API_KEY environment variable.");
  }

  if (!projectId) {
    throw new Error(
      "Missing Tolgee project identifier. Set TOLGEE_PROJECT_ID or TOLGEE_PROJECT_URL.",
    );
  }

  return { apiUrl, apiKey, projectId };
}

function extractProjectIdFromUrl(projectUrl?: string) {
  if (!projectUrl) return undefined;

  const match = projectUrl.match(/\/v2\/projects\/([^/?#]+)/);
  return match?.[1];
}

function buildCandidateUrls(locale: Locale) {
  const { apiUrl, apiKey, projectId } = getTolgeeConfig();
  const url = new URL(
    `${apiUrl}/v2/projects/${projectId}/translations/${locale}`,
  );

  url.searchParams.set("ak", apiKey);
  url.searchParams.set("zip", "false");

  return [url];
}

function getSafeUrlForLogs(url: URL) {
  const safeUrl = new URL(url.toString());
  safeUrl.searchParams.delete("ak");
  return `${safeUrl.pathname}${safeUrl.search}`;
}

function normalizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }

  if (isRecord(value)) {
    return normalizeMessagesObject(value);
  }

  return value;
}

function setNestedValue(
  target: Record<string, unknown>,
  path: string[],
  value: unknown,
) {
  let current = target;

  for (let index = 0; index < path.length - 1; index += 1) {
    const segment = path[index];
    const existing = current[segment];

    if (!isRecord(existing)) {
      current[segment] = {};
    }

    current = current[segment] as Record<string, unknown>;
  }

  current[path[path.length - 1]] = value;
}

function normalizeMessagesObject(input: Record<string, unknown>) {
  const normalized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    setNestedValue(normalized, key.split("."), normalizeValue(value));
  }

  return normalized;
}

function tryExtractFromEmbeddedKeys(
  payload: Record<string, unknown>,
  locale: Locale,
) {
  const embedded = payload._embedded;
  if (!isRecord(embedded)) return null;

  const keys = embedded.keys;
  if (!Array.isArray(keys)) return null;

  const result: Record<string, unknown> = {};

  for (const item of keys as TolgeeKeyItem[]) {
    if (!item.keyName) continue;

    const translationFromList = item.translations?.find(
      (translation) => translation.languageTag === locale,
    )?.text;

    const translation =
      item.text ?? item.translation ?? translationFromList ?? undefined;

    if (translation === undefined) continue;

    setNestedValue(result, item.keyName.split("."), normalizeValue(translation));
  }

  return Object.keys(result).length > 0 ? result : null;
}

function extractMessagesFromPayload(
  payload: unknown,
  locale: Locale,
): IntlMessages {
  if (Array.isArray(payload)) {
    const result: Record<string, unknown> = {};

    for (const item of payload as TolgeeKeyItem[]) {
      if (!item.keyName) continue;

      const translationFromList = item.translations?.find(
        (translation) => translation.languageTag === locale,
      )?.text;

      const translation =
        item.text ?? item.translation ?? translationFromList ?? undefined;

      if (translation === undefined) continue;

      setNestedValue(
        result,
        item.keyName.split("."),
        normalizeValue(translation),
      );
    }

    if (Object.keys(result).length > 0) {
      return result;
    }
  }

  if (!isRecord(payload)) {
    throw new Error("Tolgee response is not a JSON object.");
  }

  const localeScopedPayload = payload[locale];
  if (isRecord(localeScopedPayload)) {
    return normalizeMessagesObject(localeScopedPayload);
  }

  const embeddedMessages = tryExtractFromEmbeddedKeys(payload, locale);
  if (embeddedMessages) {
    return embeddedMessages;
  }

  return normalizeMessagesObject(payload);
}

async function loadBundledMessages(locale: Locale): Promise<IntlMessages> {
  return (await import(`../../messages/${locale}.json`)).default;
}

// Tolgee wins where it has a value; anything it doesn't know yet falls back
// to the bundled messages instead of rendering as a raw key path.
function deepMerge(base: IntlMessages, override: IntlMessages): IntlMessages {
  const result: Record<string, unknown> = { ...base };

  for (const [key, value] of Object.entries(override)) {
    const existing = result[key];

    if (isRecord(existing) && isRecord(value)) {
      result[key] = deepMerge(existing, value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

async function fetchTolgeeMessages(locale: Locale): Promise<IntlMessages> {
  const errors: string[] = [];

  let urls: URL[];
  try {
    urls = buildCandidateUrls(locale);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid Tolgee configuration";
    console.warn(
      `Tolgee is not configured, using bundled messages for locale "${locale}". ${message}`,
    );
    return loadBundledMessages(locale);
  }

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        cache: "force-cache",
        next: { revalidate: TOLGEE_REVALIDATE_SECONDS },
      });

      if (!response.ok) {
        errors.push(`${getSafeUrlForLogs(url)} -> ${response.status}`);
        continue;
      }

      const text = await response.text();
      const payload = JSON.parse(text) as unknown;
      const messages = deepMerge(
        await loadBundledMessages(locale),
        extractMessagesFromPayload(payload, locale),
      );

      lastSuccessfulMessages.set(locale, messages);
      return messages;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown Tolgee fetch error";
      errors.push(`${getSafeUrlForLogs(url)} -> ${message}`);
    }
  }

  const cachedMessages = lastSuccessfulMessages.get(locale);
  if (cachedMessages) {
    console.warn(
      `Falling back to cached Tolgee messages for locale "${locale}". Errors: ${errors.join("; ")}`,
    );
    return cachedMessages;
  }

  console.warn(
    `Falling back to bundled messages for locale "${locale}". Errors: ${errors.join("; ")}`,
  );
  return loadBundledMessages(locale);
}

const getCachedTolgeeMessages = unstable_cache(
  async (locale: Locale) => fetchTolgeeMessages(locale),
  ["tolgee-messages"],
  { revalidate: TOLGEE_REVALIDATE_SECONDS },
);

export async function getTolgeeMessages(locale: Locale) {
  return getCachedTolgeeMessages(locale);
}
