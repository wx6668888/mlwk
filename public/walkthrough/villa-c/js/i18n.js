export const LANGS = ['ar', 'en', 'zh'];

const dictionaries = {
  ar: {
    'language.label': 'اللغة', 'canvas.label': 'مشهد معماري ثلاثي الأبعاد لفيلا C', 'brand.label': 'فيلا C، مورسيا، الرياض',
    'action.export': 'تصدير النموذج', 'status.loading': 'جارٍ تحميل المشهد', 'action.reset': 'إعادة ضبط المنظور',
    'action.reset.short': 'إعادة ضبط', 'notice': 'الوحدة الطرفية C · نموذج هندسي من ملف PDF · إعادة بناء للمحيط',
    'dock.label': 'أدوات الاستكشاف', 'scope.label': 'نطاق العرض', 'scope.exterior': 'خارجي', 'scope.interior': 'داخلي', 'scope.whole': 'كامل الفيلا',
    'nav.rooms': 'التنقل بين المساحات', 'view.street': 'الشارع', 'view.entrance': 'المدخل', 'view.living': 'المجلس والمعيشة', 'view.courtyard': 'الفناء الداخلي', 'view.stairs': 'السلم', 'view.first': 'الدور الأول', 'view.second': 'الدور الثاني', 'view.aerial': 'منظر شامل',
    'style.label': 'أنماط التصميم', 'style.modern': 'عصري', 'style.luxury': 'فخامة إيطالية', 'style.gulf': 'خليجي معاصر',
    'furnish.on': 'إظهار الأثاث', 'furnish.off': 'إخفاء الأثاث', 'controls.label': 'التجول والطوابق', 'mode.label': 'طريقة العرض', 'mode.orbit': 'استعراض', 'mode.walk': 'تجول', 'mode.free': 'طيران حر', 'view.whole': 'المنزل كاملاً',
    'floor.label': 'عرض الطابق', 'floor.all': 'الكل', 'floor.0': 'الأرضي', 'floor.1': 'الأول', 'floor.2': 'الثاني', 'tour.start': 'جولة تلقائية', 'tour.stop': 'إيقاف الجولة', 'walk.start': 'بدء التجول',
    'help.label': 'تعليمات التحكم', 'help.look': 'النظر', 'help.look.value': 'اسحب لتغيير المنظور', 'help.move': 'الحركة', 'help.move.value': 'WASD / مفاتيح الأسهم', 'help.steps': 'الدرج', 'help.steps.value': 'صعود تلقائي', 'help.release': 'تحرير الفأرة', 'help.hint': 'اختر اسم مساحة للانتقال إليها مباشرة', 'help.touch': 'تحرك يسارًا · حرّك المنظور يمينًا',
    'map.label': 'مخطط الموقع الحالي', 'map.street': 'جهة الشارع ↑', 'map.floor': 'مخطط الطابق والموقع الحالي', 'touch.label': 'أدوات الحركة باللمس', 'touch.up': 'تحرك للأمام', 'touch.left': 'تحرك لليسار', 'touch.right': 'تحرك لليمين', 'touch.down': 'تحرك للخلف', 'lookpad.label': 'اسحب لضبط اتجاه النظر',
    'loading.build': 'جارٍ تجهيز المساحة', 'loading.renderer': 'جارٍ تهيئة العرض', 'loading.materials': 'جارٍ تحميل الخامات الواقعية', 'loading.sky': 'جارٍ تحميل السماء والإضاءة', 'loading.architecture': 'جارٍ إنشاء المبنى', 'loading.shaders': 'جارٍ تجهيز المظللات', 'loading.failed': 'تعذر تحميل المشهد: {message}',
    'export.unavailable': 'تصدير النموذج غير متاح حاليًا (بسبب الخامات كبيرة الحجم)', 'status.outdoor': 'في الخارج', 'status.exterior': 'استعراض الواجهة',
    'level.ground': 'الأرضي', 'level.first': 'الأول', 'level.second': 'الثاني', 'map.ground': 'GF · الأرضي', 'map.first': 'FF · الأول', 'map.second': 'SF · الثاني',
    'time.morning': 'الصباح', 'time.noon': 'الظهيرة', 'time.afternoon': 'بعد الظهر', 'time.sunset': 'الغروب',
    'room.bath': 'الحمّام', 'room.kitchen': 'المطبخ', 'room.majlis': 'المجلس', 'room.living': 'المعيشة والطعام', 'room.bed': 'غرفة النوم', 'room.dresser': 'غرفة الملابس', 'room.pantry': 'المخزن', 'room.service': 'غرفة الخدمات', 'room.hall': 'الممر', 'room.stair': 'السلم', 'room.terrace': 'الشرفة', 'room.outdoor': 'الفناء الخارجي', 'room.garage': 'موقف السيارات', 'room.roof': 'السطح'
  },
  en: {
    'language.label': 'Language', 'canvas.label': 'Villa C 3D architectural scene', 'brand.label': 'Villa C, Murcia, Riyadh',
    'action.export': 'Export model', 'status.loading': 'Loading scene', 'action.reset': 'Reset view', 'action.reset.short': 'Reset',
    'notice': 'Villa C end unit · PDF-based geometry model · surrounding context reconstructed',
    'dock.label': 'Explore controls', 'scope.label': 'VIEW SCOPE', 'scope.exterior': 'Exterior', 'scope.interior': 'Interior', 'scope.whole': 'Full villa',
    'nav.rooms': 'Room navigation', 'view.street': 'Street', 'view.entrance': 'Entrance', 'view.living': 'Living & dining', 'view.courtyard': 'Courtyard', 'view.stairs': 'Stairs', 'view.first': 'First floor', 'view.second': 'Second floor', 'view.aerial': 'Aerial view',
    'style.label': 'DESIGN STYLE', 'style.modern': 'Modern', 'style.luxury': 'Italian Luxe', 'style.gulf': 'Contemporary Gulf',
    'furnish.on': 'Furniture on', 'furnish.off': 'Furniture off', 'controls.label': 'Walkthrough and floors', 'mode.label': 'Navigation mode', 'mode.orbit': 'Orbit', 'mode.walk': 'Walk', 'mode.free': 'Free fly', 'view.whole': 'Whole house',
    'floor.label': 'Show floor', 'floor.all': 'All', 'floor.0': 'Ground', 'floor.1': 'First', 'floor.2': 'Second', 'tour.start': 'Auto tour', 'tour.stop': 'Stop tour', 'walk.start': 'Start walkthrough',
    'help.label': 'View controls', 'help.look': 'Look', 'help.look.value': 'Drag to look around', 'help.move': 'Move', 'help.move.value': 'WASD / arrow keys (Free fly: Space/E up, C/Q down, Shift fast)', 'help.steps': 'Steps', 'help.steps.value': 'Automatic step-up', 'help.release': 'Release mouse', 'help.hint': 'Select a room to jump to it', 'help.touch': 'Move on the left · look on the right',
    'map.label': 'Current location map', 'map.street': 'Street side ↑', 'map.floor': 'Floor plan and current position', 'touch.label': 'Touch movement controls', 'touch.up': 'Move forward', 'touch.left': 'Move left', 'touch.right': 'Move right', 'touch.down': 'Move backward', 'lookpad.label': 'Drag to adjust view direction',
    'loading.build': 'Preparing the space', 'loading.renderer': 'Initializing renderer', 'loading.materials': 'Loading material textures', 'loading.sky': 'Loading sky and lighting', 'loading.architecture': 'Building architecture', 'loading.shaders': 'Compiling shaders', 'loading.failed': 'Scene failed to load: {message}',
    'export.unavailable': 'Model export is not available yet (large texture assets)', 'status.outdoor': 'Outdoors', 'status.exterior': 'Exterior view',
    'level.ground': 'Ground floor', 'level.first': 'First floor', 'level.second': 'Second floor', 'map.ground': 'GF · Ground', 'map.first': 'FF · First', 'map.second': 'SF · Second',
    'time.morning': 'Morning', 'time.noon': 'Noon', 'time.afternoon': 'Afternoon', 'time.sunset': 'Sunset',
    'room.bath': 'Bathroom', 'room.kitchen': 'Kitchen', 'room.majlis': 'Majlis', 'room.living': 'Living & dining', 'room.bed': 'Bedroom', 'room.dresser': 'Dressing room', 'room.pantry': 'Pantry', 'room.service': 'Service room', 'room.hall': 'Hallway', 'room.stair': 'Stairs', 'room.terrace': 'Terrace', 'room.outdoor': 'Outdoor area', 'room.garage': 'Garage', 'room.roof': 'Roof'
  },
  zh: {
    'language.label': '语言', 'canvas.label': 'Villa C 三维建筑场景', 'brand.label': 'Villa C，Murcia，Riyadh', 'action.export': '下载模型', 'status.loading': '加载场景', 'action.reset': '恢复初始视角', 'action.reset.short': '复位',
    'notice': 'C镜像端户 · PDF几何草模 · 周边参考还原', 'dock.label': '浏览控制', 'scope.label': '预览范围', 'scope.exterior': '外观', 'scope.interior': '室内', 'scope.whole': '全屋', 'nav.rooms': '空间定位',
    'view.street': '道路', 'view.entrance': '入口', 'view.living': '客餐厅', 'view.courtyard': '中庭', 'view.stairs': '楼梯', 'view.first': '二层', 'view.second': '三层', 'view.aerial': '全景', 'style.label': '设计风格', 'style.modern': '现代', 'style.luxury': '意式轻奢', 'style.gulf': '当代中东',
    'furnish.on': '带家具', 'furnish.off': '不带家具', 'controls.label': '漫游和楼层', 'mode.label': '操作方式', 'mode.orbit': '环绕', 'mode.walk': '步行', 'mode.free': '自由飞行', 'view.whole': '整屋', 'floor.label': '显示楼层', 'floor.all': '全部', 'floor.0': '首层', 'floor.1': '二层', 'floor.2': '三层', 'tour.start': '自动参观', 'tour.stop': '停止参观', 'walk.start': '进入漫游',
    'help.label': '查看操作说明', 'help.look': '看向', 'help.look.value': '拖动视角', 'help.move': '移动', 'help.move.value': 'WASD / 方向键（自由飞行：空格/E 上升，C/Q 下降，Shift 加速）', 'help.steps': '台阶', 'help.steps.value': '自动迈步', 'help.release': '释放鼠标', 'help.hint': '点击空间名称可快速到达', 'help.touch': '左侧移动 · 右侧滑动看向',
    'map.label': '当前位置示意图', 'map.street': '临街 ↑', 'map.floor': '楼层平面与当前位置', 'touch.label': '触摸移动控制', 'touch.up': '向前移动', 'touch.left': '向左移动', 'touch.right': '向右移动', 'touch.down': '向后移动', 'lookpad.label': '滑动调整看向', 'loading.build': '正在构建空间', 'loading.renderer': '初始化渲染器', 'loading.materials': '载入真实材质贴图', 'loading.sky': '载入天空与光照', 'loading.architecture': '构建建筑', 'loading.shaders': '编译着色器', 'loading.failed': '场景加载失败：{message}',
    'export.unavailable': '模型导出暂未启用（含大尺寸贴图）', 'status.outdoor': '室外', 'status.exterior': '外观浏览', 'level.ground': '首层', 'level.first': '二层', 'level.second': '三层', 'map.ground': 'GF · 首层', 'map.first': 'FF · 二层', 'map.second': 'SF · 三层',
    'time.morning': '上午', 'time.noon': '正午', 'time.afternoon': '午后', 'time.sunset': '傍晚', 'room.bath': '卫生间', 'room.kitchen': '厨房', 'room.majlis': '会客厅', 'room.living': '起居 / 餐厅', 'room.bed': '卧室', 'room.dresser': '更衣室', 'room.pantry': '茶水间', 'room.service': '服务用房', 'room.hall': '走廊', 'room.stair': '楼梯', 'room.terrace': '露台', 'room.outdoor': '庭院', 'room.garage': '车库', 'room.roof': '屋顶'
  }
};

