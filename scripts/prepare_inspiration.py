"""Build the "Inspiration projects" gallery from the internal reference folder.

Usage:  python -I scripts/prepare_inspiration.py "G:/cirmano/素材/07_参考_仅内部"

These are reference projects by other studios, NOT CIRMANO work. The site labels every image
"灵感项目 · Inspiration" and states that on the pages; this data is for the preview site only.

Writes public/media/inspiration/<slug>/NN-{800,1600}.webp and src/site/inspiration.json.
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "media" / "inspiration"
DATA = ROOT / "src" / "site" / "inspiration.json"
PER_PROJECT = 12
WIDTHS = (800, 1600)

CATEGORIES = {
    "01_意式极简客厅": "living",
    "02_一门到顶衣柜": "wardrobes",
    "03_木饰面上墙": "panels",
}

# Chinese-named projects: stable slugs and English titles.
NAMED = {
    "听松风处": ("listening-to-the-pines", "Listening to the Pines"),
    "无界乐园": ("boundless-garden", "Boundless Garden"),
    "法式复古风与度假生活的方式": ("french-vintage-retreat", "French Vintage Retreat"),
    "琥珀": ("amber", "Amber"),
    "素净清风，光景无声": ("quiet-breeze-silent-light", "Quiet Breeze, Silent Light"),
}


def names(folder: str) -> tuple[str, str]:
    if folder in NAMED:
        return NAMED[folder]
    en = folder.replace(" 住宅", " Residence").replace(" 公寓", " Apartment").strip()
    slug = "".join(c.lower() if c.isalnum() else "-" for c in en)
    return "-".join(p for p in slug.split("-") if p), en


def pick(files: list[Path], n: int) -> list[Path]:
    if len(files) <= n:
        return files
    step = (len(files) - 1) / (n - 1)
    return [files[round(i * step)] for i in range(n)]


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")
    src = Path(sys.argv[1])
    tags: dict[str, list[str]] = {}
    for folder, tag in CATEGORIES.items():
        for project in (src / folder).iterdir():
            if project.is_dir():
                tags.setdefault(project.name, []).append(tag)

    projects = []
    for project in sorted((src / "住宅").iterdir(), key=lambda p: p.name):
        if not project.is_dir():
            continue
        slug, en = names(project.name)
        files = sorted(p for p in project.iterdir() if p.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp"))
        out = OUT / slug
        out.mkdir(parents=True, exist_ok=True)
        images = []
        for i, f in enumerate(pick(files, PER_PROJECT), start=1):
            with Image.open(f) as im:
                im = ImageOps.exif_transpose(im).convert("RGB")
                for w in WIDTHS:
                    if im.width < w and w != WIDTHS[0]:
                        continue
                    h = round(im.height * min(w, im.width) / im.width)
                    im.resize((min(w, im.width), h), Image.LANCZOS).save(out / f"{i:02d}-{w}.webp", "WEBP", quality=78, method=6)
                images.append({"n": i, "w": im.width, "h": im.height, "landscape": im.width >= im.height})
        projects.append({"slug": slug, "name": project.name, "en": en, "tags": tags.get(project.name, []), "count": len(files), "images": images})
        print(f"{slug:32s} {len(images):2d} images  tags={tags.get(project.name, [])}")

    DATA.write_text(json.dumps(projects, ensure_ascii=False, indent=1), encoding="utf-8")
    total = sum(p.stat().st_size for p in OUT.rglob("*.webp"))
    print(f"{len(projects)} projects, {total / 1e6:.1f} MB -> {DATA.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
