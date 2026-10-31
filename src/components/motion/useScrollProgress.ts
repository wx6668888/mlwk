import { useEffect, useRef, useState } from "react";

// 0 → 1 while a tall section scrolls past its sticky stage (pin & scrub).
// mode "pin": 0 when the section top hits the viewport top, 1 when its bottom reaches the viewport bottom.
// mode "pass": 0 when the element enters at the bottom, 1 when it reaches `end` (fraction of viewport height).
export function useScrollProgress<T extends HTMLElement>({ mode = "pin", end = 0.35 }: { mode?: "pin" | "pass"; end?: number } = {}) {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const raw = mode === "pin" ? -rect.top / Math.max(1, rect.height - vh) : (vh - rect.top) / Math.max(1, vh * (1 - end) + rect.height * 0.5);
      setProgress(Math.min(1, Math.max(0, raw)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [mode, end]);
  return [ref, progress] as const;
}
