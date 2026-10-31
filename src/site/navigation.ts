import type { Locale } from "../content";

// Information architecture from the brand pack handover brief:
// Home / About / Products / Manufacturing / Projects / Contact.
// en + zh come from 03_网站文案与产品/01_官网基础文案_中英.txt; ar / de / fr are drafts pending CIRMANO review.

type L = Record<Locale, string>;

export type ProductCategory = {
  slug: string;
  code: string;
  name: L;
  short: L;
  image: string;
  caption: L;
};

export const productCategories: ProductCategory[] = [
  {
    slug: "kitchens",
    code: "01",
    name: { en: "Kitchens", zh: "橱柜", ar: "المطابخ", de: "Küchen", fr: "Cuisines" },
    short: {
      en: "Made-to-measure cabinetry planned around your space, storage needs and material direction.",
      zh: "围绕空间、收纳需求与材质方向展开的定制柜体。",
      ar: "خزائن مصممة حسب المقاس وفق مساحتك واحتياجات التخزين واتجاه المواد.",
      de: "Maßgefertigte Schränke, geplant nach Raum, Stauraum und Materialrichtung.",
      fr: "Des meubles sur mesure pensés selon votre espace, vos rangements et vos matières.",
    },
    image: "/media/brand/p235-800.webp",
    // Brand pack: no standalone kitchen photography yet; show the dining area and say so.
    caption: { en: "Dining area · Guangzhou Residence", zh: "餐厅区域 · 广州住宅", ar: "منطقة الطعام · مسكن قوانغتشو", de: "Essbereich · Residenz Guangzhou", fr: "Espace repas · Résidence Guangzhou" },
  },
  {
    slug: "wardrobes-storage",
    code: "02",
    name: { en: "Wardrobes & Storage", zh: "衣柜与收纳", ar: "الخزائن والتخزين", de: "Schränke & Stauraum", fr: "Dressings & rangements" },
    short: {
      en: "Wardrobes, dressing rooms and integrated storage, with considered proportions and practical layouts.",
      zh: "衣柜、衣帽间及整合收纳，兼顾比例与使用布局。",
      ar: "خزائن ملابس وغرف تبديل وتخزين متكامل بنِسب مدروسة وتوزيع عملي.",
      de: "Kleiderschränke, Ankleiden und integrierter Stauraum mit durchdachten Proportionen.",
      fr: "Penderies, dressings et rangements intégrés, aux proportions réfléchies.",
    },
    image: "/media/brand/p099-800.webp",
    caption: { en: "Dressing room · Guangzhou Residence", zh: "衣帽间 · 广州住宅", ar: "غرفة الملابس · مسكن قوانغتشو", de: "Ankleide · Residenz Guangzhou", fr: "Dressing · Résidence Guangzhou" },
  },
  {
    slug: "interior-doors",
    code: "03",
    name: { en: "Interior Doors", zh: "室内门", ar: "الأبواب الداخلية", de: "Innentüren", fr: "Portes intérieures" },
    short: {
      en: "Interior doors designed to sit coherently with surrounding cabinetry and wall panels.",
      zh: "与相邻柜体、墙板保持一致设计语言的室内门。",
      ar: "أبواب داخلية مصممة لتنسجم مع الخزائن وألواح الجدران المحيطة.",
      de: "Innentüren, die sich stimmig in Schränke und Wandpaneele einfügen.",
      fr: "Des portes intérieures en cohérence avec les meubles et panneaux voisins.",
    },
    image: "/media/brand/p227-800.webp",
    caption: { en: "Dining area doors · Guangzhou Residence", zh: "餐厅区域门 · 广州住宅", ar: "أبواب منطقة الطعام · مسكن قوانغتشو", de: "Türen im Essbereich · Residenz Guangzhou", fr: "Portes de l’espace repas · Résidence Guangzhou" },
  },
  {
    slug: "wall-panels-woodwork",
    code: "04",
    name: { en: "Wall Panels & Woodwork", zh: "墙板与木作", ar: "ألواح الجدران والأعمال الخشبية", de: "Wandpaneele & Holzarbeiten", fr: "Panneaux muraux & menuiserie" },
    short: {
      en: "Decorative panels and architectural woodwork that connect surfaces and details across the home.",
      zh: "以装饰墙板和定制木作，连接空间中的表面与细节。",
      ar: "ألواح زخرفية وأعمال خشبية معمارية تربط الأسطح والتفاصيل في أرجاء المنزل.",
      de: "Dekorative Paneele und architektonische Holzarbeiten, die Flächen und Details verbinden.",
      fr: "Panneaux décoratifs et menuiserie architecturale qui relient surfaces et détails.",
    },
    image: "/media/brand/p088-800.webp",
    caption: { en: "Bedroom wall panel · Guangzhou Residence", zh: "主卧墙板 · 广州住宅", ar: "لوح جدار غرفة النوم · مسكن قوانغتشو", de: "Wandpaneel Schlafzimmer · Residenz Guangzhou", fr: "Panneau mural de chambre · Résidence Guangzhou" },
  },
  {
    slug: "aluminium-glass",
    code: "05",
    name: { en: "Aluminium & Glass", zh: "铝与玻璃", ar: "الألمنيوم والزجاج", de: "Aluminium & Glas", fr: "Aluminium & verre" },
    short: {
      en: "Aluminium and glass elements within an integrated interior scheme. Available configurations are discussed per project.",
      zh: "整合室内系统中的铝玻元素，具体可供配置按项目沟通。",
      ar: "عناصر من الألمنيوم والزجاج ضمن مخطط داخلي متكامل، وتُناقش التهيئات المتاحة لكل مشروع.",
      de: "Aluminium- und Glaselemente im integrierten Innenkonzept; Ausführungen je Projekt.",
      fr: "Éléments aluminium et verre d’un ensemble intérieur intégré ; configurations selon le projet.",
    },
    image: "/media/brand/p180-800.webp",
    caption: { en: "Glass display cabinet · Guangzhou Residence", zh: "玻璃展示柜 · 广州住宅", ar: "خزانة عرض زجاجية · مسكن قوانغتشو", de: "Glasvitrine · Residenz Guangzhou", fr: "Vitrine en verre · Résidence Guangzhou" },
  },
];

