param(
  [string]$Model = "wan2.6-i2v"
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$privateVarsPath = Join-Path $projectRoot ".dev.vars"

if (-not (Test-Path -LiteralPath $privateVarsPath)) {
  throw "Missing .dev.vars private configuration."
}

$vars = @{}
Get-Content -LiteralPath $privateVarsPath | ForEach-Object {
  if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
    $vars[$matches[1].Trim()] = $matches[2].Trim()
  }
}

$apiKey = $vars["ALIYUN_MODEL_STUDIO_API_KEY"]
$baseUrl = $vars["ALIYUN_DASHSCOPE_BASE_URL"].TrimEnd("/")
if (-not $apiKey -or -not $baseUrl) {
  throw "Aliyun API key or DashScope base URL is missing."
}

$headers = @{
  Authorization = "Bearer $apiKey"
  "X-DashScope-Async" = "enable"
  "Content-Type" = "application/json"
}

$jobs = @(
  @{
    Input = "hero-barefoot-01.png"
    Output = "hero-barefoot-clip-01.mp4"
    Prompt = "A single quiet luxury interior film shot. The same adult European woman remains seated naturally on the sofa, breathing softly, blinking once and shifting her gaze slightly toward the warm cabinetry light. Both anatomically correct bare feet remain naturally resting on the rug with stable toes, arches and contact shadows. The camera makes an extremely slow stable push forward. Preserve her exact mature facial identity, realistic skin pores and fine lines, hands, bare feet, linen weave, body proportions, smoked-oak cabinetry, furniture and lighting. No footwear, no foot movement, no morphing, no extra toes or limbs, no plastic skin, no new objects, no text, no logo."
  },
  @{
    Input = "hero-barefoot-02.png"
    Output = "hero-barefoot-clip-02.mp4"
    Prompt = "A single restrained architectural fashion film shot. The same adult European woman takes one slow natural barefoot step beside the smoked-oak cabinetry while her fingertips lightly follow the timber surface. One bare foot stays planted with realistic weight and contact shadow while the other completes only a small controlled step. The camera tracks laterally at the same pace. Preserve her exact mature face, natural skin, anatomically correct feet and hands, linen clothing, body proportions, cabinetry geometry and grain. No shoes, socks or slippers, no foot deformation, no extra toes, no body or face morphing, no added people, no text, no logo."
  },
  @{
    Input = "hero-barefoot-03.png"
    Output = "hero-barefoot-clip-03.mp4"
    Prompt = "A single intimate architectural film shot. The same adult European woman slowly lets the fingertips of one hand move along the upright book spines and then pauses. Her two anatomically correct bare feet remain fully planted and stationary on the floor with realistic weight and contact shadows. Every book remains upright and physically separated from the shelf boards. The camera performs a very slow controlled side push. Preserve her exact mature face, realistic pores, hair, hands, bare feet, linen weave, body proportions, cabinetry and all architecture. No footwear, no clipping into furniture, no extra fingers or toes, no morphing, no plastic skin, no new objects, no text, no logo."
  }
)

foreach ($job in $jobs) {
  $inputPath = Join-Path $projectRoot "public\media\$($job.Input)"
  $outputPath = Join-Path $projectRoot "public\media\$($job.Output)"
  if (Test-Path -LiteralPath $outputPath) {
    Write-Host "Keeping existing $($job.Output)"
    continue
  }

  $bytes = [System.IO.File]::ReadAllBytes($inputPath)
  $dataUrl = "data:image/png;base64,$([Convert]::ToBase64String($bytes))"
  $payloadObject = @{
    model = $Model
    input = @{
      prompt = $job.Prompt
      img_url = $dataUrl
    }
    parameters = @{
      audio = $false
      resolution = "1080P"
      duration = 5
      shot_type = "single"
      prompt_extend = $true
      watermark = $false
      negative_prompt = "low resolution, blur, deformed feet, extra toes, extra limbs, plastic skin, footwear, morphing"
    }
  }
  $payload = $payloadObject | ConvertTo-Json -Depth 8 -Compress
  Write-Host "Submitting $($job.Output) with $Model at 1080P..."

  try {
    $created = Invoke-RestMethod `
      -Uri "$baseUrl/services/aigc/video-generation/video-synthesis" `
      -Method Post `
      -Headers $headers `
      -Body $payload
  } catch {
    $response = $_.Exception.Response
    if ($response) {
      $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
      $details = $reader.ReadToEnd()
      throw "Aliyun request failed before task creation: $details"
    }
    throw
  }

  $taskId = $created.output.task_id
  if (-not $taskId) {
    throw "No task ID returned for $($job.Output)."
  }

  do {
    Start-Sleep -Seconds 12
    $status = Invoke-RestMethod `
      -Uri "$baseUrl/tasks/$taskId" `
      -Method Get `
      -Headers @{ Authorization = "Bearer $apiKey" }
    $taskStatus = $status.output.task_status
    Write-Host "$($job.Output): $taskStatus"
  } while ($taskStatus -in @("PENDING", "RUNNING"))

  if ($taskStatus -ne "SUCCEEDED") {
    throw "Video generation failed for $($job.Output): $($status.message)"
  }

  Invoke-WebRequest -UseBasicParsing $status.output.video_url -OutFile $outputPath
  Write-Host "Saved $($job.Output)"
}
