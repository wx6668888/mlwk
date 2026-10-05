const offlineCopy = {
  en: ["You are offline", "Previously visited public pages may still be available. The 3D villa needs a connection to load its models.", "Try again", "Home"],
  zh: ["当前离线", "已访问过的部分公开页面仍可查看。别墅漫游需要联网加载模型，请恢复网络后重试。", "重新尝试", "返回首页"],
  ar: ["أنت غير متصل بالإنترنت", "قد تظل الصفحات العامة التي زرتها متاحة. تحتاج جولة الفيلا ثلاثية الأبعاد إلى اتصال لتحميل النماذج.", "حاول مجدداً", "الرئيسية"],
  de: ["Sie sind offline", "Bereits besuchte öffentliche Seiten sind möglicherweise verfügbar. Die 3D-Villa benötigt eine Verbindung zum Laden der Modelle.", "Erneut versuchen", "Startseite"],
  fr: ["Vous êtes hors ligne", "Certaines pages publiques déjà consultées restent disponibles. La villa 3D nécessite une connexion pour charger les modèles.", "Réessayer", "Accueil"],
};
const candidate = location.pathname.split("/")[1];
const siteLanguage = new URLSearchParams(location.search).get("siteLang");
const language = offlineCopy[candidate] ? candidate : offlineCopy[siteLanguage] ? siteLanguage : "en";
document.documentElement.lang = language;
document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
const [title, description, retry, home] = offlineCopy[language];
document.getElementById("offline-title").textContent = title;
document.getElementById("offline-description").textContent = description;
const retryButton = document.getElementById("offline-retry");
retryButton.textContent = retry;
retryButton.addEventListener("click", () => location.reload());
const homeLink = document.getElementById("offline-home");
homeLink.textContent = home;
homeLink.href = `/${language}/`;
