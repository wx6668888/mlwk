import {
  requireUser,
  unauthorized,
  type AuthEnv,
} from "../../_auth";

interface Env extends AuthEnv {
  DB: D1Database;
}

type ProjectRow = {
  id: string;
  project_code: string;
  created_at: string;
  updated_at: string;
  status: string;
  expected_date: string;
  project_type: string;
  project_location: string;
  scope: string;
  update_id: string | null;
  update_created_at: string | null;
  update_status: string | null;
  customer_note: string | null;
  update_expected_date: string | null;
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const user = await requireUser(context.request, context.env);
  if (!user) return unauthorized();

  const result = await context.env.DB.prepare(
    `SELECT
       i.id, i.project_code, i.created_at, i.updated_at, i.status,
       i.expected_date, i.project_type, i.project_location, i.scope,
       u.id AS update_id, u.created_at AS update_created_at,
       u.status AS update_status, u.customer_note,
       u.expected_date AS update_expected_date
     FROM inquiries i
     LEFT JOIN project_updates u ON u.inquiry_id = i.id
     WHERE i.user_id = ?
     ORDER BY i.created_at DESC, u.created_at ASC`,
  )
    .bind(user.id)
    .all<ProjectRow>();

  const projects = new Map<
    string,
    Omit<ProjectRow, "update_id" | "update_created_at" | "update_status" | "customer_note" | "update_expected_date"> & {
      updates: Array<{
        id: string;
        created_at: string;
        status: string;
        customer_note: string;
        expected_date: string;
      }>;
    }
  >();

  for (const row of result.results) {
    if (!projects.has(row.id)) {
      projects.set(row.id, {
        id: row.id,
        project_code: row.project_code,
        created_at: row.created_at,
        updated_at: row.updated_at,
        status: row.status,
        expected_date: row.expected_date,
        project_type: row.project_type,
        project_location: row.project_location,
        scope: row.scope,
        updates: [],
      });
    }
    if (row.update_id && row.update_created_at && row.update_status) {
      projects.get(row.id)?.updates.push({
        id: row.update_id,
        created_at: row.update_created_at,
        status: row.update_status,
        customer_note: row.customer_note ?? "",
        expected_date: row.update_expected_date ?? "",
      });
    }
  }

  return Response.json({ projects: Array.from(projects.values()) });
};
