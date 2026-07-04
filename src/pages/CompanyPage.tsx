import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import PageIntro from "../components/PageIntro";
import Reveal from "../components/Reveal";
import { getCopy, type Locale } from "../content";

export default function CompanyPage({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  const [eyebrow, title, text] = copy.pages.company;
  return (
    <>
      <PageIntro eyebrow={eyebrow} title={title} text={text} />
      <section className="name-story section">
        <Reveal className="name-story__mark">
          <span>M</span>
          <span>L</span>
          <span>W</span>
          <span>K</span>
        </Reveal>
        <Reveal className="name-story__copy">
          <p className="eyebrow">The name</p>
          <h2>Millwork, without the unnecessary letters.</h2>
          <p>
            MLWK borrows the concise abbreviation used in architectural
            drawings. It signals what we make and how we prefer to work:
            directly, precisely and close to the project information.
          </p>
        </Reveal>
      </section>
      <section className="company-proof section section--soft">
        <Reveal>
          <strong>500+</strong>
          <span>Custom projects completed</span>
        </Reveal>
        <Reveal>
          <strong>01</strong>
          <span>Coordinated manufacturing partner</span>
        </Reveal>
        <Reveal>
          <strong>06</strong>
          <span>Core millwork systems</span>
        </Reveal>
      </section>
      <section className="factory-policy section">
        <Reveal>
          <p className="eyebrow">Factory evidence</p>
          <h2>No borrowed factory footage.</h2>
        </Reveal>
        <Reveal>
          <p>
            Equipment, teams, quality checks, packing and loading will be shown
            here only with original MLWK photography. Certification, capacity,
            lead-time and MOQ claims remain unpublished until the underlying
            records are ready.
          </p>
          <Link className="text-link" to={`/${locale}/capabilities`}>
            {copy.nav.capabilities}
            <ArrowUpRight size={17} />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
