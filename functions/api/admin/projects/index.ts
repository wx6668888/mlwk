import { forbidden, requireAdmin, type AuthEnv } from "../../../_auth";

interface Env extends AuthEnv {
  DB: D1Database;
}

type AdminProjectRow = {
  id: string;
  project_code: string;
  created_at: string;
  updated_at: string;
  status: string;
  expected_date: string;
  locale: string;
  name: string;
  company: string;
  email: string;
  country: string;
  project_type: string;
  project_location: string;
  scope: string;
  message: string;
  update_id: string | null;
  update_created_at: string | null;
  update_status: string | null;
  customer_note: string | null;
  update_expected_date: string | null;
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const admin = await requireAdmin(context.request, context.env);
  if (!admin) return forbidden();

  const result = await context.env.DB.prepare(
    `SELECT
       i.id, i.project_code, i.created_at, i.updated_at, i.status,
       i.expected_date, i.locale, i.name, i.company, i.email, i.country,
       i.project_type, i.project_location, i.scope, i.message,
       u.id AS update_id, u.created_at AS update_created_at,
       u.status AS update_status, u.customer_note,
       u.expected_date AS update_expected_date
     FROM inquiries i
     LEFT JOIN project_updates u ON u.inquiry_id = i.id
     ORDER BY i.created_at DESC, u.created_at ASC`,
  ).all<AdminProjectRow>();

  const projects = new Map<string, Record<string, unknown>>();
  for (const row of result.results) {
    if (!projects.has(row.id)) {
      projects.set(row.id, {
        id: row.id,
        project_code: row.project_code,
        created_at: row.created_at,
        updated_at: row.updated_at,
        status: row.status,
        expected_date: row.expected_date,
        locale: row.locale,
        name: row.name,
        company: row.company,
        email: row.email,
        country: row.country,
        project_type: row.project_type,
        project_location: row.project_location,
        scope: row.scope,
        message: row.message,
        updates: [],
      });
    }
    if (row.update_id && row.update_created_at && row.update_status) {
      const project = projects.get(row.id) as {
        updates: Array<Record<string, string>>;
      };
      project.updates.push({
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
