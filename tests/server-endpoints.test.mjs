import test from 'node:test';
import assert from 'node:assert/strict';
import { serverEndpoints } from '../src/server-endpoints.js';

test('local and same-domain deployments retain their HTTP and WebSocket server', () => {
  assert.deepEqual(serverEndpoints('http://localhost:3000/'), {
    health:'http://localhost:3000/health', rooms:'http://localhost:3000/api/rooms', websocket:'ws://localhost:3000/ws',
  });
  assert.equal(serverEndpoints('https://game.vercel.app/').websocket,'wss://game.vercel.app/ws');
});

test('external long-running backend receives both lobby HTTP and game WebSockets', () => {
  assert.deepEqual(serverEndpoints('https://game.vercel.app/', 'https://game-backend.example/'), {
    health:'https://game-backend.example/health', rooms:'https://game-backend.example/api/rooms', websocket:'wss://game-backend.example/ws',
  });
  assert.throws(()=>serverEndpoints('https://game.vercel.app/','file:///server'),/HTTP/);
});
