import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import PageIntro from "../components/PageIntro";
import Reveal from "../components/Reveal";
import { getCopy, type Locale } from "../content";

const companyDetails: Record<
  Locale,
  {
    story: [string, string, string];
    principles: [string, string, string, string];
    evidence: [string, string, string];
  }
> = {
  en: {
    story: ["CIRMANO · Foshan, China", "Made As One.", "CIRMANO is a custom cabinetry manufacturer based in Foshan, China, specializing in integrated whole-home customization for villas and premium homes."],
    principles: ["Craftsmanship", "System", "Aesthetics", "Coordination"],
    evidence: ["Manufacturing", "The detail behind the finished space.", "Brand materials show HOMAG equipment and panel processing. Laser edgebanding is used for specified compatible components; selected cabinetry is inspected and trial-assembled before dispatch. Exact process scope is confirmed by project."],
  },
  zh: {
    story: ["CIRMANO / 西尔曼 · 中国佛山", "Made As One · 一体成就完整空间", "CIRMANO立足中国佛山，专注别墅与高端住宅的一体化全屋定制制造。我们连接橱柜、衣柜、室内门和墙板，通过材质、比例与细节的协调，让每一部分成为完整居所的一部分。"],
    principles: ["匠艺", "系统", "美学", "协同"],
    evidence: ["制造", "完工空间背后的细节。", "品牌资料展示了HOMAG设备与板件加工。激光封边用于指定兼容部件；选定柜体在出货前进行检查与试装。具体工艺范围按项目确认。"],
  },
  ar: {
    story: ["CIRMANO · فوشان، الصين", "صُنع ككلّ واحد.", "CIRMANO مُصنّع للخزائن حسب الطلب في فوشان بالصين، متخصص في التخصيص المتكامل للمنازل والفلل والمساكن الراقية."],
    principles: ["الحرفية", "النظام", "الجماليات", "التنسيق"],
    evidence: ["التصنيع", "التفاصيل وراء المساحة المكتملة.", "تعرض مواد العلامة معدات HOMAG ومعالجة الألواح. يُستخدم تلبيس الحواف بالليزر لمكونات متوافقة محددة؛ وتُفحص بعض الخزائن وتُجرّب قبل الشحن. يُؤكد نطاق العملية لكل مشروع."],
  },
  de: {
    story: ["CIRMANO · Foshan, China", "Aus einem Guss.", "CIRMANO ist ein Hersteller maßgefertigter Schränke in Foshan, China, spezialisiert auf integrierte Raumkonzepte für Villen und hochwertige Wohnhäuser."],
    principles: ["Handwerk", "System", "Ästhetik", "Abstimmung"],
    evidence: ["Fertigung", "Die Details hinter dem fertigen Raum.", "Die Markenunterlagen zeigen HOMAG-Anlagen und Plattenbearbeitung. Laserbekantung wird für bestimmte kompatible Bauteile eingesetzt; ausgewählte Schränke werden vor dem Versand geprüft und probemontiert. Der Prozessumfang wird projektbezogen bestätigt."],
  },
  fr: {
    story: ["CIRMANO · Foshan, Chine", "Pensé comme un tout.", "CIRMANO est un fabricant de mobilier sur mesure basé à Foshan, en Chine, spécialisé dans l’aménagement intégré de villas et de résidences haut de gamme."],
    principles: ["Savoir-faire", "Système", "Esthétique", "Coordination"],
    evidence: ["Fabrication", "Le détail derrière l’espace achevé.", "Les documents de marque montrent des équipements HOMAG et l'usinage des panneaux. Le placage laser est utilisé pour certains composants compatibles ; certains meubles sont contrôlés et montés à blanc avant expédition. Le périmètre du processus est confirmé par projet."],
  },
};

export default function CompanyPage({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  const detail = companyDetails[locale];
  const [eyebrow, title, text] = copy.pages.company;

  return (
    <>
      <PageIntro eyebrow={eyebrow} title={title} text={text} />
      <section className="name-story section">
        <Reveal className="name-story__mark">
          <img src="/favicon.svg" alt="" />
        </Reveal>
        <Reveal className="name-story__copy">
          <p className="eyebrow">{detail.story[0]}</p>
          <h2>{detail.story[1]}</h2>
          <p>{detail.story[2]}</p>
        </Reveal>
      </section>
      <section className="company-proof section section--soft" aria-label="CIRMANO principles">
        {detail.principles.map((principle, index) => (
          <Reveal key={principle}>
            <strong>{String(index + 1).padStart(2, "0")}</strong>
            <span>{principle}</span>
          </Reveal>
        ))}
      </section>
      <section className="factory-policy section">
        <Reveal>
          <p className="eyebrow">{detail.evidence[0]}</p>
          <h2>{detail.evidence[1]}</h2>
        </Reveal>
        <Reveal>
          <p>{detail.evidence[2]}</p>
          <Link className="text-link" to={`/${locale}/capabilities`}>
            {copy.nav.capabilities}
            <ArrowUpRight size={17} />
          </Link>
        </Reveal>
      </section>
      <section className="factory-gallery section" aria-label="CIRMANO manufacturing photography">
        <figure>
          <img src="/media/cirmano-factory-m07.webp" alt="HOMAG manufacturing equipment at the Foshan workshop" loading="lazy" />
          <figcaption>Manufacturing equipment · Foshan</figcaption>
        </figure>
        <figure>
          <img src="/media/cirmano-factory-f013.webp" alt="Edge finishing equipment in the CIRMANO workshop" loading="lazy" />
          <figcaption>Edge finishing equipment</figcaption>
        </figure>
      </section>
    </>
  );
}
