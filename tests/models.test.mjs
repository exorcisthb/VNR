import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { normalizeModel } from '../src/models.js';

test('imported model is centered and rests above the floor despite scan offsets', () => {
  const root = new THREE.Group();
  root.position.set(7, -4, 3);
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 0.16, 2));
  mesh.position.set(-0.02, 0.003, 0.01);
  root.add(mesh);
  const model = normalizeModel(root);
  const geometry = model.meshes[0].geometry;
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  assert.ok(Math.abs(box.min.y) < 1e-6);
  assert.ok(Math.abs(box.getCenter(new THREE.Vector3()).x) < 1e-6);
  assert.ok(Math.abs(box.getCenter(new THREE.Vector3()).z) < 1e-6);
  const worldBox = box.clone().applyMatrix4(new THREE.Matrix4().makeScale(7.8, 0.045 / model.size.y, 7.8));
  worldBox.translate(new THREE.Vector3(60, 4.015, -39.5));
  assert.ok(Math.abs(worldBox.min.y - 4.015) < 1e-6);
  assert.ok(Math.abs(worldBox.max.y - 4.06) < 1e-6);
  assert.ok(worldBox.max.x < 60 + 4.3);
});

test('empty imported models fail visibly instead of generating invalid transforms', () => {
  assert.throws(() => normalizeModel(new THREE.Group()), /Empty model/);
});
