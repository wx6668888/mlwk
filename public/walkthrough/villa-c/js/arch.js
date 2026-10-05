import * as THREE from 'three';
import { Layer } from './builder.js';
import { roomKind, isInterior } from './data.js';

const GREY_WALLS = new Set(['ff-main-front', 'sf-room-front', 'sf-front-terrace-front', 'sf-front-terrace-right', 'sf-terrace-court-side']);

function subtractRect(rect, hole) {
  const a = Math.max(rect.x, hole.x), b = Math.min(rect.x + rect.width, hole.x + hole.width);
  const c = Math.max(rect.z, hole.z), d = Math.min(rect.z + rect.depth, hole.z + hole.depth);
  if (b <= a || d <= c) return [rect];
  return [
    { x: rect.x, z: rect.z, width: a - rect.x, depth: rect.depth },
    { x: b, z: rect.z, width: rect.x + rect.width - b, depth: rect.depth },
    { x: a, z: rect.z, width: b - a, depth: c - rect.z },
    { x: a, z: d, width: b - a, depth: rect.z + rect.depth - d },
  ].filter((r) => r.width > 0.001 && r.depth > 0.001);
}

export function buildArchitecture(g, M) {
  const A = {
    levels: g.levels.filter((l) => l.walkable !== false && l.id !== 'ROOF'),
    layers: [], colliders: [], walk: [], windows: [], doors: [], lights: [], roomList: [], glassPanes: [],
  };
  const roofLevel = g.levels.find((l) => l.id === 'ROOF');
  const court = g.courtyard.bounds, stair = g.stair.bounds;
  const voids = g.courtyard.holes;
  const nL = A.levels.length;
  A.levels.forEach((lvl, i) => { A.layers.push(new Layer(lvl.label)); lvl.rooms.forEach((r) => { r.floorY = lvl.floorY; r.level = i; r.kind = roomKind(r); A.roomList.push(r); }); });
  A.roofLayer = new Layer('roof');
  if (roofLevel) roofLevel.rooms.forEach((r) => { r.floorY = roofLevel.floorY; r.level = nL; r.kind = 'roof'; });

  /* ------------ helpers ------------ */
  const addC = (lv, x0, x1, z0, z1, y0, y1) => A.colliders.push({ x0: Math.min(x0, x1), x1: Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1), y0, y1, level: lv });
  const addWalk = (lv, x0, x1, z0, z1, top) => A.walk.push({ x0, x1, z0, z1, top, level: lv });

  const intRooms = A.levels.map((l) => l.rooms.filter(isInterior));
  function roomAt(lv, x, z, tol = 0.1) {
    let best = null, ba = 1e9;
    for (const r of intRooms[lv] || []) {
      if (x >= r.x - tol && x <= r.x + r.width + tol && z >= r.z - tol && z <= r.z + r.depth + tol) {
        const a = r.width * r.depth; if (a < ba) { ba = a; best = r; }
      }
    }
    return best;
  }
  A.roomAt = roomAt;

  const wallInfo = (w) => {
    const dx = w.x2 - w.x1, dz = w.z2 - w.z1, len = Math.hypot(dx, dz);
    const ux = dx / len, uz = dz / len;
    return { w, len, ux, uz, nx: -uz, nz: ux, ry: -Math.atan2(uz, ux), t: w.thickness || 0.17, fy: w.floorY, h: w.height };
  };
  const P = (wi, s, n) => ({ x: wi.w.x1 + wi.ux * s + wi.nx * n, z: wi.w.z1 + wi.uz * s + wi.nz * n });
  /** box along a wall: s0..s1 along, y0..y1 absolute, centred n0 off the centreline, depth dn */
  const lb = (layer, wi, s0, s1, y0, y1, n0, dn, mat, o = {}) => {
    if (s1 - s0 < 1e-4 || y1 - y0 < 1e-4) return null;
    const c = P(wi, (s0 + s1) / 2, n0);
    return layer.box(s1 - s0, y1 - y0, dn, c.x, (y0 + y1) / 2, c.z, mat, { ry: wi.ry, ...o });
  };
  const sideRoom = (lv, wi, sgn, s) => { const p = P(wi, s, sgn * (wi.t / 2 + 0.13)); return roomAt(lv, p.x, p.z, 0.04); };

  function skinRuns(lv, wi, sgn, s0, s1) {
    const n = Math.max(1, Math.ceil((s1 - s0) / 0.2)), step = (s1 - s0) / n, runs = [];
    for (let k = 0; k < n; k++) {
      const a = s0 + k * step, b = a + step, r = sideRoom(lv, wi, sgn, (a + b) / 2);
      const last = runs[runs.length - 1];
      if (last && last.room === r) last.b = b; else runs.push({ a, b, room: r });
    }
    return runs;
  }

  /* ---------- wall piece: core + interior finish + skirting ---------- */
  function piece(L, lv, wi, s0, s1, y0, y1, extMat) {
    if (s1 - s0 < 0.003 || y1 - y0 < 0.003) return;
    const fy = wi.fy, t = wi.t, mid = (s0 + s1) / 2;
    const rA = sideRoom(lv, wi, 1, mid), rB = sideRoom(lv, wi, -1, mid);
    const core = rA && rB ? M.paint : extMat;
    const e0 = s0 <= 0.001 ? t / 2 : 0, e1 = s1 >= wi.len - 0.001 ? t / 2 : 0;
    lb(L, wi, s0 - e0, s1 + e1, fy + y0, fy + y1, 0, t, core);
    const a = P(wi, s0 - e0, t / 2), b = P(wi, s1 + e1, -t / 2);
    addC(lv, a.x, b.x, a.z, b.z, fy + y0, fy + y1);
    for (const sgn of [1, -1]) {
      for (const run of skinRuns(lv, wi, sgn, s0, s1)) {
        const room = run.room; if (!room) continue;
        if (!(rA && rB) || room.kind === 'bath' || room.kind === 'kitchen') {
          const off = sgn * (t / 2 + 0.004);
          if (room.kind === 'bath' && y0 < 2.39) {
            const top = Math.min(y1, 2.4);
            lb(L, wi, run.a, run.b, fy + y0, fy + top, off, 0.008, M.wallTile, { cast: false });
            if (y1 > 2.4) lb(L, wi, run.a, run.b, fy + 2.4, fy + y1, off, 0.008, M.paint, { cast: false });
          } else if (!(rA && rB)) {
            lb(L, wi, run.a, run.b, fy + y0, fy + y1, off, 0.008, M.paint, { cast: false });
          }
        }
        if (y0 < 0.001 && room.kind !== 'bath') lb(L, wi, run.a, run.b, fy, fy + 0.11, sgn * (t / 2 + 0.008 + (rA && rB ? 0 : 0.0)), 0.016, M.trim, { cast: false });
      }
    }
  }

  /* ---------- openings ---------- */
  function extSign(lv, wi, s) {
    const a = sideRoom(lv, wi, 1, s), b = sideRoom(lv, wi, -1, s);
    if (a && !b) return -1;
    if (b && !a) return 1;
    return 1;
  }

  function addWindow(L, lv, wi, o, ext, withHood, glassMat = M.glass) {
    const { t, fy } = wi;
    const ow = o.width, oh = o.height, ob = o.bottom || 0, s0 = o.offset;
    const yb = fy + ob, yt = yb + oh, fd = 0.07, fb = 0.055;
    const co = ext * (t / 2 - 0.115);
    // outer frame
    lb(L, wi, s0, s0 + ow, yt - fb, yt, co, fd, M.aluminium);
    lb(L, wi, s0, s0 + ow, yb, yb + fb, co, fd, M.aluminium);
    lb(L, wi, s0, s0 + fb, yb + fb, yt - fb, co, fd, M.aluminium);
    lb(L, wi, s0 + ow - fb, s0 + ow, yb + fb, yt - fb, co, fd, M.aluminium);
    const nP = oh < 0.95 ? 1 : ow > 2.5 ? 3 : ow > 1.15 ? 2 : 1;
    const innerW = ow - 2 * fb, pw = innerW / nP;
    for (let k = 0; k < nP; k++) {
      const a = s0 + fb + k * pw, b = a + pw;
      // sash with glazing bead
      const sb = 0.036;
      const ia = k === 0 ? a : a + 0.02, ib = k === nP - 1 ? b : b - 0.02;
      lb(L, wi, ia, ib, yt - fb - sb, yt - fb, co + ext * 0.012, 0.05, M.aluminium);
      lb(L, wi, ia, ib, yb + fb, yb + fb + sb, co + ext * 0.012, 0.05, M.aluminium);
      lb(L, wi, ia, ia + sb, yb + fb + sb, yt - fb - sb, co + ext * 0.012, 0.05, M.aluminium);
      lb(L, wi, ib - sb, ib, yb + fb + sb, yt - fb - sb, co + ext * 0.012, 0.05, M.aluminium);
      const gl = lb(L, wi, ia + sb, ib - sb, yb + fb + sb, yt - fb - sb, co, 0.024, glassMat, { cast: false, receive: false });
      if (nP > 1 || oh >= 0.95) {
        // handle on the interior face of the sash
        const hx = k % 2 === 0 ? ib - sb * 0.5 : ia + sb * 0.5;
        const hy = Math.min(yt - 0.35, yb + oh * 0.5);
        lb(L, wi, hx - 0.012, hx + 0.012, hy - 0.07, hy + 0.07, co - ext * 0.045, 0.02, M.steel, { cast: false });
        lb(L, wi, hx - 0.012, hx + 0.012, hy - 0.07, hy - 0.05, co - ext * 0.03, 0.02, M.steel, { cast: false });
      }
    }
    // glazing collider
    const a = P(wi, s0, t / 2), b = P(wi, s0 + ow, -t / 2);
    addC(lv, a.x, b.x, a.z, b.z, yb, yt);
    // exterior drip sill (precast) and interior sill board
    lb(L, wi, s0 - 0.05, s0 + ow + 0.05, yb - 0.045, yb + 0.005, ext * (t / 2 + 0.015), 0.16, M.concrete);
    const e1 = (t / 2 - 0.115) - fd / 2, e2 = -t / 2 - 0.03, ec = (e1 + e2) / 2;
    lb(L, wi, s0 - 0.04, s0 + ow + 0.04, yb, yb + 0.03, ext * ec, e1 - e2, M.quartz);
    // interior reveal returns in paint (core is exterior colour)
    const rlen = e1 + t / 2, rc = ext * ((e1 - t / 2) / 2);
    const rA = sideRoom(lv, wi, -ext, s0 + ow / 2);
    if (rA) {
      lb(L, wi, s0, s0 + 0.008, yb + 0.03, yt, rc, rlen, M.paint, { cast: false });
      lb(L, wi, s0 + ow - 0.008, s0 + ow, yb + 0.03, yt, rc, rlen, M.paint, { cast: false });
      lb(L, wi, s0, s0 + ow, yt - 0.008, yt, rc, rlen, M.paint, { cast: false });
    }
    // flat painted hood panel above the opening (elevation: yellow texture painting)
    if (withHood) {
      const top = fy + Math.min(wi.h + 0.15, 3.3);
      lb(L, wi, s0 - 0.02, s0 + ow + 0.02, yt, top, ext * (t / 2 + 0.004), 0.008, M.stuccoYellow, { cast: false });
    }
    // window position for light pool
    if (rA) {
      const c = P(wi, s0 + ow / 2, -ext * (t / 2));
      A.windows.push({ level: lv, x: c.x, y: (yb + yt) / 2, z: c.z, nx: -ext * wi.nx, nz: -ext * wi.nz, w: ow, h: oh, room: rA });
    }
  }

  /** Door leaf group built in local space: hinge at x=0, leaf toward +x, bottom at y=0. */
  function makeLeaf(kind, width, height) {
    const lf = new Layer('leaf');
    const th = 0.042;
    if (kind === 'wood') {
      lf.box(width - 0.012, height - 0.01, th, width / 2, height / 2, 0, M.doorWood, { uvSwap: true });
      // moulded panels
      for (const side of [-1, 1]) {
        const pz = side * (th / 2 + 0.004);
        const m = 0.16, cw = (width - 2 * m) , top = height - 0.28, bot = 0.55, mid = height * 0.5;
        for (const [y0, y1] of [[bot, mid - 0.04], [mid + 0.04, top]]) {
          const h = y1 - y0; const cy = (y0 + y1) / 2;
          lf.box(cw, 0.022, 0.012, width / 2, y0, pz, M.doorWood, { uvSwap: true });
          lf.box(cw, 0.022, 0.012, width / 2, y1, pz, M.doorWood, { uvSwap: true });
          lf.box(0.022, h, 0.012, m, cy, pz, M.doorWood, { uvSwap: true });
          lf.box(0.022, h, 0.012, width - m, cy, pz, M.doorWood, { uvSwap: true });
        }
      }
    } else if (kind === 'metal') {
      lf.box(width - 0.012, height - 0.01, th + 0.01, width / 2, height / 2, 0, M.doorMetal);
      for (let i = 1; i < 6; i++) lf.box(0.012, height - 0.3, 0.008, (width / 6) * i, height / 2, th / 2 + 0.008, M.blackSteel);
      lf.box(0.035, 1.1, 0.04, width - 0.12, 1.05, th / 2 + 0.035, M.steel);
      lf.box(0.035, 1.1, 0.04, width - 0.12, 1.05, -th / 2 - 0.035, M.steel);
    } else { // aluminium glazed leaf
      const fbw = 0.055;
      lf.box(width - 0.012, fbw, 0.05, width / 2, height - fbw / 2, 0, M.aluminium);
      lf.box(width - 0.012, fbw * 1.5, 0.05, width / 2, fbw * 0.75, 0, M.aluminium);
      lf.box(fbw, height, 0.05, fbw / 2 + 0.006, height / 2, 0, M.aluminium);
      lf.box(fbw, height, 0.05, width - fbw / 2 - 0.006, height / 2, 0, M.aluminium);
      lf.box(width - 2 * fbw - 0.012, height - fbw * 2.5, 0.022, width / 2, height / 2 + 0.02, 0, M.glass, { cast: false, receive: false });
      lf.box(0.03, 0.9, 0.035, width - fbw - 0.03, 1.05, 0.04, M.steel);
      lf.box(0.03, 0.9, 0.035, width - fbw - 0.03, 1.05, -0.04, M.steel);
    }
    if (kind === 'wood') {
      for (const side of [-1, 1]) {
        lf.box(0.12, 0.022, 0.02, width - 0.09, 1.02, side * (th / 2 + 0.018), M.steel);
        lf.box(0.055, 0.055, 0.012, width - 0.05, 1.02, side * (th / 2 + 0.006), M.steel);
      }
    }
    return lf.build();
  }

  function addDoorSwing(L, lv, wi, o, ext, kind) {
    const { t, fy } = wi, ow = o.width, oh = o.height;
    const leaf = makeLeaf(kind, ow - 0.03, oh - 0.02);
    const outer = new THREE.Group(), swing = new THREE.Group();
    const hp = P(wi, o.offset + 0.015, kind === 'wood' ? 0 : ext * (t / 2 - 0.12));
    outer.position.set(hp.x, fy + 0.012, hp.z); outer.rotation.y = wi.ry;
    swing.add(leaf); outer.add(swing); L.group.add(outer);
    const c = P(wi, o.offset + ow / 2, 0);
    A.doors.push({ type: 'swing', level: lv, swing, ox: c.x, oy: fy + 1, oz: c.z, sign: -ext, open: 0, width: ow });
    return leaf;
  }

  function addArchitrave(L, lv, wi, o, ext, mat = M.trim, width = 0.075) {
    const { t, fy } = wi, ow = o.width, oh = o.height, s0 = o.offset;
    for (const sgn of [1, -1]) {
      const rr = sideRoom(lv, wi, sgn, s0 + ow / 2);
      if (!rr && !(sgn === -ext)) continue;
      const n = sgn * (t / 2 + 0.008);
      lb(L, wi, s0 - width, s0, fy, fy + oh + width, n, 0.016, mat, { cast: false });
      lb(L, wi, s0 + ow, s0 + ow + width, fy, fy + oh + width, n, 0.016, mat, { cast: false });
      lb(L, wi, s0, s0 + ow, fy + oh, fy + oh + width, n, 0.016, mat, { cast: false });
    }
    // jamb lining across the wall thickness
    lb(L, wi, s0, s0 + 0.01, fy, fy + oh, 0, t + 0.001, mat, { cast: false });
    lb(L, wi, s0 + ow - 0.01, s0 + ow, fy, fy + oh, 0, t + 0.001, mat, { cast: false });
    lb(L, wi, s0, s0 + ow, fy + oh - 0.01, fy + oh, 0, t + 0.001, mat, { cast: false });
  }

  function addGlazedDoor(L, lv, wi, o, ext, upper) {
    const { t, fy } = wi, ow = o.width, oh = o.height, s0 = o.offset;
    if (ow < 1.5) { // narrow: swing aluminium door in frame
      const fb = 0.055, yt = fy + oh, co = ext * (t / 2 - 0.12);
      lb(L, wi, s0, s0 + ow, yt - fb, yt, co, 0.07, M.aluminium);
      lb(L, wi, s0, s0 + fb, fy, yt - fb, co, 0.07, M.aluminium);
      lb(L, wi, s0 + ow - fb, s0 + ow, fy, yt - fb, co, 0.07, M.aluminium);
      lb(L, wi, s0, s0 + ow, fy, fy + 0.04, co, 0.07, M.steel);
      const leaf = makeLeaf('glass', ow - 2 * fb, oh - fb - 0.01);
      const outer = new THREE.Group(), swing = new THREE.Group();
      const hp = P(wi, s0 + fb, co);
      outer.position.set(hp.x, fy + 0.012, hp.z); outer.rotation.y = wi.ry;
      swing.add(leaf); outer.add(swing); L.group.add(outer);
      const c = P(wi, s0 + ow / 2, 0);
      A.doors.push({ type: 'swing', level: lv, swing, ox: c.x, oy: fy + 1, oz: c.z, sign: -ext, open: 0, width: ow, glass: true });
    } else { // sliding system: fixed + sliding panels on two tracks
      const n = ow > 3.1 ? 3 : 2, fb = 0.06, yt = fy + oh, co = ext * (t / 2 - 0.12);
      lb(L, wi, s0, s0 + ow, yt - fb * 1.4, yt, co, 0.1, M.aluminium);
      lb(L, wi, s0, s0 + ow, fy, fy + 0.035, co, 0.1, M.aluminium);
      lb(L, wi, s0, s0 + ow, fy + 0.035, fy + 0.05, co + ext * 0.026, 0.012, M.steel);
      lb(L, wi, s0, s0 + fb, fy, yt, co, 0.1, M.aluminium);
      lb(L, wi, s0 + ow - fb, s0 + ow, fy, yt, co, 0.1, M.aluminium);
      const pw = (ow - 2 * fb + 0.06 * (n - 1)) / n;
      for (let k = 0; k < n; k++) {
        const lane = k % 2 === 0 ? -1 : 1;
        const lf = new Layer('slide');
        const sx = fb + k * (pw - 0.06);
        const ph = oh - fb * 1.4 - 0.05;
        const w2 = pw, f = 0.05;
        lf.box(w2, f, 0.045, w2 / 2, ph - f / 2, 0, M.aluminium);
        lf.box(w2, f * 1.3, 0.045, w2 / 2, f * 0.65, 0, M.aluminium);
        lf.box(f, ph, 0.045, f / 2, ph / 2, 0, M.aluminium);
        lf.box(f, ph, 0.045, w2 - f / 2, ph / 2, 0, M.aluminium);
        lf.box(w2 - 2 * f, ph - f * 2.3, 0.02, w2 / 2, ph / 2 + 0.01, 0, M.glass, { cast: false, receive: false });
        lf.box(0.025, 0.7, 0.03, k % 2 ? f * 0.6 : w2 - f * 0.6, 1.0, 0.035, M.steel);
        const grp = lf.build();
        const outer = new THREE.Group(), slide = new THREE.Group();
        const hp = P(wi, s0 + sx, co + ext * lane * 0.03);
        outer.position.set(hp.x, fy + 0.05, hp.z); outer.rotation.y = wi.ry;
        slide.add(grp); outer.add(slide); L.group.add(outer);
        if (k === n - 1 || (n === 3 && k === 1)) {
          const c = P(wi, s0 + ow / 2, 0);
          // sliding panel moves one panel-width over its neighbour
          A.doors.push({ type: 'slide', level: lv, swing: slide, ox: c.x, oy: fy + 1, oz: c.z, dist: (k === n - 1 ? -1 : 1) * (pw - 0.06), open: 0, width: ow, glass: true });
        }
      }
    }
    const a = P(wi, s0, t / 2), b = P(wi, s0 + ow, -t / 2);
    const rA = sideRoom(lv, wi, -ext, s0 + ow / 2);
    if (rA) {
      const c = P(wi, s0 + ow / 2, -ext * (t / 2));
      A.windows.push({ level: lv, x: c.x, y: fy + oh * 0.5, z: c.z, nx: -ext * wi.nx, nz: -ext * wi.nz, w: ow, h: oh, room: rA, door: true });
    }
    if (upper) {
      const top = fy + Math.min(wi.h + 0.15, 3.3);
      lb(L, wi, s0 - 0.02, s0 + ow + 0.02, fy + oh, top, ext * (t / 2 + 0.004), 0.008, M.stuccoYellow, { cast: false });
    }
    if (rA) {
      lb(L, wi, s0, s0 + 0.008, fy, fy + oh, ext * ((-t / 2 + (t / 2 - 0.17)) / 2), t / 2 + 0.17 - 0.0, M.paint, { cast: false });
    }
    // threshold stone
    lb(L, wi, s0, s0 + ow, fy - 0.01, fy + 0.012, 0, t, M.quartz);
  }

  /** Juliet guard: doors on an upper level that open onto the courtyard void get a glass barrier instead of a drop. */
  function juliet(L, lv, wi, o, ext) {
    const { t, fy } = wi, s0 = o.offset - 0.1, s1 = o.offset + o.width + 0.1, n = ext * (t / 2 + 0.1), h = 1.0;
    lb(L, wi, s0, s1, fy, fy + 0.06, n, 0.08, M.steel);
    lb(L, wi, s0, s1, fy + 0.06, fy + h - 0.04, n, 0.03, M.glassBlue, { cast: false, receive: false });
    lb(L, wi, s0, s1, fy + h - 0.04, fy + h + 0.02, n, 0.06, M.steel);
    for (const s of [s0, s1]) lb(L, wi, s - 0.025, s + 0.025, fy, fy + h, n, 0.05, M.steel);
    const a = P(wi, s0, n + 0.12), b = P(wi, s1, n - 0.12);
    addC(lv, a.x, b.x, a.z, b.z, fy, fy + h);
  }

  /* ---------- walls ---------- */
  function buildWall(lv, w) {
    const L = A.layers[lv], wi = wallInfo(w);
    if (wi.len < 0.01) return;
    const { t, fy, h } = wi;
    if (w.type === 'glass_guard') return railingWall(L, lv, wi);
    const isParapet = w.type === 'parapet';
    const extMat = GREY_WALLS.has(w.id) ? M.stuccoGrey : M.stucco;
    const ops = (w.openings || []).filter((o) => o.offset >= -0.01 && o.offset + o.width <= wi.len + 0.03).sort((a, b) => a.offset - b.offset);
    let pos = 0;
    for (const o of ops) {
      const bottom = o.bottom || 0, top = Math.min(bottom + o.height, h);
      piece(L, lv, wi, pos, o.offset, 0, h, extMat);
      piece(L, lv, wi, o.offset, o.offset + o.width, 0, bottom, extMat);
      piece(L, lv, wi, o.offset, o.offset + o.width, top, h, extMat);
      const mid = o.offset + o.width / 2;
      const ext = extSign(lv, wi, mid);
      const type = o.type || '';
      if (type === 'door' || type === 'glazed_door' || type === 'passage' || type === 'open') {
        // floor under the doorway so the seam between two rooms is walkable
        const pa = P(wi, o.offset, t / 2 + 0.12), pb = P(wi, o.offset + o.width, -t / 2 - 0.12);
        addWalk(lv, Math.min(pa.x, pb.x), Math.max(pa.x, pb.x), Math.min(pa.z, pb.z), Math.max(pa.z, pb.z), fy);
      }
      const upperExt = lv >= 1 && w.type === 'external' && !sideRoom(lv, wi, ext, mid);
      if (type === 'window') addWindow(L, lv, wi, o, ext, upperExt && lv >= 1);
      else if (type === 'glazed_door') addGlazedDoor(L, lv, wi, o, ext, upperExt);
      else if (type === 'door') {
        const entry = w.id === 'gf-entry-front';
        const rr = sideRoom(lv, wi, 1, mid), rl = sideRoom(lv, wi, -1, mid);
        const swingExt = rr && rl ? (rr.width * rr.depth > rl.width * rl.depth ? -1 : 1) : ext;
        addDoorSwing(L, lv, wi, o, swingExt, entry ? 'metal' : 'wood');
        addArchitrave(L, lv, wi, o, ext, entry ? M.stuccoGrey : M.trim, entry ? 0.1 : 0.075);
      } else if (type === 'passage' || type === 'open') {
        addArchitrave(L, lv, wi, o, ext);
      }
      pos = o.offset + o.width;
      if (lv >= 1 && w.type === 'external' && (type === 'glazed_door' || type === 'door')) {
        const q = P(wi, mid, ext * (t / 2 + 0.4));
        const hasFloor = A.walk.some((b) => b.level === lv && q.x >= b.x0 - 0.02 && q.x <= b.x1 + 0.02 && q.z >= b.z0 - 0.02 && q.z <= b.z1 + 0.02);
        if (!hasFloor) juliet(L, lv, wi, o, ext);
      }
    }
    piece(L, lv, wi, pos, wi.len, 0, h, extMat);
    if (isParapet) {
      const c1 = 0.03;
      lb(L, wi, -t / 2, wi.len + t / 2, fy + h, fy + h + 0.05, 0, t + c1 * 2, M.concrete);
    }
    // slab-edge band closes the gap between wall top and the floor above on exterior faces
    if (lv >= 1 && w.type === 'external') {
      lb(L, wi, -t / 2, wi.len + t / 2, fy - 0.17, fy + 0.001, 0, t, extMat);
    }
  }

  function railingWall(L, lv, wi) {
    const { fy } = wi, len = wi.len, h = 1.0;
    lb(L, wi, 0, len, fy, fy + 0.1, 0, 0.14, M.stucco);
    lb(L, wi, 0, len, fy + 0.1, fy + h - 0.04, 0, 0.03, M.glassBlue, { cast: false, receive: false });
    lb(L, wi, 0, len, fy + h - 0.04, fy + h + 0.02, 0, 0.06, M.steel);
    lb(L, wi, 0, len, fy + 0.1, fy + 0.14, 0, 0.06, M.steel);
    const n = Math.max(1, Math.round(len / 1.3));
    for (let i = 0; i <= n; i++) lb(L, wi, len / n * i - 0.025, len / n * i + 0.025, fy + 0.1, fy + h - 0.04, 0, 0.05, M.steel);
    const a = P(wi, 0, 0.08), b = P(wi, len, -0.08);
    addC(lv, a.x, b.x, a.z, b.z, fy, fy + h);
  }

  /* ---------- floors, slabs, ceilings ---------- */
  function floorMat(r) {
    switch (r.kind) {
      case 'bath': return M.bathFloor;
      case 'bed': case 'dresser': return M.woodFloor;
      case 'terrace': return M.terraceTile;
      case 'roof': return M.concrete;
      case 'outdoor': case 'garage':
        if (/court/.test(r.id)) return M.courtTile;
        if (/softscape/.test(r.id)) return M.soil;
        return M.pavers;
      default: return M.marble;
    }
  }

  function buildFloors() {
    // base ground slab under the whole plot
    A.layers[0].box(10.2, 0.45, 23.2, 5, -0.075, 11.5, M.concrete, { receive: true });
    A.levels.forEach((lvl, lv) => {
      const L = A.layers[lv], fy = lvl.floorY;
      if (lv > 0) {
        for (const r of lvl.slabs || lvl.rooms) {
          const ex = { x: Math.max(0, r.x - 0.11), z: Math.max(0, r.z - 0.11), width: r.width + 0.22, depth: r.depth + 0.22 };
          let parts = [ex];
          for (const hole of [...voids, stair]) parts = parts.flatMap((p) => subtractRect(p, hole));
          for (const p of parts) L.box(p.width, 0.24, p.depth, p.x + p.width / 2, fy - 0.12 - 0.012, p.z + p.depth / 2, M.concrete);
        }
      }
      for (const r of lvl.rooms) {
        if (r.kind === 'stair') continue;
        let parts = [{ x: r.x, z: r.z, width: r.width, depth: r.depth }];
        if (lv > 0) for (const hole of [...voids, stair]) parts = parts.flatMap((p) => subtractRect(p, hole));
        const m = floorMat(r);
        for (const p of parts) {
          const th = 0.02;
          if (r.kind === 'outdoor' && /softscape/.test(r.id)) { L.box(p.width, th, p.depth, p.x + p.width / 2, fy - th / 2, p.z + p.depth / 2, m); }
          else L.box(p.width, th, p.depth, p.x + p.width / 2, fy - th / 2, p.z + p.depth / 2, m);
          addWalk(lv, p.x, p.x + p.width, p.z, p.z + p.depth, fy);
        }
      }
    });
  }

  function buildCeilings() {
    A.levels.forEach((lvl, lv) => {
      const L = A.layers[lv], fy = lvl.floorY;
      for (const r of lvl.rooms) {
        if (!isInterior(r) || r.kind === 'stair') continue;
        const ch = r.clearHeight || 2.85;
        const cy = fy + ch;
        const big = ['living', 'majlis', 'bed'].includes(r.kind) && r.width > 2.6 && r.depth > 2.6;
        const cw = 0.34, drop = 0.11;
        // flat gypsum ceiling (slightly oversized into walls)
        L.box(r.width + 0.02, 0.03, r.depth + 0.02, r.x + r.width / 2, cy + (big ? drop : 0) + 0.015, r.z + r.depth / 2, M.ceilingPaint, { cast: false });
        if (big) {
          // perimeter bulkhead + LED cove
          const mk = (w, d, x, z) => L.box(w, drop, d, x, cy + drop / 2, z, M.ceilingPaint, { cast: false });
          mk(r.width, cw, r.x + r.width / 2, r.z + cw / 2);
          mk(r.width, cw, r.x + r.width / 2, r.z + r.depth - cw / 2);
          mk(cw, r.depth - 2 * cw, r.x + cw / 2, r.z + r.depth / 2);
          mk(cw, r.depth - 2 * cw, r.x + r.width - cw / 2, r.z + r.depth / 2);
          const lw = 0.025, inset = cw + 0.02;
          const led = (w, d, x, z) => L.box(w, 0.012, d, x, cy + drop + 0.006, z, M.emissiveWarm, { cast: false, receive: false });
          led(r.width - 2 * inset, lw, r.x + r.width / 2, r.z + inset);
          led(r.width - 2 * inset, lw, r.x + r.width / 2, r.z + r.depth - inset);
          led(lw, r.depth - 2 * inset - 0.05, r.x + inset, r.z + r.depth / 2);
          led(lw, r.depth - 2 * inset - 0.05, r.x + r.width - inset, r.z + r.depth / 2);
        }
        // recessed downlights on a grid
        const m = big ? cw + 0.45 : 0.45;
        const nx = Math.max(1, Math.round((r.width - 2 * m) / 1.5)), nz = Math.max(1, Math.round((r.depth - 2 * m) / 1.5));
        const dy = cy + (big ? drop : 0);
        const skip = r.kind === 'bath' ? 0 : 0;
        for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
          if (r.width - 2 * m < 0.3 || r.depth - 2 * m < 0.3) { if (i + j > 0) continue; }
          const x = nx === 1 ? r.x + r.width / 2 : r.x + m + (r.width - 2 * m) * (i / (nx - 1));
          const z = nz === 1 ? r.z + r.depth / 2 : r.z + m + (r.depth - 2 * m) * (j / (nz - 1));
          L.cyl(0.075, 0.075, 0.012, x, dy - 0.006, z, M.paintWhite, { cast: false, seg: 18 });
          L.cyl(0.055, 0.055, 0.004, x, dy - 0.013, z, M.emissiveWarm, { cast: false, receive: false, seg: 18 });
          A.lights.push({ level: lv, x, y: dy - 0.12, z, room: r });
        }
      }
    });
  }

  /* ---------- stairs ---------- */
  function buildStairs() {
    const { x, z, width: w, depth: d } = stair;
    const levelsY = g.stair.levels;
    const fw = (w - 0.18) / 2, land = 0.68, run = d - land, steps = 10, tread = run / steps;
    const xA = x + w - fw / 2, xB = x + fw / 2; // flight A (up from front) on the +x side after mirroring
    for (let f = 0; f < levelsY.length - 1; f++) {
      const L = A.layers[f], low = levelsY[f], high = levelsY[f + 1], rise = (high - low) / (steps * 2);
      const arr = 0.42, rtread = (run - arr) / steps;
      const rho = (cx, y, zc, tw, th) => L.box(fw, th, tw, cx, y, zc, M.marble);
      // flight A: z increasing
      for (let i = 0; i < steps; i++) {
        const top = low + rise * (i + 1);
        L.box(fw, rise, tread + 0.025, xA, top - rise / 2, z + tread * (i + 0.5) + 0.0125, M.marble);
        addWalk(f, xA - fw / 2, xA + fw / 2, z + tread * i, z + tread * (i + 1), top);
      }
      for (let i = 0; i < steps; i++) {
        const top = low + rise * (steps + i + 1);
        const zc = z + run - rtread * (i + 0.5);
        L.box(fw, rise, rtread + 0.025, xB, top - rise / 2, zc - 0.0125, M.marble);
        addWalk(f, xB - fw / 2, xB + fw / 2, zc - rtread / 2, zc + rtread / 2, top);
      }
      // inclined soffits (cast concrete)
      const a1 = Math.atan2(rise, tread), L1 = Math.hypot(steps * tread, steps * rise);
      L.box(fw, 0.17, L1, xA, low + rise * steps / 2 - 0.085 * Math.cos(a1) - 0.02, z + steps * tread / 2, M.concrete, { rx: -a1 });
      const a2 = Math.atan2(rise, rtread), L2 = Math.hypot(steps * rtread, steps * rise);
      L.box(fw, 0.17, L2, xB, low + rise * steps + rise * steps / 2 - 0.085 * Math.cos(a2) - 0.02, z + run - arr - steps * rtread / 2 + (steps * rtread) / 2 * 0 + arr * 0 - 0.0, M.concrete, { rx: a2 });
      // landing + arrival
      const mid = low + (high - low) / 2;
      L.box(w, 0.17, land, x + w / 2, mid - 0.085, z + run + land / 2, M.concrete);
      L.box(w, 0.02, land, x + w / 2, mid - 0.01, z + run + land / 2, M.marble);
      addWalk(f, x, x + w, z + run, z + d, mid);
      L.box(w + 0.2, 0.17, arr, x + w / 2 + 0.1, high - 0.085, z + arr / 2, M.concrete);
      L.box(w + 0.2, 0.02, arr, x + w / 2 + 0.1, high - 0.01, z + arr / 2, M.marble);
      addWalk(f, x, x + w + 0.2, z, z + arr, high);
      // balustrade along the inner gap (flat steel bars + sloped handrail)
      const gx1 = x + w - fw - 0.02, gx2 = x + fw + 0.02;
      const rail = (gx, zA, yA, zB, yB, dir) => {
        const a = new THREE.Vector3(gx, yA + 0.95, zA), b = new THREE.Vector3(gx, yB + 0.95, zB);
        L.bar(a, b, 0.022, M.walnut);
        const n = 11;
        for (let k = 0; k <= n; k++) {
          const tt = k / n; const zz = zA + (zB - zA) * tt, yy = yA + (yB - yA) * tt;
          L.box(0.014, 0.93, 0.014, gx, yy + 0.465, zz, M.blackSteel);
        }
        L.bar(new THREE.Vector3(gx, yA + 0.07, zA), new THREE.Vector3(gx, yB + 0.07, zB), 0.012, M.blackSteel);
      };
      rail(gx1, z + 0.05, low + rise, z + run, low + rise * steps);
      rail(gx2, z + run, low + rise * (steps + 1), z + arr + 0.02, high);
    }
  }

  /* ---------- roof ---------- */
  function buildRoof() {
    if (!roofLevel) return;
    const L = A.roofLayer, fy = roofLevel.floorY;
    for (const r of roofLevel.rooms) {
      let parts = [r];
      for (const hole of voids) parts = parts.flatMap((p) => subtractRect(p, hole));
      for (const p of parts) {
        L.box(p.width + 0.25, 0.22, p.depth + 0.25, p.x + p.width / 2, fy - 0.11, p.z + p.depth / 2, M.concrete);
        L.box(p.width, 0.03, p.depth, p.x + p.width / 2, fy + 0.012, p.z + p.depth / 2, M.concrete, {});
        addWalk(nL, p.x, p.x + p.width, p.z, p.z + p.depth, fy + 0.03);
      }
    }
    for (const w of roofLevel.walls) { w.floorY = fy; buildRoofWall(w); }
  }
  function buildRoofWall(w) {
    const L = A.roofLayer, wi = wallInfo(w), { t, fy, h } = wi;
    lb(L, wi, -t / 2, wi.len + t / 2, fy, fy + h, 0, t, M.stucco);
    lb(L, wi, -t / 2, wi.len + t / 2, fy + h, fy + h + 0.05, 0, t + 0.06, M.concrete);
    const a = P(wi, 0, t / 2), b = P(wi, wi.len, -t / 2);
    addC(nL, a.x, b.x, a.z, b.z, fy, fy + h);
  }

  /* ---------- terrace floors that lie above the ground (waterproof screed edge etc.) ---------- */
  buildFloors();
  A.levels.forEach((lvl, lv) => { for (const w of lvl.walls) buildWall(lv, w); });
  buildCeilings();
  buildStairs();
  buildRoof();
  A.court = court; A.stair = stair; A.voids = voids; A.nL = nL;
  return A;
}
