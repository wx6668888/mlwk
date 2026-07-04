import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import type {
  DesignerModule,
  DesignerModuleType,
  DesignerTransformMode,
  DesignerView,
  RoomDimensions,
} from "../designer/types";

type ModuleTransform = Pick<DesignerModule, "x" | "z" | "rotation">;

type Props = {
  room: RoomDimensions;
  modules: DesignerModule[];
  finishColor: string;
  view: DesignerView;
  selectedModuleId: string | null;
  transformMode: DesignerTransformMode;
  onSelect: (moduleId: string | null) => void;
  onTransform: (moduleId: string, transform: ModuleTransform) => void;
};

function meters(value: number) {
  return value / 1000;
}

function moduleVerticalPosition(type: DesignerModuleType, height: number) {
  if (type === "wall") return 1.45 + height / 2;
  return height / 2;
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (
      !(child instanceof THREE.Mesh) &&
      !(child instanceof THREE.LineSegments)
    ) {
      return;
    }
    child.geometry.dispose();
    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];
    materials.forEach((material) => material.dispose());
  });
}

function makeCabinet(
  module: DesignerModule,
  finishColor: string,
  selected: boolean,
) {
  const width = meters(module.width);
  const depth = meters(module.depth);
  const height = meters(module.height);
  const group = new THREE.Group();
  group.userData.moduleId = module.id;
  group.position.set(meters(module.x), 0, meters(module.z));
  group.rotation.y = THREE.MathUtils.degToRad(module.rotation);

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: finishColor,
    roughness: 0.66,
    metalness: 0.02,
    emissive: selected ? "#b49367" : "#000000",
    emissiveIntensity: selected ? 0.18 : 0,
  });
  const edgeMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(finishColor).multiplyScalar(0.68),
    roughness: 0.58,
    emissive: selected ? "#8c6a43" : "#000000",
    emissiveIntensity: selected ? 0.2 : 0,
  });

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    bodyMaterial,
  );
  body.position.y = moduleVerticalPosition(module.type, height);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  if (module.type !== "panel" && module.type !== "door") {
    const seam = new THREE.Mesh(
      new THREE.BoxGeometry(0.008, height * 0.94, depth + 0.012),
      edgeMaterial,
    );
    seam.position.set(0, body.position.y, 0);
    group.add(seam);
  }

  if (module.type === "base") {
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.035, 0.035, depth + 0.035),
      new THREE.MeshStandardMaterial({
        color: "#c8c2b7",
        roughness: 0.48,
        emissive: selected ? "#9f8a70" : "#000000",
        emissiveIntensity: selected ? 0.1 : 0,
      }),
    );
    top.position.y = height + 0.018;
    top.castShadow = true;
    group.add(top);
  }

  return group;
}

function makeRoom(
  room: RoomDimensions,
  modules: DesignerModule[],
  finishColor: string,
  view: DesignerView,
  selectedModuleId: string | null,
) {
  const roomGroup = new THREE.Group();
  const roomWidth = meters(room.width);
  const roomDepth = meters(room.depth);
  const roomHeight = meters(room.height);
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: "#e7e4dc",
    roughness: 0.92,
    side: THREE.DoubleSide,
  });
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: "#a9a195",
    roughness: 0.78,
  });

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(roomWidth, roomDepth),
    floorMaterial,
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  roomGroup.add(floor);

  const back = new THREE.Mesh(
    new THREE.PlaneGeometry(roomWidth, roomHeight),
    wallMaterial,
  );
  back.position.set(0, roomHeight / 2, -roomDepth / 2);
  roomGroup.add(back);

  const left = new THREE.Mesh(
    new THREE.PlaneGeometry(roomDepth, roomHeight),
    wallMaterial,
  );
  left.rotation.y = Math.PI / 2;
  left.position.set(-roomWidth / 2, roomHeight / 2, 0);
  roomGroup.add(left);

  const right = left.clone();
  right.rotation.y = -Math.PI / 2;
  right.position.x = roomWidth / 2;
  roomGroup.add(right);

  const grid = new THREE.GridHelper(
    Math.max(roomWidth, roomDepth),
    Math.max(8, Math.round(Math.max(roomWidth, roomDepth) * 2)),
    "#777a72",
    "#b5b4ad",
  );
  grid.position.y = 0.004;
  grid.material.transparent = true;
  grid.material.opacity = view === "plan" ? 0.42 : 0.12;
  roomGroup.add(grid);

  modules.forEach((module) => {
    roomGroup.add(
      makeCabinet(module, finishColor, module.id === selectedModuleId),
    );
  });

  return roomGroup;
}

function clampModuleToRoom(
  module: DesignerModule,
  room: RoomDimensions,
  object: THREE.Object3D,
): ModuleTransform {
  const rotation = THREE.MathUtils.radToDeg(object.rotation.y);
  const radians = THREE.MathUtils.degToRad(rotation);
  const halfWidth =
    (Math.abs(Math.cos(radians)) * module.width +
      Math.abs(Math.sin(radians)) * module.depth) /
    2;
  const halfDepth =
    (Math.abs(Math.sin(radians)) * module.width +
      Math.abs(Math.cos(radians)) * module.depth) /
    2;
  const x = THREE.MathUtils.clamp(
    object.position.x * 1000,
    -room.width / 2 + halfWidth,
    room.width / 2 - halfWidth,
  );
  const z = THREE.MathUtils.clamp(
    object.position.z * 1000,
    -room.depth / 2 + halfDepth,
    room.depth / 2 - halfDepth,
  );

  return {
    x: Math.round(x / 10) * 10,
    z: Math.round(z / 10) * 10,
    rotation: Math.round((((rotation % 360) + 360) % 360) * 10) / 10,
  };
}

