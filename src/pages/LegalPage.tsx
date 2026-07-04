import PageIntro from "../components/PageIntro";
import Reveal from "../components/Reveal";
import { getCopy, type Locale } from "../content";

type StoreLegalType = "shipping" | "returns";
type StoreLegalContent = {
  page: [string, string, string];
  items: string[];
};

const legalAdditions: Record<Locale, Record<StoreLegalType, StoreLegalContent>> = {
  en: {
    shipping: {
      page: ["Store policy", "Shipping and duties", "How preview-store delivery charges and cross-border duties are presented."],
      items: [
        "The current shop is a Sandbox preview and does not dispatch physical goods.",
        "Preview shipping is calculated by destination zone and shown before payment approval.",
        "Import duties, customs clearance fees and local taxes are not included unless a future product page states otherwise.",
        "Verified dispatch methods, carriers, tracking and delivery windows will be published before live sales begin.",
      ],
    },
    returns: {
      page: ["Store policy", "Returns and refunds", "The launch-stage policy for the preview catalogue and future physical orders."],
      items: [
        "The current catalogue uses PayPal Sandbox and no real payment or physical return can occur.",
        "Live return windows, eligibility and return addresses will be published before production payments are enabled.",
        "Made-to-order project work is governed by project-specific commercial terms and is not covered by the standard-product return policy.",
        "Verified payment refunds will be issued to the original payment method after approval.",
      ],
    },
  },
  zh: {
    shipping: {
      page: ["商城政策", "运输与税费", "说明预览商城如何展示跨境运费、关税与目的地费用。"],
      items: [
        "当前商城为 Sandbox 演示环境，不会发出实体商品。",
        "演示运费按收货地区计算，并在批准付款前清晰显示。",
        "除非未来商品页另有说明，进口关税、清关费及当地税费均不包含在商品或运费中。",
        "正式销售前将公布经确认的承运方式、物流商、追踪服务及预计送达时间。",
      ],
    },
    returns: {
      page: ["商城政策", "退货与退款", "适用于演示商品目录及未来实体订单的上线阶段政策。"],
      items: [
        "当前商品目录使用 PayPal Sandbox，不会产生真实扣款或实体退货。",
        "正式启用生产环境付款前，将公布退货期限、适用条件及退货地址。",
        "按项目定制的产品遵循对应项目合同，不适用标品商城的常规退货政策。",
        "经审核批准的退款将原路退回至付款方式。",
      ],
    },
  },
  ar: {
    shipping: {
      page: ["سياسة المتجر", "الشحن والرسوم", "كيفية عرض رسوم الشحن عبر الحدود والرسوم الجمركية في المتجر التجريبي."],
      items: [
        "المتجر الحالي بيئة تجريبية ولا يرسل أي منتجات فعلية.",
        "تُحسب رسوم الشحن التجريبية حسب منطقة الوجهة وتظهر قبل الموافقة على الدفع.",
        "لا تشمل الأسعار رسوم الاستيراد أو التخليص الجمركي أو الضرائب المحلية ما لم يُذكر خلاف ذلك مستقبلاً.",
        "ستنشر طرق الشحن وشركات النقل والتتبع ومواعيد التسليم المعتمدة قبل بدء المبيعات الفعلية.",
      ],
    },
    returns: {
      page: ["سياسة المتجر", "الإرجاع والاسترداد", "سياسة مرحلة الإطلاق للكتالوج التجريبي والطلبات الفعلية مستقبلاً."],
      items: [
        "يستخدم الكتالوج الحالي PayPal Sandbox، لذلك لا تحدث مدفوعات أو عمليات إرجاع فعلية.",
        "ستنشر مدة الإرجاع وشروط الأهلية وعناوين الإرجاع قبل تفعيل المدفوعات الفعلية.",
        "تخضع الأعمال المصنوعة حسب الطلب لشروط المشروع ولا تشملها سياسة إرجاع المنتجات القياسية.",
        "تُعاد المبالغ المعتمدة إلى وسيلة الدفع الأصلية بعد الموافقة.",
      ],
    },
  },
  de: {
    shipping: {
      page: ["Shop-Richtlinie", "Versand und Abgaben", "So werden Versandkosten und grenzuberschreitende Abgaben im Vorschau-Shop dargestellt."],
      items: [
        "Der aktuelle Shop ist eine Sandbox-Vorschau und versendet keine physischen Waren.",
        "Die Vorschau-Versandkosten werden nach Zielregion berechnet und vor der Zahlungsfreigabe angezeigt.",
        "Einfuhrzolle, Abfertigungsgebuhren und lokale Steuern sind nicht enthalten, sofern kunftige Produktseiten nichts anderes angeben.",
        "Bestatigte Versandarten, Dienstleister, Sendungsverfolgung und Lieferzeiten werden vor dem Live-Verkauf veroffentlicht.",
      ],
    },
    returns: {
      page: ["Shop-Richtlinie", "Ruckgabe und Erstattung", "Die Einfuhrungsrichtlinie fur den Vorschaukatalog und kunftige physische Bestellungen."],
      items: [
        "Der aktuelle Katalog verwendet PayPal Sandbox; echte Zahlungen oder Rucksendungen finden nicht statt.",
        "Ruckgabefristen, Voraussetzungen und Adressen werden vor Aktivierung echter Zahlungen veroffentlicht.",
        "Projektbezogene Massanfertigungen unterliegen ihren Vertragsbedingungen und nicht der Ruckgaberichtlinie fur Standardprodukte.",
        "Genehmigte Erstattungen werden auf die ursprungliche Zahlungsart zuruckgezahlt.",
      ],
    },
  },
  fr: {
    shipping: {
      page: ["Politique boutique", "Livraison et droits", "Presentation des frais de livraison transfrontaliers et des droits dans la boutique de demonstration."],
      items: [
        "La boutique actuelle est une demonstration Sandbox et n'expedie aucun produit physique.",
        "Les frais de livraison sont calcules selon la zone de destination et affiches avant l'approbation du paiement.",
        "Les droits d'importation, frais de dedouanement et taxes locales ne sont pas inclus, sauf mention contraire sur une future fiche produit.",
        "Les modes d'expedition, transporteurs, suivis et delais verifies seront publies avant le lancement des ventes reelles.",
      ],
    },
    returns: {
      page: ["Politique boutique", "Retours et remboursements", "La politique de lancement du catalogue de demonstration et des futures commandes physiques."],
      items: [
        "Le catalogue actuel utilise PayPal Sandbox; aucun paiement ni retour physique reel n'est effectue.",
        "Les delais, conditions et adresses de retour seront publies avant l'activation des paiements reels.",
        "Les realisations sur mesure relevent de leurs conditions contractuelles et non de la politique de retour des produits standard.",
        "Les remboursements approuves seront reverses sur le moyen de paiement d'origine.",
      ],
    },
  },
};

export default function LegalPage({
  locale,
  type,
}: {
  locale: Locale;
  type: "privacy" | "terms" | StoreLegalType;
}) {
  const copy = getCopy(locale);
  const page =
    type === "privacy" || type === "terms"
      ? copy.pages[type]
      : legalAdditions[locale][type].page;
  const items =
    type === "privacy" || type === "terms"
      ? copy.legal[type]
      : legalAdditions[locale][type].items;
  const [eyebrow, title, text] = page;

  return (
    <>
      <PageIntro eyebrow={eyebrow} title={title} text={text} />
      <section className="legal-copy section">
        {items.map((item, index) => (
          <Reveal key={item}>
            <span>0{index + 1}</span>
            <p>{item}</p>
          </Reveal>
        ))}
        <p className="legal-note">Launch preview | Last updated 4 July 2026</p>
      </section>
    </>
  );
}
