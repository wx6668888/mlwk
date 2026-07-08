import {
  BarChart3,
  Box,
  CheckCircle,
  Clock,
  DollarSign,
  LoaderCircle,
  Package,
  RefreshCw,
  Save,
  ShoppingCart,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { authHeaders, useAuth } from "../auth/AuthContext";
import type { Locale } from "../content";

/* ── Types ──────────────────────────────────────────────────── */

const STATUSES = [
  "submitted", "under_review", "scope_clarification",
  "design_development", "sampling", "production",
  "quality_check", "packed", "shipped", "completed", "on_hold",
] as const;

type Status = (typeof STATUSES)[number];

const STATUS_LABELS: Record<Status, string> = {
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
  status: Status;
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

type AdminOrder = {
  id: string;
  orderNumber: string;
  createdAt: string;
  locale: string;
  email: string;
  currency: string;
  subtotalMinor: number;
  shippingMinor: number;
  totalMinor: number;
  shippingZone: string;
  shippingAddress: Record<string, string>;
  status: string;
  paypalOrderId: string;
  paypalCaptureId: string;
  items: Array<{
    sku: string;
    productName: string;
    finish: string;
    quantity: number;
    unitPriceMinor: number;
  }>;
};

type OrderSummary = {
  totalOrders: number;
  revenueMinor: number;
  pendingCount: number;
  paidCount: number;
};

type Tab = "overview" | "projects" | "orders";

/* ── Tab labels by locale ───────────────────────────────────── */

const TAB_LABELS: Record<Locale, Record<Tab, string>> = {
  en: { overview: "Overview", projects: "Projects", orders: "Orders" },
  zh: { overview: "概览", projects: "项目管理", orders: "订单管理" },
  ar: { overview: "نظرة عامة", projects: "المشاريع", orders: "الطلبات" },
  de: { overview: "Übersicht", projects: "Projekte", orders: "Bestellungen" },
  fr: { overview: "Aperçu", projects: "Projets", orders: "Commandes" },
};

/* ── Utility ────────────────────────────────────────────────── */

function fmtMinor(amount: number, currency: string): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount / 100);
}

function fmtDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

/* ── Main component ─────────────────────────────────────────── */

