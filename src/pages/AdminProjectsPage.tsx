import { LoaderCircle, RefreshCw, Save } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { authHeaders, useAuth } from "../auth/AuthContext";
import type { Locale } from "../content";

const statuses = [
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

const statusLabels: Record<(typeof statuses)[number], string> = {
  submitted: "Submitted",
  under_review: "Under review",
  scope_clarification: "Scope clarification",
  design_development: "Design development",
  sampling: "Sampling",
  production: "Production",
  quality_check: "Quality check",
  packed: "Packed",
  shipped: "Shipped",
  completed: "Completed",
  on_hold: "On hold",
};

type AdminProject = {
  id: string;
  project_code: string;
  created_at: string;
  updated_at: string;
  status: (typeof statuses)[number];
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
  updates: Array<{
    id: string;
    created_at: string;
    status: string;
    customer_note: string;
    expected_date: string;
  }>;
};

export default function AdminProjectsPage({ locale }: { locale: Locale }) {
  const { accessToken } = useAuth();
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] =
    useState<(typeof statuses)[number]>("submitted");
  const [expectedDate, setExpectedDate] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  const selected = useMemo(
    () => projects.find((project) => project.id === selectedId) ?? null,
    [projects, selectedId],
  );

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/admin/projects", {
      headers: authHeaders(accessToken),
    });
    if (response.status === 403) {
      setForbidden(true);
      setLoading(false);
      return;
    }
    if (!response.ok) {
      setError("Could not load projects.");
      setLoading(false);
      return;
    }
    const result = (await response.json()) as { projects: AdminProject[] };
    setProjects(result.projects);
    setSelectedId((current) => current || result.projects[0]?.id || "");
    setForbidden(false);
    setLoading(false);
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!selected) return;
    setStatus(selected.status);
    setExpectedDate(selected.expected_date);
    setCustomerNote("");
  }, [selected]);

  const saveUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected || saving) return;
    setSaving(true);
    setError("");
    const response = await fetch(`/api/admin/projects/${selected.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(accessToken),
      },
      body: JSON.stringify({ status, expectedDate, customerNote }),
    });
    if (!response.ok) {
      setError("The update could not be saved.");
      setSaving(false);
      return;
    }
    await load();
    setCustomerNote("");
    setSaving(false);
  };

  if (loading) {
    return (
      <section className="admin-projects-state">
        <LoaderCircle className="spin" />
        <p>Loading project workspace</p>
      </section>
    );
  }

  if (forbidden) {
    return (
      <section className="admin-projects-state">
        <h1>Staff access only</h1>
        <p>
          Add this account&apos;s Supabase user ID to the ADMIN_USER_IDS
          environment variable.
        </p>
      </section>
    );
  }

  return (
    <section className="admin-projects-page">
      <header>
        <div>
          <small>MLWK Operations</small>
          <h1>Project updates</h1>
        </div>
        <button type="button" onClick={() => void load()} aria-label="Refresh">
          <RefreshCw size={17} />
        </button>
      </header>

      {projects.length ? (
        <div className="admin-projects-layout">
          <aside aria-label="Projects">
            {projects.map((project) => (
              <button
                type="button"
                key={project.id}
                className={project.id === selectedId ? "is-active" : ""}
                onClick={() => setSelectedId(project.id)}
              >
                <span>
                  <strong>{project.project_code}</strong>
                  <small>
                    {project.company} · {project.project_location || project.country}
                  </small>
                </span>
                <i>{statusLabels[project.status]}</i>
              </button>
            ))}
          </aside>

          {selected && (
            <main>
              <div className="admin-project-summary">
                <span>{selected.project_type}</span>
                <h2>{selected.project_code}</h2>
                <p>
                  {selected.name} · {selected.company} · {selected.email}
                </p>
                <dl>
                  <div>
                    <dt>Location</dt>
                    <dd>{selected.project_location || selected.country}</dd>
                  </div>
                  <div>
                    <dt>Scope</dt>
                    <dd>{selected.scope || "Not specified"}</dd>
                  </div>
                </dl>
                {selected.message && <blockquote>{selected.message}</blockquote>}
              </div>

              <form onSubmit={saveUpdate}>
                <label>
                  <span>Project stage</span>
                  <select
                    value={status}
                    onChange={(event) =>
                      setStatus(
                        event.target.value as (typeof statuses)[number],
                      )
                    }
                  >
                    {statuses.map((item) => (
                      <option key={item} value={item}>
                        {statusLabels[item]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Expected date</span>
                  <input
                    type="date"
                    value={expectedDate}
                    onChange={(event) => setExpectedDate(event.target.value)}
                  />
                </label>
                <label className="wide">
                  <span>Customer-visible note</span>
                  <textarea
                    rows={5}
                    maxLength={2000}
                    value={customerNote}
                    onChange={(event) => setCustomerNote(event.target.value)}
                    placeholder="Describe what has been completed and what happens next."
                  />
                </label>
                {error && <p className="form-error wide">{error}</p>}
                <button className="primary-button" type="submit" disabled={saving}>
                  {saving ? <LoaderCircle className="spin" size={16} /> : <Save size={16} />}
                  Publish update
                </button>
              </form>

              <ol className="project-timeline">
                {selected.updates.map((update) => (
                  <li key={update.id}>
                    <i />
                    <div>
                      <span>
                        <strong>
                          {statusLabels[
                            update.status as keyof typeof statusLabels
                          ] ?? update.status}
                        </strong>
                        <small>
                          {new Date(update.created_at).toLocaleDateString(locale)}
                        </small>
                      </span>
                      {update.customer_note && <p>{update.customer_note}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </main>
          )}
        </div>
      ) : (
        <div className="admin-projects-state">
          <p>No enquiries have been submitted yet.</p>
        </div>
      )}
    </section>
  );
}
