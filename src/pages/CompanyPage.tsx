import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import PageIntro from "../components/PageIntro";
import Reveal from "../components/Reveal";
import { getCopy, type Locale } from "../content";

const companyDetails: Record<
  Locale,
  {
    story: [string, string, string];
    metrics: [string, string, string];
    evidence: [string, string, string];
  }
> = {
  en: {
    story: ["The name", "Millwork, without the unnecessary letters.", "MLWK borrows the concise abbreviation used in architectural drawings. It signals what we make and how we prefer to work: directly, precisely and close to the project information."],
    metrics: ["Custom projects completed", "Coordinated manufacturing partner", "Core millwork systems"],
    evidence: ["Factory evidence", "Only original factory evidence.", "Equipment, teams, quality checks, packing and loading will be shown here only with original MLWK photography. Certification, capacity, lead-time and MOQ claims remain unpublished until the underlying records are ready."],
  },
  zh: {
    story: ["品牌名称", "Millwork，省去不必要的字母。", "MLWK 源自建筑图纸中对 Millwork 的简写。它说明我们制造什么，也说明我们的工作方式：直接、精确，并始终贴近项目资料。"],
    metrics: ["累计完成定制项目", "一个协调制造伙伴", "六大核心木作系统"],
    evidence: ["工厂证明", "只展示真实的工厂证据。", "设备、团队、质检、包装与装柜只使用 MLWK 原创影像。认证、产能、交期与 MOQ 在底层资料核验完成前不会发布。"],
  },
  ar: {
    story: ["الاسم", "Millwork من دون حروف غير ضرورية.", "MLWK هو الاختصار المستخدم في الرسومات المعمارية لأعمال النجارة الثابتة. ويعبر عن عملنا وطريقتنا: مباشرة ودقيقة ومرتبطة بمعلومات المشروع."],
    metrics: ["مشاريع مخصصة مكتملة", "شريك تصنيع منسق", "أنظمة نجارة أساسية"],
    evidence: ["دليل المصنع", "أدلة أصلية فقط من المصنع.", "لن تُعرض المعدات والفرق والفحص والتعبئة والتحميل إلا بصور MLWK الأصلية. ولا تُنشر ادعاءات الشهادات أو الطاقة أو المدة أو الحد الأدنى قبل توثيقها."],
  },
  de: {
    story: ["Der Name", "Millwork, ohne unnötige Buchstaben.", "MLWK übernimmt die knappe Abkürzung aus Architekturzeichnungen. Sie beschreibt, was wir fertigen und wie wir arbeiten: direkt, präzise und nah an den Projektinformationen."],
    metrics: ["Abgeschlossene Maßprojekte", "Koordinierter Fertigungspartner", "Zentrale Innenausbausysteme"],
    evidence: ["Werksnachweise", "Nur originale Werksnachweise.", "Anlagen, Teams, Qualitätsprüfungen, Verpackung und Verladung werden ausschließlich mit originalen MLWK-Aufnahmen gezeigt. Angaben zu Zertifizierung, Kapazität, Lieferzeit und MOQ bleiben bis zur Prüfung unveröffentlicht."],
  },
  fr: {
    story: ["Le nom", "Millwork, sans les lettres inutiles.", "MLWK reprend l'abréviation concise des plans d'architecture. Elle exprime ce que nous fabriquons et notre manière de travailler : directe, précise et proche des informations du projet."],
    metrics: ["Projets sur mesure réalisés", "Partenaire de fabrication coordonné", "Systèmes de menuiserie essentiels"],
    evidence: ["Preuves de fabrication", "Uniquement des preuves originales.", "Équipements, équipes, contrôles, emballage et chargement ne seront présentés qu'avec des images originales MLWK. Certifications, capacité, délais et MOQ restent non publiés avant vérification."],
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
          <span>M</span>
          <span>L</span>
          <span>W</span>
          <span>K</span>
        </Reveal>
        <Reveal className="name-story__copy">
          <p className="eyebrow">{detail.story[0]}</p>
          <h2>{detail.story[1]}</h2>
          <p>{detail.story[2]}</p>
        </Reveal>
      </section>
      <section className="company-proof section section--soft">
        <Reveal>
          <strong>500+</strong>
          <span>{detail.metrics[0]}</span>
        </Reveal>
        <Reveal>
          <strong>01</strong>
          <span>{detail.metrics[1]}</span>
        </Reveal>
        <Reveal>
          <strong>06</strong>
          <span>{detail.metrics[2]}</span>
        </Reveal>
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
    </>
  );
}
