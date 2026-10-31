// Engine core for the CIRMANO hero. Adapted from flat-to-3d / 01-exploded-house / core.js
// (c) 2026 Samnang Aing, MIT License — see ./LICENSE. Changes for CIRMANO:
//   - brand palette (Ink / Bone / Brass) instead of the original ink / paper / orange pen
//   - init(canvas) / dispose() instead of a renderer bound to #c at import, so React can mount and unmount it
//   - Labels take their DOM roots as arguments; sizes come from the stage, not the window
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
export { THREE, LineSegments2, LineSegmentsGeometry };

export const D2R = Math.PI / 180;
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const ease2 = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
export const easeOut = t => 1 - Math.pow(1 - t, 3);
export const win = (p, a, b) => clamp((p - a) / (b - a));
export const V = (x, y, z) => new THREE.Vector3(x, y, z);

// CIRMANO brand guidelines 01: Ink, Bone, Brass
export const INK = '#101012';
export const PAPER = '#f3efe8';
export const ACCENT = '#b08d57';

export const ctx = { W: 1, H: 1, res: new THREE.Vector2(1, 1), lineMats: new Set(), shadows: false, phone: false };

// ---------- the plotter. Everything is drawn in by a front that sweeps through the model: lines first
// (with a brass pen tip), then the fills behind them. order = dot(world, dir) + radial * distance from c.
export const DRAW = {
  uDraw: { value: 1e5 }, uDrawFill: { value: 1e5 }, uDrawSoft: { value: 1.2 },
  uDrawDir: { value: new THREE.Vector4(0, 1, 0, 0) }, uDrawC: { value: new THREE.Vector3() },
  uPen: { value: new THREE.Color(ACCENT) },
  uWash: { value: 0 },          // 1 = the fills are a light colour wash on paper, as on a drawing
};
const DRAW_GLSL = `uniform float uDraw; uniform float uDrawFill; uniform float uDrawSoft; uniform vec4 uDrawDir; uniform vec3 uDrawC; uniform vec3 uPen; uniform float uWash;
  varying vec3 vWD;
  float drawOrder(vec3 w) { return dot(w, uDrawDir.xyz) + uDrawDir.w * length(w.xz - uDrawC.xz); }
`;
const addDraw = (sh) => { Object.assign(sh.uniforms, DRAW); };
function patchFill(m, o = {}) {
  const prev = m.onBeforeCompile;
  const grainAmt = o.grain ?? 0.022;
  m.onBeforeCompile = (sh, r) => {
    if (prev) prev(sh, r);
    addDraw(sh);
    sh.uniforms.uGrain = { value: grainAmt };
    sh.vertexShader = 'varying vec3 vWD; varying vec3 vLP;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n vWD = (modelMatrix * vec4(transformed, 1.0)).xyz;\n vLP = transformed;');
    sh.fragmentShader = DRAW_GLSL + 'uniform float uGrain; varying vec3 vLP;\nfloat hash3(vec3 p){ p = fract(p * vec3(443.897, 441.423, 437.195)); p += dot(p, p.yzx + 19.19); return fract((p.x + p.y) * p.z); }\n' + sh.fragmentShader
      .replace('#include <clipping_planes_fragment>', 'if (drawOrder(vWD) > uDrawFill) discard;\n#include <clipping_planes_fragment>')
      .replace('#include <map_fragment>', (o.wash === false ? '#include <map_fragment>' : '#include <map_fragment>\n diffuseColor.rgb = mix(diffuseColor.rgb, mix(mix(diffuseColor.rgb, vec3(dot(diffuseColor.rgb, vec3(0.3, 0.59, 0.11))), 0.5), vec3(0.976, 0.963, 0.942), 0.4), uWash);')
        + '\n diffuseColor.rgb *= 1.0 + (hash3(floor(vLP * 140.0)) - 0.5) * uGrain * (1.0 - 0.5 * uWash);');
  };
  return m;
}
function patchLine(m) {
  m.onBeforeCompile = (sh) => {
    addDraw(sh);
    sh.vertexShader = sh.vertexShader.replace('void main() {', 'varying vec3 vWD;\nvoid main() {\n vWD = (modelMatrix * vec4((position.y < 0.5) ? instanceStart : instanceEnd, 1.0)).xyz;');
    sh.fragmentShader = DRAW_GLSL + sh.fragmentShader.replace('#include <color_fragment>', `{ float k = uDraw - drawOrder(vWD); if (k < 0.0) discard;
        diffuseColor.rgb = mix(uPen, diffuseColor.rgb, smoothstep(0.0, uDrawSoft, k)); }
      #include <color_fragment>`);
  };
  return m;
}
export { patchFill };

