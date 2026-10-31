import * as THREE from "three";
import "./style.css";
import { VoxelWorld, SPAWN } from "../shared/world.mjs";
import { stepPlayer, cameraDistance } from "../shared/physics.mjs";
import { LANDMARKS } from "../shared/landmarks.mjs";
import {
  BUILDINGS,
  ROOMS,
  findRoom,
  isInsideBuilding,
} from "../shared/architecture.mjs";
import { ChunkRenderer } from "./mesher.js";
import { Network } from "./network.js";
import { Avatars } from "./avatars.js";
import { ArchitectureRenderer } from "./architecture.js";
import { addScenery } from "./scenery.js";
const $ = (id) => document.getElementById(id),
  canvas = $("game");
const scene = new THREE.Scene();
scene.background = new THREE.Color("#c4d1cb");
scene.fog = new THREE.Fog("#c4d1cb", 58, 112);
let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    powerPreference: "high-performance",
  });
} catch {
  $("join-error").textContent =
    "Trình duyệt cần WebGL 2. Hãy thử Chrome, Edge hoặc Safari mới.";
  $("join-button").disabled = true;
  throw new Error("WebGL 2 required");
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const camera = new THREE.PerspectiveCamera(
  66,
  innerWidth / innerHeight,
  0.08,
  260,
);
camera.rotation.order = "YXZ";
scene.add(new THREE.HemisphereLight("#fff1d8", "#78926c", 1.6));
const sun = new THREE.DirectionalLight("#fff0ce", 2.5);
sun.position.set(-95, 85, 10);
sun.target.position.set(-66, 3, -48);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = sun.shadow.camera.bottom = -47;
sun.shadow.camera.right = sun.shadow.camera.top = 47;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 170;
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.04;
scene.add(sun, sun.target);
let world = new VoxelWorld(),
  chunks = new ChunkRenderer(scene, world),
  p = { ...SPAWN, vy: 0, pitch: -0.16, grounded: false },
  playing = false,
  paused = false,
  wantsLook = false,
  starting = false,
  cameraSnap = true,
  visualY = SPAWN.y,
  selfId = null,
  peerList = [],
  currentRoom = null,
  currentLandmark = LANDMARKS[0],
  lastTime = performance.now(),
  accumulator = 0,
  lastSend = 0,
  lastInfo = 0,
  lastSun = 0,
  lastFootstep = 0,
  visibleDistance = 112;
const coarse = matchMedia("(pointer:coarse)").matches || innerWidth <= 700,
  keys = new Set(),
  touch = { x: 0, z: 0, jump: false };
let lastMouse = null,
  lookPointer = null,
  joyPointer = null,
  toastTimer,
  audio;
const avatars = new Avatars(scene),
  architecture = new ArchitectureRenderer(scene),
  scenery = addScenery(scene),
  pivot = new THREE.Vector3(),
  backward = new THREE.Vector3(),
  desired = new THREE.Vector3(),
  offset = new THREE.Vector3();
const network = new Network(onMessage, (ready) => {
  $("connection").textContent = ready
    ? "Đoàn đang tham quan"
    : "Mất kết nối · đang thử lại";
  if (!ready && playing) {
    clearInput();
    avatars.clear();
    toast("Đang kết nối lại với đoàn…");
  }
});
function onMessage(m) {
  if (m.type === "welcome") {
    selfId = m.id;
    world = new VoxelWorld(m.edits);
    for (const g of chunks.meshes.values()) {
      scene.remove(g);
      g.children.forEach((mesh) => mesh.geometry.dispose());
    }
    chunks.meshes.clear();
    chunks.queue.clear();
    chunks.cx = undefined;
    chunks.world = world;
    p = { ...m.spawn, vy: 0, pitch: -0.16, grounded: false };
    cameraSnap = true;
    peerList = m.players;
    avatars.sync(peerList, selfId);
    $("messages").replaceChildren();
    m.history.forEach((c) => addMessage(c.name, c.text));
    updateRole();
  } else if (m.type === "players") {
    peerList = m.players;
    avatars.sync(peerList, selfId);
    $("online").textContent = peerList.length + "/50 người";
    updateRole();
  } else if (m.type === "joined") {
    peerList.push(m.player);
    avatars.sync(peerList, selfId);
    addMessage("Dấu Việt", m.player.name + " vừa tham gia đoàn.");
  } else if (m.type === "left") {
    peerList = peerList.filter((p) => p.id !== m.id);
    avatars.remove(m.id);
    addMessage("Dấu Việt", m.name + " đã rời đoàn.");
  } else if (m.type === "chat") addMessage(m.name, m.text);
  else if (m.type === "error") toast(m.message);
  else if (m.type === "correction") {
    if (Math.hypot(p.x - m.x, p.z - m.z) > 2) cameraSnap = true;
    Object.assign(p, { x: m.x, y: m.y, z: m.z, vy: 0 });
    if (m.yaw !== undefined) {
      p.yaw = m.yaw;
      p.pitch = -0.16;
      cameraSnap = true;
    }
  }
}
function updateRole() {
  const self = peerList.find((p) => p.id === selfId);
  $("role-badge").textContent =
    self?.role === "host"
      ? "HOST · Người dẫn đoàn cầm cờ"
      : "SINH VIÊN FPT · Thành viên đoàn";
}
function toast(message) {
  $("toast").textContent = message;
  $("toast").hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ($("toast").hidden = true), 3600);
}
function clearInput() {
  keys.clear();
  touch.x = touch.z = 0;
  touch.jump = false;
  lookPointer = null;
  joyPointer = null;
  lastMouse = null;
  $("stick").style.transform = "";
}

