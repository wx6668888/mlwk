import * as THREE from 'three';
import { M, register } from './mats.js';
import { plane } from './local.js';

/** Furniture authored in a local frame: origin on the floor, front = +z, back = -z. All sizes metres. */

const extra = {};
export function initFurnMats() {
  if (extra.ready) return extra;
  const mk = (p, interior = true) => { const m = new THREE.MeshStandardMaterial({ envMapIntensity: 1, ...p }); m.userData.interior = interior; register(m); return m; };
  extra.sheer = mk({ color: 0xf6f2ea, roughness: 1, transparent: true, opacity: 0.38, side: THREE.DoubleSide, depthWrite: false });
  extra.brassSat = mk({ color: 0xb98d44, roughness: 0.28, metalness: 1 });
  extra.cork = mk({ color: 0xcbb08a, roughness: 0.9 });
  extra.pillowCream = mk({ color: 0xece3d2, roughness: 1 });
  extra.towel = mk({ color: 0xf0ebe0, roughness: 1 });
  extra.fruit = mk({ color: 0xd9822b, roughness: 0.6 });
  extra.fruit2 = mk({ color: 0x9fb34a, roughness: 0.6 });
  extra.glassClear = mk({ color: 0xe8f0f0, roughness: 0.03, metalness: 0, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide });
  extra.stainless = mk({ color: 0xc9cdcf, roughness: 0.32, metalness: 1 });
  extra.cabinetWhite = mk({ color: 0xf1eee7, roughness: 0.42 });
  extra.cabinetGrey = mk({ color: 0x6d726f, roughness: 0.5 });
  extra.artFrame = mk({ color: 0x161718, roughness: 0.5 });
  const art = () => mk({ color: 0xffffff, roughness: 0.8 });
  extra.art = { L: [art(), art()], P: [art(), art()], S: [art()] };
  extra.ready = true;
  return extra;
}
export const X = () => extra;

let MODELS = null;
export const setModels = (m) => { MODELS = m; };
const _bb = new THREE.Box3();
/** Drop a scanned model into local frame l, fitted to w/h/d (uniform), centred on lx/lz with its base on the floor. Returns false if the model is unavailable. */
function fit(l, name, { lx = 0, lz = 0, y = 0, ry = 0, w, h, d } = {}) {
  if (!MODELS?.has(name)) return false;
  const [x, z] = l.p(lx, lz);
  const o = MODELS.place(l.L.group, name, { x, y: l.y + y, z, ry: l.ry + ry, w, h, d, interior: true });
  if (l.bb) { o.updateMatrixWorld(true); l.bb.union(_bb.setFromObject(o)); }
  return true;
}

/* ----------------------------------------------------- seating */
export function sofa(l, { w = 2.2, d = 0.95, fab = M.fabricCream, pillows = [M.fabricRust, M.fabricTeal], n = 3, legMat = M.walnut, low = 0.13, model } = {}) {
  if (model && fit(l, model, { w })) return;
  const lh = low;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) l.cyl(0.026, 0.018, lh, sx * (w / 2 - 0.12), lh / 2, sz * (d / 2 - 0.12), legMat, { seg: 10 });
  l.rbox(w, 0.2, d, 0, lh + 0.1, 0, fab, 0.05);
  for (const s of [-1, 1]) l.rbox(0.2, 0.5, d, s * (w / 2 - 0.1), lh + 0.25, 0, fab, 0.07);
  const bw = w - 0.4;
  l.rbox(bw, 0.52, 0.24, 0, lh + 0.46, -d / 2 + 0.12, fab, 0.07);
  const cw = bw / n;
  for (let i = 0; i < n; i++) {
    const x = -bw / 2 + cw * (i + 0.5);
    l.rbox(cw - 0.01, 0.17, d - 0.26, x, lh + 0.285, 0.09, fab, 0.06);
    l.rbox(cw - 0.03, 0.42, 0.15, x, lh + 0.62, -d / 2 + 0.3, fab, 0.07, { rx: -0.2 });
  }
  pillows.forEach((m, i) => {
    const sx = i % 2 ? 1 : -1;
    l.rbox(0.46, 0.44, 0.13, sx * (bw / 2 - 0.26 - Math.floor(i / 2) * 0.1), lh + 0.62, -d / 2 + 0.46, m, 0.06, { rx: -0.22, rz: sx * 0.12 });
  });
}