// Live bindings: set by init(), read by room.js and engine.js at call time.
export let renderer = null;
export let scene = null;
export let camera = null;
let _studioEnv = null;

export function init(canvas) {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(PAPER);
  camera = new THREE.PerspectiveCamera(30, 1, 1, 1000);
  ctx.lineMats = new Set();
  _studioEnv = null;
  DRAW.uDraw.value = 1e5; DRAW.uDrawFill.value = 1e5; DRAW.uWash.value = 0;
}

export function dispose() {
  if (!renderer) return;
  scene.traverse((o) => {
    o.geometry?.dispose?.();
    const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    for (const m of mats) {
      for (const v of Object.values(m)) if (v && v.isTexture) v.dispose();
      m.dispose();
    }
  });
  _studioEnv?.dispose();
  renderer.dispose();
  renderer.forceContextLoss();
  renderer = scene = camera = null;
  _studioEnv = null;
  ctx.lineMats.clear();
}

export function ensureEnv() {
  if (_studioEnv) return _studioEnv;
  const envScene = new THREE.Scene();
  const c = document.createElement('canvas'); c.width = 4; c.height = 256;
  const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, '#fffdf9'); gr.addColorStop(0.5, '#f3efe8'); gr.addColorStop(1, '#d6cbb8');
  g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  envScene.add(new THREE.Mesh(new THREE.SphereGeometry(40, 24, 12), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide })));
  const card = (w, h, p, col) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide }));
    m.position.set(...p); m.lookAt(0, 0, 0); envScene.add(m);
  };
  card(24, 14, [28, 18, 16], 0xffffff);
  card(20, 12, [-22, 16, 20], 0xfff5e4);
  const pmrem = new THREE.PMREMGenerator(renderer);
  _studioEnv = pmrem.fromScene(envScene, 0.03).texture;
  pmrem.dispose();
  return _studioEnv;
}

// ---------- geometry
export function bx(x0, y0, z0, x1, y1, z1) {
  const g = new THREE.BoxGeometry(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0));
  g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  return g;
}
export function cyl(r, h, x, y, z, seg = 28, r2 = r) {
  const g = new THREE.CylinderGeometry(r2, r, h, seg); g.translate(x, y + h / 2, z); return g;
}

const pts = a => a.map(([u, v]) => new THREE.Vector2(u, v));
// a flat panel drawn in (u, v) and extruded th along +w. Holes are point lists or {c:[u,v], r}.
export function panel(outline, holes = [], th = 0.12) {
  const s = outline instanceof THREE.Shape ? outline : new THREE.Shape(pts(outline));
  for (const h of holes) {
    if (h.r) { const p = new THREE.Path(); p.absarc(h.c[0], h.c[1], h.r, 0, Math.PI * 2, true); s.holes.push(p); }
    else s.holes.push(new THREE.Path(pts(h)));
  }
  return new THREE.ExtrudeGeometry(s, { depth: th, bevelEnabled: false, curveSegments: 40 });
}
// placements for panels: u along x at z0 (w goes +z) / u along z with w going -x from x1
export const M = {
  alongX: (z0, y0 = 0) => new THREE.Matrix4().makeTranslation(0, y0, z0),
  alongZ: (x1, y0 = 0) => new THREE.Matrix4().makeTranslation(x1, y0, 0).multiply(new THREE.Matrix4().makeRotationY(-Math.PI / 2)),
};

// ---------- materials
export function lineMat(o = {}) {
  const m = new LineMaterial({
    color: new THREE.Color(o.color ?? INK), linewidth: o.w ?? 1, dashed: !!o.dashed,
    dashSize: o.dash ?? 0.3, gapSize: o.gap ?? 0.22, transparent: true, opacity: o.opacity ?? 1,
    depthTest: o.depthTest ?? true, depthWrite: false,
  });
  m.userData.w = o.w ?? 1; m.resolution.copy(ctx.res); ctx.lineMats.add(m);
  if (ctx.phone) m.linewidth = m.userData.w * 0.72;
  return patchLine(m);
}
export function stdMat(hex, o = {}) {
  const m = new THREE.MeshStandardMaterial({
    color: hex, roughness: o.rough ?? 0.82, metalness: o.metal ?? 0, map: o.map ?? null,
    bumpMap: o.bumpMap ?? null, bumpScale: o.bumpScale ?? 0.016,
    envMap: o.envMap ?? ensureEnv(), envMapIntensity: o.env ?? 0.42,
    transparent: o.opacity != null, opacity: o.opacity ?? 1, depthWrite: o.opacity == null,
    side: o.side ?? THREE.FrontSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
    emissive: o.emissive ?? 0x000000, emissiveIntensity: o.emissiveIntensity ?? 1,
  });
  return patchFill(m, o);
}

