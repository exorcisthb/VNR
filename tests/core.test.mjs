import test from "node:test";
import assert from "node:assert/strict";
import { VoxelWorld, SPAWN } from "../shared/world.mjs";
import { B } from "../shared/blocks.mjs";
import { stepPlayer, traceVoxel, collides } from "../shared/physics.mjs";
test("deterministic flat terrain, negative chunk boundaries and edits", () => {
  const a = new VoxelWorld(),
    b = new VoxelWorld();
  assert.deepEqual(a.getChunk(-4, 0), b.getChunk(-4, 0));
  assert.equal(a.get(-17, 0, 0), B.BEDROCK);
  a.set(-17, 3, 1, B.BRICK);
  a.chunks.clear();
  assert.equal(a.get(-17, 3, 1), B.BRICK);
  assert.equal(a.get(-16, 3, 1), b.get(-16, 3, 1));
});
test("gravity lands on ground; jump returns and walls block movement", () => {
  const w = new VoxelWorld(),
    p = { ...SPAWN, y: 8, vy: 0, grounded: false };
  for (let i = 0; i < 300; i++) stepPlayer(w, p, { x: 0, z: 0 }, 1 / 120);
  assert.ok(Math.abs(p.y - 3) < 0.01);
  assert.ok(p.grounded);
  stepPlayer(w, p, { x: 0, z: 0, jump: true }, 1 / 120);
  assert.ok(p.y > 3);
  for (let i = 0; i < 180; i++) stepPlayer(w, p, { x: 0, z: 0 }, 1 / 120);
  assert.ok(Math.abs(p.y - 3) < 0.01);
  w.set(-66, 3, 12, B.STONE);
  w.set(-66, 4, 12, B.STONE);
  for (let i = 0; i < 120; i++) stepPlayer(w, p, { x: 1, z: 0 }, 1 / 120);
  assert.ok(p.x <= -66.289);
  assert.equal(collides(w, p), false);
});
test("DDA selects actual voxel and outward placement normal", () => {
  const w = new VoxelWorld();
  const hit = traceVoxel(
    w,
    { x: SPAWN.x, y: 5, z: SPAWN.z },
    { x: 0, y: -1, z: 0 },
  );
  assert.equal(hit.y, 2);
  assert.deepEqual(hit.normal, [0, 1, 0]);
});
