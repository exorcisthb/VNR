import * as THREE from 'three';

function bronzePattern(face) {
  const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;
  const c=canvas.getContext('2d'), gold='#d5b76a';
  const bg=c.createLinearGradient(0,0,1024,1024);bg.addColorStop(0,'#b39651');bg.addColorStop(.45,'#6a522b');bg.addColorStop(1,'#c1a05b');
  c.fillStyle=bg;c.fillRect(0,0,1024,1024);c.strokeStyle=gold;c.fillStyle=gold;
  const line=(points,close=false)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));if(close)c.closePath();c.stroke();};
  const bird=()=>{c.lineWidth=4;line([[-23,7],[-4,-6],[14,-4],[28,-12],[18,-1],[7,1],[-3,13],[-23,7]],true);line([[-3,-4],[-19,-30],[6,-14],[12,-5]],true);line([[-3,11],[-10,20],[-19,20]]);};
  if(face){
    c.translate(512,512);
    for(const r of [95,109,120,137,146,211,223,235,252,268,344,354,367,384,396,461,473,485,496]){c.lineWidth=r%2?3:2;c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.stroke();}
    c.beginPath();for(let i=0;i<28;i++){const a=-Math.PI/2+i*Math.PI/14,r=i%2?42:94;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?c.lineTo(x,y):c.moveTo(x,y);}c.closePath();c.fill();
    for(const [r,count,size] of [[129,60,5],[242,100,5],[375,128,4],[480,160,3]])for(let i=0;i<count;i++){
      c.save();c.rotate(i*Math.PI*2/count);c.translate(0,-r);c.lineWidth=2;line([[-size,size],[0,-size],[size,size]],true);c.restore();
    }
    for(let i=0;i<18;i++){c.save();c.rotate(i*Math.PI*2/18);c.translate(0,-427);bird();c.restore();}
    // Người múa cách điệu, vành sinh hoạt, hình học nguyên gốc của dự án.
    for(let i=0;i<24;i++){
      c.save();c.rotate(i*Math.PI*2/24);c.translate(0,-303);c.lineWidth=4;
      c.beginPath();c.arc(0,-13,5,0,7);c.stroke();line([[0,-8],[0,13],[-11,25]]);line([[0,13],[13,24]]);line([[-16,-5],[0,0],[17,-13]]);line([[-6,-20],[-15,-35],[5,-25]]);c.restore();
    }
    for(let i=0;i<48;i++){c.save();c.rotate(i*Math.PI*2/48);c.translate(0,-178);c.lineWidth=2;line([[-8,-15],[8,-15],[8,15],[-8,15]],true);line([[-8,-7],[3,-7],[3,7],[-8,7]]);c.restore();}
  }else{
    for(let y=18;y<1024;y+=120){
      c.lineWidth=4;for(const dy of [0,8,41,49,100])line([[0,y+dy],[1024,y+dy]]);
      for(let x=0;x<1024;x+=24){c.lineWidth=2;line([[x,y+12],[x+12,y+36],[x+24,y+12]],true);c.beginPath();c.arc(x+12,y+73,7,0,7);c.stroke();}
    }
    for(let x=40;x<1024;x+=128){c.save();c.translate(x,512);bird();c.restore();}
  }
  const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}
