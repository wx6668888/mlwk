import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { register, throttle } from './mats.js';

const NAMES = [
  'Chandelier_02', 'book_encyclopedia_set_01', 'brass_vase_01', 'ceiling_fan', 'ceramic_vase_01', 'ceramic_vase_02', 'ceramic_vase_04',
  'covered_car', 'exterior_aircon_unit', 'fancy_picture_frame_01', 'grass_bermuda_01', 'hanging_picture_frame_02', 'metal_jug',
  'mid_century_lounge_chair', 'modern_arm_chair_01', 'modern_ceiling_lamp_01', 'modern_wooden_cabinet', 'outdoor_table_chair_set_01',
  'potted_plant_01', 'potted_plant_02', 'potted_plant_04', 'security_camera_01', 'security_light', 'standing_picture_frame_01',
  'tea_set_01', 'utility_box_01', 'wall_clock', 'water_manhole_cover', 'wicker_basket_01',
  'Sofa_01', 'sofa_02', 'sofa_03', 'Ottoman_01', 'ClassicConsole_01', 'dining_chair_02', 'coffee_table_round_01', 'modern_coffee_table_01',
  'sofa_modern', 'sofa_sectional', 'modern_coffee_table_02', 'Chandelier_03', 'ornate_mirror_01', 'brass_vase_02', 'side_table_tall_01', 'throw_pillows_01', 'bed_double',
];

// Sketchfab fabrics ship 4 maps per material; dropping two keeps interior shaders under the sampler limit
const LEAN = new Set(['sofa_modern', 'sofa_sectional']);

/** Loads every Poly Haven glTF once; get(name) returns a cheap clone that shares geometry and materials. */
export async function loadModels(renderer) {
  const loader = new GLTFLoader();
  const maxA = renderer.capabilities.getMaxAnisotropy();
  const lib = {}, box = {};
  await Promise.all(NAMES.map(async (n) => {
    try {
      const g = await throttle(() => loader.loadAsync(`./assets/models/${n}/${n}.gltf`));
      g.scene.traverse((o) => {
        if (!o.isMesh) return;
        o.castShadow = true; o.receiveShadow = true;
        const ms = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of ms) {
          if (LEAN.has(n)) { m.emissiveMap = null; m.metalnessMap = null; m.roughnessMap = null; m.emissive?.setScalar(0); m.metalness = 0; m.roughness = 0.9; }
          for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap']) if (m[k]) m[k].anisotropy = maxA;
          m.envMapIntensity = 1; register(m);
        }
      });
      lib[n] = g.scene;
    } catch (e) { console.warn('model failed', n, e); }
  }));
  const api = {
    has: (n) => !!lib[n],
    /** place a clone; opts: x y z ry s (uniform scale) interior; w/h/d instead fit the native extent to that size and centre it on x/z with its base at y */
    place(parent, n, { x = 0, y = 0, z = 0, ry = 0, s = 1, rx = 0, interior = false, w, h, d } = {}) {
      if (!lib[n]) return null;
      let c = lib[n].clone(true);
      if (w || h || d) {
        const b = (box[n] ??= new THREE.Box3().setFromObject(lib[n])), sz = b.getSize(new THREE.Vector3()), ct = b.getCenter(new THREE.Vector3());
        s = w ? w / sz.x : h ? h / sz.y : d / sz.z;
        c.position.set(-ct.x, -b.min.y, -ct.z);
        const wrap = new THREE.Group(); wrap.add(c); c = wrap;
      }
      c.position.set(x, y, z);
      c.rotation.set(rx, ry, 0, 'YXZ'); c.scale.setScalar(s);
      if (interior) c.traverse((o) => { if (o.isMesh) for (const m of (Array.isArray(o.material) ? o.material : [o.material])) m.userData.interior = true; });
      parent.add(c);
      return c;
    },
  };
  return api;
}
