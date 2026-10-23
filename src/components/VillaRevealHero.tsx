import { ArrowUpRight, MoveUpRight, Sun, Moon } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Link } from "react-router-dom";
import { type Locale } from "../content";
import "./VillaRevealHero.css";

const scenes = ["travertine", "walnut", "pearl"] as const;
const words = {
  zh: { eyebrow: "CIRMANO 西尔曼 · 全屋定制", title: ["一体成就", "完整空间"], intro: "从空间的留白，到生活的质感。", detail: "为别墅与高端住宅，定制彼此协调的每一处。", cta: "探索全屋定制", hint: "移动鼠标，点亮家的想象", touch: "轻触或横向拖动，探索空间", finishes: "材质表达", names: ["暖石", "胡桃木", "珍珠灰"], full: "看完整效果", bare: "回到清水房", concept: "别墅客厅 · 概念设计", error: "图片暂未加载，请刷新重试", alt: "夜色中的挑高别墅清水客厅，移动光圈可查看装修后的空间" },
  en: { eyebrow: "CIRMANO · WHOLE-HOME CUSTOMIZATION", title: ["Made", "As One."], intro: "From a quiet space to a considered home.", detail: "Every material. Every detail. Beautifully together.", cta: "Explore our collections", hint: "Move to reveal a new way of living", touch: "Touch or drag sideways to explore", finishes: "Material studies", names: ["Travertine", "Walnut", "Pearl"], full: "View the finished space", bare: "Back to the beginning", concept: "Villa living · Design concept", error: "Image unavailable. Please refresh to try again.", alt: "An unfinished double-height villa at night. A moving circle reveals its furnished interior." },
  ar: { eyebrow: "CIRMANO · تخصيص متكامل للمنزل", title: ["صُنع", "ككلّ واحد"], intro: "من مساحة هادئة إلى منزل متكامل.", detail: "مواد وتفاصيل تتناغم في كل ركن من منزلك.", cta: "استكشف مجموعاتنا", hint: "حرّك المؤشر لتكتشف شكل الحياة", touch: "المس أو اسحب أفقياً لاستكشاف المساحة", finishes: "تنويعات المواد", names: ["ترافرتين", "جوز", "لؤلؤي"], full: "شاهد المساحة المكتملة", bare: "العودة إلى البداية", concept: "غرفة معيشة فيلا · تصور تصميمي", error: "تعذر تحميل الصورة. يرجى تحديث الصفحة.", alt: "غرفة معيشة فيلا غير مكتملة ليلاً. تكشف دائرة متحركة عن المساحة المفروشة." },
  de: { eyebrow: "CIRMANO · GANZHEITLICHE RAUMKONZEPTE", title: ["Aus einem", "Guss."], intro: "Aus einem Raum wird ein Zuhause.", detail: "Material, Proportion und Detail. Im Einklang.", cta: "Kollektionen entdecken", hint: "Bewegen und neues Wohnen entdecken", touch: "Berühren oder seitlich ziehen", finishes: "Materialwelten", names: ["Travertin", "Nussbaum", "Perlgrau"], full: "Fertigen Raum ansehen", bare: "Zurück zum Anfang", concept: "Villa · Designkonzept", error: "Bild nicht verfügbar. Bitte Seite neu laden.", alt: "Ein unausgebauter Villenwohnraum bei Nacht. Ein beweglicher Kreis zeigt die Einrichtung." },
  fr: { eyebrow: "CIRMANO · AMÉNAGEMENT SUR MESURE", title: ["Pensé", "comme un tout."], intro: "D’un espace à un lieu de vie.", detail: "Matières, proportions et détails en harmonie.", cta: "Découvrir les collections", hint: "Déplacez le curseur, révélez votre intérieur", touch: "Touchez ou glissez horizontalement", finishes: "Expressions de matières", names: ["Travertin", "Noyer", "Perle"], full: "Voir l’espace aménagé", bare: "Revenir à l’essentiel", concept: "Salon de villa · Concept de design", error: "Image indisponible. Veuillez actualiser la page.", alt: "Un salon de villa brut à la nuit tombée. Un cercle mobile révèle son aménagement." },
};