// ---------- parts: geometry collected per material, merged, with ink edges on top
export class Part {
  constructor(parent, pal, line, weights = {}) { this.parent = parent; this.pal = pal; this.line = line; this.weights = weights; this.b = new Map(); }
  add(key, ...gs) {
    const spec = this.pal[key];
    for (let g of gs) {
      if (g.index) g = g.toNonIndexed();
      if (spec?.uvScale) boxUV(g, spec.uvScale, spec.uvAlong);
      for (const n of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(n)) g.deleteAttribute(n);
      if (!this.b.has(key)) this.b.set(key, []);
      this.b.get(key).push(g);
    }
    return this;
  }
  build() {
    for (const [key, list] of this.b) {
      const spec = this.pal[key]; if (!spec) throw new Error('no material ' + key);
      const geo = mergeGeometries(list, false);
      const mesh = new THREE.Mesh(geo, spec.mat);
      mesh.castShadow = spec.cast ?? true; mesh.receiveShadow = spec.receive ?? true;
      this.parent.add(mesh);
      if (spec.edges !== false) {
        const eg = new THREE.EdgesGeometry(geo, spec.thr ?? 30);
        const l = new LineSegments2(new LineSegmentsGeometry().fromEdgesGeometry(eg), spec.line || (spec.w && this.weights[spec.w]) || this.line);
        eg.dispose();
        this.parent.add(l);
      }
    }
    this.b.clear();
    return this;
  }
}
// loose line segments (hatching, board joints): [[x0,y0,z0,x1,y1,z1], ...]
export function segs(parent, list, mat) {
  if (!list.length) return null;
  const g = new LineSegmentsGeometry(); g.setPositions(list.flat());
  const l = new LineSegments2(g, mat); parent.add(l); return l;
}

// ---------- camera. A key is a target, a direction (az, el), a lens and the height of the frame at the
// target. Between keys the lens is interpolated in log and the distance follows from the frame height,
// so widening the lens while holding the frame is a dolly zoom. A 2 degree lens from far away is an axo.
export function eyeKey(at, E, T, fov, extra = {}) {
  const d = V(...E).sub(V(...T)); const D = d.length();
  const v = V(...T).sub(V(...E));
  return {
    at, t: T, pos: E, look: T,
    laz: Math.atan2(v.z, v.x) / D2R, lel: Math.asin(v.y / D) / D2R, ldist: D,
    az: Math.atan2(d.z, d.x) / D2R, el: Math.asin(d.y / D) / D2R,
    fov, h: 2 * D * Math.tan(fov * D2R / 2), sx: 0, sy: 0, ...extra,
  };
}
export function camAt(keys0, p) {
  const keys = ctx.phone ? keys0.map(k => k.ph ? { ...k, ...k.ph } : k) : keys0;
  let i = 0; while (i < keys.length - 1 && p > keys[i + 1].at) i++;
  const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
  const u = a === b ? 0 : (b.easeFn || ease)(clamp((p - a.at) / (b.at - a.at)));
  const L = (k) => lerp(a[k] ?? 0, b[k] ?? 0, u);
  const az = a.az + ((((b.az - a.az) % 360) + 540) % 360 - 180) * u;
  if (a.pos && b.pos) {
    const pos = [lerp(a.pos[0], b.pos[0], u), lerp(a.pos[1], b.pos[1], u), lerp(a.pos[2], b.pos[2], u)];
    const laz = (a.laz + ((((b.laz - a.laz) % 360) + 540) % 360 - 180) * u) * D2R;
    const lel = lerp(a.lel, b.lel, u) * D2R;
    const ldist = lerp(a.ldist, b.ldist, u);
    const t = [pos[0] + ldist * Math.cos(lel) * Math.cos(laz), pos[1] + ldist * Math.sin(lel), pos[2] + ldist * Math.cos(lel) * Math.sin(laz)];
    const fov = Math.exp(lerp(Math.log(a.fov), Math.log(b.fov), u));
    return { pos, t, az, el: L('el'), fov, h: 2 * ldist * Math.tan(fov * D2R / 2), w: L('w'), sx: L('sx'), sy: L('sy') };
  }
  return {
    t: [lerp(a.t[0], b.t[0], u), lerp(a.t[1], b.t[1], u), lerp(a.t[2], b.t[2], u)],
    az, el: L('el'), fov: Math.exp(lerp(Math.log(a.fov), Math.log(b.fov), u)),
    h: Math.exp(lerp(Math.log(a.h), Math.log(b.h), u)), w: L('w'), sx: L('sx'), sy: L('sy'),
  };
}
export function applyCam(c, R = 80) {
  const aspect = ctx.W / ctx.H;
  const h = Math.max(c.h, (c.w || 0) / aspect);
  const D = h / (2 * Math.tan(c.fov * D2R / 2));
  if (c.pos) {
    camera.position.set(c.pos[0], c.pos[1], c.pos[2]);
  } else {
    const az = c.az * D2R, el = c.el * D2R;
    camera.position.set(c.t[0] + D * Math.cos(el) * Math.cos(az), c.t[1] + D * Math.sin(el), c.t[2] + D * Math.cos(el) * Math.sin(az));
  }
  camera.up.set(0, 1, 0); camera.lookAt(c.t[0], c.t[1], c.t[2]);
  camera.fov = c.fov; camera.aspect = aspect;
  camera.near = Math.max(0.04, D - R); camera.far = D + R * 3;
  camera.updateProjectionMatrix();
  // lens shift, as an architectural camera does it: the picture slides, the lines stay parallel
  camera.projectionMatrix.elements[8] -= c.sx || 0;
  camera.projectionMatrix.elements[9] -= c.sy || 0;
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  camera.userData.D = D;
}

