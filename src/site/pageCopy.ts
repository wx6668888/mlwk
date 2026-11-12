import type { Locale } from "../content";

// Inner-page copy. Sources: brand pack 03_网站文案与产品 (basic copy + long English copy, historical reference),
// brand overview deck (systems, principles, positioning), 02_品牌事实与素材说明 (what may and may not be said).
// en and zh are written; de / fr / ar fall back to en until translated and reviewed by CIRMANO.
// Rules: inspection = "selected cabinetry"; laser edgebanding = "specified compatible components";
// no figures, lead times, certifications, installation or warranty promises.

type Feature = { title: string; text: string };
export type ProductPage = {
  slug: string;
  name: string;
  headline: string;
  lead: string;
  description: string;
  features: Feature[];
  galleryTitle: string;
  film?: { src: string; poster: string; label: string; credit?: boolean };
  cta: string;
  note?: string;
};

type PageCopy = {
  common: { discuss: string; explore: string; learn: string; gallery: string; overview: string; details: string; related: string; film: string; aiNote: string; musicCredit: string; completed: string; concept: string; draftNote: string };
  products: {
    eyebrow: string; title: string; lead: string; heroAlt: string; heroCaption: string;
    systemsLabel: string; systemsTitle: string; systemsLead: string; systems: { kicker: string; title: string; list: string[] }[];
    collectionsLabel: string; collectionsTitle: string;
    materialsLabel: string; materialsTitle: string; materialsLead: string;
    edgeLabel: string; edgeTitle: string; edgeLead: string; edgeBenefits: string[];
    ctaTitle: string; ctaLead: string;
    pages: ProductPage[];
  };
  manufacturing: {
    eyebrow: string; title: string; lead: string; heroAlt: string;
    introLabel: string; introTitle: string; introLead: string;
    stepsLabel: string; stepsTitle: string; stepsNote: string; steps: { no: string; title: string; text: string; photo: string }[];
    collabLabel: string; collabTitle: string; collabLead: string; collab: { title: string; text: string }[];
    equipmentLabel: string; equipmentTitle: string; equipmentLead: string;
    pillars: { kicker: string; title: string; text: string }[];
    routeLabel: string; routeTitle: string; routeLead: string; route: { kicker: string; title: string; text: string; list: string[] }[];
    trialLabel: string; trialTitle: string; trialLead: string; trialPoints: string[];
    tourLabel: string; tourTitle: string; tourLead: string; tourCta: string;
    teamLabel: string; teamTitle: string; teamLead: string;
    tradeLabel: string; tradeTitle: string; tradeLead: string;
    ctaTitle: string; ctaLead: string;
  };
  service: {
    eyebrow: string; title: string; lead: string; heroAlt: string; promises: string[];
    rolesLabel: string; rolesTitle: string; rolesLead: string; roles: { code: string; name: string; tagline: string; duties: string[] }[]; rolesValues: string[];
    supportLabel: string; supportTitle: string; supportLead: string; support: { title: string; items: string[] }[]; supportNote: string;
    stepsLabel: string; stepsTitle: string; stepsLead: string; steps: { no: string; kicker: string; title: string; text: string; photo: string; alt?: string }[];
    flexLabel: string; flexTitle: string; flexLead: string; flex: string[];
    visitLabel: string; visitTitle: string; visitLead: string; visitPerks: { title: string; text: string }[];
    visitsCta: string; virtualCta: string; bookCta: string; photoNote: string;
    ctaTitle: string; ctaLead: string;
  };
  projects: {
    eyebrow: string; title: string; lead: string; heroAlt: string; heroCaption: string;
    introLabel: string; introTitle: string; introLead: string; facts: [string, string][];
    spacesLabel: string; spaces: Record<string, { title: string; text: string }>;
    filmsLabel: string; filmsTitle: string; filmsLead: string; reels: string[];
    ctaTitle: string; ctaLead: string;
  };
  about: {
    eyebrow: string; title: string; lead: string; heroAlt: string;
    storyLabel: string; storyTitle: string; storyLead: string; pillars: string[];
    principlesLabel: string; principlesTitle: string; principlesLead: string; principles: { kicker: string; title: string; text: string }[];
    serveLabel: string; serveTitle: string; serve: string[];
    buildLabel: string; buildTitle: string; buildLead: string; buildCta: string;
    supportLabel: string; supportTitle: string; supportLead: string; supportCta: string;
    teamLabel: string; teamTitle: string; teamLead: string; closing: string[];
    creditsLabel: string; credits: string[];
    ctaTitle: string; ctaLead: string;
  };
  contact: {
    eyebrow: string; title: string; lead: string;
    directLabel: string; whatsapp: string; email: string; phone: string; address: string; follow: string;
    formLabel: string; formTitle: string; formLead: string;
    stepsLabel: string; steps: { title: string; text: string }[];
  };
};

