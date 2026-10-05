const siteLanguages = new Set(["en", "ar", "zh", "de", "fr"]);
const requested = new URLSearchParams(location.search).get("siteLang");
const siteLanguage = siteLanguages.has(requested) ? requested : "en";
const backLink = document.getElementById("mlwkBack");
backLink.href = `/${siteLanguage}/`;

const backLabels = { ar: "العودة إلى MLWK", en: "Back to MLWK", zh: "返回 MLWK" };
const creditLabels = { ar: "مصادر النماذج", en: "Model credits", zh: "模型来源" };
const controlLabels = {
  ar: ["إخفاء الأدوات", "إظهار الأدوات"],
  en: ["Hide controls", "Show controls"],
  zh: ["隐藏控件", "显示控件"],
};
const toggle = document.getElementById("chromeToggle");
const chrome = document.querySelectorAll(".topbar .brand, .top-actions > :not(#chromeToggle), .notice, .explore-dock, .control-bar, .help-panel, .map-panel, .touch-controls, .lookpad, .reticle");
let controlsHidden = false;
const controlBar = document.querySelector(".control-bar");
new ResizeObserver(() => {
  const height = controlBar.getBoundingClientRect().height;
  if (height > 0) document.documentElement.style.setProperty("--mlwk-control-height", `${height}px`);
}).observe(controlBar);

function updateControlLabel() {
  const labels = controlLabels[document.documentElement.lang] || controlLabels.en;
  const label = labels[controlsHidden ? 1 : 0];
  toggle.setAttribute("aria-label", label);
  toggle.setAttribute("aria-pressed", String(controlsHidden));
  toggle.title = label;
  document.getElementById("chromeToggleLabel").textContent = label;
}

toggle.addEventListener("click", () => {
  controlsHidden = !controlsHidden;
  document.body.classList.toggle("controls-hidden", controlsHidden);
  chrome.forEach((node) => {
    node.inert = controlsHidden;
    node.classList.toggle("scene-chrome-hidden", controlsHidden);
  });
  updateControlLabel();
});

function updateLabels() {
  const language = document.documentElement.lang;
  const label = backLabels[language] || backLabels.en;
  backLink.setAttribute("aria-label", label);
  backLink.title = label;
  document.getElementById("modelCredits").textContent = creditLabels[language] || creditLabels.en;
  updateControlLabel();
}
window.addEventListener("langchange", updateLabels);
updateLabels();
