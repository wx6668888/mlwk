import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Heart,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  findProduct,
  formatPrice,
  productPrice,
  shippingForCountry,
  storeProducts,
  type Currency,
  type ProductCategory,
} from "../../shared/storeCatalog";
import { useAuth, authHeaders } from "../auth/AuthContext";
import PayPalCheckout from "../components/PayPalCheckout";
import Reveal from "../components/Reveal";
import { track } from "../lib/analytics";
import { useStore } from "../store/StoreContext";
import { getStoreCopy } from "../store/storeCopy";
import type { Locale } from "../content";
import ProductViewer3D, { shapeFromSlug } from "../components/ProductViewer3D";

const categories: ProductCategory[] = [
  "furniture",
  "textiles",
  "decor",
  "pulls",
  "hardware",
  "wardrobe",
  "interiors",
  "lighting",
  "samples",
];

type CategoryGroup = {
  key: string;
  label: Record<string, string>;
  items: ProductCategory[];
};

const categoryGroups: CategoryGroup[] = [
  {
    key: "home",
    label: { en: "Home Goods", zh: "成品家居", ar: "السلع المنزلية", de: "Wohnwaren", fr: "Décoration" },
    items: ["furniture", "textiles", "decor"],
  },
  {
    key: "millwork",
    label: { en: "Millwork Hardware", zh: "木作五金", ar: "أجهزة النجارة", de: "Beschläge", fr: "Quincaillerie" },
    items: ["pulls", "hardware", "wardrobe", "lighting"],
  },
  {
    key: "interior",
    label: { en: "Interior", zh: "室内配件", ar: "الداخلية", de: "Interieur", fr: "Intérieur" },
    items: ["interiors", "samples"],
  },
];

const categoryMeta: Record<ProductCategory, { icon: string; description: Record<string, string> }> = {
  furniture: {
    icon: "🪑",
    description: {
      en: "Ready-to-ship pieces in oak, ash and walnut",
      zh: "实木橡木、白蜡与胡桃，直接发货",
      ar: "قطع جاهزة للشحن من خشب البلوط والدردار",
      de: "Versandfertige Stücke in Eiche, Esche und Nuss",
      fr: "Pièces prêtes à expédier en chêne, frêne et noyer",
    },
  },
  textiles: {
    icon: "🧵",
    description: {
      en: "Linen, merino and natural fibres for every room",
      zh: "亚麻、美利奴与天然纤维",
      ar: "كتان وميرينو وألياف طبيعية",
      de: "Leinen, Merino und Naturfasern",
      fr: "Lin, mérinos et fibres naturelles",
    },
  },
  decor: {
    icon: "○",
    description: {
      en: "Ceramic, marble and considered objects",
      zh: "陶瓷、大理石与精选摆件",
      ar: "سيراميك ورخام وقطع مختارة",
      de: "Keramik, Marmor und ausgewählte Objekte",
      fr: "Céramique, marbre et objets sélectionnés",
    },
  },
  pulls: {
    icon: "⊢",
    description: {
      en: "Solid brass, leather and aluminium pulls",
      zh: "实心黄铜、皮革与铝合金拉手",
      ar: "مقابض نحاسية وجلدية وألومنيوم",
      de: "Griffe aus Messing, Leder und Aluminium",
      fr: "Poignées en laiton, cuir et aluminium",
    },
  },
  hardware: {
    icon: "⊙",
    description: {
      en: "Hinges, runners, door levers and shelf kits",
      zh: "铰链、滑轨、门执手与层板套装",
      ar: "مفصلات وسكك وتجهيزات",
      de: "Scharniere, Auszüge und Türbeschläge",
      fr: "Charnières, coulisses et quincaillerie",
    },
  },
  wardrobe: {
    icon: "▭",
    description: {
      en: "Rails, rods and internal wardrobe fittings",
      zh: "挂衣杆与衣柜内部配件",
      ar: "قضبان ومقاطع خزائن",
      de: "Kleiderstangen und Ankleidebeschläge",
      fr: "Tringles et quincaillerie de dressing",
    },
  },
  interiors: {
    icon: "◫",
    description: {
      en: "Valet trays, drawer inserts and fitted accessories",
      zh: "随身物托盘、抽屉内衬与收纳配件",
      ar: "صواني وإدخالات أدراج وإكسسوارات",
      de: "Tabletts, Schubladeneinsätze und Zubehör",
      fr: "Plateaux, inserts et accessoires intégrés",
    },
  },
  lighting: {
    icon: "◌",
    description: {
      en: "LED profiles and shelf lighting",
      zh: "LED型材与层板灯",
      ar: "مقاطع LED وإضاءة رفوف",
      de: "LED-Profile und Regalbeleuchtung",
      fr: "Profilés LED et éclairage d'étagère",
    },
  },
  samples: {
    icon: "◱",
    description: {
      en: "Finish and material sample boxes",
      zh: "饰面与材质样品盒",
      ar: "صناديق عينات المواد والتشطيب",
      de: "Oberflächen- und Materialmusterboxen",
      fr: "Boîtes d'échantillons de finitions",
    },
  },
};

