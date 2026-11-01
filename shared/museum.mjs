export const MUSEUM_SOURCE = 'https://baotanghochiminh.vn/anh-trung-bay-chuyen-de-nguoi-di-tim-hinh-cua-nuoc.htm';

export function addMuseumGallery(b) {
  const cx = -43, cz = -4, floor = 3.2;
  const add = (x, y, z, ...args) => b.add(cx + x, y, cz + z, ...args);
  const label = (text, x, y, z, w, h, kind = 'sign') => {
    b.label(text, cx + x, y, cz + z, w, h, kind);
    return b.labels.at(-1);
  };
  b.visitorAreas = [{ x: b.x + cx, z: b.z + cz, halfWidth: 13, halfDepth: 12 }];
  // Low pavilion and sheltered entrance, inspired by the museum's white lotus language.
  add(0, 3, 0, 27, 0.2, 25, 'granite');
  add(0, floor, -12, 26, 6, 0.3, 'ivory');
  for (const x of [-13, 13]) add(x, floor, 0, 0.3, 6, 24, 'ivory');
  for (const side of [-1, 1]) add(side * 7.75, floor, 12, 10.5, 6, 0.3, 'ivory');
  add(0, 7.2, 12, 5, 2, 0.3, 'ivory');
  add(0, 9.2, 0, 27.6, 0.25, 25.6, 'palaceTrim');
  add(0, 9.45, 0, 26.4, 0.18, 24.4, 'ivory', false);
  add(0, 7.0, 13.3, 8, 0.18, 3, 'palaceTrim', false);
  b.door(cx, floor, cz + 12, 4.8, 3.8, 0.12);
  b.steps(cx, cz + 12.2, 5.4, 0.2, 2, 0.4);
  label('BẢO TÀNG HỒ CHÍ MINH · KHÔNG GIAN MÔ PHỎNG', 0, 8.1, 12.18, 23, 0.7);
  // Clear, continuous paved route from the mausoleum forecourt to the museum door.
  b.add(-31, 3.005, 17, 28, 0.035, 3.4, 'pavers', false);
  b.add(cx, 3.005, 12.5, 3.4, 0.035, 9, 'pavers', false);
  b.label('← BẢO TÀNG HỒ CHÍ MINH', -19.8, 5.0, 18, 9, 0.65);
  // Entrance orientation panel gives the real-world relationship explicitly.
  label('BẢO TÀNG TRONG CỤM DI TÍCH BA ĐÌNH\nBảo tàng Hồ Chí Minh là công trình riêng tại 19 Ngọc Hà.\nPhòng này là không gian trưng bày mô phỏng trong game.\nẢnh: Bảo tàng Hồ Chí Minh · baotanghochiminh.vn', 7.5, 5.25, 11.8, 8.5, 2, 'museum-panel');
  b.labels.at(-1).rotationY += Math.PI;
  // Two attributed photographic displays, left intact rather than cropped.
  for (const [x, image, title] of [
    [-7.1, 'exhibition.jpg', 'TRƯNG BÀY: NGƯỜI ĐI TÌM HÌNH CỦA NƯỚC'],
    [7.1, 'journey.jpg', 'KHÔNG GIAN ẢNH VÀ TỦ TƯ LIỆU'],
  ]) {
    add(x, 4.45, -11.7, 9.2, 4.3, 0.15, 'walnut', false);
    const photo = label(title, x, 6.6, -11.59, 8.8, 5.875, 'museum-photo');
    // Display frame follows the photo's 1600:1068 proportions.
    photo.height = 4.3;
    photo.width = 4.3 * 1600 / 1068;
    photo.image = image;
    label(title + '\nẢnh: Bảo tàng Hồ Chí Minh · Chuyên đề khai mạc 05/6/2021', x, 3.9, -11.55, 9, 0.85, 'museum-panel');
  }
  // Central memorial focus with an unobstructed circulation loop around it.
  add(0, floor, -5.8, 2.3, 0.9, 1.8, 'mausStone');
  add(0, 4.1, -5.8, 2.4, 0.1, 1.9, 'mausPolished');
  add(0, 4.2, -5.8, 1.4, 1.7, 0.9, 'bronzeBust', false, 'hoChiMinhBust');
  label('CHỦ TỊCH HỒ CHÍ MINH', 0, 3.65, -4.88, 2.1, 0.3);
  // Three interpretive panels follow the broad themes published by the museum.
  for (const [x, title, lines] of [
    [-8, 'CUỘC ĐỜI VÀ SỰ NGHIỆP', 'Tìm hiểu cuộc đời và hoạt động cách mạng của Chủ tịch Hồ Chí Minh.'],
    [0, 'VIỆT NAM THỜI ĐẠI HỒ CHÍ MINH', 'Tư liệu về đất nước, con người và hành trình đấu tranh của dân tộc.'],
    [8, 'BỐI CẢNH LỊCH SỬ THẾ GIỚI', 'Tìm hiểu những sự kiện quốc tế liên quan đến hành trình hoạt động của Người.'],
  ]) {
    add(x, floor, 1.0, 6.5, 2.6, 0.18, 'ivory');
    label(title + '\n' + lines + '\nTư liệu: Bộ Tư lệnh Lăng · Bảo tàng Hồ Chí Minh', x, 4.75, 1.11, 6.1, 2.1, 'museum-panel');
    // Low glazed study cases contain clearly identified illustrative models.
    add(x, floor, 3.5, 4.6, 0.8, 1.4, 'walnut');
    add(x, 4, 3.5, 4.6, 0.5, 1.4, 'glass', false);
    for (let i = 0; i < 3; i++) {
      add(x - 1.2 + i * 1.1, 4.03, 3.5, 0.7, 0.09, 0.85, 'ivory', false);
      add(x - 1.2 + i * 1.1, 4.12, 3.5, 0.65, 0.02, 0.8, i % 2 ? 'curtainRed' : 'ochre', false);
    }
    label('MÔ HÌNH MINH HỌA SÁCH, TÀI LIỆU', x, 3.65, 4.22, 4.2, 0.3);
  }
  // Warm ceiling lighting and perimeter benches, clear of the entrance route.
  for (const x of [-8, 0, 8]) {
    for (const z of [-6, 5]) {
      add(x, 8.95, z, 3.8, 0.08, 1.2, 'lamp', false);
      b.light(cx + x, 8, cz + z, '#fff1dc', 24);
    }
  }
  for (const x of [-10.5, 10.5]) {
    add(x, floor + 0.42, 8.5, 3.1, 0.15, 0.75, 'walnut');
    for (const dx of [-1.15, 1.15]) add(x + dx, floor, 8.5, 0.12, 0.42, 0.6, 'palaceMetal');
  }
  b.room('museum', 'Bảo tàng Hồ Chí Minh · trưng bày mô phỏng', cx - 12.5, cz - 11.5, cx + 12.5, cz + 11.5, floor,
    'Không gian trưng bày cạnh khu Lăng, có ảnh chuyên đề từ Bảo tàng Hồ Chí Minh, tượng Bác và tủ tư liệu minh họa. Bảo tàng thật là công trình riêng trong cụm di tích Ba Đình, không nằm trong khối Lăng.', MUSEUM_SOURCE);
  b.rooms.at(-1).spawn = { x: b.x + cx, y: floor + 0.025, z: b.z + cz + 9.5, yaw: 0 };
}
