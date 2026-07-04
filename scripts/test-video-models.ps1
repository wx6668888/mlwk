param(
  [string[]]$Models = @(
    "wan2.7-i2v",
    "wan2.7-i2v-2026-04-25",
    "wan2.6-i2v-flash",
    "wan2.2-i2v-plus",
    "wanx2.1-i2v-plus",
    "happyhorse-1.1-i2v"
  ),
  [int]$Duration = 5,
  [string]$Resolution = "1080P"
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$privateVarsPath = Join-Path $projectRoot ".dev.vars"
$inputPath = Join-Path $projectRoot "public\media\hero-barefoot-01.png"
$outputDirectory = Join-Path $projectRoot "public\media\model-tests"
$reportPath = Join-Path $projectRoot "MODEL_TESTS.local.json"

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

New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
$imageBytes = [System.IO.File]::ReadAllBytes($inputPath)
$dataUrl = "data:image/png;base64,$([Convert]::ToBase64String($imageBytes))"
$headers = @{
  Authorization = "Bearer $apiKey"
  "X-DashScope-Async" = "enable"
  "Content-Type" = "application/json"
}
$prompt = "A quiet luxury architectural film shot. The same adult European woman remains seated naturally on the sofa, breathing softly and shifting her gaze slightly. Both anatomically correct bare feet remain stable on the rug. Preserve her mature face, realistic skin texture, hands, feet, linen clothing, smoked-oak cabinetry, furniture and lighting. Extremely slow stable camera push. No footwear, no morphing, no extra fingers or toes, no text, no logo."
$results = @()

function Get-RequestError {
  param([System.Management.Automation.ErrorRecord]$Record)
  if ($Record.ErrorDetails -and $Record.ErrorDetails.Message) {
    return $Record.ErrorDetails.Message
  }
  return $Record.Exception.Message
}

foreach ($model in $Models) {
  $safeName = $model -replace "[^a-zA-Z0-9._-]", "-"
  $outputPath = Join-Path $outputDirectory "$safeName-$Resolution-$($Duration)s.mp4"
  $result = [ordered]@{
    model = $model
    resolution = $Resolution
    duration = $Duration
    status = "SUBMITTING"
    task_id = $null
    message = $null
    output = $null
  }
  Write-Host "Testing $model at $Resolution for $Duration seconds..."

  $modelInput = if ($model -like "happyhorse-*") {
    @{
      prompt = $prompt
      media = @(
        @{
          type = "first_frame"
          url = $dataUrl
        }
      )
    }
  } else {
    @{
      prompt = $prompt
      img_url = $dataUrl
    }
  }
  $modelParameters = if ($model -like "happyhorse-*") {
    @{
      resolution = $Resolution
      duration = $Duration
      watermark = $false
    }
  } else {
    @{
      audio = $false
      resolution = $Resolution
      duration = $Duration
      shot_type = "single"
      prompt_extend = $true
      watermark = $false
      negative_prompt = "low resolution, blur, deformed feet, extra toes, extra limbs, plastic skin, footwear, morphing"
    }
  }
  $payloadObject = @{
    model = $model
    input = $modelInput
    parameters = $modelParameters
  }

  try {
    $created = Invoke-RestMethod `
      -Uri "$baseUrl/services/aigc/video-generation/video-synthesis" `
      -Method Post `
      -Headers $headers `
      -Body ($payloadObject | ConvertTo-Json -Depth 8 -Compress)
  } catch {
    $result.status = "REJECTED"
    $result.message = Get-RequestError $_
    $results += [pscustomobject]$result
    Write-Host "$model rejected before task creation."
    continue
  }

  $taskId = $created.output.task_id
  if (-not $taskId) {
    $result.status = "REJECTED"
    $result.message = "No task ID returned."
    $results += [pscustomobject]$result
    continue
  }

  $result.task_id = $taskId
  $result.status = "PENDING"
  try {
    do {
      Start-Sleep -Seconds 10
      $task = Invoke-RestMethod `
        -Uri "$baseUrl/tasks/$taskId" `
        -Method Get `
        -Headers @{ Authorization = "Bearer $apiKey" }
      $result.status = $task.output.task_status
      Write-Host "$model`: $($result.status)"
    } while ($result.status -in @("PENDING", "RUNNING"))

    if ($result.status -eq "SUCCEEDED" -and $task.output.video_url) {
      Invoke-WebRequest -UseBasicParsing $task.output.video_url -OutFile $outputPath
      $result.output = $outputPath
    } else {
      $result.message = if ($task.message) { $task.message } else { "Task did not succeed." }
    }
  } catch {
    $result.status = "POLL_ERROR"
    $result.message = Get-RequestError $_
  }
  $results += [pscustomobject]$result
}

$results | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $reportPath -Encoding utf8
$results | Select-Object model, resolution, duration, status, message, output | Format-Table -Wrap
Write-Host "Saved private report to MODEL_TESTS.local.json"
