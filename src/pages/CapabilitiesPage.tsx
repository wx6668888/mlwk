import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import PageIntro from "../components/PageIntro";
import Reveal from "../components/Reveal";
import { getCopy, type Locale } from "../content";

const details: Record<
  Locale,
  {
    media: string;
    material: [string, string, string];
    workshop: [string, string, string, Array<[string, string, string]>];
    support: [string, string, string];
  }
> = {
  en: {
    media: "HOMAG manufacturing equipment at the Foshan workshop",
    material: ["Manufacturing details", "Equipment supports the coordinated whole.", "Brand materials show HOMAG equipment. Laser edgebanding is used for specified compatible components; selected cabinetry is inspected and trial-assembled before dispatch. Exact process scope is confirmed by project."],
    workshop: ["Inside the workshop", "From equipment to finished detail.", "A closer look at the Foshan workshop: manufacturing equipment, edge finishing and the wider production floor.", [["/media/cirmano-factory-f013.webp", "Edge-finishing equipment at the Foshan workshop", "Edge finishing"], ["/media/cirmano-factory-m08.webp", "Wide view across the CIRMANO workshop floor in Foshan", "Workshop floor · Foshan"]]],
    support: ["Project responsibilities", "Defined before production.", "The written project scope confirms product supply, packaging, installation responsibilities and any local coordination before work proceeds."],
  },
  zh: {
    media: "佛山工厂的HOMAG制造设备",
    material: ["制造细节", "设备支持整体协同。", "品牌资料展示了HOMAG设备。激光封边用于指定兼容部件；选定柜体在出货前进行检查与试装。具体工艺范围按项目确认。"],
    workshop: ["走进制造现场", "从设备到细节。", "从设备与封边工序，到更完整的生产现场，了解佛山工厂的制造环境。", [["/media/cirmano-factory-f013.webp", "佛山工厂的封边设备", "封边设备"], ["/media/cirmano-factory-m08.webp", "佛山 CIRMANO 工厂生产现场全景", "生产现场 · 佛山"]]],
    support: ["项目责任", "生产前逐项明确。", "书面项目范围会在工作开始前确认产品供货、包装、安装责任及当地协调事项。"],
  },
  ar: {
    media: "معدات HOMAG للتصنيع في ورشة فوشان",
    material: ["تفاصيل التصنيع", "تدعم المعدات العمل المتكامل.", "تعرض مواد العلامة معدات HOMAG. يُستخدم تلبيس الحواف بالليزر لمكونات متوافقة محددة؛ وتُفحص بعض الخزائن وتُجرّب قبل الشحن. يُؤكد نطاق العملية لكل مشروع."],
    workshop: ["داخل الورشة", "من المعدات إلى التفاصيل.", "نظرة أقرب إلى ورشة فوشان: معدات التصنيع وتشطيب الحواف وأرضية الإنتاج.", [["/media/cirmano-factory-f013.webp", "معدات تشطيب الحواف في ورشة فوشان", "تشطيب الحواف"], ["/media/cirmano-factory-m08.webp", "مشهد واسع لأرضية ورشة CIRMANO في فوشان", "أرضية الورشة · فوشان"]]],
    support: ["مسؤوليات المشروع", "تُحدد قبل الإنتاج.", "يؤكد نطاق المشروع المكتوب توريد المنتجات والتعبئة ومسؤوليات التركيب وأي تنسيق محلي قبل بدء العمل."],
  },
  de: {
    media: "HOMAG-Fertigungsanlage in der Werkstatt in Foshan",
    material: ["Fertigungsdetails", "Anlagen unterstützen das abgestimmte Ganze.", "Die Markenunterlagen zeigen HOMAG-Anlagen. Laserbekantung wird für bestimmte kompatible Bauteile eingesetzt; ausgewählte Schränke werden vor dem Versand geprüft und probemontiert. Der genaue Prozessumfang wird projektbezogen bestätigt."],
    workshop: ["Einblick in die Werkstatt", "Von der Anlage bis ins Detail.", "Ein genauerer Blick in die Werkstatt in Foshan: Fertigungsanlagen, Kantenbearbeitung und Produktionsfläche.", [["/media/cirmano-factory-f013.webp", "Anlage zur Kantenbearbeitung in der Werkstatt in Foshan", "Kantenbearbeitung"], ["/media/cirmano-factory-m08.webp", "Blick über die Produktionsfläche von CIRMANO in Foshan", "Produktionsfläche · Foshan"]]],
    support: ["Projektverantwortung", "Vor der Fertigung festgelegt.", "Der schriftliche Projektumfang bestätigt vor Arbeitsbeginn Produktlieferung, Verpackung, Montageverantwortung und eine etwaige lokale Koordination."],
  },
  fr: {
    media: "Équipement HOMAG dans l'atelier de Foshan",
    material: ["Détails de fabrication", "Les équipements soutiennent un ensemble coordonné.", "Les documents de marque montrent des équipements HOMAG. Le placage laser est utilisé pour certains composants compatibles ; certains meubles sont contrôlés et montés à blanc avant expédition. Le périmètre précis est confirmé par projet."],
    workshop: ["Dans l'atelier", "De l'équipement au détail.", "Un aperçu de l'atelier de Foshan : équipements de fabrication, finition des chants et espace de production.", [["/media/cirmano-factory-f013.webp", "Équipement de finition des chants dans l'atelier de Foshan", "Finition des chants"], ["/media/cirmano-factory-m08.webp", "Vue générale de l'atelier CIRMANO à Foshan", "Atelier · Foshan"]]],
    support: ["Responsabilités du projet", "Définies avant fabrication.", "Le périmètre écrit confirme la fourniture, l'emballage, les responsabilités de pose et toute coordination locale avant le début des travaux."],
  },
};

export default function CapabilitiesPage({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  const detail = details[locale];
  const [eyebrow, title, text] = copy.pages.capabilities;

  return (
    <>
      <PageIntro eyebrow={eyebrow} title={title} text={text} />
      <section className="capability-film section">
        <Reveal className="capability-film__media">
          <img
            className="capability-factory-image"
            src="/media/cirmano-factory-m07.webp"
            alt={detail.media}
            loading="lazy"
          />
        </Reveal>
        <Reveal className="capability-film__copy">
          <p className="eyebrow">{detail.material[0]}</p>
          <h2>{detail.material[1]}</h2>
          <p>{detail.material[2]}</p>
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
      <section className="workshop-evidence section">
        <Reveal className="workshop-evidence__intro">
          <p className="eyebrow">{detail.workshop[0]}</p>
          <h2>{detail.workshop[1]}</h2>
          <p>{detail.workshop[2]}</p>
        </Reveal>
        <div className="workshop-evidence__grid">
          {detail.workshop[3].map(([image, alt, caption]) => (
            <Reveal key={image}>
              <figure>
                <img src={image} alt={alt} loading="lazy" decoding="async" />
                <figcaption>{caption}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="remote-support section">
        <Reveal>
          <p className="eyebrow">{detail.support[0]}</p>
          <h2>{detail.support[1]}</h2>
        </Reveal>
        <Reveal>
          <p>{detail.support[2]}</p>
          <Link className="primary-button" to={`/${locale}/quote`}>
            <ArrowUpRight size={18} />
            {copy.nav.quote}
          </Link>
        </Reveal>
      </section>
    </>
  );
}
