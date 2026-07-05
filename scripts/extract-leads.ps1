$ErrorActionPreference = "Continue"
$outputDir = "D:\360MoveData\Users\Administrator\Desktop\建材出海\用户"
$id = 0; $all = @()

$files = @(
  @{P=".firecrawl\v2-usa-reddit.json";  S="Reddit";      R="美国"; L="en"},
  @{P=".firecrawl\v2-usa-houzz.json";   S="Houzz";       R="美国"; L="en"},
  @{P=".firecrawl\v2-me-villa.json";    S="Web";         R="中东"; L="en"},
  @{P=".firecrawl\v2-me-linkedin.json"; S="LinkedIn";    R="中东"; L="en"},
  @{P=".firecrawl\v2-me-neom.json";     S="News";        R="中东"; L="en"},
  @{P=".firecrawl\v2-ar-gulf.json";     S="Web(阿语)";    R="中东"; L="ar"},
  @{P=".firecrawl\v2-ar-villa.json";    S="Web(阿语)";    R="中东"; L="ar"},
  @{P=".firecrawl\v2-de-kitchen.json";  S="Web(德语)";    R="德国"; L="de"},
  @{P=".firecrawl\v2-de-villa.json";    S="Web(德语)";    R="德国"; L="de"},
  @{P=".firecrawl\v2-fr-cuisine.json";  S="Web(法语)";    R="法国"; L="fr"}
)

foreach ($f in $files) {
  $path = $f.P; $source = $f.S; $region = $f.R; $lang = $f.L
  if (-not (Test-Path $path)) { Write-Host "MISSING: $path"; continue }
  try {
    $json = Get-Content $path -Raw -Encoding UTF8 | ConvertFrom-Json
    if (-not $json.data.web -or $json.data.web.Count -eq 0) { Write-Host "EMPTY: $path"; continue }
    foreach ($item in $json.data.web) {
      $id++
      $t = ($item.title -replace '[|;"]', ' ') -replace '\s+', ' '.Trim()
      $u = $item.url
      $d = ($item.description -replace '[|;"]', ' ') -replace '\s+', ' '.Trim()
      if ($d.Length -gt 300) { $d = $d.Substring(0,300) + "..." }

      # --- classification ---
      $cat = "潜在客户"
      if ($t -match "villa|Villa|penthouse|mansion|palace|豪宅|宫殿|别墅") { $cat = "豪华别墅项目" }
      elseif ($t -match "kitchen|remodel|renovation|cabinetry|cabinet|millwork|joinery|woodwork|bespoke|custom.*build|new.*build|Küche|Schreiner|Tischler|cuisine|ébéniste|menuisier|cuisine|sur mesure") { $cat = "厨房/定制木作" }
      elseif ($t -match "NEOM|Red Sea|AMAALA|Sindalah|Shura|megaproject|hospitality|resort|hotel|度假|酒店") { $cat = "超级工程/酒店" }
      elseif ($t -match "interior|design|architect|Innenausbau|architecte|décoration|创意|设计") { $cat = "室内设计/建筑" }
      elseif ($t -match "fit.out|contractor|builder|developer|开发商|承包商") { $cat = "施工方/开发商" }
      elseif ($t -match "مطبخ|تفصيل|نجارة|فيلا|تصميم|داخلي|خشب") { $cat = "厨房/定制木作" }

      # --- city detection ---
      $city = ""
      if ($t -match "Dubai|دبي") { $city = "迪拜" } elseif ($t -match "Riyadh|الرياض") { $city = "利雅得" }
      elseif ($t -match "Jeddah|جدة") { $city = "吉达" } elseif ($t -match "Jordan|الأردن|عمان") { $city = "约旦" }
      elseif ($t -match "Qatar|Doha|قطر|الدوحة") { $city = "卡塔尔" }
      elseif ($t -match "Kuwait|الكويت") { $city = "科威特" }
      elseif ($t -match "Abu Dhabi|أبو ظبي") { $city = "阿布扎比" }
      elseif ($t -match "London|UK") { $city = "伦敦" }
      elseif ($t -match "Berlin") { $city = "柏林" } elseif ($t -match "Munich|München") { $city = "慕尼黑" }
      elseif ($t -match "Paris") { $city = "巴黎" } elseif ($t -match "Germany|Deutschland") { $city = "德国" }
      elseif ($t -match "France|France") { $city = "法国" }
      elseif ($t -match "California|CA|Los Angeles|LA") { $city = "加州" }
      elseif ($t -match "New York|NYC|NY") { $city = "纽约" }
      elseif ($t -match "Texas|TX|Austin|Houston|Dallas") { $city = "德州" }
      elseif ($t -match "Florida|FL|Miami") { $city = "佛罗里达" }
      elseif ($t -match "Chicago|IL") { $city = "芝加哥" }
      elseif ($t -match "Denver|CO") { $city = "丹佛" }
      elseif ($t -match "Bay Area|SF|San Francisco") { $city = "旧金山湾区" }
      elseif ($t -match "Seattle|WA") { $city = "西雅图" }
      elseif ($t -match "NEOM|Red Sea") { $city = "NEOM/红海" }
      elseif ($t -match "Saudi|السعودية") { $city = "沙特" }

      $all += [PSCustomObject]@{
        ID    = $id
        分类   = $cat
        标题   = $t.Substring(0,[Math]::Min(100,$t.Length))
        城市   = $city
        区域   = $region
        语言   = $lang
        来源   = $source
        链接   = $u
        摘要   = $d
      }
    }
    Write-Host "OK: $path => $($json.data.web.Count) items"
  } catch { Write-Host "ERROR: $path — $_" }
}

