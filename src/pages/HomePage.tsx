import type { Locale } from "../content";
import { homeCopy } from "../site/homeCopy";
import {
  ContactCta,
  DetailGrid,
  Follow,
  Manufacturing,
  OneLanguage,
  Principles,
  ProductRail,
  ProjectSpaces,
  Statement,
} from "../components/home/HomeSections";
import VillaRevealHero from "../components/VillaRevealHero";
import { InspirationRail } from "../components/inspiration/Inspiration";
import { inspirationEnabled } from "../site/features";
import "../components/home/Home.css";

// Ten chapters, one idea per screen. Structure and motion rules: docs/design-system.md.
export default function HomePage({ locale }: { locale: Locale }) {
  const t = homeCopy[locale];

  return (
    <div className="home">
      <VillaRevealHero locale={locale} />
      <Statement locale={locale} t={t} />
      <ProductRail locale={locale} t={t} />
      <OneLanguage locale={locale} t={t} />
      <DetailGrid locale={locale} t={t} />
      <Manufacturing locale={locale} t={t} />
      <ProjectSpaces locale={locale} t={t} />
      {inspirationEnabled && <InspirationRail locale={locale} />}
      <Principles locale={locale} t={t} />
      <Follow locale={locale} t={t} />
      <ContactCta locale={locale} t={t} />
    </div>
  );
}
