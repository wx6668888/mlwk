import { useScrollProgress } from "./useScrollProgress";

// Motion pattern 3 · Ink fill: words turn from 20% ink to ink as the passage scrolls up the screen.
export function InkFill({ text, className = "", as: Tag = "p" }: { text: string; className?: string; as?: "p" | "h2" }) {
  const [ref, progress] = useScrollProgress<HTMLElement>({ mode: "pass", end: 0.4 });
  const words = text.split(/(\s+)/);
  const count = words.filter((w) => w.trim()).length;
  let index = 0;
  return (
    <Tag ref={ref as never} className={className}>
      {words.map((word, i) => {
        if (!word.trim()) return word;
        const on = index++ / count < progress * 1.05;
        return (
          <span key={i} className={`m-ink-word ${on ? "is-on" : ""}`}>
            {word}
          </span>
        );
      })}
    </Tag>
  );
}
