import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Box } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { localeMeta, locales, type Locale } from "../../content";
import { brand } from "../../site/brand";
import { navCopy, navSections, type NavLink, type NavSection } from "../../site/navigation";
import { useNavTone } from "../../site/navTone";
import { useNavAutoHide } from "../../site/navVisibility";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "./SocialIcons";
import "./GlobalNav.css";

const EASE = [0.16, 1, 0.3, 1] as const;
const HOVER_INTENT = 120;
const CLOSE_DELAY = 220;

// Entry to the 3D walkthrough: a small cube beside the wordmark, never in the menu.
const cubeLabel: Record<Locale, string> = {
  en: "3D Walkthrough",
  zh: "3D 参观",
  ar: "جولة ثلاثية الأبعاد",
  de: "3D-Rundgang",
  fr: "Visite 3D",
};

function useLocalTime(timeZone: string) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit" });
    const tick = () => setTime(format.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [timeZone]);
  return time;
}

function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduce;
}

export default function GlobalNav({ locale }: { locale: Locale }) {
  const location = useLocation();
  const navigate = useNavigate();
  const tone = useNavTone();
  const autoHide = useNavAutoHide();
  const [revealed, setRevealed] = useState(false);
  const reduce = useReducedMotion();
  const time = useLocalTime(brand.timeZone);

  const [openId, setOpenId] = useState<NavSection["id"] | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [panelHeight, setPanelHeight] = useState(0);

  const headerRef = useRef<HTMLElement>(null);
  const openTimer = useRef<number>();
  const closeTimer = useRef<number>();
  const lastTrigger = useRef<HTMLElement | null>(null);

  const parts = location.pathname.split("/").filter(Boolean);
  const isHome = parts.length <= 1;
  const current = navSections.find((s) => s.to === parts[1])?.id ?? null;
  const href = (to: string) => `/${locale}/${to}`;
  const open = navSections.find((s) => s.id === openId && s.primary) ?? null;

  const clearTimers = () => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
  };
  const requestOpen = (id: NavSection["id"]) => {
    clearTimers();
    const section = navSections.find((s) => s.id === id);
    if (!section?.primary) return scheduleClose();
    // Switching between open panels is immediate; the first open waits for intent.
    if (openId) setOpenId(id);
    else openTimer.current = window.setTimeout(() => setOpenId(id), HOVER_INTENT);
  };
  const scheduleClose = () => {
    window.clearTimeout(openTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenId(null), CLOSE_DELAY);
  };
  const closeAll = useCallback((restoreFocus = false) => {
    clearTimers();
    setOpenId(null);
    setLangOpen(false);
    if (restoreFocus) lastTrigger.current?.focus();
  }, []);

  // Close everything on navigation.
  useEffect(() => {
    closeAll();
    setMobileOpen(false);
  }, [location.pathname, location.hash, closeAll]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (mobileOpen) setMobileOpen(false);
      closeAll(true);
    };
    const onPointer = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) closeAll();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [closeAll, mobileOpen]);

  // Lock page scroll under the mobile sheet.
  useEffect(() => {
    if (!mobileOpen) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!open) setPanelHeight(0);
  }, [open]);

  const switchLocale = (next: Locale) => {
    const segments = location.pathname.split("/");
    segments[1] = next;
    navigate(segments.join("/") + location.search + location.hash);
  };

  // Auto-hide (hero): reveal near the top edge with a pointer, or on scroll-up with touch.
  useEffect(() => {
    if (!autoHide) {
      setRevealed(false);
      return;
    }
    let lastY = window.scrollY;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      if (event.clientY < 72) setRevealed(true);
      else if (event.clientY > 150 && !headerRef.current?.matches(":hover")) setRevealed(false);
    };
    const onScroll = () => {
      const y = window.scrollY;
      if (window.matchMedia("(hover: none)").matches) setRevealed(y < lastY - 4);
      lastY = y;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [autoHide]);
  const hidden = autoHide && !revealed && !open && !mobileOpen && !langOpen;

  const clear = isHome && !scrolled && !open && !mobileOpen && !langOpen;
  const surface = clear ? "clear" : "glass";
  const ink = clear && tone === "dark" ? "bone" : "ink";

  return (
    <header
      ref={headerRef}
      className="gn"
      data-surface={surface}
      data-hidden={hidden || undefined}
      data-ink={ink}
      data-open={open ? "true" : undefined}
      data-mobile={mobileOpen ? "true" : undefined}
      onMouseLeave={scheduleClose}
      onMouseEnter={() => window.clearTimeout(closeTimer.current)}
    >
      <div className="gn__bar">
        <div className="gn__in">
          <div className="gn__brand">
            <Link className="gn__logo" to={href("")} aria-label={navCopy.home[locale]}>
              <img className="gn__logo-ink" src="/brand/CIRMANO_wordmark_EN_ink.svg" alt="" width="71" height="16" />
              <img className="gn__logo-bone" src="/brand/CIRMANO_wordmark_EN_bone.svg" alt="" width="71" height="16" />
            </Link>
            <Link
              className="gn__cube"
              to={href("walkthrough")}
              aria-label={cubeLabel[locale]}
              data-tip={cubeLabel[locale]}
            >
              <Box size={14} strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </div>

          <nav className="gn__menu" aria-label="Primary">
            <ul>
              {navSections.map((section) => (
                <li key={section.id} onMouseEnter={() => requestOpen(section.id)}>
                  <Link
                    className="gn__link"
                    to={href(section.to)}
                    aria-current={current === section.id ? "page" : undefined}
                    onFocus={() => section.primary || scheduleClose()}
                  >
                    {section.label[locale]}
                    {current === section.id && (
                      <motion.span className="gn__current" layoutId="gn-current" transition={{ duration: reduce ? 0 : 0.6, ease: EASE }} />
                    )}
                  </Link>
                  {section.primary && (
                    <button
                      type="button"
                      className="gn__disclose"
                      aria-expanded={openId === section.id}
                      aria-controls="gn-flyout"
                      aria-label={section.label[locale]}
                      onClick={(event) => {
                        lastTrigger.current = event.currentTarget;
                        clearTimers();
                        setOpenId(openId === section.id ? null : section.id);
                      }}
                    >
                      <ChevronDown size={12} aria-hidden="true" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="gn__actions">
            <div className="gn__lang">
              <button
                type="button"
                className="gn__lang-btn"
                aria-expanded={langOpen}
                aria-label={navCopy.language[locale]}
                onClick={() => {
                  closeAll();
                  setLangOpen((v) => !v);
                }}
              >
                {localeMeta[locale].short}
                <ChevronDown size={12} aria-hidden="true" />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.ul
                    className="gn__lang-menu"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: reduce ? 0 : 0.2, ease: EASE }}
                  >
                    {locales.map((item) => (
                      <li key={item}>
                        <button type="button" aria-current={item === locale ? "true" : undefined} onClick={() => switchLocale(item)} lang={item}>
                          {localeMeta[item].label}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
            <Link className="gn__cta" to={href("contact")}>
              {navCopy.cta[locale]}
            </Link>
            <button
              type="button"
              className="gn__burger"
              aria-expanded={mobileOpen}
              aria-controls="gn-sheet"
              aria-label={mobileOpen ? navCopy.close[locale] : navCopy.menu[locale]}
              onClick={() => {
                closeAll();
                setMobileOpen((v) => !v);
              }}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop flyout */}
      <motion.div
        id="gn-flyout"
        className="gn__flyout"
        initial={false}
        animate={{ height: panelHeight }}
        transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
        aria-hidden={!open}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open && (
            <motion.div
              key={open.id}
              className="gn__panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.2, ease: "linear" }}
            >
              <FlyoutPanel section={open} locale={locale} href={href} time={time} reduce={reduce} onHeight={setPanelHeight} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <div className="gn__veil" aria-hidden="true" onMouseEnter={() => closeAll()} />

      {/* Mobile sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            id="gn-sheet"
            className="gn__sheet"
            aria-label="Mobile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
          >
            <MobileSheet locale={locale} href={href} current={current} reduce={reduce} />
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function FlyoutPanel({ section, locale, href, time, reduce, onHeight }: { section: NavSection; locale: Locale; href: (to: string) => string; time: string; reduce: boolean; onHeight: (height: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  // Report this panel's height so the flyout can animate to it.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => onHeight(el.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [onHeight]);
  const groups = section.groups;
  const first = groups?.[0].items[0];
  const [preview, setPreview] = useState(first?.image && first.caption ? { image: first.image, caption: first.caption } : section.preview);
  const showPreview = (link: NavLink) => link.image && link.caption && setPreview({ image: link.image, caption: link.caption });

  const col = (index: number, children: ReactNode, className: string) => (
    <motion.div
      key={index}
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.6, ease: EASE, delay: reduce ? 0 : index * 0.04 }}
    >
      {children}
    </motion.div>
  );

  return (
    <div className="gn__panel-in" ref={ref}>
      <div className="gn__cols">
        {groups ? (
          groups.map((group, gi) =>
            col(
              gi,
              <>
                <p className="gn__label gn__label--group">
                  <strong>{group.title[locale]}</strong>
                </p>
                <ul className="gn__big gn__big--stack">
                  {group.items.map((link) => (
                    <li key={link.label.en} onMouseEnter={() => showPreview(link)} onFocus={() => showPreview(link)}>
                      <Link to={href(link.to)}>
                        <span>{link.label[locale]}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>,
              "gn__col gn__col--group",
            ),
          )
        ) : (
          <>
            {col(
              0,
              <>
                <p className="gn__label">{section.primaryLabel?.[locale]}</p>
                <ul className="gn__big">
                  {section.primary?.map((link) => (
                    <li key={link.to}>
                      <Link to={href(link.to)}>{link.label[locale]}</Link>
                    </li>
                  ))}
                </ul>
              </>,
              "gn__col gn__col--primary",
            )}
            {col(
              1,
              <>
                <p className="gn__label">{section.secondaryLabel?.[locale]}</p>
                <ul className="gn__small">
                  {section.secondary?.map((link) => (
                    <li key={link.to + link.label.en}>
                      {link.external ? (
                        <a href={link.to} target="_blank" rel="noopener noreferrer">{link.label[locale]}</a>
                      ) : (
                        <Link to={href(link.to)}>{link.label[locale]}</Link>
                      )}
                    </li>
                  ))}
                  {section.id === "about" && (
                    <>
                      <li><a href={brand.social.instagram} target="_blank" rel="noopener noreferrer"><InstagramIcon size={16} />Instagram</a></li>
                      <li><a href={brand.social.facebook} target="_blank" rel="noopener noreferrer"><FacebookIcon size={16} />Facebook</a></li>
                    </>
                  )}
                </ul>
              </>,
              "gn__col",
            )}
          </>
        )}
        {preview &&
          col(
            2,
            <figure className="gn__preview">
              <AnimatePresence initial={false}>
                <motion.img
                  key={preview.image}
                  src={preview.image}
                  alt=""
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.6, ease: "linear" }}
                />
              </AnimatePresence>
              <figcaption>{preview.caption[locale]}</figcaption>
            </figure>,
            "gn__col gn__col--preview",
          )}
      </div>
      <div className="gn__foot">
        <span>
          {brand.city}
          {time && <> · <span className="gn__time">{time}</span> GMT+8</>}
        </span>
        <span className="gn__social">
          <a href={brand.social.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href={brand.social.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href={brand.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        </span>
      </div>
    </div>
  );
}

function MobileSheet({ locale, href, current, reduce }: { locale: Locale; href: (to: string) => string; current: NavSection["id"] | null; reduce: boolean }) {
  const [expanded, setExpanded] = useState<NavSection["id"] | null>(null);
  return (
    <div className="gn__sheet-in">
      <ol className="gn__sheet-list">
        {navSections.map((section, index) => (
          <motion.li
            key={section.id}
            initial={{ opacity: 0, y: reduce ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.6, ease: EASE, delay: reduce ? 0 : 0.05 + index * 0.04 }}
          >
            <div className="gn__sheet-row">
              <Link to={href(section.to)} aria-current={current === section.id ? "page" : undefined}>
                <small>{String(index + 1).padStart(2, "0")}</small>
                {section.label[locale]}
              </Link>
              {section.primary && (
                <button
                  type="button"
                  aria-expanded={expanded === section.id}
                  aria-label={section.label[locale]}
                  onClick={() => setExpanded(expanded === section.id ? null : section.id)}
                >
                  <ChevronDown size={20} aria-hidden="true" />
                </button>
              )}
            </div>
            <AnimatePresence initial={false}>
              {expanded === section.id && (
                <motion.ul
                  className="gn__sheet-sub"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
                >
                  {section.primary?.map((link) => (
                    <li key={link.to + link.label.en}>
                      <Link to={href(link.to)}>{link.label[locale]}</Link>
                    </li>
                  ))}
                  {section.id === "about" &&
                    section.secondary?.map((link) => (
                      <li key={link.label.en}>
                        <a href={link.to} target="_blank" rel="noopener noreferrer">{link.label[locale]}</a>
                      </li>
                    ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </motion.li>
        ))}
      </ol>
      <div className="gn__sheet-foot">
        <Link className="btn btn--primary" to={href("contact")}>{navCopy.cta[locale]}</Link>
        <a className="btn btn--secondary" href={brand.whatsapp} target="_blank" rel="noopener noreferrer">
          <WhatsAppIcon size={18} />
          {navCopy.whatsapp[locale]}
        </a>
        <div className="gn__sheet-social">
          <a href={brand.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon /></a>
          <a href={brand.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FacebookIcon /></a>
        </div>
      </div>
    </div>
  );
}
