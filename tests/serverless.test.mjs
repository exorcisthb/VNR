import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { WebSocket } from 'ws';
import { createFunctionServer } from '../server/serverless.mjs';
import config from '../vercel.json' with { type: 'json' };

function waitFor(ws, predicate) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { cleanup(); reject(new Error('WebSocket response timed out')); }, 4000);
    function cleanup() { clearTimeout(timeout); ws.off('message', onMessage); }
    function onMessage(raw) { const message = JSON.parse(raw); if (predicate(message)) { cleanup(); resolve(message); } }
    ws.on('message', onMessage);
  });
}

test('Vercel rewrite targets serve health, rooms and WebSocket room membership together', { timeout: 15000 }, async () => {
  const app = await createFunctionServer();
  const clients = [];
  try {
    await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
    const origin = `http://127.0.0.1:${app.server.address().port}`;
    const target = path => config.rewrites.find(route => route.source === path).destination;
    assert.equal((await fetch(origin + target('/health'))).status, 200);
    assert.deepEqual(await (await fetch(origin + target('/api/rooms'))).json(), []);
    const host = new WebSocket(origin.replace('http:', 'ws:') + target('/ws')); clients.push(host);
    await once(host, 'open');
    const welcome = waitFor(host, m => m.type === 'welcome');
    host.send(JSON.stringify({ type: 'join', action: 'create', name: 'Host' }));
    const room = await welcome;
    const rooms = await (await fetch(origin + target('/api/rooms'))).json();
    assert.equal(rooms[0].id, room.roomId);
    assert.equal(rooms[0].players, 1);
    const student = new WebSocket(origin.replace('http:', 'ws:') + target('/ws')); clients.push(student);
    await once(student, 'open');
    const joined = waitFor(student, m => m.type === 'welcome');
    student.send(JSON.stringify({ type: 'join', action: 'join', name: 'Student', roomId: room.roomId }));
    const participant = await joined;
    assert.equal(participant.role, 'student');
    assert.equal(participant.players.length, 2);
    assert.equal((await (await fetch(origin + target('/health'))).json()).players, 2);
    const world = await (await fetch(origin + target('/api/world'))).json();
    assert.deepEqual(world.edits, []);
    assert.equal((await fetch(origin + '/api/game?route=invalid')).status, 404);
  } finally {
    for (const client of clients) client.terminate();
    await app.close();
  }
});
