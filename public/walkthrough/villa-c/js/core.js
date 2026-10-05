import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { applyEnvironment } from './mats.js';

export const core = { quality: 'high', indoor: 0, exposure: 0.7, windowView: 0, windows: null };

export const TIMES = {
  morning:   { hdr: 'qwantani_mid_morning', az: -148, label: '上午', key: 'time.morning', sunScale: 1.0, exp: 0.9 },
  noon:      { hdr: 'qwantani_noon',        az: -112, label: '正午', key: 'time.noon', sunScale: 1.0, exp: 0.8 },
  afternoon: { hdr: 'qwantani_afternoon',   az: -64,  label: '午后', key: 'time.afternoon', sunScale: 1.0, exp: 0.95 },
  sunset:    { hdr: 'qwantani_late_afternoon', az: -38, label: '傍晚', key: 'time.sunset', sunScale: 1.0, exp: 1.0 },
};

const FilmShader = {
  uniforms: { tDiffuse: { value: null }, time: { value: 0 }, grain: { value: 0.016 }, vig: { value: 0.22 }, aspect: { value: 1 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float time, grain, vig, aspect; varying vec2 vUv;
    float rnd(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
    void main(){
      vec2 c = vUv - .5;
      float r2 = dot(c*vec2(aspect,1.0), c*vec2(aspect,1.0));
      vec2 ca = c * (0.0004 * r2 * 4.0);
      vec3 col = vec3(texture2D(tDiffuse, vUv + ca).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - ca).b);
      col *= 1.0 - vig * smoothstep(0.15, 0.95, r2 * 1.6);
      float l = dot(col, vec3(.2126,.7152,.0722));
      col = mix(vec3(l), col, 1.06);
      col += (rnd(vUv*vec2(1920.,1080.) + fract(time)*91.7) - .5) * grain * (1.0 - l*.6);
      gl_FragColor = vec4(col, 1.0);
    }`,
};

export async function initCore(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', stencil: false, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 0.65;
  RectAreaLightUniformsLib.init();

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.05, 900);
  camera.rotation.order = 'YXZ';
  scene.add(camera);

  /* sun */
  const sun = new THREE.DirectionalLight(0xffffff, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  const sc = sun.shadow.camera;
  Object.assign(sc, { left: -34, right: 34, top: 34, bottom: -34, near: 1, far: 220 });
  sun.shadow.bias = -0.0002;
  sun.shadow.normalBias = 0.03;
  sun.shadow.radius = 2.5;
  sun.target.position.set(5, 0, 11);
  scene.add(sun, sun.target);

  /* interior bounce fill (intensity driven by how "indoors" the camera is) */
  const hemi = new THREE.HemisphereLight(0xfff1de, 0x8c7b66, 0);
  scene.add(hemi);

  Object.assign(core, { renderer, scene, camera, sun, hemi, canvas, envCache: {}, current: null });

  /* post */
  const size = renderer.getSize(new THREE.Vector2());
  const rt = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));
  const gtao = new GTAOPass(scene, camera, size.x, size.y);
  gtao.updateGtaoMaterial({ radius: 0.42, distanceExponent: 1.3, thickness: 1.2, scale: 1.15, samples: 16, distanceFallOff: 1.0, screenSpaceRadius: false });
  gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 5, rings: 2, samples: 16 });
  gtao.blendIntensity = 0.9;
  composer.addPass(gtao);
  const bloom = new UnrealBloomPass(new THREE.Vector2(size.x, size.y), 0.16, 0.65, 2.0);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const film = new ShaderPass(FilmShader);
  composer.addPass(film);
  Object.assign(core, { composer, gtao, bloom, film });

  resize();
  addEventListener('resize', resize);
  return core;
}

export function resize() {
  const { renderer, camera, composer, film } = core;
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  composer.setSize(w, h);
  camera.aspect = w / h; camera.updateProjectionMatrix();
  film.uniforms.aspect.value = w / h;
}

export function setQuality(q) {
  core.quality = q;
  const { renderer, gtao, bloom, sun } = core;
  const pr = q === 'high' ? Math.min(devicePixelRatio, 1.5) : q === 'medium' ? 1 : 0.8;
  renderer.setPixelRatio(pr);
  gtao.enabled = q !== 'low';
  bloom.enabled = q === 'high';
  const ms = q === 'high' ? 4096 : 2048;
  if (sun.shadow.mapSize.x !== ms) { sun.shadow.mapSize.set(ms, ms); sun.shadow.map?.dispose(); sun.shadow.map = null; }
  resize();
}

const rgbe = new RGBELoader();

async function loadEnv(key) {
  if (core.envCache[key]) return core.envCache[key];
  const t = TIMES[key];
  const tex = await rgbe.loadAsync(`./assets/hdri/${t.hdr}_env.hdr`);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.LinearSRGBColorSpace;
  tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
  const pm = new THREE.PMREMGenerator(core.renderer);
  const rtEnv = pm.fromEquirectangular(tex);
  pm.dispose();
  return (core.envCache[key] = { sky: tex, env: rtEnv.texture });
}

/** Switch time of day: sky, image-based light, sun direction/colour, fog, exposure. */
export async function setTime(key) {
  const sunData = await (core.sunData ??= await (await fetch('./assets/hdri/suns.json')).json());
  const t = TIMES[key];
  const d = sunData[t.hdr];
  const { sky, env } = await loadEnv(key);
  const { scene, sun, renderer } = core;
  // rotate sky so the HDRI sun lands on the requested azimuth
  const hdrAz = Math.atan2(d.sunDir[2], d.sunDir[0]);
  const wantAz = THREE.MathUtils.degToRad(t.az);
  const rotY = wantAz - hdrAz; // lookup azimuth = world azimuth - rotY
  scene.background = sky;
  scene.backgroundRotation.set(0, rotY, 0);
  scene.backgroundIntensity = 1;
  scene.environment = null;
  applyEnvironment(env, rotY);
  const el = THREE.MathUtils.degToRad(d.sunElevationDeg);
  const dir = new THREE.Vector3(Math.cos(el) * Math.cos(wantAz), Math.sin(el), Math.cos(el) * Math.sin(wantAz)).normalize();
  core.sunDir = dir;
  sun.position.copy(sun.target.position).addScaledVector(dir, 110);
  sun.color.setRGB(d.sunColor[0], d.sunColor[1], d.sunColor[2]);
  sun.intensity = (d.sunEnergy / Math.sin(el)) * t.sunScale * 1.0;
  const h = d.horizon;
  const fogCol = new THREE.Color().setRGB(h[0] * 1.15, h[1] * 1.15, h[2] * 1.15, THREE.LinearSRGBColorSpace);
  scene.fog = new THREE.FogExp2(fogCol, 0.0034);
  core.horizon = fogCol;
  core.outdoorExposure = t.exp;
  core.time = key;
  core.current = key;
  renderer.toneMappingExposure = core.exposure = t.exp;
  return d;
}

/** Called each frame: adapt exposure and bounce light to indoor/outdoor. */
const _fwd = new THREE.Vector3();
export function adaptExposure(dt) {
  const k = 1 - Math.exp(-dt * 2.6);
  // Looking through glazing toward daylight: pull the indoor boost back so the view outside keeps its colour
  let outward = 0;
  if (core.indoor > 0.05 && core.windows?.length) {
    core.camera.getWorldDirection(_fwd);
    const p = core.camera.position;
    for (const w of core.windows) {
      if (Math.abs(w.y - p.y) > 2.2) continue;
      const dx = w.x - p.x, dz = w.z - p.z, d = Math.hypot(dx, dz);
      if (d < 0.3 || d > 9) continue;
      const facing = (dx * _fwd.x + dz * _fwd.z) / d;
      if (facing < 0.6) continue;
      const outwardDot = -(w.nx * dx + w.nz * dz) / d;
      if (outwardDot < 0.2) continue;
      outward = Math.max(outward, Math.min(1, (facing - 0.6) / 0.3) * Math.min(1, w.w / 1.2) * Math.min(1, 1.6 - d / 6));
    }
  }
  core.windowView += (outward - core.windowView) * (1 - Math.exp(-dt * 3));
  const boost = 1 + core.indoor * 1.15 * (1 - 0.8 * core.windowView);
  const target = core.outdoorExposure * boost;
  core.exposure += (target - core.exposure) * k;
  core.renderer.toneMappingExposure = core.exposure;
  core.bloom.threshold = 1.25 / Math.max(core.exposure, 0.2);
  core.hemi.intensity = 0.7 + core.indoor * 0.0;
}

export function renderFrame(dt, t) {
  core.film.uniforms.time.value = t;
  if (core.quality === 'low') core.renderer.render(core.scene, core.camera);
  else core.composer.render(dt);
}
