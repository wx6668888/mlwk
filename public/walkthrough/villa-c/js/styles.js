import * as THREE from 'three';
import { M, texSet, useTexSet } from './mats.js';
import { X } from './furniture.js';

/* Per-style material overrides, applied in place (all geometry is already merged per material).
   Keys are names in M (or furniture extras). Fields: color, rough, metal, tex (PBR set id), texScale, img (rug image under assets/). `art` lists wall-art images per frame class. */

export const STYLES = {
  modern: {
    light: [1.0, 0.97, 0.93], hemi: [0xf2f6ff, 0xb9b9b8],
    stucco: { color: 0xf4f3ef }, stuccoGrey: { color: 0x74797a }, stuccoYellow: { color: 0x5f6466 }, stuccoBeige: { color: 0xe3dfd6 }, stuccoSand: { color: 0xcfc9bd },
    aluminium: { color: 0x25282a }, steel: { color: 0xb9bdc0, rough: 0.3 },
    paint: { tex: 'white_stucco', color: 0xf6f5f2 }, paintAccent: { tex: 'plastered_wall_04', color: 0xd7d4cd }, ceilingPaint: { tex: 'white_stucco', color: 0xffffff },
    marble: { tex: 'plastered_wall_04', texScale: 0.6, color: 0xe4e1da, rough: 0.55 },
    woodFloor: { tex: 'oak_veneer_03', texScale: 1.2, color: 0xf0e4d2, rough: 0.7 },
    bathFloor: { tex: 'granite_tile_04', color: 0xd9d9d6, rough: 0.5 },
    terraceTile: { color: 0xc9c9c6 }, courtTile: { tex: 'concrete_pavement_02', color: 0xd9d6cf },
    doorWood: { tex: 'white_oak_veneer', color: 0xf3ece0 }, walnut: { tex: 'white_oak_veneer', color: 0xf0e2c9 }, oakLight: { color: 0xf6efe4 },
    brass: { color: 0x2b2d2f, rough: 0.4, metal: 0.9 }, quartz: { color: 0xe8e8e6 },
    fabricSand: { color: 0xb8b4ac }, fabricRust: { color: 0x34393c }, fabricTeal: { color: 0x8a9496 }, fabricCream: { color: 0xeceae5 }, fabricGrey: { color: 0x666a6c },
    leatherTan: { color: 0x2b2a29, rough: 0.55 }, curtain: { color: 0xe6e4df },
    rug: { img: 'rug/modern_1' }, rug2: { img: 'rug/modern_2' }, art: { L: ['modern_L1', 'modern_L2'], P: ['modern_P1', 'modern_P2'], S: ['modern_S'] }, wallTile: { color: 0xe9e9e6 },
    brassSat: { color: 0x1d1f20, rough: 0.35, metal: 0.9 }, artFrame: { color: 0x151617 }, cabinetWhite: { color: 0xf6f6f3 }, cabinetGrey: { color: 0x40454a },
  },
  luxury: {
    light: [1.0, 0.91, 0.78], hemi: [0xfff0dc, 0xb39d80],
    stucco: { color: 0xece3d1 }, stuccoGrey: { color: 0x9a8e7e }, stuccoYellow: { color: 0xcdb98f }, stuccoBeige: { color: 0xe8dcc3 }, stuccoSand: { color: 0xd6c3a2 },
    aluminium: { color: 0x3b3329, rough: 0.35, metal: 0.85 }, steel: { color: 0xc6b58f, rough: 0.28 },
    paint: { tex: 'plastered_wall_02', color: 0xf0e9dd }, paintAccent: { tex: 'beige_wall_001', color: 0xb69f7c }, ceilingPaint: { tex: 'plastered_wall_02', color: 0xfbf7ef },
    marble: { tex: 'marble_01', color: 0xfff6e8, rough: 0.2 },
    woodFloor: { tex: 'herringbone_parquet', color: 0xd9c6a8, rough: 0.5 },
    bathFloor: { tex: 'marble_01', color: 0xe6dccb, rough: 0.25 },
    terraceTile: { color: 0xd8cbb4 }, courtTile: { tex: 'marble_01', color: 0xe3d6bf, rough: 0.5 },
    doorWood: { tex: 'walnut_veneer', color: 0xb99b7c }, walnut: { tex: 'walnut_veneer', color: 0x8b6a4f, rough: 0.45 }, oakLight: { color: 0xd9c3a2 },
    brass: { color: 0xd8b469, rough: 0.2 }, quartz: { color: 0xfff1db },
    fabricSand: { color: 0xcdbfa6 }, fabricRust: { color: 0x8d6b57 }, fabricTeal: { color: 0x3b4a52 }, fabricCream: { color: 0xf0e8d8 }, fabricGrey: { color: 0x8a8378 },
    leatherTan: { color: 0x7a4c2e, rough: 0.42 }, curtain: { color: 0xeadfc9 },
    rug: { img: 'rug/luxury_1' }, rug2: { img: 'rug/luxury_2' }, art: { L: ['luxury_L1', 'luxury_L2'], P: ['luxury_P1', 'luxury_P2'], S: ['luxury_S'] }, wallTile: { color: 0xeee6d6 },
    brassSat: { color: 0xd0a85a, rough: 0.2, metal: 1 }, artFrame: { color: 0xc9a455, rough: 0.28, metal: 1 }, cabinetWhite: { color: 0xece4d4 }, cabinetGrey: { color: 0x5a544d },
  },
  gulf: {
    light: [1.0, 0.94, 0.84], hemi: [0xffeacb, 0xb8a07a],
    stucco: { color: 0xeadcc0 }, stuccoGrey: { color: 0xa8926f }, stuccoYellow: { color: 0xd9bd7c }, stuccoBeige: { color: 0xe7d3ae }, stuccoSand: { color: 0xd9bd8c },
    aluminium: { color: 0x3d2f22, rough: 0.4, metal: 0.8 }, steel: { color: 0xc7a75e, rough: 0.3 },
    paint: { tex: 'plastered_wall_02', color: 0xf5e7cb }, paintAccent: { tex: 'beige_wall_001', color: 0xd7b57e }, ceilingPaint: { tex: 'plastered_wall_02', color: 0xfaf3e4 },
    marble: { tex: 'marble_01', color: 0xf3e2c5, rough: 0.4 },
    woodFloor: { tex: 'wood_floor', color: 0xd6bd96, rough: 0.6 },
    bathFloor: { tex: 'interior_tiles', color: 0xe3c9a2, rough: 0.35 },
    terraceTile: { color: 0xdbc59f }, courtTile: { tex: 'patio_tiles', color: 0xe6cf9f },
    doorWood: { tex: 'walnut_veneer', color: 0xc29a6d }, walnut: { tex: 'walnut_veneer', color: 0xb78a5c, rough: 0.55 }, oakLight: { color: 0xe4cfa8 },
    brass: { color: 0xc8a258, rough: 0.3 }, quartz: { color: 0xf6ead4 },
    fabricSand: { color: 0xcbb99c }, fabricRust: { color: 0xa5593b }, fabricTeal: { color: 0x1f5e57 }, fabricCream: { color: 0xeadfc6 }, fabricGrey: { color: 0x8a7a64 },
    leatherTan: { color: 0xa4693a, rough: 0.6 }, curtain: { color: 0xf1e6cd },
    rug: { img: 'rug/gulf_1' }, rug2: { img: 'rug/gulf_2' }, art: { L: ['gulf_L1', 'gulf_L2'], P: ['gulf_P1', 'gulf_P2'], S: ['gulf_S'] }, wallTile: { color: 0xe7ddc6 },
    brassSat: { color: 0xb98d44, rough: 0.28, metal: 1 }, artFrame: { color: 0x6b4a26, rough: 0.5 }, cabinetWhite: { color: 0xeee5d0 }, cabinetGrey: { color: 0x4f4a3f },
  },
};

