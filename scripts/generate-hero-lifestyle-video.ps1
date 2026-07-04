param(
  [string]$Model = "wan2.7-i2v"
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
    Input = "hero-lifestyle-01.png"
    Output = "hero-lifestyle-clip-01.mp4"
    Prompt = "A quiet luxury interior fashion film. The same adult European woman remains seated naturally on the sofa. She breathes, blinks once and turns her gaze slightly toward the warm shelf light; one hand relaxes on the sofa. The camera makes an extremely slow stable push forward. Preserve her exact mature facial identity, natural skin pores and fine lines, linen shirt weave, hands, body proportions, dark smoked-oak cabinetry, furniture and lighting. Restrained realistic movement, subtle fabric motion, no posing, no talking, no face retouching, no plastic skin, no morphing, no new objects, no text, no logo."
  },
  @{
    Input = "hero-lifestyle-02.png"
    Output = "hero-lifestyle-clip-02.mp4"
    Prompt = "A restrained architectural fashion film. The same adult European woman takes one unhurried step beside the smoked-oak cabinetry and gently lets her fingertips follow the timber surface. Her ivory linen shirt moves subtly. The camera tracks laterally at the same slow pace. Preserve her exact facial identity, natural mature skin texture, hair, hands, clothing, body proportions, cabinetry geometry, grain, brass details and every object. Elegant natural side profile, no looking at camera, no glamour retouching, no plastic skin, no body or face morphing, no extra people, no text, no logo."
  },
  @{
    Input = "hero-lifestyle-03.png"
    Output = "hero-lifestyle-clip-03.mp4"
    Prompt = "An intimate quiet-luxury architectural film. The same adult European woman slowly lets the fingertips of one hand travel along the exposed vertical spines of the upright books, then pauses. The books remain completely stationary, upright and physically separated from every shelf board. Her other arm stays relaxed at her side. The camera performs a very slow controlled side push, revealing precise joinery and warm shelf light. Preserve her exact mature face, realistic pores and fine lines, hair flyaways, anatomically correct hands, linen weave, body proportions, cabinetry, books and all architecture. No object may intersect or clip through a shelf. No talking, no smile to camera, no beauty retouching, no plastic skin, no morphing, no extra fingers, no added objects, no text, no logo."
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

  if ($Model -like "wanx2.1-*") {
    $payloadObject = @{
      model = $Model
      input = @{
        prompt = $job.Prompt
        img_url = $dataUrl
      }
      parameters = @{
        resolution = "720P"
        prompt_extend = $true
        watermark = $false
      }
    }
  } else {
    $payloadObject = @{
      model = $Model
      input = @{
        prompt = $job.Prompt
        media = @(
          @{
            type = "first_frame"
            url = $dataUrl
          }
        )
      }
      parameters = @{
        resolution = "720P"
        duration = 5
        prompt_extend = $true
        watermark = $false
      }
    }
  }

  $payload = $payloadObject | ConvertTo-Json -Depth 8 -Compress
  Write-Host "Submitting $($job.Output) with $Model..."

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
      throw "Aliyun request failed: $details"
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
