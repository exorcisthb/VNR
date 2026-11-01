import { readFile, mkdir, rename, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import { WORLD_VERSION, inBounds } from "../shared/world.mjs";
import { PALETTE } from "../shared/blocks.mjs";
export function validateSave(save) {
  if (
    ![1, WORLD_VERSION].includes(save?.version) ||
    !Array.isArray(save.edits) ||
    save.edits.length > 150000
  )
    throw new Error("File thế giới sai phiên bản hoặc cấu trúc.");
  const seen = new Set();
  for (const entry of save.edits) {
    if (
      !Array.isArray(entry) ||
      entry.length !== 2 ||
      typeof entry[0] !== "string"
    )
      throw new Error("Khối lưu không hợp lệ.");
    const [key, id] = entry,
      coords = key.split(",").map(Number);
    if (
      coords.length !== 3 ||
      !inBounds(...coords) ||
      coords[1] < 1 ||
      ![0, ...PALETTE].includes(id) ||
      seen.has(key)
    )
      throw new Error("Dữ liệu khối lưu không hợp lệ.");
    seen.add(key);
  }
  return save;
}
export async function loadSave(file) {
  try {
    return validateSave(JSON.parse(await readFile(file, "utf8")));
  } catch (error) {
    if (error.code === "ENOENT") return { version: WORLD_VERSION, edits: [] };
    throw new Error(
      `Không đọc được ${file}. Giữ nguyên file; khôi phục từ .bak nếu cần. ${error.message}`,
      { cause: error },
    );
  }
}
export class WorldStorage {
  constructor(file, world) {
    this.file = file;
    this.world = world;
    this.dirty = true;
    this.queue = Promise.resolve();
    this.lastSaved = null;
    this.lastError = null;
  }
  snapshot() {
    return {
      game: "Dấu Việt — Miền Khối",
      version: WORLD_VERSION,
      generator: "dau-viet-tour-2",
      savedAt: new Date().toISOString(),
      edits: Array.from(this.world.edits),
    };
  }
  async flush() {
    this.queue = this.queue
      .catch(() => {})
      .then(async () => {
        if (!this.dirty) return;
        this.dirty = false;
        const snapshot = this.snapshot();
        try {
          await mkdir(path.dirname(this.file), { recursive: true });
          await writeFile(this.file + ".tmp", JSON.stringify(snapshot));
          try {
            await copyFile(this.file, this.file + ".bak");
          } catch (e) {
            if (e.code !== "ENOENT") throw e;
          }
          await rename(this.file + ".tmp", this.file);
          this.lastSaved = snapshot.savedAt;
          this.lastError = null;
        } catch (error) {
          this.dirty = true;
          this.lastError = error.message;
          throw error;
        }
      });
    return this.queue;
  }
}

// Tour deployments cannot edit voxels. Serverless instances therefore need
// no filesystem writes (the deployed application directory is read-only).
export class MemoryWorldStorage extends WorldStorage {
  constructor(world) { super(null, world); }
  async flush() {
    if (this.dirty) this.lastSaved = new Date().toISOString();
    this.dirty = false;
    this.lastError = null;
  }
}
