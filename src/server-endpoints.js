import backendConfig from '../deployment/backend.json';

// One backend origin must serve both room HTTP requests and WebSockets.
// This also allows the Vercel frontend to use a long-running Node.js server.
export function serverEndpoints(pageUrl, backendUrl = '', websocketUrl = '') {
  const page = new URL(pageUrl);
  const backend = backendUrl ? new URL(backendUrl) : new URL(page.origin);
  if (!['http:', 'https:'].includes(backend.protocol)) throw new Error('Backend must use HTTP or HTTPS');
  const ws = new URL('/ws', backend.origin);
  ws.protocol = backend.protocol === 'https:' ? 'wss:' : 'ws:';
  return {
    health: new URL('/health', backend.origin).href,
    rooms: new URL('/api/rooms', backend.origin).href,
    websocket: websocketUrl || ws.href,
  };
}

export function configuredServerEndpoints() {
  return serverEndpoints(location.href, import.meta.env?.VITE_GAME_SERVER_URL || backendConfig.origin, import.meta.env?.VITE_WS_URL || '');
}
