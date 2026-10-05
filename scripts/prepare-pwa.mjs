import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const html = await readFile(join(dist, "index.html"), "utf8");
const assets = [...new Set([...html.matchAll(/(?:src|href)="(\/assets\/[^"?]+\.(?:js|css))"/g)].map((match) => match[1]))];
if (!assets.length) throw new Error("No compiled app shell assets found.");

const hash = createHash("sha256");
const files = ["sw.js", "index.html", "offline.html", "site.webmanifest", ...assets.map((path) => path.slice(1))];
for (const name of await readdir(join(dist, "pwa"))) files.push(`pwa/${name}`);
for (const lang of ["en", "ar", "zh", "de", "fr"]) files.push(`${lang}/index.html`);
for (const name of ["index.html", "mlwk-entry.js", "mlwk-entry.css"]) files.push(`walkthrough/villa-c/${name}`);
for (const file of files.sort()) hash.update(file).update(await readFile(join(dist, file)));
const version = hash.digest("hex").slice(0, 16);
let worker = await readFile(join(dist, "sw.js"), "utf8");
if (!worker.includes("__MLWK_PWA_VERSION__") || !worker.includes("const APP_SHELL = []; // build:app-shell")) {
  throw new Error("Service worker build placeholders are missing.");
}
worker = worker.replace("__MLWK_PWA_VERSION__", version).replace("const APP_SHELL = []; // build:app-shell", `const APP_SHELL = ${JSON.stringify(assets)};`);
await writeFile(join(dist, "sw.js"), worker);
console.log(`Prepared MLWK PWA ${version}: ${assets.length} app shell assets; 3D files are network-only.`);