const newCategories = new Set<ProductCategory>(["furniture", "textiles", "decor"]);
const countries = [
  ["US", "United States"],
  ["CA", "Canada"],
  ["GB", "United Kingdom"],
  ["DE", "Germany"],
  ["FR", "France"],
  ["IT", "Italy"],
  ["ES", "Spain"],
  ["AE", "United Arab Emirates"],
  ["SA", "Saudi Arabia"],
  ["QA", "Qatar"],
  ["KW", "Kuwait"],
  ["AU", "Australia"],
  ["SG", "Singapore"],
  ["CN", "China"],
];

function ShopDropdown({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div className={`shop-dropdown ${className ?? ""}`.trim()} ref={ref}>
      <button type="button" onClick={() => setOpen(!open)} aria-haspopup="listbox" aria-expanded={open}>
        {label && <span>{label}</span>}
        <span>{selected?.label ?? value}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="shop-dropdown-menu" role="listbox">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={opt.value === value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.label}
              {opt.value === value && <Check size={15} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CurrencyControl() {
  const { currency, setCurrency } = useStore();
  return (
    <ShopDropdown
      className="currency-control"
      value={currency}
      onChange={(v) => setCurrency(v as Currency)}
      options={[
        { value: "USD", label: "USD" },
        { value: "EUR", label: "EUR" },
        { value: "GBP", label: "GBP" },
      ]}
    />
  );
}

function PreviewLabel({ children }: { children: string }) {
  return (
    <span className="store-preview-label">
      <span />
      {children}
    </span>
  );
}

export function ShopPage({ locale }: { locale: Locale }) {
  const copy = getStoreCopy(locale);
  const { currency, addItem } = useStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ProductCategory | "all">("all");
  const [sort, setSort] = useState("featured");
  const [added, setAdded] = useState("");

  const products = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    const filtered = storeProducts.filter((item) => {
      const matchesCategory = category === "all" || item.category === category;
      const haystack = `${item.name[locale]} ${item.description[locale]} ${item.sku}`.toLocaleLowerCase();
      return matchesCategory && (!normalized || haystack.includes(normalized));
    });
    if (sort === "low") {
      return [...filtered].sort(
        (a, b) => productPrice(a, currency) - productPrice(b, currency),
      );
    }
    if (sort === "high") {
      return [...filtered].sort(
        (a, b) => productPrice(b, currency) - productPrice(a, currency),
      );
    }
    return filtered;
  }, [category, currency, locale, query, sort]);

  const quickAdd = (sku: string, finish: string) => {
    addItem({ sku, finish, quantity: 1 });
    setAdded(sku);
    window.setTimeout(() => setAdded(""), 1300);
  };

  const [expandedGroup, setExpandedGroup] = useState<string | null>("home");

  const toggleGroup = (key: string) => {
    setExpandedGroup((prev) => (prev === key ? null : key));
  };

  const productCount = (cat: ProductCategory | "all") =>
    cat === "all"
      ? storeProducts.length
      : storeProducts.filter((p) => p.category === cat).length;

  return (
    <div className="shop-page-wrap">
      {/* ── Page header ── */}
      <div className="shop-heading shop-heading--full">
        <div>
          <PreviewLabel>{copy.preview}</PreviewLabel>
          <h1>{copy.shopTitle}</h1>
          <p>{copy.shopIntro}</p>
        </div>
        <CurrencyControl />
      </div>

      <div className="shop-layout">
        {/* ── Left sidebar ── */}
        <aside className="shop-sidebar">
          <nav>
            {/* All products */}
            <button
              type="button"
              className={`sidebar-all${category === "all" ? " is-active" : ""}`}
              onClick={() => setCategory("all")}
            >
              <span>{copy.all}</span>
              <span className="sidebar-count">{productCount("all")}</span>
            </button>

            {/* Category groups */}
            {categoryGroups.map((group) => (
              <div key={group.key} className="sidebar-group">
                <button
                  type="button"
                  className={`sidebar-group__header${expandedGroup === group.key ? " is-open" : ""}`}
                  onClick={() => toggleGroup(group.key)}
                >
                  <span>{group.label[locale] ?? group.label.en}</span>
                  <ChevronDown size={13} />
                </button>
                {expandedGroup === group.key && (
                  <div className="sidebar-group__items">
                    {group.items.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className={`sidebar-item${category === cat ? " is-active" : ""}${newCategories.has(cat) ? " is-new" : ""}`}
                        onClick={() => setCategory(category === cat ? "all" : cat)}
                      >
                        <span>{copy.category[cat]}</span>
                        <span className="sidebar-count">{productCount(cat)}</span>
                        {newCategories.has(cat) && (
                          <span className="sidebar-new-dot" aria-hidden="true" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Currency at bottom of sidebar */}
          <div className="sidebar-currency">
            <CurrencyControl />
          </div>
        </aside>

        {/* ── Main content ── */}
        <section className="shop-main">
          {/* Toolbar: search + sort */}
          <div className="shop-toolbar">
            <label className="shop-search">
              <Search size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={copy.search}
              />
            </label>
            {category !== "all" && (
              <span className="active-category-label">
                {copy.category[category]}
                <button
                  type="button"
                  onClick={() => setCategory("all")}
                  aria-label="Clear filter"
                >×</button>
              </span>
            )}
            <ShopDropdown
              className="shop-sort"
              value={sort}
              onChange={setSort}
              label={copy.sort}
              options={[
                { value: "featured", label: copy.featured },
                { value: "low", label: copy.priceLow },
                { value: "high", label: copy.priceHigh },
              ]}
            />
          </div>

          {/* Product grid */}
          <div className="product-grid">
            {products.length === 0 && (
              <p className="shop-empty">{copy.search}…</p>
            )}
            {products.map((item, index) => (
              <Reveal
                className={`product-card${index === 0 && category !== "all" ? " product-card--featured" : ""}`}
                key={item.sku}
                delay={Math.min(index * 0.03, 0.18)}
              >
                <Link
                  className="product-card__image"
                  to={`/${locale}/shop/${item.slug}`}
                  onClick={() => track("product_view", { sku: item.sku })}
                >
                  <img src={item.image} alt={item.name[locale]} loading="lazy" />
                  {newCategories.has(item.category) && (
                    <span className="product-badge product-badge--new">New</span>
                  )}
                  <span className="product-card__sku">{item.sku}</span>
                </Link>
                <div className="product-card__copy">
                  <Link to={`/${locale}/shop/${item.slug}`}>
                    <small>{copy.category[item.category]}</small>
                    <h2>{item.name[locale]}</h2>
                  </Link>
                  <div className="product-card__footer">
                    <strong>{formatPrice(productPrice(item, currency), currency, locale)}</strong>
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => quickAdd(item.sku, item.finishes[0])}
                      aria-label={`${copy.add}: ${item.name[locale]}`}
                      title={copy.add}
                    >
                      {added === item.sku ? <Check size={18} /> : <Plus size={18} />}
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function ProductPage({ locale }: { locale: Locale }) {
  const { slug = "" } = useParams();
  const product = findProduct(slug);
  const copy = getStoreCopy(locale);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, accessToken } = useAuth();
  const { currency, addItem } = useStore();
  const [finish, setFinish] = useState(product?.finishes[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [saved, setSaved] = useState(false);
  const [added, setAdded] = useState(false);

  if (!product) return <Navigate replace to={`/${locale}/shop`} />;

  const toggleFavorite = async () => {
    if (!user) {
      navigate(`/${locale}/login?returnTo=${encodeURIComponent(location.pathname)}`);
      return;
    }
    const response = await fetch(`/api/account/favorites/${product.sku}`, {
      method: saved ? "DELETE" : "PUT",
      headers: await authHeaders(accessToken),
    });
    if (response.ok) setSaved((value) => !value);
  };

  const add = () => {
    addItem({ sku: product.sku, finish, quantity });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  return (
    <section className="product-detail-page">
      <Link className="store-back-link" to={`/${locale}/shop`}>
        {locale === "ar" ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
        {copy.backToShop}
      </Link>
      <div className="product-detail">
        <div className="product-detail__image">
          {product.category === "furniture" ? (
            <ProductViewer3D shape={shapeFromSlug(product.slug)} finish={finish} />
          ) : (
            <img src={product.image} alt={product.name[locale]} />
          )}
          <PreviewLabel>{copy.preview}</PreviewLabel>
        </div>
        <div className="product-detail__copy">
          <small>{copy.category[product.category]} · {product.sku}</small>
          <h1>{product.name[locale]}</h1>
          <p>{product.description[locale]}</p>
          <strong className="product-price">
            {formatPrice(productPrice(product, currency), currency, locale)}
          </strong>
          <CurrencyControl />

          <fieldset className="finish-picker">
            <legend>{copy.finish}</legend>
            <div>
              {product.finishes.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={finish === item ? "is-active" : ""}
                  onClick={() => setFinish(item)}
                >
                  <span style={{ "--finish-index": product.finishes.indexOf(item) } as React.CSSProperties} />
                  {item}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="product-actions">
            <div className="quantity-stepper" aria-label={copy.quantity}>
              <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease">
                <Minus size={16} />
              </button>
              <span>{quantity}</span>
              <button type="button" onClick={() => setQuantity(Math.min(20, quantity + 1))} aria-label="Increase">
                <Plus size={16} />
              </button>
            </div>
            <button type="button" className="primary-button product-add" onClick={add}>
              {added ? <Check size={17} /> : <ShoppingBag size={17} />}
              {added ? copy.added : copy.add}
            </button>
            <button
              type="button"
              className={`favorite-button ${saved ? "is-active" : ""}`}
              onClick={() => void toggleFavorite()}
              aria-label={copy.favorites}
            >
              <Heart size={18} fill={saved ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="product-specs">
            <h2>{copy.specifications}</h2>
            {product.specs.map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <p className="store-duty-note">{copy.duties}</p>
        </div>
      </div>
    </section>
  );
}

export function CartPage({ locale }: { locale: Locale }) {
  const copy = getStoreCopy(locale);
  const { cart, currency, subtotal, updateQuantity, removeItem } = useStore();

  return (
    <section className="cart-page">
      <div className="store-page-title">
        <h1>{copy.cart}</h1>
        <CurrencyControl />
      </div>
      {cart.length === 0 ? (
        <div className="empty-store-state">
          <ShoppingBag size={28} />
          <h2>{copy.emptyCart}</h2>
          <Link className="primary-button" to={`/${locale}/shop`}>
            {copy.continueShopping}
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {cart.map((item) => {
              const product = findProduct(item.sku);
              if (!product) return null;
              return (
                <article className="cart-item" key={`${item.sku}-${item.finish}`}>
                  <img src={product.image} alt="" />
                  <div>
                    <small>{item.sku}</small>
                    <h2>{product.name[locale]}</h2>
                    <span>{item.finish}</span>
                  </div>
                  <div className="quantity-stepper">
                    <button type="button" onClick={() => updateQuantity(item.sku, item.finish, item.quantity - 1)} aria-label="Decrease">
                      <Minus size={15} />
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.sku, item.finish, item.quantity + 1)} aria-label="Increase">
                      <Plus size={15} />
                    </button>
                  </div>
                  <strong>{formatPrice(productPrice(product, currency) * item.quantity, currency, locale)}</strong>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => removeItem(item.sku, item.finish)}
                    aria-label={copy.remove}
                    title={copy.remove}
                  >
                    <Trash2 size={17} />
                  </button>
                </article>
              );
            })}
          </div>
          <aside className="order-summary">
            <h2>{copy.total}</h2>
            <div><span>{copy.subtotal}</span><strong>{formatPrice(subtotal, currency, locale)}</strong></div>
            <p>{copy.duties}</p>
            <Link className="primary-button" to={`/${locale}/checkout`}>
              {copy.checkout}
              {locale === "ar" ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
}

type CheckoutAddress = {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
};

export function CheckoutPage({ locale }: { locale: Locale }) {
  const copy = getStoreCopy(locale);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, currency, subtotal, clearCart, hydrated } = useStore();
  const [address, setAddress] = useState<CheckoutAddress>({
    name: user?.user_metadata?.full_name ?? "",
    email: user?.email ?? "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    region: "",
    postalCode: "",
    country: "US",
  });
  const [error, setError] = useState("");
  const shipping = shippingForCountry(address.country, currency);
  const total = subtotal + shipping.amount;
  const ready = Boolean(
    cart.length &&
      address.name &&
      address.email.includes("@") &&
      address.line1 &&
      address.city &&
      address.postalCode &&
      address.country,
  );

  useEffect(() => {
    track("begin_checkout", { currency, item_count: cart.length });
  }, [cart.length, currency]);

  const createOrder = useCallback(async () => {
    setError("");
    const response = await fetch("/api/store/paypal/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locale,
        currency,
        items: cart,
        shippingAddress: address,
      }),
    });
    const result = (await response.json()) as {
      paypalOrderId?: string;
      error?: string;
    };
    if (!response.ok || !result.paypalOrderId) {
      throw new Error(result.error || "Could not create the PayPal order.");
    }
    return result.paypalOrderId;
  }, [address, cart, currency, locale]);

  const captureOrder = useCallback(
    async (paypalOrderId: string) => {
      const response = await fetch("/api/store/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paypalOrderId }),
      });
      const result = (await response.json()) as {
        orderId?: string;
        claimToken?: string;
        error?: string;
      };
      if (!response.ok || !result.orderId) {
        throw new Error(result.error || "Could not capture the PayPal order.");
      }
      clearCart();
      track("purchase", { order_id: result.orderId, currency, value: total });
      navigate(`/${locale}/order/${result.orderId}/confirmation`, {
        state: { orderId: result.orderId, claimToken: result.claimToken },
      });
    },
    [clearCart, currency, locale, navigate, total],
  );

  if (!hydrated) {
    return <section className="auth-callback"><span className="concierge-typing"><i /><i /><i /></span></section>;
  }
  if (cart.length === 0) return <Navigate replace to={`/${locale}/cart`} />;

  const createPreview = (event: FormEvent) => {
    event.preventDefault();
    if (!ready) {
      setError("Please complete the required delivery details.");
      return;
    }
    const orderId = `PREVIEW-${Date.now().toString(36).toUpperCase()}`;
    sessionStorage.setItem(
      `mlwk.order.${orderId}`,
      JSON.stringify({ orderId, currency, total, address, items: cart }),
    );
    clearCart();
    navigate(`/${locale}/order/${orderId}/confirmation`, {
      state: { orderId, preview: true },
    });
  };

  return (
    <section className="checkout-page">
      <div className="store-page-title">
        <div>
          <PreviewLabel>{copy.preview}</PreviewLabel>
          <h1>{copy.checkoutTitle}</h1>
        </div>
        <CurrencyControl />
      </div>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={createPreview}>
          <fieldset>
            <legend>01 · {copy.contact}</legend>
            <div className="checkout-fields">
              <label><span>Name *</span><input value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} required /></label>
              <label><span>{copy.email} *</span><input type="email" value={address.email} onChange={(e) => setAddress({ ...address, email: e.target.value })} required /></label>
              <label><span>Phone</span><input value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} /></label>
            </div>
          </fieldset>
          <fieldset>
            <legend>02 · {copy.delivery}</legend>
            <div className="checkout-fields">
              <label className="wide"><span>Address *</span><input value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} required /></label>
              <label className="wide"><span>Address line 2</span><input value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} /></label>
              <label><span>City *</span><input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} required /></label>
              <label><span>State / region</span><input value={address.region} onChange={(e) => setAddress({ ...address, region: e.target.value })} /></label>
              <label><span>Postal code *</span><input value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} required /></label>
              <label>
                <span>Country *</span>
                <select value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })}>
                  {countries.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                </select>
              </label>
            </div>
          </fieldset>
          <fieldset>
            <legend>03 · {copy.payment}</legend>
            <p>{copy.payPalNote}</p>
            <PayPalCheckout
              currency={currency}
              disabled={!ready}
              createOrder={createOrder}
              captureOrder={captureOrder}
              onError={setError}
            />
            {!import.meta.env.VITE_PAYPAL_CLIENT_ID && (
              <>
                <p className="checkout-configuration">{copy.configuration}</p>
                <button className="primary-button" type="submit" disabled={!ready}>
                  {copy.placeDemo}
                  <ArrowRight size={17} />
                </button>
              </>
            )}
            {error && <p className="form-error">{error}</p>}
          </fieldset>
        </form>
        <aside className="checkout-summary order-summary">
          <h2>{copy.cart}</h2>
          {cart.map((item) => {
            const product = findProduct(item.sku);
            if (!product) return null;
            return (
              <div className="checkout-line" key={`${item.sku}-${item.finish}`}>
                <span>{product.name[locale]} × {item.quantity}</span>
                <strong>{formatPrice(productPrice(product, currency) * item.quantity, currency, locale)}</strong>
              </div>
            );
          })}
          <div><span>{copy.subtotal}</span><strong>{formatPrice(subtotal, currency, locale)}</strong></div>
          <div><span>{copy.shipping}</span><strong>{formatPrice(shipping.amount, currency, locale)}</strong></div>
          <div className="order-total"><span>{copy.total}</span><strong>{formatPrice(total, currency, locale)}</strong></div>
          <p>{copy.duties}</p>
        </aside>
      </div>
    </section>
  );
}

export function OrderConfirmationPage({ locale }: { locale: Locale }) {
  const { id = "" } = useParams();
  const copy = getStoreCopy(locale);
  const location = useLocation();
  const { user, accessToken } = useAuth();
  const state = location.state as { claimToken?: string; preview?: boolean } | null;
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState("");

  const claim = async () => {
    if (!user) return;
    if (state?.preview) {
      setClaimed(true);
      return;
    }
    const response = await fetch(`/api/store/orders/${id}/claim`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeaders(accessToken)),
      },
      body: JSON.stringify({ claimToken: state?.claimToken }),
    });
    if (response.ok) setClaimed(true);
    else setError("This order could not be linked to the account.");
  };

  return (
    <section className="confirmation-page">
      <span className="confirmation-mark"><Check size={28} /></span>
      <PreviewLabel>{copy.preview}</PreviewLabel>
      <h1>{copy.confirmationTitle}</h1>
      <p>{copy.confirmationText}</p>
      <strong>{id}</strong>
      <div>
        {user ? (
          <button type="button" className="primary-button" onClick={() => void claim()} disabled={claimed}>
            <Heart size={17} />
            {claimed ? copy.added : copy.claim}
          </button>
        ) : (
          <Link className="primary-button" to={`/${locale}/login?returnTo=${encodeURIComponent(location.pathname)}`}>
            {copy.signIn}
          </Link>
        )}
        <Link className="text-link" to={`/${locale}/shop`}>{copy.backToShop}</Link>
      </div>
      {error && <p className="form-error">{error}</p>}
    </section>
  );
}
