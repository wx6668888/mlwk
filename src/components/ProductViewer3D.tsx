import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";

export type ProductShape = "table" | "chair" | "shelf" | "mirror" | "stand" | "desk" | "bench";

interface Props { shape: ProductShape; finish?: string; className?: string; }

/* ── Procedural wood / material textures ──────────────────────── */
function woodCanvas(base: string, grain: string): HTMLCanvasElement {
  const c = document.createElement("canvas"); c.width = 512; c.height = 512;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = base; ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 60; i++) {
    ctx.strokeStyle = grain; ctx.lineWidth = 0.5 + Math.random() * 3;
    ctx.beginPath(); const y = 20 + i * 8 + Math.random() * 20;
    ctx.moveTo(0, y); ctx.bezierCurveTo(150, y + (Math.random() - 0.5) * 40, 350, y + (Math.random() - 0.5) * 40, 512, y);
    ctx.stroke();
  }
  // subtle noise
  const img = ctx.getImageData(0, 0, 512, 512);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 8;
    img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

const FINISH_PRESETS: Record<string, { base: string; grain: string; roughness: number }> = {
  "Natural oak": { base: "#c4a882", grain: "#a08060", roughness: 0.55 },
  "Natural walnut": { base: "#7a5a3a", grain: "#5a3a22", roughness: 0.5 },
  "Smoked oak": { base: "#6b5a4a", grain: "#4a3a2a", roughness: 0.6 },
  "Natural ash": { base: "#c8b898", grain: "#a89878", roughness: 0.55 },
  "Smoked ash": { base: "#8a7a6a", grain: "#6a5a4a", roughness: 0.6 },
  "Oiled walnut": { base: "#5a3a2a", grain: "#3a2010", roughness: 0.45 },
  "Bleached ash": { base: "#ddd5c5", grain: "#c5bda5", roughness: 0.55 },
  "Natural beech": { base: "#dcc8a8", grain: "#c0a888", roughness: 0.5 },
  "Ebonised": { base: "#2a2520", grain: "#1a1510", roughness: 0.3 },
  "Charcoal stain": { base: "#3a3a38", grain: "#2a2a28", roughness: 0.4 },
  "Charcoal": { base: "#3a3d38", grain: "#2a2d28", roughness: 0.4 },
  "Smoked walnut": { base: "#4a3a2a", grain: "#3a2a1a", roughness: 0.5 },
};

function getTexture(finish: string | undefined): { map: THREE.CanvasTexture; roughness: number } {
  const key = Object.keys(FINISH_PRESETS).find(k => finish?.toLowerCase().includes(k.toLowerCase()));
  const preset = key ? FINISH_PRESETS[key] : FINISH_PRESETS["Natural walnut"];
  const canvas = woodCanvas(preset.base, preset.grain);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return { map: tex, roughness: preset.roughness };
}

/* ── Detailed furniture geometry ──────────────────────────────── */
function beveledBox(w: number, h: number, d: number, bevel = 0.015): THREE.BufferGeometry {
  // Simple box with slight rounding via segments
  return new THREE.BoxGeometry(w, h, d, 2, 2, 2);
}

