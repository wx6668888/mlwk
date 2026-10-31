"""Transcode brand-pack video into web-ready files under public/media/video/.

Usage:  python -I scripts/prepare_video.py "<path to CIRMANO brand pack root>"

Rules (docs/design-system.md §7.2):
- K-prefixed clips are AI-assisted motion from real photos; the site captions them.
  K10, K12, K18 are excluded by the brand pack QC; K13 is wipe-only and unused.
- Silent loops: H.264 mp4, no audio, faststart. Poster = first frame as webp.
- Vertical reels keep their CC BY 4.0 music; the site shows the credit beside them.
- Every output must stay well under the 25 MB Cloudflare Pages file limit.
"""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "media" / "video"

KLING = "10_宣传片制作/kling_raw"
FACTORY = "06_视频/02_工厂横屏无声片段"
REELS = "06_视频/01_实拍竖屏"

# name: (source, width, crf)
LOOPS = {
    "k01-p179-hero-1920": (f"{KLING}/K01_P179_hero.mp4", 1920, 26),
    "k01-p179-hero-960": (f"{KLING}/K01_P179_hero.mp4", 960, 28),
    "k05-p184-curve": (f"{KLING}/K05_P184_curve.mp4", 720, 28),
    "k16-p230-texture": (f"{KLING}/K16_P230_texture.mp4", 720, 28),
    "k07-p183-hardware": (f"{KLING}/K07_P183_hardware.mp4", 720, 28),
    "k06-p180-glass": (f"{KLING}/K06_P180_glass.mp4", 720, 28),
}

# Manufacturing film: real factory footage first, then two AI-assisted shots, 0.6 s dissolves (EDL v03).
FILM = [f"{FACTORY}/Factory_08a.mp4", f"{FACTORY}/Factory_08b.mp4", f"{KLING}/K09_M07_homag.mp4", f"{KLING}/K17_F013_edgebander.mp4"]

REEL_FILES = {
    "reel-storage": f"{REELS}/CIRMANO_Storage_INS_1080x1920_v05.mp4",
    "reel-glass-detail": f"{REELS}/CIRMANO_GlassDetail_INS_1080x1920_v01.mp4",
    "reel-window": f"{REELS}/CIRMANO_Window_INS_1080x1920_v01.mp4",
    "reel-wall-panel-detail": f"{REELS}/CIRMANO_WallPanelDetail_INS_1080x1920_v01.mp4",
}

H264 = ["-c:v", "libx264", "-preset", "slow", "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart"]


def run(args: list[str]) -> None:
    subprocess.run(["ffmpeg", "-y", "-v", "error", *args], check=True)


def poster(src: Path, name: str, width: int, at: float = 0.0) -> None:
    run(["-ss", str(at), "-i", str(src), "-frames:v", "1", "-vf", f"scale={width}:-2", "-c:v", "libwebp", "-quality", "80", str(OUT / f"{name}.webp")])


def report(name: str) -> None:
    for ext in ("mp4", "webp"):
        p = OUT / f"{name}.{ext}"
        if p.exists():
            print(f"{p.name:34s} {p.stat().st_size / 1e6:6.2f} MB")


def duration(path: Path) -> float:
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)], capture_output=True, text=True, check=True)
    return float(out.stdout.strip())


def main() -> None:
    pack = Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)

    for name, (src, width, crf) in LOOPS.items():
        source = pack / src
        run(["-i", str(source), "-an", "-vf", f"scale={width}:-2", *H264, "-crf", str(crf), str(OUT / f"{name}.mp4")])
        poster(source, name, width)
        report(name)

    # Manufacturing film with cross-dissolves, normalised to 1280x720 / 24 fps.
    sources = [pack / s for s in FILM]
    durations = [duration(s) for s in sources]
    fade = 0.6
    inputs: list[str] = []
    for s in sources:
        inputs += ["-i", str(s)]
    chains = [f"[{i}:v]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,fps=24,format=yuv420p,setsar=1[v{i}]" for i in range(len(sources))]
    last, offset = "v0", 0.0
    for i in range(1, len(sources)):
        offset += durations[i - 1] - fade
        chains.append(f"[{last}][v{i}]xfade=transition=fade:duration={fade}:offset={offset:.3f}[x{i}]")
        last = f"x{i}"
    run([*inputs, "-filter_complex", ";".join(chains), "-map", f"[{last}]", "-an", *H264, "-crf", "27", str(OUT / "manufacturing-film.mp4")])
    poster(sources[0], "manufacturing-film", 1280)
    report("manufacturing-film")

    for name, src in REEL_FILES.items():
        source = pack / src
        run(["-i", str(source), "-vf", "scale=720:-2", *H264, "-crf", "28", "-c:a", "aac", "-b:a", "96k", str(OUT / f"{name}.mp4")])
        poster(source, name, 720, at=1.5)  # reels open on a fade from black
        report(name)


if __name__ == "__main__":
    main()
