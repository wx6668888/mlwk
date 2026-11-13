// Embed bridge: reports loading progress to the CIRMANO home page, which shows its own branded loader.
// Messages (same origin only): {type:'casa-progress', p:0..1}, {type:'casa-ready'}, {type:'casa-fallback'} (gate.js).
(function () {
  if (!document.documentElement.classList.contains("embed") || window.parent === window) return;
  var started = false, done = false;
  function post(msg) { try { window.parent.postMessage(msg, location.origin); } catch (e) {} }
  post({ type: "casa-alive" });
  function tick() {
    if (done) return;
    if (window.LINTEL_GATE && !window.LINTEL_GATE.ok) return; // gate.js already sent casa-fallback
    // Progress itself is posted by fx-experience (Pe); this loop only waits for the intro to finish.
    var loading = document.body.classList.contains("is-loading");
    if (loading) started = true;
    if (started && !loading && window.CIRMANO_STARTUP && window.CIRMANO_STARTUP.sceneFrame) {
      done = true;
      post({ type: "casa-progress", p: 1 });
      post({ type: "casa-ready", height: document.documentElement.scrollHeight });
      return;
    }
    setTimeout(tick, 100);
  }
  tick();
  // Keep the parent informed if the track length changes (resize, fonts).
  if ("ResizeObserver" in window) {
    new ResizeObserver(function () {
      if (done) post({ type: "casa-height", height: document.documentElement.scrollHeight });
    }).observe(document.body);
  }
})();
