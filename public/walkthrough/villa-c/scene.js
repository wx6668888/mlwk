import * as THREE from 'three';
import { initCore, setTime, setQuality, adaptExposure, renderFrame, core, TIMES } from './js/core.js';
import { buildMaterials, M, progress } from './js/mats.js';
import { loadGeometry } from './js/data.js';
import { buildArchitecture } from './js/arch.js';
import { buildFacade } from './js/facade.js';
import { buildOutdoor } from './js/outdoor.js';
import { buildInterior } from './js/interior.js';
import { loadModels } from './js/models.js';
import { initNav, nav, setFloor, setMode, place, startTour, stopTour, updateNav, lookAt, floorAt } from './js/nav.js';
import { initLightPool, updateLightPool } from './js/lightpool.js';
import { applyStyle } from './js/styles.js';
import { buildDecor } from './js/decor.js';
import { t, initI18n } from './js/i18n.js';

const $ = (id) => document.getElementById(id);
const status = $('status');
const canvas = $('scene');
const say = (t) => { const l = $('loading'); if (l) l.querySelector('span:last-child').textContent = t; };

let A, F, G, decor, ready = false;
let getRoomKind;
const clock = new THREE.Clock();

async function boot() {
  initI18n();
  getRoomKind = (await import('./js/data.js')).roomKind;
  say(t('loading.renderer'));
  await initCore(canvas);
  say(t('loading.materials'));
  progress.onChange = (p) => say(`${t('loading.materials')} ${p.done}/${p.total}`);
  await buildMaterials(core.renderer);
  say(t('loading.sky'));
  const t0 = new URLSearchParams(location.search).get('time') || 'afternoon';
  await setTime(t0);
  say(t('loading.architecture'));
  G = await loadGeometry();
  const models = await loadModels(core.renderer);
  A = buildArchitecture(G, M);
  buildFacade(A, G, M, models);
  F = buildInterior(A, G, M, models);
  const out = buildOutdoor(A, G, M, models);
  decor = buildDecor(A, G, M, models);

  const root = new THREE.Group(); root.name = 'Villa C Murcia';
  core.scene.add(root);
  const levelGroups = A.layers.map((L, i) => [L.group, F.layers[i].group, decor.layers[i].group]);
  A.layers.forEach((L) => L.build());
  F.layers.forEach((L) => L.build());
  A.roofLayer.build();
  out.layer.build();
  for (const L of A.layers) root.add(L.group);
  for (const L of F.layers) root.add(L.group);
  for (const L of decor.layers) root.add(L.group);
  root.add(A.roofLayer.group, out.layer.group);
  if (out.extra) root.add(out.extra);
  F.furnGroups = F.layers.map((L) => L.group);

  await setTime(t0);
  initNav(A, levelGroups, [A.roofLayer.group]);
  initLightPool(A);
  core.windows = A.windows;
  wireUI();
  await setStyle(new URLSearchParams(location.search).get('style') || 'gulf');
  setFurnished(new URLSearchParams(location.search).get('furnished') !== '0');
  gotoView('street');
  addEventListener('resize', () => {});
  const q0 = new URLSearchParams(location.search).get('q');
  if (q0) setQuality(q0);
  say(t('loading.shaders'));
  await core.renderer.compileAsync(core.scene, core.camera);
  $('loading').hidden = true;
  ready = true;
  status.dataset.ready = 'true';
  window.__villa = { core, nav, A, G, F, M, THREE, gotoView, place, setTime, setQuality, setFloor, lookAt, floorAt, setStyle, setFurnished, decor };
  loop();
}

async function setStyle(v) {
  nav.style = v;
  decor.setStyle(v);
  document.querySelectorAll('[data-style]').forEach((b) => {
    const on = b.dataset.style === v; b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on));
  });
  await applyStyle(v, core);
}

function setFurnished(on) {
  nav.furnished = on;
  F.furnGroups.forEach((g) => (g.userData.furn = true));
  setFloor(nav.selected ?? 'all');
  decor.setFurnished(on);
  const b = $('furnishToggle'); if (b) b.setAttribute('aria-pressed', String(on));
}

