import {
  findProduct,
  productPrice,
  shippingForCountry,
  type Currency,
} from "../shared/storeCatalog";

export interface StoreEnv {
  DB: D1Database;
  PAYPAL_CLIENT_ID?: string;
  PAYPAL_CLIENT_SECRET?: string;
  PAYPAL_ENV?: "sandbox" | "live";
  PAYPAL_WEBHOOK_ID?: string;
}

export type ValidatedCart = {
  items: Array<{
    sku: string;
    name: string;
    finish: string;
    quantity: number;
    unitPrice: number;
  }>;
  subtotal: number;
  shipping: number;
  shippingZone: string;
  total: number;
};

export function validateCart(
  items: Array<{ sku: string; finish: string; quantity: number }>,
  currency: Currency,
  countryCode: string,
): ValidatedCart {
  const validated = items.map((item) => {
    const product = findProduct(item.sku);
    if (!product) throw new Error(`Unknown SKU: ${item.sku}`);
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) {
      throw new Error(`Invalid quantity for ${item.sku}`);
    }
    if (!product.finishes.includes(item.finish)) {
      throw new Error(`Invalid finish for ${item.sku}`);
    }
    return {
      sku: product.sku,
      name: product.name.en,
      finish: item.finish,
      quantity: item.quantity,
      unitPrice: productPrice(product, currency),
    };
  });
  const subtotal = validated.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const shippingResult = shippingForCountry(countryCode, currency);
  return {
    items: validated,
    subtotal,
    shipping: shippingResult.amount,
    shippingZone: shippingResult.zone,
    total: subtotal + shippingResult.amount,
  };
}

export function paypalBase(env: StoreEnv) {
  return env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export async function paypalAccessToken(env: StoreEnv) {
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
    throw new Error("PayPal is not configured.");
  }
  const credentials = btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`);
  const response = await fetch(`${paypalBase(env)}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!response.ok) throw new Error(`PayPal authentication failed: ${response.status}`);
  const result = (await response.json()) as { access_token: string };
  return result.access_token;
}

export function money(amount: number) {
  return amount.toFixed(2);
}

export async function hashToken(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}
