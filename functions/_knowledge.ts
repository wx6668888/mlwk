export type KnowledgeEntry = {
  id: string;
  title: string;
  keywords: string[];
  content: string;
};

export const knowledgeBase: KnowledgeEntry[] = [
  {
    id: "brand",
    title: "CIRMANO and its role",
    keywords: ["cirmano", "brand", "company", "品牌", "公司", "entreprise"],
    content:
      "CIRMANO is a whole-home customization brand based in Foshan, Guangdong, China. Its line is 'Made As One' and its descriptor is 'Integrated Whole-Home Customization'. CIRMANO focuses on villas and premium homes.",
  },
  {
    id: "products",
    title: "Core product scope",
    keywords: ["kitchen", "wardrobe", "door", "wall panel", "cabinet", "产品", "厨房", "衣柜", "室内门", "墙板"],
    content:
      "The core whole-home product categories are kitchens, wardrobes, interior doors and wall panels. Other items, including vanities, bespoke built-ins, aluminium and glass, are supplementary or project-specific and should be confirmed for each enquiry. Dimensions, construction, materials, hardware and finishes are developed around the approved project scope.",
  },
  {
    id: "positioning",
    title: "Project fit",
    keywords: ["villa", "residential", "premium home", "hotel", "hospitality", "commercial", "住宅", "别墅", "酒店", "商业"],
    content:
      "CIRMANO is positioned for villas and premium residences. Do not promise hospitality, commercial or other sectors as standard services. The team reviews each project enquiry to confirm whether its location, product scope, interfaces and delivery requirements are a fit.",
  },
  {
    id: "workflow",
    title: "Project workflow",
    keywords: ["process", "workflow", "drawing", "sample", "production", "流程", "图纸", "打样"],
    content:
      "The project workflow can include review of drawings, scope, destination and programme; development of shop drawings and interfaces; confirmation of materials, finishes and critical samples; manufacturing to the approved package; and project-specific packing, labels and installation information. Exact services and responsibilities are confirmed in writing for each project.",
  },
  {
    id: "case",
    title: "Published project photography",
    keywords: ["project", "case study", "photo", "completed", "案例", "照片", "广州"],
    content:
      "The current brand materials show one completed residence in Guangzhou. Do not present it as multiple projects or claim that CIRMANO supplied or installed every product shown until the scope is confirmed. There is no verified 500-project statistic in the current brand materials.",
  },
  {
    id: "manufacturing",
    title: "Manufacturing information",
    keywords: ["factory", "HOMAG", "edgebanding", "inspection", "试装", "工厂", "制造"],
    content:
      "Brand materials show HOMAG manufacturing equipment. Laser edgebanding applies only to specified compatible components. Selected cabinetry is inspected and trial-assembled before dispatch. Do not broaden these statements into claims about every component or every order.",
  },
  {
    id: "quote",
    title: "Starting a project enquiry",
    keywords: ["quote", "price", "cost", "budget", "询价", "价格", "预算", "devis"],
    content:
      "A useful enquiry includes available plans or sketches, project type and location, product scope, approximate quantities, preferred materials or finish direction, target timing and budget context. The website accepts PDF, DWG, DXF, ZIP, JPG and PNG files, up to five files and 100 MB in total. Exact pricing requires a project review.",
  },
  {
    id: "contact",
    title: "Contact CIRMANO",
    keywords: ["contact", "email", "whatsapp", "address", "联系", "邮箱", "电话"],
    content:
      "For project enquiries, contact kai@cirmano.com or use WhatsApp at +86 186 6638 4092. CIRMANO is based in Foshan, Guangdong, China. Confirm visit arrangements and the exact business address with the team before travel.",
  },
  {
    id: "verification",
    title: "Facts requiring confirmation",
    keywords: ["moq", "capacity", "certificate", "lead time", "freight", "认证", "产能", "交期", "起订", "运费"],
    content:
      "Do not invent or estimate certifications, factory capacity, MOQ, exact lead times, freight cost, installation responsibilities or commercial terms. The CIRMANO team must confirm these project-dependent details after reviewing the enquiry. Do not claim established delivery regions or completed overseas projects without evidence.",
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
