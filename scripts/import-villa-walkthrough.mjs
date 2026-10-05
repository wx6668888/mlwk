import { cp, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const sourceArgument = process.argv[2];
if (!sourceArgument) {
  throw new Error("Usage: node scripts/import-villa-walkthrough.mjs <villa-platform directory>");
}
const source = resolve(sourceArgument);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const destination = join(root, "public", "walkthrough", "villa-c");
if (source === destination) throw new Error("Source must be outside the imported scene directory.");

const entries = ["scene.js", "style.css", "geometry.json", "js", "assets", "vendor"];
await Promise.all(entries.map((name) => stat(join(source, name))));
const chromeToggle = `<button id="chromeToggle" class="quiet-button chrome-toggle" type="button" aria-label="Hide controls" aria-pressed="false">
          <svg class="hide-controls-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.5 5.5A11 11 0 0 1 12 5c5.5 0 9 7 9 7a17 17 0 0 1-3 3.8M6.2 6.2A17 17 0 0 0 3 12s3.5 7 9 7a11 11 0 0 0 5.8-1.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <svg class="show-controls-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/></svg>
          <span id="chromeToggleLabel">Hide controls</span>
        </button>`;
let html = await readFile(join(source, "index.html"), "utf8");
const exportButton = /<button id="exportModel"[^>]*><\/button>/;
if (!exportButton.test(html)) throw new Error("The source viewer's toolbar has changed; review the import adapter.");
html = html
  .replace("<title>Villa C · Murcia</title>", "<title>Villa C · MLWK</title>")
  .replace('<meta name="theme-color" content="#ecebe3" />', '<meta name="theme-color" content="#ecebe3" />\n    <link rel="manifest" href="/site.webmanifest" />\n    <link rel="apple-touch-icon" href="/pwa/apple-touch-icon.png" />\n    <meta name="apple-mobile-web-app-capable" content="yes" />\n    <meta name="apple-mobile-web-app-title" content="MLWK" />\n    <link rel="stylesheet" href="/pwa/shell.css" />\n    <script type="module" src="/pwa/shell.js"></script>')
  .replace('<link rel="stylesheet" href="./style.css" />', '<link rel="stylesheet" href="./style.css" />\n    <link rel="stylesheet" href="./mlwk-entry.css" />')
  .replace(exportButton, '<a id="mlwkBack" class="quiet-button mlwk-back" href="/en/" aria-label="Back to MLWK"><span aria-hidden="true">←</span> MLWK</a>')
  .replace('<div class="top-actions">', `<div class="top-actions">\n        ${chromeToggle}`)
  .replace('<p class="help-hint" data-i18n="help.hint"></p>', '<p class="help-hint" data-i18n="help.hint"></p>\n        <p><a id="modelCredits" href="./credits.html" target="_blank" rel="noopener">Credits</a></p>')
  .replace('<script type="module" src="./scene.js"></script>', '<script type="module" src="./mlwk-entry.js"></script>\n    <script type="module" src="./scene.js"></script>');
await mkdir(destination, { recursive: true });
for (const name of entries) {
  await cp(join(source, name), join(destination, name), { recursive: true });
}
await writeFile(join(destination, "index.html"), html);
const scene = await readFile(join(source, "scene.js"));
const sceneStat = await stat(join(source, "scene.js"));
await writeFile(join(destination, "source.json"), JSON.stringify({
  scene: "Villa C · Murcia",
  sourceModifiedAt: sceneStat.mtime.toISOString(),
  sceneSha256: createHash("sha256").update(scene).digest("hex"),
}, null, 2) + "\n");
console.log("Imported the static Villa C scene; source scene.js is unchanged.");
