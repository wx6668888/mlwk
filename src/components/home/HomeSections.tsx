import { ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { localeMeta, type Locale } from "../../content";
import { brand } from "../../site/brand";
import type { HomeCopy } from "../../site/homeCopy";
import { productCategories, projectSpaces } from "../../site/navigation";
import { photo, photoSrcSet, projectGallery } from "../../site/projectGallery";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "../nav/SocialIcons";
import { InkFill } from "../motion/InkFill";
import { LoopVideo } from "../motion/LoopVideo";
import { MaskLines } from "../motion/MaskLines";
import { Rise } from "../motion/Rise";
import { SectionHead } from "../motion/SectionHead";
import { useInView } from "../motion/useInView";
import { useScrollProgress } from "../motion/useScrollProgress";

type P = { locale: Locale; t: HomeCopy };
const href = (locale: Locale, to: string) => `/${locale}/${to}`;

/* 01 · Hero (photographic version; the 3D drawing stage mounts on top of this in step 4) */
export function HomeHero({ locale, t }: P) {
  return (
    <section className="hh" aria-labelledby="hh-title">
      <div className="hh__media">
        <img
          className="hh__img"
          src={photo("r109", 1600)}
          srcSet={photoSrcSet("r109", true)}
          sizes="100vw"
          alt=""
          width={1600}
          height={1200}
          {...{ fetchpriority: "high" }}
        />
        <LoopVideo
          className="hh__video"
          src="/media/video/res-living-1920.mp4"
          srcSmall="/media/video/res-living-960.mp4"
          poster="/media/video/res-living-1920.webp"
          label={t.hero.videoLabel}
          pauseLabel={t.pause}
          playLabel={t.play}
          revealOnPlay
        />
      </div>
      <div className="hh__shade" aria-hidden="true" />
      <div className="hh__body">
        <p className="t-eyebrow hh__eyebrow">{t.hero.eyebrow}</p>
        <MaskLines as="h1" id="hh-title" className="t-hero hh__title" lines={["Made As One"]} delay={200} />
        <Rise delay={500}>
          <p className="t-lead hh__descriptor">{t.hero.descriptor}</p>
          <p className="hh__lead">{t.hero.lead}</p>
          <div className="hh__ctas">
            <Link className="btn btn--primary btn--on-ink" to={href(locale, "products")}>{t.hero.ctaProducts}</Link>
            <Link className="btn btn--secondary btn--on-ink" to={href(locale, "contact")}>{t.hero.ctaProject}</Link>
          </div>
        </Rise>
      </div>
      <p className="hh__tag">
        <span>{t.hero.tag}</span>
        <span className="ai-note">{t.aiNote}</span>
      </p>
    </section>
  );
}

/* 02 · Statement */
export function Statement({ t }: P) {
  return (
    <section className="hs hs--statement">
      <div className="hs__in">
        <SectionHead label={t.statement.label} page={2} />
        <InkFill className="hs__statement" text={t.statement.text} />
      </div>
    </section>
  );
}

/* 03 · Products rail */
export function ProductRail({ locale, t }: P) {
  const rail = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const rtl = localeMeta[locale].dir === "rtl";

  const update = () => {
    const el = rail.current;
    if (!el) return;
    const x = Math.abs(el.scrollLeft);
    setEdge({ start: x < 8, end: x + el.clientWidth > el.scrollWidth - 8 });
  };
  useEffect(update, []);
  const step = (dir: 1 | -1) => {
    const el = rail.current;
    const card = el?.querySelector("li");
    if (!el || !card) return;
    el.scrollBy({ left: dir * (rtl ? -1 : 1) * (card.getBoundingClientRect().width + 20), behavior: "smooth" });
  };

  return (
    <section className="hs hs--products" aria-labelledby="hp-title">
      <div className="hs__in">
        <SectionHead label={t.products.label} page={3} />
        <div className="hs__intro hs__intro--row">
          <div>
            <MaskLines id="hp-title" className="t-headline" lines={[t.products.title]} />
            <Rise as="p" className="t-lead hs__lead" delay={150}>{t.products.lead}</Rise>
          </div>
          <div className="rail__nav">
            <button type="button" aria-label={t.products.prev} disabled={edge.start} onClick={() => step(-1)}>{rtl ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}</button>
            <button type="button" aria-label={t.products.next} disabled={edge.end} onClick={() => step(1)}>{rtl ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}</button>
          </div>
        </div>
      </div>
      <ul className="rail" ref={rail} onScroll={update}>
        {productCategories.map((c, i) => (
          <Rise as="li" key={c.slug} delay={i * 60} className="rail__item">
            <Link className="pcard" to={href(locale, `products/${c.slug}`)}>
              <span className="pcard__media m-settle-wrap">
                <img className="m-settle is-in" src={c.image} alt="" loading="lazy" width={800} height={1422} />
              </span>
              <span className="pcard__body">
                <small>{c.code}</small>
                <strong className="t-title">{c.name[locale]}</strong>
                <span>{c.short[locale]}</span>
                <em className="link-arrow">{t.products.learn}</em>
              </span>
              <span className="pcard__cap">{c.caption[locale]}</span>
            </Link>
          </Rise>
        ))}
      </ul>
    </section>
  );
}

/* 04 · One language (pin & scrub) */
// Positions on the 16:9 crop of R119 (tea room): flush cabinets, lit oak shelving, oak tea table.
const hotspots = [
  { x: 62, y: 45 },
  { x: 34, y: 50 },
  { x: 24, y: 90 },
];
// Camera path through R119: wide → close-up on each hotspot (with a short hold) → back to wide.
// spot -1 = the whole room. Scale is the zoom on the photograph.
const cameraKeys: { at: number; spot: number; s: number }[] = [
  { at: 0, spot: -1, s: 1.06 },
  { at: 0.14, spot: 0, s: 2.35 },
  { at: 0.28, spot: 0, s: 2.45 },
  { at: 0.42, spot: 1, s: 2.3 },
  { at: 0.56, spot: 1, s: 2.4 },
  { at: 0.7, spot: 2, s: 2.25 },
  { at: 0.84, spot: 2, s: 2.35 },
  { at: 1, spot: -1, s: 1 },
];
const smooth = (x: number) => x * x * x * (x * (x * 6 - 15) + 10);

export function OneLanguage({ t, locale }: P) {
  const [ref, progress] = useScrollProgress<HTMLElement>({ mode: "pin" });
  const frame = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0, sw: 0, sh: 0 });
  const steps = t.language.steps;
  const active = progress < 0.35 ? 0 : progress < 0.63 ? 1 : 2;
  const rtl = localeMeta[locale].dir === "rtl";

  useEffect(() => {
    const el = frame.current;
    const stage = el?.parentElement;
    if (!el || !stage) return;
    const measure = () => setSize({ w: el.offsetWidth, h: el.offsetHeight, sw: stage.offsetWidth, sh: stage.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  // Where the camera is at this scroll position: zoom s and offset (tx, ty) from the stage centre.
  const camera = (() => {
    const { w, h, sw, sh } = size;
    if (!w) return { s: 1, tx: 0, ty: 0 };
    const pose = (k: { spot: number; s: number }) => {
      if (k.spot < 0) return { s: k.s, tx: 0, ty: 0 };
      const dx = (hotspots[k.spot].x / 100 - 0.5) * w;
      const dy = (hotspots[k.spot].y / 100 - 0.5) * h;
      // Close-ups sit in the open half of the stage, away from the copy column.
      const targetX = (rtl ? 0.18 : -0.18) * sw;
      let tx = targetX - k.s * dx;
      let ty = -k.s * dy;
      const mx = Math.max(0, (k.s * w - sw) / 2), my = Math.max(0, (k.s * h - sh) / 2);
      tx = Math.min(mx, Math.max(-mx, tx));
      ty = Math.min(my, Math.max(-my, ty));
      return { s: k.s, tx, ty };
    };
    let i = 0;
    while (i < cameraKeys.length - 2 && progress > cameraKeys[i + 1].at) i++;
    const a = cameraKeys[i], b = cameraKeys[i + 1];
    const u = smooth(Math.min(1, Math.max(0, (progress - a.at) / (b.at - a.at))));
    const pa = pose(a), pb = pose(b);
    return { s: pa.s + (pb.s - pa.s) * u, tx: pa.tx + (pb.tx - pa.tx) * u, ty: pa.ty + (pb.ty - pa.ty) * u };
  })();

  return (
    <section className="ol" ref={ref} aria-labelledby="ol-title" style={{ "--p": progress } as CSSProperties}>
      <div className="ol__stage">
        <div
          ref={frame}
          className="ol__frame"
          style={{ transform: `translate(-50%, -50%) translate(${camera.tx.toFixed(1)}px, ${camera.ty.toFixed(1)}px) scale(${camera.s.toFixed(4)})`, "--s": camera.s.toFixed(4) } as CSSProperties}
        >
          <img src={photo("r119", 2400)} srcSet={photoSrcSet("r119", true)} sizes="240vw" alt={t.language.imageAlt} loading="lazy" width={2400} height={1800} />
          {hotspots.map((h, i) => (
            <span key={i} className={`ol__spot ${i === active ? "is-active" : ""} ${i < active ? "is-past" : ""}`} style={{ left: `${h.x}%`, top: `${h.y}%` }} aria-hidden="true">
              <i />
              <b>{steps[i].name}</b>
            </span>
          ))}
        </div>
        <div className="ol__shade" aria-hidden="true" />
        <div className="ol__copy">
          <SectionHead label={t.language.label} page={4} />
          <h2 id="ol-title" className="t-headline">{t.language.title}</h2>
          <p className="t-lead ol__lead">{t.language.lead}</p>
          <ol className="ol__steps">
            {steps.map((s, i) => (
              <li key={s.name} className={i === active ? "is-active" : ""}>
                <span className="ol__num">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{s.name}</strong>
                  <p>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <p className="ol__tag">{t.language.tag}</p>
        <div className="ol__bar" aria-hidden="true"><i /></div>
      </div>
    </section>
  );
}

/* 05 · The detail */
// Slow camera moves over Guangzhou Residence close-ups (scripts/make_residence_clips.py): wardrobe line, oak grain, door lever, glass-front tall cabinet.
const detailClips = ["res-detail-line", "res-detail-oak", "res-detail-handle", "res-detail-glass"];
export function DetailGrid({ t }: P) {
  return (
    <section className="hs hs--detail" aria-labelledby="hd-title">
      <div className="hs__in">
        <SectionHead label={t.detail.label} page={5} />
        <div className="hs__intro">
          <MaskLines id="hd-title" className="t-headline" lines={[t.detail.title]} />
        </div>
        <ul className="detail">
          {t.detail.items.map((item, i) => (
            <Rise as="li" key={item.no} delay={i * 80} className="detail__item">
              <LoopVideo className="detail__media" src={`/media/video/${detailClips[i]}.mp4`} poster={`/media/video/${detailClips[i]}.webp`} label={item.title} pauseLabel={t.pause} playLabel={t.play} />
              <p className="detail__no">{item.no}</p>
              <h3 className="detail__title">{item.title}</h3>
              <p className="detail__text">{item.text}</p>
            </Rise>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* 06 · Manufacturing */
export function Manufacturing({ locale, t }: P) {
  return (
    <section className="hs hs--ink" aria-labelledby="hm-title">
      <div className="hs__in">
        <SectionHead label={t.manufacturing.label} page={6} />
        <div className="hs__intro">
          <MaskLines id="hm-title" className="t-headline" lines={[t.manufacturing.title]} />
          <Rise as="p" className="t-lead hs__lead" delay={150}>{t.manufacturing.lead}</Rise>
        </div>
        <Rise className="mf__film">
          <LoopVideo src="/media/video/manufacturing-film.mp4" poster="/media/video/manufacturing-film.webp" label={t.manufacturing.filmLabel} pauseLabel={t.pause} playLabel={t.play} />
          <p className="ai-note mf__note">{t.aiNote}</p>
        </Rise>
        <ul className="mf__facts">
          {t.manufacturing.facts.map((f, i) => (
            <Rise as="li" key={f.title} delay={i * 80}>
              <strong>{f.title}</strong>
              <p>{f.text}</p>
            </Rise>
          ))}
        </ul>
        <Link className="link-arrow link-arrow--on-ink" to={href(locale, "manufacturing")}>{t.manufacturing.cta}</Link>
      </div>
    </section>
  );
}

/* 07 · Guangzhou Residence */
export function ProjectSpaces({ locale, t }: P) {
  const [space, setSpace] = useState(projectSpaces[0].id);
  const photos = projectGallery[space];
  const name = projectSpaces.find((s) => s.id === space)!.name[locale];
  return (
    <section className="hs hs--project" aria-labelledby="hj-title">
      <div className="hs__in">
        <SectionHead label={t.project.label} page={7} />
        <div className="hs__intro hs__intro--row">
          <div>
            <MaskLines id="hj-title" className="t-headline" lines={[t.project.title]} />
            <Rise as="p" className="t-lead hs__lead" delay={150}>{t.project.lead}</Rise>
          </div>
          <Link className="link-arrow" to={href(locale, "projects")}>{t.project.cta}</Link>
        </div>
        <div className="pj__tabs" role="tablist" aria-label={t.project.title}>
          {projectSpaces.map((s) => (
            <button key={s.id} type="button" role="tab" aria-selected={s.id === space} aria-controls="pj-panel" onClick={() => setSpace(s.id)}>
              {s.name[locale]}
            </button>
          ))}
        </div>
        <div className="pj__gallery" id="pj-panel" role="tabpanel" key={space}>
          {photos.map((p, i) => (
            <figure key={p.id} className={`pj__fig pj__fig--${i === 0 ? "main" : "side"}`}>
              <img src={photo(p.id, p.landscape && i === 0 ? 1600 : 800)} srcSet={i === 0 ? photoSrcSet(p.id, p.landscape) : undefined} sizes={i === 0 ? "(max-width: 900px) 100vw, 66vw" : undefined} alt={`${name} · ${t.project.title}`} loading="lazy" />
            </figure>
          ))}
        </div>
        <p className="t-caption hs__note">{name} · {t.project.tag}</p>
      </div>
    </section>
  );
}

/* 08 · Principles */
export function Principles({ t }: P) {
  return (
    <section className="hs hs--principles" aria-labelledby="hr-title">
      <div className="hs__in">
        <SectionHead label={t.principles.label} page={8} />
        <div className="hs__intro">
          <MaskLines id="hr-title" className="t-headline" lines={[t.principles.title]} />
        </div>
        <ol className="pr">
          {t.principles.items.map((p, i) => (
            <Rise as="li" key={p.name} delay={i * 80}>
              <span className="pr__no">{String(i + 1).padStart(2, "0")} · {p.kicker}</span>
              <strong className="pr__name">{p.name}</strong>
              <p>{p.text}</p>
            </Rise>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* 09 · Follow (vertical films with their CC BY music) */
const reels = ["reel-storage", "reel-glass-detail", "reel-window", "reel-wall-panel-detail"];
function ReelCard({ name, label, t }: { name: string; label: string; t: HomeCopy }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [ref, inView] = useInView<HTMLLIElement>({ once: false, threshold: 0 });
  useEffect(() => {
    if (!inView) video.current?.pause();
  }, [inView]);
  const toggle = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => undefined);
    else el.pause();
  };
  return (
    <li ref={ref} className="reel" onMouseEnter={() => video.current?.play().catch(() => undefined)} onMouseLeave={() => video.current?.pause()}>
      <video ref={video} src={`/media/video/${name}.mp4`} poster={`/media/video/${name}.webp`} muted={muted} loop playsInline preload="none" aria-label={label} onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)} onClick={toggle} />
      <div className="reel__bar">
        <span>{label}</span>
        <button type="button" aria-label={muted ? t.unmute : t.mute} onClick={() => setMuted((m) => !m)}>
          {muted ? <VolumeX size={16} aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}
        </button>
      </div>
      <button type="button" className="reel__play" aria-label={playing ? t.pause : t.play} onClick={toggle} data-playing={playing || undefined} />
    </li>
  );
}
export function Follow({ t }: P) {
  return (
    <section className="hs hs--follow" aria-labelledby="hf-title">
      <div className="hs__in">
        <SectionHead label={t.follow.label} page={9} />
        <div className="hs__intro hs__intro--row">
          <div>
            <MaskLines id="hf-title" className="t-headline" lines={[t.follow.title]} />
            <Rise as="p" className="t-lead hs__lead" delay={150}>{t.follow.lead}</Rise>
          </div>
          <div className="fl__social">
            <a className="btn btn--secondary" href={brand.social.instagram} target="_blank" rel="noopener noreferrer"><InstagramIcon size={18} />Instagram</a>
            <a className="btn btn--secondary" href={brand.social.facebook} target="_blank" rel="noopener noreferrer"><FacebookIcon size={18} />Facebook</a>
          </div>
        </div>
        <ul className="reels">
          {reels.map((name, i) => (
            <ReelCard key={name} name={name} label={t.follow.reels[i]} t={t} />
          ))}
        </ul>
        <p className="t-caption hs__note">
          {t.follow.credit} ·{" "}
          <a href="https://www.scottbuckley.com.au/library/sleep/" target="_blank" rel="noopener noreferrer">scottbuckley.com.au</a> ·{" "}
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>
        </p>
      </div>
    </section>
  );
}

/* 10 · Contact */
export function ContactCta({ locale, t }: P) {
  return (
    <section className="hs hs--contact" aria-labelledby="hc-title">
      <div className="hs__in">
        <SectionHead label={t.contact.label} page={10} />
        <MaskLines id="hc-title" className="t-hero hc__title" lines={[t.contact.title]} />
        <Rise as="p" className="t-lead hs__lead" delay={150}>{t.contact.lead}</Rise>
        <Rise className="hc__ctas" delay={250}>
          <Link className="btn btn--primary" to={href(locale, "contact")}>{t.contact.enquiry}</Link>
          <a className="btn btn--secondary" href={brand.whatsapp} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={18} />{t.contact.whatsapp}</a>
        </Rise>
        <Rise className="hc__direct" delay={350}>
          <a href={`mailto:${brand.email}`}>{brand.email}</a>
          <a href={brand.phoneHref} dir="ltr">{brand.phoneDisplay}</a>
          <span>{brand.city}</span>
        </Rise>
      </div>
    </section>
  );
}
