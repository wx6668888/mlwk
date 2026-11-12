import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { localeMeta, type Locale } from "../../content";
import {
  inspirationCopy,
  inspirationImage,
  inspirationProjects,
  projectTitle,
  tagLabels,
  type InspirationProject,
  type InspirationTag,
} from "../../site/inspiration";
import { MaskLines } from "../motion/MaskLines";
import { Rise } from "../motion/Rise";
import { SectionHead } from "../motion/SectionHead";
import "./Inspiration.css";

const href = (locale: Locale, to: string) => `/${locale}/${to}`;

/** The small label every inspiration image carries. */
export function InspoChip() {
  return <span className="inspo-chip">灵感项目 · Inspiration</span>;
}

function Cover({ p, locale }: { p: InspirationProject; locale: Locale }) {
  const t = inspirationCopy[locale];
  return (
    <Link className="inspo-card" to={href(locale, `projects/inspiration/${p.slug}`)}>
      <span className="inspo-card__media">
        <img src={inspirationImage(p.slug, 1)} alt="" loading="lazy" />
        <InspoChip />
      </span>
      <span className="inspo-card__body">
        <strong>{projectTitle(p, locale)}</strong>
        <small>
          {p.tags.map((tag) => tagLabels[tag][locale]).join(" · ") || t.label}
          {" · "}
          {p.images.length} {t.images}
        </small>
      </span>
    </Link>
  );
}

/** Home page rail (after the Guangzhou Residence chapter). */
export function InspirationRail({ locale }: { locale: Locale }) {
  const t = inspirationCopy[locale];
  return (
    <section className="inspo-rail" aria-labelledby="inspo-rail-title">
      <div className="inspo-rail__head">
        <div>
          <p className="t-eyebrow inspo-rail__eyebrow">{t.title}</p>
          <h3 id="inspo-rail-title" className="t-title">{t.lead}</h3>
          <p className="t-caption">{t.note}</p>
        </div>
        <Link className="link-arrow" to={href(locale, "projects#inspiration")}>{t.all}</Link>
      </div>
      <ul className="inspo-rail__list">
        {inspirationProjects.map((p) => (
          <li key={p.slug}>
            <Cover p={p} locale={locale} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Filterable grid on /projects. */
export function InspirationGrid({ locale }: { locale: Locale }) {
  const t = inspirationCopy[locale];
  const [tag, setTag] = useState<InspirationTag | "all">("all");
  const list = tag === "all" ? inspirationProjects : inspirationProjects.filter((p) => p.tags.includes(tag));
  return (
    <section className="inspo" id="inspiration" aria-labelledby="inspo-title">
      <div className="inspo__in">
        <SectionHead label={t.label} page={2} total={2} />
        <MaskLines id="inspo-title" className="t-headline inspo__title" lines={[t.title]} />
        <p className="t-lead inspo__lead">{t.lead}</p>
        <p className="t-caption inspo__note">{t.note}</p>
        <div className="inspo__filters" role="group" aria-label={t.title}>
          {(["all", "living", "wardrobes", "panels"] as const).map((k) => (
            <button key={k} type="button" aria-pressed={tag === k} onClick={() => setTag(k)}>
              {tagLabels[k][locale]}
            </button>
          ))}
        </div>
        <ul className="inspo__grid">
          {list.map((p, i) => (
            <Rise as="li" key={p.slug} delay={(i % 3) * 60}>
              <Cover p={p} locale={locale} />
            </Rise>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Detail page: /projects/inspiration/:slug */
export function InspirationProjectPage({ locale, slug }: { locale: Locale; slug: string }) {
  const t = inspirationCopy[locale];
  const p = inspirationProjects.find((x) => x.slug === slug);
  const [open, setOpen] = useState<number | null>(null);
  const rtl = localeMeta[locale].dir === "rtl";

  const step = useCallback(
    (d: 1 | -1) => setOpen((v) => (v === null || !p ? v : (v + d + p.images.length) % p.images.length)),
    [p],
  );
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(rtl ? -1 : 1);
      if (e.key === "ArrowLeft") step(rtl ? 1 : -1);
    };
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      root.style.overflow = prev;
    };
  }, [open, step, rtl]);

  if (!p) return <InspirationGrid locale={locale} />;
  const others = inspirationProjects.filter((x) => x.slug !== p.slug).slice(0, 6);

  return (
    <div className="inspo-page">
      <header className="inspo-page__head">
        <Link className="link-arrow inspo-page__back" to={href(locale, "projects#inspiration")}>{t.back}</Link>
        <p className="t-eyebrow">{t.title}</p>
        <MaskLines as="h1" className="t-headline" lines={[projectTitle(p, locale)]} />
        {locale !== "zh" && p.name !== p.en && <p className="t-caption">{p.name}</p>}
        <p className="inspo-page__tags">{p.tags.map((tag) => tagLabels[tag][locale]).join(" · ")}</p>
        <p className="t-caption inspo__note">{t.note}</p>
      </header>
      <ul className="inspo-page__gallery">
        {p.images.map((img, i) => (
          <Rise as="li" key={img.n} delay={(i % 2) * 60} className={img.landscape ? "is-wide" : "is-tall"}>
            <button type="button" className="inspo-page__img" aria-label={`${t.open} ${i + 1}`} onClick={() => setOpen(i)}>
              <img src={inspirationImage(p.slug, img.n, img.landscape ? 1600 : 800)} alt={`${projectTitle(p, locale)} ${i + 1}`} loading={i < 2 ? "eager" : "lazy"} width={img.w} height={img.h} />
              <InspoChip />
            </button>
          </Rise>
        ))}
      </ul>

      {others.length > 0 && (
        <section className="inspo-page__more">
          <p className="t-eyebrow">{t.title}</p>
          <ul className="inspo__grid inspo__grid--compact">
            {others.map((o) => (
              <li key={o.slug}>
                <Cover p={o} locale={locale} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {open !== null && (
        <div className="inspo-lightbox" role="dialog" aria-modal="true" aria-label={projectTitle(p, locale)} onClick={() => setOpen(null)}>
          <figure onClick={(e) => e.stopPropagation()}>
            <img src={inspirationImage(p.slug, p.images[open].n, 1600)} alt={`${projectTitle(p, locale)} ${open + 1}`} />
            <InspoChip />
            <figcaption>
              {projectTitle(p, locale)} · {open + 1} / {p.images.length}
            </figcaption>
          </figure>
          <button type="button" className="inspo-lightbox__close" aria-label={t.close} onClick={() => setOpen(null)}><X size={20} /></button>
          <button type="button" className="inspo-lightbox__nav is-prev" aria-label={t.prev} onClick={(e) => { e.stopPropagation(); step(-1); }}>{rtl ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}</button>
          <button type="button" className="inspo-lightbox__nav is-next" aria-label={t.next} onClick={(e) => { e.stopPropagation(); step(1); }}>{rtl ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}</button>
        </div>
      )}
    </div>
  );
}
