"""Residence photography from the brand pack (20250221 project folder) -> public/media/brand/r###-*.webp.

Ids are r + the photo's number in the contact sheet (sorted walk of the folder). Output widths match
src/site/photos.ts: landscape 800/1600/2400, portrait 800/1200. Rewrites the residence entries of
src/site/photos.json and keeps factory / team / craft entries.

    python scripts/prepare_residence.py "<path to 20250221广州项目>"
"""
import json, os, sys
from PIL import Image, ImageOps

ROOT = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "public", "media", "brand")
INDEX = os.path.join(HERE, "..", "src", "site", "photos.json")

# group -> (note, picks in display order; the first is the space's lead photo)
SPACES = {
    "living": ("客厅", [109, 116, 108, 110, 113, 111, 112, 107, 114]),
    "kitchen": ("厨房与餐厅", [4, 87, 2, 103, 80, 97, 81, 88, 71, 84, 82, 74, 78, 6, 96, 98, 99, 92]),
    "tearoom": ("茶室", [119, 120, 139, 141, 122, 126, 131, 136, 134, 129, 132, 135]),
    "bedroom": ("主卧与衣帽间", [40, 41, 21, 22, 27, 26, 43, 34, 35, 30, 37, 24, 25, 44, 31, 38, 23]),
    "children": ("儿童房", [57, 54, 51, 49, 56, 53, 52, 50]),
    "bathroom": ("卫生间", [68, 61, 67, 60, 63, 66, 64]),
    "entry": ("玄关与过道", [3, 9, 7, 106, 115, 8, 16, 15, 0, 1, 105, 18]),
}
OLD_RESIDENCE = {"living", "dining", "entry", "bedroom", "study", "children", "balcony"}


def files():
    out = []
    for d, _, fs in os.walk(ROOT):
        for f in fs:
            if f.lower().endswith((".jpg", ".jpeg")):
                out.append(os.path.join(d, f))
    return sorted(out)


def main():
    all_files = files()
    os.makedirs(OUT, exist_ok=True)
    entries = []
    for group, (note, picks) in SPACES.items():
        for n in picks:
            pid = f"r{n:03d}"
            im = ImageOps.exif_transpose(Image.open(all_files[n])).convert("RGB")
            landscape = im.width > im.height
            for w in ([800, 1600, 2400] if landscape else [800, 1200]):
                h = round(im.height * w / im.width)
                im.resize((w, h), Image.LANCZOS).save(os.path.join(OUT, f"{pid}-{w}.webp"), "WEBP", quality=82, method=6)
            entries.append({"id": pid, "group": group, "landscape": landscape, "w": im.width, "h": im.height, "note": note})
            print(pid, group, im.size)
    kept = [p for p in json.load(open(INDEX, encoding="utf-8")) if p["group"] not in OLD_RESIDENCE and not p["id"].startswith("r")]
    json.dump(entries + kept, open(INDEX, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
