import type { Locale } from "../content";

// Copy for the rebuilt Manufacturing page (sections match the Manufacturing menu).
// English and Chinese are written out in full; ar / de / fr fall back to English until they are reviewed.
// Facts to confirm before publishing are listed in the hand-over note (factory area, shares, 100% trial assembly, brands).

export type MfStat = { value: string; label: string; note: string };
export type MfCard = { no: string; kicker: string; title: string; text: string; image: string };
export type MfCategory = { name: string; text: string; image?: string };
export type MfBrandRow = { label: string; brands: string[] };
export type MfDownload = { title: string; file: string };
export type MfCopy = {
  factories: { label: string; title: string; pillars: { title: string; text: string }[]; stripCaption: string };
  oem: { label: string; title: string; lead: string; stats: MfStat[] };
  materials: {
    label: string; title: string; lead: string;
    categories: MfCategory[];
    brandsLabel: string; brands: MfBrandRow[];
    moreLabel: string; moreNote: string; more: { label: string; brands: string[] }[];
  };
  precision: { label: string; title: string; lead: string; cards: MfCard[] };
  quality: {
    label: string; title: string; lead: string;
    bandKicker: string; bandFigure: string; bandTitle: string; bandText: string; bandPoints: string[];
    downloadsLabel: string; downloads: MfDownload[];
  };
  exportCopy: { label: string; title: string; lead: string; cards: { title: string; text: string }[] };
};

const en: MfCopy = {
  factories: {
    label: "Our factories",
    title: "Built in Foshan, sold factory-direct.",
    pillars: [
      { title: "German quality.", text: "German HOMAG equipment, refined craftsmanship and rigorous checks." },
      { title: "Factory-direct value.", text: "High-end OEM manufacturing at competitive factory-direct prices." },
      { title: "Global material choices.", text: "Panels, finishes, hardware and lighting to suit your design and budget." },
    ],
    stripCaption: "Inside the Foshan factory",
  },
  oem: {
    label: "OEM Expertise",
    title: "Product quality is in our DNA.",
    lead: "We provide OEM and bespoke manufacturing for over 100 influential woodwork retailers, interior designers and design firms in China.",
    stats: [
      { value: "2", label: "Company-owned factories", note: "Woodwork / Aluminium & glass" },
      { value: "40,000m²", label: "Combined factory area", note: "Total across both factories" },
      { value: "≈95%", label: "Villas & spacious luxury apartments", note: "Share of our projects" },
      { value: "100%", label: "Pre-shipment trial assembly", note: "Every cabinet. Every one." },
      { value: "1000m²", label: "Shared factory showroom", note: "" },
    ],
  },
  materials: {
    label: "Materials & Components",
    title: "More choice. One-stop sourcing.",
    lead: "Choose materials, finishes and fittings from global suppliers to suit your design and budget. Our Foshan team coordinates the sourcing for you.",
    categories: [
      { name: "Wood", text: "Panels, veneers & finishes", image: "/media/mf/materials-wood.jpg" },
      { name: "Metal", text: "Frames, profiles & finishes", image: "/media/mf/materials-metal.jpg" },
      { name: "Leather", text: "Leather surfaces & finishes", image: "/media/mf/materials-leather.jpg" },
      { name: "Fabric", text: "Textiles & upholstery fabrics", image: "/media/mf/materials-fabric.jpg" },
      { name: "Stone", text: "Stone surfaces & finishes", image: "/media/mf/materials-stone.jpg" },
    ],
    brandsLabel: "Selected brand partners",
    brands: [
      { label: "Panels & surfaces", brands: ["SAVIOLA", "FINSA", "LIAMAX"] },
      { label: "Hardware & storage", brands: ["blum", "SALICE", "NUOMI", "HIGOLD"] },
      { label: "Lighting", brands: ["LAMBERT"] },
    ],
    moreLabel: "Explore more brands",
    moreNote: "Additional options from our technical manual. Availability depends on your project specifications.",
    more: [
      { label: "Panels & surface finishes", brands: ["LTK", "RENOLIT", "LX Hausys", "LG", "SOULWAY", "HUAFULI", "XRM", "CHEEZOO"] },
      { label: "Cabinet hardware & drawer systems", brands: ["Hettich", "TUTTI", "Unihopper", "IF", "JoyLink"] },
      { label: "Door hardware & locks", brands: ["AKRD", "MSI", "GRIFFWERK", "AGB", "OTLAV", "Casarte"] },
      { label: "Edgebanding & fixings", brands: ["REHAU", "fischer"] },
    ],
  },
  precision: {
    label: "Precision manufacturing",
    title: "German HOMAG cutting and edgebanding.",
    lead: "Production is checked against approved drawings and finish samples at every stage, from the first cut to the last edge.",
    cards: [
      { no: "01", kicker: "HOMAG SAWTEQ B-180", title: "Precision panel cutting", text: "German HOMAG panel saws cut to approved dimensions, helping adjoining parts align during assembly.", image: "/media/mf/precision-saw.jpg" },
      { no: "02", kicker: "HOMAG edgebanding line", title: "Laser edgebanding", text: "On compatible panels, laser edgebanding creates a clean transition from face to edge. We check seams and corners.", image: "/media/factory-collection/edgebanding-1" },
      { no: "03", kicker: "Panel surface cleaning", title: "In-process quality checks", text: "During production, we check dimensions, finishes and colour against approved drawings and samples.", image: "f023" },
    ],
  },
  quality: {
    label: "Quality control & trial assembly",
    title: "We build it once in the factory, so it fits on site.",
    lead: "Before packing, cabinetry is assembled in our workshop and checked against the approved drawings.",
    bandKicker: "Before shipment",
    bandFigure: "100%",
    bandTitle: "Cabinetry trial assembly",
    bandText: "We trial-assemble all cabinetry in every order at our factory before shipping.",
    bandPoints: ["Cabinet fit", "Door alignment & gaps", "Hardware operation"],
    downloadsLabel: "Quality standards (PDF)",
    downloads: [
      { title: "Panel cutting", file: "01_CIRMANO_Panel_Cutting_QC_EN.pdf" },
      { title: "Edge banding", file: "02_CIRMANO_Edge_Banding_QC_EN.pdf" },
      { title: "Panel drilling", file: "03_CIRMANO_Panel_Drilling_QC_EN.pdf" },
      { title: "Curved edge banding", file: "04_CIRMANO_Curved_Edge_Banding_QC_EN.pdf" },
      { title: "Packaging", file: "05_CIRMANO_Packaging_QC_EN.pdf" },
      { title: "Trial assembly", file: "06_CIRMANO_Trial_Assembly_QC_EN.pdf" },
    ],
  },
  exportCopy: {
    label: "Export experience",
    title: "We export custom cabinetry to markets across Asia, Europe, North America, Africa and Oceania.",
    lead: "Our cabinetry ships to the United States, United Kingdom, Australia, Singapore, India, Indonesia, Malaysia, Thailand, Senegal, Saudi Arabia and other international markets.",
    cards: [
      { title: "Export packing", text: "Parts are wrapped and boxed with protection for long-distance transport." },
      { title: "Labels & packing lists", text: "Every package is labelled for installation, with packing lists to match." },
      { title: "Container loading & documents", text: "Orders are loaded and shipped with the documents your project needs." },
    ],
  },
};

