import * as THREE from "three";
import { addModelInstances, MODEL_URLS } from "./models.js";
import { LANDMARKS } from "../shared/landmarks.mjs";
import { TREES } from "../shared/environment.mjs";
import { surfaceTexture } from "./materials.js";
import { createFountainWater, fountainStructureGeometry } from "./fountain.js";
import { addEntranceVideos } from "./entrance-videos.js";

function boardTexture(title, subtitle) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = "#234638";
  g.fillRect(0, 0, 1024, 256);
  g.strokeStyle = "#c2aa73";
  g.lineWidth = 4;
  g.strokeRect(12, 12, 1000, 232);
  g.textAlign = "center";
  g.fillStyle = "#f1e4c9";
  g.font = "bold 48px 'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif";
  g.fillText(title, 512, 109, 950);
  g.fillStyle = "#ced3bd";
  g.font = "26px 'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif";
  g.fillText(subtitle, 512, 180, 950);
  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  return map;
}
export function addScenery(scene, videoButton) {
  const entranceVideos = addEntranceVideos(scene, videoButton, boardTexture);
  const groups = [],
    objects = [],
    unit = new THREE.BoxGeometry(1, 1, 1),
    leafGeo = new THREE.DodecahedronGeometry(1, 1);
  const cells = new Map();
  for (const t of TREES) {
    const key = Math.floor(t.x / 32) + "," + Math.floor(t.z / 32);
    if (!cells.has(key)) cells.set(key, []);
    cells.get(key).push(t);
  }
  for (const [key, trees] of cells) {
    const modelGroup = new THREE.Group();
    modelGroup.visible = false;
    scene.add(modelGroup);
    const [cx, cz] = key.split(",").map(Number);
    const placements = trees.map(t => ({
      position: [t.x, 3, t.z],
      width: 6,
      height: t.height + 0.25,
      rotationY: (t.seed % 360) * Math.PI / 180,
    }));
    groups.push({
      modelGroup, placements,
      x: cx * 32 + 16, z: cz * 32 + 16,
      modelRequested: false, modelReady: false, modelFailed: false,
    });
  }
  const stone = new THREE.MeshStandardMaterial({
      map: surfaceTexture("pavers"),
      roughness: 0.93,
    }),
    wood = new THREE.MeshStandardMaterial({ color: "#80613e", roughness: 0.9 }),
    metal = new THREE.MeshStandardMaterial({
      color: "#3e4c43",
      metalness: 0.3,
      roughness: 0.7,
    }),
    lamp = new THREE.MeshBasicMaterial({ color: "#fff0c5" }),
    hedge = new THREE.MeshStandardMaterial({ color: "#506b3c", roughness: 1 });
  function box(x, y, z, w, h, d, mat = stone) {
    const m = new THREE.Mesh(unit, mat);
    m.position.set(x, y + h / 2, z);
    m.scale.set(w, h, d);
    m.castShadow = true;
    m.receiveShadow = true;
    scene.add(m);
    objects.push(m);
    return m;
  }
  // Đường lát và lề đường liên tục nối cả ba công trình trong cùng thế giới.
  box(0, 3.005, 20, 270, 0.035, 6);
  for (const z of [16.9, 23.1]) box(0, 3, z, 270, 0.14, 0.18);
  for (const x of [-66, 60]) {
    box(x, 3.005, 9.5, 6, 0.035, 20);
    for (const side of [-1, 1]) box(x + side * 3.1, 3, 9.5, 0.18, 0.14, 20);
  }
  for (const x of [-87, 98]) {
    box(x, 3.005, 44, 6, 0.035, 48);
    for (const side of [-1,1]) box(x+side*3.1,3,44,.18,.14,48);
  }
  box(0, 3.005, 40, 6, 0.035, 40);
  for (const x of [-3.1, 3.1]) box(x, 3, 40, 0.18, 0.14, 40);
  // Ghế công viên và đèn đường ở lề, không chắn đường đi chính.

  for (let x = -118; x <= 118; x += 24)
    for (const side of [-1, 1]) {
      const z = 20 + side * 7.4;
      let bx = x,
        px = x + 5;
      for (const branch of [-87, -66, 0, 60, 98]) {
        if (Math.abs(bx - branch) < 6) bx += bx < branch ? -7 : 7;
        if (Math.abs(px - branch) < 5) px += px < branch ? -8 : 8;
      }
      for (const dz of [-0.24, 0, 0.24])
        box(bx, 3.45, z + dz, 2.5, 0.085, 0.18, wood);
      box(bx, 3.65, z + side * 0.36, 2.5, 0.65, 0.12, wood);
      for (const dx of [-0.9, 0.9]) box(bx + dx, 3, z, 0.09, 0.55, 0.7, metal);
      box(px, 3, 20 + side * 5.1, 0.09, 4.4, 0.09, metal);
      box(px, 7.35, 20 + side * 5.1, 0.6, 0.15, 0.6, metal);
      box(px, 7.1, 20 + side * 5.1, 0.43, 0.25, 0.43, lamp);
    }
  for (const l of LANDMARKS) {
    for (const dx of [-2.1, 2.1])
      box(l.sign.x + dx, 3, l.sign.z, 0.13, 2, 0.13, metal);
    const b = box(l.sign.x, 4.8, l.sign.z, 5.6, 1.4, 0.13, wood);
    for (const side of [-1, 1]) {
      const face = new THREE.Mesh(
        new THREE.PlaneGeometry(5.5, 1.32),
        new THREE.MeshBasicMaterial({
          map: boardTexture(l.name, l.city),
          side: THREE.DoubleSide,
        }),
      );
      face.position.set(l.sign.x, 5.5, l.sign.z + side * 0.075);
      face.rotation.y = side < 0 ? Math.PI : 0;
      scene.add(face);
      objects.push(face);
    }
    // Hàng cây cắt tỉa gọn ở cạnh khuôn viên.
    const hedgeFallbackGroup = new THREE.Group();
    hedgeFallbackGroup.position.set(l.x, 0, l.z);
    scene.add(hedgeFallbackGroup);
    objects.push(hedgeFallbackGroup);
    const hedgeFallbacks = [], hedgePlacements = [];
    for (const side of [-1, 1])
      for (let i = 0; i < 10; i++) {
        const x = side * (l.id === "mausoleum" ? 25 : l.approach ? 19 : 34);
        const z = -10 + i * 3.2;
        const m = new THREE.Mesh(leafGeo, hedge);
        m.scale.set(1.05, 0.65, 1.45);
        m.position.set(x, 3.5, z);
        m.visible = false;
        m.castShadow = true;
        m.receiveShadow = true;
        hedgeFallbackGroup.add(m);
        hedgeFallbacks.push(m);
        hedgePlacements.push({ position: [x, 3, z], width: 2.1, height: 1.3 });
      }
    const hedgeModelGroup = new THREE.Group();
    hedgeModelGroup.position.set(l.x, 0, l.z);
    hedgeModelGroup.visible = false;
    scene.add(hedgeModelGroup);
    objects.push(hedgeModelGroup);
    addModelInstances(hedgeModelGroup, MODEL_URLS.tree, hedgePlacements)
      .then(model => {
        if (!model) return;
        hedgeFallbacks.forEach(mesh => { mesh.visible = false; });
        hedgeModelGroup.visible = true;
      })
      .catch(error => console.warn("Không tải được model cây cảnh:", error));
  }

  // ==========================================
  // ĐẦM SEN QUỐC HOA VIỆT NAM (LOTUS POND & PIER)
  // ==========================================
  // 1. Lan can và chòi ngắm sen trên cầu gỗ vươn ra giữa đầm sen (x=66, cân đối tuyệt đối 2 bên)
  for (let z = 40.5; z <= 50; z += 1.5) {
    box(64.1, 3, z, 0.08, 0.95, 0.08, wood);
    box(67.9, 3, z, 0.08, 0.95, 0.08, wood);
  }
  box(64.1, 3.88, 45.25, 0.10, 0.06, 9.6, wood);
  box(67.9, 3.88, 45.25, 0.10, 0.06, 9.6, wood);
  box(64.1, 3.45, 45.25, 0.06, 0.04, 9.6, wood);
  box(67.9, 3.45, 45.25, 0.06, 0.04, 9.6, wood);

  // Lan can chuyển tiếp mở rộng tại z=50 từ cầu gỗ (x=64.1..67.9) sang chòi ngắm sen (x=63.1..68.9)
  box(63.6, 3.88, 50, 1.0, 0.06, 0.08, wood);
  box(68.4, 3.88, 50, 1.0, 0.06, 0.08, wood);
  box(63.6, 3.45, 50, 1.0, 0.04, 0.06, wood);
  box(68.4, 3.45, 50, 1.0, 0.04, 0.06, wood);

  // Lan can hai bên chòi ngắm sen (x=63.1 và x=68.9, z=50..54.5)
  for (let z = 50; z <= 54.5; z += 1.5) {
    box(63.1, 3, z, 0.08, 0.95, 0.08, wood);
    box(68.9, 3, z, 0.08, 0.95, 0.08, wood);
  }
  box(63.1, 3.88, 52.25, 0.10, 0.06, 4.6, wood);
  box(68.9, 3.88, 52.25, 0.10, 0.06, 4.6, wood);
  box(63.1, 3.45, 52.25, 0.06, 0.04, 4.6, wood);
  box(68.9, 3.45, 52.25, 0.06, 0.04, 4.6, wood);

  // Lan can chắn mép trước mặt nước chòi ngắm sen (z=54.5, x=63.1..68.9)
  for (let x = 63.1; x <= 68.9; x += 1.45) box(x, 3, 54.5, 0.08, 0.95, 0.08, wood);
  box(66, 3.88, 54.5, 5.8, 0.06, 0.10, wood);
  box(66, 3.45, 54.5, 5.8, 0.04, 0.06, wood);

  // Ghế nghỉ chân và đèn chòi ngắm hoa sen
  box(66, 3.45, 53, 2.4, 0.085, 0.35, wood);
  box(66, 3.65, 53.3, 2.4, 0.65, 0.08, wood);
  for (const dx of [-0.9, 0.9]) box(66 + dx, 3, 53, 0.09, 0.55, 0.45, metal);

  box(67.8, 3, 53.8, 0.09, 3.8, 0.09, metal);
  box(67.8, 6.75, 53.8, 0.5, 0.12, 0.5, metal);
  box(67.8, 6.55, 53.8, 0.35, 0.22, 0.35, lamp);

  // Biển giới thiệu Di sản Quốc hoa Việt Nam đầu cầu gỗ
  for (const dx of [-1.5, 1.5]) box(66 + dx, 3, 39, 0.10, 1.8, 0.10, metal);
  box(66, 4.5, 39, 3.8, 1.2, 0.10, wood);
  for (const side of [-1, 1]) {
    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(3.7, 1.12),
      new THREE.MeshBasicMaterial({
        map: boardTexture(
          "ĐẦM SEN QUỐC HOA",
          "Hoa sen – Biểu tượng thanh cao, thuần khiết & sức sống kiên cường dân tộc",
        ),
        side: THREE.DoubleSide,
      }),
    );
    face.position.set(66, 5.1, 39 + side * 0.06);
    face.rotation.y = side < 0 ? Math.PI : 0;
    scene.add(face);
    objects.push(face);
  }

  // Preserve the complete fountain scan, including its basin and stone details.
  const fountainGroup = new THREE.Group();
  fountainGroup.position.set(60, 3.0, -13.5);
  // Vòng lát đá bao quanh, khớp với khu sân cỏ đã có.
  const roundRoad = new THREE.Mesh(
    new THREE.RingGeometry(5.45, 8.5, 40),
    stone,
  );
  roundRoad.rotation.x = -Math.PI / 2;
  roundRoad.position.y = 0.01;
  roundRoad.receiveShadow = true;
  fountainGroup.add(roundRoad);
  const fountainFallback = new THREE.Group();
  const fountainStone = new THREE.MeshStandardMaterial({
    map: surfaceTexture("granite"), roughness: 0.88,
  });
  for (const [top, bottom, height, y] of [
    [4.5, 4.8, 0.42, 0.21], [3.2, 3.65, 0.48, 0.82], [1.8, 2.35, 0.4, 1.38],
  ]) {
    const tier = new THREE.Mesh(
      new THREE.CylinderGeometry(top, bottom, height, 32), fountainStone,
    );
    tier.position.y = y;
    tier.castShadow = true;
    tier.receiveShadow = true;
    fountainFallback.add(tier);
  }
  fountainGroup.add(fountainFallback);
  addModelInstances(fountainGroup, MODEL_URLS.fountain, [{
    position: [0, 0, 0], width: 10,
  }]).then(model => {
    if (!model?.children.length) return;
    model.traverse(mesh => {
      if (!mesh.isMesh) return;
      mesh.geometry = fountainStructureGeometry(mesh.geometry);
      mesh.computeBoundingSphere();
    });
    fountainFallback.visible = false;
    console.info("Đã tải model đài phun nước GLB.");
  }).catch(error => {
    fountainFallback.visible = true;
    console.warn("Không tải được model đài phun nước:", error);
  });

  const fountainWater = createFountainWater();
  fountainGroup.add(fountainWater.group);

  // Vành bồn hoa và cây cảnh tỉa tròn bao quanh đài phun nước
  const shrubFallbacks = new THREE.Group();
  shrubFallbacks.visible = false;
  const shrubPlacements = [];
  for (let i = 0; i < 24; i++) {
    const a = (i * Math.PI * 2) / 24;
    const shrubR = 8.8;
    const shrub = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 8, 6),
      hedge,
    );
    shrub.position.set(Math.cos(a) * shrubR, 0.42, Math.sin(a) * shrubR);
    shrubFallbacks.add(shrub);
    shrubPlacements.push({
      position: [Math.cos(a) * shrubR, 0, Math.sin(a) * shrubR],
      width: 0.84, height: 0.84,
    });
  }
  fountainGroup.add(shrubFallbacks);
  addModelInstances(fountainGroup, MODEL_URLS.tree, shrubPlacements)
    .then(model => { if (model) shrubFallbacks.visible = false; })
    .catch(error => console.warn("Không tải được model cây quanh đài phun:", error));
  scene.add(fountainGroup);
  objects.push(fountainGroup);

  // Share the imported lotus mesh across both ponds; retain leaves and stems.
  const ponds = [[66, 53], [-87, 83]].map(([x, z]) => {
    const group = new THREE.Group(), fallback = new THREE.Group();
    group.position.set(x, 2.90, z);
    group.add(fallback);
    scene.add(group);
    objects.push(group);
    return { group, fallback, placements: [] };
  });
  const padMat = new THREE.MeshStandardMaterial({ color: "#397d39", roughness: 0.82, side: THREE.DoubleSide });
  const stemMat = new THREE.MeshStandardMaterial({ color: "#2e7d32", roughness: 0.88 });
  const flowerMat = new THREE.MeshStandardMaterial({ color: "#ec70a0", roughness: 0.65 });
  const padGeo = new THREE.CylinderGeometry(1, 0.96, 0.014, 18);
  const stemGeo = new THREE.CylinderGeometry(0.014, 0.017, 1, 8);
  const flowerGeo = new THREE.SphereGeometry(0.5, 10, 6);
  const pondAt = x => ponds[x > 0 ? 0 : 1];
  let lSeed = 719;
  const lRand = () => {
    lSeed = (lSeed * 1664525 + 1013904223) >>> 0;
    return lSeed / 4294967296;
  };
  function addLotusBlossom(x, z, s, hStem) {
    const pond = pondAt(x), localX = x - pond.group.position.x, localZ = z - pond.group.position.z;
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.set(localX, hStem / 2, localZ);
    stem.scale.y = hStem;
    pond.group.add(stem);
    const width = s * 1.75;
    pond.placements.push({ position: [localX, hStem, localZ], width, rotationY: (x + z) * 2.4 });
    const fallback = new THREE.Mesh(flowerGeo, flowerMat);
    fallback.position.set(localX, hStem + width * 0.15, localZ);
    fallback.scale.set(width, width * 0.3, width);
    pond.fallback.add(fallback);
  }
  function addLotusBud(x, z, s, hStem) {
    addLotusBlossom(x, z, s * 0.75, hStem);
  }
  function addLotusPad(x, z, s, isEmergent) {
    const pond = pondAt(x), padH = isEmergent ? 0.18 + lRand() * 0.22 : 0.02;
    const group = new THREE.Group();
    group.position.set(x - pond.group.position.x, padH, z - pond.group.position.z);
    if (isEmergent) {
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = -padH / 2;
      stem.scale.y = padH;
      group.add(stem);
      group.rotation.x = (lRand() - 0.5) * 0.20;
      group.rotation.z = (lRand() - 0.5) * 0.20;
    }
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.scale.set(s, 1, s);
    pad.rotation.y = lRand() * Math.PI * 2;
    pad.receiveShadow = true;
    group.add(pad);
    pond.group.add(group);
  }

  // 1. Quần thể Đầm Sen Quốc hoa (hồ x=66, z=53)
  for (let i = 0; i < 85; i++) {
    const r = Math.sqrt(lRand()) * 0.92;
    const th = lRand() * Math.PI * 2;
    const lx = 66 + Math.cos(th) * 17.5 * r;
    const lz = 53 + Math.sin(th) * 11.5 * r;
    if (Math.abs(lx - 66) <= 2.8 && lz >= 40 && lz <= 55) continue;

    const s = 0.42 + lRand() * 0.44;
    const isEmergent = lRand() > 0.65;
    addLotusPad(lx, lz, s, isEmergent);

    // Xen kẽ hoa sen bung nở rực rỡ (85%) và búp sen thanh tao (15%)
    if (lRand() > 0.35) {
      const hStem = 0.28 + lRand() * 0.36;
      const ox = lx + (lRand() - 0.5) * 0.35;
      const oz = lz + (lRand() - 0.5) * 0.35;
      if (lRand() > 0.15) {
        addLotusBlossom(ox, oz, s, hStem);
      } else {
        addLotusBud(ox, oz, s, hStem + 0.12);
      }
    }
  }

  // 2. Quần thể Sen hồ Linh Chiểu (Chùa Một Cột, x=-87, z=83)
  for (let i = 0; i < 55; i++) {
    const lx = -87 + (lRand() - 0.5) * 16.2;
    const lz = 83 + (lRand() - 0.5) * 16.2;
    if (Math.abs(lx + 87) < 2.3 && Math.abs(lz - 83) < 2.3) continue;
    if (Math.abs(lx + 87) < 1.9 && lz > 83) continue;
    if (Math.abs(lx + 87) > 8.5 || Math.abs(lz - 83) > 8.5) continue;

    const s = 0.38 + lRand() * 0.38;
    const isEmergent = lRand() > 0.70;
    addLotusPad(lx, lz, s, isEmergent);

    if (lRand() > 0.35) {
      const hStem = 0.25 + lRand() * 0.30;
      const ox = lx + (lRand() - 0.5) * 0.30;
      const oz = lz + (lRand() - 0.5) * 0.30;
      if (lRand() > 0.15) {
        addLotusBlossom(ox, oz, s, hStem);
      } else {
        addLotusBud(ox, oz, s, hStem + 0.10);
      }
    }
  }

  for (const pond of ponds) {
    addModelInstances(pond.group, MODEL_URLS.lotus, pond.placements)
      .then(() => { pond.fallback.visible = false; })
      .catch(error => console.warn("Không tải được model hoa sen:", error));
  }
  const cloudMaterial = new THREE.MeshBasicMaterial({
    color: "#f0f1e7",
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  });
  for (let i = 0; i < 8; i++) {
    const group = new THREE.Group();
    for (let j = 0; j < 4; j++) {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(1, 10, 6),
        cloudMaterial,
      );
      m.scale.set(9 + j, 1.6 + j * 0.18, 4);
      m.position.set(j * 5, j % 2, 0);
      group.add(m);
    }
    group.position.set(-150 + i * 44, 46 + (i % 3) * 3, -115 + (i % 4) * 62);
    scene.add(group);
  }
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(220, 24, 12),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        top: { value: new THREE.Color("#94b9c8") },
        bottom: { value: new THREE.Color("#e1e0ce") },
      },
      vertexShader:
        "varying float vHeight; void main(){vHeight=position.y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
      fragmentShader:
        "varying float vHeight;uniform vec3 top;uniform vec3 bottom;void main(){gl_FragColor=vec4(mix(bottom,top,smoothstep(-20.0,190.0,vHeight)),1.0);}",
    }),
  );
  scene.add(sky);
  return {
    entranceVideos,
    update(x, z, radius) {
      sky.position.set(x, 20, z);
      const distance = radius * 16 + 28;
      for (const t of groups) {
        const d = Math.hypot(t.x - x, t.z - z);
        const inView = d < distance;
        if (inView && !t.modelRequested && !t.modelFailed) {
          t.modelRequested = true;
          addModelInstances(t.modelGroup, MODEL_URLS.tree, t.placements)
            .then(model => { t.modelReady = Boolean(model); })
            .catch(error => {
              t.modelFailed = true;
              console.warn("Không tải được model cây:", error);
            });
        }
        t.modelGroup.visible = inView && t.modelReady;
      }
      for (const o of objects)
        o.visible =
          Math.hypot(o.position.x - x, o.position.z - z) < distance + 25;
      if (fountainGroup.visible) fountainWater.update(performance.now() * 0.001);
    },
  };
}
