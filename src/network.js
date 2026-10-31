export class Network {
  constructor(onMessage, onStatus) {
    this.onMessage = onMessage;
    this.onStatus = onStatus;
    this.ready = false;
    this.socket = null;
    this.retry = null;
    this.name = "";
    this.stopped = true;
    this.generation = 0;
  }
  connect(name, action = "join", roomId = null) {
    this.name = name;
    this.action = action;
    this.roomId = roomId;
    this.stopped = false;
    clearTimeout(this.retry);
    const generation = ++this.generation;
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(
        (location.protocol === "https:" ? "wss:" : "ws:") +
          "//" +
          location.host +
          "/ws",
      );
      this.socket = ws;
      let settled = false,
        welcomed = false;
      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          reject(new Error("Máy chủ chưa phản hồi. Hãy thử lại."));
          ws.close();
        }
      }, 12000);
      ws.addEventListener("open", () => {
        if (this.stopped || generation !== this.generation) {
          ws.close();
          return;
        }
        ws.send(JSON.stringify(roomId ? { type: "join", name, action, roomId } : { type: "join", name, action }));
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
          this.ready = true;
          this.onMessage(m);
          this.onStatus(true);
          resolve(m);
        } else if (m.type === "error" && !welcomed) {
          clearTimeout(timer);
          settled = true;
          reject(new Error(m.message));
          ws.close();
        } else this.onMessage(m);
      });
      ws.addEventListener("close", () => {
        clearTimeout(timer);
        if (!settled) {
          settled = true;
          reject(new Error("Chưa kết nối được hoặc đoàn đã đủ người."));
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
    if (this.stopped) return;
    this.retry = setTimeout(
      () => this.connect(this.name, this.action, this.roomId).catch(() => this.reconnect()),
      2500,
    );
  }
  send(m) {
    if (this.ready && this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(m));
      return true;
    }
    return false;
  }
  disconnect() {
    this.stopped = true;
    clearTimeout(this.retry);
    this.generation++;
    this.ready = false;
    this.socket?.close(1000, "Left tour");
    this.socket = null;
  }
}
