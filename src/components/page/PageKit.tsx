import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { brand } from "../../site/brand";
import { src, type Photo } from "../../site/photos";
import Magnet from "../bits/Magnet";
import Masonry, { type MasonryItem } from "../bits/Masonry";
import Noise from "../bits/Noise";
import ScrollExpand from "../bits/ScrollExpand";
import ScrollReveal from "../bits/ScrollReveal";
import SplitText from "../bits/SplitText";
import SpotlightCard from "../bits/SpotlightCard";
import { SectionHead } from "../motion/SectionHead";
import { WhatsAppIcon } from "../nav/SocialIcons";
import "./PageKit.css";

// Shared building blocks for the inner pages. Motion comes from React Bits (MIT + Commons Clause, see
// src/components/bits/LICENSE.md), tuned to the design system: one ease, slow, no bounce, Ink/Bone/Brass only.

const EASE = "expo.out";

/** Large headline that rises word by word (SplitText). */
export function Headline({ text, tag = "h2", className = "" }: { text: string; tag?: "h1" | "h2" | "h3"; className?: string }) {
  return (
    <SplitText
      text={text}
      tag={tag}
      className={`pk-headline ${className}`}
      splitType="words"
      effect="rise"
      mask
      delay={60}
      duration={1.1}
      ease={EASE}
      textAlign="start"
    />
  );
}

/** Page opening: copy, then a photo that grows from a framed print to full bleed as you scroll (ScrollExpand). */
/** Click-to-play YouTube video. Playing opens the video on youtube.com in a new tab: an embedded player
 *  cannot keep a YouTube sign-in (third-party cookies), so the login would not stick and playback would stall. */
function HeroVideo({ youtubeId, title, poster, caption, watchLabel }: { youtubeId: string; title: string; poster: string; caption?: string; watchLabel?: string }) {
  return (
    <figure className="pk-hero__video-wrap">
      <div className="pk-hero__video">
        <button
          type="button"
          className="pk-hero__play"
          onClick={() => window.open(`https://www.youtube.com/watch?v=${youtubeId}`, "_blank", "noopener,noreferrer")}
          aria-label={`Play video: ${title}`}
        >
          <img src={poster} alt="" />
          <span className="pk-hero__play-btn" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 5.5v13l11-6.5z" fill="currentColor" /></svg>
          </span>
        </button>
      </div>
      {caption && <figcaption className="pk-hero__caption-line">{caption}</figcaption>}
      {watchLabel && (
        <a className="pk-hero__watch" href={`https://www.youtube.com/watch?v=${youtubeId}`} target="_blank" rel="noopener noreferrer">
          {watchLabel}
        </a>
      )}
    </figure>
  );
}

export function PageHero({
  eyebrow,
  title,
  lead,
  photo,
  alt,
  caption,
  video,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  photo: Photo | string;
  alt: string;
  caption?: string;
  /** When set, the hero shows this YouTube video (click to play) instead of the expanding photo. */
  video?: { youtubeId: string; title: string; watchLabel?: string };
  children?: ReactNode;
}) {
  return (
    <header className="pk-hero">
      <div className="pk-hero__copy">
        <p className="t-eyebrow pk-hero__eyebrow">{eyebrow}</p>
        <Headline text={title} tag="h1" className="pk-hero__title" />
        <p className="t-lead pk-hero__lead">{lead}</p>
        {children}
      </div>
      {video ? (
        <div className="pk-hero__media pk-hero__media--video">
          <HeroVideo youtubeId={video.youtubeId} title={video.title} poster={src(photo, "l")} caption={caption} watchLabel={video.watchLabel} />
        </div>
      ) : (
      <ScrollExpand
        className="pk-hero__media"
        src={src(photo, "l")}
        alt={alt}
        useWindowScroll
        startWidth={62}
        startHeight={64}
        startRadius={20}
        endRadius={0}
        mediaZoom={1.15}
        scrollDistance={0.9}
        holdDistance={0.15}
        overlayScrim={0.25}
      >
        {caption && <p className="pk-hero__caption">{caption}</p>}
      </ScrollExpand>
      )}
    </header>
  );
}

/**
 * In-page section links, docked under the global bar. One strip only: the page name already sits in the
 * global menu (active item), and the global CTA is already in the bar, so neither is repeated here.
 * The current section is highlighted as you scroll.
 */
