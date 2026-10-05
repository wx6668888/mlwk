import * as THREE from 'three';
import { core } from './core.js';
import { nav } from './nav.js';

const POOL = 8;
const WHITE = new THREE.Color(1, 1, 1);
const lights = [];
let A;

/** A few real point lights hop between the nearest ceiling lamps so interiors get warm local bounce without hundreds of lights. */
export function initLightPool(arch) {
  A = arch;
  for (let i = 0; i < POOL; i++) {
    const l = new THREE.PointLight(0xffe4c4, 0, 7.5, 1.6);
    l.castShadow = false;
    core.scene.add(l);
    lights.push({ l, target: 0, cur: 0, id: -1 });
  }
}

export function updateLightPool(dt) {
  if (!A) return;
  const cam = core.camera.position;
  const ind = core.indoor;
  const cand = [];
  if (ind > 0.02) {
    for (let i = 0; i < A.lights.length; i++) {
      const L = A.lights[i];
      if (Math.abs(L.y - cam.y) > 3.3) continue;
      const d = (L.x - cam.x) ** 2 + (L.z - cam.z) ** 2;
      if (d < 110) cand.push([d, i]);
    }
    cand.sort((a, b) => a[0] - b[0]);
  }
  const want = cand.slice(0, POOL).map((c) => c[1]);
  const assigned = new Set();
  // keep lights that are still wanted
  for (const p of lights) if (want.includes(p.id)) assigned.add(p.id);
  const free = lights.filter((p) => !want.includes(p.id));
  for (const id of want) {
    if (assigned.has(id)) continue;
    const p = free.shift(); if (!p) break;
    p.id = id; p.cur = 0;
    const L = A.lights[id];
    p.l.position.set(L.x, L.y, L.z);
    p.l.color.set(L.color ?? 0xffd6a0).multiply(core.lightTint ?? WHITE);
    p.power = L.power ?? 1;
    assigned.add(id);
  }
  const k = Math.min(1, dt * 5);
  for (const p of lights) {
    const on = p.id >= 0 && want.includes(p.id);
    const goal = on ? (p.power ?? 1) * 2.6 * ind : 0;
    p.cur += (goal - p.cur) * k;
    p.l.intensity = p.cur;
    if (!on && p.cur < 0.02) p.id = -1;
  }
}
