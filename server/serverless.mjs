import http from 'node:http';
import { attachGameCore } from './game.mjs';

const routes = { health: '/health', rooms: '/api/rooms', world: '/api/world', ws: '/ws' };

function resolveRoute(req) {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/game') {
    req.url = routes[url.searchParams.get('route')] || '/not-found';
  }
}

// Export an HTTP server, rather than a request-only function, so Vercel can
// forward WebSocket upgrades to the same game core as the HTTP endpoints.
export async function createFunctionServer() {
  let game;
  const server = http.createServer((req, res) => {
    resolveRoute(req);
    game.handleHttp(req, res, () => {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unknown game endpoint' }));
    });
  });
  server.on('upgrade', resolveRoute);
  game = await attachGameCore({ server, persistent: false });
  return {
    server,
    async close() {
      await game.close();
      if (server.listening) await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    },
  };
}