# dedup by URL
$before = $all.Count
$all = $all | Sort-Object 链接 -Unique
Write-Host "`nAfter dedup: $($all.Count) (removed $($before - $all.Count) duplicates)"

# --- CHINESE REPORT ---
$now = Get-Date -Format 'yyyy-MM-dd HH:mm'
$report = @"
# MLWK 建材出海 — 潜在客户开发报告

> **生成时间**: $now | **线索总数**: $($all.Count) 条（去重） | **搜索范围**: 最近一周 | **覆盖语言**: 英语/阿拉伯语/德语/法语

---

## 📊 总览

| 区域 | 数量 | 占比 |
|------|:----:|:----:|
"@

$byRegion = $all | Group-Object 区域 | Sort-Object Count -Descending
foreach ($r in $byRegion) {
  $pct = [math]::Round($r.Count / $all.Count * 100)
  $bar = "▓" * [math]::Max(1, $pct / 2)
  $report += "`n| **$($r.Name)** | $($r.Count) | $bar $pct% |"
}

$report += @"

| 线索类型 | 数量 |
|----------|:----:|
"@
$byCat = $all | Group-Object 分类 | Sort-Object Count -Descending
foreach ($c in $byCat) {
  $report += "`n| $($c.Name) | $($c.Count) |"
}

$report += @"

---

## 🌍 区域一：美国 🇺🇸

> 来源: Reddit r/kitchenremodel、Houzz 设计平台 | 语言: 英语

### 重点关注线索

"@
$usIdx = 0
foreach ($lead in ($all | Where-Object { $_.区域 -eq "美国" })) {
  $usIdx++
  $cityStr = if ($lead.城市) { " 【$($lead.城市)】" } else { "" }
  $report += @"

**$usIdx.**$cityStr $($lead.标题)
    🔗 $($lead.链接)
    📝 $($lead.摘要)

"@
}

$report += @"

---

## 🏰 区域二：中东 🇸🇦 🇦🇪

> 来源: Web/News/Instagram/LinkedIn + 阿拉伯语搜索 | 语言: 英语/阿拉伯语

### 豪华别墅项目

"@
$meIdx = 0
foreach ($lead in ($all | Where-Object { $_.区域 -eq "中东" -and $_.分类 -eq "豪华别墅项目" })) {
  $meIdx++
  $cityStr = if ($lead.城市) { " 【$($lead.城市)】" } else { "" }
  $langTag = if ($lead.语言 -eq "ar") { " [阿语]" } else { "" }
  $report += "`n**$meIdx.**$cityStr$langTag $($lead.标题)`n    🔗 $($lead.链接)`n"
}