const en: PageCopy = {
  common: {
    discuss: "Discuss Your Project",
    explore: "Explore",
    learn: "Learn more",
    gallery: "Gallery",
    overview: "Overview",
    details: "Details",
    related: "Made as one with",
    film: "Film",
    aiNote: "Includes AI-assisted motion from real project photography",
    musicCredit: "Music: “Sleep” by Scott Buckley, CC BY 4.0",
    completed: "Completed project · Guangzhou",
    concept: "Design concept",
    draftNote: "",
  },
  products: {
    eyebrow: "CIRMANO / Products",
    title: "One language, room to room.",
    lead: "Kitchens, wardrobes, interior doors, wall panels and architectural woodwork, planned together so that every element reads as part of the same home.",
    heroAlt: "Kitchen with flush white cabinetry, marble backsplash and oak island, Guangzhou Residence",
    heroCaption: "Kitchen & dining · Guangzhou Residence",
    systemsLabel: "Systems",
    systemsTitle: "From daily rituals to hidden structure.",
    systemsLead: "A systematic approach connects each product with the way the home is lived in. Four systems, one material language.",
    systems: [
      { kicker: "Day system", title: "Storage and display for everyday living", list: ["Kitchen cabinetry", "Sideboards", "TV units and bookcases", "Wine storage", "Living and dining cabinets"] },
      { kicker: "Night system", title: "Continuity and calm in private rooms", list: ["Wardrobe systems", "Walk-in closets", "Interior and concealed doors", "Wall panel systems", "Vanities"] },
      { kicker: "Structure", title: "A clear space begins with hidden structure", list: ["Cabinet bodies", "Hardware systems", "Finishing details", "Modular components"] },
      { kicker: "Custom woodwork", title: "Built-ins that belong to the architecture", list: ["Entry and balcony cabinets", "Whole-home woodwork", "Panels and custom furniture"] },
    ],
    collectionsLabel: "Collections",
    collectionsTitle: "Five product families.",
    materialsLabel: "Materials",
    materialsTitle: "Material, already considered.",
    materialsLead: "Our core collection is built around prefinished decorative surfaces, including selected materials sourced from Europe. Colour and texture are chosen as a palette for the whole home, so cabinetry, doors and wall panels share one visual language.",
    edgeLabel: "The edge",
    edgeTitle: "A surface, resolved to the edge.",
    edgeLead: "The perimeter of a panel is part of its design. On specified, compatible components, laser edgebanding creates a visually continuous transition between the decorative face and the edging.",
    edgeBenefits: ["A cleaner visual transition", "A more coherent face-to-edge relationship", "Detail that supports the whole surface"],
    ctaTitle: "Plan the whole home as one.",
    ctaLead: "Share your floor plan, product requirements and material direction to start the conversation.",
    pages: [
      {
        slug: "kitchens",
        name: "Kitchens",
        headline: "A kitchen of quiet planes.",
        lead: "Made-to-measure cabinetry planned around your space, storage needs and material direction.",
        description: "Kitchen cabinetry shapes the way a room is used and the way it is seen. CIRMANO kitchen systems combine clean cabinet fronts, coordinated decorative surfaces and carefully resolved panel edges with layouts developed around your space. The material palette carries across the cabinetry, while storage and adjoining elements are considered as part of the overall plan.",
        features: [
          { title: "Clean-lined fronts", text: "Aligned cabinet fronts and quiet planes that let the room lead." },
          { title: "Coordinated surfaces", text: "Prefinished surfaces chosen as part of the home's palette." },
          { title: "Resolved edges", text: "Laser edgebanding on specified compatible components." },
          { title: "Planned around use", text: "Layout and storage developed around the project." },
        ],
        galleryTitle: "Kitchen and dining, Guangzhou Residence",
        film: { src: "/media/video/res-kitchen.mp4", poster: "/media/video/res-kitchen.webp", label: "Kitchen with tall units and oak island" },
        cta: "Plan your kitchen",
      },
      {
        slug: "wardrobes-storage",
        name: "Wardrobes & Storage",
        headline: "Storage, with a quieter presence.",
        lead: "Wardrobes, dressing rooms and integrated storage, with considered proportions and practical layouts.",
        description: "A wardrobe should belong to the room it serves. CIRMANO wardrobe and dressing-room systems bring continuous surfaces, balanced door lines and a coordinated finish palette into storage planned around daily use. Internal arrangements and external proportions are developed together, creating a considered relationship between the furniture and the surrounding architecture.",
        features: [
          { title: "Balanced door proportions", text: "Door lines drawn with the room, not just the cabinet." },
          { title: "Storage planned around use", text: "Internal fittings developed with the people who use them." },
          { title: "Coordinated finishes", text: "Surface and edging selected with the rest of the home." },
          { title: "One material language", text: "Entry, bedroom and children's rooms read as one." },
        ],
        galleryTitle: "Wardrobes, dressing room and children's storage",
        film: { src: "/media/video/reel-storage.mp4", poster: "/media/video/reel-storage.webp", label: "Thoughtful storage", credit: true },
        cta: "Explore wardrobe systems",
      },
      {
        slug: "interior-doors",
        name: "Interior Doors",
        headline: "A transition, carefully resolved.",
        lead: "Interior doors designed to sit coherently with surrounding cabinetry and wall panels.",
        description: "Coordinated interior doors extend the material language of the cabinetry into the architecture. Surface selection, proportion and the relationship with adjacent wall finishes are considered together, so the door becomes part of a coherent room-to-room composition.",
        features: [
          { title: "Matched to cabinetry", text: "The same surfaces and edge details as the furniture beside it." },
          { title: "Concealed options", text: "Doors that disappear into a run of panelling." },
          { title: "Proportion first", text: "Heights and divisions drawn with the wall." },
          { title: "Considered hardware", text: "Hardware chosen within the same material language." },
        ],
        galleryTitle: "Doors and junctions, Guangzhou Residence",
        film: { src: "/media/video/res-hallway.mp4", poster: "/media/video/res-hallway.webp", label: "Hallway with flush doors and a curved wall" },
        cta: "Discuss interior doors",
      },
      {
        slug: "wall-panels-woodwork",
        name: "Wall Panels & Woodwork",
        headline: "The architecture of a quiet surface.",
        lead: "Decorative panels and architectural woodwork that connect surfaces and details across the home.",
        description: "CIRMANO decorative wall panels organise the room through broad surfaces and carefully planned junctions. Finishes are selected alongside cabinetry and doors, allowing individual elements to read as one architectural composition. Built-in storage, media cabinetry and sideboards are developed within the same material approach.",
        features: [
          { title: "Broad, calm surfaces", text: "Panels that organise the room rather than decorate it." },
          { title: "Planned junctions", text: "Shadow lines and returns resolved at the drawing stage." },
          { title: "Built-in woodwork", text: "Media walls, sideboards and storage in the same finish." },
          { title: "Room to room", text: "One palette carried from the entry to the bedroom." },
        ],
        galleryTitle: "Tea room and oak woodwork, Guangzhou Residence",
        film: { src: "/media/video/reel-wall-panel-detail.mp4", poster: "/media/video/reel-wall-panel-detail.webp", label: "Wall panel detail", credit: true },
        cta: "Discuss a whole-home project",
      },
      {
        slug: "aluminium-glass",
        name: "Aluminium & Glass",
        headline: "Light, texture, reflection.",
        lead: "Aluminium and glass elements within an integrated interior scheme. Available configurations are discussed per project.",
        description: "Bronze-framed glass display cabinets, glazed doors and partitions bring light into the cabinetry without breaking its lines. Frames and glass are chosen in the same tones as the surrounding woodwork, so the system reads as one piece of the room. Available configurations are discussed for each project.",
        features: [
          { title: "Display cabinetry", text: "Glass fronts and integrated light for collections and books." },
          { title: "Tone-matched frames", text: "Frames chosen with the timber and stone around them." },
          { title: "Glazed doors", text: "Light carried through a run of cabinetry." },
          { title: "Per-project scope", text: "Configurations confirmed with each project." },
        ],
        galleryTitle: "Glass-front cabinets and mirrors, Guangzhou Residence",
        film: { src: "/media/video/reel-glass-detail.mp4", poster: "/media/video/reel-glass-detail.webp", label: "Glass details", credit: true },
        cta: "Discuss glass and frames",
      },
    ],
  },
  manufacturing: {
    eyebrow: "CIRMANO / Manufacturing",
    title: "German quality. Factory-direct value.",
    lead: "German HOMAG equipment, refined craftsmanship and rigorous checks. High-end OEM manufacturing at competitive factory-direct prices. Panels, finishes, hardware and lighting to suit your design and budget.",
    heroAlt: "The CIRMANO factory floor in Foshan",
    introLabel: "Why the factory matters",
    introTitle: "What you receive on site is decided here.",
    introLead: "In the drawings, the machines, the checks and the people who build your order.",
    pillars: [
      { kicker: "Factory-direct", title: "Factory-direct, better value", text: "You deal with the source of production. Fewer middle layers, direct communication, and a sensible match of materials and hardware help keep your budget under control." },
      { kicker: "Technical drawing review", title: "Reviewed before production", text: "Drawings are checked for dimensions, structure, door opening and hardware space before anything is cut, so problems are found on paper, not on site." },
      { kicker: "Trial assembly", title: "Checked before it ships", text: "Cabinetry is assembled in the factory to check how parts fit, gaps and alignment before it is packed." },
      { kicker: "HOMAG equipment", title: "German HOMAG processing", text: "Panels are processed and edgebanded on German HOMAG equipment, so dimensions repeat and edges stay clean." },
      { kicker: "Materials & hardware", title: "Matched materials and hardware", text: "Boards, surfaces and hardware are selected together, within the range we can actually supply for your project." },
    ],
    routeLabel: "Design to delivery",
    routeTitle: "What happens after you approve the design.",
    routeLead: "Five stages, each with a clear sign-off, so you always know where your order is.",
    route: [
      { kicker: "01", title: "Design confirmed", text: "Drawings are reviewed and confirmed before production begins.", list: ["Layouts and shop drawings", "Technical drawing review: size, structure, door opening, hardware space", "Appliance and hardware interfaces"] },
      { kicker: "02", title: "Materials selected", text: "Finishes are chosen from physical samples, not from screens.", list: ["Board, veneer and colour samples", "Hardware and lighting", "Approved references recorded"] },
      { kicker: "03", title: "Manufacturing", text: "Your order moves through the production steps in our factory.", list: ["Cutting, edge banding, drilling", "Shaped and curved parts", "Trial assembly"] },
      { kicker: "04", title: "Quality control", text: "Parts are checked against the approved order along the way and before packing.", list: ["Dimensions and edges", "Surface and colour", "Fit checked at trial assembly"] },
      { kicker: "05", title: "Packing & shipping", text: "Packed for long-distance transport and labelled for installation.", list: ["Export packing", "Labels and packing lists", "Container loading and documents"] },
    ],
    stepsLabel: "Ten steps",
    stepsTitle: "From board to shipment, in ten steps.",
    stepsNote: "A typical sequence. The steps your order follows depend on its products and specification.",
    steps: [
      { no: "01", title: "Cutting", text: "Boards are cut to size on CNC machines, directly from the approved drawings.", photo: "x-cut" },
      { no: "02", title: "Edge banding", text: "HOMAG edgebanders seal every visible edge for a clean, durable perimeter.", photo: "m07" },
      { no: "03", title: "Drilling", text: "CNC drilling places hinge, shelf and connector holes where the drawings say.", photo: "x-drill" },
      { no: "04", title: "Sorting", text: "Finished parts are sorted and labelled by order and cabinet, ready for assembly.", photo: "m02" },
      { no: "05", title: "Shaped parts", text: "Curved panels, profiles and special shapes are machined and finished with care.", photo: "m01" },
      { no: "06", title: "Trial assembly", text: "Cabinets are assembled by hand in the factory to check fit, gaps and alignment before they ship.", photo: "m05" },
      { no: "07", title: "Cleaning", text: "Every part is cleaned and inspected so it arrives ready to install.", photo: "f023" },
      { no: "08", title: "Packing", text: "Parts are wrapped and boxed with protection for long-distance transport.", photo: "m04" },
      { no: "09", title: "Warehousing", text: "Packed orders are stored by project until the full shipment is ready.", photo: "f028" },
      { no: "10", title: "Shipping", text: "Orders are loaded and shipped with labels and packing lists.", photo: "f010" },
    ],
    trialLabel: "Trial assembly",
    trialTitle: "We build it once in the factory, so it fits on site.",
    trialLead: "Before packing, cabinetry is assembled in our workshop. Fronts, gaps, alignment and the joints between adjoining parts are checked and adjusted here, not on your site. Trial assembly is a separate check done by our team; it is not a machine step.",
    trialPoints: ["Fronts and gaps checked", "Adjoining parts fitted together", "Adjustments made before packing"],
    equipmentLabel: "Workshop",
    equipmentTitle: "German HOMAG equipment.",
    equipmentLead: "Panel processing and edgebanding run on HOMAG machinery. The photographs show equipment in the CIRMANO workshop; they are not a count of machines.",
    collabLabel: "Specialist factories",
    collabTitle: "Wood and aluminium-glass, planned together.",
    collabLead: "Woodwork and aluminium-glass are made by specialist factories, then brought under one design and manufacturing plan so doors, walls and cabinetry meet cleanly.",
    collab: [
      { title: "Woodwork factory", text: "Kitchens, wardrobes, storage, interior doors and wall panels." },
      { title: "Aluminium & glass factory", text: "Aluminium frames and glass elements, with configurations confirmed per project." },
    ],
    tourLabel: "Factory tour",
    tourTitle: "Walk the factory floor.",
    tourLead: "Watch cutting, edge banding, assembly and packing in our factory tour videos on Facebook, explore the factory in VR, or visit us in Foshan.",
    tourCta: "Watch the factory tour",
    teamLabel: "Team",
    teamTitle: "The people behind the detail.",
    teamLead: "Our team in Foshan brings drawings, materials and construction details into the same conversation, and our service team stays with the project after production. See how it works on the Service page.",
    tradeLabel: "For designers",
    tradeTitle: "Give the design a precise route to production.",
    tradeLead: "We work with architects, interior designers and residential project partners to translate a clean-lined design language into specified cabinetry and woodwork. Share your drawings, material direction, project location and target programme.",
    ctaTitle: "Bring your drawings to the factory.",
    ctaLead: "Share your drawings and we will discuss the product systems, finish selections and manufacturing scope.",
  },
  service: {
    eyebrow: "CIRMANO / One-stop service",
    title: "Custom Cabinetry, from Design to Delivery",
    lead: "CIRMANO designs and manufactures custom kitchen cabinets, wardrobes, built-in storage and interior glass doors. We guide you through each step, from planning what fits your space to arranging international delivery.",
    heroAlt: "Designer and client reviewing cabinetry drawings in a custom kitchen",
    promises: ["Free 3D Cabinetry Design", "Materials, Finishes & Hardware", "Manufacturing & Quality Control", "Export Packing & International Shipping"],
    rolesLabel: "Your team",
    rolesTitle: "One partner. A team behind it.",
    rolesLead: "You work with CIRMANO. Four roles work together behind the scenes, so you do not have to coordinate four people yourself.",
    roles: [
      { code: "PM", name: "Project Manager", tagline: "Keeps the whole project on course.", duties: ["Understands your needs", "Confirms the project direction", "Leads overall communication"] },
      { code: "DES", name: "Layout & Detail Designer", tagline: "Turns the space into drawings.", duties: ["Space layout", "Scheme and 3D visuals", "Detailed drawings"] },
      { code: "SM", name: "Solution Manager", tagline: "Matches products to your budget.", duties: ["Product and material configuration", "Comparing options", "Budget optimisation"] },
      { code: "DM", name: "Delivery Manager", tagline: "Follows the order out the door.", duties: ["Production and shipping progress", "Delivery coordination", "Following up delivery issues"] },
    ],
    rolesValues: ["Continuous coordination", "Efficient communication", "Quality assurance", "Value delivered"],
    stepsLabel: "How it works",
    stepsTitle: "Your project, step by step.",
    stepsLead: "Six steps, each one answering what is done for you.",
    steps: [
      { no: "01", kicker: "Factory & showroom", title: "Get to know us", text: "See where your furniture is made, in Foshan or through video and our 360° virtual tour.", photo: "/media/brand/cirmano-service-01-showroom.webp", alt: "Client viewing cabinetry and wardrobe samples in the showroom" },
      { no: "02", kicker: "Design", title: "Plan your project", text: "Send your floor plan. You see layouts and drawings, and approve them before anything is made.", photo: "/media/brand/cirmano-service-02-project-planning.webp", alt: "Designer and client reviewing a floor plan and layout drawings on a table" },
      { no: "03", kicker: "Materials", title: "Choose materials and finishes", text: "Compare boards, surfaces and hardware, and approve real samples rather than screen images.", photo: "/media/brand/cirmano-service-03-material-selection.webp", alt: "Wood veneers, door samples and hardware laid out on a table" },
      { no: "04", kicker: "Manufacturing & QC", title: "Made and checked in our factory", text: "Your order is produced and checked step by step in the factory.", photo: "/media/brand/cirmano-service-04-manufacturing-quality-control.webp", alt: "Worker checking a run of assembled cabinets in the factory" },
      { no: "05", kicker: "Delivery", title: "Packed and shipped safely", text: "Parts are packed for long-distance transport and labelled for installation.", photo: "/media/brand/cirmano-service-05-packing-shipping.webp", alt: "Packed cabinet parts ready for loading and shipment" },
      { no: "06", kicker: "Support", title: "Installation guidance and after-sales", text: "You receive installation drawings and guidance, and we help verify and follow up questions after delivery.", photo: "/media/brand/cirmano-service-06-installation-support.webp", alt: "Installer checking the cabinets against drawings on a tablet with a spirit level" },
    ],
    supportLabel: "Support team",
    supportTitle: "Help before, during and after the order.",
    supportLead: "Behind the project managers is a wider team. What matters to you is what it covers.",
    support: [
      { title: "Before the order", items: ["Scheme and quotation", "Order confirmation", "Material and hardware advice"] },
      { title: "During production", items: ["Production planning and order follow-up", "Quality inspection", "Warehousing and logistics"] },
      { title: "After delivery", items: ["Export inspection, documents and customs", "Overseas delivery coordination", "Installation drawings, guidance and problem follow-up"] },
    ],
    supportNote: "Installation support means drawings, information, guidance and checking issues with you. On-site installation, repairs, replacements and warranty terms are confirmed per project.",
    flexLabel: "Flexible service",
    flexTitle: "Need a different plan?",
    flexLead: "The steps above are our full one-stop service. Every project is different, so you can choose only what you need.",
    flex: ["Order only the products you need", "Work with your own shipping agent", "Build from your own designer’s drawings", "Adjust the steps to your schedule"],
    visitLabel: "Client visits",
    visitTitle: "Meet us in Foshan.",
    visitLead: "Clients visit our factory and showroom to see materials, meet the team and watch their orders take shape. See past visits on Facebook, or plan your own.",
    visitPerks: [
      { title: "Free showroom visit", text: "A project manager guides you through the products you need." },
      { title: "Pickup on request", text: "Send a floor plan or product list and ask about complimentary pickup; confirm before you travel." },
      { title: "Hotel booking help", text: "We can help book nearby hotels; accommodation is paid separately." },
      { title: "360° virtual tour", text: "Preview the showroom online before you come." },
    ],
    visitsCta: "More client visits on Facebook",
    virtualCta: "Open the 360° virtual tour",
    bookCta: "Book a visit",
    photoNote: "Videos open on the CIRMANO Facebook page.",
    ctaTitle: "Send your floor plan for a quote.",
    ctaLead: "Tell us about your project and we will reply with next steps and a quotation.",
  },
  projects: {
    eyebrow: "CIRMANO / Projects",
    title: "Guangzhou Residence",
    lead: "Flush cabinetry, oak woodwork and hidden storage brought together within a finished home.",
    heroAlt: "Living room with a full-height wall of flush white cabinetry, Guangzhou Residence",
    heroCaption: "Living room · Guangzhou Residence",
    introLabel: "Completed project",
    introTitle: "One home, seven spaces, one language.",
    introLead: "From the living room's storage wall to the tea room shelving, each space shares the same palette of flush white cabinetry, light oak and built-in light.",
    facts: [["Location", "Guangzhou, China"], ["Type", "Private residence"], ["Spaces", "Living, kitchen & dining, tea room, bedroom & dressing, children's room, bathroom, entry & hallway"], ["Scope", "Confirmed with the project"]],
    spacesLabel: "Spaces",
    spaces: {
      living: { title: "Living Room", text: "A full-height wall of flush white doors opens onto deep storage and closes back to one quiet surface." },
      kitchen: { title: "Kitchen & Dining", text: "Flush tall units, a marble feature niche and an oak island with a table that runs from it." },
      tearoom: { title: "Tea Room", text: "Lit oak shelving set into white cabinetry, with a curved end panel and window bench." },
      bedroom: { title: "Bedroom & Dressing Room", text: "Handleless wardrobes, a dressing table and pull-out jewellery and accessory drawers." },
      children: { title: "Children's Room", text: "A loft bed with storage stairs, pull-out drawers and a desk planned for growing use." },
      bathroom: { title: "Bathroom", text: "An oak-grain vanity that hides the washing machine behind a round-cut door." },
      entry: { title: "Entry & Hallway", text: "Flush doors, a curved wall and storage that reads as one continuous surface." },
    },
    filmsLabel: "Films",
    filmsTitle: "Closer, in motion.",
    filmsLead: "Short films from the finished home: storage, glass, light and wall panels.",
    reels: ["Thoughtful storage", "Glass details", "Light and view", "Wall panel detail"],
    ctaTitle: "Your home, made as one.",
    ctaLead: "Share your floor plan, product requirements and material direction to start the conversation.",
  },
  about: {
    eyebrow: "ABOUT CIRMANO",
    title: "Made As One. Built for the complete home.",
    lead: "CIRMANO is based in Foshan, China, and makes integrated whole-home cabinetry for villas and premium residences. Kitchens, wardrobes, interior doors, wall panels and aluminium-glass systems are connected through design development, material selection, manufacturing and project service, so every scheme balances aesthetics, function and budget.",
    heroAlt: "Tea room with lit oak shelving and flush white cabinetry, Guangzhou Residence",
    storyLabel: "Brand",
    storyTitle: "One plan across woodwork and glass.",
    storyLead: "Drawing on Foshan’s mature manufacturing and supply chain, CIRMANO coordinates specialist woodwork and aluminium-glass factories under a single design and manufacturing plan. From cabinet layout to the junction of door and wall, from finish pairing to hardware, we care about how each part works on its own and how it sits within the whole space.",
    pillars: ["Kitchen cabinets", "Wardrobes & storage", "Interior doors", "Wall panels & trims", "Aluminium & glass systems"],
    principlesLabel: "Made As One",
    principlesTitle: "What Made As One means for your home.",
    principlesLead: "The unity of a home comes from the natural echo between material, proportion, colour and detail. We start from how you live and what each space needs, so rooms keep their own purpose while sharing one coherent design language.",
    principles: [
      { kicker: "01", title: "Direct to the source factory", text: "You work with the people who make your order, with fewer middle layers." },
      { kicker: "02", title: "Planned together", text: "Cabinetry, doors and wall systems are planned as one whole-home scheme." },
      { kicker: "03", title: "Checked before it leaves", text: "Drawings are reviewed before production, and cabinetry is checked and trial-assembled before shipping." },
      { kicker: "04", title: "Design to after-delivery", text: "One team follows the project from the first brief to support after delivery." },
    ],
    serveLabel: "Who we work with",
    serveTitle: "For people who look closely at the detail.",
    serve: ["Villa and premium-home owners", "Interior designers and architects", "Builders and contractors", "Residential developers"],
    buildLabel: "Manufacturing",
    buildTitle: "Manufacturing makes the design real.",
    buildLead: "We combine German HOMAG equipment, technical drawing review before production, process checks and cabinet trial assembly to verify drawings, machining and how parts fit together. Matching materials and hardware sensibly, and talking directly with the factory, lets quality and budget be considered together.",
    buildCta: "See how we manufacture",
    supportLabel: "Service",
    supportTitle: "A team that stays with the project.",
    supportLead: "From the first conversation to design, material selection, production and delivery support, a project manager, designer, solution manager and delivery manager work together. We aim to turn the space you imagine into a home you live in, through clear communication, professional manufacturing and continuing service.",
    supportCta: "How our service works",
    teamLabel: "Team",
    teamTitle: "Foshan, China.",
    teamLead: "Design development and manufacturing in one place, so drawings, materials and details stay in the same conversation.",
    closing: ["CIRMANO · Made As One.", "Every part, together, makes the complete home."],
    creditsLabel: "Credits",
    credits: [
      "Typeface: Manrope (SIL Open Font License).",
      "Interface motion: React Bits by David Haz (MIT + Commons Clause).",
      "Preview walkthrough based on Casa Serra by Samnang Aing; materials from Poly Haven (CC0).",
      "Music in films: “Sleep” by Scott Buckley (CC BY 4.0).",
    ],
    ctaTitle: "Let’s create complete living spaces.",
    ctaLead: "Homeowners, designers and project partners: share your project and we will start the conversation.",
  },
  contact: {
    eyebrow: "CIRMANO / Contact",
    title: "Let’s discuss your project.",
    lead: "Share your floor plan, product requirements and material direction to start the conversation.",
    directLabel: "Direct",
    whatsapp: "WhatsApp",
    email: "Email",
    phone: "Phone",
    address: "Address",
    follow: "Follow",
    formLabel: "Project enquiry",
    formTitle: "Tell us about the home.",
    formLead: "Name, email, country or region, project type, the products you need and a short brief. A floor plan helps, but is optional.",
    stepsLabel: "What happens next",
    steps: [
      { title: "We read your brief", text: "Drawings, products and material direction." },
      { title: "We discuss the scope", text: "Product systems, finishes and manufacturing scope." },
      { title: "We develop the proposal", text: "Around the agreed scope and specification." },
    ],
  },
};

