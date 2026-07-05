$ErrorActionPreference = "Continue"
$outputDir = "D:\360MoveData\Users\Administrator\Desktop\建材出海\用户"

# Collect all scraped results from v2 files
$files = @(
  @{P=".firecrawl\v2-usa-reddit.json";  S="Reddit";      R="USA"},
  @{P=".firecrawl\v2-usa-houzz.json";   S="Houzz";       R="USA"},
  @{P=".firecrawl\v2-me-villa.json";    S="Web";         R="Middle East"},
  @{P=".firecrawl\v2-me-neom.json";     S="News";        R="Middle East"},
  @{P=".firecrawl\v2-ar-gulf.json";     S="Web(AR)";     R="Middle East"},
  @{P=".firecrawl\v2-ar-villa.json";    S="Web(AR)";     R="Middle East"},
  @{P=".firecrawl\v2-de-kitchen.json";  S="Web(DE)";     R="Germany"},
  @{P=".firecrawl\v2-de-villa.json";    S="Web(DE)";     R="Germany"},
  @{P=".firecrawl\v2-fr-cuisine.json";  S="Web(FR)";     R="France"},
  @{P=".firecrawl\v3-commercial-bids.json"; S="Web";     R="Global"},
  @{P=".firecrawl\v3-linkedin-projects.json"; S="LinkedIn"; R="Middle East"},
  @{P=".firecrawl\v3-me-developers.json"; S="Web";       R="Middle East"},
  @{P=".firecrawl\v3-direct-inquiries.json"; S="Web";    R="Global"},
  @{P=".firecrawl\v3-de-orders.json";  S="Web(DE)";      R="Germany"}
)

