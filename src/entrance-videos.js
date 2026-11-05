import * as THREE from "three";
import { LANDMARKS } from "../shared/landmarks.mjs";
import mausoleum from "../video/lăng bác.mp4?url";
import palace from "../video/Dinh độc lập.mp4?url";
import pagoda from "../video/Chùa 1 cột.mp4?url";
import tank from "../video/390.mp4?url";

// Screens face the approach from the side of each path.
const entrances = [
  { id: "mausoleum", url: mausoleum, x: -60, z: 3, aspect: 16 / 9 },
  { id: "palace", url: palace, x: 66, z: -4, aspect: 16 / 9 },
  { id: "pagoda", url: pagoda, x: -81, z: 67, aspect: 576 / 768 },
  { id: "tank", url: tank, x: 116, z: 8, aspect: 664 / 360 },
];

export function addEntranceVideos(scene, button, boardTexture) {
  const frame = new THREE.MeshStandardMaterial({ color: "#312825", roughness: 0.85 });
  const trim = new THREE.MeshStandardMaterial({ color: "#ba9559", roughness: 0.65 });
  const screens = entrances.map(entry => {
    const landmark = LANDMARKS.find(l => l.id === entry.id);
    const group = new THREE.Group();
    group.position.set(entry.x, 3, entry.z);
    group.rotation.y = landmark.front === 1 ? -0.34 : Math.PI + 0.34;
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
    const title = new THREE.Mesh(
      new THREE.PlaneGeometry(width + 0.16, 0.72),
      new THREE.MeshBasicMaterial({ map: boardTexture(landmark.name, "VIDEO TƯ LIỆU") }),
    );
    title.position.set(0, center + height / 2 + 0.42, 0.13);
    group.add(title);
    const surface = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ color: "#171b19", toneMapped: false }),
    );
    surface.position.set(0, center, 0.132);
    group.add(surface);
    scene.add(group);
    return { ...entry, group, surface, video: null };
  });

  let active = null;
  function play(screen) {
    screen.video.play().catch(() => {
      if (active === screen && screen.video.paused) button.textContent = "V · Phát video";
    });
  }

  function select(screen) {
    if (screen === active) return;
    if (active) {
      active.video.pause();
      active.video.muted = true;
    }
    active = screen;
    button.hidden = !active;
    if (!active) return;
    if (!active.video) {
      const video = document.createElement("video");
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.src = active.url;
      const texture = new THREE.VideoTexture(video);
      texture.colorSpace = THREE.SRGBColorSpace;
      active.surface.material.map = texture;
      active.surface.material.color.set(0xffffff);
      active.surface.material.needsUpdate = true;
      active.video = video;
    }
    active.video.currentTime = 0;
    button.textContent = "V · Bật tiếng video";
    play(active);
  }

  function toggleSound() {
    if (!active) return;
    const { video } = active;
    video.muted = !video.muted;
    button.textContent = video.muted ? "V · Bật tiếng video" : "V · Tắt tiếng video";
    if (video.paused) play(active);
  }

  button.addEventListener("click", toggleSound);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) select(null);
  });
  return {
    toggleSound,
    update(focus, enabled) {
      let nearest = null;
      let range = 16;
      for (const screen of screens) {
        const distance = Math.hypot(focus.x - screen.x, focus.z - screen.z);
        screen.group.visible = distance < 65;
        if (enabled && distance < range) {
          nearest = screen;
          range = distance;
        }
      }
      select(nearest);
    },
  };
}
