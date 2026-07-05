import {
  AlertTriangle,
  AlignEndHorizontal,
  Box,
  Check,
  ChevronDown,
  ChevronLeft,
  Copy,
  DoorOpen,
  Focus,
  Grid2X2,
  Layers3,
  Magnet,
  Move3D,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Redo2,
  Rotate3D,
  RotateCw,
  Save,
  Send,
  SlidersHorizontal,
  SquareDashedMousePointer,
  Trash2,
  Undo2,
} from "lucide-react";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Link } from "react-router-dom";
import type { Locale } from "../content";
import {
  createDraftId,
  findCollidingModuleIds,
  getDefaultCamera,
  makeDesignerDraft,
  readDesignerDraft,
  writeDesignerDraft,
  type DesignerSceneState,
} from "../designer/state";
import {
  finishOptions,
  moduleCatalog,
  type CameraState,
  type DesignerModule,
  type DesignerModuleType,
  type DesignerTransformMode,
  type DesignerView,
  type RoomDimensions,
} from "../designer/types";
import { track } from "../lib/analytics";

const RoomDesignerCanvas = lazy(
  () => import("../components/RoomDesignerCanvas"),
);

type LibraryCategory = "cabinetry" | "architecture";
type SaveStatus = "dirty" | "saving" | "saved";

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
    saved: string;
    saving: string;
    unsaved: string;
    empty: string;
    cabinetry: string;
    architecture: string;
    selected: string;
    selectHint: string;
    addBase: string;
    duplicate: string;
    align: string;
    collision: string;
    configured: string;
    modules: string;
    roomSettings: string;
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
    saved: "Saved",
    saving: "Saving",
    unsaved: "Unsaved changes",
    empty: "Add a system to begin",
    cabinetry: "Cabinetry",
    architecture: "Architecture",
    selected: "Selected system",
    selectHint: "Select a module in the room to move or rotate it.",
    addBase: "Add base",
    duplicate: "Duplicate",
    align: "Align to wall",
    collision: "overlapping modules",
    configured: "configured",
    modules: "modules",
    roomSettings: "Room settings",
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
    save: "保存到本地",
    saved: "已保存",
    saving: "正在保存",
    unsaved: "有未保存修改",
    empty: "添加一个产品系统开始设计",
    cabinetry: "柜体",
    architecture: "建筑构件",
    selected: "已选系统",
    selectHint: "选择空间中的模块进行移动或旋转。",
    addBase: "添加地柜",
    duplicate: "复制",
    align: "靠墙对齐",
    collision: "个模块发生重叠",
    configured: "已配置",
    modules: "个模块",
    roomSettings: "空间设置",
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
    saved: "تم الحفظ",
    saving: "جارٍ الحفظ",
    unsaved: "تغييرات غير محفوظة",
    empty: "أضف نظاماً للبدء",
    cabinetry: "الخزائن",
    architecture: "العناصر المعمارية",
    selected: "النظام المحدد",
    selectHint: "حدد وحدة في الغرفة لتحريكها أو تدويرها.",
    addBase: "إضافة خزانة",
    duplicate: "تكرار",
    align: "محاذاة للجدار",
    collision: "وحدات متداخلة",
    configured: "مجهز",
    modules: "وحدات",
    roomSettings: "إعدادات الغرفة",
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
    saved: "Gespeichert",
    saving: "Speichern",
    unsaved: "Nicht gespeichert",
    empty: "System hinzufügen",
    cabinetry: "Schränke",
    architecture: "Architektur",
    selected: "Ausgewähltes System",
    selectHint: "Wählen Sie ein Modul zum Verschieben oder Drehen.",
    addBase: "Unterschrank",
    duplicate: "Duplizieren",
    align: "An Wand ausrichten",
    collision: "überlappende Module",
    configured: "konfiguriert",
    modules: "Module",
    roomSettings: "Raumeinstellungen",
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
    saved: "Enregistré",
    saving: "Enregistrement",
    unsaved: "Modifications non enregistrées",
    empty: "Ajoutez un système",
    cabinetry: "Agencements",
    architecture: "Architecture",
    selected: "Système sélectionné",
    selectHint: "Sélectionnez un module pour le déplacer ou le faire pivoter.",
    addBase: "Ajouter un meuble",
    duplicate: "Dupliquer",
    align: "Aligner au mur",
    collision: "modules superposés",
    configured: "configuré",
    modules: "modules",
    roomSettings: "Réglages de la pièce",
  },
};

