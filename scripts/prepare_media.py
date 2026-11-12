"""Copy and resize brand-pack photography into public/media/brand/.

Usage:  python -I scripts/prepare_media.py "<path to CIRMANO brand pack root>"

Reads 09_目录与核验/照片属性与用途.csv to locate each photo id, then writes
<id>-<width>.webp for every width in WIDTHS (never upscales). Add ids to PHOTOS
as pages need them; keep the brand-pack id in the filename so every image on the
site traces back to its source and usage note.
"""
import csv
import json
import sys
from pathlib import Path

from PIL import Image

# Every photo in the brand pack's register (09_目录与核验/照片属性与用途.csv): project, factory, team, craft.
PHOTOS = None
LANDSCAPE_WIDTHS = [800, 1600, 2400]
PORTRAIT_WIDTHS = [800, 1200]
QUALITY = 80


def main() -> None:
    pack = Path(sys.argv[1])
    out = Path(__file__).resolve().parent.parent / "public" / "media" / "brand"
    out.mkdir(parents=True, exist_ok=True)
    with open(pack / "09_目录与核验" / "照片属性与用途.csv", encoding="utf-8-sig") as f:
        rows = {row["id"]: row for row in csv.DictReader(f)}
    write_index(rows)
    for pid in PHOTOS or list(rows):
        src = pack / rows[pid]["web"]
        with Image.open(src) as im:
            im = im.convert("RGB")
            for w in (LANDSCAPE_WIDTHS if im.width >= im.height else PORTRAIT_WIDTHS):
                if im.width < w:
                    continue
                h = round(im.height * w / im.width)
                target = out / f"{pid.lower()}-{w}.webp"
                if target.exists():
                    continue
                im.resize((w, h), Image.LANCZOS).save(target, "WEBP", quality=QUALITY, method=6)
                print(f"{target.name}  {w}x{h}  {target.stat().st_size // 1024} KB")


GROUPS = {
    "客厅与展示柜": "living", "餐厅与餐边柜": "dining", "玄关与收纳": "entry", "主卧与衣帽间": "bedroom",
    "书房": "study", "儿童房与学习区": "children", "阳台柜": "balcony",
    "设备与车间": "factory", "团队工作场景": "team",
}


def write_index(rows: dict) -> None:
    """src/site/photos.json: id, group, orientation, widths. Groups follow the brand-pack folders."""
    index = []
    for pid, row in rows.items():
        w, h = int(row["width"]), int(row["height"])
        group = GROUPS.get(row["title"], "craft")
        index.append({"id": pid.lower(), "group": group, "landscape": w >= h, "w": w, "h": h, "note": row["title"]})
    out = Path(__file__).resolve().parent.parent / "src" / "site" / "photos.json"
    out.write_text(json.dumps(index, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"photos.json: {len(index)} photos")


if __name__ == "__main__":
    main()
