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
    eyebrow: "Made-to-order architectural millwork",
    headline: "Where drawing becomes room.",
    body: "From the first line on paper to the final grain match on site — MLWK manufactures custom cabinetry and architectural millwork for projects across Europe, North America and the Middle East.",
    cta: "Send your drawings",
    dismiss: "Explore first",
  },
  zh: {
    eyebrow: "定制建筑木作制造商",
    headline: "从图纸，到你记得住的空间。",
    body: "从第一笔线稿到现场最后一道木纹——MLWK 为欧洲、北美与中东的项目提供定制柜体与建筑木作制造服务。",
    cta: "上传图纸询价",
    dismiss: "先浏览网站",
  },
  ar: {
    eyebrow: "تصنيع أعمال خشبية معمارية حسب الطلب",
    headline: "من الرسم إلى الغرفة.",
    body: "من أول خط على الورق إلى آخر تطابق في عروق الخشب — تصنع MLWK خزائن مخصصة وأعمالاً خشبية معمارية لمشاريع في أوروبا وأمريكا الشمالية والشرق الأوسط.",
    cta: "أرسل مخططاتك",
    dismiss: "تصفح أولاً",
  },
  de: {
    eyebrow: "Auftragsbasierter architektonischer Innenausbau",
    headline: "Wo die Zeichnung zum Raum wird.",
    body: "Von der ersten Bleistiftlinie bis zum letzten Furnierbild vor Ort — MLWK fertigt individuelle Möbel und Innenausbau für Projekte in Europa, Nordamerika und dem Nahen Osten.",
    cta: "Pläne senden",
    dismiss: "Zuerst erkunden",
  },
  fr: {
    eyebrow: "Menuiserie architecturale sur mesure",
    headline: "Du trait au lieu.",
    body: "Du premier trait de crayon au dernier raccord de veinage sur site — MLWK fabrique mobilier et menuiserie architecturale pour des projets en Europe, en Amérique du Nord et au Moyen-Orient.",
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
          <img src="/media/hero-barefoot-poster.webp" alt="" />
          <div className="welcome-visual-shade" />
          <span className="welcome-visual-label">MLWK</span>
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
