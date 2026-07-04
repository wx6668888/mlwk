import { findProduct } from "../../../../shared/storeCatalog";
import { requireUser, unauthorized, type AuthEnv } from "../../../_auth";

interface Env extends AuthEnv {
  DB: D1Database;
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const user = await requireUser(context.request, context.env);
  if (!user) return unauthorized();
  const sku = String(context.params.sku ?? "");
  if (!findProduct(sku)) {
    return Response.json({ error: "Product not found." }, { status: 404 });
  }
  await context.env.DB.prepare(
    `INSERT OR IGNORE INTO store_favorites (user_id, sku, created_at)
     VALUES (?, ?, datetime('now'))`,
  )
    .bind(user.id, sku)
    .run();
  return Response.json({ saved: true });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const user = await requireUser(context.request, context.env);
  if (!user) return unauthorized();
  const sku = String(context.params.sku ?? "");
  await context.env.DB.prepare(
    "DELETE FROM store_favorites WHERE user_id = ? AND sku = ?",
  )
    .bind(user.id, sku)
    .run();
  return Response.json({ deleted: true });
};