function dragonCarpetPattern() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1024;
  const c = canvas.getContext("2d");

  // Nền đỏ thắm hoàng triều
  const cx = 512, cy = 512;
  const bg = c.createRadialGradient(cx, cy, 50, cx, cy, 512);
  bg.addColorStop(0, "#b21818");
  bg.addColorStop(0.65, "#931313");
  bg.addColorStop(0.95, "#750e0e");
  bg.addColorStop(1, "#540909");
  c.fillStyle = bg;
  c.beginPath();
  c.arc(cx, cy, 510, 0, Math.PI * 2);
  c.fill();

  // Vành viền chỉ vàng và hoa văn hồi văn chữ Vạn hoàng gia
  c.strokeStyle = "#ffd54f";
  c.lineWidth = 14;
  c.stroke();
  c.strokeStyle = "#c59a38";
  c.lineWidth = 5;
  c.beginPath();
  c.arc(cx, cy, 492, 0, Math.PI * 2);
  c.stroke();

  // Vành hoa văn hồi văn chữ Vạn / kỷ hà cổ truyền
  c.strokeStyle = "rgba(255, 213, 79, 0.75)";
  c.lineWidth = 3;
  for (const r of [450, 475]) {
    c.beginPath();
    c.arc(cx, cy, r, 0, Math.PI * 2);
    c.stroke();
  }
  for (let i = 0; i < 64; i++) {
    const a = (i * Math.PI * 2) / 64;
    c.beginPath();
    c.moveTo(cx + Math.cos(a) * 452, cy + Math.sin(a) * 452);
    c.lineTo(cx + Math.cos(a + 0.05) * 473, cy + Math.sin(a + 0.05) * 473);
    c.stroke();
  }

  // Vòng hoa sen và vân mây cung đình
  for (let i = 0; i < 24; i++) {
    const a = (i * Math.PI * 2) / 24;
    const rx = cx + Math.cos(a) * 415;
    const ry = cy + Math.sin(a) * 415;
    c.save();
    c.translate(rx, ry);
    c.rotate(a + Math.PI / 2);
    c.fillStyle = "#ffca28";
    c.beginPath();
    c.arc(0, 0, 14, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "#c59a38";
    c.lineWidth = 2;
    c.stroke();
    c.restore();
  }

  // Tâm thảm: Vầng thái dương và chữ Thọ cung đình tròn
  const sunGrad = c.createRadialGradient(cx, cy, 20, cx, cy, 140);
  sunGrad.addColorStop(0, "#ffe082");
  sunGrad.addColorStop(0.5, "#ffd54f");
  sunGrad.addColorStop(1, "#c59a38");
  c.fillStyle = sunGrad;
  c.beginPath();
  c.arc(cx, cy, 140, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "#8d6e1f";
  c.lineWidth = 5;
  c.stroke();

  c.fillStyle = "#8d1313";
  c.beginPath();
  c.arc(cx, cy, 95, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "#ffd54f";
  c.lineWidth = 4;
  c.stroke();

  c.fillStyle = "#ffd54f";
  c.font = "bold 64px 'Times New Roman', serif";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText("壽", cx, cy);

  // Đôi Rồng Vàng thời Nguyễn thêu nổi uốn lượn chầu mặt trời
  const drawDragon = (flip = 1) => {
    c.save();
    c.translate(cx, cy);
    c.scale(flip, 1);
    c.strokeStyle = "#ffd54f";
    c.lineWidth = 28;
    c.lineCap = "round";
    c.lineJoin = "round";

    // Thân rồng uốn lượn hình sin mềm mại
    c.beginPath();
    c.moveTo(110, -80);
    c.bezierCurveTo(220, -220, 360, -140, 310, 20);
    c.bezierCurveTo(280, 160, 180, 240, 260, 320);
    c.stroke();

    // Vảy rồng thếp vàng óng ánh
    c.strokeStyle = "#ffe082";
    c.lineWidth = 14;
    c.stroke();

    // Đầu rồng hướng về tâm
    c.fillStyle = "#ffd54f";
    c.beginPath();
    c.arc(95, -75, 32, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.moveTo(95, -75);
    c.lineTo(45, -60);
    c.lineTo(65, -85);
    c.lineTo(35, -115);
    c.lineTo(85, -95);
    c.closePath();
    c.fill();

    // Râu rồng
    c.strokeStyle = "#fff59d";
    c.lineWidth = 4;
    c.beginPath();
    c.moveTo(50, -65);
    c.quadraticCurveTo(10, -50, -10, -85);
    c.stroke();

    // Mắt rồng
    c.fillStyle = "#ffffff";
    c.beginPath();
    c.arc(75, -82, 6, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#000000";
    c.beginPath();
    c.arc(75, -82, 3, 0, Math.PI * 2);
    c.fill();

    // Ngũ trảo (móng rồng)
    for (const [cx4, cy4] of [[180, -140], [330, -50], [280, 140], [240, 260]]) {
      c.strokeStyle = "#ffd54f";
      c.lineWidth = 7;
      c.beginPath();
      c.moveTo(cx4, cy4);
      c.lineTo(cx4 + 30, cy4 + 20);
      c.lineTo(cx4 + 40, cy4 + 10);
      c.moveTo(cx4 + 30, cy4 + 20);
      c.lineTo(cx4 + 35, cy4 + 35);
      c.stroke();
    }

    // Vân mây ngũ sắc
    c.fillStyle = "rgba(255, 224, 130, 0.65)";
    for (const [mx, my] of [[160, 40], [240, -180], [350, 80]]) {
      c.beginPath();
      c.arc(mx, my, 22, 0, Math.PI * 2);
      c.arc(mx + 20, my - 6, 18, 0, Math.PI * 2);
      c.arc(mx - 18, my - 4, 16, 0, Math.PI * 2);
      c.fill();
    }

    c.restore();
  };

  drawDragon(1);
  drawDragon(-1);

  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function goldCarpetPattern() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const c = canvas.getContext("2d");
  const bg = c.createLinearGradient(0, 0, 512, 512);
  bg.addColorStop(0, "#d8a83d");
  bg.addColorStop(0.5, "#c2912a");
  bg.addColorStop(1, "#b5841e");
  c.fillStyle = bg;
  c.fillRect(0, 0, 512, 512);

  c.strokeStyle = "rgba(255, 236, 179, 0.35)";
  c.lineWidth = 2;
  for (let y = 0; y < 512; y += 32) {
    c.beginPath();
    c.moveTo(0, y);
    c.lineTo(512, y);
    c.stroke();
  }
  for (let x = 0; x < 512; x += 32) {
    c.beginPath();
    c.moveTo(x, 0);
    c.lineTo(x, 512);
    c.stroke();
  }
  c.fillStyle = "rgba(255, 248, 225, 0.4)";
  for (let y = 16; y < 512; y += 32)
    for (let x = 16; x < 512; x += 32) {
      c.beginPath();
      c.arc(x, y, 4, 0, Math.PI * 2);
      c.fill();
    }
  c.strokeStyle = "#ffe082";
  c.lineWidth = 8;
  c.strokeRect(12, 12, 488, 488);
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(4, 4);
  return t;
}

export function heritageMaterials(){
  const face=bronzePattern(true),body=bronzePattern(false);
  const tiles=document.createElement('canvas');tiles.width=tiles.height=256;const c=tiles.getContext('2d');
  c.fillStyle='#50493e';c.fillRect(0,0,256,256);for(let y=0;y<256;y+=16)for(let x=0;x<256;x+=12){c.fillStyle=(x/12+y/16)%3?'#6f6655':'#847765';c.fillRect(x+(y%32?6:0),y,10,13);}
  const tileMap=new THREE.CanvasTexture(tiles);tileMap.colorSpace=THREE.SRGBColorSpace;tileMap.wrapS=tileMap.wrapT=THREE.RepeatWrapping;tileMap.repeat.set(5,5);
  return {
    drumFace:new THREE.MeshStandardMaterial({map:face,bumpMap:face,bumpScale:.035,metalness:.72,roughness:.43}),
    drumBronze:new THREE.MeshStandardMaterial({map:body,bumpMap:body,bumpScale:.025,metalness:.65,roughness:.48}),
    pagodaTile:new THREE.MeshStandardMaterial({map:tileMap,roughness:.95,side:THREE.DoubleSide}),
    whiteUniform:new THREE.MeshStandardMaterial({color:'#f8f9fa',roughness:0.85}),
    armyUniform:new THREE.MeshStandardMaterial({color:'#2b5134',roughness:0.88}),
    shroudRed:new THREE.MeshStandardMaterial({color:'#b71c1c',roughness:0.75}),
    dragonCarpet:new THREE.MeshStandardMaterial({map:dragonCarpetPattern(),roughness:0.85,metalness:0.08}),
    goldCarpet:new THREE.MeshStandardMaterial({map:goldCarpetPattern(),roughness:0.82,metalness:0.05}),
  };
}
export function heritageGeometries(){
  // Sculpted concrete brise-soleil: tapered ends and a softly swelling centre.
  const blade = new THREE.Shape();
  blade.moveTo(-0.12, -0.5);
  blade.bezierCurveTo(-0.12, -0.28, -0.5, -0.18, -0.5, 0);
  blade.bezierCurveTo(-0.5, 0.18, -0.12, 0.28, -0.12, 0.5);
  blade.lineTo(0.12, 0.5);
  blade.bezierCurveTo(0.12, 0.28, 0.5, 0.18, 0.5, 0);
  blade.bezierCurveTo(0.5, -0.18, 0.12, -0.28, 0.12, -0.5);
  blade.closePath();
  const palaceBlade = new THREE.ExtrudeGeometry(blade, {
    depth: 1, bevelEnabled: false, curveSegments: 10,
  });
  palaceBlade.translate(0, 0, -0.5);
  const vertices=[],uv=[],indices=[],n=32;
  for(let z=0;z<=n;z++)for(let x=0;x<=n;x++){
    const xx=x/n-.5,zz=z/n-.5,t=Math.max(Math.abs(xx),Math.abs(zz))*2;
    const yy=.5-1.3*t+.3*t**6+.18*(Math.abs(xx*zz)*4)**4;
    vertices.push(xx,yy,zz);uv.push(x/n,z/n);
  }
  for(let z=0;z<n;z++)for(let x=0;x<n;x++){const a=z*(n+1)+x;indices.push(a,a+n+1,a+1,a+1,a+n+1,a+n+2);}
  const roof=new THREE.BufferGeometry();roof.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));roof.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));roof.setIndex(indices);roof.computeVertexNormals();
  // Tang phình, thân thắt và chân loe theo dáng trống tham khảo.
  const profile=[[.44,-.5],[.46,-.48],[.4,-.36],[.345,-.25],[.34,.03],[.42,.12],[.49,.3],[.5,.44],[.5,.5],[0,.5]].map(([r,y])=>new THREE.Vector2(r,y));
  const disc=new THREE.CircleGeometry(.5,96);disc.rotateX(-Math.PI/2);
  const ring=new THREE.TorusGeometry(.5,.014,6,96);ring.rotateX(-Math.PI/2);
  return {
    palaceBlade,
    pagodaRoof:roof,
    drumBody:new THREE.LatheGeometry(profile,96),
    drumDisc:disc,
    horizontalRing:ring,
    handle:new THREE.TorusGeometry(.4,.08,8,24),
    hoChiMinhBust:createHoChiMinhBust(),
    quanAmStatue:createQuanAmStatue(),
    restingPresident:createRestingPresident(),
    honorGuard:createHonorGuard(),
    lotusBudFinial:createLotusBudFinial(),
  };
}