const templates: Array<{
  id: string;
  label: Record<Locale, string>;
  room: RoomDimensions;
  modules: DesignerModuleType[];
}> = [
  {
    id: "kitchen-wall",
    label: {
      en: "Single wall",
      zh: "一字型厨房",
      ar: "جدار واحد",
      de: "Einzeilige Küche",
      fr: "Cuisine linéaire",
    },
    room: { width: 4800, depth: 3800, height: 2800 },
    modules: ["tall", "base", "base", "base", "wall", "wall"],
  },
  {
    id: "wardrobe-suite",
    label: {
      en: "Wardrobe suite",
      zh: "衣帽间",
      ar: "غرفة ملابس",
      de: "Ankleide",
      fr: "Dressing",
    },
    room: { width: 4200, depth: 3600, height: 2800 },
    modules: ["wardrobe", "wardrobe", "wardrobe", "panel"],
  },
  {
    id: "open-living",
    label: {
      en: "Open living",
      zh: "开放客厅",
      ar: "معيشة مفتوحة",
      de: "Offener Wohnraum",
      fr: "Séjour ouvert",
    },
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

function defaultScene(): DesignerSceneState {
  const initial = templates[0];
  return {
    room: initial.room,
    modules: layoutModules(initial.modules, initial.room),
    finishId: finishOptions[0].id,
  };
}

export default function DesignerPage({ locale }: { locale: Locale }) {
  const copy = labels[locale];
  const [scene, setScene] = useState<DesignerSceneState>(defaultScene);
  const sceneRef = useRef(scene);
  const [past, setPast] = useState<DesignerSceneState[]>([]);
  const [future, setFuture] = useState<DesignerSceneState[]>([]);
  const [view, setView] = useState<DesignerView>("3d");
  const [camera, setCamera] = useState<CameraState>(getDefaultCamera("3d"));
  const cameraRef = useRef(camera);
  const [cameraResetKey, setCameraResetKey] = useState(0);
  const [transformMode, setTransformMode] =
    useState<DesignerTransformMode>("translate");
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [libraryCollapsed, setLibraryCollapsed] = useState(false);
  const [inspectorCollapsed, setInspectorCollapsed] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [category, setCategory] = useState<LibraryCategory>("cabinetry");
  const draftIdRef = useRef("");
  const restoredRef = useRef(false);

  const { room, modules, finishId } = scene;
  const finish =
    finishOptions.find((item) => item.id === finishId) ?? finishOptions[0];
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
  const collisionIds = useMemo(
    () => findCollidingModuleIds(modules),
    [modules],
  );
  const visibleCatalog = moduleCatalog.filter((item) =>
    category === "cabinetry"
      ? !["panel", "door"].includes(item.type)
      : ["panel", "door"].includes(item.type),
  );

  useEffect(() => {
    sceneRef.current = scene;
  }, [scene]);

  useEffect(() => {
    cameraRef.current = camera;
  }, [camera]);

  useEffect(() => {
    const restored = readDesignerDraft();
    if (restored) {
      const restoredScene = {
        room: restored.room,
        modules: restored.modules,
        finishId: restored.finish,
      };
      sceneRef.current = restoredScene;
      cameraRef.current = restored.camera;
      setScene(restoredScene);
      setCamera(restored.camera);
      setView(restored.camera.view);
      setCameraResetKey((value) => value + 1);
      draftIdRef.current = restored.id;
    } else {
      draftIdRef.current = createDraftId();
    }
    restoredRef.current = true;
    setSaveStatus("saved");
  }, []);

  const commitScene = useCallback(
    (
      update:
        | DesignerSceneState
        | ((current: DesignerSceneState) => DesignerSceneState),
    ) => {
      const current = sceneRef.current;
      const next = typeof update === "function" ? update(current) : update;
      if (next === current) return;
      setPast((items) => [...items, current].slice(-50));
      setFuture([]);
      sceneRef.current = next;
      setScene(next);
      setSaveStatus("dirty");
    },
    [],
  );

  const saveNow = useCallback((trackSave = true) => {
    if (!draftIdRef.current) draftIdRef.current = createDraftId();
    writeDesignerDraft(
      makeDesignerDraft(
        draftIdRef.current,
        sceneRef.current,
        cameraRef.current,
      ),
    );
    setSaveStatus("saved");
    if (trackSave) {
      track("design_saved", {
        moduleCount: sceneRef.current.modules.length,
      });
    }
  }, []);

  useEffect(() => {
    if (!restoredRef.current || saveStatus === "saved") return;
    setSaveStatus("saving");
    const timer = window.setTimeout(() => saveNow(false), 650);
    return () => window.clearTimeout(timer);
  }, [camera, saveNow, saveStatus, scene]);

  const undo = useCallback(() => {
    setPast((items) => {
      const previous = items.at(-1);
      if (!previous) return items;
      setFuture((nextItems) => [sceneRef.current, ...nextItems].slice(0, 50));
      sceneRef.current = previous;
      setScene(previous);
      setSelectedModuleId(null);
      setSaveStatus("dirty");
      return items.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((items) => {
      const next = items[0];
      if (!next) return items;
      setPast((previousItems) =>
        [...previousItems, sceneRef.current].slice(-50),
      );
      sceneRef.current = next;
      setScene(next);
      setSelectedModuleId(null);
      setSaveStatus("dirty");
      return items.slice(1);
    });
  }, []);

  const selectTemplate = (template: (typeof templates)[number]) => {
    commitScene({
      room: template.room,
      modules: layoutModules(template.modules, template.room),
      finishId,
    });
    setSelectedModuleId(null);
    track("template_selected", { template: template.id });
  };

  const updateDimension = (key: keyof RoomDimensions, value: number) => {
    commitScene((current) => ({
      ...current,
      room: { ...current.room, [key]: value },
    }));
  };

  const addModule = (type: DesignerModuleType) => {
    const source = moduleCatalog.find((item) => item.type === type)!;
    const offset = Math.min(modules.length, 6) * 120;
    const item = createModule(type, {
      x: Math.min(room.width / 2 - source.width / 2, offset),
      z: Math.min(room.depth / 2 - source.depth / 2, offset),
    });
    commitScene((current) => ({
      ...current,
      modules: [...current.modules, item],
    }));
    setSelectedModuleId(item.id);
    setTransformMode("translate");
    setInspectorOpen(true);
    track("module_added", { type });
  };

  const updateModule = (
    moduleId: string,
    transform: Pick<DesignerModule, "x" | "z" | "rotation">,
  ) => {
    commitScene((current) => ({
      ...current,
      modules: current.modules.map((item) =>
        item.id === moduleId ? { ...item, ...transform } : item,
      ),
    }));
  };

  const updateSelectedValue = (
    key: "x" | "z" | "rotation",
    value: number,
  ) => {
    if (!selectedModule || !Number.isFinite(value)) return;
    commitScene((current) => ({
      ...current,
      modules: current.modules.map((item) =>
        item.id === selectedModule.id ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const removeSelected = useCallback(() => {
    if (!selectedModuleId) return;
    commitScene((current) => ({
      ...current,
      modules: current.modules.filter((item) => item.id !== selectedModuleId),
    }));
    setSelectedModuleId(null);
  }, [commitScene, selectedModuleId]);

  const duplicateSelected = useCallback(() => {
    const selected = sceneRef.current.modules.find(
      (item) => item.id === selectedModuleId,
    );
    if (!selected) return;
    const duplicate = {
      ...selected,
      id: crypto.randomUUID(),
      x: selected.x + 120,
      z: selected.z + 120,
    };
    commitScene((current) => ({
      ...current,
      modules: [...current.modules, duplicate],
    }));
    setSelectedModuleId(duplicate.id);
  }, [commitScene, selectedModuleId]);

  const rotateSelected = () => {
    if (!selectedModule) return;
    updateSelectedValue(
      "rotation",
      Math.round((selectedModule.rotation + 90) % 360),
    );
  };

  const alignSelected = () => {
    if (!selectedModule) return;
    updateModule(selectedModule.id, {
      x: selectedModule.x,
      z: -room.depth / 2 + selectedModule.depth / 2 + 18,
      rotation: 0,
    });
  };

  const changeView = (next: DesignerView) => {
    setView(next);
    const nextCamera = getDefaultCamera(next);
    cameraRef.current = nextCamera;
    setCamera(nextCamera);
    setCameraResetKey((value) => value + 1);
    setSaveStatus("dirty");
  };

  const resetCamera = () => {
    const nextCamera = getDefaultCamera(view);
    cameraRef.current = nextCamera;
    setCamera(nextCamera);
    setCameraResetKey((value) => value + 1);
  };

  const selectModule = (moduleId: string | null) => {
    setSelectedModuleId(moduleId);
    if (moduleId) setInspectorOpen(true);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const editing = ["INPUT", "TEXTAREA", "SELECT"].includes(
        target?.tagName ?? "",
      );
      const command = event.metaKey || event.ctrlKey;

      if (command && event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveNow();
      } else if (command && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      } else if (command && event.key.toLowerCase() === "d" && !editing) {
        event.preventDefault();
        duplicateSelected();
      } else if (!editing && (event.key === "Delete" || event.key === "Backspace")) {
        event.preventDefault();
        removeSelected();
      } else if (event.key === "Escape") {
        setSelectedModuleId(null);
        setInspectorOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [duplicateSelected, redo, removeSelected, saveNow, undo]);

  const saveLabel =
    saveStatus === "saved"
      ? copy.saved
      : saveStatus === "saving"
        ? copy.saving
        : copy.unsaved;

  return (
    <section className="designer-page">
      <h1 className="visually-hidden">{copy.title}</h1>
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
            onClick={undo}
            disabled={past.length === 0}
            title="Undo"
            aria-label="Undo"
          >
            <Undo2 size={18} />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={future.length === 0}
            title="Redo"
            aria-label="Redo"
          >
            <Redo2 size={18} />
          </button>
          <button
            type="button"
            className={`designer-desktop-action ${
              transformMode === "translate" ? "is-active" : ""
            }`}
            onClick={() => setTransformMode("translate")}
            title="Move selected module"
            disabled={!selectedModule}
          >
            <Move3D size={18} />
          </button>
          <button
            type="button"
            className={`designer-desktop-action ${
              transformMode === "rotate" ? "is-active" : ""
            }`}
            onClick={() => setTransformMode("rotate")}
            title="Rotate selected module"
            disabled={!selectedModule}
          >
            <RotateCw size={18} />
          </button>
          <button
            type="button"
            className={view === "plan" ? "is-active" : ""}
            onClick={() => changeView("plan")}
            title="Plan view"
            aria-label="Plan view"
          >
            <Grid2X2 size={18} />
          </button>
          <button
            type="button"
            className={view === "3d" ? "is-active" : ""}
            onClick={() => changeView("3d")}
            title="3D view"
            aria-label="3D view"
          >
            <Rotate3D size={18} />
          </button>
          <button
            type="button"
            className="designer-desktop-action"
            onClick={resetCamera}
            title="Reset camera"
            aria-label="Reset camera"
          >
            <Focus size={18} />
          </button>
          <button
            type="button"
            className="designer-save-button"
            onClick={() => saveNow()}
            title={saveLabel}
          >
            {saveStatus === "saved" ? <Check size={17} /> : <Save size={17} />}
            <span>{saveLabel}</span>
          </button>
          <Link
            to={`/${locale}/quote?design=${encodeURIComponent(
              draftIdRef.current || "local",
            )}`}
            className="designer-send"
            onClick={() => saveNow(false)}
          >
            <Send size={17} />
            <span>{copy.quote}</span>
          </Link>
        </div>
      </header>

      <div
        className={`designer-workspace ${
          libraryCollapsed ? "library-collapsed" : ""
        } ${inspectorCollapsed ? "inspector-collapsed" : ""}`}
      >
        <aside className="designer-library">
          <div className="designer-panel-title">
            <Layers3 size={17} />
            <span>{copy.systems}</span>
            <button
              type="button"
              onClick={() => setLibraryCollapsed((value) => !value)}
              aria-label={libraryCollapsed ? "Expand library" : "Collapse library"}
            >
              {libraryCollapsed ? (
                <PanelLeftOpen size={16} />
              ) : (
                <PanelLeftClose size={16} />
              )}
            </button>
          </div>
          <div className="designer-library-tabs" role="tablist">
            <button
              type="button"
              className={category === "cabinetry" ? "is-active" : ""}
              onClick={() => setCategory("cabinetry")}
              role="tab"
              aria-selected={category === "cabinetry"}
            >
              {copy.cabinetry}
            </button>
            <button
              type="button"
              className={category === "architecture" ? "is-active" : ""}
              onClick={() => setCategory("architecture")}
              role="tab"
              aria-selected={category === "architecture"}
            >
              {copy.architecture}
            </button>
          </div>
          <div className="designer-module-list">
            {visibleCatalog.map((item) => (
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
                  <small>
                    {item.width} × {item.height} mm
                  </small>
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
              collisionIds={collisionIds}
              transformMode={transformMode}
              snapEnabled={snapEnabled}
              cameraState={camera}
              cameraResetKey={cameraResetKey}
              onCameraChange={(next) => {
                cameraRef.current = next;
                setCamera(next);
                setSaveStatus("dirty");
              }}
              onSelect={selectModule}
              onTransform={updateModule}
            />
          </Suspense>
          <button
            type="button"
            className="designer-inspector-toggle"
            onClick={() => setInspectorOpen(true)}
          >
            <SlidersHorizontal size={16} />
            {copy.roomSettings}
          </button>
          <div className="designer-stage__status">
            <span>
              {modules.length} {copy.modules}
            </span>
            <span>
              {(totalWidth / 1000).toFixed(1)} m {copy.configured}
            </span>
            {collisionIds.size > 0 ? (
              <span className="is-warning">
                <AlertTriangle size={12} />
                {collisionIds.size} {copy.collision}
              </span>
            ) : (
              <span>{view === "3d" ? "Perspective" : "Plan"}</span>
            )}
          </div>
        </main>

        <aside
          className={`designer-inspector ${
            selectedModule ? "has-selection" : ""
          } ${inspectorOpen ? "is-open" : ""}`}
        >
          <button
            className="designer-sheet-handle"
            type="button"
            onClick={() => setInspectorOpen(false)}
            aria-label="Close room settings"
          >
            <ChevronDown size={18} />
          </button>
          <div className="designer-panel-title">
            <SquareDashedMousePointer size={17} />
            <span>{copy.room}</span>
            <button
              type="button"
              onClick={() => setInspectorCollapsed((value) => !value)}
              aria-label={
                inspectorCollapsed ? "Expand inspector" : "Collapse inspector"
              }
            >
              {inspectorCollapsed ? (
                <PanelRightOpen size={16} />
              ) : (
                <PanelRightClose size={16} />
              )}
            </button>
          </div>
          <div className="designer-templates">
            {templates.map((template) => (
              <button
                type="button"
                key={template.id}
                onClick={() => selectTemplate(template)}
              >
                <span />
                {template.label[locale]}
              </button>
            ))}
          </div>
          <div className="designer-snap-row">
            <span>
              <Magnet size={15} />
              Grid and wall snap
            </span>
            <button
              type="button"
              className={snapEnabled ? "is-active" : ""}
              onClick={() => setSnapEnabled((value) => !value)}
              role="switch"
              aria-checked={snapEnabled}
            >
              <i />
            </button>
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
                    commitScene((current) => ({
                      ...current,
                      finishId: item.id,
                    }));
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
            <span>{copy.selected}</span>
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
                  <button type="button" onClick={duplicateSelected}>
                    <Copy size={15} />
                    {copy.duplicate}
                  </button>
                  <button type="button" onClick={alignSelected}>
                    <AlignEndHorizontal size={15} />
                    {copy.align}
                  </button>
                </div>
              </>
            ) : (
              <div className="designer-selection-empty">
                <p>{copy.selectHint}</p>
                <button type="button" onClick={() => addModule("base")}>
                  <Plus size={15} />
                  {copy.addBase}
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
