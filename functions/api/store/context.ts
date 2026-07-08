import { currencyForCountry } from "../../../shared/storeCatalog";

/**
 * Locale suggestion by country — maps common visitor countries
 * to the most relevant MLWK locale.
 */
const localeSuggestions: Record<string, string> = {
  AE: "ar", SA: "ar", QA: "ar", KW: "ar", BH: "ar", OM: "ar",
  EG: "ar", JO: "ar", LB: "ar", MA: "ar", DZ: "ar", TN: "ar",
  DE: "de", AT: "de", CH: "de", LI: "de", LU: "de",
  FR: "fr", BE: "fr", MC: "fr", CI: "fr", SN: "fr",
  CN: "zh", HK: "zh", TW: "zh", SG: "zh", MO: "zh",
};

export const onRequestGet: PagesFunction = async (context) => {
  const country =
    (context.request as Request & { cf?: { country?: string } }).cf?.country ??
    context.request.headers.get("CF-IPCountry") ??
    "US";

  const suggestedLocale = localeSuggestions[country] || "en";

  return Response.json({
    country,
    currency: currencyForCountry(country),
    suggestedLocale,
  });
};
