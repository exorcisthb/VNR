// Public reference photographs document the room types and furniture language.
// Positions in this compact visitor model are not the actual building's floor plan.
const RECEPTION_SOURCE = 'https://baochinhphu.vn/thu-tuong-pham-minh-chinh-tiep-bo-truong-quoc-phong-nhat-ban-102240806182511406.htm';
const OPERATIONS_SOURCE = 'https://media.chinhphu.vn/khai-truong-trung-tam-thong-tin-chi-dao-dieu-hanh-va-he-thong-thong-tin-bao-cao-quoc-gia-102277748.htm';
const MEETING_SOURCE = 'https://baochinhphu.vn/ngay-nay-10-nam-truoc-hoi-nghi-truyen-hinh-truc-tuyen-dau-tien-cua-chinh-phu-voi-63-dia-phuong-102253993.htm';

export function governmentPublicInteriors(b, { chair, sofa, table }) {
  const panel = (x, y, z, w, h, label) => {
    b.add(x, y, z, w + 0.22, h + 0.2, 0.16, 'darkwood', false);
    b.label(label, x, y + h / 2, z + 0.10, w, h, 'dashboard');
  };
  const lamp = (x, y, z) => {
    b.add(x, y + 4.45, z, 3.6, 0.09, 2.0, 'ivory', false);
    b.add(x, y + 4.4, z, 3.3, 0.04, 1.7, 'lamp', false);
    b.light(x, y + 4.1, z, '#fff5df', 26);
  };
  // Corridors connect both floors to the existing staircase, outside room walls.
  for (const y of [9, 14]) {
    for (const x of [-18, 18]) b.add(x, y, -2.8, 0.25, 4.7, 21.8, 'ivory');
    for (const x of [-12, 0, 12]) lamp(x, y, 10.6);
    for (let x = -16; x < 18; x += 2)
      b.add(x, y, -13.5, 1.8, 1.0, 0.08, 'woodpanel', false);
  }
  // Reception room: cream upholstered wooden armchairs, paired central seats,
  // landscape backdrop, low tea tables and two inward-facing guest rows.
  const y = 9, cx = -9.5;
  b.add(0, y, -2.8, 0.25, 4.7, 21.8, 'ivory');

  // Vách mặt trước tầng 2: liên tục từ x=-18.1 đến x=+18.1, khép kín tuyệt đối vào tường bên và tường giữa
  // Cánh trái (Phòng tiếp khách, x: -18 đến 0):
  b.add(-14.4, y, 8, 7.4, 4.7, 0.25, 'woodpanel');
  b.door(-9.5, y, 8, 2.5, 3.15, 0.12);
  b.add(-9.5, y + 3.15, 8, 2.5, 1.55, 0.25, 'woodpanel');
  b.add(-4.1, y, 8, 8.4, 4.7, 0.25, 'woodpanel');

  // Cánh phải (Phòng họp trực tuyến, x: 0 đến 18):
  b.add(4.1, y, 8, 8.4, 4.7, 0.25, 'woodpanel');
  b.door(9.5, y, 8, 2.5, 3.15, 0.12);
  b.add(9.5, y + 3.15, 8, 2.5, 1.55, 0.25, 'woodpanel');
  b.add(14.4, y, 8, 7.4, 4.7, 0.25, 'woodpanel');
  b.add(cx, y + 0.015, -2.5, 13.5, 0.03, 17.5, 'goldCarpet', false);
  b.add(cx, y + 0.4, -13.35, 13.8, 3.8, 0.12, 'walnut', false);
  b.label('Phong cảnh phòng tiếp khách', cx, y + 2.35, -13.25, 13.2, 3.4, 'landscape');
  for (const x of [cx - 1.1, cx + 1.1]) chair(b, x, y, -8.4, Math.PI, 'whiteleather');
  table(b, cx, y, -8.4, 0.8, 0.8, 'walnut');
  for (const side of [-1, 1]) for (let i = 0; i < 5; i++) {
    const x = cx + side * 4.3, z = -5.3 + i * 2.2;
    chair(b, x, y, z, side < 0 ? -Math.PI / 2 : Math.PI / 2, 'whiteleather');
    table(b, x + side * 0.25, y, z + 1.0, 0.65, 0.65, 'walnut');
    b.add(x, y + 0.77, z + 1.0, 0.1, 0.13, 0.1, 'porcelain', false, 'cylinder');
  }
  for (const x of [cx - 6.0, cx + 6.0]) {
    b.add(x, y, -10.5, 0.7, 0.6, 0.7, 'porcelain', false);
    b.add(x, y + 0.6, -10.5, 0.8, 1.4, 0.8, 'greenery', false, 'sphere');
  }
  lamp(cx, y, -2.5);
  b.label('PHÒNG TIẾP KHÁCH CHÍNH PHỦ', cx, y + 3.65, 8.16, 13.3, 0.5);
  b.room('office', 'Phòng tiếp khách Chính phủ · mô phỏng', -17.5, -12.8, -1, 7.7, y,
    'Dựng theo ảnh tiếp khách tại Trụ sở Chính phủ: ghế khung gỗ bọc sáng, hai ghế chính, hai hàng ghế đối diện, bàn trà và tranh phong cảnh. Bố trí tham quan được rút gọn.', RECEPTION_SOURCE);
  // Bilateral/video meeting: one connected table, delegates, microphones and screens.
  table(b, 9.5, y, -2.2, 3.2, 13.0, 'walnut');
  for (const side of [-1, 1]) for (let i = 0; i < 6; i++) {
    const z = -7.1 + i * 1.9;
    chair(b, 9.5 + side * 2.3, y, z, side < 0 ? -Math.PI / 2 : Math.PI / 2, 'whiteleather');
    b.add(9.5 + side * 0.9, y + 0.77, z, 0.25, 0.03, 0.36, 'screen', false);
    b.add(9.5 + side * 1.1, y + 0.79, z, 0.025, 0.22, 0.025, 'bronze', false);
  }
  panel(9.5, y + 1.5, -13.15, 11.5, 2.6, 'HỌP TRỰC TUYẾN');
  b.add(9.5, y + 3.6, -12.98, 0.24, 0.14, 0.16, 'darkwood', false);
  b.label('PHÒNG HỌP TRỰC TUYẾN', 9.5, y + 3.65, 8.16, 12, 0.5);
  lamp(9.5, y, -2.5);
  b.room('video-meeting', 'Phòng họp trực tuyến · mô phỏng', 1, -12.8, 17.5, 7.7, y,
    'Không gian hội nghị trực tuyến với bàn họp, micro và màn hình, dựa trên hoạt động họp trực tuyến của Chính phủ được công bố công khai. Không mô tả vị trí phòng thực tế.', MEETING_SOURCE);
  // Information and operations centre: display wall, operator consoles, meeting zone.
  b.add(-10.6, 14, 8, 15.0, 4.7, 0.25, 'woodpanel');
  b.door(0, 14, 8, 6.2, 3.1, 0.12);
  b.add(0, 14 + 3.1, 8, 6.2, 1.6, 0.25, 'woodpanel');
  b.add(10.6, 14, 8, 15.0, 4.7, 0.25, 'woodpanel');
  b.add(0, 14.02, -2.5, 32, 0.025, 20, 'carpet', false);
  for (const x of [-10.1, 0, 10.1]) panel(x, 15.4, -13.12, 9.5, 2.6, 'THÔNG TIN ĐIỀU HÀNH');
  for (const z of [-5.5, 0]) for (const x of [-12, -6, 0, 6, 12]) {
    table(b, x, 14, z, 3.8, 1.2, 'walnut');
    chair(b, x, 14, z + 1.15, 0, 'leather');
    b.add(x, 14.78, z, 0.35, 0.06, 0.25, 'darkwood', false);
    b.add(x, 14.84, z, 0.07, 0.18, 0.07, 'palaceMetal', false);
    b.add(x, 15.02, z, 1.1, 0.65, 0.07, 'screen', false);
    b.add(x, 14.77, z + 0.38, 0.65, 0.025, 0.2, 'darkwood', false);
  }
  for (const x of [-10, 0, 10]) lamp(x, 14, -3);
  b.label('TRUNG TÂM THÔNG TIN, CHỈ ĐẠO, ĐIỀU HÀNH', 0, 17.65, 8.16, 23, 0.55);
  b.room('operations', 'Trung tâm thông tin, chỉ đạo, điều hành · mô phỏng', -17.5, -12.8, 17.5, 7.7, 14,
    'Mô phỏng chức năng Trung tâm Thông tin, chỉ đạo, điều hành khai trương ngày 19/8/2020: màn hình tổng hợp, bàn vận hành và thiết bị hội nghị. Màn hình là sơ đồ minh họa, không phải dữ liệu vận hành thật.', OPERATIONS_SOURCE);
}
