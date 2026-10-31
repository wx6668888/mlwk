// Mount / unmount wrapper around the room. Adapted from flat-to-3d / 01-exploded-house / main.js
// (c) 2026 Samnang Aing, MIT License — see ./LICENSE. The page chrome, radar and URL switches of the
// original are dropped: React owns the copy, this module owns the canvas and the labels layer.
import * as core from './core.js';
import { build } from './room.js';

const { DRAW, Labels, applyCam, camAt, clamp, win } = core;

export async function mount({ canvas, labels: labelRoot, leaders, onFrame }) {
  await document.fonts?.load?.('600 20px Manrope').catch(() => {});
  core.init(canvas);
  const size = () => {
    const r = canvas.getBoundingClientRect();
    core.resize(Math.max(1, Math.round(r.width)), Math.max(1, Math.round(r.height)));
  };
  size();
  const labels = new Labels(labelRoot, leaders);
  const S = build(labels);

  const D = S.draw;
  DRAW.uDrawDir.value.set(D.dir[0], D.dir[1], D.dir[2], D.radial || 0);
  DRAW.uDrawC.value.set(...(D.c || [0, 0, 0]));
  DRAW.uDrawSoft.value = D.soft || 1.2;

  // the plotter: the sheet draws itself in, lines first with a brass pen tip, then the fills
  const sm = x => x * x * (3 - 2 * x);
  function intro(T) {
    const plot = sm(win(T, 0.2, 2.6)), fill = sm(win(T, 0.6, 2.95));
    const span = D.max - D.min + 2;
    DRAW.uDraw.value = T > 3.2 ? 1e5 : D.min - 1 + plot * (span + DRAW.uDrawSoft.value);
    DRAW.uDrawFill.value = T > 3.2 ? 1e5 : D.min - 1 + fill * span;
    S.introHook?.(T);
    return { plot, labels: win(T, 2.6, 3.2) };
  }

  let target = 0, p = 0, active = true, raf = 0, last = -1;
  const t0 = performance.now();
  let introDone = false;

  function step() {
    const T = (performance.now() - t0) / 1000;
    const it = intro(T);
    const st = S.update(p) || {};
    for (const item of labels.items) item.op *= it.labels;
    const cam = camAt(S.keys, p);
    applyCam(cam, S.R);
    labels.update();
    core.renderer.render(core.scene, core.camera);
    onFrame?.({ p, plot: it.plot, fov: cam.fov, surfaces: st.surfaces });
    if (T > 3.3) introDone = true;
  }
  function frame() {
    raf = 0;
    if (!active) return;
    p += (target - p) * 0.12;
    if (Math.abs(target - p) < 0.0004) p = target;
    // after the intro, only draw when something moves
    if (!introDone || p !== last) { step(); last = p; }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  const ro = new ResizeObserver(() => { size(); last = -1; });
  ro.observe(canvas);
  // Browsers may drop a canvas's back buffer when the tab is hidden or the GPU is reclaimed.
  // Nothing moves while idle, so force a fresh frame whenever the page or context comes back.
  const redraw = () => { last = -1; };
  document.addEventListener('visibilitychange', redraw);
  canvas.addEventListener('webglcontextrestored', redraw);

  return {
    setProgress(v) { target = clamp(v); },
    redraw,
    setActive(v) {
      if (v === active) return;
      active = v;
      if (active && !raf) { last = -1; raf = requestAnimationFrame(frame); }
    },
    destroy() {
      active = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener('visibilitychange', redraw);
      canvas.removeEventListener('webglcontextrestored', redraw);
      labels.clear();
      core.dispose();
    },
  };
}