/* ---------------- camera views (world coordinates, viewer looks along +z from the road) ---------------- */
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const VIEWS = {
  street:   () => ({ pos: V(7.4, 1.9, -13.8), target: V(5.0, 3.4, 2.0), walk: false, fov: 46 }),
  entrance: () => ({ pos: V(4.98, 1.7, -1.5), target: V(4.98, 1.45, 6.0), walk: true, fov: 64 }),
  majlis:   () => ({ pos: V(3.95, 1.65, 4.25), target: V(0.6, 1.1, 7.6), walk: true, fov: 68 }),
  living:   () => ({ pos: V(3.9, 1.65, 9.75), target: V(0.4, 1.15, 13.4), walk: true, fov: 68 }),
  courtyard: () => ({ pos: V(4.95, 1.7, 15.9), target: V(7.6, 1.7, 10.8), walk: true, fov: 66 }),
  stairs:   () => ({ pos: V(3.6, 1.65, 15.2), target: V(1.2, 2.2, 17.0), walk: true, fov: 68 }),
  first:    () => ({ pos: V(3.9, 3.45 + 1.65, 11.6), target: V(0.8, 3.45 + 1.1, 14.0), walk: true, fov: 68 }),
  second:   () => ({ pos: V(3.6, 6.75 + 1.65, 20.0), target: V(2.0, 6.75 + 1.1, 22.8), walk: true, fov: 68 }),
  aerial:   () => ({ pos: V(-23, 30, -17), target: V(5, 2.5, 11), walk: false, fov: 42 }),
};
export function gotoView(name) {
  if (!A) return;
  const v = VIEWS[name]?.(); if (!v) return;
  setFloor(name === 'aerial' ? '0' : 'all');
  place(v.pos, v.target, v.walk, v.fov);
  document.querySelectorAll('[data-view]').forEach((b) => {
    const on = b.dataset.view === name; b.classList.toggle('active', on); b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', String(on));
  });
  status.dataset.view = name;
}

/* ---------------- UI ---------------- */
function wireUI() {
  document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => gotoView(b.dataset.view)));
  document.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => {
    stopTour();
    if (b.dataset.mode === 'free') {
      setFloor('all'); setMode(true, true);
    } else if (b.dataset.mode === 'walk') {
      if (nav.free || core.camera.position.y > 9) gotoView('entrance'); else { setMode(true); lookAt(nav.orbit.target); core.camera.position.y = floorAt(core.camera.position.x, core.camera.position.z, 0.15) + nav.eye; }
    } else { setMode(false); nav.orbit.target.set(5, 3.3, 10); nav.orbit.update(); }
  }));
  document.querySelectorAll('[data-style]').forEach((b) => b.addEventListener('click', () => setStyle(b.dataset.style)));
  $('furnishToggle')?.addEventListener('click', () => setFurnished(!nav.furnished));
  document.querySelectorAll('[data-floor]').forEach((b) => b.addEventListener('click', () => {
    stopTour(); setMode(false);
    setFloor(b.dataset.floor);
    const lv = b.dataset.floor === 'all' ? 0 : Number(b.dataset.floor);
    core.camera.position.set(-22, 26 + lv * 3.3, -9); nav.orbit.target.set(5, lv * 3.3, 11); nav.orbit.update();
    document.querySelectorAll('[data-floor]').forEach((x) => { const on = x === b; x.classList.toggle('active', on); x.classList.toggle('is-active', on); x.setAttribute('aria-pressed', String(on)); });
  }));
  document.querySelectorAll('[data-time]').forEach((b) => b.addEventListener('click', async () => {
    await setTime(b.dataset.time);
    document.querySelectorAll('[data-time]').forEach((x) => { const on = x === b; x.classList.toggle('active', on); x.setAttribute('aria-pressed', String(on)); });
  }));
  document.querySelectorAll('[data-quality]').forEach((b) => b.addEventListener('click', () => {
    setQuality(b.dataset.quality);
    document.querySelectorAll('[data-quality]').forEach((x) => { const on = x === b; x.classList.toggle('active', on); x.setAttribute('aria-pressed', String(on)); });
  }));
  $('resetView')?.addEventListener('click', () => gotoView('street'));
  $('startWalk')?.addEventListener('click', () => startWalk());
  $('autoTour')?.addEventListener('click', toggleTour);
  $('exportModel')?.addEventListener('click', () => exportModel());
  $('wholeHouse')?.addEventListener('click', () => showWholeHouse());

  canvas.tabIndex = 0;
  addEventListener('keydown', (e) => {
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'Space', 'KeyE', 'KeyQ', 'KeyC'].includes(e.code) && nav.walk) {
      e.preventDefault(); if (nav.tour) stopTour(); nav.keys.add(e.code);
    }
  });
  addEventListener('keyup', (e) => nav.keys.delete(e.code));
  addEventListener('blur', () => nav.keys.clear());
  let dragging = false, px = 0, py = 0;
  canvas.addEventListener('pointerdown', (e) => { if (nav.walk) { dragging = true; px = e.clientX; py = e.clientY; canvas.setPointerCapture(e.pointerId); canvas.focus(); } });
  canvas.addEventListener('pointerup', () => (dragging = false));
  canvas.addEventListener('pointercancel', () => (dragging = false));
  addEventListener('pointermove', (e) => {
    if (!nav.walk) return;
    const locked = document.pointerLockElement === canvas;
    if (locked || dragging) {
      const dx = locked ? e.movementX : e.clientX - px, dy = locked ? e.movementY : e.clientY - py;
      nav.yaw -= dx * 0.003; nav.pitch = THREE.MathUtils.clamp(nav.pitch - dy * 0.003, -1.3, 1.3);
      core.camera.rotation.set(nav.pitch, nav.yaw, 0, 'YXZ'); px = e.clientX; py = e.clientY;
    }
  });
  for (const [id, key] of [['touchUp', 'KeyW'], ['touchDown', 'KeyS'], ['touchLeft', 'KeyA'], ['touchRight', 'KeyD']]) {
    const b = $(id); if (!b) continue;
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); nav.keys.add(key); b.setPointerCapture(e.pointerId); });
    for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) b.addEventListener(ev, () => nav.keys.delete(key));
  }
  const lp = $('lookpad');
  if (lp) {
    let active = false, lx = 0, ly = 0;
    lp.addEventListener('pointerdown', (e) => { active = true; lx = e.clientX; ly = e.clientY; lp.setPointerCapture(e.pointerId); });
    lp.addEventListener('pointermove', (e) => {
      if (!active || !nav.walk) return;
      nav.yaw -= (e.clientX - lx) * 0.004; nav.pitch = THREE.MathUtils.clamp(nav.pitch - (e.clientY - ly) * 0.004, -1.3, 1.3);
      core.camera.rotation.set(nav.pitch, nav.yaw, 0, 'YXZ'); lx = e.clientX; ly = e.clientY;
    });
    for (const ev of ['pointerup', 'pointercancel']) lp.addEventListener(ev, () => (active = false));
  }
  nav.onChange = (what) => { if (what === 'tour') $('autoTour') && ($('autoTour').textContent = t(nav.tour ? 'tour.stop' : 'tour.start')); };
}

