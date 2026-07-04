$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$media = Join-Path $projectRoot "public\media"
$clips = 1..3 | ForEach-Object {
  Join-Path $media "hero-barefoot-clip-0$_.mp4"
}

foreach ($clip in $clips) {
  if (-not (Test-Path -LiteralPath $clip)) {
    throw "Missing generated clip: $clip"
  }
  $probe = & ffprobe -v error -select_streams v:0 `
    -show_entries stream=width,height -of csv=s=x:p=0 $clip
  $parts = $probe.Trim().Split("x")
  if ([int]$parts[0] -lt 1900 -or [int]$parts[1] -lt 1000) {
    throw "Refusing non-1080P source clip: $clip ($probe)"
  }
}

$desktopMp4 = Join-Path $media "hero-barefoot-1080.mp4"
$desktopWebm = Join-Path $media "hero-barefoot-1080.webm"
$mobileMp4 = Join-Path $media "hero-barefoot-mobile.mp4"
$mobileWebm = Join-Path $media "hero-barefoot-mobile.webm"
$filter = "[0:v]setpts=PTS-STARTPTS[v0];[1:v]setpts=PTS-STARTPTS[v1];[2:v]setpts=PTS-STARTPTS[v2];[v0][v1]xfade=transition=fade:duration=0.35:offset=5.016667[v01];[v01][v2]xfade=transition=fade:duration=0.35:offset=10.033334,format=yuv420p[v]"

& ffmpeg -hide_banner -loglevel error `
  -i $clips[0] -i $clips[1] -i $clips[2] `
  -filter_complex $filter -map "[v]" -an `
  -c:v libx264 -preset slow -crf 19 -movflags +faststart -y $desktopMp4

& ffmpeg -hide_banner -loglevel error -i $desktopMp4 -an `
  -c:v libvpx-vp9 -b:v 0 -crf 31 -row-mt 1 -deadline good `
  -cpu-used 2 -y $desktopWebm

& ffmpeg -hide_banner -loglevel error -i $desktopMp4 `
  -vf "crop=864:1080:760:0,scale=1080:1350:flags=lanczos" -an `
  -c:v libx264 -preset slow -crf 20 -movflags +faststart -y $mobileMp4

& ffmpeg -hide_banner -loglevel error -i $mobileMp4 -an `
  -c:v libvpx-vp9 -b:v 0 -crf 32 -row-mt 1 -deadline good `
  -cpu-used 2 -y $mobileWebm

Get-Item -LiteralPath $desktopMp4, $desktopWebm, $mobileMp4, $mobileWebm |
  Select-Object Name, Length
