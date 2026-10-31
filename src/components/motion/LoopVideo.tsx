import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useInView } from "./useInView";
import { useReducedMotion } from "./useReducedMotion";

type Props = {
  src: string;
  srcSmall?: string; // served below 900px wide
  poster: string;
  className?: string;
  label: string; // accessible description of the footage
  pauseLabel: string;
  playLabel: string;
  muted?: boolean;
  loop?: boolean;
  controls?: "corner" | "none";
  revealOnPlay?: boolean; // keep the element transparent until frames are playing (dissolve over an <img>)
  onEnded?: () => void;
};

// Silent loop that plays only while visible, with the pause control the brand pack requires.
// Under reduced motion it shows the poster and waits for the visitor to press play.
export function LoopVideo({ src, srcSmall, poster, className = "", label, pauseLabel, playLabel, muted = true, loop = true, controls = "corner", revealOnPlay = false, onEnded }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const [wrap, inView] = useInView<HTMLDivElement>({ once: false, threshold: 0.2, rootMargin: "0px" });
  const reduce = useReducedMotion();
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const [source, setSource] = useState<string | null>(null);

  // Pick the file on the client only, after first paint, so the poster stays the LCP element.
  useEffect(() => {
    setSource(srcSmall && window.matchMedia("(max-width: 900px)").matches ? srcSmall : src);
  }, [src, srcSmall]);

  const paused = userPaused ?? reduce;

  useEffect(() => {
    const el = video.current;
    if (!el || !source) return;
    if (inView && !paused) el.play().catch(() => setPlaying(false));
    else el.pause();
  }, [inView, paused, source]);

  return (
    <div ref={wrap} className={`lv ${revealOnPlay ? "lv--reveal" : ""} ${playing ? "is-playing" : ""} ${className}`}>
      <video
        ref={video}
        className="lv__video"
        src={source ?? undefined}
        poster={poster}
        muted={muted}
        loop={loop}
        playsInline
        preload="none"
        aria-label={label}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={onEnded}
      />
      {controls === "corner" && (
        <button type="button" className="lv__toggle" aria-label={playing ? pauseLabel : playLabel} onClick={() => setUserPaused(playing)}>
          {playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
        </button>
      )}
    </div>
  );
}