function startWalk(lock = true) {
  stopTour(); setFloor('all'); setMode(true);
  core.camera.position.set(5.28, nav.eye + 0.0, -7); lookAt(V(5.28, nav.eye, 5));
  canvas.focus();
  if (lock && !matchMedia('(pointer:coarse)').matches) canvas.requestPointerLock?.().catch?.(() => {});
}
function toggleTour() {
  if (nav.tour) { stopTour(); return; }
  startWalk(false);
  const m = (x) => 10 - x;
  const pts = [
    [4.97, -1, .15], [4.97, 2.5, .15], [4.97, 4.65, .15], [6.32, 4.65, .15], [6.32, 9.8, .15], [9.5, 9.8, .15], [9.5, 14.46, .15], [6.25, 14.46, .15], [6.25, 13.6, .15],
    [4.8, 13.6, .15], [4.8, 15.55, .15], [6.32, 15.55, .15], [6.32, 15.10, .15], [7.67, 15.10, .15], [7.67, 17.32, 1.80], [9.20, 17.32, 1.80], [9.20, 15.14, 3.45],
    [6.25, 15.14, 3.45], [6.25, 10.7, 3.45], [6.25, 15.14, 3.45], [7.67, 15.14, 3.45], [7.67, 17.32, 5.10], [9.20, 17.32, 5.10], [9.20, 15.14, 6.75], [6.25, 15.14, 6.75], [6.25, 12.1, 6.75], [6.25, 10.1, 6.75],
  ].map(([x, z, y]) => ({ x: m(x), z, y }));
  startTour(pts);
}

async function exportModel() { status.textContent = t('export.unavailable'); }

