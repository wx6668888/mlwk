import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3(1, 1, 1);

/** Keep only position / normal / uv and make sure the geometry is indexed so everything can merge. */
function clean(geo) {
  for (const name of Object.keys(geo.attributes)) if (!['position', 'normal', 'uv'].includes(name)) geo.deleteAttribute(name);
  if (!geo.index) {
    const n = geo.attributes.position.count;
    const idx = new Uint32Array(n);
    for (let i = 0; i < n; i++) idx[i] = i;
    geo.setIndex(new THREE.BufferAttribute(idx, 1));
  }
  if (!geo.attributes.uv) geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count * 2), 2));
  return geo;
}

/** Box-project UVs in metres / tile so texel density is physically correct and seams line up between neighbouring pieces. */
export function projectUV(geo, tile = [1, 1], offset = [0, 0], swap = false) {
  const pos = geo.attributes.position, nor = geo.attributes.normal, uv = geo.attributes.uv;
  const tu = 1 / tile[0], tv = 1 / tile[1];
  for (let i = 0; i < pos.count; i++) {
    const ax = Math.abs(nor.getX(i)), ay = Math.abs(nor.getY(i)), az = Math.abs(nor.getZ(i));
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    let u, v;
    if (ay >= ax && ay >= az) { u = x; v = z; }
    else if (ax >= az) { u = z; v = y; }
    else { u = x; v = y; }
    if (swap) uv.setXY(i, v * tv + offset[0], u * tu + offset[1]);
    else uv.setXY(i, u * tu + offset[0], v * tv + offset[1]);
  }
  uv.needsUpdate = true;
  return geo;
}

export function matrixFrom({ x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1 } = {}) {
  _e.set(rx, ry, rz, 'YXZ');
  _q.setFromEuler(_e);
  _p.set(x, y, z);
  _s.set(sx, sy, sz);
  return _m.compose(_p, _q, _s).clone();
}

/**
 * Collects geometry per material and bakes it into a handful of merged meshes.
 * Thousands of small architectural parts become tens of draw calls.
 */
export class Layer {
  constructor(name) {
    this.name = name;
    this.group = new THREE.Group();
    this.group.name = name;
    this.buckets = new Map();
  }
  put(geo, mat, { cast = true, receive = true } = {}) {
    const key = `${mat.uuid}|${cast ? 1 : 0}${receive ? 1 : 0}`;
    let b = this.buckets.get(key);
    if (!b) this.buckets.set(key, b = { mat, cast, receive, list: [] });
    b.list.push(geo);
  }
  /** geo already in final space (or give a transform). UV is projected in the chosen space before transform. */
  add(geo, mat, t = {}, o = {}) {
    clean(geo);
    const tile = mat.userData.tile;
    const world = o.uvSpace !== 'local';
    const m = matrixFrom(t);
    if (!world && tile) projectUV(geo, tile, o.uvOffset, o.uvSwap);
    geo.applyMatrix4(m);
    if (world && tile) projectUV(geo, tile, o.uvOffset, o.uvSwap);
    this.put(geo, mat, o);
    return geo;
  }
  box(w, h, d, x, y, z, mat, o = {}) {
    if (w < 1e-4 || h < 1e-4 || d < 1e-4) return null;
    return this.add(new THREE.BoxGeometry(w, h, d), mat, { x, y, z, ry: o.ry || 0, rx: o.rx || 0, rz: o.rz || 0 }, o);
  }
  rbox(w, h, d, x, y, z, mat, r = 0.04, o = {}) {
    if (w < 1e-4 || h < 1e-4 || d < 1e-4) return null;
    const rr = Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4);
    return this.add(new RoundedBoxGeometry(w, h, d, o.seg || 3, rr), mat, { x, y, z, ry: o.ry || 0, rx: o.rx || 0, rz: o.rz || 0 }, { uvSpace: 'local', ...o });
  }
  cyl(rt, rb, h, x, y, z, mat, o = {}) {
    const g = new THREE.CylinderGeometry(rt, rb, h, o.seg || 16, 1, o.open || false);
    const tile = mat.userData.tile;
    if (tile) {
      const uv = g.attributes.uv; const circ = 2 * Math.PI * Math.max(rt, rb);
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * circ / tile[0], uv.getY(i) * h / tile[1]);
    }
    clean(g);
    g.applyMatrix4(matrixFrom({ x, y, z, rx: o.rx || 0, ry: o.ry || 0, rz: o.rz || 0 }));
    this.put(g, mat, o);
    return g;
  }
  sphere(r, x, y, z, mat, o = {}) {
    const g = new THREE.SphereGeometry(r, o.wseg || 20, o.hseg || 14);
    clean(g);
    g.applyMatrix4(matrixFrom({ x, y, z, sx: o.sx || 1, sy: o.sy || 1, sz: o.sz || 1, ry: o.ry || 0 }));
    this.put(g, mat, o);
    return g;
  }
  /** tube between two points */
  bar(a, b, r, mat, o = {}) {
    const v = new THREE.Vector3().subVectors(b, a);
    const len = v.length();
    if (len < 1e-4) return null;
    const g = new THREE.CylinderGeometry(r, r, len, o.seg || 10, 1);
    clean(g);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize());
    const m = new THREE.Matrix4().compose(new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1));
    g.applyMatrix4(m);
    this.put(g, mat, o);
    return g;
  }
  /** arbitrary prebuilt geometry (already positioned) */
  raw(geo, mat, o = {}) { clean(geo); this.put(geo, mat, o); return geo; }
  build() {
    for (const b of this.buckets.values()) {
      if (!b.list.length) continue;
      const g = mergeGeometries(b.list, false);
      for (const x of b.list) x.dispose();
      const mesh = new THREE.Mesh(g, b.mat);
      mesh.castShadow = b.cast; mesh.receiveShadow = b.receive;
      mesh.matrixAutoUpdate = false; mesh.updateMatrix();
      this.group.add(mesh);
    }
    this.buckets.clear();
    return this.group;
  }
}

/** Deterministic pseudo-random generator */
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
