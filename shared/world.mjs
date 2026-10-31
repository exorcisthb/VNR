import { B } from "./blocks.mjs";
import { buildLandmarks, isProtected } from "./landmarks.mjs";
export const CHUNK = 16,
  HEIGHT = 64,
  LIMIT = 144,
  WORLD_VERSION = 2;
export const SPAWN = { x: -66.5, y: 3, z: 12.5, yaw: 0 };
export const keyOf = (x, y, z) => `${x},${y},${z}`;
export const chunkKey = (cx, cz) => `${cx},${cz}`;
export const inBounds = (x, y, z) =>
  Number.isInteger(x) &&
  Number.isInteger(y) &&
  Number.isInteger(z) &&
  x >= -LIMIT &&
  x < LIMIT &&
  z >= -LIMIT &&
  z < LIMIT &&
  y >= 0 &&
  y < HEIGHT;
const offset = (x, y, z) => y * 256 + z * 16 + x;
export class VoxelWorld {
  constructor(edits = []) {
    this.chunks = new Map();
    this.edits = new Map(edits);
    this.editChunks = new Map();
    for (const [k, id] of this.edits) this.indexEdit(k, id);
  }
  indexEdit(k, id) {
    const [x, , z] = k.split(",").map(Number),
      ck = chunkKey(Math.floor(x / 16), Math.floor(z / 16));
    if (!this.editChunks.has(ck)) this.editChunks.set(ck, new Map());
    this.editChunks.get(ck).set(k, id);
  }
  getChunk(cx, cz) {
    const ck = chunkKey(cx, cz);
    if (this.chunks.has(ck)) return this.chunks.get(ck);
    const data = new Uint8Array(CHUNK * CHUNK * HEIGHT),
      ox = cx * 16,
      oz = cz * 16;
    const put = (x, y, z, id) => {
      if (
        x >= ox &&
        x < ox + 16 &&
        z >= oz &&
        z < oz + 16 &&
        y >= 0 &&
        y < HEIGHT
      )
        data[offset(x - ox, y, z - oz)] = id;
    };
    for (let z = oz; z < oz + 16; z++)
      for (let x = ox; x < ox + 16; x++) {
        if (Math.abs(x) >= LIMIT || Math.abs(z) >= LIMIT) continue;
        put(x, 0, z, B.BEDROCK);
        put(x, 1, z, B.DIRT);
        put(x, 2, z, B.GRASS);
        // Đầm sen Quốc hoa: hồ sen rộng với đáy cát, nước trong và cầu gỗ ngắm sen
        if (((x - 66) / 18) ** 2 + ((z - 53) / 12) ** 2 < 1) {
          put(x, 1, z, B.SAND);
          put(x, 2, z, B.WATER);

          // Cầu gỗ và chòi ngắm sen vươn ra giữa đầm sen cho khách tham quan
          const onLotusPier =
            (Math.abs(x - 66) <= 1 && z >= 41 && z <= 52) ||
            (Math.abs(x - 66) <= 2 && Math.abs(z - 52) <= 2);
          if (onLotusPier) {
            put(x, 2, z, B.WOOD);
          }
        }
        if (Math.abs(z - 20) <= 2 || (Math.abs(x) <= 2 && z >= 18 && z <= 65))
          put(x, 2, z, B.PATH);
      }
    buildLandmarks(put, { minX: ox, maxX: ox + 15, minZ: oz, maxZ: oz + 15 });
    for (const [k, id] of this.editChunks.get(ck) || []) {
      const [x, y, z] = k.split(",").map(Number);
      put(x, y, z, id);
    }
    this.chunks.set(ck, data);
    return data;
  }
  get(x, y, z) {
    x = Math.floor(x);
    y = Math.floor(y);
    z = Math.floor(z);
    if (y < 0) return B.BEDROCK;
    if (y >= HEIGHT) return B.AIR;
    if (x < -LIMIT || x >= LIMIT || z < -LIMIT || z >= LIMIT) return B.BEDROCK;
    const cx = Math.floor(x / 16),
      cz = Math.floor(z / 16);
    return this.getChunk(cx, cz)[offset(x - cx * 16, y, z - cz * 16)];
  }
  set(x, y, z, id) {
    if (!inBounds(x, y, z)) return false;
    const k = keyOf(x, y, z);
    this.edits.set(k, id);
    this.indexEdit(k, id);
    const cx = Math.floor(x / 16),
      cz = Math.floor(z / 16),
      data = this.chunks.get(chunkKey(cx, cz));
    if (data) data[offset(x - cx * 16, y, z - cz * 16)] = id;
    return true;
  }
  prune(cx, cz, radius) {
    for (const k of this.chunks.keys()) {
      const [x, z] = k.split(",").map(Number);
      if (Math.abs(x - cx) > radius || Math.abs(z - cz) > radius)
        this.chunks.delete(k);
    }
  }
}
