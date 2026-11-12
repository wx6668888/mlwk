// Copies the Casa Serra walkthrough's runtime libraries into public/casa/vendor so the page
// loads them from our own origin (the site CSP only allows same-origin scripts).
// Versions are pinned in package.json to the ones the walkthrough was built against.
//
// public/casa/ itself is gitignored preview material, so a CI checkout does not have it.
// Nothing outside the preview hero uses it (App.tsx serves ManufacturingPage at the locale
// root), therefore a missing folder is skipped instead of failing the build.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const casaIndex = join(root, "public", "casa", "index.html");

if (!existsSync(casaIndex)) {
  console.log("prepare-casa: public/casa absent (gitignored preview material) — skipping");
} else {
  await import("./patch-casa-startup.mjs");
  const out = join(root, "public", "casa", "vendor");
  mkdirSync(out, { recursive: true });

  const files = [
    ["node_modules/three-casa/build/three.min.js", "three.min.js"],
    ["node_modules/gsap/dist/gsap.min.js", "gsap.min.js"],
    ["node_modules/gsap/dist/ScrollTrigger.min.js", "ScrollTrigger.min.js"],
    ["node_modules/lenis/dist/lenis.min.js", "lenis.min.js"],
  ];
  for (const [from, to] of files) copyFileSync(join(root, from), join(out, to));
  console.log(`prepare-casa: copied ${files.length} libraries to public/casa/vendor`);
}
