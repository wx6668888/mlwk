import type { Locale } from "../content";

// Home page copy. Sources in the brand pack:
//   01_官网基础文案_中英.txt (hero, about, products, manufacturing, project, contact)
//   02_英文长文案 p.16 CAMPAIGNS / CAPTIONS (detail lines)
//   CIRMANO-brand-overview v3 slide 3 (four principles)
// en + zh follow those files; ar / de / fr are drafts pending CIRMANO review.
// Never add figures, certifications or claims that are not in 02_品牌事实与素材说明.txt.

export type HomeCopy = {
  aiNote: string;
  pause: string;
  play: string;
  unmute: string;
  mute: string;
  hero: { eyebrow: string; descriptor: string; lead: string; ctaProducts: string; ctaProject: string; tag: string; videoLabel: string };
  stage: { kicker: string; hint: string; steps: [string, string, string]; drawingTag: string; block: [string, string][]; canvasLabel: string };
  statement: { label: string; text: string };
  products: { label: string; title: string; lead: string; learn: string; prev: string; next: string };
  language: { label: string; title: string; lead: string; steps: { name: string; text: string }[]; imageAlt: string; tag: string };
  detail: { label: string; title: string; items: { no: string; title: string; text: string }[] };
  manufacturing: { label: string; title: string; lead: string; facts: { title: string; text: string }[]; cta: string; filmLabel: string };
  project: { label: string; title: string; lead: string; tag: string; cta: string };
  principles: { label: string; title: string; items: { kicker: string; name: string; text: string }[] };
  follow: { label: string; title: string; lead: string; credit: string; reels: string[] };
  contact: { label: string; title: string; lead: string; enquiry: string; whatsapp: string };
};

