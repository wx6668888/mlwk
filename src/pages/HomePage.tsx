import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  collections,
  getCopy,
  type Locale,
} from "../content";
import CinematicMedia from "../components/CinematicMedia";
import Reveal from "../components/Reveal";
import VillaRevealHero from "../components/VillaRevealHero";

const manufacturingProof: Record<Locale, Array<[string, string]>> = {
  en: [
    ["Panel processing", "Foshan manufacturing brings panel processing together with coordinated cabinetry systems."],
    ["Edge finishing", "Careful edge finishing supports the details of each approved project package."],
    ["Inspection & trial assembly", "Selected cabinetry is inspected and trial-assembled before dispatch; scope is confirmed by project."],
  ],
  zh: [
    ["板件加工", "佛山制造环节结合板件加工与协同深化的柜体系统。"],
    ["饰面封边", "细致的封边处理服务于每个已确认项目的具体细节。"],
    ["检查与试装", "部分柜体在出货前检查并试装；具体范围按项目确认。"],
  ],
  ar: [
    ["معالجة الألواح", "يجمع التصنيع في فوشان بين معالجة الألواح وأنظمة الخزائن المتناسقة."],
    ["تشطيب الحواف", "يدعم تشطيب الحواف بعناية تفاصيل كل حزمة مشروع معتمدة."],
    ["الفحص والتجميع التجريبي", "تُفحص بعض الخزائن وتُجرّب قبل الشحن؛ ويُؤكد النطاق لكل مشروع."],
  ],
  de: [
    ["Plattenbearbeitung", "Die Fertigung in Foshan verbindet Plattenbearbeitung mit abgestimmten Schranksystemen."],
    ["Kantenbearbeitung", "Sorgfältige Kantenbearbeitung unterstützt die Details jedes freigegebenen Projektpakets."],
    ["Prüfung und Probemontage", "Ausgewählte Schränke werden vor dem Versand geprüft und probemontiert; der Umfang wird projektbezogen bestätigt."],
  ],
  fr: [
    ["Usinage des panneaux", "La fabrication à Foshan associe l’usinage des panneaux à des systèmes de mobilier coordonnés."],
    ["Finition des chants", "Une finition soignée des chants accompagne les détails du dossier de projet approuvé."],
    ["Contrôle et montage à blanc", "Certains meubles sont contrôlés et montés à blanc avant expédition ; le périmètre est confirmé pour chaque projet."],
  ],
};

export default function HomePage({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);


  return (
    <>
      <VillaRevealHero locale={locale} />

      {/* Material ticker */}
      <div className="material-ticker" aria-hidden="true">
        <div className="material-ticker__track">
          {[
            "White Oak","Lacquered MDF","American Walnut","Brushed Brass",
            "Fluted Panel","Bleached Ash","Smoked Glass","Wenge Veneer",
            "Satin Steel","Quarter-sawn Oak","Fumed Larch","Ebonised Ash",
            "White Oak","Lacquered MDF","American Walnut","Brushed Brass",
            "Fluted Panel","Bleached Ash","Smoked Glass","Wenge Veneer",
            "Satin Steel","Quarter-sawn Oak","Fumed Larch","Ebonised Ash",
          ].map((m, i) => (
            <span key={i} className="material-ticker__item">
              {m}<span className="material-ticker__dot" aria-hidden="true">&#xB7;</span>
            </span>
          ))}
        </div>
      </div>

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
          <img
            src="/media/cirmano-project-p179.jpg"
            alt="Living room cabinetry and wall panels in a completed Guangzhou residence"
            loading="lazy"
          />
          <Link
            className="floating-link"
            to={`/${locale}/projects`}
          >
            {copy.nav.projects}
            <ArrowUpRight size={18} />
          </Link>
        </Reveal>
      </section>

      <section className="regional-band">
        {manufacturingProof[locale].map(([label, text]) => (
          <div key={label}>
            <span>{label}</span>
            <p>{text}</p>
          </div>
        ))}
      </section>
      {/* Final CTA */}
      <section className="final-cta section">
        <Reveal className="final-cta__inner">
          <p className="eyebrow">{copy.home.processEyebrow}</p>
          <h2 className="final-cta__title">{copy.home.finalTitle}</h2>
          <p className="final-cta__sub">{copy.home.finalSubtext}</p>
          <Link className="final-cta__btn" to={`/${locale}/quote`}>
            {copy.nav.quote}
            <ArrowUpRight size={20} />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
