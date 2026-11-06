import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { retryAsset, scheduleModelLoad } from './asset-loading.js';

const cache = new Map();
async function loadModelFile(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);
  let bytes;
  try {
    const response = await fetch(url, { signal: controller.signal, credentials: 'same-origin' });
    if (!response.ok) throw new Error(`Model HTTP ${response.status}: ${url}`);
    bytes = await response.arrayBuffer();
  } finally {
    clearTimeout(timeout);
  }
  if (bytes.byteLength < 12 || new DataView(bytes).getUint32(0, true) !== 0x46546c67)
    throw new Error(`Model response is not a GLB: ${url}`);
  const path = new URL('.', new URL(url, location.href)).href;
  return new GLTFLoader().parseAsync(bytes, path);
}
export const MODEL_URLS = {
  tree: `${import.meta.env?.BASE_URL ?? '/'}models/${encodeURIComponent('cây.glb')}?v=3`,
  carpet: `${import.meta.env?.BASE_URL ?? '/'}models/thamr.glb`,
  fountain: `${import.meta.env?.BASE_URL ?? '/'}models/${encodeURIComponent('đài phun nước.glb')}?v=3`,
  lotus: `${import.meta.env?.BASE_URL ?? '/'}models/hoa%20sen.glb`,
  chandelier: `${import.meta.env?.BASE_URL ?? '/'}models/${encodeURIComponent('đèn chùm.glb')}`,
  hoChiMinhBust: `${import.meta.env?.BASE_URL ?? '/'}models/${encodeURIComponent('tượng bác.glb')}`,
  largeHoChiMinh: `${import.meta.env?.BASE_URL ?? '/'}models/${encodeURIComponent('tượng to bác.glb')}`,
  quanAmStatue: `${import.meta.env?.BASE_URL ?? '/'}models/${encodeURIComponent('tượng quan âm.glb')}`,
  restingPresident: `${import.meta.env?.BASE_URL ?? '/'}models/${encodeURIComponent('thi hài bác.glb')}`,
  honorGuard: `${import.meta.env?.BASE_URL ?? '/'}models/${encodeURIComponent('canh gác.glb')}`,
  banquetPainting: `${import.meta.env?.BASE_URL ?? '/'}models/${encodeURIComponent('tranh phòng đại yến.glb')}?v=2`,
  credentialsPainting: `${import.meta.env?.BASE_URL ?? '/'}models/${encodeURIComponent('ảnh trình quốc thư.glb')}`,
  helicopter: `${import.meta.env?.BASE_URL ?? '/'}models/${encodeURIComponent('máy bay.glb')}`,
  tank: `${import.meta.env?.BASE_URL ?? '/'}models/${encodeURIComponent('xe tăng.glb')}?v=3`,
};

// Bake scan transforms and put the bottom at zero, centered horizontally.
export function normalizeModel(root) {
  root.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(root);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const width = Math.max(size.x, size.z);
  if (!Number.isFinite(width) || width <= 0 || size.y <= 0) throw new Error('Empty model');
  const transform = new THREE.Matrix4().makeScale(1 / width, 1 / width, 1 / width)
    .multiply(new THREE.Matrix4().makeTranslation(-center.x, -bounds.min.y, -center.z));
  const meshes = [];
  root.traverse(child => {
    if (!child.isMesh) return;
    const geometry = child.geometry.clone();
    geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(transform, child.matrixWorld));
    meshes.push({ geometry, material: child.material });
  });
  return { meshes, size: size.divideScalar(width) };
}

export async function addModelInstances(parent, url, placements, modelRotation = [0, 0, 0]) {
  if (!placements.length) return;
  const cacheKey = `${url}|${modelRotation.join(",")}`;
  if (!cache.has(cacheKey)) {
    const request = retryAsset(() => scheduleModelLoad(() => loadModelFile(url))).then(gltf => {
      if (modelRotation.every(angle => angle === 0)) return normalizeModel(gltf.scene);
      const orientedRoot = new THREE.Group();
      orientedRoot.rotation.set(...modelRotation);
      orientedRoot.add(gltf.scene);
      return normalizeModel(orientedRoot);
    }).catch(error => {
      cache.delete(cacheKey);
      throw error;
    });
    cache.set(cacheKey, request);
  }
  const model = await cache.get(cacheKey);
  const group = new THREE.Group();
  group.name = url;
  for (const part of model.meshes) {
    if (part.material) {
      part.material.side = THREE.DoubleSide;
      part.material.needsUpdate = true;
    }
    const mesh = new THREE.InstancedMesh(part.geometry, part.material, placements.length);
    const transform = new THREE.Object3D();
    placements.forEach((p, i) => {
      transform.position.fromArray(p.position);
      transform.rotation.set(0, p.rotationY || 0, 0);
      const width = p.width ?? p.height / model.size.y;
      transform.scale.set(width, p.height == null ? width : p.height / model.size.y,
        p.depth == null ? width : p.depth / model.size.z);
      transform.updateMatrix();
      mesh.setMatrixAt(i, transform.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.frustumCulled = true;
    mesh.castShadow = url !== MODEL_URLS.tree;
    mesh.receiveShadow = true;
    mesh.computeBoundingSphere();
    group.add(mesh);
  }
  parent.add(group);
  return group;
}

