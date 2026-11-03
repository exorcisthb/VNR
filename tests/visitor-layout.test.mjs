import test from 'node:test';
import assert from 'node:assert/strict';
import { BUILDINGS, ROOMS } from '../shared/architecture.mjs';
import { collides, stepPlayer, isJumpRestricted } from '../shared/physics.mjs';
const emptyWorld = { get: () => 0 };

test('museum blocks jump input while outdoor visitors can still jump', () => {
  const museum = ROOMS.find(r => r.id === 'museum');
  const inside = { ...museum.spawn, vy: 0, grounded: true };
  assert.equal(isJumpRestricted(inside), true);
  stepPlayer(emptyWorld, inside, { x: 0, z: 0, jump: true }, 1 / 120);
  assert.ok(inside.vy <= 0, 'museum visitor jumped');
  const outside = { x: 0, y: 3, z: 0, yaw: 0, vy: 0, grounded: true };
  assert.equal(isJumpRestricted(outside), false);
  stepPlayer(emptyWorld, outside, { x: 0, z: 0, jump: true }, 1 / 120);
  assert.ok(outside.vy > 0, 'outdoor jumping was blocked');
});

test('red runner covers the mausoleum stairs continuously from landing to plaza', () => {
  const b = BUILDINGS.find(b => b.id === 'mausoleum');
  const runner = b.parts.filter(p => p.mat === 'carpet' && p.size[0] === 3.4);
  for (let z = 12.05; z < 25.95; z += 0.05) {
    const top = z < 19 ? 4.2 : z < 22.9 ? 3 + 0.2 * (6 - Math.floor((z - 19) / 0.65)) : 3;
    assert.ok(runner.some(p => Math.abs(p.position[2] - (b.z + z * b.front)) <= p.size[2] / 2 + 0.001 &&
      p.position[1] + p.size[1] / 2 > top && p.position[1] - p.size[1] / 2 < top + 0.05),
      `exposed stair at ${z}`);
  }
});

test('stairwell guards block all exposed sides while keeping upper landings accessible', () => {
  for (const [id, stairX, levels] of [['palace', -25, [10, 16]], ['government', -24, [9, 14]]]) {
    const building = BUILDINGS.find(b => b.id === id);
    for (const level of levels) {
      const position = (dx, z, yOffset = 0.025) => ({ x: building.x + stairX + dx, y: level + yOffset, z: building.z + z * building.front });
      for (const z of [-3, 0, 3, 7]) for (const side of [-1, 1])
        assert.equal(collides(emptyWorld, position(side * 1.9, z)), true, `${id} ${level}: unguarded side`);
      if (level === levels.at(-1)) {
        assert.equal(collides(emptyWorld, position(0, 8, 1.0)), true, `${id} ${level}: unguarded end on rooftop`);
      } else {
        assert.equal(collides(emptyWorld, position(0, 8, 1.0)), false, `${id} ${level}: blocked stair entrance on intermediate floor`);
      }
      assert.equal(collides(emptyWorld, position(0, -4.8)), false, `${id} ${level}: blocked landing`);
    }
  }
});

test('new museum room spawns are inside their rooms and clear of furniture', () => {
  for (const id of ['president-office', 'office', 'video-meeting', 'operations', 'museum']) {
    const room = ROOMS.find(r => r.id === id);
    assert.ok(room, id);
    const {x, y, z} = room.spawn, a = room.bounds;
    assert.ok(x > a[0] && x < a[3] && y > a[1] && y < a[4] && z > a[2] && z < a[5]);
    assert.equal(collides(emptyWorld, room.spawn), false, `${id}: blocked spawn`);
  }
});

test('museum entrance and circulation gaps are open, with a solid floor below', () => {
  const building = BUILDINGS.find(b => b.id === 'mausoleum');
  for (const [x, z] of [[-43, 7], [-43, 5.5], [-39, 1], [-47, 1], [-43, -8]]) {
    const p = { x: building.x + x, y: 3.225, z: building.z + z };
    assert.equal(collides(emptyWorld, p), false, `Blocked museum route at ${x},${z}`);
    assert.equal(collides(emptyWorld, { ...p, y: 3.15 }), true, 'Missing floor support');
  }
});
