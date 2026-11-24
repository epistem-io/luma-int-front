import { useTranslations } from "next-intl";

/**
 * InteractivePanel translations with a built-in fallback.
 *
 * Translations are served by Tolgee (src/i18n/tolgee.ts), so a key added in
 * code can be missing there for a while. This shows the given English text
 * instead of a raw key until the key exists.
 */
export const useTranslateOr = () => {
  const t = useTranslations("InteractivePanel");

  return (
    key: string,
    fallback: string,
    values?: Record<string, string | number>,
  ) => {
    const messageKey = key as Parameters<typeof t>[0];
    if (t.has(messageKey)) return t(messageKey, values);

    // The fallback uses the same {name} placeholders as the messages.
    return fallback.replace(/\{(\w+)\}/g, (match, name: string) =>
      values && name in values ? String(values[name]) : match,
    );
  };
};
