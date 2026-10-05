import type { Locale } from "./content";

export const walkthroughLabels: Record<Locale, string> = {
  en: "Villa tour",
  zh: "别墅漫游",
  ar: "جولة الفيلا",
  de: "Villa-Rundgang",
  fr: "Visite de villa",
};

export function walkthroughUrl(locale: Locale) {
  const language = locale === "ar" || locale === "zh" ? locale : "en";
  return `/walkthrough/villa-c/?lang=${language}&siteLang=${locale}&q=medium`;
}
