import { z } from "zod";
import {
  hashToken,
  paypalAccessToken,
  paypalBase,
  randomToken,
  type StoreEnv,
} from "../../../_store";

const schema = z.object({
  paypalOrderId: z.string().min(8).max(80),
});

type PayPalCapture = {
  status?: string;
  purchase_units?: Array<{
    payments?: { captures?: Array<{ id?: string; status?: string }> };
  }>;
};

export const onRequestPost: PagesFunction<StoreEnv> = async (context) => {
  try {
    const input = schema.parse(await context.request.json());
    const order = await context.env.DB.prepare(
      "SELECT id, status FROM store_orders WHERE paypal_order_id = ?",
    )
      .bind(input.paypalOrderId)
      .first<{ id: string; status: string }>();
    if (!order) {
      return Response.json({ error: "Order not found." }, { status: 404 });
    }
    if (order.status === "paid") {
      return Response.json({ orderId: order.id, alreadyCaptured: true });
    }

    const accessToken = await paypalAccessToken(context.env);
    const response = await fetch(
      `${paypalBase(context.env)}/v2/checkout/orders/${encodeURIComponent(input.paypalOrderId)}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "PayPal-Request-Id": `capture-${order.id}`,
        },
      },
    );
    const result = (await response.json()) as PayPalCapture & { message?: string };
    const capture = result.purchase_units?.[0]?.payments?.captures?.[0];
    if (!response.ok || result.status !== "COMPLETED" || !capture?.id) {
      throw new Error(result.message || "PayPal capture was not completed.");
    }

    const claimToken = randomToken();
    await context.env.DB.prepare(
      `UPDATE store_orders
       SET status = 'paid', paypal_capture_id = ?, claim_token_hash = ?,
           updated_at = datetime('now')
       WHERE id = ?`,
    )
      .bind(capture.id, await hashToken(claimToken), order.id)
      .run();

    return Response.json({ orderId: order.id, claimToken });
  } catch (error) {
    console.error("Capture store order failed", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Payment failed." },
      { status: 400 },
    );
  }
};
