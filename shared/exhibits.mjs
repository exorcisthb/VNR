export function makePagoda(l, makeBuilding) {
  const b=makeBuilding(l), f=7.2;
  // Hồ vuông, bờ đá và một trụ chính đỡ Liên Hoa Đài.
  for(const side of [-1,1]){
    b.add(side*9.3,3,0,.6,.5,19.2,'stone');
    b.add(0,3,side*9.3,18,.5,.6,'stone');
    for(let i=-8;i<=8;i+=2){
      b.add(side*9.3,3.5,i,.18,.9,.18,'marble',false);
      if(side<0 || Math.abs(i)>2)b.add(i,3.5,side*9.3,.18,.9,.18,'marble',false);
    }
    b.add(side*9.3,4.3,0,.18,.12,18,'stone',false);
    for(const x of [-5.7,5.7])b.add(x,4.3,side*9.3,6.6,.12,.18,'stone',false);
  }
  // Chừa lối cầu thang qua bờ hồ phía trước.
  b.parts=b.parts.filter(p=>!(p.solid && p.size[0]===18 && p.position[2]===l.z+9.3*l.front));
  for(const x of [-5.7,5.7]) b.add(x,3,9.3,6.6,.5,.6,'stone');
  b.add(0,2.7,0,1.4,4.25,1.4,'granite',true,'cylinder');
  b.add(0,6.85,0,6.7,.35,6.7,'darkwood');
  for(const x of [-1,1])for(const z of [-1,1]){
    const p=b.add(x*1.15,5.2,z*1.15,.22,2.8,.22,'darkwood',false);
    p.rotationX=z*.48;p.rotationZ=-x*.48;
  }
  b.steps(0,3.4,2.1,4.2,21,.48,3);
  const pRise = 4.2, pRun = 21 * 0.48;
  const pAngle = Math.atan2(pRise, pRun);
  const pL = Math.hypot(pRun, pRise);
  for (const side of [-1,1]) {
    const rx = side * 1.15;
    // Tay vịn lan can đá chạy nghiêng liên tục khớp đúng độ dốc bậc đá
    const rail = b.add(rx, 3 + pRise / 2 + 0.82, 3.4 + pRun / 2, 0.14, 0.12, pL, 'stone', false);
    rail.rotationX = pAngle;

    // Thanh giằng đáy lan can đá
    const botRail = b.add(rx, 3 + pRise / 2 + 0.12, 3.4 + pRun / 2, 0.10, 0.08, pL, 'stone', false);
    botRail.rotationX = pAngle;

    // Các con tiện đá hoa sen thanh thoát trên từng bậc thang
    for (let i = 0; i < 21; i++) {
      const z = 3.4 + (21 - 1 - i) * 0.48, y = 3 + (i * pRise) / 21;
      b.add(rx, y, z, 0.08, 0.82, 0.08, 'stone', false);
    }

    // Trụ đá đề-ba chân cầu thang uy nghi với búp sen đá như ảnh thực tế
    b.add(rx, 3, 3.4 + pRun - 0.24, 0.18, 1.05, 0.18, 'stone', false);
    b.add(rx, 4.05, 3.4 + pRun - 0.24, 0.28, 0.38, 0.28, 'stone', false, 'lotusBudFinial');

    // Trụ đá đề-ba đỉnh cầu thang nối vào sàn Liên Hoa Đài với búp sen đá
    b.add(rx, 3 + pRise, 3.4 + 0.24, 0.18, 1.05, 0.18, 'stone', false);
    b.add(rx, 3 + pRise + 1.05, 3.4 + 0.24, 0.28, 0.38, 0.28, 'stone', false, 'lotusBudFinial');

    // Thành chắn va chạm hai bên thang Chùa Một Cột: người chơi tuyệt đối không thể rơi xuống hồ
    b.add(side * 1.25, 3, 3.4 + pRun / 2, 0.35, pRise + 3.0, pRun + 1.0, 'stone', true, 'collision');
  }
  // Khung gỗ, cửa mở, lan can và mái ngói bốn góc cong.
  for(const x of [-2.85,2.85])for(const z of [-2.85,2.85]) b.add(x,f,z,.24,2.8,.24,'darkwood');
  b.add(0,f,-2.95,6,.95,.2,'wood');
  for(const x of [-2.95,2.95]) b.add(x,f,0,.2,.95,6,'wood');
  for(const x of [-2,2]) b.add(x,f,2.95,1.8,.95,.2,'wood');

  // Thành chắn an toàn tuyệt đối trên sàn Liên Hoa Đài (cao tới trần 3.5m):
  // ngăn 100% người chơi rơi ra ngoài dù nhảy hay đứng sát mép lan can
  b.add(-2.95, f, 0, 0.40, 3.5, 6.2, 'wood', true, 'collision');
  b.add(2.95, f, 0, 0.40, 3.5, 6.2, 'wood', true, 'collision');
  b.add(0, f, -2.95, 6.2, 3.5, 0.40, 'wood', true, 'collision');
  for (const x of [-2.05, 2.05])
    b.add(x, f, 2.95, 1.8, 3.5, 0.40, 'wood', true, 'collision');

  for(let i=-2.6;i<=2.6;i+=.4){
    b.add(i,f+1,-2.95,.07,1.4,.1,'darkwood',false);
    for(const x of [-2.95,2.95])b.add(x,f+1,i,.1,1.4,.07,'darkwood',false);
  }
  b.add(0,f+2.55,0,6.3,.24,6.3,'darkwood');
  b.add(0,9.65,0,9.5,2.5,9.5,'pagodaTile',true,'pagodaRoof');
  b.add(0,12.1,0,2.8,.12,.18,'stone',false);
  for(const side of [-1,1]){
    b.add(side*1.5,12.15,0,.24,.4,.24,'bronze',false,'sphere');
    for(const z of [-1,1]){
      const tip=b.add(side*4.45,10.0,z*4.45,.14,.65,.14,'stone',false);
      tip.rotationZ=-side*.48;
    }
  }
  // 1. Ban thờ tam cấp sơn son thếp vàng trang nghiêm theo ảnh thực tế Liên Hoa Đài:
  // Cấp 1 (Chân đế ban thờ gỗ then chạm viền)
  b.add(0, f, -2.0, 2.6, 0.40, 1.35, "darkwood");
  // Cấp 2 (Mặt ban thờ chính sơn son dát vàng)
  b.add(0, f + 0.40, -2.1, 2.4, 0.45, 1.15, "woodpanel");
  b.add(0, f + 0.83, -2.1, 2.44, 0.04, 1.18, "goldLeaf", false);
  // Cấp 3 (Bục ngự tòa sen Phật Bà Quan Âm)
  b.add(0, f + 0.85, -2.3, 1.5, 0.22, 0.75, "darkwood");

  // 2. Tượng Phật Bà Quan Âm ngự tòa sen vàng hào quang rực rỡ (tạc 3D chân thực)
  b.add(0, f + 1.07, -2.3, 1.25, 1.35, 0.85, "goldLeaf", false, "quanAmStatue");

  // 3. Hoành phi sơn son chữ thếp vàng "LIÊN HOA ĐÀI · 蓮花臺" phía trên ban thờ
  b.label("蓮花臺 · LIÊN HOA ĐÀI", 0, f + 2.35, -2.7, 2.4, 0.48, "gov-title");

  // 4. Lư hương đồng cổ kính ở chính giữa ban thờ
  b.add(0, f + 0.85, -1.65, 0.38, 0.26, 0.38, "bronze", false, "cylinder");
  b.add(0, f + 1.11, -1.65, 0.08, 0.16, 0.08, "ochre", false, "cylinder");

  // 5. Mâm bồng ngũ quả dâng Phật hai bên (cam, bưởi, phật thủ vàng ươm)
  b.add(-0.68, f + 0.85, -1.75, 0.42, 0.12, 0.42, "bronze", false, "cylinder");
  b.add(-0.68, f + 0.97, -1.75, 0.36, 0.24, 0.36, "ochre", false, "sphere");
  b.add(0.68, f + 0.85, -1.75, 0.42, 0.12, 0.42, "bronze", false, "cylinder");
  b.add(0.68, f + 0.97, -1.75, 0.36, 0.24, 0.36, "ochre", false, "sphere");

  // 6. Đôi lộc bình cắm hoa sen hồng / cúc vàng thanh tịnh hai bên
  b.add(-0.98, f + 0.85, -2.15, 0.22, 0.55, 0.22, "bronze", false, "cylinder");
  b.add(-0.98, f + 1.40, -2.15, 0.35, 0.38, 0.35, "lotusPink", false, "sphere");
  b.add(0.98, f + 0.85, -2.15, 0.22, 0.55, 0.22, "bronze", false, "cylinder");
  b.add(0.98, f + 1.40, -2.15, 0.35, 0.38, 0.35, "lotusPink", false, "sphere");

  // 7. Hòm công đức gỗ trước ban thờ như ảnh thực tế
  b.add(0, f, -1.05, 0.58, 0.65, 0.45, "darkwood");
  b.add(0, f + 0.65, -1.05, 0.32, 0.02, 0.06, "goldLeaf", false);
  b.label("HÒM CÔNG ĐỨC", 0, f + 0.42, -0.82, 0.52, 0.16);

  // 8. Đôi chậu quất cảnh thế trĩu quả vàng đặt trang trọng hai bên cửa đài (chuẩn ảnh thực tế)
  for (const side of [-1, 1]) {
    const qx = side * 1.85, qz = 2.45;
    b.add(qx, f, qz, 0.45, 0.35, 0.45, "terracotta", false);
    b.add(qx, f + 0.35, qz, 0.55, 0.65, 0.55, "greenery", false, "sphere");
    b.add(qx, f + 0.55, qz, 0.60, 0.45, 0.60, "ochre", false, "sphere");
    b.add(qx - side * 0.12, f + 0.68, qz + 0.10, 0.22, 0.22, 0.22, "ochre", false, "sphere");
    b.add(qx + side * 0.10, f + 0.72, qz - 0.10, 0.22, 0.22, 0.22, "ochre", false, "sphere");
  }

  // Hoành phi truyền thống "LIÊN HOA ĐÀI · 蓮花臺" phía trên cửa đài
  b.label('LIÊN HOA ĐÀI · 蓮花臺', 0, 9.45, 3.05, 2.8, 0.45, 'hoanh-phi');
  b.room('lotus-pavilion','Liên Hoa Đài · Chùa Một Cột',-2.8,-2.8,2.8,2.9,f,
    'Đài gỗ trên một trụ đá giữa hồ, mái cong và lối lên bằng bậc đá. Kích thước, đồ thờ và chi tiết được tái hiện tôn kính theo hình ảnh thực tế.',l.source);
  b.rooms.at(-1).spawn={x:l.x,y:f+.025,z:l.z+1.7*l.front,yaw:Math.PI};
  b.light(0, f + 2.3, -1.8, '#ffe099', 25);
  return b;
}
export function makeDrum(l, makeBuilding){
  const b=makeBuilding(l),base=3.5;
  b.add(0,3,0,15,.25,15,'granite',false,'cylinder');
  b.add(0,3.25,0,9,.25,9,'blackmarble',false,'cylinder');
  b.add(0,base,0,7.4,4.2,7.4,'drumBronze',false,'drumBody');
  // Collision par rangées: empreinte arrondie du corps, pas un grand cube invisible.
  for(let z=-3.3;z<=3.3;z+=.55){
    const width=2*Math.sqrt(3.7**2-(Math.abs(z)+.275)**2);
    b.add(0,3,z,width,4.7,.55,'bronze',true,'collision');
  }
  b.add(0,7.701,0,7.4,.018,7.4,'drumFace',false,'drumDisc');
  for(const y of [3.58,4.65,6.15,7.5])b.add(0,y,0,y<4?6.7:y<6?5.3:7.25,.065,y<4?6.7:y<6?5.3:7.25,'bronze',false,'horizontalRing');
  for(const x of [-1,1])for(const z of [-1,1]){
    const p=b.add(x*3,5.1,z*.85,.85,1.1,.85,'bronze',false,'handle');
    p.rotationY=x*Math.PI/2;
  }
  // Đài quan sát riêng giúp nhìn được hoa văn mặt trống mà không trèo lên hiện vật.
  b.add(9, 7.95, 0, 4, 0.25, 8, "stone");
  b.steps(9, 4, 2.4, 5.2, 26, 0.4, 3);

  // Lan can tay vịn dốc nghiêng liên tục hai bên bậc thang lên đài ngắm Trống Đồng
  const dRise = 5.2, dRun = 26 * 0.4;
  const dAngle = Math.atan2(dRise, dRun);
  const dL = Math.hypot(dRun, dRise);
  for (const side of [-1, 1]) {
    const rx = 9 + side * 1.25;
    // Tay vịn gỗ vát nghiêng liên tục chạy suốt nhịp thang
    const rail = b.add(rx, 3 + dRise / 2 + 0.88, 4 + dRun / 2, 0.12, 0.08, dL, "wood", false);
    rail.rotationX = dAngle;

    // Thanh dầm đáy lan can
    const botRail = b.add(rx, 3 + dRise / 2 + 0.12, 4 + dRun / 2, 0.08, 0.06, dL, "bronze", false);
    botRail.rotationX = dAngle;

    // Nan con tiện đứng trên từng bậc thang
    for (let i = 0; i < 26; i++) {
      const z = 4 + (26 - 1 - i) * 0.4 + 0.2;
      const y = 3 + (i * dRise) / 26;
      b.add(rx, y, z, 0.07, 0.88, 0.07, "bronze", false);
    }

    // Trụ đề-ba chân cầu thang
    b.add(rx, 3, 4 + dRun - 0.2, 0.18, 1.15, 0.18, "wood", false);
    b.add(rx, 4.15, 4 + dRun - 0.2, 0.22, 0.22, 0.22, "bronze", false, "sphere");

    // Trụ đề-ba đỉnh cầu thang
    b.add(rx, 3 + dRise, 4 + 0.2, 0.18, 1.15, 0.18, "wood", false);
    b.add(rx, 3 + dRise + 1.15, 4 + 0.2, 0.22, 0.22, 0.22, "bronze", false, "sphere");

    // Thành chắn va chạm tuyệt đối hai bên thang
    b.add(9 + side * 1.35, 3, 4 + dRun / 2, 0.35, dRise + 2.5, dRun, "stone", true, "collision");
  }

  // Lan can kiên cố và tấm kính an toàn quanh đài ngắm:
  // 1. Dọc hai mép bên (x = 7 và x = 11)
  for (const x of [7, 11]) {
    b.add(x, 9.25, 0, 0.12, 0.08, 8.1, "bronze", false);
    b.add(x, 8.28, 0, 0.08, 0.06, 8.1, "bronze", false);
    for (let z = -4; z <= 4; z += 1.33)
      b.add(x, 8.2, z, 0.08, 1.1, 0.08, "bronze", false);
    b.add(x, 8.32, 0, 0.03, 0.92, 8.0, "glass", false);
  }

  // 2. Mép sau của đài ngắm (z = -4)
  b.add(9, 9.25, -4, 4.1, 0.08, 0.12, "bronze", false);
  b.add(9, 8.28, -4, 4.1, 0.06, 0.08, "bronze", false);
  for (let x = 7.5; x <= 10.5; x += 1.0)
    b.add(x, 8.2, -4, 0.08, 1.1, 0.08, "bronze", false);
  b.add(9, 8.32, -4, 4.0, 0.92, 0.03, "glass", false);

  // THÀNH CHẮN VA CHẠM TUYỆT ĐỐI NGĂN NGƯỜI CHƠI RƠI KHỎI ĐÀI QUAN SÁT:
  // Mép trước nhìn về trống đồng (x = 7): người chơi dựa sát vào lan can ngắm cảnh không bao giờ bị rơi
  b.add(6.85, 8.2, 0, 0.30, 2.5, 8.2, "stone", true, "collision");
  // Mép ngoài (x = 11)
  b.add(11.15, 8.2, 0, 0.30, 2.5, 8.2, "stone", true, "collision");
  // Mép sau (z = -4.55)
  b.add(9, 8.2, -4.55, 4.4, 2.5, 0.30, "stone", true, "collision");
  b.label('TRỐNG ĐỒNG ĐÔNG SƠN · CAO 4,2 M',0,4.15,7.5,7,.65);
  b.room('drum-overlook','Đài ngắm mặt trống Đông Sơn',7,-3.8,11,3.8,8.2,
    'Mô hình phóng lớn: thân trống cao 4,2 m, mặt rộng 7,4 m. Hoa văn ngôi sao, chim và các vành đồng tâm được vẽ lại bằng code; không sao chép nguyên mẫu một bảo vật.',l.source);
  b.rooms.at(-1).spawn={x:l.x+9,y:8.225,z:l.z,yaw:Math.PI/2};
  return b;
}
