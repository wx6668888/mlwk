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
    galleryTitle: string;
    galleryNote: string;
    gallery: Array<[string, string, string]>;
    standards: Array<[string, string]>;
  }
> = {
  en: {
    publishing: "Publishing standard",
    title: "One completed home, shown with context.",
    text: "Project photography from one completed Guangzhou residence. Product supply and installation scope should be confirmed for each published case detail.",
    action: "Discuss a current project",
    galleryTitle: "A closer look at the rooms",
    galleryNote: "These selected photographs all belong to the same Guangzhou residence. They show different rooms and joinery details; product supply and installation scope is confirmed individually for each project.",
    gallery: [
      ["/media/cirmano-project-dining-p234.webp", "Dining room", "Dining room cabinetry in a completed Guangzhou residence"],
      ["/media/cirmano-project-entry-p208.webp", "Entry storage", "Integrated entry storage in a completed Guangzhou residence"],
      ["/media/cirmano-project-wardrobe-p092.webp", "Wardrobe", "Wardrobe joinery in a completed Guangzhou residence"],
      ["/media/cirmano-project-study-p115.webp", "Study", "Study cabinetry in a completed Guangzhou residence"],
      ["/media/cirmano-project-vanity-p078.webp", "Vanity", "Vanity cabinetry in a completed Guangzhou residence"],
      ["/media/cirmano-project-child-p148.webp", "Bedroom storage", "Bedroom storage in a completed Guangzhou residence"],
    ],
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
    galleryTitle: "走近空间细节",
    galleryNote: "以下精选照片均来自广州同一处完工住宅，呈现不同房间与定制木作细节；每个项目的产品供货与安装范围均单独确认。",
    gallery: [
      ["/media/cirmano-project-dining-p234.webp", "餐厅", "广州完工住宅中的餐厅柜体"],
      ["/media/cirmano-project-entry-p208.webp", "玄关收纳", "广州完工住宅中的一体化玄关收纳"],
      ["/media/cirmano-project-wardrobe-p092.webp", "衣柜", "广州完工住宅中的衣柜木作"],
      ["/media/cirmano-project-study-p115.webp", "书房", "广州完工住宅中的书房柜体"],
      ["/media/cirmano-project-vanity-p078.webp", "梳妆区", "广州完工住宅中的梳妆区柜体"],
      ["/media/cirmano-project-child-p148.webp", "卧室收纳", "广州完工住宅中的卧室收纳"],
    ],
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
    galleryTitle: "نظرة أقرب إلى المساحات",
    galleryNote: "تنتمي هذه الصور المختارة إلى المسكن نفسه في قوانغتشو، وتعرض غرفاً وتفاصيل نجارة مختلفة. يُؤكد نطاق التوريد والتركيب لكل مشروع على حدة.",
    gallery: [
      ["/media/cirmano-project-dining-p234.webp", "غرفة الطعام", "خزائن غرفة الطعام في مسكن مكتمل في قوانغتشو"],
      ["/media/cirmano-project-entry-p208.webp", "تخزين المدخل", "وحدات تخزين مدمجة عند المدخل في مسكن مكتمل في قوانغتشو"],
      ["/media/cirmano-project-wardrobe-p092.webp", "خزانة الملابس", "نجارة خزانة الملابس في مسكن مكتمل في قوانغتشو"],
      ["/media/cirmano-project-study-p115.webp", "غرفة الدراسة", "خزائن غرفة الدراسة في مسكن مكتمل في قوانغتشو"],
      ["/media/cirmano-project-vanity-p078.webp", "منطقة الزينة", "خزانة منطقة الزينة في مسكن مكتمل في قوانغتشو"],
      ["/media/cirmano-project-child-p148.webp", "تخزين غرفة النوم", "وحدات تخزين غرفة النوم في مسكن مكتمل في قوانغتشو"],
    ],
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
    galleryTitle: "Räume im Detail",
    galleryNote: "Diese ausgewählten Fotografien stammen alle aus demselben Wohnhaus in Guangzhou. Sie zeigen verschiedene Räume und Einbaudetails; Liefer- und Montageumfang werden für jedes Projekt einzeln bestätigt.",
    gallery: [
      ["/media/cirmano-project-dining-p234.webp", "Essbereich", "Einbauten im Essbereich eines fertiggestellten Wohnhauses in Guangzhou"],
      ["/media/cirmano-project-entry-p208.webp", "Garderobe", "Integrierter Eingangsstauraum in einem fertiggestellten Wohnhaus in Guangzhou"],
      ["/media/cirmano-project-wardrobe-p092.webp", "Kleiderschrank", "Schrankausbau in einem fertiggestellten Wohnhaus in Guangzhou"],
      ["/media/cirmano-project-study-p115.webp", "Arbeitszimmer", "Einbauten im Arbeitszimmer eines fertiggestellten Wohnhauses in Guangzhou"],
      ["/media/cirmano-project-vanity-p078.webp", "Frisiertisch", "Einbauten am Frisiertisch in einem fertiggestellten Wohnhaus in Guangzhou"],
      ["/media/cirmano-project-child-p148.webp", "Schlafzimmerstauraum", "Stauraum im Schlafzimmer eines fertiggestellten Wohnhauses in Guangzhou"],
    ],
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
    galleryTitle: "Les pièces de plus près",
    galleryNote: "Ces photographies sélectionnées proviennent toutes de la même résidence à Guangzhou. Elles présentent différentes pièces et menuiseries ; le périmètre de fourniture et de pose est confirmé pour chaque projet.",
    gallery: [
      ["/media/cirmano-project-dining-p234.webp", "Salle à manger", "Agencement de salle à manger dans une résidence achevée à Guangzhou"],
      ["/media/cirmano-project-entry-p208.webp", "Rangements d'entrée", "Rangements intégrés à l'entrée d'une résidence achevée à Guangzhou"],
      ["/media/cirmano-project-wardrobe-p092.webp", "Dressing", "Menuiserie de dressing dans une résidence achevée à Guangzhou"],
      ["/media/cirmano-project-study-p115.webp", "Bureau", "Agencement de bureau dans une résidence achevée à Guangzhou"],
      ["/media/cirmano-project-vanity-p078.webp", "Coiffeuse", "Agencement de coiffeuse dans une résidence achevée à Guangzhou"],
      ["/media/cirmano-project-child-p148.webp", "Rangements de chambre", "Rangements de chambre dans une résidence achevée à Guangzhou"],
    ],
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
      <section className="project-gallery section" aria-label={detail.galleryTitle}>
        <Reveal className="project-gallery__intro">
          <p className="eyebrow">{copy.pages.projects[0]}</p>
          <h2>{detail.galleryTitle}</h2>
          <p>{detail.galleryNote}</p>
        </Reveal>
        <div className="project-gallery__grid">
          {detail.gallery.map(([image, caption, alt]) => (
            <Reveal className="project-gallery__item" key={image}>
              <figure>
                <img src={image} alt={alt} loading="lazy" decoding="async" />
                <figcaption>{caption}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
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