export function ottoman(l, { w = 0.7, d = 0.7, h = 0.4, mat = M.fabricSand } = {}) {
  l.rbox(w, h - 0.06, d, 0, 0.06 + (h - 0.06) / 2, 0, mat, 0.07);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) l.cyl(0.02, 0.016, 0.06, sx * (w / 2 - 0.08), 0.03, sz * (d / 2 - 0.08), M.walnut, { seg: 8 });
}

export function diningChair(l, { fab = M.fabricSand, wood = M.walnut, model = 'dining_chair_02' } = {}) {
  if (fit(l, model, { h: 0.92 })) return;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const back = sz < 0;
    l.cyl(0.017, 0.012, 0.44, sx * 0.19, 0.22, sz * 0.19, wood, { seg: 8 });
  }
  l.rbox(0.46, 0.05, 0.46, 0, 0.44, 0, wood, 0.02);
  l.rbox(0.42, 0.05, 0.42, 0, 0.485, 0.01, fab, 0.025);
  l.rbox(0.42, 0.34, 0.035, 0, 0.74, -0.215, fab, 0.02, { rx: -0.08 });
  for (const sx of [-1, 1]) l.cyl(0.015, 0.015, 0.35, sx * 0.205, 0.65, -0.21, wood, { seg: 8 });
  l.rbox(0.46, 0.04, 0.05, 0, 0.93, -0.225, wood, 0.015, { rx: -0.08 });
}

export function barStool(l) {
  l.cyl(0.17, 0.17, 0.05, 0, 0.66, 0, M.leatherTan, { seg: 20 });
  l.cyl(0.19, 0.19, 0.025, 0, 0.63, 0, M.walnut, { seg: 20 });
  l.cyl(0.022, 0.022, 0.62, 0, 0.31, 0, M.blackSteel, { seg: 10 });
  l.cyl(0.19, 0.2, 0.018, 0, 0.009, 0, M.blackSteel, { seg: 20 });
  l.cyl(0.14, 0.14, 0.012, 0, 0.25, 0, M.blackSteel, { seg: 20 });
}

/* ----------------------------------------------------- tables */
export function roundTable(l, { r = 0.5, h = 0.42, top = M.quartz, base = M.brass } = {}) {
  l.cyl(r, r, 0.035, 0, h, 0, top, { seg: 40 });
  l.cyl(r * 0.94, r * 0.94, 0.012, 0, h - 0.0235, 0, base, { seg: 40 });
  for (let i = 0; i < 3; i++) {
    const a = i * 2.094 + 0.4;
    l.bar([Math.cos(a) * r * 0.55, 0.0, Math.sin(a) * r * 0.55], [Math.cos(a) * r * 0.5, h - 0.03, Math.sin(a) * r * 0.5], 0.014, base);
  }
}
export function coffeeTable(l, { w = 1.1, d = 0.65, h = 0.4, top = M.blackMarble, model } = {}) {
  if (model && fit(l, model, { w: model === 'modern_coffee_table_01' ? w : Math.min(w, d) + 0.1 })) return;
  l.rbox(w, 0.04, d, 0, h, 0, top, 0.01);
  l.rbox(w - 0.08, 0.025, d - 0.08, 0, h - 0.04, 0, M.brass, 0.005);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) l.box(0.025, h - 0.02, 0.025, sx * (w / 2 - 0.07), (h - 0.02) / 2, sz * (d / 2 - 0.07), M.brass);
  l.rbox(w * 0.78, 0.015, d * 0.7, 0, 0.12, 0, M.walnut, 0.005);
}
export function sideTable(l, { r = 0.24, h = 0.55 } = {}) {
  l.cyl(r, r, 0.03, 0, h, 0, M.blackMarble, { seg: 28 });
  l.cyl(0.018, 0.018, h, 0, h / 2, 0, M.brass, { seg: 8 });
  l.cyl(r * 0.75, r * 0.75, 0.02, 0, 0.01, 0, M.brass, { seg: 24 });
}
export function diningTable(l, { w = 1.0, d = 2.0, h = 0.75 } = {}) {
  l.rbox(w, 0.05, d, 0, h - 0.025, 0, M.quartz, 0.015);
  l.rbox(w - 0.1, 0.05, d - 0.1, 0, h - 0.07, 0, M.walnut, 0.01);
  for (const sz of [-1, 1]) {
    l.rbox(0.07, h - 0.1, 0.5, 0, (h - 0.1) / 2, sz * (d / 2 - 0.5), M.walnut, 0.015);
    l.rbox(0.62, 0.05, 0.08, 0, 0.025, sz * (d / 2 - 0.5), M.walnut, 0.015);
  }
  l.rbox(0.07, 0.07, d - 1.0, 0, 0.12, 0, M.walnut, 0.01);
}
export function console_(l, { w = 1.1, d = 0.35, h = 0.82 } = {}) {
  l.rbox(w, 0.04, d, 0, h, 0, M.walnut, 0.01);
  l.rbox(w - 0.1, 0.03, d - 0.06, 0, 0.18, 0, M.walnut, 0.01);
  for (const sx of [-1, 1]) l.rbox(0.04, h, d - 0.06, sx * (w / 2 - 0.05), h / 2, 0, M.walnut, 0.01);
  for (let i = 0; i < 6; i++) l.box(0.015, 0.4, 0.02, -w * 0.38 + i * 0.075, 0.55, d / 2 - 0.04, M.brass, { cast: false });
}

