import type { Locale } from "../content";
import { inspirationProjects } from "./inspiration";
import { inspirationEnabled } from "./features";

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
    image: "/media/brand/r004-800.webp",
    caption: { en: "Kitchen & dining · Guangzhou Residence", zh: "厨房与餐厅 · 广州住宅", ar: "المطبخ وغرفة الطعام · مسكن قوانغتشو", de: "Küche & Essbereich · Residenz Guangzhou", fr: "Cuisine & salle à manger · Résidence Guangzhou" },
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
    image: "/media/brand/r022-800.webp",
    caption: { en: "Master bedroom wardrobes · Guangzhou Residence", zh: "主卧衣柜 · 广州住宅", ar: "خزائن غرفة النوم الرئيسية · مسكن قوانغتشو", de: "Kleiderschränke im Hauptschlafzimmer · Residenz Guangzhou", fr: "Penderies de la chambre principale · Résidence Guangzhou" },
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
    image: "/media/brand/r016-800.webp",
    caption: { en: "Flush hallway door · Guangzhou Residence", zh: "过道隐形门 · 广州住宅", ar: "باب مسطح في الممر · مسكن قوانغتشو", de: "Flächenbündige Tür im Flur · Residenz Guangzhou", fr: "Porte affleurante du couloir · Résidence Guangzhou" },
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
    image: "/media/brand/r119-800.webp",
    caption: { en: "Tea room woodwork · Guangzhou Residence", zh: "茶室木作 · 广州住宅", ar: "أعمال خشبية في غرفة الشاي · مسكن قوانغتشو", de: "Holzarbeiten im Teeraum · Residenz Guangzhou", fr: "Menuiserie du salon de thé · Résidence Guangzhou" },
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
    image: "/media/brand/r098-800.webp",
    caption: { en: "Glass-front tall cabinet · Guangzhou Residence", zh: "玻璃门高柜 · 广州住宅", ar: "خزانة طويلة بواجهة زجاجية · مسكن قوانغتشو", de: "Hochschrank mit Glasfront · Residenz Guangzhou", fr: "Colonne à façade vitrée · Résidence Guangzhou" },
  },
];

export const projectSpaces: { id: string; name: L }[] = [
  { id: "living", name: { en: "Living Room", zh: "客厅", ar: "غرفة المعيشة", de: "Wohnzimmer", fr: "Salon" } },
  { id: "kitchen", name: { en: "Kitchen & Dining", zh: "厨房与餐厅", ar: "المطبخ وغرفة الطعام", de: "Küche & Essbereich", fr: "Cuisine & salle à manger" } },
  { id: "tearoom", name: { en: "Tea Room", zh: "茶室", ar: "غرفة الشاي", de: "Teeraum", fr: "Salon de thé" } },
  { id: "bedroom", name: { en: "Bedroom & Dressing Room", zh: "主卧与衣帽间", ar: "غرفة النوم وغرفة الملابس", de: "Schlafzimmer & Ankleide", fr: "Chambre & dressing" } },
  { id: "children", name: { en: "Children’s Room", zh: "儿童房", ar: "غرفة الأطفال", de: "Kinderzimmer", fr: "Chambre d’enfant" } },
  { id: "bathroom", name: { en: "Bathroom", zh: "卫生间", ar: "الحمّام", de: "Badezimmer", fr: "Salle de bains" } },
  { id: "entry", name: { en: "Entry & Hallway", zh: "玄关与过道", ar: "المدخل والممر", de: "Eingang & Flur", fr: "Entrée & couloir" } },
];

export type NavLink = { label: L; to: string; external?: boolean; image?: string; caption?: L };
export type NavGroup = { title: L; items: NavLink[] };
export type NavSection = {
  id: "products" | "manufacturing" | "service" | "projects" | "about" | "contact";
  label: L;
  to: string;
  // Flyout content. Contact has no flyout: it is a direct link.
  primaryLabel?: L;
  primary?: NavLink[];
  secondaryLabel?: L;
  secondary?: NavLink[];
  groups?: NavGroup[];
  preview?: { image: string; caption: L };
};

const t = (en: string, zh: string, ar: string, de: string, fr: string): L => ({ en, zh, ar, de, fr });

export const VR_TOUR_URL = "https://www.yunjing720.com/index.php?s=tour%2Findex%2Findex&tid=ee70fe8401d34b5bbe70938a99b3cc72";

