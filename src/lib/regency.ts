/**
 * Helpers for the "Pilih Kabupaten/Kota" AOI option.
 * Pure functions — no React / network — so they are unit-testable.
 */

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Filter regencies by a free-text query. Every whitespace-separated token in
 * the query must appear in the label, raw name, or province (case-insensitive,
 * accent-insensitive). Empty query returns the full list.
 */
export const filterRegencies = (
  regencies: RegencyOption[],
  query: string,
): RegencyOption[] => {
  const tokens = normalize(query ?? "").split(" ").filter(Boolean);
  if (tokens.length === 0) return regencies;

  return regencies.filter((r) => {
    const haystack = normalize(`${r.label} ${r.name} ${r.province}`);
    return tokens.every((token) => haystack.includes(token));
  });
};

/** "Kabupaten Bandung — Jawa Barat" style display string. */
export const formatRegencyLabel = (regency: RegencyOption): string =>
  regency.province ? `${regency.label} — ${regency.province}` : regency.label;

/**
 * Module-level cache of the regency list so the (≈515 rows) request is made
 * once per page load, even if the picker is mounted several times.
 */
let regencyListPromise: Promise<RegencyOption[]> | null = null;

export const fetchRegencyList = (url: string): Promise<RegencyOption[]> => {
  if (!regencyListPromise) {
    regencyListPromise = fetch(url)
      .then(async (response) => {
        const json: GeosRegencyListRes = await response.json();
        if (!response.ok) {
          throw new Error(
            `${json?.error?.message || response.statusText}. Trace: ${json?.trace}`,
          );
        }
        return json.data ?? [];
      })
      .catch((e) => {
        // allow a retry on the next call
        regencyListPromise = null;
        throw e;
      });
  }
  return regencyListPromise;
};