/* ---------------- minimap ---------------- */
function minimap() {
  const c = $('minimap'); if (!c || !G) return; const ctx = c.getContext('2d');
  const w = c.width, h = c.height, s = Math.min((w - 36) / 12, (h - 36) / 29), ox = (w - 10 * s) / 2, oz = 22;
  ctx.clearRect(0, 0, w, h); ctx.fillStyle = '#f3efe5'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#dad7cf'; ctx.fillRect(0, oz - 5 * s, w, 3 * s);
  ctx.fillStyle = '#e0dbcd'; ctx.fillRect(ox, oz, 10 * s, 23 * s);
  const i = Math.max(0, A.levels.findLastIndex((l) => core.camera.position.y - nav.eye >= l.floorY - 0.2));
  const lvl = A.levels[i];
  const X = (x) => ox + (10 - x) * s, Z = (z) => oz + z * s;
  const ct = G.courtyard.bounds; ctx.fillStyle = '#a9b590'; ctx.fillRect(X(ct.x + ct.width), Z(ct.z), ct.width * s, ct.depth * s);
  ctx.strokeStyle = '#6c716c'; ctx.lineWidth = 1.6;
  for (const wl of lvl.walls) {
    const len = Math.hypot(wl.x2 - wl.x1, wl.z2 - wl.z1), ux = (wl.x2 - wl.x1) / len, uz = (wl.z2 - wl.z1) / len;
    const segs = []; let st = 0;
    for (const o of [...(wl.openings || [])].sort((a, b) => a.offset - b.offset)) { segs.push([st, o.offset]); st = o.offset + o.width; }
    segs.push([st, len]);
    for (const [a, b] of segs) { ctx.beginPath(); ctx.moveTo(X(wl.x1 + ux * a), Z(wl.z1 + uz * a)); ctx.lineTo(X(wl.x1 + ux * b), Z(wl.z1 + uz * b)); ctx.stroke(); }
  }
  const st = G.stair.bounds; ctx.fillStyle = '#d2b35d'; ctx.fillRect(X(st.x + st.width), Z(st.z), st.width * s, st.depth * s);
  const px = X(core.camera.position.x), pz = Z(core.camera.position.z);
  ctx.fillStyle = '#242e2f'; ctx.beginPath(); ctx.arc(px, pz, 4, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#a98829'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px, pz);
  ctx.lineTo(px - Math.sin(nav.yaw) * 12 * -1 * -1 * -1, pz - Math.cos(nav.yaw) * 12); ctx.stroke();
  ctx.fillStyle = '#545c58'; ctx.font = '11px Arial'; ctx.fillText([t('map.ground'), t('map.first'), t('map.second')][i], 12, h - 10);
}


/* ---------------- 3D mini view: oblique perspective wireframe of the whole house with the viewer marked ---------------- */
let iso = null;
function buildIso() {
  const segs = [];
  A.levels.forEach((lvl, li) => {
    for (const wl of lvl.walls) {
      if (wl.type === 'glass_guard') continue;
      const y0 = wl.floorY;
      segs.push({ li, a: [10 - wl.x1, y0, wl.z1], b: [10 - wl.x2, y0, wl.z2], h: Math.min(wl.height, 3.2), ext: wl.type !== 'internal' });
    }
  });
  return { segs };
}
function proj(p, cam, w, h) {
  const dx = p[0] - cam.x, dy = p[1] - cam.y, dz = p[2] - cam.z;
  const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw), cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
  const x1 = dx * cy - dz * sy, z1 = dx * sy + dz * cy;
  const y2 = dy * cp + z1 * sp, z2 = -dy * sp + z1 * cp;
  if (z2 < 0.5) return null;
  const f = 1.7 * h / 2;
  return [w / 2 + (x1 / z2) * f, h / 2 - (y2 / z2) * f];
}
function miniView() {
  const c = $('miniview'); if (!c || !A) return; const ctx = c.getContext('2d');
  const w = c.width, h = c.height;
  iso ??= buildIso();
  const sel = nav.selected === 'all' ? 99 : Number(nav.selected);
  const cam = { x: -9, y: 17, z: -17, pitch: 0, yaw: 0 };
  cam.yaw = Math.atan2(5 - cam.x, 11.5 - cam.z); cam.pitch = Math.atan2(cam.y - 4.0, Math.hypot(5 - cam.x, 11.5 - cam.z));
  ctx.clearRect(0, 0, w, h); ctx.fillStyle = '#f3efe5'; ctx.fillRect(0, 0, w, h);
  const P = (p) => proj(p, cam, w, h);
  const line = (a, b, col, lw) => { const pa = P(a), pb = P(b); if (!pa || !pb) return; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.stroke(); };
  const g0 = [[0, 0, 0], [10, 0, 0], [10, 0, 23], [0, 0, 23]];
  for (let i = 0; i < 4; i++) line(g0[i], g0[(i + 1) % 4], '#b9b5a8', 1);
  const camLevel = Math.max(0, A.levels.findLastIndex((l) => core.camera.position.y - nav.eye >= l.floorY - 0.2));
  A.levels.forEach((lvl, li) => {
    if (li > sel) return;
    const y = lvl.floorY, col = li === camLevel ? 'rgba(169,136,41,.55)' : 'rgba(120,125,118,.25)';
    for (const r of lvl.rooms) {
      if (r.kind === 'roof') continue;
      const x0 = 10 - (r.x + r.width), x1 = 10 - r.x;
      const pts = [[x0, y, r.z], [x1, y, r.z], [x1, y, r.z + r.depth], [x0, y, r.z + r.depth]];
      for (let i = 0; i < 4; i++) line(pts[i], pts[(i + 1) % 4], col, 0.7);
    }
  });
  for (const sg of iso.segs) {
    if (sg.li > sel) continue;
    const here = sg.li === camLevel;
    const col = sg.ext ? (here ? '#3f4a47' : '#7d857f') : (here ? '#6c716c' : '#b3b6ae');
    const ta = [sg.a[0], sg.a[1] + sg.h, sg.a[2]], tb = [sg.b[0], sg.b[1] + sg.h, sg.b[2]];
    line(sg.a, sg.b, col, 0.8); line(ta, tb, col, sg.ext ? 1.3 : 0.8);
    if (sg.ext) { line(sg.a, ta, col, 0.7); line(sg.b, tb, col, 0.7); }
  }
  const cp = core.camera.position, feetY = Math.max(0, cp.y - nav.eye);
  const me = [cp.x, feetY, cp.z];
  line([cp.x, 0, cp.z], me, 'rgba(192,57,43,.6)', 1);
  const pm = P([me[0], me[1] + 1.2, me[2]]);
  if (pm) {
    const pf = P([me[0] - Math.sin(nav.yaw) * 2.2, me[1] + 1.2, me[2] - Math.cos(nav.yaw) * 2.2]);
    if (pf) { ctx.strokeStyle = '#a98829'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(pm[0], pm[1]); ctx.lineTo(pf[0], pf[1]); ctx.stroke(); }
    ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.arc(pm[0], pm[1], 5.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
  }
  ctx.fillStyle = '#545c58'; ctx.font = '11px Arial'; ctx.fillText([t('map.ground'), t('map.first'), t('map.second')][camLevel], 10, h - 8);
}

/* ---------------- whole-house 3D overview ---------------- */
function showWholeHouse() {
  stopTour(); setMode(false); setFloor('all');
  core.camera.position.set(-6, 20, -12); nav.orbit.target.set(4.5, 3.0, 11.5);
  core.camera.fov = 44; core.camera.updateProjectionMatrix(); nav.orbit.update();
  document.querySelectorAll('[data-view]').forEach((b) => { const on = b.dataset.view === 'aerial'; b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on)); });
  document.querySelectorAll('[data-floor]').forEach((x) => { const on = x.dataset.floor === 'all'; x.classList.toggle('active', on); x.setAttribute('aria-pressed', String(on)); });
}

