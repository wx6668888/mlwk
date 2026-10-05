import * as THREE from 'three';
import { matrixFrom } from './builder.js';

/** Build an object in its own frame (origin on the floor, front = +z) and drop it into a Layer at any position / yaw. */
export class Local {
  constructor(layer, x, y, z, ry = 0, bb = null) {
    this.L = layer; this.x = x; this.y = y; this.z = z; this.ry = ry; this.bb = bb;
    this.c = Math.cos(ry); this.s = Math.sin(ry);
  }
  p(lx, lz) { return [this.x + lx * this.c + lz * this.s, this.z - lx * this.s + lz * this.c]; }
  grow(X, Z, hw, hd, y0, y1, ry = 0) {
    if (!this.bb) return;
    const a = Math.abs(Math.cos(ry)), b = Math.abs(Math.sin(ry));
    const ex = hw * a + hd * b, ez = hw * b + hd * a;
    this.bb.expandByPoint(_v.set(X - ex, y0, Z - ez));
    this.bb.expandByPoint(_v.set(X + ex, y1, Z + ez));
  }
  box(w, h, d, lx, ly, lz, mat, o = {}) {
    const [X, Z] = this.p(lx, lz);
    this.grow(X, Z, w / 2, d / 2, this.y + ly - h / 2, this.y + ly + h / 2, (o.ry || 0) + this.ry);
    return this.L.box(w, h, d, X, this.y + ly, Z, mat, { ...o, ry: (o.ry || 0) + this.ry });
  }
  rbox(w, h, d, lx, ly, lz, mat, r = 0.04, o = {}) {
    const [X, Z] = this.p(lx, lz);
    this.grow(X, Z, w / 2, d / 2, this.y + ly - h / 2, this.y + ly + h / 2, (o.ry || 0) + this.ry);
    return this.L.rbox(w, h, d, X, this.y + ly, Z, mat, r, { ...o, ry: (o.ry || 0) + this.ry });
  }
  cyl(rt, rb, h, lx, ly, lz, mat, o = {}) {
    const [X, Z] = this.p(lx, lz);
    const R = Math.max(rt, rb);
    this.grow(X, Z, R, R, this.y + ly - h / 2, this.y + ly + h / 2, 0);
    return this.L.cyl(rt, rb, h, X, this.y + ly, Z, mat, { ...o, ry: (o.ry || 0) + this.ry });
  }
  sphere(r, lx, ly, lz, mat, o = {}) {
    const [X, Z] = this.p(lx, lz);
    this.grow(X, Z, r, r, this.y + ly - r, this.y + ly + r, 0);
    return this.L.sphere(r, X, this.y + ly, Z, mat, { ...o, ry: (o.ry || 0) + this.ry });
  }
  bar(a, b, r, mat, o = {}) {
    const [ax, az] = this.p(a[0], a[2]), [bx, bz] = this.p(b[0], b[2]);
    if (this.bb) {
      this.bb.expandByPoint(_v.set(Math.min(ax, bx) - r, this.y + Math.min(a[1], b[1]), Math.min(az, bz) - r));
      this.bb.expandByPoint(_v.set(Math.max(ax, bx) + r, this.y + Math.max(a[1], b[1]), Math.max(az, bz) + r));
    }
    return this.L.bar(new THREE.Vector3(ax, this.y + a[1], az), new THREE.Vector3(bx, this.y + b[1], bz), r, mat, o);
  }
  /** prebuilt geometry authored in local space */
  geo(geo, mat, o = {}) {
    geo.applyMatrix4(matrixFrom({ x: this.x, y: this.y, z: this.z, ry: this.ry }));
    if (this.bb) { geo.computeBoundingBox(); this.bb.union(geo.boundingBox); }
    return this.L.raw(geo, mat, o);
  }
  /** local frame nested inside this one */
  at(lx, ly, lz, ry = 0) { const [X, Z] = this.p(lx, lz); return new Local(this.L, X, this.y + ly, Z, this.ry + ry, this.bb); }
}
const _v = new THREE.Vector3();

/** vertical or horizontal textured plane (signs, art, screens) */
export function plane(layer, w, h, x, y, z, ry, mat, o = {}) {
  const g = new THREE.PlaneGeometry(w, h);
  g.applyMatrix4(matrixFrom({ x, y, z, ry, rx: o.rx || 0 }));
  return layer.raw(g, mat, { cast: false, ...o });
}
