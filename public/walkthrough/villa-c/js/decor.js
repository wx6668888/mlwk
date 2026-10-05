import * as THREE from 'three';
import { Layer, matrixFrom } from './builder.js';
import { M, register, canvasTex } from './mats.js';

/* Style-specific architectural decor (ceilings, floor inlays, feature walls). Built once per style, toggled by visibility.
   Everything sits on top of the shared architecture, so the base model stays style-neutral. */

const PI = Math.PI;

/** Eight-point khatam medallion with rosette centre on a transparent background. */
function medallionTexture({ bg = '#efe3c8', a = '#1f5e57', b = '#c8a258', c = '#7f3f2a', ring = '#c8a258', size = 1024 } = {}) {
  return canvasTex(size, size, (ctx, w) => {
    const cx = w / 2, R = w / 2 - 6;
    ctx.clearRect(0, 0, w, w);
    const poly = (n, ro, ri, rot, fill, stroke, lw = 3) => {
      ctx.beginPath();
      for (let i = 0; i < n * 2; i++) { const r = i % 2 ? ri : ro, ang = rot + (i * PI) / n; ctx[i ? 'lineTo' : 'moveTo'](cx + Math.cos(ang) * r, cx + Math.sin(ang) * r); }
      ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
    };
    const disc = (r, fill, stroke, lw = 4) => { ctx.beginPath(); ctx.arc(cx, cx, r, 0, PI * 2); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } };
    disc(R, bg, ring, 10);
    disc(R * 0.93, null, ring, 3);
    for (let i = 0; i < 16; i++) { const ang = (i * PI) / 8; ctx.save(); ctx.translate(cx + Math.cos(ang) * R * 0.855, cx + Math.sin(ang) * R * 0.855); ctx.rotate(ang + PI / 4); ctx.fillStyle = i % 2 ? a : c; ctx.fillRect(-R * 0.035, -R * 0.035, R * 0.07, R * 0.07); ctx.restore(); }
    disc(R * 0.78, null, ring, 2);
    poly(8, R * 0.76, R * 0.46, -PI / 8, a, b, 4);
    poly(8, R * 0.76, R * 0.46, 0, null, b, 4);
    poly(8, R * 0.5, R * 0.3, 0, bg, b, 3);
    poly(16, R * 0.3, R * 0.17, 0, c, b, 2);
    disc(R * 0.1, b);
    for (let i = 0; i < 8; i++) { const ang = (i * PI) / 4 + PI / 8, r = R * 0.62; ctx.save(); ctx.translate(cx + Math.cos(ang) * r, cx + Math.sin(ang) * r); ctx.rotate(ang); ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(-R * 0.05, 0); ctx.lineTo(0, -R * 0.07); ctx.lineTo(R * 0.05, 0); ctx.lineTo(0, R * 0.07); ctx.closePath(); ctx.fill(); ctx.restore(); }
  });
}

/** Tileable lattice cell: 8-point star bars with corner diamonds, transparent gaps (alpha-tested). */
function jaliTexture(size = 256) {
  return canvasTex(size, size, (ctx, w) => {
    const c = w / 2, p = w, lw = w * 0.06;
    ctx.clearRect(0, 0, w, w);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = lw; ctx.lineJoin = 'miter';
    const sq = (r, rot) => { ctx.save(); ctx.translate(c, c); ctx.rotate(rot); ctx.strokeRect(-r, -r, 2 * r, 2 * r); ctx.restore(); };
    sq(p * 0.31, 0); sq(p * 0.31, PI / 4);
    ctx.beginPath(); ctx.arc(c, c, p * 0.085, 0, PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
    for (const [x, y] of [[0, 0], [p, 0], [0, p], [p, p]]) { ctx.beginPath(); ctx.moveTo(x - p * 0.16, y); ctx.lineTo(x, y - p * 0.16); ctx.lineTo(x + p * 0.16, y); ctx.lineTo(x, y + p * 0.16); ctx.closePath(); ctx.stroke(); }
    for (const [x, y] of [[c, 0], [c, p], [0, c], [p, c]]) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(c + (x - c) * 0.62, c + (y - c) * 0.62); ctx.stroke(); }
  });
}

