// Exterior proportions follow the user's reference photos; interior routes use game units.
export function mausoleumExterior(b, floor) {
  // Bệ móng đá hoa cương vững chắc ở chân công trình và bậc thềm trải rộng toàn bộ mặt tiền Lăng (38m)
  b.add(0, 3, 0, 38, 1.2, 38, 'mausStone');
  b.steps(0, 19, 38, 1.2, 6, 0.65);

  // Khối đế tam cấp đá hoa cương 4 mặt đối xứng hoàn hảo, tựa vững chắc vào tường lõi (khoảng cách 12.4m)
  const plinthTiers = [
    // [y, height, outerDist]
    [floor, 1.35, 18.9],
    [5.55,  1.35, 18.1],
    [6.90,  1.35, 17.3],
    [8.25,  1.55, 16.5],
  ];
  for (const [y, height, outer] of plinthTiers) {
    const depth = outer - 12.4;
    const center = (12.4 + outer) / 2;
    // Mặt trước (chừa lối vào trung tâm |x| < 3.0m dẫn vào Lăng)
    for (const side of [-1, 1]) {
      const halfW = (outer * 2 - 6.0) / 2;
      b.add(side * (3.0 + halfW / 2), y, center, halfW, height, depth, 'mausStone');
    }
    // Mặt sau đối xứng
    b.add(0, y, -center, outer * 2, height, depth, 'mausStone');
    // Mặt trái và mặt phải đối xứng (nối liền mạch góc trước - sau ở |z| <= 12.4)
    for (const side of [-1, 1]) {
      b.add(side * center, y, 0, depth, height, 24.8, 'mausStone');
    }
  }
  // Dầm trán cửa cổng chính mặt trước
  b.add(0, 8.25, 13.2, 6.0, 1.55, 1.6, 'mausStone');

  // Khung cửa gỗ sẫm lối vào đại sảnh mặt trước
  for (const x of [-2.95, 2.95]) b.add(x, floor, 15.3, 0.18, 4.1, 1.3, 'darkwood', false);

  // Khối thân ốp đá hoa cương màu đỏ / hồng trang nghiêm sau hàng cột trên cả 4 mặt
  for (const z of [-12.6, 12.6]) b.add(0, 9.8, z, 29, 10.8, 0.4, 'mausRed');
  for (const x of [-12.6, 12.6]) b.add(x, 9.8, 0, 0.4, 10.8, 29, 'mausRed');

  // Hàng cột đá hoa cương vuông 4 mặt đối xứng hoàn hảo (6 cột mỗi mặt, giữ nguyên kích thước cột, phân bố chuẩn gian giữa rộng thoáng)
  const colCoords = [-14.8, -9.5, -4.2, 4.2, 9.5, 14.8];
  const columns = [];
  // 6 cột mặt trước và 6 cột mặt sau
  for (const z of [-14.8, 14.8]) {
    for (const x of colCoords) columns.push([x, z]);
  }
  // 4 cột giữa mặt trái và 4 cột giữa mặt phải (4 góc đã có ở trên)
  for (const x of [-14.8, 14.8]) {
    for (const z of [-9.5, -4.2, 4.2, 9.5]) columns.push([x, z]);
  }
  for (const [cx, cz] of columns) {
    b.add(cx, 9.55, cz, 1.85, 0.25, 1.85, 'mausPolished');
    b.add(cx, 9.80, cz, 1.55, 10.8, 1.55, 'mausPolished');
    b.add(cx, 20.35, cz, 1.85, 0.25, 1.85, 'mausPolished');
  }

  // Khối mái vát tam cấp vuông vức 4 mặt đối xứng hoàn toàn
  b.add(0, 20.60, 0, 34.8, 0.45, 34.8, 'mausPolished');
  b.add(0, 21.05, 0, 35.8, 2.25, 35.8, 'mausPolished');
  b.add(0, 23.30, 0, 36.2, 0.25, 36.2, 'mausStone');
  b.add(0, 23.55, 0, 28.5, 0.50, 28.5, 'mausStone');
  b.add(0, 24.05, 0, 20.5, 0.50, 20.5, 'mausPolished');
  b.label('CHỦ TỊCH\nHỒ - CHÍ - MINH', 0, 22.15, 17.94, 19, 1.65, 'mausoleum-title');

  // =========================================================================
  // KHÁN ĐÀI A & B, DÃY CỘT CỜ VÀ DẢI KHẨU HIỆU HAI BÊN LĂNG BÁC (QUẢNG TRƯỜNG BA ĐÌNH)
  // =========================================================================
  // Khán đài A (bên trái khi nhìn vào Lăng): Khẩu hiệu "NƯỚC CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM MUÔN NĂM !"
  b.add(-32.5, 3.0, 20.5, 23.6, 0.6, 5.0, 'mausStone');
  b.add(-32.5, 3.6, 20.5, 23.2, 0.8, 4.4, 'mausStone');
  b.add(-32.5, 4.4, 20.5, 22.8, 0.8, 3.8, 'mausStone');
  b.add(-32.5, 4.2, 22.8, 22.4, 1.5, 0.25, 'granite');
  b.label('NƯỚC CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM MUÔN NĂM !', -32.5, 4.95, 22.95, 22.2, 1.45, 'slogan-stand');
  // Hàng 7 cột cờ Khán đài A (cờ Đảng và cờ Tổ quốc đan xen)
  for (let i = 0; i < 7; i++) {
    const px = -41.5 + i * 3.0;
    b.add(px, 5.2, 19.5, 0.14, 7.2, 0.14, 'civicWhite', false, 'cylinder');
    b.add(px, 12.4, 19.5, 0.28, 0.28, 0.28, 'bronze', false, 'sphere');
    b.label('', px + 1.05, 11.2, 19.5, 2.1, 1.4, i % 2 === 0 ? 'national-flag' : 'party-flag');
  }
  // Bồn hoa cây cảnh xanh và thảm hoa tươi trước Khán đài A (đặt liền sát mặt đất)
  b.add(-32.5, 3.0, 22.65, 22.6, 0.45, 0.35, 'civicRoof', false);
  b.add(-32.5, 2.95, 23.2, 22.4, 0.32, 0.5, 'lotusPink', false);
  // Trụ panô cờ lễ hội đỏ thắm bên cánh trái
  b.add(-18.5, 3.0, 22.5, 1.6, 6.2, 0.15, 'mausRed', false);
  b.add(-18.5, 3.0, 22.5, 1.8, 0.3, 0.4, 'granite');

  // Khán đài B (bên phải khi nhìn vào Lăng): Khẩu hiệu "CHỦ TỊCH HỒ CHÍ MINH VĨ ĐẠI SỐNG MÃI TRONG SỰ NGHIỆP CỦA CHÚNG TA !"
  b.add(32.5, 3.0, 20.5, 23.6, 0.6, 5.0, 'mausStone');
  b.add(32.5, 3.6, 20.5, 23.2, 0.8, 4.4, 'mausStone');
  b.add(32.5, 4.4, 20.5, 22.8, 0.8, 3.8, 'mausStone');
  b.add(32.5, 4.2, 22.8, 22.4, 1.5, 0.25, 'granite');
  b.label('CHỦ TỊCH HỒ CHÍ MINH VĨ ĐẠI SỐNG MÃI TRONG SỰ NGHIỆP CỦA CHÚNG TA !', 32.5, 4.95, 22.95, 22.2, 1.45, 'slogan-stand');
  // Hàng 7 cột cờ Khán đài B (cờ Đảng và cờ Tổ quốc đan xen)
  for (let i = 0; i < 7; i++) {
    const px = 23.5 + i * 3.0;
    b.add(px, 5.2, 19.5, 0.14, 7.2, 0.14, 'civicWhite', false, 'cylinder');
    b.add(px, 12.4, 19.5, 0.28, 0.28, 0.28, 'bronze', false, 'sphere');
    b.label('', px + 1.05, 11.2, 19.5, 2.1, 1.4, i % 2 === 0 ? 'party-flag' : 'national-flag');
  }
  // Bồn hoa cây cảnh xanh và thảm hoa tươi trước Khán đài B (đặt liền sát mặt đất)
  b.add(32.5, 3.0, 22.65, 22.6, 0.45, 0.35, 'civicRoof', false);
  b.add(32.5, 2.95, 23.2, 22.4, 0.32, 0.5, 'lotusPink', false);
  // Trụ panô cờ lễ hội đỏ thắm bên cánh phải
  b.add(18.5, 3.0, 22.5, 1.6, 6.2, 0.15, 'mausRed', false);
  b.add(18.5, 3.0, 22.5, 1.8, 0.3, 0.4, 'granite');

  // =========================================================================
  // CỘT CỜ TRUNG TÂM QUẢNG TRƯỜNG BA ĐÌNH (CỘT CỜ LĂNG BÁC - LỄ THƯỢNG CỜ)
  // =========================================================================
  // Bệ tam cấp đá hoa cương đỏ và xám trang nghiêm
  b.add(0, 3.0, 32.0, 5.8, 0.45, 5.8, 'granite');
  b.add(0, 3.45, 32.0, 4.4, 0.45, 4.4, 'mausStone');
  b.add(0, 3.90, 32.0, 3.0, 0.60, 3.0, 'mausRed');
  b.add(0, 4.50, 32.0, 1.2, 0.35, 1.2, 'bronze', false, 'cylinder');
  // Thân cột cờ trắng cao vút gần 30 mét
  b.add(0, 4.85, 32.0, 0.42, 10.0, 0.42, 'civicWhite', false, 'cylinder');
  b.add(0, 14.85, 32.0, 0.32, 12.0, 0.32, 'civicWhite', false, 'cylinder');
  // Đỉnh búp đồng / quả cầu đồng
  b.add(0, 26.85, 32.0, 0.65, 0.75, 0.65, 'bronze', false, 'sphere');
  // Đại kỳ Tổ quốc đỏ sao vàng bay phấp phới trên đỉnh cột cờ trung tâm
  b.label('', 2.3, 23.5, 32.0, 4.6, 3.1, 'national-flag');
  // 4 cột trụ đèn đồng nghi lễ tại 4 góc chân bệ cột cờ
  for (const dx of [-2.2, 2.2]) {
    for (const dz of [-2.2, 2.2]) {
      b.add(dx, 3.45, 32.0 + dz, 0.16, 1.6, 0.16, 'bronze', false);
      b.add(dx, 5.05, 32.0 + dz, 0.38, 0.38, 0.38, 'lamp', false, 'sphere');
    }
  }

  // Cặp trụ đèn chùm nghi lễ Ba Đình (2 bên trục duyệt binh)
  for (const lx of [-13.0, 13.0]) {
    b.add(lx, 3.0, 25.0, 0.7, 0.9, 0.7, 'mausStone');
    b.add(lx, 3.9, 25.0, 0.20, 6.5, 0.20, 'bronze', false, 'cylinder');
    b.add(lx, 9.8, 25.0, 2.2, 0.12, 0.12, 'bronze', false);
    b.add(lx, 10.5, 25.0, 0.45, 0.45, 0.45, 'lamp', false, 'sphere');
    b.add(lx - 1.0, 10.0, 25.0, 0.38, 0.38, 0.38, 'lamp', false, 'sphere');
    b.add(lx + 1.0, 10.0, 25.0, 0.38, 0.38, 0.38, 'lamp', false, 'sphere');
  }
}