export const projectSpaces: { id: string; name: L }[] = [
  { id: "living", name: { en: "Living Room", zh: "客厅", ar: "غرفة المعيشة", de: "Wohnzimmer", fr: "Salon" } },
  { id: "dining", name: { en: "Dining Area", zh: "餐厅", ar: "منطقة الطعام", de: "Essbereich", fr: "Espace repas" } },
  { id: "entry", name: { en: "Entry Storage", zh: "玄关收纳", ar: "تخزين المدخل", de: "Eingangsstauraum", fr: "Rangements d’entrée" } },
  { id: "bedroom", name: { en: "Bedroom & Dressing Room", zh: "主卧与衣帽间", ar: "غرفة النوم وغرفة الملابس", de: "Schlafzimmer & Ankleide", fr: "Chambre & dressing" } },
  { id: "study", name: { en: "Study", zh: "书房", ar: "غرفة الدراسة", de: "Arbeitszimmer", fr: "Bureau" } },
  { id: "children", name: { en: "Children’s Room", zh: "儿童房", ar: "غرفة الأطفال", de: "Kinderzimmer", fr: "Chambre d’enfant" } },
  { id: "balcony", name: { en: "Balcony Storage", zh: "阳台柜", ar: "تخزين الشرفة", de: "Balkonstauraum", fr: "Rangements de balcon" } },
];

export type NavLink = { label: L; to: string };
export type NavSection = {
  id: "products" | "manufacturing" | "projects" | "about" | "contact";
  label: L;
  to: string;
  // Flyout content. Contact has no flyout: it is a direct link.
  primaryLabel?: L;
  primary?: NavLink[];
  secondaryLabel?: L;
  secondary?: NavLink[];
  preview?: { image: string; caption: L };
};

const t = (en: string, zh: string, ar: string, de: string, fr: string): L => ({ en, zh, ar, de, fr });