/* ----------------------------------------------------- beds & storage */
export function bed(l, { w = 1.8, len = 2.08, fab = M.fabricSand, top = M.fabricCream, accent = M.fabricTeal, head = M.fabricGrey, frame = M.walnut } = {}) {
  if (w >= 1.4 && fit(l, 'bed_double', { w: w + 0.15 })) return;
  const hz = -len / 2 - 0.08;
  l.rbox(w + 0.1, 0.22, len + 0.08, 0, 0.19, 0, frame, 0.03);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) l.box(0.05, 0.1, 0.05, sx * (w / 2 - 0.03), 0.05, sz * (len / 2 - 0.03), M.blackSteel);
  l.rbox(w, 0.24, len, 0, 0.42, 0.02, M.fabricCream, 0.06);
  l.rbox(w + 0.06, 0.07, len * 0.68, 0, 0.58, len * 0.14 + 0.03, top, 0.03);
  l.rbox(w + 0.1, 0.05, 0.5, 0, 0.62, len / 2 - 0.3, accent, 0.02);
  for (const sx of [-1, 1]) l.rbox(0.1, 0.05, len * 0.68, sx * (w / 2 + 0.04), 0.5, len * 0.14, top, 0.02);
  const pw = w > 1.4 ? 0.62 : 0.55;
  const cols = w > 1.4 ? 2 : 1;
  for (let i = 0; i < cols; i++) {
    const x = (i - (cols - 1) / 2) * (w / cols);
    l.rbox(pw, 0.14, 0.42, x, 0.66, hz + 0.58, extra.pillowCream, 0.06, { rx: -0.3 });
    l.rbox(pw * 0.9, 0.13, 0.38, x, 0.76, hz + 0.68, extra.pillowCream, 0.06, { rx: -0.45 });
    l.rbox(0.42, 0.34, 0.1, x * 0.6, 0.78, hz + 0.9, accent, 0.05, { rx: -0.6 });
  }
  // upholstered headboard with vertical channels
  const hw = w + 0.9;
  l.rbox(hw, 1.25, 0.12, 0, 0.82, hz, head, 0.05);
  const n = Math.round(hw / 0.28);
  for (let i = 1; i < n; i++) l.box(0.008, 1.1, 0.01, -hw / 2 + (hw / n) * i, 0.82, hz + 0.066, M.black, { cast: false });
  l.rbox(hw + 0.1, 0.06, 0.14, 0, 1.46, hz, frame, 0.02);
}