$leads = @()
foreach ($f in $files) {
  if (-not (Test-Path $f.P)) { continue }
  try {
    $j = Get-Content $f.P -Raw -Encoding UTF8 | ConvertFrom-Json
    if (-not $j.data.web) { continue }
    foreach ($item in $j.data.web) {
      $t = ($item.title -replace '\s+', ' ').Trim()
      $u = $item.url
      $d = ($item.description -replace '\s+', ' ').Trim()
      $md = $item.markdown

      # Try to extract date from markdown content
      $date = ""
      if ($md -match '(\d{4}-\d{2}-\d{2})') { $date = $matches[1] }
      elseif ($md -match 'published.*?(\d{4}-\d{2}-\d{2})') { $date = $matches[1] }
      elseif ($md -match '(\d+)\s+(day|week|month)s?\s+ago') { $date = "$($matches[1]) $($matches[2])s ago (approx)" }

      # Classification and scoring
      $cat = "General"
      $score = 1  # 1-5 deal potential
      $reason = ""

      # --- SCORE ANALYSIS ---
      if ($t -match "looking for.*(?:cabinet|millwork|kitchen.*manufact|supplier|wholesale)|looking.*build.*kitchen.*cabinet") {
        $cat = "ACTIVE BUYER - Cabinetry"
        $score = 5
        $reason = "主动寻找橱柜制造商/供应商 - 直接采购意向"
      }
      elseif ($t -match "remodel|renovation" -and $t -match "kitchen|cabinet|counter" -and $t -match "\$[0-9]+[Kk]|\d+k budget|cost|quote|price|pricing|how much") {
        $cat = "ACTIVE BUYER - Kitchen Remodel"
        $score = 4
        $reason = "正在询价厨房翻新，有预算讨论 - 可能在比较供应商"
      }
      elseif ($t -match "remodel|renovation" -and $t -match "kitchen|cabinet") {
        $cat = "WARM LEAD - Kitchen"
        $score = 3
        $reason = "正在计划厨房翻新 - 在决策阶段"
      }
      elseif ($t -match "new.*(?:house|home|build|construction)" -and $t -match "kitchen|cabinet|custom") {
        $cat = "WARM LEAD - New Build"
        $score = 3
        $reason = "新建房屋需要厨房/木作 - 可能有更大订单"
      }
      elseif ($t -match "villa.*(?:project|design|construction|fit.out|interior)" -and $t -match "Dubai|Riyadh|Jeddah|Saudi|UAE|Qatar|Kuwait|Jordan") {
        $cat = "PROJECT - Luxury Villa"
        $score = 4
        $reason = "中东豪华别墅项目 - 木作预算充足（>$10K）"
      }
      elseif ($t -match "NEOM|Red.Sea|AMAALA|Sindalah|Shura|hospitality|resort.*hotel" -and $t -match "Saudi|project|development") {
        $cat = "PROJECT - Hospitality"
        $score = 3
        $reason = "沙特超级酒店项目 - 需要长期跟进，订单量巨大"
      }
      elseif ($t -match "interior.*design|architect" -and $t -match "Dubai|Saudi|Riyadh|UAE|Qatar" -and $t -match "firm|company|studio|LinkedIn") {
        $cat = "CHANNEL - Design Firm"
        $score = 3
        $reason = "室内设计公司 - 可发展为渠道合作伙伴"
      }
      elseif ($t -match "Schreiner|Tischler|Kuche|renovierung|Innenausbau|Maßanfertigung|Mobeltischler") {
        $cat = "CHANNEL - German Carpenter"
        $score = 3
        $reason = "德国木工坊 - 可能寻求 OEM 供应商"
      }
      elseif ($t -match "cuisine.*sur.mesure|ebeniste|menuisier|agenceur|renovation.*cuisine") {
        $cat = "CHANNEL - French Artisan"
        $score = 3
        $reason = "法国定制木作工匠 - 可能寻找中国供应商"
      }
      elseif ($t -match "fit.out|contractor|builder" -and $t -match "Dubai|Saudi|UAE") {
        $cat = "CHANNEL - Contractor"
        $score = 3
        $reason = "中东施工/装修公司 - 可发展为供应商关系"
      }
      elseif ($t -match "kitchen.*design|cabinet.*showroom|cabinet.*dealer|kitchen.*brand" -and $t -notmatch "Houzz.*photo|idea|love") {
        $cat = "CHANNEL - Kitchen Dealer"
        $score = 3
        $reason = "厨房展厅/经销商 - 可发展为批发客户"
      }
      elseif ($t -match "Houzz.*(?:photo|idea|love)" -or $t -match "75.*Ideas") {
        $cat = "LOW - Gallery"
        $score = 1
        $reason = "仅为设计灵感图片集 - 非商业线索"
      }
      elseif ($t -match "market.*report|trend|guide|statistic|forecast|industry") {
        $cat = "LOW - Market Report"
        $score = 1
        $reason = "行业报告/市场分析 - 非直接客户"
      }

      if ($score -ge 2) {
        $leads += [PSCustomObject]@{
          评分 = $score
          类型 = $cat
          日期 = if($date){$date}else{"未标注"}
          标题 = $t.Substring(0,[Math]::Min(120,$t.Length))
          区域 = $f.R
          来源 = $f.S
          链接 = $u
          分析 = $reason
          摘要 = $d.Substring(0,[Math]::Min(200,$d.Length))
        }
      }
    }
  } catch {}
}

# Sort by score desc, dedup
$leads = @($leads | Sort-Object 评分 -Descending | Sort-Object 链接 -Unique)

Write-Host "Qualified leads (score >= 2): $($leads.Count)"

# Generate report
$now = Get-Date -Format 'yyyy-MM-dd HH:mm'
$md = @"
# MLWK 建材出海 — 精准客户开发报告

