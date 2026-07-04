import { z } from "zod";
import {
  money,
  paypalAccessToken,
  paypalBase,
  validateCart,
  type StoreEnv,
} from "../../../_store";

const schema = z.object({
  locale: z.enum(["en", "ar", "zh", "de", "fr"]),
  currency: z.enum(["USD", "EUR", "GBP"]),
  items: z
    .array(
      z.object({
        sku: z.string().min(1).max(40),
        finish: z.string().min(1).max(80),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(30),
  shippingAddress: z.object({
    name: z.string().min(2).max(120),
    email: z.string().email().max(200),
    phone: z.string().max(60),
    line1: z.string().min(3).max(180),
    line2: z.string().max(180),
    city: z.string().min(2).max(100),
    region: z.string().max(100),
    postalCode: z.string().min(2).max(30),
    country: z.string().length(2),
  }),
});

export const onRequestPost: PagesFunction<StoreEnv> = async (context) => {
  let internalOrderId = "";
  try {
    const input = schema.parse(await context.request.json());
    const cart = validateCart(
      input.items,
      input.currency,
      input.shippingAddress.country,
    );
    const accessToken = await paypalAccessToken(context.env);
    internalOrderId = crypto.randomUUID();
    const orderNumber = `MLWK-${Date.now().toString(36).toUpperCase()}`;

    await context.env.DB.prepare(
      `INSERT INTO store_orders (
        id, order_number, created_at, updated_at, locale, user_id, email,
        currency, subtotal_minor, shipping_minor, total_minor, shipping_zone,
        shipping_address_json, status
      ) VALUES (?, ?, datetime('now'), datetime('now'), ?, '', ?, ?, ?, ?, ?, ?, ?, 'pending_payment')`,
    )
      .bind(
        internalOrderId,
        orderNumber,
        input.locale,
        input.shippingAddress.email.toLowerCase(),
        input.currency,
        cart.subtotal * 100,
        cart.shipping * 100,
        cart.total * 100,
        cart.shippingZone,
        JSON.stringify(input.shippingAddress),
      )
      .run();

    await context.env.DB.batch(
      cart.items.map((item) =>
        context.env.DB.prepare(
          `INSERT INTO store_order_items (
            id, order_id, sku, product_name, finish, quantity, unit_price_minor
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ).bind(
          crypto.randomUUID(),
          internalOrderId,
          item.sku,
          item.name,
          item.finish,
          item.quantity,
          item.unitPrice * 100,
        ),
      ),
    );

    const response = await fetch(`${paypalBase(context.env)}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": internalOrderId,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            custom_id: internalOrderId,
            invoice_id: orderNumber,
            amount: {
              currency_code: input.currency,
              value: money(cart.total),
              breakdown: {
                item_total: {
                  currency_code: input.currency,
                  value: money(cart.subtotal),
                },
                shipping: {
                  currency_code: input.currency,
                  value: money(cart.shipping),
                },
              },
            },
            items: cart.items.map((item) => ({
              name: `${item.name} · ${item.finish}`.slice(0, 127),
              sku: item.sku,
              quantity: String(item.quantity),
              category: "PHYSICAL_GOODS",
              unit_amount: {
                currency_code: input.currency,
                value: money(item.unitPrice),
              },
            })),
            shipping: {
              name: { full_name: input.shippingAddress.name },
              address: {
                address_line_1: input.shippingAddress.line1,
                address_line_2: input.shippingAddress.line2 || undefined,
                admin_area_2: input.shippingAddress.city,
                admin_area_1: input.shippingAddress.region || undefined,
                postal_code: input.shippingAddress.postalCode,
                country_code: input.shippingAddress.country.toUpperCase(),
              },
            },
          },
        ],
      }),
    });
    const result = (await response.json()) as { id?: string; message?: string };
    if (!response.ok || !result.id) {
      throw new Error(result.message || `PayPal create order failed: ${response.status}`);
    }

    await context.env.DB.prepare(
      "UPDATE store_orders SET paypal_order_id = ?, updated_at = datetime('now') WHERE id = ?",
    )
      .bind(result.id, internalOrderId)
      .run();

    return Response.json({
      orderId: internalOrderId,
      paypalOrderId: result.id,
      currency: input.currency,
      total: cart.total,
    });
  } catch (error) {
    if (internalOrderId) {
      await context.env.DB.prepare(
        "UPDATE store_orders SET status = 'payment_failed', updated_at = datetime('now') WHERE id = ?",
      )
        .bind(internalOrderId)
        .run()
        .catch(() => undefined);
    }
    console.error("Create store order failed", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Invalid order." },
      { status: 400 },
    );
  }
};
