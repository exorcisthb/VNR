import test from 'node:test';
import assert from 'node:assert/strict';
import { BUILDINGS, ROOMS } from '../shared/architecture.mjs';
import { collides } from '../shared/physics.mjs';
const emptyWorld = { get: () => 0 };

test('stairwell guards block all exposed sides while keeping upper landings accessible', () => {
  for (const [id, stairX, levels] of [['palace', -25, [10, 16]], ['government', -24, [9, 14]]]) {
    const building = BUILDINGS.find(b => b.id === id);
    for (const level of levels) {
      const position = (dx, z) => ({ x: building.x + stairX + dx, y: level + 0.025, z: building.z + z * building.front });
      for (const z of [-3, 0, 3, 7]) for (const side of [-1, 1])
        assert.equal(collides(emptyWorld, position(side * 1.9, z)), true, `${id} ${level}: unguarded side`);
      assert.equal(collides(emptyWorld, position(0, 8)), true, `${id} ${level}: unguarded end`);
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
