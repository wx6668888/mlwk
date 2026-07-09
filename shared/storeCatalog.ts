export const storeLocales = ["en", "ar", "zh", "de", "fr"] as const;
export type StoreLocale = (typeof storeLocales)[number];
export type Currency = "USD" | "EUR" | "GBP";
export type ProductCategory =
  | "pulls"
  | "hardware"
  | "wardrobe"
  | "interiors"
  | "lighting"
  | "samples"
  | "dining-table"
  | "coffee-table"
  | "console-table"
  | "desk"
  | "chair"
  | "stool"
  | "lounge-chair"
  | "bookshelf"
  | "media-console"
  | "mirror"
  | "coat-stand"
  | "bench"
  | "textiles"
  | "decor";

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

  /* ── Furniture ──────────────────────────────────────────────── */
  product(
    "MLWK-F01",
    "solid-oak-side-table",
    "coffee-table",
    580,
    {
      en: "Solid Oak Side Table",
      ar: "طاولة جانبية من خشب البلوط",
      zh: "实木橡木边几",
      de: "Massiver Eiche-Beistelltisch",
      fr: "Table d'appoint en chêne massif",
    },
    {
      en: "A compact side table in solid white oak with tapered legs and concealed joinery.",
      ar: "طاولة جانبية من بلوط أبيض صلب بأرجل مخروطية وتوصيلات مخفية.",
      zh: "实心白橡木，锥形腿，隐藏榫接，适合床头或沙发侧。",
      de: "Kompakter Beistelltisch aus Massiv-Weißeiche mit Konusbeinen.",
      fr: "Table compacte en chêne blanc massif aux pieds effilés.",
    },
    ["Natural oak", "Smoked oak", "Oiled walnut"],
    [["Top", "400 × 400 mm"], ["Height", "520 mm"], ["Material", "Solid white oak"], ["Finish", "Hand-sanded, oiled"], ["Joinery", "Blind mortise & tenon"], ["Lead time", "4–6 weeks"], ["Origin", "Made in China"], ["Assembly", "Fully assembled"]],
  ),
  product(
    "MLWK-F02",
    "upholstered-bench",
    "bench",
    890,
    {
      en: "Upholstered Bedroom Bench",
      ar: "مقعد غرفة نوم مبطن",
      zh: "软包床尾凳",
      de: "Gepolsterte Schlafzimmerbank",
      fr: "Banc de chambre rembourré",
    },
    {
      en: "A low bedroom bench with foam-and-feather seat, solid oak base and tapered leg detail.",
      ar: "مقعد منخفض بحشوة ريش وإسفنج مع قاعدة بلوط صلب.",
      zh: "低矮床尾凳，泡沫与羽绒坐感，实心橡木底座。",
      de: "Niedriges Schlafzimmerbank mit Schaum-Daunen-Sitz und Eichenbasis.",
      fr: "Banc bas avec assise mousse et duvet, base en chêne massif.",
    },
    ["Stone linen", "Dusty sage", "Charcoal bouclé"],
    [["Size", "1200 × 380 mm"], ["Height", "420 mm"], ["Base", "Solid oak"], ["Upholstery", "Foam + duck feather"], ["Fabric", "Belgian linen / wool boucle"], ["Leg finish", "Tapered, hand-oiled"], ["Lead time", "6–8 weeks"], ["Origin", "Made in China"]],
  ),
  product(
    "MLWK-F03",
    "wall-shelf-system",
    "bookshelf",
    420,
    {
      en: "Wall-Mounted Shelf System",
      ar: "نظام رفوف جدارية",
      zh: "壁挂层架系统",
      de: "Wandregal-System",
      fr: "Système d'étagères murales",
    },
    {
      en: "Three ash shelves with concealed steel wall plates and a precisely machined shadow gap.",
      ar: "ثلاثة رفوف خشب الدردار مع لوحات فولاذية مخفية وفجوة ظل دقيقة.",
      zh: "三块白蜡木层板，隐藏钢板壁挂，精加工阴影缝。",
      de: "Drei Eschenholz-Regale mit versteckten Stahlwandplatten.",
      fr: "Trois étagères en frêne avec platines murales dissimulées.",
    },
    ["Bleached ash", "Natural ash", "Oiled walnut"],
    [["Shelves", "3 × 900 mm"], ["Depth", "220 mm"], ["Load", "15 kg each"], ["Bracket", "Concealed steel"], ["Edge", "2mm shadow gap"], ["Finish", "Hand-sanded, oiled"], ["Lead time", "4–6 weeks"], ["Origin", "Made in China"]],
  ),

  /* ── Furniture — dining ──────────────────────────────────── */
  product(
    "MLWK-F04",
    "live-edge-dining-table",
    "dining-table",
    2850,
    { en: "Live-Edge Walnut Dining Table", ar: "طاولة طعام من خشب الجوز", zh: "自然边胡桃木餐桌", de: "Baumkanten-Walnuss-Esstisch", fr: "Table en noyer à bord vif" },
    { en: "Six-seater in solid black walnut with hand-finished live edge and powder-coated steel legs.", ar: "طاولة بستة مقاعد من خشب الجوز الأسود.", zh: "六人位实心黑胡桃木，手工打磨自然边，粉末喷涂钢腿。", de: "6-sitziger Esstisch aus massivem Schwarznussbaum.", fr: "Table 6 places en noyer noir massif." },
    ["Natural walnut", "Smoked walnut", "Oiled walnut"],
    [["Size", "2000 × 950 mm"], ["Height", "760 mm"], ["Seats", "6"], ["Material", "Solid black walnut"], ["Edge", "Live-edge, hand-finished"], ["Legs", "Powder-coated steel"], ["Weight", "68 kg"], ["Lead time", "8–10 weeks"], ["Origin", "Made in China"]],
  ),
  product(
    "MLWK-F05",
    "round-coffee-table",
    "coffee-table",
    1680,
    { en: "Sculptural Round Coffee Table", ar: "طاولة قهوة دائرية", zh: "雕塑感圆形茶几", de: "Skulpturaler Couchtisch", fr: "Table basse ronde" },
    { en: "1100mm round table in solid ash with radiused edge and three intersecting legs.", ar: "طاولة قهوة قطر 1100 مم من خشب الدردار.", zh: "直径1100mm白蜡木圆几，柔弧边缘，三足交错。", de: "Runder Tisch Ø1100mm aus Eschen-Massivholz.", fr: "Table ronde Ø1100mm en frêne massif." },
    ["Natural ash", "Bleached ash", "Oiled walnut"],
    [["Diameter", "1100 mm"], ["Height", "380 mm"], ["Material", "Solid ash"], ["Top thickness", "35 mm"], ["Edge", "Soft radius"], ["Legs", "3 intersecting solid wood"], ["Lead time", "6–8 weeks"], ["Origin", "Made in China"]],
  ),
  product(
    "MLWK-F06",
    "console-entry-table",
    "console-table",
    1240,
    { en: "Floating Console Table", ar: "طاولة كونسول", zh: "悬浮玄关桌", de: "Schwebende Konsole", fr: "Console flottante" },
    { en: "Wall-mounted solid oak console with shadow gap and cable management.", ar: "كونسول جداري من خشب البلوط.", zh: "壁挂实心橡木玄关桌，阴影缝，内置走线。", de: "Wandmontierte Konsole aus Massiv-Eiche.", fr: "Console murale en chêne massif." },
    ["Natural oak", "Smoked oak", "Charcoal"],
    [["Size", "1400 × 350 mm"], ["Height", "820 mm"], ["Material", "Solid oak"], ["Mount", "Wall-mounted, steel bracket"], ["Detail", "10mm shadow gap"], ["Management", "Integrated cable port"], ["Lead time", "4–6 weeks"], ["Origin", "Made in China"]],
  ),
  product(
    "MLWK-F07",
    "executive-desk",
    "desk",
    3200,
    { en: "Executive Writing Desk", ar: "مكتب تنفيذي", zh: "行政写字台", de: "Schreibtisch Executive", fr: "Bureau de direction" },
    { en: "Generous walnut desk with full-grain leather inlay, soft-close drawer and brass details.", ar: "مكتب من خشب الجوز مع ترصيع جلد طبيعي.", zh: "宽绰胡桃木写字台，头层牛皮镶嵌，黄铜细节。", de: "Großzügiger Schreibtisch aus Walnuss.", fr: "Bureau spacieux en noyer avec incrustation cuir." },
    ["Natural walnut", "Smoked walnut"],
    [["Size", "1800 × 800 mm"], ["Height", "750 mm"], ["Inlay", "Full-grain leather"], ["Drawer", "Soft-close, dovetailed"], ["Legs", "Solid walnut, tapered"], ["Details", "Solid brass pulls"], ["Lead time", "8–10 weeks"], ["Origin", "Made in China"]],
  ),
  product(
    "MLWK-F08",
    "dining-chair-set",
    "chair",
    1560,
    { en: "Curved Back Dining Chair (Set of 2)", ar: "كرسي طعام (زوج)", zh: "弧背餐椅（2件套）", de: "Esszimmerstuhl (2er-Set)", fr: "Chaise salle à manger (lot de 2)" },
    { en: "Two solid-ash chairs with steam-bent backrest and upholstered seat pad.", ar: "كرسيان من خشب الدردار بظهر منحنٍ.", zh: "两件白蜡木餐椅，蒸汽弯曲靠背，软包坐垫。", de: "Zwei Eschen-Stühle mit dampfgebogener Lehne.", fr: "Deux chaises en frêne au dossier cintré vapeur." },
    ["Natural ash / linen", "Smoked ash / charcoal", "Walnut / camel"],
    [["Height", "820 mm"], ["Seat height", "460 mm"], ["Width", "480 mm"], ["Material", "Solid ash"], ["Backrest", "Steam-bent curved"], ["Seat", "Upholstered pad"], ["Set", "2 chairs"], ["Lead time", "6–8 weeks"], ["Origin", "Made in China"]],
  ),
  product(
    "MLWK-F09",
    "lounge-armchair",
    "lounge-chair",
    1950,
    { en: "Lounge Armchair", ar: "كرسي استرخاء", zh: "休闲扶手椅", de: "Loungesessel", fr: "Fauteuil de lounge" },
    { en: "Low-slung armchair with solid oak frame, feather-wrapped foam seat and wide armrests.", ar: "كرسي منخفض بهيكل بلوط صلب.", zh: "低座深扶手椅，橡木框架，羽绒包裹坐垫。", de: "Tiefer Sessel mit Eichengestell.", fr: "Fauteuil bas à structure chêne massif." },
    ["Bouclé cream", "Dusty olive", "Charcoal wool"],
    [["Width", "780 mm"], ["Depth", "820 mm"], ["Seat height", "400 mm"], ["Frame", "Solid oak"], ["Seat", "Feather-wrapped foam"], ["Armrests", "Wide, contoured"], ["Fabric", "Boucle / wool / linen"], ["Lead time", "8–10 weeks"], ["Origin", "Made in China"]],
  ),
  product(
    "MLWK-F10",
    "counter-stool-pair",
    "stool",
    890,
    { en: "Counter Stool Pair", ar: "زوج كراسي بار", zh: "吧台凳套装", de: "Tresenhocker-Paar", fr: "Tabourets de comptoir" },
    { en: "Two counter-height stools in solid beech with sculpted seat and brass footrest.", ar: "كرسيان بارتفاع الطاولة من خشب الزان.", zh: "两件吧台高凳，实心榉木雕刻座面，黄铜脚踏。", de: "Zwei Tresenhocker aus massiver Buche.", fr: "Deux tabourets en hêtre massif." },
    ["Natural beech", "Ebonised beech"],
    [["Height", "660 mm"], ["Seat", "380 × 350 mm"], ["Material", "Solid beech"], ["Seat shape", "Sculpted, ergonomic"], ["Footrest", "Solid brass"], ["Feet", "Hidden floor protectors"], ["Set", "2 stools"], ["Lead time", "4–6 weeks"], ["Origin", "Made in China"]],
  ),
  product(
    "MLWK-F11",
    "modular-bookshelf",
    "bookshelf",
    2200,
    { en: "Modular Bookshelf System", ar: "نظام رفوف كتب", zh: "模块化书架系统", de: "Modulares Regalsystem", fr: "Système d'étagères modulaires" },
    { en: "Floor-to-ceiling shelving in solid oak with adjustable shelves and soft-close cabinet base.", ar: "نظام رفوف من الأرض إلى السقف من خشب البلوط.", zh: "落地橡木书架，层板可调，底部缓冲柜门。", de: "Bodenhohes Regalsystem aus Massiv-Eiche.", fr: "Étagères modulaires en chêne massif." },
    ["Natural oak", "Smoked oak"],
    [["Width", "2400 mm"], ["Height", "2600 mm"], ["Depth", "380 mm"], ["Shelves", "6 adjustable"], ["Material", "Solid oak"], ["Base", "Soft-close cabinet"], ["Finish", "Hand-sanded, oiled"], ["Lead time", "8–10 weeks"], ["Origin", "Made in China"]],
  ),
  product(
    "MLWK-F12",
    "media-console",
    "media-console",
    2450,
    { en: "Media Console", ar: "وحدة تلفزيون", zh: "影音中柜", de: "TV-Lowboard", fr: "Meuble TV" },
    { en: "Wide low console in solid walnut with fluted sliding doors and ventilated shelves.", ar: "كونسول منخفض من خشب الجوز بأبواب منزلقة.", zh: "宽幅胡桃木中柜，条槽推拉门，通风层板。", de: "Breites Lowboard aus Walnuss.", fr: "Meuble TV bas en noyer massif." },
    ["Natural walnut", "Charcoal stained"],
    [["Width", "2200 mm"], ["Depth", "450 mm"], ["Height", "520 mm"], ["Material", "Solid walnut"], ["Doors", "Fluted sliding"], ["Shelves", "Ventilated, adjustable"], ["Hardware", "Soft-close"], ["Lead time", "6–8 weeks"], ["Origin", "Made in China"]],
  ),
  product(
    "MLWK-F13",
    "full-length-mirror",
    "mirror",
    780,
    { en: "Architectural Floor Mirror", ar: "مرآة أرضية", zh: "建筑感落地镜", de: "Standspiegel", fr: "Miroir de sol" },
    { en: "Full-length mirror with solid oak frame, hidden tilt mechanism and weighted base.", ar: "مرآة بطول كامل بإطار بلوط صلب.", zh: "全身落地镜，实心橡木边框，隐藏倾角，加重底座。", de: "Ganzkörperspiegel mit Eichenrahmen.", fr: "Miroir en pied cadre chêne massif." },
    ["Natural oak", "Smoked oak", "Ebonised"],
    [["Height", "1850 mm"], ["Width", "650 mm"], ["Frame", "Solid oak, 45mm deep"], ["Glass", "5mm silvered"], ["Tilt", "Hidden mechanism"], ["Base", "Weighted anti-tip"], ["Lead time", "4–6 weeks"], ["Origin", "Made in China"]],
  ),
  product(
    "MLWK-F14",
    "coat-rack-stand",
    "coat-stand",
    540,
    { en: "Valet Coat Stand", ar: "حامل معاطف", zh: "衣帽架", de: "Garderobenständer", fr: "Porte-manteaux" },
    { en: "Sculptural stand in solid ash with six rotating brass hooks and marble base.", ar: "حامل معاطف نحتي من خشب الدردار.", zh: "雕塑感白蜡木衣帽架，六旋转黄铜钩，大理石底座。", de: "Skulpturaler Ständer aus Eschenholz.", fr: "Porte-manteaux sculptural en frêne." },
    ["Natural ash / brass", "Ebonised / brass"],
    [["Height", "1780 mm"], ["Base", "Marble Ø380 mm"], ["Hooks", "6 rotating brass"], ["Material", "Solid ash"], ["Tray", "Leather drip tray"], ["Weight", "12 kg"], ["Lead time", "4–6 weeks"], ["Origin", "Made in China"]],
  ),

  /* ── Textiles ────────────────────────────────────────────────── */
  product(
    "MLWK-T01",
    "linen-cushion-pair",
    "textiles",
    148,
    {
      en: "Washed Linen Cushion Pair",
      ar: "زوج وسائد كتان مغسول",
      zh: "水洗亚麻靠垫套装",
      de: "Gewaschene Leinen-Kissenbezüge",
      fr: "Paire de coussins en lin lavé",
    },
    {
      en: "Stonewashed linen covers with feather insert. Relaxed texture that settles into any room.",
      ar: "غطاء كتان مغسول بالحجارة مع حشوة ريش. ملمس مريح يندمج مع أي غرفة.",
      zh: "石洗亚麻面料配羽毛内芯，慵懒质感自然融入空间。",
      de: "Steingewaschene Leinenbezüge mit Federeinsatz.",
      fr: "Housses en lin stonewash avec insert plumes. Texture décontractée.",
    },
    ["Warm ivory", "Pebble grey", "Dusty cedar"],
    [["Size", "50 × 50 cm"], ["Fill", "Duck feather"], ["Set", "2 covers + inserts"]],
  ),
  product(
    "MLWK-T02",
    "wool-throw",
    "textiles",
    280,
    {
      en: "Merino Wool Throw",
      ar: "غطاء صوف ميرينو",
      zh: "美利奴羊毛毯",
      de: "Merino-Wolldecke",
      fr: "Plaid en laine mérinos",
    },
    {
      en: "A substantial merino throw with a tight herringbone weave and hand-knotted fringe.",
      ar: "غطاء ميرينو فاخر بنسيج هيرينغبون محكم وهامش معقود يدوياً.",
      zh: "厚实美利奴羊毛毯，人字纹编织，手工流苏收边。",
      de: "Merino-Decke im Fischgrätmuster mit handgeknüpfter Franse.",
      fr: "Plaid mérinos en sergé chevrons avec franges nouées main.",
    },
    ["Oat", "Warm grey", "Camel"],
    [["Size", "140 × 200 cm"], ["Weight", "450 g/m²"], ["Material", "100% merino"]],
  ),

  /* ── Decor ───────────────────────────────────────────────────── */
  product(
    "MLWK-DC01",
    "ceramic-bud-vase-set",
    "decor",
    96,
    {
      en: "Ceramic Bud Vase Set",
      ar: "طقم مزهريات خزفية",
      zh: "陶瓷细口花瓶套装",
      de: "Keramik-Vasen-Set",
      fr: "Set de vases en céramique",
    },
    {
      en: "Three wheel-thrown stoneware vases with a matte reactive glaze. Group them or separate.",
      ar: "ثلاثة مزهريات خزفية بجلازور متفاعل غير لامع.",
      zh: "三件手工拉坯炻器花瓶，哑光活性釉，单独或组合摆放均可。",
      de: "Drei gedrehte Steinzeugvasen mit matter Reaktionsglasur.",
      fr: "Trois vases en grès tourné avec glaçure réactive mate.",
    },
    ["Sand / bone", "Slate / rust", "Sage / cream"],
    [["Sizes", "S · M · L"], ["Material", "Stoneware"], ["Glaze", "Matte reactive"]],
  ),
  product(
    "MLWK-DC02",
    "marble-object",
    "decor",
    145,
    {
      en: "Honed Marble Object",
      ar: "منحوتة رخامية",
      zh: "光面大理石摆件",
      de: "Geschliffenes Marmor-Objekt",
      fr: "Objet en marbre adouci",
    },
    {
      en: "A hand-carved architectural form in honed Carrara marble. Quiet weight for shelf or surface.",
      ar: "شكل معماري منحوت يدوياً من رخام كارارا الأملس.",
      zh: "手工雕刻卡拉拉大理石几何形体，哑光，适合任何台面或层板。",
      de: "Handgeschliffene Form in Carrara-Marmor.",
      fr: "Forme architecturale taillée main en marbre de Carrare adouci.",
    },
    ["Carrara white", "Nero marquina"],
    [["Size", "180 × 80 × 120 mm"], ["Material", "Solid marble"], ["Finish", "Honed"]],
  ),
];

