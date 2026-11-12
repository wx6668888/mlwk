// Copies the Casa Serra walkthrough's runtime libraries into public/casa/vendor so the page
// loads them from our own origin (the site CSP only allows same-origin scripts).
// Versions are pinned in package.json to the ones the walkthrough was built against.
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import "./patch-casa-startup.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
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
