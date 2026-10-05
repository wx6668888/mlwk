import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
const origin = "http://127.0.0.1:8767";

function worker() {
  const handlers = new Map();
  const buckets = new Map();
  const key = (request) => new URL(typeof request === "string" ? request : request.url, origin).href;
  const state = { online: true, networkCalls: 0, skipCalls: 0, precached: [], headers: {}, redirected: false };
  const caches = {
    async open(name) {
      if (!buckets.has(name)) buckets.set(name, new Map());
      const entries = buckets.get(name);
      return {
        async addAll(paths) {
          state.precached.push(...paths);
          for (const path of paths) entries.set(key(path), new Response(`Cached ${path}`));
        },
        async put(request, response) { entries.set(key(request), response.clone()); },
        async match(request) { return entries.get(key(request))?.clone(); },
        async keys() { return [...entries.keys()].map((url) => ({ url })); },
        async delete(request) { return entries.delete(key(request)); },
      };
    },
    async keys() { return [...buckets.keys()]; },
    async delete(name) { return buckets.delete(name); },
  };
  const self = {
    location: { origin }, clients: { async claim() {} },
    skipWaiting() { state.skipCalls++; },
    addEventListener(type, handler) { handlers.set(type, handler); },
  };
  vm.runInNewContext(source, {
    self, caches, URL, Response,
    async fetch() {
      state.networkCalls++;
      if (!state.online) throw new TypeError("Offline");
      const response = new Response("Network page", { headers: state.headers });
      if (state.redirected) Object.defineProperty(response, "redirected", { value: true });
      return response;
    },
  });
  async function dispatch(type, request, data) {
    const pending = [];
    let response;
    handlers.get(type)({ request, data, waitUntil(task) { pending.push(task); }, respondWith(task) { response = task; } });
    const result = response ? await response : null;
    await Promise.all(pending);
    return result;
  }
  const fetchPage = (path, mode = "navigate", method = "GET") => dispatch("fetch", { url: new URL(path, origin).href, mode, method });
  return { state, buckets, dispatch, fetchPage };
}

test("the shell prepares all language homepages without downloading the villa", async () => {
  const app = worker();
  await app.dispatch("install");
  for (const lang of ["en", "ar", "zh", "de", "fr"]) assert.ok(app.state.precached.includes(`/${lang}/`));
  assert.ok(app.state.precached.every((path) => !path.includes("walkthrough") && !/\.(?:glb|hdr|mp4)$/.test(path)));
  assert.equal(app.state.skipCalls, 0);
});

test("API, account, checkout, other origins and writes bypass interception", async () => {
  const app = worker();
  app.state.online = false;
  for (const path of ["/api/account/projects", "/api/store/context", "/zh/account/projects", "/ar/checkout", "/en/order/123/confirmation", "https://another.example/assets/app.js"]) {
    assert.equal(await app.fetchPage(path), null);
  }
  assert.equal(await app.fetchPage("/zh/", "navigate", "POST"), null);
  assert.equal(app.state.networkCalls, 0);
  assert.equal(app.buckets.size, 0);
});

test("a visited public page opens offline, while an uncached villa shows the fallback", async () => {
  const app = worker();
  await app.dispatch("install");
  await app.fetchPage("/zh/company");
  app.state.online = false;
  assert.equal(await (await app.fetchPage("/zh/company")).text(), "Network page");
  assert.equal(await (await app.fetchPage("/walkthrough/villa-c/?siteLang=zh")).text(), "Cached /offline");
});

test("query pages and responses marked private or no-store are not saved", async () => {
  const app = worker();
  await app.dispatch("install");
  await app.fetchPage("/zh/company?temporary=1");
  for (const directive of ["private", "no-store"]) {
    app.state.headers = { "Cache-Control": directive };
    await app.fetchPage(`/zh/projects/${directive}`);
  }
  app.state.online = false;
  for (const path of ["/zh/company?temporary=1", "/zh/projects/private", "/zh/projects/no-store"]) {
    assert.equal(await (await app.fetchPage(path)).text(), "Cached /offline");
  }
});

test("models, textures and videos are network-only", async () => {
  const app = worker();
  for (const path of ["/walkthrough/villa-c/assets/model.glb", "/walkthrough/villa-c/assets/sky.hdr", "/media/hero.mp4"]) {
    assert.equal(await app.fetchPage(path, "cors"), null);
  }
  assert.equal(app.buckets.size, 0);
});

test("cached redirected pages can be returned to an offline navigation", async () => {
  const app = worker();
  app.state.redirected = true;
  await app.fetchPage("/");
  app.state.online = false;
  const cached = await app.fetchPage("/");
  assert.equal(cached.redirected, false);
  assert.equal(await cached.text(), "Network page");
});

test("cache growth is bounded and the offline fallback is retained", async () => {
  const app = worker();
  await app.dispatch("install");
  for (let i = 0; i < 80; i++) await app.fetchPage(`/zh/projects/example-${i}`);
  const entries = [...app.buckets.values()][0];
  assert.equal(entries.size, 64);
  assert.ok(entries.has(`${origin}/offline`));
});

test("query variants of shell assets cannot bypass the cache limit", async () => {
  const app = worker();
  await app.dispatch("install");
  for (let i = 0; i < 80; i++) await app.fetchPage(`/pwa/shell.js?v=${i}`, "cors");
  const entries = [...app.buckets.values()][0];
  assert.equal(entries.size, 64);
  assert.ok(entries.has(`${origin}/pwa/shell.js`));
});

test("homepage aliases use the installed locale homepage when offline", async () => {
  const app = worker();
  await app.dispatch("install");
  app.state.online = false;
  assert.equal(await (await app.fetchPage("/zh")).text(), "Cached /zh/");
  assert.equal(await (await app.fetchPage("/")).text(), "Cached /en/");
});

test("updates activate only after an explicit update message and delete only owned caches", async () => {
  const app = worker();
  app.buckets.set("another-app", new Map());
  app.buckets.set("mlwk-pwa-old", new Map());
  await app.dispatch("install");
  assert.equal(app.state.skipCalls, 0);
  await app.dispatch("message", undefined, { type: "MLWK_SKIP_WAITING" });
  assert.equal(app.state.skipCalls, 1);
  await app.dispatch("activate");
  assert.ok(app.buckets.has("another-app"));
  assert.ok(!app.buckets.has("mlwk-pwa-old"));
});