export default function RoomDesignerCanvas({
  room,
  modules,
  finishColor,
  view,
  selectedModuleId,
  transformMode,
  onSelect,
  onTransform,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const transformRef = useRef<TransformControls | null>(null);
  const roomGroupRef = useRef<THREE.Group | null>(null);
  const modulesRef = useRef(modules);
  const roomRef = useRef(room);
  const onSelectRef = useRef(onSelect);
  const onTransformRef = useRef(onTransform);

  modulesRef.current = modules;
  roomRef.current = room;
  onSelectRef.current = onSelect;
  onTransformRef.current = onTransform;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#d8d7d1");
    scene.fog = new THREE.Fog("#d8d7d1", 9, 22);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.minDistance = 3;
    controls.maxDistance = 16;
    controls.maxPolarAngle = Math.PI / 2.03;
    controls.target.set(0, 1.15, 0);

    const transform = new TransformControls(camera, renderer.domElement);
    transform.setTranslationSnap(0.05);
    transform.setRotationSnap(THREE.MathUtils.degToRad(15));
    transform.setSize(0.75);
    scene.add(transform.getHelper());

    transform.addEventListener("dragging-changed", (event) => {
      controls.enabled = !event.value;
      if (!event.value && transform.object) {
        const moduleId = transform.object.userData.moduleId as string | undefined;
        const module = modulesRef.current.find((item) => item.id === moduleId);
        if (moduleId && module) {
          onTransformRef.current(
            moduleId,
            clampModuleToRoom(module, roomRef.current, transform.object),
          );
        }
      }
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const selectModule = (event: PointerEvent) => {
      if (transform.axis) return;
      const group = roomGroupRef.current;
      if (!group) return;
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const intersections = raycaster.intersectObjects(group.children, true);
      for (const intersection of intersections) {
        let target: THREE.Object3D | null = intersection.object;
        while (target && target !== group) {
          if (typeof target.userData.moduleId === "string") {
            onSelectRef.current(target.userData.moduleId);
            return;
          }
          target = target.parent;
        }
      }
      onSelectRef.current(null);
    };
    renderer.domElement.addEventListener("pointerdown", selectModule);

    scene.add(new THREE.HemisphereLight("#fffdf5", "#77736d", 2.1));
    const key = new THREE.DirectionalLight("#fff4df", 3.6);
    key.position.set(4, 7, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const fill = new THREE.DirectionalLight("#dbe2e5", 1.3);
    fill.position.set(-4, 3, 2);
    scene.add(fill);

    sceneRef.current = scene;
    cameraRef.current = camera;
    controlsRef.current = controls;
    transformRef.current = transform;

    let lastWidth = 0;
    let lastHeight = 0;
    const resize = () => {
      const width = Math.max(1, Math.round(mount.clientWidth));
      const height = Math.max(1, Math.round(mount.clientHeight));
      if (width === lastWidth && height === lastHeight) return;
      lastWidth = width;
      lastHeight = height;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    let frame = 0;
    const render = () => {
      controls.update();
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("pointerdown", selectModule);
      controls.dispose();
      transform.detach();
      transform.dispose();
      if (roomGroupRef.current) disposeObject(roomGroupRef.current);
      renderer.dispose();
      renderer.domElement.remove();
      roomGroupRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
      transformRef.current = null;
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    const transform = transformRef.current;
    if (!scene || !transform) return;
    transform.detach();
    if (roomGroupRef.current) {
      scene.remove(roomGroupRef.current);
      disposeObject(roomGroupRef.current);
    }
    const nextRoom = makeRoom(
      room,
      modules,
      finishColor,
      view,
      selectedModuleId,
    );
    scene.add(nextRoom);
    roomGroupRef.current = nextRoom;

    if (selectedModuleId) {
      const selected = nextRoom.children.find(
        (child) => child.userData.moduleId === selectedModuleId,
      );
      if (selected) transform.attach(selected);
    }
  }, [finishColor, modules, room, selectedModuleId, view]);

  useEffect(() => {
    const transform = transformRef.current;
    if (!transform) return;
    transform.setMode(transformMode);
    transform.showX = transformMode === "translate";
    transform.showY = transformMode === "rotate";
    transform.showZ = transformMode === "translate";
  }, [transformMode]);

  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const roomWidth = meters(room.width);
    const roomDepth = meters(room.depth);
    const roomHeight = meters(room.height);
    if (view === "plan") {
      camera.position.set(0, 10.5, 0.01);
      controls.target.set(0, 0, 0);
      controls.enableRotate = false;
    } else {
      camera.position.set(
        roomWidth * 0.82,
        Math.max(3.3, roomHeight * 1.22),
        roomDepth * 1.15,
      );
      controls.target.set(0, 1.15, 0);
      controls.enableRotate = true;
    }
    controls.update();
  }, [room, view]);

  return <div className="designer-canvas" ref={mountRef} />;
}
