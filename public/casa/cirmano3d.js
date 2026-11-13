// CIRMANO inside the model: a brass plaque on the front door, a brass inlay on the garden lawn
// (seen from the air), and two paintings re-hung with CIRMANO artwork. Runs once the walkthrough
// has built its scene (window.__lintel). Positions were measured from the built model.
(function () {
  "use strict";
  var INK = "#101012", BONE = "#F3EFE8", BRASS = "#B08D57";

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = reject;
      img.src = src;
    });
  }
  function canvasTexture(w, h, draw) {
    var c = document.createElement("canvas");
    c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    var t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }
  function fitImage(g, img, cx, cy, maxW, maxH) {
    var s = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
    var w = img.naturalWidth * s, h = img.naturalHeight * s;
    g.drawImage(img, cx - w / 2, cy - h / 2, w, h);
    return { w: w, h: h };
  }
  function brushed(g, w, h) {
    var gr = g.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, "#c9a86f"); gr.addColorStop(0.45, "#b08d57"); gr.addColorStop(0.55, "#d7bb85"); gr.addColorStop(1, "#9c7a48");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.globalAlpha = 0.08;
    for (var y = 0; y < h; y += 2) { g.fillStyle = y % 4 ? "#fff" : "#000"; g.fillRect(0, y, w, 1); }
    g.globalAlpha = 1;
  }
  function boxOf(o) { return new THREE.Box3().setFromObject(o); }
  function near(a, b, tol) { return Math.abs(a - b) < (tol || 0.06); }

  // Find meshes by their measured bounds (the published scene has no names).
  function findMesh(scene, test) {
    var hit = null;
    scene.traverse(function (o) {
      if (hit || !o.isMesh) return;
      var b = boxOf(o);
      if (test(b)) hit = o;
    });
    return hit;
  }

  async function build(L) {
    var scene = L.scene;
    var wordInk = await loadImage("/brand/CIRMANO_wordmark_EN_ink.svg");
    var horizBone = await loadImage("/brand/CIRMANO_horizontal_CNEN_bone.svg");
    var symbolInk = await loadImage("/brand/CIRMANO_symbol_ink.svg");

    // 1 · Front door plaque (oak pivot door, 2.38 × 4.18 m, on the entrance's south wall at z ≈ 2).
    var door = findMesh(scene, function (b) {
      return near(b.min.x, -16.19) && near(b.max.x, -13.81) && near(b.min.z, 1.96) && b.max.y > 4;
    });
    if (door) {
      var plaqueTex = canvasTexture(1400, 400, function (g, w, h) {
        brushed(g, w, h);
        g.strokeStyle = "rgba(16,16,18,0.35)"; g.lineWidth = 4; g.strokeRect(10, 10, w - 20, h - 20);
        fitImage(g, wordInk, w / 2, h * 0.43, w * 0.66, h * 0.36);
        g.fillStyle = INK; g.font = "500 44px Manrope, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
        g.letterSpacing = "10px";
        g.fillText("MADE AS ONE", w / 2, h * 0.8);
      });
      var plaqueMat = cutWithWalls(new THREE.MeshStandardMaterial({ map: plaqueTex, metalness: 0.75, roughness: 0.32 }), L);
      var geo = new THREE.BoxGeometry(0.7, 0.2, 0.012);
      [[2.048, 0], [1.952, Math.PI]].forEach(function (side) {
        var m = new THREE.Mesh(geo, plaqueMat);
        m.position.set(-15.0, 1.6, side[0]);
        m.rotation.y = side[1];
        m.castShadow = true;
        scene.add(m);
        m.updateMatrixWorld();
        door.attach(m); // swings with the pivot door
      });
    }

    // 2 · A folded C cut into the south lawn (between the forecourt and the master suite), read from the air.
    //     It is a patch of gravel where the grass has been taken up: ragged grass edge, a ring of
    //     trampled soil, the walkthrough's own gravel scan. Lawn panel: x -7.5…10.5, z 15.4…27, y = -0.03.
    await lawnC(scene, symbolInk, -0.03, 2.2, 17.6, 10.2, L);

    // 3 · Paintings re-hung with CIRMANO artwork (same frames, light and shaders; new canvas).
    var entrancePainting = findMesh(scene, function (b) { return near(b.min.x, -18.84) && near(b.min.z, -3.6) && b.max.y > 4; });
    if (entrancePainting) {
      var artA = canvasTexture(880, 1120, function (g, w, h) {
        g.fillStyle = BONE; g.fillRect(0, 0, w, h);
        g.strokeStyle = BRASS; g.lineWidth = 6; g.strokeRect(56, 56, w - 112, h - 112);
        fitImage(g, symbolInk, w / 2, h * 0.43, w * 0.56, h * 0.42);
        g.fillStyle = BRASS; g.fillRect(w / 2 - 70, h * 0.73, 140, 4);
        g.fillStyle = INK; g.font = "500 40px Manrope, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
        g.letterSpacing = "12px";
        g.fillText("MADE AS ONE", w / 2, h * 0.8);
      });
      setMap(entrancePainting, artA);
    }
    var galleryPainting = findMesh(scene, function (b) { return near(b.min.x, 13.74) && near(b.min.z, -4.55) && b.max.y > 2.5; });
    if (galleryPainting) {
      var artB = canvasTexture(740, 1000, function (g, w, h) {
        g.fillStyle = INK; g.fillRect(0, 0, w, h);
        var grd = g.createRadialGradient(w * 0.5, h * 0.42, 10, w * 0.5, h * 0.42, h * 0.7);
        grd.addColorStop(0, "rgba(176,141,87,0.18)"); grd.addColorStop(1, "rgba(176,141,87,0)");
        g.fillStyle = grd; g.fillRect(0, 0, w, h);
        fitImage(g, horizBone, w / 2, h * 0.46, w * 0.74, h * 0.3);
        g.fillStyle = BRASS; g.fillRect(w * 0.13, h * 0.86, w * 0.74, 3);
      });
      setMap(galleryPainting, artB);
    }
  }

  // The walkthrough cuts its walls at a rising height (uniforms uCutOn / uCutY) while the plan becomes the house.
  // Cut our pieces the same way, so nothing floats above a wall that has not risen yet.
  function cutWithWalls(mat, L) {
    var RU = L.RU || {};
    if (!RU.uCutOn || !RU.uCutY) return mat;
    mat.onBeforeCompile = function (sh) {
      sh.uniforms.uCutOn = RU.uCutOn;
      sh.uniforms.uCutY = RU.uCutY;
      sh.vertexShader = "varying float vCirmanoY;\n" + sh.vertexShader.replace(
        "#include <project_vertex>",
        "#include <project_vertex>\n vCirmanoY = (modelMatrix * vec4(transformed, 1.0)).y;"
      );
      sh.fragmentShader = "uniform float uCutOn; uniform float uCutY; varying float vCirmanoY;\n" + sh.fragmentShader.replace(
        "#include <clipping_planes_fragment>",
        "#include <clipping_planes_fragment>\n if (uCutOn > 0.5 && vCirmanoY > uCutY) discard;"
      );
    };
    mat.customProgramCacheKey = function () { return "cirmano-cut"; };
    return mat;
  }



  // Reveal with the house: the walkthrough sweeps real materials out from the entrance (uXO) with a
  // 0..1 progress (uXV). Our lawn pieces appear once the exterior has materialised, not during the drawing.
  function revealWithHouse(mat, L) {
    var RU = L.RU || {};
    if (!RU.uXO || !RU.uXV) return mat;
    mat.onBeforeCompile = function (sh) {
      sh.uniforms.uXO = RU.uXO;
      sh.uniforms.uXV = RU.uXV;
      sh.vertexShader = "varying vec3 vCirmanoW;\n" + sh.vertexShader.replace(
        "#include <project_vertex>",
        "#include <project_vertex>\n vCirmanoW = (modelMatrix * vec4(transformed, 1.0)).xyz;"
      );
      sh.fragmentShader = "uniform vec4 uXO; uniform float uXV; varying vec3 vCirmanoW;\n" + sh.fragmentShader.replace(
        "#include <clipping_planes_fragment>",
        "#include <clipping_planes_fragment>\n if (uXV < 0.985) discard;"
      );
    };
    mat.customProgramCacheKey = function () { return "cirmano-reveal"; };
    return mat;
  }

  // Logo mask with an irregular, grown-in edge: blur the shape, then threshold against value noise.
  function raggedMask(img, size, grow, seed) {
    var c = document.createElement("canvas"); c.width = c.height = size;
    var g = c.getContext("2d");
    g.fillStyle = "#000"; g.fillRect(0, 0, size, size);
    g.filter = "blur(" + Math.round(size * 0.012) + "px) brightness(0) invert(1)";
    var s = Math.min(size * 0.86 / img.naturalWidth, size * 0.86 / img.naturalHeight);
    var w = img.naturalWidth * s, h = img.naturalHeight * s;
    g.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
    g.filter = "none";
    var d = g.getImageData(0, 0, size, size), px = d.data;
    var r = seed;
    function rnd() { r = (r * 1664525 + 1013904223) >>> 0; return r / 4294967296; }
    var N = 64, grid = new Float32Array((N + 1) * (N + 1));
    for (var i = 0; i < grid.length; i++) grid[i] = rnd();
    function noise(x, y) {
      var fx = x * N, fy = y * N, ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
      ix = Math.min(ix, N - 1); iy = Math.min(iy, N - 1);
      var a = grid[iy * (N + 1) + ix], b = grid[iy * (N + 1) + ix + 1], c2 = grid[(iy + 1) * (N + 1) + ix], d2 = grid[(iy + 1) * (N + 1) + ix + 1];
      tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty);
      return a + (b - a) * tx + (c2 - a) * ty + (a - b - c2 + d2) * tx * ty;
    }
    for (var y = 0; y < size; y++) for (var x = 0; x < size; x++) {
      var k = (y * size + x) * 4, m = px[k] / 255;
      var n = noise(x / size, y / size) * 0.6 + noise((x * 3.1) / size % 1, (y * 3.1) / size % 1) * 0.4;
      var v = m + grow + (n - 0.5) * 0.42;
      var a = v > 0.5 ? 255 : 0;
      px[k] = px[k + 1] = px[k + 2] = a; px[k + 3] = 255;
    }
    g.putImageData(d, 0, 0);
    var t = new THREE.CanvasTexture(c);
    t.anisotropy = 8;
    return t;
  }

  async function lawnC(scene, symbolImg, groundY, cx, cz, size, L) {
    var mobile = matchMedia("(max-width: 760px), (pointer: coarse)").matches;
    var base = (mobile ? "assets/tex-1k/" : "assets/tex/") + "gravel_floor_02/";
    var loader = new THREE.TextureLoader();
    function tex(name, srgb) {
      return new Promise(function (resolve) {
        loader.load(base + name, function (t) {
          t.wrapS = t.wrapT = THREE.RepeatWrapping;
          t.repeat.set(size / 2.2, size / 2.2);
          t.anisotropy = 8;
          if (srgb) t.colorSpace = THREE.SRGBColorSpace;
          resolve(t);
        }, undefined, function () { resolve(null); });
      });
    }
    var diff = await tex("diff.jpg", true), nor = await tex("nor.jpg", false), arm = await tex("arm.jpg", false);
    var geo = new THREE.PlaneGeometry(size, size);
    geo.rotateX(-Math.PI / 2);

    // trampled soil ring, slightly wider than the gravel
    var soil = new THREE.Mesh(geo, revealWithHouse(new THREE.MeshStandardMaterial({
      map: diff, color: new THREE.Color("#6f5b45"), normalMap: nor, roughness: 1, metalness: 0,
      alphaMap: raggedMask(symbolImg, 1024, 0.08, 7), alphaTest: 0.5, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    }), L));
    soil.position.set(cx, groundY + 0.004, cz);
    soil.receiveShadow = true;
    scene.add(soil);

    // the gravel itself
    var gravel = new THREE.Mesh(geo, revealWithHouse(new THREE.MeshStandardMaterial({
      map: diff, color: new THREE.Color("#e4ddd0"), normalMap: nor, normalScale: new THREE.Vector2(1.2, 1.2),
      roughnessMap: arm, roughness: 1, metalness: 0,
      alphaMap: raggedMask(symbolImg, 1024, -0.02, 11), alphaTest: 0.5, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
    }), L));
    gravel.position.set(cx, groundY + 0.008, cz);
    gravel.receiveShadow = true;
    scene.add(gravel);
  }

  function setMap(mesh, tex) {
    var m = mesh.material;
    if (m.map) { tex.wrapS = m.map.wrapS; tex.wrapT = m.map.wrapT; tex.flipY = m.map.flipY; }
    m.map = tex;
    m.needsUpdate = true;
  }

  var tries = 0;
  (function wait() {
    if (window.__lintel && window.__lintel.scene) {
      build(window.__lintel).catch(function (e) { console.warn("CIRMANO model layer:", e); });
      return;
    }
    if (++tries < 240) setTimeout(wait, 250);
  })();
})();