const zh: MfCopy = {
  factories: {
    label: "我们的工厂",
    title: "在佛山制造，工厂直供。",
    pillars: [
      { title: "德国品质。", text: "德国 HOMAG 设备、精细工艺与严格检查。" },
      { title: "工厂直供，更有价值。", text: "高端 OEM 制造，以有竞争力的工厂直供价格提供。" },
      { title: "全球材料选择。", text: "板材、饰面、五金与灯具，按您的设计与预算搭配。" },
    ],
    stripCaption: "佛山工厂实景",
  },
  oem: {
    label: "OEM 专业能力",
    title: "产品品质，源于我们的基因。",
    lead: "我们为中国 100 多家具有影响力的木作零售商、室内设计师与设计公司提供 OEM 及定制制造服务。",
    stats: [
      { value: "2", label: "自有专业工厂", note: "木作 / 铝与玻璃" },
      { value: "40,000m²", label: "工厂总面积", note: "两座工厂合计" },
      { value: "≈95%", label: "别墅与高端大平层项目", note: "占我们项目的比例" },
      { value: "100%", label: "出货前试装", note: "每一套柜体，逐一试装" },
      { value: "1000m²", label: "工厂共享展厅", note: "" },
    ],
  },
  materials: {
    label: "材料与配件",
    title: "更多选择，一站式采购。",
    lead: "从全球供应商中挑选材料、饰面与配件，贴合您的设计与预算。佛山团队为您统筹采购。",
    categories: [
      { name: "木材", text: "板材、贴皮与饰面", image: "/media/mf/materials-wood.jpg" },
      { name: "金属", text: "框架、型材与表面处理", image: "/media/mf/materials-metal.jpg" },
      { name: "皮革", text: "皮革表面与饰面", image: "/media/mf/materials-leather.jpg" },
      { name: "织物", text: "纺织品与软包面料", image: "/media/mf/materials-fabric.jpg" },
      { name: "石材", text: "石材表面与饰面", image: "/media/mf/materials-stone.jpg" },
    ],
    brandsLabel: "精选品牌合作伙伴",
    brands: [
      { label: "板材与表面", brands: ["SAVIOLA", "FINSA", "LIAMAX"] },
      { label: "五金与收纳", brands: ["blum", "SALICE", "NUOMI", "HIGOLD"] },
      { label: "灯具", brands: ["LAMBERT"] },
    ],
    moreLabel: "更多品牌",
    moreNote: "以下选项来自我们的技术手册，具体可供应情况依项目规格而定。",
    more: [
      { label: "板材与表面饰面", brands: ["LTK", "RENOLIT", "LX Hausys", "LG", "SOULWAY", "HUAFULI", "XRM", "CHEEZOO"] },
      { label: "柜体五金与抽屉系统", brands: ["Hettich", "TUTTI", "Unihopper", "IF", "JoyLink"] },
      { label: "门五金与锁具", brands: ["AKRD", "MSI", "GRIFFWERK", "AGB", "OTLAV", "Casarte"] },
      { label: "封边与固定件", brands: ["REHAU", "fischer"] },
    ],
  },
  precision: {
    label: "精密制造",
    title: "德国 HOMAG 开料与封边。",
    lead: "从第一刀开料到最后一道封边，每个环节都对照确认的图纸与饰面样板进行检查。",
    cards: [
      { no: "01", kicker: "HOMAG SAWTEQ B-180", title: "精准开料", text: "德国 HOMAG 推台锯按确认尺寸切割，帮助相邻部件在组装时对齐。", image: "/media/mf/precision-saw.jpg" },
      { no: "02", kicker: "HOMAG 封边产线", title: "激光封边", text: "适用板件上，激光封边使板面与侧边过渡干净。我们检查接缝与转角。", image: "/media/factory-collection/edgebanding-1" },
      { no: "03", kicker: "板件表面清洁", title: "生产过程质检", text: "生产中，我们对照确认的图纸与样板检查尺寸、饰面与颜色。", image: "f023" },
    ],
  },
  quality: {
    label: "质检与试装",
    title: "工厂里先装一次，到现场才能严丝合缝。",
    lead: "打包前，柜体在我们的车间内完成组装，并对照确认的图纸进行检查。",
    bandKicker: "出货前",
    bandFigure: "100%",
    bandTitle: "柜体试装",
    bandText: "每一份订单的全部柜体，出货前都在工厂完成试装。",
    bandPoints: ["柜体配合", "门的对齐与缝隙", "五金操作"],
    downloadsLabel: "质检标准（PDF）",
    downloads: [
      { title: "板件开料", file: "01_CIRMANO_Panel_Cutting_QC_EN.pdf" },
      { title: "封边", file: "02_CIRMANO_Edge_Banding_QC_EN.pdf" },
      { title: "板件打孔", file: "03_CIRMANO_Panel_Drilling_QC_EN.pdf" },
      { title: "弧形封边", file: "04_CIRMANO_Curved_Edge_Banding_QC_EN.pdf" },
      { title: "包装", file: "05_CIRMANO_Packaging_QC_EN.pdf" },
      { title: "试装", file: "06_CIRMANO_Trial_Assembly_QC_EN.pdf" },
    ],
  },
  exportCopy: {
    label: "出口经验",
    title: "我们为亚洲、欧洲、北美、非洲和大洋洲市场定制柜体。",
    lead: "产品远销美国、英国、澳大利亚、新加坡、印度、印度尼西亚、马来西亚、泰国、塞内加尔、沙特阿拉伯及其他国际市场。",
    cards: [
      { title: "出口包装", text: "部件经过包裹与装箱，并做好防护，适应远距离运输。" },
      { title: "标签与装箱单", text: "每个包裹都贴有安装标识，并附对应的装箱单。" },
      { title: "装柜与单证", text: "订单按项目所需的单证装柜并发运。" },
    ],
  },
};

export function getMfCopy(locale: Locale): MfCopy {
  return locale === "zh" ? zh : en;
}