// ---------- labels: material codes that ride with their surface
const tmp = new THREE.Vector3();
export class Labels {
  constructor(root, svg) { this.root = root; this.svg = svg; this.items = []; }
  add(o) {
    const el = document.createElement('div'); el.className = 'lab' + (o.mode === 'tag' ? ' tag' : '') + (o.cls ? ' ' + o.cls : '');
    const no = document.createElement('span'); no.className = 'no'; no.textContent = o.no; el.appendChild(no);
    if (o.name) { const nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = o.name; el.appendChild(nm); }
    this.root.appendChild(el);
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.innerHTML = '<polyline class="halo"/><polyline/><circle r="3.0" class="halo"/><circle r="2.2" class="dot"/>';
    this.svg.appendChild(g);
    const it = { ...o, el, g, op: 1, on: false }; this.items.push(it); return it;
  }
  update() {
    const W = ctx.W, H = ctx.H;
    for (const it of this.items) {
      it.obj.updateWorldMatrix(true, false);
      tmp.copy(it.at).applyMatrix4(it.obj.matrixWorld).project(camera);
      const show = it.op > 0.01 && tmp.z < 1;
      it.el.style.opacity = show ? it.op : 0; it.g.style.opacity = show ? it.op : 0;
      if (!show) continue;
      const ax = (tmp.x * .5 + .5) * W, ay = (-tmp.y * .5 + .5) * H;
      const [ph, pl, ch, c] = it.g.children;
      for (const e of [c, ch]) { e.setAttribute('cx', ax); e.setAttribute('cy', ay); }
      const tk = ctx.phone ? 0.55 : 1, lx = ax + (it.tx ?? 18) * tk, ly = ay + (it.ty ?? -18) * tk;
      it.el.style.transform = `translate(${lx + 6}px, ${ly - 8}px)`;
      for (const e of [pl, ph]) e.setAttribute('points', `${ax},${ay} ${lx},${ly}`);
    }
  }
  clear() { this.root.replaceChildren(); this.svg.replaceChildren(); this.items = []; }
}

export function resize(w, h) {
  ctx.W = w; ctx.H = h; ctx.res.set(w, h); ctx.phone = w < 700;
  renderer.setSize(w, h, false);
  for (const m of ctx.lineMats) { m.resolution.copy(ctx.res); m.linewidth = m.userData.w * (ctx.phone ? 0.72 : 1); }
}

// ---------- canvas textures
export function canvasTex(w, h, draw, o = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8; if (o.repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  return t;
}
// a small seeded random, so every load draws the same boards
export function rng(seed = 1) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// UVs from world position, projected along each face's main axis (metres * scale).
export function boxUV(g, scale = 1, along = null) {
  if (g.index) g = g.toNonIndexed();
  const p = g.attributes.position, n = g.attributes.normal, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
    let u, v;
    if (ay >= ax && ay >= az) { u = p.getX(i); v = p.getZ(i); }
    else if (ax >= az) { u = p.getZ(i); v = p.getY(i); }
    else { u = p.getX(i); v = p.getY(i); }
    if (along === 'z' && ay >= ax && ay >= az) { const t = u; u = v; v = t; }
    uv[i * 2] = u * scale; uv[i * 2 + 1] = v * scale;
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return g;
}
