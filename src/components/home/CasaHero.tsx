import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "../../content";
import type { HomeCopy } from "../../site/homeCopy";
import { setNavTone } from "../../site/navTone";
import { setNavAutoHide } from "../../site/navVisibility";
import BrandLoader from "./BrandLoader";
import "./CasaHero.css";

// 01 · Hero: the full Casa Serra walkthrough, rebranded for CIRMANO and served from /casa/ (preview only).
// The page scroll drives the walkthrough inside a same-origin iframe; the brand loader covers the first load.
// Keep the walkthrough: retry its renderer on startup failures instead of skipping to a photo.

const LOAD_IDLE_LIMIT = 45_000;
// Extra scroll, in viewport heights, that holds the last scene before the page moves on.
const HOLD = 1.1;

type Stage = "assets" | "textures" | "materials" | "first-frame" | "retry" | "error";
const loaderLabels: Record<Locale, { loading: string; retry: string; place: string; stages: Record<Stage, string> }> = {
  en: { loading: "Loading the walkthrough", retry: "Retry 3D", place: "Foshan, China", stages: { assets: "Loading materials", textures: "Preparing textures", materials: "Preparing lighting and materials", "first-frame": "Rendering the opening view", retry: "Reinitializing the 3D view", error: "3D could not start. Check browser graphics acceleration, then retry." } },
  zh: { loading: "正在加载空间漫游", retry: "重新加载 3D", place: "中国 · 佛山", stages: { assets: "正在下载材质", textures: "正在准备贴图", materials: "正在准备灯光与材质", "first-frame": "正在绘制开场画面", retry: "正在重新初始化 3D", error: "3D 未能启动，请检查浏览器图形加速后重试。" } },
  de: { loading: "Rundgang wird geladen", retry: "3D erneut laden", place: "Foshan, China", stages: { assets: "Materialien werden geladen", textures: "Texturen werden vorbereitet", materials: "Licht und Materialien werden vorbereitet", "first-frame": "Eröffnungsansicht wird gerendert", retry: "3D wird neu initialisiert", error: "3D konnte nicht starten. Prüfen Sie die Grafikbeschleunigung und versuchen Sie es erneut." } },
  fr: { loading: "Chargement de la visite", retry: "Relancer la 3D", place: "Foshan, Chine", stages: { assets: "Chargement des matériaux", textures: "Préparation des textures", materials: "Préparation de la lumière et des matériaux", "first-frame": "Rendu de la vue initiale", retry: "Réinitialisation de la vue 3D", error: "La 3D n’a pas démarré. Vérifiez l’accélération graphique du navigateur, puis réessayez." } },
  ar: { loading: "جارٍ تحميل الجولة", retry: "إعادة تحميل 3D", place: "فوشان، الصين", stages: { assets: "جارٍ تحميل المواد", textures: "جارٍ إعداد القوام", materials: "جارٍ إعداد الإضاءة والمواد", "first-frame": "جارٍ عرض المشهد الأول", retry: "جارٍ تهيئة العرض ثلاثي الأبعاد", error: "تعذر بدء العرض. تحقق من تسريع الرسومات في المتصفح وحاول مجددًا." } },
};