const zh: PageCopy = {
  common: { discuss: "沟通项目", explore: "查看", learn: "了解更多", gallery: "图库", overview: "概览", details: "细节", related: "一体搭配", film: "影像", aiNote: "含基于真实项目照片的 AI 辅助运镜", musicCredit: "音乐：Scott Buckley《Sleep》，CC BY 4.0", completed: "完工项目 · 广州", concept: "设计概念", draftNote: "" },
  products: {
    eyebrow: "CIRMANO / 产品",
    title: "一种语言，贯穿每个房间。",
    lead: "橱柜、衣柜、室内门、墙板与木作统一规划，让每一处都成为同一个家的一部分。",
    heroAlt: "广州住宅厨房：白色平板柜体、大理石背板与橡木中岛",
    heroCaption: "厨房与餐厅 · 广州住宅",
    systemsLabel: "系统",
    systemsTitle: "从日常起居，到隐藏结构。",
    systemsLead: "以系统化方式连接产品与居住体验。四个系统，一套材质语言。",
    systems: [
      { kicker: "日间系统", title: "服务日常生活的收纳与展示", list: ["厨房柜体", "餐边柜", "电视柜与书柜", "酒柜", "客餐厅柜体"] },
      { kicker: "夜间系统", title: "为私密空间带来连续与安静", list: ["衣柜系统", "步入式衣帽间", "室内门 / 隐形门", "墙板系统", "梳妆台"] },
      { kicker: "结构系统", title: "清爽的空间，始于隐藏的结构", list: ["柜体", "五金系统", "收口细节", "模块化部件"] },
      { kicker: "定制木作", title: "属于建筑的一部分", list: ["玄关柜与阳台柜", "全屋木作", "墙板与定制家具"] },
    ],
    collectionsLabel: "产品系列",
    collectionsTitle: "五类产品。",
    materialsLabel: "材质",
    materialsTitle: "材质，早已斟酌。",
    materialsLead: "核心系列以预饰面装饰材料为基础，包含部分精选欧洲来源的材料。色彩与质感作为全屋色板统一考虑，让柜体、门与墙板共享同一视觉语言。",
    edgeLabel: "边缘",
    edgeTitle: "表面，一直完成到边缘。",
    edgeLead: "板件的边缘也是设计的一部分。在指定的兼容部件上，激光封边让饰面与封边之间呈现视觉上连续的过渡。",
    edgeBenefits: ["更干净的视觉过渡", "更协调的面与边关系", "服务于整个表面的细节"],
    ctaTitle: "把整个家，作为一个整体来规划。",
    ctaLead: "发送户型图、需要的产品和材质方向，开启进一步讨论。",
    pages: [
      { slug: "kitchens", name: "橱柜", headline: "安静平面构成的厨房。", lead: "围绕空间、收纳需求与材质方向展开的定制柜体。", description: "厨房柜体决定了空间如何被使用，也决定了它如何被看见。CIRMANO 厨房系统以干净的柜门、协调的饰面与精细处理的板边，配合围绕空间展开的布局。材质色板贯穿柜体，收纳与相邻元素作为整体规划的一部分一并考虑。", features: [{ title: "干净的柜门线条", text: "柜门对齐，平面安静，让空间成为主角。" }, { title: "协调的饰面", text: "预饰面材料作为全屋色板的一部分选择。" }, { title: "精细的边缘", text: "指定兼容部件采用激光封边。" }, { title: "围绕使用规划", text: "布局与收纳围绕项目展开。" }], galleryTitle: "广州住宅 · 厨房与餐厅", film: { src: "/media/video/res-kitchen.mp4", poster: "/media/video/res-kitchen.webp", label: "高柜与橡木中岛" }, cta: "规划你的厨房" },
      { slug: "wardrobes-storage", name: "衣柜与收纳", headline: "收纳，更安静地存在。", lead: "衣柜、衣帽间及整合收纳，兼顾比例与使用布局。", description: "衣柜应当属于它所服务的房间。CIRMANO 衣柜与衣帽间系统，将连续的表面、均衡的门线与协调的饰面色板，带入围绕日常使用规划的收纳之中。内部布置与外部比例一同推敲，让家具与周围建筑形成考究的关系。", features: [{ title: "均衡的门板比例", text: "门线随房间而画，而不只随柜体。" }, { title: "围绕使用的收纳", text: "内部配置围绕使用者展开。" }, { title: "协调的饰面", text: "饰面与封边和全屋一同选择。" }, { title: "一套材质语言", text: "玄关、卧室与儿童房连成一体。" }], galleryTitle: "衣柜、衣帽间与儿童房收纳", film: { src: "/media/video/reel-storage.mp4", poster: "/media/video/reel-storage.webp", label: "从容收纳", credit: true }, cta: "了解衣柜系统" },
      { slug: "interior-doors", name: "室内门", headline: "过渡之处，细致处理。", lead: "与相邻柜体、墙板保持一致设计语言的室内门。", description: "协调的室内门把柜体的材质语言延伸到建筑之中。饰面选择、比例以及与相邻墙面的关系一同考虑，让门成为房间之间连贯构图的一部分。", features: [{ title: "与柜体匹配", text: "与旁边家具相同的饰面与收边。" }, { title: "隐形门选项", text: "融入整面墙板的门。" }, { title: "比例优先", text: "高度与分割随墙面一起推敲。" }, { title: "考究的五金", text: "五金在同一材质语言中选择。" }], galleryTitle: "广州住宅 · 门与收口", film: { src: "/media/video/res-hallway.mp4", poster: "/media/video/res-hallway.webp", label: "隐形门与弧形墙的过道" }, cta: "沟通室内门" },
      { slug: "wall-panels-woodwork", name: "墙板与木作", headline: "一面安静的表面，也是建筑。", lead: "以装饰墙板和定制木作，连接空间中的表面与细节。", description: "CIRMANO 装饰墙板以大面与精心规划的交接组织空间。饰面与柜体、门一同选择，让各个元素读起来是一个整体的建筑构图。嵌入式收纳、电视柜与餐边柜也在同一材质思路中发展。", features: [{ title: "宽阔安静的表面", text: "墙板组织空间，而非装饰空间。" }, { title: "规划好的交接", text: "阴影线与收边在图纸阶段解决。" }, { title: "嵌入式木作", text: "电视墙、餐边柜与收纳采用同一饰面。" }, { title: "贯穿全屋", text: "一套色板从玄关延续到卧室。" }], galleryTitle: "广州住宅 · 茶室与橡木木作", film: { src: "/media/video/reel-wall-panel-detail.mp4", poster: "/media/video/reel-wall-panel-detail.webp", label: "墙板细节", credit: true }, cta: "沟通全屋项目" },
      { slug: "aluminium-glass", name: "铝与玻璃", headline: "光、质感与反射。", lead: "整合室内系统中的铝玻元素，具体可供配置按项目沟通。", description: "古铜框玻璃展示柜、玻璃门与隔断，把光引入柜体而不打断它的线条。框料与玻璃和周围木作选择相同的色调，让整个系统读起来是房间的一部分。具体可供配置按项目沟通。", features: [{ title: "展示柜", text: "玻璃柜门与内嵌灯光，陈列收藏与书籍。" }, { title: "同色调框料", text: "框料与周围木材、石材一同选择。" }, { title: "玻璃门", text: "让光穿过整排柜体。" }, { title: "按项目确认", text: "具体配置随项目确认。" }], galleryTitle: "广州住宅 · 玻璃门柜与镜柜", film: { src: "/media/video/reel-glass-detail.mp4", poster: "/media/video/reel-glass-detail.webp", label: "玻璃细节", credit: true }, cta: "沟通玻璃与框料" },
    ],
  },
  manufacturing: {
    eyebrow: "CIRMANO / 制造优势",
    title: "德国品质。工厂直供，更有价值。",
    lead: "德国 HOMAG 设备、精细工艺与严格检查。高端 OEM 制造，以有竞争力的工厂直供价格提供。板材、饰面、五金与灯具，按您的设计与预算搭配。",
    heroAlt: "佛山 CIRMANO 工厂车间",
    introLabel: "为什么是工厂",
    introTitle: "你在现场收到的，在这里就已决定。",
    introLead: "取决于图纸、设备、检验，以及为你生产订单的人。",
    pillars: [
      { kicker: "源头工厂直供", title: "工厂直供，更有价值", text: "直接对接生产源头，减少中间环节，沟通直接，材料与五金合理搭配，帮助你把预算控制得更清楚。" },
      { kicker: "生产前技术审图", title: "生产之前，先审图", text: "开料之前，核查尺寸、结构、开启方式与五金空间，把问题解决在图纸上，而不是留到现场。" },
      { kicker: "出货前试装", title: "出厂之前，先装一次", text: "柜体在工厂内先行组装，检查部件配合、缝隙与对齐，确认后再打包。" },
      { kicker: "德国 HOMAG 设备", title: "德国 HOMAG 加工", text: "板件加工与封边使用德国 HOMAG 设备，尺寸稳定，板边干净。" },
      { kicker: "材料与五金", title: "材料与五金合理匹配", text: "板材、饰面与五金一同选择，并按项目实际可供应的范围配置。" },
    ],
    routeLabel: "从设计到交付",
    routeTitle: "确认设计之后，会发生什么。",
    routeLead: "五个阶段，每一步都有明确的确认，订单进度一目了然。",
    route: [
      { kicker: "01", title: "确认设计", text: "图纸经审核确认后，才开始生产。", list: ["布局与深化图纸", "技术审图：尺寸、结构、开启方式、五金空间", "电器与五金衔接"] },
      { kicker: "02", title: "选材", text: "以实物样板选定饰面，而非屏幕图片。", list: ["板材、木皮与颜色样板", "五金与灯光", "记录确认的样板"] },
      { kicker: "03", title: "制造", text: "订单在工厂经过各道生产工序。", list: ["开料、封边、打孔", "异型与弧形部件", "试装"] },
      { kicker: "04", title: "质检", text: "过程中及打包前，对照确认的订单检查。", list: ["尺寸与封边", "表面与颜色", "试装时检查配合"] },
      { kicker: "05", title: "打包与发货", text: "按长途运输标准打包，并为安装做好标识。", list: ["出口包装", "标签与装箱单", "装柜与单证"] },
    ],
    stepsLabel: "十道工序",
    stepsTitle: "从板材到发货，十道工序。",
    stepsNote: "以下为典型流程，具体工序随订单的产品与规格而定。",
    steps: [
      { no: "01", title: "开料", text: "按确认图纸，由数控设备精确裁切板材。", photo: "x-cut" },
      { no: "02", title: "封边", text: "HOMAG 封边机封合每一条可见边，收口干净、耐用。", photo: "m07" },
      { no: "03", title: "打孔", text: "数控钻孔，把铰链、层板与连接件孔位打在图纸指定的位置。", photo: "x-drill" },
      { no: "04", title: "分拣", text: "成品板件按订单与柜体分拣、贴标，准备组装。", photo: "m02" },
      { no: "05", title: "异型", text: "弧形板、线条与异型部件，精细加工与处理。", photo: "m01" },
      { no: "06", title: "试装", text: "柜体在工厂内由人工先行组装，检查配合、缝隙与对齐后再出厂。", photo: "m05" },
      { no: "07", title: "清洁", text: "每一件部件清洁并检查，到场即可安装。", photo: "f023" },
      { no: "08", title: "打包", text: "部件逐件包裹、装箱，做好长途运输防护。", photo: "m04" },
      { no: "09", title: "入库", text: "打包完成的订单按项目入库，待整单齐套后发运。", photo: "f028" },
      { no: "10", title: "发货", text: "订单装车发运，附标签与装箱单。", photo: "f010" },
    ],
    trialLabel: "试装",
    trialTitle: "在工厂先装一次，到现场才装得准。",
    trialLead: "打包之前，柜体在车间内组装。柜门、缝隙、对齐以及相邻部件的衔接，都在这里检查和调整，而不是留到你的现场。试装是由团队完成的独立检查，并非机器工序。",
    trialPoints: ["检查柜门与缝隙", "相邻部件实际拼合", "调整完成后再打包"],
    equipmentLabel: "工厂",
    equipmentTitle: "德国 HOMAG 设备。",
    equipmentLead: "板件加工与封边使用 HOMAG 设备。照片展示的是 CIRMANO 工厂中的设备，不代表设备台数。",
    collabLabel: "专业工厂",
    collabTitle: "木作与铝玻，统一规划。",
    collabLead: "木作与铝玻由专业工厂分别制造，再纳入同一套设计与制造规划，让门、墙与柜体干净衔接。",
    collab: [
      { title: "木作工厂", text: "橱柜、衣柜、收纳、室内门与墙板。" },
      { title: "铝玻工厂", text: "铝框与玻璃元素，具体配置按项目确认。" },
    ],
    tourLabel: "工厂参观",
    tourTitle: "走进工厂车间。",
    tourLead: "在 Facebook 上观看我们的工厂实拍视频：开料、封边、组装与打包；也可以通过 VR 线上看厂，或来佛山实地参观。",
    tourCta: "观看工厂实拍",
    teamLabel: "团队",
    teamTitle: "细节背后的人。",
    teamLead: "佛山团队把图纸、材料与构造细节放进同一场对话，生产之后服务团队继续跟进项目。具体服务见“一站式服务”页面。",
    tradeLabel: "设计师合作",
    tradeTitle: "让设计拥有一条精确通往生产的路径。",
    tradeLead: "我们与建筑师、室内设计师及住宅项目合作方合作，把简洁的设计语言转化为指定的柜体与木作。欢迎发送图纸、材质方向、项目地点与目标进度。",
    ctaTitle: "把你的图纸带到工厂。",
    ctaLead: "发送图纸，我们将一起讨论产品系统、饰面选择与制造范围。",
  },
  service: {
    eyebrow: "CIRMANO / 一站式服务",
    title: "定制柜体，从设计到交付。",
    lead: "CIRMANO 设计并制造定制厨房柜体、衣柜、内置收纳与室内玻璃门。我们陪你走完每一步：从规划适合你空间的方案，到安排国际配送。",
    heroAlt: "设计师与客户在定制厨房核对柜体图纸",
    promises: ["免费 3D 柜体设计", "材料、饰面与五金", "源头工厂制造与品质检查", "出口包装与国际发运"],
    rolesLabel: "你的团队",
    rolesTitle: "一个伙伴，背后一支团队。",
    rolesLead: "你对接的是 CIRMANO。四种角色在背后协同，你不需要分别协调四个人。",
    roles: [
      { code: "PM", name: "项目经理", tagline: "把握整个项目的方向与节奏。", duties: ["理解你的需求", "确认项目方向", "统筹整体沟通"] },
      { code: "DES", name: "平面与深化设计师", tagline: "把空间落成图纸。", duties: ["空间布局", "方案与 3D 效果", "深化图纸"] },
      { code: "SM", name: "方案经理", tagline: "让产品与预算相匹配。", duties: ["产品与材料配置", "方案比较", "预算优化"] },
      { code: "DM", name: "交付经理", tagline: "跟进订单直到送达。", duties: ["生产与发运进度", "交付协调", "交付问题跟进"] },
    ],
    rolesValues: ["全程协同", "高效沟通", "品质保障", "价值交付"],
    stepsLabel: "服务流程",
    stepsTitle: "你的项目，一步一步推进。",
    stepsLead: "六个步骤，每一步都说明为你完成了什么。",
    steps: [
      { no: "01", kicker: "工厂与展厅", title: "认识我们", text: "看看你的家具在哪里生产：来佛山，或通过视频与 360° 线上展厅了解我们。", photo: "/media/brand/cirmano-service-01-showroom.webp", alt: "客户在展厅中参观柜体与衣柜样板" },
      { no: "02", kicker: "设计", title: "项目规划", text: "发来户型图，你会看到布局与图纸，并在生产前确认。", photo: "/media/brand/cirmano-service-02-project-planning.webp", alt: "设计师与客户在桌面上核对户型图与布局图纸" },
      { no: "03", kicker: "选材", title: "选定材料与饰面", text: "比较板材、饰面与五金，以实物样板确认，而非屏幕图片。", photo: "/media/brand/cirmano-service-03-material-selection.webp", alt: "桌面陈列的木饰面、柜门样板与五金样品" },
      { no: "04", kicker: "制造与质检", title: "工厂生产，逐项检验", text: "订单在工厂逐步生产，逐项检查。", photo: "/media/brand/cirmano-service-04-manufacturing-quality-control.webp", alt: "工人在工厂内检查成排组装的柜体" },
      { no: "05", kicker: "交付", title: "安全打包，稳妥发运", text: "按长途运输标准打包，并为安装做好标识。", photo: "/media/brand/cirmano-service-05-packing-shipping.webp", alt: "包装好的柜体部件准备装车发运" },
      { no: "06", kicker: "支持", title: "安装指导与售后", text: "提供安装图纸与指导，交付之后协助核实并跟进问题。", photo: "/media/brand/cirmano-service-06-installation-support.webp", alt: "安装人员对照平板上的图纸，使用水平尺核对柜体" },
    ],
    supportLabel: "支持团队",
    supportTitle: "订单之前、之中与之后，都有人支持。",
    supportLead: "项目经理背后还有更大的团队，你只需要知道它覆盖了什么。",
    support: [
      { title: "售前", items: ["方案与报价", "订单确认", "材料与五金建议"] },
      { title: "售中", items: ["生产计划与跟单", "质量检验", "仓储与物流"] },
      { title: "售后", items: ["出口检验、单证与报关", "海外配送协调", "安装图纸、指导与问题跟进"] },
    ],
    supportNote: "安装支持指图纸、资料、指导，以及与你一起核实问题。当地上门安装、维修、更换与保修条款，按项目确认。",
    flexLabel: "灵活服务",
    flexTitle: "需要不同的方案？",
    flexLead: "以上是完整的一站式服务。每个项目都不同，你也可以只选择需要的部分。",
    flex: ["只订购需要的产品", "使用你自己的货代", "按你设计师的图纸生产", "按你的进度调整流程"],
    visitLabel: "客户来访",
    visitTitle: "来佛山见面。",
    visitLead: "客户来到我们的工厂与展厅，看材料、见团队，看自己的订单如何成形。在 Facebook 上看往期来访，或安排你的行程。",
    visitPerks: [
      { title: "免费参观展厅", text: "项目经理一对一讲解你需要的产品。" },
      { title: "可申请接站", text: "提交户型图或产品清单即可申请免费接站，出行前确认安排。" },
      { title: "协助预订酒店", text: "可协助预订附近酒店，住宿费用自理。" },
      { title: "360° 线上展厅", text: "到访之前，先在线浏览展厅。" },
    ],
    visitsCta: "在 Facebook 查看更多客户来访",
    virtualCta: "打开 360° 线上展厅",
    bookCta: "预约参观",
    photoNote: "视频在 CIRMANO Facebook 主页打开。",
    ctaTitle: "发送户型图，获取报价。",
    ctaLead: "告诉我们你的项目，我们会回复下一步安排与报价。",
  },
  projects: {
    eyebrow: "CIRMANO / 项目",
    title: "广州住宅",
    lead: "平板柜体、橡木木作与隐藏收纳，在完工居所中融为一体。",
    heroAlt: "广州住宅客厅：通高白色平板收纳墙",
    heroCaption: "客厅 · 广州住宅",
    introLabel: "完工项目",
    introTitle: "一个家，七个空间，一种语言。",
    introLead: "从客厅的收纳墙到茶室的格架，每个空间共享同一套白色平板柜体、浅橡木与内嵌灯光。",
    facts: [["地点", "中国 · 广州"], ["类型", "私人住宅"], ["空间", "客厅、厨房与餐厅、茶室、主卧与衣帽间、儿童房、卫生间、玄关与过道"], ["范围", "按项目确认"]],
    spacesLabel: "空间",
    spaces: {
      living: { title: "客厅", text: "通高白色平板柜门，打开是成排收纳，关上是一面安静的墙。" },
      kitchen: { title: "厨房与餐厅", text: "齐平高柜、大理石展示龛，以及从中岛延伸出的橡木餐桌。" },
      tearoom: { title: "茶室", text: "嵌在白色柜体中的带灯橡木格架，配弧形收边与窗边卧榻。" },
      bedroom: { title: "主卧与衣帽间", text: "无把手衣柜、梳妆台，以及抽拉式首饰与配件抽屉。" },
      children: { title: "儿童房", text: "带收纳踏步的上床、抽拉储物与书桌，为成长预留空间。" },
      bathroom: { title: "卫生间", text: "木纹浴室柜以圆形开孔柜门隐藏洗衣机。" },
      entry: { title: "玄关与过道", text: "隐形门、弧形墙与收纳柜，读起来是一整面连续的表面。" },
    },
    filmsLabel: "影像",
    filmsTitle: "动态里，看得更近。",
    filmsLead: "来自完工住宅的短片：收纳、玻璃、光线与墙板。",
    reels: ["从容收纳", "玻璃细节", "光与景", "墙板细节"],
    ctaTitle: "你的家，一体成就。",
    ctaLead: "发送户型图、需要的产品和材质方向，开启进一步讨论。",
  },
  about: {
    eyebrow: "ABOUT CIRMANO",
    title: "Made As One. 为完整的家而造。",
    lead: "CIRMANO 立足中国佛山，是一家专注于别墅与高端住宅的一体化全屋定制制造商。产品涵盖橱柜、衣柜、室内门、墙板及铝玻系统，将设计深化、材料选择、制造与项目服务相互衔接，为客户提供兼顾美学、功能与预算的定制方案。",
    heroAlt: "广州住宅茶室：带灯橡木格架与白色平板柜体",
    storyLabel: "品牌",
    storyTitle: "木作与铝玻，一套规划。",
    storyLead: "依托佛山成熟的制造与配套资源，CIRMANO 通过木作与铝玻专业工厂协同，将不同产品纳入统一的设计与制造规划。从柜体布局到门墙衔接，从饰面搭配到五金配置，我们关注每个部分的独立功能，也重视它们在完整空间中的协调关系。",
    pillars: ["橱柜", "衣柜与收纳", "室内门", "墙板与装饰线条", "铝玻系统"],
    principlesLabel: "Made As One",
    principlesTitle: "Made As One，对一个家意味着什么。",
    principlesLead: "一个家的统一感，来自材质、比例、色彩与细节之间的自然呼应。我们从客户的生活习惯与空间需求出发，让不同房间各有用途，又共享一套连贯的设计语言。",
    principles: [
      { kicker: "01", title: "直接对接源头工厂", text: "与生产你订单的团队直接沟通，减少中间环节。" },
      { kicker: "02", title: "全屋产品协同规划", text: "柜体、门与墙面系统，作为同一套全屋方案一起规划。" },
      { kicker: "03", title: "出厂前检查", text: "生产前技术审图，出货前对柜体检查与试装。" },
      { kicker: "04", title: "设计至交付后支持", text: "一支团队，从最初需求跟进到交付后的支持。" },
    ],
    serveLabel: "我们服务",
    serveTitle: "为在意细节的人。",
    serve: ["别墅与高端住宅业主", "室内设计师与建筑师", "建筑商与装修承包商", "住宅开发商"],
    buildLabel: "制造",
    buildTitle: "制造，让设计得以落实。",
    buildLead: "我们结合德国 HOMAG 设备、生产前技术审图、过程检查与柜体试装，逐步核查图纸、加工和部件配合。通过材料与五金的合理匹配，以及与制造端的直接沟通，让品质要求和项目预算得到充分考虑。",
    buildCta: "了解我们如何制造",
    supportLabel: "服务",
    supportTitle: "一支陪伴项目的团队。",
    supportLead: "从最初的需求沟通，到设计、选材、生产和交付支持，项目经理、设计师、方案经理与交付经理协同推进。我们希望以清晰的沟通、专业的制造和持续的服务，帮助客户将理想中的空间转化为日常生活中的家。",
    supportCta: "了解服务如何运作",
    teamLabel: "团队",
    teamTitle: "中国 · 佛山。",
    teamLead: "设计深化与制造在同一处进行，让图纸、材料与细节保持在同一场对话里。",
    closing: ["CIRMANO · Made As One.", "让每一部分，共同成就完整的家。"],
    creditsLabel: "致谢",
    credits: [
      "字体：Manrope（SIL Open Font License）。",
      "界面动效：React Bits，David Haz（MIT + Commons Clause）。",
      "预览漫游基于 Samnang Aing 的 Casa Serra；材质来自 Poly Haven（CC0）。",
      "影片音乐：Scott Buckley《Sleep》（CC BY 4.0）。",
    ],
    ctaTitle: "一起打造完整的居住空间。",
    ctaLead: "业主、设计师与项目合作方：发送你的项目，我们开启对话。",
  },
  contact: {
    eyebrow: "CIRMANO / 联系",
    title: "让我们沟通你的项目。",
    lead: "发送户型图、需要的产品和材质方向，开启进一步讨论。",
    directLabel: "直接联系",
    whatsapp: "WhatsApp",
    email: "邮箱",
    phone: "电话",
    address: "地址",
    follow: "关注",
    formLabel: "项目咨询",
    formTitle: "告诉我们这个家。",
    formLead: "姓名、邮箱、国家或地区、项目类型、需要的产品与项目说明。户型图可选，但会很有帮助。",
    stepsLabel: "接下来",
    steps: [
      { title: "阅读你的需求", text: "图纸、产品与材质方向。" },
      { title: "沟通范围", text: "产品系统、饰面与制造范围。" },
      { title: "深化方案", text: "围绕确认的范围与规格。" },
    ],
  },
};

