import { Link } from "react-router-dom";
import type { Locale } from "../../content";
import { brand } from "../../site/brand";
import { pageCopy } from "../../site/pageCopy";
import { VR_TOUR_URL, projectSpaces } from "../../site/navigation";
import { getMfCopy } from "../../site/manufacturingCopy";
import { byGroup, pick, src, type Photo } from "../../site/photos";
import { inspirationEnabled } from "../../site/features";
import { reelCover, reelTitle, reelUrl, reelsFor } from "../../site/reels";
import { LoopVideo } from "../../components/motion/LoopVideo";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "../../components/nav/SocialIcons";
import { InspirationGrid } from "../../components/inspiration/Inspiration";
import { CTABand, Chapter, FeatureCards, LocalNav, PageHero, PhotoMasonry, SplitRow } from "../../components/page/PageKit";
import QuotePage from "../QuotePage";
import "../../components/page/PageKit.css";
import "./Redesign.css";

const href = (locale: Locale, to: string) => `/${locale}/${to}`;
const zh = (locale: Locale) => locale === "zh";

/* ── Manufacturing ───────────────────────────────────────── */
// Section order follows the Manufacturing menu. Photos from the factory collection are referenced by name
// (public/media/factory-collection/<name>-800.webp / -1600.webp).
const FACTORY_COLLECTION = "/media/factory-collection";
const FACTORY_STRIP = ["workshop-1", "office-building", "edgebanding-2", "showroom-1", "workshop-2", "exec-1", "edgebanding-1", "workshop-3", "exec-2", "showroom-2", "edgebanding-3"];
const MF_LOCAL: Record<"en" | "zh", string[]> = {
  en: ["OEM & Factories", "Materials", "Precision", "Quality & Trial", "Export", "VR Tour"],
  zh: ["OEM 与工厂", "材料", "精密制造", "质检与试装", "出口经验", "VR 参观"],
};
const MF_IDS = ["factories", "materials", "precision", "quality", "export", "tour"];

/** Card image: a photo id from the brand index, or a factory-collection path (without size suffix). */
const mfImage = (image: string) => (image.startsWith("/") ? (image.endsWith(".jpg") ? image : `${image}-1600.webp`) : src(image, "m"));
/** Team photos from the 团队 folder (public/media/mf/team-01..12.jpg). */
const TEAM_PHOTOS = Array.from({ length: 12 }, (_, i) => `/media/mf/team-${String(i + 1).padStart(2, "0")}.jpg`);

function FactoryStrip({ names, caption }: { names: string[]; caption: string }) {
  // Two copies of the set, so the track can loop without a visible jump.
  const items = [...names, ...names];
  return (
    <div className="mf-strip">
      <ul className="mf-strip__track">
        {items.map((n, i) => (
          <li key={`${n}-${i}`} aria-hidden={i >= names.length || undefined}>
            <img
              src={`${FACTORY_COLLECTION}/${n}-800.webp`}
              srcSet={`${FACTORY_COLLECTION}/${n}-800.webp 800w, ${FACTORY_COLLECTION}/${n}-1600.webp 1600w`}
              sizes="(max-width: 700px) 70vw, 36vw"
              alt=""
              loading="lazy"
            />
          </li>
        ))}
      </ul>
      <p className="t-caption mf-strip__caption">{caption}</p>
    </div>
  );
}

function MfStats({ items }: { items: { value: string; label: string; note: string }[] }) {
  return (
    <ul className="mf-stats">
      {items.map((s) => (
        <li key={s.label}>
          <strong>{s.value}</strong>
          <span>{s.label}</span>
          {s.note && <small>{s.note}</small>}
        </li>
      ))}
    </ul>
  );
}

