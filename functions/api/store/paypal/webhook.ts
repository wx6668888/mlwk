import {
  paypalAccessToken,
  paypalBase,
  type StoreEnv,
} from "../../../_store";

type PayPalEvent = {
  id: string;
  event_type: string;
  resource?: {
    id?: string;
    supplementary_data?: {
      related_ids?: { order_id?: string };
    };
  };
};

export const onRequestPost: PagesFunction<StoreEnv> = async (context) => {
  try {
    if (!context.env.PAYPAL_WEBHOOK_ID) {
      return Response.json({ error: "Webhook is not configured." }, { status: 503 });
    }
    const event = (await context.request.json()) as PayPalEvent;
    if (!event.id || !event.event_type) {
      return Response.json({ error: "Invalid webhook." }, { status: 400 });
    }
    const existing = await context.env.DB.prepare(
      "SELECT id FROM store_payment_events WHERE id = ?",
    )
      .bind(event.id)
      .first();
    if (existing) return Response.json({ received: true, duplicate: true });

    const accessToken = await paypalAccessToken(context.env);
    const verification = await fetch(
      `${paypalBase(context.env)}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auth_algo: context.request.headers.get("PAYPAL-AUTH-ALGO"),
          cert_url: context.request.headers.get("PAYPAL-CERT-URL"),
          transmission_id: context.request.headers.get("PAYPAL-TRANSMISSION-ID"),
          transmission_sig: context.request.headers.get("PAYPAL-TRANSMISSION-SIG"),
          transmission_time: context.request.headers.get("PAYPAL-TRANSMISSION-TIME"),
          webhook_id: context.env.PAYPAL_WEBHOOK_ID,
          webhook_event: event,
        }),
      },
    );
    const verified = (await verification.json()) as { verification_status?: string };
    if (!verification.ok || verified.verification_status !== "SUCCESS") {
      return Response.json({ error: "Invalid webhook signature." }, { status: 401 });
    }

    const paypalOrderId =
      event.resource?.supplementary_data?.related_ids?.order_id ??
      (event.event_type.startsWith("CHECKOUT.ORDER") ? event.resource?.id : undefined);
    const statusMap: Record<string, string> = {
      "PAYMENT.CAPTURE.COMPLETED": "paid",
      "PAYMENT.CAPTURE.DENIED": "payment_failed",
      "PAYMENT.CAPTURE.REFUNDED": "refunded",
      "CHECKOUT.ORDER.VOIDED": "cancelled",
    };
    const nextStatus = statusMap[event.event_type];

    const statements = [
      context.env.DB.prepare(
        `INSERT OR IGNORE INTO store_payment_events (id, created_at, event_type, paypal_order_id)
         VALUES (?, datetime('now'), ?, ?)`,
      ).bind(event.id, event.event_type, paypalOrderId ?? ""),
    ];
    if (paypalOrderId && nextStatus) {
      statements.push(
        context.env.DB.prepare(
          `UPDATE store_orders SET status = ?, updated_at = datetime('now')
           WHERE paypal_order_id = ?`,
        ).bind(nextStatus, paypalOrderId),
      );
    }
    await context.env.DB.batch(statements);
    return Response.json({ received: true });
  } catch (error) {
    console.error("PayPal webhook failed", error);
    return Response.json({ error: "Webhook processing failed." }, { status: 400 });
  }
};
