import { requireUser, unauthorized, type AuthEnv } from "../../_auth";

interface Env extends AuthEnv {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const user = await requireUser(context.request, context.env);
  if (!user) return unauthorized();
  const result = await context.env.DB.prepare(
    `SELECT id, order_number, status, currency, total_minor, created_at
     FROM store_orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 100`,
  )
    .bind(user.id)
    .all();
  return Response.json({ orders: result.results });
};
