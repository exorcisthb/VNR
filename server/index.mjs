import http from "node:http";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { attachGameCore, root } from "./game.mjs";

export async function createGameServer({
  port = 0,
  host = "127.0.0.1",
  dev = false,
  worldFile = process.env.WORLD_FILE || path.join(root, "data", "world.json"),
} = {}) {
  const vite = dev
    ? await (
        await import("vite")
      ).createServer({ root, server: { middlewareMode: true }, appType: "spa" })
    : null;

  let gameCore;

  const server = http.createServer(async (req, res) => {
    gameCore.handleHttp(req, res, async () => {
      if (vite) return vite.middlewares(req, res);

      try {
        const pathname = new URL(req.url, "http://localhost").pathname;
        const decoded = decodeURIComponent(pathname);
        let file = path.resolve(
          root,
          "dist",
          "." + decoded + (decoded.endsWith("/") ? "index.html" : ""),
        );
        if (!file.startsWith(path.join(root, "dist") + path.sep))
          throw new Error("path");
        let data, encoding;
        if (file.endsWith('.glb') && /\bbr\b/.test(req.headers['accept-encoding'] || '')) {
          try { data = await readFile(file + '.br'); encoding = 'br'; } catch {}
        }
        if (!data) {
          try {
            data = await readFile(file);
          } catch (e) {
            // SPA fallback: nếu route không phải file tĩnh cụ thể, trả về dist/index.html
            if (!path.extname(file)) {
              file = path.resolve(root, "dist", "index.html");
              data = await readFile(file);
            } else {
              throw e;
            }
          }
        }
        const mime =
          {
            ".html": "text/html; charset=utf-8",
            ".js": "text/javascript; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".svg": "image/svg+xml",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".webp": "image/webp",
            ".glb": "model/gltf-binary",
            ".gltf": "model/gltf+json",
            ".json": "application/json; charset=utf-8",
            ".woff2": "font/woff2",
            ".woff": "font/woff",
            ".ttf": "font/ttf",
          }[path.extname(file).toLowerCase()] || "application/octet-stream";
        res.writeHead(200, {
          ...(encoding ? { 'Content-Encoding': encoding } : {}),
          Vary: 'Accept-Encoding',
          "Content-Type": mime,
          "Cache-Control": file.includes(path.sep + "assets" + path.sep)
            ? "public, max-age=31536000, immutable"
            : "no-cache",
        });
        if (req.method === "HEAD") res.end();
        else res.end(data);
      } catch {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Không tìm thấy trang. Hãy mở trang chủ.");
      }
    });
  });

  gameCore = await attachGameCore({
    server,
    worldFile,
    dev,
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, resolve);
  });

  return {
    server,
    world: gameCore.world,
    storage: gameCore.storage,
    port: server.address().port,
    async close() {
      await gameCore.close();
      await vite?.close();
      await new Promise((resolve) => server.close(resolve));
    },
  };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const game = await createGameServer({
      port: Number(process.env.PORT) || 3000,
      host: "0.0.0.0",
      dev: process.argv.includes("--dev"),
    });
    console.log(`Dấu Việt: http://localhost:${game.port}`);
    console.log(`Thế giới: ${game.storage.file}`);
    let stopping = false;
    for (const signal of ["SIGINT", "SIGTERM"])
      process.on(signal, async () => {
        if (stopping) return;
        stopping = true;
        await game.close();
        process.exit(0);
      });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