const fallback = (c: PageCopy): PageCopy => ({ ...c, common: { ...c.common, draftNote: "Translation in preparation." } });

// Until the rest of these pages is translated, de / fr / ar reuse the English copy, but the manufacturing hero
// (title and lead) has its own wording in each language.
const withHero = (base: PageCopy, hero: { title: string; lead: string }): PageCopy => ({
  ...base,
  manufacturing: { ...base.manufacturing, title: hero.title, lead: hero.lead },
});

export const pageCopy: Record<Locale, PageCopy> = {
  en,
  zh,
  de: withHero(fallback(en), {
    title: "Deutsche Qualität. Direkt ab Werk.",
    lead: "Deutsche HOMAG-Technik, sorgfältige Verarbeitung und strenge Kontrollen. Hochwertige OEM-Fertigung zu wettbewerbsfähigen Werkspreisen. Platten, Oberflächen, Beschläge und Beleuchtung, passend zu Ihrem Design und Budget.",
  }),
  fr: withHero(fallback(en), {
    title: "Qualité allemande. Valeur directe d'usine.",
    lead: "Équipement HOMAG allemand, savoir-faire soigné et contrôles rigoureux. Fabrication OEM haut de gamme à prix d’usine compétitifs. Panneaux, finitions, quincaillerie et éclairage adaptés à votre design et à votre budget.",
  }),
  ar: withHero(fallback(en), {
    title: "جودة ألمانية. قيمة مباشرة من المصنع.",
    lead: "معدات HOMAG الألمانية وحرفية دقيقة وفحوص صارمة. تصنيع OEM عالي المستوى بأسعار المصنع التنافسية. ألواح وتشطيبات وإكسسوارات وإضاءة تناسب تصميمك وميزانيتك.",
  }),
};

