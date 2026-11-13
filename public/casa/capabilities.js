// Four-sample floating-point MSAA is optional; the 3D scene itself is unchanged.
(function () {
  "use strict";
  var gate = window.LINTEL_GATE = { ok: true, why: "" };
  var canvas = document.createElement("canvas"), gl;
  try {
    gl = canvas.getContext("webgl2");
    if (!gl) throw new Error("WebGL 2 is unavailable");
    gl.getExtension("EXT_color_buffer_float");
    gl.getExtension("EXT_color_buffer_half_float");
    var texture = gl.createTexture(), framebuffer = gl.createFramebuffer();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, 4, 4, 0, gl.RGBA, gl.HALF_FLOAT, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error("Floating-point render target unavailable");
    gl.deleteFramebuffer(framebuffer);
    gl.deleteTexture(texture);
    var supported = gl.getInternalformatParameter(gl.RENDERBUFFER, gl.RGBA16F, gl.SAMPLES);
    if (!supported || !Array.from(supported).includes(4)) window.CIRMANO_STARTUP.compat = true;
  } catch (error) {
    gate.ok = false;
    gate.why = error.message;
    window.CIRMANO_STARTUP.fail(error.message);
    var message = document.getElementById("nogl");
    if (message && window.parent === window) message.hidden = false;
  } finally {
    if (gl) {
      var lose = gl.getExtension("WEBGL_lose_context");
      if (lose) lose.loseContext();
    }
  }
})();
