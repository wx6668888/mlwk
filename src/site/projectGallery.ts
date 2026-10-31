// Guangzhou Residence photography by space. One completed project, never split into separate cases.
// Ids are brand-pack photo ids (09_目录与核验/照片属性与用途.csv); files come from scripts/prepare_media.py.
export type GalleryPhoto = { id: string; landscape: boolean };

export const projectGallery: Record<string, GalleryPhoto[]> = {
  living: [{ id: "p179", landscape: true }, { id: "p180", landscape: false }, { id: "p183", landscape: false }],
  dining: [{ id: "p234", landscape: true }, { id: "p230", landscape: false }, { id: "p243", landscape: false }],
  entry: [{ id: "p208", landscape: true }, { id: "p206", landscape: false }, { id: "p216", landscape: false }],
  bedroom: [{ id: "p108", landscape: true }, { id: "p092", landscape: false }, { id: "p099", landscape: false }],
  study: [{ id: "p115", landscape: false }, { id: "p112", landscape: false }, { id: "p118", landscape: false }],
  children: [{ id: "p122", landscape: true }, { id: "p148", landscape: false }, { id: "p131", landscape: false }],
  balcony: [{ id: "p220", landscape: false }, { id: "p222", landscape: false }, { id: "p223", landscape: false }],
};

export const photo = (id: string, width: 800 | 1600 | 2400 = 800) => `/media/brand/${id}-${width}.webp`;
export const photoSrcSet = (id: string, landscape: boolean) =>
  landscape ? `${photo(id, 800)} 800w, ${photo(id, 1600)} 1600w, ${photo(id, 2400)} 2400w` : `${photo(id, 800)} 800w`;