export default function VillaRevealHero({ locale }: { locale: Locale }) {
  const text = words[locale];
  const root = useRef<HTMLElement>(null);
  const frame = useRef<number>();
  const point = useRef({ x: 0, y: 0 });
  const [selected, setSelected] = useState(0);
  const [loaded, setLoaded] = useState<boolean[]>([false, false, false]);
  const [failed, setFailed] = useState<boolean[]>([false, false, false]);
  const [active, setActive] = useState(false);
  const [full, setFull] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    // SSR images may already be in the browser cache before hydration attaches events.
    const images = root.current?.querySelectorAll<HTMLImageElement>(".villa-hero__finished");
    if (images) setLoaded(Array.from(images, (image) => image.complete && image.naturalWidth > 0));
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(media.matches);
    update();
    media.addEventListener("change", update);
    return () => {
      media.removeEventListener("change", update);
      if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    };
  }, []);

  const hide = () => setActive(false);
  const move = (event: PointerEvent<HTMLElement>) => {
    if (full || reduce || (event.target as Element).closest("a, button")) return;
    const rect = event.currentTarget.getBoundingClientRect();
    point.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    setActive(true);
    // At most one paint per frame; no animation loop runs while the pointer is still.
    if (frame.current === undefined) {
      frame.current = requestAnimationFrame(() => {
        root.current?.style.setProperty("--reveal-x", `${point.current.x}px`);
        root.current?.style.setProperty("--reveal-y", `${point.current.y}px`);
        frame.current = undefined;
      });
    }
  };

  const ready = loaded[selected] && !failed[selected];
  return (
    <section
      ref={root}
      className={`villa-hero villa-hero--${locale}`}
      data-revealing={active && ready && !reduce}
      data-full={full && ready}
      onPointerMove={move}
      onPointerDown={move}
      onPointerLeave={hide}
      onPointerCancel={hide}
      onPointerUp={(event) => { if (event.pointerType !== "mouse") hide(); }}
      onKeyDown={(event) => { if (event.key === "Escape") { setFull(false); hide(); } }}
      aria-labelledby="villa-hero-title"
    >
      <img className="villa-hero__image villa-hero__shell" src="/media/cirmano-villa-night.webp" width="1672" height="941" alt={text.alt} {...{ fetchpriority: "high" }} />
      <div className="villa-hero__reveal" aria-hidden="true">
        {scenes.map((scene, index) => (
          <img key={scene} className="villa-hero__image villa-hero__finished" data-selected={selected === index} src={`/media/cirmano-villa-${scene}.webp`} width="1672" height="941" alt="" decoding="async" {...{ fetchpriority: index === 0 ? "high" : "low" }}
            onLoad={() => setLoaded((value) => value.map((item, i) => i === index ? true : item))}
            onError={() => setFailed((value) => value.map((item, i) => i === index ? true : item))} />
        ))}
      </div>
      <div className="villa-hero__halo" aria-hidden="true" />
      <div className="villa-hero__shade" aria-hidden="true" />
      <div className="villa-hero__body">
        <p className="villa-hero__eyebrow">{text.eyebrow}</p>
        <h1 id="villa-hero-title"><span>{text.title[0]}</span><span>{text.title[1]}</span></h1>
        <div className="villa-hero__description"><p>{text.intro}</p><p>{text.detail}</p></div>
        <Link className="villa-hero__link" to={`/${locale}/collections`}>{text.cta}<ArrowUpRight size={18} aria-hidden="true" /></Link>
      </div>
      <div className="villa-hero__invitation" aria-hidden="true">
        <span className="villa-hero__point"><MoveUpRight size={15} /></span>
        <span className="villa-hero__mouse-hint">{text.hint}</span><span className="villa-hero__touch-hint">{text.touch}</span>
      </div>
      <div className="villa-hero__footer">
        <div className="villa-hero__materials" role="group" aria-label={text.finishes}>
          <span className="villa-hero__materials-label">{text.finishes}</span>
          <div className="villa-hero__swatches">
            {scenes.map((scene, index) => <button key={scene} type="button" aria-pressed={selected === index} disabled={!loaded[index] || failed[index]} onClick={() => setSelected(index)}><i className={`villa-hero__swatch villa-hero__swatch--${scene}`} aria-hidden="true" /><span>{text.names[index]}</span></button>)}
          </div>
        </div>
        <div className="villa-hero__view">
          <button type="button" disabled={!ready} aria-pressed={full} onClick={() => { setFull((value) => !value); hide(); }}>{full ? <Moon size={16} aria-hidden="true" /> : <Sun size={16} aria-hidden="true" />}{full ? text.bare : text.full}<ArrowUpRight size={16} aria-hidden="true" /></button>
          <span>{text.concept}</span>
        </div>
      </div>
      {failed[selected] && <p className="villa-hero__error" role="status">{text.error}</p>}
    </section>
  );
}
