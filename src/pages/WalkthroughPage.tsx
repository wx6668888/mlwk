import type { Locale } from "../content";
import { homeCopy } from "../site/homeCopy";
import CasaHero from "../components/home/CasaHero";

// The 3D walkthrough lives on its own URL so the landing page can stay a plain,
// fast manufacturing page. Reached from the cube icon beside the wordmark, or by
// sending the link directly; noindex + absent from the sitemap (see scripts/prerender.mjs).
export default function WalkthroughPage({ locale }: { locale: Locale }) {
  const t = homeCopy[locale];

  return (
    <div className="wt">
      <CasaHero locale={locale} t={t} />
    </div>
  );
}