const imgCache = new Map();
function imgTex(name, dir) {
  const k = dir + name;
  if (!imgCache.has(k)) imgCache.set(k, new THREE.TextureLoader().loadAsync(`./assets/${dir}/${name}.jpg`).then((t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }));
  return imgCache.get(k);
}
const BASE_KEYS = ['map', 'normalMap', 'aoMap', 'roughnessMap', 'metalnessMap'];
let current = null;

function snapshot(m) {
  if (m.userData.styleBase) return m.userData.styleBase;
  const b = { color: m.color.getHex(), roughness: m.roughness, metalness: m.metalness };
  for (const k of BASE_KEYS) b[k] = m[k];
  return (m.userData.styleBase = b);
}

function restore(m) {
  const b = snapshot(m);
  m.color.setHex(b.color); m.roughness = b.roughness; m.metalness = b.metalness;
  let mapsChanged = false;
  for (const k of BASE_KEYS) if (m[k] !== b[k]) { m[k] = b[k]; mapsChanged = true; }
  return mapsChanged;
}

const styledNames = () => new Set(Object.values(STYLES).flatMap((s) => Object.keys(s)).filter((k) => k !== 'light' && k !== 'hemi' && k !== 'art'));

/** Switch every styled material in place; resolves once swapped textures are loaded and applied. */
export async function applyStyle(name, core) {
  const st = STYLES[name]; if (!st) return;
  current = name;
  const mats = { ...M, ...X() };
  const ids = [...new Set(Object.values(st).map((o) => o.tex).filter(Boolean))];
  const loaded = Object.fromEntries(await Promise.all(ids.map(async (id) => [id, await texSet(id)])));
  const rugTex = {};
  await Promise.all(Object.entries(st).filter(([, o]) => o.img).map(async ([k, o]) => (rugTex[k] = await imgTex(o.img.split('/')[1], 'rug'))));
  const ART = X().art;
  await Promise.all(Object.entries(st.art).flatMap(([cls, names]) => names.map(async (n, i) => { ART[cls][i].map = await imgTex(n, 'art'); ART[cls][i].needsUpdate = true; })));
  if (current !== name) return;
  for (const key of styledNames()) {
    const m = mats[key]; if (!m) continue;
    let changed = restore(m);
    const o = st[key];
    if (o) {
      if (o.color !== undefined) m.color.setHex(o.color);
      if (o.rough !== undefined) m.roughness = o.rough;
      if (o.metal !== undefined) m.metalness = o.metal;
      if (o.tex) { useTexSet(m, loaded[o.tex], o.texScale ?? 1); changed = false; }
      if (o.img) { m.map = rugTex[key]; m.normalMap = null; changed = true; }
    }
    if (changed) m.needsUpdate = true;
  }
  const [r, g, b] = st.light;
  core.lightTint = new THREE.Color(r, g, b);
  core.hemi.color.setHex(st.hemi[0]); core.hemi.groundColor.setHex(st.hemi[1]);
}