const en: HomeCopy = {
  aiNote: "Includes AI-assisted motion from real project photography",
  pause: "Pause video",
  play: "Play video",
  unmute: "Turn sound on",
  mute: "Turn sound off",
  hero: {
    eyebrow: "CIRMANO",
    descriptor: "Integrated Whole-Home Customization",
    lead: "Kitchens, wardrobes, interior doors and wall panels, brought together through a shared design language.",
    ctaProducts: "Explore Our Products",
    ctaProject: "Discuss Your Project",
    tag: "Completed project · Guangzhou",
    videoLabel: "Slow camera move through the living room of the Guangzhou Residence",
  },
  stage: {
    kicker: "Developed elevations · Living room",
    hint: "Scroll to fold the drawing into a room",
    steps: ["Drawing", "Model", "Made"],
    drawingTag: "Design drawing",
    block: [["Project", "Guangzhou Residence"], ["Drawing", "Developed elevations"], ["Scale", "1 : 50"], ["Sheet", "L-01"]],
    canvasLabel: "A design drawing of the living room folds into a three-dimensional room, then hands over to film of the finished space.",
  },
  statement: {
    label: "Made As One",
    text: "We bring materials, proportions and details together to create a consistent design language throughout the home. From design development to manufacturing, each element is made to work as part of the whole.",
  },
  products: {
    label: "Products",
    title: "One language. Every room.",
    lead: "Five product families, planned together for villas and premium homes.",
    learn: "Learn more",
    prev: "Previous",
    next: "Next",
  },
  language: {
    label: "One language",
    title: "Surfaces that speak to each other.",
    lead: "In the Guangzhou Residence, panels, display cabinetry and glass share one palette of wood, bronze and light.",
    steps: [
      { name: "Wall panels", text: "Dark wood panels set the rhythm of the room and frame what sits in front of them." },
      { name: "Display cabinetry", text: "Glass-fronted cabinets continue the same lines, with light built into the shelves." },
      { name: "Aluminium & glass", text: "Bronze-framed glass carries the palette up to the ceiling." },
    ],
    imageAlt: "Living room of the Guangzhou Residence with dark wood wall panels and glass display cabinetry",
    tag: "Living room · Guangzhou Residence",
  },
  detail: {
    label: "The detail",
    title: "Made to be looked at closely.",
    items: [
      { no: "01 / The line", title: "Every line has a process behind it.", text: "A balanced proportion begins with the drawing and continues through panel processing, assembly and finishing." },
      { no: "02 / The material", title: "Material, already considered.", text: "Selected prefinished surfaces, brought into a coordinated palette for the home." },
      { no: "03 / The hardware", title: "Quiet, until you reach for it.", text: "Hardware and trims chosen to sit within the same material language." },
      { no: "04 / The glass", title: "Light, texture, reflection.", text: "Glass and cabinetry details, considered together." },
    ],
  },
  manufacturing: {
    label: "Manufacturing",
    title: "The detail behind the finished space.",
    lead: "Our manufacturing process in Foshan brings together panel processing, careful edge finishing, inspection and trial assembly.",
    facts: [
      { title: "German HOMAG equipment", text: "HOMAG equipment supports the work behind our cabinetry systems." },
      { title: "Laser edgebanding", text: "Used on specified compatible components." },
      { title: "Inspection & trial assembly", text: "Selected cabinetry is inspected and trial-assembled before dispatch." },
    ],
    cta: "Inside our manufacturing",
    filmLabel: "Panel processing and edge finishing in the Foshan workshop",
  },
  project: {
    label: "Project",
    title: "Guangzhou Residence",
    lead: "Cabinetry, glass details and wall panels brought together within a finished home.",
    tag: "Completed project · Guangzhou",
    cta: "View the residence",
  },
  principles: {
    label: "Principles",
    title: "Four principles for a complete home.",
    items: [
      { kicker: "Details", name: "Craftsmanship", text: "Selected materials and precise finishing that hold up over time." },
      { kicker: "Integration", name: "System", text: "Cabinetry, doors, wall panels and woodwork planned as one system." },
      { kicker: "Design", name: "Aesthetics", text: "International design, shaped by Eastern living proportions." },
      { kicker: "Adaptation", name: "Global", text: "Shared standards, adapted to the needs of each local market." },
    ],
  },
  follow: {
    label: "Follow",
    title: "Closer, on Instagram.",
    lead: "Short films from finished spaces: storage, glass, light and wall panels.",
    credit: "Music: “Sleep” by Scott Buckley, CC BY 4.0",
    reels: ["Thoughtful storage", "Glass details", "Light and view", "Wall panel detail"],
  },
  contact: {
    label: "Contact",
    title: "Let’s discuss your project.",
    lead: "Share your floor plan, product requirements and material direction to start the conversation.",
    enquiry: "Send a Project Enquiry",
    whatsapp: "Contact Us on WhatsApp",
  },
};

