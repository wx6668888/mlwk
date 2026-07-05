export type DesignerModuleType =
  | "base"
  | "wall"
  | "tall"
  | "wardrobe"
  | "panel"
  | "door";

export type DesignerModule = {
  id: string;
  type: DesignerModuleType;
  width: number;
  depth: number;
  height: number;
  x: number;
  z: number;
  rotation: number;
};

export type RoomDimensions = {
  width: number;
  depth: number;
  height: number;
};

export type DesignerView = "3d" | "plan";
export type DesignerTransformMode = "translate" | "rotate";

export type CameraState = {
  position: [number, number, number];
  target: [number, number, number];
  view: DesignerView;
};

export type DesignerDraft = {
  version: 2;
  id: string;
  room: RoomDimensions;
  modules: DesignerModule[];
  finish: string;
  camera: CameraState;
  updatedAt: string;
};

export const DESIGNER_STORAGE_KEY = "mlwk-designer-v2";

export const moduleCatalog: Array<{
  type: DesignerModuleType;
  label: string;
  width: number;
  depth: number;
  height: number;
}> = [
  { type: "base", label: "Base cabinet", width: 600, depth: 600, height: 870 },
  { type: "wall", label: "Wall cabinet", width: 600, depth: 360, height: 720 },
  { type: "tall", label: "Tall cabinet", width: 600, depth: 600, height: 2400 },
  { type: "wardrobe", label: "Wardrobe", width: 900, depth: 620, height: 2400 },
  { type: "panel", label: "Wall panel", width: 600, depth: 45, height: 2600 },
  { type: "door", label: "Interior door", width: 900, depth: 55, height: 2400 },
];

export const finishOptions = [
  { id: "smoked-oak", label: "Smoked oak", color: "#51453a" },
  { id: "natural-oak", label: "Natural oak", color: "#a08362" },
  { id: "walnut", label: "Walnut", color: "#654837" },
  { id: "charcoal", label: "Charcoal", color: "#2d302e" },
  { id: "warm-white", label: "Warm white", color: "#dad8cf" },
  { id: "sage", label: "Mineral sage", color: "#747b6e" },
] as const;
