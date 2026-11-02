// Exhibit props are illustrative reconstructions, not claims of original artefacts.
export function addMuseumObjects(b, cx, cz) {
  const add = (x, y, z, ...args) => b.add(cx + x, y, cz + z, ...args);
  const label = (text, x, y, z, width, height, kind = 'sign') => {
    b.label(text, cx + x, y, cz + z, width, height, kind);
    return b.labels.at(-1);
  };
  const flatLabel = (text, x, y, z, width, depth, kind = 'book-cover') => {
    const p = label(text, x, y, z, width, depth, kind);
    p.rotationX = -Math.PI / 2;
    return p;
  };
  function closedBook(x, y, z, w, d, h, color, title) {
    add(x, y, z, w, 0.012, d, color, false);
    add(x + 0.012, y + 0.012, z, w - 0.045, h - 0.024, d - 0.035, 'linen', false);
    add(x, y + h - 0.012, z, w, 0.012, d, color, false);
    add(x - w / 2 + 0.014, y, z, 0.028, h, d, color, false);
    for (let i = 1; i < 5; i++)
      add(x + 0.012, y + 0.012 + i * (h - 0.024) / 5, z + d / 2 - 0.015,
        w - 0.045, 0.0015, 0.012, 'ochre', false);
    const cover = flatLabel(title, x, y + h + 0.006, z, w - 0.05, d - 0.05);
    cover.coverColor = { ochre: '#ad8751', curtainRed: '#923a32', walnut: '#6e4933' }[color];
  }
  function openBook(x, y, z) {
    add(x, y, z, 0.95, 0.016, 0.66, 'walnut', false);
    for (const side of [-1, 1]) {
      add(x + side * 0.235, y + 0.016, z, 0.435, 0.047, 0.62, 'linen', false);
      flatLabel('TRANG MINH HỌA', x + side * 0.235, y + 0.07, z, 0.405, 0.59, 'book-pages');
    }
    add(x, y + 0.02, z, 0.018, 0.035, 0.63, 'ochre', false);
    add(x + 0.1, y + 0.073, z + 0.21, 0.018, 0.005, 0.4, 'curtainRed', false);
  }
  function pen(x, y, z) {
    add(x, y, z, 0.026, 0.025, 0.29, 'darkwood', false);
    add(x, y + 0.002, z - 0.17, 0.012, 0.016, 0.05, 'bronze', false);
  }
  function binoculars(x, y, z) {
    for (const dx of [-0.14, 0.14]) {
      const barrel = add(x + dx, y - 0.075, z, 0.18, 0.35, 0.18, 'palaceMetal', false, 'cylinder');
      barrel.rotationX = Math.PI / 2;
      const lens = add(x + dx, y + 0.091, z + 0.18, 0.17, 0.018, 0.17, 'screen', false, 'cylinder');
      lens.rotationX = Math.PI / 2;
    }
    add(x, y + 0.07, z, 0.24, 0.06, 0.10, 'palaceMetal', false);
  }
  function sandals(x, y, z) {
    for (const dx of [-0.14, 0.14]) {
      add(x + dx, y, z, 0.19, 0.035, 0.4, 'darkwood', false, 'sphere');
      for (const dz of [-0.06, 0.07]) {
        add(x + dx, y + 0.055, z + dz, 0.17, 0.028, 0.038, 'leather', false);
        for (const side of [-1, 1]) add(x + dx + side * 0.07, y + 0.025, z + dz,
          0.022, 0.04, 0.038, 'leather', false);
      }
    }
  }
  // Thin individual glass panes leave the wooden deck free of coincident faces.
  for (const x of [-8, 0, 8]) {
    add(x, 3.2, 3.5, 4.6, 0.8, 1.4, 'walnut');
    add(x, 4.0, 3.5, 4.5, 0.035, 1.3, 'curtainRed', false);
    for (const side of [-1, 1]) {
      add(x + side * 2.27, 4.04, 3.5, 0.018, 0.61, 1.34, 'glass', false);
      add(x, 4.04, 3.5 + side * 0.67, 4.55, 0.61, 0.018, 'glass', false);
      for (const dz of [-0.67, 0.67])
        add(x + side * 2.27, 4.0, 3.5 + dz, 0.025, 0.67, 0.025, 'bronze', false);
    }
    add(x, 4.65, 3.5, 4.57, 0.018, 1.36, 'glass', false);
  }
  closedBook(-9.55, 4.035, 3.45, 0.43, 0.64, 0.075, 'ochre', 'SỔ TAY');
  closedBook(-8.8, 4.035, 3.45, 0.45, 0.66, 0.085, 'curtainRed', 'TÀI LIỆU');
  openBook(-7.55, 4.035, 3.45);
  pen(-6.5, 4.045, 3.45);
  label('SÁCH ĐÓNG, SÁCH MỞ VÀ BÚT · MINH HỌA', -8, 3.65, 4.22, 4.2, 0.3);
  // Correspondence, writing set and an optical field instrument.
  flatLabel('BẢN THẢO MINH HỌA', -1.45, 4.043, 3.45, 0.5, 0.72, 'book-pages');
  add(-0.55, 4.04, 3.5, 0.12, 0.12, 0.12, 'porcelainBlue', false, 'cylinder');
  add(-0.55, 4.16, 3.5, 0.09, 0.025, 0.09, 'darkwood', false, 'cylinder');
  pen(-0.25, 4.045, 3.45);
  binoculars(0.5, 4.035, 3.4);
  closedBook(1.5, 4.035, 3.45, 0.43, 0.6, 0.07, 'walnut', 'GHI CHÉP');
  label('BẢN THẢO, BÚT MỰC, ỐNG NHÒM · MINH HỌA', 0, 3.65, 4.22, 4.2, 0.3);
  sandals(6.5, 4.035, 3.45);
  closedBook(7.5, 4.035, 3.45, 0.44, 0.62, 0.07, 'ochre', 'SỔ TAY');
  flatLabel('TƯ LIỆU MINH HỌA', 8.4, 4.043, 3.45, 0.5, 0.72, 'book-pages');
  // Canvas satchel with a flap, strap and two buckles.
  add(9.5, 4.035, 3.4, 0.46, 0.17, 0.36, 'linen', false);
  add(9.5, 4.205, 3.45, 0.47, 0.025, 0.27, 'ochre', false);
  for (const dx of [-0.14, 0.14]) add(9.5 + dx, 4.12, 3.59, 0.04, 0.07, 0.025, 'bronze', false);
  add(9.5, 4.24, 3.33, 0.32, 0.025, 0.045, 'walnut', false);
  label('DÉP, TÚI VẢI VÀ TƯ LIỆU · MINH HỌA', 8, 3.65, 4.22, 4.2, 0.3);
  // Full-height uniform case inspired by the supplied museum reference photograph.
  add(-8, 3.2, -5, 3.4, 0.25, 1.05, 'walnut');
  add(-8, 3.45, -5.46, 3.4, 3.65, 0.12, 'curtainRed');
  for (const side of [-1, 1]) add(-8 + side * 1.65, 3.45, -5, 0.1, 3.65, 1.0, 'walnut');
  add(-8, 7.1, -5, 3.4, 0.12, 1.05, 'walnut');
  add(-8, 3.45, -4.5, 3.2, 3.65, 0.018, 'glass', false);
  add(-8, 5.1, -5.05, 0.86, 1.15, 0.12, 'linen', false);
  for (const side of [-1, 1]) {
    const sleeve = add(-8 + side * 0.6, 5.2, -5.05, 0.29, 0.94, 0.14, 'linen', false);
    sleeve.rotationZ = side * 0.18;
    add(-8 + side * 0.24, 4.12, -5.05, 0.34, 0.98, 0.12, 'linen', false);
    add(-8 + side * 0.23, 5.55, -4.975, 0.22, 0.20, 0.025, 'ivory', false);
    const collar = add(-8 + side * 0.13, 6.14, -4.965, 0.22, 0.15, 0.035, 'ivory', false);
    collar.rotationZ = side * 0.3;
  }
  for (let i = 0; i < 5; i++) add(-8, 5.25 + i * 0.2, -4.97, 0.035, 0.035, 0.02, 'darkwood', false, 'sphere');
  label('TRANG PHỤC VÀ ĐỒ DÙNG · MÔ HÌNH MINH HỌA', -8, 3.9, -4.47, 3.1, 0.36);
  // Companion vertical document case balances the uniform display.
  add(8, 3.2, -5, 3.4, 0.25, 1.0, 'walnut');
  add(8, 3.45, -5.45, 3.4, 3.65, 0.12, 'porcelainBlue');
  for (const x of [-0.8, 0, 0.8]) for (const y of [4.0, 5.2]) {
    add(8 + x, y, -5.32, 0.68, 0.98, 0.06, 'ochre', false);
    label('TƯ LIỆU\nMINH HỌA', 8 + x, y + 0.5, -5.28, 0.59, 0.87, 'book-pages');
  }
  add(8, 3.45, -4.52, 3.4, 3.65, 0.018, 'glass', false);
  for (const side of [-1, 1]) add(8 + side * 1.65, 3.45, -5, 0.1, 3.65, 1, 'walnut');
  add(8, 7.1, -5, 3.4, 0.12, 1.0, 'walnut');
  label('GÓC TƯ LIỆU · MÔ HÌNH MINH HỌA', 8, 3.9, -4.49, 3.1, 0.36);
}
