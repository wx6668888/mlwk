import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Layer, rng, matrixFrom } from './builder.js';
import { Local, plane } from './local.js';
import { M, register } from './mats.js';

const D2R = Math.PI / 180;

/* ------------------------------------------------------------------ */
/* Foliage collector: vertex-coloured non-indexed geometry, one mesh    */
/* ------------------------------------------------------------------ */
class Fol {
  constructor(keepUV = false) { this.g = []; this.keepUV = keepUV; }
  add(geo, m4) {
    let g = geo.index ? geo.toNonIndexed() : geo.clone();
    const keep = this.keepUV ? ['position', 'normal', 'color', 'uv'] : ['position', 'normal', 'color'];
    for (const n of Object.keys(g.attributes)) if (!keep.includes(n)) g.deleteAttribute(n);
    if (!g.attributes.normal) g.computeVertexNormals();
    if (m4) g.applyMatrix4(m4);
    this.g.push(g);
    return g;
  }
  build(mat, { cast = true } = {}) {
    if (!this.g.length) return null;
    const merged = mergeGeometries(this.g, false);
    this.g.forEach((g) => g.dispose());
    const mesh = new THREE.Mesh(merged, mat);
    mesh.castShadow = cast; mesh.receiveShadow = true;
    return mesh;
  }
}

function colorize(geo, fn) {
  const p = geo.attributes.position, c = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) { const [r, g, b] = fn(p.getX(i), p.getY(i), p.getZ(i), i); c[i * 3] = r; c[i * 3 + 1] = g; c[i * 3 + 2] = b; }
  geo.setAttribute('color', new THREE.BufferAttribute(c, 3));
  return geo;
}
const toLin = (hex) => new THREE.Color(hex).convertSRGBToLinear();

function sprigTexture() {
  const S = 256, c = document.createElement('canvas'); c.width = c.height = S;
  const x = c.getContext('2d');
  const leaf = (cx, cy, ang, len, wid) => {
    x.save(); x.translate(cx, cy); x.rotate(ang);
    const g = x.createLinearGradient(0, 0, len, 0); g.addColorStop(0, '#9a9a9a'); g.addColorStop(0.6, '#f2f2f2'); g.addColorStop(1, '#d8d8d8');
    x.fillStyle = g; x.beginPath(); x.moveTo(0, 0);
    x.bezierCurveTo(len * 0.25, -wid, len * 0.75, -wid * 0.8, len, 0);
    x.bezierCurveTo(len * 0.75, wid * 0.8, len * 0.25, wid, 0, 0); x.fill();
    x.strokeStyle = 'rgba(70,70,70,0.9)'; x.lineWidth = 2; x.beginPath(); x.moveTo(0, 0); x.lineTo(len * 0.95, 0); x.stroke();
    x.strokeStyle = 'rgba(90,90,90,0.5)'; x.lineWidth = 1;
    for (let k = 1; k < 6; k++) { x.beginPath(); x.moveTo(len * k / 6.5, 0); x.lineTo(len * (k + 1.2) / 6.5, -wid * 0.6); x.moveTo(len * k / 6.5, 0); x.lineTo(len * (k + 1.2) / 6.5, wid * 0.6); x.stroke(); }
    x.restore();
  };
  x.strokeStyle = '#555'; x.lineWidth = 3; x.beginPath(); x.moveTo(S / 2, S - 4); x.lineTo(S / 2, S * 0.2); x.stroke();
  leaf(S / 2, S - 6, -Math.PI / 2, S * 0.38, 26);
  leaf(S / 2, S * 0.7, -Math.PI / 2 - 0.9, S * 0.34, 24); leaf(S / 2, S * 0.7, -Math.PI / 2 + 0.9, S * 0.34, 24);
  leaf(S / 2, S * 0.5, -Math.PI / 2 - 0.8, S * 0.3, 22); leaf(S / 2, S * 0.5, -Math.PI / 2 + 0.8, S * 0.3, 22);
  leaf(S / 2, S * 0.3, -Math.PI / 2 - 0.55, S * 0.26, 18); leaf(S / 2, S * 0.3, -Math.PI / 2 + 0.55, S * 0.26, 18);
  leaf(S / 2, S * 0.22, -Math.PI / 2, S * 0.2, 16);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}


