import * as THREE from "three";
import { LANDMARKS } from "../shared/landmarks.mjs";
import { documentPhoto } from "./document-photos.js";
import mausoleum from "../video/lăng bác.mp4?url";
import palace from "../video/Dinh độc lập.mp4?url";
import pagoda from "../video/Chùa 1 cột.mp4?url";
import tank from "../video/390.mp4?url";

const entrances = [
  { id: "mausoleum", url: mausoleum, aspect: 16 / 9 },
  { id: "palace", url: palace, aspect: 16 / 9 },
  { id: "pagoda", url: pagoda, aspect: 576 / 768 },
  { id: "tank", url: tank, aspect: 664 / 360 },
];

function hideMausoleumVideoText(material) {
  material.onBeforeCompile = shader => {
    // The text is baked into a fixed rectangle. Blend in nearby pixels only
    // on the video texture, before Three.js converts its colors.
    const mapFragment = THREE.ShaderChunk.map_fragment.replace(
      "#ifdef DECODE_VIDEO_TEXTURE",
      `#ifdef DECODE_VIDEO_TEXTURE
        vec2 uv = vMapUv;
        if (uv.x > 0.815 && uv.x < 0.994 && uv.y > 0.134 && uv.y < 0.221) {
          float weight = smoothstep(0.815, 0.825, uv.x) *
            (1.0 - smoothstep(0.984, 0.994, uv.x)) *
            smoothstep(0.134, 0.151, uv.y) *
            (1.0 - smoothstep(0.205, 0.221, uv.y));
          vec4 below = texture2D(map, vec2(uv.x, 0.134));
          vec4 above = texture2D(map, vec2(uv.x, 0.221));
          vec4 fill = mix(below, above, (uv.y - 0.134) / 0.087);
          sampledDiffuseColor = mix(sampledDiffuseColor, fill, weight);
        }`,
    );
    shader.fragmentShader = shader.fragmentShader.replace("#include <map_fragment>", mapFragment);
  };
}

export function addEntranceVideos(scene, button, boardTexture) {
  const frame = new THREE.MeshStandardMaterial({ color: "#312825", roughness: 0.85 });
  const trim = new THREE.MeshStandardMaterial({ color: "#ba9559", roughness: 0.65 });
  const titleMaterial = new THREE.MeshBasicMaterial({ map: boardTexture("VIDEO TƯ LIỆU") });
  const images = new THREE.TextureLoader();
  const screens = entrances.map(entry => {
    const landmark = LANDMARKS.find(l => l.id === entry.id);
    // Left as seen from the approach, on the same line as the name board.
    const x = landmark.x - landmark.front * 6.4;
    const z = landmark.sign.z;
    const group = new THREE.Group();
    group.position.set(x, 3, z);
    group.rotation.y = landmark.front === 1 ? 0 : Math.PI;
    const height = entry.aspect < 1 ? 4 : 3;
    const width = height * entry.aspect;
    const center = 1.05 + height / 2;
    function box(w, h, d, x, y, material) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      mesh.position.set(x, y, 0);
      group.add(mesh);
    }
    box(width + 0.55, 0.12, 1.05, 0, 0.06, frame);
    for (const side of [-1, 1]) box(0.16, 1.08, 0.24, side * width * 0.38, 0.55, frame);
    box(width + 0.2, height + 0.2, 0.25, 0, center, trim);
    box(width + 0.2, 0.74, 0.25, 0, center + height / 2 + 0.42, frame);
    const surface = new THREE.MeshBasicMaterial({ color: "#234638", toneMapped: false });
    if (entry.id === "mausoleum") hideMausoleumVideoText(surface);
    const titleGeometry = new THREE.PlaneGeometry(width + 0.16, 0.72);
    const screenGeometry = new THREE.PlaneGeometry(width, height);
    for (const side of [-1, 1]) {
      const title = new THREE.Mesh(titleGeometry, titleMaterial);
      const face = new THREE.Mesh(screenGeometry, surface);
      title.position.set(0, center + height / 2 + 0.42, side * 0.14);
      face.position.set(0, center, side * 0.14);
      title.rotation.y = face.rotation.y = side === 1 ? 0 : Math.PI;
      group.add(title, face);
    }
    scene.add(group);
    const screen = { ...entry, x, z, group, surface, video: null, poster: null };
    const photo = documentPhoto(landmark);
    if (photo?.src) {
      images.load(photo.src, texture => {
        texture.colorSpace = THREE.SRGBColorSpace;
        const aspect = texture.image.width / texture.image.height;
        texture.repeat.set(Math.min(1, entry.aspect / aspect), Math.min(1, aspect / entry.aspect));
        texture.offset.set((1 - texture.repeat.x) / 2, (1 - texture.repeat.y) / 2);
        screen.poster = texture;
        if (!screen.video || screen.surface.map !== screen.texture) showPoster(screen);
      });
    }
    return screen;
  });

  let active = null;
  function showPoster(screen) {
    screen.surface.map = screen.poster;
    screen.surface.color.set(screen.poster ? 0xffffff : 0x234638);
    screen.surface.needsUpdate = true;
  }

  function play(screen) {
    button.textContent = "Đang tải video…";
    screen.video.play().catch(() => {
      if (active === screen && screen.video.paused) button.textContent = "V · Phát video";
    });
  }

  function select(screen) {
    if (screen === active) return;
    if (active) {
      active.video.pause();
      active.video.muted = true;
      showPoster(active);
    }
    active = screen;
    button.hidden = !active;
    if (!active) return;
    if (!active.video) {
      const screen = active;
      const video = document.createElement("video");
      video.defaultMuted = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "auto";
      video.className = "entrance-video-media";
      video.setAttribute("aria-hidden", "true");
      document.body.append(video);
      video.src = screen.url;
      const texture = new THREE.VideoTexture(video);
      texture.colorSpace = THREE.SRGBColorSpace;
      screen.texture = texture;
      screen.video = video;
      video.addEventListener("playing", () => {
        if (screen === active) updateSoundLabel();
      });
      video.addEventListener("error", () => {
        showPoster(screen);
        if (screen === active) button.textContent = "V · Thử tải lại video";
      });
    }
    active.video.currentTime = 0;
    play(active);
  }

  function updateSoundLabel() {
    button.textContent = active.video.muted ? "V · Bật tiếng video" : "V · Tắt tiếng video";
  }

  function toggleSound() {
    if (!active) return;
    const { video } = active;
    if (video.paused) {
      if (video.error) video.load();
      play(active);
      return;
    }
    video.muted = !video.muted;
    updateSoundLabel();
  }

  button.addEventListener("click", toggleSound);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) select(null);
  });
  return {
    toggleSound,
    update(focus, enabled) {
      let nearest = null;
      let range = 18;
      for (const screen of screens) {
        const distance = Math.hypot(focus.x - screen.x, focus.z - screen.z);
        screen.group.visible = distance < 65;
        if (enabled && distance < range) {
          nearest = screen;
          range = distance;
        }
      }
      select(nearest);
      // Keep the poster until a new frame is ready. Explicitly upload the first
      // frame even if the browser has delayed its video-frame callback.
      if (active && active.surface.map !== active.texture &&
          !active.video.paused && !active.video.seeking && active.video.readyState >= 2) {
        active.surface.map = active.texture;
        active.surface.color.set(0xffffff);
        active.surface.needsUpdate = true;
        active.texture.needsUpdate = true;
      }
    },
  };
}
