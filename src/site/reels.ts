import type { Locale } from "../content";

// CIRMANO Facebook reels (captions from the posts). Cards link out; covers are the reels' own cover images,
// saved to public/media/reels/<id>.webp (540×960).
export type Reel = { id: string; en: string; zh: string; tags: ("visit" | "factory")[] };

export const reels: Reel[] = [
  { id: "4698828180440781", en: "Choosing finishes from samples", zh: "对照样板挑选饰面", tags: ["visit"] },
  { id: "2119515339439862", en: "Around the showroom table", zh: "展厅桌边的交流", tags: ["visit"] },
  { id: "1901849464523713", en: "Materials, durability and everyday use", zh: "聊材料、耐用与日常使用", tags: ["visit"] },
  { id: "1704677944416066", en: "Walking the factory floor with clients", zh: "与客户一起走进车间", tags: ["visit", "factory"] },
  { id: "1634915701622283", en: "The production process, step by step", zh: "一步一步看生产流程", tags: ["visit", "factory"] },
  { id: "1635133378115058", en: "Factory-direct, pre-assembled before shipment", zh: "源头工厂，出厂前预装", tags: ["factory"] },
];

export const reelCover = (id: string) => `/media/reels/${id}.webp`;
export const reelUrl = (id: string) => `https://www.facebook.com/reel/${id}`;
export const reelsFor = (tag: "visit" | "factory") => reels.filter((r) => r.tags.includes(tag));
export const reelTitle = (r: Reel, locale: Locale) => (locale === "zh" ? r.zh : r.en);
