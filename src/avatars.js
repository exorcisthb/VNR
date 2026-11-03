import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { flagCanvas } from "./materials.js";
const cube = new THREE.BoxGeometry(1, 1, 1),
  sphere = new THREE.SphereGeometry(0.5, 12, 8),
  cylinder = new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
function fptTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 160;
  const g = c.getContext("2d");
  g.textAlign = "center";
  g.fillStyle = "#ffffff";
  g.font = "900 italic 112px Arial";
  g.fillText("FPT", 124, 120);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function backpackBadgeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 256;
  const g = canvas.getContext('2d');
  // Embroidered gold/orange bird emblem above the university wordmark.
  g.save(); g.translate(256, 78);
  g.lineJoin = 'round'; g.lineWidth = 8; g.strokeStyle = '#f5f0dc';
  g.fillStyle = '#efb92d';
  g.beginPath();
  g.moveTo(-53, 35); g.bezierCurveTo(10, 52, 66, 25, 54, -24);
  g.bezierCurveTo(45, -62, 9, -65, -4, -42);
  g.bezierCurveTo(24, -49, 39, -23, 18, -8);
  g.lineTo(-9, -29); g.lineTo(-2, -3); g.lineTo(-43, -15);
  g.lineTo(-27, 10); g.lineTo(-64, 13); g.closePath(); g.stroke(); g.fill();
  g.strokeStyle = '#d75524'; g.lineWidth = 7;
  g.beginPath(); g.moveTo(-38, 28); g.bezierCurveTo(7, 27, 43, 12, 30, -20); g.stroke();
  g.fillStyle = '#242420'; g.beginPath(); g.arc(16, -35, 3, 0, Math.PI * 2); g.fill();
  g.restore();
  g.fillStyle = '#f4f2e9'; g.textAlign = 'center';
  g.font = 'bold 42px Georgia'; g.fillText('FPT UNIVERSITY', 256, 181);
  g.strokeStyle = '#ed6c20'; g.lineWidth = 4;
  g.beginPath(); g.moveTo(27, 210); g.quadraticCurveTo(256, 224, 485, 210); g.stroke();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
const backpackBadgeMap = backpackBadgeTexture();
const shirtMap = fptTexture(),
  flagMap = new THREE.CanvasTexture(flagCanvas());
