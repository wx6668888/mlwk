/**
 * Currency exchange rates — real-time via frankfurter.app (free, no API key).
 * Falls back to hardcoded rates if the upstream is unreachable.
 *
 * GET /api/currency-rates
 * Query: ?from=USD (default)
 * Cache: 1 hour on client, 4 hours on Cloudflare CDN
 */

const FALLBACK_RATES: Record<string, number> = {
  EUR: 0.92,
  GBP: 0.8,
  CNY: 7.25,
  AED: 3.67,
  SAR: 3.75,
  CAD: 1.36,
  AUD: 1.53,
  JPY: 149.5,
  KRW: 1310.0,
};

interface RatesResponse {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export const onRequestGet: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const from = url.searchParams.get("from") || "USD";

  try {
    const upstream = await fetch(
      `https://api.frankfurter.app/latest?from=${from}`,
      { headers: { Accept: "application/json" } },
    );

    if (!upstream.ok) throw new Error(`Upstream ${upstream.status}`);

    const data = (await upstream.json()) as RatesResponse;

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600, s-maxage=14400",
        "CDN-Cache-Control": "max-age=14400",
      },
    });
  } catch (error) {
    console.error("currency-rates: upstream failed, using fallback", error);

    return new Response(
      JSON.stringify({
        base: from,
        date: new Date().toISOString().slice(0, 10),
        rates: FALLBACK_RATES,
        _fallback: true,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=600",
        },
      },
    );
  }
};
