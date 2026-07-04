import { ArrowUpRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import PageIntro from "../components/PageIntro";
import Reveal from "../components/Reveal";
import CinematicMedia from "../components/CinematicMedia";
import { collections, getCopy, type Locale } from "../content";

export function CollectionsPage({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  const [eyebrow, title, text] = copy.pages.collections;

  return (
    <>
      <PageIntro eyebrow={eyebrow} title={title} text={text} />
      <section className="catalog-grid section">
        {collections.map((item, index) => (
          <Reveal className="catalog-item" key={item.slug}>
            <Link to={`/${locale}/collections/${item.slug}`}>
              <div className="catalog-item__image">
                <CinematicMedia
                  image={item.image}
                  label={item.name[locale]}
                  eager={index < 2}
                />
                <span className="concept-label">{copy.common.concept}</span>
              </div>
              <div className="catalog-item__copy">
                <span>0{index + 1}</span>
                <div>
                  <h2>{item.name[locale]}</h2>
                  <p>{item.description[locale]}</p>
                </div>
                <ArrowUpRight />
              </div>
            </Link>
          </Reveal>
        ))}
      </section>
    </>
  );
}

export function CollectionDetailPage({
  locale,
  slug,
}: {
  locale: Locale;
  slug: string;
}) {
  const item = collections.find((collection) => collection.slug === slug);
  const copy = getCopy(locale);
  if (!item) return null;

  return (
    <>
      <section className="detail-hero">
        <CinematicMedia image={item.image} label={item.name[locale]} eager />
        <div className="detail-hero__shade" />
        <div className="detail-hero__copy">
          <p className="eyebrow">MLWK / {copy.nav.collections}</p>
          <h1>{item.name[locale]}</h1>
          <p>{item.description[locale]}</p>
        </div>
      </section>
      <section className="detail-body section">
        <Reveal className="detail-statement">
          <span>01 / System</span>
          <h2>{copy.pages.collections[1]}</h2>
          <p>{copy.pages.collections[2]}</p>
        </Reveal>
        <div className="feature-list">
          {item.features[locale].map((feature) => (
            <Reveal key={feature} className="feature-line">
              <Check size={17} />
              <span>{feature}</span>
            </Reveal>
          ))}
        </div>
        <Reveal className="spec-panel">
          <div>
            <small>Structure</small>
            <strong>Project-specific</strong>
          </div>
          <div>
            <small>Finish</small>
            <strong>Sample approved</strong>
          </div>
          <div>
            <small>Hardware</small>
            <strong>Coordinated to brief</strong>
          </div>
          <Link className="primary-button" to={`/${locale}/quote`}>
            <ArrowUpRight size={18} />
            {copy.nav.quote}
          </Link>
        </Reveal>
      </section>
    </>
  );
}
