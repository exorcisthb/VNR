import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const GRAVITY = 9.81;
export const FOUNTAIN_POOL_Y = 0.30;

// The scan includes opaque, frozen water. Replace just those faces with the
// animated spray; keep the basin, hedge, rail and central stone bowl intact.
export function fountainStructureGeometry(geometry) {
  const positions = geometry.attributes.position;
  const indices = geometry.index;
  const kept = [];
  for (let i = 0; i < indices.count; i += 3) {
    const a = indices.getX(i), b = indices.getX(i + 1), c = indices.getX(i + 2);
    const x = (positions.getX(a) + positions.getX(b) + positions.getX(c)) * 10 / 3;
    const y = (positions.getY(a) + positions.getY(b) + positions.getY(c)) * 10 / 3;
    const z = (positions.getZ(a) + positions.getZ(b) + positions.getZ(c)) * 10 / 3;
    const radius = Math.hypot(x, z);
    const frozenWater = y > 1.55 || (y > 1.35 && radius < 0.9) || (y > 0.57 && radius > 2.5 && radius < 3.6);
    if (!frozenWater) kept.push(a, b, c);
  }
  // Share untouched normals/UVs rather than rebuilding or simplifying the scan.
  const structure = new THREE.BufferGeometry();
  for (const [name, attribute] of Object.entries(geometry.attributes)) structure.setAttribute(name, attribute);
  structure.setIndex(kept);
  structure.computeBoundingSphere();
  return structure;
}

// Water starts at the circular nozzle rail, rises inward and falls into the
// basin. A separate, narrow central plume rises above the surrounding spray.
export function fountainJets() {
  const jets = [];
  for (let i = 0; i < 64; i++) {
    const angle = i * Math.PI * 2 / 64;
    const dx = Math.cos(angle), dz = Math.sin(angle);
    const apex = 2.55 + 0.28 * Math.sin(angle * 4);
    const start = new THREE.Vector3(dx * 3.03, 0.57, dz * 3.03);
    const up = Math.sqrt(2 * GRAVITY * (apex - start.y));
    const duration = (up + Math.sqrt(up * up + 2 * GRAVITY * (start.y - FOUNTAIN_POOL_Y))) / GRAVITY;
    const endRadius = 0.75 + 0.16 * Math.sin(angle * 3);
    jets.push({ start, velocity: new THREE.Vector3(dx * (endRadius - 3.03) / duration, up, dz * (endRadius - 3.03) / duration), duration, radius: 0.009, phase: i * 0.618 });
  }
  for (let i = 0; i < 9; i++) {
    const angle = i * Math.PI * 2 / 9;
    const start = new THREE.Vector3(Math.cos(angle) * 0.04, 1.35, Math.sin(angle) * 0.04);
    const up = 10.0 + 0.18 * Math.sin(i * 2.4);
    const duration = (up + Math.sqrt(up * up + 2 * GRAVITY * (start.y - 1.25))) / GRAVITY;
    jets.push({ start, velocity: new THREE.Vector3(Math.cos(angle) * 0.04, up, Math.sin(angle) * 0.04), duration, radius: 0.004, phase: i * 0.381 });
  }
  return jets;
}

export function jetPoint(jet, fraction, target = new THREE.Vector3()) {
  const t = fraction * jet.duration;
  return target.copy(jet.start).addScaledVector(jet.velocity, t).addScaledVector(new THREE.Vector3(0, -GRAVITY / 2, 0), t * t);
}

export function createFountainWater() {
  const group = new THREE.Group();
  group.name = 'Fountain water';
  const uniforms = { uTime: { value: 0 } };
  const surface = new THREE.Mesh(new THREE.CircleGeometry(4.42, 96), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms,
    vertexShader: `varying vec2 vPoint; void main() { vPoint = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform float uTime; varying vec2 vPoint;
      void main() {
        float r = length(vPoint);
        float ripple = sin(r * 42.0 - uTime * 4.0) * 0.5 + 0.5;
        gl_FragColor = vec4(mix(vec3(0.23, 0.37, 0.34), vec3(0.58, 0.71, 0.66), ripple * 0.28), 0.76);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }));
  surface.rotation.x = -Math.PI / 2;
  surface.position.y = FOUNTAIN_POOL_Y;
  group.add(surface);

  const streamMaterial = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.FrontSide, uniforms,
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform float uTime; varying vec2 vUv;
      void main() {
        float flow = 0.5 + 0.5 * sin(vUv.x * 170.0 - uTime * 20.0);
        float breakup = 1.0 - smoothstep(0.55, 1.0, vUv.x);
        gl_FragColor = vec4(0.77, 0.88, 0.86, (0.09 + 0.19 * flow) * breakup);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const starts = [], velocities = [], flights = [], phases = [], spray = [], streamGeometries = [];
  const jets = fountainJets();
  for (const jet of jets) {
    // Smooth, very thin cores near the nozzles; droplets carry the rest.
    const points = Array.from({ length: 33 }, (_, i) => jetPoint(jet, i / 32));
    const curve = new THREE.CatmullRomCurve3(points);
    streamGeometries.push(new THREE.TubeGeometry(curve, 48, jet.radius, 4, false));
    for (let i = 0; i < 52; i++) {
      starts.push(...jet.start.toArray());
      velocities.push(...jet.velocity.toArray());
      flights.push(jet.duration);
      phases.push((i / 52 + jet.phase) % 1);
      spray.push(jet.start.y > 1 ? 1 : 0);
    }
  }
  const streams = new THREE.Mesh(mergeGeometries(streamGeometries), streamMaterial);
  for (const geometry of streamGeometries) geometry.dispose();
  streams.renderOrder = 2;
  group.add(streams);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(starts, 3));
  geometry.setAttribute('aVelocity', new THREE.Float32BufferAttribute(velocities, 3));
  geometry.setAttribute('aFlight', new THREE.Float32BufferAttribute(flights, 1));
  geometry.setAttribute('aPhase', new THREE.Float32BufferAttribute(phases, 1));
  geometry.setAttribute('aSpray', new THREE.Float32BufferAttribute(spray, 1));
  const droplets = new THREE.Points(geometry, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms,
    vertexShader: `uniform float uTime; attribute vec3 aVelocity; attribute float aFlight; attribute float aPhase; attribute float aSpray; varying float vFade;
      void main() {
        float life = fract(uTime / aFlight + aPhase);
        float t = life * aFlight;
        vec3 p = position + aVelocity * t;
        p.y -= 4.905 * t * t;
        // Slight breakup after the apex, without thick bands or beads.
        p.xz += vec2(sin(aPhase * 93.0 + t * 9.0), cos(aPhase * 71.0 + t * 11.0)) * life * life * mix(0.055, 0.16, aSpray);
        vec4 view = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * view;
        gl_PointSize = clamp(mix(24.0, 90.0, aSpray) / -view.z, 1.0, mix(3.2, 7.0, aSpray));
        vFade = 0.12 + 0.28 * sin(life * 3.14159265);
      }`,
    fragmentShader: `varying float vFade;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        if (d > 1.0) discard;
        gl_FragColor = vec4(0.83, 0.91, 0.89, (1.0 - smoothstep(0.15, 1.0, d)) * vFade);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }));
  droplets.frustumCulled = false;
  droplets.renderOrder = 3;
  group.add(droplets);
  return { group, update(time) { uniforms.uTime.value = time; } };
}
