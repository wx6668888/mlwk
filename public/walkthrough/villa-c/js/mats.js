import * as THREE from 'three';
import { rng } from './builder.js';

export const M = {};
export const allMats = new Set();
const loader = new THREE.TextureLoader();
let manifest = {};
let aniso = 8;
export const progress = { done: 0, total: 0, onChange: null };
const bump = () => { progress.done++; progress.onChange?.(progress); };

let active = 0; const waiting = [];
export function throttle(fn) {
  return new Promise((res, rej) => {
    const run = () => { active++; fn().then(res, rej).finally(() => { active--; waiting.shift()?.(); }); };
    if (active < 8) run(); else waiting.push(run);
  });
}

function lt(url, srgb) {
  progress.total++;
  return throttle(() => loader.loadAsync(url)).then((t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = aniso;
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    bump();
    return t;
  });
}

/* ---------- shader patches ---------- */
const NOISE = `
float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y); }
float fbm(vec2 p){ float a=.5,s=0.; for(int i=0;i<4;i++){ s+=a*vn(p); p*=2.03; a*=.5; } return s; }
`;

/** Adds large-scale colour breakup (kills visible tiling) and optional rain/dust weathering. */
export function weather(m, { macro = 0.18, scale = 0.09, grime = 0, rough = 0.1, dust = 0 } = {}) {
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvWP=(modelMatrix*vec4(transformed,1.0)).xyz; vWN=normalize(mat3(modelMatrix)*objectNormal);');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;\n' + NOISE)
      .replace('#include <map_fragment>', `#include <map_fragment>
        {
          vec3 wn = normalize(vWN);
          vec2 mp = abs(wn.y) > .7 ? vWP.xz : vec2(vWP.x*abs(wn.z) + vWP.z*abs(wn.x), vWP.y);
          float mn = fbm(mp*${scale.toFixed(4)}) ;
          float mn2 = fbm(mp*${(scale * 4.1).toFixed(4)} + 11.0);
          diffuseColor.rgb *= 1.0 + (mn-0.5)*${macro.toFixed(3)}*2.0 + (mn2-0.5)*${(macro * 0.8).toFixed(3)};
          ${grime > 0 ? `
          float gy = 1.0 - smoothstep(0.0, 1.3, vWP.y);
          float gn = fbm(mp*vec2(1.7,0.9) + 7.0);
          diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb*vec3(0.70,0.64,0.54), clamp(gy*(0.35+gn*0.9),0.,1.)*${grime.toFixed(3)});
          float st = fbm(vec2(mp.x*5.5, mp.y*0.28) + 3.0);
          diffuseColor.rgb *= 1.0 - ${(grime * 0.30).toFixed(3)}*smoothstep(0.52,0.85,st)*(1.0-gy);
          ` : ''}
          ${dust > 0 ? `diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.76,0.66,0.50)*dot(diffuseColor.rgb,vec3(.33)), ${dust.toFixed(3)}*smoothstep(0.55,1.0,wn.y)*(0.5+mn));` : ''}
          vRoughShift = (mn-0.5)*${rough.toFixed(3)};
        }`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        roughnessFactor = clamp(roughnessFactor + vRoughShift, 0.04, 1.0);`)
      .replace('void main() {', 'float vRoughShift;\nvoid main() {');
  };
  m.customProgramCacheKey = () => `weather${macro}${scale}${grime}${rough}${dust}`;
  return m;
}

/* ---------- material constructors ---------- */
async function pbr(name, id, o = {}) {
  const b = `./assets/tex/${id}/`;
  const [map, nor, arm] = await Promise.all([lt(b + 'diff.jpg', true), lt(b + 'nor.jpg', false), lt(b + 'arm.jpg', false)]);
  const d = manifest[id] || { w: 1, h: 1 };
  const m = new THREE.MeshStandardMaterial({
    map, normalMap: nor, aoMap: arm, roughnessMap: arm,
    normalScale: new THREE.Vector2(o.normal ?? 1, o.normal ?? 1),
    aoMapIntensity: o.ao ?? 1, roughness: o.rough ?? 1, metalness: o.metal ?? 0,
    color: o.color ?? 0xffffff, envMapIntensity: 1,
  });
  if (o.metal) m.metalnessMap = arm;
  m.userData.tile = [d.w * (o.tile ?? 1), d.h * (o.tile ?? 1)];
  m.userData.interior = !!o.interior;
  m.name = name;
  if (o.weather) weather(m, o.weather);
  M[name] = m; allMats.add(m);
  return m;
}

function plain(name, params, o = {}) {
  const m = new THREE.MeshStandardMaterial({ envMapIntensity: 1, ...params });
  m.name = name; m.userData.interior = !!o.interior; if (o.tile) m.userData.tile = o.tile;
  M[name] = m; allMats.add(m); return m;
}

function physical(name, params, o = {}) {
  const m = new THREE.MeshPhysicalMaterial({ envMapIntensity: 1, ...params });
  m.name = name; m.userData.interior = !!o.interior; if (o.tile) m.userData.tile = o.tile;
  M[name] = m; allMats.add(m); return m;
}

function glass(name, { color = 0xcfe3e8, opacity = 0.16, rough = 0.02, envI = 1.5 } = {}) {
  const m = new THREE.MeshStandardMaterial({
    color, roughness: rough, metalness: 0, transparent: true, opacity, depthWrite: false,
    side: THREE.DoubleSide, envMapIntensity: envI,
  });
  m.blending = THREE.CustomBlending; m.blendEquation = THREE.AddEquation;
  m.blendSrc = THREE.OneFactor; m.blendDst = THREE.OneMinusSrcAlphaFactor;
  m.blendSrcAlpha = THREE.OneFactor; m.blendDstAlpha = THREE.OneMinusSrcAlphaFactor;
  m.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <opaque_fragment>',
      'gl_FragColor = vec4( totalDiffuse * diffuseColor.a + totalSpecular + totalEmissiveRadiance, diffuseColor.a );');
  };
  m.customProgramCacheKey = () => 'glassPremul';
  m.userData.noAO = true; m.name = name;
  M[name] = m; allMats.add(m); return m;
}

/* ---------- procedural textures ---------- */
export function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d'); draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = aniso;
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  return t;
}

function heightToNormal(heightCanvas, strength = 3) {
  const w = heightCanvas.width, h = heightCanvas.height;
  const src = heightCanvas.getContext('2d').getImageData(0, 0, w, h).data;
  const out = document.createElement('canvas'); out.width = w; out.height = h;
  const octx = out.getContext('2d'); const img = octx.createImageData(w, h);
  const H = (x, y) => src[(((y + h) % h) * w + ((x + w) % w)) * 4] / 255;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = (H(x + 1, y) - H(x - 1, y)) * strength, dy = (H(x, y + 1) - H(x, y - 1)) * strength;
    const l = Math.hypot(dx, dy, 1);
    const i = (y * w + x) * 4;
    img.data[i] = (-dx / l * 0.5 + 0.5) * 255; img.data[i + 1] = (dy / l * 0.5 + 0.5) * 255; img.data[i + 2] = (1 / l * 0.5 + 0.5) * 255; img.data[i + 3] = 255;
  }
  octx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(out);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = aniso; t.colorSpace = THREE.NoColorSpace;
  return t;
}

/** Ceramic tile atlas: cols x rows tiles per texture, with tinted tiles, grout and bevelled normal. */
function tileSet({ cols, rows, size = 1024, grout = 0.012, base = [226, 222, 214], vary = 7, groutCol = [150, 147, 140], seed = 3, rough = 0.2, gloss = true }) {
  const R = rng(seed); const W = size, Hh = Math.round(size * (rows / cols) * (cols / rows));
  const tw = W / cols, th = Hh / rows, g = Math.max(2, grout * W / cols * cols);
  const tiles = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) tiles.push((R() - 0.5) * vary * 2);
  const mapC = canvasTex(W, Hh, (ctx) => {
    ctx.fillStyle = `rgb(${groutCol})`; ctx.fillRect(0, 0, W, Hh);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const v = tiles[j * cols + i];
      ctx.fillStyle = `rgb(${base.map((c) => Math.max(0, Math.min(255, c + v))).join(',')})`;
      ctx.fillRect(i * tw + g / 2, j * th + g / 2, tw - g, th - g);
      const gr = ctx.createLinearGradient(i * tw, j * th, (i + 1) * tw, (j + 1) * th);
      gr.addColorStop(0, 'rgba(255,255,255,0.05)'); gr.addColorStop(1, 'rgba(0,0,0,0.05)');
      ctx.fillStyle = gr; ctx.fillRect(i * tw + g / 2, j * th + g / 2, tw - g, th - g);
    }
    const id = ctx.getImageData(0, 0, W, Hh); const d = id.data;
    for (let k = 0; k < d.length; k += 4) { const n = (R() - 0.5) * 5; d[k] += n; d[k + 1] += n; d[k + 2] += n; }
    ctx.putImageData(id, 0, 0);
  });
  const hc = document.createElement('canvas'); hc.width = W; hc.height = Hh; const hx = hc.getContext('2d');
  hx.fillStyle = '#000'; hx.fillRect(0, 0, W, Hh); hx.filter = 'blur(2px)'; hx.fillStyle = '#fff';
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) hx.fillRect(i * tw + g / 2 + 1, j * th + g / 2 + 1, tw - g - 2, th - g - 2);
  const nrm = heightToNormal(hc, 2.2);
  const rc = canvasTex(W, Hh, (ctx) => {
    const v = Math.round(rough * 255); ctx.fillStyle = `rgb(0,${v},0)`; ctx.fillRect(0, 0, W, Hh);
    ctx.fillStyle = 'rgb(0,235,0)';
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      ctx.fillRect(i * tw, j * th, tw, g / 2 + 1); ctx.fillRect(i * tw, j * th, g / 2 + 1, th);
    }
  }, false);
  return { map: mapC, normalMap: nrm, roughnessMap: rc, w: cols, h: rows };
}

function veinedStone({ size = 768, base = [244, 242, 238], vein = [120, 118, 116], seed = 9, density = 0.5 }) {
  const R = rng(seed); const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d'); ctx.fillStyle = `rgb(${base})`; ctx.fillRect(0, 0, size, size);
  const id = ctx.getImageData(0, 0, size, size); const d = id.data;
  const ph = [R() * 99, R() * 99, R() * 99];
  const n = (x, y) => { const a = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return a - Math.floor(a); };
  const vnoise = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi; const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); return (n(xi, yi) * (1 - u) + n(xi + 1, yi) * u) * (1 - v) + (n(xi, yi + 1) * (1 - u) + n(xi + 1, yi + 1) * u) * v; };
  const fb = (x, y) => { let s = 0, a = 0.5; for (let i = 0; i < 5; i++) { s += a * vnoise(x, y); x *= 2.1; y *= 2.1; a *= 0.5; } return s; };
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const fx = x / size * 4 + ph[0], fy = y / size * 4 + ph[1];
    const w = fb(fx + fb(fx * 0.7, fy * 0.7 + ph[2]) * 2.0, fy + fb(fx * 0.9 + 5, fy * 0.9) * 2.0);
    const line = Math.abs(w - 0.5); const v = Math.max(0, 1 - line * (14 / (0.4 + density)));
    const a = Math.pow(v, 3) * 0.55 + (fb(fx * 3, fy * 3) - 0.5) * 0.06;
    const i = (y * size + x) * 4;
    for (let k = 0; k < 3; k++) d[i + k] = Math.max(0, Math.min(255, base[k] * (1 - a) + vein[k] * a));
  }
  ctx.putImageData(id, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = aniso; t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function rugTexture(seed = 5, pal = { bg: '#cdbba0', a: '#8c6b4b', b: '#e9dfcd', c: '#5d6d6a' }) {
  const R = rng(seed);
  return canvasTex(1024, 1536, (ctx, w, h) => {
    ctx.fillStyle = pal.bg; ctx.fillRect(0, 0, w, h);
    // weave noise
    for (let i = 0; i < 90000; i++) { ctx.fillStyle = `rgba(${R() > .5 ? '255,255,255' : '0,0,0'},${R() * 0.06})`; ctx.fillRect(R() * w, R() * h, 2 + R() * 6, 1.5); }
    const border = (inset, wd, col) => { ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.strokeRect(inset, inset, w - inset * 2, h - inset * 2); };
    border(40, 26, pal.a); border(92, 8, pal.b); border(120, 3, pal.c);
    ctx.save(); ctx.translate(w / 2, h / 2);
    for (let k = 0; k < 4; k++) {
      const s = 1 - k * 0.2; ctx.fillStyle = [pal.a, pal.b, pal.c, pal.a][k];
      ctx.beginPath(); ctx.moveTo(0, -h * 0.34 * s); ctx.lineTo(w * 0.34 * s, 0); ctx.lineTo(0, h * 0.34 * s); ctx.lineTo(-w * 0.34 * s, 0); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    ctx.strokeStyle = pal.a; ctx.lineWidth = 3;
    for (let y = 190; y < h - 190; y += 44) for (let x = 190; x < w - 190; x += 44) {
      if (Math.hypot(x - w / 2, (y - h / 2) * 0.66) < 380) continue;
      ctx.beginPath(); ctx.moveTo(x, y - 9); ctx.lineTo(x + 9, y); ctx.lineTo(x, y + 9); ctx.lineTo(x - 9, y); ctx.closePath(); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(0,0,0,0.04)'; for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
  });
}

export function artTexture(seed = 1, kind = 0) {
  const R = rng(seed * 77 + 3);
  const pals = [
    ['#e8dccb', '#c58f5d', '#8d6b50', '#33423f', '#d9b36a'],
    ['#ece6dc', '#7e9aa0', '#c8c2b3', '#43545c', '#b9744f'],
    ['#efe7da', '#a45a3e', '#d7b27c', '#6b6a4f', '#2f3a38'],
  ][kind % 3];
  return canvasTex(768, 1024, (ctx, w, h) => {
    ctx.fillStyle = pals[0]; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 7; i++) {
      ctx.globalAlpha = 0.55 + R() * 0.4; ctx.fillStyle = pals[1 + Math.floor(R() * 4)];
      ctx.beginPath(); const cx = R() * w, cy = R() * h, r = 80 + R() * 280;
      for (let a = 0; a <= 6.3; a += 0.3) { const rr = r * (0.7 + 0.3 * Math.sin(a * 3 + i)); ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.8); }
      ctx.fill();
    }
    ctx.globalAlpha = 1; ctx.strokeStyle = pals[4]; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(60, h * 0.7); ctx.bezierCurveTo(w * .3, h * .5, w * .6, h * .85, w - 60, h * .55); ctx.stroke();
    const id = ctx.getImageData(0, 0, w, h); for (let k = 0; k < id.data.length; k += 4) { const n = (R() - 0.5) * 12; id.data[k] += n; id.data[k + 1] += n; id.data[k + 2] += n; } ctx.putImageData(id, 0, 0);
  });
}

function tvScreenTexture() {
  return canvasTex(1024, 576, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#0b0e12'); g.addColorStop(1, '#161a1f');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const g2 = ctx.createLinearGradient(0, 0, w * 0.7, h); g2.addColorStop(0, 'rgba(255,255,255,0.07)'); g2.addColorStop(0.5, 'rgba(255,255,255,0)'); ctx.fillStyle = g2; ctx.fillRect(0, 0, w, h);
  });
}

/** Procedural date-palm trunk: scar diamonds from cut frond bases. */
export function palmTrunkTextures() {
  const R = rng(21); const W = 512, H = 1024;
  const hc = document.createElement('canvas'); hc.width = W; hc.height = H; const hx = hc.getContext('2d');
  hx.fillStyle = '#6a6a6a'; hx.fillRect(0, 0, W, H);
  const rowsN = 26, colsN = 6;
  for (let j = -1; j <= rowsN; j++) for (let i = 0; i < colsN; i++) {
    const cx = (i + (j % 2) * 0.5) * W / colsN + (R() - 0.5) * 8, cy = j * H / rowsN + (R() - 0.5) * 8;
    const rx = W / colsN * 0.55, ry = H / rowsN * 0.9;
    hx.fillStyle = `rgb(${190 + R() * 50},${190 + R() * 50},${190 + R() * 50})`;
    hx.beginPath(); hx.ellipse(cx, cy, rx * (0.8 + R() * 0.3), ry * (0.75 + R() * 0.3), (R() - 0.5) * 0.25, 0, Math.PI * 2); hx.fill();
    hx.strokeStyle = '#2a2a2a'; hx.lineWidth = 3; hx.stroke();
  }
  const dc = canvasTex(W, H, (ctx) => {
    ctx.drawImage(hc, 0, 0);
    const id = ctx.getImageData(0, 0, W, H); const d = id.data;
    for (let k = 0; k < d.length; k += 4) {
      const h = d[k] / 255; const n = (R() - 0.5) * 18;
      d[k] = 60 + h * 62 + n; d[k + 1] = 46 + h * 46 + n * 0.9; d[k + 2] = 32 + h * 30 + n * 0.8;
    }
    ctx.putImageData(id, 0, 0);
    ctx.globalAlpha = 0.5; for (let i = 0; i < 400; i++) { ctx.fillStyle = `rgba(${R() > .5 ? '30,22,14' : '170,140,100'},.15)`; ctx.fillRect(R() * W, R() * H, 1 + R() * 3, 10 + R() * 40); }
  });
  const nrm = heightToNormal(hc, 5);
  return { map: dc, normalMap: nrm };
}

export function setAniso(n) { aniso = n; }

/* ---------- style support: swap PBR texture sets in place, keeping physical texel size ---------- */
const texSets = new Map();
export function texSet(id) {
  if (!texSets.has(id)) {
    const b = `./assets/tex/${id}/`;
    texSets.set(id, Promise.all([lt(b + 'diff.jpg', true), lt(b + 'nor.jpg', false), lt(b + 'arm.jpg', false)])
      .then(([map, nor, arm]) => ({ map, nor, arm, dim: manifest[id] || { w: 1, h: 1 }, clones: new Map() })));
  }
  return texSets.get(id);
}
/** Point m at texture set `set`. UVs were baked from m.userData.tile, so scale texture repeat to keep the new set's real-world size. */
export function useTexSet(m, set, tile = 1) {
  const [tw, th] = m.userData.tile || [1, 1];
  const key = `${m.uuid}`;
  let c = set.clones.get(key);
  if (!c) {
    const rep = (t) => { const x = t.clone(); x.repeat.set(tw / (set.dim.w * tile), th / (set.dim.h * tile)); x.needsUpdate = true; return x; };
    c = { map: rep(set.map), nor: rep(set.nor), arm: rep(set.arm) };
    set.clones.set(key, c);
  }
  m.map = c.map; m.normalMap = c.nor; m.aoMap = c.arm; m.roughnessMap = c.arm;
  if (m.metalnessMap) m.metalnessMap = c.arm;
  m.needsUpdate = true;
}

/* ---------- build the whole library ---------- */
export async function buildMaterials(renderer) {
  aniso = Math.min(12, renderer.capabilities.getMaxAnisotropy());
  manifest = await (await fetch('./assets/tex/manifest.json')).json();
  const W = { macro: 0.16, scale: 0.11, grime: 0.55, rough: 0.12 };

  await Promise.all([
    // exterior walls: textured paint
    pbr('stucco', 'white_stucco', { color: 0xf1ece2, normal: 1.4, rough: 1, weather: W }),
    pbr('stuccoGrey', 'white_stucco', { color: 0x8f9392, normal: 1.4, weather: W }),
    pbr('stuccoYellow', 'white_stucco', { color: 0xe6b92a, normal: 1.4, weather: { ...W, grime: 0.35 } }),
    pbr('stuccoBeige', 'white_stucco', { color: 0xe6d8bd, normal: 1.4, weather: W }),
    pbr('stuccoSand', 'white_stucco', { color: 0xd9c4a0, normal: 1.4, weather: W }),
    pbr('concrete', 'concrete_wall_009', { color: 0xcfcac0, weather: { ...W, grime: 0.7 } }),
    pbr('kerb', 'concrete_wall_008', { color: 0xc3beb3, weather: { ...W, grime: 0.9 } }),
    pbr('asphalt', 'asphalt_01', { color: 0x8e8d8a, tile: 1.6, normal: 1.3, weather: { macro: 0.35, scale: 0.05, rough: 0.2 } }),
    pbr('pavers', 'pavement_04', { color: 0xd6cfc3, weather: { macro: 0.3, scale: 0.12, grime: 0.15, rough: 0.2 } }),
    pbr('sand', 'dense_sand', { color: 0xd8c7a1, tile: 3.5, normal: 1.5, weather: { macro: 0.4, scale: 0.03, rough: 0.1 } }),
    pbr('gravel', 'gravelly_sand', { color: 0xcbb994, tile: 1.6, weather: { macro: 0.3, scale: 0.08 } }),
    pbr('lawn', 'sparse_grass', { color: 0x9aae58, tile: 1.1, normal: 1.6, weather: { macro: 0.45, scale: 0.15, rough: 0.1 } }),
    pbr('terraceTile', 'granite_tile_04', { color: 0xdad1c1, weather: { macro: 0.18, scale: 0.15, rough: 0.1, dust: 0.1 } }),
    pbr('courtTile', 'patio_tiles', { color: 0xe3d6c2, weather: { macro: 0.2, scale: 0.15, rough: 0.1, dust: 0.1 } }),
    pbr('stoneStep', 'granite_tile_03', { color: 0xd2c7b5, weather: { macro: 0.15, scale: 0.2 } }),
    pbr('shutter', 'painted_metal_shutter', { color: 0xc9cdcd, metal: 0.6, normal: 1.2, rough: 1 }),
    // interior
    pbr('paint', 'beige_wall_001', { color: 0xf1ebdf, normal: 0.7, interior: true, rough: 1 }),
    pbr('paintAccent', 'beige_wall_001', { color: 0xcdb592, normal: 0.7, interior: true }),
    pbr('ceilingPaint', 'beige_wall_001', { color: 0xfaf8f3, normal: 0.5, interior: true }),
    pbr('marble', 'marble_01', { color: 0xf4eadb, tile: 1, rough: 0.62, interior: true }),
    pbr('woodFloor', 'laminate_floor_02', { color: 0xffffff, interior: true, rough: 0.9 }),
    pbr('bathFloor', 'granite_tile_03', { color: 0xbfb9ad, interior: true, rough: 0.8 }),
    pbr('doorWood', 'oak_veneer_01', { color: 0xe6d3b5, interior: true, rough: 0.85 }),
    pbr('walnut', 'walnut_veneer', { color: 0xd9bfa2, interior: true, rough: 0.8 }),
    pbr('oakLight', 'white_oak_veneer', { color: 0xf2e6d3, interior: true, rough: 0.8, tile: 1 }),
    pbr('fabricCream', 'rough_linen', { color: 0xe6dcc9, interior: true, tile: 2.2, normal: 1.2 }),
    pbr('fabricSand', 'rough_linen', { color: 0xc4ac88, interior: true, tile: 2.2, normal: 1.2 }),
    pbr('fabricGrey', 'rough_linen', { color: 0x8c8983, interior: true, tile: 2.2, normal: 1.2 }),
    pbr('fabricTeal', 'rough_linen', { color: 0x4d6b6a, interior: true, tile: 2.2, normal: 1.2 }),
    pbr('fabricRust', 'rough_linen', { color: 0xa5593b, interior: true, tile: 2.2, normal: 1.2 }),
    pbr('leatherTan', 'leather_white', { color: 0xb07b4c, interior: true, rough: 0.8, tile: 2.5 }),
    pbr('curtain', 'rough_linen', { color: 0xf3eee4, interior: true, tile: 1.4, normal: 0.8 }),
  ]);

  // tinted tile sets (bath wall 20x60, bath floor 60x60, kitchen back-splash)
  const wt = tileSet({ cols: 6, rows: 2, size: 1024, base: [233, 229, 220], vary: 4, groutCol: [190, 186, 178], seed: 4, rough: 0.14 });
  [wt.map, wt.normalMap, wt.roughnessMap].forEach((t) => { t.repeat.set(1, 1); });
  const wallTile = new THREE.MeshStandardMaterial({ map: wt.map, normalMap: wt.normalMap, roughnessMap: wt.roughnessMap, roughness: 1, envMapIntensity: 1 });
  wallTile.userData.tile = [1.2, 1.2]; wallTile.userData.interior = true; wallTile.name = 'wallTile'; M.wallTile = wallTile; allMats.add(wallTile);

  const marbleTex = veinedStone({ size: 1024, density: 0.7 });
  physical('quartz', { map: marbleTex, roughness: 0.14, clearcoat: 0.4, clearcoatRoughness: 0.1 }, { interior: true, tile: [2.4, 2.4] });
  const marbleTex2 = veinedStone({ size: 1024, base: [38, 38, 40], vein: [190, 180, 160], seed: 14, density: 0.5 });
  physical('blackMarble', { map: marbleTex2, roughness: 0.1, clearcoat: 0.5, clearcoatRoughness: 0.08 }, { interior: true, tile: [2.0, 2.0] });

  const rug1 = rugTexture(5); const rug2 = rugTexture(8, { bg: '#d8d0c0', a: '#4f6a68', b: '#efe9dc', c: '#a8764f' });
  plain('rug', { map: rug1, roughness: 1, color: 0xffffff }, { interior: true });
  plain('rug2', { map: rug2, roughness: 1, color: 0xffffff }, { interior: true });
  for (const m of [M.rug, M.rug2]) { m.normalMap = M.fabricCream.normalMap; m.normalScale.set(0.6, 0.6); }

  // exterior misc
  plain('aluminium', { color: 0x34383a, roughness: 0.42, metalness: 0.75 });
  plain('aluminiumWhite', { color: 0xe9eae6, roughness: 0.4, metalness: 0.4 });
  plain('blackSteel', { color: 0x161819, roughness: 0.45, metalness: 0.8 });
  plain('steel', { color: 0xc3c7ca, roughness: 0.28, metalness: 1 });
  plain('brass', { color: 0xc8a258, roughness: 0.3, metalness: 1 });
  plain('chrome', { color: 0xe8eaec, roughness: 0.06, metalness: 1 });
  plain('rubber', { color: 0x1c1c1d, roughness: 0.9 });
  plain('plastic', { color: 0xeeeeea, roughness: 0.4 });
  plain('lineWhite', { color: 0xdcdbd4, roughness: 0.75 });
  plain('lineYellow', { color: 0xd8b52a, roughness: 0.75 });
  plain('black', { color: 0x0d0e0f, roughness: 0.6 });
  plain('paintWhite', { color: 0xf4f2ec, roughness: 0.55 }, { interior: true });
  plain('trim', { color: 0xf3f0e8, roughness: 0.5 }, { interior: true });
  plain('doorMetal', { color: 0x4a4e50, roughness: 0.5, metalness: 0.7 });
  physical('ceramic', { color: 0xf7f7f3, roughness: 0.08, clearcoat: 0.6, clearcoatRoughness: 0.05 }, { interior: true });
  physical('mirror', { color: 0xb8c4c8, roughness: 0.02, metalness: 1 }, { interior: true });
  physical('tvScreen', { map: tvScreenTexture(), color: 0xffffff, roughness: 0.06, metalness: 0.2, clearcoat: 1 }, { interior: true });
  plain('tvBody', { color: 0x0d0d0e, roughness: 0.35, metalness: 0.5 }, { interior: true });
  plain('emissiveWarm', { color: 0xfff0d6, emissive: 0xffd9a0, emissiveIntensity: 3.2, roughness: 0.4 }, { interior: true });
  plain('emissiveCool', { color: 0xf5f9ff, emissive: 0xdfeaff, emissiveIntensity: 3.0, roughness: 0.4 });
  plain('lampShade', { color: 0xf2e9d8, emissive: 0xffd9a8, emissiveIntensity: 0.9, roughness: 0.9, side: THREE.DoubleSide }, { interior: true });
  plain('leaf', { color: 0x4b6a35, roughness: 0.55, side: THREE.DoubleSide, vertexColors: true });
  plain('leafDark', { color: 0x30491f, roughness: 0.5, side: THREE.DoubleSide });
  plain('leafIndoor', { color: 0x3f6a33, roughness: 0.45, side: THREE.DoubleSide }, { interior: true });
  plain('soil', { color: 0x3a2c20, roughness: 1 });
  plain('terracotta', { color: 0xb5663d, roughness: 0.8 });
  plain('whitePot', { color: 0xeeeae2, roughness: 0.6 }, { interior: true });
  plain('book1', { color: 0x6b4a36, roughness: 0.7 }, { interior: true });
  plain('book2', { color: 0x30434d, roughness: 0.7 }, { interior: true });
  plain('book3', { color: 0xc8b58f, roughness: 0.7 }, { interior: true });
  plain('carPaint', { color: 0xe8e6df, roughness: 0.3, metalness: 0.6 });
  plain('carGlass', { color: 0x161a1d, roughness: 0.05, metalness: 0.8 });
  glass('glass', { color: 0xd3e6ea, opacity: 0.17, envI: 1.6 });
  glass('glassGreen', { color: 0xa6cdc4, opacity: 0.30, envI: 1.6 });
  glass('glassInterior', { color: 0xeaf2f3, opacity: 0.08, envI: 1.0 });
  M.glassInterior.userData.interior = true;
  glass('glassBlue', { color: 0xb9d4e6, opacity: 0.2, envI: 1.6 });

  // palm
  const pt = palmTrunkTextures();
  const trunk = new THREE.MeshStandardMaterial({ map: pt.map, normalMap: pt.normalMap, normalScale: new THREE.Vector2(1.6, 1.6), roughness: 0.95, envMapIntensity: 1 });
  trunk.userData.tile = [1, 1]; M.trunk = trunk; allMats.add(trunk);
  return M;
}

/** Apply the shared environment map to every material; interior surfaces see far less sky light. */
export function applyEnvironment(envTex, rotY = 0, interiorFactor = 0.32) {
  for (const m of allMats) {
    m.envMap = envTex;
    if (m.envMapRotation) m.envMapRotation.set(0, rotY, 0);
    m.userData.baseEnv ??= m.envMapIntensity;
    m.envMapIntensity = m.userData.baseEnv * (m.userData.interior ? interiorFactor : 1);
    m.needsUpdate = true;
  }
}
export function setInteriorFactor(f) {
  for (const m of allMats) if (m.userData.interior) m.envMapIntensity = (m.userData.baseEnv ?? 1) * f;
}
export function register(m) { allMats.add(m); return m; }
