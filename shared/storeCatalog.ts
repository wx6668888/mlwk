export const storeLocales = ["en", "ar", "zh", "de", "fr"] as const;
export type StoreLocale = (typeof storeLocales)[number];
export type Currency = "USD" | "EUR" | "GBP";
export type ProductCategory =
  | "pulls"
  | "hardware"
  | "wardrobe"
  | "interiors"
  | "lighting"
  | "samples";

type LocalizedText = Record<StoreLocale, string>;

export type StoreProduct = {
  sku: string;
  slug: string;
  category: ProductCategory;
  image: string;
  name: LocalizedText;
  description: LocalizedText;
  basePriceUsd: number;
  finishes: string[];
  specs: Array<[string, string]>;
};

const product = (
  sku: string,
  slug: string,
  category: ProductCategory,
  basePriceUsd: number,
  name: LocalizedText,
  description: LocalizedText,
  finishes: string[],
  specs: Array<[string, string]>,
): StoreProduct => ({
  sku,
  slug,
  category,
  basePriceUsd,
  name,
  description,
  finishes,
  specs,
  image: `/media/store/${slug}.webp`,
});

export const storeProducts: StoreProduct[] = [
  product(
    "MLWK-P01",
    "linear-brass-pull",
    "pulls",
    68,
    {
      en: "Linear Brass Pull Set",
      ar: "طقم مقابض نحاسية خطية",
      zh: "线性黄铜拉手套装",
      de: "Lineares Messinggriff-Set",
      fr: "Ensemble de poignées linéaires",
    },
    {
      en: "A restrained solid-brass pull with softened edges for kitchens and wardrobes.",
      ar: "مقبض من النحاس المصمت بحواف ناعمة للمطابخ والخزائن.",
      zh: "为厨房与衣柜设计的实心黄铜拉手，边缘温润克制。",
      de: "Massiver Messinggriff mit sanften Kanten für Küchen und Schränke.",
      fr: "Poignée en laiton massif aux arêtes adoucies pour cuisines et dressings.",
    },
    ["Aged brass", "Satin nickel", "Dark bronze"],
    [["Material", "Solid brass"], ["Length", "240 mm"], ["Set", "2 pulls"]],
  ),
  product(
    "MLWK-P02",
    "loop-pull-pair",
    "pulls",
    54,
    {
      en: "Leather Loop Pull Pair",
      ar: "زوج مقابض جلدية",
      zh: "皮革环形拉手",
      de: "Leder-Schlaufengriffe",
      fr: "Paire de poignées en cuir",
    },
    {
      en: "Vegetable-tanned leather loops fixed with machined brass studs.",
      ar: "حلقات من الجلد المدبوغ نباتياً مع مثبتات نحاسية.",
      zh: "植鞣皮革环配合机加工黄铜固定件。",
      de: "Pflanzlich gegerbte Lederschlaufen mit Messingknöpfen.",
      fr: "Boucles en cuir tanné végétal avec fixations en laiton usiné.",
    },
    ["Cognac", "Olive", "Black"],
    [["Material", "Leather / brass"], ["Drop", "55 mm"], ["Set", "2 pulls"]],
  ),
  product(
    "MLWK-P03",
    "flush-edge-pull",
    "pulls",
    72,
    {
      en: "Flush Edge Pull Set",
      ar: "طقم مقابض حافة مخفية",
      zh: "嵌入式封边拉手",
      de: "Bündige Kantengriffe",
      fr: "Poignées de chant affleurantes",
    },
    {
      en: "A slim recessed profile that keeps tall cabinet fronts visually uninterrupted.",
      ar: "مقطع نحيف مدمج يحافظ على استمرارية واجهات الخزائن.",
      zh: "纤薄嵌入结构，让高柜门板保持连续完整。",
      de: "Schlankes Einlassprofil für ruhige, durchgehende Fronten.",
      fr: "Profil encastré fin pour préserver la continuité des façades.",
    },
    ["Blackened aluminium", "Champagne", "Brushed steel"],
    [["Material", "Aluminium"], ["Length", "300 mm"], ["Set", "2 pulls"]],
  ),
  product(
    "MLWK-H01",
    "concealed-hinge-set",
    "hardware",
    38,
    {
      en: "Concealed Hinge Pair",
      ar: "زوج مفصلات مخفية",
      zh: "隐藏式铰链套装",
      de: "Verdecktes Scharnierpaar",
      fr: "Paire de charnières invisibles",
    },
    {
      en: "Soft-close concealed hinges for clean cabinet elevations and controlled movement.",
      ar: "مفصلات مخفية بإغلاق هادئ لواجهات نظيفة وحركة مضبوطة.",
      zh: "带缓冲关闭的隐藏铰链，保持柜面洁净与动作稳定。",
      de: "Gedämpfte Topfbänder für klare Fronten und kontrollierte Bewegung.",
      fr: "Charnières invisibles amorties pour des façades nettes.",
    },
    ["Nickel", "Black"],
    [["Opening", "110°"], ["Cup", "35 mm"], ["Set", "2 hinges"]],
  ),
  product(
    "MLWK-H02",
    "soft-close-runner",
    "hardware",
    86,
    {
      en: "Soft-Close Runner Pair",
      ar: "زوج سكك أدراج بإغلاق هادئ",
      zh: "缓冲抽屉滑轨",
      de: "Soft-Close-Auszugspaar",
      fr: "Paire de coulisses amorties",
    },
    {
      en: "Full-extension concealed runners engineered for a quiet, weighted glide.",
      ar: "سكك مخفية كاملة الامتداد لحركة هادئة ومتوازنة.",
      zh: "全拉出隐藏滑轨，带来安静且有重量感的顺滑动作。",
      de: "Verdeckte Vollauszüge für einen ruhigen, satten Lauf.",
      fr: "Coulisses invisibles à sortie totale au mouvement silencieux.",
    },
    ["Zinc", "Black"],
    [["Load", "40 kg"], ["Length", "500 mm"], ["Set", "Left / right"]],
  ),
  product(
    "MLWK-W01",
    "wardrobe-rail-kit",
    "wardrobe",
    120,
    {
      en: "Wardrobe Rail Kit",
      ar: "طقم قضيب خزانة",
      zh: "衣柜挂衣杆套装",
      de: "Kleiderstangen-Set",
      fr: "Kit de tringle de dressing",
    },
    {
      en: "An oval wardrobe rail with concealed supports and a tactile metal finish.",
      ar: "قضيب بيضاوي بدعامات مخفية وتشطيب معدني ملموس.",
      zh: "椭圆挂衣杆配隐藏支座，金属触感细腻。",
      de: "Ovale Kleiderstange mit verdeckten Haltern und feiner Metalloberfläche.",
      fr: "Tringle ovale avec supports dissimulés et finition métallique tactile.",
    },
    ["Aged brass", "Dark bronze", "Satin nickel"],
    [["Length", "1200 mm"], ["Material", "Aluminium / brass"], ["Includes", "2 supports"]],
  ),
  product(
    "MLWK-I01",
    "leather-valet-tray",
    "interiors",
    148,
    {
      en: "Leather Valet Tray",
      ar: "صينية جلدية للإكسسوارات",
      zh: "皮革随身物托盘",
      de: "Leder-Valet-Tablett",
      fr: "Vide-poches en cuir",
    },
    {
      en: "A removable leather-lined tray for watches, keys and everyday objects.",
      ar: "صينية قابلة للإزالة مبطنة بالجلد للساعات والمفاتيح.",
      zh: "可拆卸皮革内衬托盘，用于腕表、钥匙与日常随身物。",
      de: "Herausnehmbares, lederbezogenes Tablett für Uhren und Schlüssel.",
      fr: "Plateau amovible gainé de cuir pour montres et objets du quotidien.",
    },
    ["Taupe", "Cognac", "Charcoal"],
    [["Size", "360 × 240 mm"], ["Lining", "Microfibre"], ["Base", "Birch ply"]],
  ),
  product(
    "MLWK-I02",
    "jewellery-drawer-insert",
    "interiors",
    178,
    {
      en: "Jewellery Drawer Insert",
      ar: "منظم درج للمجوهرات",
      zh: "首饰抽屉内衬",
      de: "Schmuck-Schubladeneinsatz",
      fr: "Insert de tiroir à bijoux",
    },
    {
      en: "Modular suede-lined compartments composed for fine wardrobe drawers.",
      ar: "وحدات مبطنة بالشمواه لأدراج الملابس الراقية.",
      zh: "为精细衣柜抽屉设计的模块化麂皮内衬分格。",
      de: "Modulare, veloursbezogene Fächer für hochwertige Ankleiden.",
      fr: "Compartiments modulaires gainés de suédine pour dressings raffinés.",
    },
    ["Stone", "Olive", "Graphite"],
    [["Size", "480 × 360 mm"], ["Modules", "8"], ["Lining", "Suede-touch"]],
  ),
  product(
    "MLWK-L01",
    "led-shelf-profile",
    "lighting",
    92,
    {
      en: "LED Shelf Profile Kit",
      ar: "طقم إضاءة رف LED",
      zh: "层板灯型材套装",
      de: "LED-Regalprofil-Set",
      fr: "Kit profil LED d'étagère",
    },
    {
      en: "A recessed warm-light profile with an opal diffuser for integrated shelving.",
      ar: "مقطع إضاءة دافئة مدمج مع ناشر ضوء معتم.",
      zh: "嵌入式暖光型材配乳白扩散罩，用于一体化层板照明。",
      de: "Eingelassenes Warmlichtprofil mit opaler Abdeckung.",
      fr: "Profil lumineux encastré avec diffuseur opale.",
    },
    ["Black", "Champagne", "Silver"],
    [["Light", "2700 K"], ["Length", "1000 mm"], ["Voltage", "24 V"]],
  ),
  product(
    "MLWK-S01",
    "floating-shelf-kit",
    "hardware",
    210,
    {
      en: "Floating Shelf Kit",
      ar: "طقم رف عائم",
      zh: "悬浮层板套装",
      de: "Schweberegal-Set",
      fr: "Kit d'étagère flottante",
    },
    {
      en: "A smoked-oak shelf with a concealed steel bracket and precise shadow line.",
      ar: "رف من البلوط الداكن بحامل فولاذي مخفي وفاصل ظل دقيق.",
      zh: "烟熏橡木层板配隐藏钢支架与精准阴影缝。",
      de: "Räuchereiche-Regal mit verdeckter Stahlkonsole und Schattenfuge.",
      fr: "Étagère en chêne fumé avec support acier invisible.",
    },
    ["Smoked oak", "Natural oak", "Dark walnut"],
    [["Length", "900 mm"], ["Depth", "240 mm"], ["Load", "20 kg"]],
  ),
  product(
    "MLWK-M01",
    "finish-sample-box",
    "samples",
    64,
    {
      en: "Finish Sample Box",
      ar: "صندوق عينات التشطيبات",
      zh: "饰面样品盒",
      de: "Oberflächen-Musterbox",
      fr: "Coffret d'échantillons",
    },
    {
      en: "A curated material box for early conversations about veneer, lacquer and metal.",
      ar: "مجموعة مواد مختارة لمناقشة القشرة والطلاء والمعادن.",
      zh: "用于前期讨论木皮、烤漆与金属方向的精选材质盒。",
      de: "Kuratierte Materialbox für Furnier, Lack und Metall.",
      fr: "Coffret de matières pour explorer placages, laques et métaux.",
    },
    ["Signature edit"],
    [["Samples", "12"], ["Format", "120 × 120 mm"], ["Packaging", "Rigid box"]],
  ),
  product(
    "MLWK-D01",
    "door-lever-set",
    "hardware",
    240,
    {
      en: "Architectural Door Lever Set",
      ar: "طقم مقبض باب معماري",
      zh: "建筑门执手套装",
      de: "Architektonische Türdrückergarnitur",
      fr: "Ensemble de béquilles architecturales",
    },
    {
      en: "A solid-brass lever with compact roses and a calm, balanced return.",
      ar: "مقبض من النحاس المصمت بقاعدة مدمجة وحركة متوازنة.",
      zh: "实心黄铜执手配紧凑底座，回弹平稳克制。",
      de: "Massiver Messingdrücker mit kleiner Rosette und ruhigem Rücklauf.",
      fr: "Béquille en laiton massif avec rosaces compactes et retour équilibré.",
    },
    ["Aged brass", "Dark bronze", "Satin nickel"],
    [["Door", "35–55 mm"], ["Spindle", "8 mm"], ["Set", "Pair / roses"]],
  ),
];

