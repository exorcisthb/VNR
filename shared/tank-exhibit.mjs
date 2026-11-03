export const TANK_DISPLAY = Object.freeze({
  width: 9.6,
  baseY: 3.42,
  railHalfWidth: 7.6,
  railHalfDepth: 5.6,
  barrierHeight: 8,
});

export const TANK_LANDMARK = {
  id: 'tank',
  name: 'Khu trưng bày xe tăng',
  city: 'Không gian trưng bày ngoài trời',
  x: 110,
  z: -10,
  front: 1,
  bounds: [98, 126, -22, 6],
  sign: { x: 121, z: 7 },
  approach: 24,
  outdoor: true,
  description: 'Khu trưng bày xe tăng ngoài trời trên bục đá, có lối đi quan sát quanh bốn phía. Vui lòng đứng ngoài hàng rào để bảo vệ hiện vật.',
  source: 'https://dsvh.gov.vn/xe-tang-t59-so-hieu-390-3035',
};

export function makeTankExhibit(l, makeBuilding) {
  const b = makeBuilding(l);
  const { width, baseY, railHalfWidth: rx, railHalfDepth: rz, barrierHeight } = TANK_DISPLAY;
  // A low stone plinth supports the scan without stretching its native axes.
  b.add(0, 3, 0, 12.6, 0.30, 7.6, 'granite', false);
  b.add(0, 3.30, 0, 12.2, 0.12, 7.2, 'blackmarble', false);
  b.modelDisplays = [{
    model: 'tank',
    loadDistance: 80,
    placement: { position: [l.x, baseY, l.z], width, rotationY: 0 },
  }];

  // All four sides are closed, including the corners. Posts and rails are
  // visible; the continuous shared collision volume also blocks jump attempts.
  for (const side of [-1, 1]) {
    for (const height of [0.35, 0.83, 1.31]) {
      b.add(0, 3 + height, side * rz, rx * 2 + 0.18, 0.07, 0.07, 'screen', false);
      b.add(side * rx, 3 + height, 0, 0.07, 0.07, rz * 2 + 0.18, 'screen', false);
    }
    for (let i = 0; i <= 8; i++) {
      const x = -rx + i * rx * 2 / 8;
      b.add(x, 3, side * rz, 0.12, 1.48, 0.12, 'screen', false);
      b.add(x, 4.48, side * rz, 0.17, 0.12, 0.17, 'bronze', false, 'sphere');
      b.add(x, 3, side * rz, 0.30, 0.07, 0.30, 'granite', false);
    }
    for (let i = 1; i < 6; i++) {
      const z = -rz + i * rz * 2 / 6;
      b.add(side * rx, 3, z, 0.12, 1.48, 0.12, 'screen', false);
      b.add(side * rx, 4.48, z, 0.17, 0.12, 0.17, 'bronze', false, 'sphere');
      b.add(side * rx, 3, z, 0.30, 0.07, 0.30, 'granite', false);
    }
  }
  b.add(0, 3, 0, rx * 2 + 0.18, barrierHeight, rz * 2 + 0.18, 'screen', true, 'collision');
  b.parts.at(-1).model = 'tankExclusion';

  // The sign stays outside the fence and leaves the perimeter walkway clear.
  for (const x of [-2.1, 2.1]) b.add(x, 3, rz + 1.8, 0.10, 1.75, 0.10, 'screen', false);
  b.add(0, 3.76, rz + 1.8, 5.3, 1.18, 0.12, 'darkwood', false);
  b.label('KHU TRƯNG BÀY XE TĂNG', 0, 4.57, rz + 1.88, 5.1, 0.48);
  b.label('VUI LÒNG ĐỨNG NGOÀI HÀNG RÀO', 0, 4.10, rz + 1.88, 5.1, 0.34);
  return b;
}