let lobbyData = { players: 0, maxPlayers: 50, hostName: null };

function refreshLobby() {
  fetch("/health")
    .then((r) => r.json())
    .then((data) => {
      lobbyData = data;
      if (playing) return;
      $("connection").textContent = "Không gian đang mở";
      $("online").textContent = `${data.players}/50 người`;
      if ($("room-capacity-badge")) {
        $("room-capacity-badge").textContent = `Sĩ số: ${data.players}/50 người`;
      }
      if (data.players >= 50) {
        if ($("btn-create")) $("btn-create").disabled = true;
        if ($("btn-join")) $("btn-join").disabled = true;
        $("join-error").textContent = "Phòng đã đạt tối đa 50 người. Vui lòng quay lại sau.";
      } else {
        if ($("btn-create")) $("btn-create").disabled = false;
        if ($("btn-join")) $("btn-join").disabled = false;
        if ($("join-error").textContent.includes("tối đa 50 người")) {
          $("join-error").textContent = "";
        }
      }
    })
    .catch(() => ($("connection").textContent = "Chưa kết nối được máy chủ"));
}
refreshLobby();
setInterval(refreshLobby, 5000);

try {
  $("player-name").value = localStorage.getItem("dau-viet-name") || "";
} catch {}

function capture() {
  if (coarse || !wantsLook) return;
  canvas.focus();
  try {
    const promise = canvas.requestPointerLock?.();
    promise?.catch(() => {
      if (playing && !paused) $("mouse-hint").hidden = false;
    });
  } catch {
    $("mouse-hint").hidden = false;
  }
}

async function enterGame(name, action = "create", roomId = null) {
  if (starting) return;
  starting = true;
  wantsLook = true;
  capture();
  if ($("btn-create")) $("btn-create").disabled = true;
  if ($("btn-join")) $("btn-join").disabled = true;
  $("join-error").textContent =
    action === "create" ? "Đang tạo phòng dẫn đoàn…" : "Đang vào phòng tham quan…";
  try {
    await network.connect(name, action, roomId);
    playing = true;
    paused = false;
    document.body.classList.add("playing");
    $("welcome").hidden = true;
    $("rooms-modal").hidden = true;
    $("hud").hidden = false;
    $("quality").dispatchEvent(new Event("change"));
    canvas.focus();
    lastMouse = null;
    try {
      localStorage.setItem("dau-viet-name", name);
    } catch {}
    if (!coarse && document.pointerLockElement !== canvas)
      $("mouse-hint").hidden = false;
    toast(
      action === "create"
        ? "Bạn là HOST cầm cờ dẫn đoàn · Góc nhìn thứ ba."
        : "Bạn là SINH VIÊN FPT · Góc nhìn thứ ba.",
    );
  } catch (error) {
    wantsLook = false;
    document.exitPointerLock?.();
    $("join-error").textContent = error.message;
  } finally {
    starting = false;
    if ($("btn-create")) $("btn-create").disabled = false;
    if ($("btn-join")) $("btn-join").disabled = false;
  }
}