/* ------------------------------------------------------------------ */
/* Date palm: instanced trunk + crown                                   */
/* ------------------------------------------------------------------ */
function crownGeometry(R, nFronds = 34) {
  const pos = [], col = [];
  const push = (a, b, c, ca, cb, cc) => { pos.push(...a, ...b, ...c); col.push(...ca, ...cb, ...cc); };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  for (let i = 0; i < nFronds; i++) {
    const r = i / (nFronds - 1);
    const phi = i * 2.39996 + R() * 0.3;
    const e0 = THREE.MathUtils.lerp(72, -22, Math.pow(r, 0.85)) * D2R + (R() - 0.5) * 0.15;
    const k = THREE.MathUtils.lerp(30, 100, r) * D2R;
    const Lf = THREE.MathUtils.lerp(2.7, 4.0, Math.sin(Math.min(1, r * 1.4) * Math.PI * 0.5)) * (0.9 + R() * 0.2);
    const dead = r > 0.82 && R() > 0.55;
    const green = dead ? toLin('#9a8052') : toLin(['#3f6a1c', '#4a7524', '#386018', '#56802a'][Math.floor(R() * 4)]);
    const tipCol = dead ? toLin('#b49a66') : green.clone().lerp(toLin('#9bb542'), 0.45);
    const N = 16, side = V(-Math.sin(phi), 0, Math.cos(phi));
    let p = V(0, 0, 0); const pts = [], tans = [];
    for (let j = 0; j <= N; j++) {
      const t = j / N, e = e0 - k * t * t - 0.05 * t;
      const T = V(Math.cos(e) * Math.cos(phi), Math.sin(e), Math.cos(e) * Math.sin(phi));
      pts.push(p.clone()); tans.push(T);
      p = p.clone().addScaledVector(T, Lf / N);
    }
    // rachis ribbon
    for (let j = 0; j < N; j++) {
      const t0 = j / N, t1 = (j + 1) / N, w0 = 0.075 * (1 - t0) + 0.006, w1 = 0.075 * (1 - t1) + 0.006;
      const a = pts[j].clone().addScaledVector(side, -w0), b = pts[j].clone().addScaledVector(side, w0);
      const c = pts[j + 1].clone().addScaledVector(side, -w1), d = pts[j + 1].clone().addScaledVector(side, w1);
      const cr = dead ? toLin('#8a7448') : toLin('#7f8f3d');
      push(a.toArray(), b.toArray(), d.toArray(), [cr.r, cr.g, cr.b], [cr.r, cr.g, cr.b], [cr.r, cr.g, cr.b]);
      push(a.toArray(), d.toArray(), c.toArray(), [cr.r, cr.g, cr.b], [cr.r, cr.g, cr.b], [cr.r, cr.g, cr.b]);
    }
    // leaflets
    const nLeaf = dead ? 16 : 30;
    for (let m = 0; m < nLeaf; m++) {
      const t = 0.14 + 0.86 * (m / (nLeaf - 1)), j = Math.min(N - 1, Math.floor(t * N)), f = t * N - j;
      const base = pts[j].clone().lerp(pts[j + 1], f), T = tans[j].clone().lerp(tans[j + 1], f).normalize();
      const U = new THREE.Vector3().crossVectors(side, T).normalize();
      const len = (dead ? 0.35 : 0.72) * Math.pow(Math.sin(Math.PI * (0.1 + 0.9 * t)), 0.75) * (0.85 + R() * 0.3) * (Lf / 3.4);
      for (const s of [-1, 1]) {
        const a = (38 + R() * 14) * D2R;
        const dir = T.clone().multiplyScalar(0.62).addScaledVector(side, s * Math.cos(a)).addScaledVector(U, Math.sin(a)).normalize();
        const mid = base.clone().addScaledVector(dir, len * 0.5).add(V(0, -len * 0.06, 0));
        const tip = base.clone().addScaledVector(dir, len).add(V(0, -len * (0.22 + (dead ? 0.3 : 0)), 0));
        const w = 0.017 + 0.012 * (1 - t);
        const bl = base.clone().addScaledVector(T, -w), br = base.clone().addScaledVector(T, w);
        const ml = mid.clone().addScaledVector(T, -w * 0.85), mr = mid.clone().addScaledVector(T, w * 0.85);
        const c0 = green.clone().multiplyScalar(0.8 + R() * 0.4), c1 = green.clone().lerp(tipCol, 0.5), c2 = tipCol;
        push(bl.toArray(), br.toArray(), mr.toArray(), c0.toArray(), c0.toArray(), c1.toArray());
        push(bl.toArray(), mr.toArray(), ml.toArray(), c0.toArray(), c1.toArray(), c1.toArray());
        push(ml.toArray(), mr.toArray(), tip.toArray(), c1.toArray(), c1.toArray(), c2.toArray());
      }
    }
  }
  // fruit stalks / heart
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}

