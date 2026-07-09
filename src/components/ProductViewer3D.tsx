import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export type ProductShape = "table" | "chair" | "shelf" | "mirror" | "stand" | "desk" | "bench";

interface Props {
  shape: ProductShape;
  finish?: string;
  className?: string;
}

const FINISH_COLORS: Record<string, string> = {
  oak: "#a08362",
  walnut: "#654837",
  ash: "#b8a88a",
  beech: "#d4b896",
  ebonised: "#2a2520",
  charcoal: "#3a3d38",
  smoked: "#51453a",
  bleached: "#d4c9b5",
  oiled: "#4a3428",
  natural: "#a08362",
};

function getColor(finish?: string): number {
  if (!finish) return 0x654837;
  const lower = finish.toLowerCase();
  for (const [key, hex] of Object.entries(FINISH_COLORS)) {
    if (lower.includes(key)) return parseInt(hex.slice(1), 16);
  }
  return 0x654837;
}

function buildGeometry(shape: ProductShape, color: number): THREE.Group {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.05 });

  switch (shape) {
    case "table": {
      const top = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.8), mat);
      top.position.y = 0.72;
      group.add(top);
      for (let i = 0; i < 4; i++) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.7, 8), mat);
        leg.position.set((i % 2 === 0 ? -1 : 1) * 0.6, 0.35, (i < 2 ? -1 : 1) * 0.3);
        group.add(leg);
      }
      break;
    }
    case "chair": {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.05, 0.45), mat);
      seat.position.y = 0.45;
      group.add(seat);
      for (let i = 0; i < 4; i++) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.42, 8), mat);
        leg.position.set((i % 2 === 0 ? -1 : 1) * 0.18, 0.21, (i < 2 ? -1 : 1) * 0.18);
        group.add(leg);
      }
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.04), mat);
      back.position.set(0, 0.68, -0.2);
      group.add(back);
      break;
    }
    case "desk": {
      const top = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.05, 0.8), mat);
      top.position.y = 0.73;
      group.add(top);
      for (let i = 0; i < 4; i++) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.7, 0.05), mat);
        leg.position.set((i % 2 === 0 ? -1 : 1) * 0.75, 0.35, (i < 2 ? -1 : 1) * 0.32);
        group.add(leg);
      }
      const drawer = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.3), mat);
      drawer.position.set(-0.4, 0.6, 0.35);
      group.add(drawer);
      break;
    }
    case "shelf": {
      for (let i = 0; i < 5; i++) {
        const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.03, 0.35), mat);
        shelf.position.y = i * 0.4 + 0.1;
        group.add(shelf);
      }
      for (let side = 0; side < 2; side++) {
        const panel = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.7, 0.35), mat);
        panel.position.set((side === 0 ? -1 : 1) * 0.7, 0.85, 0);
        group.add(panel);
      }
      break;
    }
    case "mirror": {
      const glassMat = new THREE.MeshStandardMaterial({ color: 0xccccdd, roughness: 0.05, metalness: 0.9 });
      const glass = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.6, 0.02), glassMat);
      glass.position.y = 1.05;
      group.add(glass);
      const top = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.06, 0.04), mat);
      top.position.y = 1.85;
      group.add(top);
      const bot = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.06, 0.04), mat);
      bot.position.y = 0.25;
      group.add(bot);
      for (let s = 0; s < 2; s++) {
        const side = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.6, 0.06), mat);
        side.position.set((s === 0 ? -1 : 1) * 0.3, 1.05, 0);
        group.add(side);
      }
      break;
    }
    case "stand": {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 8), mat);
      pole.position.y = 0.8;
      group.add(pole);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.08, 16), mat);
      base.position.y = 0.04;
      group.add(base);
      for (let i = 0; i < 4; i++) {
        const hook = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.01, 8, 8), mat);
        hook.position.y = 0.5 + i * 0.3;
        hook.rotation.x = Math.PI / 2;
        group.add(hook);
      }
      break;
    }
    case "bench": {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.38), mat);
      seat.position.y = 0.4;
      group.add(seat);
      for (let i = 0; i < 4; i++) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.38, 8), mat);
        leg.position.set((i % 2 === 0 ? -1 : 1) * 0.45, 0.19, (i < 2 ? -1 : 1) * 0.12);
        group.add(leg);
      }
      break;
    }
  }

  return group;
}

export default function ProductViewer3D({ shape, finish, className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight || 320;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f3ed);

    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 20);
    camera.position.set(2.2, 1.6, 2.5);
    camera.lookAt(0, 0.7, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, 1.8);
    key.position.set(3, 5, 4);
    key.castShadow = true;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xc8d0e0, 0.6);
    fill.position.set(-2, 1, -1);
    scene.add(fill);

    const groundGeo = new THREE.PlaneGeometry(4, 4);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);

    const color = getColor(finish);
    const model = buildGeometry(shape, color);
    scene.add(model);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0.7, 0);
    controls.minPolarAngle = 0.3;
    controls.maxPolarAngle = Math.PI / 2 + 0.3;
    controls.minDistance = 1.2;
    controls.maxDistance = 5;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;
    controls.update();

    let animId: number;
    function animate() {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    const onResize = () => {
      const nw = container.clientWidth;
      const nh = container.clientHeight || 320;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      controls.dispose();
      renderer.dispose();
      window.removeEventListener("resize", onResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      scene.clear();
    };
  }, [shape, finish]);

  return <div ref={containerRef} className={`product-viewer-3d ${className}`} style={{ width: "100%", height: "320px", borderRadius: "12px", overflow: "hidden" }} />;
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
