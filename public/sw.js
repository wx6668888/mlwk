const PREFIX = "mlwk-pwa-";
const VERSION = "__MLWK_PWA_VERSION__";
const CACHE = `${PREFIX}${VERSION}`;
const MAX_ENTRIES = 64;
// Cloudflare serves offline.html at /offline; precache the canonical, unredirected URL.
const OFFLINE_URL = "/offline";
const APP_SHELL = []; // build:app-shell
const SHELL = [OFFLINE_URL, "/pwa/offline.js", "/pwa/shell.js", "/pwa/shell.css", "/pwa/icon-192.png", "/pwa/icon-512.png", "/pwa/apple-touch-icon.png", "/site.webmanifest", ...["en", "ar", "zh", "de", "fr"].map((lang) => `/${lang}/`), ...APP_SHELL];
const SHELL_URLS = new Set(SHELL.map((path) => new URL(path, self.location.origin).href));

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith(PREFIX) && name !== CACHE).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "MLWK_SKIP_WAITING") self.skipWaiting();
});

function privatePath(path) {
  return /^\/api(?:\/|$)/.test(path) || /^\/(?:en|ar|zh|de|fr)\/(?:account|admin|auth|login|cart|checkout|order|quote)(?:\/|$)/.test(path);
}

function publicPage(path) {
  return path === "/" || /^\/(?:en|ar|zh|de|fr)$/.test(path) || /^\/(?:en|ar|zh|de|fr)\/(?:$|(?:collections|solutions|projects|capabilities|company|resources|designer|privacy|terms|shipping|returns)(?:\/|$))/.test(path);
}

function navigationKey(request, url) {
  if (url.pathname === "/") return new URL("/en/", url).href;
  const home = /^\/(en|ar|zh|de|fr)\/?$/.exec(url.pathname);
  return home ? new URL(`/${home[1]}/`, url).href : request;
}

async function store(request, response) {
  if (!response.ok || response.type === "opaque") return;
  if (/\b(?:private|no-store)\b/i.test(response.headers.get("Cache-Control") || "")) return;
  if (response.url && privatePath(new URL(response.url).pathname)) return;
  const cache = await caches.open(CACHE);
  const saved = response.redirected
    ? new Response(response.clone().body, { status: response.status, statusText: response.statusText, headers: response.headers })
    : response.clone();
  await cache.put(request, saved);
  const entries = await cache.keys();
  const removable = entries.filter((entry) => !SHELL_URLS.has(entry.url));
  await Promise.all(removable.slice(0, Math.max(0, entries.length - MAX_ENTRIES)).map((entry) => cache.delete(entry)));
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || privatePath(url.pathname)) return;

  if (request.mode === "navigate") {
    const key = navigationKey(request, url);
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (publicPage(url.pathname) && !url.search) event.waitUntil(store(key, response));
        return response;
      } catch {
        const cache = await caches.open(CACHE);
        const previous = publicPage(url.pathname) && !url.search ? await cache.match(key) : null;
        return previous || await cache.match(OFFLINE_URL) || new Response("MLWK needs a connection to open this page.", { status: 503 });
      }
    })());
    return;
  }

  // 3D models, textures, videos and user data are fetched normally, without an automatic bulk cache.
  const shellAsset = url.pathname.startsWith("/pwa/") || url.pathname === "/site.webmanifest";
  const appAsset = /^\/assets\/[^/]+\.(?:js|css)$/.test(url.pathname);
  if (!shellAsset && !appAsset) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    event.waitUntil(store(request, response));
    return response;
  })());
});
