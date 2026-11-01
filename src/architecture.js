import * as THREE from "three";
import { addModelInstances, MODEL_URLS } from "./models.js";
import { BUILDINGS } from "../shared/architecture.mjs";
import { makeMaterials, flagCanvas } from "./materials.js";
import { heritageMaterials, heritageGeometries } from "./heritage.js";
function roofGeometry(pediment = false) {
  const s = new THREE.Shape();
  s.moveTo(-0.5, 0);
  s.lineTo(0.5, 0);
  s.lineTo(0, 1);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false });
  g.translate(0, -0.5, -0.5);
  g.computeVertexNormals();
  return g;
}
function ovalTableGeometry() {
  const s = new THREE.Shape();
  s.absellipse(0, 0, 0.5, 0.5, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absellipse(0, 0, 0.23, 0.36, 0, Math.PI * 2, true);
  s.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: 1,
    bevelEnabled: false,
    curveSegments: 32,
  });
  g.rotateX(-Math.PI / 2);
  g.translate(0, -0.5, 0);
  return g;
}
function nationalEmblemCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const c = canvas.getContext("2d");
  c.clearRect(0, 0, 512, 512);

  const cx = 256, cy = 256, r = 236;

  // Vòng tròn nền đỏ son Quốc huy
  c.save();
  c.beginPath();
  c.arc(cx, cy, r, 0, Math.PI * 2);
  c.fillStyle = "#da251d";
  c.fill();

  // Vành viền vàng kim loại nhiều lớp
  c.strokeStyle = "#ffd54f";
  c.lineWidth = 14;
  c.stroke();
  c.strokeStyle = "#c59a38";
  c.lineWidth = 4;
  c.beginPath();
  c.arc(cx, cy, r - 10, 0, Math.PI * 2);
  c.stroke();

  // Hai bông lúa vàng uốn cong hai bên
  c.fillStyle = "#ffd54f";
  c.strokeStyle = "#b78216";
  c.lineWidth = 2;
  for (const side of [-1, 1]) {
    for (let i = 0; i < 15; i++) {
      const t = i / 14;
      const angle = -Math.PI / 2 + side * (0.35 + t * 2.3);
      const earR = 175 - t * 25;
      const ex = cx + Math.cos(angle) * earR;
      const ey = cy + Math.sin(angle) * earR * 0.95;
      c.save();
      c.translate(ex, ey);
      c.rotate(angle + (side > 0 ? Math.PI / 2 : -Math.PI / 2) + side * 0.3);
      c.beginPath();
      c.ellipse(0, 0, 11, 20, 0, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      c.restore();
    }
  }

  // Bánh răng công nghiệp vàng ở đáy
  c.fillStyle = "#ffd54f";
  c.beginPath();
  c.arc(cx, cy + 130, 68, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#da251d";
  c.beginPath();
  c.arc(cx, cy + 130, 36, 0, Math.PI * 2);
  c.fill();
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI * 2) / 12;
    const gx = cx + Math.cos(a) * 68;
    const gy = cy + 130 + Math.sin(a) * 68;
    c.save();
    c.translate(gx, gy);
    c.rotate(a);
    c.fillRect(-8, -6, 16, 16);
    c.restore();
  }

  // Dải lụa đỏ quấn quanh bánh răng và bông lúa
  c.fillStyle = "#b71c1c";
  c.strokeStyle = "#ffd54f";
  c.lineWidth = 3;
  c.beginPath();
  if (c.roundRect) c.roundRect(cx - 150, cy + 180, 300, 36, 6);
  else c.rect(cx - 150, cy + 180, 300, 36);
  c.fill();
  c.stroke();

  c.font = "bold 15px 'Be Vietnam Pro', Arial, sans-serif";
  c.fillStyle = "#ffffff";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", cx, cy + 198);

  // Ngôi sao vàng năm cánh uy nghi ở trung tâm
  c.fillStyle = "#ffea00";
  c.shadowColor = "rgba(0, 0, 0, 0.4)";
  c.shadowBlur = 12;
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const starR = i % 2 === 0 ? 92 : 38;
    const sx = cx + Math.cos(a) * starR;
    const sy = cy - 25 + Math.sin(a) * starR;
    if (i === 0) c.moveTo(sx, sy);
    else c.lineTo(sx, sy);
  }
  c.closePath();
  c.fill();
  c.shadowBlur = 0;

  // Đường gân nổi khối 3D cho các cánh sao
  c.strokeStyle = "rgba(183, 130, 22, 0.65)";
  c.lineWidth = 2.5;
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
    c.beginPath();
    c.moveTo(cx, cy - 25);
    c.lineTo(cx + Math.cos(a) * 92, cy - 25 + Math.sin(a) * 92);
    c.stroke();
  }

  c.restore();
  return canvas;
}

