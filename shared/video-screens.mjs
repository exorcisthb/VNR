import { LANDMARKS } from "./landmarks.mjs";

export const VIDEO_SCREENS = [
  { id: "mausoleum", aspect: 16 / 9 },
  { id: "palace", aspect: 16 / 9 },
  { id: "pagoda", aspect: 576 / 768 },
  { id: "tank", aspect: 664 / 360 },
  { id: "lotus-pond", aspect: 576 / 1024, site: { x: 66, front: -1, sign: { z: 39 } } },
].map(({ id, aspect, site }) => {
  const landmark = LANDMARKS.find(l => l.id === id);
  const entrance = landmark ?? site;
  const height = aspect < 1 ? 4 : 3;
  const width = height * aspect;
  const centerY = 1.05 + height / 2;
  return {
    id, landmark, aspect, width, height, centerY,
    x: entrance.x - entrance.front * 6.4,
    y: 3,
    z: entrance.sign.z,
    front: entrance.front,
    frameWidth: width + 0.2,
    faceDepth: 0.14,
    titleY: centerY + height / 2 + 0.42,
    titleHeight: 0.74,
  };
});
