// Idempotent, guarded edits to the published Casa runtime. The readable startup
// implementation is public/casa/startup.js; this script only installs its hooks.
//
// public/casa/ is gitignored (unlicensed Casa Serra preview material, see .gitignore),
// so a CI build — which only has what the repository contains — has nothing to patch.
// The Casa hero is not mounted on any live route (App.tsx renders ManufacturingPage at
// the locale root), so a missing folder is a normal state, not a build failure.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const casaIndex = join(root, "public/casa/index.html");
function patch(file, update) {
  const path = join(root, "public/casa", file);
  if (!existsSync(path)) return;
  const source = readFileSync(path, "utf8");
  const next = update(source);
  if (next !== source) writeFileSync(path, next);
}
function replace(source, from, to) {
  if (!source.includes(from)) throw new Error(`Casa startup hook missing: ${from.slice(0, 90)}`);
  return source.replace(from, to);
}
patch("index.html", (s) => {
  if (!s.includes('src="startup.js')) s = replace(s, '<script src="gate.js">', '<script src="startup.js"></script>\n  <script src="gate.js">');
  s = s.replace('src="gate.js"', 'src="capabilities.js"');
  // Prevent an old cached runtime from being mixed with the new startup bridge.
  return s.replace(/src="([^"?]+\.js)"/g, 'src="$1?startup=2"');
});
patch("shared/fx-experience.js", (s) => {
  if (s.includes("CIRMANO_STARTUP.upload")) return s;
  const start = s.indexOf("const i=new e.Loader(c,");
  const end = s.indexOf("ye=!0,gsap.ticker.add(_e)", start);
  if (start < 0 || end < 0) throw new Error("Casa GPU startup block changed");
  s = s.slice(0, start) +
    'const i=new e.Loader(c,(()=>window.CIRMANO_STARTUP.assets(i.done,i.total)));pe.loader=i;he=await o.build(pe);C();Y();S(_(0,v));await window.CIRMANO_STARTUP.upload(c,h,he.preload);await window.CIRMANO_STARTUP.compile(c,h,p);window.CIRMANO_STARTUP.phase("first-frame");await window.CIRMANO_STARTUP.pause();if(he.precompile)await he.precompile();window.CIRMANO_STARTUP.sceneFrame=true;' + s.slice(end);
  s = replace(s, 'console.error(e);const t=s("loader")', 'console.error(e);window.CIRMANO_STARTUP.fail(e.message||String(e));const t=s("loader")');
  // Compatibility keeps the same scene with smaller render buffers; no photographic fallback.
  s = replace(s, 'let c;try{if(c=new THREE.WebGLRenderer', 'if(window.CIRMANO_STARTUP.compat){i.maxOutDPR=1;i.maxRenderDPR=1;i.renderScale=.65;o.postOptions=Object.assign({},o.postOptions,{msaa:0,preMsaa:0})}let c;try{if(c=new THREE.WebGLRenderer');
  return s;
});
patch("shared/fx-core.js", (s) => {
  if (s.includes("CIRMANO_STARTUP.image")) return s;
  s = replace(s, 'this.tl.load(t,(t=>', 'window.CIRMANO_STARTUP.image(this.tl,t,(t=>');
  s = replace(s, 'r(t)}),void 0,n)', 'r(t)}),n)');
  s = replace(s, 'await(await fetch(t)).arrayBuffer()', 'await(await window.CIRMANO_STARTUP.fetch(t)).arrayBuffer()');
  return s;
});
patch("scene.js", (s) => {
  if (s.includes("async precompile()")) return s;
  const start = s.indexOf("precompile(){");
  const end = s.indexOf("}}},frame:", start);
  if (start < 0 || end < 0) throw new Error("Casa full-house warmup changed");
  // Preserve normal visibility/frustum culling. The previous warmup forced every
  // hidden object into a full-house draw, which could stall even a fast GPU.
  s = s.slice(0, start) + 'async precompile(){i.shadowMap.needsUpdate=!0;await window.CIRMANO_STARTUP.pause();o.post.render(n,o.camera,o.P);if(i.getContext().isContextLost())throw new Error("WebGL context lost on first frame");' + s.slice(end);
  s = replace(s, 't=matchMedia("(max-width: 760px), (pointer: coarse)").matches?', 't=(window.CIRMANO_STARTUP.compat||matchMedia("(max-width: 760px), (pointer: coarse)").matches)?');
  s = replace(s, 'Qe.shadow.mapSize.set(4096,4096)', 'Qe.shadow.mapSize.set(window.CIRMANO_STARTUP.compat?2048:4096,window.CIRMANO_STARTUP.compat?2048:4096)');
  return s;
});
console.log(
  existsSync(casaIndex)
    ? "Casa: staged startup hooks installed"
    : "Casa: public/casa absent (gitignored preview material) — startup hooks skipped",
);
