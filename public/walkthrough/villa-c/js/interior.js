import * as THREE from 'three';
import { Layer } from './builder.js';
import { Local } from './local.js';
import { M } from './mats.js';
import * as FN from './furniture.js';

const PI = Math.PI;
const FACE = { xp: PI / 2, xn: -PI / 2, zp: 0, zn: PI };

/**
 * Furnishing. Each level gets its own Layer so the floor switch hides furniture with the floor.
 * All coordinates are world metres (already mirrored to the viewer-from-the-road convention).
 */
export function buildInterior(A, G, M_, models) {
  FN.setModels(models);
  const X = FN.initFurnMats();
  const F = { layers: A.levels.map((l, i) => new Layer('furn-' + i)) };
  const rooms = {};
  for (const r of A.roomList) rooms[r.id] = r;
  const get = (id) => rooms[id];

  A.furnItems = [];
  const put = (r, x, z, ry, fn, fp) => {
    const bb = new THREE.Box3();
    const l = new Local(F.layers[r.level], x, r.floorY, z, ry, bb);
    fn(l);
    if (!bb.isEmpty()) A.furnItems.push({ room: r.id, level: r.level, tag: fn.name || 'piece', box: bb });
    if (fp) {
      const [w, d, h] = fp, sw = Math.abs(Math.sin(ry)) > 0.7, W = sw ? d : w, D = sw ? w : d;
      A.colliders.push({ x0: x - W / 2, x1: x + W / 2, z0: z - D / 2, z1: z + D / 2, y0: r.floorY, y1: r.floorY + h, level: r.level, furn: true });
    }
    return l;
  };
  const mp = (r, name, x, z, ry = 0, dy = 0, s = 1) => models?.place(F.layers[r.level].group, name, { x, y: r.floorY + dy, z, ry, s, interior: true });
  const light = (r, x, y, z, power = 1, color = 0xffd6a0) => A.lights.push({ level: r.level, x, y, z, room: r, power, color });
  const ceilY = (r) => {
    const big = ['living', 'majlis', 'bed'].includes(r.kind) && r.width > 2.6 && r.depth > 2.6;
    return r.floorY + (r.clearHeight || 2.85) + (big ? 0.11 : 0);
  };

  /* ================= generic bathroom pieces ================= */
  function bathA(r, o) {
    // o: shower:[x,z,ry,w,d], wc:[x,z,ry], vanity:[x,z,ry,w,double]
    if (o.shower) { const [x, z, ry, w, d] = o.shower; put(r, x, z, ry, (l) => FN.shower(l, { w, d }), [w, d, 2.0]); }
    if (o.wc) { const [x, z, ry] = o.wc; put(r, x, z, ry, FN.toilet, [0.4, 0.7, 0.8]); }
    if (o.vanity) { const [x, z, ry, w, dbl] = o.vanity; put(r, x, z, ry, (l) => FN.vanity(l, { w, double: !!dbl }), [w, 0.5, 0.9]); }
    if (o.towel) { const [x, z, ry] = o.towel; put(r, x, z, ry, (l) => FN.towelRail(l, 0.6)); }
    light(r, r.x + r.width / 2, r.floorY + 2.3, r.z + r.depth / 2, 0.8, 0xfff0dc);
  }

  /* ================= bedrooms ================= */
  function bedSet(r, { x, z, ry, w = 1.8, wardrobe, extras, ns = true, fan = true, rugSize = [2.6, 2.3], bench = true }) {
    const len = 2.08;
    const l = put(r, x, z, ry, (ll) => {
      FN.bed(ll, { w });
      if (ns) for (const s of [-1, 1]) FN.nightstand(ll.at(s * (w / 2 + 0.36), 0, -0.82));
      if (bench) { ll.rbox(w * 0.9, 0.06, 0.4, 0, 0.44, len / 2 + 0.38, M.leatherTan, 0.03); for (const s of [-1, 1]) ll.box(0.05, 0.42, 0.05, s * (w * 0.42), 0.21, len / 2 + 0.38, M.brass); }
      FN.rug(ll.at(0, 0, 0.35), rugSize[0], rugSize[1], M.rug2);
    }, [w + 0.2, len + 0.2, 1.0]);
    if (ns) for (const s of [-1, 1]) { const [px, pz] = l.p(s * (w / 2 + 0.36), -0.84); light(r, px, r.floorY + 0.95, pz, 0.5, 0xffc990); }
    if (fan) {
      const cy = ceilY(r);
      mp(r, 'ceiling_fan', r.x + r.width / 2, r.z + r.depth / 2, 0, cy - r.floorY - 0.52 + 0.0, 1);
    }
    for (const wd of wardrobe || []) {
      const [wx, wz, wry, ww, n] = wd;
      put(r, wx, wz, wry, (ll) => FN.wardrobe(ll, { w: ww, n: n || Math.round(ww / 0.5), h: (r.clearHeight || 2.8) - 0.25 }), [ww, 0.6, 2.4]);
    }
    extras?.(r);
  }

  /* ================= MAJLIS + LIVING ================= */
  const maj = get('gf-majlis');
  if (maj) {
    const y = maj.floorY;
    // fluted walnut feature wall behind the sofas
    const wl = new Local(F.layers[0], 0.17, y, 6.7, PI / 2);
    for (let i = 0; i < 74; i++) wl.box(0.035, 2.74, 0.03, -2.78 + i * 0.075, 1.37, 0.015, M.walnut, { cast: false });
    wl.box(5.6, 0.02, 0.05, 0, 0.0, 0.05, M.black, { cast: false });
    wl.box(5.5, 0.014, 0.05, 0, 2.7, 0.08, M.emissiveWarm, { cast: false, receive: false });
    put(maj, 2.15, 6.45, 0, (l) => FN.rug(l, 3.3, 4.7, M.rug2));
    put(maj, 0.69, 5.1, FACE.xp, (l) => FN.sofa(l, { w: 2.1, d: 0.98, fab: M.fabricSand, pillows: [M.fabricRust, M.fabricTeal, M.fabricCream, M.fabricRust], n: 3, low: 0.12, model: 'sofa_modern' }), [2.1, 0.98, 0.9]);
    put(maj, 0.69, 7.3, FACE.xp, (l) => FN.sofa(l, { w: 2.1, d: 0.98, fab: M.fabricSand, pillows: [M.fabricTeal, M.fabricRust, M.fabricCream], n: 3, low: 0.12, model: 'sofa_modern' }), [2.1, 0.98, 0.9]);
    put(maj, 0.62, 8.95, FACE.xp, (l) => { FN.sideTable(l, { r: 0.26, h: 0.56 }); FN.tableLamp(l.at(0, 0.57, 0)); });
    light(maj, 0.62, y + 1.0, 8.95, 0.5, 0xffc990);
    put(maj, 1.95, 5.15, 0, (l) => { FN.coffeeTable(l, { w: 1.15, d: 0.68, model: 'modern_coffee_table_02' }); FN.bookStack(l, -0.28, 0.42, 0.0, 3); }, [1.2, 0.7, 0.45]);
    put(maj, 1.95, 7.55, 0, (l) => FN.coffeeTable(l, { w: 1.15, d: 0.68, top: M.quartz, model: 'modern_coffee_table_02' }), [1.2, 0.7, 0.45]);
    mp(maj, 'tea_set_01', 2.1, 5.15, 0.4, 0.42);
    mp(maj, 'brass_vase_01', 1.7, 7.55, 0, 0.42, 0.7);
    mp(maj, 'mid_century_lounge_chair', 3.2, 4.65, FACE.xn + 0.35);
    mp(maj, 'modern_arm_chair_01', 3.45, 7.6, FACE.xn - 0.2);
    A.colliders.push({ x0: 2.45, x1: 3.45, z0: 4.25, z1: 5.25, y0: y, y1: y + 0.9, level: 0, furn: true });
    A.colliders.push({ x0: 2.95, x1: 3.95, z0: 7.1, z1: 8.1, y0: y, y1: y + 0.9, level: 0, furn: true });
    put(maj, 4.04, 5.7, FACE.xn, (l) => { FN.console_(l, { w: 0.9, d: 0.34, h: 0.84 }); FN.tableLamp(l.at(-0.28, 0.85, 0)); }, [0.9, 0.34, 0.9]);
    put(maj, 4.215, 5.7, FACE.xn, (l) => FN.picture(l, 0.7, 1.0, 1, 1.55));
    mp(maj, 'ceramic_vase_01', 4.04, 5.95, 0, 0.84, 1.0);
    for (const [z, i] of [[5.1, 0], [7.3, 2]]) put(maj, 0.2, z, FACE.xp, (l) => FN.picture(l, 1.5, 0.95, i, 1.55));
    mp(maj, 'Chandelier_02', 2.15, 6.45, 0, ceilY(maj) - y - 0.85 + 0.0, 1.5);
    light(maj, 2.15, y + 2.2, 6.45, 1.6, 0xffd9a8);
    light(maj, 2.15, y + 2.3, 4.6, 0.7); light(maj, 2.15, y + 2.3, 8.4, 0.7);
    mp(maj, 'wall_clock', 4.2, 8.85, FACE.xn, 1.9, 1.2);
  }

  const liv = get('gf-living');
  if (liv) {
    const y = liv.floorY;
    put(liv, 2.35, 13.0, 0, (l) => FN.rug(l, 2.9, 3.5, M.rug));
    put(liv, 0.17, 13.0, FACE.xp, (l) => FN.tvWall(l, { w: 1.9 }), [0.45, 1.9, 0.7]);
    put(liv, 3.15, 13.0, FACE.xn, (l) => FN.sofa(l, { w: 2.35, d: 1.0, fab: M.fabricCream, pillows: [M.fabricTeal, M.fabricRust, M.fabricSand], low: 0.12, model: 'sofa_modern' }), [2.35, 1.0, 0.9]);
    put(liv, 1.8, 13.0, FACE.xp, (l) => FN.coffeeTable(l, { w: 1.1, d: 0.7, model: 'coffee_table_round_01' }), [0.8, 1.1, 0.45]);
    mp(liv, 'modern_arm_chair_01', 1.9, 14.35, PI + 0.3);
    put(liv, 3.95, 11.8, 0, (l) => { FN.sideTable(l); FN.tableLamp(l.at(0, 0.56, 0)); });
    put(liv, 3.88, 14.35, 0, (l) => FN.floorLamp(l));
    light(liv, 3.88, y + 1.8, 14.35, 0.7, 0xffc990);
    mp(liv, 'potted_plant_01', 0.55, 14.45, 1.0, 0, 0.8);
    mp(liv, 'potted_plant_02', 3.95, 9.75, 0.2);
    mp(liv, 'ceramic_vase_02', 1.75, 13.1, 0, 0.42, 1.0);
    // dining
    put(liv, 2.2, 10.7, 0, (l) => FN.diningTable(l, { w: 1.0, d: 2.0 }), [1.0, 2.0, 0.8]);
    for (const z of [-0.65, 0, 0.65]) {
      put(liv, 1.35, 10.7 + z, FACE.xp, (l) => FN.diningChair(l, { fab: M.fabricSand }));
      put(liv, 3.05, 10.7 + z, FACE.xn, (l) => FN.diningChair(l, { fab: M.fabricSand }));
    }
    mp(liv, 'ceramic_vase_04', 2.2, 10.7, 0, 0.75, 1.2);
    mp(liv, 'brass_vase_01', 2.2, 10.2, 0, 0.75, 0.6);
    for (const z of [-0.65, 0, 0.65]) {
      const l = new Local(F.layers[0], 2.2, y, 10.7 + z, 0);
      l.cyl(0.002, 0.002, 1.1, 0, 2.0, 0, M.blackSteel, { seg: 4 });
      l.cyl(0.13, 0.17, 0.2, 0, 1.4, 0, M.lampShade, { seg: 24 });
    }
    light(liv, 2.2, y + 1.7, 10.7, 1.0);
    mp(liv, 'modern_wooden_cabinet', 0.55, 10.65, FACE.xp);
    A.colliders.push({ x0: 0.18, x1: 0.9, z0: 9.45, z1: 11.9, y0: y, y1: y + 0.7, level: 0, furn: true });
    put(liv, 0.18, 10.65, FACE.xp, (l) => FN.picture(l, 1.3, 0.9, 3, 1.55));
    light(liv, 2.2, y + 2.4, 13.0, 1.0);
  }

  const shall = get('gf-stair-hall');
  if (shall) {
    put(shall, 3.65, 17.2, 0, (l) => FN.rug(l, 0.9, 3.6, M.rug2));
    mp(shall, 'potted_plant_01', 3.55, 19.3, 0.5);
    put(shall, 4.2, 19.0, FACE.xn, (l) => FN.picture(l, 0.8, 0.8, 2, 1.55));
  }

  /* ================= kitchen ================= */
  const kit = get('gf-kitchen');
  if (kit) {
    const y = kit.floorY, e = X;
    const east = (z, w, fn) => put(kit, 8.275, z, FACE.xn, fn, [w, 0.6, 0.9]);
    put(kit, 8.2, 16.99, FACE.xn, FN.fridge, [0.72, 0.7, 1.85]);
    east(18.05, 1.4, (l) => FN.baseCab(l, 1.4, { door: e.cabinetGrey }));
    east(19.05, 0.6, (l) => FN.baseCab(l, 0.6, { door: e.cabinetGrey }));
    east(19.65, 0.6, (l) => FN.baseCab(l, 0.6, { door: e.cabinetGrey }));
    east(20.2, 0.5, (l) => FN.baseCab(l, 0.5, { door: e.cabinetGrey }));
    put(kit, 8.275, 18.875, FACE.xn, (l) => FN.counterTop(l, 3.05));
    put(kit, 8.275, 18.15, FACE.xn, (l) => FN.sink(l));
    put(kit, 8.275, 19.65, FACE.xn, (l) => FN.hob(l));
    put(kit, 8.3, 19.65, FACE.xn, (l) => FN.hood(l, 0.9));
    put(kit, 8.405, 19.65, FACE.xn, (l) => FN.wallCab(l, 1.5, { door: e.cabinetGrey }));
    put(kit, 8.405, 18.15, FACE.xn, (l) => { l.rbox(1.3, 0.025, 0.28, 0, 1.45, 0, M.walnut, 0.005); });
    // north run under the courtyard window
    for (const x of [7.575, 6.975, 6.375]) put(kit, x, 16.925, 0, (l) => FN.baseCab(l, 0.6, { door: e.cabinetGrey }), [0.6, 0.6, 0.9]);
    put(kit, 6.975, 16.925, 0, (l) => FN.counterTop(l, 1.8));
    mp(kit, 'metal_jug', 7.5, 16.95, 0, 0.9, 1.0);
    mp(kit, 'wicker_basket_01', 6.5, 16.95, 0.3, 0.9, 1.0);
    // south run
    for (const x of [7.675, 7.075, 6.475]) put(kit, x, 20.225, FACE.zn, (l) => FN.baseCab(l, 0.6, { door: e.cabinetGrey }), [0.6, 0.6, 0.9]);
    put(kit, 7.075, 20.225, FACE.zn, (l) => FN.counterTop(l, 1.8));
    put(kit, 7.05, 20.355, FACE.zn, (l) => FN.wallCab(l, 1.5, { door: e.cabinetGrey }));
    // island
    for (const z of [18.0, 18.65, 19.3]) put(kit, 6.0, z, FACE.xn, (l) => FN.baseCab(l, 0.65, { door: e.cabinetWhite, d: 0.9 }), [0.9, 0.65, 0.9]);
    put(kit, 6.0, 18.65, FACE.xn, (l) => { l.rbox(2.1, 0.045, 1.0, 0, 0.9, 0, M.quartz, 0.005); });
    put(kit, 5.88, 18.65, FACE.xn, (l) => l.rbox(1.9, 0.12, 0.3, 0, 0.82, -0.52, M.walnut, 0.01));
    mp(kit, 'ceramic_vase_01', 6.0, 18.65, 0, 0.92, 1.0);
    mp(kit, 'tea_set_01', 6.1, 19.2, 0.5, 0.92, 1.1);
    for (const z of [17.95, 18.65, 19.35]) put(kit, 5.25, z, 0, FN.barStool, [0.4, 0.4, 0.7]);
    for (const z of [18.0, 18.65, 19.3]) {
      const l = new Local(F.layers[0], 6.0, y, z, 0);
      l.cyl(0.0035, 0.0035, 0.9, 0, 2.5, 0, M.black, { seg: 4 }); l.cyl(0.11, 0.14, 0.2, 0, 1.9, 0, M.emissiveWarm, { seg: 20 });
    }
    light(kit, 6.0, y + 1.9, 18.65, 1.4, 0xffd9a8);
    light(kit, 7.3, y + 2.3, 19.4, 0.7); light(kit, 5.2, y + 2.3, 17.6, 0.6);
    mp(kit, 'potted_plant_04', 7.75, 20.25, 0, 0.9, 1.4);
    mp(kit, 'wall_clock', 4.5, 19.2, FACE.xp, 2.0, 1.2);
  }

  /* ================= small GF rooms ================= */
  const ent = get('gf-entrance');
  if (ent) {
    put(ent, 5.4, 5.0, FACE.xn, (l) => { FN.console_(l, { w: 0.9, d: 0.32, h: 0.8 }); FN.tableLamp(l.at(-0.22, 0.81, 0), { h: 0.3 }); }, [0.9, 0.32, 0.9]);
    put(ent, 5.5, 5.0, FACE.xn, (l) => { l.rbox(0.8, 1.5, 0.03, 0, 1.55, 0, M.mirror, 0.01); l.box(0.86, 1.56, 0.02, 0, 1.55, -0.012, M.brass); });
    put(ent, 4.95, 4.55, 0, (l) => FN.rug(l, 0.9, 1.1, M.rug2));
    light(ent, 4.95, ent.floorY + 2.3, 4.8, 0.8, 0xfff0dc);
  }
  const pan = get('gf-pantry');
  if (pan) {
    put(pan, 5.1, 7.55, FACE.zn, (l) => { FN.baseCab(l, 1.0); FN.counterTop(l, 1.0); }, [1.0, 0.6, 0.9]);
    put(pan, 5.1, 7.7, FACE.zn, (l) => FN.wallCab(l, 1.0));
    mp(pan, 'tea_set_01', 5.3, 7.55, 0.3, 0.9, 1.0);
    light(pan, 5.1, pan.floorY + 2.3, 6.8, 0.6, 0xfff0dc);
  }
  const pdr = get('gf-powder');
  if (pdr) {
    bathA(pdr, { wc: [6.45, 7.5, FACE.zn], vanity: [7.0, 6.75, FACE.xn, 0.7] });
  }
  const b4 = get('gf-bath4');
  if (b4) bathA(b4, { shower: [0.63, 18.72, 0, 0.88, 1.6], wc: [1.75, 19.2, FACE.zn], vanity: [2.45, 18.14, 0, 0.9], towel: [1.3, 17.95, 0] });
  const drv = get('gf-driver');
  if (drv) {
    bedSet(drv, { x: 0.95, z: 1.2, ry: FACE.xn + PI, w: 1.0, wardrobe: [], ns: false, fan: false, rugSize: [1.4, 1.6], bench: false });
  }
  const dbath = get('gf-driver-bath');
  if (dbath) bathA(dbath, { wc: [0.65, 2.55, 0], vanity: [1.0, 3.45, FACE.zn, 0.6] });

  const gb = get('gf-bedroom');
  if (gb) bedSet(gb, { x: 1.75, z: 20.8, ry: FACE.zp - 0, w: 1.5, wardrobe: [[1.15, 22.46, FACE.zn, 1.9, 4]], extras: (r) => {
    mp(r, 'mid_century_lounge_chair', 3.55, 21.6, FACE.xn, 0, 0.9);
    put(r, 3.8, 20.05, FACE.xn, (l) => { FN.console_(l, { w: 0.8, h: 0.78 }); });
  } });

  /* ================= FIRST FLOOR ================= */
  const master = get('ff-master');
  if (master) {
    bedSet(master, { x: 3.03, z: 5.5, ry: FACE.xn, w: 1.9, wardrobe: [], rugSize: [2.9, 2.5], extras: (r) => {
      put(r, 4.215, 5.5, FACE.xn, (l) => { FN.picture(l, 0.9, 1.1, 0, 1.6); });
      mp(r, 'mid_century_lounge_chair', 0.7, 4.55, FACE.xp + 0.5);
      mp(r, 'modern_arm_chair_01', 0.7, 6.1, FACE.xp - 0.4);
      put(r, 0.75, 5.35, 0, (l) => { FN.sideTable(l, { r: 0.27 }); }, [0.5, 0.5, 0.6]);
      mp(r, 'ceramic_vase_02', 0.75, 5.35, 0, 0.58, 0.9);
      put(r, 3.9, 7.5, FACE.zn, (l) => FN.dresserUnit(l, { w: 1.3 }), [1.3, 0.5, 0.9]);
      put(r, 3.9, 7.62, FACE.zn, (l) => FN.picture(l, 0.9, 0.7, 3, 1.6));
    } });
  }
  const dres = get('ff-dresser');
  if (dres) {
    put(dres, 0.5, 8.65, FACE.xp, (l) => FN.wardrobe(l, { w: 1.4, n: 3, h: 2.5 }), [1.4, 0.6, 2.4]);
    put(dres, 1.2, 9.12, FACE.zn, (l) => FN.dresserUnit(l, { w: 1.2 }), [1.2, 0.5, 0.9]);
    put(dres, 1.5, 8.6, 0, (l) => { l.rbox(0.8, 0.45, 0.45, 0, 0.225, 0, M.fabricSand, 0.06); });
    light(dres, 1.2, dres.floorY + 2.3, 8.6, 0.6, 0xfff0dc);
  }
  const mbath = get('ff-master-bath');
  if (mbath) bathA(mbath, { shower: [0.61, 10.42, 0, 0.88, 1.7], wc: [1.75, 9.9, 0], vanity: [2.1, 11.06, FACE.zn, 1.4, true] });
  const mentry = get('ff-master-entry');
  if (mentry) { mp(mentry, 'potted_plant_02', 3.6, 9.15, 0.5); put(mentry, 3.15, 8.7, FACE.xp, (l) => FN.picture(l, 0.6, 0.9, 1, 1.55)); }

  const b2 = get('ff-bedroom2');
  if (b2) bedSet(b2, { x: 5.6, z: 5.4, ry: FACE.xp - 0 + PI, w: 1.5, wardrobe: [[7.1, 7.31, FACE.zn, 2.4, 5]], extras: (r) => {
    put(r, 8.2, 6.65, FACE.xn, (l) => { FN.desk(l, { w: 1.2 }); }, [0.62, 1.2, 0.8]);
    put(r, 7.65, 6.65, FACE.xp, (l) => FN.deskChair(l));
  } });
  const bt1 = get('ff-bath1');
  if (bt1) bathA(bt1, { shower: [8.1, 8.6, 0, 0.9, 1.5], wc: [6.5, 9.02, FACE.zn], vanity: [6.05, 8.4, FACE.xp, 0.9] });
  const fl = get('ff-family-living');
  if (fl) {
    const y = fl.floorY;
    put(fl, 2.0, 13.1, 0, (l) => FN.rug(l, 2.8, 2.9, M.rug));
    put(fl, 1.7, 11.4, FACE.zp, (l) => FN.tvWall(l, { w: 2.0 }), [2.0, 0.45, 0.7]);
    put(fl, 1.9, 14.25, FACE.zn, (l) => FN.sofa(l, { w: 2.0, d: 1.0, fab: M.fabricGrey, pillows: [M.fabricRust, M.fabricSand], low: 0.12, model: 'Sofa_01' }), [2.35, 1.0, 0.9]);
    put(fl, 1.9, 12.85, 0, (l) => FN.coffeeTable(l, { w: 0.9, d: 0.6, model: 'modern_coffee_table_01' }), [1.0, 0.6, 0.45]);
    mp(fl, 'modern_arm_chair_01', 3.6, 12.8, FACE.xn + 0.3);
    mp(fl, 'potted_plant_01', 0.5, 11.7, 0.0);
    put(fl, 3.9, 14.35, 0, (l) => FN.floorLamp(l));
    light(fl, 1.9, y + 2.3, 12.9, 1.0);
  }
  const b3 = get('ff-bedroom3');
  if (b3) bedSet(b3, { x: 7.2, z: 19.3, ry: FACE.zn, w: 1.8, wardrobe: [[4.8, 19.35, FACE.xp, 2.1, 4]], extras: (r) => {
    put(r, 5.8, 17.0, FACE.zp, (l) => FN.desk(l, { w: 1.2 }), [1.2, 0.62, 0.8]);
    put(r, 5.8, 17.6, FACE.zn, (l) => FN.deskChair(l));
  } });
  const b4f = get('ff-bedroom4');
  if (b4f) bedSet(b4f, { x: 1.75, z: 20.8, ry: FACE.zp, w: 1.5, wardrobe: [[1.15, 22.46, FACE.zn, 1.9, 4]], extras: (r) => {
    mp(r, 'modern_arm_chair_01', 3.6, 21.6, FACE.xn + 0.3, 0, 0.9);
  } });
  const bt2 = get('ff-bath2');
  if (bt2) bathA(bt2, { shower: [0.63, 18.75, 0, 0.88, 1.6], wc: [1.75, 19.2, FACE.zn], vanity: [2.45, 18.2, 0, 0.9] });
  const fcor = get('ff-front-corridor'), fsh = get('ff-stair-hall');
  if (fsh) { put(fsh, 3.65, 17.2, 0, (l) => FN.rug(l, 0.9, 3.6, M.rug2)); mp(fsh, 'potted_plant_01', 3.55, 19.3, 0.5); }
  if (fcor) { put(fcor, 3.6, 10.4, 0, (l) => FN.rug(l, 0.8, 1.6, M.rug2)); }

  /* ================= SECOND FLOOR ================= */
  const maid = get('sf-maid');
  if (maid) bedSet(maid, { x: 1.0, z: 12.45, ry: FACE.xn + PI, w: 1.0, wardrobe: [[2.55, 12.5, FACE.xn, 1.4, 3]], ns: false, fan: false, rugSize: [1.5, 1.8], bench: false });
  const mbat = get('sf-maid-bath');
  if (mbat) bathA(mbat, { wc: [1.0, 13.9, 0], vanity: [1.75, 14.55, FACE.zn, 0.6] });
  const bt3 = get('sf-bath3');
  if (bt3) bathA(bt3, { shower: [0.63, 18.75, 0, 0.88, 1.6], wc: [1.75, 19.2, FACE.zn], vanity: [2.45, 18.2, 0, 0.9] });
  const b5 = get('sf-bedroom5');
  if (b5) bedSet(b5, { x: 1.75, z: 20.8, ry: FACE.zp, w: 1.5, wardrobe: [[1.15, 22.46, FACE.zn, 1.9, 4]], extras: (r) => {
    mp(r, 'mid_century_lounge_chair', 3.6, 21.6, FACE.xn + 0.3, 0, 0.9);
  } });
  const ssh = get('sf-stair-hall');
  if (ssh) { put(ssh, 3.65, 17.2, 0, (l) => FN.rug(l, 0.9, 3.6, M.rug2)); mp(ssh, 'potted_plant_02', 3.55, 19.3, 0.5); }

  /* ================= terraces ================= */
  function lounger(l) {
    l.rbox(0.7, 0.1, 1.9, 0, 0.35, 0, M.fabricSand, 0.04);
    l.rbox(0.7, 0.32, 0.12, 0, 0.5, -0.9, M.fabricSand, 0.05, { rx: -0.9 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) l.cyl(0.02, 0.02, 0.3, sx * 0.3, 0.15, sz * 0.8, M.blackSteel, { seg: 8 });
  }
  const t1 = get('ff-front-terrace');
  if (t1) {
    mp(t1, 'potted_plant_01', 0.45, 0.65, 0.4);
    put(t1, 1.6, 1.4, FACE.xp, (l) => FN.roundTable(l, { r: 0.35, h: 0.5, top: M.blackMarble, base: M.blackSteel }), [0.7, 0.7, 0.5]);
    mp(t1, 'modern_arm_chair_01', 0.9, 1.4, FACE.xp, 0, 0.8);
  }
  const t2 = get('sf-front-main-terrace');
  if (t2) {
    mp(t2, 'outdoor_table_chair_set_01', 1.6, 5.2, FACE.xp);
    A.colliders.push({ x0: 1.0, x1: 2.4, z0: 4.3, z1: 6.1, y0: t2.floorY, y1: t2.floorY + 0.9, level: 2, furn: true });
    put(t2, 3.4, 8.4, 0, lounger, [0.7, 1.9, 0.5]);
    put(t2, 2.5, 8.4, 0, lounger, [0.7, 1.9, 0.5]);
    mp(t2, 'potted_plant_01', 0.55, 3.9, 0.3, 0, 1.3);
    mp(t2, 'potted_plant_02', 3.8, 3.9, 0.9, 0, 1.2);
    mp(t2, 'potted_plant_01', 0.5, 10.7, 1.9, 0, 1.2);
    mp(t2, 'potted_plant_02', 3.8, 10.8, 0.1, 0, 1.2);
    mp(t2, 'exterior_aircon_unit', 3.6, 6.4, FACE.xn);
  }
  const t3 = get('sf-front-left-terrace');
  if (t3) {
    mp(t3, 'outdoor_table_chair_set_01', 6.4, 6.4, 0);
    mp(t3, 'potted_plant_01', 8.2, 4.3, 0.5, 0, 1.2);
    mp(t3, 'potted_plant_02', 4.8, 9.0, 0.8, 0, 1.2);
    A.colliders.push({ x0: 6.0, x1: 6.8, z0: 5.5, z1: 7.3, y0: t3.floorY, y1: t3.floorY + 0.9, level: 2, furn: true });
  }
  const t4 = get('sf-rear-terrace');
  if (t4) {
    mp(t4, 'potted_plant_01', 8.0, 17.1, 0.2, 0, 1.2);
    mp(t4, 'potted_plant_02', 8.1, 20.1, 0.9, 0, 1.2);
    put(t4, 6.6, 18.5, 0, lounger, [0.7, 1.9, 0.5]);
    mp(t4, 'outdoor_table_chair_set_01', 5.3, 18.8, FACE.xp);
  }

  /* ================= curtains on the windows of living spaces ================= */
  const curtainRooms = new Set(['bed', 'living', 'majlis']);
  for (const w of A.windows) {
    if (!curtainRooms.has(w.room.kind)) continue;
    const lv = w.level, fy = A.levels[lv].floorY, ry = Math.atan2(w.nx, w.nz);
    const l = new Local(F.layers[lv], w.x + w.nx * 0.01, fy, w.z + w.nz * 0.01, ry);
    FN.curtainPair(l, w.w, Math.min((w.room.clearHeight || 2.8) - 0.2, 2.55), M.curtain);
  }

  // door mats on thresholds that open outside
  F.lights = A.lights;
  return F;
}
