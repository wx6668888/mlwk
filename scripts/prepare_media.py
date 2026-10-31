"""Copy and resize brand-pack photography into public/media/brand/.

Usage:  python -I scripts/prepare_media.py "<path to CIRMANO brand pack root>"

Reads 09_目录与核验/照片属性与用途.csv to locate each photo id, then writes
<id>-<width>.webp for every width in WIDTHS (never upscales). Add ids to PHOTOS
as pages need them; keep the brand-pack id in the filename so every image on the
site traces back to its source and usage note.
"""
import csv
import sys
from pathlib import Path

from PIL import Image

PHOTOS = [
    # menu previews and product cards
    "P099", "P227", "P088", "P180", "P235",
    # hero + home
    "P175", "P179", "P234",
    # manufacturing
    "M07", "F013", "M01", "F008",
    # Guangzhou Residence, seven spaces
    "P183", "P230", "P243", "P208", "P206", "P216", "P108", "P092",
    "P115", "P112", "P118", "P122", "P148", "P131", "P220", "P222", "P223",
    # details
    "P184", "P169",
]
WIDTHS = [800, 1600, 2400]
QUALITY = 80


def main() -> None:
    pack = Path(sys.argv[1])
    out = Path(__file__).resolve().parent.parent / "public" / "media" / "brand"
    out.mkdir(parents=True, exist_ok=True)
    with open(pack / "09_目录与核验" / "照片属性与用途.csv", encoding="utf-8-sig") as f:
        rows = {row["id"]: row for row in csv.DictReader(f)}
    for pid in PHOTOS:
        src = pack / rows[pid]["web"]
        with Image.open(src) as im:
            im = im.convert("RGB")
            for w in WIDTHS:
                if im.width < w:
                    continue
                h = round(im.height * w / im.width)
                target = out / f"{pid.lower()}-{w}.webp"
                im.resize((w, h), Image.LANCZOS).save(target, "WEBP", quality=QUALITY, method=6)
                print(f"{target.name}  {w}x{h}  {target.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