function createQuanAmStatue() {
  const parts = [];
  const add = (geom, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Matrix4();
    const rot = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz));
    const sc = new THREE.Matrix4().makeScale(sx, sy, sz);
    const tr = new THREE.Matrix4().makeTranslation(x, y, z);
    m.multiply(tr).multiply(rot).multiply(sc);
    parts.push({ geom, matrix: m });
  };

  // 1. Đài sen vàng đa tầng (Lotus Throne)
  add(new THREE.CylinderGeometry(0.38, 0.44, 0.08, 28), 0, 0.04, 0);
  add(new THREE.CylinderGeometry(0.32, 0.38, 0.08, 28), 0, 0.11, 0);
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI * 2) / 16;
    add(new THREE.ConeGeometry(0.065, 0.16, 10), Math.cos(a) * 0.34, 0.16, Math.sin(a) * 0.34, -0.25, a, 0);
  }

  // 2. Tọa thiền kiết già (Lotus Posture)
  add(new THREE.CylinderGeometry(0.28, 0.32, 0.14, 24), 0, 0.24, 0, 0, 0, 0, 1.45, 1, 0.9);

  // 3. Thân áo cà sa mạ vàng (Robed Torso & Shoulders)
  add(new THREE.CylinderGeometry(0.18, 0.15, 0.32, 24), 0, 0.44, 0);
  add(new THREE.SphereGeometry(0.09, 14, 10), -0.16, 0.52, 0);
  add(new THREE.SphereGeometry(0.09, 14, 10), 0.16, 0.52, 0);

  // 4. Hai tay chính chắp ấn Liên hoa / Tam muội
  add(new THREE.CylinderGeometry(0.035, 0.04, 0.22, 12), -0.10, 0.44, 0.10, 0.65, 0.35, -0.2);
  add(new THREE.CylinderGeometry(0.035, 0.04, 0.22, 12), 0.10, 0.44, 0.10, 0.65, -0.35, 0.2);
  add(new THREE.SphereGeometry(0.045, 10, 8), 0, 0.48, 0.18);

  // 5. Cánh tay phụ tỏa ra hai bên (Tượng Quan Âm nghìn tay nghìn mắt truyền thống)
  for (const side of [-1, 1]) {
    for (let j = 0; j < 4; j++) {
      const angle = 0.25 + j * 0.32;
      add(new THREE.CylinderGeometry(0.022, 0.025, 0.28, 8), side * (0.16 + Math.cos(angle) * 0.14), 0.46 + Math.sin(angle) * 0.14, -0.02, 0, 0, -side * angle);
      add(new THREE.SphereGeometry(0.025, 8, 6), side * (0.16 + Math.cos(angle) * 0.26), 0.46 + Math.sin(angle) * 0.26, -0.02);
    }
  }

  // 6. Cổ và Khuôn mặt Bồ Tát từ bi, thanh thoát
  add(new THREE.CylinderGeometry(0.065, 0.08, 0.10, 16), 0, 0.63, 0.01);
  add(new THREE.SphereGeometry(0.125, 24, 18), 0, 0.74, 0.02, 0, 0, 0, 0.95, 1.15, 1.0);
  // Mũ miện Phật Bà (Bodhisattva crown)
  add(new THREE.CylinderGeometry(0.11, 0.13, 0.14, 20), 0, 0.85, 0.01);
  add(new THREE.ConeGeometry(0.06, 0.16, 12), 0, 0.95, 0.01);

  // 7. Vầng hào quang lửa vàng sau lưng (Radiant Halo Aureole)
  add(new THREE.CylinderGeometry(0.48, 0.48, 0.025, 32), 0, 0.65, -0.10, Math.PI / 2, 0, 0, 1, 1, 1.25);
  for (let i = 0; i < 20; i++) {
    const a = (i * Math.PI * 2) / 20;
    add(new THREE.ConeGeometry(0.035, 0.12, 8), Math.cos(a) * 0.48, 0.65 + Math.sin(a) * 0.58, -0.10, 0, 0, a - Math.PI / 2);
  }

  let totalVerts = 0;
  for (const { geom } of parts) {
    const nonIndexed = geom.toNonIndexed();
    totalVerts += nonIndexed.attributes.position.count;
    nonIndexed.dispose();
  }
  const positions = new Float32Array(totalVerts * 3);
  let offset = 0;
  for (const { geom, matrix } of parts) {
    const g = geom.clone();
    if (matrix) g.applyMatrix4(matrix);
    const nonIndexed = g.toNonIndexed();
    const pos = nonIndexed.attributes.position;
    positions.set(pos.array, offset * 3);
    offset += pos.count;
    g.dispose();
    nonIndexed.dispose();
    geom.dispose();
  }
  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.computeBoundingBox();

  // Chuẩn hóa Bounding Box để tượng đặt vững chãi trên ban thờ
  const bb = merged.boundingBox;
  const size = new THREE.Vector3();
  bb.getSize(size);
  const center = new THREE.Vector3();
  bb.getCenter(center);
  merged.translate(-center.x, -bb.min.y, -center.z);
  merged.scale(1 / Math.max(0.001, size.x), 1 / Math.max(0.001, size.y), 1 / Math.max(0.001, size.z));
  merged.translate(0, -0.5, 0);

  merged.computeVertexNormals();
  return merged;
}

