import { requireUser, unauthorized, type AuthEnv } from "../../../_auth";

interface Env extends AuthEnv {
  DB: D1Database;
}

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const user = await requireUser(context.request, context.env);
  if (!user) return unauthorized();
  const id = String(context.params.id ?? "");
  const result = await context.env.DB.prepare(
    "DELETE FROM store_addresses WHERE id = ? AND user_id = ?",
  )
    .bind(id, user.id)
    .run();
  if (!result.meta.changes) {
    return Response.json({ error: "Address not found." }, { status: 404 });
  }
  return Response.json({ deleted: true });
};