export function nightstand(l, { lamp = true } = {}) {
  l.rbox(0.5, 0.05, 0.4, 0, 0.5, 0, M.walnut, 0.01);
  l.rbox(0.46, 0.4, 0.36, 0, 0.27, 0, M.walnut, 0.015);
  l.box(0.4, 0.012, 0.012, 0, 0.36, 0.185, M.brass);
  l.box(0.4, 0.008, 0.012, 0, 0.22, 0.185, M.black, { cast: false });
  l.rbox(0.46, 0.03, 0.36, 0, 0.065, 0, M.blackSteel, 0.005);
  l.box(0.16, 0.012, 0.012, 0, 0.45, 0.19, M.brass);
  if (lamp) tableLamp(l.at(0, 0.525, -0.03));
}
export function tableLamp(l, { h = 0.38, shade = 0.18 } = {}) {
  l.cyl(0.07, 0.085, 0.02, 0, 0.01, 0, M.brass, { seg: 18 });
  l.cyl(0.03, 0.045, h * 0.65, 0, h * 0.35, 0, M.ceramic, { seg: 16 });
  l.sphere(0.07, 0, h * 0.4, 0, M.ceramic, { sy: 1.3 });
  l.cyl(shade * 0.7, shade, h * 0.5, 0, h * 0.85, 0, M.lampShade, { seg: 24, open: true });
}
export function floorLamp(l, { h = 1.55 } = {}) {
  l.cyl(0.14, 0.15, 0.025, 0, 0.0125, 0, M.blackSteel, { seg: 20 });
  l.cyl(0.012, 0.012, h, 0, h / 2, 0, M.brass, { seg: 8 });
  l.cyl(0.19, 0.25, 0.3, 0, h + 0.05, 0, M.lampShade, { seg: 28, open: true });
}

export function wardrobe(l, { w = 2.0, d = 0.6, h = 2.5, n = 4, mat = M.oakLight, handle = M.brass } = {}) {
  l.box(w, h, d, 0, h / 2, 0, mat);
  const dw = w / n;
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + dw * (i + 0.5);
    l.rbox(dw - 0.012, h - 0.12, 0.02, x, h / 2, d / 2 + 0.008, mat, 0.004);
    l.box(0.012, 0.8, 0.014, x + (i % 2 ? -1 : 1) * (dw / 2 - 0.05), h * 0.5, d / 2 + 0.024, handle);
    for (let k = 1; k < 5; k++) l.box(0.004, h - 0.2, 0.004, x - dw / 2 + (dw / 5) * k, h / 2, d / 2 + 0.02, M.black, { cast: false });
  }
  l.box(w, 0.06, d + 0.012, 0, 0.03, 0.0, M.black);
}
export function dresserUnit(l, { w = 1.4, d = 0.5, h = 0.8 } = {}) {
  l.rbox(w, h, d, 0, h / 2 + 0.06, 0, M.walnut, 0.01);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) {
    l.rbox(w / 2 - 0.02, h / 3 - 0.02, 0.02, (c - 0.5) * (w / 2), 0.06 + h / 6 + r * (h / 3), d / 2 + 0.005, M.walnut, 0.004);
    l.box(0.14, 0.012, 0.015, (c - 0.5) * (w / 2), 0.06 + h / 6 + r * (h / 3) + 0.05, d / 2 + 0.02, M.brass);
  }
  for (const sx of [-1, 1]) l.cyl(0.02, 0.014, 0.06, sx * (w / 2 - 0.08), 0.03, 0, M.brass, { seg: 8 });
}
export function desk(l, { w = 1.3, d = 0.62 } = {}) {
  l.rbox(w, 0.04, d, 0, 0.74, 0, M.walnut, 0.01);
  for (const sx of [-1, 1]) l.rbox(0.04, 0.72, d - 0.06, sx * (w / 2 - 0.04), 0.36, 0, M.walnut, 0.01);
  l.rbox(0.4, 0.5, d - 0.06, w / 2 - 0.26, 0.5, 0, M.walnut, 0.01);
  l.box(0.3, 0.012, 0.012, w / 2 - 0.26, 0.55, d / 2 - 0.02, M.brass);
  l.rbox(w - 0.1, 0.06, 0.05, 0, 0.67, -d / 2 + 0.05, M.walnut, 0.005);
}
export function deskChair(l) {
  l.cyl(0.02, 0.02, 0.4, 0, 0.2, 0, M.chrome, { seg: 10 });
  for (let i = 0; i < 5; i++) { const a = i * 1.2566; l.bar([0, 0.05, 0], [Math.cos(a) * 0.28, 0.03, Math.sin(a) * 0.28], 0.014, M.chrome); l.cyl(0.025, 0.025, 0.04, Math.cos(a) * 0.28, 0.02, Math.sin(a) * 0.28, M.black, { seg: 8 }); }
  l.rbox(0.48, 0.09, 0.46, 0, 0.46, 0, M.fabricGrey, 0.04);
  l.rbox(0.46, 0.5, 0.07, 0, 0.74, -0.22, M.fabricGrey, 0.04, { rx: -0.1 });
}

