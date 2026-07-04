$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$mediaRoot = Join-Path $projectRoot "public\media"
$outputDir = Join-Path $mediaRoot "motion"
$tempDir = Join-Path $projectRoot ".temp"

New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

$env:TMPDIR = $tempDir
$env:TEMP   = $tempDir
$env:TMP    = $tempDir

$script = @'
import cv2, numpy as np, subprocess, os, gc, sys

out_w, out_h = 1920, 1080
render_w, render_h = out_w * 2, out_h * 2
fps = 30
duration = 4
total_frames = fps * duration

def ease(t):
    # Cubic ease-in-out: zero velocity at start/end for perfectly smooth acceleration
    if t < 0.5:
        return 4 * t * t * t
    else:
        return 1 - (-2 * t + 2)**3 / 2

sources = sys.argv[1:]
for source_path in sources:
    name = os.path.splitext(os.path.basename(source_path))[0]
    output_path = os.path.join(os.path.dirname(os.path.dirname(source_path)), "motion", name + ".mp4")

    with open(source_path, "rb") as f:
        data = np.frombuffer(f.read(), np.uint8)
    img = cv2.imdecode(data, cv2.IMREAD_COLOR)
    if img is None:
        print(f"SKIP: {name}")
        continue

    h, w = img.shape[:2]
    fill_scale = max(render_w / w, render_h / h)
    start_scale = fill_scale
    end_scale = fill_scale * 1.04
    pan_total = 24

    print(f"{name}: {w}x{h} zoom {start_scale:.2f}->{end_scale:.2f}")

    ffmpeg_cmd = [
        "ffmpeg", "-y", "-loglevel", "error",
        "-f", "rawvideo", "-vcodec", "rawvideo",
        "-s", f"{out_w}x{out_h}", "-pix_fmt", "bgr24", "-r", str(fps),
        "-i", "-",
        "-an",
        "-c:v", "libx264", "-preset", "ultrafast", "-crf", "23",
        "-movflags", "+faststart",
        output_path,
    ]
    proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE)

    try:
        for fi in range(total_frames):
            t = fi / (total_frames - 1) if total_frames > 1 else 0
            e = ease(t)
            scale = start_scale + (end_scale - start_scale) * e
            pan_x = pan_total * e

            rw = int(w * scale)
            rh = int(h * scale)
            big = cv2.resize(img, (rw, rh), interpolation=cv2.INTER_CUBIC)

            cx = rw // 2 + int(pan_x)
            cy = rh // 2
            x1 = max(0, min(cx - render_w // 2, rw - render_w))
            y1 = max(0, min(cy - render_h // 2, rh - render_h))

            render_frame = big[y1:y1+render_h, x1:x1+render_w]
            del big
            out_frame = cv2.resize(render_frame, (out_w, out_h), interpolation=cv2.INTER_CUBIC)
            del render_frame
            proc.stdin.write(out_frame.tobytes())
            del out_frame

            if fi % 30 == 0:
                gc.collect()

        proc.stdin.close()
        proc.wait()
        kb = os.path.getsize(output_path) / 1024
        print(f"  -> {name}.mp4 ({kb:.0f} KB)")
    except Exception as ex:
        print(f"  FAILED: {ex}")
        try:
            proc.kill()
        except:
            pass
    gc.collect()

print("Done.")
'@

$scriptPath = Join-Path $tempDir "smooth-zoom.py"
$script | Set-Content -LiteralPath $scriptPath -Encoding UTF8

$sourceImages = @(
    (Join-Path $mediaRoot "kitchens.png"),
    (Join-Path $mediaRoot "wardrobes.png"),
    (Join-Path $mediaRoot "vanities.png"),
    (Join-Path $mediaRoot "wall-panels.png"),
    (Join-Path $mediaRoot "interior-doors.png"),
    (Join-Path $mediaRoot "bespoke-built-ins.png"),
    (Join-Path $mediaRoot "hero-poster.png")
)

$result = & python3 $scriptPath $sourceImages 2>&1
$result | ForEach-Object { Write-Host $_ }
if ($LASTEXITCODE -ne 0) { throw "Smooth zoom script failed." }
Write-Host "Created $($sourceImages.Count) smooth motion clips."
