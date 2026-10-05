import * as THREE from 'three';
import { Layer } from './builder.js';
import { Local, plane } from './local.js';
import { M, register } from './mats.js';

function labelTexture(lines, { w = 512, h = 256, bg = '#23282a', fg = '#f1ece0', rim = '#b9a06a' } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, w, h);
  x.strokeStyle = rim; x.lineWidth = 7; x.strokeRect(14, 14, w - 28, h - 28);
  x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle';
  lines.forEach((ln, i) => {
    x.font = `${ln.size}px "Segoe UI", Arial, sans-serif`;
    x.fillText(ln.text, w / 2, ln.y);
  });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

/**
 * Street-side and envelope detailing that sits on top of the structural walls:
 * gate pillars, pedestrian gate, roller shutter housing, coping, plinth, slab fascia,
 * wall lights, cameras, down-pipes, roof plant.
 */
export function buildFacade(A, G, M_, models) {
  const L0 = A.layers[0];
  const reveal = new THREE.MeshStandardMaterial({ color: 0x77736a, roughness: 1 });
  register(reveal);
  const plate = new THREE.MeshStandardMaterial({ map: labelTexture([{ text: 'C', size: 120, y: 112 }, { text: 'END MIRROR · MURCIA', size: 30, y: 196 }]), roughness: 0.5, metalness: 0.2 });
  register(plate);
  const wallWarm = new THREE.MeshStandardMaterial({ color: 0xfff0d6, emissive: 0xffd9a0, emissiveIntensity: 3.2, roughness: 0.4 });
  register(wallWarm);

  const W = 10;
  const front = G.levels[0].walls.find((w) => w.id === 'gf-front-boundary');
  const carGate = front.openings.find((o) => o.type === 'vehicle_gate');
  const pedGate = front.openings.find((o) => o.type === 'gate');
  const cx0 = front.x1 - carGate.offset - carGate.width, cx1 = front.x1 - carGate.offset; // 6.855 .. 9.755
  const px0 = front.x1 - pedGate.offset - pedGate.width, px1 = front.x1 - pedGate.offset; // 4.305 .. 5.655
  A.gates = { cx0, cx1, px0, px1 };

  /* ---------------- boundary wall: plinth, reveals, coping, piers ---------------- */
  const wallTop = 0.15 + front.height;
  // plinth band on street face, interrupted at both gates
  for (const [a, b] of [[0.075, px0 - 0.1], [px1 + 0.1, cx0 - 0.06], [cx1 + 0.06, W - 0.075]]) {
    if (b - a > 0.05) L0.box(b - a, 0.42, 0.03, (a + b) / 2, 0.15 + 0.21, -0.012, M.kerb);
  }
  // precast horizontal reveals
  for (const y of [0.15 + 0.42, 0.15 + 1.2, 0.15 + 1.98, 0.15 + 2.76]) {
    for (const [a, b] of [[0.12, px0 - 0.02], [px1 + 0.02, cx0 - 0.02], [cx1 + 0.02, W - 0.12]]) {
      if (b - a > 0.05) L0.box(b - a, 0.012, 0.012, (a + b) / 2, y, -0.004, reveal, { cast: false });
    }
  }
  // coping slab on the street wall (only where nothing sits above it)
  L0.box(W - 2.5, 0.07, 0.34, (2.45 + W - 0.0) / 2, wallTop + 0.035, 0.125, M.concrete);
  // piers framing both gates
  const pier = (x, w = 0.46) => {
    L0.box(w, wallTop - 0.15 + 0.12, 0.42, x, 0.15 + (wallTop - 0.15 + 0.12) / 2, 0.125, M.stucco);
    L0.box(w + 0.1, 0.06, 0.52, x, wallTop + 0.15, 0.125, M.concrete);
    L0.box(w + 0.04, 0.05, 0.46, x, wallTop + 0.09, 0.125, M.concrete);
  };
  pier(cx1 + 0.02); pier((px1 + cx0) / 2); pier(px0 - 0.02);

  /* ---------------- vehicle gate: roller-shutter housing + guide rails ---------------- */
  const gw = cx1 - cx0, gm = (cx0 + cx1) / 2;
  const hoodY = 0.15 + carGate.height;
  L0.box(gw + 0.12, 0.34, 0.2, gm, hoodY + 0.16, -0.05, M.shutter);
  for (let i = 0; i < 5; i++) L0.box(gw + 0.12, 0.012, 0.215, gm, hoodY + 0.03 + i * 0.065, -0.05, M.blackSteel, { cast: false });
  for (const s of [-1, 1]) L0.box(0.07, carGate.height, 0.1, gm + s * (gw / 2 + 0.0), 0.15 + carGate.height / 2, 0.02, M.aluminium);
  // retracted bottom rail visible just under the housing
  L0.box(gw, 0.05, 0.06, gm, hoodY - 0.025, 0.04, M.blackSteel);

  /* ---------------- pedestrian gate: louvred steel leaf (swings in) ---------------- */
  const pw = pedGate.width, ph = pedGate.height;
  const gl = new Layer('gateLeaf');
  const lw = pw - 0.07, lh = ph - 0.02, fb = 0.07;
  gl.box(fb, lh, 0.06, fb / 2, lh / 2, 0, M.doorMetal);
  gl.box(fb, lh, 0.06, lw - fb / 2, lh / 2, 0, M.doorMetal);
  gl.box(lw, fb, 0.06, lw / 2, lh - fb / 2, 0, M.doorMetal);
  gl.box(lw, fb * 1.4, 0.06, lw / 2, fb * 0.7, 0, M.doorMetal);
  gl.box(lw - 2 * fb, fb * 0.8, 0.06, lw / 2, lh * 0.52, 0, M.doorMetal);
  const nLouv = Math.floor((lh - 0.4) / 0.075);
  for (let i = 0; i < nLouv; i++) {
    const y = 0.22 + i * 0.075;
    if (Math.abs(y - lh * 0.52) < 0.05) continue;
    gl.box(lw - 2 * fb, 0.05, 0.016, lw / 2, y, 0, M.doorMetal, { rx: 0.62 });
  }
  gl.box(0.035, 1.0, 0.04, lw - 0.1, 1.1, 0.055, M.steel);
  gl.box(0.035, 1.0, 0.04, lw - 0.1, 1.1, -0.055, M.steel);
  const leaf = gl.build();
  const outer = new THREE.Group(), swing = new THREE.Group();
  outer.position.set(px1 - 0.015, 0.15 + 0.01, 0.125); outer.rotation.y = Math.PI;
  swing.add(leaf); outer.add(swing); L0.group.add(outer);
  A.doors.push({ type: 'swing', level: 0, swing, ox: (px0 + px1) / 2, oy: 1.1, oz: 0.125, sign: -1, open: 0, width: pw });
  // door frame, threshold, hinges
  L0.box(0.08, ph, 0.28, px1 + 0.04, 0.15 + ph / 2, 0.125, M.doorMetal);
  L0.box(0.08, ph, 0.28, px0 - 0.04, 0.15 + ph / 2, 0.125, M.doorMetal);
  L0.box(pw + 0.16, 0.08, 0.28, (px0 + px1) / 2, 0.15 + ph + 0.04, 0.125, M.doorMetal);
  L0.box(pw + 0.12, 0.05, 0.4, (px0 + px1) / 2, 0.15 + 0.012, 0.125, M.stoneStep);
  // kerb ramp / drop-kerb in front of both gates (street 0.00 -> plot 0.15)
  L0.box(gw + 0.4, 0.08, 0.5, gm, 0.04, -0.28, M.concrete);
  L0.box(pw + 0.5, 0.1, 0.45, (px0 + px1) / 2, 0.05, -0.25, M.stoneStep);

  /* ---------------- plaques, intercom, lamps ---------------- */
  const sy = 0.15 + 1.45;
  plane(L0, 0.42, 0.21, px0 - 0.65, sy, -0.015, Math.PI, plate, { cast: true });
  L0.box(0.46, 0.25, 0.012, px0 - 0.65, sy, -0.008, M.blackSteel);
  // intercom + bell
  L0.box(0.12, 0.2, 0.04, px1 + 0.33, 0.15 + 1.35, -0.02, M.blackSteel);
  L0.box(0.07, 0.07, 0.01, px1 + 0.33, 0.15 + 1.4, -0.045, M.steel);
  L0.cyl(0.018, 0.018, 0.012, px1 + 0.33, 0.15 + 1.3, -0.045, M.emissiveCool, { rx: Math.PI / 2, seg: 12 });
  // cube wall lights on pier caps
  for (const x of [cx1 + 0.02, (px1 + cx0) / 2, px0 - 0.02]) {
    L0.box(0.2, 0.26, 0.2, x, wallTop + 0.31, 0.125, M.blackSteel);
    L0.box(0.17, 0.2, 0.17, x, wallTop + 0.31, 0.125, wallWarm, { cast: false, receive: false });
    L0.box(0.24, 0.03, 0.24, x, wallTop + 0.455, 0.125, M.blackSteel);
  }
  // letterbox on the street face
  L0.box(0.34, 0.26, 0.09, cx0 - 0.45, 0.15 + 1.1, -0.03, M.blackSteel);
  L0.box(0.24, 0.015, 0.012, cx0 - 0.45, 0.15 + 1.14, -0.078, M.steel);
  // vent louvres near the top of the street wall (visible on elevation)
  for (const x of [1.15, 1.95]) for (let i = 0; i < 4; i++) {
    L0.box(0.34, 0.012, 0.025, x, 0.15 + 2.72 + i * 0.03, -0.012, M.blackSteel, { cast: false });
  }

  /* ---------------- models: security gear, meter, AC ---------------- */
  if (models) {
    models.place(L0.group, 'security_camera_01', { x: cx1 - 0.35, y: wallTop - 0.4, z: 0.3, ry: Math.PI + 0.35 });
    models.place(L0.group, 'security_light', { x: (px0 + px1) / 2, y: 0.15 + 2.55, z: 0.02, ry: Math.PI });
    models.place(L0.group, 'utility_box_01', { x: 0.7, y: 0.15, z: 0.5, ry: 0.0 });
    // condensers on the shared service passage wall
    models.place(L0.group, 'exterior_aircon_unit', { x: 9.55, y: 0.15, z: 5.2, ry: -Math.PI / 2 });
    models.place(L0.group, 'exterior_aircon_unit', { x: 9.55, y: 0.15, z: 6.2, ry: -Math.PI / 2 });
    models.place(L0.group, 'water_manhole_cover', { x: 8.2, y: 0.15, z: 5.0, ry: 0.3 });
  }

  /* ---------------- plinth, slab fascia, down-pipes on exterior faces ---------------- */
  const wallInfo = (w) => {
    const dx = w.x2 - w.x1, dz = w.z2 - w.z1, len = Math.hypot(dx, dz);
    return { w, len, ux: dx / len, uz: dz / len, nx: -dz / len, nz: dx / len, t: w.thickness || 0.17, fy: w.floorY };
  };
  const roomsAt = (lv, wi, s, sgn) => {
    const px = wi.w.x1 + wi.ux * s + wi.nx * sgn * (wi.t / 2 + 0.3);
    const pz = wi.w.z1 + wi.uz * s + wi.nz * sgn * (wi.t / 2 + 0.3);
    return A.roomAt(lv, px, pz, 0.0);
  };
  const strip = (L, wi, s0, s1, y0, y1, sgn, depth, mat, cast = true) => {
    const mid = (s0 + s1) / 2, off = sgn * (wi.t / 2 + depth / 2);
    L.box(s1 - s0, y1 - y0, depth, wi.w.x1 + wi.ux * mid + wi.nx * off, (y0 + y1) / 2, wi.w.z1 + wi.uz * mid + wi.nz * off, mat, { ry: -Math.atan2(wi.uz, wi.ux), cast });
  };
  A.levels.forEach((lvl, lv) => {
    const L = A.layers[lv];
    for (const w of lvl.walls) {
      if (w.type !== 'external' || w.id === 'gf-front-boundary') continue;
      const wi = wallInfo(w);
      const sgn = roomsAt(lv, wi, wi.len / 2, 1) ? -1 : 1;
      if (roomsAt(lv, wi, wi.len / 2, sgn)) continue; // enclosed both sides: skip
      // slab-edge fascia
      if (lv >= 1) strip(L, wi, 0, wi.len, wi.fy - 0.22, wi.fy + 0.02, sgn, 0.035, M.stucco);
      // ground floor plinth
      if (lv === 0) {
        let s = 0;
        const cuts = (w.openings || []).filter((o) => (o.bottom || 0) < 0.4).sort((a, b) => a.offset - b.offset);
        for (const o of cuts) { if (o.offset - 0.02 > s) strip(L, wi, s, o.offset - 0.02, wi.fy, wi.fy + 0.38, sgn, 0.02, M.kerb); s = Math.max(s, o.offset + o.width + 0.02); }
        if (wi.len > s) strip(L, wi, s, wi.len, wi.fy, wi.fy + 0.38, sgn, 0.02, M.kerb);
      }
      // parapet / top fascia line
      const top = wi.fy + w.height;
      if (!(lv === 0 && w.height < 3.2 && wi.fy < 0.2 && false)) strip(L, wi, 0, wi.len, top - 0.1, top + 0.0, sgn, 0.03, M.stucco);
    }
  });

  // down-pipes at the far corners of the right (end) wall and the back wall
  const pipe = (x, z, h = 10.2) => {
    L0.cyl(0.04, 0.04, h, x, 0.15 + h / 2, z, M.plastic, { seg: 12 });
    for (let y = 0.8; y < h; y += 1.6) L0.cyl(0.055, 0.055, 0.05, x, 0.15 + y, z, M.steel, { seg: 12 });
  };
  pipe(-0.05, 11.5, 10.2); pipe(-0.05, 22.95, 10.2); pipe(4.5, 22.95, 7.2);

  /* ---------------- roof plant ---------------- */
  const roofY = 10.15, RL = A.roofLayer;
  const tank = (x, z) => {
    RL.box(1.5, 0.18, 1.5, x, roofY + 0.09, z, M.concrete);
    RL.cyl(0.62, 0.62, 1.5, x, roofY + 0.95, z, M.black, { seg: 28 });
    RL.cyl(0.45, 0.45, 0.06, x, roofY + 1.72, z, M.black, { seg: 24 });
    for (const yy of [0.5, 1.0, 1.45]) RL.cyl(0.635, 0.635, 0.025, x, roofY + 0.2 + yy, z, M.rubber, { seg: 28 });
    RL.cyl(0.04, 0.04, 0.5, x + 0.6, roofY + 0.45, z, M.steel, { seg: 10 });
  };
  tank(1.1, 21.8); tank(2.9, 21.8);
  if (models) {
    models.place(RL.group, 'exterior_aircon_unit', { x: 3.6, y: roofY + 0.03, z: 17.0, ry: Math.PI / 2 });
    models.place(RL.group, 'exterior_aircon_unit', { x: 3.6, y: roofY + 0.03, z: 18.1, ry: Math.PI / 2 });
    models.place(RL.group, 'exterior_aircon_unit', { x: 3.6, y: roofY + 0.03, z: 19.2, ry: Math.PI / 2 });
  }
  // satellite dish
  RL.cyl(0.03, 0.03, 1.4, 0.7, roofY + 0.7, 14.0, M.steel, { seg: 8 });
  const dish = new THREE.SphereGeometry(0.4, 20, 10, 0, Math.PI * 2, 0, 0.9);
  dish.rotateX(-Math.PI / 2 + 0.55); dish.translate(0.7, roofY + 1.45, 14.0);
  RL.raw(dish, M.aluminiumWhite);
}