const zh: HomeCopy = {
  aiNote: "含基于真实项目照片的 AI 辅助运镜",
  pause: "暂停视频",
  play: "播放视频",
  unmute: "打开声音",
  mute: "关闭声音",
  hero: {
    eyebrow: "CIRMANO 西尔曼",
    descriptor: "一体化全屋定制",
    lead: "以统一的设计语言，连接橱柜、衣柜、室内门与护墙板。",
    ctaProducts: "了解产品",
    ctaProject: "沟通项目",
    tag: "完工项目 · 广州",
    videoLabel: "广州住宅客厅的缓慢推镜",
  },
  stage: {
    kicker: "立面展开图 · 客厅",
    hint: "向下滚动，图纸折叠成空间",
    steps: ["图纸", "模型", "成品"],
    drawingTag: "设计图纸",
    block: [["项目", "广州住宅"], ["图纸", "立面展开图"], ["比例", "1 : 50"], ["图号", "L-01"]],
    canvasLabel: "客厅的设计图纸折叠成三维空间，随后切换为完工空间的影像。",
  },
  statement: {
    label: "Made As One",
    text: "我们连接橱柜、衣柜、室内门和墙板，通过材质、比例与细节的协调，让每一部分成为完整居所的一部分。",
  },
  products: { label: "产品", title: "一种语言，贯穿每个房间。", lead: "五类产品，为别墅与高端住宅协同规划。", learn: "了解更多", prev: "上一个", next: "下一个" },
  language: {
    label: "统一语言",
    title: "彼此呼应的每一个表面。",
    lead: "在广州住宅中，墙板、展示柜与玻璃共享同一套木色、古铜与光线。",
    steps: [
      { name: "墙板", text: "深色木饰面墙板确立空间节奏，也为前方的一切留出框景。" },
      { name: "展示柜", text: "玻璃门展示柜延续同样的线条，灯光内嵌于层板之中。" },
      { name: "铝与玻璃", text: "古铜框玻璃将这套色调一直延伸到顶。" },
    ],
    imageAlt: "广州住宅客厅：深色木饰面墙板与玻璃展示柜",
    tag: "客厅 · 广州住宅",
  },
  detail: {
    label: "细节",
    title: "经得起近看。",
    items: [
      { no: "01 / 线条", title: "每一条线，背后都有工序。", text: "恰当的比例从图纸开始，延续到板件加工、组装与收口。" },
      { no: "02 / 材质", title: "材质，早已斟酌。", text: "精选预饰面材料，组成协调统一的居所色板。" },
      { no: "03 / 五金", title: "安静，直到你伸手。", text: "五金与收口，同样置于一套材质语言之中。" },
      { no: "04 / 玻璃", title: "光、质感与反射。", text: "玻璃与柜体的细节，一并考虑。" },
    ],
  },
  manufacturing: {
    label: "制造",
    title: "完工空间背后的细节。",
    lead: "在佛山，我们通过板件加工、封边处理、检查与试装，将设计细节带入制造。",
    facts: [
      { title: "德国 HOMAG 设备", text: "支持柜体系统的加工。" },
      { title: "激光封边", text: "用于指定兼容部件。" },
      { title: "检查与试装", text: "选定柜体在出厂前进行检查与试装。" },
    ],
    cta: "走进制造",
    filmLabel: "佛山工厂的板件加工与封边",
  },
  project: { label: "项目", title: "广州住宅", lead: "柜体、玻璃细节与墙板，在完工居所中融为一体。", tag: "完工项目 · 广州", cta: "查看完整项目" },
  principles: {
    label: "原则",
    title: "以四个原则，回应一处完整居所。",
    items: [
      { kicker: "Craft", name: "精工", text: "严选材质、精细收口，让细节经得起时间。" },
      { kicker: "System", name: "系统", text: "整合柜、门、墙与木作，统一风格、功能与交付。" },
      { kicker: "Aesthetics", name: "美学", text: "国际设计语言与东方尺度，在克制中呈现品位。" },
      { kicker: "Global", name: "全球", text: "建立国际标准，适配不同居住需求。" },
    ],
  },
  follow: {
    label: "关注",
    title: "在 Instagram 上看得更近。",
    lead: "来自完工空间的短片：收纳、玻璃、光线与墙板。",
    credit: "音乐：Scott Buckley《Sleep》，CC BY 4.0",
    reels: ["从容收纳", "玻璃细节", "光与景", "墙板细节"],
  },
  contact: { label: "联系", title: "让我们沟通你的项目。", lead: "发送户型图、需要的产品和材质方向，开启进一步讨论。", enquiry: "发送项目咨询", whatsapp: "WhatsApp 联系我们" },
};

