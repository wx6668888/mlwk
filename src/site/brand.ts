// Facts that appear in more than one place. Source: brand pack 08_商务联系 (current business card)
// and the official social accounts confirmed by CIRMANO. Edit here, never inline.
export const brand = {
  name: "CIRMANO",
  nameZh: "西尔曼",
  slogan: "Made As One", // no full stop, three capitals
  descriptor: "Integrated Whole-Home Customization",
  email: "kai@cirmano.com",
  phoneDisplay: "+86 186 6638 4092",
  phoneHref: "tel:+8618666384092",
  whatsapp: "https://wa.me/8618666384092",
  address: [
    "No. 10, Chendong Industrial Zone, Chendong Village,",
    "Shishan Town, Nanhai District,",
    "Foshan, Guangdong, China",
  ],
  city: "Foshan, China",
  timeZone: "Asia/Shanghai",
  social: {
    instagram: "https://www.instagram.com/cirmanoofficial/",
    facebook: "https://www.facebook.com/cirmanoofficial",
  },
} as const;

// Company-reported figures (95% / 40,000+ m² / 180 staff) stay hidden until CIRMANO confirms them in writing.
export const SHOW_COMPANY_FIGURES = false;