function createHoChiMinhBust() {
  const parts = [];
  const add = (geom, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Matrix4();
    const rot = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz));
    const sc = new THREE.Matrix4().makeScale(sx, sy, sz);
    const tr = new THREE.Matrix4().makeTranslation(x, y, z);
    m.multiply(tr).multiply(rot).multiply(sc);
    parts.push({ geom, matrix: m });
  };

  // 1. Đế tượng đồng bán thân uy nghiêm đa tầng (Plinth tiers)
  add(new THREE.CylinderGeometry(0.36, 0.42, 0.08, 32), 0, 0.04, 0);
  add(new THREE.CylinderGeometry(0.30, 0.35, 0.07, 32), 0, 0.11, 0);
  add(new THREE.CylinderGeometry(0.24, 0.28, 0.07, 32), 0, 0.175, 0);

  // 2. Thân áo đại cán / Áo kaki 4 túi đặc trưng của Bác (Torso & Shoulders)
  add(new THREE.CylinderGeometry(0.34, 0.26, 0.28, 32), 0, 0.32, 0, 0, 0, 0, 1.35, 1, 0.85);
  add(new THREE.BoxGeometry(0.80, 0.26, 0.38), 0, 0.44, 0.01);
  // Bờ vai xuôi tự nhiên hai bên
  add(new THREE.SphereGeometry(0.22, 20, 16), -0.34, 0.42, 0, 0, 0, 0, 1.1, 0.85, 0.9);
  add(new THREE.SphereGeometry(0.22, 20, 16), 0.34, 0.42, 0, 0, 0, 0, 1.1, 0.85, 0.9);
  // Nẹp cúc áo ngực và vạt áo đại cán
  add(new THREE.BoxGeometry(0.045, 0.32, 0.03), 0, 0.42, 0.20);
  add(new THREE.CylinderGeometry(0.015, 0.015, 0.03, 12), 0, 0.48, 0.21, Math.PI / 2, 0, 0);
  add(new THREE.CylinderGeometry(0.015, 0.015, 0.03, 12), 0, 0.38, 0.21, Math.PI / 2, 0, 0);

  // 3. Cổ áo đứng lãnh tụ (High Mandarin Collar) & Cổ
  add(new THREE.CylinderGeometry(0.165, 0.185, 0.12, 28), 0, 0.58, 0.02);
  add(new THREE.CylinderGeometry(0.13, 0.145, 0.14, 24), 0, 0.68, 0.015);

  // 4. Đầu và hộp sọ (Cranium & Facial structure)
  add(new THREE.SphereGeometry(0.185, 32, 24), 0, 0.86, 0.02, 0, 0, 0, 0.96, 1.16, 1.05);
  // Vầng trán cao rộng, uyên bác (High noble forehead)
  add(new THREE.SphereGeometry(0.165, 24, 18), 0, 0.94, 0.065, 0, 0, 0, 1.05, 0.92, 0.95);

  // 5. Cung mày và hốc mắt hiền từ (Gentle brow & sculpted eyelids)
  add(new THREE.BoxGeometry(0.17, 0.035, 0.05), 0, 0.88, 0.14, -0.1, 0, 0);
  add(new THREE.SphereGeometry(0.042, 14, 10), -0.065, 0.84, 0.14, 0, 0, 0, 1.1, 0.65, 0.8);
  add(new THREE.SphereGeometry(0.042, 14, 10), 0.065, 0.84, 0.14, 0, 0, 0, 1.1, 0.65, 0.8);

  // 6. Sống mũi thanh tú, trang nghiêm (Sculpted Nose)
  add(new THREE.BoxGeometry(0.044, 0.11, 0.05), 0, 0.81, 0.175, -0.16, 0, 0);
  add(new THREE.SphereGeometry(0.034, 12, 10), 0, 0.755, 0.198);
  add(new THREE.SphereGeometry(0.022, 10, 8), -0.038, 0.745, 0.175);
  add(new THREE.SphereGeometry(0.022, 10, 8), 0.038, 0.745, 0.175);

  // 7. Gò má và cằm hiền hậu (Cheeks & Chin)
  add(new THREE.SphereGeometry(0.115, 16, 14), -0.095, 0.77, 0.08);
  add(new THREE.SphereGeometry(0.115, 16, 14), 0.095, 0.77, 0.08);
  add(new THREE.SphereGeometry(0.078, 14, 12), 0, 0.68, 0.125);

  // 8. Hai tai cân đối, phúc hậu (Ears)
  add(new THREE.SphereGeometry(0.055, 12, 10), -0.18, 0.81, -0.01, 0, 0, 0, 0.35, 1.25, 0.75);
  add(new THREE.SphereGeometry(0.055, 12, 10), 0.18, 0.81, -0.01, 0, 0, 0, 0.35, 1.25, 0.75);

  // 9. Mái tóc hoa râm chải ngược gọn gàng (Hair swept back)
  add(new THREE.SphereGeometry(0.20, 28, 20), 0, 0.90, -0.04, 0, 0, 0, 1.0, 1.05, 1.12);
  add(new THREE.CylinderGeometry(0.155, 0.135, 0.18, 22), 0, 0.73, -0.075);

  // 10. Ria mép đặc trưng của Bác (Characteristic Mustache)
  add(new THREE.CylinderGeometry(0.022, 0.014, 0.15, 14), 0, 0.725, 0.182, 0, 0, Math.PI / 2);

  // 11. Chòm râu dài thước tha đặc trưng của Bác Hồ (Flowing Beard pointing DOWNWARD)
  // Đỉnh nón quay xuống dưới tự nhiên theo chiều trọng lực
  add(new THREE.ConeGeometry(0.072, 0.18, 18), 0, 0.60, 0.165, Math.PI - 0.22, 0, 0);
  add(new THREE.ConeGeometry(0.052, 0.22, 16), 0, 0.47, 0.185, Math.PI - 0.14, 0, 0);
  add(new THREE.ConeGeometry(0.030, 0.16, 12), 0, 0.35, 0.195, Math.PI - 0.08, 0, 0);

  let totalVerts = 0;
  for (const { geom } of parts) {
    const nonIndexed = geom.toNonIndexed();
    totalVerts += nonIndexed.attributes.position.count;
    nonIndexed.dispose();
  }
  const positions = new Float32Array(totalVerts * 3);
  let offset = 0;
  for (const { geom, matrix } of parts) {
    const g = geom.clone();
    if (matrix) g.applyMatrix4(matrix);
    const nonIndexed = g.toNonIndexed();
    const pos = nonIndexed.attributes.position;
    positions.set(pos.array, offset * 3);
    offset += pos.count;
    g.dispose();
    nonIndexed.dispose();
    geom.dispose();
  }
  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.computeBoundingBox();

  // Chuẩn hóa Bounding Box hoàn hảo:
  // Tâm X và Z ở 0, chân đế ở y = -0.5, đỉnh đầu ở y = +0.5
  // Giúp tượng đặt thẳng lên mặt bục gỗ không bao giờ bị lơ lửng hay lún sâu!
  const bb = merged.boundingBox;
  const size = new THREE.Vector3();
  bb.getSize(size);
  const center = new THREE.Vector3();
  bb.getCenter(center);
  merged.translate(-center.x, -bb.min.y, -center.z);
  merged.scale(1 / Math.max(0.001, size.x), 1 / Math.max(0.001, size.y), 1 / Math.max(0.001, size.z));
  merged.translate(0, -0.5, 0);

  merged.computeVertexNormals();
  return merged;
}

