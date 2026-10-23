export const locales = ["en", "ar", "zh", "de", "fr"] as const;
export type Locale = (typeof locales)[number];

export const localeMeta: Record<
  Locale,
  { label: string; short: string; dir: "ltr" | "rtl" }
> = {
  en: { label: "English", short: "EN", dir: "ltr" },
  ar: { label: "العربية", short: "AR", dir: "rtl" },
  zh: { label: "中文", short: "中", dir: "ltr" },
  de: { label: "Deutsch", short: "DE", dir: "ltr" },
  fr: { label: "Français", short: "FR", dir: "ltr" },
};

export type CollectionItem = {
  slug: string;
  image: string;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  features: Record<Locale, string[]>;
};

export const collections: CollectionItem[] = [
  {
    slug: "kitchens",
    image: "/media/cirmano-project-dining-p234.webp",
    name: {
      en: "Kitchens",
      ar: "المطابخ",
      zh: "定制厨房",
      de: "Küchen",
      fr: "Cuisines",
    },
    description: {
      en: "Integrated cabinetry engineered around appliances, services and the way a project is built.",
      ar: "خزائن متكاملة مصممة حول الأجهزة والخدمات وطريقة تنفيذ المشروع.",
      zh: "围绕电器、设备接口与项目施工方式进行深化的整体柜体系统。",
      de: "Integrierte Schranklösungen, abgestimmt auf Geräte, Haustechnik und Bauweise.",
      fr: "Des agencements intégrés conçus autour des appareils, des réseaux et du mode de construction.",
    },
    features: {
      en: ["Full-height storage", "Integrated appliances", "Matched veneers", "Custom internals"],
      ar: ["تخزين كامل الارتفاع", "أجهزة مدمجة", "قشرة خشبية متطابقة", "تجهيزات داخلية مخصصة"],
      zh: ["通顶收纳", "嵌入式电器", "木皮对纹", "定制内部五金"],
      de: ["Raumhoher Stauraum", "Integrierte Geräte", "Furnierabwicklung", "Individueller Innenausbau"],
      fr: ["Rangements toute hauteur", "Appareils intégrés", "Placage raccordé", "Aménagement intérieur sur mesure"],
    },
  },
  {
    slug: "wardrobes",
    image: "/media/cirmano-project-wardrobe-p092.webp",
    name: {
      en: "Wardrobes",
      ar: "خزائن الملابس",
      zh: "衣柜系统",
      de: "Kleiderschränke",
      fr: "Dressings",
    },
    description: {
      en: "Dressing systems that align storage, lighting and architecture in one continuous interior.",
      ar: "أنظمة ملابس تجمع التخزين والإضاءة والعمارة في مساحة داخلية واحدة متكاملة.",
      zh: "将收纳、灯光与建筑界面整合为连续空间的衣柜系统。",
      de: "Ankleidesysteme, die Stauraum, Licht und Architektur zu einem Interieur verbinden.",
      fr: "Des dressings qui réunissent rangement, éclairage et architecture dans un ensemble continu.",
    },
    features: {
      en: ["Hinged or sliding", "Glass framing", "Integrated lighting", "Accessory systems"],
      ar: ["مفصلي أو منزلق", "إطارات زجاجية", "إضاءة مدمجة", "أنظمة إكسسوارات"],
      zh: ["平开或移门", "玻璃框架", "集成照明", "配件系统"],
      de: ["Dreh- oder Schiebetüren", "Glasrahmen", "Integriertes Licht", "Zubehörsysteme"],
      fr: ["Battant ou coulissant", "Cadres vitrés", "Éclairage intégré", "Accessoires intérieurs"],
    },
  },
  {
    slug: "vanities",
    image: "/media/cirmano-project-vanity-p078.webp",
    name: {
      en: "Supplementary Vanities",
      ar: "وحدات حمام تكميلية",
      zh: "补充浴室柜",
      de: "Ergänzende Waschtische",
      fr: "Meubles vasques complémentaires",
    },
    description: {
      en: "Supplementary vanity elements may be included when they fit the confirmed whole-home project scope.",
      ar: "يمكن إدراج وحدات الحمام كعناصر تكميلية ضمن نطاق المشروع المتكامل بعد تأكيده.",
      zh: "浴室柜作为补充项目时，可按确认后的全屋范围协同深化。",
      de: "Ergänzende Waschtische können nach Bestätigung in den Umfang des Wohnprojekts aufgenommen werden.",
      fr: "Des meubles vasques complémentaires peuvent être intégrés au périmètre confirmé du projet résidentiel.",
    },
    features: {
      en: ["Project-specific scope", "Material coordination", "Fixture interfaces", "Specifications confirmed by project"],
      ar: ["نطاق حسب المشروع", "تنسيق المواد", "واجهات التجهيزات", "تأكيد المواصفات لكل مشروع"],
      zh: ["按项目确认范围", "材质协调", "设备接口", "逐项确认规格"],
      de: ["Projektspezifischer Umfang", "Materialabstimmung", "Anschlussdetails", "Bestätigung der Spezifikation je Projekt"],
      fr: ["Périmètre propre au projet", "Coordination des matériaux", "Interfaces des équipements", "Spécifications confirmées par projet"],
    },
  },
  {
    slug: "wall-panels",
    image: "/media/cirmano-project-p175.jpg",
    name: {
      en: "Wall Panels",
      ar: "كسوات الجدران",
      zh: "墙板系统",
      de: "Wandpaneele",
      fr: "Panneaux muraux",
    },
    description: {
      en: "Panel systems that carry veneer matching, concealed access and room-scale detailing.",
      ar: "أنظمة كسوة تجمع تطابق القشرة والمداخل المخفية وتفاصيل المقياس المعماري.",
      zh: "实现木皮连续对纹、隐形检修口与建筑尺度细节的墙板系统。",
      de: "Paneelsysteme mit Furnierabwicklung, verdeckten Zugängen und raumbezogenen Details.",
      fr: "Des panneaux avec raccord de placage, accès dissimulés et détails à l'échelle de la pièce.",
    },
    features: {
      en: ["Flat, reeded or shaped", "Concealed access", "Integrated doors", "Acoustic options"],
      ar: ["مسطح أو مخدد أو مشكل", "وصول مخفي", "أبواب مدمجة", "خيارات صوتية"],
      zh: ["平板、格栅或造型", "隐形检修", "门墙一体", "声学选项"],
      de: ["Glatt, geriffelt oder geformt", "Verdeckte Zugänge", "Integrierte Türen", "Akustikoptionen"],
      fr: ["Plat, cannelé ou formé", "Accès dissimulés", "Portes intégrées", "Options acoustiques"],
    },
  },
  {
    slug: "interior-doors",
    image: "/media/cirmano-project-door-detail-p066.webp",
    name: {
      en: "Interior Doors",
      ar: "الأبواب الداخلية",
      zh: "室内门",
      de: "Innentüren",
      fr: "Portes intérieures",
    },
    description: {
      en: "Flush, framed and pivot doors developed as part of the surrounding millwork.",
      ar: "أبواب مستوية أو بإطار أو محورية تُطوّر كجزء من أعمال الخشب المحيطة.",
      zh: "与周边木作一体深化的平板门、框架门与中轴门系统。",
      de: "Flächenbündige, gerahmte und Pivot-Türen als Teil des umliegenden Innenausbaus.",
      fr: "Portes affleurantes, encadrées ou pivotantes développées avec les boiseries environnantes.",
    },
    features: {
      en: ["Flush frames", "Pivot systems", "Veneer matching", "Hardware coordination"],
      ar: ["إطارات مستوية", "أنظمة محورية", "تطابق القشرة", "تنسيق الحديد"],
      zh: ["隐形门框", "中轴系统", "木皮对纹", "五金协调"],
      de: ["Bündige Zargen", "Pivot-Systeme", "Furnierabwicklung", "Beschlagkoordination"],
      fr: ["Huisseries affleurantes", "Systèmes pivot", "Raccord de placage", "Coordination quincaillerie"],
    },
  },
  {
    slug: "bespoke-built-ins",
    image: "/media/cirmano-project-study-p115.webp",
    name: {
      en: "Other Built-ins · Project-Specific",
      ar: "تجهيزات أخرى حسب المشروع",
      zh: "其他柜体与木作 · 按项目确认",
      de: "Weitere Einbauten · projektspezifisch",
      fr: "Autres agencements · selon le projet",
    },
    description: {
      en: "Other built-in elements are supplementary and are scoped individually for each approved project.",
      ar: "تُعد التجهيزات المدمجة الأخرى عناصر تكميلية ويُحدد نطاقها لكل مشروع معتمد.",
      zh: "其他柜体与木作作为补充项目，按每个已确认项目单独界定范围。",
      de: "Weitere Einbauten sind ergänzende Elemente; ihr Umfang wird je freigegebenem Projekt festgelegt.",
      fr: "Les autres agencements sont complémentaires ; leur périmètre est défini pour chaque projet approuvé.",
    },
    features: {
      en: ["Project-specific scope", "Material coordination", "Interface review", "Details confirmed by project"],
      ar: ["نطاق حسب المشروع", "تنسيق المواد", "مراجعة الواجهات", "تأكيد التفاصيل لكل مشروع"],
      zh: ["按项目确认范围", "材质协调", "接口审核", "逐项确认细节"],
      de: ["Projektspezifischer Umfang", "Materialabstimmung", "Schnittstellenprüfung", "Bestätigung der Details je Projekt"],
      fr: ["Périmètre propre au projet", "Coordination des matériaux", "Étude des interfaces", "Détails confirmés par projet"],
    },
  },
];

