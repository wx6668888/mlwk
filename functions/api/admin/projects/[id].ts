import { z } from "zod";
import { forbidden, requireAdmin, type AuthEnv } from "../../../_auth";

interface Env extends AuthEnv {
  DB: D1Database;
}

const projectStatuses = [
  "submitted",
  "under_review",
  "scope_clarification",
  "design_development",
  "sampling",
  "production",
  "quality_check",
  "packed",
  "shipped",
  "completed",
  "on_hold",
] as const;

const updateSchema = z.object({
  status: z.enum(projectStatuses),
  expectedDate: z
    .string()
    .max(10)
    .refine(
      (value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value),
      "Invalid expected date.",
    ),
  customerNote: z.string().max(2000),
});

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  const admin = await requireAdmin(context.request, context.env);
  if (!admin) return forbidden();

  try {
    const projectId = String(context.params.id ?? "");
    const update = updateSchema.parse(await context.request.json());
    const existing = await context.env.DB.prepare(
      "SELECT id FROM inquiries WHERE id = ?",
    )
      .bind(projectId)
      .first<{ id: string }>();
    if (!existing) {
      return Response.json({ error: "Project not found." }, { status: 404 });
    }

    await context.env.DB.batch([
      context.env.DB.prepare(
        `UPDATE inquiries
         SET status = ?, expected_date = ?, updated_at = datetime('now')
         WHERE id = ?`,
      ).bind(update.status, update.expectedDate, projectId),
      context.env.DB.prepare(
        `INSERT INTO project_updates (
          id, inquiry_id, created_at, status, customer_note, expected_date,
          created_by
        ) VALUES (?, ?, datetime('now'), ?, ?, ?, ?)`,
      ).bind(
        crypto.randomUUID(),
        projectId,
        update.status,
        update.customerNote,
        update.expectedDate,
        admin.id,
      ),
    ]);

    return Response.json({ updated: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Invalid project update." }, { status: 400 });
  }
};