function labelTexture(label) {
  let canvas;
  if (label.kind === "national-flag" || label.kind === "party-flag")
    canvas = flagCanvas(label.kind === "party-flag");
  else if (label.kind === "national-emblem")
    canvas = nationalEmblemCanvas();
  else {
    canvas = document.createElement("canvas");
    canvas.width = ["lacquer", "banquetPainting"].includes(label.kind) ? 2048 : 1024;
    canvas.height = label.kind === "lacquer" ? 768 : label.kind === "banquetPainting" ? 640 : label.kind === "landscape" ? 384 : 160;
    const c = canvas.getContext("2d");
    if (label.kind === "helipad") {
      canvas.width = canvas.height = 512;
      c.fillStyle = "#626b63";
      c.fillRect(0, 0, 512, 512);
      c.strokeStyle = "#f0ead7";
      c.lineWidth = 18;
      c.beginPath();
      c.arc(256, 256, 220, 0, Math.PI * 2);
      c.stroke();
      c.font = "bold 250px Arial";
      c.fillStyle = "#eee9d9";
      c.textAlign = "center";
      c.fillText("H", 256, 340);
    } else if (label.kind === "gold-star") {
      canvas.width = canvas.height = 256;
      c.clearRect(0, 0, 256, 256);
      c.fillStyle = "#c5a055";
      c.font = "235px Arial";
      c.textAlign = "center";
      c.fillText("★", 128, 214);
    } else if (label.kind === "lacquer") {
      // Bức tranh sơn mài 40 tấm Bình Ngô Đại Cáo tại Dinh Độc Lập
      const bg = c.createLinearGradient(0, 0, 2048, 768);
      bg.addColorStop(0, "#2a0c0a");
      bg.addColorStop(0.2, "#4a1511");
      bg.addColorStop(0.5, "#360f0c");
      bg.addColorStop(0.8, "#561a15");
      bg.addColorStop(1, "#230907");
      c.fillStyle = bg;
      c.fillRect(0, 0, 2048, 768);

      c.fillStyle = "rgba(224, 180, 85, 0.08)";
      for (let i = 0; i < 40; i++) {
        c.beginPath();
        c.arc((i * 53) % 2048, (i * 97) % 768, 60 + (i % 5) * 20, 0, Math.PI * 2);
        c.fill();
      }

      // 40 tấm sơn mài ghép lại với đường viền dát vàng mạ son
      c.strokeStyle = "rgba(215, 175, 80, 0.45)";
      c.lineWidth = 3;
      for (let col = 1; col < 8; col++) {
        const x = col * 256;
        c.beginPath();
        c.moveTo(x, 24);
        c.lineTo(x, 744);
        c.stroke();
      }
      for (let row = 1; row < 5; row++) {
        const y = row * 153.6;
        c.beginPath();
        c.moveTo(24, y);
        c.lineTo(2024, y);
        c.stroke();
      }

      // Khung viền thếp vàng trang trọng
      c.strokeStyle = "#c59846";
      c.lineWidth = 14;
      c.strokeRect(18, 18, 2012, 732);
      c.strokeStyle = "#fad884";
      c.lineWidth = 3;
      c.strokeRect(30, 30, 1988, 708);

      // Hình tượng non sông gấm vóc và khí thế Lam Sơn
      c.fillStyle = "rgba(215, 170, 75, 0.15)";
      for (let i = 0; i < 7; i++) {
        c.beginPath();
        c.moveTo(i * 320 - 100, 700);
        c.bezierCurveTo(i * 320 + 80, 320 + (i % 3) * 60, i * 320 + 200, 360, i * 320 + 380, 700);
        c.fill();
      }

      // Dấu triện đỏ hoàng triều
      const drawSeal = (x, y, line1, line2) => {
        c.save();
        c.fillStyle = "#9b1e19";
        c.fillRect(x - 45, y - 45, 90, 90);
        c.strokeStyle = "#fad884";
        c.lineWidth = 3;
        c.strokeRect(x - 42, y - 42, 84, 84);
        c.fillStyle = "#fff0d4";
        c.font = "bold 20px 'Times New Roman', serif";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(line1, x, y - 14);
        c.fillText(line2, x, y + 16);
        c.restore();
      };
      drawSeal(130, 150, "ĐẠI VIỆT", "QUỐC THƯ");
      drawSeal(1918, 618, "LAM SƠN", "KHỞI NGHĨA");

      // Tiêu đề chữ vàng son lộng lẫy
      c.textAlign = "center";
      c.fillStyle = "#fedb7d";
      c.shadowColor = "rgba(0, 0, 0, 0.85)";
      c.shadowBlur = 10;
      c.font = "bold 58px 'Times New Roman', serif";
      c.fillText("BÌNH NGÔ ĐẠI CÁO", 1024, 105);

      c.font = "italic 24px 'Times New Roman', serif";
      c.fillStyle = "#e0b562";
      c.fillText("— Tranh sơn mài 40 tấm tại Phòng Trình Quốc thư · Dinh Độc Lập (Họa sĩ Nguyễn Văn Minh, 1966) —", 1024, 152);

      // Chữ viết thật của áng thiên cổ hùng văn Bình Ngô Đại Cáo
      const verses = [
        "Việc nhân nghĩa cốt ở yên dân, quân điếu phạt trước lo trừ bạo.",
        "Như nước Đại Việt ta từ trước, vốn xưng nền văn hiến đã lâu.",
        "Núi sông bờ cõi đã chia, phong tục Bắc Nam cũng khác.",
        "Từ Triệu, Đinh, Lý, Trần bao đời gây nền độc lập,",
        "Cùng Hán, Đường, Tống, Nguyên mỗi bên xưng đế một phương.",
        "Tuy mạnh yếu từng lúc khác nhau, song hào kiệt đời nào cũng có.",
        "Xã tắc từ đây vững bền, giang sơn từ đây đổi mới!"
      ];

      c.font = "bold 31px 'Times New Roman', serif";
      c.fillStyle = "#ffebb3";
      verses.forEach((line, idx) => {
        c.fillText(line, 1024, 235 + idx * 62);
      });
      c.shadowBlur = 0;
    } else if (label.kind === "banquetPainting") {
      // Tranh phong cảnh sơn dầu tông nâu vàng theo bức tranh trong Phòng Đại yến.
      const w = 2048, h = 640;
      const sky = c.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#b8a077");
      sky.addColorStop(0.45, "#8f7352");
      sky.addColorStop(1, "#352f25");
      c.fillStyle = sky;
      c.fillRect(0, 0, w, h);

      const ridge = (color, y, amp, phase) => {
        c.beginPath();
        c.moveTo(0, h);
        c.lineTo(0, y);
        for (let x = 0; x <= w; x += 96) {
          const yy = y + Math.sin(x * 0.008 + phase) * amp + Math.cos(x * 0.019 + phase) * amp * 0.38;
          c.quadraticCurveTo(x + 48, yy - amp * 0.45, x + 96, yy);
        }
        c.lineTo(w, h);
        c.closePath();
        c.fillStyle = color;
        c.fill();
      };
      ridge("#786b4e", 285, 55, 0.6);
      ridge("#62583f", 365, 64, 2.3);
      ridge("#474438", 435, 48, 4.1);

      // Ánh vàng của đồng bằng và những vệt nước phản chiếu ở chân tranh.
      const field = c.createLinearGradient(0, 390, 0, h);
      field.addColorStop(0, "rgba(183,143,74,0.35)");
      field.addColorStop(1, "rgba(38,39,31,0.9)");
      c.fillStyle = field;
      c.fillRect(0, 390, w, h - 390);
      for (let i = 0; i < 150; i++) {
        const x = (i * 137) % w;
        const y = 420 + (i * 53) % 190;
        c.strokeStyle = i % 3 ? "rgba(211,172,102,0.22)" : "rgba(30,35,29,0.35)";
        c.lineWidth = 2 + i % 5;
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x + 22 + (i % 7) * 8, y - (i % 4) * 2);
        c.stroke();
      }

      // Nét cọ tối gợi hàng cây và dáng núi xa, không thêm chữ lên tranh.
      for (let i = 0; i < 28; i++) {
        const x = 80 + i * 71;
        const y = 330 + (i % 5) * 24;
        c.strokeStyle = i % 2 ? "rgba(37,42,32,0.44)" : "rgba(194,146,74,0.28)";
        c.lineWidth = 5 + (i % 4) * 2;
        c.beginPath();
        c.moveTo(x, y + 105);
        c.quadraticCurveTo(x + 35, y + 58, x + (i % 2 ? 58 : -42), y - 10);
        c.stroke();
      }
      c.fillStyle = "rgba(236,204,139,0.13)";
      for (let i = 0; i < 70; i++) {
        c.beginPath();
        c.ellipse((i * 83) % w, (i * 47) % h, 20 + (i % 4) * 13, 4 + (i % 3) * 3, (i % 5) * 0.2, 0, Math.PI * 2);
        c.fill();
      }
    } else if (label.kind === "landscape") {
      // Kiệt tác sơn mài tầng 1 Dinh Độc Lập: "VIỆT NAM QUỐC TỔ" (Cội nguồn Dân tộc - Non sông gấm vóc)
      const w = 2400, h = 500;
      canvas.width = w;
      canvas.height = h;

      // Nền sơn mài then đỏ son truyền thống và bụi vàng lá tán rải rác
      const bg = c.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#2a0a08");
      bg.addColorStop(0.25, "#48120e");
      bg.addColorStop(0.5, "#3b0e0c");
      bg.addColorStop(0.75, "#521612");
      bg.addColorStop(1, "#200605");
      c.fillStyle = bg;
      c.fillRect(0, 0, w, h);

      // Bụi vàng tán và mây ngũ sắc huyền ảo
      for (let i = 0; i < 60; i++) {
        c.fillStyle = `rgba(235, 195, 95, ${0.04 + (i % 7) * 0.02})`;
        c.beginPath();
        c.arc((i * 47) % w, (i * 83) % h, 40 + (i % 9) * 25, 0, Math.PI * 2);
        c.fill();
      }

      // Vầng Trống đồng Đông Sơn tỏa sáng ngập tràn hào khí dân tộc (bên trái bức tranh)
      const drumX = 420, drumY = 250;
      // Vòng hào quang mặt trời
      const sunGrad = c.createRadialGradient(drumX, drumY, 20, drumX, drumY, 220);
      sunGrad.addColorStop(0, "rgba(255, 235, 150, 0.95)");
      sunGrad.addColorStop(0.4, "rgba(230, 185, 75, 0.7)");
      sunGrad.addColorStop(0.8, "rgba(180, 120, 35, 0.3)");
      sunGrad.addColorStop(1, "rgba(100, 40, 15, 0)");
      c.fillStyle = sunGrad;
      c.beginPath();
      c.arc(drumX, drumY, 220, 0, Math.PI * 2);
      c.fill();

      // Các vành hoa văn đồng tâm Trống Đồng Ngọc Lũ
      c.strokeStyle = "#f3d274";
      c.lineWidth = 2.5;
      for (const r of [45, 75, 110, 145, 175, 205]) {
        c.beginPath();
        c.arc(drumX, drumY, r, 0, Math.PI * 2);
        c.stroke();
      }

      // Ngôi sao 14 cánh tâm Trống Đồng
      c.fillStyle = "#ffec9e";
      c.beginPath();
      for (let i = 0; i < 28; i++) {
        const rad = i % 2 === 0 ? 42 : 16;
        const ang = (i * Math.PI) / 14 - Math.PI / 2;
        const px = drumX + Math.cos(ang) * rad;
        const py = drumY + Math.sin(ang) * rad;
        if (i === 0) c.moveTo(px, py);
        else c.lineTo(px, py);
      }
      c.closePath();
      c.fill();

      // Đàn chim Lạc tung cánh bay ngược chiều kim đồng hồ quanh mặt trống
      c.fillStyle = "#f8d87a";
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4 + 0.2;
        const r = 128;
        const bx = drumX + Math.cos(a) * r;
        const by = drumY + Math.sin(a) * r;
        c.save();
        c.translate(bx, by);
        c.rotate(a + Math.PI / 2);
        c.beginPath();
        c.moveTo(0, -18);
        c.quadraticCurveTo(10, -5, 18, 0);
        c.quadraticCurveTo(6, 6, -14, 0);
        c.quadraticCurveTo(-2, -6, 0, -18);
        c.fill();
        c.restore();
      }

      // Non sông gấm vóc: Dãy núi Hùng Vương Nghĩa Lĩnh, non nước Hạ Long trùng điệp
      c.fillStyle = "rgba(138, 45, 30, 0.75)";
      for (let i = 0; i < 9; i++) {
        c.beginPath();
        const mx = 650 + i * 190;
        c.moveTo(mx - 140, 460);
        c.bezierCurveTo(mx - 60, 200 + (i % 4) * 45, mx + 50, 220 + (i % 3) * 50, mx + 160, 460);
        c.fill();
      }
      c.fillStyle = "rgba(175, 65, 40, 0.65)";
      for (let i = 0; i < 8; i++) {
        c.beginPath();
        const mx = 720 + i * 200;
        c.moveTo(mx - 120, 460);
        c.bezierCurveTo(mx - 40, 260 + (i % 3) * 40, mx + 40, 280, mx + 140, 460);
        c.fill();
      }

      // Dải sông Hồng uốn lượn mạ vàng dát son
      c.strokeStyle = "rgba(240, 205, 110, 0.55)";
      c.lineWidth = 14;
      c.beginPath();
      c.moveTo(700, 440);
      c.bezierCurveTo(950, 410, 1150, 450, 1400, 420);
      c.bezierCurveTo(1650, 390, 1900, 440, 2300, 415);
      c.stroke();

      // Mái đình làng cong vút và cây đa cổ thụ tượng trưng làng quê cội nguồn
      c.fillStyle = "#d4a755";
      c.beginPath();
      c.moveTo(1020, 380);
      c.lineTo(1090, 350);
      c.lineTo(1160, 380);
      c.lineTo(1150, 430);
      c.lineTo(1030, 430);
      c.closePath();
      c.fill();

      // Khung viền gỗ quý then thếp vàng 3 lớp
      c.strokeStyle = "#946f32";
      c.lineWidth = 18;
      c.strokeRect(9, 9, w - 18, h - 18);
      c.strokeStyle = "#e5be62";
      c.lineWidth = 4;
      c.strokeRect(26, 26, w - 52, h - 52);

      // Hoa văn góc thếp vàng
      for (const [cx, cy] of [[36, 36], [w - 36, 36], [36, h - 36], [w - 36, h - 36]]) {
        c.strokeStyle = "#f3d274";
        c.lineWidth = 3;
        c.strokeRect(cx - 14, cy - 14, 28, 28);
      }

      // Đại tự thư pháp thếp vàng: "VIỆT NAM QUỐC TỔ"
      c.textAlign = "center";
      c.shadowColor = "rgba(0, 0, 0, 0.9)";
      c.shadowBlur = 18;
      c.fillStyle = "#ffeb99";
      c.font = "bold 58px 'Times New Roman', serif";
      c.fillText("VIỆT NAM QUỐC TỔ", 1520, 130);

      c.font = "italic bold 28px 'Times New Roman', serif";
      c.fillStyle = "#f5d47a";
      c.fillText("CỘI NGUỒN DÂN TỘC — NON SÔNG GẤM VÓC", 1520, 185);

      // Câu đối ca ngợi cội nguồn và lời căn dặn lịch sử
      c.shadowBlur = 8;
      c.font = "24px 'Times New Roman', serif";
      c.fillStyle = "#fdf0c2";
      c.fillText("“Dù ai đi ngược về xuôi — Nhớ ngày Giỗ Tổ mùng mười tháng ba”", 1520, 245);
      c.fillText("“Các Vua Hùng đã có công dựng nước, Bác cháu ta phải cùng nhau giữ lấy nước”", 1520, 288);
      c.shadowBlur = 0;
    } else {
      // TẤT CẢ CÁC BIỂN HIỆU VÀ CHỮ TRÊN BẢN ĐỒ:
      // Tính toán kích thước canvas tỷ lệ chuẩn 1:1 với hình học 3D (l.width / l.height),
      // chấm dứt hoàn toàn hiện tượng chữ bị kéo giãn hoặc méo hình!
      const aspect = Math.max(1, (label.width || 5) / (label.height || 0.6));
      const targetH = 256;
      const targetW = Math.max(256, Math.round(targetH * aspect));
      canvas.width = targetW;
      canvas.height = targetH;

      const isGov = label.kind === "gov-title";
      const isMausoleum = label.kind === "inscription";
      const isQuote = label.kind === "gold-quote";
      const isHoanhPhi = label.kind === "hoanh-phi";

      if (label.kind === "mausoleum-title") {
        c.clearRect(0, 0, targetW, targetH);
        c.fillStyle = "#332b29";
        c.textAlign = "center";
        c.textBaseline = "middle";
        const lines = label.text.split("\n");
        c.font = `600 ${Math.round(targetH * 0.30)}px 'Segoe UI', Arial, sans-serif`;
        c.fillText(lines[0], targetW / 2, targetH * 0.24);
        c.font = `600 ${Math.round(targetH * 0.43)}px 'Segoe UI', Arial, sans-serif`;
        c.fillText(lines[1], targetW / 2, targetH * 0.72);
      } else if (label.kind === "slogan-stand") {
        // Khẩu hiệu Quảng trường Ba Đình hai bên Lăng Bác: Chữ đỏ trên phông xanh ngọc nhạt trang trọng
        const bgGrad = c.createLinearGradient(0, 0, 0, targetH);
        bgGrad.addColorStop(0, "#dff5f1");
        bgGrad.addColorStop(0.5, "#c8ede7");
        bgGrad.addColorStop(1, "#b2e3dc");
        c.fillStyle = bgGrad;
        c.fillRect(0, 0, targetW, targetH);

        // Khung viền vàng đồng và chỉ trắng trang nhã
        c.strokeStyle = "#c59a38";
        c.lineWidth = Math.max(4, Math.round(targetH * 0.05));
        c.strokeRect(4, 4, targetW - 8, targetH - 8);
        c.strokeStyle = "#ffffff";
        c.lineWidth = Math.max(2, Math.round(targetH * 0.02));
        c.strokeRect(10, 10, targetW - 20, targetH - 20);

        // Chữ đỏ cờ rực rỡ, trang nghiêm, đậm nét
        const fontSize = Math.min(
          Math.round(targetH * 0.55),
          Math.round(((targetW * 0.94) / label.text.length) * 1.65),
        );
        c.font = `900 ${fontSize}px 'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif`;
        c.textAlign = "center";
        c.textBaseline = "middle";

        // Đổ bóng chữ
        c.fillStyle = "rgba(0, 0, 0, 0.22)";
        c.fillText(label.text, targetW / 2 + 2, targetH / 2 + 3);

        // Chữ đỏ cờ rực rỡ
        c.fillStyle = "#c8102e";
        c.fillText(label.text, targetW / 2, targetH / 2);
      } else if (isGov) {
        // Chữ hội trường Trụ sở Chính phủ: Chữ mạ vàng sáng bóng trên phông gỗ trang trọng
        c.clearRect(0, 0, targetW, targetH);
        c.shadowColor = "rgba(0, 0, 0, 0.85)";
        c.shadowBlur = 10;
        c.fillStyle = "#ffdd6b";
        const fontSize = Math.min(Math.round(targetH * 0.52), Math.round((targetW * 0.95) / label.text.length * 1.65));
        c.font = `bold ${fontSize}px 'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(label.text, targetW / 2, targetH / 2);
        c.shadowBlur = 0;
      } else if (isHoanhPhi) {
        // Hoành phi sơn son thếp vàng truyền thống (Chùa Một Cột / Liên Hoa Đài)
        const grad = c.createLinearGradient(0, 0, targetW, 0);
        grad.addColorStop(0, "#7a1212");
        grad.addColorStop(0.5, "#a31d1d");
        grad.addColorStop(1, "#7a1212");
        c.fillStyle = grad;
        c.fillRect(0, 0, targetW, targetH);

        c.strokeStyle = "#c59a38";
        c.lineWidth = 10;
        c.strokeRect(6, 6, targetW - 12, targetH - 12);
        c.strokeStyle = "#f3d172";
        c.lineWidth = 3;
        c.strokeRect(14, 14, targetW - 28, targetH - 28);

        const fontSize = Math.min(Math.round(targetH * 0.48), Math.round((targetW * 0.90) / label.text.length * 1.6));
        c.font = `bold ${fontSize}px 'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.shadowColor = "rgba(0,0,0,0.85)";
        c.shadowBlur = 8;
        c.fillStyle = "#ffd54f";
        c.fillText(label.text, targetW / 2, targetH / 2);
        c.shadowBlur = 0;
      } else if (isMausoleum) {
        // Dòng chữ "CHỦ TỊCH HỒ CHÍ MINH" trên Lăng Bác:
        // Khảm đá hoa cương đỏ mận quý trên nền đá granit hoa sen xám hồng, tỷ lệ La Mã uy nghiêm
        c.fillStyle = "#7b736b";
        c.fillRect(0, 0, targetW, targetH);

        // Hạt vân đá granit tự nhiên
        for (let i = 0; i < 400; i++) {
          c.fillStyle = i % 2 ? "rgba(255, 255, 255, 0.08)" : "rgba(30, 25, 20, 0.12)";
          c.fillRect((i * 47) % targetW, (i * 71) % targetH, 3 + (i % 4), 3 + (i % 3));
        }

        // Khung viền chỉ chìm tinh tế
        c.strokeStyle = "#4e4742";
        c.lineWidth = 6;
        c.strokeRect(10, 10, targetW - 20, targetH - 20);
        c.strokeStyle = "#999086";
        c.lineWidth = 2;
        c.strokeRect(16, 16, targetW - 32, targetH - 32);

        // Chữ đá đỏ mận thẫm khắc nổi
        const fontSize = Math.min(Math.round(targetH * 0.44), Math.round((targetW * 0.88) / label.text.length * 1.65));
        c.font = `bold ${fontSize}px 'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif`;
        c.textAlign = "center";
        c.textBaseline = "middle";

        // Bóng đổ khắc chìm 3D
        c.fillStyle = "#3d0a0a";
        c.fillText(label.text, targetW / 2 + 3, targetH / 2 + 4);

        // Mặt chữ đá hoa cương đỏ mận
        c.fillStyle = "#8f1e1e";
        c.fillText(label.text, targetW / 2, targetH / 2);

        // Vát sáng nhẹ gờ chữ
        c.fillStyle = "#b53333";
        c.fillText(label.text, targetW / 2 - 1, targetH / 2 - 1);
      } else if (isQuote) {
        // "KHÔNG CÓ GÌ QUÝ HƠN ĐỘC LẬP TỰ DO": Chữ mạ vàng trên nền sơn son gấm vóc
        const grad = c.createLinearGradient(0, 0, targetW, 0);
        grad.addColorStop(0, "#4a1210");
        grad.addColorStop(0.5, "#6b1b18");
        grad.addColorStop(1, "#4a1210");
        c.fillStyle = grad;
        c.fillRect(0, 0, targetW, targetH);

        c.strokeStyle = "#d4af37";
        c.lineWidth = 8;
        c.strokeRect(12, 12, targetW - 24, targetH - 24);

        const fontSize = Math.min(Math.round(targetH * 0.45), Math.round((targetW * 0.9) / label.text.length * 1.6));
        c.font = `bold ${fontSize}px 'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.shadowColor = "rgba(0,0,0,0.85)";
        c.shadowBlur = 8;
        c.fillStyle = "#f5d372";
        c.fillText(label.text, targetW / 2, targetH / 2);
        c.shadowBlur = 0;
      } else {
        // Biển hiệu phòng / di tích chung (LIÊN HOA ĐÀI, PHÒNG KHÁNH TIẾT, TRỐNG ĐỒNG...):
        // Hoành phi gỗ then viền vàng, chữ thếp vàng hoàng gia sắc nét
        const bgGrad = c.createLinearGradient(0, 0, 0, targetH);
        bgGrad.addColorStop(0, "#192823");
        bgGrad.addColorStop(1, "#0f1c18");
        c.fillStyle = bgGrad;
        c.fillRect(0, 0, targetW, targetH);

        // Viền thếp vàng đồng
        c.strokeStyle = "#c5a14d";
        c.lineWidth = 7;
        c.strokeRect(10, 10, targetW - 20, targetH - 20);
        c.strokeStyle = "#6b5420";
        c.lineWidth = 2;
        c.strokeRect(16, 16, targetW - 32, targetH - 32);

        // Chữ sắc sảo không bị kéo dãn
        const fontSize = Math.min(Math.round(targetH * 0.44), Math.round((targetW * 0.88) / label.text.length * 1.6));
        c.font = `bold ${fontSize}px 'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.shadowColor = "rgba(0,0,0,0.7)";
        c.shadowBlur = 6;
        c.fillStyle = "#f7e3a8";
        c.fillText(label.text, targetW / 2, targetH / 2);
        c.shadowBlur = 0;
      }
    }
  }
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  return map;
}
export class ArchitectureRenderer {
  constructor(scene) {
    this.buildings = [];
    this.doors = [];
    this.modelDisplays = [];
    this.materials = { ...makeMaterials(), ...heritageMaterials() };
    const geometries = {
      box: new THREE.BoxGeometry(1, 1, 1),
      sphere: new THREE.SphereGeometry(0.5, 12, 8),
      cylinder: new THREE.CylinderGeometry(0.5, 0.5, 1, 12),
      roof: roofGeometry(),
      ovalTable: ovalTableGeometry(),
      pediment: roofGeometry(true),
      ...heritageGeometries(),
    };
    const matrix = new THREE.Matrix4(),
      rotation = new THREE.Quaternion(),
      euler = new THREE.Euler(),
      scale = new THREE.Vector3(),
      position = new THREE.Vector3();
    for (const b of BUILDINGS) {
      const group = new THREE.Group(),
        batches = new Map(),
        lights = [];
      const signs = [];
      const lotusParts = b.parts.filter(p => p.mat === "lotusPink");
      const bustParts = b.parts.filter(p => p.shape === "hoChiMinhBust");
      const quanAmParts = b.parts.filter(p => p.shape === "quanAmStatue");
      const restingParts = b.parts.filter(p => p.shape === "restingPresident");
      const honorGuardParts = b.parts.filter(p => p.shape === "honorGuard");
      for (const p of b.parts) {
        if (p.shape === "collision") continue;
        const key = `${p.mat}:${p.shape}:${p.model || ""}`;
        if (!batches.has(key)) batches.set(key, []);
        batches.get(key).push(p);
      }
      for (const [key, parts] of batches) {
        const [mat, shape] = key.split(":"),
          mesh = new THREE.InstancedMesh(
            geometries[shape],
            this.materials[mat],
            parts.length,
          );
        parts.forEach((p, i) => {
          position.fromArray(p.position);
          scale.fromArray(p.size);
          euler.set(
            (p.rotationX || 0) * (p.front || 1),
            p.rotationY,
            (p.rotationZ || 0) * (p.front || 1),
          );
          rotation.setFromEuler(euler);
          matrix.compose(position, rotation, scale);
          mesh.setMatrixAt(i, matrix);
        });
        mesh.castShadow = !["glass", "window", "lamp"].includes(mat);
        mesh.receiveShadow = true;
        mesh.userData.model = parts[0].model;
        mesh.userData.shape = shape;
        mesh.userData.parts = parts;
        mesh.computeBoundingSphere();
        group.add(mesh);
      }
      for (const l of b.labels) {
        const mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(l.width, l.height),
          new THREE.MeshBasicMaterial({
            map: labelTexture(l),
            transparent:
              l.kind === "gold-star" ||
              l.kind === "gov-title" ||
              l.kind === "mausoleum-title" ||
              l.kind === "national-emblem",
            side: THREE.DoubleSide,
            polygonOffset: true,
            polygonOffsetFactor: -1,
          }),
        );
        mesh.position.fromArray(l.position);
        mesh.rotation.y = l.rotationY;
        if (l.kind === "helipad") mesh.rotation.x = -Math.PI / 2;
        group.add(mesh);
        if (l.kind === "sign") signs.push(mesh);
      }
      for (const light of b.lights) {
        const point = new THREE.PointLight(
          light.color,
          light.intensity,
          22,
          1.5,
        );
        point.position.fromArray(light.position);
        point.visible = false;
        lights.push(point);
        scene.add(point);
      }
      scene.add(group);
      this.buildings.push({ data: b, group, lights, signs });
      for (const display of b.modelDisplays || []) {
        this.modelDisplays.push({ ...display, parent: group, requested: false });
      }
      addModelInstances(group, MODEL_URLS.hoChiMinhBust, bustParts.map(p => ({
        position: [p.position[0], p.position[1] - p.size[1] / 2, p.position[2]],
        width: p.size[0], height: p.size[1], depth: p.size[2],
        rotationY: p.rotationY + (p.front === -1 ? Math.PI : 0),
      }))).then(model => {
        if (model) for (const child of group.children) {
          if (child.userData.shape === "hoChiMinhBust") child.visible = false;
        }
      }).catch(error => console.warn("Không tải được model tượng Bác:", error));
      addModelInstances(group, MODEL_URLS.quanAmStatue, quanAmParts.map(p => ({
        position: [p.position[0], p.position[1] - p.size[1] / 2, p.position[2]],
        width: p.size[0], height: p.size[1], depth: p.size[2],
        rotationY: p.rotationY + (p.front === -1 ? Math.PI : 0),
      }))).then(model => {
        if (model) for (const child of group.children) {
          if (child.userData.shape === "quanAmStatue") child.visible = false;
        }
      }).catch(error => console.warn("Không tải được model tượng Quan Âm:", error));
      addModelInstances(group, MODEL_URLS.restingPresident, restingParts.map(p => ({
        position: [p.position[0], p.position[1] - p.size[1] / 2, p.position[2]],
        // The imported scan lies along X; turn its long axis along the glass case's Z axis.
        width: p.size[2], height: p.size[1], depth: p.size[0],
        rotationY: p.rotationY + Math.PI / 2,
      }))).then(model => {
        if (model) for (const child of group.children) {
          if (child.userData.shape === "restingPresident") child.visible = false;
        }
      }).catch(error => console.warn("Không tải được model thi hài Bác:", error));
      if (b.id === "mausoleum") {
        // The scan already contains two upright guards separated along X.
        // Place one complete pair per row, using its original proportions.
        const guardRows = [...new Set(honorGuardParts.map(p => p.position[2]))];
        addModelInstances(group, MODEL_URLS.honorGuard, guardRows.map(z => ({
          position: [b.x, 4.2, z],
          height: 2.8,
          rotationY: b.front === -1 ? Math.PI : 0,
        }))).then(model => {
          if (model) for (const child of group.children) {
            if (child.userData.shape === "honorGuard") child.visible = false;
          }
        }).catch(error => console.warn("Không tải được model lính canh:", error));
      }
      if (b.id === "palace") {
        const paintingParts = b.parts.filter(p => p.model === "banquetPainting");
        addModelInstances(group, MODEL_URLS.banquetPainting, paintingParts.map(p => ({
          position: [p.position[0], p.position[1] - p.size[1] / 2, p.position[2]],
          width: p.size[0],
          rotationY: p.rotationY,
        }))).then(model => {
          if (model) for (const child of group.children) {
            if (child.userData.model === "banquetPaintingFallback") child.visible = false;
          }
        }).catch(error => console.warn("Không tải được tranh Phòng Đại yến:", error));
      }
      addModelInstances(group, MODEL_URLS.chandelier, b.chandeliers)
        .then(model => {
          if (model) for (const child of group.children) {
            if (child.userData.model === "chandelier") child.visible = false;
          }
        })
        .catch(error => console.warn("Không tải được model đèn chùm:", error));
      addModelInstances(group, MODEL_URLS.lotus, lotusParts.map(p => ({
        position: [p.position[0], p.position[1] - p.size[1] / 2, p.position[2]],
        width: p.size[0], height: p.size[1], rotationY: p.rotationY,
      }))).then(model => {
        if (model) for (const child of group.children) {
          if (child.isInstancedMesh && child.material === this.materials.lotusPink) child.visible = false;
        }
      }).catch(error => console.warn("Không tải được model hoa sen:", error));
      if (b.id === "palace") {
        addModelInstances(group, MODEL_URLS.carpet, [{
          position: [b.x, 4.015, b.z + 8.5 * b.front],
          width: 7.8, height: 0.045, depth: 7.8,
        }]).catch(error => console.warn("Không tải được model thảm:", error));
      }
      if (b.doors?.length) {
        for (const doorDef of b.doors) {
          const doorGroup = new THREE.Group();
          doorGroup.position.set(doorDef.position[0], doorDef.position[1], doorDef.position[2]);

          const halfWidth = doorDef.width / 2;
          const leafWidth = halfWidth - 0.02;
          const leafHeight = doorDef.height;
          const leafDepth = doorDef.depth;

          // Cửa đại 2 cánh bề thế, chạm khắc nổi trang nghiêm (2 khối to có thể mở ra mở vào)
          const leafGeom = new THREE.BoxGeometry(leafWidth, leafHeight, leafDepth);
          const panelGeomUpper = new THREE.BoxGeometry(leafWidth * 0.72, leafHeight * 0.44, 0.024);
          const panelGeomLower = new THREE.BoxGeometry(leafWidth * 0.72, leafHeight * 0.30, 0.024);
          const handleBarGeom = new THREE.CylinderGeometry(0.025, 0.025, 0.45, 12);
          const handleMountGeom = new THREE.BoxGeometry(0.03, 0.03, 0.06);

          const createLeaf = (isLeft) => {
            const pivot = new THREE.Group();
            pivot.position.set(isLeft ? -halfWidth : halfWidth, 0, 0);

            const leaf = new THREE.Mesh(leafGeom, this.materials.darkwood);
            leaf.position.set(isLeft ? leafWidth / 2 : -leafWidth / 2, leafHeight / 2, 0);
            leaf.castShadow = true;
            leaf.receiveShadow = true;
            pivot.add(leaf);

            // Các ô pano gỗ nổi sang trọng ở mặt trước và mặt sau cánh cửa
            for (const zSide of [-1, 1]) {
              const pZ = zSide * (leafDepth / 2 + 0.012);
              const upper = new THREE.Mesh(panelGeomUpper, this.materials.woodpanel);
              upper.position.set(isLeft ? leafWidth / 2 : -leafWidth / 2, leafHeight * 0.69, pZ);
              upper.castShadow = true;
              pivot.add(upper);

              const lower = new THREE.Mesh(panelGeomLower, this.materials.woodpanel);
              lower.position.set(isLeft ? leafWidth / 2 : -leafWidth / 2, leafHeight * 0.25, pZ);
              lower.castShadow = true;
              pivot.add(lower);
            }

            // Tay nắm đồng vàng thanh lịch hai mặt
            const hX = isLeft ? leafWidth - 0.25 : -(leafWidth - 0.25);
            const hY = 1.15;
            for (const zSide of [-1, 1]) {
              const hZ = zSide * (leafDepth / 2 + 0.05);
              const handle = new THREE.Mesh(handleBarGeom, this.materials.bronze);
              handle.position.set(hX, hY, hZ);
              handle.castShadow = true;
              pivot.add(handle);

              for (const mY of [hY - 0.18, hY + 0.18]) {
                const mount = new THREE.Mesh(handleMountGeom, this.materials.bronze);
                mount.position.set(hX, mY, zSide * (leafDepth / 2 + 0.025));
                pivot.add(mount);
              }
            }

            return pivot;
          };

          const pivotLeft = createLeaf(true);
          const pivotRight = createLeaf(false);
          doorGroup.add(pivotLeft);
          doorGroup.add(pivotRight);

          // Khung nẹp bao cửa (architrave)
          const frameHeader = new THREE.Mesh(
            new THREE.BoxGeometry(doorDef.width + 0.24, 0.14, leafDepth + 0.06),
            this.materials.darkwood
          );
          frameHeader.position.set(0, leafHeight + 0.07, 0);
          frameHeader.castShadow = true;
          doorGroup.add(frameHeader);

          for (const s of [-1, 1]) {
            const frameJamb = new THREE.Mesh(
              new THREE.BoxGeometry(0.12, leafHeight + 0.14, leafDepth + 0.06),
              this.materials.darkwood
            );
            frameJamb.position.set(s * (halfWidth + 0.06), leafHeight / 2, 0);
            frameJamb.castShadow = true;
            doorGroup.add(frameJamb);
          }

          group.add(doorGroup);
          this.doors.push({
            position: doorDef.position,
            pivotLeft,
            pivotRight,
            currentOpen: 0,
          });
        }
      }
    }
  }
  update(p, distance = 112, cameraPosition = p, maxLights = 3) {
    for (const display of this.modelDisplays) {
      const [x, , z] = display.placement.position;
      if (display.requested || Math.hypot(p.x - x, p.z - z) > display.loadDistance) continue;
      display.requested = true;
      addModelInstances(display.parent, MODEL_URLS[display.model], [display.placement])
        .catch(error => console.warn(`Không tải được model ${display.model}:`, error));
    }
    for (const door of this.doors) {
      const dist = Math.hypot(p.x - door.position[0], p.z - door.position[2]);
      const isNear = dist < 4.5 && Math.abs(p.y - door.position[1]) < 3.5;
      const targetOpen = isNear ? 1.0 : 0.0;
      door.currentOpen += (targetOpen - door.currentOpen) * 0.09;
      // Mở êm ái xoay vào bên trong phòng họp chữ U
      door.pivotLeft.rotation.y = -door.currentOpen * 1.45;
      door.pivotRight.rotation.y = door.currentOpen * 1.45;
    }
    for (const b of this.buildings) {
      const d = Math.hypot(p.x - b.data.x, p.z - b.data.z);
      b.group.visible = d < distance + 38;
      for (const s of b.signs)
        s.visible = s.position.distanceTo(cameraPosition) > 3.5;
      const inside =
        Math.abs(p.x - b.data.x) < 32 && Math.abs(p.z - b.data.z) < 20;
      const nearest = inside
        ? b.lights
            .filter(
              (l) => l.position.y >= p.y + 0.1 && l.position.y <= p.y + 6.6,
            )
            .sort(
              (a, b) =>
                a.position.distanceToSquared(p) -
                b.position.distanceToSquared(p),
            )
            .slice(0, maxLights)
        : [];
      for (const l of b.lights) l.visible = nearest.includes(l);
    }
  }
}
