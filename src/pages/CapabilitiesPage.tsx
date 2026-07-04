import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import MediaFilm from "../components/MediaFilm";
import PageIntro from "../components/PageIntro";
import Reveal from "../components/Reveal";
import { getCopy, type Locale } from "../content";

export default function CapabilitiesPage({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  const [eyebrow, title, text] = copy.pages.capabilities;

  return (
    <>
      <PageIntro eyebrow={eyebrow} title={title} text={text} />
      <section className="capability-film section">
        <Reveal className="capability-film__media">
          <MediaFilm
            src="/media/wall-panels-generated.mp4"
            poster="/media/wall-panels.png"
            label="Material and wall panel design study"
          />
        </Reveal>
        <Reveal className="capability-film__copy">
          <p className="eyebrow">Material control</p>
          <h2>One approved sample becomes the reference.</h2>
          <p>
            Grain direction, sheen, color, edge detail and hardware are
            coordinated before production. Actual factory and inspection media
            will replace this concept film as the launch library is prepared.
          </p>
        </Reveal>
      </section>
      <section className="capability-timeline section section--ink">
        {copy.capabilitySteps.map(([number, stepTitle, stepText]) => (
          <Reveal className="capability-step" key={number}>
            <span>{number}</span>
            <h2>{stepTitle}</h2>
            <p>{stepText}</p>
          </Reveal>
        ))}
      </section>
      <section className="remote-support section">
        <Reveal>
          <p className="eyebrow">Installation boundary</p>
          <h2>Prepared here. Installed with local teams.</h2>
        </Reveal>
        <Reveal>
          <p>
            MLWK supplies labeling, packing schedules, installation drawings,
            video references and remote guidance. Site installation remains
            with the client or appointed local contractor unless separately
            agreed in writing.
          </p>
          <Link className="primary-button" to={`/${locale}/quote`}>
            <ArrowUpRight size={18} />
            {copy.nav.quote}
          </Link>
        </Reveal>
      </section>
    </>
  );
}