function buildModel(shape: ProductShape, mat: THREE.MeshStandardMaterial): THREE.Group {
  const g = new THREE.Group();
  const darkMat = mat.clone(); darkMat.roughness = Math.min(mat.roughness + 0.15, 1);

  switch (shape) {
    case "table": {
      const top = new THREE.Mesh(beveledBox(1.7, 0.06, 0.9, 0.01), mat);
      top.position.y = 0.75; top.castShadow = true; g.add(top);
      // Apron
      for (let s = 0; s < 2; s++) {
        const apron = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.04), darkMat);
        apron.position.set(0, 0.68, (s === 0 ? -1 : 1) * 0.4); g.add(apron);
      }
      for (let s = 0; s < 2; s++) {
        const apron = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.72), darkMat);
        apron.position.set((s === 0 ? -1 : 1) * 0.7, 0.68, 0); g.add(apron);
      }
      // Tapered legs
      for (let i = 0; i < 4; i++) {
        const legGeo = new THREE.CylinderGeometry(0.025, 0.04, 0.68, 8);
        const leg = new THREE.Mesh(legGeo, darkMat);
        leg.position.set((i % 2 === 0 ? -1 : 1) * 0.62, 0.34, (i < 2 ? -1 : 1) * 0.35);
        leg.castShadow = true; g.add(leg);
      }
      break;
    }
    case "chair": {
      const seat = new THREE.Mesh(beveledBox(0.48, 0.06, 0.48), mat);
      seat.position.y = 0.46; seat.castShadow = true; g.add(seat);
      // Cushion
      const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.04, 0.42, 4, 2, 4), mat);
      cushion.position.y = 0.5; cushion.material = mat.clone();
      cushion.material.roughness = 0.85; g.add(cushion);
      // Legs
      for (let i = 0; i < 4; i++) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.028, 0.42, 8), darkMat);
        leg.position.set((i % 2 === 0 ? -1 : 1) * 0.2, 0.21, (i < 2 ? -1 : 1) * 0.2);
        leg.castShadow = true; g.add(leg);
      }
      // Backrest frame
      const backFrame = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.04, 0.03), darkMat);
      backFrame.position.set(0, 0.68, -0.22); g.add(backFrame);
      const backPanel = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.35, 0.025), mat);
      backPanel.position.set(0, 0.82, -0.22); g.add(backPanel);
      // Back legs extended
      for (let s = 0; s < 2; s++) {
        const bl = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.62, 8), darkMat);
        bl.position.set((s === 0 ? -1 : 1) * 0.18, 0.45, -0.2);
        bl.castShadow = true; g.add(bl);
      }
      break;
    }
    case "desk": {
      const top = new THREE.Mesh(beveledBox(1.8, 0.05, 0.82), mat);
      top.position.y = 0.75; top.castShadow = true; g.add(top);
      // Leather inlay hint
      const inlay = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.005, 0.5), new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.7 }));
      inlay.position.y = 0.78; g.add(inlay);
      // Legs
      for (let i = 0; i < 4; i++) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.7, 0.05), darkMat);
        leg.position.set((i % 2 === 0 ? -1 : 1) * 0.72, 0.35, (i < 2 ? -1 : 1) * 0.34);
        leg.castShadow = true; g.add(leg);
      }
      // Drawer block
      const drawer = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 0.32), mat);
      drawer.position.set(-0.45, 0.63, -0.3); g.add(drawer);
      // Drawer pull
      const pull = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.1, 8), new THREE.MeshStandardMaterial({ color: 0xc4a860, roughness: 0.3, metalness: 0.9 }));
      pull.rotation.x = Math.PI / 2; pull.position.set(-0.45, 0.63, -0.15); g.add(pull);
      break;
    }
    case "shelf": {
      const sideCount = 2; const shelfCount = 5;
      const sideMat = mat.clone();
      for (let i = 0; i < shelfCount; i++) {
        const shelf = new THREE.Mesh(beveledBox(1.4, 0.04, 0.36), mat);
        shelf.position.y = i * 0.38 + 0.1; shelf.castShadow = true; g.add(shelf);
      }
      for (let s = 0; s < sideCount; s++) {
        const panel = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.65, 0.36), sideMat);
        panel.position.set((s === 0 ? -1 : 1) * 0.7, 0.82, 0); g.add(panel);
      }
      break;
    }
    case "mirror": {
      const frameMat = mat.clone(); frameMat.roughness = 0.35;
      const glassMat = new THREE.MeshStandardMaterial({ color: 0xdddde8, roughness: 0.05, metalness: 0.95 });
      const glass = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.55, 0.02), glassMat);
      glass.position.y = 1.02; g.add(glass);
      // Frame top/bottom
      for (let fb = 0; fb < 2; fb++) {
        const f = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.07, 0.05), frameMat);
        f.position.y = fb === 0 ? 0.22 : 1.82; g.add(f);
      }
      for (let s = 0; s < 2; s++) {
        const f = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.55, 0.07), frameMat);
        f.position.set((s === 0 ? -1 : 1) * 0.3, 1.02, 0); g.add(f);
      }
      break;
    }
    case "stand": {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 1.6, 12), mat);
      pole.position.y = 0.82; pole.castShadow = true; g.add(pole);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.08, 24), new THREE.MeshStandardMaterial({ color: 0xe8e0d8, roughness: 0.3 }));
      base.position.y = 0.04; g.add(base);
      for (let i = 0; i < 5; i++) {
        const hook = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.012, 8, 12), new THREE.MeshStandardMaterial({ color: 0xc4a860, roughness: 0.3, metalness: 0.9 }));
        hook.position.y = 0.5 + i * 0.28; hook.rotation.x = Math.PI / 2;
        const angle = (i % 3) * (Math.PI * 2 / 3);
        hook.position.x = Math.cos(angle) * 0.1; hook.position.z = Math.sin(angle) * 0.1;
        g.add(hook);
      }
      break;
    }
    case "bench": {
      const seat = new THREE.Mesh(beveledBox(1.2, 0.08, 0.4), mat);
      seat.position.y = 0.42; seat.castShadow = true; g.add(seat);
      const cushion = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.05, 0.34, 6, 2, 4), new THREE.MeshStandardMaterial({ color: 0xd5cfc5, roughness: 0.85 }));
      cushion.position.y = 0.47; g.add(cushion);
      for (let i = 0; i < 4; i++) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.38, 8), darkMat);
        leg.position.set((i % 2 === 0 ? -1 : 1) * 0.45, 0.19, (i < 2 ? -1 : 1) * 0.13);
        leg.castShadow = true; g.add(leg);
      }
      break;
    }
  }
  return g;
}