export const currencySymbols: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
};

const currencyMultipliers: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.8,
};

export function productPrice(product: StoreProduct, currency: Currency) {
  return Math.round(product.basePriceUsd * currencyMultipliers[currency]);
}

export function formatPrice(amount: number, currency: Currency, locale = "en") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function findProduct(slugOrSku: string) {
  return storeProducts.find(
    (item) => item.slug === slugOrSku || item.sku === slugOrSku,
  );
}

export const eurozoneCountries = new Set([
  "AT", "BE", "HR", "CY", "EE", "FI", "FR", "DE", "GR", "IE", "IT",
  "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES",
]);

export const northAmericaCountries = new Set(["US", "CA", "MX"]);
export const middleEastCountries = new Set([
  "AE", "SA", "QA", "KW", "BH", "OM", "JO", "IL", "LB",
]);

export function currencyForCountry(countryCode?: string | null): Currency {
  const country = countryCode?.toUpperCase();
  if (country && eurozoneCountries.has(country)) return "EUR";
  if (country === "GB") return "GBP";
  return "USD";
}

export function shippingForCountry(
  countryCode: string,
  currency: Currency,
): { zone: string; amount: number } {
  const country = countryCode.toUpperCase();
  if (eurozoneCountries.has(country)) {
    return { zone: "eurozone", amount: currency === "EUR" ? 18 : 20 };
  }
  if (country === "GB") {
    return { zone: "united-kingdom", amount: currency === "GBP" ? 16 : 20 };
  }
  if (northAmericaCountries.has(country)) {
    return { zone: "north-america", amount: currency === "USD" ? 22 : 20 };
  }
  if (middleEastCountries.has(country)) {
    return { zone: "middle-east", amount: currency === "USD" ? 28 : 26 };
  }
  return { zone: "rest-of-world", amount: currency === "USD" ? 32 : 30 };
}