export const navSections: NavSection[] = [
  {
    id: "products",
    label: t("Products", "产品", "المنتجات", "Produkte", "Produits"),
    to: "products",
    primaryLabel: t("Explore Products", "探索产品", "استكشف المنتجات", "Produkte entdecken", "Découvrir les produits"),
    primary: productCategories.map((c) => ({ label: c.name, to: `products/${c.slug}` })),
    secondaryLabel: t("More", "更多", "المزيد", "Mehr", "Plus"),
    secondary: [
      { label: t("All products", "全部产品", "كل المنتجات", "Alle Produkte", "Tous les produits"), to: "products" },
      { label: t("Catalogues", "产品目录", "الكتالوجات", "Kataloge", "Catalogues"), to: "resources" },
      { label: t("Discuss your project", "沟通你的项目", "ناقش مشروعك", "Projekt besprechen", "Parler de votre projet"), to: "contact" },
    ],
  },
  {
    id: "manufacturing",
    label: t("Manufacturing", "制造", "التصنيع", "Fertigung", "Fabrication"),
    to: "manufacturing",
    primaryLabel: t("The detail behind the finished space", "完工空间背后的细节", "التفاصيل وراء المساحة المكتملة", "Das Detail hinter dem fertigen Raum", "Le détail derrière l’espace fini"),
    primary: [
      { label: t("Equipment", "设备", "المعدات", "Ausstattung", "Équipement"), to: "manufacturing#equipment" },
      { label: t("Panel processing", "板件加工", "معالجة الألواح", "Plattenbearbeitung", "Usinage des panneaux"), to: "manufacturing#panels" },
      { label: t("Edge finishing", "封边处理", "تشطيب الحواف", "Kantenbearbeitung", "Finition des chants"), to: "manufacturing#edges" },
      { label: t("Inspection & trial assembly", "检查与试装", "الفحص والتجميع التجريبي", "Prüfung & Probemontage", "Contrôle & montage à blanc"), to: "manufacturing#inspection" },
    ],
    secondaryLabel: t("Foshan, China", "中国佛山", "فوشان، الصين", "Foshan, China", "Foshan, Chine"),
    secondary: [
      { label: t("German HOMAG equipment", "德国 HOMAG 设备", "معدات HOMAG الألمانية", "HOMAG-Maschinen aus Deutschland", "Équipement HOMAG allemand"), to: "manufacturing#equipment" },
    ],
    preview: { image: "/media/brand/m07-800.webp", caption: t("Edgebanding line · Foshan workshop", "封边产线 · 佛山工厂", "خط تشطيب الحواف · ورشة فوشان", "Kantenanleimlinie · Werkstatt Foshan", "Ligne de plaquage · atelier de Foshan") },
  },
  {
    id: "projects",
    label: t("Projects", "项目", "المشاريع", "Projekte", "Projets"),
    to: "projects",
    primaryLabel: t("Guangzhou Residence", "广州住宅", "مسكن قوانغتشو", "Residenz Guangzhou", "Résidence Guangzhou"),
    primary: projectSpaces.map((s) => ({ label: s.name, to: `projects#${s.id}` })),
    secondaryLabel: t("Completed project", "完工项目", "مشروع مكتمل", "Fertiggestelltes Projekt", "Projet réalisé"),
    secondary: [{ label: t("View the residence", "查看完整项目", "شاهد المسكن", "Residenz ansehen", "Voir la résidence"), to: "projects" }],
    preview: { image: "/media/brand/p179-800.webp", caption: t("Living room · Guangzhou Residence", "客厅 · 广州住宅", "غرفة المعيشة · مسكن قوانغتشو", "Wohnzimmer · Residenz Guangzhou", "Salon · Résidence Guangzhou") },
  },
  {
    id: "about",
    label: t("About", "关于", "من نحن", "Über uns", "À propos"),
    to: "about",
    primaryLabel: t("CIRMANO", "CIRMANO 西尔曼", "CIRMANO", "CIRMANO", "CIRMANO"),
    primary: [
      { label: t("Our brand", "品牌介绍", "علامتنا", "Unsere Marke", "Notre marque"), to: "about" },
      { label: t("Principles", "品牌原则", "المبادئ", "Prinzipien", "Principes"), to: "about#principles" },
      { label: t("Team", "团队", "الفريق", "Team", "Équipe"), to: "about#team" },
    ],
    secondaryLabel: t("Follow", "关注我们", "تابعنا", "Folgen", "Suivre"),
    secondary: [],
    preview: { image: "/media/brand/f013-800.webp", caption: t("Foshan workshop", "佛山工厂", "ورشة فوشان", "Werkstatt Foshan", "Atelier de Foshan") },
  },
  { id: "contact", label: t("Contact", "联系", "تواصل", "Kontakt", "Contact"), to: "contact" },
];

export const navCopy = {
  cta: t("Discuss Your Project", "沟通项目", "ناقش مشروعك", "Projekt besprechen", "Parler de votre projet"),
  whatsapp: t("WhatsApp", "WhatsApp", "واتساب", "WhatsApp", "WhatsApp"),
  menu: t("Menu", "菜单", "القائمة", "Menü", "Menu"),
  close: t("Close", "关闭", "إغلاق", "Schließen", "Fermer"),
  language: t("Language", "语言", "اللغة", "Sprache", "Langue"),
  localTime: t("Local time", "当地时间", "التوقيت المحلي", "Ortszeit", "Heure locale"),
  more: t("More", "更多", "المزيد", "Mehr", "Plus"),
  home: t("CIRMANO home", "CIRMANO 首页", "الصفحة الرئيسية لـ CIRMANO", "CIRMANO Startseite", "Accueil CIRMANO"),
};
