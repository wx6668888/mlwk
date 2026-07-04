import { z } from "zod";
import { requireUser, unauthorized, type AuthEnv } from "../../../../_auth";
import { hashToken } from "../../../../_store";

interface Env extends AuthEnv {
  DB: D1Database;
}

const schema = z.object({
  claimToken: z.string().min(20).max(200),
});

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const user = await requireUser(context.request, context.env);
  if (!user) return unauthorized();
  try {
    const { claimToken } = schema.parse(await context.request.json());
    const id = String(context.params.id ?? "");
    const order = await context.env.DB.prepare(
      "SELECT email, claim_token_hash, user_id FROM store_orders WHERE id = ?",
    )
      .bind(id)
      .first<{ email: string; claim_token_hash: string; user_id: string }>();
    if (!order) {
      return Response.json({ error: "Order not found." }, { status: 404 });
    }
    if (order.user_id && order.user_id !== user.id) {
      return Response.json({ error: "Order already belongs to another account." }, { status: 409 });
    }
    if (!user.email || user.email.toLowerCase() !== order.email.toLowerCase()) {
      return Response.json({ error: "Account email does not match the order." }, { status: 403 });
    }
    if ((await hashToken(claimToken)) !== order.claim_token_hash) {
      return Response.json({ error: "Invalid claim token." }, { status: 403 });
    }
    await context.env.DB.prepare(
      `UPDATE store_orders SET user_id = ?, claim_token_hash = '',
       updated_at = datetime('now') WHERE id = ?`,
    )
      .bind(user.id, id)
      .run();
    return Response.json({ claimed: true });
  } catch {
    return Response.json({ error: "Invalid claim request." }, { status: 400 });
  }
};