// Service-page copy for de / fr / ar (drafts, pending CIRMANO review), applied on top of the English fallback.
const serviceCopy = (base: PageCopy, svc: { title: string; lead: string; promises: string[]; heroAlt: string; alts: string[] }): PageCopy => ({
  ...base,
  service: {
    ...base.service,
    title: svc.title,
    lead: svc.lead,
    promises: svc.promises,
    heroAlt: svc.heroAlt,
    steps: base.service.steps.map((step, i) => ({ ...step, alt: svc.alts[i] })),
  },
});

pageCopy.de = serviceCopy(pageCopy.de, {
  title: "Maßgefertigte Schränke, vom Entwurf bis zur Lieferung",
  lead: "CIRMANO entwirft und fertigt maßgefertigte Küchenschränke, Kleiderschränke, Einbauschränke und Innentüren mit Glaseinsatz. Wir begleiten Sie in jedem Schritt – von der Planung, die zu Ihrem Raum passt, bis zur internationalen Lieferung.",
  promises: ["Kostenlose 3D-Planung der Schränke", "Materialien, Oberflächen & Beschläge", "Fertigung und Qualitätsprüfung", "Exportverpackung & internationaler Versand"],
  heroAlt: "Designer und Kunde prüfen Schrankzeichnungen in einer Maßküche",
  alts: [
    "Kunde betrachtet Schrank- und Kleiderschrankmuster im Showroom",
    "Designer und Kunde prüfen Grundriss und Zeichnungen auf dem Tisch",
    "Holzfurniere, Türmuster und Beschläge auf einem Tisch ausgelegt",
    "Mitarbeiter prüft eine Reihe montierter Schränke in der Fabrik",
    "Verpackte Schrankteile bereit zum Verladen und Versand",
    "Monteur gleicht die Schränke mit den Zeichnungen auf dem Tablet ab und prüft mit der Wasserwaage",
  ],
});

