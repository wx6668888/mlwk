import {
  ArrowRight,
  Check,
  ClipboardList,
  Chrome,
  Eye,
  EyeOff,
  Heart,
  LoaderCircle,
  LogOut,
  MapPin,
  Package,
  Plus,
  Trash2,
} from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { findProduct, formatPrice, type Currency } from "../../shared/storeCatalog";
import { authHeaders, useAuth } from "../auth/AuthContext";
import type { Locale } from "../content";
import { getStoreCopy } from "../store/storeCopy";

function XIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8.5l3.5 3.5L13 4" />
    </svg>
  );
}

const SLIDE_IMAGES = [
  "/media/kitchens.png",
  "/media/wall-panels.png",
  "/media/bespoke-built-ins.png",
];

export function LoginPage({ locale }: { locale: Locale }) {
  const copy = getStoreCopy(locale);
  const { configured, user, signInWithGoogle, signInWithX, signUpWithEmail, signInWithEmail } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const returnTo = params.get("returnTo") || `/${locale}/account/projects`;

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slide, setSlide] = useState(0);
  const [fading, setFading] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) navigate(returnTo, { replace: true });
  }, [navigate, returnTo, user]);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(timer);
  }, []);

  /* carousel */
  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setSlide((prev) => (prev + 1) % SLIDE_IMAGES.length);
        setFading(false);
      }, 500);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    if (index === slide) return;
    setFading(true);
    setTimeout(() => {
      setSlide(index);
      setFading(false);
    }, 400);
  };

  const handleModeSwitch = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsSignUp((prev) => !prev);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
    setMessage("");
  };

  const google = async () => {
    setBusy(true);
    setMessage((await signInWithGoogle(locale, returnTo)) ?? "");
    setBusy(false);
  };

  const xLogin = async () => {
    setBusy(true);
    setMessage((await signInWithX(locale, returnTo)) ?? "");
    setBusy(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSignUp && !agreedToTerms) {
      setMessage("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }
    setBusy(true);
    const error = isSignUp
      ? await signUpWithEmail(email, password, firstName, lastName, locale)
      : await signInWithEmail(email, password);
    setMessage(error ?? "");
    setBusy(false);
    if (!error && !isSignUp) navigate(returnTo, { replace: true });
  };

  return (
    <section className={`login-page${mounted ? " mounted" : ""}`}>
      <div className="login-card">
        {/* ── Left: visual ── */}
        <div className="login-visual">
          <div className="login-visual-header">
            <span className="login-visual-logo">MLWK</span>
            <Link to={`/${locale}/`} className="login-visual-back">
              <ArrowRight size={14} />
              <span>{copy.backToSite}</span>
            </Link>
          </div>

          <div className="login-visual-media">
            <img
              src={SLIDE_IMAGES[slide]}
              alt=""
              className={fading ? "fading" : ""}
            />
            <div className="login-visual-gradient" />
            <div className="login-visual-copy">
              {copy.loginSlides[slide]}
            </div>
          </div>

          <div className="login-visual-dots">
            {SLIDE_IMAGES.map((_s, i) => (
              <button
                key={i}
                type="button"
                className={i === slide ? "active" : ""}
                onClick={() => goToSlide(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          <div className="login-visual-corner">
            <Link to={`/${locale}/`}>
              <div className="login-visual-corner-icon">
                <ArrowRight size={18} />
              </div>
              <span>
                <strong>MLWK</strong>
                <small>{copy.backToSite}</small>
              </span>
            </Link>
          </div>
        </div>

        {/* ── Right: form ── */}
        <div className="login-panel">
          <h1 className={isTransitioning ? "anim-fade-out" : ""}>
            {isSignUp ? copy.createAccount : copy.welcomeBack}
          </h1>
          <div className={`login-panel-subtitle${isTransitioning ? " anim-fade-out" : ""}`}>
            {isSignUp ? copy.haveAccount : copy.noAccount}{" "}
            <button type="button" onClick={handleModeSwitch}>
              {isSignUp ? copy.logIn : copy.signUp}
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={`login-collapsible${isSignUp ? " open" : ""}`}>
              <div>
                <div className="login-name-row">
                  <div className="login-field">
                    <input
                      type="text"
                      placeholder={copy.firstName}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required={isSignUp}
                    />
                  </div>
                  <div className="login-field">
                    <input
                      type="text"
                      placeholder={copy.lastName}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required={isSignUp}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="login-field">
              <input
                type="email"
                placeholder={copy.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="login-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={copy.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
              />
              <button
                type="button"
                className="login-field-icon"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className={`login-collapsible${isSignUp ? " open" : ""}`}>
              <div>
                <label className="login-terms">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                  />
                  <span className="login-check"><CheckIcon /></span>
                  <span className="login-terms-text">
                    {copy.agreeTerms}{" "}
                    <Link to={`/${locale}/terms`}>{copy.termsOfService}</Link>{" "}
                    {copy.and}{" "}
                    <Link to={`/${locale}/privacy`}>{copy.privacyPolicy}</Link>
                  </span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={!configured || busy}
            >
              {busy ? (
                <LoaderCircle className="spin" size={16} />
              ) : (
                <ArrowRight size={16} />
              )}
              {isSignUp ? copy.signUpButton : copy.signInButton}
            </button>
          </form>

          <div className="login-divider">
            <i /><span>{copy.orContinue}</span><i />
          </div>

          <div className="login-social">
            <button
              type="button"
              className="login-social-btn"
              onClick={() => void google()}
              disabled={!configured || busy}
            >
              <Chrome size={16} />
              <span>Google</span>
            </button>
            <button
              type="button"
              className="login-social-btn"
              onClick={() => void xLogin()}
              disabled={!configured || busy}
            >
              <XIcon />
              <span>X</span>
            </button>
          </div>

          {!configured && <p className="login-config-note">{copy.authPreview}</p>}
          {message && <p className="login-error">{message}</p>}
        </div>
      </div>
    </section>
  );
}

export function AuthCallbackPage({ locale }: { locale: Locale }) {
  const { loading, user } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const returnTo = params.get("returnTo") || `/${locale}/account/projects`;

  useEffect(() => {
    if (!loading && user) navigate(returnTo, { replace: true });
    if (!loading && !user) navigate(`/${locale}/login`, { replace: true });
  }, [loading, locale, navigate, returnTo, user]);

  return (
    <section className="auth-callback">
      <LoaderCircle className="spin" size={24} />
    </section>
  );
}

export function AccountGuard({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const { loading, user } = useAuth();
  const location = useLocation();
  const [clientReady, setClientReady] = useState(false);
  useEffect(() => setClientReady(true), []);
  if (!clientReady || loading) {
    return <section className="auth-callback"><LoaderCircle className="spin" /></section>;
  }
  if (!user) {
    return (
      <Navigate
        replace
        to={`/${locale}/login?returnTo=${encodeURIComponent(location.pathname)}`}
      />
    );
  }
  return children;
}

type AccountSection = "projects" | "orders" | "addresses" | "favorites";

function AccountShell({
  locale,
  section,
  children,
}: {
  locale: Locale;
  section: AccountSection;
  children: ReactNode;
}) {
  const copy = getStoreCopy(locale);
  const { user, signOut } = useAuth();
  const links: Array<[AccountSection, string, ReactNode]> = [
    ["projects", projectLabels[locale].projects, <ClipboardList size={17} />],
    ["orders", copy.orderHistory, <Package size={17} />],
    ["addresses", copy.addresses, <MapPin size={17} />],
    ["favorites", copy.favorites, <Heart size={17} />],
  ];
  return (
    <section className="account-page">
      <header className="account-heading">
        <div>
          <small>{copy.account}</small>
          <h1>{user?.user_metadata?.full_name || user?.email}</h1>
        </div>
        <button type="button" onClick={() => void signOut()}>
          <LogOut size={16} />
          {copy.signOut}
        </button>
      </header>
      <div className="account-layout">
        <nav aria-label={copy.account}>
          {links.map(([path, label, icon]) => (
            <Link
              key={path}
              className={section === path ? "is-active" : ""}
              to={`/${locale}/account/${path}`}
            >
              {icon}
              {label}
            </Link>
          ))}
        </nav>
        <div className="account-content">{children}</div>
      </div>
    </section>
  );
}

const projectLabels: Record<
  Locale,
  {
    projects: string;
    empty: string;
    expected: string;
    statuses: Record<string, string>;
  }
> = {
  en: {
    projects: "Projects",
    empty: "No tracked projects yet. Sign in before submitting drawings to see progress here.",
    expected: "Expected update",
    statuses: {
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
    },
  },
  zh: {
    projects: "项目进度",
    empty: "暂时没有可追踪项目。登录后提交图纸，即可在这里查看进度。",
    expected: "预计更新",
    statuses: {
      submitted: "资料已提交",
      under_review: "正在审核",
      scope_clarification: "范围确认",
      design_development: "深化设计",
      sampling: "打样确认",
      production: "生产中",
      quality_check: "质量检查",
      packed: "包装完成",
      shipped: "已发运",
      completed: "已完成",
      on_hold: "暂缓",
    },
  },
  ar: {
    projects: "تقدم المشروع",
    empty: "لا توجد مشاريع متتبعة بعد.",
    expected: "التحديث المتوقع",
    statuses: {
      submitted: "تم الإرسال",
      under_review: "قيد المراجعة",
      scope_clarification: "تأكيد النطاق",
      design_development: "تطوير التصميم",
      sampling: "العينات",
      production: "الإنتاج",
      quality_check: "فحص الجودة",
      packed: "تم التغليف",
      shipped: "تم الشحن",
      completed: "مكتمل",
      on_hold: "معلق",
    },
  },
  de: {
    projects: "Projektfortschritt",
    empty: "Noch keine verfolgten Projekte.",
    expected: "Erwartetes Update",
    statuses: {
      submitted: "Eingereicht",
      under_review: "In Prüfung",
      scope_clarification: "Umfangsklärung",
      design_development: "Planung",
      sampling: "Bemusterung",
      production: "Produktion",
      quality_check: "Qualitätsprüfung",
      packed: "Verpackt",
      shipped: "Versandt",
      completed: "Abgeschlossen",
      on_hold: "Pausiert",
    },
  },
  fr: {
    projects: "Suivi des projets",
    empty: "Aucun projet suivi pour le moment.",
    expected: "Mise à jour prévue",
    statuses: {
      submitted: "Envoyé",
      under_review: "En cours d'examen",
      scope_clarification: "Clarification",
      design_development: "Développement",
      sampling: "Échantillonnage",
      production: "Production",
      quality_check: "Contrôle qualité",
      packed: "Emballé",
      shipped: "Expédié",
      completed: "Terminé",
      on_hold: "En attente",
    },
  },
};

type ProjectUpdateRecord = {
  id: string;
  created_at: string;
  status: string;
  customer_note: string;
  expected_date: string;
};

type ProjectRecord = {
  id: string;
  project_code: string;
  created_at: string;
  updated_at: string;
  status: string;
  expected_date: string;
  project_type: string;
  project_location: string;
  scope: string;
  updates: ProjectUpdateRecord[];
};

export function AccountProjectsPage({ locale }: { locale: Locale }) {
  const { accessToken } = useAuth();
  const copy = projectLabels[locale];
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/account/projects", {
        headers: authHeaders(accessToken),
      });
      if (response.ok) {
        const result = (await response.json()) as { projects: ProjectRecord[] };
        setProjects(result.projects);
      }
      setLoading(false);
    };
    void load();
  }, [accessToken]);

  return (
    <AccountShell locale={locale} section="projects">
      <h2>{copy.projects}</h2>
      {loading ? (
        <LoaderCircle className="spin" />
      ) : projects.length ? (
        <div className="project-progress-list">
          {projects.map((project) => (
            <article className="project-progress-card" key={project.id}>
              <header>
                <div>
                  <small>{project.project_type}</small>
                  <h3>{project.project_code}</h3>
                  <p>{project.project_location || project.scope}</p>
                </div>
                <span data-status={project.status}>
                  {copy.statuses[project.status] ?? project.status}
                </span>
              </header>
              {project.expected_date && (
                <p className="project-expected">
                  {copy.expected}:{" "}
                  <strong>
                    {new Date(project.expected_date).toLocaleDateString(locale)}
                  </strong>
                </p>
              )}
              <ol className="project-timeline">
                {project.updates.map((update) => (
                  <li key={update.id}>
                    <i />
                    <div>
                      <span>
                        <strong>
                          {copy.statuses[update.status] ?? update.status}
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
            </article>
          ))}
        </div>
      ) : (
        <EmptyAccountState text={copy.empty} />
      )}
    </AccountShell>
  );
}

type OrderRecord = {
  id: string;
  order_number: string;
  status: string;
  currency: Currency;
  total_minor: number;
  created_at: string;
};

export function AccountOrdersPage({ locale }: { locale: Locale }) {
  const copy = getStoreCopy(locale);
  const { accessToken } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/account/orders", {
        headers: authHeaders(accessToken),
      });
      if (response.ok) {
        const result = (await response.json()) as { orders: OrderRecord[] };
        setOrders(result.orders);
      }
      setLoading(false);
    };
    void load();
  }, [accessToken]);

  return (
    <AccountShell locale={locale} section="orders">
      <h2>{copy.orderHistory}</h2>
      {loading ? (
        <LoaderCircle className="spin" />
      ) : orders.length ? (
        <div className="account-list">
          {orders.map((order) => (
            <article key={order.id}>
              <span>
                <small>{new Date(order.created_at).toLocaleDateString(locale)}</small>
                <strong>{order.order_number}</strong>
              </span>
              <span>{order.status}</span>
              <strong>{formatPrice(order.total_minor / 100, order.currency, locale)}</strong>
            </article>
          ))}
        </div>
      ) : (
        <EmptyAccountState text={copy.noOrders} />
      )}
    </AccountShell>
  );
}

type AddressRecord = {
  id: string;
  label: string;
  recipient_name: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postal_code: string;
  country_code: string;
  phone: string;
};

export function AccountAddressesPage({ locale }: { locale: Locale }) {
  const copy = getStoreCopy(locale);
  const { accessToken } = useAuth();
  const [addresses, setAddresses] = useState<AddressRecord[]>([]);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/account/addresses", {
      headers: await authHeaders(accessToken),
    });
    if (response.ok) {
      const data = (await response.json()) as { addresses: AddressRecord[] };
      setAddresses(data.addresses);
    }
  }, [accessToken]);

  useEffect(() => void load(), [load]);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/account/addresses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeaders(accessToken)),
      },
      body: JSON.stringify(body),
    });
    if (response.ok) {
      setAdding(false);
      void load();
    }
  };

  const remove = async (id: string) => {
    const response = await fetch(`/api/account/addresses/${id}`, {
      method: "DELETE",
      headers: await authHeaders(accessToken),
    });
    if (response.ok) setAddresses((current) => current.filter((item) => item.id !== id));
  };

  return (
    <AccountShell locale={locale} section="addresses">
      <div className="account-content-heading">
        <h2>{copy.addresses}</h2>
        <button type="button" className="icon-button" onClick={() => setAdding((value) => !value)} aria-label={copy.saveAddress}>
          <Plus size={18} />
        </button>
      </div>
      {adding && (
        <form className="address-form" onSubmit={save}>
          <label><span>Label</span><input name="label" defaultValue="Home" required /></label>
          <label><span>Name</span><input name="recipientName" required /></label>
          <label className="wide"><span>Address</span><input name="line1" required /></label>
          <label className="wide"><span>Address line 2</span><input name="line2" /></label>
          <label><span>City</span><input name="city" required /></label>
          <label><span>Region</span><input name="region" /></label>
          <label><span>Postal code</span><input name="postalCode" required /></label>
          <label><span>Country code</span><input name="countryCode" maxLength={2} required /></label>
          <label><span>Phone</span><input name="phone" /></label>
          <button className="primary-button" type="submit"><Check size={16} />{copy.saveAddress}</button>
        </form>
      )}
      {addresses.length ? (
        <div className="address-grid">
          {addresses.map((address) => (
            <article key={address.id}>
              <span><MapPin size={16} />{address.label}</span>
              <strong>{address.recipient_name}</strong>
              <p>{address.line1}<br />{address.line2 && <>{address.line2}<br /></>}{address.city} {address.postal_code}<br />{address.country_code}</p>
              <button type="button" className="icon-button" onClick={() => void remove(address.id)} aria-label="Delete address"><Trash2 size={16} /></button>
            </article>
          ))}
        </div>
      ) : !adding ? (
        <EmptyAccountState text={copy.noAddresses} />
      ) : null}
    </AccountShell>
  );
}

