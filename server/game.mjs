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
import { WorldStorage, MemoryWorldStorage, loadSave } from "./storage.mjs";

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
  persistent = true,
} = {}) {
  const saved = persistent ? await loadSave(worldFile) : { edits: [] };
  const world = new VoxelWorld(
    saved.edits.filter(([k]) => {
      const [x, y, z] = k.split(",").map(Number);
      return !isProtected(x, y, z) && !spawnProtected(x, z);
    }),
  );
  const storage = persistent ? new WorldStorage(worldFile, world) : new MemoryWorldStorage(world);
  await storage.flush();

  const players = new Map();
  const rooms = new Map();
  const history = [];
  let revision = 0;
  let closing = false;

  const handleHttp = (req, res, next) => {
    const allowedOrigins = (process.env.GAME_ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean);
    if (req.headers.origin && allowedOrigins.includes(req.headers.origin)) {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
    }
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
      const sortedIds = Array.from(rooms.keys()).sort((a, b) => Number(a) - Number(b));
      for (const rId of sortedIds) {
        const room = rooms.get(rId);
        if (room && room.players.size > 0) {
          activeRooms.push({
            id: room.id,
            name: room.name || `Đoàn tham quan #${room.id}`,
            hostName: room.hostName || "Host",
            players: room.players.size,
            maxPlayers: room.maxPlayers || 50,
            createdAt: room.createdAt,
          });
        }
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

  const allocateRoomId = () => {
    let id = 1;
    while (rooms.has(id)) {
      id++;
    }
    return id;
  };

  const broadcastToRoom = (roomId, data, exceptWs) => {
    const room = rooms.get(roomId);
    if (!room) return;
    for (const [ws] of room.players) {
      if (ws !== exceptWs) send(ws, data);
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
        const name = clean(m.name, 20);
        if (!name) return reject(ws, "Hãy nhập tên từ 1 đến 20 ký tự.");
        clearTimeout(timeout);

        let role;
        let assignedRoom = null;
        if (m.action === "create" || m.role === "host") {
          // Người chọn Tạo phòng: là Host dẫn đoàn cầm cờ
          role = "host";
          const roomId = allocateRoomId();
          assignedRoom = {
            id: roomId,
            name: `Đoàn tham quan #${roomId} của ${name}`,
            hostWs: ws,
            hostId: null,
            hostName: name,
            createdAt: Date.now(),
            players: new Map(),
            history: [],
            maxPlayers: 50,
          };
          rooms.set(roomId, assignedRoom);
        } else {
          // Người chọn Vào phòng: BẮT BUỘC luôn là Sinh viên FPT
          role = "student";
          const targetId = Number(m.roomId);
          if (!targetId || !rooms.has(targetId)) {
            return reject(ws, "Phòng này không tồn tại hoặc Trưởng đoàn (Host) đã giải tán phòng.");
          }
          assignedRoom = rooms.get(targetId);
          if (assignedRoom.players.size >= (assignedRoom.maxPlayers || 50)) {
            return reject(ws, "Phòng đã đủ tối đa 50 người. Vui lòng chọn phòng khác.");
          }
        }

        p = {
          id: randomUUID().slice(0, 8),
          name,
          role,
          color: ["#d7ac68", "#689b9a", "#ae7f83", "#829d63"][assignedRoom.players.size % 4],
          ...SPAWN,
          lastMove: Date.now(),
        };

        if (role === "host") {
          assignedRoom.hostId = p.id;
        }

        players.set(ws, p);
        assignedRoom.players.set(ws, p);
        ws.roomId = assignedRoom.id;

        send(ws, {
          type: "welcome",
          id: p.id,
          roomId: assignedRoom.id,
          role: p.role,
          spawn: SPAWN,
          version: WORLD_VERSION,
          revision,
          edits: Array.from(world.edits),
          players: Array.from(assignedRoom.players.values(), publicPlayer),
          history: assignedRoom.history,
          mode: "tour",
        });
        broadcastToRoom(assignedRoom.id, { type: "joined", player: publicPlayer(p) }, ws);
        broadcastToRoom(assignedRoom.id, {
          type: "players",
          players: Array.from(assignedRoom.players.values(), publicPlayer),
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
        if (ws.roomId && rooms.has(ws.roomId)) {
          const room = rooms.get(ws.roomId);
          room.history.push(message);
          broadcastToRoom(room.id, message);
        }
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

          if (ws === room.hostWs || p.role === "host") {
            // Host rời phòng -> giải tán toàn bộ phòng và thu hồi ID
            console.log(`[Phòng #${room.id}] Host ${p.name} đã rời phòng. Đang giải tán phòng #${room.id}...`);
            for (const [memberWs] of room.players) {
              send(memberWs, {
                type: "disbanded",
                message: `Trưởng đoàn (Host: ${p.name}) đã rời phòng. Đoàn tham quan #${room.id} đã giải tán.`,
              });
              players.delete(memberWs);
              memberWs.roomId = null;
              memberWs.close(1000, "Host left");
            }
            room.players.clear();
            room.history.length = 0;
            rooms.delete(room.id); // Thu hồi ID phòng để tái sử dụng
          } else {
            // Sinh viên rời phòng
            broadcastToRoom(room.id, { type: "left", id: p.id, name: p.name });
            broadcastToRoom(room.id, {
              type: "players",
              players: Array.from(room.players.values(), publicPlayer),
            });
          }
        }
      }
    });
  });

  const tick = setInterval(() => {
    for (const room of rooms.values()) {
      if (room.players.size) {
        broadcastToRoom(room.id, {
          type: "players",
          players: Array.from(room.players.values(), publicPlayer),
        });
      }
    }
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
  tick.unref();
  saves.unref();
  heartbeat.unref();

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

