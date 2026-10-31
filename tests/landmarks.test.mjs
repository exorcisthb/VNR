import test from "node:test";
import assert from "node:assert/strict";
import { VoxelWorld, SPAWN } from "../shared/world.mjs";
import { LANDMARKS } from "../shared/landmarks.mjs";
import { BUILDINGS, ROOMS, findRoom } from "../shared/architecture.mjs";
import { TREES } from "../shared/environment.mjs";
import { collides, stepPlayer, cameraDistance } from "../shared/physics.mjs";
function walk(world, p, x, z) {
  let frames = 0;
  while (Math.hypot(p.x - x, p.z - z) > 0.055 && frames++ < 9000) {
    p.yaw = Math.atan2(p.x - x, p.z - z);
    stepPlayer(world, p, { x: 0, z: -1 }, 1 / 120);
  }
  assert.ok(
    Math.hypot(p.x - x, p.z - z) < 0.06,
    "Không đi được đến " + x + "," + z + " từ " + p.x + "," + p.z,
  );
}
test("five destinations and every interior destination are accessible and have public sources", () => {
  const w = new VoxelWorld();
  assert.equal(BUILDINGS.length, 5);
  assert.equal(ROOMS.length, 11);
  for (const l of LANDMARKS) assert.match(l.source, /^https:/);
  for (const r of ROOMS) {
    assert.equal(collides(w, r.spawn), false, r.id);
    assert.match(r.source, /^https:/);
    assert.equal(findRoom(r.spawn)?.id, r.id);
  }
  assert.equal(collides(w, SPAWN), false);
});
test("one continuous map allows walking along paths between all three areas", () => {
  const w = new VoxelWorld(),
    p = { ...SPAWN, grounded: true, vy: 0 };
  for (const [x, z] of [
    [-66.5, 20],
    [60, 20],
    [60, 7],
    [60, 20],
    [0, 20],
    [0, 37],
  ])
    walk(w, p, x, z);
  assert.ok(Math.abs(p.y - 3) < 0.01);
});
test("front doors and entrance steps can be walked through without jumping", () => {
  const w = new VoxelWorld();
  for (const b of BUILDINGS.filter(b => !b.approach)) {
    const p = {
      x: b.x,
      y: 3,
      z: b.z + b.front * 25,
      yaw: 0,
      vy: 0,
      grounded: true,
    };
    walk(w, p, b.x, b.z + b.front * 10);
    assert.ok(Math.abs(p.y - (b.id === "mausoleum" ? 4.2 : 4)) < 0.02, b.id);
    assert.equal(collides(w, p), false);
  }
});
test("both stair flights can be climbed and descended without ceiling obstruction", () => {
  const w = new VoxelWorld();
  for (const b of BUILDINGS.filter((b) => ["palace", "government"].includes(b.id))) {
    const sx = b.id === "palace" ? -25 : -24,
      rise = b.id === "palace" ? 6 : 5,
      p = {
        x: b.x + sx,
        y: 4,
        z: b.z + 9 * b.front,
        yaw: 0,
        vy: 0,
        grounded: true,
      };
    for (let floor = 1; floor <= 2; floor++) {
      walk(w, p, b.x + sx, b.z - 7 * b.front);
      assert.ok(
        Math.abs(p.y - (4 + rise * floor)) < 0.02,
        b.id + " tầng " + floor,
      );
      if (floor < 2) {
        walk(w, p, b.x + sx + 5, b.z - 7 * b.front);
        walk(w, p, b.x + sx + 5, b.z + 9 * b.front);
        walk(w, p, b.x + sx, b.z + 9 * b.front);
      }
    }
    walk(w, p, b.x + sx, b.z + 9 * b.front);
    for (let i = 0; i < 200; i++) stepPlayer(w, p, { x: 0, z: 0 }, 1 / 120);
    walk(w, p, b.x + sx + 5, b.z + 9 * b.front);
    walk(w, p, b.x + sx + 5, b.z - 7 * b.front);
    walk(w, p, b.x + sx, b.z - 7 * b.front);
    walk(w, p, b.x + sx, b.z + 9 * b.front);
    for (let i = 0; i < 100; i++) stepPlayer(w, p, { x: 0, z: 0 }, 1 / 120);
    assert.ok(Math.abs(p.y - 4) < 0.02);
    assert.equal(collides(w, p), false);
  }
});
test("mausoleum visitor route leads from the front door around the vestibule into the chamber", () => {
  const w = new VoxelWorld(),
    p = { x: -66, y: 3, z: -23, yaw: 0, vy: 0, grounded: true };
  walk(w, p, -66, -39);
  walk(w, p, -57, -39);
  walk(w, p, -57, -45);
  assert.equal(findRoom(p)?.id, "memorial");
  assert.ok(Math.abs(p.y - 4.2) < 0.02);
  assert.equal(
    collides(w, { x: -66, y: 4.2, z: -51 }),
    true,
    "Bệ kính phải cản nhân vật",
  );
});
test("rebuilt facades leave entrance passages clear and retain the interior exhibits", () => {
  const w = new VoxelWorld();
  for (const id of ["mausoleum", "government"]) {
    const b = BUILDINGS.find(b => b.id === id), floor = id === "mausoleum" ? 4.2 : 4;
    for (const z of [14, 15, 16, 17, 18]) {
      assert.equal(collides(w, { x: b.x, y: floor + 0.025, z: b.z + z * b.front }), false,
        `${id}: facade blocks the entrance at ${z}`);
    }
  }
  const mausoleum = BUILDINGS.find(b => b.id === "mausoleum");
  assert.ok(mausoleum.labels.some(l => l.kind === "mausoleum-title" && l.text.includes("\n")));
  assert.deepEqual(mausoleum.parts.find(p => p.shape === "restingPresident").position, [-66, 5.56, -51]);
  const government = BUILDINGS.find(b => b.id === "government");
  assert.ok(!government.parts.some(p => p.shape === "roof" || p.shape === "pediment"));
  assert.deepEqual(government.parts.find(p => p.shape === "hoChiMinhBust").position, [0, 6.155, 90.6]);
  // Tầng đá tam cấp Lăng Bác liền mạch từ mặt dựng z = 12.4, không có khoảng hở lơ lửng
  const stoneTiers = mausoleum.parts.filter(p => p.mat === "mausStone" && p.position[1] >= 4.2 && p.position[1] <= 9.8 && p.size[2] > 1 && (p.position[2] - mausoleum.z) * mausoleum.front > 0);
  for (const tier of stoneTiers) {
    const localZCenter = (tier.position[2] - mausoleum.z) * mausoleum.front;
    const backZ = localZCenter - tier.size[2] / 2;
    assert.ok(Math.abs(backZ - 12.4) < 0.05, `Tầng đá ${tier.position[1]} phải tựa sát tường z = 12.4: backZ = ${backZ}`);
  }
  // Cửa đại phòng họp chính phủ 2 cánh bề thế, có thể đóng mở
  assert.ok(government.doors?.length > 0, "Trụ sở chính phủ có cửa đại tương tác");
  const meetingDoor = government.doors.find(d => d.kind === "meetingRoomDouble");
  assert.ok(meetingDoor, "Có cửa đôi phòng họp chính phủ");
  assert.ok(meetingDoor.width >= 6.0, "Cửa bề thế chiều rộng >= 6m");
  assert.ok(meetingDoor.height >= 3.0, "Chiều cao cửa >= 3m");
  // Hòm kính không bị tấm nắp đặc che khuất phía trên
  assert.ok(!mausoleum.parts.some(p => p.mat === "bronze" && p.position[1] > 5.5 && p.size[0] > 1), "Hòm kính không bị nắp đè phía trên");
  // 4 mặt Lăng Bác đều đối xứng hoàn hảo
  const columns = mausoleum.parts.filter(p => p.mat === "mausPolished" && p.size[1] > 10);
  assert.equal(columns.length, 20, "20 cột hoa cương bao quanh cả 4 mặt (mỗi mặt 6 cột)");
  const redWalls = mausoleum.parts.filter(p => p.mat === "mausRed" && p.size[1] > 10);
  assert.equal(redWalls.length, 4, "Tường lõi đỏ ở cả 4 mặt sau hàng cột");
});
test("third-person camera stops before walls, ceilings and tree trunks", () => {
  const w = new VoxelWorld();
  assert.ok(
    cameraDistance(w, { x: -55, y: 5.6, z: -48 }, { x: 1, y: 0, z: 0 }, 5) < 2,
  );
  assert.ok(
    cameraDistance(w, { x: -57, y: 9.5, z: -51 }, { x: 0, y: 1, z: 0 }, 5) < 2,
  );
  assert.equal(
    cameraDistance(w, { x: 0, y: 5, z: 20 }, { x: 0, y: 0, z: -1 }, 3),
    3,
  );
  const t = TREES[0];
  assert.ok(
    cameraDistance(w, { x: t.x - 2, y: 5, z: t.z }, { x: 1, y: 0, z: 0 }, 4) <
      2,
  );
});

test('new heritage areas connect by foot; pagoda steps and drum overlook are walkable', () => {
  const w=new VoxelWorld(),p={...SPAWN,grounded:true,vy:0};
  walk(w,p,-66.5,20);walk(w,p,-87,20);walk(w,p,-87,60);
  walk(w,p,-87,81.3);
  assert.ok(Math.abs(p.y-7.2)<.02,'walk up pagoda without jumping');
  walk(w,p,-87,60);assert.ok(Math.abs(p.y-3)<.02);
  walk(w,p,-87,20);walk(w,p,98,20);walk(w,p,98,65);
  walk(w,p,107,65);walk(w,p,107,87);
  assert.ok(Math.abs(p.y-8.2)<.02,'drum viewing terrace');
  assert.equal(collides(w,p),false);
  walk(w,p,107,65);assert.ok(Math.abs(p.y-3)<.02);
  const drum=BUILDINGS.find(b=>b.id==='drum').parts.find(p=>p.shape==='drumBody');
  assert.ok(drum.size[1]>=1.75+2);
  assert.equal(drum.size[0],7.4);
  assert.ok(collides(w,{x:98,y:3,z:87}),'cannot walk through exhibit');
});
