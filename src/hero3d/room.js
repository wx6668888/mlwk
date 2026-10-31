// The Unfolded Room, rebuilt as the living room of the Guangzhou Residence (P175 / P179).
// Technique and structure adapted from flat-to-3d / 01-exploded-house / dir-b.js
// (c) 2026 Samnang Aing, MIT License — see ./LICENSE.
//
// A developed-elevation sheet: the plan in the middle, the four walls folded out flat around it, the ceiling
// beyond the display wall. Scroll folds it into a closed box, the wash turns into material, the door opens and
// the camera walks in to the view of P179, where the hero hands over to real footage.
// This is a DESIGN DRAWING, not a record of the delivered scope: the page labels it as such.
import {
  THREE, Part, bx, cyl, panel, M, V, clamp, lerp, ease, win,
  scene, renderer, camera, lineMat, stdMat, eyeKey, canvasTex, rng, DRAW, patchFill, INK, ACCENT, segs,
} from './core.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const RX = 3.0, RZ = 2.4, H = 2.9, TH = 0.12, OX = RX + TH, OZ = RZ + TH;
const FONT = 'Manrope, "Noto Sans SC", system-ui, sans-serif';

function rb(x0, y0, z0, x1, y1, z1, r = 0.04) {
  const w = Math.abs(x1 - x0), h = Math.abs(y1 - y0), d = Math.abs(z1 - z0);
  const g = new RoundedBoxGeometry(w, h, d, 4, Math.min(r, Math.min(w, h, d) / 2 - 0.002));
  g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); return g;
}