// Drafts below: structure mirrors en; wording to be reviewed by CIRMANO before launch.
const de: HomeCopy = {
  ...en,
  aiNote: "Enthält KI-gestützte Kamerabewegung auf Basis realer Projektfotos",
  pause: "Video pausieren",
  play: "Video abspielen",
  unmute: "Ton an",
  mute: "Ton aus",
  hero: { ...en.hero, descriptor: "Ganzheitliche Raumkonzepte nach Maß", lead: "Küchen, Schränke, Innentüren und Wandpaneele, verbunden durch eine gemeinsame Designsprache.", ctaProducts: "Produkte entdecken", ctaProject: "Projekt besprechen", tag: "Fertiggestelltes Projekt · Guangzhou", videoLabel: "Langsame Kamerafahrt durch das Wohnzimmer der Residenz Guangzhou" },
  stage: { kicker: "Abgewickelte Ansichten · Wohnzimmer", hint: "Scrollen, um die Zeichnung zum Raum zu falten", steps: ["Zeichnung", "Modell", "Gefertigt"], drawingTag: "Entwurfszeichnung", block: [["Projekt", "Residenz Guangzhou"], ["Zeichnung", "Abwicklung"], ["Maßstab", "1 : 50"], ["Blatt", "L-01"]], canvasLabel: "Eine Entwurfszeichnung des Wohnzimmers faltet sich zum Raum und geht in Filmaufnahmen des fertigen Raums über." },
  statement: { label: "Made As One", text: "Wir bringen Materialien, Proportionen und Details zusammen und schaffen eine durchgängige Designsprache für das ganze Zuhause. Von der Planung bis zur Fertigung ist jedes Element Teil des Ganzen." },
  products: { label: "Produkte", title: "Eine Sprache. Jeder Raum.", lead: "Fünf Produktfamilien, gemeinsam geplant für Villen und hochwertige Wohnungen.", learn: "Mehr erfahren", prev: "Zurück", next: "Weiter" },
  language: { ...en.language, label: "Eine Sprache", title: "Flächen, die miteinander sprechen.", lead: "In der Residenz Guangzhou teilen Paneele, Vitrinen und Glas eine Palette aus Holz, Bronze und Licht.", steps: [{ name: "Wandpaneele", text: "Dunkle Holzpaneele geben dem Raum seinen Rhythmus." }, { name: "Vitrinen", text: "Glasvitrinen führen dieselben Linien fort, mit integriertem Licht." }, { name: "Aluminium & Glas", text: "Bronzegerahmtes Glas trägt die Palette bis zur Decke." }], imageAlt: "Wohnzimmer der Residenz Guangzhou mit dunklen Holzpaneelen und Glasvitrinen", tag: "Wohnzimmer · Residenz Guangzhou" },
  detail: { label: "Das Detail", title: "Gemacht, um genau hinzusehen.", items: [{ no: "01 / Die Linie", title: "Hinter jeder Linie steht ein Prozess.", text: "Ausgewogene Proportionen beginnen in der Zeichnung und setzen sich in Bearbeitung, Montage und Oberfläche fort." }, { no: "02 / Das Material", title: "Material, bereits durchdacht.", text: "Ausgewählte vorbeschichtete Oberflächen in einer abgestimmten Palette." }, { no: "03 / Die Beschläge", title: "Still, bis man danach greift.", text: "Beschläge und Profile in derselben Materialsprache." }, { no: "04 / Das Glas", title: "Licht, Textur, Spiegelung.", text: "Glas- und Schrankdetails, gemeinsam gedacht." }] },
  manufacturing: { ...en.manufacturing, label: "Fertigung", title: "Das Detail hinter dem fertigen Raum.", lead: "Unsere Fertigung in Foshan verbindet Plattenbearbeitung, sorgfältige Kantenbearbeitung, Prüfung und Probemontage.", facts: [{ title: "HOMAG-Maschinen aus Deutschland", text: "HOMAG-Technik unterstützt die Fertigung unserer Schranksysteme." }, { title: "Laserkante", text: "Bei dafür vorgesehenen, kompatiblen Bauteilen." }, { title: "Prüfung & Probemontage", text: "Ausgewählte Schränke werden vor dem Versand geprüft und probemontiert." }], cta: "Einblick in die Fertigung", filmLabel: "Plattenbearbeitung und Kantenbearbeitung in Foshan" },
  project: { label: "Projekt", title: "Residenz Guangzhou", lead: "Schränke, Glasdetails und Wandpaneele, vereint in einem fertigen Zuhause.", tag: "Fertiggestelltes Projekt · Guangzhou", cta: "Residenz ansehen" },
  principles: { label: "Prinzipien", title: "Vier Prinzipien für ein vollständiges Zuhause.", items: [{ kicker: "Details", name: "Handwerk", text: "Ausgewählte Materialien und präzise Oberflächen, die Bestand haben." }, { kicker: "Integration", name: "System", text: "Schränke, Türen, Paneele und Holzarbeiten als ein System geplant." }, { kicker: "Design", name: "Ästhetik", text: "Internationales Design, geprägt von östlichen Wohnproportionen." }, { kicker: "Anpassung", name: "Global", text: "Gemeinsame Standards, angepasst an jeden lokalen Markt." }] },
  follow: { label: "Folgen", title: "Näher dran, auf Instagram.", lead: "Kurzfilme aus fertigen Räumen: Stauraum, Glas, Licht und Wandpaneele.", credit: "Musik: „Sleep“ von Scott Buckley, CC BY 4.0", reels: ["Durchdachter Stauraum", "Glasdetails", "Licht und Ausblick", "Wandpaneel im Detail"] },
  contact: { label: "Kontakt", title: "Lassen Sie uns über Ihr Projekt sprechen.", lead: "Senden Sie Grundriss, Produktwünsche und Materialrichtung, um das Gespräch zu beginnen.", enquiry: "Projektanfrage senden", whatsapp: "Per WhatsApp kontaktieren" },
};

