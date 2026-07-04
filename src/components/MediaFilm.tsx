import { useEffect, useRef, useState } from "react";

type MediaFilmProps = {
  src?: string;
  sources?: Array<{
    src: string;
    type: "video/mp4" | "video/webm";
    media?: string;
  }>;
  poster: string;
  label: string;
  className?: string;
  eager?: boolean;
};

export default function MediaFilm({
  src,
  sources,
  poster,
  label,
  className = "",
  eager = false,
}: MediaFilmProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReduceMotion(media.matches);
      if (media.matches) {
        ref.current?.pause();
      }
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <div className={`film ${className}`}>
      <video
        ref={ref}
        autoPlay={!reduceMotion}
        muted
        loop
        playsInline
        preload={eager ? "auto" : "metadata"}
        poster={poster}
        aria-label={label}
      >
        {sources?.map((source) => (
          <source
            key={`${source.src}-${source.media ?? "all"}`}
            src={source.src}
            type={source.type}
            media={source.media}
          />
        ))}
        {src && <source src={src} type="video/mp4" />}
      </video>
    </div>
  );
}
