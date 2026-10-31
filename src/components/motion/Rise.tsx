import type { CSSProperties, ElementType, ReactNode } from "react";
import { useInView } from "./useInView";

// Motion pattern 1 · Rise: up 24px + fade, 600ms, once.
export function Rise({ as: Tag = "div", className = "", delay = 0, children, style }: { as?: ElementType; className?: string; delay?: number; children: ReactNode; style?: CSSProperties }) {
  const [ref, inView] = useInView<HTMLElement>();
  return (
    <Tag ref={ref} className={`m-rise ${inView ? "is-in" : ""} ${className}`} style={{ ...style, "--delay": `${delay}ms` } as CSSProperties}>
      {children}
    </Tag>
  );
}