/* ── Component ────────────────────────────────────────────────── */
export default function ProductViewer3D({ shape, finish, className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const texture = useMemo(() => getTexture(finish), [finish]);

  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const w = el.clientWidth || 400, h = el.clientHeight || 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf2efe8);
    scene.environment = new THREE.Scene().background = null;

    const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 20);
    camera.position.set(2.4, 1.8, 2.8);
    camera.lookAt(0, 0.65, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(w, h); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
    el.appendChild(renderer.domElement);

    // Lighting
    const amb = new THREE.AmbientLight(0xfff8f0, 1.4); scene.add(amb);
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(5, 8, 6); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024); key.shadow.camera.near = 0.5; key.shadow.camera.far = 25;
    key.shadow.bias = -0.0003;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xd8d0e8, 1.0);
    fill.position.set(-3, 2, -2); scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 0.6);
    rim.position.set(0, 1, -4); scene.add(rim);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 6),
      new THREE.MeshStandardMaterial({ color: 0xe8e2d8, roughness: 0.9 })
    );
    ground.rotation.x = -Math.PI / 2; ground.position.y = -0.05;
    ground.receiveShadow = true; scene.add(ground);

    // Model
    const mat = new THREE.MeshStandardMaterial({
      map: texture.map, roughness: texture.roughness, metalness: 0.02,
    });
    const model = buildModel(shape, mat);
    scene.add(model);

    // Controls
    const { OrbitControls } = require("three/examples/jsm/controls/OrbitControls.js");
    const ctrl = new OrbitControls(camera, renderer.domElement);
    ctrl.enableDamping = true; ctrl.dampingFactor = 0.08;
    ctrl.target.set(0, 0.65, 0);
    ctrl.minPolarAngle = 0.25; ctrl.maxPolarAngle = Math.PI / 2 + 0.3;
    ctrl.minDistance = 1.5; ctrl.maxDistance = 6;
    ctrl.autoRotate = true; ctrl.autoRotateSpeed = 0.5;
    ctrl.update();

    let id: number;
    (function loop() { id = requestAnimationFrame(loop); ctrl.update(); renderer.render(scene, camera); })();

    const onResize = () => { const nw = el.clientWidth, nh = el.clientHeight || 360; camera.aspect = nw / nh; camera.updateProjectionMatrix(); renderer.setSize(nw, nh); };
    window.addEventListener("resize", onResize);

    return () => { cancelAnimationFrame(id); ctrl.dispose(); renderer.dispose(); window.removeEventListener("resize", onResize); if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement); scene.clear(); };
  }, [shape, finish, texture]);

  return <div ref={containerRef} className={`product-viewer-3d ${className}`} style={{ width: "100%", height: "360px", borderRadius: "14px", overflow: "hidden" }} />;
}

export function shapeFromSlug(slug: string): ProductShape {
  if (slug.includes("desk")) return "desk";
  if (slug.includes("chair") || slug.includes("stool")) return "chair";
  if (slug.includes("shelf") || slug.includes("bookshelf")) return "shelf";
  if (slug.includes("mirror")) return "mirror";
  if (slug.includes("coat") || slug.includes("stand")) return "stand";
  if (slug.includes("bench")) return "bench";
  return "table";
}
