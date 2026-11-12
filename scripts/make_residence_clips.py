"""Camera-move loops from Guangzhou Residence photos -> public/media/video/res-*.mp4 (+ webp poster).

No generative AI: each clip is a slow, eased pan/zoom over one real photo, played forward then back so
the loop has no jump. Sources are the full-size originals (sharper than the 2400 px web copies).

    python scripts/make_residence_clips.py "<path to 20250221广州项目>"
"""
import math, os, subprocess, sys
import cv2
import numpy as np
from PIL import Image, ImageOps

ROOT = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "public", "media", "video")
FPS = 24
SECONDS = 6  # one way; the loop is twice this

# name: (photo number, (w, h), start (cx, cy, zoom), end (cx, cy, zoom)); cx/cy are fractions of the photo,
# zoom 1 = the largest crop of the output aspect that fits the photo.
CLIPS = {
    "res-living-1920": (109, (1920, 1080), (0.50, 0.55, 1.00), (0.60, 0.50, 1.14)),
    "res-living-960": (109, (960, 540), (0.50, 0.55, 1.00), (0.60, 0.50, 1.14)),
    "res-detail-line": (15, (720, 1280), (0.50, 0.42, 1.04), (0.50, 0.60, 1.10)),
    "res-detail-oak": (64, (720, 1280), (0.48, 0.50, 1.00), (0.52, 0.52, 1.14)),
    "res-detail-handle": (44, (720, 1280), (0.45, 0.50, 1.00), (0.42, 0.48, 1.16)),
    "res-detail-glass": (98, (720, 1280), (0.50, 0.40, 1.04), (0.50, 0.56, 1.10)),
    "res-kitchen": (87, (1280, 720), (0.50, 0.55, 1.00), (0.50, 0.50, 1.15)),
    "res-hallway": (3, (1280, 720), (0.48, 0.55, 1.00), (0.52, 0.50, 1.14)),
    "res-storage-wall": (113, (1280, 720), (0.40, 0.55, 1.04), (0.60, 0.50, 1.10)),
    "res-oak-edge": (135, (864, 1080), (0.50, 0.42, 1.02), (0.50, 0.56, 1.12)),
}


def photos():
    out = []
    for d, _, fs in os.walk(ROOT):
        for f in fs:
            if f.lower().endswith((".jpg", ".jpeg")):
                out.append(os.path.join(d, f))
    return sorted(out)


def ease(t):
    return 0.5 - 0.5 * math.cos(math.pi * t)


def render(name, src, size, a, b):
    ow, oh = size
    img = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    # Scale so the tightest crop is 1:1 with the output; wider crops downsample by at most ~15%.
    base = min(img.width / ow, img.height / oh)
    scale = min(1.0, max(a[2], b[2]) / base)
    if scale < 1:
        img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
    arr = cv2.cvtColor(np.asarray(img), cv2.COLOR_RGB2BGR)
    H, W = arr.shape[:2]
    fit = min(W / ow, H / oh)  # source px per output px at zoom 1
    n = FPS * SECONDS
    frames = []
    for i in range(n):
        t = ease(i / (n - 1))
        cx, cy, z = (a[k] + (b[k] - a[k]) * t for k in range(3))
        s = fit / z
        cw, ch = ow * s, oh * s
        x0 = min(max(cx * W - cw / 2, 0), W - cw)
        y0 = min(max(cy * H - ch / 2, 0), H - ch)
        m = np.float32([[1 / s, 0, -x0 / s], [0, 1 / s, -y0 / s]])
        frames.append(cv2.warpAffine(arr, m, (ow, oh), flags=cv2.INTER_CUBIC))
    seq = frames + frames[-2:0:-1]
    mp4 = os.path.join(OUT, f"{name}.mp4")
    p = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{ow}x{oh}", "-r", str(FPS), "-i", "-",
                          "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "24" if ow >= 1920 else "25", "-pix_fmt", "yuv420p",
                          "-profile:v", "high", "-movflags", "+faststart", mp4], stdin=subprocess.PIPE)
    for f in seq:
        p.stdin.write(f.tobytes())
    p.stdin.close()
    p.wait()
    cv2.imwrite(os.path.join(OUT, f"{name}.webp"), frames[0], [cv2.IMWRITE_WEBP_QUALITY, 82])
    print(name, f"{os.path.getsize(mp4) / 1e6:.1f} MB")


def main():
    files = photos()
    for name, (n, size, a, b) in CLIPS.items():
        render(name, files[n], size, a, b)


if __name__ == "__main__":
    main()
