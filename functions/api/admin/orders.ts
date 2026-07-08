/**
 * Admin: List all store orders.
 * GET /api/admin/orders — requires admin auth
 */

import { requireAdmin, forbidden, type AuthEnv } from "../../_auth";

interface Env extends AuthEnv {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const admin = await requireAdmin(context.request, context.env);
  if (!admin) return forbidden();

  const db = context.env.DB;

  const { results: orders } = await db
    .prepare(
      `SELECT o.*,
        (SELECT json_group_array(json_object(
          'sku', i.sku,
          'productName', i.product_name,
          'finish', i.finish,
          'quantity', i.quantity,
          'unitPriceMinor', i.unit_price_minor
        )) FROM store_order_items i WHERE i.order_id = o.id) AS items_json
      FROM store_orders o
      ORDER BY o.created_at DESC
      LIMIT 100`,
    )
    .all<{
      id: string;
      order_number: string;
      created_at: string;
      locale: string;
      email: string;
      currency: string;
      subtotal_minor: number;
      shipping_minor: number;
      total_minor: number;
      shipping_zone: string;
      shipping_address_json: string;
      status: string;
      paypal_order_id: string;
      paypal_capture_id: string;
      items_json: string;
    }>();

  const parsed = orders.map((o) => ({
    id: o.id,
    orderNumber: o.order_number,
    createdAt: o.created_at,
    locale: o.locale,
    email: o.email,
    currency: o.currency,
    subtotalMinor: o.subtotal_minor,
    shippingMinor: o.shipping_minor,
    totalMinor: o.total_minor,
    shippingZone: o.shipping_zone,
    shippingAddress: safeJson(o.shipping_address_json),
    status: o.status,
    paypalOrderId: o.paypal_order_id,
    paypalCaptureId: o.paypal_capture_id,
    items: safeJson(o.items_json),
  }));

  // Compute summary
  const revenueMinor = parsed
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + o.totalMinor, 0);
  const pendingCount = parsed.filter((o) => o.status === "pending_payment").length;
  const paidCount = parsed.filter((o) => o.status === "paid").length;

  return Response.json({
    orders: parsed,
    summary: {
      totalOrders: parsed.length,
      revenueMinor,
      pendingCount,
      paidCount,
    },
  });
};

function safeJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}