pageCopy.fr = serviceCopy(pageCopy.fr, {
  title: "Mobilier sur mesure, de la conception à la livraison",
  lead: "CIRMANO conçoit et fabrique des cuisines, dressings, rangements intégrés et portes intérieures vitrées sur mesure. Nous vous accompagnons à chaque étape, de la planification adaptée à votre espace jusqu’à la livraison internationale.",
  promises: ["Conception 3D gratuite des meubles", "Matériaux, finitions et quincaillerie", "Fabrication et contrôle qualité", "Emballage export et expédition internationale"],
  heroAlt: "Designer et client examinant les plans de meubles dans une cuisine sur mesure",
  alts: [
    "Client examinant des échantillons de meubles et de dressings dans le showroom",
    "Designer et client examinant un plan et des dessins d’agencement sur une table",
    "Placages bois, échantillons de portes et quincaillerie disposés sur une table",
    "Ouvrier contrôlant une série de meubles assemblés dans l’usine",
    "Éléments de meubles emballés, prêts pour le chargement et l’expédition",
    "Installateur vérifiant les meubles sur les plans affichés sur une tablette, avec un niveau à bulle",
  ],
});

pageCopy.ar = serviceCopy(pageCopy.ar, {
  title: "خزائن مفصّلة، من التصميم حتى التسليم",
  lead: "تصمم CIRMANO وتصنع خزائن المطبخ والخزائن المفصّلة وأنظمة التخزين المدمجة والأبواب الداخلية الزجاجية حسب الطلب. نرافقك في كل خطوة، من تخطيط ما يناسب مساحتك حتى ترتيب التسليم الدولي.",
  promises: ["تصميم ثلاثي الأبعاد مجاني للخزائن", "المواد والتشطيبات والإكسسوارات", "التصنيع المباشر من المصنع مع فحص الجودة", "التغليف للتصدير والشحن الدولي"],
  heroAlt: "مصمم وعميل يراجعان مخططات الخزائن في مطبخ مفصّل",
  alts: [
    "عميل يتفقد عينات الخزائن والدواليب في صالة العرض",
    "مصمم وعميل يراجعان المخطط ورسومات التوزيع على الطاولة",
    "قطع الخشب والأبواب والإكسسوارات معروضة على الطاولة",
    "عامل يفحص صفاً من الخزائن المجمّعة داخل المصنع",
    "أجزاء الخزائن المغلّفة جاهزة للتحميل والشحن",
    "فني تركيب يقارن الخزائن بالرسومات على جهاز لوحي باستخدام ميزان المياه",
  ],
});
