import { requireUser, unauthorized, type AuthEnv } from "../../../_auth";

interface Env extends AuthEnv {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const user = await requireUser(context.request, context.env);
  if (!user) return unauthorized();
  const result = await context.env.DB.prepare(
    "SELECT sku FROM store_favorites WHERE user_id = ? ORDER BY created_at DESC",
  )
    .bind(user.id)
    .all<{ sku: string }>();
  return Response.json({
    favorites: result.results.map((item) => item.sku),
  });
};