export function build(labels) {
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  scene.add(new THREE.HemisphereLight('#fbf9f5', '#e4ded4', 2.2));
  const SUN_A = V(-7, 11, 8), SUN_B = V(10, 7.2, 3.2);
  const sun = new THREE.DirectionalLight('#fff4e4', 2.4);
  sun.position.copy(SUN_A); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -13, right: 13, top: 13, bottom: -13, near: 1, far: 45 });
  sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.025; sun.target.position.set(0, 0, -1.5);
  scene.add(sun, sun.target);
  // warm cove light that comes up once you are inside
  const cove = new THREE.PointLight('#ffe6c4', 0, 9, 1.6); cove.position.set(-0.4, 2.55, -0.6); scene.add(cove);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(90, 90).rotateX(-Math.PI / 2), new THREE.ShadowMaterial({ color: '#3a3128', opacity: 0.08 }));
  ground.position.y = -0.125; ground.receiveShadow = true; scene.add(ground);

  const T = buildTextures();
  // Material codes used on the sheet. Colours follow docs/design-system.md §2.3.
  const PAL = {
    plaster: { mat: stdMat('#e9e6e0', { rough: 0.9, map: T.plaster, bumpMap: T.plasterBump, bumpScale: 0.004 }), uvScale: 0.35 },
    ceiling: { mat: stdMat('#f1eee9', { rough: 0.92, map: T.plaster, emissive: '#f3ece0', emissiveIntensity: 0.16 }), uvScale: 0.35 },
    base: { mat: stdMat('#d9d1c3', { rough: 0.88 }) },
    floor: { mat: stdMat('#ffffff', { map: T.marble.map, rough: 0.22, env: 0.7 }), thr: 60 },
    smoked: { mat: stdMat('#ffffff', { map: T.smoked.map, bumpMap: T.smoked.bump, bumpScale: 0.012, rough: 0.5, env: 0.45 }), uvScale: 0.9 },
    lacquer: { mat: stdMat('#ecebe7', { rough: 0.26, env: 0.65 }) },
    blackLacquer: { mat: stdMat('#1d1c1b', { rough: 0.3, env: 0.6 }) },
    bronze: { mat: stdMat('#8c6a43', { rough: 0.34, metal: 0.85, env: 0.9 }) },
    bronzeGlass: { mat: stdMat('#4a3f35', { opacity: 0.42, rough: 0.06, env: 0.9 }), cast: false, edges: false },
    clearGlass: { mat: stdMat('#cfdadb', { opacity: 0.16, rough: 0.05, env: 0.8 }), cast: false, edges: false },
    stone: { mat: stdMat('#ffffff', { map: T.nero, rough: 0.18, env: 0.8 }), uvScale: 0.6 },
    leather: { mat: stdMat('#1f1d1b', { rough: 0.48, bumpMap: T.leatherBump, bumpScale: 0.01, env: 0.5 }), uvScale: 2, thr: 50 },
    sheer: { mat: stdMat('#f3eee6', { opacity: 0.82, rough: 0.95, side: THREE.DoubleSide }), cast: false, edges: false },
    frame: { mat: stdMat('#2a2623', { rough: 0.4, metal: 0.35 }) },
    led: { mat: stdMat('#fff2dc', { emissive: '#ffcf8a', emissiveIntensity: 1.4 }), edges: false, cast: false },
    coveStrip: { mat: stdMat('#fff2dc', { emissive: '#ffd9a8', emissiveIntensity: 1.8 }), edges: false, cast: false },
  };
  const line = lineMat({ w: 0.95, color: '#24221f', opacity: 0.88 });
  const W = { mid: lineMat({ w: 0.6, color: '#24221f', opacity: 0.6 }) };
  const mkPart = g => new Part(g, PAL, line, W);

  // ---- floor and the furniture on it (sofa back to the display wall, as in P179)
  const floor = new THREE.Group(); scene.add(floor);
  const fp = mkPart(floor);
  fp.add('base', bx(-OX, -0.12, -OZ, OX, -0.02, OZ));
  fp.add('floor', bx(-RX, -0.02, -RZ, RX, 0, RZ));
  const fItems = new THREE.Group(); floor.add(fItems); const fi = mkPart(fItems);
  // sofa: plinth, seat cushions, back, arms
  fi.add('leather', rb(-2.3, 0, -1.95, 0.6, 0.22, -1.0, 0.03));
  for (const x of [-2.25, -1.3, -0.35]) fi.add('leather', rb(x, 0.22, -1.85, x + 0.9, 0.42, -1.02, 0.06));
  for (const x of [-2.25, -1.3, -0.35]) fi.add('leather', rb(x, 0.22, -1.95, x + 0.9, 0.82, -1.68, 0.07));
  fi.add('leather', rb(-2.45, 0, -1.95, -2.25, 0.62, -1.0, 0.05), rb(0.55, 0, -1.95, 0.75, 0.62, -1.0, 0.05));
  // ottoman and coffee table
  fi.add('leather', rb(-2.0, 0, -0.55, -0.6, 0.4, 0.05, 0.06));
  fi.add('blackLacquer', bx(-0.35, 0, -0.75, 0.75, 0.32, 0.05));
  fi.add('bronzeGlass', bx(-0.37, 0.32, -0.77, 0.77, 0.34, 0.07));
  fp.build(); fi.build();

  // ---- the walls, each hinged on its outer bottom edge
  const walls = {};
  function wall(id, pos) {
    const pivot = new THREE.Group(); pivot.position.set(...pos); scene.add(pivot);
    const items = new THREE.Group(); pivot.add(items);
    const w = { id, pivot, items, wp: mkPart(pivot), ip: mkPart(items) };
    walls[id] = w; return w;
  }
  const N = wall('north', [0, 0, -OZ]);
  const S = wall('south', [0, 0, OZ]);
  const Wst = wall('west', [-OX, 0, 0]);
  const E = wall('east', [OX, 0, 0]);
  N.items.position.z = TH; S.items.position.z = -TH; Wst.items.position.x = TH; E.items.position.x = -TH;

  // A north: the display wall. Smoked-oak panels, bronze-framed glass cabinets over a stone niche,
  // a tall bronze glass cabinet to the right.
  N.wp.add('plaster', panel([[-OX, 0], [OX, 0], [OX, H], [-OX, H]], [], TH));
  const a = N.ip;
  const oakPanels = (x0, x1, y1 = 2.7) => { for (let x = x0; x < x1 - 0.01; x += 0.6) a.add('smoked', bx(x + 0.003, 0, 0, Math.min(x + 0.6, x1) - 0.003, y1, 0.04)); };
  oakPanels(-3.0, -1.9); oakPanels(0.2, 1.0); oakPanels(1.8, 3.0);
  // stone niche with a low black console
  a.add('stone', bx(-1.9, 0.62, 0, 0.2, 1.62, 0.03));
  a.add('blackLacquer', bx(-1.9, 0, 0, 0.2, 0.55, 0.45), bx(-1.9, 0.55, 0, 0.2, 0.62, 0.32));
  // upper glass cabinets: carcass, three bays with bronze frames, glass fronts and lit shelves
  a.add('smoked', bx(-1.9, 1.62, 0, 0.2, 1.66, 0.36), bx(-1.9, 2.66, 0, 0.2, 2.7, 0.36));
  a.add('stone', bx(-1.88, 1.66, 0, 0.18, 2.66, 0.02));
  for (let i = 0; i < 3; i++) {
    const x0 = -1.9 + i * 0.7, x1 = x0 + 0.7;
    a.add('bronze', bx(x0, 1.66, 0.34, x0 + 0.025, 2.66, 0.37), bx(x1 - 0.025, 1.66, 0.34, x1, 2.66, 0.37),
      bx(x0, 1.66, 0.34, x1, 1.685, 0.37), bx(x0, 2.635, 0.34, x1, 2.66, 0.37));
    a.add('clearGlass', bx(x0 + 0.025, 1.685, 0.35, x1 - 0.025, 2.635, 0.36));
    a.add('smoked', bx(x0 + 0.02, 2.14, 0.02, x1 - 0.02, 2.16, 0.33));
    a.add('led', bx(x0 + 0.04, 2.13, 0.3, x1 - 0.04, 2.14, 0.32), bx(x0 + 0.04, 2.625, 0.3, x1 - 0.04, 2.635, 0.32));
  }
  // tall bronze-framed glass cabinet
  a.add('smoked', bx(1.0, 0, 0, 1.8, 0.08, 0.42), bx(1.0, 2.62, 0, 1.8, 2.7, 0.42));
  a.add('bronze', bx(1.0, 0.08, 0.4, 1.03, 2.62, 0.43), bx(1.77, 0.08, 0.4, 1.8, 2.62, 0.43), bx(1.385, 0.08, 0.4, 1.415, 2.62, 0.43));
  a.add('smoked', bx(1.0, 0.08, 0, 1.8, 2.62, 0.02), bx(1.0, 0.08, 0.02, 1.02, 2.62, 0.4), bx(1.78, 0.08, 0.02, 1.8, 2.62, 0.4));
  a.add('bronzeGlass', bx(1.03, 0.08, 0.41, 1.77, 2.62, 0.42));
  for (const y of [0.6, 1.1, 1.6, 2.1]) { a.add('smoked', bx(1.02, y, 0.02, 1.78, y + 0.02, 0.38)); a.add('led', bx(1.05, y - 0.012, 0.34, 1.75, y, 0.36)); }

  // B east: floor-to-ceiling window with a sheer
  const WZ = 1.7, WV0 = 0.05, WV1 = 2.62;
  E.wp.add('plaster', panel([[-RZ, 0], [RZ, 0], [RZ, H], [-RZ, H]], [[[-WZ, WV0], [WZ, WV0], [WZ, WV1], [-WZ, WV1]]], TH).applyMatrix4(M.alongZ(0)));
  const f = 0.05;
  E.wp.add('frame', bx(-TH, WV0, -WZ, 0, WV0 + f, WZ), bx(-TH, WV1 - f, -WZ, 0, WV1, WZ), bx(-TH, WV0, -WZ, 0, WV1, -WZ + f), bx(-TH, WV0, WZ - f, 0, WV1, WZ),
    bx(-TH, WV0, -0.6, 0, WV1, -0.56), bx(-TH, WV0, 0.56, 0, WV1, 0.6));
  E.wp.add('clearGlass', bx(-0.07, WV0 + f, -WZ + f, -0.05, WV1 - f, WZ - f));
  E.ip.add('sheer', bx(-0.12, 0.04, 1.75, -0.09, 2.72, 2.32), bx(-0.12, 0.04, -2.32, -0.09, 2.72, -1.75));

  // C south: the door and a white-lacquer storage wall with a bronze glass bay
  S.wp.add('plaster', panel([[-OX, 0], [1.4, 0], [1.4, 2.4], [2.3, 2.4], [2.3, 0], [OX, 0], [OX, H], [-OX, H]], [], TH).applyMatrix4(M.alongX(-TH)));
  S.wp.add('smoked', bx(1.36, 0, -TH - 0.01, 1.4, 2.44, 0.01), bx(2.3, 0, -TH - 0.01, 2.34, 2.44, 0.01), bx(1.36, 2.4, -TH - 0.01, 2.34, 2.44, 0.01));
  const door = new THREE.Group(); door.position.set(1.42, 0, -0.07); S.pivot.add(door);
  const dp = mkPart(door);
  dp.add('smoked', bx(0, 0.005, -0.02, 0.86, 2.38, 0.02));
  dp.add('bronze', bx(0.76, 0.7, 0.02, 0.78, 1.5, 0.05), bx(0.76, 0.7, -0.05, 0.78, 1.5, -0.02));
  dp.build();
  const sh = S.ip, X0 = -2.9, X1 = 0.9, D = -0.42;
  for (let x = X0; x < X1 - 0.01; x += 0.475) {
    const bay = Math.round((x - X0) / 0.475);
    if (bay === 3 || bay === 4) {
      sh.add('bronze', bx(x, 0, 0, x + 0.475, 0.06, D), bx(x + 0.005, 0.06, D, x + 0.025, 2.6, D - 0.02), bx(x + 0.45, 0.06, D, x + 0.47, 2.6, D - 0.02));
      sh.add('bronzeGlass', bx(x + 0.025, 0.06, D - 0.005, x + 0.45, 2.6, D - 0.015));
      for (const y of [0.7, 1.3, 1.9]) sh.add('smoked', bx(x + 0.02, y, -0.02, x + 0.455, y + 0.02, D + 0.02));
    } else {
      sh.add('lacquer', bx(x + 0.003, 0, 0, x + 0.472, 2.6, D));
      sh.add('frame', bx(x + 0.43, 0.9, D, x + 0.445, 1.5, D - 0.02));
    }
  }
  sh.add('lacquer', bx(X0, 2.6, 0, X1, 2.7, D));

  // D west: the white-lacquer media wall with a floating smoked-oak console
  Wst.wp.add('plaster', panel([[-RZ, 0], [RZ, 0], [RZ, H], [-RZ, H]], [], TH).applyMatrix4(M.alongZ(TH)));
  const wi = Wst.ip;
  for (let z = -2.1; z < 2.09; z += 0.6) wi.add('lacquer', bx(0, 0, z + 0.003, 0.05, 2.7, z + 0.597));
  wi.add('smoked', bx(0.05, 0.28, -1.6, 0.5, 0.58, 1.6));
  wi.add('led', bx(0.05, 0.27, -1.55, 0.48, 0.28, 1.55));
  wi.add('blackLacquer', bx(0.05, 1.05, -1.05, 0.09, 1.95, 0.95));

  // the ceiling, hinged on the display wall's top edge, with a lit cove around its edge
  const lid = new THREE.Group(); lid.position.set(0, H, 0); N.pivot.add(lid);
  const lp = mkPart(lid); lp.add('ceiling', bx(-OX, 0, 0, OX, TH, 2 * OZ));
  const lItems = new THREE.Group(); lid.add(lItems); const li = mkPart(lItems);
  li.add('ceiling', bx(-2.4, -0.18, 0.6, 2.4, 0, 4.44));
  li.add('coveStrip', bx(-2.42, -0.2, 0.58, 2.42, -0.18, 0.62), bx(-2.42, -0.2, 4.42, 2.42, -0.18, 4.46),
    bx(-2.44, -0.2, 0.58, -2.4, -0.18, 4.46), bx(2.4, -0.2, 0.58, 2.44, -0.18, 4.46));
  for (const [x, z] of [[-1.6, 1.6], [0, 1.6], [1.6, 1.6], [-1.6, 3.4], [0, 3.4], [1.6, 3.4]]) li.add('led', cyl(0.05, 0.01, x, -0.19, z, 20));

  for (const w of Object.values(walls)) { w.wp.build(); w.ip.build(); }
  lp.build(); li.build();

  // ---- timing: it folds into a closed box, then you walk in through the door
  const FOLD = { west: [0.12, 0.24], north: [0.19, 0.31], east: [0.26, 0.38], south: [0.33, 0.45], lid: [0.42, 0.56] };
  const GROW = { floor: [0.06, 0.18], west: [0.16, 0.26], north: [0.23, 0.33], east: [0.3, 0.4], south: [0.37, 0.47], lid: [0.44, 0.52] };
  const sheets = [];
  let S_tags = () => {};
  const g = (k, p) => lerp(0.015, 1, ease(win(p, ...GROW[k])));

  const keys = [
    { at: 0, t: [-0.6, 0, -2.5], az: 90, el: 89.3, fov: 2.2, h: 21, sx: 0.36, ph: { h: 46, sx: 0, sy: -0.22 } },
    { at: 0.06, t: [-0.6, 0, -2.5], az: 90, el: 89.3, fov: 2.2, h: 21, sx: 0.36, ph: { h: 46, sx: 0, sy: -0.22 } },
    { at: 0.3, t: [0.0, 0.8, -1.4], az: 104, el: 42, fov: 2.2, h: 14.5, sx: 0.2, ph: { h: 30, sx: 0, sy: -0.3 } },
    { at: 0.56, t: [0.3, 1.4, 0], az: 112, el: 34, fov: 2.6, h: 10.5, sx: 0.08, ph: { h: 21, sx: 0, sy: -0.22 } },
    { at: 0.62, t: [0.3, 1.4, 0], az: 112, el: 34, fov: 2.6, h: 10.5, sx: 0.08, ph: { h: 21, sx: 0, sy: -0.22 } },
    eyeKey(0.72, [6.6, 3.9, 8.4], [1.6, 1.25, 2.3], 38, { ph: eyeKey(0.72, [7.8, 4.5, 10.2], [1.4, 1.25, 1.8], 50) }),
    eyeKey(0.80, [1.85, 1.6, 4.4], [1.85, 1.58, 0], 52, { sy: -0.04, ph: eyeKey(0.80, [1.85, 1.6, 5.6], [1.85, 1.58, 0], 72, { sy: -0.02 }) }),
    // just inside the door, then across to the P179 view: display wall left of centre, bronze cabinet centre,
    // window light at the right edge. K01 (real footage of P179) takes over from this frame.
    eyeKey(0.85, [1.85, 1.5, 2.25], [0.4, 1.36, -2.4], 54, { sy: 0.03, ph: eyeKey(0.85, [1.85, 1.5, 2.25], [0.4, 1.36, -2.4], 72, { sy: 0.05 }) }),
    eyeKey(0.93, [0.6, 1.34, 1.88], [0.6, 1.3, -2.4], 60, { sy: 0.03, ph: eyeKey(0.93, [0.6, 1.34, 1.88], [0.6, 1.3, -2.4], 74, { sy: 0.05 }) }),
    eyeKey(1.0, [-0.35, 1.28, 1.86], [0.8, 1.3, -2.4], 64, { sy: 0.03, ph: eyeKey(1.0, [-0.35, 1.28, 1.86], [0.8, 1.3, -2.4], 76, { sy: 0.05 }) }),
  ];

  function update(p) {
    const fold = {};
    for (const [id, w] of Object.entries(FOLD)) fold[id] = 1 - ease(win(p, ...w));
    N.pivot.rotation.x = -Math.PI / 2 * fold.north;
    S.pivot.rotation.x = Math.PI / 2 * fold.south;
    Wst.pivot.rotation.z = Math.PI / 2 * fold.west;
    E.pivot.rotation.z = -Math.PI / 2 * fold.east;
    lid.rotation.x = -Math.PI / 2 * fold.lid;
    fItems.scale.y = g('floor', p);
    N.items.scale.z = g('north', p); S.items.scale.z = g('south', p);
    Wst.items.scale.x = g('west', p); E.items.scale.x = g('east', p);
    lItems.scale.y = g('lid', p);
    door.rotation.y = 1.0 * ease(win(p, 0.56, 0.65)) + 1.6 * ease(win(p, 0.78, 0.85));
    for (const [m, a0, b0] of sheets) { m.opacity = 1 - win(p, a0, b0); }
    S_tags(p);
    DRAW.uWash.value = 1 - ease(win(p, 0.2, 0.5));
    sun.position.lerpVectors(SUN_A, SUN_B, ease(win(p, 0.56, 0.7)));
    cove.intensity = 4 * win(p, 0.78, 0.92);
    const up = ['west', 'north', 'east', 'south', 'lid'].filter(id => fold[id] < 0.02).length;
    return { surfaces: 1 + up };
  }

  update(0); scene.updateMatrixWorld(true);
  const SH = { x0: -8.6, z0: -11.6, w: 17.2, d: 18.4, s: 120 };
  const panelTex = drawSheet(SH, 'panel'), groundTex = drawSheet(SH, 'ground');
  const decalMat = (map, a0, b0) => { const m = patchFill(new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }), { wash: false }); sheets.push([m, a0, b0]); return m; };
  const panelMat = decalMat(panelTex, 0.48, 0.56), groundMat = decalMat(groundTex, 0.1, 0.18);
  function decal(mat, x0, z0, x1, z1, y, parent) {
    const geo = new THREE.PlaneGeometry(x1 - x0, z1 - z0).rotateX(-Math.PI / 2);
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
      const x = x0 + uv.getX(i) * (x1 - x0), z = z1 - uv.getY(i) * (z1 - z0);
      uv.setXY(i, (x - SH.x0) / SH.w, 1 - (z - SH.z0) / SH.d);
    }
    const m = new THREE.Mesh(geo, mat); m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); m.renderOrder = 4;
    scene.add(m); m.updateMatrixWorld(); if (parent) parent.attach(m); return m;
  }
  decal(panelMat, -OX, -OZ, OX, OZ, 0.03, floor);
  decal(panelMat, SH.x0, -5.42, SH.x0 + SH.w, -OZ, 0.145, N.pivot);
  decal(panelMat, SH.x0, SH.z0, SH.x0 + SH.w, -5.42, 0.03, lid);
  decal(panelMat, SH.x0, -OZ, -OX, 3.0, 0.145, Wst.pivot);
  decal(panelMat, OX, -OZ, SH.x0 + SH.w, 3.3, 0.145, E.pivot);
  decal(panelMat, -OX, OZ, OX, SH.z0 + SH.d, 0.145, S.pivot);
  decal(panelMat, OX, 3.3, SH.x0 + SH.w, SH.z0 + SH.d, 0.145, S.pivot);

  // item codes: upright tags that ride with their surface and hide when it turns away from you
  const CODES = [
    [N.pivot, V(0, 0, 1), 0.12, [[-2.5, -4.32, 'WP-01'], [-0.85, -4.62, 'GL-02'], [-1.2, -3.72, 'ST-03'], [1.4, -4.02, 'BR-04']]],
    [E.pivot, V(-1, 0, 0), 0.12, [[4.42, -1.0, 'AL-05'], [4.72, 2.0, 'LN-06']]],
    [S.pivot, V(0, 0, -1), 0.12, [[1.85, 3.72, 'DR-07'], [-1.0, 3.92, 'LQ-08']]],
    [Wst.pivot, V(1, 0, 0), 0.12, [[-4.72, -0.5, 'LQ-08'], [-3.57, 0.6, 'WP-01']]],
    [lid, V(0, -1, 0), 0.0, [[2.5, -5.62, 'CL-09']]],
  ];
  const tags = [];
  for (const [obj, n, y, list] of CODES) for (const [x, z, c] of list) {
    const at = obj.worldToLocal(V(x, y, z));
    tags.push({ obj, n, item: labels.add({ no: c, name: '', obj, at, mode: 'tag', cls: 'code', tx: 12, ty: -16 }) });
  }
  const tw = new THREE.Vector3(), tn = new THREE.Vector3(), tq = new THREE.Quaternion();
  S_tags = (p) => {
    const life = win(p, 0.0, 0.02) * (1 - win(p, 0.46, 0.52));
    for (const t of tags) {
      t.obj.getWorldQuaternion(tq); tn.copy(t.n).applyQuaternion(tq);
      tw.copy(t.item.at).applyMatrix4(t.obj.matrixWorld); tw.sub(camera.position).negate().normalize();
      t.item.op = life * clamp((tn.dot(tw) - 0.3) / 0.3);
    }
  };
  // the closed box keeps its drawing on the outside: dimension strings and wall titles
  const outMat = lineMat({ w: 1.0, color: INK, opacity: 0 });
  const tk = (x, y, z, ax) => ax === 'x' ? [x - 0.07, y - 0.07, z, x + 0.07, y + 0.07, z] : [x, y - 0.07, z - 0.07, x, y + 0.07, z + 0.07];
  segs(S.pivot, [[-OX, 0.25, 0.015, OX, 0.25, 0.015], tk(-OX, 0.25, 0.015, 'x'), tk(OX, 0.25, 0.015, 'x'),
    [1.4, 2.62, 0.015, 2.3, 2.62, 0.015], tk(1.4, 2.62, 0.015, 'x'), tk(2.3, 2.62, 0.015, 'x'),
    [2.5, 0.02, 0.015, 2.5, 2.4, 0.015], [2.43, 0.02, 0.015, 2.57, 0.02, 0.015], [2.43, 2.4, 0.015, 2.57, 2.4, 0.015]], outMat);
  segs(E.pivot, [[0.015, 0.25, -RZ, 0.015, 0.25, RZ], tk(0.015, 0.25, -RZ, 'z'), tk(0.015, 0.25, RZ, 'z'),
    [0.015, 2.78, -WZ, 0.015, 2.78, WZ], tk(0.015, 2.78, -WZ, 'z'), tk(0.015, 2.78, WZ, 'z')], outMat);
  const OUT = [
    [S.pivot, V(0, 0, 1), V(0, 0.42, 0.015), '6 240', ''], [S.pivot, V(0, 0, 1), V(1.85, 2.78, 0.015), '900', ''],
    [S.pivot, V(0, 0, 1), V(2.5, 1.2, 0.015), '2 400', ''], [S.pivot, V(0, 0, 1), V(-1.9, 1.5, 0.015), 'C', 'Door wall'],
    [E.pivot, V(1, 0, 0), V(0.015, 0.42, 0), '4 800', ''], [E.pivot, V(1, 0, 0), V(0.015, 2.94, 0), '3 400', ''],
    [E.pivot, V(1, 0, 0), V(0.015, 1.5, -2.05), 'B', 'Window wall'],
  ];
  const outs = OUT.map(([obj, n, at, no, name]) => ({ obj, n, item: labels.add({ no, name, obj, at, mode: 'tag', cls: name ? '' : 'code', tx: 0, ty: 0 }) }));
  const prevTags = S_tags;
  S_tags = (p) => {
    prevTags(p);
    const life = win(p, 0.58, 0.63) * (1 - win(p, 0.77, 0.81));
    outMat.opacity = life * 0.9;
    for (const t of outs) {
      t.obj.getWorldQuaternion(tq); tn.copy(t.n).applyQuaternion(tq);
      tw.copy(t.item.at).applyMatrix4(t.obj.matrixWorld); tw.sub(camera.position).negate().normalize();
      t.item.op = life * clamp((tn.dot(tw) - 0.05) / 0.15);
    }
  };
  decal(groundMat, SH.x0, SH.z0, SH.x0 + SH.w, SH.z0 + SH.d, 0.16, null);

  return {
    update, keys, R: 40,
    introHook: (t) => { sun.shadow.intensity = win(t, 3.3, 3.9); },
    draw: { dir: [0, 0, 0], radial: 1, c: [0, 0, 0], min: 0, max: 12, soft: 1.0 },
  };
}

