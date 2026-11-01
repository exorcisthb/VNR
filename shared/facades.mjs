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

  // =========================================================================
  // CỘT CỜ TRUNG TÂM QUẢNG TRƯỜNG BA ĐÌNH (CỘT CỜ LĂNG BÁC - LỄ THƯỢNG CỜ)
  // =========================================================================
  // Low granite steps, a dressed stone pedestal and a bolted metal pole socket.
  for (const [width, y] of [[6.2, 3], [5.7, 3.16], [5.2, 3.32]]) {
    b.add(0, y, 32, width, 0.16, width, 'granite');
    b.add(0, y + 0.135, 32, width + 0.04, 0.025, width + 0.04, 'mausPolished', false);
    // Fine joints between stone slabs, kept flush with the tread.
    for (const side of [-1, 1])
      b.add(side * 1.35, y + 0.161, 32, 0.018, 0.006, width, 'mausStone', false);
  }
  b.add(0, 3.48, 32, 2.15, 0.72, 2.15, 'mausStone');
  b.add(0, 4.2, 32, 2.3, 0.12, 2.3, 'mausPolished');
  b.add(0, 4.32, 32, 1.05, 0.10, 1.05, 'palaceMetal', false);
  b.add(0, 4.42, 32, 0.72, 0.43, 0.72, 'civicWhite', false, 'cylinder');
  for (const y of [4.42, 4.76])
    b.add(0, y, 32, 0.82, 0.055, 0.82, 'palaceMetal', false, 'cylinder');
  for (const dx of [-0.4, 0.4]) for (const dz of [-0.4, 0.4]) {
    b.add(dx, 4.42, 32 + dz, 0.075, 0.07, 0.075, 'palaceMetal', false, 'cylinder');
    b.add(dx, 4.49, 32 + dz, 0.11, 0.035, 0.11, 'civicWhite', false, 'cylinder');
  }
  // Thân cột cờ trắng cao vút gần 30 mét
  b.add(0, 4.85, 32.0, 0.42, 10.0, 0.42, 'civicWhite', false, 'cylinder');
  b.add(0, 14.85, 32.0, 0.32, 12.0, 0.32, 'civicWhite', false, 'cylinder');
  // Đỉnh búp đồng / quả cầu đồng
  b.add(0, 26.85, 32.0, 0.65, 0.75, 0.65, 'bronze', false, 'sphere');
  // Đại kỳ Tổ quốc đỏ sao vàng bay phấp phới trên đỉnh cột cờ trung tâm
  b.label('', 2.3, 23.5, 32.0, 4.6, 3.1, 'national-flag');
  // Discreet ground-mounted uplights outside the steps.
  for (const dx of [-3.45, 3.45]) {
    for (const dz of [-3.45, 3.45]) {
      b.add(dx, 3.02, 32 + dz, 0.34, 0.12, 0.34, 'palaceMetal', false, 'cylinder');
      b.add(dx, 3.14, 32 + dz, 0.22, 0.025, 0.22, 'lamp', false, 'cylinder');
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

// Exterior-only additions sit outside the existing rooms and glazing.
export function palaceExterior(b, floor) {
  const add = (...args) => b.add(...args);
  const cream = 'palaceConcrete', trim = 'palaceTrim', glass = 'palaceGlass';
  // Continuous roof cornice, shadow gap and the narrow clerestory beneath it.
  add(0, 21.8, 0, 63.6, 0.22, 30.8, trim, false);
  add(0, 22.02, 0, 64.2, 0.18, 31.2, cream, false);
  add(0, 21.43, 15.15, 62.8, 0.22, 0.65, 'palaceMetal', false);
  add(0, 20.6, 14.35, 61.5, 0.8, 0.12, glass, false);
  for (let x = -30; x <= 30; x += 1.5)
    add(x, 20.55, 14.65, 0.12, 0.95, 0.35, trim, false);
  // Tall structural piers give the facade its regular rhythm.
  for (let x = -30; x <= 30; x += 3) {
    add(x, 9.8, 15.3, 0.25, 11.6, 0.7, cream, false);
    add(x, 9.6, 15.3, 0.42, 0.22, 0.9, trim, false);
  }
  // Repeated sculpted concrete fins, with recessed glass left visible between them.
  for (const side of [-1, 1]) {
    for (let bay = 0; bay < 6; bay++) {
      const cx = side * (7.5 + bay * 3);
      for (const y of [10.1, 13.6, 17.1]) {
        for (const offset of [-1.05, -0.35, 0.35, 1.05])
          add(cx + offset, y, 15.55, 0.46, 3.2, 0.52, cream, false, 'palaceBlade');
        add(cx, y, 15.45, 2.85, 0.12, 0.66, trim, false);
      }
      // Ground-floor arcade: dark, recessed panes and fine metal mullions.
      add(cx, floor + 0.5, 14.22, 2.6, 4.5, 0.08, glass, false);
      for (const dx of [-1.25, 0, 1.25])
        add(cx + dx, floor + 0.45, 14.4, 0.065, 4.6, 0.13, 'palaceMetal', false);
      add(cx, 8.85, 14.4, 2.7, 0.08, 0.14, trim, false);
    }
    // The end wings have long rectangular windows rather than the bamboo screen.
    for (const x0 of [25.5, 28.5]) {
      const x = side * x0;
      for (const y of [10.1, 15.2]) {
        add(x, y, 14.26, 2.35, 4.5, 0.1, glass, false);
        for (const dx of [-1.32, 1.32])
          add(x + dx, y - 0.15, 15.1, 0.32, 4.95, 0.75, cream, false);
        add(x, y - 0.15, 15.1, 2.8, 0.3, 0.75, trim, false);
        add(x, y + 4.55, 15.1, 2.8, 0.3, 0.75, trim, false);
        add(x, y + 2.2, 14.55, 2.3, 0.08, 0.12, 'palaceMetal', false);
        for (const dx of [-0.75, -0.25, 0.25, 0.75])
          add(x + dx, y + 0.12, 14.65, 0.045, 1.1, 0.08, 'palaceMetal', false);
      }
    }
    // Exposed plinth, paving and low, clipped shrubs alongside the steps.
    add(side * 21.5, 3.02, 15.1, 18, 0.9, 0.42, 'palaceStone', false);
    for (const x of [12.8, 18.5, 24.2, 29]) {
      add(side * x, 3.15, 18, 1.15, 0.4, 1.15, 'ochre', false, 'cylinder');
      add(side * x, 3.55, 18, 1.0, 1.45, 1.0, 'greenery', false, 'sphere');
      add(side * x, 4.3, 18, 0.72, 1.1, 0.72, 'greenery', false, 'sphere');
    }
    // Side elevations: window surrounds and projecting concrete sun hoods.
    for (let z = -10; z <= 10; z += 4) {
      for (const y of [10.1, 16.1]) {
        add(side * 30.3, y, z, 0.28, 4.8, 0.13, cream, false);
        add(side * 30.4, y + 4.7, z, 0.85, 0.15, 3.7, trim, false);
      }
    }
  }
  // Open central loggia, slender mullions and two projecting balconies.
  for (const y of [10, 16]) {
    add(0, y, 16.1, 10.4, 0.25, 3.8, trim, false);
    add(0, y + 0.28, 17.92, 10.2, 0.72, 0.18, cream, false);
    add(0, y + 1.0, 17.95, 10.5, 0.1, 0.28, trim, false);
    for (const x of [-5.05, 5.05]) {
      add(x, y + 0.25, 16.15, 0.18, 0.8, 3.6, cream, false);
      add(x, y + 0.25, 16.0, 0.32, 5.7, 0.5, cream, false);
    }
    for (const x of [-3.4, -1.7, 0, 1.7, 3.4]) {
      add(x, y + 1.3, 14.5, 0.08, 4.1, 0.12, 'palaceMetal', false);
    }
    add(0, y + 5.55, 16.05, 10.8, 0.2, 3.9, trim, false);
  }
  // Thin entrance canopy with a deep shadow underneath and unblocked central passage.
  for (const x of [-4.8, 4.8]) {
    add(x, floor, 18.2, 0.42, 5.45, 0.42, 'palaceStone');
    add(x, floor, 18.2, 0.7, 0.2, 0.7, cream, false);
  }
  add(0, 9.15, 17.7, 13.2, 0.18, 6.3, 'palaceMetal', false);
  add(0, 9.33, 17.7, 13.7, 0.22, 6.7, trim, false);
  add(0, 9.55, 17.7, 14.1, 0.12, 6.9, cream, false);
  // Terrace balustrade, roof lights and small potted palms in silhouette.
  for (const side of [-1, 1]) {
    add(side * 22, 22.25, 13.5, 17, 0.18, 0.2, trim, false);
    for (let x = 14; x <= 30; x += 2)
      add(side * x, 22.1, 13.5, 0.07, 0.85, 0.07, 'palaceMetal', false);
    add(side * 22, 22.95, 13.5, 17, 0.09, 0.16, trim, false);
    for (const x of [15, 20, 25, 29]) {
      add(side * x, 22.05, 9, 0.65, 0.45, 0.65, 'palaceStone', false);
      add(side * x, 22.5, 9, 0.11, 1.5, 0.11, 'wood', false, 'cylinder');
      for (let i = 0; i < 6; i++) {
        const angle = i * Math.PI / 3;
        add(side * x + Math.cos(angle) * 0.42, 23.7, 9 + Math.sin(angle) * 0.42,
          1.25, 0.16, 0.24, 'greenery', false, 'sphere', -angle);
      }
    }
  }
  // Thin projecting lip and vertical glazing on the existing rooftop pavilion.
  add(0, 25.86, 0, 28.6, 0.16, 16.5, trim, false);
  for (let x = -12; x <= 12; x += 1.5)
    add(x, 22.45, 6.75, 0.09, 2.9, 0.16, 'palaceMetal', false);
}
