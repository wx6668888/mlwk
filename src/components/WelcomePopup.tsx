import { X, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Locale } from "../content";

const STORAGE_KEY = "mlwk.welcome.dismissed";

const copy: Record<
  Locale,
  { eyebrow: string; headline: string; body: string; cta: string; dismiss: string }
> = {
  en: {
    eyebrow: "Integrated whole-home customization",
    headline: "Made As One.",
    body: "CIRMANO brings kitchens, wardrobes, interior doors and wall panels together through a shared design language. Made in Foshan, China for villas and premium homes.",
    cta: "Discuss your project",
    dismiss: "Explore first",
  },
  zh: {
    eyebrow: "一体化全屋定制",
    headline: "Made As One · 一体成就完整空间",
    body: "CIRMANO立足中国佛山，以统一的设计语言连接橱柜、衣柜、室内门和墙板，专注别墅与高端住宅。",
    cta: "沟通你的项目",
    dismiss: "先浏览网站",
  },
  ar: {
    eyebrow: "تصنيع أعمال خشبية معمارية حسب الطلب",
    headline: "من الرسم إلى الغرفة.",
    body: "تجمع CIRMANO المطابخ والخزائن والأبواب الداخلية وألواح الجدران ضمن لغة تصميم واحدة للمنازل والفلل الراقية.",
    cta: "أرسل مخططاتك",
    dismiss: "تصفح أولاً",
  },
  de: {
    eyebrow: "Auftragsbasierter architektonischer Innenausbau",
    headline: "Wo die Zeichnung zum Raum wird.",
    body: "CIRMANO verbindet Küchen, Schränke, Innentüren und Wandpaneele durch eine gemeinsame Gestaltungssprache für Villen und hochwertige Wohnhäuser.",
    cta: "Pläne senden",
    dismiss: "Zuerst erkunden",
  },
  fr: {
    eyebrow: "Menuiserie architecturale sur mesure",
    headline: "Du trait au lieu.",
    body: "CIRMANO réunit cuisines, dressings, portes intérieures et panneaux muraux dans un langage commun pour villas et résidences haut de gamme.",
    cta: "Envoyer vos plans",
    dismiss: "Explorer d'abord",
  },
};

export default function WelcomePopup({ locale }: { locale: Locale }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show only if not dismissed this session
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      const timer = setTimeout(() => setVisible(true), 900);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  const c = copy[locale] ?? copy.en;

  return (
    <div className={`welcome-overlay${visible ? " is-visible" : ""}`} role="dialog" aria-modal="true" aria-label={c.headline}>
      {/* Backdrop */}
      <div className="welcome-backdrop" onClick={dismiss} aria-hidden="true" />

      {/* Card */}
      <div className="welcome-card">
        <button className="welcome-close" type="button" onClick={dismiss} aria-label="Close">
          <X size={18} />
        </button>

        {/* Left: image panel */}
        <div className="welcome-visual">
          <img src="/media/cirmano-project-p175.jpg" alt="" />
          <div className="welcome-visual-shade" />
          <span className="welcome-visual-label">CIRMANO · Made As One</span>
        </div>

        {/* Right: copy panel */}
        <div className="welcome-copy">
          <p className="eyebrow">{c.eyebrow}</p>
          <h2 className="welcome-headline">{c.headline}</h2>
          <p className="welcome-body">{c.body}</p>
          <div className="welcome-actions">
            <Link
              className="welcome-cta"
              to={`/${locale}/quote`}
              onClick={dismiss}
            >
              {c.cta}
              <ArrowUpRight size={16} />
            </Link>
            <button type="button" className="welcome-dismiss" onClick={dismiss}>
              {c.dismiss}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
