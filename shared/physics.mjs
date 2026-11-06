import { isSolid } from "./blocks.mjs";
import { ROOMS, nearbySolids } from "./architecture.mjs";
import { nearbyTrees } from "./environment.mjs";
export const RADIUS = 0.29,
  PLAYER_HEIGHT = 1.75,
  EYE = 1.6;

// Stair bounds are used for floor support; rail collisions keep players on the stairs.
export const STAIR_ZONES = [
  // Cầu thang Dinh Độc Lập (palace: x=60, stairX=-25 => x=35)
  { xMin: 33.7, xMax: 36.3, zMin: -52.5, zMax: -39.5, yMin: 3.8, yMax: 22.5, centerX: 35 },
  // Cầu thang Trụ sở Chính phủ (government: x=0, stairX=-24 => x=-24)
  { xMin: -25.3, xMax: -22.7, zMin: 69.5, zMax: 82.5, yMin: 3.8, yMax: 14.5, centerX: -24 },
  // Cầu thang Chùa Một Cột (pagoda: x=-87)
  { xMin: -88.3, xMax: -85.7, zMin: 69.4, zMax: 80.2, yMin: 2.8, yMax: 7.5, centerX: -87 },
  // Cầu thang Đài ngắm Trống Đồng (drum: x=98+9=107)
  { xMin: 105.6, xMax: 108.4, zMin: 72.5, zMax: 83.5, yMin: 2.8, yMax: 8.5, centerX: 107 },
];

export function getStairZone(p) {
  for (const z of STAIR_ZONES) {
    if (
      p.x >= z.xMin &&
      p.x <= z.xMax &&
      p.z >= z.zMin &&
      p.z <= z.zMax &&
      p.y >= z.yMin &&
      p.y <= z.yMax
    ) {
      return z;
    }
  }
  return null;
}
export function overlapsBlock(p, x, y, z) {
  return (
    p.x + RADIUS > x &&
    p.x - RADIUS < x + 1 &&
    p.y + PLAYER_HEIGHT > y &&
    p.y < y + 1 &&
    p.z + RADIUS > z &&
    p.z - RADIUS < z + 1
  );
}
export function collides(world, p) {
  for (
    let y = Math.floor(p.y + 0.001);
    y <= Math.floor(p.y + PLAYER_HEIGHT - 0.001);
    y++
  )
    for (
      let z = Math.floor(p.z - RADIUS + 0.001);
      z <= Math.floor(p.z + RADIUS - 0.001);
      z++
    )
      for (
        let x = Math.floor(p.x - RADIUS + 0.001);
        x <= Math.floor(p.x + RADIUS - 0.001);
        x++
      )
        if (isSolid(world.get(x, y, z))) return true;
  const solids = new Set();
  for (const x of [p.x - RADIUS, p.x + RADIUS])
    for (const z of [p.z - RADIUS, p.z + RADIUS])
      for (const s of nearbySolids(x, z)) solids.add(s);
  for (const s of solids) {
    const a = s.bounds;
    if (
      p.x + RADIUS > a[0] + 0.0001 &&
      p.x - RADIUS < a[3] - 0.0001 &&
      p.y + PLAYER_HEIGHT > a[1] + 0.0001 &&
      p.y < a[4] - 0.0001 &&
      p.z + RADIUS > a[2] + 0.0001 &&
      p.z - RADIUS < a[5] - 0.0001
    )
      return true;
  }
  for (const t of nearbyTrees(p.x, p.z))
    if (
      p.y < 3 + t.height &&
      p.y + PLAYER_HEIGHT > 3 &&
      Math.hypot(p.x - t.x, p.z - t.z) < RADIUS + t.radius
    )
      return true;
  return false;
}
export function isJumpRestricted(p) {
  const museum = ROOMS.find(room => room.id === "museum");
  if (!museum) return false;
  const a = museum.bounds;
  return p.x >= a[0] - 0.5 && p.x <= a[3] + 0.5 &&
    p.z >= a[2] - 0.5 && p.z <= a[5] + 0.5 &&
    p.y >= a[1] - 0.5 && p.y <= a[4];
}

