import { Link } from "react-router-dom";
import type { Locale } from "../../content";
import { pageCopy } from "../../site/pageCopy";
import { productCategories } from "../../site/navigation";
import { byGroup, pick, src, type Photo } from "../../site/photos";
import CircularGallery from "../../components/bits/CircularGallery";
import ScrollVelocity from "../../components/bits/ScrollVelocity";
import TiltedCard from "../../components/bits/TiltedCard";
import { LoopVideo } from "../../components/motion/LoopVideo";
import { CTABand, Chapter, FeatureCards, LocalNav, PageHero, PhotoMasonry, SplitRow } from "../../components/page/PageKit";
import "../../components/page/PageKit.css";
import "./Redesign.css";

const href = (locale: Locale, to: string) => `/${locale}/${to}`;

// Hero photo and gallery per product family (brand pack 页面与素材对应.csv + 产品分类.csv).
const productMedia: Record<string, { hero: string; gallery: string[] }> = {
  kitchens: { hero: "r087", gallery: ["r004", "r002", "r103", "r080", "r097", "r081", "r088", "r071", "r084", "r082", "r074", "r078", "r006", "r096"] },
  "wardrobes-storage": { hero: "r022", gallery: ["r021", "r043", "r027", "r034", "r035", "r030", "r037", "r038", "r113", "r114", "r131", "r136", "r056", "r057", "r054", "r052"] },
  "interior-doors": { hero: "r016", gallery: ["r003", "r015", "r000", "r001", "r018", "r044", "r106", "r105", "r009", "r007"] },
  "wall-panels-woodwork": { hero: "r119", gallery: ["r120", "r139", "r122", "r126", "r129", "r134", "r132", "r141", "r026", "r024", "r108", "r110", "r115", "r009"] },
  "aluminium-glass": { hero: "r098", gallery: ["r099", "r081", "r082", "r088", "r092", "r066", "r067", "r068", "r026", "r027"] },
};

const materialStrip = ["Smoked oak", "White lacquer", "Bronze glass", "Stone", "Walnut", "Brushed bronze", "Light oak", "Travertine"];

const caption = (locale: Locale) => (p: Photo) =>
  `${p.note} · ${locale === "zh" ? "广州住宅" : "Guangzhou Residence"}`.replace(/^(.+?) · /, (_, note) => `${spaceName(note, locale)} · `);

function spaceName(note: string, locale: Locale) {
  const en: Record<string, string> = { 客厅: "Living room", 厨房与餐厅: "Kitchen & dining", 茶室: "Tea room", 主卧与衣帽间: "Bedroom & dressing", 儿童房: "Children's room", 卫生间: "Bathroom", 玄关与过道: "Entry & hallway" };
  return locale === "zh" ? note : en[note] ?? note;
}

export function ProductsOverviewPage({ locale }: { locale: Locale }) {
  const c = pageCopy[locale];
  const t = c.products;
  const details = pick("r129", "r035", "r044", "r092", "r023", "r031", "r064", "r135", "r018", "r037");
  return (
    <div className="pk-page">
      <PageHero eyebrow={t.eyebrow} title={t.title} lead={t.lead} photo="r087" alt={t.heroAlt} caption={t.heroCaption} />

      <Chapter label={t.systemsLabel} page={1} total={5} title={t.systemsTitle} lead={t.systemsLead} tone="ink">
        <FeatureCards dark items={t.systems.map((s) => ({ kicker: s.kicker, title: s.title, list: s.list }))} />
      </Chapter>

      <Chapter label={t.collectionsLabel} page={2} total={5} title={t.collectionsTitle}>
        {t.pages.map((pg, i) => {
          const cat = productCategories.find((x) => x.slug === pg.slug)!;
          return (
            <SplitRow
              key={pg.slug}
              flip={i % 2 === 1}
              media={
                <TiltedCard
                  imageSrc={src(productMedia[pg.slug].hero, "m")}
                  altText={pg.name}
                  containerHeight="min(64vh, 620px)"
                  containerWidth="100%"
                  imageHeight="min(64vh, 620px)"
                  imageWidth="100%"
                  rotateAmplitude={6}
                  scaleOnHover={1.02}
                  showTooltip={false}
                  radius={20}
                  glare={0.12}
                  shadow={0.25}
                  intro={false}
                />
              }
            >
              <p className="t-eyebrow">{cat.code} · {pg.name}</p>
              <h3>{pg.headline}</h3>
              <p>{pg.lead}</p>
              <ul>{pg.features.map((f) => <li key={f.title}>{f.title}</li>)}</ul>
              <Link className="link-arrow" to={href(locale, `products/${pg.slug}`)}>{c.common.learn}</Link>
            </SplitRow>
          );
        })}
      </Chapter>

      <Chapter label={t.materialsLabel} page={3} total={5} title={t.materialsTitle} lead={t.materialsLead} tone="bright" wide>
        <div className="rd-circular">
          <CircularGallery
            items={details.map((p) => ({ image: src(p, "s"), text: spaceName(p.note, locale), alt: spaceName(p.note, locale) }))}
            bend={2}
            textColor="#101012"
            borderRadius={0.05}
            font="500 22px Manrope"
            scrollSpeed={2}
            scrollEase={0.05}
            showTitles={false}
            fadeEdges={0.12}
            intro
          />
        </div>
        <div className="rd-velocity" aria-hidden="true">
          <ScrollVelocity texts={[materialStrip.join("  ·  ")]} velocity={40} numCopies={4} fontSize="clamp(40px, 6vw, 96px)" fontWeight={500} color="rgba(16,16,18,0.9)" fadeEdges />
        </div>
      </Chapter>

      <Chapter label={t.edgeLabel} page={4} total={5} title={t.edgeTitle} lead={t.edgeLead}>
        <SplitRow
          media={<LoopVideo className="rd-video rd-video--tall" src="/media/video/res-oak-edge.mp4" poster="/media/video/res-oak-edge.webp" label={t.edgeTitle} pauseLabel="Pause" playLabel="Play" />}
        >
          <p className="t-eyebrow">{t.edgeLabel}</p>
          <ul>{t.edgeBenefits.map((b) => <li key={b}>{b}</li>)}</ul>
          <p className="t-caption">{c.common.aiNote}</p>
        </SplitRow>
      </Chapter>

      <CTABand title={t.ctaTitle} lead={t.ctaLead} primary={{ to: href(locale, "contact"), label: c.common.discuss }} locale={locale} />
    </div>
  );
}