export default function AdminDashboardPage({ locale }: { locale: Locale }) {
  const { accessToken } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");

  /* Projects state */
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<Status>("submitted");
  const [expectedDate, setExpectedDate] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  /* Orders state */
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const selected = useMemo(
    () => projects.find((p) => p.id === selectedId) ?? null,
    [projects, selectedId],
  );

  /* ── Load projects ──────────────────────────────────────────── */

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");
    const resp = await fetch("/api/admin/projects", {
      headers: authHeaders(accessToken),
    });
    if (resp.status === 403) { setForbidden(true); setLoading(false); return; }
    if (!resp.ok) { setError("Could not load projects."); setLoading(false); return; }
    const result = (await resp.json()) as { projects: AdminProject[] };
    setProjects(result.projects);
    setSelectedId((cur) => cur || result.projects[0]?.id || "");
    setForbidden(false);
    setLoading(false);
  }, [accessToken]);

  /* ── Load orders ────────────────────────────────────────────── */

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const resp = await fetch("/api/admin/orders", {
        headers: authHeaders(accessToken),
      });
      if (resp.ok) {
        const data = (await resp.json()) as {
          orders: AdminOrder[];
          summary: OrderSummary;
        };
        setOrders(data.orders);
        setOrderSummary(data.summary);
      }
    } catch { /* silently ignore — orders tab may be unavailable */ }
    setOrdersLoading(false);
  }, [accessToken]);

  useEffect(() => { void loadProjects(); }, [loadProjects]);

  useEffect(() => {
    if (!selected) return;
    setStatus(selected.status);
    setExpectedDate(selected.expected_date);
    setCustomerNote("");
  }, [selected]);

  /* ── Save project update ────────────────────────────────────── */

  const saveUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selected || saving) return;
    setSaving(true); setError("");
    const resp = await fetch(`/api/admin/projects/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders(accessToken) },
      body: JSON.stringify({ status, expectedDate, customerNote }),
    });
    if (!resp.ok) { setError("Update could not be saved."); setSaving(false); return; }
    await loadProjects();
    setCustomerNote("");
    setSaving(false);
  };

  /* ── KPIs from projects ─────────────────────────────────────── */

  const kpis = useMemo(() => {
    const total = projects.length;
    const active = projects.filter((p) =>
      !["completed", "on_hold"].includes(p.status),
    ).length;
    const completed = projects.filter((p) => p.status === "completed").length;
    const recent = projects.filter((p) => {
      const d = new Date(p.created_at);
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return d.getTime() > weekAgo;
    }).length;
    return { total, active, completed, recent };
  }, [projects]);

  /* ── Forbidden fallback ─────────────────────────────────────── */

  if (forbidden) {
    return (
      <section className="admin-state">
        <h1>Staff access only</h1>
        <p>
          Add this account&apos;s Supabase user ID to the ADMIN_USER_IDS
          environment variable.
        </p>
      </section>
    );
  }

  /* ── Render ─────────────────────────────────────────────────── */

  return (
    <section className="admin-dashboard">
      <header className="admin-dashboard__header">
        <div>
          <small>MLWK Operations</small>
          <h1>{TAB_LABELS[locale][tab]}</h1>
        </div>
        <button
          type="button"
          onClick={() => { void loadProjects(); if (tab === "orders") void loadOrders(); }}
          aria-label="Refresh"
          className="admin-refresh-btn"
        >
          <RefreshCw size={17} />
        </button>
      </header>

      {/* ── Tab nav ──────────────────────────────────── */}
      <nav className="admin-tabs" role="tablist">
        {(Object.keys(TAB_LABELS[locale]) as Tab[]).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={tab === t ? "is-active" : ""}
            onClick={() => { setTab(t); if (t === "orders" && orders.length === 0) void loadOrders(); }}
          >
            {t === "overview" && <BarChart3 size={16} />}
            {t === "projects" && <Box size={16} />}
            {t === "orders" && <ShoppingCart size={16} />}
            {TAB_LABELS[locale][t]}
          </button>
        ))}
      </nav>

      {/* ── OVERVIEW tab ──────────────────────────────── */}
      {tab === "overview" && (
        <div className="admin-overview">
          <div className="kpi-grid">
            <div className="kpi-card">
              <span className="kpi-icon"><Box size={20} /></span>
              <div>
                <strong>{kpis.total}</strong>
                <small>Total enquiries</small>
              </div>
            </div>
            <div className="kpi-card">
              <span className="kpi-icon kpi-icon--active"><Clock size={20} /></span>
              <div>
                <strong>{kpis.active}</strong>
                <small>Active projects</small>
              </div>
            </div>
            <div className="kpi-card">
              <span className="kpi-icon kpi-icon--success"><CheckCircle size={20} /></span>
              <div>
                <strong>{kpis.completed}</strong>
                <small>Completed</small>
              </div>
            </div>
            <div className="kpi-card">
              <span className="kpi-icon kpi-icon--accent"><TrendingUp size={20} /></span>
              <div>
                <strong>{kpis.recent}</strong>
                <small>Last 7 days</small>
              </div>
            </div>
            {orderSummary && (
              <>
                <div className="kpi-card">
                  <span className="kpi-icon"><DollarSign size={20} /></span>
                  <div>
                    <strong>{fmtMinor(orderSummary.revenueMinor, "USD")}</strong>
                    <small>Store revenue</small>
                  </div>
                </div>
                <div className="kpi-card">
                  <span className="kpi-icon"><ShoppingCart size={20} /></span>
                  <div>
                    <strong>{orderSummary.totalOrders}</strong>
                    <small>Store orders</small>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="admin-recent">
            <h2>Recent enquiries</h2>
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Code</th><th>Company</th><th>Type</th>
                    <th>Country</th><th>Status</th><th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.slice(0, 10).map((p) => (
                    <tr key={p.id}>
                      <td className="mono">{p.project_code}</td>
                      <td>{p.company}</td>
                      <td>{p.project_type}</td>
                      <td>{p.country}</td>
                      <td>
                        <span className={`status-badge status-${p.status}`}>
                          {STATUS_LABELS[p.status]}
                        </span>
                      </td>
                      <td>{fmtDate(p.created_at, locale)}</td>
                    </tr>
                  ))}
                  {projects.length === 0 && (
                    <tr><td colSpan={6} className="empty-cell">No enquiries yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── PROJECTS tab ──────────────────────────────── */}
      {tab === "projects" && (
        <>
          {loading ? (
            <div className="admin-state">
              <LoaderCircle className="spin" />
              <p>Loading project workspace</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="admin-state">
              <p>No enquiries have been submitted yet.</p>
            </div>
          ) : (
            <div className="admin-projects-layout">
              <aside aria-label="Projects">
                {projects.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    className={p.id === selectedId ? "is-active" : ""}
                    onClick={() => setSelectedId(p.id)}
                  >
                    <span>
                      <strong>{p.project_code}</strong>
                      <small>{p.company} &middot; {p.project_location || p.country}</small>
                    </span>
                    <i>{STATUS_LABELS[p.status]}</i>
                  </button>
                ))}
              </aside>

              {selected && (
                <main>
                  <div className="admin-project-summary">
                    <span>{selected.project_type}</span>
                    <h2>{selected.project_code}</h2>
                    <p>{selected.name} &middot; {selected.company} &middot; {selected.email}</p>
                    <dl>
                      <div><dt>Location</dt><dd>{selected.project_location || selected.country}</dd></div>
                      <div><dt>Scope</dt><dd>{selected.scope || "Not specified"}</dd></div>
                    </dl>
                    {selected.message && <blockquote>{selected.message}</blockquote>}
                  </div>

                  <form onSubmit={saveUpdate}>
                    <label>
                      <span>Project stage</span>
                      <select value={status} onChange={(e) => setStatus(e.target.value as Status)}>
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Expected date</span>
                      <input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
                    </label>
                    <label className="wide">
                      <span>Customer-visible note</span>
                      <textarea
                        rows={5}
                        maxLength={2000}
                        value={customerNote}
                        onChange={(e) => setCustomerNote(e.target.value)}
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
                    {selected.updates.map((u) => (
                      <li key={u.id}>
                        <i />
                        <div>
                          <span>
                            <strong>{STATUS_LABELS[u.status as Status] ?? u.status}</strong>
                            <small>{fmtDate(u.created_at, locale)}</small>
                          </span>
                          {u.customer_note && <p>{u.customer_note}</p>}
                        </div>
                      </li>
                    ))}
                  </ol>
                </main>
              )}
            </div>
          )}
        </>
      )}

      {/* ── ORDERS tab ────────────────────────────────── */}
      {tab === "orders" && (
        <div className="admin-orders">
          {orderSummary && (
            <div className="order-summary-bar">
              <span><strong>{orderSummary.totalOrders}</strong> orders</span>
              <span><strong>{orderSummary.paidCount}</strong> paid</span>
              <span><strong>{orderSummary.pendingCount}</strong> pending</span>
              <span>Revenue: <strong>{fmtMinor(orderSummary.revenueMinor, "USD")}</strong></span>
            </div>
          )}
          {ordersLoading ? (
            <div className="admin-state"><LoaderCircle className="spin" /></div>
          ) : orders.length === 0 ? (
            <div className="admin-state"><p>No store orders yet.</p></div>
          ) : (
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order</th><th>Date</th><th>Email</th>
                    <th>Items</th><th>Total</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className="mono">{o.orderNumber}</td>
                      <td>{fmtDate(o.createdAt, locale)}</td>
                      <td>{o.email}</td>
                      <td>{o.items?.map((i) => `${i.productName} ×${i.quantity}`).join(", ")}</td>
                      <td className="mono">{fmtMinor(o.totalMinor, o.currency)}</td>
                      <td>
                        <span className={`status-badge status-${o.status}`}>
                          {o.status === "paid" && <CheckCircle size={12} />}
                          {o.status === "pending_payment" && <Clock size={12} />}
                          {o.status === "cancelled" && <XCircle size={12} />}
                          {o.status.replace(/_/g, " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
