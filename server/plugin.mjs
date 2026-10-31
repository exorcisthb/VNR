import { attachGameCore } from "./game.mjs";

export function gameServerPlugin(options = {}) {
  let game = null;

  async function setup(server, dev) {
    if (!server.httpServer) return;
    game = await attachGameCore({
      server: server.httpServer,
      middlewares: server.middlewares,
      worldFile: options.worldFile,
      dev,
    });
    server.httpServer.on("close", async () => {
      if (game) {
        await game.close();
        game = null;
      }
    });
  }

  return {
    name: "dau-viet-game-server",
    configureServer(server) {
      return setup(server, true);
    },
    configurePreviewServer(server) {
      return setup(server, false);
    },
  };
}

