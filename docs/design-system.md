# CIRMANO 官网设计规范 v1

> 依据：CIRMANO 官网制作品牌资料包 2026-10-23 v01（品牌规范 PDF、建站交接简报、品牌事实与素材说明、基础文案、页面与素材对应表、宣传片 EDL v03）。
> 代码实现：`src/styles/tokens.css`。改值只改这一个文件，组件里不写死颜色、字号或时长。
> 可视化预览：`docs/design-system.html`（本地开静态服务器打开）。

---

## 0. 原则

1. **Quiet luxury，苹果式叙事。** 一屏只讲一件事，大字、大图、大留白，信息按滚动顺序展开。
2. **实拍优先，概念要标注。** 实拍一律写真实空间名；3D 和图纸注明 *Design drawing*；AI 运镜注明 *AI-assisted motion*。
3. **克制用色。** Ink 和 Bone 占画面 95% 以上，Brass 只做“点”，面积不超过约 3%。
4. **统一动效。** 全站只有一条缓动曲线、三档时长、六种动效，不在此列的动效一律不用。
5. **事实不补写。** 只用《品牌事实与素材说明》里已确认的说法。

---

## 1. 品牌标识

| 项目 | 规范 |
|---|---|
| 名称 | CIRMANO / 西尔曼 |
| 口号 | **Made As One**：三个词首字母大写，**不加句号**，作独立口号使用 |
| 描述语 | Integrated Whole-Home Customization / 一体化全屋定制 |
| 原则 | Craftsmanship · System · Aesthetics · Global |
| Logo 文件 | `public/brand/`，复制自资料包 `01_SVG矢量`，不得重绘 |
| 顶栏 Logo | `CIRMANO_wordmark_EN`，高 16px（约 71px 宽）。横版中英组合在规范里要求宽度 ≥ 240px，52px 高的顶栏放不下，所以只用在页脚、首屏 loader 和 About 页 |
| 页脚 Logo | `CIRMANO_horizontal_CNEN_bone`，宽 240px |
| 安全空间 | 每边至少 2x（x = 符号高度 / 8） |
| 最小尺寸 | 横版 ≥ 240px 宽（印刷 40mm）；符号 ≥ 16px |
| 禁止 | 拉伸、旋转、改字距、描边、阴影、渐变；也不要加 ® |
| 浅底 | 用 `_ink` 版；深底和照片上用 `_bone` 版 |

---

## 2. 色彩

### 2.1 品牌色（规范 PDF 01）

| Token | 值 | 用途 | 面积 |
|---|---|---|---|
| `--c-ink` | `#101012` | 正文、标题、深色章节背景、主按钮 | 主 |
| `--c-bone` | `#F3EFE8` | 页面底色、深底上的文字 | 主 |
| `--c-brass` | `#B08D57` | 激活细线、焦点框、图形点缀（小字用 `--c-brass-text`） | ≤ 3% |
| `--c-whisper` | `#8A8781` | 大号次级文字（≥ 24px）、深底上的说明、图标 | 辅 |

**文字安全变体**：品牌色在 Bone 上作小字时对比度不够，所以只调暗明度，不改色相。

| Token | 值 | 对比度（Bone 底） | 用途 |
|---|---|---|---|
| `--c-whisper-text` | `#6A6762` | 4.9:1 | 图注、caption、表单提示等小号次级文字（原 Whisper 只有 3.1:1） |
| `--c-brass-text` | `#7E6236` | 5.0:1 | 页码、小号强调文字（原 Brass 只有 2.7:1）。细线和焦点框仍用原 Brass |

### 2.2 派生色（只有这几种）

