import { currencyForCountry } from "../../../shared/storeCatalog";

export const onRequestGet: PagesFunction = async (context) => {
  const country =
    (context.request as Request & { cf?: { country?: string } }).cf?.country ??
    context.request.headers.get("CF-IPCountry") ??
    "US";
  return Response.json({
    country,
    currency: currencyForCountry(country),
  });
};
