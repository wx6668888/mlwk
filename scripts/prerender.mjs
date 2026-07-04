import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "../dist-server/entry-server.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const template = await readFile(join(dist, "index.html"), "utf8");
const locales = ["en", "ar", "zh", "de", "fr"];
const collectionSlugs = [
  "kitchens",
  "wardrobes",
  "vanities",
  "wall-panels",
  "interior-doors",
  "bespoke-built-ins",
];
const solutionSlugs = ["residential", "hospitality", "commercial"];
const productSlugs = [
  "linear-brass-pull",
  "loop-pull-pair",
  "flush-edge-pull",
  "concealed-hinge-set",
  "soft-close-runner",
  "wardrobe-rail-kit",
  "leather-valet-tray",
  "jewellery-drawer-insert",
  "led-shelf-profile",
  "floating-shelf-kit",
  "finish-sample-box",
  "door-lever-set",
];
const baseRoutes = [
  "",
  "collections",
  ...collectionSlugs.map((slug) => `collections/${slug}`),
  "solutions",
  ...solutionSlugs.map((slug) => `solutions/${slug}`),
  "projects",
  "capabilities",
  "company",
  "designer",
  "resources",
  "quote",
  "shop",
  ...productSlugs.map((slug) => `shop/${slug}`),
  "cart",
  "checkout",
  "login",
  "auth/callback",
  "account/projects",
  "account/orders",
  "account/addresses",
  "account/favorites",
  "admin/projects",
  "order/preview/confirmation",
  "privacy",
  "terms",
  "shipping",
  "returns",
];
const noIndexSections = new Set([
  "cart",
  "checkout",
  "login",
  "auth",
  "account",
  "order",
  "admin",
]);

const titles = {
  "": "Crafted Interiors, Delivered Worldwide",
  collections: "Made-to-order Millwork Collections",
  solutions: "Project Solutions",
  projects: "Verified Projects",
  capabilities: "Millwork Capabilities",
  company: "About MLWK",
  designer: "3D Design Studio",
  resources: "Millwork Resources",
  quote: "Send Your Drawings",
  shop: "MLWK Standard Objects",
  privacy: "Privacy",
  terms: "Terms",
  shipping: "Shipping and Duties",
  returns: "Returns and Refunds",
};

function metadata(route) {
  const section = route.split("/")[0];
  const detail = route.split("/")[1];
  const name = detail
    ? detail
        .split("-")
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join(" ")
    : titles[section] ?? "Architectural Millwork";
  return {
    title: `${name} — MLWK`,
    description: detail
      ? `${name} by MLWK, developed with considered materials, precise detailing and international project delivery in mind.`
      : "Made-to-order architectural millwork and custom cabinetry, developed from project drawings and prepared for international delivery.",
  };
}

const sitemap = [];

for (const locale of locales) {
  for (const route of baseRoutes) {
    const urlPath = `/${locale}/${route}${route ? "/" : ""}`;
    const canonical = `https://mlwk.space${urlPath}`;
    const meta = metadata(route);
    const robots = noIndexSections.has(route.split("/")[0])
      ? "noindex, nofollow"
      : "index, follow";
    const alternates = locales
      .map(
        (item) =>
          `<link rel="alternate" hreflang="${item}" href="https://mlwk.space/${item}/${route}${route ? "/" : ""}" />`,
      )
      .join("\n    ");
    const html = template
      .replace(
        '<html lang="en">',
        `<html lang="${locale}" dir="${locale === "ar" ? "rtl" : "ltr"}">`,
      )
      .replace("<!--app-html-->", render(urlPath))
      .replaceAll("__MLWK_TITLE__", meta.title)
      .replaceAll("__MLWK_DESCRIPTION__", meta.description)
      .replaceAll("__MLWK_ROBOTS__", robots)
      .replaceAll("__MLWK_CANONICAL__", canonical)
      .replace("<!--mlwk-hreflang-->", alternates);
    const target = join(dist, locale, route, "index.html");
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, html);
    if (robots === "index, follow") {
      sitemap.push(`<url><loc>${canonical}</loc></url>`);
    }
  }
}

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap.join("\n")}
</urlset>
`;
await writeFile(join(dist, "sitemap.xml"), sitemapXml);

const rootHtml = template
  .replace("<!--app-html-->", render("/en/"))
  .replaceAll("__MLWK_TITLE__", "MLWK — Millwork, Made to Order")
  .replaceAll(
    "__MLWK_DESCRIPTION__",
    "Made-to-order architectural millwork and custom cabinetry for global projects.",
  )
  .replaceAll("__MLWK_ROBOTS__", "index, follow")
  .replaceAll("__MLWK_CANONICAL__", "https://mlwk.space/en/")
  .replace("<!--mlwk-hreflang-->", "");
await writeFile(join(dist, "index.html"), rootHtml);

console.log(`Prerendered ${locales.length * baseRoutes.length} localized routes.`);