const cat = (slug: string) => productCategories.find((c) => c.slug === slug)!;
const productGroups: NavGroup[] = [
  {
    title: t("Cabinetry & Furniture", "定制柜体与家具", "الخزائن والأثاث المفصّل", "Maßschränke & Möbel", "Meubles & rangements sur mesure"),
    items: [
      { label: t("Kitchen Cabinets", "厨房橱柜", "خزائن المطبخ", "Küchenschränke", "Meubles de cuisine"), to: "products/kitchens", image: cat("kitchens").image, caption: cat("kitchens").caption },
      { label: t("Wardrobes & Bedroom Furniture", "衣柜与卧室家具", "خزائن الملابس وأثاث غرف النوم", "Kleiderschränke & Schlafzimmermöbel", "Dressings & mobilier de chambre"), to: "products/wardrobes-storage", image: cat("wardrobes-storage").image, caption: cat("wardrobes-storage").caption },
      { label: t("Living & Dining Cabinets", "客餐厅柜体", "خزائن المعيشة والطعام", "Wohn- & Esszimmerschränke", "Meubles salon & salle à manger"), to: "products" },
      { label: t("Study & Home Office", "书房与家庭办公", "المكتب والعمل من المنزل", "Arbeitszimmer & Homeoffice", "Bureau & travail à domicile"), to: "products" },
      { label: t("Entryway & Utility Storage", "玄关与功能收纳", "المدخل وتخزين المرافق", "Eingang & Funktionsstauraum", "Entrée & rangements pratiques"), to: "products" },
    ],
  },
  {
    title: t("Doors & Wall Systems", "门墙系统", "الأبواب وأنظمة الجدران", "Türen & Wandsysteme", "Portes & systèmes muraux"),
    items: [
      { label: t("Interior Doors", "室内门", "الأبواب الداخلية", "Innentüren", "Portes intérieures"), to: "products/interior-doors", image: cat("interior-doors").image, caption: cat("interior-doors").caption },
      { label: t("Wall Panels & Trims", "墙板与装饰线条", "ألواح الجدران والإطارات", "Wandpaneele & Zierleisten", "Panneaux muraux & moulures"), to: "products/wall-panels-woodwork", image: cat("wall-panels-woodwork").image, caption: cat("wall-panels-woodwork").caption },
    ],
  },
];

const manufacturingGroups: NavGroup[] = [
  {
    title: t("Factory", "工厂", "المصنع", "Fabrik", "Usine"),
    items: [
      { label: t("Manufacturing Advantages", "制造优势", "مزايا التصنيع", "Fertigungsvorteile", "Atouts de fabrication"), to: "manufacturing#factories" },
      { label: t("OEM Expertise", "OEM 专业能力", "خبرة OEM", "OEM-Kompetenz", "Expertise OEM"), to: "manufacturing#factories" },
      { label: t("Materials & Components", "材料与配件", "المواد والمكونات", "Materialien & Komponenten", "Matériaux & composants"), to: "manufacturing#materials" },
      { label: t("Precision Manufacturing", "精密制造", "التصنيع الدقيق", "Präzisionsfertigung", "Fabrication de précision"), to: "manufacturing#precision" },
    ],
  },
  {
    title: t("Quality & Export", "质量与出口", "الجودة والتصدير", "Qualität & Export", "Qualité & export"),
    items: [
      { label: t("Quality Control & Trial Assembly", "质检与试装", "مراقبة الجودة والتجميع التجريبي", "Qualitätskontrolle & Probemontage", "Contrôle qualité & montage à blanc"), to: "manufacturing#quality" },
      { label: t("Export Experience", "出口经验", "تجربة التصدير", "Exporterfahrung", "Expérience export"), to: "manufacturing#export" },
      { label: t("360 Factory and Showroom VR Tour", "360° 工厂与展厅 VR 参观", "جولة افتراضية 360° للمصنع والمعرض", "360°-VR-Rundgang Werk & Showroom", "Visite VR 360° usine & showroom"), to: "manufacturing#tour" },
      { label: t("Team", "团队", "الفريق", "Team", "Équipe"), to: "manufacturing#team" },
    ],
  },
];

