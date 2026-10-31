import { LANDMARKS } from "./landmarks.mjs";
import { mausoleumExterior, governmentExterior } from "./facades.mjs";
import { makePagoda, makeDrum } from "./exhibits.mjs";
import { makeTankExhibit } from "./tank-exhibit.mjs";

// Các cấu kiện dùng chung cho hiển thị và va chạm, đơn vị mét trong bản mô phỏng.
// Bố trí phòng được rút gọn để tham quan, không phải bản vẽ hoàn công.
const MAUS_SOURCE =
  "https://btllang.bqp.vn/tin-tuc/tin-tu-bo-tu-lenh-lang/4157-y-nghia-chinh-tri-van-hoa-cua-cong-trinh-lang-va-viec-phat-huy-y-nghia-chinh-tri-van-hoa-cua-cong-trinh-lang-trong-giai-doan-moi.html";
const PALACE_SOURCE =
  "https://dinhdoclap.gov.vn/anh-dinh-doc-lap-noi-luu-giu-dau-an-sau-50-nam-giai-phong/";
const GOV_SOURCE =
  "https://baochinhphu.vn/thu-tuong-chu-tri-phien-hop-chinh-phu-thuong-ky-thang-4-voi-nhieu-noi-dung-quan-trong-102240504081250822.htm";

