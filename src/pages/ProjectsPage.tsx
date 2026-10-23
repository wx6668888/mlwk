import { ArrowUpRight, Camera, FileCheck2, Ruler } from "lucide-react";
import { Link } from "react-router-dom";
import PageIntro from "../components/PageIntro";
import Reveal from "../components/Reveal";
import CinematicMedia from "../components/CinematicMedia";
import { getCopy, type Locale } from "../content";

const projectDetails: Record<
  Locale,
  {
    publishing: string;
    title: string;
    text: string;
    action: string;
    standards: Array<[string, string]>;
  }
> = {
  en: {
    publishing: "Publishing standard",
    title: "One completed home, shown with context.",
    text: "Project photography from one completed Guangzhou residence. Product supply and installation scope should be confirmed for each published case detail.",
    action: "Discuss a current project",
    standards: [
      ["Verified photography", "Project imagery is published only when its source and status are clear."],
      ["Useful project detail", "Scope, materials, constraints and resolved interfaces accompany each case study."],
      ["Honest project status", "Design development, production and completed installation are identified separately."],
    ],
  },
  zh: {
    publishing: "发布标准",
    title: "一处完工住宅，呈现真实语境。",
    text: "本组实拍来自广州一处完工住宅。公开每项产品的供货与施工范围前，仍需逐项确认。",
    action: "沟通当前项目",
    standards: [
      ["核验影像", "只有来源与项目状态清晰的影像才会作为案例发布。"],
      ["有用的项目细节", "每个案例都会说明范围、材料、限制条件与已解决的接口。"],
      ["诚实的项目状态", "设计深化、生产过程与完工安装将分别说明。"],
    ],
  },
  ar: {
    publishing: "معيار النشر",
    title: "مسكن مكتمل واحد بسياقه الحقيقي.",
    text: "صور من مسكن مكتمل واحد في قوانغتشو. ينبغي تأكيد نطاق توريد المنتجات والتركيب لكل تفصيل منشور.",
    action: "ناقش مشروعاً حالياً",
    standards: [
      ["صور موثقة", "لا تنشر صور المشروع إلا عندما يكون مصدرها وحالتها واضحين."],
      ["تفاصيل مفيدة", "يرافق كل مشروع نطاقه ومواده وقيوده والواجهات التي تمت معالجتها."],
      ["حالة صادقة", "يتم توضيح مراحل التطوير والإنتاج والتركيب المكتمل بشكل منفصل."],
    ],
  },
  de: {
    publishing: "Publikationsstandard",
    title: "Ein fertiges Zuhause, im echten Kontext.",
    text: "Projektfotografien aus einem fertiggestellten Wohnhaus in Guangzhou. Liefer- und Montageumfang sind für jedes veröffentlichte Detail zu bestätigen.",
    action: "Aktuelles Projekt besprechen",
    standards: [
      ["Verifizierte Fotografie", "Projektbilder werden nur mit eindeutigem Ursprung und Status veröffentlicht."],
      ["Nützliche Projektdetails", "Umfang, Materialien, Einschränkungen und gelöste Schnittstellen begleiten jede Fallstudie."],
      ["Ehrlicher Projektstatus", "Planung, Produktion und abgeschlossene Montage werden getrennt ausgewiesen."],
    ],
  },
  fr: {
    publishing: "Norme de publication",
    title: "Une résidence achevée, avec son contexte.",
    text: "Photographies d'une résidence achevée à Guangzhou. Le périmètre de fourniture et de pose est à confirmer pour chaque détail publié.",
    action: "Échanger sur un projet",
    standards: [
      ["Photographies vérifiées", "Les images ne sont publiées que lorsque leur source et leur statut sont clairs."],
      ["Détails utiles", "Périmètre, matériaux, contraintes et interfaces résolues accompagnent chaque étude."],
      ["Statut transparent", "Études, production et installation terminée sont distinguées."],
    ],
  },
};

export default function ProjectsPage({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  const detail = projectDetails[locale];
  const [eyebrow, title, text] = copy.pages.projects;
  const standardIcons = [Camera, Ruler, FileCheck2] as const;

  return (
    <>
      <PageIntro eyebrow={eyebrow} title={title} text={text} />
      <section className="project-placeholder section">
        <Reveal className="project-placeholder__visual">
          <CinematicMedia
            image="/media/cirmano-project-p175.jpg"
            label={copy.pages.projects[1]}
          />
        </Reveal>
        <Reveal className="project-placeholder__copy">
          <p className="eyebrow">{detail.publishing}</p>
          <h2>{detail.title}</h2>
          <p>{detail.text}</p>
          <Link className="text-link" to={`/${locale}/quote`}>
            {detail.action}
            <ArrowUpRight size={17} />
          </Link>
        </Reveal>
      </section>
      <section className="proof-standard section section--soft">
        {detail.standards.map(([itemTitle, itemText], index) => {
          const Icon = standardIcons[index];
          return (
            <Reveal className="standard-item" key={itemTitle}>
              <Icon size={24} />
              <h3>{itemTitle}</h3>
              <p>{itemText}</p>
            </Reveal>
          );
        })}
      </section>
    </>
  );
}