export const solutions = [
  {
    slug: "residential",
    image: "/media/cirmano-project-p175.jpg",
    name: { en: "Villas & Premium Homes", ar: "الفلل والمنازل الراقية", zh: "别墅与高端住宅", de: "Villen und hochwertige Wohnhäuser", fr: "Villas et résidences haut de gamme" },
    description: {
      en: "Integrated whole-home customization for villas and premium residences, coordinated around the approved project scope.",
      ar: "تخصيص متكامل للفلل والمساكن الراقية، وفق نطاق المشروع المعتمد.",
      zh: "面向别墅与高端住宅的一体化全屋定制，并围绕确认后的项目范围协同深化。",
      de: "Integrierte Maßanfertigung für Villen und hochwertige Wohnhäuser, abgestimmt auf den bestätigten Projektumfang.",
      fr: "Un aménagement intégré pour villas et résidences haut de gamme, coordonné selon le périmètre confirmé.",
    },
  },
  {
    slug: "hospitality",
    image: "/media/cirmano-project-wardrobe-p092.webp",
    name: { en: "Whole-Home Systems", ar: "أنظمة متكاملة للمنزل", zh: "一体化全屋系统", de: "Ganzheitliche Wohnsysteme", fr: "Systèmes pour toute la maison" },
    description: {
      en: "Kitchens, wardrobes, interior doors and wall panels developed to share materials, proportions and details.",
      ar: "مطابخ وخزائن وأبواب داخلية وألواح جدارية تتشارك المواد والنسب والتفاصيل.",
      zh: "协同深化橱柜、衣柜、室内门与墙板，让材质、比例和细节形成统一语言。",
      de: "Küchen, Schränke, Innentüren und Wandpaneele mit abgestimmten Materialien, Proportionen und Details.",
      fr: "Cuisines, dressings, portes intérieures et panneaux muraux aux matériaux, proportions et détails coordonnés.",
    },
  },
  {
    slug: "commercial",
    image: "/media/cirmano-project-door-detail-p066.webp",
    name: { en: "Project-Specific Scope", ar: "نطاق خاص بالمشروع", zh: "按项目确认范围", de: "Projektspezifischer Umfang", fr: "Périmètre défini par projet" },
    description: {
      en: "Product supply, installation and project interfaces are reviewed and confirmed for each enquiry.",
      ar: "تُراجع تفاصيل التوريد والتركيب وواجهات المشروع وتُعتمد لكل استفسار.",
      zh: "产品供货、安装责任与项目接口，均在每次咨询后逐项审核确认。",
      de: "Lieferumfang, Montage und Projektschnittstellen werden für jede Anfrage geprüft und bestätigt.",
      fr: "La fourniture, la pose et les interfaces sont étudiées puis confirmées pour chaque demande.",
    },
  },
] as const;

