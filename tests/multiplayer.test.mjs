import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { WebSocket } from "ws";
import { createGameServer } from "../server/index.mjs";
import { SPAWN, WORLD_VERSION } from "../shared/world.mjs";
function client(port, name, action) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`),
      messages = [],
      waiters = [];
    ws.on("error", reject);
    ws.on("open", () =>
      ws.send(JSON.stringify(action ? { type: "join", name, action } : { type: "join", name })),
    );
    ws.on("message", (raw) => {
      const m = JSON.parse(raw);
      messages.push(m);
      for (const w of [...waiters])
        if (w.predicate(m)) {
          clearTimeout(w.timeout);
          waiters.splice(waiters.indexOf(w), 1);
          w.resolve(m);
        }
      if (m.type === "welcome")
        resolve({
          ws,
          messages,
          welcome: m,
          send: (m) => ws.send(JSON.stringify(m)),
          wait: (predicate) =>
            new Promise((resolve, reject) => {
              const w = {
                predicate,
                resolve,
                timeout: setTimeout(
                  () =>
                    reject(new Error("Timed out waiting for network event")),
                  3000,
                ),
              };
              waiters.push(w);
            }),
        });
    });
  });
}

test("tour peers sync roles, walking, chat, room visits and host handover while edits stay disabled", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "dau-viet-tour-")),
    file = path.join(dir, "world.json");
  let game, a, b, c;
  try {
    await writeFile(
      file,
      JSON.stringify({ version: 1, edits: [["-115,3,40", 7]] }),
    );
    game = await createGameServer({ worldFile: file });
    assert.equal(game.world.get(-115, 3, 40), 7);
    assert.equal(JSON.parse(await readFile(file + ".bak", "utf8")).version, 1);
    a = await client(game.port, "An");
    const joined = a.wait((m) => m.type === "joined");
    b = await client(game.port, "Bình");
    await joined;
    assert.equal(a.welcome.mode, "tour");
    assert.equal(a.welcome.players[0].role, "host");
    assert.equal(
      b.welcome.players.find((p) => p.id === b.welcome.id).role,
      "student",
    );
    const move = b.wait(
      (m) =>
        m.type === "players" &&
        m.players.some((p) => p.id === a.welcome.id && p.x === SPAWN.x + 0.2),
    );
    a.send({ type: "move", x: SPAWN.x + 0.2, y: 3, z: SPAWN.z, yaw: 0.2 });
    await move;
    const chat = b.wait((m) => m.type === "chat");
    a.send({ type: "chat", text: "Đoàn FPT <script>" });
    assert.equal((await chat).text, "Đoàn FPT script");
    const denied = a.wait((m) => m.type === "error");
    a.send({ type: "edit", x: -61, y: 3, z: 12, id: 7 });
    assert.match((await denied).message, /tham quan/);
    assert.equal(game.world.edits.size, 1);
    c = await client(game.port, "Chi");
    assert.equal(c.welcome.players.length, 3);
    assert.ok(c.welcome.edits.some(([k]) => k === "-115,3,40"));
    const visit = c.wait((m) => m.type === "correction");
    c.send({ type: "visit", id: "palace", roomId: "credentials" });
    assert.equal((await visit).y, 10.025);
    const correction = a.wait((m) => m.type === "correction");
    a.send({ type: "move", x: 80, y: 3, z: 80, yaw: 0 });
    assert.equal((await correction).x, SPAWN.x + 0.2);
    const promoted = b.wait(
      (m) =>
        m.type === "players" &&
        m.players.find((p) => p.id === b.welcome.id)?.role === "host",
    );
    const left = b.wait((m) => m.type === "left");
    a.ws.close();
    await left;
    assert.equal(
      (await promoted).players.filter((p) => p.role === "host").length,
      1,
    );
    const health = await (
      await fetch("http://127.0.0.1:" + game.port + "/health")
    ).json();
    assert.equal(health.mode, "tour");
    assert.equal(health.hostName, "Bình");
    const model = await fetch(`http://127.0.0.1:${game.port}/models/thamr.glb`, { headers: { 'Accept-Encoding': 'br' } });
    assert.equal(model.headers.get('content-encoding'), 'br');
    assert.equal(Buffer.from(await model.arrayBuffer()).subarray(0, 4).toString(), 'glTF');
    assert.equal(
      (await fetch("http://127.0.0.1:" + game.port + "/server/index.mjs"))
        .status,
      404,
    );
    assert.equal(
      (await fetch("http://127.0.0.1:" + game.port + "/%2e%2e%5cpackage.json"))
        .status,
      404,
    );
    b.ws.close();
    c.ws.close();
    await game.close();
    game = await createGameServer({ worldFile: file });
    assert.equal(game.world.get(-115, 3, 40), 7);
    assert.equal(
      JSON.parse(await readFile(file, "utf8")).version,
      WORLD_VERSION,
    );
  } finally {
    a?.ws.terminate();
    b?.ws.terminate();
    c?.ws.terminate();
    await game?.close();
    await rm(dir, { recursive: true, force: true });
  }
});
test("room creation assigns host role and room joining assigns student role with max 50 players", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "dau-viet-room-")),
    file = path.join(dir, "world.json");
  let game, hostClient, studentClient;
  try {
    game = await createGameServer({ worldFile: file });
    // Người chọn tạo phòng -> vai trò Host cầm cờ
    hostClient = await client(game.port, "TruongDoan", "create");
    assert.equal(hostClient.welcome.players[0].role, "host");

    // Người chọn vào phòng -> vai trò Sinh viên FPT
    studentClient = await client(game.port, "SinhVienFPT", "join");
    const selfStudent = studentClient.welcome.players.find(
      (p) => p.id === studentClient.welcome.id,
    );
    assert.equal(selfStudent.role, "student");

    // Sức chứa phòng tối đa 50 người
    const health = await (
      await fetch("http://127.0.0.1:" + game.port + "/health")
    ).json();
    assert.equal(health.maxPlayers, 50);
    assert.equal(health.players, 2);
    assert.equal(health.hostName, "TruongDoan");
  } finally {
    hostClient?.ws.terminate();
    studentClient?.ws.terminate();
    await game?.close();
    await rm(dir, { recursive: true, force: true });
  }
});
test("corrupt save fails visibly without overwriting the original", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "dau-viet-corrupt-")),
    file = path.join(dir, "world.json");
  try {
    await writeFile(file, "{broken");
    await assert.rejects(
      () => createGameServer({ worldFile: file }),
      /Không đọc được/,
    );
    assert.equal(await readFile(file, "utf8"), "{broken");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