export function ProductDetailPage({ locale, slug }: { locale: Locale; slug: string }) {
  const c = pageCopy[locale];
  const pg = c.products.pages.find((p) => p.slug === slug);
  if (!pg) return <ProductsOverviewPage locale={locale} />;
  const media = productMedia[slug];
  const gallery = pick(...media.gallery);
  const others = c.products.pages.filter((p) => p.slug !== slug);

  return (
    <div className="pk-page">
      <LocalNav
        title={pg.name}
        links={[
          { id: "overview", label: c.common.overview },
          { id: "details", label: c.common.details },
          { id: "gallery", label: c.common.gallery },
          ...(pg.film ? [{ id: "film", label: c.common.film }] : []),
        ]}
      />
      <PageHero eyebrow={`CIRMANO / ${pg.name}`} title={pg.headline} lead={pg.lead} photo={media.hero} alt={pg.name} caption={pg.galleryTitle} />

      <Chapter id="overview" label={c.common.overview} page={1} total={4} title={pg.name} lead={pg.description}>
        {pg.note && <p className="t-caption rd-note">{pg.note}</p>}
      </Chapter>

      <Chapter id="details" label={c.common.details} page={2} total={4} title={pg.headline} tone="ink">
        <FeatureCards dark items={pg.features.map((f) => ({ title: f.title, text: f.text }))} />
      </Chapter>

      <Chapter id="gallery" label={c.common.gallery} page={3} total={4} title={pg.galleryTitle} tone="bright">
        <PhotoMasonry photos={gallery} caption={caption(locale)} />
      </Chapter>

      {pg.film && (
        <section id="film" className="rd-film">
          <div className="rd-film__in">
            <LoopVideo
              className={`rd-video ${pg.film.credit ? "rd-video--reel" : ""}`}
              src={pg.film.src}
              poster={pg.film.poster}
              label={pg.film.label}
              pauseLabel="Pause"
              playLabel="Play"
            />
            <div className="rd-film__text">
              <p className="t-eyebrow">{c.common.film}</p>
              <p className="t-title">{pg.film.label}</p>
              {pg.film.credit && <p className="t-caption">{c.common.musicCredit}</p>}
            </div>
          </div>
        </section>
      )}

      <Chapter label={c.common.related} page={4} total={4} title={c.products.collectionsTitle}>
        <ul className="rd-related">
          {others.map((o) => (
            <li key={o.slug}>
              <Link to={href(locale, `products/${o.slug}`)} className="rd-related__card">
                <span className="pk-figure"><img src={src(productMedia[o.slug].hero, "s")} alt="" loading="lazy" /></span>
                <strong>{o.name}</strong>
                <span>{o.headline}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Chapter>

      <CTABand title={c.products.ctaTitle} lead={c.products.ctaLead} primary={{ to: href(locale, "contact"), label: pg.cta }} locale={locale} />
    </div>
  );
}

export { byGroup };