// 1. Nút Tạo phòng: tạo phòng mới và làm Host cầm cờ
$("btn-create")?.addEventListener("click", async () => {
  const name = $("player-name").value.trim();
  if (!name) {
    $("player-name").focus();
    $("join-error").textContent = "Vui lòng nhập tên của bạn trước khi tạo phòng.";
    return;
  }
  await enterGame(name, "create");
});

// 2. Nút Vào phòng: mở danh sách phòng để xem phòng vừa được người khác tạo
$("btn-join")?.addEventListener("click", async () => {
  const name = $("player-name").value.trim();
  if (!name) {
    $("player-name").focus();
    $("join-error").textContent = "Vui lòng nhập tên của bạn trước khi vào phòng.";
    return;
  }
  $("join-error").textContent = "";
  $("rooms-modal").hidden = false;
  await fetchAndRenderRooms();
});

async function fetchAndRenderRooms() {
  const list = $("rooms-list");
  if (!list) return;
  list.innerHTML = `<div class="rooms-empty-msg">Đang tải danh sách phòng...</div>`;
  try {
    const res = await fetch("/api/rooms");
    const rooms = await res.json();
    if (!rooms || rooms.length === 0) {
      list.innerHTML = `
        <div class="rooms-empty-msg">
          <p>Hiện chưa có phòng nào được mở.</p>
          <p>Bạn có thể bấm <strong>"Tạo phòng"</strong> để mở đoàn mới và làm Host cầm cờ dẫn đoàn!</p>
        </div>
      `;
      return;
    }
    list.innerHTML = "";
    for (const r of rooms) {
      const item = document.createElement("div");
      item.className = "room-card-item";
      item.innerHTML = `
        <div class="room-card-info">
          <strong class="room-card-name">${r.name || "Đoàn tham quan di sản"}</strong>
          <div class="room-card-details">
            <span class="room-card-host">🚩 Host: <b>${r.hostName || "Trưởng đoàn"}</b></span>
            <span class="room-card-count">🎓 Sĩ số: ${r.players}/${r.maxPlayers || 50}</span>
          </div>
        </div>
        <button type="button" class="primary join-room-item-btn">
          Vào phòng ↗
        </button>
      `;
      item.querySelector(".join-room-item-btn")?.addEventListener("click", async () => {
        const name = $("player-name").value.trim();
        await enterGame(name, "join", r.id);
      });
      list.appendChild(item);
    }
  } catch (err) {
    list.innerHTML = `<div class="rooms-empty-msg">Lỗi tải danh sách phòng: ${err.message}</div>`;
  }
}

