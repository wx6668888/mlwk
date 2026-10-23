import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import PageIntro from "../components/PageIntro";
import Reveal from "../components/Reveal";
import { getCopy, type Locale } from "../content";

const companyDetails: Record<
  Locale,
  {
    story: [string, string, string];
    principles: Array<[string, string]>;
    evidence: [string, string, string];
    factoryGallery: Array<[string, string, string]>;
  }
> = {
  en: {
    story: ["CIRMANO · Foshan, China", "Made As One.", "CIRMANO is a custom cabinetry manufacturer based in Foshan, China, specializing in integrated whole-home customization for villas and premium homes."],
    principles: [["Craftsmanship", "Care in proportion, junctions and finish shapes the character of the completed space."], ["System", "Kitchens, wardrobes, interior doors and wall panels are considered as parts of one home."], ["Aesthetics", "Material, rhythm and detail are brought into a consistent architectural language."], ["Global outlook", "A broad design perspective, with product and project responsibilities confirmed case by case."]],
    evidence: ["Manufacturing", "The detail behind the finished space.", "Brand materials show HOMAG equipment and panel processing. Laser edgebanding is used for specified compatible components; selected cabinetry is inspected and trial-assembled before dispatch. Exact process scope is confirmed by project."],
    factoryGallery: [["/media/cirmano-factory-m07.webp", "HOMAG manufacturing equipment at the Foshan workshop", "Manufacturing equipment · Foshan"], ["/media/cirmano-factory-f013.webp", "Edge finishing equipment in the CIRMANO workshop", "Edge finishing"], ["/media/cirmano-factory-m08.webp", "Wide view across the CIRMANO workshop floor in Foshan", "Workshop floor · Foshan"]],
  },
  zh: {
    story: ["CIRMANO / 西尔曼 · 中国佛山", "Made As One · 一体成就完整空间", "CIRMANO立足中国佛山，专注别墅与高端住宅的一体化全屋定制制造。我们连接橱柜、衣柜、室内门和墙板，通过材质、比例与细节的协调，让每一部分成为完整居所的一部分。"],
    principles: [["匠艺", "从比例、收口到表面细节，认真处理构成空间质感的每一处交界。"], ["系统", "橱柜、衣柜、室内门与墙板作为完整居所中的不同部分一并考虑。"], ["美学", "让材质、节奏与细节形成连贯而克制的建筑语言。"], ["国际视野", "以开放的设计视角理解不同生活方式，具体产品与项目责任按项目确认。"]],
    evidence: ["制造", "完工空间背后的细节。", "品牌资料展示了HOMAG设备与板件加工。激光封边用于指定兼容部件；选定柜体在出货前进行检查与试装。具体工艺范围按项目确认。"],
    factoryGallery: [["/media/cirmano-factory-m07.webp", "佛山工厂中的HOMAG制造设备", "制造设备 · 佛山"], ["/media/cirmano-factory-f013.webp", "CIRMANO工厂的封边设备", "封边设备"], ["/media/cirmano-factory-m08.webp", "佛山 CIRMANO 工厂生产现场全景", "生产现场 · 佛山"]],
  },
  ar: {
    story: ["CIRMANO · فوشان، الصين", "صُنع ككلّ واحد.", "CIRMANO مُصنّع للخزائن حسب الطلب في فوشان بالصين، متخصص في التخصيص المتكامل للمنازل والفلل والمساكن الراقية."],
    principles: [["الحرفية", "تُصاغ شخصية المساحة المكتملة بعناية في النسب والوصلات والتشطيبات."], ["النظام", "تُدرس المطابخ والخزائن والأبواب الداخلية وألواح الجدران كأجزاء من منزل واحد."], ["الجماليات", "تُنسق المواد والإيقاع والتفاصيل ضمن لغة معمارية متجانسة."], ["رؤية عالمية", "منظور تصميمي واسع، مع تأكيد نطاق المنتجات ومسؤوليات المشروع لكل حالة."]],
    evidence: ["التصنيع", "التفاصيل وراء المساحة المكتملة.", "تعرض مواد العلامة معدات HOMAG ومعالجة الألواح. يُستخدم تلبيس الحواف بالليزر لمكونات متوافقة محددة؛ وتُفحص بعض الخزائن وتُجرّب قبل الشحن. يُؤكد نطاق العملية لكل مشروع."],
    factoryGallery: [["/media/cirmano-factory-m07.webp", "معدات HOMAG للتصنيع في ورشة فوشان", "معدات التصنيع · فوشان"], ["/media/cirmano-factory-f013.webp", "معدات تشطيب الحواف في ورشة CIRMANO", "تشطيب الحواف"], ["/media/cirmano-factory-m08.webp", "مشهد واسع لأرضية ورشة CIRMANO في فوشان", "أرضية الورشة · فوشان"]],
  },
  de: {
    story: ["CIRMANO · Foshan, China", "Aus einem Guss.", "CIRMANO ist ein Hersteller maßgefertigter Schränke in Foshan, China, spezialisiert auf integrierte Raumkonzepte für Villen und hochwertige Wohnhäuser."],
    principles: [["Handwerk", "Sorgfalt bei Proportionen, Übergängen und Oberflächen prägt den fertigen Raum."], ["System", "Küchen, Schränke, Innentüren und Wandpaneele werden als Teile eines Hauses betrachtet."], ["Ästhetik", "Material, Rhythmus und Detail fügen sich zu einer klaren architektonischen Sprache."], ["Globaler Blick", "Eine offene Gestaltungsperspektive; Produktumfang und Projektverantwortung werden einzeln bestätigt."]],
    evidence: ["Fertigung", "Die Details hinter dem fertigen Raum.", "Die Markenunterlagen zeigen HOMAG-Anlagen und Plattenbearbeitung. Laserbekantung wird für bestimmte kompatible Bauteile eingesetzt; ausgewählte Schränke werden vor dem Versand geprüft und probemontiert. Der Prozessumfang wird projektbezogen bestätigt."],
    factoryGallery: [["/media/cirmano-factory-m07.webp", "HOMAG-Fertigungsanlage in der Werkstatt in Foshan", "Fertigungsanlage · Foshan"], ["/media/cirmano-factory-f013.webp", "Anlage zur Kantenbearbeitung in der CIRMANO-Werkstatt", "Kantenbearbeitung"], ["/media/cirmano-factory-m08.webp", "Blick über die Produktionsfläche von CIRMANO in Foshan", "Produktionsfläche · Foshan"]],
  },
  fr: {
    story: ["CIRMANO · Foshan, Chine", "Pensé comme un tout.", "CIRMANO est un fabricant de mobilier sur mesure basé à Foshan, en Chine, spécialisé dans l’aménagement intégré de villas et de résidences haut de gamme."],
    principles: [["Savoir-faire", "La justesse des proportions, des jonctions et des finitions façonne l'espace achevé."], ["Système", "Cuisines, rangements, portes intérieures et panneaux muraux sont pensés comme les éléments d'un même lieu."], ["Esthétique", "Matières, rythme et détails composent un langage architectural cohérent."], ["Ouverture internationale", "Un regard ouvert sur les modes de vie, avec un périmètre produit et des responsabilités confirmés pour chaque projet."]],
    evidence: ["Fabrication", "Le détail derrière l’espace achevé.", "Les documents de marque montrent des équipements HOMAG et l'usinage des panneaux. Le placage laser est utilisé pour certains composants compatibles ; certains meubles sont contrôlés et montés à blanc avant expédition. Le périmètre du processus est confirmé par projet."],
    factoryGallery: [["/media/cirmano-factory-m07.webp", "Équipement de fabrication HOMAG dans l'atelier de Foshan", "Équipement de fabrication · Foshan"], ["/media/cirmano-factory-f013.webp", "Équipement de finition des chants dans l'atelier CIRMANO", "Finition des chants"], ["/media/cirmano-factory-m08.webp", "Vue générale de l'atelier CIRMANO à Foshan", "Atelier · Foshan"]],
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
        {detail.principles.map(([principle, description], index) => (
          <Reveal key={principle}>
            <strong>{String(index + 1).padStart(2, "0")}</strong>
            <span>{principle}</span>
            <p>{description}</p>
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
        {detail.factoryGallery.map(([image, alt, caption]) => (
          <figure key={image}>
            <img src={image} alt={alt} loading="lazy" decoding="async" />
            <figcaption>{caption}</figcaption>
          </figure>
        ))}
      </section>
    </>
  );
}
