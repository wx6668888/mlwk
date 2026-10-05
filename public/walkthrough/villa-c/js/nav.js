import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { core } from './core.js';

export const nav = {
  walk: false, yaw: Math.PI, pitch: 0, eye: 1.65, selected: 'all', tour: null,
  keys: new Set(), A: null, groups: [], roofGroups: [], onChange: null,
};
let orbit;

export function initNav(A, levelGroups, roofGroups) {
  nav.A = A; nav.groups = levelGroups; nav.roofGroups = roofGroups;
  const { camera, canvas } = core;
  orbit = new OrbitControls(camera, canvas);
  orbit.enableDamping = true; orbit.dampingFactor = 0.07;
  orbit.minDistance = 1.5; orbit.maxDistance = 90; orbit.maxPolarAngle = Math.PI * 0.495;
  nav.orbit = orbit;
}

const visibleLevel = (lv) => lv < 0 || nav.selected === 'all' || lv <= Number(nav.selected);

export function blocked(x, z, feet) {
  const r = 0.12;
  for (const c of nav.A.colliders) {
    if (!visibleLevel(c.level)) continue;
    if (c.furn && !nav.furnished) continue;
    if (c.y1 < feet + 0.12 || c.y0 > feet + 1.5) continue;
    if (x > c.x0 - r && x < c.x1 + r && z > c.z0 - r && z < c.z1 + r) return true;
  }
  return false;
}

function rawFloor(x, z, feet) {
  let best = -Infinity;
  for (const b of nav.A.walk) {
    if (!visibleLevel(b.level)) continue;
    if (x < b.x0 - 0.02 || x > b.x1 + 0.02 || z < b.z0 - 0.02 || z > b.z1 + 0.02) continue;
    if (b.top > feet + 0.47) continue;
    if (b.top > best) best = b.top;
  }
  return best;
}
const RING = [[0.22, 0], [-0.22, 0], [0, 0.22], [0, -0.22]];
export function floorAt(x, z, feet) {
  const f = rawFloor(x, z, feet);
  if (f === -Infinity || f < feet - 0.5) {
    // a thin seam between rooms must not drop the walker a storey: hold height while support exists within a footstep
    for (const [dx, dz] of RING) if (rawFloor(x + dx, z + dz, feet) >= feet - 0.2) return feet;
  }
  return f === -Infinity ? feet : f;
}

export function setFloor(sel) {
  nav.selected = sel;
  const n = sel === 'all' ? 99 : Number(sel);
  nav.groups.forEach((gs, i) => gs.forEach((g) => (g.visible = i <= n && (!g.userData.furn || nav.furnished !== false))));
  nav.roofGroups.forEach((g) => (g.visible = sel === 'all'));
  nav.onChange?.('floor');
}

export function lookAt(target) {
  const { camera } = core;
  const dx = target.x - camera.position.x, dz = target.z - camera.position.z;
  nav.yaw = Math.atan2(-dx, -dz);
  nav.pitch = Math.atan2(target.y - camera.position.y, Math.hypot(dx, dz));
  camera.rotation.set(nav.pitch, nav.yaw, 0, 'YXZ');
}

export function setMode(isWalk, free = false) {
  const wasWalk = nav.walk;
  nav.walk = isWalk; nav.free = isWalk && free; orbit.enabled = !isWalk;
  document.body.classList.toggle('walking', isWalk);
  document.querySelectorAll('[data-mode]').forEach((b) => {
    const on = b.dataset.mode === (isWalk ? (nav.free ? 'free' : 'walk') : 'orbit');
    b.classList.toggle('active', on); b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', String(on));
  });
  if (!isWalk && document.pointerLockElement) document.exitPointerLock();
  if (isWalk && !wasWalk) { setFloor('all'); lookAt(orbit.target); }
}

