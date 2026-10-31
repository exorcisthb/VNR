import { isProtected } from "./landmarks.mjs";
export const TREES = [];
for (let gz = -7; gz <= 7; gz++)
  for (let gx = -7; gx <= 7; gx++) {
    const h = ((gx * 73856093) ^ (gz * 19349663)) >>> 0,
      x = gx * 18 + 3 + (h % 7),
      z = gz * 18 + 3 + ((h >>> 4) % 7);
    if (
      Math.abs(x) > 137 ||
      Math.abs(z) > 137 ||
      Math.abs(z - 20) < 8 ||
      Math.abs(x) < 8 ||
      ((Math.abs(x + 87) < 7 || Math.abs(x - 98) < 7) && z >= 20 && z <= 70) ||
      isProtected(x, 3, z, 5) ||
      ((x - 66) / 24) ** 2 + ((z - 53) / 18) ** 2 < 1 ||
      Math.hypot(x + 66.5, z - 12.5) < 12
    )
      continue;
    TREES.push({
      x,
      z,
      height: 5.3 + (h % 20) / 10,
      radius: 0.22 + (h % 5) * 0.035,
      seed: h,
    });
  }
const cells = new Map();
for (const t of TREES) {
  const key = `${Math.floor(t.x / 16)},${Math.floor(t.z / 16)}`;
  if (!cells.has(key)) cells.set(key, []);
  cells.get(key).push(t);
}
export function nearbyTrees(x, z) {
  const result = [];
  for (let dz = -1; dz <= 1; dz++)
    for (let dx = -1; dx <= 1; dx++)
      result.push(
        ...(cells.get(
          `${Math.floor(x / 16) + dx},${Math.floor(z / 16) + dz}`,
        ) || []),
      );
  return result;
}
