import * as THREE from "three";
import { BLOCKS, B } from "../shared/blocks.mjs";
const faces = [
  {
    d: [-1, 0, 0],
    p: [
      [0, 1, 0],
      [0, 0, 0],
      [0, 1, 1],
      [0, 0, 1],
    ],
    shade: 0.78,
  },
  {
    d: [1, 0, 0],
    p: [
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 0],
      [1, 0, 0],
    ],
    shade: 0.86,
  },
  {
    d: [0, -1, 0],
    p: [
      [1, 0, 1],
      [0, 0, 1],
      [1, 0, 0],
      [0, 0, 0],
    ],
    shade: 0.55,
  },
  {
    d: [0, 1, 0],
    p: [
      [0, 1, 1],
      [1, 1, 1],
      [0, 1, 0],
      [1, 1, 0],
    ],
    shade: 1,
  },
  {
    d: [0, 0, -1],
    p: [
      [1, 0, 0],
      [0, 0, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
    shade: 0.8,
  },
  {
    d: [0, 0, 1],
    p: [
      [0, 0, 1],
      [1, 0, 1],
      [0, 1, 1],
      [1, 1, 1],
    ],
    shade: 0.94,
  },
];
export function makeAtlas() {
  const canvas = document.createElement("canvas");
  canvas.width = 16 * 16;
  canvas.height = 16;
  const ctx = canvas.getContext("2d");
  for (let id = 1; id < BLOCKS.length; id++) {
    ctx.fillStyle = BLOCKS[id].color;
    ctx.fillRect((id - 1) * 16, 0, 16, 16);
    for (let i = 0; i < 45; i++) {
      const x = (i * 7 + id * 3) % 16,
        y = (i * 11 + Math.floor(i / 3)) % 16;
      ctx.fillStyle = i % 2 ? "#ffffff12" : "#0000000b";
      ctx.fillRect(
        (id - 1) * 16 + x,
        y,
        id === B.WOOD ? 1 : 2,
        id === B.WOOD ? 6 : 1,
      );
    }
    if (id === B.BRICK) {
      ctx.fillStyle = "#e2bea060";
      ctx.fillRect((id - 1) * 16, 7, 16, 1);
      ctx.fillRect((id - 1) * 16, 15, 16, 1);
      ctx.fillRect((id - 1) * 16 + 8, 0, 1, 7);
      ctx.fillRect((id - 1) * 16 + 3, 8, 1, 7);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestMipmapLinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
export function chunkGeometry(world, cx, cz, water = false) {
  const positions = [],
    normals = [],
    uvs = [],
    colors = [],
    indices = [],
    ox = cx * 16,
    oz = cz * 16,
    data = world.getChunk(cx, cz);
  for (let y = 0; y < 64; y++)
    for (let z = 0; z < 16; z++)
      for (let x = 0; x < 16; x++) {
        const id = data[y * 256 + z * 16 + x];
        if (!id || (id === B.WATER) !== water) continue;
        for (const { d, p, shade } of faces) {
          const neighbor = world.get(ox + x + d[0], y + d[1], oz + z + d[2]);
          if (neighbor !== B.AIR && !(neighbor === B.WATER && !water)) continue;
          const n = positions.length / 3;
          p.forEach((v, i) => {
            positions.push(x + v[0], y + v[1] - (water ? 0.12 : 0), z + v[2]);
            normals.push(...d);
            const u = i === 2 || i === 3 ? 1 : 0,
              vv = i === 0 || i === 2 ? 1 : 0;
            uvs.push(
              ((id - 1) * 16 + 0.5 + u * 15) / 256,
              (0.5 + vv * 15) / 16,
            );
            colors.push(shade, shade, shade);
          });
          indices.push(n, n + 1, n + 2, n + 2, n + 1, n + 3);
        }
      }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}
export class ChunkRenderer {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.meshes = new Map();
    this.queue = new Set();
    this.radius = 4;
    const map = makeAtlas();
    this.solid = new THREE.MeshLambertMaterial({ map, vertexColors: true });
    this.water = new THREE.MeshLambertMaterial({
      map,
      vertexColors: true,
      transparent: true,
      opacity: 0.74,
      depthWrite: false,
    });
  }
  rebuild(key) {
    const [cx, cz] = key.split(",").map(Number),
      old = this.meshes.get(key);
    if (old) {
      this.scene.remove(old);
      old.children.forEach((m) => m.geometry.dispose());
    }
    const group = new THREE.Group();
    for (const water of [false, true]) {
      const g = chunkGeometry(this.world, cx, cz, water);
      if (!g.index.count) {
        g.dispose();
        continue;
      }
      group.add(new THREE.Mesh(g, water ? this.water : this.solid));
    }
    group.position.set(cx * 16, 0, cz * 16);
    this.scene.add(group);
    this.meshes.set(key, group);
  }
  update(x, z) {
    const cx = Math.floor(x / 16),
      cz = Math.floor(z / 16),
      r = this.radius;
    if (cx !== this.cx || cz !== this.cz || r !== this.lastRadius) {
      this.cx = cx;
      this.cz = cz;
      this.lastRadius = r;
      const wanted = [];
      for (let dz = -r; dz <= r; dz++)
        for (let dx = -r; dx <= r; dx++)
          if (
            Math.hypot(dx, dz) <= r + 0.4 &&
            Math.abs(cx + dx) < 10 &&
            Math.abs(cz + dz) < 10
          )
            wanted.push([`${cx + dx},${cz + dz}`, dx * dx + dz * dz]);
      wanted.sort((a, b) => a[1] - b[1]);
      const keys = new Set(wanted.map((a) => a[0]));
      this.queue = new Set([
        ...wanted.filter((a) => !this.meshes.has(a[0])).map((a) => a[0]),
        ...Array.from(this.queue).filter((k) => keys.has(k)),
      ]);
      for (const [key, group] of this.meshes)
        if (!keys.has(key)) {
          this.scene.remove(group);
          group.children.forEach((m) => m.geometry.dispose());
          this.meshes.delete(key);
        }
      this.world.prune(cx, cz, r + 2);
    }
    const start = performance.now();
    let count = 0;
    for (const key of this.queue) {
      this.queue.delete(key);
      this.rebuild(key);
      if (++count >= 2 || performance.now() - start > 5) break;
    }
  }
  dirty(x, z) {
    const cx = Math.floor(x / 16),
      cz = Math.floor(z / 16);
    for (const [dx, dz] of [
      [0, 0],
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]) {
      const key = `${cx + dx},${cz + dz}`;
      if (this.meshes.has(key)) this.queue.add(key);
    }
  }
}
