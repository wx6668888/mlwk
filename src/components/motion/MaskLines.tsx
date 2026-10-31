import type { CSSProperties, ElementType } from "react";
import { useInView } from "./useInView";

// Motion pattern 2 · Mask line: each line rises out of its own mask, 80ms apart.
export function MaskLines({ as: Tag = "h2", lines, className = "", delay = 0, id }: { as?: ElementType; lines: string[]; className?: string; delay?: number; id?: string }) {
  const [ref, inView] = useInView<HTMLElement>();
  return (
    <Tag ref={ref} id={id} className={`${inView ? "is-in" : ""} ${className}`} style={{ "--delay": `${delay}ms` } as CSSProperties}>
      {lines.map((line, i) => (
        <span key={i} className="m-mask">
          <span style={{ "--i": i } as CSSProperties}>{line}</span>
        </span>
      ))}
    </Tag>
  );
}