| Token | 值 | 用途 |
|---|---|---|
| `--c-bone-bright` | `#FBF9F5` | 卡片和面板，与 Bone 区分层级 |
| `--c-line` | Ink 12% | 分隔线、卡片描边 |
| `--c-line-strong` | Ink 24% | 次按钮描边、表单框 |
| `--c-line-on-ink` | Bone 16% | 深底上的分隔线 |
| `--c-glass` | Bone 85% | 磨砂顶栏，搭配 `saturate(180%) blur(20px)` |
| `--c-veil` | Ink 28% | 菜单展开时页面的压暗层 |

**不要用**：纯黑 `#000`、纯白 `#fff` 的大面积底色，蓝色链接，以及任何饱和色。

### 2.3 材质色（只用于 3D 和插画，不用于 UI）

| Token | 值 | 来源 | 3D 参数（粗糙度 / 金属度） |
|---|---|---|---|
| `--m-walnut` | `#5B3F2C` | 规范 PDF 材质小样 | 0.55 / 0 |
| `--m-light-oak` | `#C9A77C` | 规范 PDF 材质小样 | 0.6 / 0 |
| `--m-grey-stone` | `#7D7A74` | 规范 PDF 材质小样 | 0.8 / 0 |
| `--m-travertine` | `#D9CDB8` | 规范 PDF 材质小样 | 0.7 / 0 |
| `--m-smoked-oak` | `#3B3029` | 实拍 P175 / P179 墙板 | 0.5 / 0 |
| `--m-white-lacquer` | `#ECEBE7` | 实拍 P164 电视墙 | 0.25 / 0 |
| `--m-bronze-glass` | `#4A3F35` | 实拍 P180 玻璃柜 | 0.08 / 0，透光 0.55 |
| `--m-bronze-trim` | `#8C6A43` | 实拍 P183 五金 | 0.35 / 1 |
| `--m-marble-floor` | `#E6E1D8` | 项目地面 | 0.2 / 0 |

---

## 3. 字体

- **英文**：Manrope（`public/fonts/Manrope-VF.ttf`，OFL）。只用 Regular 400 和 Medium 500，与规范 PDF 的建议一致。
- **中文**：Noto Sans SC 完整字体，按需子集加载。资料包里的 `NotoSansSC_CIRMANO_subset.ttf` **只用于品牌字样，不能用于正文**。
  - 现状：站点 CSP 为 `font-src 'self'`，外部字体服务会被拦截。目前中文用系统字体（PingFang SC / Microsoft YaHei）回退；如果要用 Noto Sans SC，需要把许可允许的子集放到本站 `/fonts/` 下自行托管。
- 数字统一用 `font-variant-numeric: tabular-nums`。

| 角色 | Class | 字号 | 字重 | 行高 | 字距 | 用在 |
|---|---|---|---|---|---|---|
| Hero | `.t-hero` | clamp(56, 8vw, 128) | 500 | 1.02 | −0.035em | 首屏口号 |
| Headline | `.t-headline` | clamp(40, 5vw, 80) | 500 | 1.08 | −0.03em | 章节大标题 |
| Title | `.t-title` | clamp(22, 2vw, 28) | 500 | 1.2 | −0.015em | 卡片标题、产品名 |
| Lead | `.t-lead` | clamp(19, 1.5vw, 24) | 400 | 1.45 | 0 | 标题下的一句话 |
| Body | `.t-body` | 17 | 400 | 1.55 | 0 | 正文 |
| Caption | `.t-caption` | 13 | 400 | 1.45 | 0 | 图注、AI 标注、署名 |
| Eyebrow | `.t-eyebrow` | 12 | 500 | 1.4 | 0.16em，全大写 | 眉标、导航小标题 |

- 中文标题不用负字距，统一 +0.02em，眉标不转大写。阿拉伯语字距一律为 0，布局 RTL。
- 正文每行最多约 68 个字符（`max-width: 34em`）。
- 口号出现在标题位置时，一律写成 `Made As One`，不加标点。

---

## 4. 版式

### 4.1 网格

