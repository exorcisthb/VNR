import { configuredServerEndpoints } from './server-endpoints.js';

export class Network {
  constructor(onMessage, onStatus) {
    this.onMessage = onMessage;
    this.onStatus = onStatus;
    this.ready = false;
    this.socket = null;
    this.retry = null;
    this.sessionToken = null;
    this.stopped = true;
    this.generation = 0;
  }
  connect(name, action = "join", roomId = null, sessionToken = null) {
    this.stopped = false;
    clearTimeout(this.retry);
    const generation = ++this.generation;
    return new Promise((resolve, reject) => {
      const wsUrl = configuredServerEndpoints().websocket;
      const ws = new WebSocket(wsUrl);
      this.socket = ws;
      let settled = false,
        welcomed = false;
      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          const err = new Error("Máy chủ chưa phản hồi. Hãy thử lại.");
          err.serverUnreachable = true;
          reject(err);
          ws.close();
        }
      }, 12000);
      ws.addEventListener("open", () => {
        if (this.stopped || generation !== this.generation) {
          ws.close();
          return;
        }
        ws.send(JSON.stringify(sessionToken
          ? { type: "resume", sessionToken }
          : { type: "join", name, action, roomId }));
      });
      ws.addEventListener("message", (event) => {
        if (generation !== this.generation) return;
        let m;
        try {
          m = JSON.parse(event.data);
        } catch {
          return;
        }
        if (m.type === "welcome") {
          clearTimeout(timer);
          welcomed = settled = true;
          this.sessionToken = m.sessionToken;
          this.ready = true;
          this.onMessage(m);
          this.onStatus(true);
          resolve(m);
        } else if (m.type === "error" && !welcomed) {
          clearTimeout(timer);
          settled = true;
          const err = new Error(m.message);
          err.serverReported = true;
          err.code = m.code;
          reject(err);
          ws.close();
        } else this.onMessage(m);
      });
      ws.addEventListener("close", () => {
        clearTimeout(timer);
        if (!settled) {
          settled = true;
          const err = new Error("Chưa kết nối được máy chủ.");
          err.serverUnreachable = true;
          err.cancelled = generation !== this.generation;
          reject(err);
        }
        if (generation !== this.generation) return;
        this.ready = false;
        this.onStatus(false);
        if (welcomed && !this.stopped) this.reconnect();
      });
      ws.addEventListener("error", () => {});
    });
  }
  reconnect() {
    clearTimeout(this.retry);
    if (this.stopped || !this.sessionToken) return;
    this.retry = setTimeout(() => {
      this.connect("", "resume", null, this.sessionToken).catch(error => {
        if (this.stopped || error.cancelled) return;
        if (error.code === "sessionExpired") {
          this.onMessage({ type: "disbanded", message: error.message });
        } else {
          this.reconnect();
        }
      });
    }, 2500);
  }
  send(m) {
    if (this.ready && this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(m));
      return true;
    }
    return false;
  }
  disconnect({ leave = false } = {}) {
    if (leave) this.send({ type: "leave" });
    this.stopped = true;
    this.sessionToken = null;
    clearTimeout(this.retry);
    this.generation++;
    this.ready = false;
    this.socket?.close(1000, "Left tour");
    this.socket = null;
  }
}
