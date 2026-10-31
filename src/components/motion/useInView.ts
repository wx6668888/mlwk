import { useEffect, useRef, useState } from "react";

// True once the element has entered the viewport (or while it is in view when once = false).
export function useInView<T extends Element>({ once = true, rootMargin = "0px 0px -12% 0px", threshold = 0.15 } = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) return setInView(true);
    // Anything already on screen at mount reveals at once, without waiting for the observer
    // (observers can fire late in background tabs and on slow devices).
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setInView(true);
      if (once) return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) setInView(false);
      },
      { rootMargin, threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once, rootMargin, threshold]);
  return [ref, inView] as const;
}