- 12 栏，最大宽度 1440px，外边距 `clamp(20px, 4vw, 64px)`，栏间距 16–24px。
- 全幅媒体（hero、固定滚动区）不受最大宽度限制，文字仍对齐网格。

### 4.2 节奏

| Token | 值 | 用在 |
|---|---|---|
| `--space-section-lg` | 96–160 | 首页章节之间 |
| `--space-section-md` | 72–120 | 内页章节 |
| `--space-section-sm` | 56–80 | 章节内部的分组 |
| `--space-1…8` | 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 | 组件内部 |

### 4.3 章节头母题

沿用资料包制造优势卡 “CIRMANO / MADE AS ONE · 01 / 08” 的版式：

```
CIRMANO / MANUFACTURING ······························ 06 / 10   ← .section-head（细线在下）
The detail behind the finished space.                            ← .t-headline
Panel processing, edge finishing, inspection and trial assembly.  ← .t-lead / Whisper
```

- 左边是眉标，右边是页码，页码用 `--c-brass-text` 和 tabular-nums。
- 首页 10 个章节连续编号 `01 / 10` 到 `10 / 10`。

### 4.4 圆角与层级

- 卡片和媒体 20px；按钮用胶囊形（999px）；小控件 8px。全幅 hero 和固定区不做圆角。
- 阴影只用于展开的菜单（`--shadow-flyout`），卡片用 1px 线条代替阴影。

---

## 5. 组件

| 组件 | 规范 |
|---|---|
| 主按钮 `.btn--primary` | Ink 底、Bone 字，高 44，胶囊形，15px / 500。每屏最多 1 个 |
| 次按钮 `.btn--secondary` | 透明底，Ink 24% 描边，hover 时描边变 Ink |
| 文字链接 `.link-arrow` | 文字后加 `›`，hover 时箭头右移 3px（苹果式“了解更多 ›”） |
| 全局顶栏 | 高 52，磨砂 Bone 85%，底部 1px 线。首页首屏时透明，文字颜色跟随画面明暗 |
| 展开菜单 | 整宽面板，各列错开 40ms 出现，页面压暗 28% 并模糊 |
| 页内导航 | 高 52，吸顶，左侧页面名，右侧锚点链接和 CTA |
| 产品卡 | 圆角 20，竖向构图，图上叠文字（底部 Ink 渐变），hover 时图片 Settle |
| 视频块 | 静音循环，必须有暂停按钮；K 系列镜头角落加 `.ai-note`；带音乐的竖屏片在下方显示 CC BY 署名 |
| 社媒 | Instagram `cirmanoofficial`、Facebook `cirmanoofficial`，线性图标 20px，出现在顶栏菜单底栏、首页 09 章节和页脚 |

---

## 6. 动效系统

**一条缓动**：`--ease: cubic-bezier(.16, 1, .3, 1)`

**三档时长**：UI 200ms · Reveal 600ms · Cinema 1200ms

**六种动效**（全站只用这些）：

| # | 名称 | Class / 实现 | 行为 | 用在 |
|---|---|---|---|---|
| 1 | Rise | `.m-rise` + `.is-in` | 上移 24px 并淡入，600ms | 段落、卡片、按钮组 |
| 2 | Mask line | `.m-mask > span`（`--i` 为行号） | 标题逐行从遮罩中升起，每行间隔 80ms | 章节标题、口号 |
| 3 | Ink fill | `.m-ink-word` + `.is-on` | 长句随滚动逐词从 Ink 22% 变成 Ink | 02 Statement |
| 4 | Pin & scrub | sticky 加滚动进度 | 章节固定，滚动推进 3D、视频帧或标注 | 01 Hero、04 One language |
| 5 | Dissolve | `.m-dissolve` | 媒体交叉溶解 600ms，取自 EDL v03 | 菜单预览、项目空间切换、视频接力 |
| 6 | Settle | `.m-settle` + `.is-in` | 从 1.06 缩到 1，用时 1200ms | 图片和视频首次进入视口 |