function trunkGeometry(H = 6.2) {
  const rows = 18, seg = 18, pos = [], uv = [], idx = [];
  for (let j = 0; j <= rows; j++) {
    const t = j / rows, y = t * H;
    const r = 0.17 + 0.11 * Math.exp(-t * 14) + 0.015 * Math.sin(t * 9) + (1 - t) * 0.025;
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2;
      pos.push(Math.cos(a) * r, y, Math.sin(a) * r);
      uv.push(i / seg, y / 5.6);
    }
  }
  for (let j = 0; j < rows; j++) for (let i = 0; i < seg; i++) {
    const a = j * (seg + 1) + i, b = a + 1, c = a + seg + 1, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

const CROWN_R = 5.1; // frond reach of the unscaled crown geometry
function makePalms(list, foliage, trunkMat, parent) {
  if (!list.length) return;
  const R = rng(77), H = 6.2;
  const trunkG = trunkGeometry(H), crownG = crownGeometry(R);
  const tm = new THREE.InstancedMesh(trunkG, trunkMat, list.length);
  const cm = new THREE.InstancedMesh(crownG, foliage, list.length);
  tm.castShadow = cm.castShadow = true; tm.receiveShadow = cm.receiveShadow = true;
  const q = new THREE.Quaternion(), e = new THREE.Euler(), m = new THREE.Matrix4(), sc = new THREE.Vector3(), p = new THREE.Vector3();
  list.forEach((a, i) => {
    const s = a.s ?? 1, hs = a.h ?? 1;
    e.set((R() - 0.5) * 0.07, R() * 6.28, (R() - 0.5) * 0.09, 'YXZ'); q.setFromEuler(e);
    p.set(a.x, a.y ?? 0, a.z); sc.set(s, s * hs, s);
    m.compose(p, q, sc); tm.setMatrixAt(i, m);
    const top = new THREE.Vector3(0, H * s * hs, 0).applyQuaternion(q).add(p);
    // a.r caps the crown radius so a palm planted in a tight court never reaches the walls
    const cs = a.r ? Math.min(s, a.r / CROWN_R) : s;
    sc.set(cs * (0.9 + R() * 0.2), cs * (0.95 + R() * 0.1), cs * (0.9 + R() * 0.2));
    e.y += R() * 6.28; q.setFromEuler(e);
    m.compose(top, q, sc); cm.setMatrixAt(i, m);
  });
  parent.add(tm, cm);
}

/* ------------------------------------------------------------------ */
/* Shrubs, hedges, canopy trees (vertex-coloured blobs + leaf cards)    */
/* ------------------------------------------------------------------ */
const _ico = new THREE.IcosahedronGeometry(1, 3);
function blob(fol, R, cx, cy, cz, rx, ry, rz, pal, leafCards = 90) {
  const cards = fol.cards;
  const g = _ico.clone();
  const p = g.attributes.position;
  const ph = [R() * 9, R() * 9, R() * 9];
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const n = 1 + 0.18 * Math.sin(x * 5 + ph[0]) * Math.sin(y * 4.3 + ph[1]) + 0.14 * Math.sin(z * 6.1 + ph[2]) * Math.cos(x * 3.3);
    p.setXYZ(i, x * n, y * n, z * n);
  }
  g.computeVertexNormals();
  const dark = toLin(pal[0]), light = toLin(pal[1]);
  colorize(g, (x, y, z) => { const t = THREE.MathUtils.clamp(y * 0.5 + 0.5 + Math.sin(x * 7 + z * 5) * 0.12, 0, 1); const c = dark.clone().lerp(light, t * t); return [c.r, c.g, c.b]; });
  fol.add(g, matrixFrom({ x: cx, y: cy, z: cz, sx: rx, sy: ry, sz: rz }));
  // leaf cards for a ragged, organic silhouette
  const card = new THREE.PlaneGeometry(0.3, 0.3);
  card.translate(0, 0.15, 0);
  const n = Math.round(leafCards * 1.6);
  for (let i = 0; i < n; i++) {
    const u = R() * 2 - 1, a = R() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    const nx = s * Math.cos(a), ny = u, nz = s * Math.sin(a);
    const c = card.clone();
    const col = dark.clone().lerp(light, 0.3 + R() * 0.7).multiplyScalar(0.85 + R() * 0.35);
    const nrm = new Float32Array(c.attributes.position.count * 3);
    for (let k = 0; k < nrm.length; k += 3) { nrm[k] = nx; nrm[k + 1] = ny; nrm[k + 2] = nz; }
    c.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
    colorize(c, () => [col.r, col.g, col.b]);
    const dir = new THREE.Vector3(nx, ny, nz).add(new THREE.Vector3(R() - 0.5, R() - 0.5, R() - 0.5).multiplyScalar(0.9)).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), R() * 6.28));
    const sc = 0.55 + R() * 0.9;
    const m = new THREE.Matrix4().compose(new THREE.Vector3(cx + nx * rx * 0.95, cy + ny * ry * 0.95, cz + nz * rz * 0.95), q, new THREE.Vector3(sc, sc, sc));
    cards.add(c, m);
  }
  g.dispose();
}

const PAL = {
  shrub: ['#1f3a14', '#4a7228'], hedge: ['#1d3813', '#436a25'], olive: ['#4b5a2e', '#8c9a5e'], tree: ['#1c3614', '#4f7a2a'], flower: ['#3a5a24', '#c25d7b'], grass: ['#5a6e2a', '#b0b660'],
};