function makeBuilding(l) {
  const b = { ...l, parts: [], labels: [], rooms: [], lights: [], chandeliers: [], doors: [] };
  b.door = (x, y, z, width, height, depth, kind = "double") => {
    b.doors.push({
      position: [l.x + x, y, l.z + z * l.front],
      width,
      height,
      depth,
      front: l.front,
      kind,
    });
  };
  b.chandelier = (x, top, z, width, height) => {
    b.chandeliers.push({
      position: [l.x + x, top - height, l.z + z * l.front],
      width, height, rotationY: l.front === -1 ? Math.PI : 0,
    });
    // Keep a simple fixture visible until the imported model has loaded.
    b.add(x, top - height * 0.25, z, 0.035, height * 0.25, 0.035, "bronze", false);
    b.parts.at(-1).model = "chandelier";
    b.add(x, top - height, z, width, height * 0.75, width, "lamp", false, "sphere");
    b.parts.at(-1).model = "chandelier";
  };
  b.add = (
    x,
    y,
    z,
    w,
    h,
    d,
    mat = "stone",
    solid = true,
    shape = "box",
    rotation = 0,
  ) => {
    const part = {
      position: [l.x + x, y + h / 2, l.z + z * l.front],
      size: [w, h, d],
      mat,
      solid,
      shape,
      rotationY: rotation * l.front,
      front: l.front,
    };
    if (solid) {
      const c = Math.abs(Math.cos(rotation)),
        s = Math.abs(Math.sin(rotation)),
        rw = w * c + d * s,
        rd = d * c + w * s;
      part.bounds = [
        part.position[0] - rw / 2,
        y,
        part.position[2] - rd / 2,
        part.position[0] + rw / 2,
        y + h,
        part.position[2] + rd / 2,
      ];
    }
    b.parts.push(part);
    return part;
  };
  b.label = (text, x, y, z, width = 5, height = 0.6, kind = "sign") =>
    b.labels.push({
      text,
      position: [l.x + x, y, l.z + z * l.front],
      width,
      height,
      rotationY: l.front === 1 ? 0 : Math.PI,
      kind,
    });
  b.room = (id, name, x0, z0, x1, z1, floor, description, source) =>
    b.rooms.push({
      id,
      name,
      bounds: [
        l.x + x0,
        floor - 0.25,
        Math.min(l.z + z0 * l.front, l.z + z1 * l.front),
        l.x + x1,
        floor + 5.6,
        Math.max(l.z + z0 * l.front, l.z + z1 * l.front),
      ],
      description,
      source,
      spawn: {
        x: l.x + (x0 + x1) / 2,
        y: floor + 0.025,
        z: l.z + (z1 - 1.6) * l.front,
        yaw: l.front === 1 ? 0 : Math.PI,
      },
    });
  b.steps = (x, z, width, rise, count = 6, run = 0.55, base = 3) => {
    for (let i = 0; i < count; i++)
      b.add(
        x,
        base,
        z + (count - i - 0.5) * run,
        width,
        (rise * (i + 1)) / count,
        run,
        "granite",
      );
  };
  b.light = (x, y, z, color = "#fff1d9", intensity = 20) =>
    b.lights.push({
      position: [l.x + x, y, l.z + z * l.front],
      color,
      intensity,
    });
  return b;
}
function chair(b, x, y, z, rotation = 0, mat = "upholstery") {
  const add = (dx, dy, dz, w, h, d, m, solid = false) => {
    const c = Math.cos(rotation),
      s = Math.sin(rotation);
    b.add(
      x + dx * c + dz * s,
      y + dy,
      z - dx * s + dz * c,
      w,
      h,
      d,
      m,
      solid,
      "box",
      rotation,
    );
  };
  // Tỷ lệ thu gọn 1.5 vừa vặn với tầm vóc người thực
  add(0, 0.38, 0, 0.48, 0.10, 0.48, mat, true);
  add(0, 0.48, 0.20, 0.48, 0.54, 0.10, mat, true);
  for (const dx of [-0.19, 0.19])
    for (const dz of [-0.19, 0.19]) add(dx, 0, dz, 0.05, 0.38, 0.05, "wood");
  for (const dx of [-0.25, 0.25]) add(dx, 0.52, 0, 0.05, 0.05, 0.40, "wood");
}
function table(b, x, y, z, w, d, mat = "walnut") {
  b.add(x, y + 0.68, z, w, 0.08, d, mat);
  const legX = Math.max(0.08, w / 2 - 0.12);
  const legZ = Math.max(0.08, d / 2 - 0.12);
  for (const dx of [-legX, legX])
    for (const dz of [-legZ, legZ])
      b.add(x + dx, y, z + dz, 0.08, 0.68, 0.08, "wood", false);
}
function sofa(b, x, y, z, rotation = 0, mat = "upholstery") {
  // Sofa thu gọn tỷ lệ 1.5 (dài ~1.95m thay vì 2.9m)
  b.add(x, y + 0.10, z, 1.95, 0.42, 0.72, mat, true, "box", rotation);
  const dx = Math.sin(rotation) * 0.30,
    dz = Math.cos(rotation) * 0.30;
  b.add(x + dx, y + 0.52, z + dz, 1.95, 0.52, 0.14, mat, true, "box", rotation);
  for (const side of [-1, 1])
    b.add(
      x + Math.cos(rotation) * side * 0.94,
      y + 0.40,
      z - Math.sin(rotation) * side * 0.94,
      0.12,
      0.42,
      0.74,
      "wood",
      false,
      "box",
      rotation,
    );
}
function stairFlight(b, x, base, startZ, rise = 6, mat = "marble", railMat = "wood") {
  // Chiều rộng bậc thang thu gọn từ 3.2m xuống 2.2m (tỷ lệ 1.5)
  for (let i = 0; i < 24; i++)
    b.add(
      x,
      base + (i * rise) / 24,
      startZ - (i + 0.5) * 0.5,
      2.2,
      rise / 24,
      0.5,
      mat,
    );
  // Lan can chéo nghiêng liên tục chạy suốt nhịp cầu thang, khớp hoàn toàn độ dốc bậc
  const angle = Math.atan2(rise, 12);
  const L = Math.hypot(12, rise);
  for (const side of [-1, 1]) {
    const rx = x + side * 1.15;
    // Tay vịn gỗ vát nghiêng liên tục chạy đúng độ dốc
    const handrail = b.add(
      rx,
      base + rise / 2 + 0.88,
      startZ - 6,
      0.08,
      0.06,
      L,
      railMat,
      false,
    );
    handrail.rotationX = angle;

    // Thanh dầm đáy lan can song song với tay vịn
    const bottomRail = b.add(
      rx,
      base + rise / 2 + 0.08,
      startZ - 6,
      0.05,
      0.04,
      L,
      railMat === "darkwood" ? "darkwood" : "bronze",
      false,
    );
    bottomRail.rotationX = angle;

    // Nan chắn đứng bằng đồng trên từng bậc thang
    for (let i = 0; i < 24; i++) {
      const z = startZ - (i + 0.5) * 0.5;
      const y = base + (i * rise) / 24;
      b.add(rx, y, z, 0.032, 0.86, 0.032, railMat === "darkwood" ? "darkwood" : "bronze", false);
    }

    // Trụ đề-ba chân cầu thang
    b.add(rx, base, startZ - 0.25, 0.12, 1.05, 0.12, "darkwood", false);
    b.add(rx, base + 1.08, startZ - 0.25, 0.16, 0.16, 0.16, "bronze", false, "sphere");

    // Trụ đề-ba chiếu nghỉ đỉnh cầu thang
    b.add(rx, base + rise, startZ - 11.75, 0.12, 1.05, 0.12, "darkwood", false);
    b.add(rx, base + rise + 1.08, startZ - 11.75, 0.16, 0.16, 0.16, "bronze", false, "sphere");

    // Thành chắn va chạm vô hình hai bên: ngăn tuyệt đối không thể rơi khỏi cầu thang
    b.add(
      x + side * 1.25,
      base,
      startZ - 6,
      0.25,
      rise + 2.5,
      12,
      "marble",
      true,
      "collision",
    );
  }
}
function upperSlab(b, y, width, depth, stairX) {
  const x0 = -width / 2,
    x1 = width / 2,
    a = stairX - 1.9,
    c = stairX + 1.9;
  b.add((x0 + a) / 2, y, 0, a - x0, 0.26, depth, "marble");
  b.add((c + x1) / 2, y, 0, x1 - c, 0.26, depth, "marble");
  b.add(stairX, y, (-depth / 2 - 4) / 2, 3.8, 0.26, depth / 2 - 4, "marble");
  b.add(stairX, y, (8 + depth / 2) / 2, 3.8, 0.26, depth / 2 - 8, "marble");

  // Lan can an toàn tầng trên dọc giếng thang: chống rơi xuống giếng thang từ bên sàn
  b.add(stairX + 1.9, y + 0.88, 2, 0.08, 0.06, 12, "wood", false);
  b.add(stairX + 1.9, y + 0.08, 2, 0.05, 0.04, 12, "bronze", false);
  for (let z = -3.5; z <= 7.5; z += 1.0)
    b.add(stairX + 1.9, y, z, 0.032, 0.86, 0.032, "bronze", false);
  b.add(stairX + 1.9, y, 2, 0.25, 2.5, 12, "marble", true, "collision");
}
function ceiling(b, y, w, d) {
  b.add(0, y, 0, w, 0.22, d, "ivory");
  for (let x = -w / 2 + 2; x < w / 2; x += 4)
    for (let z = -d / 2 + 2; z < d / 2; z += 4)
      b.add(x, y - 0.045, z, 1.4, 0.04, 0.4, "lamp", false);
}
function makeMausoleum(l) {
  const b = makeBuilding(l),
    f = 4.2;
  mausoleumExterior(b, f);
  b.add(-12.8, f, 0, 0.5, 10.2, 24, "marble");
  b.add(12.8, f, 0, 0.5, 10.2, 24, "marble");
  b.add(0, f, -12, 26, 0.0 + 10.2, 0.5, "marble");
  for (const side of [-1, 1])
    b.add(side * 7.9, f, 12, 10.2, 10.2, 0.55, "redstone");
  b.add(0, 8.5, 12, 5.6, 5.9, 0.55, "redstone");
  for (const x of [-2.95, 2.95])
    b.add(x, f, 12.45, 0.18, 4.3, 1.5, "wood", false);
  b.add(0, f, 6, 16, 7, 0.4, "redstone");
  b.label(
    "KHÔNG CÓ GÌ QUÝ HƠN ĐỘC LẬP, TỰ DO",
    0,
    8.1,
    6.22,
    13,
    0.9,
    "gold-quote",
  );
  b.label("LỐI VÀO PHÒNG VIẾNG  →", 5, 6.3, 6.22, 5, 0.4);
  b.add(0, 11.2, -3, 25.5, 0.22, 17.6, "ceiling");
  for (let x = -11; x <= 11; x += 2.2)
    b.add(x, 10.8, -3, 0.06, 0.35, 17.5, "darkwood", false);
  for (let z = -10; z <= 4; z += 2.2)
    b.add(0, 10.8, z, 25.4, 0.35, 0.06, "darkwood", false);
  for (const x of [-12.48, 12.48])
    b.add(x, 10, -3, 0.08, 0.55, 17.5, "blackmarble", false);
  b.add(0, 10, -11.7, 25, 0.55, 0.08, "blackmarble", false);

  // 1. Bệ đá hoa cương tam cấp trang nghiêm đỡ quan tài kính Chủ tịch Hồ Chí Minh
  b.add(0, f, -3, 4.6, 0.50, 5.6, "blackmarble");
  b.add(0, f + 0.50, -3, 3.6, 0.35, 4.6, "granite");
  b.add(0, f + 0.85, -3, 2.6, 0.25, 3.8, "blackmarble");

  // Đệm nhung đỏ trang nghiêm nâng đỡ thi hài
  b.add(0, 5.10, -3, 2.05, 0.16, 3.35, "carpet", false);

  // 2. Hòm kính pha lê trong suốt với viền bệ đáy và 4 cột góc mạ đồng thếp vàng (nắp kính trong suốt nhìn rõ thi hài)
  b.add(0, 5.30, -3, 2.15, 1.05, 3.5, "glass");
  b.add(0, 4.78, -3, 2.20, 0.05, 3.55, "bronze", false);
  for (const gx of [-1.08, 1.08]) {
    for (const gz of [-1.75, 1.75]) {
      b.add(gx, 5.30, -3 + gz, 0.06, 1.05, 0.06, "bronze", false);
    }
  }

  // 3. Thi hài Bác Hồ yên nghỉ thanh thản trong bộ quần áo trắng giản dị trang nghiêm
  b.add(0, 5.35, -3, 0.78, 0.42, 1.95, "whiteUniform", false, "restingPresident");

  // 4. Bốn chiến sĩ Tiêu binh canh gác mặc quân phục màu xanh của Quân đội nhân dân Việt Nam
  for (const x of [-1.65, 1.65]) {
    for (const z of [-4.6, -1.4]) {
      b.add(x, f + 0.50, z, 0.52, 1.80, 0.52, "armyUniform", false, "honorGuard");
    }
  }

  // Nguồn sáng ấm trang nghiêm, êm dịu chiếu rọi bục kính
  b.light(0, 8.8, -3, "#fff1d2", 38);

  // Hàng rào đồng 4 mặt bảo vệ trang nghiêm 4 góc quanh bệ kính trung tâm
  for (const x of [-3.65, 3.65]) {
    b.add(x, f, -3, 0.08, 1.1, 8.2, "bronze", true, "collision");
    b.add(x, f + 1.05, -3, 0.055, 0.055, 8.2, "bronze", false);
    for (let z = -7.1; z <= 1.1; z += 1)
      b.add(x, f, z, 0.07, 1.1, 0.07, "bronze", false);
  }
  for (const z of [-7.1, 1.1]) {
    b.add(0, f, z, 7.3, 1.1, 0.08, "bronze", true, "collision");
    b.add(0, f + 1.05, z, 7.3, 0.055, 0.055, "bronze", false);
    for (let x = -3.5; x <= 3.5; x++)
      b.add(x, f, z, 0.055, 1.1, 0.055, "bronze", false);
  }
  b.label("national-flag", 3.1, 8.5, -11.68, 4, 2.65, "national-flag");
  b.label("party-flag", -3.1, 8.5, -11.68, 4, 2.65, "party-flag");

  // Ngoại thất Lăng Bác (Quảng trường Ba Đình):
  // Thảm đỏ lễ tân trang nghiêm từ cửa chính Lăng trải dài xuống các bậc thềm
  b.add(0, 4.22, 15.5, 3.4, 0.02, 7.0, "carpet", false);
  b.add(0, 3.02, 22.5, 3.4, 0.02, 7.0, "carpet", false);

  // Đôi Tiêu binh đứng nghiêm trang gác hai bên thảm đỏ tại cửa Lăng
  b.add(-2.4, f, 12.4, 0.52, 1.80, 0.52, "armyUniform", false, "honorGuard");
  b.add(2.4, f, 12.4, 0.52, 1.80, 0.52, "armyUniform", false, "honorGuard");

  // Hai vòng hoa kính viếng Bác "ĐỜI ĐỜI NHỚ ƠN CHỦ TỊCH HỒ CHÍ MINH VĨ ĐẠI" trên thềm Lăng
  for (const side of [-1, 1]) {
    const wx = side * 5.2, wz = 14.5;
    b.add(wx, f, wz, 0.08, 1.8, 0.08, "wood", false);
    b.add(wx, f + 0.95, wz + 0.05, 1.45, 1.45, 0.18, "greenery", false, "sphere");
    b.add(wx, f + 0.95, wz + 0.12, 1.15, 1.15, 0.15, "flower", false, "sphere");
    b.add(wx, f + 0.95, wz + 0.20, 1.5, 0.28, 0.05, "carpet", false);
  }

  // Chậu cây cảnh / hoa sứ cắt tỉa bon-sai hai bên bậc thềm đá hoa cương
  for (const side of [-1, 1]) {
    const px = side * 8.5, pz = 18.5;
    b.add(px, 3, pz, 1.2, 0.6, 1.2, "granite");
    b.add(px, 3.6, pz, 1.5, 1.2, 1.5, "greenery", false, "sphere");
  }

  b.room(
    "vestibule",
    "Sảnh vào Lăng",
    -12,
    6.5,
    12,
    12,
    f,
    "Tường đá đỏ và dòng chữ mạ vàng dẫn vào không gian viếng. Bố trí lối đi được rút gọn trong mô hình.",
    MAUS_SOURCE,
  );
  b.room(
    "memorial",
    "Phòng viếng Chủ tịch Hồ Chí Minh",
    -12,
    -11.7,
    12,
    5.5,
    f,
    "Đá cẩm thạch màu ngà, bệ đá đen, hai lá cờ và lối đi quanh ba phía được mô phỏng từ tư liệu Ban Quản lý Lăng.",
    MAUS_SOURCE,
  );
  b.rooms.at(-1).spawn = { x: l.x + 9, y: f + 0.025, z: l.z + 3, yaw: 0 };
  b.light(0, 9, 9, "#ffdfb2", 18);
  b.light(-7, 9, -3, "#fff2d7", 26);
  b.light(7, 9, -3, "#fff2d7", 26);
  return b;
}
function makePalace(l) {
  const b = makeBuilding(l),
    f = 4;
  b.add(0, 3, 0, 63, 1, 29, "granite");
  // Thềm sảnh đón đỡ hệ cột mái hiên Dinh Độc Lập
  b.add(0, 3, 17, 24, 1, 5, "granite");
  for (const x of [-9.5, 9.5]) {
    b.add(x, 3, 17.4, 0.9, 1, 0.9, "granite");
    b.add(x, f, 17.4, 0.45, 5.7, 0.45, "ivory");
  }
  b.steps(0, 19.5, 14, 1, 5, 0.5);
  for (let floor = 0; floor < 3; floor++) {
    const y = f + floor * 6;
    if (floor) upperSlab(b, y - 0.26, 60, 28, -25);
    b.add(0, y, -14, 60, 5.7, 0.32, "ivory");
    for (const x of [-30, 30]) {
      b.add(x, y, 0, 0.32, 0.6, 28, "ivory");
      b.add(x, y + 5.2, 0, 0.32, 0.5, 28, "ivory");
      for (let z = -12; z <= 12; z += 4)
        b.add(x, y, z, 0.32, 5.7, 0.3, "ivory");
      for (let z = -10; z <= 10; z += 4)
        b.add(x, y + 0.6, z, 0.055, 4.6, 3.7, "window");
    }
    for (const z of [-14, 14])
      for (let x = -28.5; x < 30; x += 3) {
        if (z === 14 && floor === 0 && Math.abs(x) < 4) continue;
        b.add(x, y + 0.6, z, 2.72, 4.7, 0.055, "window");
        b.add(x - 1.45, y, z, 0.12, 5.7, 0.18, "ivory");
      }
    if (floor === 2) b.add(0, y + 5.7, 0, 63, 0.3, 30, "ivory");
    else {
      for (const z of [-14.7, 14.7])
        b.add(0, y + 5.7, z, 63, 0.3, 0.6, "ivory");
      for (const x of [-31.2, 31.2])
        b.add(x, y + 5.7, 0, 0.6, 0.3, 29, "ivory");
    }
    if (floor < 2) stairFlight(b, -25, y, 8, 6, "darkwood", "darkwood");
    for (const x of [-17, -8, 8, 17])
      b.add(x, y, 13.3, 0.42, 5.7, 0.42, "ivory");
    if (floor > 0) {
      for (let x = -29; x <= 29; x += 2.2)
        b.add(x, y, 15, 0.18, 5.6, 0.7, "ivory");
      for (const yy of [y + 1.15, y + 3.6])
        b.add(0, yy, 15, 60, 0.15, 0.65, "ivory");
    }
  }
  b.add(0, 9.7, 16.2, 22, 0.3, 5, "ivory");
  // Sảnh chính và thảm tròn Rồng thời Nguyễn (mô hình 3D thực tế thamr.glb)
  // Vòng rào chắn cọc đồng dây nhung đỏ bảo vệ thảm
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI * 2) / 16;
    const px = Math.cos(a) * 4.3;
    const pz = 8.5 + Math.sin(a) * 4.3;
    b.add(px, f, pz, 0.12, 0.68, 0.12, "bronze", false, "cylinder");
    b.add(px, f + 0.68, pz, 0.18, 0.18, 0.18, "bronze", false, "sphere");
    const nextA = ((i + 1) * Math.PI * 2) / 16;
    const nx = Math.cos(nextA) * 4.3;
    const nz = 8.5 + Math.sin(nextA) * 4.3;
    const midX = (px + nx) / 2;
    const midZ = (pz + nz) / 2;
    const ropeLen = Math.hypot(nx - px, nz - pz);
    const ropeAng = -Math.atan2(nz - pz, nx - px);
    b.add(midX, f + 0.52, midZ, ropeLen, 0.04, 0.04, "curtainRed", false, "box", ropeAng);
  }

  // Vách ngăn sảnh và phòng Khánh tiết
  for (const side of [-1, 1]) b.add(side * 11.5, f, 2.5, 15, 5.7, 0.3, "ivory");
  b.add(0, 7.8, 2.5, 8, 1.9, 0.3, "ivory");
  b.label("PHÒNG KHÁNH TIẾT", 0, 7.3, 2.68, 6, 0.65);
  b.add(0, f + 0.01, -4.7, 34, 0.025, 13.5, "carpet", false);

  // Phông rèm nhung đỏ toàn cảnh và sân khấu trang trọng Phòng Khánh tiết (ảnh thực tế)
  b.add(0, f, -13.6, 26, 5.7, 0.12, "curtainRed", false);
  b.add(0, f, -12.4, 20, 0.35, 2.6, "darkwood", true);
  b.add(0, f + 0.35, -12.5, 1.2, 1.1, 0.8, "darkwood");
  b.add(0, 5.45, -12.5, 0.95, 1.2, 0.7, "bronzeBust", false, "hoChiMinhBust");
  b.label("reception-party-flag", -3.6, f + 2.2, -12.5, 1.3, 0.9, "party-flag");
  b.label("reception-national-flag", 3.6, f + 2.2, -12.5, 1.3, 0.9, "national-flag");
  for (let i = 0; i < 10; i++) {
    b.add(-0.8 + i * 0.18, 5.46, -12.0, 0.2, 0.22, 0.2, i % 2 ? "flower" : "greenery", false, "sphere");
  }
  // Rèm lụa vàng buông rủ hai bên cửa sổ lớn
  for (const z of [-10, -5, 0])
    for (const side of [-1, 1])
      b.add(side * 17.5, f + 0.5, z, 0.2, 5.0, 1.2, "drape", false);
  // Đèn chùm pha lê dọc lối đi thảm đỏ
  for (const z of [-9, -4, 1]) {
    b.chandelier(0, 9.65, z, 1.8, 1.3);
  }
  for (const x of [-9, 9])
    for (const z of [-8, -4, 0]) {
      sofa(b, x, f, z, x < 0 ? -Math.PI / 2 : Math.PI / 2, "brocade");
      table(b, x < 0 ? -6.9 : 6.9, f, z, 1.05, 1.05);
    }
  b.label(
    "VIỆT NAM QUỐC TỔ · Không gian trưng bày mô phỏng",
    0,
    7.5,
    -13.78,
    12,
    2.5,
    "landscape",
  );
  // Phòng Nội các ở cánh đông, cửa mở về sảnh.
  b.add(18.7, f, -7, 0.28, 5.7, 13, "woodpanel");
  b.add(18.7, f, 9, 0.28, 5.7, 10, "woodpanel");
  b.label("PHÒNG NỘI CÁC", 24.5, 7.5, 13.8, 7, 0.6);
  b.add(24.3, f + 0.78, -2, 4.9, 0.18, 12, "lightwood", false, "ovalTable");
  for (let i = 0; i < 20; i++) {
    const a = (i * Math.PI) / 10,
      x = 24.3 + 1.85 * Math.cos(a),
      z = -2 + 5.15 * Math.sin(a);
    b.add(
      x,
      f + 0.78,
      z,
      1.2,
      0.18,
      1.85,
      "wood",
      true,
      "collision",
      -Math.atan2(5.15 * Math.sin(a), 1.85 * Math.cos(a)),
    );
  }
  for (const x of [22.6, 26])
    for (const z of [-6, 2]) b.add(x, f, z, 0.1, 0.78, 0.1, "bronze", false);
  for (let z = -12; z <= 12; z += 4)
    b.add(29.7, f + 0.65, z, 0.16, 4.7, 0.5, "drape", false);
  for (const x of [21.6, 27])
    for (let z = -7; z <= 3; z += 2)
      chair(b, x, f, z, x < 24 ? -Math.PI / 2 : Math.PI / 2, "leather");

  // Đèn chùm Phòng Nội các; dãy đèn sảnh chính đã được đặt ở trên.
  for (const z of [-8, -3, 1])
    b.chandelier(24.3, 9.65, z, 1.6, 1.3);
  for (const x of [-17.7, 17.7]) {
    b.add(x, 9.2, -4.7, 0.25, 0.35, 13.5, "woodpanel", false);
    for (const z of [-10, -5, 0])
      b.add(x, 4, z, 0.3, 5.2, 0.3, "woodpanel", false);
  }
  // Tầng 2 & 3: Không gian tiếp khách và Phòng Trình Quốc thư
  for (const y of [10, 16]) {
    for (const x of [-18, 18]) {
      if (y !== 16) {
        b.add(x, y, -7, 0.25, 5.7, 13, "ivory");
        b.add(x, y, 9, 0.25, 5.7, 10, "ivory");
        continue;
      }
      // Phòng Đại yến có dãy cửa kính cao dọc hai vách dài.
      const side = Math.sign(x), centers = [-10.6, -5.3, 0, 5.3, 10.6];
      let cursor = -14;
      for (const z of centers) {
        const span = 3.8, start = z - span / 2, end = z + span / 2;
        // Ô số 5 khi đếm từ phải sang trái, cạnh cầu thang.
        const isStairOpening = x === -18 && z === -10.6;
        if (start > cursor)
          b.add(x, y, (cursor + start) / 2, 0.25, 5.7, start - cursor, "ivory");
        if (!isStairOpening) {
          b.add(x, y, z, 0.25, 0.45, span, "ivory");
          b.add(x, y + 5.1, z, 0.25, 0.6, span, "ivory");
          // Keep every other pane solid so players cannot walk through the glass.
          b.add(x - side * 0.16, y + 0.45, z, 0.06, 4.65, span, "window");
          for (const dz of [-1.84, 0, 1.84])
            b.add(x - side * 0.22, y + 0.45, z + dz, 0.07, 4.65, 0.07, "ivory", false);
          b.add(x - side * 0.22, y + 0.45, z, 0.08, 0.10, span + 0.12, "ivory", false);
          b.add(x - side * 0.22, y + 5.0, z, 0.08, 0.10, span + 0.12, "ivory", false);
        }
        cursor = end;
      }
      if (cursor < 14)
        b.add(x, y, (cursor + 14) / 2, 0.25, 5.7, 14 - cursor, "ivory");
      // Rèm vàng buộc gọn ở hai mép từng ô kính.
      for (const z of centers) {
        if (x === -18 && z === -10.6) continue;
        for (const offset of [-1.48, 1.48]) {
          b.add(x - side * 0.43, y + 0.42, z + offset, 0.18, 5.0, 0.72, "goldDrape", false);
          b.add(x - side * 0.50, y + 2.05, z + offset, 0.08, 0.07, 0.75, "curtainRed", false);
        }
        b.add(x - side * 0.40, y + 5.25, z, 0.22, 0.14, 4.0, "darkwood", false);
      }
      // Đèn tường đặt trên các trụ giữa cửa sổ.
      for (const z of [-8.0, -2.65, 2.65, 8.0]) {
        b.add(x - side * 0.42, y + 2.55, z, 0.08, 0.78, 0.24, "bronze", false);
        b.add(x - side * 0.49, y + 2.55, z, 0.10, 0.52, 0.18, "lamp", false);
      }
    }
  }
  // Thảm vàng hoàng gia Phòng Trình Quốc thư (chuẩn ảnh thực tế Dinh Độc Lập)
  b.add(0, 10 + 0.012, -4.7, 24, 0.02, 16, "goldCarpet", false);
  // Sàn thảm vàng phủ toàn bộ Phòng Đại yến.
  b.add(0, 16 + 0.01, 0, 34, 0.025, 26, "goldCarpet", false);

  for (const x of [-7, 7])
    for (const z of [-7, -3, 1]) {
      sofa(b, x, 10, z, x < 0 ? -Math.PI / 2 : Math.PI / 2);
      table(b, x < 0 ? -4.8 : 4.8, 10, z, 1.1, 1.1);
    }
  b.label("PHÒNG TRÌNH QUỐC THƯ", 0, 13.8, 10, 9, 0.6);
  b.label(
    "BÌNH NGÔ ĐẠI CÁO · Nguyễn Văn Minh (1966)",
    0,
    13.3,
    -13.77,
    15.6,
    4.2,
    "lacquer",
  );

  // Bàn và ghế chủ tọa sơn mài thếp vàng của Tổng thống trước bức tranh Bình Ngô Đại Cáo (ảnh thực tế)
  table(b, 0, 10, -10.5, 3.4, 1.5, "walnut");
  chair(b, 0, 10, -11.7, Math.PI, "leather");
  b.add(0, 10 + 0.76, -10.5, 0.45, 0.08, 0.28, "goldLeaf", false);

  // Bàn trà thấp và đôi ghế đón khách ngoại giao trước bàn chủ tọa hướng vào bàn
  table(b, 0, 10, -7.5, 2.2, 0.9, "walnut");
  chair(b, -1.8, 10, -7.5, -Math.PI / 2, "brocade");
  chair(b, 1.8, 10, -7.5, Math.PI / 2, "brocade");

  // Đôi lộc bình vàng hoàng gia chầu hai bên bức tranh sơn mài
  for (const side of [-1, 1]) {
    b.add(side * 8.6, 10, -13.2, 0.55, 1.8, 0.55, "bronze", false, "cylinder");
    b.add(side * 8.6, 11.8, -13.2, 0.4, 0.55, 0.4, "bronze", false, "sphere");
  }

  // Rèm lụa vàng buông rủ hai bên cửa sổ lớn
  for (const z of [-10, -5, 0])
    for (const side of [-1, 1])
      b.add(side * 17.5, 10 + 0.5, z, 0.2, 5.0, 1.2, "drape", false);

  // Đèn chùm pha lê tráng lệ giữa phòng Trình Quốc thư
  b.chandelier(0, 15.65, -5.0, 2.0, 1.4);
  b.light(0, 14.2, -5.0, "#fff5da", 28);
  table(b, 24, 10, -4, 3, 1.6);
  chair(b, 24, 10, -5.2, Math.PI, "leather");
  chair(b, 23.2, 10, -2.8, 0, "leather");
  chair(b, 24.8, 10, -2.8, 0, "leather");
  sofa(b, 24, 10, 5);
  b.label("PHÒNG LÀM VIỆC", 24, 13, 13.8, 8, 0.6);
  // Phòng Đại yến: bàn hội nghị dài, một dãy ghế bọc nâu ở mỗi bên.
  const banquetTableZ = -0.35;
  table(b, 0, 16, banquetTableZ, 3.0, 17.4, "walnut");
  for (const z of [-7.8, -3.9, 0, 3.9, 7.8])
    for (const x of [-1.22, 1.22])
      b.add(x, 16, banquetTableZ + z, 0.14, 0.68, 0.14, "darkwood", false);
  for (const x of [-1.42, 1.42])
    b.add(x, 16.22, banquetTableZ, 0.09, 0.28, 16.9, "darkwood", false);
  for (const side of [-1, 1]) {
    const chairX = side * 2.12;
    for (let i = 0; i < 11; i++) {
      const z = -8.1 + i * 1.62;
      chair(b, chairX, 16, z, side < 0 ? -Math.PI / 2 : Math.PI / 2, "banquetLeather");
    }
  }
  chair(b, 0, 16, -9.65, Math.PI, "banquetLeather");
  chair(b, 0, 16, 8.95, 0, "banquetLeather");

  // Bình hoa nhỏ ở giữa bàn dài.
  b.add(0, 16.76, banquetTableZ, 0.42, 0.12, 0.42, "porcelain", false, "cylinder");
  for (let i = 0; i < 7; i++) {
    const a = i * Math.PI * 2 / 7;
    b.add(Math.cos(a) * 0.18, 16.85 + (i % 2) * 0.06, banquetTableZ + Math.sin(a) * 0.18,
      0.16, 0.22, 0.16, i % 3 ? "flower" : "greenery", false, "sphere");
  }

  // Tủ gỗ thấp, tranh phong cảnh lớn ở đầu phòng.
  b.add(0, 16, -13.10, 12.2, 0.92, 0.90, "darkwood", false);
  b.add(0, 16.88, -13.10, 12.35, 0.10, 1.0, "lightwood", false);
  b.parts.at(-1).model = "banquetSideboardTop";
  for (let x = -5; x <= 5; x += 2) {
    b.add(x, 16.14, -12.63, 0.08, 0.60, 0.035, "bronze", false);
    b.add(x + 0.72, 16.44, -12.60, 0.08, 0.08, 0.06, "goldLeaf", false);
  }
  // The GLB includes its own frame AND both vases. Its lowest points are the
  // vase feet: rest them on the sideboard and preserve the scan's 3D proportions.
  b.add(0, 17.42, -13.50, 10.1, 2.82, 0.04, "darkwood", false);
  b.parts.at(-1).model = "banquetPaintingFallback";
  b.add(0, 16.98, -13.10, 10.1, 3.26, 0.79, "darkwood", false, "collision");
  b.parts.at(-1).model = "banquetPainting";

  // Tủ trưng bày và bình sứ xanh trắng đặt cân xứng dọc hai vách.
  for (const side of [-1, 1])
    for (const z of [-8, -2, 4, 10]) {
      const x = side * 13.35;
      b.add(x, 16, z, 1.45, 1.08, 0.95, "darkwood", false);
      b.add(x, 17.05, z, 1.52, 0.10, 1.02, "lightwood", false);
      b.add(x, 17.15, z, 0.68, 1.02, 0.68, "porcelain", false, "sphere");
      b.add(x, 18.12, z, 0.30, 0.42, 0.30, "porcelain", false, "cylinder");
      b.add(x, 18.50, z, 0.42, 0.10, 0.42, "porcelain", false, "cylinder");
      for (const y of [17.48, 17.93])
        b.add(x, y, z, 0.70, 0.045, 0.70, "porcelainBlue", false, "cylinder");
      for (const offset of [-0.20, 0, 0.20])
        b.add(x + offset, 17.56, z + side * 0.30, 0.035, 0.38, 0.035, "porcelainBlue", false);
    }

  b.label("PHÒNG ĐẠI YẾN", 0, 19.4, 11, 8, 0.7);
  // Ba đèn chùm nằm trên trục giữa căn phòng dài.
  for (const z of [-8, 0, 8]) {
    b.chandelier(0, 21.55, z, 2.25, 1.45);
    b.light(0, 20.6, z, "#fff4da", 28);
  }
  ceiling(b, 21.7, 60, 28);
  b.add(0, 22, 0, 26, 0.3, 14, "ivory");
  b.add(0, 22.3, -6.6, 25, 3.2, 0.3, "ivory");
  for (const x of [-12.5, 12.5]) b.add(x, 22.3, 0, 0.3, 3.2, 13, "ivory");
  b.add(0, 22.3, 6.6, 25, 3.2, 0.06, "window");
  b.add(0, 25.5, 0, 28, 0.35, 16, "ivory");
  // Cột cờ và Cờ Tổ quốc tung bay trên nóc Dinh Độc Lập
  b.add(0, 25.85, 0, 0.2, 8, 0.2, "bronze", false, "cylinder");
  b.add(0, 33.85, 0, 0.45, 0.45, 0.45, "bronze", false, "sphere");
  b.label("palace-roof-flag", 2.3, 32.1, 0, 4.4, 2.9, "national-flag");
  b.label("helipad", 21, 22.1, 0, 10, 10, "helipad");
  b.room(
    "reception",
    "Phòng Khánh tiết",
    -18,
    -12,
    18,
    2,
    4,
    "Không gian tiếp khách với thảm đỏ, các dãy ghế và tranh trang trí; mô hình rút gọn theo ảnh công khai của Di tích Dinh Độc Lập.",
    PALACE_SOURCE,
  );
  b.rooms.at(-1).spawn = { x: 60, y: 4.025, z: -47, yaw: 0 };
  b.room(
    "cabinet",
    "Phòng Nội các",
    19,
    -12,
    29,
    11,
    4,
    "Bàn họp gỗ và ghế hai bên gợi không gian Hội đồng Nội các trước năm 1975. Vị trí phòng trong bản đồ được rút gọn để tham quan.",
    PALACE_SOURCE,
  );
  b.room(
    "credentials",
    "Phòng Trình Quốc thư",
    -17,
    -12,
    17,
    11,
    10,
    "Phòng tiếp nhận quốc thư được gợi lại bằng dãy ghế tiếp khách, thảm và mảng trang trí sơn mài tự tạo; không sao chép nguyên tác mỹ thuật.",
    "https://dinhdoclap.gov.vn/kien-truc-dinh-doc-lap/",
  );
  b.room(
    "banquet",
    "Phòng Đại yến",
    -17,
    -13,
    17,
    13,
    16,
    "Phòng Đại yến mô phỏng theo ảnh tư liệu: bàn hội nghị dài ở giữa, ghế bọc nâu hai bên, thảm vàng, rèm vàng, tranh phong cảnh và ba đèn chùm.",
    PALACE_SOURCE,
  );
  for (const y of [8, 14, 20])
    for (const x of [-10, 10, 25]) b.light(x, y, -1, "#fff0d5", 35);
  return b;
}
function makeGovernment(l) {
  const b = makeBuilding(l),
    f = 4;
  b.add(0, 3, 0, 58, 1, 31, "granite");
  governmentExterior(b, f);
  for (let floor = 0; floor < 3; floor++) {
    const y = f + floor * 5;
    if (floor) upperSlab(b, y - 0.26, 56, 28, -24);
    b.add(0, y, -14, 56, 4.7, 0.35, "ochre");
    for (const x of [-28, 28]) b.add(x, y, 0, 0.35, 4.7, 28, "ochre");
    for (const side of [-1, 1])
      b.add(side * 16.1, y, 14, 23.8, 4.7, 0.35, "ochre");
    b.add(0, y + 3.5, 14, 8.4, 1.2, 0.35, "ochre");
    for (let x = -25; x <= 25; x += 5)
      for (const z of [-14.2, 14.22]) {
        if (z > 0 && Math.abs(x) < 5) continue;
        b.add(x, y + 1, z, 2, 2.6, 0.07, "window");
        b.add(x, y + 0.85, z, 2.3, 0.15, 0.35, "ivory", false);
        b.add(x, y + 3.6, z, 2.35, 0.18, 0.35, "ivory", false);
      }
    if (floor === 2) b.add(0, y + 4.7, 0, 58, 0.3, 30, "ivory");
    else {
      for (const z of [-14.7, 14.7])
        b.add(0, y + 4.7, z, 58, 0.3, 0.6, "ivory");
      for (const x of [-28.7, 28.7])
        b.add(x, y + 4.7, 0, 0.6, 0.3, 29, "ivory");
    }
    if (floor < 2) stairFlight(b, -24, y, 8, 5);
  }
  // Tường bao quanh phòng họp chính phủ khép kín hoàn chỉnh, không bị ngắt
  for (const x of [-17.5, 17.5]) {
    b.add(x, f, -4.2, 0.35, 4.7, 18.8, "woodpanel");
  }
  for (const side of [-1, 1]) {
    b.add(side * 10.5, f, 5.2, 14, 4.7, 0.35, "woodpanel");
    b.add(side * 3.4, f, 5.2, 0.25, 3.3, 0.45, "darkwood");
  }
  b.door(0, f, 5.2, 6.55, 3.25, 0.14, "meetingRoomDouble");
  b.add(0, 7.3, 5.2, 7, 1.4, 0.35, "woodpanel");
  b.label("PHÒNG HỌP CHÍNH PHỦ", 0, 6.9, 5.37, 9, 0.55);

  // Không gian nội thất phòng họp chữ U trang trọng Trụ sở Chính phủ
  b.add(0, f + 0.01, -2, 21, 0.025, 16, "carpet", false);

  // 1. Bàn chữ U liền mạch, tỉ lệ chuẩn trang nghiêm:
  // Bàn Chủ tọa (Thủ tướng & các Phó Thủ tướng) ở vị trí trung tâm
  table(b, 0, f, -7.2, 13.6, 1.4, "lightwood");
  // Yếm chắn chân bàn gỗ sang trọng phía trước
  b.add(0, f + 0.08, -6.55, 13.5, 0.60, 0.06, "lightwood", false);

  // 2. Hai dãy bàn cánh chữ U hai bên
  for (const side of [-1, 1]) {
    const wx = side * 6.1;
    table(b, wx, f, -1.0, 1.4, 11.0, "lightwood");
    b.add(wx - side * 0.65, f + 0.08, -1.0, 0.06, 0.60, 11.0, "lightwood", false);
  }

  // Ghế Chủ tọa (5 ghế bọc da trắng cao cấp phía sau bàn, cách mép 40cm chuẩn mực)
  for (const x of [-3.6, -1.8, 0, 1.8, 3.6]) {
    chair(b, x, f, -8.35, Math.PI, "whiteleather");
    // Thiết bị hội thảo đại biểu đặt chắc chắn ngay ngắn TRÊN MẶT BÀN (không lơ lửng)
    b.add(x, f + 0.74, -7.2, 0.36, 0.02, 0.24, "darkwood", false);
    b.add(x, f + 0.755, -7.2, 0.32, 0.008, 0.20, "screen", false);
    // Micro cổ ngỗng hội thảo
    b.add(x, f + 0.74, -7.38, 0.07, 0.015, 0.07, "bronze", false, "cylinder");
    b.add(x, f + 0.755, -7.38, 0.015, 0.20, 0.015, "bronze", false, "cylinder");
    b.add(x, f + 0.94, -7.36, 0.022, 0.035, 0.022, "bronze", false);
  }

  // Dãy ghế Đại biểu hai bên (mỗi bên 6 ghế, bố trí cách đều, khoảng cách sát mép bàn 40cm, không bị thừa)
  for (const side of [-1, 1]) {
    const seatX = side * 7.25;
    const tableUnitX = side * 6.1;
    for (let z = -5.0; z <= 3.0; z += 1.6) {
      chair(b, seatX, f, z, side < 0 ? -Math.PI / 2 : Math.PI / 2, "whiteleather");
      // Thiết bị hội thảo và micro đại biểu đặt vững chãi trên mặt bàn cánh
      b.add(tableUnitX, f + 0.74, z, 0.24, 0.02, 0.36, "darkwood", false);
      b.add(tableUnitX, f + 0.755, z, 0.20, 0.008, 0.32, "screen", false);
      // Micro cổ ngỗng đại biểu
      b.add(tableUnitX - side * 0.18, f + 0.74, z, 0.07, 0.015, 0.07, "bronze", false, "cylinder");
      b.add(tableUnitX - side * 0.18, f + 0.755, z, 0.015, 0.20, 0.015, "bronze", false, "cylinder");
      b.add(tableUnitX - side * 0.16, f + 0.94, z, 0.022, 0.035, 0.022, "bronze", false);
    }
  }

  // Phông nền và bục danh dự phòng họp theo thực tế Trụ sở Chính phủ
  b.add(0, f, -13.7, 34, 4.7, 0.15, "woodpanel", false);
  b.add(0, 6.7, -13.62, 11, 3.5, 0.08, "woodpanel", false);
  b.add(0, f, -12.3, 12, 0.18, 2.8, "carpet", false);

  // Khẩu hiệu Quốc hiệu trang trọng trên gờ tường cao, tuyệt đối không bị cờ hay tượng che khuất
  b.label("CHÍNH PHỦ NƯỚC CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", 0, 8.35, -13.55, 17, 0.62, "gov-title");

  // Quốc huy Việt Nam mạ vàng rực rỡ ở vị trí trung tâm phông hội trường theo ảnh thực tế
  b.label("gov-emblem", 0, 7.35, -13.56, 1.8, 1.8, "national-emblem");
  // Dòng chữ vàng "CHÍNH PHỦ" trang trọng ngay dưới Quốc huy
  b.label("CHÍNH PHỦ", 0, 6.25, -13.56, 3.8, 0.50, "gov-title");

  // Hộp đèn trần xuyên sáng lớn hiện đại theo ảnh thực tế phòng họp Chính phủ
  b.add(0, f + 4.62, -2.0, 18, 0.12, 14, "lamp", false);
  b.add(0, f + 4.58, -2.0, 18.6, 0.18, 14.6, "darkwood", false);

  // Chậu cây cảnh văn phòng trang trí xanh tươi 4 góc hội trường
  for (const x of [-16.0, 16.0]) {
    for (const z of [-12.0, 3.8]) {
      b.add(x, f, z, 0.70, 0.65, 0.70, "ivory", true);
      b.add(x, f + 0.65, z, 0.85, 0.85, 0.85, "greenery", false, "sphere");
      b.add(x, f + 1.25, z, 0.65, 0.75, 0.65, "greenery", false, "sphere");
    }
  }

  // Màn hình trình chiếu hai bên tường hội trường (chuẩn phòng họp lớn)
  b.add(-17.3, 6.5, -3.5, 0.08, 2.4, 4.5, "screen", false);
  b.add(17.3, 6.5, -3.5, 0.08, 2.4, 4.5, "screen", false);

  // Đôi cột cờ sàn trang trọng đứng hai bên bục Bác Hồ: Cờ Đảng bên trái, Cờ Tổ quốc bên phải
  // Đặt rộng hai bên (x = -4.6 và 4.6), đối xứng tôn nghiêm, không bao giờ đè vào chữ
  for (const [x, flagId, kind] of [
    [-4.6, "gov-party-flag", "party-flag"],
    [4.6, "gov-national-flag", "national-flag"],
  ]) {
    // Đế trụ cờ bằng đồng
    b.add(x, f + 0.18, -12.4, 0.38, 0.06, 0.38, "bronze", false, "cylinder");
    // Thân cột cờ bằng đồng mạ vàng cao 3.0m
    b.add(x, f + 0.21, -12.4, 0.045, 3.0, 0.045, "bronze", false, "cylinder");
    // Đỉnh chóp ngọn cờ
    b.add(x, f + 3.20, -12.4, 0.12, 0.14, 0.12, "bronze", false, "sphere");
    // Lá cờ treo phẳng phiu, ngay ngắn
    const flagX = x < 0 ? x - 0.70 : x + 0.70;
    b.label(flagId, flagX, f + 2.35, -12.38, 1.4, 0.95, kind);
  }

  // Bục gỗ và tượng 3D bán thân Bác Hồ đặt trang nghiêm, bám vững trên bục
  b.add(0, f + 0.18, -12.6, 1.3, 1.35, 0.85, "woodpanel");
  b.add(0, 5.53, -12.6, 1.05, 1.25, 0.75, "bronzeBust", false, "hoChiMinhBust");

  // Nguồn sáng ấm mềm mại tôn vinh tượng Bác và chiếu sáng rực rỡ toàn bộ phông nền
  b.light(0, 7.8, -10.8, "#fff1d0", 25);
  b.light(-5.5, 7.8, -10.5, "#fff1d0", 22);
  b.light(5.5, 7.8, -10.5, "#fff1d0", 22);

  // Bục phát biểu trước tượng Bác
  b.add(0, f + 0.18, -11.2, 0.85, 1.15, 0.65, "woodpanel");
  b.add(0, f + 1.33, -11.2, 1.0, 0.06, 0.75, "darkwood");

  // Dải hoa trang trí dưới chân bục tượng Bác
  for (let i = 0; i < 14; i++) {
    const x = -1.05 + i * 0.16;
    b.add(
      x,
      5.52,
      -12.05,
      0.22,
      0.28,
      0.26,
      i % 2 ? "flower" : "greenery",
      false,
      "sphere",
    );
  }
  for (const x of [-16, 16]) {
    sofa(b, x, f, 10);
    table(b, x, f, 8.3, 2.4, 1);
  }
  // Các tầng trên là không gian văn phòng làm việc mẫu và phòng tiếp khách Trụ sở Chính phủ
  for (const y of [9, 14]) {
    for (const x of [-17, 17]) b.add(x, y, -5, 0.25, 4.7, 17, "ivory");

    // Khu vực bàn làm việc lãnh đạo / chuyên viên cao cấp
    for (const x of [-10, 10]) {
      for (const z of [-6, 2]) {
        // Bàn làm việc gỗ óc chó cao cấp
        table(b, x, y, z, 2.6, 1.4, "walnut");
        // Ghế xoay lãnh đạo bọc da cao cấp quay mặt về phía bàn làm việc (rotation = Math.PI)
        chair(b, x, y, z - 0.95, Math.PI, "leather");
        // Một ghế khách đối diện bàn làm việc quay mặt vào bàn ngay ngắn, không thừa ghế
        chair(b, x, y, z + 0.95, 0, "upholstery");

        // Màn hình máy tính để bàn có chân đế đặt vững trên mặt bàn, quay về phía ghế lãnh đạo
        b.add(x, y + 0.76, z + 0.15, 0.24, 0.02, 0.18, "darkwood", false);
        b.add(x, y + 0.78, z + 0.15, 0.05, 0.20, 0.05, "bronze", false);
        b.add(x, y + 0.88, z + 0.15, 0.72, 0.42, 0.04, "screen", false);

        // Bàn phím máy tính ngay ngắn trước màn hình
        b.add(x, y + 0.75, z - 0.22, 0.46, 0.015, 0.16, "darkwood", false);
        // Khay tài liệu văn phòng phẩm
        b.add(x + 0.9, y + 0.75, z, 0.28, 0.06, 0.35, "ivory", false);

        // Tủ tài liệu gỗ lưu trữ hồ sơ phía sau bàn làm việc
        b.add(x, y, z - 3.2, 2.8, 2.3, 0.45, "darkwood", true);
        b.add(x, y + 0.85, z - 2.96, 2.6, 0.04, 0.04, "goldLeaf", false);

        // Chậu cây cảnh văn phòng tươi xanh
        const px = x < 0 ? x - 4.5 : x + 4.5;
        b.add(px, y, z, 0.55, 0.55, 0.55, "ivory", true);
        b.add(px, y + 0.55, z, 0.70, 0.80, 0.70, "greenery", false, "sphere");

        // Đèn trần văn phòng chiếu sáng ấm cúng
        b.add(x, y + 4.62, z, 2.8, 0.08, 2.0, "lamp", false);
        b.light(x, y + 4.2, z, "#fff8e7", 22);
      }
    }

    // Khu vực sofa tiếp khách trung tâm tầng
    b.add(0, y + 0.01, 8, 8, 0.02, 6, "carpet", false);
    sofa(b, 0, y, 10);
    table(b, 0, y, 8, 2.2, 1.1, "walnut");
    chair(b, -1.8, y, 8, -Math.PI / 2, "leather");
    chair(b, 1.8, y, 8, Math.PI / 2, "leather");
    b.add(-3.2, y, 10, 0.55, 0.55, 0.55, "ivory", true);
    b.add(-3.2, y + 0.55, 10, 0.70, 0.80, 0.70, "greenery", false, "sphere");
    b.add(3.2, y, 10, 0.55, 0.55, 0.55, "ivory", true);
    b.add(3.2, y + 0.55, 10, 0.70, 0.80, 0.70, "greenery", false, "sphere");
    b.add(0, y + 4.62, 8, 3.2, 0.08, 2.2, "lamp", false);
    b.light(0, y + 4.2, 8, "#fff8e7", 25);
  }
  b.room(
    "meeting",
    "Phòng họp Chính phủ · mô phỏng",
    -17,
    -13,
    17,
    5,
    4,
    "Bàn chữ U, ghế, màn hình và phông gỗ được thiết kế theo không khí ảnh họp công khai. Đây không phải sơ đồ hay nội thất đo đạc của trụ sở.",
    GOV_SOURCE,
  );
  b.room(
    "lobby",
    "Sảnh tiếp khách · mô phỏng",
    -27,
    5.5,
    27,
    13,
    4,
    "Sảnh, ghế tiếp khách và hành lang là bố trí minh họa để đi lại trong game, không khẳng định giống vị trí thực tế.",
    GOV_SOURCE,
  );
  b.room(
    "office",
    "Không gian làm việc · minh họa",
    -17,
    -12,
    17,
    12,
    9,
    "Phòng làm việc mẫu với bàn ghế và màn hình, được bố trí hư cấu phục vụ trải nghiệm tham quan.",
    GOV_SOURCE,
  );
  b.rooms.at(-1).spawn = {
    x: l.x + 5,
    y: 9.025,
    z: l.z + 8 * l.front,
    yaw: Math.PI,
  };
  for (const y of [7.8, 12.8, 17.8])
    for (const x of [-10, 10]) b.light(x, y, -1, "#fff0d8", 32);
  return b;
}
export const BUILDINGS = LANDMARKS.map((l) =>
  ({
    mausoleum: makeMausoleum,
    palace: makePalace,
    government: makeGovernment,
    pagoda: (l) => makePagoda(l, makeBuilding),
    drum: (l) => makeDrum(l, makeBuilding),
    tank: (l) => makeTankExhibit(l, makeBuilding),
  })[l.id](l),
);
export const ROOMS = BUILDINGS.flatMap((b) =>
  b.rooms.map((r) => ({ ...r, buildingId: b.id })),
);
function makeCollisionBarrier(x, y, z, w, h, d, id = "lotus-pier") {
  return {
    solid: true,
    shape: "collision",
    buildingId: id,
    position: [x, y, z],
    size: [w, h, d],
    bounds: [
      x - w / 2,
      y - h / 2,
      z - d / 2,
      x + w / 2,
      y + h / 2,
      z + d / 2,
    ],
  };
}

