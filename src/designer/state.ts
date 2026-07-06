import {
  DESIGNER_STORAGE_KEY,
  finishOptions,
  type CameraState,
  type DesignerDraft,
  type DesignerModule,
  type DesignerRoom,
  type DesignerView,
  type RoomDimensions,
} from "./types";

export type DesignerSceneState = {
  rooms: DesignerRoom[];
  activeRoomId: string;
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

export function createDesignerRoom(
  name: string,
  room: RoomDimensions,
  modules: DesignerModule[],
  finishId: string,
): DesignerRoom {
  return {
    id: `room-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`,
    name,
    room,
    modules,
    finishId: finishOptions.some((item) => item.id === finishId)
      ? finishId
      : finishOptions[0].id,
  };
}

export function getActiveDesignerRoom(scene: DesignerSceneState): DesignerRoom {
  return (
    scene.rooms.find((room) => room.id === scene.activeRoomId) ??
    scene.rooms[0] ??
    createDesignerRoom(
      "Room 1",
      { width: 4800, depth: 3800, height: 2800 },
      [],
      finishOptions[0].id,
    )
  );
}

export function updateActiveDesignerRoom(
  scene: DesignerSceneState,
  update: (room: DesignerRoom) => DesignerRoom,
): DesignerSceneState {
  const active = getActiveDesignerRoom(scene);
  const activeRoomId = active?.id ?? scene.activeRoomId;

  return {
    ...scene,
    activeRoomId,
    rooms: scene.rooms.map((room) =>
      room.id === activeRoomId ? update(room) : room,
    ),
  };
}

export function readDesignerDraft(): DesignerDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const value = JSON.parse(
      window.localStorage.getItem(DESIGNER_STORAGE_KEY) ?? "null",
    ) as (Partial<DesignerDraft> & {
      version?: number;
      room?: RoomDimensions;
      modules?: DesignerModule[];
      finish?: string;
    }) | null;
    if (value?.version === 3) {
      if (
        typeof value.id !== "string" ||
        !Array.isArray(value.rooms) ||
        value.rooms.length === 0 ||
        typeof value.activeRoomId !== "string" ||
        !value.camera ||
        typeof value.updatedAt !== "string"
      ) {
        return null;
      }
      return value as DesignerDraft;
    }

    if (
      value?.version === 2 &&
      typeof value.id === "string" &&
      value.room &&
      Array.isArray(value.modules) &&
      typeof value.finish === "string" &&
      value.camera &&
      typeof value.updatedAt === "string"
    ) {
      const legacyRoom = createDesignerRoom(
        "Room 1",
        value.room,
        value.modules,
        value.finish,
      );
      return {
        version: 3,
        id: value.id,
        rooms: [legacyRoom],
        activeRoomId: legacyRoom.id,
        camera: value.camera,
        updatedAt: value.updatedAt,
      };
    }

    return null;
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
  const rooms =
    scene.rooms.length > 0
      ? scene.rooms.map((room) => ({
          ...room,
          finishId: finishOptions.some((item) => item.id === room.finishId)
            ? room.finishId
            : finishOptions[0].id,
        }))
      : [
          createDesignerRoom(
            "Room 1",
            { width: 4800, depth: 3800, height: 2800 },
            [],
            finishOptions[0].id,
          ),
        ];
  const activeRoomId = rooms.some((room) => room.id === scene.activeRoomId)
    ? scene.activeRoomId
    : rooms[0].id;

  return {
    version: 3,
    id,
    rooms,
    activeRoomId,
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