export const currencySymbols: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
};

// Hardcoded fallback rates — refreshed every 4 hours from frankfurter.app
const FALLBACK_MULTIPLIERS: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.8,
};

// Runtime cache with TTL
let _currencyCache: { rates: Record<Currency, number>; ts: number } | null = null;
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

export async function fetchCurrencyRates(): Promise<Record<Currency, number>> {
  // Return cached if fresh
  if (_currencyCache && Date.now() - _currencyCache.ts < CACHE_TTL_MS) {
    return _currencyCache.rates;
  }
  try {
    const resp = await fetch("/api/currency-rates?from=USD");
    if (!resp.ok) throw new Error("API unavailable");
    const data = (await resp.json()) as { rates: Record<string, number> };
    const rates: Record<Currency, number> = {
      USD: 1,
      EUR: data.rates.EUR || FALLBACK_MULTIPLIERS.EUR,
      GBP: data.rates.GBP || FALLBACK_MULTIPLIERS.GBP,
    };
    _currencyCache = { rates, ts: Date.now() };
    return rates;
  } catch {
    return { ...FALLBACK_MULTIPLIERS };
  }
}

export function productPrice(
  product: StoreProduct,
  currency: Currency,
  liveRates?: Record<Currency, number>,
) {
  const rates = liveRates || FALLBACK_MULTIPLIERS;
  return Math.round(product.basePriceUsd * rates[currency]);
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

// Static fallback sets (updated: Croatia HR in eurozone since 2023-01-01)
const FALLBACK_EUROZONE = new Set([
  "AT", "BE", "HR", "CY", "EE", "FI", "FR", "DE", "GR", "IE", "IT",
  "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES",
]);

const FALLBACK_NORTH_AMERICA = new Set(["US", "CA", "MX"]);
const FALLBACK_MIDDLE_EAST = new Set([
  "AE", "SA", "QA", "KW", "BH", "OM", "JO", "IL", "LB",
]);

// Dynamic country data cache
let _countryCache: {
  eurozone: Set<string>;
  northAmerica: Set<string>;
  middleEast: Set<string>;
  currencyMap: Record<string, string>;
  ts: number;
} | null = null;
const COUNTRY_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

type ZoneData = {
  eurozone: Set<string>;
  northAmerica: Set<string>;
  middleEast: Set<string>;
  currencyMap: Record<string, string>;
};

async function fetchCountryData(): Promise<ZoneData> {
  if (_countryCache && Date.now() - _countryCache.ts < COUNTRY_CACHE_TTL) {
    return _countryCache;
  }
  try {
    const resp = await fetch("/api/country-data");
    if (!resp.ok) throw new Error("API unavailable");
    const data = (await resp.json()) as {
      eurozone: string[];
      middleEast: string[];
      northAmerica: string[];
      currencyMap: Record<string, string>;
    };
    _countryCache = {
      eurozone: new Set(data.eurozone),
      northAmerica: new Set(data.northAmerica),
      middleEast: new Set(data.middleEast),
      currencyMap: data.currencyMap,
      ts: Date.now(),
    };
  } catch {
    // Use fallback on first failure
    if (!_countryCache) {
      _countryCache = {
        eurozone: FALLBACK_EUROZONE,
        northAmerica: FALLBACK_NORTH_AMERICA,
        middleEast: FALLBACK_MIDDLE_EAST,
        currencyMap: {},
        ts: Date.now(),
      };
    }
  }
  return _countryCache;
}

function getZoneSets(): ZoneData {
  // Synchronous fallback access — used when async fetch hasn't completed
  if (_countryCache && Date.now() - _countryCache.ts < COUNTRY_CACHE_TTL) {
    return _countryCache;
  }
  return {
    eurozone: FALLBACK_EUROZONE,
    northAmerica: FALLBACK_NORTH_AMERICA,
    middleEast: FALLBACK_MIDDLE_EAST,
    currencyMap: {},
  };
}

// Preload on module import
fetchCountryData();

export { FALLBACK_EUROZONE as eurozoneCountries };
export { FALLBACK_NORTH_AMERICA as northAmericaCountries };
export { FALLBACK_MIDDLE_EAST as middleEastCountries };

export function currencyForCountry(countryCode?: string | null): Currency {
  const country = countryCode?.toUpperCase();
  if (!country) return "USD";
  const { currencyMap, eurozone } = getZoneSets();
  // Prefer dynamic currency map, then fall back to zone logic
  if (currencyMap[country]) {
    const cur = currencyMap[country];
    if (cur === "EUR") return "EUR";
    if (cur === "GBP") return "GBP";
  }
  if (eurozone.has(country)) return "EUR";
  if (country === "GB") return "GBP";
  return "USD";
}

export function shippingForCountry(
  countryCode: string,
  currency: Currency,
): { zone: string; amount: number } {
  const country = countryCode.toUpperCase();
  const { eurozone, northAmerica, middleEast } = getZoneSets();
  if (eurozone.has(country)) {
    return { zone: "eurozone", amount: currency === "EUR" ? 18 : 20 };
  }
  if (country === "GB") {
    return { zone: "united-kingdom", amount: currency === "GBP" ? 16 : 20 };
  }
  if (northAmerica.has(country)) {
    return { zone: "north-america", amount: currency === "USD" ? 22 : 20 };
  }
  if (middleEast.has(country)) {
    return { zone: "middle-east", amount: currency === "USD" ? 28 : 26 };
  }
  return { zone: "rest-of-world", amount: currency === "USD" ? 32 : 30 };
}