export const copy = {
  en: {
      nav: { collections: "Products", solutions: "Project Scope", projects: "Projects", capabilities: "Capabilities", company: "Company", quote: "Send Your Drawings" },
    common: { explore: "Explore", viewAll: "View all", learnMore: "Learn more", concept: "Design direction", back: "Back", openMenu: "Open menu", closeMenu: "Close menu", language: "Language" },
    home: {
      badge: "Integrated whole-home customization",
      title: "Made As One",
      intro: "Integrated whole-home customization for villas and premium homes. Kitchens, wardrobes, interior doors and wall panels, brought together through a shared design language.",
      collectionsEyebrow: "One design language, carried through the home",
      collectionsTitle: "Made to work as one",
      collectionsText: "Kitchens, wardrobes, interior doors and wall panels are coordinated through shared materials, proportions and details.",
      processEyebrow: "From first line to final room",
      processTitle: "Complex work, resolved with quiet precision",
      processText: "Drawings, samples and specifications are coordinated against the agreed project scope. Manufacturing handoff requirements are confirmed before work proceeds.",
      directionEyebrow: "A completed residence · Guangzhou",
      directionTitle: "A home, shown through its details.",
      directionText: "Project photography from one completed Guangzhou residence. Product supply and installation scope should be confirmed for each published case detail.",
      finalTitle: "Let’s discuss your project.",
      finalSubtext: "Share your plans, product scope and material direction to begin.",
    },
    pages: {
      collections: ["Products", "Integrated systems for the whole home", "Kitchens, wardrobes, interior doors and wall panels are developed around each project’s dimensions, materials and details."],
      solutions: ["Project Scope", "Made to work as one", "For villas and premium homes, product scope, materials, project interfaces and installation responsibilities are reviewed and confirmed case by case."],
      projects: ["Projects", "One completed home, shown with context.", "Project photography from one completed Guangzhou residence. Product supply and installation scope should be confirmed for each published case detail."],
      capabilities: ["Capabilities", "Detail is a delivery system", "A custom interior succeeds when design, material, production and installation information stay coordinated."],
      company: ["About CIRMANO", "Made As One.", "CIRMANO is a custom cabinetry manufacturer based in Foshan, China, specializing in integrated whole-home customization for villas and premium homes."],
      resources: ["Resources", "Useful before the first quotation", "Catalogues, finish references and technical guidance will be published as each document is verified."],
      privacy: ["Privacy", "How enquiry information is handled", "A concise launch-stage privacy notice for project enquiries and uploaded drawings."],
      terms: ["Terms", "Website and enquiry terms", "Terms for using CIRMANO website content and submitting project information."],
    },
    capabilitySteps: [
      ["01", "Review", "Available drawings, location, product scope and timing are reviewed together."],
      ["02", "Develop", "Shop drawings and interfaces are coordinated when included in the project scope."],
      ["03", "Sample", "Materials, finishes and critical details are confirmed where required before production."],
      ["04", "Manufacture", "HOMAG equipment is shown in brand materials. Laser edgebanding is used for specified compatible components; selected cabinetry is inspected and trial-assembled before dispatch."],
      ["05", "Pack", "Packing and labeling requirements are set for the destination and project."],
      ["06", "Coordinate", "Installation responsibilities and any local coordination are agreed in writing for each project."],
    ],
    quote: {
      eyebrow: "Project enquiry",
      title: "Send your drawings",
      intro: "Share what you know today. PDF, DWG, DXF, ZIP, JPG and PNG files are accepted, up to five files and 100 MB total.",
      fields: { name: "Name", company: "Company", email: "Work email", whatsapp: "WhatsApp / phone", country: "Country or region", projectType: "Project type", location: "Project location", scope: "Products required", quantity: "Estimated quantity", budget: "Budget range", delivery: "Target delivery", message: "Project brief", files: "Floor plan (optional)", consent: "I agree that CIRMANO may use this information to respond to my project enquiry.", submit: "Send enquiry", uploading: "Sending project…", success: "Your project has been received.", successText: "Our team will review the scope and reply using the contact details provided.", error: "The enquiry could not be sent. Please try again or contact us by WhatsApp." },
    },
    legal: {
      privacy: ["We collect the contact and project information you submit through the enquiry form.", "Uploaded files are used to review and respond to the relevant project request.", "We do not sell enquiry information. Service providers may process data only to operate hosting, storage, security and email delivery.", "You may request access, correction or deletion by contacting kai@cirmano.com."],
      terms: ["Project photographs are shown as supplied and refer to the project identified on the page.", "Product scope, specifications, quotations, schedules and availability are confirmed in a written project proposal.", "Drawings and files remain the property of their respective owners and are reviewed only for the requested project.", "CIRMANO names, text and original media may not be republished without permission."],
    },
  },
  zh: {
    nav: { collections: "产品系统", solutions: "项目方案", projects: "项目案例", capabilities: "交付能力", company: "关于我们", quote: "上传图纸询价" },
    common: { explore: "查看", viewAll: "查看全部", learnMore: "了解更多", concept: "设计方向", back: "返回", openMenu: "打开菜单", closeMenu: "关闭菜单", language: "语言" },
    home: {
      badge: "一体化全屋定制",
      title: "一体成就完整空间",
      intro: "CIRMANO立足中国佛山，专注别墅与高端住宅的一体化全屋定制制造。以统一的设计语言，连接橱柜、衣柜、室内门与墙板。",
      collectionsEyebrow: "让统一的设计语言贯穿全屋",
      collectionsTitle: "让每一部分彼此协调",
      collectionsText: "围绕共同的材质、比例与细节，协同深化橱柜、衣柜、室内门和墙板。",
      processEyebrow: "从第一根线，到最终落地",
      processTitle: "以安静的精度，解决复杂定制",
      processText: "依据确认后的项目范围协同图纸、样品与规格；生产开始前明确制造交接要求。",
      directionEyebrow: "广州完工住宅",
      directionTitle: "从空间细节看整体设计。",
      directionText: "本组实拍来自广州一处完工住宅。公开每项产品的供货与施工范围前，仍需逐项确认。",
      finalTitle: "让我们沟通你的项目。",
      finalSubtext: "发送户型图、产品需求和材质方向，开启进一步讨论。",
    },
    pages: {
      collections: ["产品", "面向完整住宅的一体化系统", "橱柜、衣柜、室内门和墙板围绕项目尺寸、材质与细节展开深化。"],
      solutions: ["项目范围", "让整体彼此协调", "面向别墅与高端住宅，产品范围、材料、项目接口和安装责任均按项目逐项审核确认。"],
      projects: ["项目案例", "一处完工住宅，呈现真实语境。", "本组实拍来自广州一处完工住宅。公开每项产品的供货与施工范围前，仍需逐项确认。"],
      capabilities: ["交付能力", "细节本身就是交付系统", "设计、材料、生产与安装信息始终协同，定制项目才能顺利落地。"],
      company: ["关于 CIRMANO / 西尔曼", "Made As One · 一体成就完整空间", "CIRMANO立足中国佛山，专注别墅与高端住宅的一体化全屋定制制造。我们连接橱柜、衣柜、室内门和墙板，让材质、比例与细节形成统一的设计语言。"],
      resources: ["资料中心", "在首次报价前就有用的信息", "产品目录、饰面参考与技术资料将在核实后逐步发布。"],
      privacy: ["隐私政策", "我们如何处理询盘信息", "适用于项目询盘和上传图纸的简明隐私说明。"],
      terms: ["使用条款", "网站与项目咨询条款", "使用 CIRMANO 网站内容和提交项目信息的基本条款。"],
    },
    capabilitySteps: [
      ["01", "评估", "共同审核现有图纸、项目地点、产品范围与时间安排。"],
      ["02", "深化", "在项目范围包含时，协调生产图与专业接口。"],
      ["03", "打样", "按项目需要，在生产前确认材料、饰面和关键细节。"],
      ["04", "制造", "品牌资料展示了HOMAG设备。激光封边用于指定兼容部件；选定柜体在出货前进行检查与试装。"],
      ["05", "包装", "按目的地与项目要求确认包装和标识方式。"],
      ["06", "协调", "逐项书面确认安装责任及当地协同事项。"],
    ],
    quote: {
      eyebrow: "项目询盘",
      title: "上传你的图纸",
      intro: "先提交当前已有的信息。支持 PDF、DWG、DXF、ZIP、JPG 和 PNG，最多 5 个文件，总计不超过 100 MB。",
      fields: { name: "姓名", company: "公司", email: "邮箱", whatsapp: "WhatsApp / 电话", country: "国家或地区", projectType: "项目类型", location: "项目地点", scope: "需要的产品", quantity: "预计数量", budget: "预算区间", delivery: "目标交付时间", message: "项目说明", files: "户型图（可选）", consent: "我同意 CIRMANO 使用这些信息回复本次项目咨询。", submit: "发送咨询", uploading: "正在发送…", success: "项目资料已收到。", successText: "团队将审核需求，并通过你填写的联系方式回复。", error: "发送失败，请重试或通过 WhatsApp 联系。" },
    },
    legal: {
      privacy: ["我们收集你通过项目咨询表单提交的联系方式和项目信息。", "上传文件用于审核并回复对应的项目需求。", "我们不会出售项目信息；托管、存储、安全与邮件服务商仅为运行网站处理必要数据。", "你可以通过 kai@cirmano.com 申请访问、更正或删除信息。"],
      terms: ["页面项目照片按对应案例信息展示。", "产品范围、规格、报价、进度与供货情况以书面项目方案确认为准。", "图纸和文件的权利归各自所有者，仅用于所请求的项目审核。", "未经许可，不得转载 CIRMANO 名称、文字与原创媒体。"],
    },
  },
  ar: {
    nav: { collections: "المنتجات", solutions: "نطاق المشروع", projects: "المشاريع", capabilities: "القدرات", company: "الشركة", quote: "أرسل مخططاتك" },
    common: { explore: "استكشف", viewAll: "عرض الكل", learnMore: "اعرف المزيد", concept: "اتجاه تصميمي", back: "عودة", openMenu: "فتح القائمة", closeMenu: "إغلاق القائمة", language: "اللغة" },
    home: {
      badge: "تخصيص متكامل للمنازل",
      title: "صُنع ككلّ واحد",
      intro: "تخصيص متكامل للفلل والمساكن الراقية من فوشان، الصين. مطابخ وخزائن وأبواب داخلية وألواح جدارية بلغة تصميم واحدة.",
      collectionsEyebrow: "لغة مادية واحدة تمتد عبر المكان",
      collectionsTitle: "حين تصبح العمارة أكثر شخصية",
      collectionsText: "نطوّر المطابخ والخزائن والأبواب والجدران كمساحة داخلية متصلة، لا كمجموعة من العناصر المنفصلة.",
      processEyebrow: "من الخط الأول إلى الغرفة الأخيرة",
      processTitle: "أعمال معقدة تُحل بدقة هادئة",
      processText: "تُنسق المخططات والعينات والمواصفات وفق نطاق المشروع المعتمد، وتُحدد متطلبات التسليم للتصنيع قبل بدء العمل.",
      directionEyebrow: "مسكن مكتمل · قوانغتشو",
      directionTitle: "مساحة واحدة، تُروى من خلال تفاصيلها.",
      directionText: "صور من مسكن مكتمل واحد في قوانغتشو. ينبغي تأكيد نطاق توريد المنتجات والتركيب لكل تفصيل منشور.",
      finalTitle: "دع المخططات تبدأ الحوار.",
      finalSubtext: "شارك ما لديك اليوم، نحن نتولى الباقي.",
    },
    pages: {
      collections: ["المنتجات", "أنظمة متكاملة للمنزل", "تُطوّر المطابخ والخزائن والأبواب الداخلية وألواح الجدران حول أبعاد المشروع ومواده وتفاصيله."],
      solutions: ["نطاق المشروع", "تفاصيل تعمل ككل واحد", "للفلل والمساكن الراقية، تتم مراجعة نطاق المنتجات والمواد وواجهات المشروع ومسؤوليات التركيب وتأكيدها لكل مشروع."],
      projects: ["المشاريع", "مسكن مكتمل واحد بسياقه الحقيقي.", "صور من مسكن مكتمل واحد في قوانغتشو. ينبغي تأكيد نطاق توريد المنتجات والتركيب لكل تفصيل منشور."],
      capabilities: ["القدرات", "التفاصيل هي نظام التسليم", "ينجح العمل المخصص عندما تتناغم معلومات التصميم والمواد والإنتاج والتركيب."],
      company: ["عن CIRMANO", "صُنع ككلّ واحد.", "CIRMANO علامة للتخصيص المتكامل للمنازل، مقرها فوشان في قوانغدونغ بالصين، وتركز على الفلل والمساكن الراقية."],
      resources: ["الموارد", "معلومات مفيدة قبل أول عرض سعر", "ستنشر الكتالوجات ومراجع التشطيب والإرشادات الفنية بعد التحقق منها."],
      privacy: ["الخصوصية", "كيفية التعامل مع بيانات الاستفسار", "إشعار موجز لبيانات المشاريع والمخططات المرفوعة."],
      terms: ["الشروط", "شروط الموقع والاستفسار", "الشروط الأساسية لاستخدام محتوى CIRMANO وطلب معلومات المشروع."],
    },
    capabilitySteps: [
      ["01", "المراجعة", "تُراجع المخططات المتاحة والموقع ونطاق المنتجات والجدول معاً."],
      ["02", "التطوير", "تُنسق الرسومات التنفيذية والواجهات عندما يشملها نطاق المشروع."],
      ["03", "العينة", "تُعتمد المواد والتشطيبات والتفاصيل المطلوبة قبل الإنتاج."],
      ["04", "التصنيع", "تعرض مواد العلامة معدات HOMAG. يُستخدم تلبيس الحواف بالليزر لمكونات متوافقة محددة؛ وتُفحص بعض الخزائن وتُجرّب قبل الشحن."],
      ["05", "التغليف", "تُحدد متطلبات التغليف والترقيم حسب الوجهة والمشروع."],
      ["06", "التنسيق", "تُعتمد مسؤوليات التركيب وأي تنسيق محلي كتابياً لكل مشروع."],
    ],
    quote: {
      eyebrow: "استفسار مشروع",
      title: "أرسل مخططاتك",
      intro: "شارك ما يتوفر لديك الآن. نقبل PDF وDWG وDXF وZIP وJPG وPNG، حتى خمسة ملفات وبإجمالي 100 ميغابايت.",
      fields: { name: "الاسم", company: "الشركة", email: "بريد العمل", whatsapp: "واتساب / هاتف", country: "الدولة", projectType: "نوع المشروع", location: "موقع المشروع", scope: "النطاق المطلوب", quantity: "الكمية التقديرية", budget: "نطاق الميزانية", delivery: "موعد التسليم", message: "ملاحظات المشروع", files: "المخططات والمراجع", consent: "أوافق على استخدام CIRMANO لهذه المعلومات للرد على استفساري.", submit: "إرسال المشروع", uploading: "جارٍ الإرسال…", success: "تم استلام مشروعك.", successText: "سيراجع الفريق النطاق ويتواصل عبر البيانات المقدمة.", error: "تعذر الإرسال. حاول مرة أخرى أو استخدم واتساب." },
    },
      legal: {
      privacy: ["نجمع بيانات الاتصال والمشروع التي ترسلها عبر نموذج الاستفسار.", "تستخدم الملفات المرفوعة فقط لمراجعة الطلب والرد عليه.", "لا نبيع بيانات الاستفسارات، وقد يعالجها مقدمو الاستضافة والتخزين والأمان والبريد لتشغيل الخدمة.", "يمكنك طلب الوصول أو التصحيح أو الحذف عبر kai@cirmano.com."],
      terms: ["الصور الموسومة كاتجاه تصميمي هي تصورات وليست أعمال عملاء منفذة.", "لا تُعتمد المواصفات والأسعار والجداول والتوفر إلا في عرض مشروع مكتوب.", "تظل حقوق المخططات والملفات لأصحابها وتراجع فقط للمشروع المطلوب.", "لا يجوز إعادة نشر اسم CIRMANO أو نصوصه أو وسائطه الأصلية دون إذن."],
    },
  },
  de: {
    nav: { collections: "Produkte", solutions: "Projektumfang", projects: "Projekte", capabilities: "Kompetenzen", company: "Unternehmen", quote: "Pläne senden" },
    common: { explore: "Entdecken", viewAll: "Alle ansehen", learnMore: "Mehr erfahren", concept: "Designrichtung", back: "Zurück", openMenu: "Menü öffnen", closeMenu: "Menü schließen", language: "Sprache" },
    home: {
      badge: "Integrierte Maßanfertigung für das ganze Zuhause",
      title: "Aus einem Guss",
      intro: "Integrierte Maßanfertigung für Villen und hochwertige Wohnhäuser aus Foshan, China. Küchen, Schränke, Innentüren und Wandpaneele in einer gemeinsamen Gestaltungssprache.",
      collectionsEyebrow: "Eine Materialsprache für den ganzen Raum",
      collectionsTitle: "Wo Architektur persönlich wird",
      collectionsText: "Küchen, Schränke, Türen und Paneelräume entstehen als durchgängiges Interieur statt als Sammlung einzelner Objekte.",
      processEyebrow: "Von der ersten Linie bis zum fertigen Raum",
      processTitle: "Komplexität, mit stiller Präzision gelöst",
      processText: "Pläne, Muster und Spezifikationen werden mit dem bestätigten Projektumfang abgestimmt. Die Fertigungsübergabe wird vor Arbeitsbeginn festgelegt.",
      directionEyebrow: "Fertiggestelltes Wohnhaus · Guangzhou",
      directionTitle: "Ein Zuhause, erzählt durch seine Details.",
      directionText: "Projektfotografien aus einem fertiggestellten Wohnhaus in Guangzhou. Liefer- und Montageumfang sind für jedes veröffentlichte Detail zu bestätigen.",
      finalTitle: "Lassen Sie die Pläne das Gespräch beginnen.",
      finalSubtext: "Teilen Sie den aktuellen Stand. Wir übernehmen das Weitere.",
    },
    pages: {
      collections: ["Produkte", "Integrierte Systeme für das ganze Zuhause", "Küchen, Schränke, Innentüren und Wandpaneele werden anhand der Projektmaße, Materialien und Details entwickelt."],
      solutions: ["Projektumfang", "Alles aufeinander abgestimmt", "Für Villen und hochwertige Wohnhäuser werden Produktscope, Materialien, Projektschnittstellen und Montageverantwortung einzeln geprüft und bestätigt."],
      projects: ["Projekte", "Ein fertiges Zuhause, im echten Kontext.", "Projektfotografien aus einem fertiggestellten Wohnhaus in Guangzhou. Liefer- und Montageumfang sind für jedes veröffentlichte Detail zu bestätigen."],
      capabilities: ["Kompetenzen", "Details bilden das Liefersystem", "Individueller Innenausbau gelingt, wenn Entwurf, Material, Fertigung und Montage koordiniert bleiben."],
      company: ["Über CIRMANO", "Aus einem Guss.", "CIRMANO ist eine Marke für integrierte Wohnraumgestaltung mit Sitz in Foshan, Guangdong, China, und Fokus auf Villen und hochwertige Wohnhäuser."],
      resources: ["Ressourcen", "Nützlich vor dem ersten Angebot", "Kataloge, Oberflächenreferenzen und technische Hinweise werden nach Prüfung veröffentlicht."],
      privacy: ["Datenschutz", "Umgang mit Anfrageinformationen", "Kurzer Datenschutzhinweis für Projektanfragen und hochgeladene Pläne."],
      terms: ["Bedingungen", "Website- und Anfragebedingungen", "Grundbedingungen für die Nutzung von CIRMANO-Inhalten und Projektanfragen."],
    },
    capabilitySteps: [
      ["01", "Prüfen", "Verfügbare Pläne, Standort, Produktumfang und Termin werden gemeinsam geprüft."],
      ["02", "Entwickeln", "Werkpläne und Schnittstellen werden abgestimmt, wenn sie zum Projektumfang gehören."],
      ["03", "Bemustern", "Materialien, Oberflächen und erforderliche Details werden vor der Fertigung bestätigt."],
      ["04", "Fertigen", "Die Markenunterlagen zeigen HOMAG-Anlagen. Laserbekantung wird für bestimmte kompatible Bauteile eingesetzt; ausgewählte Schränke werden vor dem Versand geprüft und probemontiert."],
      ["05", "Verpacken", "Verpackung und Kennzeichnung werden für Zielort und Projekt festgelegt."],
      ["06", "Abstimmen", "Montageverantwortung und lokale Koordination werden je Projekt schriftlich vereinbart."],
    ],
    quote: {
      eyebrow: "Projektanfrage",
      title: "Senden Sie Ihre Pläne",
      intro: "Teilen Sie den aktuellen Stand. PDF, DWG, DXF, ZIP, JPG und PNG, maximal fünf Dateien und 100 MB gesamt.",
      fields: { name: "Name", company: "Unternehmen", email: "Geschäftliche E-Mail", whatsapp: "WhatsApp / Telefon", country: "Land", projectType: "Projekttyp", location: "Projektort", scope: "Leistungsumfang", quantity: "Geschätzte Menge", budget: "Budgetrahmen", delivery: "Zieltermin", message: "Projekthinweise", files: "Pläne und Referenzen", consent: "Ich stimme zu, dass CIRMANO diese Angaben zur Bearbeitung der Anfrage verwendet.", submit: "Projekt senden", uploading: "Projekt wird gesendet…", success: "Ihr Projekt wurde empfangen.", successText: "Unser Team prüft den Umfang und antwortet über die angegebenen Kontaktdaten.", error: "Die Anfrage konnte nicht gesendet werden. Bitte erneut versuchen oder WhatsApp nutzen." },
    },
    legal: {
      privacy: ["Wir erfassen die Kontakt- und Projektangaben, die Sie über das Anfrageformular senden.", "Hochgeladene Dateien werden nur zur Prüfung und Beantwortung der jeweiligen Anfrage verwendet.", "Wir verkaufen keine Anfragedaten. Dienstleister verarbeiten Daten nur für Hosting, Speicher, Sicherheit und E-Mail.", "Zugriff, Berichtigung oder Löschung können Sie unter kai@cirmano.com anfragen."],
      terms: ["Als Designrichtung gekennzeichnete Bilder sind konzeptionell und keine realisierten Kundenprojekte.", "Spezifikationen, Angebote, Termine und Verfügbarkeit gelten erst mit einem schriftlichen Projektangebot.", "Zeichnungen und Dateien bleiben Eigentum der jeweiligen Rechteinhaber.", "CIRMANO-Namen, Texte und Originalmedien dürfen nicht ohne Erlaubnis veröffentlicht werden."],
    },
  },
  fr: {
    nav: { collections: "Produits", solutions: "Périmètre du projet", projects: "Projets", capabilities: "Savoir-faire", company: "Entreprise", quote: "Envoyer vos plans" },
    common: { explore: "Explorer", viewAll: "Tout voir", learnMore: "En savoir plus", concept: "Direction créative", back: "Retour", openMenu: "Ouvrir le menu", closeMenu: "Fermer le menu", language: "Langue" },
    home: {
      badge: "Aménagement intégré de toute la maison",
      title: "Pensé comme un tout",
      intro: "Aménagement intégré pour villas et résidences haut de gamme, depuis Foshan en Chine. Cuisines, dressings, portes intérieures et panneaux muraux dans un même langage de conception.",
      collectionsEyebrow: "Un même langage de matière dans toute la pièce",
      collectionsTitle: "Quand l'architecture devient personnelle",
      collectionsText: "Cuisines, dressings, portes et panneaux sont développés comme un intérieur continu, et non comme une série d'objets séparés.",
      processEyebrow: "Du premier trait à la pièce achevée",
      processTitle: "La complexité résolue avec une précision discrète",
      processText: "Plans, échantillons et spécifications sont coordonnés selon le périmètre confirmé. Le transfert à la fabrication est défini avant le début des travaux.",
      directionEyebrow: "Résidence achevée · Guangzhou",
      directionTitle: "Un lieu, raconté par ses détails.",
      directionText: "Photographies d'une résidence achevée à Guangzhou. Le périmètre de fourniture et de pose est à confirmer pour chaque détail publié.",
      finalTitle: "Que les plans ouvrent la conversation.",
      finalSubtext: "Partagez ce que vous avez aujourd'hui. Nous prenons le relais.",
    },
    pages: {
      collections: ["Produits", "Des systèmes intégrés pour toute la maison", "Cuisines, dressings, portes intérieures et panneaux muraux sont développés selon les dimensions, matériaux et détails du projet."],
      solutions: ["Périmètre du projet", "Un ensemble cohérent", "Pour les villas et résidences haut de gamme, le périmètre produit, les matériaux, les interfaces et les responsabilités de pose sont confirmés au cas par cas."],
      projects: ["Projets", "Une résidence achevée, avec son contexte.", "Photographies d'une résidence achevée à Guangzhou. Le périmètre de fourniture et de pose est à confirmer pour chaque détail publié."],
      capabilities: ["Savoir-faire", "Le détail est un système de livraison", "Le sur-mesure réussit lorsque design, matériaux, fabrication et pose restent coordonnés."],
      company: ["À propos de CIRMANO", "Pensé comme un tout.", "CIRMANO est une marque d'aménagement intégré basée à Foshan, Guangdong, en Chine, spécialisée dans les villas et résidences haut de gamme."],
      resources: ["Ressources", "Utile avant le premier devis", "Catalogues, références de finitions et guides techniques seront publiés après vérification."],
      privacy: ["Confidentialité", "Traitement des informations de demande", "Une notice concise pour les demandes de projet et les plans téléchargés."],
      terms: ["Conditions", "Conditions du site et des demandes", "Conditions de base pour utiliser le contenu CIRMANO et demander des informations."],
    },
    capabilitySteps: [
      ["01", "Analyser", "Les plans disponibles, le lieu, le périmètre produit et le calendrier sont examinés ensemble."],
      ["02", "Développer", "Plans d'atelier et interfaces sont coordonnés lorsqu'ils entrent dans le périmètre."],
      ["03", "Échantillonner", "Matériaux, finitions et détails requis sont confirmés avant fabrication."],
      ["04", "Fabriquer", "Les documents de marque montrent des équipements HOMAG. Le placage laser est utilisé pour certains composants compatibles ; certains meubles sont contrôlés et montés à blanc avant expédition."],
      ["05", "Emballer", "Emballage et repérage sont définis selon la destination et le projet."],
      ["06", "Coordonner", "Responsabilités de pose et coordination locale sont convenues par écrit pour chaque projet."],
    ],
    quote: {
      eyebrow: "Demande de projet",
      title: "Envoyez vos plans",
      intro: "Partagez les éléments disponibles. PDF, DWG, DXF, ZIP, JPG et PNG, cinq fichiers maximum et 100 Mo au total.",
      fields: { name: "Nom", company: "Entreprise", email: "E-mail professionnel", whatsapp: "WhatsApp / téléphone", country: "Pays", projectType: "Type de projet", location: "Lieu du projet", scope: "Périmètre demandé", quantity: "Quantité estimée", budget: "Fourchette budgétaire", delivery: "Livraison souhaitée", message: "Notes du projet", files: "Plans et références", consent: "J'accepte que CIRMANO utilise ces informations pour répondre à ma demande.", submit: "Envoyer le projet", uploading: "Envoi en cours…", success: "Votre projet a bien été reçu.", successText: "Notre équipe examinera le périmètre et répondra avec les coordonnées fournies.", error: "La demande n'a pas pu être envoyée. Réessayez ou utilisez WhatsApp." },
    },
    legal: {
      privacy: ["Nous collectons les coordonnées et informations de projet envoyées via le formulaire.", "Les fichiers servent uniquement à examiner et répondre à la demande concernée.", "Nous ne vendons pas les données. Des prestataires peuvent les traiter pour l'hébergement, le stockage, la sécurité et l'e-mail.", "Vous pouvez demander accès, correction ou suppression à kai@cirmano.com."],
      terms: ["Les images signalées comme direction créative sont conceptuelles et ne représentent pas un projet client réalisé.", "Spécifications, devis, délais et disponibilités ne sont confirmés que par une proposition écrite.", "Les plans et fichiers restent la propriété de leurs détenteurs respectifs.", "Les noms, textes et médias originaux CIRMANO ne peuvent être republiés sans autorisation."],
    },
  },
} as const;

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export function getCopy(locale: Locale) {
  return copy[locale];
}