let acc = 0, frames = 0;
function loop() {
  const dt = Math.min(clock.getDelta(), 0.1), elapsed = clock.elapsedTime;
  updateNav(dt);
  adaptExposure(dt);
  updateLightPool(dt);
  renderFrame(dt, elapsed);
  frames++; acc += dt;
  if (acc > 0.2) {
    acc = 0; minimap(); miniView();
    const room = nav.room;
    const kind = room ? getRoomKind(room) : null;
    const roomKey = kind ? `room.${kind}` : null;
    const translatedRoom = roomKey ? t(roomKey) : '';
    const roomLabel = translatedRoom && translatedRoom !== roomKey ? translatedRoom : room?.label;
    status.textContent = nav.walk ? `${roomLabel || t('status.outdoor')} · ${[t('level.ground'), t('level.first'), t('level.second')][nav.level] || t('level.ground')}` : t('status.exterior');
    const p = core.camera.position;
    const cs = document.getElementById('coords');
    if (cs) for (const k of ['x', 'y', 'z']) cs.querySelector(`[data-k=${k}]`).textContent = `${k.toUpperCase()} ${p[k].toFixed(1)}`;
    Object.assign(status.dataset, { x: p.x.toFixed(2), y: p.y.toFixed(2), z: p.z.toFixed(2), mode: nav.walk ? 'walk' : 'orbit', tour: nav.tour ? 'running' : 'idle', tourResult: nav.tourResult || '', drawCalls: String(core.renderer.info.render.calls), tris: String(core.renderer.info.render.triangles) });
  }
  requestAnimationFrame(loop);
}

boot().catch((e) => { console.error(e); const l = $('loading'); if (l) { l.hidden = false; l.querySelector('span:last-child').textContent = t('loading.failed', { message: e.message }); } status.dataset.ready = 'error'; });