$("btn-rooms-refresh")?.addEventListener("click", fetchAndRenderRooms);
$("btn-rooms-close")?.addEventListener("click", () => {
  $("rooms-modal").hidden = true;
});
$("btn-rooms-cancel")?.addEventListener("click", () => {
  $("rooms-modal").hidden = true;
});
function menu(show) {
  if (!playing) return;
  paused = show;
  wantsLook = !show;
  clearInput();
  $("pause").hidden = !show;
  $("mouse-hint").hidden = true;
  if (show) {
    document.exitPointerLock?.();
    drawMap($("overview-map"));
    updateSource();
  } else capture();
}
$("menu-button").addEventListener("click", () => menu(!paused));
$("resume").addEventListener("click", () => menu(false));
$("leave").addEventListener("click", () => {
  wantsLook = false;
  network.disconnect();
  document.exitPointerLock?.();
  playing = false;
  paused = false;
  clearInput();
  avatars.clear();
  $("pause").hidden = true;
  $("hud").hidden = true;
  $("welcome").hidden = false;
  document.body.classList.remove("playing");
  $("join-error").textContent =
    "Bạn đã rời đoàn. Có thể tham gia lại bất cứ lúc nào.";
  refreshLobby();
});
document.addEventListener("pointerlockchange", () => {
  lastMouse = null;
  keys.clear();
  if (
    document.pointerLockElement !== canvas &&
    playing &&
    wantsLook &&
    !paused &&
    $("chat-form").hidden
  )
    menu(true);
});
document.addEventListener("pointerlockerror", () => {
  if (playing && !paused) $("mouse-hint").hidden = false;
});
function rotate(dx, dy, sensitivity = 0.0023) {
  p.yaw -= dx * sensitivity;
  p.pitch = THREE.MathUtils.clamp(p.pitch - dy * sensitivity, -1.15, 0.72);
}
document.addEventListener("mousemove", (e) => {
  if (
    playing &&
    !paused &&
    $("chat-form").hidden &&
    !coarse &&
    document.pointerLockElement === canvas
  )
    rotate(e.movementX, e.movementY);
});
canvas.addEventListener("pointermove", (e) => {
  if (!playing || paused || !$("chat-form").hidden) return;
  if (e.pointerType === "touch" || coarse) {
    if (lookPointer?.id === e.pointerId) {
      rotate(e.clientX - lookPointer.x, e.clientY - lookPointer.y, 0.004);
      lookPointer.x = e.clientX;
      lookPointer.y = e.clientY;
    }
    return;
  }
  if (document.pointerLockElement !== canvas && wantsLook) {
    if (lastMouse) rotate(e.clientX - lastMouse.x, e.clientY - lastMouse.y);
    lastMouse = { x: e.clientX, y: e.clientY };
  }
});
canvas.addEventListener("pointerdown", (e) => {
  if (!playing || paused) return;
  canvas.focus();
  if (e.pointerType === "touch" || coarse) {
    lookPointer = { id: e.pointerId, x: e.clientX, y: e.clientY };
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {}
  } else {
    wantsLook = true;
    capture();
  }
});
for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
  canvas.addEventListener(type, () => (lookPointer = null));
canvas.addEventListener("pointerleave", () => (lastMouse = null));
canvas.addEventListener("contextmenu", (e) => e.preventDefault());
canvas.addEventListener(
  "wheel",
  (e) => {
    if (playing && !paused) {
      e.preventDefault();
      $("camera-distance").value = THREE.MathUtils.clamp(
        Number($("camera-distance").value) + Math.sign(e.deltaY) * 0.4,
        3,
        7,
      );
    }
  },
  { passive: false },
);
window.addEventListener("blur", () => {
  clearInput();
  if (playing && !paused && $("chat-form").hidden) menu(true);
});
document.addEventListener("keydown", (e) => {
  if (e.code === "Escape") {
    e.preventDefault();
    if (starting && !playing) {
      network.disconnect();
      wantsLook = false;
      document.exitPointerLock?.();
      return;
    }
    if (playing) {
      $("chat-form").hidden = true;
      $("chat-input").blur();
      menu(true);
    }
    return;
  }
  if (
    e.target instanceof HTMLInputElement ||
    e.target instanceof HTMLSelectElement
  )
    return;
  if (!playing || paused) return;
  if (["Space", "ArrowUp", "ArrowDown"].includes(e.code)) e.preventDefault();
  if (e.code === "Enter") {
    openChat();
    return;
  }
  if (e.code === "KeyE") {
    menu(true);
    return;
  }
  if (e.code === "KeyR") {
    network.send({ type: "respawn" });
    return;
  }
  keys.add(e.code);
});
document.addEventListener("keyup", (e) => keys.delete(e.code));
const joy = $("joystick");
function updateJoy(e) {
  const r = joy.getBoundingClientRect(),
    dx = e.clientX - r.left - r.width / 2,
    dz = e.clientY - r.top - r.height / 2,
    s = Math.min(1, 39 / (Math.hypot(dx, dz) || 1));
  touch.x = (dx * s) / 39;
  touch.z = (dz * s) / 39;
  $("stick").style.transform = "translate(" + dx * s + "px," + dz * s + "px)";
}
joy.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  joyPointer = e.pointerId;
  try {
    joy.setPointerCapture(e.pointerId);
  } catch {}
  updateJoy(e);
});
joy.addEventListener("pointermove", (e) => {
  if (e.pointerId === joyPointer) updateJoy(e);
});
for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
  joy.addEventListener(type, () => {
    joyPointer = null;
    touch.x = touch.z = 0;
    $("stick").style.transform = "";
  });
