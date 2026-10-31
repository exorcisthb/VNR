import test from 'node:test';
import assert from 'node:assert/strict';
import { VoxelWorld } from '../shared/world.mjs';
import { B } from '../shared/blocks.mjs';
import { stepPlayer, movementPathClear } from '../shared/physics.mjs';

const rounded = p => ({ x: +p.x.toFixed(3), y: +p.y.toFixed(3), z: +p.z.toFixed(3) });

test('both interior stair flights accept network updates going up and down without jumping or centering', () => {
  const world = new VoxelWorld();
  for (const stair of [
    { x: -23.5, bottomZ: 69, topZ: 83, yaw: Math.PI, rise: 5 },
    { x: 35.5, bottomZ: -39, topZ: -53, yaw: 0, rise: 6 },
  ]) for (const floor of [4, 4 + stair.rise]) for (const sprint of [false, true]) {
    const p = { x: stair.x, y: floor, z: stair.bottomZ, yaw: stair.yaw, vy: 0, grounded: true };
    let lastPacket = rounded(p), packets = 0;
    for (const direction of [-1, 1]) {
      const target = direction === -1 ? stair.topZ : stair.bottomZ;
      let frames = 0;
      while (Math.abs(p.z - target) > 0.07 && frames < 1000) {
        const previous = { ...p };
        stepPlayer(world, p, { x: 0, z: direction, sprint }, 1 / 120);
        assert.equal(p.x, stair.x, 'stair movement must not snap sideways');
        assert.ok(Math.abs(p.z - previous.z) > 0.001, 'must keep walking without jumping');
        if (++frames % 6 === 0) {
          const packet = rounded(p);
          assert.ok(movementPathClear(world, lastPacket, packet), `server rejected stair update ${JSON.stringify(packet)}`);
          lastPacket = packet;
          packets++;
        }
      }
      assert.ok(frames < 1000, 'must reach the landing');
      assert.ok(Math.abs(p.y - (direction === -1 ? floor + stair.rise : floor)) < 0.02);
    }
    assert.ok(packets > 30);
  }
});

test('network floor tolerance still rejects walking through a wall or sinking into a floor', () => {
  const world = new VoxelWorld();
  world.set(0, 3, 20, B.STONE);
  world.set(0, 4, 20, B.STONE);
  assert.equal(movementPathClear(world, { x: -1, y: 3, z: 20.5 }, { x: 2, y: 3, z: 20.5 }), false);
  assert.equal(movementPathClear(world, { x: 3, y: 3, z: 20.5 }, { x: 3, y: 2.98, z: 20.5 }), false);
});