/* ------------------------------------------------------------------ */
export function buildOutdoor(A, G, M_, models) {
  const L = new Layer('outdoor');
  const extra = new THREE.Group(); extra.name = 'outdoor-instanced';
  const R = rng(2024);
  const fol = new Fol(); fol.cards = new Fol(true);
  const palms = [];

  const foliage = new THREE.MeshStandardMaterial({ vertexColors: true, color: 0xffffff, roughness: 0.62, side: THREE.DoubleSide, envMapIntensity: 0.9 });
  foliage.color.setScalar(1.35); register(foliage);
  const cardMat = new THREE.MeshStandardMaterial({ vertexColors: true, map: sprigTexture(), alphaTest: 0.45, roughness: 0.6, side: THREE.DoubleSide, envMapIntensity: 0.9 });
  cardMat.color.setScalar(1.35); register(cardMat);
  const bark = new THREE.MeshStandardMaterial({ color: 0x5b4636, roughness: 0.95 }); register(bark);
  const winDark = new THREE.MeshStandardMaterial({ color: 0x55666d, roughness: 0.05, metalness: 0.35, envMapIntensity: 1.8 }); register(winDark);
  const lampHead = new THREE.MeshStandardMaterial({ color: 0xf6f2e6, emissive: 0xfff2d4, emissiveIntensity: 2.2, roughness: 0.4 }); register(lampHead);

  const Y_ROAD = -0.14, Y_WALK = 0.0, Y_PLOT = 0.15;
  const ROAD_Z0 = -14.5, ROAD_Z1 = -2.2;
  const X0 = -70, X1 = 80;

  /* ---------------- ground, road, sidewalks ---------------- */
  L.box(420, 0.4, 420, 5, -0.55, 11.5, M.sand);                                   // desert
  L.box(X1 - X0, 0.3, ROAD_Z1 - ROAD_Z0, (X0 + X1) / 2, Y_ROAD - 0.15, (ROAD_Z0 + ROAD_Z1) / 2, M.asphalt);
  L.box(X1 - X0, 0.3, 2.2, (X0 + X1) / 2, Y_WALK - 0.15, -1.1, M.pavers);         // near sidewalk
  L.box(X1 - X0, 0.3, 2.2, (X0 + X1) / 2, Y_WALK - 0.15, ROAD_Z0 - 1.1, M.pavers); // far sidewalk
  L.box(X1 - X0, 0.17, 0.16, (X0 + X1) / 2, Y_WALK - 0.065, ROAD_Z1 - 0.08 + 0.0, M.kerb);
  L.box(X1 - X0, 0.17, 0.16, (X0 + X1) / 2, Y_WALK - 0.065, ROAD_Z0 + 0.08, M.kerb);
  // paver expansion joints (cut lines every 6 m)
  const joint = new THREE.MeshStandardMaterial({ color: 0x8e8a80, roughness: 1 }); register(joint);
  for (let x = X0; x < X1; x += 6) {
    L.box(0.02, 0.004, 2.2, x, Y_WALK + 0.002, -1.1, joint, { cast: false });
    L.box(0.02, 0.004, 2.2, x, Y_WALK + 0.002, ROAD_Z0 - 1.1, joint, { cast: false });
  }
  // lane marking (dashed centre line, solid edge lines)
  const mz = (ROAD_Z0 + ROAD_Z1) / 2;
  for (let x = X0; x < X1; x += 7.5) L.box(3.2, 0.006, 0.14, x + 1.6, Y_ROAD + 0.003, mz, M.lineWhite, { cast: false });
  L.box(X1 - X0, 0.006, 0.12, (X0 + X1) / 2, Y_ROAD + 0.003, ROAD_Z1 - 0.35, M.lineWhite, { cast: false });
  L.box(X1 - X0, 0.006, 0.12, (X0 + X1) / 2, Y_ROAD + 0.003, ROAD_Z0 + 0.35, M.lineWhite, { cast: false });
  // pedestrian crossing in front of the villa
  for (let i = 0; i < 9; i++) L.box(0.5, 0.006, ROAD_Z1 - ROAD_Z0 - 1.0, 14 + i * 0.95, Y_ROAD + 0.0035, mz, M.lineWhite, { cast: false });
  // road wear patches
  for (let i = 0; i < 18; i++) {
    const x = X0 + R() * (X1 - X0), z = ROAD_Z0 + 0.8 + R() * (ROAD_Z1 - ROAD_Z0 - 1.6);
    L.box(0.6 + R() * 2.4, 0.004, 0.4 + R() * 1.2, x, Y_ROAD + 0.002, z, M.black, { cast: false, ry: R() * 0.2 - 0.1 });
  }
  // tree pits / tactile strip / drains
  const grate = new THREE.MeshStandardMaterial({ color: 0x2a2c2d, roughness: 0.55, metalness: 0.8 }); register(grate);
  for (let x = -60; x < 70; x += 19) {
    L.box(0.9, 0.012, 0.28, x, Y_WALK + 0.006, ROAD_Z1 + 0.18 + 0.0 - 0.18, grate, { cast: false });
    for (let k = 0; k < 7; k++) L.box(0.02, 0.014, 0.28, x - 0.36 + k * 0.12, Y_WALK + 0.007, ROAD_Z1 - 0.02, M.black, { cast: false });
  }

  /* ---------------- lane on the end-wall side ---------------- */
  const LANE0 = -6.0;
  L.box(6.0, 0.3, 26, -3.0, Y_WALK - 0.15, 13.0, M.pavers);
  L.box(1.2, 0.3, 26, -5.4, Y_WALK - 0.1, 13.0, M.pavers);
  // raised planting strip with low kerb
  L.box(2.2, 0.26, 25.5, -4.9, 0.0, 12.75, M.concrete);
  L.box(2.0, 0.04, 25.3, -4.9, 0.14, 12.75, M.soil, { cast: false });
  L.box(0.22, 0.2, 25.7, -3.9, 0.07, 12.75, M.kerb);
  L.box(0.22, 0.2, 25.7, -5.9, 0.07, 12.75, M.kerb);
  for (let z = 0.8; z < 24; z += 3.2) palmsAdd(-4.9, z, 0.5 + R() * 0.3);   // low palms in the strip
  function palmsAdd(x, z, s, y = 0.14) { palms.push({ x, y, z, s, h: 0.55 + R() * 0.25 }); }
  for (let z = 1.2; z < 23; z += 2.2) blob(fol, R, -4.9 + (R() - 0.5) * 0.6, 0.38, z + (R() - 0.5) * 0.5, 0.42, 0.28, 0.42, PAL.shrub, 40);
  A.walk.push({ x0: -6.2, x1: 0.15, z0: -2.3, z1: 26, top: Y_WALK, level: 0 });

  /* ---------------- rear lane and surroundings ---------------- */
  L.box(60, 0.3, 6.0, 5, Y_ROAD - 0.15, 27.0, M.asphalt);
  L.box(60, 0.3, 1.6, 5, Y_WALK - 0.15, 23.8, M.pavers);
  L.box(60, 0.3, 1.6, 5, Y_WALK - 0.15, 30.2, M.pavers);

  /* ---------------- plot ground under neighbours ---------------- */
  const neighbours = [];
  const plot = (x0, z0, sx, sz) => ({ x0, z0, sx, sz });
  function villa(o, variant = 0) {
    // local coordinates: x 0..10 along frontage (increasing to the viewer's left/right per sx), z 0..23 depth, front wall at z=0
    const X = (lx) => o.x0 + o.sx * lx, Z = (lz) => o.z0 + o.sz * lz;
    const B = (w, h, d, lx, y, lz, mat, op) => L.box(w, h, d, X(lx), y, Z(lz), mat, op);
    const W = (lx, y, lz, w, h, face, hood) => {                // window on a face: face 'f' = toward road (local -z), 'e' = outer side local x=10
      const side = face === 'f';
      const fw = side ? w : 0.14, fd = side ? 0.14 : w;
      const px = side ? lx : lx, pz = side ? lz : lz;
      B(fw + (side ? 0.1 : 0), h + 0.1, fd + (side ? 0 : 0.1), px, y + h / 2, pz, M.aluminium);
      B(side ? w - 0.1 : 0.05, h - 0.1, side ? 0.05 : w - 0.1, px, y + h / 2, pz + (side ? 0.03 : 0), winDark);
      if (side) B(0.03, h - 0.1, 0.06, px, y + h / 2, pz, M.aluminium);
      B(fw + (side ? 0.18 : 0.08), 0.05, fd + (side ? 0.08 : 0.18), px, y - 0.01, pz + (side ? -0.05 : 0), M.concrete);
      if (hood) B(side ? w + 0.06 : 0.06, 0.5, side ? 0.06 : w + 0.06, px, y + h + 0.3, pz + (side ? -0.03 : 0), M.stuccoYellow, { cast: false });
    };
    const base = Y_PLOT;
    B(10, 0.3, 23, 5, base - 0.15, 11.5, M.pavers);                 // plot slab
    // front boundary wall with gates
    const gH = 3.2;
    const seg = (a, b) => B(b - a, gH, 0.25, (a + b) / 2, base + gH / 2, 0.125, M.stucco);
    seg(0, 0.2); seg(3.2, 4.5); seg(5.85, 10);
    B(10, 0.07, 0.34, 5, base + gH + 0.035, 0.125, M.concrete);
    B(3.0, 0.35, 0.25, 1.7, base + 2.7 + 0.175, 0.125, M.stucco);
    B(1.35, 0.9, 0.25, 5.2, base + 2.3 + 0.45, 0.125, M.stucco);
    B(10, 0.42, 0.03, 5, base + 0.21, -0.012 * o.sz, M.kerb);
    B(1.3, 2.25, 0.05, 5.2, base + 1.12, 0.12, M.doorMetal);        // closed pedestrian gate
    for (let i = 0; i < 24; i++) B(1.2, 0.02, 0.03, 5.2, base + 0.25 + i * 0.085, 0.07, M.blackSteel, { cast: false });
    B(2.9, 2.7, 0.04, 1.7, base + 1.35, 0.8, winDark, { cast: false }); // dark carport behind the open shutter
    B(2.95, 0.3, 0.2, 1.7, base + 2.86, -0.02, M.shutter);
    // body
    const sh = variant % 2 ? M.stuccoBeige : M.stucco;
    B(10, 3.3, 19.3, 5, base + 1.65, 13.35, sh);                    // ground floor
    B(10.1, 0.2, 19.4, 5, base + 3.4, 13.35, M.concrete);
    B(10, 3.3, 19.3, 5, base + 3.3 + 1.65 + 0.1, 13.35, sh);        // first floor
    B(10.1, 0.2, 19.4, 5, base + 6.7, 13.35, M.concrete);
    B(5.6, 3.3, 15.4, 2.8 + (variant % 2 ? 4.4 : 0), base + 6.8 + 1.65, 15.3, M.stuccoGrey); // set-back second floor in grey
    B(5.6, 0.2, 15.4, 2.8 + (variant % 2 ? 4.4 : 0), base + 10.35, 15.3, M.concrete);
    // parapets
    B(10.1, 0.9, 0.14, 5, base + 6.7 + 0.45 + 0.1, 3.8, M.stucco);
    B(10.1, 0.5, 0.14, 5, base + 10.45 + 0.25, 23, M.stucco);
    // windows (front elevation), yellow hoods on upper floors like the elevation
    const fz = 3.7;
    W(1.6, base + 0.9, fz, 1.2, 1.3, 'f'); W(3.0, base + 0.9, fz, 0.8, 1.3, 'f');
    B(1.05, 2.15, 0.1, 5.0, base + 1.08, fz - 0.02, M.doorMetal);
    B(1.3, 0.04, 0.6, 5.0, base + 0.02, fz - 0.25, M.stoneStep);
    W(1.7, base + 4.1, fz, 1.4, 1.5, 'f', true); W(4.2, base + 4.1, fz, 1.4, 1.5, 'f', true); W(7.0, base + 4.1, fz, 2.2, 1.5, 'f', true);
    B(10, 1.0, 0.1, 5, base + 4.0 + 3.3 * 0 + 3.3 + 0.0, fz - 0.02, M.stucco, { cast: false });
    W(2.2, base + 7.5, 7.3, 1.5, 1.6, 'f', true); W(6.8, base + 7.5, 7.3, 1.5, 1.6, 'f', true);
    // glass balcony balustrade on first floor
    B(4.0, 1.0, 0.05, 7.9, base + 3.5 + 0.5, 3.0, M.glassBlue, { cast: false, receive: false });
    B(4.0, 0.06, 0.08, 7.9, base + 3.5 + 1.0, 3.0, M.steel);
    // outer end wall windows
    for (const z of [6, 11, 17]) { W(10.05, base + 4.1, z, 1.5, 1.5, 'e', true); W(10.05, base + 0.9, z, 1.2, 1.3, 'e'); }
    // roof gear
    B(1.5, 1.5, 1.5, 3.5 + (variant ? 3 : 0), base + 10.9 + 0.75, 20, M.black);
    B(10, 0.2, 23, 5, base - 0.4, 11.5, M.concrete, { cast: false });
    neighbours.push(o);
    const x0 = Math.min(X(0), X(10)), x1 = Math.max(X(0), X(10)), z0 = Math.min(Z(0), Z(23)), z1 = Math.max(Z(0), Z(23));
    A.colliders.push({ x0, x1, z0, z1, y0: -1, y1: 14, level: 0 });
  }

  // neighbours on the shared (left) wall side, further along, and across the street
  villa(plot(10.0, 0, 1, 1), 1);
  villa(plot(20.0, 0, 1, 1), 0);
  villa(plot(30.0, 0, 1, 1), 1);
  villa(plot(40.0, 0, 1, 1), 0);
  villa(plot(50.0, 0, 1, 1), 1);
  villa(plot(60.0, 0, 1, 1), 0);
  villa(plot(-6.0, 0, -1, 1), 1);
  villa(plot(-16.0, 0, -1, 1), 0);
  villa(plot(-26.0, 0, -1, 1), 1);
  villa(plot(-36.0, 0, -1, 1), 0);
  villa(plot(-46.0, 0, -1, 1), 1);
  villa(plot(-56.0, 0, -1, 1), 0);
  // across the road (front walls facing us)
  for (let i = 0; i < 12; i++) villa(plot(-58 + i * 10 + 10, -17.0, -1, -1), i % 2);
  // back row beyond the rear lane
  for (let i = 0; i < 9; i++) villa(plot(-40 + i * 10 + 10, 33.0, -1, 1), i % 2 + 1);

  // distant skyline blocks so the horizon is never empty
  for (let i = 0; i < 26; i++) {
    const a = i / 26 * Math.PI * 2 + 0.1, d = 150 + (i % 5) * 30;
    const x = 5 + Math.cos(a) * d, z = 11 + Math.sin(a) * d;
    if (Math.abs(z + 8) < 40 && Math.abs(x) < 120) continue;
    const w = 14 + (i % 4) * 6, h = 9 + (i % 3) * 4;
    L.box(w, h, 14 + (i % 3) * 5, x, h / 2 - 0.3, z, i % 3 ? M.stuccoBeige : M.stuccoSand, { cast: false });
  }

  // outer colliders so nobody wanders off the end of the street
  A.colliders.push({ x0: X0 + 2, x1: X0 + 2.4, z0: -17, z1: 40, y0: -1, y1: 6, level: 0 });
  A.colliders.push({ x0: X1 - 2.4, x1: X1 - 2, z0: -17, z1: 40, y0: -1, y1: 6, level: 0 });
  A.colliders.push({ x0: X0, x1: X1, z0: -18.0, z1: -17.6, y0: -1, y1: 6, level: 0 });
  A.walk.push({ x0: X0 + 2, x1: X1 - 2, z0: ROAD_Z1 - 0.1, z1: -0.0, top: Y_WALK, level: 0 });
  A.walk.push({ x0: X0 + 2, x1: X1 - 2, z0: ROAD_Z0 + 0.1, z1: ROAD_Z1 - 0.1, top: Y_ROAD, level: 0 });
  A.walk.push({ x0: X0 + 2, x1: X1 - 2, z0: ROAD_Z0 - 2.4, z1: ROAD_Z0 + 0.1, top: Y_WALK, level: 0 });

  /* ---------------- street furniture ---------------- */
  function lamp(x, z, face = 1) {
    L.cyl(0.07, 0.11, 7.0, x, 3.5, z, M.blackSteel, { seg: 12 });
    L.cyl(0.2, 0.2, 0.3, x, 0.15, z, M.concrete, { seg: 12 });
    const ax = x, ay = 7.0, az = z - face * 1.15;
    L.bar(new THREE.Vector3(x, 6.4, z), new THREE.Vector3(x, ay + 0.05, z - face * 0.2), 0.045, M.blackSteel);
    L.bar(new THREE.Vector3(x, ay, z), new THREE.Vector3(ax, ay + 0.1, az), 0.04, M.blackSteel);
    L.box(0.34, 0.09, 0.8, ax, ay + 0.08, az, M.blackSteel);
    L.box(0.28, 0.025, 0.7, ax, ay + 0.02, az, lampHead, { cast: false, receive: false });
  }
  for (let x = -62; x < 76; x += 24) { lamp(x + 0.0, -1.7, 1); }
  for (let x = -50; x < 76; x += 24) { lamp(x, ROAD_Z0 - 0.5, -1); }
  // sidewalk palms (clear of both gates)
  for (const x of [-50, -38, -26, -14, -3.0, 12.6, 25.0, 37.0, 49.0, 61.0]) {
    palms.push({ x, y: Y_WALK, z: -1.15, s: 0.95 + R() * 0.2, h: 0.9 + R() * 0.3 });
    L.box(1.1, 0.04, 1.1, x, Y_WALK + 0.02, -1.15, M.concrete, { cast: false });
    L.box(1.0, 0.012, 1.0, x, Y_WALK + 0.045, -1.15, M.gravel, { cast: false });
    for (const [dx, dz] of [[-.55, 0], [.55, 0]]) L.box(0.08, 0.05, 1.18, x + dx, Y_WALK + 0.025, -1.15 + dz, M.kerb);
  }
  for (const x of [-44, -32, -20, -8, 6, 18, 31, 43, 55, 67]) {
    palms.push({ x, y: Y_WALK, z: ROAD_Z0 - 1.1, s: 0.9 + R() * 0.25, h: 0.85 + R() * 0.35 });
  }
  // manholes and cabinets
  if (models) {
    for (const [x, z] of [[-18, -6], [9.5, -9.5], [30, -7.5], [-35, -10]]) models.place(extra, 'water_manhole_cover', { x, y: Y_ROAD + 0.002, z, ry: R() * 3 });
    models.place(extra, 'utility_box_01', { x: 11.2, y: Y_WALK, z: -0.45, ry: Math.PI });
    models.place(extra, 'utility_box_01', { x: -9.2, y: Y_WALK, z: -0.45, ry: Math.PI });
  }

  /* ---------------- planting inside the plot ---------------- */
  const rooms = {}; for (const lv of G.levels) for (const r of lv.rooms) rooms[r.id] = r;
  const soft = rooms['gf-softscape'], court = rooms['gf-courtyard'], back = rooms['gf-back-court'], buffer = rooms['gf-court-buffer'], carside = rooms['gf-car-side'], park = rooms['gf-parking'];
  const GY = Y_PLOT;
  // front garden strip (between driver room and path)
  if (soft) {
    const cx = soft.x + soft.width / 2, cz = soft.z + soft.depth / 2;
    L.box(soft.width - 0.16, 0.05, soft.depth - 0.3, cx, GY + 0.025, cz, M.lawn);
    L.box(soft.width, 0.16, 0.12, cx, GY + 0.08, soft.z + soft.depth - 0.06, M.kerb);
    L.box(0.12, 0.16, soft.depth, soft.x + 0.06, GY + 0.08, cz, M.kerb);
    L.box(0.12, 0.16, soft.depth, soft.x + soft.width - 0.06, GY + 0.08, cz, M.kerb);
    palms.push({ x: soft.x + 1.85, y: GY, z: soft.z + 1.65, s: 0.65, h: 0.6, r: 1.6 });
    blob(fol, R, cx - 0.55, GY + 0.35, soft.z + 0.9, 0.45, 0.32, 0.4, PAL.shrub, 50);
    blob(fol, R, cx + 0.5, GY + 0.3, soft.z + 1.0, 0.4, 0.28, 0.4, PAL.flower, 60);
    blob(fol, R, cx + 0.2, GY + 0.28, soft.z + 0.5, 0.35, 0.25, 0.35, PAL.shrub, 40);
    for (let i = 0; i < 7; i++) L.box(0.5, 0.03, 0.3, cx - 0.6 + (i % 2) * 1.0, GY + 0.06, soft.z + 0.4 + i * 0.42, M.stoneStep, { cast: false });
  }
  // low planter along the front path
  const fp = rooms['gf-front-path'];
  if (fp) for (const s of [-1, 1]) {
    const px = fp.x + fp.width / 2 + s * (fp.width / 2 + 0.0);
    blob(fol, R, fp.x + (s < 0 ? 0.05 : fp.width - 0.05), GY + 0.25, fp.z + 1.9, 0.18, 0.22, 0.4, PAL.hedge, 30);
  }
  // courtyard (open to sky)
  if (court) {
    const cx = court.x + court.width / 2, cz = court.z + court.depth / 2;
    // central tree in a square planter
    const px = court.x + court.width * 0.5, pz = court.z + 2.2;
    L.box(1.5, 0.45, 1.5, px, GY + 0.225, pz, M.stucco);
    L.box(1.58, 0.05, 1.58, px, GY + 0.47, pz, M.concrete);
    L.box(1.38, 0.04, 1.38, px, GY + 0.43, pz, M.soil, { cast: false });
    L.box(1.34, 0.012, 1.34, px, GY + 0.452, pz, M.gravel, { cast: false });
    L.cyl(0.07, 0.11, 2.1, px, GY + 1.45, pz, bark, { seg: 10 });
    L.bar(new THREE.Vector3(px, GY + 2.2, pz), new THREE.Vector3(px + 0.45, GY + 3.0, pz + 0.2), 0.045, bark);
    L.bar(new THREE.Vector3(px, GY + 2.0, pz), new THREE.Vector3(px - 0.45, GY + 2.9, pz - 0.15), 0.04, bark);
    for (const [dx, dy, dz, r] of [[0, 3.35, 0, 0.8], [0.7, 3.0, 0.25, 0.6], [-0.7, 3.0, -0.2, 0.62], [0.2, 3.1, -0.65, 0.55], [-0.2, 2.9, 0.7, 0.5]]) blob(fol, R, px + dx, GY + dy, pz + dz, r, r * 0.75, r, PAL.tree, 140);
    // palm and planting beds along the long walls
    palms.push({ x: 6.7, y: GY, z: 14.3, s: 0.78, h: 0.65, r: 2.0 });
    const bed = (x0, z0, w, d, species = 0) => {
      L.box(w, 0.26, d, x0 + w / 2, GY + 0.13, z0 + d / 2, M.stucco);
      L.box(w + 0.06, 0.04, d + 0.06, x0 + w / 2, GY + 0.28, z0 + d / 2, M.concrete);
      L.box(w - 0.1, 0.03, d - 0.1, x0 + w / 2, GY + 0.255, z0 + d / 2, M.soil, { cast: false });
      const n = Math.max(2, Math.round(Math.max(w, d) / 0.55));
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        const bx = w > d ? x0 + w * t : x0 + w / 2, bz = w > d ? z0 + d / 2 : z0 + d * t;
        blob(fol, R, bx + (R() - 0.5) * 0.12, GY + 0.28 + 0.2, bz + (R() - 0.5) * 0.12, 0.3 + R() * 0.12, 0.25 + R() * 0.12, 0.3, species === 1 ? PAL.olive : (i % 3 === 0 ? PAL.flower : PAL.shrub), 36);
      }
    };
    bed(court.x + court.width - 0.55, court.z + 0.2, 0.5, 3.4, 0);
    bed(court.x + court.width - 0.55, court.z + 4.3, 0.5, 2.0, 1);
    bed(court.x + 0.35, court.z + court.depth - 0.7, 3.2, 0.5, 1);
    // stepping stones + pale gravel band under the glazing
    L.box(court.width - 0.1, 0.012, 0.9, cx, GY + 0.006, court.z + court.depth - 0.5, M.gravel, { cast: false });
    // low bench
    const bz = court.z + 4.6;
    const bn = new Local(L, court.x + 0.3, GY, bz, Math.PI / 2);
    bn.box(2.0, 0.06, 0.45, 0, 0.45, 0, M.walnut);
    for (const s of [-1, 1]) { bn.box(0.08, 0.43, 0.4, s * 0.85, 0.22, 0, M.blackSteel); }
    // outdoor furniture set from the asset library
    if (models) {
      models.place(extra, 'outdoor_table_chair_set_01', { x: court.x + 1.4, y: GY, z: court.z + 2.4, ry: Math.PI / 2 });
      models.place(extra, 'potted_plant_01', { x: court.x + 0.5, y: GY, z: court.z + 0.6, ry: 0.5, s: 1.1 });
      models.place(extra, 'potted_plant_02', { x: court.x + court.width - 0.5, y: GY, z: court.z + 6.5, ry: 1.2 });
      models.place(extra, 'potted_plant_01', { x: court.x + 0.5, y: GY, z: court.z + court.depth - 0.5, ry: 0.2 });
      models.place(extra, 'wicker_basket_01', { x: court.x + 1.2, y: GY, z: court.z + 3.8, ry: 0.3 });
    }
    // wall-wash lights on the courtyard facade
    for (let z = court.z + 1; z < court.z + court.depth - 0.5; z += 2.2) {
      L.box(0.1, 0.1, 0.1, court.x + 0.02, GY + 0.3, z, M.blackSteel);
      L.box(0.07, 0.015, 0.07, court.x + 0.02, GY + 0.347, z, M.emissiveWarm, { cast: false, receive: false });
    }
  }
  // passage + back court
  if (carside) {
    const cx = carside.x + carside.width / 2;
    L.box(carside.width, 0.01, 0.06, cx, GY + 0.005, carside.z + carside.depth * 0.5, M.lineWhite, { cast: false });
  }
  if (back) {
    L.box(back.width, 0.26, 0.5, back.x + back.width / 2, GY + 0.13, back.z + back.depth - 0.25, M.stucco);
    L.box(back.width, 0.04, 0.56, back.x + back.width / 2, GY + 0.28, back.z + back.depth - 0.25, M.concrete);
    for (let i = 0; i < 8; i++) blob(fol, R, back.x + 0.4 + i * (back.width - 0.8) / 7, GY + 0.5, back.z + back.depth - 0.25, 0.28, 0.25, 0.28, i % 3 ? PAL.shrub : PAL.olive, 30);
    blob(fol, R, back.x + 1.0, GY + 0.55, back.z + 0.9, 0.42, 0.45, 0.42, PAL.shrub, 60);
    if (models) models.place(extra, 'exterior_aircon_unit', { x: back.x + back.width - 0.5, y: GY, z: back.z + 0.8, ry: Math.PI });
  }
  // parking: covered car and floor markings
  if (park && models) {
    models.place(extra, 'covered_car', { x: park.x + park.width / 2, y: GY, z: park.z + 1.55, ry: 0, s: 0.78 });
  }

  /* ---------------- street trees across the road ---------------- */
  for (const x of [-30, -6, 26, 52]) {
    const z = ROAD_Z0 - 1.2;
    L.cyl(0.08, 0.12, 2.6, x, 1.3, z, bark, { seg: 10 });
    for (const [dx, dy, dz, r] of [[0, 3.4, 0, 1.0], [0.8, 3.0, 0.1, 0.7], [-0.8, 3.1, 0.0, 0.75], [0.1, 3.2, 0.8, 0.65]]) blob(fol, R, x + dx, dy, z + dz, r, r * 0.78, r, PAL.tree, 140);
  }

  const folMesh = fol.build(foliage);
  if (folMesh) extra.add(folMesh);
  const cardMesh = fol.cards.build(cardMat);
  if (cardMesh) { cardMesh.castShadow = false; extra.add(cardMesh); }
  makePalms(palms, foliage, M.trunk, extra);
  return { layer: L, extra };
}