export function LocalNav({ title, links }: { title: string; links: { id: string; label: string }[] }) {
  const ids = links.map((l) => l.id);
  const key = ids.join("|");
  const [active, setActive] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    const targets = key.split("|").map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!targets.length) return;
    let frame = 0;
    // The current section is the last one whose top has passed a line 35% down the viewport.
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.35;
      let current = targets[0].id;
      for (const el of targets) if (el.getBoundingClientRect().top <= line) current = el.id;
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [key]);

  return (
    <nav className="pk-local" aria-label={title}>
      <div className="pk-local__in">
        <div className="pk-local__links">
          {links.map((l) => (
            <a key={l.id} href={`#${l.id}`} aria-current={active === l.id ? "true" : undefined} onClick={() => setActive(l.id)}>
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

/** A chapter: brand-card head, rising headline, blur-to-sharp lead (ScrollReveal). */
export function Chapter({
  id,
  label,
  page,
  total,
  title,
  lead,
  tone = "bone",
  children,
  wide = false,
}: {
  id?: string;
  label: string;
  page: number;
  total: number;
  title: string;
  lead?: string;
  tone?: "bone" | "bright" | "ink";
  children?: ReactNode;
  wide?: boolean;
}) {
  return (
    <section id={id} className={`pk-chapter pk-chapter--${tone}`}>
      {tone === "ink" && <Noise className="pk-grain" />}
      <div className="pk-chapter__in">
        <SectionHead label={label} page={page} total={total} />
        <Headline text={title} className="pk-chapter__title" />
        {lead && (
          <ScrollReveal
            baseOpacity={0.12}
            enableBlur
            blurStrength={6}
            baseRotation={0}
            containerClassName="pk-reveal"
            textClassName="pk-reveal__text"
          >
            {lead}
          </ScrollReveal>
        )}
      </div>
      {children && <div className={`pk-chapter__body ${wide ? "is-wide" : ""}`}>{children}</div>}
    </section>
  );
}

/** Cards with a brass spotlight that follows the pointer (SpotlightCard). */
export function FeatureCards({ items, dark = false }: { items: { kicker?: string; title: string; text?: string; list?: string[] }[]; dark?: boolean }) {
  return (
    <ul className={`pk-cards ${dark ? "is-dark" : ""}`}>
      {items.map((it, i) => (
        <li key={it.title}>
          <SpotlightCard className="pk-card" spotlightColor="rgba(176, 141, 87, 0.22)" theme={dark ? "dark" : "light"} intensity={0.9} spotlightSize={420} grain={0}>
            <span className="pk-card__no">{it.kicker ?? String(i + 1).padStart(2, "0")}</span>
            <strong className="pk-card__title">{it.title}</strong>
            {it.text && <p className="pk-card__text">{it.text}</p>}
            {it.list && (
              <ul className="pk-card__list">
                {it.list.map((l) => <li key={l}>{l}</li>)}
              </ul>
            )}
          </SpotlightCard>
        </li>
      ))}
    </ul>
  );
}

/** Waterfall gallery with lightbox (Masonry). */
export function PhotoMasonry({ photos, caption, columns = "auto" }: { photos: Photo[]; caption: (p: Photo, i: number) => string; columns?: "auto" | number }) {
  const items: MasonryItem[] = photos.map((p, i) => ({
    id: p.id,
    img: src(p, "m"),
    width: p.w,
    height: p.h,
    title: caption(p, i),
    alt: caption(p, i),
  }));
  return (
    <div className="pk-masonry">
      <Masonry
        items={items}
        columns={columns}
        columnWidth={340}
        gap={16}
        radius={16}
        animateFrom="bottom"
        blurToFocus
        revealOnScroll
        hoverEffect="zoom"
        captions="hover"
        lightbox
        stagger={0.05}
        duration={0.9}
        bounce={0}
      />
    </div>
  );
}

/** Closing band: Ink ground, film grain, magnetic buttons. */
export function CTABand({ title, lead, primary, locale }: { title: string; lead: string; primary: { to: string; label: string }; locale: string }) {
  return (
    <section className="pk-cta">
      <Noise className="pk-grain" />
      <div className="pk-cta__in">
        <Headline text={title} className="pk-cta__title" />
        <p className="t-lead pk-cta__lead">{lead}</p>
        <div className="pk-cta__actions">
          <Magnet padding={60} magnetStrength={4}>
            <Link className="btn btn--primary btn--on-ink" to={primary.to}>{primary.label}</Link>
          </Magnet>
          <Magnet padding={60} magnetStrength={4}>
            <a className="btn btn--secondary btn--on-ink" href={brand.whatsapp} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon size={18} />WhatsApp
            </a>
          </Magnet>
        </div>
        <p className="pk-cta__direct" data-locale={locale}>
          <a href={`mailto:${brand.email}`}>{brand.email}</a>
          <a href={brand.phoneHref} dir="ltr">{brand.phoneDisplay}</a>
          <span>{brand.city}</span>
        </p>
      </div>
    </section>
  );
}

/** Media + text row, alternating sides. */
export function SplitRow({ media, children, flip = false }: { media: ReactNode; children: ReactNode; flip?: boolean }) {
  return (
    <div className={`pk-row ${flip ? "is-flip" : ""}`}>
      <div className="pk-row__media">{media}</div>
      <div className="pk-row__text">{children}</div>
    </div>
  );
}
