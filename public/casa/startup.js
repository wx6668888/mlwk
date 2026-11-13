// CIRMANO startup: measured phases, yielding GPU work and bounded resource retries.
// Diagnostics stay in this frame (window.__cirmanoStartup); nothing is sent to a server.
(function () {
  "use strict";
  var state = window.__cirmanoStartup = { phase: "assets", completed: 0, total: 0, events: [], failed: false };
  var compat = new URLSearchParams(location.search).get("quality") === "compat";
  function post(data) {
    if (window.parent !== window) window.parent.postMessage(data, location.origin);
  }
  function phase(name, completed, total) {
    state.phase = name;
    state.completed = completed || 0;
    state.total = total || 0;
    state.events.push({ phase: name, completed: state.completed, total: state.total, at: Math.round(performance.now()) });
    if (state.events.length > 100) state.events.shift();
    post({ type: "casa-stage", phase: name, completed: state.completed, total: state.total });
  }
  function fail(reason) {
    if (state.failed) return;
    state.failed = true;
    state.reason = String(reason).slice(0, 240);
    post({ type: "casa-error", why: state.reason });
  }
  function pause() { return new Promise(function (resolve) { setTimeout(resolve, 0); }); }
  async function compile(renderer, scene, camera) {
    var objects = [];
    scene.traverse(function (object) { if (object.material) objects.push(object); });
    phase("materials", 0, objects.length);
    // A temporary traversal view keeps the original parents, transforms and lights intact.
    var batch = new THREE.Group();
    for (var offset = 0; offset < objects.length; offset += 16) {
      if (renderer.getContext().isContextLost()) throw new Error("WebGL context lost during material compilation");
      var selected = objects.slice(offset, offset + 16);
      batch.traverse = function (visit) { visit(batch); selected.forEach(visit); };
      if (renderer.compileAsync) await renderer.compileAsync(batch, camera, scene);
      else renderer.compile(batch, camera, scene);
      phase("materials", Math.min(offset + 16, objects.length), objects.length);
      await pause();
    }
  }
  async function upload(renderer, scene, preload) {
    var textures = new Set();
    function add(value) { if (value && value.isTexture) textures.add(value); }
    scene.traverse(function (object) {
      (Array.isArray(object.material) ? object.material : [object.material]).filter(Boolean).forEach(function (material) {
        Object.keys(material).forEach(function (key) { add(material[key]); });
        if (material.uniforms) Object.keys(material.uniforms).forEach(function (key) { add(material.uniforms[key].value); });
      });
    });
    (preload || []).forEach(add);
    var completed = 0, slice = performance.now();
    phase("textures", 0, textures.size);
    for (var texture of textures) {
      if (renderer.getContext().isContextLost()) throw new Error("WebGL context lost during texture upload");
      renderer.initTexture(texture);
      completed++;
      if (performance.now() - slice >= 8 || completed === textures.size) {
        phase("textures", completed, textures.size);
        await pause();
        slice = performance.now();
      }
    }
  }
  window.CIRMANO_STARTUP = { compat: compat, phase: phase, fail: fail, pause: pause, compile: compile, upload: upload,
    assets: function (done, total) { phase("assets", done, total); },
    async fetch(url) {
      for (var attempt = 0; attempt < 3; attempt++) {
        var controller = new AbortController();
        var timer = setTimeout(function () { controller.abort(); }, 20000);
        try {
          var response = await fetch(url, { signal: controller.signal });
          if (!response.ok) throw new Error("Resource HTTP " + response.status + ": " + url);
          // Read within the timeout, not just the response headers.
          var bytes = await response.arrayBuffer();
          return { arrayBuffer: function () { return Promise.resolve(bytes); } };
        } catch (error) {
          if (attempt === 2) throw error;
        } finally { clearTimeout(timer); }
        await new Promise(function (resolve) { setTimeout(resolve, 500 * (attempt + 1)); });
      }
    },
    image(loader, url, onLoad, onError) {
      var attempt = 0;
      function load() {
        var settled = false;
        var timer = setTimeout(function () { retry(new Error("Texture request timed out: " + url)); }, 20000);
        function retry(error) {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          if (++attempt < 3) setTimeout(load, 500 * attempt);
          else onError(error);
        }
        loader.load(url, function (texture) {
          if (settled) { texture.dispose(); return; }
          settled = true;
          clearTimeout(timer);
          onLoad(texture);
        }, undefined, retry);
      }
      load();
    }
  };
  window.addEventListener("error", function (event) {
    // Browser extensions can reject unrelated promises (for example wallet
    // providers). Only the walkthrough's own script failures can fail startup.
    if (event.error && event.filename && event.filename.startsWith(location.origin + "/casa/")) fail(event.error.message || event.message);
    else if (event.target && event.target.tagName === "SCRIPT" && event.target.src.startsWith(location.origin + "/casa/")) fail("Script unavailable: " + event.target.src);
  }, true);
  var canvas = document.getElementById("gl");
  if (canvas) canvas.addEventListener("webglcontextlost", function (event) { event.preventDefault(); fail("WebGL context lost"); });
  phase("assets", 0, 0);
})();
