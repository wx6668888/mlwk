// Guangzhou Residence photography by space. One completed project, never split into separate cases.
// Ids are r + the photo's number in the brand-pack project folder; files come from scripts/prepare_residence.py.
export type GalleryPhoto = { id: string; landscape: boolean };

export const projectGallery: Record<string, GalleryPhoto[]> = {
  living: [{ id: "r109", landscape: true }, { id: "r116", landscape: false }, { id: "r111", landscape: false }],
  kitchen: [{ id: "r004", landscape: true }, { id: "r080", landscape: false }, { id: "r081", landscape: false }],
  tearoom: [{ id: "r120", landscape: true }, { id: "r141", landscape: false }, { id: "r131", landscape: false }],
  bedroom: [{ id: "r040", landscape: true }, { id: "r021", landscape: false }, { id: "r027", landscape: false }],
  children: [{ id: "r057", landscape: false }, { id: "r054", landscape: false }, { id: "r056", landscape: false }],
  bathroom: [{ id: "r068", landscape: false }, { id: "r061", landscape: false }, { id: "r063", landscape: false }],
  entry: [{ id: "r003", landscape: true }, { id: "r009", landscape: false }, { id: "r016", landscape: false }],
};

export const photo = (id: string, width: 800 | 1600 | 2400 = 800) => `/media/brand/${id}-${width}.webp`;
export const photoSrcSet = (id: string, landscape: boolean) =>
  landscape ? `${photo(id, 800)} 800w, ${photo(id, 1600)} 1600w, ${photo(id, 2400)} 2400w` : `${photo(id, 800)} 800w`;