let currentLang = 'ar';
let furnishObserver;

export function t(key, vars = {}) {
  const template = dictionaries[currentLang]?.[key] ?? dictionaries.en[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? `{${name}}`));
}

function translateDOM() {
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    for (const entry of el.dataset.i18nAttr.split(';')) {
      const [attr, key] = entry.trim().split(':');
      if (attr && key) el.setAttribute(attr, t(key));
    }
  });
  document.querySelectorAll('[data-lang]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.lang === currentLang)));
  const furnish = document.getElementById('furnishToggle');
  if (furnish) furnish.textContent = t(furnish.getAttribute('aria-pressed') === 'true' ? 'furnish.on' : 'furnish.off');
}

export function getLang() { return currentLang; }

export function setLang(lang) {
  if (!LANGS.includes(lang)) return currentLang;
  currentLang = lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  try { localStorage.setItem('villa.lang', lang); } catch {}
  translateDOM();
  window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  return currentLang;
}

export function initI18n() {
  const queryLang = new URLSearchParams(location.search).get('lang');
  let storedLang = null;
  try { storedLang = localStorage.getItem('villa.lang'); } catch {}
  const browserLang = navigator.language?.slice(0, 2).toLowerCase();
  setLang(LANGS.includes(queryLang) ? queryLang : LANGS.includes(storedLang) ? storedLang : LANGS.includes(browserLang) ? browserLang : 'ar');
  document.querySelectorAll('[data-lang]').forEach((button) => button.addEventListener('click', () => setLang(button.dataset.lang)));
  const furnish = document.getElementById('furnishToggle');
  if (furnish && !furnishObserver) {
    furnishObserver = new MutationObserver(() => { furnish.textContent = t(furnish.getAttribute('aria-pressed') === 'true' ? 'furnish.on' : 'furnish.off'); });
    furnishObserver.observe(furnish, { attributes: true, attributeFilter: ['aria-pressed'] });
  }
}
