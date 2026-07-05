import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import MediaFilm from "../components/MediaFilm";
import PageIntro from "../components/PageIntro";
import Reveal from "../components/Reveal";
import { getCopy, type Locale } from "../content";

const details: Record<
  Locale,
  {
    media: string;
    material: [string, string, string];
    support: [string, string, string];
  }
> = {
  en: {
    media: "Material and wall panel development",
    material: ["Material control", "One approved sample becomes the reference.", "Grain direction, sheen, color, edge detail and hardware are coordinated before production. Verified factory and inspection media will be added as it becomes available."],
    support: ["Installation boundary", "Prepared here. Installed with local teams.", "MLWK supplies labeling, packing schedules, installation drawings, video references and remote guidance. Site installation remains with the client or appointed local contractor unless separately agreed in writing."],
  },
  zh: {
    media: "材料与墙板深化",
    material: ["材料控制", "一块确认样，成为全程标准。", "木纹方向、光泽、颜色、封边细节与五金在生产前统一确认。真实工厂与质检影像将在核验后逐步补充。"],
    support: ["安装边界", "在这里准备，由当地团队完成安装。", "MLWK 提供编号、包装清单、安装图纸、视频参考与远程指导。除非另有书面约定，现场安装由客户或指定的当地承包商负责。"],
  },
  ar: {
    media: "تطوير المواد وكسوات الجدران",
    material: ["ضبط المواد", "العينة المعتمدة تصبح المرجع.", "يتم تنسيق اتجاه العروق واللمعان واللون والحواف والتجهيزات قبل الإنتاج، مع إضافة مواد المصنع والفحص الموثقة عند توفرها."],
    support: ["حدود التركيب", "نجهز هنا، ويركب الفريق المحلي.", "توفر MLWK الترقيم وجداول التعبئة ورسومات التركيب والمراجع المصورة والإرشاد عن بعد. يبقى التركيب الميداني مسؤولية العميل أو المقاول المحلي ما لم يُتفق كتابياً."],
  },
  de: {
    media: "Material- und Wandpaneelentwicklung",
    material: ["Materialkontrolle", "Ein freigegebenes Muster wird zur Referenz.", "Maserung, Glanz, Farbe, Kanten und Beschläge werden vor der Produktion abgestimmt. Verifizierte Werks- und Prüfaufnahmen werden ergänzt, sobald sie vorliegen."],
    support: ["Montagegrenze", "Hier vorbereitet. Mit lokalen Teams montiert.", "MLWK liefert Kennzeichnung, Packlisten, Montagezeichnungen, Videoreferenzen und Fernunterstützung. Die Montage vor Ort bleibt beim Kunden oder lokalen Auftragnehmer, sofern nichts anderes schriftlich vereinbart ist."],
  },
  fr: {
    media: "Développement des matériaux et panneaux muraux",
    material: ["Maîtrise des matériaux", "Un échantillon approuvé devient la référence.", "Le fil, la brillance, la couleur, les chants et les quincailleries sont coordonnés avant production. Les médias d'usine et de contrôle vérifiés seront ajoutés lorsqu'ils seront disponibles."],
    support: ["Limite de pose", "Préparé ici. Installé avec les équipes locales.", "MLWK fournit repérage, plans de colisage, plans de pose, références vidéo et assistance à distance. La pose sur site reste à la charge du client ou de l'entreprise locale, sauf accord écrit distinct."],
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
          <MediaFilm
            src="/media/wall-panels-generated.mp4"
            poster="/media/wall-panels.png"
            label={detail.media}
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