function createRestingPresident() {
  const parts = [];
  const add = (geom, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Matrix4();
    const rot = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz));
    const sc = new THREE.Matrix4().makeScale(sx, sy, sz);
    const tr = new THREE.Matrix4().makeTranslation(x, y, z);
    m.multiply(tr).multiply(rot).multiply(sc);
    parts.push({ geom, matrix: m });
  };

  // 1. Bục đệm và ga trải lụa trang nghiêm
  add(new THREE.BoxGeometry(0.76, 0.10, 1.88), 0, 0.05, 0);
  // Gối nhung đỏ thêu viền trắng nâng đỡ đầu Bác
  add(new THREE.BoxGeometry(0.52, 0.12, 0.36), 0, 0.16, -0.66, -0.06, 0, 0);

  // 2. Đầu và gương mặt Bác Hồ yên nghỉ thanh thản
  add(new THREE.SphereGeometry(0.125, 20, 16), 0, 0.24, -0.66, -0.12, 0, 0, 0.95, 1.05, 1.15);
  add(new THREE.SphereGeometry(0.105, 16, 12), 0, 0.30, -0.65, 0, 0, 0, 1.0, 0.85, 0.95);
  // Chòm râu bạc dài thanh thoát nằm xuôi trên ngực
  add(new THREE.ConeGeometry(0.055, 0.22, 14), 0, 0.20, -0.48, Math.PI / 2 - 0.22, 0, 0);

  // 3. Thân mình trong bộ ka-ki màu trắng/ngà giản dị trang nghiêm
  add(new THREE.BoxGeometry(0.54, 0.19, 0.58), 0, 0.19, -0.30);
  // Cổ áo đứng lãnh tụ
  add(new THREE.CylinderGeometry(0.08, 0.09, 0.06, 12), 0, 0.23, -0.55, -0.15, 0, 0);
  // Hàng cúc áo ngực
  add(new THREE.BoxGeometry(0.035, 0.02, 0.52), 0, 0.285, -0.30);

  // Cánh tay áo
  add(new THREE.CylinderGeometry(0.06, 0.055, 0.32, 10), -0.23, 0.20, -0.32, 0, 0, -0.35);
  add(new THREE.CylinderGeometry(0.06, 0.055, 0.32, 10), 0.23, 0.20, -0.32, 0, 0, 0.35);
  // Cẳng tay và đôi tay đặt thanh thản, trang nghiêm trên bụng
  add(new THREE.CylinderGeometry(0.048, 0.045, 0.26, 10), -0.07, 0.24, -0.16, 0, 0, Math.PI / 2 - 0.2);
  add(new THREE.CylinderGeometry(0.048, 0.045, 0.26, 10), 0.07, 0.25, -0.16, 0, 0, -Math.PI / 2 + 0.2);
  add(new THREE.BoxGeometry(0.14, 0.05, 0.10), 0, 0.255, -0.16);

  // 4. Quần âu trắng thẳng tắp và đôi giày đen thanh nhã (toàn thân Bác hiện rõ trong bộ đồ trắng)
  add(new THREE.BoxGeometry(0.50, 0.17, 0.24), 0, 0.18, 0.08);
  // Chân trái
  add(new THREE.CylinderGeometry(0.08, 0.085, 0.72, 12), -0.12, 0.17, 0.44, Math.PI / 2, 0, 0);
  // Chân phải
  add(new THREE.CylinderGeometry(0.08, 0.085, 0.72, 12), 0.12, 0.17, 0.44, Math.PI / 2, 0, 0);
  // Đôi giày đen
  add(new THREE.BoxGeometry(0.12, 0.14, 0.20), -0.12, 0.18, 0.82);
  add(new THREE.BoxGeometry(0.12, 0.14, 0.20), 0.12, 0.18, 0.82);

  let totalVerts = 0;
  for (const { geom } of parts) {
    const nonIndexed = geom.toNonIndexed();
    totalVerts += nonIndexed.attributes.position.count;
    nonIndexed.dispose();
  }
  const positions = new Float32Array(totalVerts * 3);
  let offset = 0;
  for (const { geom, matrix } of parts) {
    const g = geom.clone();
    if (matrix) g.applyMatrix4(matrix);
    const nonIndexed = g.toNonIndexed();
    const pos = nonIndexed.attributes.position;
    positions.set(pos.array, offset * 3);
    offset += pos.count;
    g.dispose();
    nonIndexed.dispose();
    geom.dispose();
  }
  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.computeBoundingBox();
  const bb = merged.boundingBox;
  const size = new THREE.Vector3();
  bb.getSize(size);
  const center = new THREE.Vector3();
  bb.getCenter(center);
  merged.translate(-center.x, -bb.min.y, -center.z);
  merged.scale(1 / Math.max(0.001, size.x), 1 / Math.max(0.001, size.y), 1 / Math.max(0.001, size.z));
  merged.translate(0, -0.5, 0);
  merged.computeVertexNormals();
  return merged;
}

