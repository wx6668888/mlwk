import { ArrowUpRight, Camera, FileCheck2, Ruler } from "lucide-react";
import { Link } from "react-router-dom";
import PageIntro from "../components/PageIntro";
import Reveal from "../components/Reveal";
import CinematicMedia from "../components/CinematicMedia";
import { getCopy, type Locale } from "../content";

export default function ProjectsPage({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  const [eyebrow, title, text] = copy.pages.projects;
  const standards = [
    {
      icon: Camera,
      title: "Verified photography",
      text: "Project imagery is published only when its source and status are clear.",
    },
    {
      icon: Ruler,
      title: "Useful project detail",
      text: "Scope, materials, constraints and resolved interfaces accompany each case study.",
    },
    {
      icon: FileCheck2,
      title: "Honest project status",
      text: "Concept work, production work and completed installations are labeled separately.",
    },
  ];

  return (
    <>
      <PageIntro eyebrow={eyebrow} title={title} text={text} />
      <section className="project-placeholder section">
        <Reveal className="project-placeholder__visual">
          <CinematicMedia
            image="/media/bespoke-built-ins.png"
            label={copy.pages.projects[1]}
          />
        </Reveal>
        <Reveal className="project-placeholder__copy">
          <p className="eyebrow">Publishing standard</p>
          <h2>Real projects will carry real context.</h2>
          <p>
            The manufacturing team has completed more than 500 custom projects.
            The first international case studies will be added here after the
            photography, scope and permissions are verified.
          </p>
          <Link className="text-link" to={`/${locale}/quote`}>
            Discuss a current project
            <ArrowUpRight size={17} />
          </Link>
        </Reveal>
      </section>
      <section className="proof-standard section section--soft">
        {standards.map(({ icon: Icon, title: itemTitle, text: itemText }) => (
          <Reveal className="standard-item" key={itemTitle}>
            <Icon size={24} />
            <h3>{itemTitle}</h3>
            <p>{itemText}</p>
          </Reveal>
        ))}
      </section>
    </>
  );
}
