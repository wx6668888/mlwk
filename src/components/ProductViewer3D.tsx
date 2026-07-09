import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export type ProductShape = "table" | "chair" | "shelf" | "mirror" | "stand" | "desk" | "bench";

interface Props { shape: ProductShape; finish?: string; className?: string; }

/* ── Shape → GLB model mapping ─────────────────────────────── */
const MODEL_MAP: Record<ProductShape, string[]> = {
  table: Array.from({length:10},(_,i)=>`dining_table_${String(i+1).padStart(2,'0')}.glb`),
  chair: Array.from({length:10},(_,i)=>`dining_chair_${String(i+1).padStart(2,'0')}.glb`),
  desk:  Array.from({length:10},(_,i)=>`desk_${String(i+1).padStart(2,'0')}.glb`),
  shelf: Array.from({length:10},(_,i)=>`bookshelf_${String(i+1).padStart(2,'0')}.glb`),
  mirror:Array.from({length:10},(_,i)=>`mirror_${String(i+1).padStart(2,'0')}.glb`),
  stand: Array.from({length:10},(_,i)=>`coat_stand_${String(i+1).padStart(2,'0')}.glb`),
  bench: Array.from({length:10},(_,i)=>`bench_${String(i+1).padStart(2,'0')}.glb`),
};

function pickModel(shape: ProductShape, slug?: string): string {
  const models = MODEL_MAP[shape] || MODEL_MAP.table;
  if (slug) {
    const hash = slug.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
    return models[hash % models.length];
  }
  return models[0];
}

export default function ProductViewer3D({ shape, finish, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const w = el.clientWidth || 400, h = el.clientHeight || 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe8e2d8);

    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 20);
    camera.position.set(2.0, 1.5, 2.2);
    camera.lookAt(0, 0.65, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
    el.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0xfff8f0, 1.5));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(5, 8, 6); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024); key.shadow.camera.near = 0.5; key.shadow.camera.far = 25;
    scene.add(key);
    const fillLight = new THREE.DirectionalLight(0xd8d0e8, 1.0);
    fillLight.position.set(-3, 2, -2);
    scene.add(fillLight);
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
    rimLight.position.set(0, 1, -4);
    scene.add(rimLight);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 6),
      new THREE.MeshStandardMaterial({ color: 0xe8e2d8, roughness: 0.9 })
    );
    ground.rotation.x = -Math.PI / 2; ground.position.y = -0.05;
    ground.receiveShadow = true; scene.add(ground);

    // Load GLB model
    const modelFile = pickModel(shape);
    const loader = new GLTFLoader();
    loader.load(
      `/media/models/${modelFile}`,
      (gltf) => {
        const model = gltf.scene;
        // Center and scale
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.8 / maxDim;
        model.scale.setScalar(scale);
        model.position.set(-center.x * scale, -center.y * scale + 0.4, -center.z * scale);
        model.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        scene.add(model);
      },
      undefined,
      () => setError(true)
    );

    // Controls
    const ctrl = new OrbitControls(camera, renderer.domElement);
    ctrl.enableDamping = true; ctrl.dampingFactor = 0.08;
    ctrl.target.set(0, 0.65, 0);
    ctrl.minPolarAngle = 0.2; ctrl.maxPolarAngle = Math.PI / 2 + 0.3;
    ctrl.minDistance = 1.2; ctrl.maxDistance = 6;
    ctrl.autoRotate = true; ctrl.autoRotateSpeed = 0.8;
    ctrl.update();

    let id: number;
    (function loop() { id = requestAnimationFrame(loop); ctrl.update(); renderer.render(scene, camera); })();

    const onResize = () => { const nw = el.clientWidth, nh = el.clientHeight || 360; camera.aspect = nw / nh; camera.updateProjectionMatrix(); renderer.setSize(nw, nh); };
    window.addEventListener("resize", onResize);

    return () => { cancelAnimationFrame(id); ctrl.dispose(); renderer.dispose(); window.removeEventListener("resize", onResize); if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement); };
  }, [shape]);

  if (error) {
    return <div ref={ref} className={className} style={{width:"100%",height:"360px",borderRadius:"14px",overflow:"hidden",background:"#f2efe8",display:"flex",alignItems:"center",justifyContent:"center",color:"#999",fontSize:"13px"}}>3D preview unavailable</div>;
  }
  return <div ref={ref} className={className} style={{ width: "100%", height: "360px", borderRadius: "14px", overflow: "hidden" }} />;
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
