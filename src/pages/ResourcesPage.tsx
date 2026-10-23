import {
  ArrowUpRight,
  BookOpen,
  Boxes,
  FileText,
  HelpCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageIntro from "../components/PageIntro";
import Reveal from "../components/Reveal";
import { getCopy, type Locale } from "../content";

const resourceContent: Record<
  Locale,
  {
    status: string;
    action: string;
    faqTitle: string;
    items: Array<[string, string, string]>;
    faqs: Array<[string, string]>;
  }
> = {
  en: {
    status: "In preparation",
    action: "Request with project",
    faqTitle: "Before you send a project",
    items: [
      ["Product overview", "Core categories, supplementary scope and the information needed to begin.", "In preparation"],
      ["Material reference", "Project-specific material and finish information.", "In preparation"],
      ["Drawing checklist", "Information that helps the team review an initial enquiry.", "In preparation"],
    ],
    faqs: [
      ["What files can I send?", "PDF, DWG, DXF, ZIP, JPG and PNG files are accepted through the project enquiry form."],
      ["Can CIRMANO work from design intent drawings?", "The team can review the available drawings and confirm any further development or documentation in the written project scope."],
      ["Who handles installation?", "Installation responsibility and any local coordination are reviewed and confirmed in writing for each project."],
      ["Are the website images completed projects?", "The project page identifies photography from one completed Guangzhou residence. Product supply and installation scope should be confirmed for each published detail."],
    ],
  },
  zh: {
    status: "整理中",
    action: "随项目索取",
    faqTitle: "提交项目前",
    items: [
      ["产品范围概览", "核心产品类别、补充项目范围与启动咨询所需信息。", "整理中"],
      ["材料参考", "按项目确认的材料与饰面信息。", "整理中"],
      ["图纸清单", "帮助团队审核初步需求的信息。", "整理中"],
    ],
    faqs: [
      ["可以发送哪些文件？", "项目询价表支持 PDF、DWG、DXF、ZIP、JPG 和 PNG。"],
      ["可以从概念设计图开始吗？", "团队可审核现有图纸，并在书面项目范围中确认后续深化或资料工作。"],
      ["项目安装由谁负责？", "每个项目的安装责任和当地协调事项都会逐项审核并书面确认。"],
      ["网站图片都是完工案例吗？", "项目页面说明目前展示的是广州一处完工住宅。每项产品的供货与施工范围仍需确认。"],
    ],
  },
  ar: {
    status: "قيد الإعداد",
    action: "اطلبه مع المشروع",
    faqTitle: "قبل إرسال المشروع",
    items: [
      ["نظرة عامة على المنتجات", "الفئات الأساسية والنطاقات التكميلية والمعلومات اللازمة لبدء الاستفسار.", "قيد الإعداد"],
      ["مرجع المواد", "معلومات المواد والتشطيبات المحددة لكل مشروع.", "قيد الإعداد"],
      ["قائمة الرسومات", "المعلومات التي تساعد الفريق على مراجعة الاستفسار الأولي.", "قيد الإعداد"],
    ],
    faqs: [
      ["ما الملفات التي يمكن إرسالها؟", "يقبل نموذج المشروع ملفات PDF وDWG وDXF وZIP وJPG وPNG."],
      ["هل يمكن البدء برسومات الفكرة؟", "يراجع الفريق الرسومات المتاحة ويؤكد أي تطوير أو وثائق إضافية ضمن نطاق المشروع المكتوب."],
      ["من المسؤول عن التركيب؟", "تُراجع مسؤوليات التركيب وأي تنسيق محلي وتُعتمد كتابياً لكل مشروع."],
      ["هل كل صور الموقع لمشاريع مكتملة؟", "توضح صفحة المشاريع أن الصور الحالية من مسكن مكتمل واحد في قوانغتشو. ويجب تأكيد نطاق التوريد والتركيب لكل تفصيل."],
    ],
  },
  de: {
    status: "In Vorbereitung",
    action: "Mit Projekt anfragen",
    faqTitle: "Vor der Projektanfrage",
    items: [
      ["Produktübersicht", "Kernkategorien, ergänzender Umfang und Angaben für eine erste Anfrage.", "In Vorbereitung"],
      ["Materialreferenz", "Projektbezogene Informationen zu Materialien und Oberflächen.", "In Vorbereitung"],
      ["Planungscheckliste", "Angaben, die eine erste Projektprüfung unterstützen.", "In Vorbereitung"],
    ],
    faqs: [
      ["Welche Dateien kann ich senden?", "Das Anfrageformular akzeptiert PDF, DWG, DXF, ZIP, JPG und PNG."],
      ["Kann CIRMANO mit Entwurfszeichnungen arbeiten?", "Das Team prüft verfügbare Pläne und bestätigt weitere Entwicklung oder Unterlagen im schriftlichen Projektumfang."],
      ["Wer ist für die Montage zuständig?", "Montageverantwortung und lokale Abstimmung werden je Projekt geprüft und schriftlich bestätigt."],
      ["Zeigen alle Bilder fertige Projekte?", "Die Projektseite weist auf Fotografien aus einem fertiggestellten Wohnhaus in Guangzhou hin. Liefer- und Montageumfang sind je Detail zu bestätigen."],
    ],
  },
  fr: {
    status: "En préparation",
    action: "Demander avec le projet",
    faqTitle: "Avant d'envoyer un projet",
    items: [
      ["Aperçu des produits", "Catégories principales, éléments complémentaires et informations pour une première demande.", "En préparation"],
      ["Référence des matériaux", "Informations sur les matériaux et finitions selon le projet.", "En préparation"],
      ["Liste des plans", "Les informations utiles à l'examen d'une première demande.", "En préparation"],
    ],
    faqs: [
      ["Quels fichiers puis-je envoyer ?", "Le formulaire accepte les fichiers PDF, DWG, DXF, ZIP, JPG et PNG."],
      ["CIRMANO peut-il partir de plans d'intention ?", "L'équipe peut examiner les plans disponibles et confirmer les études ou documents complémentaires dans le périmètre écrit."],
      ["Qui prend en charge la pose ?", "Les responsabilités de pose et toute coordination locale sont examinées et confirmées par écrit pour chaque projet."],
      ["Toutes les images sont-elles des projets réalisés ?", "La page Projets signale des photos d'une résidence achevée à Guangzhou. Le périmètre de fourniture et de pose est à confirmer pour chaque détail."],
    ],
  },
};

const resourceIcons = [BookOpen, Boxes, FileText] as const;

export default function ResourcesPage({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  const content = resourceContent[locale];
  const [eyebrow, title, text] = copy.pages.resources;

  return (
    <>
      <PageIntro eyebrow={eyebrow} title={title} text={text} />
      <section className="resource-grid section">
        {content.items.map(([itemTitle, itemText, meta], index) => {
          const Icon = resourceIcons[index];
          return (
            <Reveal className="resource-item" key={itemTitle}>
              <Icon size={25} />
              <span>0{index + 1}</span>
              <h2>{itemTitle}</h2>
              <p>{itemText}</p>
              <div className="resource-item__meta">
                <small>{meta}</small>
                <i>{content.status}</i>
              </div>
              <Link to={`/${locale}/quote`}>
                {content.action}
                <ArrowUpRight size={16} />
              </Link>
            </Reveal>
          );
        })}
      </section>
      <section className="faq section section--soft">
        <Reveal className="faq-heading">
          <HelpCircle size={26} />
          <h2>{content.faqTitle}</h2>
        </Reveal>
        <div className="faq-list">
          {content.faqs.map(([question, answer]) => (
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
