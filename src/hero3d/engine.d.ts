export type HeroFrame = { p: number; plot: number; fov: number; surfaces?: number };

export type HeroEngine = {
  setProgress(p: number): void;
  setActive(active: boolean): void;
  redraw(): void;
  destroy(): void;
};

export function mount(options: {
  canvas: HTMLCanvasElement;
  labels: HTMLElement;
  leaders: SVGSVGElement;
  onFrame?: (frame: HeroFrame) => void;
}): Promise<HeroEngine>;
