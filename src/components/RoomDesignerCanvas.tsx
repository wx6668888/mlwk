import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import type {
  CameraState,
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
  collisionIds: ReadonlySet<string>;
  transformMode: DesignerTransformMode;
  snapEnabled: boolean;
  cameraState: CameraState;
  cameraResetKey: number;
  onCameraChange: (camera: CameraState) => void;
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

function makeWoodTexture(color: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 192;
  canvas.height = 192;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.fillStyle = color;
  context.fillRect(0, 0, canvas.width, canvas.height);
  const base = new THREE.Color(color);
  for (let index = 0; index < 70; index += 1) {
    const grain = base
      .clone()
      .offsetHSL(0, 0, index % 3 === 0 ? 0.12 : -0.1);
    context.strokeStyle = `rgba(${Math.round(grain.r * 255)}, ${Math.round(
      grain.g * 255,
    )}, ${Math.round(grain.b * 255)}, ${0.035 + (index % 5) * 0.012})`;
    context.lineWidth = index % 9 === 0 ? 1.4 : 0.55;
    const x = (index / 70) * canvas.width + Math.sin(index * 2.7) * 5;
    context.beginPath();
    context.moveTo(x, 0);
    context.bezierCurveTo(
      x + Math.sin(index) * 7,
      56,
      x - Math.cos(index * 1.7) * 8,
      132,
      x + Math.sin(index * 0.8) * 5,
      canvas.height,
    );
    context.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.6, 2.2);
  return texture;
}

function makeCabinet(
  module: DesignerModule,
  finishColor: string,
  selected: boolean,
  colliding: boolean,
) {
  const width = meters(module.width);
  const depth = meters(module.depth);
  const height = meters(module.height);
  const group = new THREE.Group();
  group.userData.moduleId = module.id;
  group.position.set(meters(module.x), 0, meters(module.z));
  group.rotation.y = THREE.MathUtils.degToRad(module.rotation);
  const woodTexture = makeWoodTexture(finishColor);

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    map: woodTexture,
    roughness: 0.59,
    metalness: 0.02,
    emissive: colliding ? "#8f3025" : selected ? "#b49367" : "#000000",
    emissiveIntensity: colliding ? 0.34 : selected ? 0.18 : 0,
  });
  const edgeMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(finishColor).multiplyScalar(0.68),
    roughness: 0.58,
    emissive: colliding ? "#8f3025" : selected ? "#8c6a43" : "#000000",
    emissiveIntensity: colliding ? 0.34 : selected ? 0.2 : 0,
  });

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.985, height * 0.992, depth * 0.98),
    bodyMaterial,
  );
  body.position.y = moduleVerticalPosition(module.type, height);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  if (module.type !== "panel") {
    const front = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.955, height * 0.965, 0.018),
      bodyMaterial.clone(),
    );
    front.position.set(0, body.position.y, depth / 2 + 0.006);
    front.castShadow = true;
    group.add(front);
  }

  if (
    module.type !== "panel" &&
    module.type !== "door" &&
    module.type !== "wall"
  ) {
    const seam = new THREE.Mesh(
      new THREE.BoxGeometry(0.009, height * 0.925, 0.023),
      edgeMaterial,
    );
    seam.position.set(0, body.position.y, depth / 2 + 0.017);
    group.add(seam);

    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(Math.min(0.18, width * 0.28), 0.018, 0.018),
      new THREE.MeshStandardMaterial({
        color: "#8e7659",
        roughness: 0.28,
        metalness: 0.72,
      }),
    );
    handle.position.set(
      width * 0.27,
      Math.min(body.position.y + height * 0.25, height - 0.15),
      depth / 2 + 0.035,
    );
    handle.castShadow = true;
    group.add(handle);
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

  if (["base", "tall", "wardrobe"].includes(module.type)) {
    const toeKick = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.9, 0.085, depth * 0.88),
      edgeMaterial,
    );
    toeKick.position.set(0, 0.043, 0.025);
    group.add(toeKick);
  }

  return group;
}

function makeDimensionLabel(text: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 72;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.fillStyle = "rgba(35, 36, 32, 0.84)";
  context.beginPath();
  context.roundRect(2, 2, 316, 68, 20);
  context.fill();
  context.fillStyle = "#f5f4ed";
  context.font = "600 27px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 160, 37);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
    }),
  );
  sprite.scale.set(1.35, 0.3, 1);
  sprite.renderOrder = 20;
  return sprite;
}

