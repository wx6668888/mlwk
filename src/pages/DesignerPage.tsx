import {
  Box,
  ChevronLeft,
  DoorOpen,
  Grid2X2,
  Layers3,
  Move3D,
  Plus,
  Rotate3D,
  RotateCw,
  Save,
  Send,
  SquareDashedMousePointer,
  Trash2,
} from "lucide-react";
import {
  lazy,
  Suspense,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { Link } from "react-router-dom";
import {
  finishOptions,
  moduleCatalog,
  type DesignerModule,
  type DesignerModuleType,
  type DesignerTransformMode,
  type DesignerView,
  type RoomDimensions,
} from "../designer/types";
import type { Locale } from "../content";
import { track } from "../lib/analytics";

const RoomDesignerCanvas = lazy(
  () => import("../components/RoomDesignerCanvas"),
);

const labels: Record<
  Locale,
  {
    title: string;
    project: string;
    room: string;
    systems: string;
    finishes: string;
    width: string;
    depth: string;
    height: string;
    quote: string;
    save: string;
    empty: string;
  }
> = {
  en: {
    title: "3D Design Studio",
    project: "Untitled room",
    room: "Room",
    systems: "MLWK systems",
    finishes: "Finish",
    width: "Width",
    depth: "Depth",
    height: "Height",
    quote: "Send this design",
    save: "Save locally",
    empty: "Add a system to begin",
  },
  zh: {
    title: "3D 空间设计",
    project: "未命名空间",
    room: "空间",
    systems: "MLWK 系统",
    finishes: "饰面",
    width: "宽度",
    depth: "进深",
    height: "层高",
    quote: "提交此方案",
    save: "保存到本机",
    empty: "添加一个产品系统开始设计",
  },
  ar: {
    title: "استوديو التصميم ثلاثي الأبعاد",
    project: "غرفة بلا اسم",
    room: "المساحة",
    systems: "أنظمة MLWK",
    finishes: "التشطيب",
    width: "العرض",
    depth: "العمق",
    height: "الارتفاع",
    quote: "إرسال هذا التصميم",
    save: "حفظ محلي",
    empty: "أضف نظاماً للبدء",
  },
  de: {
    title: "3D Design Studio",
    project: "Unbenannter Raum",
    room: "Raum",
    systems: "MLWK Systeme",
    finishes: "Oberfläche",
    width: "Breite",
    depth: "Tiefe",
    height: "Höhe",
    quote: "Entwurf senden",
    save: "Lokal speichern",
    empty: "System hinzufügen",
  },
  fr: {
    title: "Studio de conception 3D",
    project: "Pièce sans titre",
    room: "Pièce",
    systems: "Systèmes MLWK",
    finishes: "Finition",
    width: "Largeur",
    depth: "Profondeur",
    height: "Hauteur",
    quote: "Envoyer ce projet",
    save: "Enregistrer",
    empty: "Ajoutez un système",
  },
};

const templates: Array<{
  id: string;
  label: string;
  room: RoomDimensions;
  modules: DesignerModuleType[];
}> = [
  {
    id: "kitchen-wall",
    label: "Single wall",
    room: { width: 4800, depth: 3800, height: 2800 },
    modules: ["tall", "base", "base", "base", "wall", "wall"],
  },
  {
    id: "wardrobe-suite",
    label: "Wardrobe suite",
    room: { width: 4200, depth: 3600, height: 2800 },
    modules: ["wardrobe", "wardrobe", "wardrobe", "panel"],
  },
  {
    id: "open-living",
    label: "Open living",
    room: { width: 6200, depth: 4800, height: 3000 },
    modules: ["panel", "panel", "panel", "door"],
  },
];

function createModule(
  type: DesignerModuleType,
  transform: { x: number; z: number; rotation?: number },
): DesignerModule {
  const source = moduleCatalog.find((item) => item.type === type)!;
  return {
    id: crypto.randomUUID(),
    type,
    width: source.width,
    depth: source.depth,
    height: source.height,
    x: transform.x,
    z: transform.z,
    rotation: transform.rotation ?? 0,
  };
}

function layoutModules(
  types: DesignerModuleType[],
  room: RoomDimensions,
): DesignerModule[] {
  let cursor = -room.width / 2 + 120;
  return types.map((type) => {
    const source = moduleCatalog.find((item) => item.type === type)!;
    const module = createModule(type, {
      x: cursor + source.width / 2,
      z: -room.depth / 2 + source.depth / 2 + 18,
    });
    cursor += source.width + 15;
    return module;
  });
}

export default function DesignerPage({ locale }: { locale: Locale }) {
  const copy = labels[locale];
  const initial = templates[0];
  const [room, setRoom] = useState<RoomDimensions>(initial.room);
  const [modules, setModules] = useState<DesignerModule[]>(
    layoutModules(initial.modules, initial.room),
  );
  const [finish, setFinish] = useState<(typeof finishOptions)[number]>(
    finishOptions[0],
  );
  const [view, setView] = useState<DesignerView>("3d");
  const [transformMode, setTransformMode] =
    useState<DesignerTransformMode>("translate");
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const totalWidth = useMemo(
    () => modules.reduce((total, item) => total + item.width, 0),
    [modules],
  );
  const selectedModule = useMemo(
    () => modules.find((item) => item.id === selectedModuleId) ?? null,
    [modules, selectedModuleId],
  );
  const selectedCatalogItem = selectedModule
    ? moduleCatalog.find((item) => item.type === selectedModule.type)
    : null;

  const selectTemplate = (template: (typeof templates)[number]) => {
    setRoom(template.room);
    setModules(layoutModules(template.modules, template.room));
    setSelectedModuleId(null);
    setSaved(false);
    track("template_selected", { template: template.id });
  };

  const updateDimension = (key: keyof RoomDimensions, value: number) => {
    setRoom((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const addModule = (type: DesignerModuleType) => {
    const source = moduleCatalog.find((item) => item.type === type)!;
    const offset = Math.min(modules.length, 6) * 120;
    const item = createModule(type, {
      x: Math.min(room.width / 2 - source.width / 2, offset),
      z: Math.min(room.depth / 2 - source.depth / 2, offset),
    });
    setModules((current) => [...current, item]);
    setSelectedModuleId(item.id);
    setTransformMode("translate");
    setSaved(false);
    track("module_added", { type });
  };

  const updateModule = (
    moduleId: string,
    transform: Pick<DesignerModule, "x" | "z" | "rotation">,
  ) => {
    setModules((current) =>
      current.map((item) =>
        item.id === moduleId ? { ...item, ...transform } : item,
      ),
    );
    setSaved(false);
  };

  const updateSelectedValue = (
    key: "x" | "z" | "rotation",
    value: number,
  ) => {
    if (!selectedModule || !Number.isFinite(value)) return;
    setModules((current) =>
      current.map((item) =>
        item.id === selectedModule.id ? { ...item, [key]: value } : item,
      ),
    );
    setSaved(false);
  };

  const removeSelected = () => {
    if (!selectedModuleId) return;
    setModules((current) =>
      current.filter((item) => item.id !== selectedModuleId),
    );
    setSelectedModuleId(null);
    setSaved(false);
  };

  const rotateSelected = () => {
    if (!selectedModule) return;
    updateSelectedValue(
      "rotation",
      Math.round((selectedModule.rotation + 90) % 360),
    );
  };

  const saveLocal = () => {
    localStorage.setItem(
      "mlwk-designer-v1",
      JSON.stringify({ version: 1, room, modules, finish: finish.id }),
    );
    setSaved(true);
    track("design_saved", { moduleCount: modules.length });
  };

  return (
    <section className="designer-page">
      <header className="designer-toolbar">
        <Link to={`/${locale}/`} aria-label="Back to MLWK">
          <ChevronLeft size={19} />
          <strong>MLWK</strong>
        </Link>
        <div>
          <small>{copy.title}</small>
          <strong>{copy.project}</strong>
        </div>
        <div className="designer-toolbar__actions">
          <button
            type="button"
            className={transformMode === "translate" ? "is-active" : ""}
            onClick={() => setTransformMode("translate")}
            title="Move selected module"
            disabled={!selectedModule}
          >
            <Move3D size={18} />
          </button>
          <button
            type="button"
            className={transformMode === "rotate" ? "is-active" : ""}
            onClick={() => setTransformMode("rotate")}
            title="Rotate selected module"
            disabled={!selectedModule}
          >
            <RotateCw size={18} />
          </button>
          <button
            type="button"
            className={view === "plan" ? "is-active" : ""}
            onClick={() => setView("plan")}
            title="Plan view"
          >
            <Grid2X2 size={18} />
          </button>
          <button
            type="button"
            className={view === "3d" ? "is-active" : ""}
            onClick={() => setView("3d")}
            title="3D view"
          >
            <Rotate3D size={18} />
          </button>
          <button
            type="button"
            className="designer-save-button"
            onClick={saveLocal}
          >
            <Save size={17} />
            <span>{saved ? "Saved" : copy.save}</span>
          </button>
          <Link to={`/${locale}/quote?design=local`} className="designer-send">
            <Send size={17} />
            <span>{copy.quote}</span>
          </Link>
        </div>
      </header>

      <div className="designer-workspace">
        <aside className="designer-library">
          <div className="designer-panel-title">
            <Layers3 size={17} />
            <span>{copy.systems}</span>
          </div>
          <div className="designer-module-list">
            {moduleCatalog.map((item) => (
              <button
                type="button"
                key={item.type}
                onClick={() => addModule(item.type)}
                title={`Add ${item.label}`}
              >
                {item.type === "door" ? (
                  <DoorOpen size={19} />
                ) : item.type === "panel" ? (
                  <SquareDashedMousePointer size={19} />
                ) : (
                  <Box size={19} />
                )}
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.width} × {item.height} mm</small>
                </span>
                <Plus size={16} />
              </button>
            ))}
          </div>
        </aside>

        <main className="designer-stage">
          <Suspense
            fallback={
              <div className="designer-loading">
                <span />
                <p>Preparing 3D room</p>
              </div>
            }
          >
            <RoomDesignerCanvas
              room={room}
              modules={modules}
              finishColor={finish.color}
              view={view}
              selectedModuleId={selectedModuleId}
              transformMode={transformMode}
              onSelect={setSelectedModuleId}
              onTransform={updateModule}
            />
          </Suspense>
          <div className="designer-stage__status">
            <span>{modules.length} modules</span>
            <span>{(totalWidth / 1000).toFixed(1)} m configured</span>
            <span>
              {selectedModule
                ? `${selectedCatalogItem?.label ?? "Module"} selected`
                : view === "3d"
                  ? "Perspective"
                  : "Plan"}
            </span>
          </div>
        </main>

        <aside
          className={`designer-inspector ${
            selectedModule ? "has-selection" : ""
          }`}
        >
          <div className="designer-panel-title">
            <SquareDashedMousePointer size={17} />
            <span>{copy.room}</span>
          </div>
          <div className="designer-templates">
            {templates.map((template) => (
              <button
                type="button"
                key={template.id}
                onClick={() => selectTemplate(template)}
              >
                <span />
                {template.label}
              </button>
            ))}
          </div>
          <div className="designer-dimensions">
            {(
              [
                ["width", copy.width, 3000, 8000],
                ["depth", copy.depth, 2600, 6500],
                ["height", copy.height, 2400, 3600],
              ] as const
            ).map(([key, label, min, max]) => (
              <label key={key}>
                <span>
                  {label}
                  <strong>{room[key]} mm</strong>
                </span>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={100}
                  value={room[key]}
                  onChange={(event) =>
                    updateDimension(key, Number(event.target.value))
                  }
                />
              </label>
            ))}
          </div>
          <div className="designer-finish">
            <span>{copy.finishes}</span>
            <div>
              {finishOptions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={finish.id === item.id ? "is-active" : ""}
                  style={{ "--swatch": item.color } as CSSProperties}
                  onClick={() => {
                    setFinish(item);
                    setSaved(false);
                    track("finish_changed", { finish: item.id });
                  }}
                  title={item.label}
                >
                  <i />
                </button>
              ))}
            </div>
            <strong>{finish.label}</strong>
          </div>
          <div className="designer-selection">
            <span>Selected system</span>
            {selectedModule ? (
              <>
                <header>
                  <span>
                    <strong>{selectedCatalogItem?.label}</strong>
                    <small>
                      {selectedModule.width} × {selectedModule.height} mm
                    </small>
                  </span>
                  <button
                    type="button"
                    onClick={removeSelected}
                    aria-label="Delete selected module"
                    title="Delete selected module"
                  >
                    <Trash2 size={15} />
                  </button>
                </header>
                <div className="designer-position-grid">
                  <label>
                    <span>X</span>
                    <input
                      type="number"
                      step="10"
                      value={selectedModule.x}
                      onChange={(event) =>
                        updateSelectedValue("x", Number(event.target.value))
                      }
                    />
                    <small>mm</small>
                  </label>
                  <label>
                    <span>Z</span>
                    <input
                      type="number"
                      step="10"
                      value={selectedModule.z}
                      onChange={(event) =>
                        updateSelectedValue("z", Number(event.target.value))
                      }
                    />
                    <small>mm</small>
                  </label>
                  <label>
                    <span>Angle</span>
                    <input
                      type="number"
                      step="15"
                      value={selectedModule.rotation}
                      onChange={(event) =>
                        updateSelectedValue(
                          "rotation",
                          Number(event.target.value),
                        )
                      }
                    />
                    <small>°</small>
                  </label>
                </div>
                <div className="designer-selection-actions">
                  <button
                    type="button"
                    className={transformMode === "translate" ? "is-active" : ""}
                    onClick={() => setTransformMode("translate")}
                  >
                    <Move3D size={15} />
                    Move
                  </button>
                  <button type="button" onClick={rotateSelected}>
                    <RotateCw size={15} />
                    Rotate 90°
                  </button>
                </div>
              </>
            ) : (
              <div className="designer-selection-empty">
                <p>Select a module in the room to move or rotate it.</p>
                <button
                  type="button"
                  onClick={() => addModule("base")}
                >
                  <Plus size={15} />
                  Add base
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