export function place(pos, target, walk, fov) {
  const { camera } = core;
  if (nav.tour) stopTour();
  nav.keys.clear();
  if (nav.selected !== 'all' && walk) setFloor('all');
  camera.position.copy(pos);
  orbit.target.copy(target);
  if (fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
  setMode(walk);
  if (walk) lookAt(target); else orbit.update();
}

export function stopTour() { nav.tour = null; nav.keys.clear(); nav.onChange?.('tour'); }

export function startTour(points) {
  nav.tour = { points, index: 0, stuck: 0, last: core.camera.position.clone() };
  nav.onChange?.('tour');
}

function advanceTour(dt) {
  const { camera } = core, tour = nav.tour;
  const next = tour.points[tour.index];
  if (!next) { nav.tourResult = 'completed'; stopTour(); return; }
  const dx = next.x - camera.position.x, dz = next.z - camera.position.z, dist = Math.hypot(dx, dz);
  if (dist < 0.09) { tour.index++; tour.stuck = 0; return; }
  const ang = Math.atan2(-dx, -dz);
  nav.yaw += THREE.MathUtils.euclideanModulo(ang - nav.yaw + Math.PI, Math.PI * 2) - Math.PI;
  const feetNow = camera.position.y - nav.eye;
  nav.pitch = THREE.MathUtils.lerp(nav.pitch, Math.abs(next.y - feetNow) > 0.3 ? 0.09 : 0, dt * 3);
  camera.rotation.set(nav.pitch, nav.yaw, 0, 'YXZ');
  const step = Math.min(dist, dt * 1.7), feet = feetNow;
  const nx = camera.position.x + dx / dist * step, nz = camera.position.z + dz / dist * step;
  if (!blocked(nx, camera.position.z, feet)) camera.position.x = nx;
  if (!blocked(camera.position.x, nz, feet)) camera.position.z = nz;
  camera.position.y = THREE.MathUtils.lerp(camera.position.y, floorAt(camera.position.x, camera.position.z, feet) + nav.eye, Math.min(1, dt * 18));
  const moved = camera.position.distanceTo(tour.last);
  tour.stuck = moved < 0.001 ? tour.stuck + dt : 0; tour.last.copy(camera.position);
  if (tour.stuck > 2.5) { nav.tourResult = 'blocked at ' + tour.index; stopTour(); }
}

function moveFree(dt) {
  const { camera } = core, k = nav.keys;
  const f = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0);
  const s = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0);
  const u = (k.has('Space') || k.has('KeyE') ? 1 : 0) - (k.has('KeyC') || k.has('KeyQ') ? 1 : 0);
  if (!f && !s && !u) return;
  const sp = (k.has('ShiftLeft') ? 14 : 4) * dt, cp = Math.cos(nav.pitch);
  camera.position.x += (-Math.sin(nav.yaw) * cp * f + Math.cos(nav.yaw) * s) * sp;
  camera.position.z += (-Math.cos(nav.yaw) * cp * f - Math.sin(nav.yaw) * s) * sp;
  camera.position.y += (Math.sin(nav.pitch) * f + u) * sp;
}

function moveWalk(dt) {
  if (nav.free) { moveFree(dt); return; }
  const { camera } = core, k = nav.keys;
  const f = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0);
  const s = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0);
  if (!f && !s) { settle(dt); return; }
  const sp = (k.has('ShiftLeft') ? 3.6 : 2.0) * dt / Math.max(1, Math.hypot(f, s));
  const dx = (-Math.sin(nav.yaw) * f + Math.cos(nav.yaw) * s) * sp;
  const dz = (-Math.cos(nav.yaw) * f - Math.sin(nav.yaw) * s) * sp;
  const feet = camera.position.y - nav.eye;
  const nx = camera.position.x + dx, nz = camera.position.z + dz;
  if (!blocked(nx, camera.position.z, feet)) camera.position.x = nx;
  if (!blocked(camera.position.x, nz, feet)) camera.position.z = nz;
  settle(dt);
}
function settle(dt) {
  const { camera } = core;
  const feet = camera.position.y - nav.eye;
  const target = floorAt(camera.position.x, camera.position.z, feet);
  camera.position.y = THREE.MathUtils.lerp(camera.position.y, target + nav.eye, Math.min(1, dt * 14));
}

/** per-frame: movement, doors, indoor estimate */
export function updateNav(dt) {
  const { camera } = core;
  if (nav.tour) {
    let rem = dt; while (nav.tour && rem > 1e-4) { const s = Math.min(0.04, rem); advanceTour(s); rem -= s; }
  } else if (nav.walk) moveWalk(Math.min(dt, 0.05));
  else orbit.update();

  const A = nav.A;
  for (const d of A.doors) {
    const dist = Math.hypot(camera.position.x - d.ox, camera.position.z - d.oz);
    const near = nav.walk && dist < (d.type === 'slide' ? 2.6 : 2.0) && Math.abs(camera.position.y - d.oy) < 2.4 && visibleLevel(d.level);
    d.open += ((near ? 1 : 0) - d.open) * Math.min(1, dt * (d.type === 'slide' ? 2.4 : 4));
    if (d.type === 'swing') d.swing.rotation.y = -d.sign * d.open * 1.5;
    else d.swing.position.x = d.open * d.dist;
  }
  // indoor estimate
  const feet = camera.position.y - nav.eye;
  let lv = 0; for (let i = 0; i < A.levels.length; i++) if (camera.position.y > A.levels[i].floorY + 0.2) lv = i;
  const room = A.roomAt(lv, camera.position.x, camera.position.z, -0.05);
  nav.room = room; nav.level = lv;
  const target = room && camera.position.y < A.levels[lv].floorY + 3.1 ? 1 : 0;
  core.indoor += (target - core.indoor) * Math.min(1, dt * 3);
}