const fr: HomeCopy = {
  ...en,
  aiNote: "Comprend des mouvements de caméra assistés par IA à partir de photos réelles",
  pause: "Mettre la vidéo en pause",
  play: "Lire la vidéo",
  unmute: "Activer le son",
  mute: "Couper le son",
  hero: { ...en.hero, descriptor: "Aménagement intégré sur mesure", lead: "Cuisines, dressings, portes intérieures et panneaux muraux, réunis par un même langage de design.", ctaProducts: "Découvrir nos produits", ctaProject: "Parler de votre projet", tag: "Projet réalisé · Guangzhou", videoLabel: "Lent travelling dans le salon de la Résidence Guangzhou" },
  stage: { kicker: "Élévations développées · Salon", hint: "Faites défiler pour plier le dessin en pièce", steps: ["Dessin", "Maquette", "Réalisé"], drawingTag: "Dessin de conception", block: [["Projet", "Résidence Guangzhou"], ["Dessin", "Élévations développées"], ["Échelle", "1 : 50"], ["Planche", "L-01"]], canvasLabel: "Un dessin du salon se plie en une pièce en trois dimensions, puis laisse place au film de l’espace réalisé." },
  statement: { label: "Made As One", text: "Nous accordons matières, proportions et détails pour créer un langage cohérent dans toute la maison. De la conception à la fabrication, chaque élément fait partie de l’ensemble." },
  products: { label: "Produits", title: "Un langage. Chaque pièce.", lead: "Cinq familles de produits, pensées ensemble pour villas et résidences haut de gamme.", learn: "En savoir plus", prev: "Précédent", next: "Suivant" },
  language: { ...en.language, label: "Un langage", title: "Des surfaces qui se répondent.", lead: "Dans la Résidence Guangzhou, panneaux, vitrines et verre partagent une même palette de bois, de bronze et de lumière.", steps: [{ name: "Panneaux muraux", text: "Des panneaux de bois sombre donnent son rythme à la pièce." }, { name: "Vitrines", text: "Les vitrines prolongent les mêmes lignes, avec un éclairage intégré." }, { name: "Aluminium & verre", text: "Le verre cerclé de bronze porte la palette jusqu’au plafond." }], imageAlt: "Salon de la Résidence Guangzhou avec panneaux de bois sombre et vitrines", tag: "Salon · Résidence Guangzhou" },
  detail: { label: "Le détail", title: "Fait pour être regardé de près.", items: [{ no: "01 / La ligne", title: "Chaque ligne a un processus derrière elle.", text: "Une proportion juste commence au dessin et se poursuit à l’usinage, au montage et à la finition." }, { no: "02 / La matière", title: "La matière, déjà pensée.", text: "Des surfaces préfinies sélectionnées, réunies en une palette cohérente." }, { no: "03 / La quincaillerie", title: "Discrète, jusqu’au geste.", text: "Quincaillerie et profils dans le même langage de matières." }, { no: "04 / Le verre", title: "Lumière, texture, reflet.", text: "Verre et mobilier, pensés ensemble." }] },
  manufacturing: { ...en.manufacturing, label: "Fabrication", title: "Le détail derrière l’espace fini.", lead: "À Foshan, notre fabrication réunit usinage des panneaux, finition soignée des chants, contrôle et montage à blanc.", facts: [{ title: "Équipement HOMAG allemand", text: "Les machines HOMAG accompagnent la fabrication de nos systèmes de mobilier." }, { title: "Placage laser des chants", text: "Sur les composants compatibles spécifiés." }, { title: "Contrôle & montage à blanc", text: "Certains meubles sont contrôlés et montés à blanc avant expédition." }], cta: "Découvrir la fabrication", filmLabel: "Usinage et finition des chants à l’atelier de Foshan" },
  project: { label: "Projet", title: "Résidence Guangzhou", lead: "Mobilier, détails de verre et panneaux muraux réunis dans une maison achevée.", tag: "Projet réalisé · Guangzhou", cta: "Voir la résidence" },
  principles: { label: "Principes", title: "Quatre principes pour une maison complète.", items: [{ kicker: "Détails", name: "Savoir-faire", text: "Des matières choisies et des finitions précises, faites pour durer." }, { kicker: "Intégration", name: "Système", text: "Mobilier, portes, panneaux et menuiserie pensés comme un seul système." }, { kicker: "Design", name: "Esthétique", text: "Un design international, aux proportions de l’habitat oriental." }, { kicker: "Adaptation", name: "Global", text: "Des standards communs, adaptés à chaque marché local." }] },
  follow: { label: "Suivre", title: "De plus près, sur Instagram.", lead: "Courts films d’espaces réalisés : rangements, verre, lumière et panneaux.", credit: "Musique : « Sleep » de Scott Buckley, CC BY 4.0", reels: ["Rangements pensés", "Détails de verre", "Lumière et vue", "Détail de panneau"] },
  contact: { label: "Contact", title: "Parlons de votre projet.", lead: "Partagez votre plan, vos besoins en produits et votre direction de matières pour commencer.", enquiry: "Envoyer une demande", whatsapp: "Nous écrire sur WhatsApp" },
};