export function buildDecor(A, G, M_, models) {
  const mat = (p, interior = true) => { const m = new THREE.MeshStandardMaterial({ envMapIntensity: 1, ...p }); m.userData.interior = interior; return register(m); };
  const polyOff = { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 };

  const medFloor = mat({ map: medallionTexture(), roughness: 0.35, transparent: true, alphaTest: 0.5, ...polyOff }, false);
  const medCeil = (() => {
    const t = medallionTexture({ bg: '#f6efe0', a: '#2a7a72', b: '#b08d4f', c: '#e6d9bb', ring: '#b08d4f' });
    return mat({ map: t, emissiveMap: t, emissive: 0xffe2b0, emissiveIntensity: 0.22, roughness: 0.8, transparent: true, alphaTest: 0.5, ...polyOff });
  })();
  const darkStone = mat({ color: 0x1c1b1b, roughness: 0.15, metalness: 0.1, ...polyOff });
  const slot = mat({ color: 0xf7fbff, emissive: 0xe9f1ff, emissiveIntensity: 2.6, roughness: 0.4 });
  const jaliTex = jaliTexture();
  const jaliMat = mat({ map: jaliTex, color: 0x4a3524, roughness: 0.5, metalness: 0.6, alphaTest: 0.45, side: THREE.DoubleSide, transparent: false }, false);
  const goldLine = mat({ color: 0xd8b469, roughness: 0.3, metalness: 0.5, emissive: 0x6b4d1a, emissiveIntensity: 0.7, ...polyOff });
  const tealBack = mat({ color: 0x1c5a54, roughness: 0.8 }, false);
  const warmBack = mat({ color: 0xffe3b0, emissive: 0xffc27a, emissiveIntensity: 1.3, roughness: 0.6 });
  const fin = mat({ color: 0x1a1c1d, roughness: 0.45, metalness: 0.7 });

  /* ---- layer registry: one Layer per (level, style) ---- */
  const levels = A.levels.length;
  const roots = Array.from({ length: levels }, (_, i) => { const g = new THREE.Group(); g.name = 'decor-' + i; return { group: g, parts: [] }; });
  const lay = {};
  const L = (style, lv, furnOnly = false) => {
    const k = `${style}|${lv}|${furnOnly ? 1 : 0}`;
    if (!lay[k]) { lay[k] = new Layer(k); lay[k].style = style; lay[k].furnOnly = furnOnly; lay[k].lv = lv; }
    return lay[k];
  };
  const room = (id) => A.roomList.find((r) => r.id === id);
  const ceilYOf = (r) => { const big = ['living', 'majlis', 'bed'].includes(r.kind) && r.width > 2.6 && r.depth > 2.6; return r.floorY + (r.clearHeight || 2.85) + (big ? 0.11 : 0); };
  const flat = (layer, w, d, x, y, z, ry, m, up = true) => {
    const g = new THREE.PlaneGeometry(w, d);
    g.applyMatrix4(matrixFrom({ x, y, z, rx: up ? -PI / 2 : PI / 2, ry }));
    layer.raw(g, m, { cast: false, receive: false });
  };
  const trayBig = (r) => ['living', 'majlis', 'bed'].includes(r.kind) && r.width > 2.6 && r.depth > 2.6;

  const ids = { majlis: room('gf-majlis'), living: room('gf-living'), master: room('ff-master'), fam: room('ff-family-living') };
  const feature = [ids.majlis, ids.living, ids.master, ids.fam].filter(Boolean);

  /* ================= GULF ================= */
  for (const r of feature) {
    const cx = r.x + r.width / 2, cz = r.z + r.depth / 2, y = ceilYOf(r) - (trayBig(r) ? 0 : 0.0) - 0.004;
    const s = Math.min(r.width, r.depth) - 1.9;
    flat(L('gulf', r.level), s, s, cx, y, cz, 0, medCeil, false);
  }
  {
    const b = G.courtyard.bounds, cx = b.x + b.width / 2, cz = b.z + b.depth / 2;
    flat(L('gulf', 0), 3.9, 3.9, cx, 0.15 + 0.012, cz, 0, medFloor);
    const ent = room('gf-entrance');
    if (ent) flat(L('gulf', 0), 0.95, 0.95, ent.x + ent.width / 2, 0.15 + 0.012, ent.z + ent.depth / 2, 0, medFloor);
  }


  /* jali (mashrabiya-style) panel: teal/warm backing, bronze lattice in front, bronze frame */
  const PITCH = 0.3;
  const jali = (lay_, { w, h, x, y, z, ry = 0, back = tealBack, depth = 0.03 }) => {
    const g = new THREE.PlaneGeometry(w, h);
    const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / PITCH, uv.getY(i) * h / PITCH);
    g.applyMatrix4(matrixFrom({ x: x + Math.sin(ry) * depth, y, z: z + Math.cos(ry) * depth, ry }));
    lay_.raw(g, jaliMat, { cast: false });
    const b = new THREE.PlaneGeometry(w, h); b.applyMatrix4(matrixFrom({ x: x + Math.sin(ry) * 0.004, y, z: z + Math.cos(ry) * 0.004, ry }));
    lay_.raw(b, back, { cast: false, receive: back !== warmBack });
    const f = 0.045;
    for (const [fw, fh, fx, fy] of [[w + 2 * f, f, 0, h / 2 + f / 2], [w + 2 * f, f, 0, -h / 2 - f / 2], [f, h, -w / 2 - f / 2, 0], [f, h, w / 2 + f / 2, 0]]) {
      lay_.box(fw, fh, depth + 0.02, x + Math.cos(ry) * fx + Math.sin(ry) * (depth / 2), y + fy, z - Math.sin(ry) * fx + Math.cos(ry) * (depth / 2), M.aluminium, { ry });
    }
  };
  {
    const l0 = L('gulf', 0);
    // street wall (face at z = 0, facing -z): panel right of the pedestrian gate
    jali(l0, { w: 1.8, h: 1.5, x: 1.9, y: 0.15 + 1.75, z: -0.002, ry: PI, depth: 0.03 });
    // majlis: backlit lattice frieze above the sofas on the west wall
    const maj = ids.majlis;
    if (maj) jali(L('gulf', 0, true), { w: 4.2, h: 0.62, x: 0.2, y: maj.floorY + 2.5, z: 6.6, ry: PI / 2, back: warmBack, depth: 0.02 });
  }
  /* Najdi-style triangular crenellations along roof and terrace parapets */
  {
    const tri = new THREE.Shape(); tri.moveTo(-0.12, 0); tri.lineTo(0.12, 0); tri.lineTo(0, 0.28); tri.closePath();
    for (const lvl of G.levels) for (const w of lvl.walls) {
      if (w.type !== 'parapet') continue;
      const lv = Math.min(lvl.label === 'ROOF' || lvl.id === 'ROOF' ? 2 : A.levels.indexOf(A.levels.find((a) => a.id === lvl.id)), levels - 1);
      if (lv < 0) continue;
      const fy = w.floorY ?? lvl.floorY, top = fy + w.height, t = w.thickness || 0.12;
      const dx = w.x2 - w.x1, dz = w.z2 - w.z1, len = Math.hypot(dx, dz), ang = Math.atan2(-dz, dx);
      const n = Math.floor(len / 0.36), l = L('gulf', lv);
      for (let i = 0; i < n; i++) {
        const u = (i + 0.5) * (len / n), g = new THREE.ExtrudeGeometry(tri, { depth: t + 0.04, bevelEnabled: false });
        g.translate(0, 0, -(t + 0.04) / 2);
        g.applyMatrix4(matrixFrom({ x: w.x1 + (dx / len) * u, y: top + 0.03, z: w.z1 + (dz / len) * u, ry: ang }));
        l.raw(g, M.stucco, {});
      }
    }
  }

  /* ================= LUXURY ================= */
  for (const r of feature) {
    const lv = r.level, y = ceilYOf(r), cx = r.x + r.width / 2, cz = r.z + r.depth / 2;
    const lay_ = L('luxury', lv);
    // coffered ceiling: brass-edged frame with a cross, hung just under the tray
    const ins = 0.62, w = r.width - 2 * ins, d = r.depth - 2 * ins, t = 0.07, h = 0.05;
    const yb = y - h / 2;
    for (const [bw, bd, bx, bz] of [[w, t, cx, r.z + ins], [w, t, cx, r.z + r.depth - ins], [t, d, r.x + ins, cz], [t, d, r.x + r.width - ins, cz], [w, t, cx, cz], [t, d, cx, cz]]) {
      lay_.box(bw, h, bd, bx, yb, bz, M.ceilingPaint, { cast: false });
      lay_.box(bw, 0.006, bd * 0.35, bx, y - h - 0.003, bz, goldLine, { cast: false, receive: false });
    }
    // warm cove light inside the frame
    lay_.box(w - 0.1, 0.01, 0.03, cx, y - 0.01, r.z + ins + 0.1, M.emissiveWarm, { cast: false, receive: false });
    lay_.box(w - 0.1, 0.01, 0.03, cx, y - 0.01, r.z + r.depth - ins - 0.1, M.emissiveWarm, { cast: false, receive: false });
    // dark marble border band with brass line inlaid in the floor
    if (r.level === 0) {
      const fy = r.floorY + 0.008, bi = 0.3, bw = 0.2;
      for (const [w2, d2, x2, z2] of [[r.width - 2 * bi, bw, cx, r.z + bi], [r.width - 2 * bi, bw, cx, r.z + r.depth - bi], [bw, r.depth - 2 * bi - 2 * bw, r.x + bi, cz], [bw, r.depth - 2 * bi - 2 * bw, r.x + r.width - bi, cz]]) {
        lay_.box(w2, 0.006, d2, x2, fy, z2, darkStone, { cast: false });
        if (w2 > d2) lay_.box(w2, 0.008, 0.012, x2, fy + 0.0005, z2 + (z2 < cz ? bw / 2 : -bw / 2), goldLine, { cast: false, receive: false });
        else lay_.box(0.012, 0.008, d2, x2 + (x2 < cx ? bw / 2 : -bw / 2), fy + 0.0005, z2, goldLine, { cast: false, receive: false });
      }
    }
  }

  /* ================= MODERN ================= */
  for (const r of feature) {
    const lv = r.level, y = ceilYOf(r), cx = r.x + r.width / 2, cz = r.z + r.depth / 2;
    const l = L('modern', lv);
    const n = r.width > r.depth ? 3 : 3, along = r.width > r.depth;
    for (let i = 0; i < n; i++) {
      const off = (i - (n - 1) / 2) * (Math.min(r.width, r.depth) - 1.0) / (n - 1 || 1) * 0.9;
      const len = (along ? r.width : r.depth) - 1.4;
      if (along) { l.box(len, 0.008, 0.06, cx, y - 0.004, cz + off, slot, { cast: false, receive: false }); l.box(len + 0.04, 0.012, 0.09, cx, y - 0.002, cz + off, M.black, { cast: false }); }
      else { l.box(0.06, 0.008, len, cx + off, y - 0.004, cz, slot, { cast: false, receive: false }); l.box(0.09, 0.012, len + 0.04, cx + off, y - 0.002, cz, M.black, { cast: false }); }
    }
  }
  {
    // vertical black steel fins screening the courtyard-side edge of the front walkway
    const l = L('modern', 0);
    const b = G.courtyard.bounds;
    for (let i = 0; i < 28; i++) l.box(0.025, 2.4, 0.09, b.x + 0.12 + i * ((b.width - 0.24) / 27), 0.15 + 1.2, b.z - 0.12, fin, {});
    l.box(b.width, 0.04, 0.12, b.x + b.width / 2, 0.15 + 2.42, b.z - 0.12, fin, {});
  }

  /* ---- assemble ---- */
  const parts = Object.values(lay);
  for (const p of parts) { p.build(); p.group.userData = { style: p.style, furnOnly: p.furnOnly }; roots[p.lv].group.add(p.group); }
  let curStyle = null, furnished = true;
  const refresh = () => { for (const p of parts) p.group.visible = p.style === curStyle && (!p.furnOnly || furnished); };
  return {
    layers: roots,
    setStyle(v) { curStyle = v; refresh(); },
    setFurnished(on) { furnished = on; refresh(); },
  };
}