function createHonorGuard() {
  const parts = [];
  const add = (geom, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Matrix4();
    const rot = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz));
    const sc = new THREE.Matrix4().makeScale(sx, sy, sz);
    const tr = new THREE.Matrix4().makeTranslation(x, y, z);
    m.multiply(tr).multiply(rot).multiply(sc);
    parts.push({ geom, matrix: m });
  };

  // 1. Đôi bốt da đen bóng đứng nghiêm
  add(new THREE.BoxGeometry(0.12, 0.16, 0.22), -0.11, 0.08, 0.02);
  add(new THREE.BoxGeometry(0.12, 0.16, 0.22), 0.11, 0.08, 0.02);

  // 2. Quần lễ phục trắng tinh khôi thẳng tắp
  add(new THREE.CylinderGeometry(0.085, 0.095, 0.76, 14), -0.11, 0.52, 0);
  add(new THREE.CylinderGeometry(0.085, 0.095, 0.76, 14), 0.11, 0.52, 0);

  // 3. Áo lễ phục trắng đại cán danh dự với thắt lưng da
  add(new THREE.BoxGeometry(0.44, 0.58, 0.26), 0, 1.15, 0);
  add(new THREE.BoxGeometry(0.46, 0.08, 0.28), 0, 0.92, 0);
  // Cầu vai vàng danh dự hai bên
  add(new THREE.BoxGeometry(0.12, 0.035, 0.16), -0.22, 1.42, 0);
  add(new THREE.BoxGeometry(0.12, 0.035, 0.16), 0.22, 1.42, 0);

  // 4. Cổ áo đứng và đầu
  add(new THREE.CylinderGeometry(0.08, 0.09, 0.10, 14), 0, 1.48, 0);
  add(new THREE.SphereGeometry(0.10, 16, 12), 0, 1.58, 0);

  // 5. Mũ kê-pi trắng danh dự với vành đỏ sao vàng
  add(new THREE.CylinderGeometry(0.14, 0.12, 0.08, 18), 0, 1.66, 0);
  add(new THREE.CylinderGeometry(0.145, 0.13, 0.03, 18), 0, 1.63, 0);
  add(new THREE.BoxGeometry(0.18, 0.02, 0.08), 0, 1.61, 0.12, 0.2, 0, 0);

  // 6. Tay trắng bồng súng danh dự
  add(new THREE.CylinderGeometry(0.065, 0.065, 0.56, 10), -0.23, 1.15, 0);
  add(new THREE.CylinderGeometry(0.065, 0.065, 0.42, 10), 0.18, 1.12, 0.12, -0.6, 0, 0);

  // 7. Súng danh dự CKC bồng trang nghiêm
  add(new THREE.BoxGeometry(0.045, 0.88, 0.06), 0.16, 1.18, 0.22, 0.15, 0, 0);
  add(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 8), 0.16, 1.68, 0.26, 0.15, 0, 0);

  let totalVerts = 0;
  for (const { geom } of parts) {
    const nonIndexed = geom.toNonIndexed();
    totalVerts += nonIndexed.attributes.position.count;
    nonIndexed.dispose();
  }
  const positions = new Float32Array(totalVerts * 3);
  let offset = 0;
  for (const { geom, matrix } of parts) {
    const g = geom.clone();
    if (matrix) g.applyMatrix4(matrix);
    const nonIndexed = g.toNonIndexed();
    const pos = nonIndexed.attributes.position;
    positions.set(pos.array, offset * 3);
    offset += pos.count;
    g.dispose();
    nonIndexed.dispose();
    geom.dispose();
  }
  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.computeBoundingBox();
  const bb = merged.boundingBox;
  const size = new THREE.Vector3();
  bb.getSize(size);
  const center = new THREE.Vector3();
  bb.getCenter(center);
  merged.translate(-center.x, -bb.min.y, -center.z);
  merged.scale(1 / Math.max(0.001, size.x), 1 / Math.max(0.001, size.y), 1 / Math.max(0.001, size.z));
  merged.translate(0, -0.5, 0);
  merged.computeVertexNormals();
  return merged;
}