/* ----------------------------------------------------- media */
export function tvWall(l, { w = 2.2, tv = 1.45 } = {}) {
  // media console (floating) + TV + back panel
  l.rbox(w, 0.4, 0.42, 0, 0.42, 0.21, M.walnut, 0.012);
  for (let i = 0; i < Math.floor(w / 0.09); i++) l.box(0.012, 0.34, 0.012, -w / 2 + 0.06 + i * 0.09, 0.42, 0.427, M.walnut, { cast: false });
  l.box(w + 0.04, 0.018, 0.018, 0, 0.225, 0.426, M.black, { cast: false });
  l.box(w * 0.98, 0.012, 0.02, 0, 0.64, 0.2, M.emissiveWarm, { cast: false, receive: false });
  const th = tv * 0.5625;
  l.rbox(tv, th, 0.035, 0, 1.28, 0.03, M.tvBody, 0.008);
  l.rbox(tv - 0.03, th - 0.03, 0.004, 0, 1.28, 0.05, M.tvScreen, 0.002);
  l.rbox(w + 0.6, 2.4, 0.03, 0, 1.2, 0.005, M.oakLight, 0.004);
  for (let i = 0; i < Math.floor((w + 0.6) / 0.07); i++) l.box(0.02, 2.4, 0.02, -(w + 0.6) / 2 + 0.05 + i * 0.07, 1.2, 0.024, M.oakLight, { cast: false });
  l.box(w + 0.6, 0.012, 0.03, 0, 2.38, 0.03, M.emissiveWarm, { cast: false, receive: false });
}

/* ----------------------------------------------------- decor */
export function rug(l, w, d, mat = M.rug) {
  l.box(w, 0.012, d, 0, 0.006, 0, mat, { uvSpace: 'local', cast: false });
}
export const ART_ASPECT = { L: 1440 / 912, P: 811 / 1280, S: 1 };
export function picture(l, w, h, i = 0, y = 1.55) {
  const e = initFurnMats();
  const k = w / h > 1.15 ? 'L' : w / h < 0.87 ? 'P' : 'S';
  const a = ART_ASPECT[k];
  const aw = Math.min(w, h * a), ah = aw / a;
  const b = 0.025;
  l.box(aw + b * 2, ah + b * 2, 0.03, 0, y, 0.015, e.artFrame);
  const [px, pz] = l.p(0, 0.032);
  plane(l.L, aw, ah, px, l.y + y, pz, l.ry, e.art[k][i % e.art[k].length]);
}
export function curtainPair(l, w, h, mat = M.curtain, drape = true) {
  // l: frame at the wall, +z into the room, centred on the opening
  const e = initFurnMats();
  const pw = Math.max(0.5, w * 0.34);
  l.box(w + 0.7, 0.04, 0.1, 0, h + 0.05, 0.06, M.blackSteel);
  l.cyl(0.012, 0.012, w + 0.9, 0, h + 0.0, 0.08, M.brass, { seg: 8, rz: Math.PI / 2 });
  // sheer inner layer
  l.box(w + 0.4, h - 0.06, 0.004, 0, h / 2 + 0.01, 0.045, e.sheer, { cast: false, receive: false });
  if (!drape) return;
  for (const s of [-1, 1]) {
    const x0 = s * (w / 2 + 0.16 - pw / 2);
    const n = Math.round(pw / 0.09);
    for (let i = 0; i < n; i++) {
      const x = x0 - pw / 2 + (pw / n) * (i + 0.5);
      l.box(pw / n * 0.98, h - 0.04, 0.03, x, h / 2, 0.095 + (i % 2 ? 0.03 : 0), mat, { cast: false });
    }
  }
}
export function plant(l, kind = 0, models, s = 1) {
  const names = ['potted_plant_01', 'potted_plant_02', 'potted_plant_04'];
  return models?.place(l.L.group, names[kind % 3], { x: l.x, y: l.y, z: l.z, ry: l.ry, s, interior: true });
}
export function vase(l, x, y, z, models, kind = 0, s = 1) {
  const names = ['ceramic_vase_01', 'ceramic_vase_02', 'ceramic_vase_04', 'brass_vase_01', 'metal_jug'];
  const [X, Z] = l.p(x, z);
  return models?.place(l.L.group, names[kind % names.length], { x: X, y: l.y + y, z: Z, ry: l.ry, s, interior: true });
}
export function bookStack(l, x, y, z, n = 3) {
  const mats = [M.book1, M.book2, M.book3];
  let yy = y;
  for (let i = 0; i < n; i++) { const h = 0.025 + (i % 2) * 0.01; l.box(0.22 - i * 0.012, h, 0.16, x + (i % 2 ? 0.01 : -0.008), yy + h / 2, z, mats[i % 3], { rx: 0, ry: i * 0.15 }); yy += h; }
}

