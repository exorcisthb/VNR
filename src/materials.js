import * as THREE from "three";
export function surfaceTexture(kind) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  const base =
    {
      marble: "#cec9bb",
      stone: "#9a9b94",
      granite: "#83857f",
      mausStone: "#858f89",
      mausPolished: "#b6bdb4",
      mausRed: "#65514b",
      redstone: "#703f38",
      blackmarble: "#343d3c",
      wood: "#776044",
      walnut: "#785239",
      woodpanel: "#a5825e",
      ceiling: "#806246",
      darkwood: "#44392f",
      carpet: "#8b2e31",
      terracotta: "#805342",
      pavers: "#b9b5a7",
    }[kind] || "#ddd6c5";
  g.fillStyle = base;
  g.fillRect(0, 0, 256, 256);
  let seed = 419;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  if (["wood", "walnut", "woodpanel", "ceiling", "darkwood"].includes(kind)) {
    for (let i = 0; i < 180; i++) {
      g.strokeStyle = i % 2 ? "#241c1518" : "#f6d7a41a";
      g.lineWidth = 0.3 + rand() * 1.4;
      g.beginPath();
      const x = rand() * 256;
      g.moveTo(x, 0);
      g.bezierCurveTo(x + rand() * 15, 85, x - rand() * 12, 175, x, 256);
      g.stroke();
    }
    g.fillStyle = "#261c1830";
    for (const x of [0, 64, 128, 192]) g.fillRect(x, 0, 1, 256);
  } else if (kind === "carpet") {
    for (let y = 0; y < 256; y += 3) {
      g.fillStyle = y % 2 ? "#ffffff0c" : "#0000000e";
      g.fillRect(0, y, 256, 1);
    }
    g.strokeStyle = "#d5aa6380";
    g.lineWidth = 4;
    g.strokeRect(9, 9, 238, 238);
  } else {
    for (let i = 0; i < 2700; i++) {
      g.fillStyle = i % 2 ? "#ffffff10" : "#00000012";
      g.fillRect(rand() * 256, rand() * 256, 1 + rand() * 2, 1 + rand() * 2);
    }
    if (kind.includes("marble") || kind === "redstone")
      for (let i = 0; i < 10; i++) {
        g.strokeStyle = "#4c524a22";
        g.lineWidth = 0.3 + rand();
        g.beginPath();
        const z = rand() * 256;
        g.moveTo(z, -5);
        g.bezierCurveTo(z + 75, 80, z - 95, 170, z + 40, 260);
        g.stroke();
      }
    if (kind.startsWith("maus")) {
      g.strokeStyle = "#303a3760";
      g.lineWidth = 1.5;
      for (let y = 0; y <= 256; y += 64) {
        g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke();
        for (let x = (y / 64) % 2 ? 64 : 0; x <= 256; x += 128) {
          g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 64); g.stroke();
        }
      }
    }
    if (kind === "marble" || kind === "pavers") {
      g.strokeStyle = "#55594f28";
      g.lineWidth = 1;
      for (const x of [0, 128, 255]) {
        g.beginPath();
        g.moveTo(x, 0);
        g.lineTo(x, 256);
        g.stroke();
        g.beginPath();
        g.moveTo(0, x);
        g.lineTo(256, x);
        g.stroke();
      }
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 2;
  return t;
}
export function makeMaterials() {
  const specs = {
    ivory: ["#ddd7c7", 0.88],
    palaceConcrete: ["#e5dfc9", 0.86],
    palaceTrim: ["#f1ecda", 0.78],
    palaceGlass: ["#384644", 0.3],
    palaceStone: ["#766e5b", 0.95],
    palaceMetal: ["#514e41", 0.65],
    civicWhite: ["#eeeede", 0.82],
    civicGlass: ["#526562", 0.36],
    civicRoof: ["#497554", 0.9],
    ochre: ["#cfb378", 0.95],
    linen: ["#e3dfce", 1],
    bronze: ["#ad8b4d", 0.43],
    bronzeBust: ["#d4b068", 0.68],
    goldLeaf: ["#e5c158", 0.38],
    lotusPink: ["#ec407a", 0.78],
    lotusGreen: ["#2e7d32", 0.85],
    upholstery: ["#b8a166", 0.96],
    banquetLeather: ["#78583d", 0.92],
    leather: ["#344d40", 0.62],
    whiteleather: ["#e1dccb", 0.65],
    curtainRed: ["#9e1a1e", 0.94],
    crystal: ["#f0f4f8", 0.15],
    drape: ["#999641", 0.98],
    goldDrape: ["#d2ad55", 0.98],
    porcelain: ["#e8e3d2", 0.24],
    porcelainBlue: ["#41647d", 0.3],
    brocade: ["#8d4a3e", 0.94],
    flower: ["#b67683", 0.95],
    greenery: ["#4c7550", 1],
    lightwood: ["#bfa16f", 0.72],
    lamp: ["#fff2d4", 0.8],
    screen: ["#20353b", 0.3],
  };
  const materials = {};
  for (const kind of [
    "marble",
    "stone",
    "granite",
    "mausStone",
    "mausPolished",
    "mausRed",
    "redstone",
    "blackmarble",
    "wood",
    "walnut",
    "woodpanel",
    "ceiling",
    "darkwood",
    "carpet",
    "terracotta",
    "pavers",
  ]) {
    const map = surfaceTexture(kind),
      mat = new THREE.MeshStandardMaterial({
        map,
        roughness: kind.includes("marble") ? 0.42 : 0.86,
        metalness: 0,
      });
    // UV theo tọa độ thế giới: vân đá/gỗ không giãn theo chiều dài cả bức tường.
    mat.onBeforeCompile = (shader) => {
      shader.vertexShader =
        "varying vec3 dvPosition; varying vec3 dvNormal;\n" +
        shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        "#include <worldpos_vertex>",
        `#include <worldpos_vertex>
        vec4 dvPoint=vec4(transformed,1.0); vec3 dvN=objectNormal;
        #ifdef USE_INSTANCING
          dvPoint=instanceMatrix*dvPoint; dvN=mat3(instanceMatrix)*dvN;
        #endif
        dvPosition=(modelMatrix*dvPoint).xyz; dvNormal=normalize(mat3(modelMatrix)*dvN);`,
      );
      shader.fragmentShader =
        "varying vec3 dvPosition; varying vec3 dvNormal;\n" +
        shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <map_fragment>",
        `vec3 dvWeights=pow(abs(normalize(dvNormal)),vec3(6.0));dvWeights/=max(dot(dvWeights,vec3(1.0)),0.0001);
        vec4 dvTex=texture2D(map,dvPosition.zy*.42)*dvWeights.x+texture2D(map,dvPosition.xz*.42)*dvWeights.y+texture2D(map,dvPosition.xy*.42)*dvWeights.z;
        diffuseColor*=dvTex;`,
      );
    };
    mat.customProgramCacheKey = () => 'dau-viet-world-uv-v1';
    materials[kind] = mat;
  }
  for (const [kind, [color, roughness]] of Object.entries(specs))
    materials[kind] = new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness: kind === "bronze" || kind === "goldLeaf" ? 0.55 : kind === "bronzeBust" ? 0.22 : 0,
      emissive: kind === "lamp" ? "#ffe6ae" : "#000000",
      emissiveIntensity: kind === "lamp" ? 1 : 0,
    });
  materials.glass = new THREE.MeshPhysicalMaterial({
    color: "#b6d4cf",
    transparent: true,
    opacity: 0.2,
    roughness: 0.08,
    metalness: 0.05,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  materials.window = new THREE.MeshPhysicalMaterial({
    color: "#9bb7b3",
    transparent: true,
    opacity: 0.24,
    roughness: 0.16,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  return materials;
}
export function flagCanvas(party = false) {
  const c = document.createElement("canvas");
  c.width = 384;
  c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = "#b5252b";
  g.fillRect(0, 0, 384, 256);
  g.fillStyle = "#f9d560";
  if (party) {
    g.font = "175px Georgia";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("☭", 192, 135);
  } else {
    g.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 29 : 73,
        a = -Math.PI / 2 + (i * Math.PI) / 5,
        x = 192 + Math.cos(a) * r,
        y = 128 + Math.sin(a) * r;
      i ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.closePath();
    g.fill();
  }
  return c;
}
