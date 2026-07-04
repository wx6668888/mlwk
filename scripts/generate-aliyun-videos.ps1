param(
  [string]$Model = "wan2.7-i2v-2026-04-25"
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
    Input = "hero-poster.png"
    Output = "hero-generated.mp4"
    Duration = 8
    Prompt = "A single continuous architectural film shot. The camera makes an extremely slow, stable dolly forward through this exact luxury millwork interior. Preserve every cabinet, wall panel, material, proportion, and furniture item from the source image. Only subtle daylight changes, a faint fireplace movement, and natural parallax. No people, no cuts, no object morphing, no new furniture, no text, no logo. Quiet premium real-estate cinematography."
  },
  @{
    Input = "kitchens.png"
    Output = "kitchen-generated.mp4"
    Duration = 6
    Prompt = "A single continuous architectural film shot of this exact custom kitchen. Slow controlled lateral camera slide from left to right with subtle parallax across the oak cabinetry and stone island. Preserve the cabinet layout, appliances, finishes, handles, plants, chairs and proportions exactly. Soft daylight shifts gently. No people, no cuts, no morphing, no added objects, no text, no logo. High-end interior editorial cinematography."
  },
  @{
    Input = "wall-panels.png"
    Output = "wall-panels-generated.mp4"
    Duration = 6
    Prompt = "A single continuous close architectural film shot of this exact timber wall-panel system. The camera slowly pushes in and slightly tracks along the panels so veneer grain, reeded sections, concealed doors, shadow gaps and shelf lighting become more visible. Preserve all geometry and furniture exactly. No people, no cuts, no morphing, no added objects, no text, no logo. Quiet premium hospitality cinematography."
  }
)

foreach ($job in $jobs) {
  $inputPath = Join-Path $projectRoot "public\media\$($job.Input)"
  $outputPath = Join-Path $projectRoot "public\media\$($job.Output)"
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
        duration = $job.Duration
        prompt_extend = $true
        watermark = $false
      }
    }
  }

  $payload = $payloadObject | ConvertTo-Json -Depth 8 -Compress

  Write-Host "Submitting $($job.Output)..."
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
