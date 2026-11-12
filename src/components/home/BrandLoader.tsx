import type { CSSProperties } from "react";

// Full-screen brand loader shown while the walkthrough's textures load.
// Rendered on the server so the first frame is the brand, not a blank page; hidden without JS (see CSS).
export default function BrandLoader({
  progress,
  done,
  indeterminate,
  detail,
  count,
  failed,
  onRetry,
  labels,
}: {
  progress: number;
  done: boolean;
  indeterminate: boolean;
  detail: string;
  count?: string;
  failed: boolean;
  onRetry: () => void;
  labels: { loading: string; retry: string; place: string };
}) {
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  return (
    <div className="bl" data-done={done || undefined} data-pending={indeterminate || undefined} role="status" aria-live="polite" aria-label={detail}>
      <div className="bl__in">
        <div className="bl__brand">
          <img className="bl__logo" src="/brand/CIRMANO_horizontal_CNEN_ink.svg" alt="CIRMANO 西尔曼" width={240} height={108} />
        </div>
        <p className="bl__slogan">
          <span className="m-mask is-in"><span>Made As One</span></span>
        </p>
        <p className="bl__descriptor">Integrated Whole-Home Customization</p>
        <div className="bl__bar" aria-hidden="true">
          <i style={{ transform: `scaleX(${pct / 100})` } as CSSProperties} />
        </div>
        <p className="bl__meta">
          <span>{detail}</span>
          <span className="bl__pct">{indeterminate ? (count || "…") : failed ? "—" : `${String(pct).padStart(3, "0")}%`}</span>
        </p>
        {failed && !done && (
          <button type="button" className="bl__retry" onClick={onRetry}>
            {labels.retry}
          </button>
        )}
      </div>
      <p className="bl__place">{labels.place}</p>
    </div>
  );
}