flagMap.colorSpace = THREE.SRGBColorSpace;
export function createCharacter(role = "student") {
  const isHost = role === "host";
  const ownedGeometries = [];
  const group = new THREE.Group(),
    skin = new THREE.MeshStandardMaterial({ color: "#cba27e", roughness: 1 }),
    hair = new THREE.MeshStandardMaterial({ color: "#252521", roughness: 1 }),
    shirt = new THREE.MeshStandardMaterial({
      color: isHost ? "#f4f5f4" : "#f57413",
      roughness: 0.95,
    }),
    pants = new THREE.MeshStandardMaterial({ color: "#24292b", roughness: 1 }),
    shoe = new THREE.MeshStandardMaterial({ color: isHost ? "#202326" : "#eeeae1", roughness: 0.9 }),
    dark = new THREE.MeshStandardMaterial({ color: "#303c35", roughness: 1 }),
    white = new THREE.MeshStandardMaterial({ color: "#fafaf6", roughness: 0.85 }),
    seam = new THREE.MeshStandardMaterial({ color: isHost ? "#cbd1d1" : "#d5570a", roughness: 1 }),
    bagFabric = new THREE.MeshStandardMaterial({ color: "#171a19", roughness: 1 }),
    bagTrim = new THREE.MeshStandardMaterial({ color: "#343936", roughness: 0.9 }),
    materials = [skin, hair, shirt, pants, shoe, dark, white, seam, bagFabric, bagTrim];
  function part(parent, size, pos, mat, geometry = cube) {
    const m = new THREE.Mesh(geometry, mat);
    m.position.set(...pos);
    m.scale.set(...size);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  const torso = part(group, [0.48, 0.57, 0.28], [0, 1.12, 0], shirt);
  torso.name = isHost ? 'white-shirt' : 'orange-polo';
  // The collar belongs to the torso, so looking up/down does not move it.
  part(group, [0.235, 0.055, 0.225], [0, 1.414, 0], white);
  if (!isHost) part(group, [0.205, 0.057, 0.195], [0, 1.423, 0], shirt);
  for (const side of [-1, 1]) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([
      side * 0.025, 1.438, -0.115,
      side * 0.142, 1.405, -0.145,
      side * 0.080, 1.333, -0.163,
    ], 3));
    if (side < 0) geometry.setIndex([0, 2, 1]);
    else geometry.setIndex([0, 1, 2]);
    geometry.computeVertexNormals();
    const collarMaterial = new THREE.MeshStandardMaterial({ color: isHost ? '#fafbfa' : '#fbfbf2', roughness: 0.95, side: THREE.DoubleSide });
    materials.push(collarMaterial);
    ownedGeometries.push(geometry);
    const leaf = new THREE.Mesh(geometry, collarMaterial);
    leaf.name = 'collar';
    group.add(leaf);
    if (!isHost) {
      // Orange collar leaves with a narrow white edge, matching the polo.
      const inner = geometry.clone();
      const points = inner.attributes.position;
      const center = new THREE.Vector3();
      for (let i = 0; i < points.count; i++) center.add(new THREE.Vector3().fromBufferAttribute(points, i));
      center.divideScalar(points.count);
      for (let i = 0; i < points.count; i++) {
        const point = new THREE.Vector3().fromBufferAttribute(points, i).sub(center).multiplyScalar(0.84).add(center);
        points.setXYZ(i, point.x, point.y, point.z - 0.002);
      }
      inner.computeVertexNormals();
      ownedGeometries.push(inner);
      group.add(new THREE.Mesh(inner, shirt));
    }
  }
  part(group, [isHost ? 0.024 : 0.033, isHost ? 0.48 : 0.14, 0.009], [0, isHost ? 1.10 : 1.32, -0.145], isHost ? white : seam);
  for (const y of (isHost ? [1.31, 1.22, 1.13, 1.04, 0.95] : [1.34, 1.29]))
    part(group, [0.010, 0.010, 0.008], [0, y, -0.153], isHost ? seam : white);
  if (isHost) {
    // Subtle chest-pocket stitching and a tucked shirt with a dark belt.
    part(group, [0.105, 0.012, 0.009], [0.133, 1.21, -0.146], seam);
    part(group, [0.010, 0.092, 0.009], [0.084, 1.17, -0.146], seam);
    part(group, [0.010, 0.092, 0.009], [0.182, 1.17, -0.146], seam);
    part(group, [0.105, 0.010, 0.009], [0.133, 1.125, -0.146], seam);
  }
  part(group, [0.47, 0.045, 0.285], [0, 0.846, 0], pants);
  part(group, [0.055, 0.033, 0.012], [0, 0.846, -0.149], bagTrim);

  // Đầu và cổ được gom vào nhóm head có khớp xoay tại cổ (neck pivot y = 1.45),
  // cho phép đầu gật lên/xuống theo góc nhìn chuột như Minecraft
  const head = new THREE.Group();
  head.position.set(0, 1.45, 0);
  group.add(head);

  // Cổ và viền cổ áo bao quanh chân cổ
  part(head, [0.16, 0.12, 0.17], [0, 0, 0], skin);

  // Khối đầu da người
  part(head, [0.36, 0.4, 0.34], [0, 0.22, 0], skin);

  // Tóc đen phủ kín hoàn toàn đỉnh đầu, hai bên thái dương và toàn bộ phía sau gáy
  // (Triệt tiêu hoàn toàn mảng da hở phía sau gáy, giúp góc nhìn thứ ba từ phía sau
  // thấy rõ 100% mái tóc đen và lưng nhân vật, không bị nhầm lẫn với mặt trước)
  part(head, [0.38, 0.11, 0.38], [0, 0.43, 0], hair); // Đỉnh đầu
  part(head, [0.38, 0.08, 0.08], [0, 0.38, -0.16], hair); // Mái trước trán
  part(head, [0.38, 0.42, 0.11], [0, 0.22, 0.14], hair); // Tóc phủ trọn vẹn toàn bộ phía sau gáy
  part(head, [0.06, 0.36, 0.26], [-0.17, 0.24, 0.04], hair); // Tóc mai bên trái
  part(head, [0.06, 0.36, 0.26], [0.17, 0.24, 0.04], hair); // Tóc mai bên phải

  // Hai bên tai
  part(head, [0.03, 0.08, 0.06], [-0.19, 0.18, -0.04], skin);
  part(head, [0.03, 0.08, 0.06], [0.19, 0.18, -0.04], skin);

  // Ngũ quan khuôn mặt (ở mặt trước, hướng -Z)
  part(head, [0.055, 0.033, 0.025], [-0.09, 0.24, -0.176], dark); // Mắt trái
  part(head, [0.055, 0.033, 0.025], [0.09, 0.24, -0.176], dark); // Mắt phải
  part(head, [0.08, 0.022, 0.025], [0, 0.11, -0.176], dark); // Miệng
  part(head, [0.065, 0.07, 0.04], [0, 0.18, -0.19], skin); // Mũi

  const legs = [],
    arms = [];
  for (const side of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.set(side * 0.13, 0.85, 0);
    group.add(leg);
    part(leg, [0.205, 0.7, 0.23], [0, -0.35, 0], pants);
    part(leg, [0.23, 0.15, 0.34], [0, -0.77, -0.045], shoe);
    part(leg, [0.232, 0.025, 0.343], [0, -0.832, -0.045], isHost ? dark : white);
    legs.push(leg);
    const arm = new THREE.Group();
    arm.position.set(side * 0.33, 1.35, 0);
    group.add(arm);
    part(arm, [0.16, 0.26, 0.25], [0, -0.12, 0], shirt);
    part(arm, [0.163, isHost ? 0.012 : 0.018, 0.253], [0, -0.245, 0], isHost ? seam : white);
    part(arm, [0.13, 0.31, 0.15], [0, -0.37, 0], skin);
    part(arm, [0.145, 0.16, 0.18], [0, -0.59, -0.015], skin);
    arms.push(arm);
  }
  group.scale.setScalar(1.0);
  if (!isHost) {
    const logoGeometry = new THREE.PlaneGeometry(0.095, 0.053);
    const logoMaterial = new THREE.MeshStandardMaterial({ map: shirtMap, transparent: true, roughness: 0.95, depthWrite: false });
    ownedGeometries.push(logoGeometry); materials.push(logoMaterial);
    const chest = new THREE.Mesh(logoGeometry, logoMaterial);
    chest.name = 'fpt-chest-logo';
    chest.position.set(0.115, 1.265, -0.146);
    chest.rotation.y = Math.PI;
    group.add(chest);

    const backpack = new THREE.Group();
    backpack.name = 'student-backpack';
    group.add(backpack);
    const rounded = new RoundedBoxGeometry(1, 1, 1, 3, 0.16);
    ownedGeometries.push(rounded);
    const piping = new THREE.MeshStandardMaterial({ color: '#ef721e', roughness: 0.9 });
    const badgeMaterial = new THREE.MeshStandardMaterial({ map: backpackBadgeMap, transparent: true, roughness: 1 });
    materials.push(piping, badgeMaterial);
    // Tall black pack, curved top and raised front compartments like the reference.
    part(backpack, [0.405, 0.56, 0.185], [0, 1.135, 0.245], bagTrim, rounded);
    part(backpack, [0.385, 0.54, 0.19], [0, 1.135, 0.254], bagFabric, rounded);
    part(backpack, [0.265, 0.49, 0.043], [0, 1.12, 0.349], bagTrim, rounded);
    part(backpack, [0.253, 0.475, 0.048], [0, 1.12, 0.355], bagFabric, rounded);
    const badgeGeometry = new THREE.PlaneGeometry(0.244, 0.122);
    ownedGeometries.push(badgeGeometry);
    part(backpack, [1, 1, 1], [0, 1.315, 0.381], badgeMaterial, badgeGeometry).name = 'backpack-university-badge';
    for (const [y, height] of [[1.165, 0.15], [1.002, 0.15], [0.892, 0.065]]) {
      part(backpack, [0.252, height, 0.037], [0, y, 0.389], bagFabric, rounded);
      const zipperY = y + height / 2 - 0.008;
      part(backpack, [0.235, 0.006, 0.008], [0, zipperY, 0.410], piping, rounded);
      part(backpack, [0.012, 0.022, 0.008], [0.099, zipperY - 0.011, 0.418], bagTrim, rounded);
    }
    for (const side of [-1, 1]) {
      // Side mesh pockets and stitched vertical borders.
      part(backpack, [0.048, 0.20, 0.13], [side * 0.205, 1.005, 0.265], bagTrim, rounded);
      for (let j = 0; j < 5; j++)
        part(backpack, [0.003, 0.15, 0.005], [side * 0.231, 1.005, 0.225 + j * 0.02], bagFabric);
      part(backpack, [0.009, 0.39, 0.008], [side * 0.147, 1.12, 0.357], bagTrim, rounded);
      part(backpack, [0.025, 0.055, 0.035], [side * 0.052, 1.425, 0.23], bagFabric, rounded);
      // Narrow straps follow the outer chest and leave the polo logo visible.
      part(backpack, [0.032, 0.38, 0.014], [side * 0.192, 1.205, -0.153], bagFabric);
      part(backpack, [0.035, 0.035, 0.32], [side * 0.192, 1.414, 0.005], bagFabric);
      part(backpack, [0.032, 0.08, 0.17], [side * 0.192, 1.005, 0.075], bagFabric);
      part(backpack, [0.044, 0.032, 0.019], [side * 0.192, 1.08, -0.16], bagTrim);
    }
    part(backpack, [0.13, 0.025, 0.035], [0, 1.455, 0.23], bagFabric, rounded);
  }
  let flag = null;
  if (role === "host") {
    // Tư thế cánh tay phải giương cao ngọn cờ Tổ quốc DỌC THẲNG ĐỨNG uy nghi ở phía trước người (hướng nhìn trước)
    arms[1].rotation.x = 0.85;
    arms[1].rotation.y = 0;
    arms[1].rotation.z = -0.12;

    // Bàn tay nắm chặt cán cờ
    part(arms[1], [0.15, 0.16, 0.16], [0, -0.59, 0], skin);
    part(arms[1], [0.08, 0.09, 0.10], [0.06, -0.57, 0.04], skin);

    // Khớp tay cầm cờ: cán cờ vươn dọc thẳng đứng 90 độ lên bầu trời ở phía trước ngực
    const grip = new THREE.Group();
    grip.position.set(0, -0.59, 0);
    grip.rotation.x = -0.85;
    grip.rotation.y = 0;
    grip.rotation.z = 0.12;
    arms[1].add(grip);

    // Cán cờ vươn cao, thẳng tắp và vững chãi
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.016, 2.3, 8),
      new THREE.MeshStandardMaterial({
        color: "#bba56c",
        metalness: 0.55,
        roughness: 0.42,
      }),
    );
    pole.position.set(0, 1.05, 0);
    pole.castShadow = true;
    grip.add(pole);
    materials.push(pole.material);

    // Lá cờ dẫn đoàn tung bay trang trọng trên đỉnh cột
    flag = new THREE.Mesh(
      new THREE.PlaneGeometry(0.92, 0.60, 12, 5),
      new THREE.MeshStandardMaterial({
        map: flagMap,
        side: THREE.DoubleSide,
        roughness: 0.9,
      }),
    );
    flag.position.set(0.46, 1.85, 0);
    flag.castShadow = true;
    grip.add(flag);
    materials.push(flag.material);
  } else {
    // Sinh viên FPT: cầm cờ Tổ quốc nhỏ cầm tay (cán gỗ 0.65m, lá cờ 0.32m x 0.21m, nhỏ hơn của Host)
    arms[1].rotation.x = 0.45;
    arms[1].rotation.y = 0;
    arms[1].rotation.z = -0.08;

    // Bàn tay nắm chặt cán cờ nhỏ
    part(arms[1], [0.15, 0.16, 0.16], [0, -0.59, 0], skin);
    part(arms[1], [0.07, 0.08, 0.08], [0.05, -0.57, 0.03], skin);

    const grip = new THREE.Group();
    grip.position.set(0, -0.59, 0);
    grip.rotation.x = -0.45;
    grip.rotation.y = 0;
    grip.rotation.z = 0.08;
    arms[1].add(grip);

    // Cán cờ nhỏ thanh gỗ tre
    const miniPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.007, 0.007, 0.65, 8),
      new THREE.MeshStandardMaterial({
        color: "#d9c18f",
        metalness: 0.2,
        roughness: 0.7,
      }),
    );
    miniPole.position.set(0, 0.28, 0);
    miniPole.castShadow = true;
    grip.add(miniPole);
    materials.push(miniPole.material);

    // Lá cờ nhỏ cầm tay xinh xắn (tỷ lệ 1/3 cờ Host)
    flag = new THREE.Mesh(
      new THREE.PlaneGeometry(0.32, 0.21, 8, 4),
      new THREE.MeshStandardMaterial({
        map: flagMap,
        side: THREE.DoubleSide,
        roughness: 0.9,
      }),
    );
    flag.position.set(0.16, 0.48, 0);
    flag.castShadow = true;
    grip.add(flag);
    materials.push(flag.material);
  }
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.39, 24),
    new THREE.MeshBasicMaterial({
      color: "#26382a",
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  group.add(shadow);
  materials.push(shadow.material);
  return {
    group,
    head,
    legs,
    arms,
    flag,
    shadow,
    role,
    materials,
    dispose() {
      for (const m of materials) m.dispose();
      for (const geometry of ownedGeometries) geometry.dispose();
      if (flag) flag.geometry.dispose();
      shadow.geometry.dispose();
    },
  };
}
export class Avatars {
  constructor(scene) {
    this.scene = scene;
    this.players = new Map();
    this.selfId = null;
  }
  create(p) {
    const a = createCharacter(p.role);
    a.target = p;
    a.self = p.id === this.selfId;
    a.previous = new THREE.Vector3(p.x, p.y, p.z);
    a.phase = 0;
    a.group.position.copy(a.previous);
    a.group.rotation.y = p.yaw;
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 90;
    const g = c.getContext("2d");
    g.fillStyle = p.role === "host" ? "#72562cdd" : "#173c35dd";
    g.beginPath();
    g.roundRect(5, 5, 502, 78, 12);
    g.fill();
    g.fillStyle = "#fff2d2";
    g.font = "30px Arial";
    g.textAlign = "center";
    g.fillText((p.role === "host" ? "HOST · " : "") + p.name, 256, 54, 485);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    a.label = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: true }),
    );
    a.label.position.y = 2.25;
    a.label.scale.set(2.7, 0.47, 1);
    a.label.visible = !a.self;
    a.group.add(a.label);
    a.labelTexture = t;
    this.scene.add(a.group);
    this.players.set(p.id, a);
    return a;
  }
  sync(players, selfId) {
    this.selfId = selfId;
    const wanted = new Set();
    for (const p of players) {
      wanted.add(p.id);
      let a = this.players.get(p.id);
      if (a && a.role !== p.role) {
        this.remove(p.id);
        a = null;
      }
      a ??= this.create(p);
      a.target = p;
    }
    for (const [id] of this.players) if (!wanted.has(id)) this.remove(id);
  }
  update(dt, time, local) {
    for (const [id, a] of this.players) {
      const t = id === this.selfId ? { ...a.target, ...local } : a.target;
      if (id === this.selfId) a.group.position.set(t.x, t.y, t.z);
      else
        a.group.position.lerp(
          new THREE.Vector3(t.x, t.y, t.z),
          Math.min(1, dt * 14),
        );
      let angle = t.yaw - a.group.rotation.y;
      angle = Math.atan2(Math.sin(angle), Math.cos(angle));
      a.group.rotation.y += angle * Math.min(1, dt * 14);

      // Đầu gật lên/xuống theo góc nhìn chuột như Minecraft
      if (a.head) {
        const targetPitch = (t.pitch || 0) * 0.75;
        a.head.rotation.x = THREE.MathUtils.lerp(
          a.head.rotation.x,
          targetPitch,
          Math.min(1, dt * 15),
        );
      }
      const distance = Math.hypot(
          t.x - a.previous.x,
          t.z - a.previous.z,
        ),
        walking = distance > 0.0005;
      if (walking) {
        a.phase += distance * 6.5;
        // Phong cách Minecraft chuẩn: thân mình giữ thẳng đứng, không lắc lư hay nhún nhảy
        a.group.position.y = t.y;
        a.group.rotation.z = 0;

        // Vung chân gọn gàng, dứt khoát chuẩn Minecraft (~28 độ)
        const legSwing = Math.sin(a.phase) * 0.48;
        a.legs[0].rotation.x = legSwing;
        a.legs[1].rotation.x = -legSwing;

        // Tay trái vung ngược pha với chân trái chuẩn Minecraft
        a.arms[0].rotation.x = -legSwing;
        a.arms[0].rotation.z = 0;

        if (a.role === "host") {
          // Tay phải giương cờ Tổ quốc DỌC THẲNG ĐỨNG vươn về phía trước ngực
          a.arms[1].rotation.x = 0.85;
          a.arms[1].rotation.y = 0;
          a.arms[1].rotation.z = -0.12;
        } else {
          // Sinh viên FPT cầm cờ nhỏ cầm tay phía trước, đung đưa nhẹ theo nhịp bước chân
          a.arms[1].rotation.x = 0.45 + legSwing * 0.18;
          a.arms[1].rotation.y = 0;
          a.arms[1].rotation.z = -0.08;
        }
      } else {
        // Đứng yên: thả lỏng dần về tư thế đứng ban đầu
        a.group.position.y = t.y;
        a.group.rotation.z = 0;
        a.legs[0].rotation.x = THREE.MathUtils.lerp(a.legs[0].rotation.x, 0, Math.min(1, dt * 10));
        a.legs[1].rotation.x = THREE.MathUtils.lerp(a.legs[1].rotation.x, 0, Math.min(1, dt * 10));
        a.arms[0].rotation.x = THREE.MathUtils.lerp(a.arms[0].rotation.x, 0, Math.min(1, dt * 10));
        a.arms[0].rotation.z = THREE.MathUtils.lerp(a.arms[0].rotation.z, 0, Math.min(1, dt * 10));
        if (a.role === "host") {
          a.arms[1].rotation.x = 0.85;
          a.arms[1].rotation.z = -0.12;
          a.arms[1].rotation.y = 0;
        } else {
          a.arms[1].rotation.x = THREE.MathUtils.lerp(a.arms[1].rotation.x, 0.45, Math.min(1, dt * 10));
          a.arms[1].rotation.z = THREE.MathUtils.lerp(a.arms[1].rotation.z, -0.08, Math.min(1, dt * 10));
          a.arms[1].rotation.y = 0;
        }
      }
      a.previous.set(t.x, t.y, t.z);
      if (a.flag) {
        const isMini = a.role === "student";
        const pos = a.flag.geometry.attributes.position;
        const flutter = walking ? 0.007 : 0.004;
        const amp = isMini ? 0.035 : (walking ? 0.095 : 0.075);
        const refX = isMini ? 0.20 : 0.575;
        const freq = isMini ? 14 : 7;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i) + refX;
          pos.setZ(i, (Math.sin(x * freq - time * flutter) * amp * x) / refX);
        }
        pos.needsUpdate = true;
        a.flag.geometry.computeVertexNormals();
      }
    }
  }
  setSelfVisible(value) {
    const a = this.players.get(this.selfId);
    if (a) a.group.visible = value;
  }
  remove(id) {
    const a = this.players.get(id);
    if (!a) return;
    this.scene.remove(a.group);
    a.dispose();
    a.labelTexture.dispose();
    a.label.material.dispose();
    this.players.delete(id);
  }
  clear() {
    for (const id of this.players.keys()) this.remove(id);
  }
}
export function renderCharacterPreviews() {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(150, 165);
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight("#fff4db", "#76826a", 2.5));
  const light = new THREE.DirectionalLight("#ffffff", 2);
  light.position.set(3, 6, -5);
  scene.add(light);
  const camera = new THREE.PerspectiveCamera(35, 150 / 165, 0.1, 20);
  camera.position.set(2.1, 1.8, -4);
  camera.lookAt(0.2, 1.3, 0);
  const result = {};
  for (const role of ["host", "student"]) {
    const a = createCharacter(role);
    scene.add(a.group);
    renderer.render(scene, camera);
    result[role] = renderer.domElement.toDataURL("image/png");
    scene.remove(a.group);
    a.dispose();
  }
  renderer.dispose();
  renderer.forceContextLoss();
  return result;
}