export function stepPlayer(world, p, input, dt) {
  const jump = input.jump && !isJumpRestricted(p);
  // Phong cách di chuyển chuẩn Minecraft: mượt mà, tự do 360 độ, điều khiển tự nhiên theo hướng nhìn
  const speed = input.sprint ? 7.2 : 4.8,
    len = Math.hypot(input.x, input.z) || 1,
    ix = input.x / Math.max(1, len),
    iz = input.z / Math.max(1, len);
  let dx = (ix * Math.cos(p.yaw) + iz * Math.sin(p.yaw)) * speed * dt;
  let dz = (-ix * Math.sin(p.yaw) + iz * Math.cos(p.yaw)) * speed * dt;

  // Never snap X to the center: this caused lateral jumps and server corrections.
  const onStair = getStairZone(p);

  if (jump && p.grounded) p.vy = 8.3;
  p.vy = Math.max(-26, p.vy - 24 * dt);
  const displacement = { x: dx, z: dz, y: p.vy * dt };
  const wasGrounded = p.grounded;
  p.grounded = false;
  for (const axis of ["x", "z", "y"]) {
    const move = displacement[axis],
      steps = Math.max(1, Math.ceil(Math.abs(move) / 0.15)),
      increment = move / steps;
    for (let i = 0; i < steps; i++) {
      p[axis] += increment;
      if (collides(world, p)) {
        const isSupported = wasGrounded || !!onStair || collides(world, { ...p, y: p.y - 0.45 });
        if (axis !== "y" && isSupported) {
          let climbed = false;
          for (const rise of [0.08, 0.16, 0.25, 0.35, 0.45]) {
            p.y += rise;
            if (!collides(world, p)) {
              let low = p.y - rise,
                high = p.y;
              for (let n = 0; n < 12; n++) {
                p.y = (low + high) / 2;
                if (collides(world, p)) low = p.y;
                else high = p.y;
              }
              p.y = high + 0.0001;
              climbed = true;
              break;
            }
            p.y -= rise;
          }
          if (climbed) {
            p.grounded = true;
            p.vy = 0;
            displacement.y = 0;
            continue;
          }
        }
        p[axis] -= increment;
        if (axis === "y") {
          // Tìm mặt sàn chính xác, tránh tích lũy sai số ở các bậc 20–25 cm.
          let safe = p[axis],
            blocked = safe + increment;
          for (let n = 0; n < 10; n++) {
            p[axis] = (safe + blocked) / 2;
            if (collides(world, p)) blocked = p[axis];
            else safe = p[axis];
          }
          p[axis] = safe;
          if (move < 0) p.grounded = true;
          p.vy = 0;
        }
        break;
      }
    }
    // Thuật toán bám mặt sàn khi bước xuống cầu thang và dốc (Step-down):
    // Khi đang bước đi mà rơi khỏi mép bậc thang (chênh lệch độ cao dưới 0.45m),
    // tự động bám xuống mặt bậc dưới, triệt tiêu hoàn toàn hiện tượng bay lơ lửng trên không!
    if ((wasGrounded || !!onStair || p.grounded) && !jump && (axis === "z" || axis === "x")) {
      const maxDrop = 0.45;
      if (!collides(world, p) && collides(world, { ...p, y: p.y - maxDrop })) {
        let low = p.y - maxDrop, high = p.y;
        for (let n = 0; n < 12; n++) {
          const mid = (low + high) / 2;
          if (collides(world, { ...p, y: mid })) low = mid;
          else high = mid;
        }
        p.y = high + 0.0001;
        p.grounded = true;
        p.vy = 0;
      }
    }
  }
  return p;
}

// Network positions may be rounded to millimeters. Allow only that floor tolerance,
// while retaining wall/ceiling checks and the existing small step-up allowance.
export function movementPathClear(world, from, to) {
  const tolerance = 0.002;
  const blocked = p => collides(world, { ...p, y: p.y + tolerance });
  if (blocked(to)) return false;
  const horizontal = Math.hypot(to.x - from.x, to.z - from.z);
  const dy = Math.abs(to.y - from.y);
  const steps = Math.max(1, Math.ceil(Math.hypot(horizontal, dy) / 0.2));
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const sample = {
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t,
      z: from.z + (to.z - from.z) * t,
    };
    if (!blocked(sample)) continue;
    if (dy <= 0.65 && !blocked({ ...sample, y: Math.max(from.y, to.y) })) continue;
    return false;
  }
  return true;
}

