const W = 10;

/** geometry.json is in drawing coordinates (x grows left->right seen from the road).
 *  The viewer looks along +z from the road where +x is on the LEFT, so mirror once, here. */
function mx(r) { return { ...r, x: W - r.x - r.width }; }

export async function loadGeometry() {
  const g = await (await fetch('./geometry.json')).json();
  for (const L of g.levels) {
    L.rooms = L.rooms.map(mx);
    if (L.slabs) L.slabs = L.slabs.map(mx);
    for (const w of L.walls) { w.x1 = W - w.x1; w.x2 = W - w.x2; w.floorY ??= L.floorY; }
  }
  g.courtyard.bounds = mx(g.courtyard.bounds);
  g.courtyard.holes = g.courtyard.holes.map(mx);
  g.stair.bounds = mx(g.stair.bounds);
  g.terraces = g.terraces.map((t) => ({ ...t, bounds: mx(t.bounds) }));
  return g;
}

export function roomKind(r) {
  const s = (r.id + ' ' + r.label).toLowerCase();
  if (r.type === 'stair') return 'stair';
  if (r.type === 'terrace') return 'terrace';
  if (r.type === 'outdoor') return 'outdoor';
  if (r.type === 'garage') return 'garage';
  if (r.type === 'roof') return 'roof';
  if (/bath|卫生|powder|wash|洗手/.test(s)) return 'bath';
  if (/dresser|更衣/.test(s)) return 'dresser';
  if (/kitchen|厨房/.test(s)) return 'kitchen';
  if (/pantry|茶水/.test(s)) return 'pantry';
  if (/majlis|会客/.test(s)) return 'majlis';
  if (/living|起居|dining|餐厅/.test(s)) return 'living';
  if (/maid|女佣|driver|司机/.test(s)) return 'service';
  if (/bed|卧室|master|主卧/.test(s)) return 'bed';
  if (r.type === 'hall') return 'hall';
  return 'hall';
}

export const isInterior = (r) => r.covered !== false && !['outdoor', 'terrace', 'roof', 'garage'].includes(r.type);