export default function CasaHero({ locale, t }: { locale: Locale; t: HomeCopy }) {
  const [attempt, setAttempt] = useState(0);
  const [stage, setStage] = useState<Stage>("assets");
  const [counts, setCounts] = useState({ completed: 0, total: 0 });
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [height, setHeight] = useState<number | null>(null);
  const section = useRef<HTMLElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const tourReady = useRef(false);
  const [atEnd, setAtEnd] = useState(false);
  const [inHero, setInHero] = useState(true);

  const loaderDone = ready;
  const restart = () => { setReady(false); setProgress(0); setStage("retry"); setCounts({ completed: 0, total: 0 }); setAttempt((n) => n + 1); };

  // Capability check, then listen to the walkthrough.
  useEffect(() => {
    tourReady.current = false;
    let lastAdvance = performance.now();
    let lastStage = "", lastCompleted = -1, stopped = false;
    const recover = (force = false) => {
      if (stopped || (tourReady.current && !force)) return;
      stopped = true;
      tourReady.current = false;
      setReady(false);
      if (attempt === 0) { setStage("retry"); setProgress(0); setCounts({ completed: 0, total: 0 }); setAttempt(1); }
      else setStage("error");
    };
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      if (stopped) return;
      const data = event.data as { type?: string; phase?: Stage; completed?: number; total?: number; height?: number };
      if (data.type === "casa-stage" && data.phase && ["assets", "textures", "materials", "first-frame"].includes(data.phase)) {
        const completed = Number.isFinite(data.completed) ? Math.max(0, data.completed!) : 0;
        const total = Number.isFinite(data.total) ? Math.max(0, data.total!) : 0;
        if (data.phase !== lastStage || completed > lastCompleted) lastAdvance = performance.now();
        lastStage = data.phase;
        lastCompleted = completed;
        setStage(data.phase);
        setCounts({ completed, total });
        const ratio = total ? Math.min(1, completed / total) : 0;
        setProgress(data.phase === "assets" ? 0 : data.phase === "textures" ? .7 + .16 * ratio : data.phase === "materials" ? .86 + .12 * ratio : .99);
      }
      if (data.type === "casa-ready") {
        tourReady.current = true;
        setProgress(1);
        setReady(true);
        if (data.height) setHeight(data.height);
      }
      if (data.type === "casa-height" && data.height) setHeight(data.height);
      if (data.type === "casa-error" || data.type === "casa-fallback") recover(true);
    };
    window.addEventListener("message", onMessage);
    const watchdog = window.setInterval(() => {
      if (document.visibilityState === "hidden") { lastAdvance = performance.now(); return; }
      if (performance.now() - lastAdvance > LOAD_IDLE_LIMIT * (attempt ? 2 : 1)) recover();
    }, 1000);
    return () => {
      window.removeEventListener("message", onMessage);
      stopped = true;
      window.clearInterval(watchdog);
    };
  }, [attempt]);

  // Hold the page still under the loader.
  useEffect(() => {
    if (loaderDone) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    window.scrollTo(0, 0);
    return () => {
      root.style.overflow = prev;
    };
  }, [loaderDone]);

  useEffect(() => {
    setNavTone("light");
    return () => setNavTone(null);
  }, []);

  // Page scroll → walkthrough scroll, one to one across the whole tour.
  const sync = useCallback(() => {
    const el = section.current;
    const win = frame.current?.contentWindow;
    const doc = frame.current?.contentDocument;
    if (!el || !win || !doc) return;
    const rect = el.getBoundingClientRect();
    const hold = window.innerHeight * HOLD;
    const range = Math.max(1, el.offsetHeight - window.innerHeight - hold);
    const travelled = -rect.top;
    const p = Math.min(1, Math.max(0, travelled / range));
    const max = Math.max(0, doc.documentElement.scrollHeight - win.innerHeight);
    win.scrollTo(0, p * max);
    setAtEnd(travelled >= range * 0.995);
    setInHero(rect.bottom > window.innerHeight * 0.35);
  }, []);

  // The global nav steps aside while the tour plays; it returns at the last scene and after the hero.
  useEffect(() => {
    setNavAutoHide(loaderDone && inHero && !atEnd);
  }, [loaderDone, inHero, atEnd]);
  useEffect(() => () => setNavAutoHide(false), []);

  // Track the walkthrough's scroll length so one page pixel moves the tour one pixel.
  useEffect(() => {
    if (!ready) return;
    const doc = frame.current?.contentDocument;
    if (!doc?.body) return;
    const measure = () => setHeight(doc.documentElement.scrollHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(doc.body);
    return () => ro.disconnect();
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    let raf = 0;
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(() => {
        raf = 0;
        sync();
      });
    };
    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ready, height, sync]);

  return (
    <div className="ch" data-mode="casa">
      <h1 className="sr-only">Made As One — {t.hero.descriptor}</h1>
      {(
        <section
          ref={section}
          className="ch__track"
          style={{ height: ready && height ? `calc(${height}px + ${HOLD * 100}svh)` : undefined }}
          aria-label={t.hero.descriptor}
          data-end={atEnd || undefined}
        >
          <div className="ch__stage">
            <iframe
              key={attempt}
              ref={frame}
              className="ch__frame"
              src={`/casa/index.html?embed=1&startup=2${attempt ? "&quality=compat" : ""}`}
              title="CIRMANO walkthrough, design concept"
              tabIndex={-1}
              data-ready={ready || undefined}
              onError={() => { if (attempt === 0) setAttempt(1); else setStage("error"); }}
            />
          </div>
        </section>
      )}
      <BrandLoader
        progress={progress}
        done={loaderDone}
        indeterminate={stage === "assets" || stage === "retry"}
        detail={loaderLabels[locale].stages[stage]}
        count={counts.total && stage !== "error" ? `${counts.completed} / ${counts.total}` : undefined}
        failed={stage === "error"}
        onRetry={restart}
        labels={loaderLabels[locale]}
      />
    </div>
  );
}