$("touch-jump").addEventListener("pointerdown", (e) => {
  e.preventDefault();
  touch.jump = true;
  try {
    e.currentTarget.setPointerCapture(e.pointerId);
  } catch {}
});
for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
  $("touch-jump").addEventListener(type, () => (touch.jump = false));
function addMessage(name, text) {
  const li = document.createElement("li"),
    b = document.createElement("b");
  b.textContent = name + ": ";
  li.append(b, document.createTextNode(text));
  $("messages").append(li);
  while ($("messages").children.length > 25) $("messages").firstChild.remove();
  $("messages").scrollTop = $("messages").scrollHeight;
}
function openChat() {
  if (!playing || paused) return;
  wantsLook = false;
  clearInput();
  document.exitPointerLock?.();
  $("chat-form").hidden = false;
  $("chat-hint").hidden = true;
  $("chat-input").focus();
}
$("chat-button").addEventListener("click", openChat);
$("chat-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const text = $("chat-input").value.trim();
  if (text && !network.send({ type: "chat", text }))
    toast("Chưa gửi được tin nhắn: đang mất kết nối.");
  $("chat-input").value = "";
  $("chat-input").blur();
  $("chat-form").hidden = true;
  $("chat-hint").hidden = false;
  wantsLook = true;
  capture();
});
for (const [i, l] of LANDMARKS.entries()) {
  const b = document.createElement("button");
  b.className = "secondary";
  b.textContent = "0" + (i + 1) + " · " + l.name;
  b.addEventListener("click", () => visit(l.id));
  $("tour-buttons").append(b);
  const group = document.createElement("optgroup");
  group.label = l.name;
  for (const room of ROOMS.filter((r) => r.buildingId === l.id)) {
    const option = document.createElement("option");
    option.value = l.id + ":" + room.id;
    option.textContent = room.name;
    group.append(option);
  }
  if (group.childElementCount) $("room-select").append(group);
}
function visit(id, roomId) {
  if (network.send({ type: "visit", id, roomId })) {
    menu(false);
    cameraSnap = true;
  } else toast("Chưa kết nối được với đoàn.");
}
$("visit-room").addEventListener("click", () => {
  const [id, roomId] = $("room-select").value.split(":");
  visit(id, roomId);
});
$("quality").addEventListener("change", () => {
  const q = $("quality").value,
    r = { low: 4, medium: 6, high: 8 }[q];
  chunks.radius = r;
  visibleDistance = { low: 80, medium: 112, high: 150 }[q];
  scene.fog.near = visibleDistance * 0.55;
  scene.fog.far = visibleDistance;
  renderer.setPixelRatio(
    Math.min(devicePixelRatio, q === "low" ? 1 : q === "medium" ? 1.25 : 2),
  );
  renderer.shadowMap.enabled = q !== "low";
});
if (coarse) $("quality").value = "low";
$("quality").dispatchEvent(new Event("change"));
function updateSource() {
  const source = currentRoom || currentLandmark;
  $("source-title").textContent = (source.name || "").normalize("NFC");
  $("source-description").textContent = (source.description || "").normalize("NFC");
  $("source-link").href = source.source;
}
function updateInfo() {
  currentRoom = findRoom(p);
  currentLandmark = LANDMARKS.reduce((a, b) =>
    Math.hypot(p.x - a.x, p.z - a.z) < Math.hypot(p.x - b.x, p.z - b.z) ? a : b,
  );
  const d = Math.hypot(p.x - currentLandmark.x, p.z - currentLandmark.z),
    source = currentRoom || currentLandmark;
  $("location").textContent = (currentRoom
    ? currentRoom.name
    : d < 55
      ? currentLandmark.name
      : "Công viên Dấu Việt"
  ).normalize("NFC");
  $("coordinates").textContent =
    Math.round(p.x) +
    " / " +
    Math.round(p.z) +
    " · " +
    (currentRoom ? "Bên trong công trình" : "Bản đồ tham quan chung");
  $("landmark-card").hidden = !currentRoom && d > 55;
  $("room-type").textContent = currentRoom
    ? "KHÔNG GIAN NỘI THẤT"
    : currentLandmark.outdoor ? "KHU TRƯNG BÀY NGOÀI TRỜI" : "DẤU ẤN KIẾN TRÚC";
  $("landmark-title").textContent = (source.name || "").normalize("NFC");
  $("landmark-description").textContent = (source.description || "").normalize("NFC");
  drawMap($("map"));
}
function drawMap(c) {
  const g = c.getContext("2d"),
    w = c.width,
    h = c.height,
    s = Math.min(w, h) / 305,
    ox = w / 2,
    oz = h / 2;
  g.fillStyle = "#244b3c";
  g.fillRect(0, 0, w, h);
  const X = (x) => ox + x * s,
    Z = (z) => oz + z * s;
  g.strokeStyle = "#c6bda0";
  g.lineWidth = 5 * s;
  g.beginPath();
  g.moveTo(X(-135), Z(20));
  g.lineTo(X(135), Z(20));
  g.moveTo(X(0), Z(20));
  g.lineTo(X(0), Z(65));
  for (const x of [-66, 60]) {
    g.moveTo(X(x), Z(20));
    g.lineTo(X(x), Z(-31));
  }
  for (const x of [-87, 98]) {
    g.moveTo(X(x), Z(20));
    g.lineTo(X(x), Z(70));
  }
  const tank = LANDMARKS.find(l => l.id === "tank");
  g.moveTo(X(tank.x), Z(20));
  g.lineTo(X(tank.x), Z(tank.z + 10));
  g.stroke();
  g.fillStyle = "#739c96";
  g.beginPath();
  g.ellipse(X(66), Z(53), 18 * s, 12 * s, 0, 0, 7);
  g.fill();
  BUILDINGS.forEach((b, i) => {
    g.fillStyle = "#cbbb93";
    g.fillRect(
      X(b.x - (b.approach ? 10 : b.id === "mausoleum" ? 21 : 31)),
      Z(b.z - (b.approach ? 10 : 17)),
      (b.approach ? 20 : b.id === "mausoleum" ? 42 : 62) * s,
      (b.approach ? 20 : 34) * s,
    );
    g.fillStyle = "#17392d";
    g.font = "bold " + Math.max(9, 14 * s) + "px Arial";
    g.textAlign = "center";
    g.fillText(String(i + 1), X(b.x), Z(b.z) + 4);
    if (w > 300) {
      g.fillStyle = "#f3e9ca";
      g.font = "13px Arial";
      g.fillText(b.name, X(b.x), Z(b.z - 24));
    }
  });
  for (const other of peerList) {
    if (other.id === selfId) continue;
    g.fillStyle = other.role === "host" ? "#efc362" : "#ee8c45";
    g.beginPath();
    g.arc(X(other.x), Z(other.z), Math.max(2, 2.5 * s), 0, 7);
    g.fill();
  }
  g.save();
  g.translate(X(p.x), Z(p.z));
  g.rotate(-p.yaw);
  g.fillStyle = "#fff2c1";
  g.beginPath();
  g.moveTo(0, -7);
  g.lineTo(4, 4);
  g.lineTo(0, 2);
  g.lineTo(-4, 4);
  g.closePath();
  g.fill();
  g.restore();
}
function footstep(now) {
  const sprinting = keys.has("ShiftLeft") || keys.has("ShiftRight");
  if (!$("sound").checked || now - lastFootstep < (sprinting ? 280 : 380)) return;
  lastFootstep = now;
  try {
    audio ??= new AudioContext();
    audio.resume();
    const o = audio.createOscillator(),
      gain = audio.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(currentRoom ? 145 : 100, audio.currentTime);
    o.frequency.exponentialRampToValueAtTime(45, audio.currentTime + 0.07);
    gain.gain.setValueAtTime(0.025, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.08);
    o.connect(gain).connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + 0.09);
  } catch {}
}
let frames = 0,
  fpsTime = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;
  if (playing) {
    if (!paused && $("chat-form").hidden && network.ready) {
      accumulator += dt;
      let steps = 0;
      const solemn = Math.abs(p.x + 66) < 13 && Math.abs(p.z + 48) < 13;
      while (accumulator >= 1 / 120 && steps++ < 12) {
        stepPlayer(
          world,
          p,
          {
            x: Number(keys.has("KeyD")) - Number(keys.has("KeyA")) + touch.x,
            z: Number(keys.has("KeyS")) - Number(keys.has("KeyW")) + touch.z,
            jump: !solemn && (keys.has("Space") || touch.jump),
            sprint:
              !solemn && (keys.has("ShiftLeft") || keys.has("ShiftRight")),
          },
          1 / 120,
        );
        accumulator -= 1 / 120;
      }
      if (
        p.grounded &&
        (keys.size || Math.hypot(touch.x, touch.z) > 0.1) &&
        !solemn
      )
        footstep(now);
    }
    if (network.ready && now - lastSend > 50) {
      network.send({
        type: "move",
        x: p.x,
        y: p.y,
        z: p.z,
        yaw: p.yaw,
      });
      lastSend = now;
    }
    if (cameraSnap || Math.abs(p.y - visualY) > 2.5) {
      visualY = p.y;
    } else {
      // Làm mịn camera khi leo cầu thang và di chuyển địa hình:
      // triệt tiêu hoàn toàn hiện tượng giật cục từng bậc, di chuyển êm ái mượt mà
      visualY = THREE.MathUtils.damp(visualY, p.y, 11, dt);
    }
    avatars.update(dt, now, { ...p, y: visualY });
    pivot.set(p.x, visualY + 1.35, p.z);
    backward.set(
      Math.sin(p.yaw) * Math.cos(p.pitch),
      -Math.sin(p.pitch),
      Math.cos(p.yaw) * Math.cos(p.pitch),
    );
    const distance = cameraDistance(
      world,
      pivot,
      backward,
      Number($("camera-distance").value),
    );
    desired.copy(pivot).addScaledVector(backward, distance);
    if (cameraSnap) {
      camera.position.copy(desired);
      cameraSnap = false;
    } else camera.position.lerp(desired, Math.min(1, dt * 14));
    offset.copy(camera.position).sub(pivot);
    const offsetLength = offset.length();
    if (offsetLength > 0.001) {
      offset.normalize();
      camera.position
        .copy(pivot)
        .addScaledVector(
          offset,
          cameraDistance(world, pivot, offset, offsetLength),
        );
    }
    camera.lookAt(pivot);
    avatars.setSelfVisible(camera.position.distanceTo(pivot) > 0.68);
    if (now - lastInfo > 180) {
      updateInfo();
      lastInfo = now;
    }
    if (now - lastSun > 350) {
      sun.position.set(p.x - 35, p.y + 75, p.z + 45);
      sun.target.position.set(p.x, p.y, p.z);
      lastSun = now;
    }
  } else {
    camera.position.set(-98, 17, 4);
    camera.lookAt(-85, 9, -48);
  }
  const focus = playing ? p : camera.position;
  chunks.update(focus.x, focus.z);
  architecture.update(
    focus,
    visibleDistance,
    camera.position,
    $("quality").value === "low" ? 2 : 3,
  );
  scenery.update(focus.x, focus.z, chunks.radius);
  renderer.render(scene, camera);
  frames++;
  if (now - fpsTime > 1000) {
    $("fps").textContent =
      Math.round((frames * 1000) / (now - fpsTime)) + " FPS · Góc nhìn thứ ba";
    frames = 0;
    fpsTime = now;
  }
}
requestAnimationFrame(frame);
window.addEventListener("resize", () => {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
});
window.addEventListener("beforeunload", () => network.disconnect());