function rayBox(origin, direction, bounds, radius) {
  let near = 0,
    far = Infinity;
  for (let i = 0; i < 3; i++) {
    const axis = ["x", "y", "z"][i],
      min = bounds[i] - radius,
      max = bounds[i + 3] + radius,
      o = origin[axis],
      d = direction[axis];
    if (Math.abs(d) < 1e-8) {
      if (o < min || o > max) return Infinity;
    } else {
      let a = (min - o) / d,
        b = (max - o) / d;
      if (a > b) [a, b] = [b, a];
      near = Math.max(near, a);
      far = Math.min(far, b);
      if (near > far) return Infinity;
    }
  }
  return far >= 0 ? Math.max(0, near) : Infinity;
}
export function cameraDistance(
  world,
  pivot,
  direction,
  maxDistance,
  radius = 0.18,
) {
  const end = {
      x: pivot.x + direction.x * maxDistance,
      z: pivot.z + direction.z * maxDistance,
    },
    candidates = new Set();
  for (
    let cx = Math.floor((Math.min(pivot.x, end.x) - radius) / 16);
    cx <= Math.floor((Math.max(pivot.x, end.x) + radius) / 16);
    cx++
  )
    for (
      let cz = Math.floor((Math.min(pivot.z, end.z) - radius) / 16);
      cz <= Math.floor((Math.max(pivot.z, end.z) + radius) / 16);
      cz++
    )
      for (const s of nearbySolids(cx * 16 + 0.5, cz * 16 + 0.5))
        candidates.add(s);
  let clear = maxDistance;
  for (const s of candidates)
    clear = Math.min(
      clear,
      Math.max(0.12, rayBox(pivot, direction, s.bounds, radius) - 0.07),
    );
  for (const t of nearbyTrees(pivot.x, pivot.z)) {
    const a = [
      t.x - t.radius,
      3,
      t.z - t.radius,
      t.x + t.radius,
      3 + t.height,
      t.z + t.radius,
    ];
    clear = Math.min(
      clear,
      Math.max(0.12, rayBox(pivot, direction, a, radius) - 0.07),
    );
  }
  for (let distance = 0.05; distance <= clear; distance += 0.12) {
    const x = pivot.x + direction.x * distance,
      y = pivot.y + direction.y * distance,
      z = pivot.z + direction.z * distance;
    for (const dx of [-radius, radius])
      for (const dy of [-radius, radius])
        for (const dz of [-radius, radius])
          if (isSolid(world.get(x + dx, y + dy, z + dz)))
            return Math.max(0.12, distance - 0.14);
  }
  return clear;
}
// DDA đi qua từng ô lưới, không cần tạo đối tượng Three.js cho mỗi khối.
export function traceVoxel(world, origin, direction, maxDistance = 6) {
  let x = Math.floor(origin.x),
    y = Math.floor(origin.y),
    z = Math.floor(origin.z),
    dist = 0,
    normal = [0, 0, 0];
  const axes = ["x", "y", "z"],
    cell = [x, y, z],
    step = axes.map((a) => (direction[a] >= 0 ? 1 : -1));
  const delta = axes.map((a) =>
    direction[a] === 0 ? Infinity : Math.abs(1 / direction[a]),
  );
  const next = axes.map((a, i) =>
    direction[a] === 0
      ? Infinity
      : (step[i] > 0 ? cell[i] + 1 - origin[a] : origin[a] - cell[i]) *
        delta[i],
  );
  while (dist <= maxDistance) {
    [x, y, z] = cell;
    const id = world.get(x, y, z);
    if (id && id !== 9) return { x, y, z, id, normal, distance: dist };
    const a =
      next[0] < next[1]
        ? next[0] < next[2]
          ? 0
          : 2
        : next[1] < next[2]
          ? 1
          : 2;
    dist = next[a];
    cell[a] += step[a];
    next[a] += delta[a];
    normal = [0, 0, 0];
    normal[a] = -step[a];
  }
  return null;
}
