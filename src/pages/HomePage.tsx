import { ArrowUpRight, FileText, Layers3 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  collections,
  getCopy,
  type Locale,
} from "../content";
import MediaFilm from "../components/MediaFilm";
import CinematicMedia from "../components/CinematicMedia";
import CountUp from "../components/CountUp";
import Reveal from "../components/Reveal";

const heroTitleLines: Record<Locale, [string, string]> = {
  en: ["Made for the rooms", "people remember"],
  zh: ["为值得被记住的", "空间而作"],
  ar: ["مصنوعة للمساحات", "التي تبقى في الذاكرة"],
  de: ["Für Räume,", "die in Erinnerung bleiben"],
  fr: ["Pour les pièces", "dont on se souvient"],
};

const mobileHeroIntro: Record<Locale, string> = {
  en: "Cabinetry and architectural millwork, shaped from drawing to final grain.",
  zh: "从图纸到木纹，让柜体与建筑木作成为空间的一部分。",
  ar: "خزائن وأعمال خشبية معمارية، من المخطط حتى آخر تفصيلة.",
  de: "Möbel und Innenausbau, vom Plan bis zum letzten Furnierbild.",
  fr: "Mobilier et menuiserie architecturale, du plan au dernier veinage.",
};

export default function HomePage({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  const [firstTitleLine, secondTitleLine] = heroTitleLines[locale];

  return (
    <>
      <section className="hero">
        <MediaFilm
          sources={[
            {
              src: "/media/hero-film-graded-mobile.webm",
              type: "video/webm",
              media: "(max-width: 620px)",
            },
            {
              src: "/media/hero-film-graded-mobile.mp4",
              type: "video/mp4",
              media: "(max-width: 620px)",
            },
            {
              src: "/media/hero-film-graded-1080.webm",
              type: "video/webm",
              media: "(min-width: 621px)",
            },
            {
              src: "/media/hero-film-graded-1080.mp4",
              type: "video/mp4",
              media: "(min-width: 621px)",
            },
          ]}
          poster="/media/hero-barefoot-poster.webp"
          label="MLWK architectural millwork interior — graded film"
          className="hero-film"
          eager
        />
        <div className="hero-shade" />
        <div className="hero-content">
          <Reveal className="hero-copy">
            <span className="hero-badge">
              <Layers3 size={16} />
              {copy.home.badge}
            </span>
            <h1
              className={`hero-title hero-title--${locale}`}
              aria-label={copy.home.title}
            >
              <span className="hero-title-rotator" aria-hidden="true">
                <span>{firstTitleLine}</span>
                <span>{secondTitleLine}</span>
              </span>
              <span className="hero-title-static">{copy.home.title}</span>
            </h1>
            <p className="hero-intro hero-intro--desktop">{copy.home.intro}</p>
            <p className="hero-intro hero-intro--mobile">
              {mobileHeroIntro[locale]}
            </p>
          </Reveal>

          <div className="hero-proof">
            <strong>
              <CountUp
                end={500}
                prefix={locale === "ar" ? "+" : ""}
                suffix={locale === "ar" ? "" : "+"}
              />
            </strong>
            <span>{copy.home.proofLabel}</span>
            <Link to={`/${locale}/projects`}>
              {copy.nav.projects}
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="hero-corner">
            <Link to={`/${locale}/resources`}>
              <span className="hero-corner__icon">
                <FileText size={22} />
              </span>
              <span>
                <strong>Catalogues</strong>
                <small>{copy.common.explore}</small>
              </span>
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="collections-preview section">
        <Reveal className="section-heading">
          <div>
            <p className="eyebrow">{copy.home.collectionsEyebrow}</p>
            <h2>{copy.home.collectionsTitle}</h2>
          </div>
          <div>
            <p>{copy.home.collectionsText}</p>
            <Link className="text-link" to={`/${locale}/collections`}>
              {copy.common.viewAll}
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </Reveal>
        <div className="collection-grid">
          {collections.map((item, index) => (
            <Reveal
              key={item.slug}
              className={`collection-tile collection-tile--${index + 1}`}
              delay={Math.min(index * 0.05, 0.2)}
            >
              <Link to={`/${locale}/collections/${item.slug}`}>
                <CinematicMedia
                  image={item.image}
                  label={item.name[locale]}
                />
                <span className="image-tone" />
                <span className="collection-tile__meta">
                  <small>0{index + 1}</small>
                  <strong>{item.name[locale]}</strong>
                  <ArrowUpRight size={19} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="process-section section section--ink">
        <Reveal className="section-heading section-heading--light">
          <div>
            <p className="eyebrow">{copy.home.processEyebrow}</p>
            <h2>{copy.home.processTitle}</h2>
          </div>
          <p>{copy.home.processText}</p>
        </Reveal>
        <div className="process-list">
          {copy.capabilitySteps.map(([number, title, text], index) => (
            <Reveal className="process-row" key={number} delay={index * 0.04}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
              <ArrowUpRight size={20} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="direction-section section">
        <Reveal className="direction-copy">
          <p className="eyebrow">{copy.home.directionEyebrow}</p>
          <h2>{copy.home.directionTitle}</h2>
          <p>{copy.home.directionText}</p>
        </Reveal>
        <Reveal className="direction-film">
          <MediaFilm
            src="/media/kitchen-generated.mp4"
            poster="/media/kitchens.png"
            label="MLWK custom kitchen design direction"
          />
          <Link
            className="floating-link"
            to={`/${locale}/collections/kitchens`}
          >
            {collections[0].name[locale]}
            <ArrowUpRight size={18} />
          </Link>
        </Reveal>
      </section>

      <section className="regional-band">
        <div>
          <span>Europe</span>
          <p>Drawing control · material consistency · precise fit</p>
        </div>
        <div>
          <span>North America</span>
          <p>Shop drawings · coordinated packages · clear communication</p>
        </div>
        <div>
          <span>Middle East</span>
          <p>Villa & hospitality · bespoke detail · Arabic support</p>
        </div>
      </section>
    </>
  );
}
