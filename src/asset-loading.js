// Bound simultaneous heavy GLB downloads/decodes and retry transient asset failures.
const pending = [];
let active = 0;
function drain() {
  while (active < 2 && pending.length) {
    const { task, resolve, reject } = pending.shift();
    active++;
    Promise.resolve().then(task).then(resolve, reject).finally(() => { active--; drain(); });
  }
}
export function scheduleModelLoad(task) {
  return new Promise((resolve, reject) => { pending.push({ task, resolve, reject }); drain(); });
}
export async function retryAsset(task, { attempts = 4, baseDelay = 700 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try { return await task(); }
    catch (error) {
      if (attempt + 1 >= attempts) throw error;
      await new Promise(resolve => setTimeout(resolve, baseDelay * 2 ** attempt));
    }
  }
}
