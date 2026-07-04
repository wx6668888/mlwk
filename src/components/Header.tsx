import {
  ArrowUpRight,
  ChevronDown,
  Globe2,
  Menu,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  getCopy,
  localeMeta,
  locales,
  type Locale,
} from "../content";
import { useAuth } from "../auth/AuthContext";
import { useStore } from "../store/StoreContext";
import { getStoreCopy } from "../store/storeCopy";

type HeaderProps = {
  locale: Locale;
};

const studioLabels: Record<Locale, string> = {
  en: "3D Studio",
  zh: "3D 设计",
  ar: "استوديو 3D",
  de: "3D Studio",
  fr: "Studio 3D",
};

export default function Header({ locale }: HeaderProps) {
  const copy = getCopy(locale);
  const storeCopy = getStoreCopy(locale);
  const { user } = useAuth();
  const { cartCount } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const section = pathSegments[1] ?? "";
  const hasMediaBackdrop =
    pathSegments.length === 1 ||
    (pathSegments.length === 3 &&
      (section === "collections" || section === "solutions"));

  const nav = [
    ["collections", copy.nav.collections],
    ["designer", studioLabels[locale]],
    ["shop", storeCopy.shop],
    ["solutions", copy.nav.solutions],
    ["projects", copy.nav.projects],
    ["capabilities", copy.nav.capabilities],
    ["company", copy.nav.company],
  ];

  useEffect(() => {
    setMenuOpen(false);
    setLangOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!langRef.current?.contains(event.target as Node)) setLangOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const switchLocale = (next: Locale) => {
    const segments = location.pathname.split("/");
    segments[1] = next;
    navigate(segments.join("/") + location.search);
  };

  return (
    <header
      className={`site-header ${hasMediaBackdrop ? "site-header--overlay" : ""}`}
    >
      <div className="header-shell">
        <Link className="brand" to={`/${locale}/`} aria-label="MLWK home">
          MLWK
          <span>Millwork</span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {nav.map(([path, label]) => (
            <NavLink key={path} to={`/${locale}/${path}`}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <div className="language" ref={langRef}>
            <button
              type="button"
              className="icon-text-button"
              onClick={() => setLangOpen((value) => !value)}
              aria-expanded={langOpen}
              aria-label={copy.common.language}
            >
              <Globe2 size={16} />
              <span>{localeMeta[locale].short}</span>
              <ChevronDown size={14} />
            </button>
            {langOpen && (
              <div className="language-menu">
                {locales.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => switchLocale(item)}
                    aria-current={item === locale ? "true" : undefined}
                  >
                    <span>{localeMeta[item].label}</span>
                    <small>{localeMeta[item].short}</small>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            className="primary-button header-quote"
            to={`/${locale}/quote`}
            aria-label={copy.nav.quote}
            title={copy.nav.quote}
          >
            <ArrowUpRight size={17} />
            <span>{copy.nav.quote}</span>
          </Link>

          <Link
            className="header-icon-link"
            to={`/${locale}/cart`}
            aria-label={storeCopy.cart}
            title={storeCopy.cart}
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && <span>{Math.min(cartCount, 99)}</span>}
          </Link>

          <Link
            className="header-icon-link"
            to={`/${locale}/${user ? "account/projects" : "login"}`}
            aria-label={user ? storeCopy.account : storeCopy.signIn}
            title={user ? storeCopy.account : storeCopy.signIn}
          >
            <UserRound size={18} />
          </Link>

          <button
            type="button"
            className="menu-button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label={menuOpen ? copy.common.closeMenu : copy.common.openMenu}
            aria-expanded={menuOpen}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={menuOpen ? "close" : "open"}
                initial={{ opacity: 0, rotate: -20, scale: 0.72 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 20, scale: 0.72 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                {menuOpen ? <X /> : <Menu />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            className="mobile-nav"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: -14, scaleY: 0.94 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -10, scaleY: 0.96 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {nav.map(([path, label], index) => (
              <motion.div
                key={path}
                initial={{
                  opacity: 0,
                  x: localeMeta[locale].dir === "rtl" ? 12 : -12,
                }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.04 + index * 0.035,
                  duration: 0.22,
                  ease: "easeOut",
                }}
              >
                <NavLink to={`/${locale}/${path}`}>
                  {label}
                  <ArrowUpRight size={18} />
                </NavLink>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.22 }}
            >
              <Link className="primary-button" to={`/${locale}/quote`}>
                <ArrowUpRight size={17} />
                <span>{copy.nav.quote}</span>
              </Link>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
