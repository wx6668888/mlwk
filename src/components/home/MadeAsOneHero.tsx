import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import type { Locale } from "../../content";
import type { HomeCopy } from "../../site/homeCopy";
import { setNavTone } from "../../site/navTone";
import { photo } from "../../site/projectGallery";
import type { HeroEngine } from "../../hero3d/engine";
import { LoopVideo } from "../motion/LoopVideo";
import { MaskLines } from "../motion/MaskLines";
import { useScrollProgress } from "../motion/useScrollProgress";
import { HomeHero } from "./HomeSections";
import "./MadeAsOneHero.css";

// 01 · Drawing → Model → Made.
// Desktop with WebGL: a developed-elevation drawing of the living room folds into a 3D room (flat-to-3d engine,
// MIT) and the camera walks in to the view of P179, where the stage dissolves into K01 footage of the real room.
// Phones, reduced motion, weak devices or no WebGL: the photographic hero (CSS decides first, JS confirms).

const win = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));

function canRun3D() {
  if (!window.matchMedia("(min-width: 900px)").matches) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const nav = navigator as Navigator & { deviceMemory?: number };
  if ((nav.deviceMemory ?? 8) < 4 || (nav.hardwareConcurrency ?? 8) < 4) return false;
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

export default function MadeAsOneHero({ locale, t }: { locale: Locale; t: HomeCopy }) {
  const [mode, setMode] = useState<"3d" | "photo">("3d");
  const [ready, setReady] = useState(false);
  const [section, progress] = useScrollProgress<HTMLElement>({ mode: "pin" });
  const canvas = useRef<HTMLCanvasElement>(null);
  const labels = useRef<HTMLDivElement>(null);
  const leaders = useRef<SVGSVGElement>(null);
  const engine = useRef<HeroEngine | null>(null);
  const [showFilm, setShowFilm] = useState(false);

  // Decide and mount once.
  useEffect(() => {
    if (!canRun3D()) {
      setMode("photo");
      return;
    }
    let cancelled = false;
    import("../../hero3d/engine.js")
      .then(({ mount }) => mount({ canvas: canvas.current!, labels: labels.current!, leaders: leaders.current! }))
      .then((e) => {
        if (cancelled) return e.destroy();
        engine.current = e;
        setReady(true);
      })
      .catch(() => !cancelled && setMode("photo"));
    return () => {
      cancelled = true;
      engine.current?.destroy();
      engine.current = null;
    };
  }, []);

  // Pause rendering while the hero is off screen (measured from layout, so a viewport change can't strand it).
  useEffect(() => {
    if (mode !== "3d") return;
    const check = () => {
      const r = section.current?.getBoundingClientRect();
      engine.current?.setActive(!!r && r.bottom > 0 && r.top < window.innerHeight);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [mode, ready, section]);

  useEffect(() => {
    engine.current?.setProgress(progress);
    if (progress > 0.8) setShowFilm(true);
  }, [progress, ready]);

  // The nav sits in ink on the paper, in bone once the room is lit and the film is up.
  const dark = mode === "photo" || progress > 0.7;
  useEffect(() => {
    setNavTone(dark ? "dark" : "light");
  }, [dark]);
  useEffect(() => () => setNavTone(null), []);

  const copyOut = win(progress, 0.3, 0.42);
  const film = win(progress, 0.9, 0.975);
  const final = win(progress, 0.94, 1);
  const stepIndex = progress < 0.56 ? 0 : progress < 0.9 ? 1 : 2;

  return (
    <div className="mh" data-mode={mode}>
      <section className="mh3d" ref={section} aria-labelledby="mh-title" style={{ "--film": film } as CSSProperties}>
        <div className="mh3d__stage">
          <canvas ref={canvas} className="mh3d__canvas" data-ready={ready || undefined} role="img" aria-label={t.stage.canvasLabel} />
          <svg ref={leaders} className="mh3d__leaders" aria-hidden="true" />
          <div ref={labels} className="mh3d__labels" aria-hidden="true" />

          <div className="mh3d__film" style={{ opacity: film }} aria-hidden={film < 0.5}>
            {showFilm && (
              <LoopVideo
                className="mh3d__video"
                src="/media/video/k01-p179-hero-1920.mp4"
                poster={photo("p179", 1600)}
                label={t.hero.videoLabel}
                pauseLabel={t.pause}
                playLabel={t.play}
              />
            )}
          </div>

          <div className="mh3d__copy" style={{ opacity: 1 - copyOut, transform: `translateY(${copyOut * -24}px)` }}>
            <p className="t-eyebrow mh3d__kicker">CIRMANO / {t.stage.kicker}</p>
            <MaskLines as="h1" id="mh-title" className="t-hero mh3d__title" lines={["Made As One"]} delay={300} />
            <p className="t-lead mh3d__descriptor">{t.hero.descriptor}</p>
            <p className="mh3d__lead">{t.hero.lead}</p>
            <p className="mh3d__hint" aria-hidden="true"><i />{t.stage.hint}</p>
          </div>

          <dl className="mh3d__block" style={{ opacity: 1 - copyOut }}>
            {t.stage.block.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>

          <ol className="mh3d__steps" data-dark={dark || undefined} style={{ opacity: 1 - film }} aria-hidden="true">
            {t.stage.steps.map((s, i) => (
              <li key={s} className={i === stepIndex ? "is-on" : i < stepIndex ? "is-past" : ""}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {s}
              </li>
            ))}
            <li className="mh3d__bar"><i style={{ transform: `scaleX(${progress})` }} /></li>
          </ol>

          <p className="mh3d__tag" data-dark={dark || undefined}>
            {film > 0.5 ? (
              <>
                <span>{t.hero.tag}</span>
                <span className="ai-note">{t.aiNote}</span>
              </>
            ) : (
              <span>{t.stage.drawingTag}</span>
            )}
          </p>

          <div className="mh3d__final" style={{ opacity: final, pointerEvents: final > 0.5 ? "auto" : "none" }} aria-hidden={final < 0.5}>
            <p className="t-title mh3d__final-title">{t.hero.descriptor}</p>
            <p className="mh3d__final-lead">{t.hero.lead}</p>
            <div className="mh3d__ctas">
              <Link className="btn btn--primary btn--on-ink" to={`/${locale}/products`} tabIndex={final > 0.5 ? 0 : -1}>{t.hero.ctaProducts}</Link>
              <Link className="btn btn--secondary btn--on-ink" to={`/${locale}/contact`} tabIndex={final > 0.5 ? 0 : -1}>{t.hero.ctaProject}</Link>
            </div>
          </div>
        </div>
      </section>
      <HomeHero locale={locale} t={t} />
    </div>
  );
}