/* ----------------------------------------------------- kitchen / bath */
export function baseCab(l, w, { d = 0.6, h = 0.86, door, handle, n } = {}) {
  const e = initFurnMats(); door ??= e.cabinetWhite; handle ??= e.stainless;
  const kick = 0.1;
  l.box(w, kick, d - 0.06, 0, kick / 2, -0.02, M.black);
  l.box(w, h - kick, d - 0.02, 0, kick + (h - kick) / 2, -0.01, M.oakLight);
  const nn = n ?? Math.max(1, Math.round(w / 0.6));
  for (let i = 0; i < nn; i++) {
    const x = -w / 2 + (w / nn) * (i + 0.5);
    l.rbox(w / nn - 0.008, h - kick - 0.03, 0.02, x, kick + (h - kick) / 2, d / 2 - 0.01, door, 0.003);
    l.box(w / nn - 0.12, 0.014, 0.014, x, h - 0.07, d / 2 + 0.014, handle);
  }
}
export function counterTop(l, w, d = 0.62, h = 0.86) { l.rbox(w + 0.02, 0.04, d + 0.03, 0, h + 0.02, 0.005, M.quartz, 0.004); }
export function wallCab(l, w, { d = 0.34, h = 0.72, y = 1.45, door } = {}) {
  const e = initFurnMats(); door ??= e.cabinetWhite;
  l.box(w, h, d - 0.02, 0, y + h / 2, -0.01, M.oakLight);
  const nn = Math.max(1, Math.round(w / 0.55));
  for (let i = 0; i < nn; i++) {
    const x = -w / 2 + (w / nn) * (i + 0.5);
    l.rbox(w / nn - 0.008, h - 0.01, 0.02, x, y + h / 2, d / 2 - 0.01, door, 0.003);
    l.box(0.014, 0.18, 0.014, x + (i % 2 ? -1 : 1) * (w / nn / 2 - 0.05), y + 0.1, d / 2 + 0.014, e.stainless);
  }
}
export function sink(l) {
  const e = initFurnMats();
  l.box(0.78, 0.012, 0.44, 0, 0.885, 0.0, e.stainless);
  l.box(0.7, 0.016, 0.36, 0, 0.883, 0, M.black);
  l.cyl(0.015, 0.015, 0.3, 0, 1.03, -0.22, M.chrome, { seg: 10 });
  l.bar([0, 1.17, -0.22], [0, 1.17, -0.08], 0.013, M.chrome);
  l.cyl(0.04, 0.04, 0.05, 0, 0.91, -0.22, M.chrome, { seg: 10 });
}
export function hob(l) {
  l.box(0.6, 0.012, 0.52, 0, 0.887, 0, M.black);
  for (const [x, z, r] of [[-0.14, -0.11, 0.08], [0.14, -0.11, 0.065], [-0.14, 0.12, 0.065], [0.15, 0.12, 0.085]]) l.cyl(r, r, 0.004, x, 0.894, z, M.blackSteel, { seg: 20 });
  for (let i = 0; i < 4; i++) l.cyl(0.016, 0.016, 0.02, -0.2 + i * 0.13, 0.78, 0.31, M.steel, { seg: 10, rx: Math.PI / 2 });
}
export function hood(l, w = 0.9, y = 1.65) {
  const e = initFurnMats();
  l.box(w, 0.1, 0.52, 0, y, 0.0, e.stainless);
  l.box(0.3, 2.6 - y, 0.28, 0, y + (2.6 - y) / 2, -0.12, e.stainless);
}
export function fridge(l) {
  const e = initFurnMats();
  l.box(0.72, 1.82, 0.7, 0, 0.91, 0, e.stainless);
  l.box(0.7, 0.012, 0.012, 0, 0.62, 0.352, M.black);
  for (const x of [-0.3, 0.3]) l.box(0.025, 0.7, 0.03, x, 1.1, 0.375, M.chrome);
  l.box(0.025, 0.4, 0.03, -0.3, 0.45, 0.375, M.chrome);
  l.box(0.025, 0.4, 0.03, 0.3, 0.45, 0.375, M.chrome);
}
export function toilet(l) {
  l.rbox(0.36, 0.2, 0.46, 0, 0.28, 0.08, M.ceramic, 0.07);
  l.rbox(0.28, 0.4, 0.2, 0, 0.35, -0.18, M.ceramic, 0.03);
  l.rbox(0.38, 0.04, 0.46, 0, 0.405, 0.1, M.ceramic, 0.02);
  l.rbox(0.38, 0.14, 0.2, 0, 0.12, -0.18, M.ceramic, 0.02);
  l.cyl(0.03, 0.03, 0.01, 0.1, 0.72, -0.235, M.chrome, { seg: 12 });
  l.rbox(0.36, 0.78, 0.16, 0, 0.39, -0.28, M.paintWhite, 0.02);
}
export function vanity(l, { w = 1.0, mirror = true, double = false } = {}) {
  l.rbox(w, 0.5, 0.48, 0, 0.5, 0, M.walnut, 0.012);
  l.rbox(w, 0.04, 0.5, 0, 0.77, 0, M.quartz, 0.006);
  for (let i = 0; i < (double ? 2 : 1); i++) {
    const x = double ? (i - 0.5) * (w / 2) : 0;
    l.cyl(0.19, 0.17, 0.12, x, 0.84, 0.02, M.ceramic, { seg: 28 });
    l.cyl(0.013, 0.013, 0.2, x, 0.9, -0.16, M.chrome, { seg: 10 });
    l.bar([x, 1.0, -0.16], [x, 1.0, -0.04], 0.012, M.chrome);
    if (mirror) {
      l.rbox(Math.min(0.8, w / (double ? 2 : 1) - 0.1), 0.95, 0.025, x, 1.55, -0.235, M.mirror, 0.004);
      l.box(Math.min(0.8, w / (double ? 2 : 1) - 0.1) + 0.02, 0.012, 0.02, x, 2.04, -0.235, M.emissiveWarm, { cast: false, receive: false });
    }
  }
  l.rbox(w - 0.04, 0.4, 0.02, 0, 0.45, 0.245, M.walnut, 0.004);
  for (let i = 0; i < 2; i++) l.box(0.2, 0.012, 0.014, (i - 0.5) * 0.3, 0.6, 0.26, M.brass);
  l.rbox(w, 0.035, 0.05, 0, 0.15, -0.2, M.black, 0.003);
}
export function shower(l, { w = 0.9, d = 0.95, h = 2.05 } = {}) {
  const e = initFurnMats();
  l.box(w, 0.04, d, 0, 0.02, 0, M.bathFloor);
  l.box(0.016, h, d, w / 2, h / 2, 0, e.glassClear, { cast: false, receive: false });
  l.box(w, h, 0.016, 0, h / 2, d / 2, e.glassClear, { cast: false, receive: false });
  l.box(0.03, h, 0.03, w / 2, h / 2, d / 2, M.chrome);
  l.box(0.03, 0.03, d, w / 2, h, 0, M.chrome);
  l.bar([-w / 2 + 0.1, 1.05, -d / 2 + 0.02], [-w / 2 + 0.1, 2.2, -d / 2 + 0.02], 0.014, M.chrome);
  l.bar([-w / 2 + 0.1, 2.2, -d / 2 + 0.02], [-w / 2 + 0.1, 2.2, -d / 2 + 0.3], 0.014, M.chrome);
  l.cyl(0.13, 0.13, 0.015, -w / 2 + 0.1, 2.2, -d / 2 + 0.3, M.chrome, { seg: 20 });
  l.cyl(0.02, 0.02, 0.02, -w / 2 + 0.05, 1.1, 0.0, M.chrome, { seg: 10, rz: Math.PI / 2 });
  l.box(0.3, 0.012, 0.012, -w / 2 + 0.02, 0.7, 0, M.chrome);
  l.box(0.28, 0.02, 0.08, 0, 0.9, -d / 2 + 0.05, M.chrome);
}
export function towelRail(l, w = 0.6) {
  const e = initFurnMats();
  l.bar([-w / 2, 0.0, 0], [w / 2, 0.0, 0], 0.012, M.chrome);
  l.box(0.03, 0.03, 0.08, -w / 2, 0, 0.04, M.chrome); l.box(0.03, 0.03, 0.08, w / 2, 0, 0.04, M.chrome);
  l.rbox(w * 0.8, 0.5, 0.025, 0, -0.26, 0.04, e.towel, 0.01);
}