export const navSections: NavSection[] = [
  {
    id: "products",
    label: t("Products", "产品", "المنتجات", "Produkte", "Produits"),
    to: "products",
    primaryLabel: t("Explore Products", "探索产品", "استكشف المنتجات", "Produkte entdecken", "Découvrir les produits"),
    groups: productGroups,
    primary: productGroups.flatMap((g) => g.items),
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
    // Two columns: four links on the left, three on the right.
    groups: manufacturingGroups,
    primary: manufacturingGroups.flatMap((g) => g.items),
    preview: { image: "/media/brand/m07-800.webp", caption: t("Edgebanding line · Foshan workshop", "封边产线 · 佛山工厂", "خط تشطيب الحواف · ورشة فوشان", "Kantenanleimlinie · Werkstatt Foshan", "Ligne de plaquage · atelier de Foshan") },
  },
  {
    id: "service",
    label: t("Service", "一站式服务", "الخدمة", "Service", "Service"),
    to: "service",
    primaryLabel: t("One-stop service", "一站式服务", "خدمة متكاملة", "Alles aus einer Hand", "Service clé en main"),
    primary: [
      { label: t("How it works", "服务流程", "كيف نعمل", "So funktioniert es", "Comment ça marche"), to: "service#steps" },
      { label: t("Flexible service", "灵活服务", "خدمة مرنة", "Flexibler Service", "Service flexible"), to: "service#flex" },
      { label: t("Client visits", "客户来访", "زيارات العملاء", "Kundenbesuche", "Visites clients"), to: "service#visit" },
    ],
    secondaryLabel: t("Get started", "开始", "ابدأ", "Loslegen", "Commencer"),
    secondary: [
      { label: t("Send your floor plan", "发送户型图", "أرسل مخططك", "Grundriss senden", "Envoyer votre plan"), to: "contact" },
      { label: t("Manufacturing", "制造", "التصنيع", "Fertigung", "Fabrication"), to: "manufacturing" },
    ],
    preview: { image: "/media/brand/r004-800.webp", caption: t("Kitchen & dining · Guangzhou Residence", "厨房与餐厅 · 广州住宅", "المطبخ وغرفة الطعام · مسكن قوانغتشو", "Küche & Essbereich · Residenz Guangzhou", "Cuisine & salle à manger · Résidence Guangzhou") },
  },
  {
    id: "projects",
    label: t("Projects", "项目", "المشاريع", "Projekte", "Projets"),
    to: "projects",
    primaryLabel: t("Guangzhou Residence", "广州住宅", "مسكن قوانغتشو", "Residenz Guangzhou", "Résidence Guangzhou"),
    primary: [
      ...projectSpaces.map((s) => ({ label: s.name, to: `projects#${s.id}` })),
      { label: t("View the residence", "查看完整项目", "شاهد المسكن", "Residenz ansehen", "Voir la résidence"), to: "projects" },
    ],
    ...(inspirationEnabled
      ? {
        secondaryLabel: t("Inspiration projects", "灵感项目", "مشاريع ملهمة", "Inspirationsprojekte", "Projets d’inspiration"),
        secondary: [
          ...inspirationProjects.slice(0, 6).map((p) => ({ label: t(p.en, p.name, p.en, p.en, p.en), to: `projects/inspiration/${p.slug}` })),
          { label: t("All inspiration projects", "全部灵感项目", "كل المشاريع الملهمة", "Alle Inspirationsprojekte", "Tous les projets d’inspiration"), to: "projects#inspiration" },
        ],
        }
      : {
          secondaryLabel: t("Completed project", "完工项目", "مشروع مكتمل", "Fertiggestelltes Projekt", "Projet réalisé"),
          secondary: [{ label: t("Films from the residence", "住宅影像", "أفلام من المسكن", "Filme aus der Residenz", "Films de la résidence"), to: "projects#films" }],
        }),
    preview: { image: "/media/brand/r109-800.webp", caption: t("Living room · Guangzhou Residence", "客厅 · 广州住宅", "غرفة المعيشة · مسكن قوانغتشو", "Wohnzimmer · Residenz Guangzhou", "Salon · Résidence Guangzhou") },
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
    secondaryLabel: t("Showroom & Factory", "展厅与工厂", "المعرض والمصنع", "Showroom & Werk", "Showroom & usine"),
    secondary: [
      { label: t("Showroom & Factory VR", "展厅与工厂 VR", "جولة افتراضية للمعرض والمصنع", "Showroom- & Werk-VR", "Visite VR showroom & usine"), to: VR_TOUR_URL, external: true },
      { label: t("Factory & Showroom Video", "工厂展厅视频", "فيديو المصنع والمعرض", "Werk- & Showroom-Video", "Vidéo usine & showroom"), to: VR_TOUR_URL, external: true },
    ],
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
