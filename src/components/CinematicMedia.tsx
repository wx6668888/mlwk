import { useEffect, useRef, useState } from "react";

type CinematicMediaProps = {
  image: string;
  label?: string;
  eager?: boolean;
  className?: string;
};

const existingFilms: Record<string, string> = {
  "/media/kitchens.png": "/media/kitchen-generated.mp4",
  "/media/wall-panels.png": "/media/wall-panels-generated.mp4",
};

function motionSource(image: string) {
  if (existingFilms[image]) return existingFilms[image];
  const fileName = image.split("/").pop()?.replace(/\.[^.]+$/, ".mp4");
  return `/media/motion/${fileName}`;
}

export default function CinematicMedia({
  image,
  label = "",
  eager = false,
  className = "",
}: CinematicMediaProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const playbackRate = image === "/media/wall-panels.png" ? 1 / 3 : 1;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReduceMotion(media.matches);
      if (ref.current) {
        ref.current.defaultPlaybackRate = playbackRate;
        ref.current.playbackRate = playbackRate;
      }
      if (media.matches) ref.current?.pause();
      else void ref.current?.play().catch(() => undefined);
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [playbackRate]);

  return (
    <video
      ref={ref}
      className={`cinematic-media ${className}`.trim()}
      autoPlay={!reduceMotion}
      muted
      loop
      playsInline
      preload={eager ? "auto" : "metadata"}
      poster={image}
      aria-label={label || undefined}
    >
      <source src={motionSource(image)} type="video/mp4" />
    </video>
  );
}