const LOTUS_PIER_BARRIERS = [
  // Lan can hai bên cầu gỗ dẫn ra giữa đầm sen (x=66, z=39..50) - cao 6m ngăn hoàn toàn nhảy hoặc rơi
  makeCollisionBarrier(64.75, 5.0, 44.5, 0.50, 6.0, 11.4),
  makeCollisionBarrier(67.25, 5.0, 44.5, 0.50, 6.0, 11.4),
  // Lan can chuyển tiếp mở rộng tại đầu chòi ngắm sen (z=50)
  makeCollisionBarrier(64.25, 5.0, 50.0, 1.20, 6.0, 0.50),
  makeCollisionBarrier(67.75, 5.0, 50.0, 1.20, 6.0, 0.50),
  // Lan can hai bên mép chòi ngắm sen (x=63.8 và x=68.2, z=50..54.3)
  makeCollisionBarrier(63.75, 5.0, 52.1, 0.50, 6.0, 4.6),
  makeCollisionBarrier(68.25, 5.0, 52.1, 0.50, 6.0, 4.6),
  // Lan can chắn mép trước mặt nước chòi ngắm sen (z=54.3)
  makeCollisionBarrier(66.00, 5.0, 54.3, 5.20, 6.0, 0.50),
];

// Vành đai an toàn viền quanh mép nước đầm sen (bán kính x=18, z=12 quanh tâm x=66, z=53),
// giữ an toàn tuyệt đối cho người tham quan, ngăn không rơi xuống lòng hồ
for (let i = 0; i < 24; i++) {
  const a = (i * Math.PI * 2) / 24;
  const bx = 66 + Math.cos(a) * 17.6;
  const bz = 53 + Math.sin(a) * 11.6;
  // Chừa đúng khoảng trống cửa vào cầu gỗ ngắm sen (x=66, z=39..41)
  if (Math.abs(bx - 66) < 2.2 && bz < 42.5) continue;
  LOTUS_PIER_BARRIERS.push(makeCollisionBarrier(bx, 4.0, bz, 4.8, 4.0, 4.8, "lotus-shore"));
}

