export type KnowledgeEntry = {
  id: string;
  title: string;
  keywords: string[];
  content: string;
};

export const knowledgeBase: KnowledgeEntry[] = [
  {
    id: "brand",
    title: "MLWK and its role",
    keywords: ["mlwk", "millwork", "brand", "company", "品牌", "公司", "من", "entreprise"],
    content:
      "MLWK comes from the abbreviation for millwork used in architectural drawings. Its promise is 'Millwork, Made to Order.' MLWK is a manufacturing and project-development partner for made-to-order cabinetry and architectural millwork, serving project clients in Europe, North America and the Middle East.",
  },
  {
    id: "collections",
    title: "Product collections",
    keywords: ["kitchen", "wardrobe", "vanity", "panel", "door", "built-in", "产品", "厨房", "衣柜", "باب", "مطابخ"],
    content:
      "MLWK develops six coordinated systems: kitchens, wardrobes, vanities, wall panels, interior doors and bespoke built-ins. Dimensions, construction, materials, hardware and finishes are developed around the drawings and project conditions.",
  },
  {
    id: "sectors",
    title: "Project sectors",
    keywords: ["villa", "residential", "hotel", "hospitality", "commercial", "住宅", "别墅", "酒店", "فندق", "فيلا"],
    content:
      "MLWK is positioned for luxury residential, hospitality and selected commercial projects. Typical conversations involve architects, interior designers, contractors, developers and project owners who need one coordinated millwork package.",
  },
  {
    id: "workflow",
    title: "Project workflow",
    keywords: ["process", "workflow", "drawing", "sample", "production", "流程", "图纸", "打样", "مخطط", "عينة"],
    content:
      "The working sequence is: review the drawings, scope, destination and programme; develop shop drawings and interfaces; confirm materials, finishes and critical samples; manufacture with staged quality checks; protect and label components by room or area; coordinate shipment and provide remote installation support.",
  },
  {
    id: "quote",
    title: "Starting a quotation",
    keywords: ["quote", "price", "cost", "budget", "询价", "价格", "预算", "عرض", "سعر", "devis"],
    content:
      "A useful quotation starts with the available plans or sketches, project type and location, scope, approximate quantities, preferred materials or finish direction, target delivery window and budget context. The website accepts PDF, DWG, DXF, ZIP, JPG and PNG files, up to five files and 100 MB in total. Exact pricing requires a project review.",
  },
  {
    id: "delivery",
    title: "International delivery and installation",
    keywords: ["shipping", "delivery", "install", "export", "运输", "交付", "安装", "شحن", "تركيب"],
    content:
      "MLWK prepares components for international delivery with protective packing, clear labels and organization by room or area. Installation support is limited to numbered components, drawings, video guidance and remote coordination; local installation labor is not currently promised.",
  },
  {
    id: "proof",
    title: "Experience claim",
    keywords: ["500", "project", "experience", "案例", "经验", "مشروع", "référence"],
    content:
      "The manufacturing team has completed more than 500 custom projects in total. This must never be described as 500 overseas deliveries. Completed international case studies are published only when they can be verified; generated imagery is labeled as design direction, not completed work.",
  },
  {
    id: "languages",
    title: "Languages and regions",
    keywords: ["language", "english", "arabic", "chinese", "german", "french", "语言", "阿拉伯语", "لغة"],
    content:
      "The website supports English, Arabic, Chinese, German and French. Arabic uses a full right-to-left interface. Formal project communication availability should be confirmed by the human team when a project is qualified.",
  },
  {
    id: "verification",
    title: "Facts requiring human confirmation",
    keywords: ["moq", "capacity", "certificate", "lead time", "factory address", "认证", "产能", "交期", "起订", "شهادة"],
    content:
      "Do not invent or estimate certifications, factory capacity, MOQ, exact lead times, freight cost or commercial terms. These project-dependent details must be confirmed by the MLWK team after reviewing the drawings. A verified factory address is not yet published on the website; a human teammate can share official visit details during project qualification.",
  },
];

function normalize(value: string) {
  return value.toLocaleLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, " ");
}

export function retrieveKnowledge(query: string, limit = 4) {
  const normalized = normalize(query);
  const terms = normalized.split(/\s+/).filter((term) => term.length > 1);

  return knowledgeBase
    .map((entry) => {
      const haystack = normalize(
        `${entry.title} ${entry.keywords.join(" ")} ${entry.content}`,
      );
      const keywordScore = entry.keywords.reduce(
        (score, keyword) =>
          score + (normalized.includes(normalize(keyword)) ? 6 : 0),
        0,
      );
      const termScore = terms.reduce(
        (score, term) => score + (haystack.includes(term) ? 1 : 0),
        0,
      );
      return { entry, score: keywordScore + termScore };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ entry }) => entry);
}