// ---- the sheet, in plan coordinates (north up). 'panel' rides up with its wall; 'ground' stays on the paper.
function drawSheet(SH, layer) {
  const S = SH.s, X = x => (x - SH.x0) * S, Y = z => (z - SH.z0) * S;
  return canvasTex(Math.round(SH.w * S), Math.round(SH.d * S), (g) => {
    g.strokeStyle = INK; g.fillStyle = INK; g.lineCap = 'round';
    const font = (m, wt = 500) => { g.font = `${wt} ${Math.round(m * S)}px ${FONT}`; };
    const ln = (x0, z0, x1, z1, w = 2) => { g.lineWidth = w; g.beginPath(); g.moveTo(X(x0), Y(z0)); g.lineTo(X(x1), Y(z1)); g.stroke(); };
    const txt = (t, x, z, m = 0.18, align = 'center', rot = 0, wt = 600, col = INK) => {
      g.save(); g.translate(X(x), Y(z)); g.rotate(rot); font(m, wt); g.textAlign = align; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(t, 0, 0); g.restore();
    };
    const tick = (x, z) => ln(x - 0.07, z + 0.07, x + 0.07, z - 0.07, 3);
    const dimH = (x0, x1, z, t) => { ln(x0, z, x1, z, 1.8); tick(x0, z); tick(x1, z); ln(x0, z - 0.12, x0, z + 0.12, 1.4); ln(x1, z - 0.12, x1, z + 0.12, 1.4); txt(t, (x0 + x1) / 2, z - 0.19); };
    const dimV = (z0, z1, x, t) => { ln(x, z0, x, z1, 1.8); tick(x, z0); tick(x, z1); ln(x - 0.12, z0, x + 0.12, z0, 1.4); ln(x - 0.12, z1, x + 0.12, z1, 1.4); txt(t, x - 0.19, (z0 + z1) / 2, 0.18, 'center', -Math.PI / 2); };
    const code = (dx, dz) => { g.beginPath(); g.arc(X(dx), Y(dz), 0.045 * S, 0, 7); g.fillStyle = ACCENT; g.fill(); };
    const title = (l, t, x, z) => {
      font(0.3, 600); g.textAlign = 'left'; g.textBaseline = 'middle';
      g.fillStyle = ACCENT; g.fillText(l, X(x), Y(z)); const lw = g.measureText(l + '  ').width;
      g.fillStyle = INK; g.fillText(t, X(x) + lw, Y(z));
    };
    const schedule = (x, z, rows, right = false) => rows.forEach(([c, d], i) => {
      font(0.17, 600); g.textBaseline = 'middle';
      const zz = Y(z + i * 0.32), cw = g.measureText(c + '  ').width;
      if (right) { font(0.17, 500); const dw = g.measureText(d).width; g.textAlign = 'left'; g.fillStyle = INK; g.fillText(d, X(x) - dw, zz); font(0.17, 600); g.fillStyle = ACCENT; g.fillText(c, X(x) - dw - cw, zz); }
      else { g.textAlign = 'left'; g.fillStyle = ACCENT; g.fillText(c, X(x), zz); font(0.17, 500); g.fillStyle = INK; g.fillText(d, X(x) + cw, zz); }
    });

    if (layer === 'panel') {
      dimH(-3, 3, 2.24, '6 000'); dimV(-2.4, 2.4, -2.78, '4 800');
      txt('LIVING', -1.0, 1.3, 0.24); txt('28.8 M²  ·  MB-10 MARBLE', -1.0, 1.66, 0.16, 'center', 0, 500);
      // A display wall (north, z = -2.52 - height)
      dimV(-2.52, -5.42, -3.45, '2 900'); dimH(-1.9, 0.2, -5.6, '2 100'); dimH(1.0, 1.8, -5.6, '800');
      code(-2.5, -4.32); code(-0.85, -4.62); code(-1.2, -3.72); code(1.4, -4.02);
      // B window wall (east, x = 3.12 + height)
      dimV(-1.7, 1.7, 5.94, '3 400'); code(4.42, -1.0); code(4.72, 2.0);
      // C door wall (south, z = 2.52 + height)
      dimH(1.4, 2.3, 5.18, '900'); dimV(2.52, 4.92, 2.66, '2 400'); dimH(-3.12, 3.12, 5.75, '6 240');
      code(1.85, 3.72); code(-1.0, 3.92);
      // D media wall (west, x = -3.12 - height)
      code(-4.72, -0.5); code(-3.57, 0.6);
      // E ceiling with cove (beyond the display wall)
      g.setLineDash([0.1 * S, 0.07 * S]); g.lineWidth = 1.6; g.strokeStyle = INK; g.strokeRect(X(-2.4), Y(-9.86), 4.8 * S, 3.84 * S); g.setLineDash([]);
      for (const [x, z] of [[-1.6, -7.02], [0, -7.02], [1.6, -7.02], [-1.6, -8.82], [0, -8.82], [1.6, -8.82]]) { g.beginPath(); g.arc(X(x), Y(z), 0.06 * S, 0, 7); g.lineWidth = 1.8; g.stroke(); }
      code(2.5, -5.62);
      txt('COVE LIGHT  ·  2 720 AFF', 0, -10.3, 0.18);
      txt('P  PLAN  1:50', -2.85, -2.16, 0.2, 'left');
    } else {
      title('A', 'DISPLAY WALL', 3.5, -5.1);
      schedule(3.5, -4.55, [['WP-01', 'SMOKED OAK PANEL'], ['GL-02', 'GLASS CABINET'], ['ST-03', 'STONE NICHE'], ['BR-04', 'BRONZE FRAME']]);
      title('B', 'WINDOW WALL', 3.4, 2.9);
      schedule(6.3, -1.2, [['AL-05', 'ALUMINIUM FRAME'], ['LN-06', 'SHEER']]);
      title('C', 'DOOR WALL', -1.4, 6.3);
      schedule(3.5, 3.7, [['DR-07', 'SMOKED OAK DOOR'], ['LQ-08', 'WHITE LACQUER']]);
      title('D', 'MEDIA WALL', -8.3, 2.9);
      schedule(-6.4, -1.6, [['LQ-08', 'WHITE LACQUER'], ['WP-01', 'SMOKED OAK']], true);
      title('E', 'CEILING', 3.5, -10.0);
      schedule(3.5, -9.45, [['CL-09', 'COVE LIGHT']]);
      // title block, scale bar, north point
      ln(-8.3, 5.2, -4.2, 5.2, 2.6);
      font(0.24, 600); g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = INK; g.fillText('CIRMANO  ·  LIVING ROOM', X(-8.3), Y(5.52));
      font(0.16, 500); g.fillText('SHEET L-01  ·  DEVELOPED ELEVATIONS  ·  1:50', X(-8.3), Y(5.88));
      font(0.14, 500); g.fillStyle = ACCENT; g.fillText('DESIGN DRAWING', X(-8.3), Y(6.62));
      g.fillStyle = INK;
      for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? 'rgba(0,0,0,0)' : INK; g.fillRect(X(-8.3 + i * 0.5), Y(6.12), 0.5 * S, 0.07 * S); g.lineWidth = 1.4; g.strokeRect(X(-8.3 + i * 0.5), Y(6.12), 0.5 * S, 0.07 * S); }
      g.fillStyle = INK; font(0.13); g.fillText('0', X(-8.32), Y(6.38)); g.fillText('2 M', X(-6.45), Y(6.38));
      g.beginPath(); g.arc(X(-4.0), Y(4.0), 0.32 * S, 0, 7); g.lineWidth = 2; g.stroke();
      g.beginPath(); g.moveTo(X(-4.0), Y(3.6)); g.lineTo(X(-4.13), Y(4.1)); g.lineTo(X(-3.87), Y(4.1)); g.closePath(); g.fill();
      txt('N', -4.0, 4.55, 0.16);
    }
  });
}