$report += @"

### 超级工程/酒店项目

"@
foreach ($lead in ($all | Where-Object { $_.区域 -eq "中东" -and $_.分类 -eq "超级工程/酒店" })) {
  $meIdx++
  $cityStr = if ($lead.城市) { " 【$($lead.城市)】" } else { "" }
  $report += "`n**$meIdx.**$cityStr $($lead.标题)`n    🔗 $($lead.链接)`n"
}

$report += @"

### 室内设计/建筑公司

"@
foreach ($lead in ($all | Where-Object { $_.区域 -eq "中东" -and $_.分类 -eq "室内设计/建筑" })) {
  $meIdx++
  $cityStr = if ($lead.城市) { " 【$($lead.城市)】" } else { "" }
  $report += "`n**$meIdx.**$cityStr $($lead.标题)`n    🔗 $($lead.链接)`n"
}

$report += @"

---

## 🏗️ 区域三：德国 🇩🇪

> 来源: Web(德语) | 语言: 德语

### 重点关注线索

"@
$deIdx = 0
foreach ($lead in ($all | Where-Object { $_.区域 -eq "德国" })) {
  $deIdx++
  $cityStr = if ($lead.城市) { " 【$($lead.城市)】" } else { "" }
  $report += @"

**$deIdx.**$cityStr $($lead.标题)
    🔗 $($lead.链接)
    📝 $($lead.摘要)

"@
}

$report += @"

---

## 🥐 区域四：法国 🇫🇷

> 来源: Web(法语) | 语言: 法语

### 重点关注线索

"@
$frIdx = 0
foreach ($lead in ($all | Where-Object { $_.区域 -eq "法国" })) {
  $frIdx++
  $cityStr = if ($lead.城市) { " 【$($lead.城市)】" } else { "" }
  $report += @"

**$frIdx.**$cityStr $($lead.标题)
    🔗 $($lead.链接)
    📝 $($lead.摘要)

"@
}

# --- action plan ---
$report += @"

---

## 📋 行动建议

### 高优先级（本周）
1. **Reddit 活跃用户** — 私信正在询价厨房翻新的真实房主，介绍 MLWK 从中国直供定制木作的优势
2. **Houzz 设计师** — 联系标注"Custom Cabinetry"的美国设计师，发送合作邮件和产品目录
3. **中东 LinkedIn 室内设计师** — 添加好友，私信介绍 MLWK 项目顾问服务

### 中优先级（两周内）
4. **德国 Schreiner/Tischler** — 用德语联系德国定制木工坊，提供 OEM 合作方案
5. **法国 ébéniste/menuisier** — 联系法国细木工匠，探索欧洲分销渠道
6. **沙特 Villa 项目** — 通过 LinkedIn 联系项目设计方，提供工程木作报价

### 储备线索
7. **NEOM/红海超级工程** — 关注项目招标信息，准备资质文件和案例集
8. **迪拜 Fit-out 公司** — 建立长期关系，成为其中国木作供应商

---

## 📎 附件说明

| 文件 | 内容 |
|------|------|
| `mlwk-leads-v2.csv` | 完整线索表格（Excel 可打开） |
| `mlwk-leads-v2.md` | 本报告 Markdown 格式 |
| `.firecrawl/v2-*.json` | 原始搜索结果（含完整抓取内容） |

> ⚠️ **免责声明**: 本报告线索来自搜索引擎公开网页，信息仅供参考。建议在联系前自行验证目标客户的资质和真实性。

---
*报告由 Firecrawl Search 自动生成 | MLWK 建材出海项目*
"@

# save
$report | Out-File -FilePath "$outputDir\mlwk-leads-v2.md" -Encoding UTF8
$all | Export-Csv -Path "$outputDir\mlwk-leads-v2.csv" -NoTypeInformation -Encoding UTF8

Write-Host "`n=== REPORT SAVED ==="
Write-Host "Markdown: $outputDir\mlwk-leads-v2.md"
Write-Host "CSV:      $outputDir\mlwk-leads-v2.csv"
Write-Host "Total:    $($all.Count) leads"