export function AccountFavoritesPage({ locale }: { locale: Locale }) {
  const copy = getStoreCopy(locale);
  const { accessToken } = useAuth();
  const [skus, setSkus] = useState<string[]>([]);
  const load = useCallback(async () => {
    const response = await fetch("/api/account/favorites", {
      headers: await authHeaders(accessToken),
    });
    if (response.ok) {
      const data = (await response.json()) as { favorites: string[] };
      setSkus(data.favorites);
    }
  }, [accessToken]);
  useEffect(() => void load(), [load]);

  const products = skus.map((sku) => findProduct(sku)).filter(Boolean);
  return (
    <AccountShell locale={locale} section="favorites">
      <h2>{copy.favorites}</h2>
      {products.length ? (
        <div className="favorite-grid">
          {products.map((product) =>
            product ? (
              <Link to={`/${locale}/shop/${product.slug}`} key={product.sku}>
                <img src={product.image} alt="" />
                <strong>{product.name[locale]}</strong>
                <small>{product.sku}</small>
              </Link>
            ) : null,
          )}
        </div>
      ) : (
        <EmptyAccountState text={copy.noFavorites} />
      )}
    </AccountShell>
  );
}

function EmptyAccountState({ text }: { text: string }) {
  return (
    <div className="empty-account-state">
      <span />
      <p>{text}</p>
    </div>
  );
}
