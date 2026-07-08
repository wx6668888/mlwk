/**
 * Address validation — geocoding via Nominatim (OpenStreetMap, free).
 * POST /api/validate-address
 * Body: { line1, city, postalCode, countryCode }
 *
 * Respects Nominatim's 1 req/s rate limit and usage policy.
 */

interface AddressBody {
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  postalCode: string;
  countryCode: string;
}

interface NominatimResult {
  display_name: string;
  address: {
    country_code?: string;
    postcode?: string;
    city?: string;
    town?: string;
    village?: string;
    road?: string;
  };
  type: string;
  importance: number;
}

let lastRequestTime = 0;

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const body = (await context.request.json()) as AddressBody;

    // Rate limit: 1 request per second to respect Nominatim policy
    const now = Date.now();
    const waitMs = Math.max(0, 1100 - (now - lastRequestTime));
    if (waitMs > 0) await new Promise((r) => setTimeout(r, waitMs));
    lastRequestTime = Date.now();

    const query = [body.line1, body.city, body.postalCode, body.countryCode]
      .filter(Boolean)
      .join(", ");

    const upstream = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "MLWK-Global-Site/1.0 (admin@mlwk.space)",
        },
      },
    );

    if (!upstream.ok) throw new Error(`Upstream ${upstream.status}`);

    const results = (await upstream.json()) as NominatimResult[];

    if (results.length === 0) {
      return Response.json({
        valid: false,
        reason: "Address not found. Please check and try again.",
      });
    }

    const match = results[0];

    // Verify country match
    const matchedCountry = match.address.country_code?.toUpperCase();
    if (matchedCountry && matchedCountry !== body.countryCode.toUpperCase()) {
      return Response.json({
        valid: false,
        reason: `This address appears to be in ${matchedCountry}, not ${body.countryCode}. Please check the country.`,
        detectedCountry: matchedCountry,
      });
    }

    return Response.json({
      valid: true,
      normalized: {
        line1: match.address.road || body.line1,
        city: match.address.city || match.address.town || match.address.village || body.city,
        postalCode: match.address.postcode || body.postalCode,
        countryCode: matchedCountry || body.countryCode,
        displayName: match.display_name,
      },
      confidence: match.importance > 0.5 ? "high" : "medium",
    });
  } catch (error) {
    console.error("validate-address: error", error);
    // Don't block the user — address validation is advisory
    return Response.json({
      valid: true,
      _unverified: true,
      reason: "Address verification unavailable — proceeding without validation",
    });
  }
};