function addRoomDimensions(
  group: THREE.Group,
  roomWidth: number,
  roomDepth: number,
  roomHeight: number,
) {
  const lineMaterial = new THREE.LineBasicMaterial({
    color: "#656861",
    transparent: true,
    opacity: 0.62,
    depthTest: false,
  });
  const widthLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-roomWidth / 2, 0.045, -roomDepth / 2 + 0.08),
      new THREE.Vector3(roomWidth / 2, 0.045, -roomDepth / 2 + 0.08),
    ]),
    lineMaterial,
  );
  widthLine.renderOrder = 18;
  group.add(widthLine);
  const widthLabel = makeDimensionLabel(`${Math.round(roomWidth * 1000)} mm`);
  if (widthLabel) {
    widthLabel.position.set(0, 0.18, -roomDepth / 2 + 0.1);
    group.add(widthLabel);
  }

  const depthLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-roomWidth / 2 + 0.08, 0.045, -roomDepth / 2),
      new THREE.Vector3(-roomWidth / 2 + 0.08, 0.045, roomDepth / 2),
    ]),
    lineMaterial.clone(),
  );
  depthLine.renderOrder = 18;
  group.add(depthLine);
  const depthLabel = makeDimensionLabel(`${Math.round(roomDepth * 1000)} mm`);
  if (depthLabel) {
    depthLabel.position.set(-roomWidth / 2 + 0.14, 0.18, 0);
    group.add(depthLabel);
  }

  const heightLabel = makeDimensionLabel(`${Math.round(roomHeight * 1000)} mm`);
  if (heightLabel) {
    heightLabel.position.set(
      -roomWidth / 2 + 0.12,
      roomHeight - 0.22,
      -roomDepth / 2 + 0.12,
    );
    heightLabel.scale.set(1.05, 0.24, 1);
    group.add(heightLabel);
  }
}

function makeRoom(
  room: RoomDimensions,
  modules: DesignerModule[],
  finishColor: string,
  view: DesignerView,
  selectedModuleId: string | null,
  collisionIds: ReadonlySet<string>,
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
  addRoomDimensions(roomGroup, roomWidth, roomDepth, roomHeight);

  modules.forEach((module) => {
    roomGroup.add(
      makeCabinet(
        module,
        finishColor,
        module.id === selectedModuleId,
        collisionIds.has(module.id),
      ),
    );
  });

  return roomGroup;
}

function clampModuleToRoom(
  module: DesignerModule,
  room: RoomDimensions,
  object: THREE.Object3D,
  snapEnabled: boolean,
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
  const minX = -room.width / 2 + halfWidth;
  const maxX = room.width / 2 - halfWidth;
  const minZ = -room.depth / 2 + halfDepth;
  const maxZ = room.depth / 2 - halfDepth;
  let x = THREE.MathUtils.clamp(
    object.position.x * 1000,
    minX,
    maxX,
  );
  let z = THREE.MathUtils.clamp(
    object.position.z * 1000,
    minZ,
    maxZ,
  );

  if (snapEnabled) {
    x = Math.round(x / 50) * 50;
    z = Math.round(z / 50) * 50;
    if (Math.abs(x - minX) < 140) x = minX;
    if (Math.abs(x - maxX) < 140) x = maxX;
    if (Math.abs(z - minZ) < 140) z = minZ;
    if (Math.abs(z - maxZ) < 140) z = maxZ;
  }

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
  collisionIds,
  transformMode,
  snapEnabled,
  cameraState,
  cameraResetKey,
  onCameraChange,
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
  const onCameraChangeRef = useRef(onCameraChange);
  const viewRef = useRef(view);
  const snapEnabledRef = useRef(snapEnabled);

  modulesRef.current = modules;
  roomRef.current = room;
  onSelectRef.current = onSelect;
  onTransformRef.current = onTransform;
  onCameraChangeRef.current = onCameraChange;
  viewRef.current = view;
  snapEnabledRef.current = snapEnabled;

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
    controls.addEventListener("end", () => {
      onCameraChangeRef.current({
        position: camera.position.toArray() as [number, number, number],
        target: controls.target.toArray() as [number, number, number],
        view: viewRef.current,
      });
    });

    const transform = new TransformControls(camera, renderer.domElement);
    transform.setTranslationSnap(snapEnabled ? 0.05 : null);
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
            clampModuleToRoom(
              module,
              roomRef.current,
              transform.object,
              snapEnabledRef.current,
            ),
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
      collisionIds,
    );
    scene.add(nextRoom);
    roomGroupRef.current = nextRoom;

    if (selectedModuleId) {
      const selected = nextRoom.children.find(
        (child) => child.userData.moduleId === selectedModuleId,
      );
      if (selected) transform.attach(selected);
    }
  }, [collisionIds, finishColor, modules, room, selectedModuleId, view]);

  useEffect(() => {
    const transform = transformRef.current;
    if (!transform) return;
    transform.setMode(transformMode);
    transform.showX = transformMode === "translate";
    transform.showY = transformMode === "rotate";
    transform.showZ = transformMode === "translate";
  }, [transformMode]);

  useEffect(() => {
    transformRef.current?.setTranslationSnap(snapEnabled ? 0.05 : null);
  }, [snapEnabled]);

  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    camera.position.fromArray(cameraState.position);
    controls.target.fromArray(cameraState.target);
    controls.enableRotate = view !== "plan";
    controls.update();
  }, [cameraResetKey, room, view]);

  return <div className="designer-canvas" ref={mountRef} />;
}
