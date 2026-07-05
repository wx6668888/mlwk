import {
  DESIGNER_STORAGE_KEY,
  finishOptions,
  type CameraState,
  type DesignerDraft,
  type DesignerModule,
  type DesignerView,
  type RoomDimensions,
} from "./types";

export type DesignerSceneState = {
  room: RoomDimensions;
  modules: DesignerModule[];
  finishId: string;
};

const defaultCamera: Record<DesignerView, CameraState> = {
  "3d": {
    position: [4.2, 3.8, 5.4],
    target: [0, 1.15, 0],
    view: "3d",
  },
  plan: {
    position: [0, 10.5, 0.01],
    target: [0, 0, 0],
    view: "plan",
  },
};

export function getDefaultCamera(view: DesignerView): CameraState {
  return {
    position: [...defaultCamera[view].position],
    target: [...defaultCamera[view].target],
    view,
  };
}

export function createDraftId() {
  return `design-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`;
}

export function readDesignerDraft(): DesignerDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const value = JSON.parse(
      window.localStorage.getItem(DESIGNER_STORAGE_KEY) ?? "null",
    ) as Partial<DesignerDraft> | null;
    if (
      value?.version !== 2 ||
      typeof value.id !== "string" ||
      !value.room ||
      !Array.isArray(value.modules) ||
      typeof value.finish !== "string" ||
      !value.camera ||
      typeof value.updatedAt !== "string"
    ) {
      return null;
    }
    return value as DesignerDraft;
  } catch {
    return null;
  }
}

export function writeDesignerDraft(draft: DesignerDraft) {
  window.localStorage.setItem(DESIGNER_STORAGE_KEY, JSON.stringify(draft));
}

export function makeDesignerDraft(
  id: string,
  scene: DesignerSceneState,
  camera: CameraState,
): DesignerDraft {
  return {
    version: 2,
    id,
    room: scene.room,
    modules: scene.modules,
    finish: finishOptions.some((item) => item.id === scene.finishId)
      ? scene.finishId
      : finishOptions[0].id,
    camera,
    updatedAt: new Date().toISOString(),
  };
}

function moduleBounds(module: DesignerModule) {
  const radians = (module.rotation * Math.PI) / 180;
  const halfWidth =
    (Math.abs(Math.cos(radians)) * module.width +
      Math.abs(Math.sin(radians)) * module.depth) /
    2;
  const halfDepth =
    (Math.abs(Math.sin(radians)) * module.width +
      Math.abs(Math.cos(radians)) * module.depth) /
    2;

  return {
    left: module.x - halfWidth,
    right: module.x + halfWidth,
    top: module.z - halfDepth,
    bottom: module.z + halfDepth,
  };
}

export function findCollidingModuleIds(modules: DesignerModule[]) {
  const collisions = new Set<string>();

  for (let firstIndex = 0; firstIndex < modules.length; firstIndex += 1) {
    const first = modules[firstIndex];
    if (first.type === "panel" || first.type === "door") continue;
    const firstBounds = moduleBounds(first);

    for (
      let secondIndex = firstIndex + 1;
      secondIndex < modules.length;
      secondIndex += 1
    ) {
      const second = modules[secondIndex];
      if (second.type === "panel" || second.type === "door") continue;
      const secondBounds = moduleBounds(second);
      const overlap =
        firstBounds.left < secondBounds.right - 8 &&
        firstBounds.right > secondBounds.left + 8 &&
        firstBounds.top < secondBounds.bottom - 8 &&
        firstBounds.bottom > secondBounds.top + 8;

      if (overlap) {
        collisions.add(first.id);
        collisions.add(second.id);
      }
    }
  }

  return collisions;
}