> **生成时间**: $now | **合格线索**: $($leads.Count) 条 | **最低订单**: >`$3,000 | **搜索**: Firecrawl 15次 + WebSearch 8次
>
> ⚠️ **数据说明**: 搜索引擎无法穿透阿里巴巴 RFQ、Houzz 讨论、Reddit 帖子的登录墙。以下线索来自公开索引的网页内容，每条附成交可能性分析。

---

## 📊 线索质量分布

| 评分 | 含义 | 数量 |
|:----:|------|:----:|
| ⭐⭐⭐⭐⭐ | 主动询价/采购：直接可联系 | $($($leads | Where-Object {$_.评分 -eq 5}).Count) |
| ⭐⭐⭐⭐ | 高意向：正在询价或招标阶段 | $($($leads | Where-Object {$_.评分 -eq 4}).Count) |
| ⭐⭐⭐ | 潜在客户：需培养关系 | $($($leads | Where-Object {$_.评分 -eq 3}).Count) |
| ⭐⭐ | 低优先级：需进一步验证 | $($($leads | Where-Object {$_.评分 -eq 2}).Count) |

---

## 🔥 五星线索 — 直接联系

"@

$idx=0
foreach ($l in ($leads | Where-Object {$_.评分 -ge 4} | Sort-Object 评分 -Descending)) {
  $idx++
  $stars = "⭐" * $l.评分
  $md += @"

### $idx. $stars | $($l.类型)
| 字段 | 内容 |
|------|------|
| **日期** | $($l.日期) |
| **区域** | $($l.区域) |
| **来源** | $($l.来源) |
| **标题** | $($l.标题) |
| **分析** | $($l.分析) |
| **链接** | $($l.链接) |
| **摘要** | $($l.摘要) |

"@
}

$md += @"

---

## 🤝 三星线索 — 渠道合作

"@

$idx=0
foreach ($l in ($leads | Where-Object {$_.评分 -eq 3} | Select-Object -First 30)) {
  $idx++
  $md += @"

### $idx. $($l.类型) | $($l.区域)
| 字段 | 内容 |
|------|------|
| **日期** | $($l.日期) |
| **来源** | $($l.来源) |
| **标题** | $($l.标题) |
| **分析** | $($l.分析) |
| **链接** | $($l.链接) |

"@
}

$md += @"

---

## 📋 行动路线图

### 本周立即行动
1. **五星线索** — 逐一访问链接，通过平台私信或评论区联系发帖人
2. 准备一份标准英文介绍模板：MLWK 是谁、做什么、起订量、典型交货期
3. 特别关注 Reddit r/cabinetry 帖 — 那个"homeowner looking to build kitchen cabinets"是直接客户

### 本月持续跟进
4. **中东设计公司** — LinkedIn 添加好友，发送合作邀请
5. **德国/法国工匠** — 用德语/法语发送 OEM 合作邮件
6. **沙特酒店项目** — 关注 INDEX Saudi Arabia 2026（9月利雅得），准备参展

### 建议的获客渠道（工具无法覆盖）
| 渠道 | 操作 | 预期效果 |
|------|------|------|
| **阿里巴巴 RFQ** | 注册卖家账号，搜索 kitchen cabinet 采购需求 | 每日 10-50 条真实询价 |
| **Reddit 直接运营** | 在 r/kitchenremodel, r/cabinetry 发帖介绍 MLWK | 直接接触正在翻新的房主 |
| **Houzz Pro** | 注册为定制橱柜制造商 | 设计师和房主的直接询价 |
| **LinkedIn Sales Navigator** | 筛选 Dubai/London/NYC 室内设计师 | 精准触达决策者 |
| **INDEX Saudi Arabia 2026** | 9月参展利雅得建材展 | 面对面接触沙特采购商 |

---

## ⚠️ 本报告局限性

1. **搜索引擎限制**: 真正的高价值 RFQ（阿里巴巴）和讨论帖（Reddit/Houzz）需要登录才能访问，搜索引擎无法索引
2. **时间准确性**: 部分线索未标注明确日期，时间过滤（qdr:w）基于 Google 索引时间而非原始发布时间
3. **预算推断**: 预算评估基于帖子关键词推断，非实际预算数据
4. **联系方式缺失**: 公开搜索结果通常不包含直接邮箱或电话

> **建议**: 将此报告作为"线索地图"使用，具体联系需在各个平台内完成。如需更高精度线索，建议直接注册 Alibaba/Houzz Pro 账号获取一手询价数据。

---
*报告由 Firecrawl Search + WebSearch 23次搜索自动生成 | MLWK 建材出海项目*
"@

$md | Out-File -FilePath "$outputDir\mlwk-leads-final.md" -Encoding UTF8

# Also export CSV for high-score leads
$leads | Sort-Object 评分 -Descending | Export-Csv -Path "$outputDir\mlwk-leads-final.csv" -NoTypeInformation -Encoding UTF8

Write-Host "Report: $outputDir\mlwk-leads-final.md"
Write-Host "CSV:    $outputDir\mlwk-leads-final.csv"

# Summary stats
Write-Host "`n=== SUMMARY ==="
$leads | Group-Object 评分 | Sort-Object Name -Descending | ForEach-Object { Write-Host "Score $($_.Name): $($_.Count)" }
Write-Host "`nBy Region:"
$leads | Group-Object 区域 | Sort-Object Count -Descending | ForEach-Object { Write-Host "  $($_.Name): $($_.Count)" }
