import { ArrowUpRight, BookOpen, Boxes, FileText, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import PageIntro from "../components/PageIntro";
import Reveal from "../components/Reveal";
import { getCopy, type Locale } from "../content";

export default function ResourcesPage({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  const [eyebrow, title, text] = copy.pages.resources;
  const resources = [
    [BookOpen, "Collection overview", "Six systems and the project information needed to start."],
    [Boxes, "Finish reference", "How samples, control references and production approvals work."],
    [FileText, "Drawing checklist", "A practical checklist for a more useful first quotation."],
  ] as const;
  const faqs = [
    ["What files can I send?", "PDF, DWG, DXF, ZIP, JPG and PNG files are accepted through the project enquiry form."],
    ["Can MLWK work from design intent drawings?", "Yes. The review identifies the missing details and defines what must be developed before production."],
    ["Does MLWK install overseas?", "The launch service includes labeled packages, installation information and remote guidance for the appointed local team."],
    ["Are the website images completed projects?", "Only case studies explicitly identified as verified projects represent completed work. Other imagery supports design development and material direction."],
  ];

  return (
    <>
      <PageIntro eyebrow={eyebrow} title={title} text={text} />
      <section className="resource-grid section">
        {resources.map(([Icon, itemTitle, itemText], index) => (
          <Reveal className="resource-item" key={itemTitle}>
            <Icon size={25} />
            <span>0{index + 1}</span>
            <h2>{itemTitle}</h2>
            <p>{itemText}</p>
            <Link to={`/${locale}/quote`}>
              Request with project
              <ArrowUpRight size={16} />
            </Link>
          </Reveal>
        ))}
      </section>
      <section className="faq section section--soft">
        <Reveal className="faq-heading">
          <HelpCircle size={26} />
          <h2>Before you send a project</h2>
        </Reveal>
        <div className="faq-list">
          {faqs.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
