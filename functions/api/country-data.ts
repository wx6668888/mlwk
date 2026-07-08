/**
 * Country data — shipping zones, currency mappings, regional groupings.
 * Data sourced from restcountries.com (free, no API key).
 *
 * GET /api/country-data
 * Cache: 24 hours on client, 7 days on Cloudflare CDN
 *
 * Returns: {
 *   eurozone: string[],      // ISO 3166-1 alpha-2 codes
 *   middleEast: string[],
 *   northAmerica: string[],
 *   currencyMap: Record<string, string>,  // country -> currency
 *   countries: Array<{ code: string, name: string, currency: string, region: string }>
 * }
 */

interface RestCountry {
  cca2: string;
  name: { common: string };
  region: string;
  subregion: string;
  currencies?: Record<string, { name: string; symbol: string }>;
}

// Static fallback — updated 2026 (includes Croatia in eurozone since 2023)
const FALLBACK_EUROZONE = [
  "AT", "BE", "HR", "CY", "EE", "FI", "FR", "DE", "GR",
  "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES",
];

const FALLBACK_MIDDLE_EAST = [
  "AE", "SA", "QA", "KW", "BH", "OM", "JO", "IL", "LB",
];

const FALLBACK_NORTH_AMERICA = ["US", "CA", "MX"];

function currencyFromCountry(country: RestCountry): string {
  if (country.currencies) {
    const codes = Object.keys(country.currencies);
    if (codes.length > 0) return codes[0];
  }
  // Eurozone fallback
  if (FALLBACK_EUROZONE.includes(country.cca2)) return "EUR";
  if (country.cca2 === "GB") return "GBP";
  return "USD";
}

export const onRequestGet: PagesFunction = async () => {
  try {
    const upstream = await fetch(
      "https://restcountries.com/v3.1/all?fields=cca2,name,region,subregion,currencies",
      { headers: { Accept: "application/json" } },
    );

    if (!upstream.ok) throw new Error(`Upstream ${upstream.status}`);

    const data = (await upstream.json()) as RestCountry[];

    const eurozone = FALLBACK_EUROZONE;
    const middleEast = FALLBACK_MIDDLE_EAST;
    const northAmerica = FALLBACK_NORTH_AMERICA;

    const currencyMap: Record<string, string> = {};
    const countries = data.map((c) => {
      const currency = currencyFromCountry(c);
      currencyMap[c.cca2] = currency;
      return {
        code: c.cca2,
        name: c.name.common,
        currency,
        region: c.subregion || c.region,
      };
    });

    return new Response(
      JSON.stringify({
        eurozone,
        middleEast,
        northAmerica,
        currencyMap,
        countries,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=86400, s-maxage=604800",
          "CDN-Cache-Control": "max-age=604800",
        },
      },
    );
  } catch (error) {
    console.error("country-data: upstream failed, using fallback", error);

    return new Response(
      JSON.stringify({
        eurozone: FALLBACK_EUROZONE,
        middleEast: FALLBACK_MIDDLE_EAST,
        northAmerica: FALLBACK_NORTH_AMERICA,
        currencyMap: {},
        countries: [],
        _fallback: true,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=3600",
        },
      },
    );
  }
};
