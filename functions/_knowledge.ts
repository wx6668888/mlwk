export type KnowledgeEntry = {
  id: string;
  title: string;
  keywords: string[];
  content: string;
};

// Sources: brand pack, the CIRMANO Facebook profile, and the client FAQ (CIRMANO-FAQ常见问题整理, 2026-11-02).
// Items the FAQ marked [TO BE CONFIRMED] are filled only from confirmed facts (address from src/site/brand.ts).
export const knowledgeBase: KnowledgeEntry[] = [
  {
    id: "brand",
    title: "CIRMANO and its role",
    keywords: ["cirmano", "brand", "company", "who are you", "what do you do", "品牌", "公司", "你们是做什么", "entreprise"],
    content:
      "CIRMANO is a factory-direct whole-home customization brand based in Foshan, Guangdong, China. Its line is 'Made As One' and its descriptor is 'Integrated Whole-Home Customization'. CIRMANO designs and manufactures kitchens, wardrobes, interior doors and wall panels as one system in its own factory, and offers a one-stop service from design through manufacturing to shipping. It mainly serves villas and premium homes.",
  },
  {
    id: "products",
    title: "Products you can source",
    keywords: ["kitchen", "wardrobe", "door", "wall panel", "cabinet", "window", "flooring", "stone", "tile", "bathroom", "furniture", "lighting", "产品", "厨房", "衣柜", "室内门", "墙板", "门窗", "地板", "石材", "瓷砖", "卫浴", "家具", "灯具", "品类"],
    content:
      "CIRMANO's own core manufactured categories are kitchens, wardrobes and storage, interior doors and wall panels. Through the one-stop service, clients can also discuss sourcing windows, flooring, stone, tiles, bathroom products, furniture, lighting and wall finishes. Availability and customization options vary by product: the client should list the items needed so the team can confirm suitable options.",
  },
  {
    id: "positioning",
    title: "Who CIRMANO works with",
    keywords: ["villa", "homeowner", "designer", "architect", "builder", "contractor", "developer", "hotel", "commercial", "住宅", "别墅", "业主", "设计师", "建筑师", "承包商", "开发商", "酒店", "商业"],
    content:
      "CIRMANO works with private homeowners and villa owners, interior designers and architects, builders and contractors, and residential developers. Villas and premium homes are the main focus. Commercial or hospitality projects are reviewed case by case; do not promise them as a standard service. Ask the client to share their role and project type.",
  },
  {
    id: "service",
    title: "One-stop service, step by step",
    keywords: ["one-stop", "service", "process", "how it works", "steps", "project manager", "一站式", "服务", "流程", "步骤", "项目经理"],
    content:
      "The one-stop service runs in six steps: 1) get to know CIRMANO through a factory and showroom visit in Foshan, a video call or the 360° virtual tour; 2) project planning: the client sends a floor plan and CIRMANO's designers develop layouts and drawings for approval; 3) materials and finishes chosen with real samples; 4) manufacturing and quality control in CIRMANO's own factory on German HOMAG equipment, with trial assembly; 5) export packing, labelling and shipping; 6) installation information and after-sales support. A project manager follows the order throughout. The service is flexible: clients can order only some products, use their own shipping agent, build from their own designer's drawings, or adjust the steps. Details: the website's Service page.",
  },
  {
    id: "start",
    title: "Starting without a finished design, or remotely",
    keywords: ["no design", "floor plan", "start", "remote", "online", "without travelling", "没有设计", "户型图", "开始", "远程", "线上", "不去中国"],
    content:
      "A client can start without a finished interior design: a floor plan, basic dimensions, inspiration photos or a short brief is enough, plus the project location, preferred style and materials being considered. Final dimensions and specifications must be approved before made-to-order products enter production. Projects can also be run without travelling to China: send plans and requirements online, preview the showroom with the 360° virtual tour, and ask about product information, samples and the approvals needed for a remote order.",
  },
  {
    id: "customization",
    title: "Customization and design support",
    keywords: ["customize", "custom", "drawings", "design service", "design fee", "interior design", "定制", "图纸", "设计服务", "设计费", "室内设计"],
    content:
      "Many products can be customized in size, material, colour, finish or hardware. Clients send drawings and required specifications so the team can confirm feasibility item by item; customization limits, minimum quantities, pricing and production time are agreed before the order is confirmed. Design support can be discussed alongside product sourcing; a project consultation is different from a full design package, so deliverables, fees and revision limits are confirmed in writing.",
  },
  {
    id: "samples",
    title: "Samples, standards and matching finishes",
    keywords: ["sample", "colour", "color", "finish", "standard", "certificate", "compliance", "样品", "样板", "颜色", "饰面", "标准", "认证", "色差"],
    content:
      "Samples can be requested for shortlisted products; availability, charges and courier costs depend on the item and destination. Physical samples, not screen images, are the colour reference, and the approved finish is confirmed before production. For local requirements, send the required standards first and ask for documentation for the exact model and material; a local architect or contractor should review suitability, and one certificate should not be assumed to cover every product. To coordinate finishes across categories, share the palette, reference images and room layouts; natural stone, timber and production batches can vary, so acceptable variation and approved references are recorded in the order documents.",
  },
  {
    id: "quote",
    title: "Requesting a quotation and what it includes",
    keywords: ["quote", "quotation", "price", "cost", "budget", "moq", "minimum order", "询价", "报价", "价格", "预算", "起订量", "devis"],
    content:
      "For a quotation, send the project country and city, floor plans or measurements, product categories, approximate quantities, preferred finishes, target schedule and, if possible, a budget range; say which selections are still open. The website accepts PDF, DWG, DXF, ZIP, JPG and PNG files, up to five files and 100 MB in total. Any minimum quantity depends on the product and customization and is confirmed for each selection; small orders should be weighed against packing, freight and destination charges. A quotation states specifications, quantities, currency, validity and agreed services; packing, samples, design, freight, insurance, duties, taxes, local delivery and installation are marked included, excluded or quoted separately. Exact pricing requires a project review.",
  },
  {
    id: "payment",
    title: "Payment, changes and cancellation",
    keywords: ["payment", "deposit", "balance", "bank", "change order", "cancel", "refund", "付款", "定金", "尾款", "银行", "修改订单", "取消", "退款"],
    content:
      "Payment methods, beneficiary details and the deposit and balance schedule are those stated on the confirmed invoice or agreement. If bank details ever appear to change, the client must verify directly with their established CIRMANO contact before paying. Changes after confirmation go through the project manager; feasibility, charges and timing depend on the item and order stage, especially for custom production, and need written approval. Cancellation and return conditions are order-specific; standard retail return rules do not apply.",
  },
  {
    id: "production",
    title: "Lead time, approvals and quality checks",
    keywords: ["lead time", "how long", "production time", "delivery time", "quality", "inspection", "approve", "交期", "多久", "生产周期", "品质", "质检", "确认"],
    content:
      "There is no single lead time: availability, customization, approvals, order volume and transport all affect it. Ask for an estimated production date and a separate transit estimate for the confirmed selection, and allow for customs, local delivery and site preparation. Before custom production the client approves drawings, dimensions, quantities and finish references, with site dimensions checked by the local professional; approvals and exclusions are recorded in writing. Specifications, approved samples and inspection checkpoints are agreed before production; ask which checks and records are included for the order.",
  },
  {
    id: "manufacturing",
    title: "CIRMANO manufacturing",
    keywords: ["factory", "HOMAG", "manufacturing", "edgebanding", "trial assembly", "cutting", "drilling", "packing", "工厂", "制造", "德系", "封边", "试装", "开料", "打孔", "打包", "源头工厂"],
    content:
      "CIRMANO manufactures in its own factory in Foshan on German HOMAG equipment: German precision manufacturing, factory-direct from the source, reliable quality and fair pricing. Production runs in ten steps: cutting, edge banding, drilling, sorting, shaped parts, trial assembly, cleaning, packing, warehousing and shipping. Cabinetry is trial-assembled in the factory to check fit, gaps and alignment before packing. Laser edgebanding applies only to specified compatible components. The Manufacturing page explains the route from confirmed design to materials, manufacturing, QC and shipping, and links to the factory tour videos on Facebook (facebook.com/cirmanoofficial).",
  },
  {
    id: "warranty",
    title: "Warranty and after-sales",
    keywords: ["warranty", "guarantee", "after-sales", "support", "damaged", "missing", "broken", "保修", "质保", "售后", "破损", "缺件"],
    content:
      "Warranty duration and coverage vary by product and agreed terms; request the written warranty for each category, including exclusions, claim requirements and responsibility for labour or freight. For after-sales help, contact the project manager or the website's contact page with the order reference, product details, a description and clear photos or video, and keep packaging and documents. If items arrive damaged or missing, photograph the packaging, labels and goods as soon as possible, keep delivery records and contact the project manager promptly; the team reviews the evidence, carrier or insurance procedures and the contract before confirming next steps.",
  },
  {
    id: "shipping",
    title: "International shipping, duties and installation",
    keywords: ["shipping", "freight", "container", "customs", "duty", "tax", "ddp", "installation", "install", "运输", "海运", "物流", "清关", "关税", "税费", "送货", "安装"],
    content:
      "International shipping can be discussed for each project: send the destination country, city and postcode with the product list, and the team confirms routes, export requirements and delivery options; freight depends on destination and shipment details. Different categories can be consolidated when readiness, packing and the delivery plan allow; ask how split production dates, storage or partial shipments affect cost and schedule. Duties, taxes, clearance and door delivery are included only when the agreed delivery terms say so; ask for a written breakdown, and if DDP or door delivery is offered, confirm its scope and exclusions. Installation: CIRMANO provides installation information and remote guidance; local site work is planned with the client's contractor, and any on-site technician visit is confirmed separately.",
  },
  {
    id: "visit",
    title: "Showroom visits in Foshan",
    keywords: ["showroom", "visit", "address", "where", "appointment", "book", "pickup", "airport", "hotel", "coffee", "展厅", "参观", "地址", "在哪", "预约", "接站", "接机", "酒店", "咖啡"],
    content:
      "The CIRMANO factory is at No. 10, Chendong Industrial Zone, Chendong Village, Shishan Town, Nanhai District, Foshan, Guangdong, China; confirm the meeting point and appointment with the team before setting off. Showroom visits are free. Book through WhatsApp (+86 186 6638 4092) or the website's contact page with the preferred date, project type and product interests; a floor plan or product list helps the team prepare. Complimentary pickup can be requested after submitting a floor plan or product list; there is no fixed advance-booking rule, but it must be confirmed before travel. The team can help book nearby hotels if asked at least one day ahead; accommodation is paid by the guest. During the visit a project manager gives one-to-one guidance, and each guest is offered a complimentary coffee.",
  },
  {
    id: "virtual",
    title: "360° virtual tour, client visits and factory tour",
    keywords: ["virtual", "360", "online showroom", "tour", "client visit", "factory tour", "facebook", "video", "线上展厅", "虚拟", "全景", "客户来访", "工厂参观", "视频"],
    content:
      "Clients can preview the showroom online with the 360° virtual tour linked on the website's Service page and the CIRMANO Facebook profile; ask the team which areas are currently open before planning a visit, as displays can change. Client visit reels on Facebook: facebook.com/reel/4698828180440781 (choosing finishes from samples), facebook.com/reel/2119515339439862 (showroom table), facebook.com/reel/1901849464523713 (materials and durability), facebook.com/reel/1704677944416066 (walking the factory floor with clients), facebook.com/reel/1634915701622283 (the production process). Factory film: facebook.com/reel/1635133378115058. More at facebook.com/cirmanoofficial; the website's Service, Projects and Manufacturing pages link to them.",
  },
  {
    id: "case",
    title: "Published project photography",
    keywords: ["project", "case study", "photo", "completed", "案例", "照片", "广州"],
    content:
      "The current brand materials show one completed residence in Guangzhou. Do not present it as multiple projects or claim that CIRMANO supplied or installed every product shown until the scope is confirmed. There is no verified 500-project statistic in the current brand materials.",
  },
  {
    id: "contact",
    title: "Contact CIRMANO",
    keywords: ["contact", "email", "whatsapp", "phone", "联系", "邮箱", "电话"],
    content:
      "For project enquiries, contact kai@cirmano.com or use WhatsApp at +86 186 6638 4092. CIRMANO is based in Foshan, Guangdong, China.",
  },
  {
    id: "verification",
    title: "Facts requiring confirmation",
    keywords: ["capacity", "certificate", "exact lead time", "freight cost", "认证", "产能", "运费"],
    content:
      "Do not invent or estimate certifications, factory capacity, MOQ, exact lead times, freight cost, installation responsibilities or commercial terms. The CIRMANO team confirms these project-dependent details after reviewing the enquiry. Do not claim established delivery regions or completed overseas projects without evidence.",
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
