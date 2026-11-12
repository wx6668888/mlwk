import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import assert from "node:assert/strict";

function runtime() {
  const messages = [], listeners = {};
  let ticks = 0;
  const window = {
    parent: { postMessage: (message) => messages.push(message) },
    addEventListener: (name, callback) => { listeners[name] = callback; },
  };
  class Group { traverseVisible(visit) { visit(this); } }
  vm.runInNewContext(readFileSync(new URL("../public/casa/startup.js", import.meta.url), "utf8"), {
    window, THREE: { Group }, document: { getElementById: () => null },
    location: { origin: "https://example.test", search: "" }, URLSearchParams,
    setTimeout: (callback, delay) => { if (!delay || delay < 10000) queueMicrotask(callback); return 1; },
    clearTimeout: () => {}, performance: { now: () => ++ticks * 10 },
    Set, Promise, AbortController, fetch,
  });
  return { api: window.CIRMANO_STARTUP, state: window.__cirmanoStartup, messages, listeners };
}

test("GPU compilation yields in batches and does not reparent scene objects", async () => {
  const { api, messages } = runtime();
  const parent = {}, objects = Array.from({ length: 35 }, () => ({ material: {}, parent }));
  const scene = { traverse: (visit) => objects.forEach(visit) }, camera = {};
  const sizes = [];
  await api.compile({ getContext: () => ({ isContextLost: () => false }),
    compileAsync: async (batch, receivedCamera, target) => {
      assert.equal(receivedCamera, camera); assert.equal(target, scene);
      let count = 0; batch.traverse((object) => { if (object.material) count++; }); sizes.push(count);
    },
  }, scene, camera);
  assert.deepEqual(sizes, [16, 16, 3]);
  assert.ok(objects.every((object) => object.parent === parent));
  assert.equal(messages.at(-1).completed, 35);
});

test("texture uploads deduplicate references and include shader uniforms and preload", async () => {
  const { api, messages } = runtime();
  const a = { isTexture: true }, b = { isTexture: true }, c = { isTexture: true };
  const uploaded = [];
  await api.upload({ getContext: () => ({ isContextLost: () => false }), initTexture: (texture) => uploaded.push(texture) },
    { traverse: (visit) => visit({ material: [{ map: a, normalMap: a, uniforms: { image: { value: b } } }] }) }, [c, a]);
  assert.deepEqual(uploaded, [a, b, c]);
  assert.equal(messages.at(-1).completed, 3);
});

test("failed texture requests retry and settle only once", async () => {
  const { api } = runtime();
  let requests = 0, resolved = 0, rejected = 0;
  await new Promise((resolve) => api.image({ load(_url, onLoad, _progress, onError) {
    if (++requests < 3) onError(new Error("temporary network error"));
    else onLoad({ dispose() {} });
  } }, "/texture.jpg", () => { resolved++; resolve(); }, () => { rejected++; resolve(); }));
  assert.equal(requests, 3); assert.equal(resolved, 1); assert.equal(rejected, 0);
});

test("browser-extension errors cannot fail the walkthrough", () => {
  const { state, listeners } = runtime();
  listeners.error({ error: new Error("wallet unavailable"), filename: "chrome-extension://wallet/inject.js" });
  assert.equal(state.failed, false);
  listeners.error({ error: new Error("scene failed"), filename: "https://example.test/casa/scene.js" });
  assert.equal(state.failed, true);
});

test("GPU context loss aborts the current startup attempt", async () => {
  const { api } = runtime();
  await assert.rejects(api.compile({ getContext: () => ({ isContextLost: () => true }) },
    { traverse: (visit) => visit({ material: {} }) }, {}), /context lost/);
});
