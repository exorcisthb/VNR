import { fileURLToPath } from "node:url";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { WebSocketServer, WebSocket } from "ws";
import {
  VoxelWorld,
  SPAWN,
  WORLD_VERSION,
  inBounds,
  LIMIT,
} from "../shared/world.mjs";
import { B, PALETTE, isSolid } from "../shared/blocks.mjs";
import {
  movementPathClear,
  overlapsBlock,
  traceVoxel,
  EYE,
} from "../shared/physics.mjs";
import { isProtected, LANDMARKS, visitSpawn } from "../shared/landmarks.mjs";
import { ROOMS } from "../shared/architecture.mjs";
import { WorldStorage, loadSave } from "./storage.mjs";

export const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export const clean = (value, max) =>
  typeof value === "string"
    ? value
        .normalize("NFC")
        .replace(/[\p{Cc}\p{Cf}<>]/gu, "")
        .trim()
        .slice(0, max)
    : "";

export const spawnProtected = (x, z) =>
  [SPAWN, ...LANDMARKS.map(visitSpawn)].some(
    (p) => Math.abs(x - p.x) < 4 && Math.abs(z - p.z) < 4,
  );

export async function attachGameCore({
  server,
  middlewares,
  worldFile = process.env.WORLD_FILE || path.join(root, "data", "world.json"),
  dev = false,
} = {}) {
  const saved = await loadSave(worldFile);
  const world = new VoxelWorld(
    saved.edits.filter(([k]) => {
      const [x, y, z] = k.split(",").map(Number);
      return !isProtected(x, y, z) && !spawnProtected(x, z);
    }),
  );
  const storage = new WorldStorage(worldFile, world);
  await storage.flush();

  const players = new Map();
  const rooms = new Map();
  const history = [];
  let revision = 0;
  let closing = false;

  const handleHttp = (req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    let pathname = "";
    try {
      pathname = new URL(req.url, "http://localhost").pathname;
    } catch {
      if (typeof next === "function") return next();
      res.writeHead(400);
      return res.end("Bad Request");
    }

    if (pathname === "/api/rooms") {
      const activeRooms = [];
      for (const [rId, room] of rooms) {
        if (room.players.size > 0 || Date.now() - room.createdAt < 120000) {
          activeRooms.push({
            id: rId,
            name: room.name,
            hostName: room.hostName,
            players: room.players.size,
            maxPlayers: 50,
            createdAt: room.createdAt,
          });
        }
      }
      if (activeRooms.length === 0 && players.size > 0) {
        const currentHost = Array.from(players.values()).find((p) => p.role === "host");
        activeRooms.push({
          id: "main",
          name: currentHost ? `Đoàn tham quan của ${currentHost.name}` : "Đoàn tham quan di sản",
          hostName: currentHost ? currentHost.name : "Người dẫn đoàn",
          players: players.size,
          maxPlayers: 50,
          createdAt: Date.now(),
        });
      }
      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-cache",
      });
      return res.end(JSON.stringify(activeRooms));
    }

    if (pathname === "/health") {
      const currentHost = Array.from(players.values()).find((p) => p.role === "host");
      res.writeHead(storage.lastError ? 503 : 200, {
        "Content-Type": "application/json",
      });
      return res.end(
        JSON.stringify({
          ok: !storage.lastError,
          players: players.size,
          maxPlayers: 50,
          mode: "tour",
          hasHost: !!currentHost,
          hostName: currentHost?.name || null,
          version: WORLD_VERSION,
          lastSaved: storage.lastSaved,
        }),
      );
    }

    if (pathname === "/api/world") {
      storage
        .flush()
        .then(() => {
          res.writeHead(200, {
            "Content-Type": "application/json; charset=utf-8",
            "Content-Disposition": 'attachment; filename="dau-viet-world.json"',
            "Cache-Control": "no-store",
          });
          res.end(JSON.stringify(storage.snapshot()));
        })
        .catch(() => {
          res.writeHead(503);
          res.end("Chưa lưu được thế giới.");
        });
      return;
    }

    if (typeof next === "function") next();
  };

  if (middlewares) {
    middlewares.use(handleHttp);
  }

  const wss = new WebSocketServer({
    noServer: true,
    maxPayload: 4096,
    perMessageDeflate: false,
  });

  const upgradeHandler = (req, socket, head) => {
    let pathname = "";
    try {
      pathname = new URL(req.url, "http://localhost").pathname;
    } catch {
      if (!dev) socket.destroy();
      return;
    }
    if (pathname !== "/ws") {
      if (!dev) socket.destroy();
      return;
    }
    if (wss.clients.size >= 65) {
      socket.write("HTTP/1.1 503 Service Unavailable\r\n\r\n");
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) =>
      wss.emit("connection", ws, req),
    );
  };

  if (server) {
    server.on("upgrade", upgradeHandler);
  }

  const send = (ws, data) => {
    if (ws.readyState === WebSocket.OPEN) {
      if (ws.bufferedAmount > 2_000_000) return ws.terminate();
      ws.send(JSON.stringify(data));
    }
  };

  const broadcast = (data, except) => {
    for (const [ws] of players) if (ws !== except) send(ws, data);
  };

  const publicPlayer = (p) => ({
    id: p.id,
    name: p.name,
    color: p.color,
    role: p.role,
    x: p.x,
    y: p.y,
    z: p.z,
    yaw: p.yaw,
  });

  const reject = (ws, message) => send(ws, { type: "error", message });

  wss.on("connection", (ws) => {
    ws.alive = true;
    ws.on("pong", () => (ws.alive = true));
    ws.on("error", () => {});
    const timeout = setTimeout(() => ws.close(1008, "Join timeout"), 10000);
    timeout.unref();
    const buckets = new Map();
    function allowed(kind, rate, burst = rate) {
      const now = Date.now(),
        bucket = buckets.get(kind) || { tokens: burst, time: now };
      bucket.tokens = Math.min(
        burst,
        bucket.tokens + ((now - bucket.time) * rate) / 1000,
      );
      bucket.time = now;
      if (bucket.tokens < 1) {
        buckets.set(kind, bucket);
        return false;
      }
      bucket.tokens--;
      buckets.set(kind, bucket);
      return true;
    }
    ws.on("message", (raw, isBinary) => {
      if (isBinary || !allowed("all", 100, 150))
        return ws.close(1008, "Too many messages");
      let m;
      try {
        m = JSON.parse(raw.toString());
      } catch {
        return reject(ws, "Tin nhắn không hợp lệ.");
      }
      if (!m || typeof m !== "object") return;
      let p = players.get(ws);
      if (m.type === "join") {
        if (p) return;
        if (players.size >= 50) return ws.close(1013, "Phòng đã đủ 50 người.");
        const name = clean(m.name, 20);
        if (!name) return reject(ws, "Hãy nhập tên từ 1 đến 20 ký tự.");
        clearTimeout(timeout);

        let role;
        let assignedRoom = null;
        if (m.action === "create" || m.role === "host") {
          // Người chọn Tạo phòng: là Host dẫn đoàn cầm cờ
          role = "host";
          // Đảm bảo chỉ có 1 host dẫn đoàn, chuyển host cũ thành sinh viên
          for (const other of players.values()) {
            if (other.role === "host") other.role = "student";
          }
          const roomId = "room-" + randomUUID().slice(0, 8);
          assignedRoom = {
            id: roomId,
            name: `Đoàn tham quan của ${name}`,
            hostName: name,
            createdAt: Date.now(),
            players: new Map(),
          };
          rooms.set(roomId, assignedRoom);
        } else if (m.action === "join" || m.role === "student") {
          // Người chọn Vào phòng: luôn là Sinh viên FPT
          role = "student";
          if (m.roomId && rooms.has(m.roomId)) {
            assignedRoom = rooms.get(m.roomId);
          } else {
            assignedRoom = Array.from(rooms.values()).find((r) => r.players.size < 50);
          }
          if (!assignedRoom) {
            assignedRoom = {
              id: "main",
              name: "Đoàn tham quan di sản",
              hostName: "Chờ trưởng đoàn",
              createdAt: Date.now(),
              players: new Map(),
            };
            rooms.set("main", assignedRoom);
          }
        } else {
          // Tương thích ngược: người đầu tiên là host, người sau là sinh viên
          role = players.size === 0 ? "host" : "student";
        }

        p = {
          id: randomUUID().slice(0, 8),
          name,
          role,
          color: ["#d7ac68", "#689b9a", "#ae7f83", "#829d63"][players.size % 4],
          ...SPAWN,
          lastMove: Date.now(),
        };
        players.set(ws, p);
        if (assignedRoom) {
          assignedRoom.players.set(ws, p);
          ws.roomId = assignedRoom.id;
        }
        send(ws, {
          type: "welcome",
          id: p.id,
          spawn: SPAWN,
          version: WORLD_VERSION,
          revision,
          edits: Array.from(world.edits),
          players: Array.from(players.values(), publicPlayer),
          history,
          mode: "tour",
        });
        broadcast({ type: "joined", player: publicPlayer(p) }, ws);
        broadcast({
          type: "players",
          players: Array.from(players.values(), publicPlayer),
        });
        return;
      }
      if (!p) return;
      if (m.type === "move" && allowed("move", 30, 40)) {
        if (![m.x, m.y, m.z, m.yaw].every(Number.isFinite)) return;
        const now = Date.now(),
          dt = Math.min(2, (now - p.lastMove) / 1000),
          horizontal = Math.hypot(m.x - p.x, m.z - p.z),
          dy = Math.abs(m.y - p.y);
        let invalid =
          Math.abs(m.x) > LIMIT - 1 ||
          Math.abs(m.z) > LIMIT - 1 ||
          m.y < 1 ||
          m.y > 62 ||
          horizontal > 24 * dt + 1.2 ||
          dy > 24 * dt + 1.0;
        if (!invalid && !movementPathClear(world, p, m)) invalid = true;
        if (invalid) {
          send(ws, { type: "correction", x: p.x, y: p.y, z: p.z });
          return;
        }
        Object.assign(p, {
          x: m.x,
          y: m.y,
          z: m.z,
          yaw: m.yaw % (Math.PI * 2),
          lastMove: now,
        });
      }
      if (m.type === "respawn" && allowed("respawn", 0.5, 1)) {
        Object.assign(p, SPAWN, { lastMove: Date.now() });
        send(ws, { type: "correction", ...SPAWN });
      }
      if (m.type === "visit" && allowed("visit", 1, 3)) {
        const landmark = LANDMARKS.find((l) => l.id === m.id);
        if (landmark) {
          const room = m.roomId
            ? ROOMS.find(
                (r) => r.buildingId === landmark.id && r.id === m.roomId,
              )
            : null;
          const destination = room?.spawn || visitSpawn(landmark);
          Object.assign(p, destination, { lastMove: Date.now() });
          send(ws, { type: "correction", ...destination });
        }
      }
      if (m.type === "chat") {
        if (!allowed("chat", 1, 3))
          return reject(ws, "Hãy chờ một chút trước khi gửi tin tiếp.");
        const text = clean(m.text, 160);
        if (!text) return;
        const message = { type: "chat", name: p.name, text, time: Date.now() };
        history.push(message);
        if (history.length > 25) history.shift();
        broadcast(message);
      }
      if (m.type === "edit")
        reject(ws, "Đây là chế độ tham quan, không chỉnh sửa khối.");
    });
    ws.on("close", () => {
      clearTimeout(timeout);
      const p = players.get(ws);
      if (p) {
        players.delete(ws);
        if (ws.roomId && rooms.has(ws.roomId)) {
          const room = rooms.get(ws.roomId);
          room.players.delete(ws);
          if (room.players.size === 0 && room.id !== "main") {
            rooms.delete(ws.roomId);
          } else if (p.role === "host") {
            const next = room.players.values().next().value;
            if (next) {
              next.role = "host";
              room.hostName = next.name;
            }
          }
        }
        if (p.role === "host") {
          const next = players.values().next().value;
          if (next) next.role = "host";
        }
        broadcast({ type: "left", id: p.id, name: p.name });
      }
    });
  });

  const tick = setInterval(() => {
    if (players.size)
      broadcast({
        type: "players",
        players: Array.from(players.values(), publicPlayer),
      });
  }, 1000 / 15);

  const saves = setInterval(() => {
    storage
      .flush()
      .catch((error) => console.error("Lỗi lưu thế giới:", error.message));
  }, 2000);

  const heartbeat = setInterval(() => {
    for (const ws of wss.clients) {
      if (!ws.alive) ws.terminate();
      else {
        ws.alive = false;
        ws.ping();
      }
    }
  }, 25000);

  const close = async () => {
    if (closing) return;
    closing = true;
    clearInterval(tick);
    clearInterval(saves);
    clearInterval(heartbeat);
    if (server) {
      server.off("upgrade", upgradeHandler);
    }
    for (const ws of wss.clients) ws.terminate();
    await new Promise((resolve) => wss.close(resolve));
    await storage.flush();
  };

  return {
    world,
    storage,
    players,
    history,
    wss,
    handleHttp,
    close,
  };
}