export function governmentExterior(b, floor) {
  b.add(0, 3, 17, 21, 1, 4.5, 'granite');
  b.steps(0, 19.25, 18, 1, 5, 0.55);
  for (const side of [-1, 1]) {
    b.add(side * 16.1, floor, 14.21, 23.8, 15.8, 0.05, 'civicWhite', false);
    b.add(side * 28.25, floor, 0, 0.1, 15.8, 28.1, 'civicWhite', false);
    for (const z of [-10, -5, 0, 5, 10]) for (const y of [5, 10, 15]) {
      b.add(side * 28.34, y, z, 0.08, 3.1, 2.1, 'civicGlass', false);
      b.add(side * 28.4, y, z, 0.08, 3.1, 0.08, 'civicWhite', false);
    }
  }
  // Ground-floor arcade and continuous tall white pilasters on both wings.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 6; i++) {
      const x = side * (10.2 + i * 3.35);
      b.add(x, floor, 14.6, 0.65, 4.5, 0.9, 'civicWhite');
      b.add(x, 8.9, 14.6, 0.62, 10.9, 0.8, 'civicWhite');
      b.add(x, 8.85, 14.6, 0.95, 0.3, 1.1, 'civicWhite');
      b.add(x, 19.55, 14.6, 1.0, 0.35, 1.1, 'civicWhite');
      // Recessed glazing, slender window mullions and small dark ventilation grilles.
      if (i < 5) {
        const wx = x + side * 1.675;
        b.add(wx, 4.65, 14.25, 2.4, 3.15, 0.12, 'civicGlass', false);
        for (const y of [9.15, 14.15]) {
          b.add(wx, y, 14.25, 2.35, 4.1, 0.12, 'civicGlass', false);
          b.add(wx, y, 14.35, 0.10, 4.1, 0.12, 'civicWhite', false);
          for (let h = 0.8; h < 4; h += 0.8)
            b.add(wx, y + h, 14.35, 2.35, 0.08, 0.12, 'civicWhite', false);
        }
      }
    }
  }
  for (const y of [8.5, 19.9]) b.add(0, y, 14.5, 58.8, 0.45, 1.3, 'civicWhite');
  // Flat green roof with white cornices; taller central pavilion.
  b.add(0, 19.05, 0, 58, 0.45, 29, 'civicWhite');
  b.add(0, 19.5, 0, 59, 0.35, 30, 'civicWhite');
  b.add(0, 19.85, 0, 57.5, 0.6, 28, 'civicRoof');
  b.add(0, 20.45, 0, 58.5, 0.20, 29, 'civicWhite');
  b.add(0, 8.55, 15.1, 17.5, 14.1, 0.45, 'civicGlass');
  for (const x of [-7.8, -3.9, 0, 3.9, 7.8]) {
    b.add(x, 8.55, 15.6, 0.78, 14.1, 0.9, 'civicWhite');
    b.add(x, 22.35, 15.6, 1.2, 0.45, 1.2, 'civicWhite');
  }
  for (const x of [-5.85, -1.95, 1.95, 5.85]) {
    for (const dx of [-0.85, 0, 0.85]) b.add(x + dx, 8.65, 15.38, 0.07, 13.5, 0.08, 'civicWhite', false);
    for (let y = 9.3; y < 22.3; y += 0.9) b.add(x, y, 15.38, 3.05, 0.08, 0.08, 'civicWhite', false);
    b.add(x, 21.35, 15.45, 2.0, 1.0, 0.12, 'screen', false);
  }
  b.add(0, 22.8, 1, 18.8, 0.4, 30.8, 'civicWhite');
  b.add(0, 23.2, 1, 19.8, 0.5, 31.5, 'civicWhite');
  b.add(0, 23.7, 1, 20.4, 0.18, 32, 'civicWhite');
  b.label('government-facade-emblem', 0, 22.95, 16.84, 0.8, 0.8, 'national-emblem');
  // Low entrance portico, open center passage, and wooden door leaves.
  for (const x of [-7.8, -3.9, 3.9, 7.8]) {
    b.add(x, floor, 16.4, 0.8, 4.1, 0.8, 'civicWhite');
    b.add(x, floor, 16.4, 1.05, 0.3, 1.05, 'civicWhite');
  }
  b.add(0, 8.1, 16.1, 18.6, 0.4, 3.4, 'civicWhite');
  b.add(0, 8.5, 16.1, 19.1, 0.18, 3.8, 'civicWhite');
  for (const x of [-2.7, 2.7]) b.add(x, floor, 14.65, 0.5, 3.7, 0.25, 'darkwood', false);
}