**禁止**：弹跳、回弹、旋转、3D 翻转、视差漂浮、打字机效果、粒子、鼠标跟随光标特效，以及超过 1200ms 的 UI 动画。

**运镜原则**（取自宣传片清单）：每个镜头只做一个相机动作，慢速，3–5 秒。

**降级**：开启 `prefers-reduced-motion` 时，所有时长归零，视频显示 poster 静帧，3D 直接显示收尾画面。

---

## 7. 影像

### 7.1 照片

- 只用资料包 `04` 和 `05` 目录里的实拍。图注写真实空间名，例如 *Living room · Guangzhou Residence*。
- 不从照片推断软装、石材或整屋都由 CIRMANO 供货。
- Kitchens 资料包写明缺独立实拍，暂用 P235 餐厨区，并注明 *dining area*。
- 横幅裁切时要保住画面里的柜体，不裁掉产品。

### 7.2 视频

| 类别 | 来源 | 规则 |
|---|---|---|
| AI 运镜 K01–K20 | `10_宣传片制作/kling_raw` | 可用：K01–K09、K11、K14–K17、K19、K20。**禁用**：K10、K12、K18。K13 只能做擦除式转场。必须注明 *Includes AI-assisted motion from real project photography* |
| 工厂实拍 | `06_视频/02_工厂横屏无声片段` | 直接使用，不注明设备台数 |
| 竖屏成片 | `06_视频/01_实拍竖屏` | 不能拉成横屏；带音乐播放时，CC BY 署名要显示在视频旁边 |
| 品牌片参考 | `06_视频/03` | 只作参考，**不放到网站上** |

- 编码：webm（VP9）和 mp4（H.264）。桌面 1080p ≤ 2.5MB，移动端 720p ≤ 1.2MB。poster 用对应的源照片。
- 播放：进入视口才播，离开就暂停，静音循环，必须有暂停控件。

### 7.3 3D 与图纸

- 线条用 Ink，纸面用 Bone，绘图笔触和高亮用 Brass。标注用 Manrope 500，字距 0.16em。
- 3D 段角标写 *Design drawing*，进入实拍后换成 *Completed project · Guangzhou*。
- 3D 引擎基于 flat-to-3d（© Samnang Aing，MIT），许可证附在 `src/hero3d/LICENSE`，页脚注明出处。

---

## 8. 内容规则（“请勿补写”清单）

- Italian style **不写成** Made in Italy；German HOMAG equipment **不写成**德国制造。
- 激光封边要写明只用于 *specified compatible components*；试装只针对 *Selected cabinetry*。
- 95% / 40,000+ m² / 180 staff 由开关 `SHOW_COMPANY_FIGURES` 控制，默认关闭，品牌方书面确认后再打开。
- 不写交期、认证、环保等级、板材品牌、国家数、产能、奖项或客户名单。
- 项目只写一个（Guangzhou Residence），分 7 个空间展示。不出现业主姓名、门牌或户型图。
- 联系方式以名片为准：kai@cirmano.com · +86 186 6638 4092 · wa.me/8618666384092 · 佛山南海狮山。

---

## 9. 无障碍与性能

- 正文对比度 ≥ 4.5:1。Ink 在 Bone 上 16.6:1。原 Whisper 在 Bone 上 3.1:1、Brass 在 Bone 上 2.7:1，所以小字一律用 `--c-whisper-text` 和 `--c-brass-text`。Whisper 在 Ink 底上 5.3:1，可以直接用。
- 焦点框 2px Brass，偏移 3px。所有交互元素点击区域 ≥ 44×44。
- 菜单：用 `aria-expanded` 标示展开状态，Esc 关闭，焦点在菜单内循环，hover 有 120ms 意图延迟。
- LCP 用 SSR 输出的实拍图（P179），three.js 和视频都在 LCP 之后才加载。Cloudflare Pages 单文件 < 25MB。
