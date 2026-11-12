import index from "./photos.json";

// Brand-pack photography index (scripts/prepare_media.py). Groups follow the pack's folders:
// living, dining, entry, bedroom (+dressing), study, children, balcony = Guangzhou Residence; factory, team, craft = Foshan.
export type Photo = { id: string; group: string; landscape: boolean; w: number; h: number; note: string };
export const photos = index as Photo[];

export const byId = (id: string) => photos.find((p) => p.id === id.toLowerCase());
export const byGroup = (...groups: string[]) => photos.filter((p) => groups.includes(p.group));
export const pick = (...ids: string[]) => ids.map((id) => byId(id)).filter((p): p is Photo => !!p);

/** Largest generated width for the orientation, or a requested one. */
export function src(p: Photo | string, size: "s" | "m" | "l" = "m") {
  // Absolute paths (site-specific images such as the service-page set) are used as they are.
  if (typeof p === "string" && p.startsWith("/")) return p;
  const photo = typeof p === "string" ? byId(p) : p;
  const id = typeof p === "string" ? p.toLowerCase() : p.id;
  const landscape = photo?.landscape ?? true;
  const w = landscape ? { s: 800, m: 1600, l: 2400 }[size] : { s: 800, m: 1200, l: 1200 }[size];
  return `/media/brand/${id}-${w}.webp`;
}

export const srcSet = (p: Photo) =>
  p.landscape
    ? `/media/brand/${p.id}-800.webp 800w, /media/brand/${p.id}-1600.webp 1600w, /media/brand/${p.id}-2400.webp 2400w`
    : `/media/brand/${p.id}-800.webp 800w, /media/brand/${p.id}-1200.webp 1200w`;