export function ManufacturingPage({ locale }: { locale: Locale }) {
  const c = pageCopy[locale];
  const t = c.manufacturing;
  const m = getMfCopy(locale);
  const lang = zh(locale) ? "zh" : "en";
  const team = [...byGroup("team"), ...pick("m03", "m04")];
  const total = 7;
  const caption = zh(locale) ? "CIRMANO 佛山工厂" : "CIRMANO workshop, Foshan";

  return (
    <div className="pk-page">
      <LocalNav
        title={zh(locale) ? "制造" : "Manufacturing"}
        links={MF_IDS.map((id, i) => ({ id, label: MF_LOCAL[lang][i] }))}
      />
      <PageHero
        eyebrow={t.eyebrow}
        title={t.title}
        lead={t.lead}
        photo="m08"
        alt={t.heroAlt}
        caption={zh(locale) ? "佛山工厂" : "Foshan workshop"}
        video={{
          youtubeId: "cvnHNFwOJdg",
          title: zh(locale) ? "CIRMANO 佛山工厂参观" : "Custom Cabinetry Factory Tour in Foshan, China | CIRMANO",
          watchLabel: zh(locale) ? "在 YouTube 上观看" : "Watch on YouTube",
        }}
      />

      <Chapter id="factories" label={m.oem.label} page={1} total={total} title={m.oem.title} lead={m.oem.lead} tone="ink">
        <MfStats items={m.oem.stats} />
        <div className="mf-strip-wrap">
          <FactoryStrip names={FACTORY_STRIP} caption={m.factories.stripCaption} />
        </div>
      </Chapter>


      <Chapter id="materials" label={m.materials.label} page={2} total={total} title={m.materials.title} lead={m.materials.lead} tone="bone">
        <ul className="mf-cats">
          {m.materials.categories.map((cat) => (
            <li key={cat.name}>
              {cat.image && <img src={cat.image} alt="" loading="lazy" />}
              <strong>{cat.name}</strong>
              <span>{cat.text}</span>
            </li>
          ))}
        </ul>
        <div className="mf-brands">
          <p className="t-eyebrow">{m.materials.brandsLabel}</p>
          <ul>
            {m.materials.brands.map((row) => (
              <li key={row.label}>
                <span>{row.label}</span>
                <div>{row.brands.map((b) => <b key={b}>{b}</b>)}</div>
              </li>
            ))}
          </ul>
        </div>
        <details className="mf-more">
          <summary>{m.materials.moreLabel}</summary>
          <p className="t-caption">{m.materials.moreNote}</p>
          <dl>
            {m.materials.more.map((g) => (
              <div key={g.label}>
                <dt>{g.label}</dt>
                <dd>{g.brands.join(" · ")}</dd>
              </div>
            ))}
          </dl>
        </details>
      </Chapter>

      <Chapter id="precision" label={m.precision.label} page={3} total={total} title={m.precision.title} lead={m.precision.lead} tone="bright">
        <ul className="mf-cards">
          {m.precision.cards.map((card) => (
            <li key={card.no}>
              <article className="mf-card">
                <figure className="mf-card__media">
                  <img src={mfImage(card.image)} alt={card.title} loading="lazy" />
                </figure>
                <div className="mf-card__body">
                  <p className="mf-card__kicker"><span>{card.no}</span>{card.kicker}</p>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Chapter>

      <Chapter id="quality" label={m.quality.label} page={4} total={total} title={m.quality.title} lead={m.quality.lead} tone="ink">
        <div className="mf-band">
          <div className="mf-band__copy">
            <p className="t-eyebrow">{m.quality.bandKicker}</p>
            <p className="mf-band__figure">{m.quality.bandFigure}</p>
            <h3>{m.quality.bandTitle}</h3>
            <p>{m.quality.bandText}</p>
            <ul>
              {m.quality.bandPoints.map((p) => <li key={p}>✓ {p}</li>)}
            </ul>
          </div>
          <figure className="mf-band__media mf-band__media--trial" role="img" aria-label={m.quality.bandTitle}>
            <figcaption className="mf-band__tag">{zh(locale) ? "柜体连接件紧固" : "Tightening a cabinet connector"}</figcaption>
          </figure>
        </div>
        <div className="mf-downloads">
          <p className="t-eyebrow">{m.quality.downloadsLabel}</p>
          <ul>
            {m.quality.downloads.map((d) => (
              <li key={d.file}>
                <a href={`/downloads/${d.file}`} target="_blank" rel="noopener noreferrer">
                  <span>{d.title}</span>
                  <small>PDF</small>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Chapter>

      <Chapter id="export" label={m.exportCopy.label} page={5} total={total} title={m.exportCopy.title} lead={m.exportCopy.lead} tone="bone">
        <figure className="mf-export__media">
          <img src="/media/mf/export-warehouse.jpg" alt={m.exportCopy.title} loading="lazy" />
        </figure>
        <FeatureCards items={m.exportCopy.cards.map((cd, i) => ({ kicker: String(i + 1).padStart(2, "0"), title: cd.title, text: cd.text }))} />
        <div className="rd-tour__links">
          <a className="btn btn--secondary" href={brand.social.clientVisits} target="_blank" rel="noopener noreferrer">
            <FacebookIcon /> {zh(locale) ? "观看客户参观视频" : "Watch client visits"}
          </a>
        </div>
      </Chapter>

      <Chapter id="tour" label={t.tourLabel} page={6} total={total} title={t.tourTitle} lead={t.tourLead} tone="bright">
        <div className="rd-tour__links rd-tour__links--top">
          <a className="btn btn--primary" href={VR_TOUR_URL} target="_blank" rel="noopener noreferrer">{zh(locale) ? "打开 VR 参观" : "Open the VR tour"}</a>
          <a className="btn btn--secondary" href={brand.social.factoryTour} target="_blank" rel="noopener noreferrer">
            <FacebookIcon /> {t.tourCta}
          </a>
          <Link className="link-arrow" to={href(locale, "service#visit")}>{c.service.bookCta}</Link>
        </div>
        <ReelCards locale={locale} tag="factory" />
        <div className="rd-clips">
          {["factory-05", "factory-09", "factory-10", "factory-11"].map((n) => (
            <LoopVideo key={n} className="rd-video" src={`/media/video/${n}.mp4`} poster={`/media/video/${n}.webp`} label={zh(locale) ? "工厂实拍" : "Workshop footage"} pauseLabel="Pause" playLabel="Play" />
          ))}
        </div>
      </Chapter>

      <Chapter id="team" label={t.teamLabel} page={7} total={total} title={t.teamTitle} lead={t.teamLead}>
        <PhotoMasonry photos={team} caption={() => (zh(locale) ? "CIRMANO 佛山团队" : "CIRMANO team, Foshan")} />
        <ul className="mf-team">
          {TEAM_PHOTOS.map((p) => (
            <li key={p}><img src={p} alt={zh(locale) ? "CIRMANO 佛山团队" : "CIRMANO team, Foshan"} loading="lazy" /></li>
          ))}
        </ul>
      </Chapter>

      <CTABand title={t.ctaTitle} lead={t.ctaLead} primary={{ to: href(locale, "contact"), label: c.common.discuss }} locale={locale} />
    </div>
  );
}

/* ── One-stop service ────────────────────────────────────── */
export function ServicePage({ locale }: { locale: Locale }) {
  const c = pageCopy[locale];
  const t = c.service;
  return (
    <div className="pk-page">
      <LocalNav
        title={zh(locale) ? "一站式服务" : "One-stop service"}
        links={[
          { id: "team", label: t.rolesLabel },
          { id: "steps", label: t.stepsLabel },
          { id: "support", label: t.supportLabel },
          { id: "flex", label: t.flexLabel },
          { id: "visit", label: t.visitLabel },
        ]}
      />
      <PageHero
        eyebrow={t.eyebrow}
        title={t.title}
        lead={t.lead}
        photo="/media/brand/cirmano-service-00-hero.webp"
        alt={t.heroAlt}
        caption={undefined}
      >
        <ul className="rd-promises">{t.promises.map((p) => <li key={p}>{p}</li>)}</ul>
      </PageHero>

      <Chapter id="team" label={t.rolesLabel} page={1} total={5} title={t.rolesTitle} lead={t.rolesLead} tone="ink">
        <ul className="rd-roles">
          {t.roles.map((r) => (
            <li key={r.code} className="rd-role">
              <span className="rd-role__code">{r.code}</span>
              <h3>{r.name}</h3>
              <p>{r.tagline}</p>
              <ul>{r.duties.map((d) => <li key={d}>{d}</li>)}</ul>
            </li>
          ))}
        </ul>
        <ul className="rd-role-values">{t.rolesValues.map((v) => <li key={v}>{v}</li>)}</ul>
      </Chapter>

      <Chapter id="steps" label={t.stepsLabel} page={2} total={5} title={t.stepsTitle} lead={t.stepsLead} tone="bright">
        <ol className="rd-service">
          {t.steps.map((s) => (
            <li key={s.no} className="rd-service__step">
              <figure className="pk-figure"><img src={src(s.photo, "m")} alt={s.alt ?? s.title} loading="lazy" /></figure>
              <div>
                <span className="rd-service__no">{s.no}</span>
                <p className="t-eyebrow">{s.kicker}</p>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Chapter>

      <Chapter id="support" label={t.supportLabel} page={3} total={5} title={t.supportTitle} lead={t.supportLead}>
        <div className="rd-support">
          {t.support.map((col) => (
            <div key={col.title} className="rd-support__col">
              <h3>{col.title}</h3>
              <ul>{col.items.map((i) => <li key={i}>{i}</li>)}</ul>
            </div>
          ))}
        </div>
        <p className="t-caption">{t.supportNote}</p>
      </Chapter>

      <Chapter id="flex" label={t.flexLabel} page={4} total={5} title={t.flexTitle} lead={t.flexLead} tone="ink">
        <FeatureCards dark items={t.flex.map((f, i) => ({ kicker: String(i + 1).padStart(2, "0"), title: f }))} />
      </Chapter>

      <ClientVisits locale={locale} page={5} total={5} />

      <CTABand title={t.ctaTitle} lead={t.ctaLead} primary={{ to: href(locale, "contact"), label: c.common.discuss }} locale={locale} />
    </div>
  );
}

/** Client visits: factory and showroom visits in Foshan, linked to the Facebook collection. */
export function ClientVisits({ locale, page, total }: { locale: Locale; page: number; total: number }) {
  const t = pageCopy[locale].service;
  return (
    <Chapter id="visit" label={t.visitLabel} page={page} total={total} title={t.visitTitle} lead={t.visitLead} tone="bright">
      <div className="rd-visit">
        <ReelCards locale={locale} tag="visit" />
        <ul className="rd-visit__perks">
          {t.visitPerks.map((p) => (
            <li key={p.title}><strong>{p.title}</strong><span>{p.text}</span></li>
          ))}
        </ul>
        <div className="rd-tour__links">
          <a className="btn btn--primary" href={brand.social.clientVisits} target="_blank" rel="noopener noreferrer">
            <FacebookIcon /> {t.visitsCta}
          </a>
          <a className="btn btn--secondary" href={brand.virtualTour} target="_blank" rel="noopener noreferrer">{t.virtualCta}</a>
          <Link className="link-arrow" to={href(locale, "contact")}>{t.bookCta}</Link>
        </div>
        <p className="t-caption">{t.photoNote}</p>
      </div>
    </Chapter>
  );
}

/** Facebook reels as link cards (open on Facebook in a new tab). */
function ReelCards({ locale, tag }: { locale: Locale; tag: "visit" | "factory" }) {
  const watch = zh(locale) ? "在 Facebook 观看" : "Watch on Facebook";
  return (
    <ul className="rd-reelcards">
      {reelsFor(tag).map((r) => (
        <li key={r.id}>
          <a href={reelUrl(r.id)} target="_blank" rel="noopener noreferrer" className="rd-reelcard">
            <span className="rd-reelcard__media"><img src={reelCover(r.id)} alt={reelTitle(r, locale)} loading="lazy" width={540} height={960} /><i aria-hidden="true">▶</i></span>
            <strong>{reelTitle(r, locale)}</strong>
            <span className="rd-reelcard__cta"><FacebookIcon /> {watch}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/* ── Projects ────────────────────────────────────────────── */
const reelFiles = ["reel-storage", "reel-glass-detail", "reel-window", "reel-wall-panel-detail"];

export function ProjectsRedesignPage({ locale }: { locale: Locale }) {
  const c = pageCopy[locale];
  const t = c.projects;
  return (
    <div className="pk-page">
      <LocalNav
        title={t.title}
        links={[
          ...projectSpaces.slice(0, 4).map((s) => ({ id: s.id, label: s.name[locale] })),
          { id: "films", label: t.filmsLabel },
          { id: "visit", label: c.service.visitLabel },
          ...(inspirationEnabled ? [{ id: "inspiration", label: zh(locale) ? "灵感项目" : "Inspiration" }] : []),
        ]}
      />
      <PageHero eyebrow={t.eyebrow} title={t.title} lead={t.lead} photo="r109" alt={t.heroAlt} caption={t.heroCaption} />

      <Chapter label={t.introLabel} page={1} total={3} title={t.introTitle} lead={t.introLead}>
        <dl className="rd-facts">
          {t.facts.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
      </Chapter>

      <Chapter label={t.spacesLabel} page={2} total={3} title={zh(locale) ? "七个空间。" : "Seven spaces."} tone="bright">
        {projectSpaces.map((s) => {
          const shots: Photo[] = byGroup(s.id);
          const copy = t.spaces[s.id];
          return (
            <div key={s.id} id={s.id} className="rd-space">
              <div className="rd-space__head">
                <h3>{copy.title}</h3>
                <p>{copy.text}</p>
                <span className="rd-space__count">{String(shots.length).padStart(2, "0")} {zh(locale) ? "张" : "photos"}</span>
              </div>
              <PhotoMasonry photos={shots} caption={() => `${copy.title} · ${t.title}`} />
            </div>
          );
        })}
      </Chapter>

      <Chapter id="films" label={t.filmsLabel} page={3} total={3} title={t.filmsTitle} lead={t.filmsLead} tone="ink">
        <div className="rd-reels">
          {reelFiles.map((n, i) => (
            <figure key={n} className="rd-reel">
              <LoopVideo className="rd-video" src={`/media/video/${n}.mp4`} poster={`/media/video/${n}.webp`} label={t.reels[i]} pauseLabel="Pause" playLabel="Play" />
              <figcaption>{t.reels[i]}</figcaption>
            </figure>
          ))}
        </div>
        <p className="t-caption rd-dark-caption">{c.common.musicCredit}</p>
      </Chapter>

      <ClientVisits locale={locale} page={4} total={4} />

      {inspirationEnabled && <InspirationGrid locale={locale} />}

      <CTABand title={t.ctaTitle} lead={t.ctaLead} primary={{ to: href(locale, "contact"), label: c.common.discuss }} locale={locale} />
    </div>
  );
}

/* ── About ───────────────────────────────────────────────── */
export function AboutPage({ locale }: { locale: Locale }) {
  const c = pageCopy[locale];
  const t = c.about;
  return (
    <div className="pk-page">
      <LocalNav
        title={zh(locale) ? "关于" : "About"}
        links={[
          { id: "brand", label: t.storyLabel },
          { id: "principles", label: t.principlesLabel },
          { id: "made", label: t.buildLabel },
          { id: "team", label: t.teamLabel },
        ]}
      />
      <PageHero eyebrow={t.eyebrow} title={t.title} lead={t.lead} photo="r120" alt={t.heroAlt} caption={c.common.completed} />

      <Chapter id="brand" label={t.storyLabel} page={1} total={5} title={t.storyTitle} lead={t.storyLead}>
        <ol className="rd-pillars">
          {t.pillars.map((p, i) => <li key={p}><span>{String(i + 1).padStart(2, "0")}</span>{p}</li>)}
        </ol>
      </Chapter>

      <Chapter id="principles" label={t.principlesLabel} page={2} total={5} title={t.principlesTitle} lead={t.principlesLead} tone="ink">
        <FeatureCards dark items={t.principles.map((p) => ({ kicker: p.kicker, title: p.title, text: p.text }))} />
      </Chapter>

      <Chapter id="made" label={t.buildLabel} page={3} total={5} title={t.buildTitle} lead={t.buildLead} tone="bright">
        <SplitRow media={<LoopVideo className="rd-video" src="/media/video/res-storage-wall.mp4" poster="/media/video/res-storage-wall.webp" label={t.heroAlt} pauseLabel="Pause" playLabel="Play" />}>
          <p className="t-eyebrow">{c.common.completed}</p>
          <h3>{c.projects.title}</h3>
          <p>{c.projects.lead}</p>
          <Link className="link-arrow" to={href(locale, "manufacturing")}>{t.buildCta}</Link>
          <br />
          <Link className="link-arrow" to={href(locale, "projects")}>{c.common.learn}</Link>
        </SplitRow>
      </Chapter>

      <Chapter label={t.supportLabel} page={4} total={5} title={t.supportTitle} lead={t.supportLead}>
        <ul className="rd-serve">{t.serve.map((s) => <li key={s}>{s}</li>)}</ul>
        <Link className="link-arrow" to={href(locale, "service")}>{t.supportCta}</Link>
      </Chapter>

      <Chapter id="team" label={t.teamLabel} page={5} total={5} title={t.teamTitle} lead={t.teamLead} tone="bright">
        <PhotoMasonry
          photos={[...byGroup("team"), ...pick("m03", "m04", "m05", "f012", "m02", "m07")]}
          caption={() => (zh(locale) ? "CIRMANO 团队与工厂 · 佛山" : "CIRMANO team and workshop, Foshan")}
        />
        <p className="rd-closing"><strong>{t.closing[0]}</strong><br />{t.closing[1]}</p>
        <div className="rd-credits-wrap">
          <p className="t-eyebrow">{t.creditsLabel}</p>
          <ul className="rd-credits">{t.credits.map((cr) => <li key={cr}>{cr}</li>)}</ul>
        </div>
      </Chapter>

      <CTABand title={t.ctaTitle} lead={t.ctaLead} primary={{ to: href(locale, "contact"), label: c.common.discuss }} locale={locale} />
    </div>
  );
}

/* ── Contact ─────────────────────────────────────────────── */
export function ContactPage({ locale }: { locale: Locale }) {
  const c = pageCopy[locale];
  const t = c.contact;
  return (
    <div className="pk-page">
      <PageHero
        eyebrow={t.eyebrow}
        title={t.title}
        lead={t.lead}
        photo="/media/brand/cirmano-contact-hero.webp"
        alt={zh(locale) ? "设计师与客户在桌面上核对户型图与材质样板" : "Designer and client reviewing a floor plan and material samples at a table"}
      />
      <section className="pk-chapter">
        <div className="pk-chapter__in rd-contact">
          <aside>
            <p className="t-eyebrow rd-contact__label">{t.directLabel}</p>
            <dl className="rd-direct">
              <div><dt>{t.whatsapp}</dt><dd><a href={brand.whatsapp} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={16} /> {brand.phoneDisplay}</a></dd></div>
              <div><dt>{t.email}</dt><dd><a href={`mailto:${brand.email}`}>{brand.email}</a></dd></div>
              <div><dt>{t.phone}</dt><dd><a href={brand.phoneHref} dir="ltr">{brand.phoneDisplay}</a></dd></div>
              <div><dt>{t.address}</dt><dd>{brand.address.join(" ")}</dd></div>
              <div>
                <dt>{t.follow}</dt>
                <dd className="rd-social">
                  <a href={brand.social.instagram} target="_blank" rel="noopener noreferrer"><InstagramIcon size={16} />Instagram</a>
                  <a href={brand.social.facebook} target="_blank" rel="noopener noreferrer"><FacebookIcon size={16} />Facebook</a>
                </dd>
              </div>
            </dl>
            <p className="t-eyebrow rd-contact__label">{t.stepsLabel}</p>
            <ol className="rd-steps">
              {t.steps.map((s) => (
                <li key={s.title}><div><strong>{s.title}</strong><p>{s.text}</p></div></li>
              ))}
            </ol>
          </aside>
          <div className="rd-form">
            <p className="t-eyebrow">{t.formLabel}</p>
            <h2>{t.formTitle}</h2>
            <p>{t.formLead}</p>
            <div className="rd-form__quote">
              <QuotePage locale={locale} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