// ---- procedural textures: smoked oak veneer, Nero-style stone, light marble floor, plaster, leather
function buildTextures() {
  const r = rng(17);
  const woodVeneer = (baseRgb, streakRgb, rows = 8) => {
    const s = 512, cb = document.createElement('canvas'); cb.width = cb.height = s;
    const gb = cb.getContext('2d');
    const map = canvasTex(s, s, (g) => {
      const h = s / rows;
      gb.fillStyle = '#808080'; gb.fillRect(0, 0, s, s);
      for (let row = 0; row < rows; row++) {
        const v = (r() - 0.5) * 10;
        const c = baseRgb.map(ch => Math.round(clamp(ch + v, 0, 255)));
        g.fillStyle = `rgb(${c})`; g.fillRect(0, row * h, s, h);
        const bv = Math.round(120 + (r() - 0.5) * 28);
        gb.fillStyle = `rgb(${bv},${bv},${bv})`; gb.fillRect(0, row * h, s, h);
        for (let k = 0; k < 46; k++) {
          const yy = row * h + r() * h, gh = 0.7 + r() * 1.6;
          g.fillStyle = `rgba(${streakRgb},${0.08 + r() * 0.12})`; g.fillRect(0, yy, s, gh);
          gb.fillStyle = 'rgba(30,30,30,0.28)'; gb.fillRect(0, yy, s, gh);
        }
      }
    }, { repeat: true });
    const bump = new THREE.CanvasTexture(cb);
    bump.wrapS = bump.wrapT = THREE.RepeatWrapping; bump.anisotropy = 8;
    return { map, bump };
  };

  const plaster = canvasTex(512, 512, (g, s) => {
    g.fillStyle = '#fcfaf6'; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 65; i++) {
      const x = r() * s, y = r() * s, rad = 28 + r() * 76;
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, i % 2 ? 'rgba(255,253,248,0.03)' : 'rgba(185,172,152,0.024)');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
  }, { repeat: true });
  const plasterBump = canvasTex(256, 256, (g, s) => {
    g.fillStyle = '#808080'; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 45; i++) {
      const x = r() * s, y = r() * s, rad = 18 + r() * 52;
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, i % 2 ? 'rgba(210,210,210,0.09)' : 'rgba(50,50,50,0.09)');
      gr.addColorStop(1, 'rgba(128,128,128,0)');
      g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
  }, { repeat: true });
  const leatherBump = canvasTex(128, 128, (g, s) => {
    g.fillStyle = '#808080'; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 900; i++) { g.fillStyle = r() > 0.5 ? 'rgba(200,200,200,0.18)' : 'rgba(40,40,40,0.18)'; g.fillRect(r() * s, r() * s, 1.5, 1.5); }
  }, { repeat: true });

  // veined stone: dark ground, light veins (the niche in P179)
  const veins = (base, vein, alpha, n, seed) => canvasTex(1024, 1024, (g, s) => {
    const q = rng(seed);
    g.fillStyle = base; g.fillRect(0, 0, s, s);
    for (let i = 0; i < n; i++) {
      // long diagonal veins with a few short branches, thinner towards the ends
      let x = q() * s - s * 0.2, y = q() * s, ang = -0.6 + (q() - 0.5) * 0.8;
      const wid = 0.4 + q() * 1.8, a0 = alpha * (0.35 + q() * 0.65);
      for (let k = 0; k < 9; k++) {
        const len = 60 + q() * 110; ang += (q() - 0.5) * 0.7;
        const nx = x + Math.cos(ang) * len, ny = y + Math.sin(ang) * len;
        g.strokeStyle = `rgba(${vein},${a0 * (1 - k / 12)})`; g.lineWidth = wid * (1 - k / 14);
        g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo((x + nx) / 2 + (q() - 0.5) * 30, (y + ny) / 2 + (q() - 0.5) * 30, nx, ny); g.stroke();
        if (q() < 0.25) { g.lineWidth = wid * 0.4; g.beginPath(); g.moveTo(nx, ny); g.lineTo(nx + (q() - 0.5) * 90, ny + (q() - 0.2) * 90); g.stroke(); }
        x = nx; y = ny;
      }
    }
  }, { repeat: true });
  const nero = veins('#191818', '232,228,222', 0.8, 34, 5);

  // light marble floor in 800 mm tiles
  const marble = (() => {
    const S = 220, W = Math.round(6 * S), Hh = Math.round(4.8 * S);
    const map = canvasTex(W, Hh, (g, w, h) => {
      const q = rng(9);
      g.fillStyle = '#e8e3da'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 90; i++) {
        g.strokeStyle = `rgba(150,140,128,${0.05 + q() * 0.12})`; g.lineWidth = 0.6 + q() * 2;
        g.beginPath(); let x = q() * w, y = q() * h; g.moveTo(x, y);
        for (let k = 0; k < 6; k++) { const nx = x + (q() - 0.2) * 260, ny = y + (q() - 0.5) * 120; g.quadraticCurveTo(x + (q() - 0.5) * 90, y + (q() - 0.5) * 90, nx, ny); x = nx; y = ny; }
        g.stroke();
      }
      g.strokeStyle = 'rgba(120,110,98,0.35)'; g.lineWidth = 1.2;
      for (let x = 0; x <= w; x += 0.8 * S) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
      for (let y = 0; y <= h; y += 0.8 * S) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    });
    return { map };
  })();

  return {
    plaster, plasterBump, leatherBump, nero, marble,
    smoked: woodVeneer([64, 52, 44], '18,12,8', 8),
  };
}