const ar: HomeCopy = {
  ...en,
  aiNote: "يتضمن حركة كاميرا بمساعدة الذكاء الاصطناعي من صور مشاريع حقيقية",
  pause: "إيقاف الفيديو مؤقتاً",
  play: "تشغيل الفيديو",
  unmute: "تشغيل الصوت",
  mute: "كتم الصوت",
  hero: { ...en.hero, descriptor: "تخصيص متكامل للمنزل", lead: "المطابخ وخزائن الملابس والأبواب الداخلية وألواح الجدران، تجمعها لغة تصميم واحدة.", ctaProducts: "استكشف منتجاتنا", ctaProject: "ناقش مشروعك", tag: "مشروع مكتمل · قوانغتشو", videoLabel: "حركة كاميرا بطيئة في غرفة معيشة مسكن قوانغتشو" },
  stage: { kicker: "واجهات مفرودة · غرفة المعيشة", hint: "مرّر لطيّ الرسم إلى غرفة", steps: ["الرسم", "النموذج", "المُنجز"], drawingTag: "رسم تصميمي", block: [["المشروع", "مسكن قوانغتشو"], ["الرسم", "واجهات مفرودة"], ["المقياس", "1 : 50"], ["اللوحة", "L-01"]], canvasLabel: "رسم تصميمي لغرفة المعيشة ينطوي ليصبح غرفة ثلاثية الأبعاد، ثم ينتقل إلى تصوير المساحة المكتملة." },
  statement: { label: "Made As One", text: "نجمع المواد والنِّسب والتفاصيل لنخلق لغة تصميم متسقة في أرجاء المنزل. من تطوير التصميم إلى التصنيع، يُصنع كل عنصر ليكون جزءاً من الكل." },
  products: { label: "المنتجات", title: "لغة واحدة. كل غرفة.", lead: "خمس عائلات من المنتجات، مخططة معاً للفلل والمنازل الراقية.", learn: "اعرف المزيد", prev: "السابق", next: "التالي" },
  language: { ...en.language, label: "لغة واحدة", title: "أسطح تتحاور فيما بينها.", lead: "في مسكن قوانغتشو، تتشارك الألواح وخزائن العرض والزجاج لوحة واحدة من الخشب والبرونز والضوء.", steps: [{ name: "ألواح الجدران", text: "ألواح خشبية داكنة تمنح الغرفة إيقاعها." }, { name: "خزائن العرض", text: "خزائن بواجهات زجاجية تكمل الخطوط نفسها مع إضاءة مدمجة." }, { name: "الألمنيوم والزجاج", text: "زجاج بإطار برونزي يحمل اللوحة حتى السقف." }], imageAlt: "غرفة معيشة مسكن قوانغتشو بألواح خشبية داكنة وخزائن عرض زجاجية", tag: "غرفة المعيشة · مسكن قوانغتشو" },
  detail: { label: "التفاصيل", title: "صُنع ليُرى عن قرب.", items: [{ no: "01 / الخط", title: "وراء كل خط عملية.", text: "تبدأ النسبة المتوازنة من الرسم وتستمر في معالجة الألواح والتجميع والتشطيب." }, { no: "02 / المادة", title: "مادة مدروسة مسبقاً.", text: "أسطح مختارة جاهزة التشطيب ضمن لوحة متناسقة للمنزل." }, { no: "03 / الإكسسوارات", title: "هادئة حتى تمتد إليها يدك.", text: "إكسسوارات وحواف ضمن لغة المواد نفسها." }, { no: "04 / الزجاج", title: "ضوء وملمس وانعكاس.", text: "تفاصيل الزجاج والخزائن مدروسة معاً." }] },
  manufacturing: { ...en.manufacturing, label: "التصنيع", title: "التفاصيل وراء المساحة المكتملة.", lead: "يجمع التصنيع في فوشان بين معالجة الألواح وتشطيب الحواف بعناية والفحص والتجميع التجريبي.", facts: [{ title: "معدات HOMAG الألمانية", text: "تدعم معدات HOMAG العمل وراء أنظمة الخزائن لدينا." }, { title: "تشطيب الحواف بالليزر", text: "يُستخدم على المكونات المتوافقة المحددة." }, { title: "الفحص والتجميع التجريبي", text: "تُفحص خزائن مختارة وتُجمّع تجريبياً قبل الشحن." }], cta: "داخل التصنيع", filmLabel: "معالجة الألواح وتشطيب الحواف في ورشة فوشان" },
  project: { label: "المشروع", title: "مسكن قوانغتشو", lead: "خزائن وتفاصيل زجاجية وألواح جدران تجتمع في منزل مكتمل.", tag: "مشروع مكتمل · قوانغتشو", cta: "شاهد المسكن" },
  principles: { label: "المبادئ", title: "أربعة مبادئ لمنزل متكامل.", items: [{ kicker: "التفاصيل", name: "الحِرفية", text: "مواد مختارة وتشطيب دقيق يدوم مع الزمن." }, { kicker: "التكامل", name: "النظام", text: "خزائن وأبواب وألواح وأعمال خشبية مخططة كنظام واحد." }, { kicker: "التصميم", name: "الجمال", text: "تصميم عالمي بنِسب السكن الشرقي." }, { kicker: "التكيّف", name: "عالمي", text: "معايير مشتركة تتكيف مع احتياجات كل سوق." }] },
  follow: { label: "تابعنا", title: "عن قرب، على إنستغرام.", lead: "أفلام قصيرة من مساحات مكتملة: التخزين والزجاج والضوء والألواح.", credit: "الموسيقى: «Sleep» لسكوت باكلي، CC BY 4.0", reels: ["تخزين مدروس", "تفاصيل الزجاج", "الضوء والإطلالة", "تفاصيل الألواح"] },
  contact: { label: "تواصل", title: "لنتحدث عن مشروعك.", lead: "شارك مخطط المنزل والمنتجات المطلوبة واتجاه المواد لنبدأ الحديث.", enquiry: "أرسل استفسار مشروع", whatsapp: "تواصل عبر واتساب" },
};

export const homeCopy: Record<Locale, HomeCopy> = { en, zh, de, fr, ar };
