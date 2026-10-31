import { B } from "./blocks.mjs";
import { TANK_LANDMARK } from "./tank-exhibit.mjs";
// Một khối biểu diễn khoảng 1–1,4 m. Bố cục công viên là hư cấu;
// các công trình ngoài đời không nằm cạnh nhau như trong bản đồ này.
export const LANDMARKS = [
  {
    id: "mausoleum",
    name: "Lăng Chủ tịch Hồ Chí Minh",
    city: "Hà Nội",
    x: -66,
    z: -48,
    front: 1,
    bounds: [-95, -37, -73, 9],
    sign: { x: -51, z: 5 },
    description:
      "Khánh thành ngày 29/8/1975 tại Quảng trường Ba Đình, Hà Nội; đây là nơi gìn giữ lâu dài thi hài Chủ tịch Hồ Chí Minh.",
    source:
      "https://btllang.bqp.vn/tin-tuc/tin-tu-bo-tu-lenh-lang/11238-ban-quan-ly-lang-chu-tich-ho-chi-minh-va-dau-an-cua-truong-ban-dau-tien.html",
  },
  {
    id: "palace",
    name: "Dinh Độc Lập",
    city: "Thành phố Hồ Chí Minh",
    x: 60,
    z: -48,
    front: 1,
    bounds: [24, 96, -68, 12],
    sign: { x: 82, z: 9 },
    description:
      "Công trình do kiến trúc sư Ngô Viết Thụ thiết kế, khánh thành ngày 31/10/1966; gắn với sự kiện ngày 30/4/1975 và sự nghiệp thống nhất đất nước.",
    source: "https://dinhdoclap.gov.vn/lich-su-dinh-doc-lap/",
  },
  {
    id: "government",
    name: "Trụ sở Chính phủ",
    city: "Hà Nội · Số 1 Hoàng Hoa Thám",
    x: 0,
    z: 78,
    front: -1,
    bounds: [-33, 33, 40, 105],
    sign: { x: 18, z: 43 },
    description:
      "Khu trụ sở Chính phủ và Văn phòng Chính phủ tại số 1 Hoàng Hoa Thám, Hà Nội, phục vụ hoạt động chỉ đạo, điều hành của Chính phủ.",
    source:
      "https://vpcp.chinhphu.vn/bao-ve-an-ninh-an-toan-tru-so-chinh-phu-va-vpcp-1158658.htm",
  },
];
LANDMARKS.push(
  {
    id: "pagoda", name: "Chùa Một Cột", city: "Hà Nội · Liên Hoa Đài",
    x: -87, z: 83, front: -1, bounds: [-109,-65,59,104], sign: {x:-100,z:61}, approach: 23,
    description: "Liên Hoa Đài thuộc quần thể chùa Diên Hựu, khởi dựng năm 1049 thời Lý Thái Tông. Đài trên một cột giữa hồ được mô phỏng với mái cong và cầu thang đá.",
    source: "https://visitbadinh.com.vn/vi/place/details/chua-mot-cot-6",
  },
  {
    id: "drum", name: "Trống đồng Đông Sơn", city: "Quảng trường trưng bày · Mô hình phóng lớn",
    x: 98, z: 87, front: -1, bounds: [77,120,66,108], sign:{x:85,z:66}, approach: 22,
    description: "Trống đồng là hiện vật tiêu biểu của văn hóa Đông Sơn. Mô hình phóng lớn cao 4,2 m, đường kính mặt 7,4 m; hoa văn cách điệu gợi ngôi sao, chim và các vành đồng tâm, không phải bản sao một bảo vật cụ thể.",
    source: "https://baotanglichsu.vn/vi/Articles/1001/13602/gioi-thieu-bao-vat-quoc-gia-1-trong-djong-ngoc-lu-hien-vat-tieu-bieu-nhat-cua-nen-van-hoa-djong-son.html",
  },
  TANK_LANDMARK,
);
export function isProtected(x, y, z, margin = 0) {
  return LANDMARKS.some(
    (l) =>
      x >= l.bounds[0] - margin &&
      x <= l.bounds[1] + margin &&
      z >= l.bounds[2] - margin &&
      z <= l.bounds[3] + margin,
  );
}
export function visitSpawn(l) {
  return {
    x: l.x + 0.5,
    y: 3,
    z: l.z + l.front * (l.approach ?? 51) + 0.5,
    yaw: l.front === 1 ? 0 : Math.PI,
  };
}

export function buildLandmarks(put, bounds) {
  const paint = (x, z, id) => {
    if (
      x >= bounds.minX &&
      x <= bounds.maxX &&
      z >= bounds.minZ &&
      z <= bounds.maxZ
    )
      put(x, 2, z, id);
  };
  for (let z = bounds.minZ; z <= bounds.maxZ; z++)
    for (let x = bounds.minX; x <= bounds.maxX; x++) {
      const tank = TANK_LANDMARK;
      if ((x >= tank.bounds[0] && x <= tank.bounds[1] && z >= tank.bounds[2] && z <= tank.bounds[3]) ||
          (Math.abs(x - tank.x) <= 2 && z >= tank.bounds[3] && z <= 20)) paint(x, z, B.PATH);
      for (const cx of [-87, 98]) {
        if (Math.abs(x-cx)<3 && z>=20 && z<=70) paint(x,z,B.PATH);
        if (Math.abs(x-cx)<=20 && z>=66 && z<=107) paint(x,z,B.PATH);
      }
      if (Math.abs(x+87)<9 && Math.abs(z-83)<9) paint(x,z,B.WATER);
      if (x >= -95 && x <= -37 && z >= -27 && z <= 9) {
        const lx = x + 66,
          lz = z + 48;
        paint(
          x,
          z,
          Math.abs(lx) < 3 || (lx + 28) % 8 < 2 || (lz - 20) % 8 < 2
            ? B.PATH
            : B.GRASS,
        );
      }
      if (x >= 24 && x <= 96 && z >= -33 && z <= 12) {
        const lx = x - 60,
          lz = z + 48,
          r = (lx / 30) ** 2 + ((lz - 35) / 21) ** 2;
        paint(
          x,
          z,
          Math.abs(lx) < 3 || (r > 0.82 && r < 1.15) ? B.PATH : B.GRASS,
        );
        if (((Math.abs(lx) - 10) / 5) ** 2 + ((lz - 21) / 2.4) ** 2 < 1)
          paint(x, z, B.WATER);
      }
      if (x >= -33 && x <= 33 && z >= 40 && z <= 63)
        paint(x, z, Math.abs(x) < 4 || z > 58 || z < 44 ? B.PATH : B.GRASS);
      if ((Math.abs(x + 66) < 3 || Math.abs(x - 60) < 3) && z >= 9 && z <= 22)
        paint(x, z, B.PATH);
      if (Math.abs(x) < 3 && z >= 20 && z <= 43) paint(x, z, B.PATH);
    }
}
