const languages = new Set(["en", "ar", "zh", "de", "fr"]);
const copy = {
  en: { title: "Install MLWK", desktop: "In Chrome or Edge, choose Install app from the browser menu or address bar.", ios: "On iPhone or iPad, open in Safari, tap Share, then Add to Home Screen.", close: "Close", update: "A new version of MLWK is ready.", refresh: "Refresh to update", later: "Later", offline: "You are offline" },
  zh: { title: "安装 MLWK", desktop: "Chrome 或 Edge：点击地址栏的安装图标，或在浏览器菜单中选择“安装应用”。", ios: "iPhone 或 iPad：用 Safari 打开，点“分享”，再选“添加到主屏幕”。", close: "关闭", update: "MLWK 有新版本可用。", refresh: "刷新更新", later: "稍后", offline: "当前离线" },
  ar: { title: "تثبيت MLWK", desktop: "في Chrome أو Edge، اختر تثبيت التطبيق من قائمة المتصفح أو شريط العنوان.", ios: "على iPhone أو iPad، افتح في Safari واضغط مشاركة ثم إضافة إلى الشاشة الرئيسية.", close: "إغلاق", update: "يتوفر إصدار جديد من MLWK.", refresh: "تحديث الآن", later: "لاحقاً", offline: "أنت غير متصل بالإنترنت" },
  de: { title: "MLWK installieren", desktop: "In Chrome oder Edge: App installieren im Browsermenü oder in der Adressleiste wählen.", ios: "Auf iPhone oder iPad: in Safari öffnen, Teilen und Zum Home-Bildschirm wählen.", close: "Schließen", update: "Eine neue MLWK-Version ist verfügbar.", refresh: "Aktualisieren", later: "Später", offline: "Sie sind offline" },
  fr: { title: "Installer MLWK", desktop: "Dans Chrome ou Edge, choisissez Installer l’application dans le menu ou la barre d’adresse.", ios: "Sur iPhone ou iPad, ouvrez Safari, touchez Partager puis Sur l’écran d’accueil.", close: "Fermer", update: "Une nouvelle version de MLWK est disponible.", refresh: "Actualiser", later: "Plus tard", offline: "Vous êtes hors ligne" },
};
let installPrompt;
let registration;
let refreshing = false;
let dismissedUpdate = false;
let dialog;
let updateBar;
let offlineBadge;

function locale() {
  const siteLanguage = new URLSearchParams(location.search).get("siteLang");
  const fromPath = location.pathname.split("/")[1];
  return languages.has(fromPath) ? fromPath : languages.has(siteLanguage) ? siteLanguage : languages.has(document.documentElement.lang) ? document.documentElement.lang : "en";
}

function text() { return copy[locale()]; }
function standalone() { return matchMedia("(display-mode: standalone)").matches || navigator.standalone === true; }
function updateMetadata() {
  const link = document.querySelector('link[rel="manifest"]');
  if (link) link.setAttribute("href", `/pwa/${locale()}.webmanifest`);
  document.documentElement.classList.toggle("pwa-standalone", standalone());
  if (offlineBadge) offlineBadge.textContent = text().offline;
  if (updateBar) {
    updateBar.querySelector("span").textContent = text().update;
    updateBar.querySelector(".pwa-action").textContent = text().refresh;
    updateBar.querySelector(".pwa-later").textContent = text().later;
  }
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
});
window.addEventListener("appinstalled", () => {
  installPrompt = null;
  dialog?.close();
  document.documentElement.classList.add("pwa-standalone");
});

function element(tag, content, className) {
  const node = document.createElement(tag);
  if (content) node.textContent = content;
  if (className) node.className = className;
  return node;
}

function showHelp() {
  if (!dialog) {
    dialog = element("dialog", "", "pwa-install-dialog");
    dialog.id = "pwa-install-help";
    dialog.setAttribute("aria-labelledby", "pwa-install-title");
    document.body.append(dialog);
  }
  dialog.replaceChildren();
  const icon = element("img");
  icon.src = "/pwa/icon-192.png";
  icon.alt = "";
  const title = element("h2", text().title);
  title.id = "pwa-install-title";
  const close = element("button", text().close, "pwa-action");
  close.type = "button";
  close.addEventListener("click", () => dialog.close());
  dialog.append(icon, title, element("p", text().desktop), element("p", text().ios), close);
  dialog.showModal();
}

document.addEventListener("click", async (event) => {
  if (!(event.target instanceof Element) || !event.target.closest("[data-pwa-install]")) return;
  if (standalone()) return;
  if (!installPrompt) { showHelp(); return; }
  const prompt = installPrompt;
  installPrompt = null;
  try { await prompt.prompt(); await prompt.userChoice; } catch { showHelp(); }
});

function showUpdate() {
  if (!registration?.waiting || dismissedUpdate || updateBar) return;
  updateBar = element("aside", "", "pwa-update-bar");
  updateBar.setAttribute("role", "status");
  const refresh = element("button", text().refresh, "pwa-action");
  refresh.type = "button";
  refresh.addEventListener("click", () => {
    if (!registration.waiting) { location.reload(); return; }
    refreshing = true;
    registration.waiting.postMessage({ type: "MLWK_SKIP_WAITING" });
  });
  const later = element("button", text().later, "pwa-later");
  later.type = "button";
  later.addEventListener("click", () => { dismissedUpdate = true; updateBar.remove(); updateBar = null; });
  updateBar.append(element("span", text().update), refresh, later);
  document.body.append(updateBar);
}

function updateOnline() {
  if (!navigator.onLine && !offlineBadge) {
    offlineBadge = element("div", text().offline, "pwa-offline-badge");
    offlineBadge.setAttribute("role", "status");
    document.body.append(offlineBadge);
  } else if (navigator.onLine && offlineBadge) { offlineBadge.remove(); offlineBadge = null; }
}
window.addEventListener("online", updateOnline);
window.addEventListener("offline", updateOnline);
new MutationObserver(updateMetadata).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
matchMedia("(display-mode: standalone)").addEventListener("change", updateMetadata);
updateMetadata();
updateOnline();

if ("serviceWorker" in navigator && window.isSecureContext) {
  navigator.serviceWorker.addEventListener("controllerchange", () => { if (refreshing) location.reload(); });
  navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).then((result) => {
    registration = result;
    showUpdate();
    result.addEventListener("updatefound", () => {
      const worker = result.installing;
      worker?.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) showUpdate();
      });
    });
  }).catch((error) => console.warn("MLWK app shell registration failed", error));
}
