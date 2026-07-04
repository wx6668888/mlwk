import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import PageIntro from "../components/PageIntro";
import Reveal from "../components/Reveal";
import CinematicMedia from "../components/CinematicMedia";
import { getCopy, solutions, type Locale } from "../content";

export function SolutionsPage({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  const [eyebrow, title, text] = copy.pages.solutions;
  return (
    <>
      <PageIntro eyebrow={eyebrow} title={title} text={text} />
      <section className="solution-list section">
        {solutions.map((item, index) => (
          <Reveal key={item.slug} className="solution-row">
            <Link to={`/${locale}/solutions/${item.slug}`}>
              <span className="solution-row__index">0{index + 1}</span>
              <div className="solution-row__image">
                <CinematicMedia image={item.image} label={item.name[locale]} />
              </div>
              <div className="solution-row__copy">
                <h2>{item.name[locale]}</h2>
                <p>{item.description[locale]}</p>
              </div>
              <ArrowUpRight />
            </Link>
          </Reveal>
        ))}
      </section>
    </>
  );
}

export function SolutionDetailPage({
  locale,
  slug,
}: {
  locale: Locale;
  slug: string;
}) {
  const item = solutions.find((solution) => solution.slug === slug);
  const copy = getCopy(locale);
  if (!item) return null;

  return (
    <>
      <section className="detail-hero detail-hero--solution">
        <CinematicMedia image={item.image} label={item.name[locale]} eager />
        <div className="detail-hero__shade" />
        <div className="detail-hero__copy">
          <p className="eyebrow">{copy.nav.solutions}</p>
          <h1>{item.name[locale]}</h1>
          <p>{item.description[locale]}</p>
        </div>
      </section>
      <section className="solution-detail section">
        <Reveal>
          <p className="eyebrow">Project priorities</p>
          <h2>{copy.pages.solutions[1]}</h2>
        </Reveal>
        <div className="priority-grid">
          {copy.capabilitySteps.slice(0, 4).map(([number, title, text]) => (
            <Reveal className="priority-item" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </Reveal>
          ))}
        </div>
        <Link className="primary-button" to={`/${locale}/quote`}>
          <ArrowUpRight size={18} />
          {copy.nav.quote}
        </Link>
      </section>
    </>
  );
}
