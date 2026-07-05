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
      ["Collection overview", "Six systems and the project information needed to start.", "PDF · EN · v1.0"],
      ["Finish reference", "How samples, control references and production approvals work.", "PDF · EN · v1.0"],
      ["Drawing checklist", "A practical checklist for a more useful first quotation.", "PDF · EN · v1.0"],
    ],
    faqs: [
      ["What files can I send?", "PDF, DWG, DXF, ZIP, JPG and PNG files are accepted through the project enquiry form."],
      ["Can MLWK work from design intent drawings?", "Yes. The review identifies missing details and defines what must be developed before production."],
      ["Does MLWK install overseas?", "The service includes labeled packages, installation information and remote guidance for the appointed local team."],
      ["Are the website images completed projects?", "Only case studies explicitly identified as verified projects represent completed work."],
    ],
  },
  zh: {
    status: "整理中",
    action: "随项目索取",
    faqTitle: "提交项目前",
    items: [
      ["产品系统概览", "六大产品系统，以及启动项目所需的基础资料。", "PDF · 中文 · v1.0"],
      ["饰面参考手册", "说明样品、控制样和生产确认的工作方式。", "PDF · 中文 · v1.0"],
      ["图纸检查清单", "帮助首次询价获得更准确回复的实用清单。", "PDF · 中文 · v1.0"],
    ],
    faqs: [
      ["可以发送哪些文件？", "项目询价表支持 PDF、DWG、DXF、ZIP、JPG 和 PNG。"],
      ["可以从概念设计图开始吗？", "可以。我们会识别缺失信息，并明确生产前需要深化的内容。"],
      ["MLWK 是否提供海外安装？", "我们提供编号包装、安装资料和面向当地安装团队的远程指导。"],
      ["网站图片都是完工案例吗？", "只有明确标注为已核验项目的案例才代表已完成工程。"],
    ],
  },
  ar: {
    status: "قيد الإعداد",
    action: "اطلبه مع المشروع",
    faqTitle: "قبل إرسال المشروع",
    items: [
      ["نظرة عامة على المجموعات", "ستة أنظمة والمعلومات اللازمة لبدء المشروع.", "PDF · العربية · v1.0"],
      ["مرجع التشطيبات", "آلية اعتماد العينات والمراجع والإنتاج.", "PDF · العربية · v1.0"],
      ["قائمة مراجعة الرسومات", "قائمة عملية للحصول على عرض أولي أدق.", "PDF · العربية · v1.0"],
    ],
    faqs: [
      ["ما الملفات التي يمكن إرسالها؟", "يقبل نموذج المشروع ملفات PDF وDWG وDXF وZIP وJPG وPNG."],
      ["هل يمكن البدء برسومات الفكرة؟", "نعم. تحدد المراجعة التفاصيل الناقصة وما يلزم تطويره قبل الإنتاج."],
      ["هل تقدم MLWK التركيب خارج الصين؟", "نوفر عبوات مرقمة ومعلومات تركيب وإرشاداً عن بعد للفريق المحلي."],
      ["هل كل صور الموقع لمشاريع مكتملة؟", "فقط دراسات الحالة المعرّفة بوضوح كمشاريع موثقة تمثل أعمالاً مكتملة."],
    ],
  },
  de: {
    status: "In Vorbereitung",
    action: "Mit Projekt anfragen",
    faqTitle: "Vor der Projektanfrage",
    items: [
      ["Systemübersicht", "Sechs Systeme und die Informationen für einen Projektstart.", "PDF · DE · v1.0"],
      ["Oberflächenreferenz", "Ablauf für Muster, Kontrollreferenzen und Produktionsfreigaben.", "PDF · DE · v1.0"],
      ["Zeichnungscheckliste", "Praktische Checkliste für ein präziseres Erstangebot.", "PDF · DE · v1.0"],
    ],
    faqs: [
      ["Welche Dateien kann ich senden?", "Das Anfrageformular akzeptiert PDF, DWG, DXF, ZIP, JPG und PNG."],
      ["Kann MLWK mit Entwurfszeichnungen arbeiten?", "Ja. Die Prüfung benennt fehlende Details und notwendige Entwicklungsschritte."],
      ["Installiert MLWK im Ausland?", "Wir liefern beschriftete Pakete, Installationsunterlagen und Fernunterstützung für lokale Teams."],
      ["Zeigen alle Bilder fertige Projekte?", "Nur ausdrücklich verifizierte Fallstudien stehen für fertiggestellte Arbeiten."],
    ],
  },
  fr: {
    status: "En préparation",
    action: "Demander avec le projet",
    faqTitle: "Avant d'envoyer un projet",
    items: [
      ["Aperçu des collections", "Six systèmes et les informations nécessaires pour démarrer.", "PDF · FR · v1.0"],
      ["Référence des finitions", "Fonctionnement des échantillons, témoins et validations.", "PDF · FR · v1.0"],
      ["Liste de contrôle des plans", "Une liste pratique pour un premier devis plus précis.", "PDF · FR · v1.0"],
    ],
    faqs: [
      ["Quels fichiers puis-je envoyer ?", "Le formulaire accepte les fichiers PDF, DWG, DXF, ZIP, JPG et PNG."],
      ["MLWK peut-il partir de plans d'intention ?", "Oui. La revue identifie les détails manquants et les études nécessaires avant production."],
      ["MLWK installe-t-il à l'étranger ?", "Nous fournissons des colis repérés, des documents de pose et une assistance à distance."],
      ["Toutes les images sont-elles des projets réalisés ?", "Seules les études de cas explicitement vérifiées représentent des réalisations terminées."],
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