export const SOLIDS = [
  ...BUILDINGS.flatMap((b) =>
    b.parts.filter((p) => p.solid).map((p) => ({ ...p, buildingId: b.id })),
  ),
  ...LOTUS_PIER_BARRIERS,
];
const spatial = new Map();
for (const p of SOLIDS) {
  const a = p.bounds;
  for (let cx = Math.floor(a[0] / 16); cx <= Math.floor(a[3] / 16); cx++)
    for (let cz = Math.floor(a[2] / 16); cz <= Math.floor(a[5] / 16); cz++) {
      const k = `${cx},${cz}`;
      if (!spatial.has(k)) spatial.set(k, []);
      spatial.get(k).push(p);
    }
}
export function nearbySolids(x, z) {
  return spatial.get(`${Math.floor(x / 16)},${Math.floor(z / 16)}`) || [];
}
export function findRoom(p) {
  return ROOMS.filter(
    (r) =>
      p.x > r.bounds[0] &&
      p.x < r.bounds[3] &&
      p.y > r.bounds[1] &&
      p.y < r.bounds[4] &&
      p.z > r.bounds[2] &&
      p.z < r.bounds[5],
  ).sort((a, b) => b.bounds[1] - a.bounds[1])[0];
}
export function isInsideBuilding(p) {
  return BUILDINGS.some(
    (b) =>
      !b.outdoor && Math.abs(p.x - b.x) < (b.id === "mausoleum" ? 13 : 30) &&
      Math.abs(p.z - b.z) < 14 &&
      p.y < 25,
  );
}