function createLotusBudFinial() {
  const parts = [];
  const add = (geom, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Matrix4();
    const rot = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz));
    const sc = new THREE.Matrix4().makeScale(sx, sy, sz);
    const tr = new THREE.Matrix4().makeTranslation(x, y, z);
    m.multiply(tr).multiply(rot).multiply(sc);
    parts.push({ geom, matrix: m });
  };

  // Đế đá hoa sen vuông chạm khắc
  add(new THREE.BoxGeometry(0.24, 0.08, 0.24), 0, 0.04, 0);
  // Đài sen nở ôm búp
  add(new THREE.CylinderGeometry(0.14, 0.10, 0.06, 16), 0, 0.11, 0);
  // Búp sen thon nhọn thanh thoát
  add(new THREE.ConeGeometry(0.11, 0.24, 16), 0, 0.25, 0);
  add(new THREE.SphereGeometry(0.08, 12, 10), 0, 0.20, 0);

  let totalVerts = 0;
  for (const { geom } of parts) {
    const nonIndexed = geom.toNonIndexed();
    totalVerts += nonIndexed.attributes.position.count;
    nonIndexed.dispose();
  }
  const positions = new Float32Array(totalVerts * 3);
  let offset = 0;
  for (const { geom, matrix } of parts) {
    const g = geom.clone();
    if (matrix) g.applyMatrix4(matrix);
    const nonIndexed = g.toNonIndexed();
    const pos = nonIndexed.attributes.position;
    positions.set(pos.array, offset * 3);
    offset += pos.count;
    g.dispose();
    nonIndexed.dispose();
    geom.dispose();
  }
  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.computeBoundingBox();
  const bb = merged.boundingBox;
  const size = new THREE.Vector3();
  bb.getSize(size);
  const center = new THREE.Vector3();
  bb.getCenter(center);
  merged.translate(-center.x, -bb.min.y, -center.z);
  merged.scale(1 / Math.max(0.001, size.x), 1 / Math.max(0.001, size.y), 1 / Math.max(0.001, size.z));
  merged.translate(0, -0.5, 0);
  merged.computeVertexNormals();
  return merged;
}
