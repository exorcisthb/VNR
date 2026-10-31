import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { MeshoptSimplifier } from 'meshoptimizer';

// These close-up exhibits need every scan face and UV seam. Permissive
// simplification opens holes in their thin basin, relief and flower details.
const fullDetailModels = new Set(['đài phun nước', 'tranh phòng đại yến', 'xe tăng']);
// Keep the original scans in 3D; publish lighter meshes with their original UVs/materials.
await MeshoptSimplifier.ready;
await mkdir(new URL('../public/models/', import.meta.url), { recursive: true });
const selected = process.argv.slice(2);
for (const [name, target] of [['thamr', 20000], ['hoa sen', 12000], ['đèn chùm', 24000], ['tượng bác', 24000], ['tượng quan âm', 36000], ['thi hài bác', 28000], ['đài phun nước', 40000], ['cây', 30000], ['tranh phòng đại yến', 24000], ['xe tăng', null]]) {
  if (selected.length && !selected.includes(name)) continue;
  const file = await readFile(new URL(`../3D/${name}.glb`, import.meta.url));
  if (fullDetailModels.has(name)) {
    await writeFile(new URL(`../public/models/${name}.glb`, import.meta.url), file);
    console.log(`${name}: kept original geometry, normals, UVs and textures`);
    continue;
  }
  const jsonLength = file.readUInt32LE(12);
  const doc = JSON.parse(file.subarray(20, 20 + jsonLength).toString());
  const bin = file.subarray(28 + jsonLength);
  const primitive = doc.meshes[0].primitives[0];
  function accessor(index) {
    const a = doc.accessors[index], view = doc.bufferViews[a.bufferView];
    const components = { SCALAR: 1, VEC2: 2, VEC3: 3 }[a.type];
    const Type = { 5126: Float32Array, 5125: Uint32Array, 5123: Uint16Array }[a.componentType];
    if (!Type || !components || view.byteStride) throw new Error('Unsupported scan layout');
    const start = (view.byteOffset || 0) + (a.byteOffset || 0);
    const bytes = bin.subarray(start, start + a.count * components * Type.BYTES_PER_ELEMENT);
    return new Type(Uint8Array.from(bytes).buffer);
  }
  const positions = accessor(primitive.attributes.POSITION);
  const normals = accessor(primitive.attributes.NORMAL);
  const uv = accessor(primitive.attributes.TEXCOORD_0);
  const attributes = new Float32Array(positions.length / 3 * 5);
  for (let i = 0; i < attributes.length / 5; i++) {
    attributes.set(normals.subarray(i * 3, i * 3 + 3), i * 5);
    attributes.set(uv.subarray(i * 2, i * 2 + 2), i * 5 + 3);
  }
  const original = new Uint32Array(accessor(primitive.indices));
  const [indices, error] = MeshoptSimplifier.simplifyWithAttributes(
    original, positions, 3, attributes, 5, [0.1, 0.1, 0.1, 0.5, 0.5],
    null, target * 3, name === 'cây' ? 0.04 : 0.01, ['Permissive'],
  );
  const [remap, count] = MeshoptSimplifier.compactMesh(indices);
  const chunks = [], views = [];
  let offset = 0;
  function append(bytes) {
    const data = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    views.push({ buffer: 0, byteOffset: offset, byteLength: data.length });
    chunks.push(data);
    const padding = (4 - data.length % 4) % 4;
    chunks.push(Buffer.alloc(padding));
    offset += data.length + padding;
    return views.length - 1;
  }
  for (const [key, width] of [['POSITION', 3], ['NORMAL', 3], ['TEXCOORD_0', 2]]) {
    const index = primitive.attributes[key], source = accessor(index);
    const output = new Float32Array(count * width);
    for (let i = 0; i < remap.length; i++) {
      if (remap[i] < count) output.set(source.subarray(i * width, (i + 1) * width), remap[i] * width);
    }
    const a = doc.accessors[index];
    a.bufferView = append(output); a.byteOffset = 0; a.count = count;
    if (a.min) {
      a.min = Array(width).fill(Infinity); a.max = Array(width).fill(-Infinity);
      for (let i = 0; i < output.length; i++) {
        const axis = i % width;
        a.min[axis] = Math.min(a.min[axis], output[i]);
        a.max[axis] = Math.max(a.max[axis], output[i]);
      }
    }
  }
  const a = doc.accessors[primitive.indices];
  a.bufferView = append(indices); a.byteOffset = 0; a.count = indices.length; a.componentType = 5125;
  delete a.min; delete a.max;
  for (const image of doc.images || []) {
    const view = doc.bufferViews[image.bufferView];
    image.bufferView = append(bin.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength));
  }
  doc.bufferViews = views; doc.buffers = [{ byteLength: offset }];
  const json = Buffer.from(JSON.stringify(doc));
  const padded = Buffer.concat([json, Buffer.alloc((4 - json.length % 4) % 4, 32)]);
  const header = Buffer.alloc(20), binaryHeader = Buffer.alloc(8);
  header.writeUInt32LE(0x46546c67); header.writeUInt32LE(2, 4);
  header.writeUInt32LE(28 + padded.length + offset, 8);
  header.writeUInt32LE(padded.length, 12); header.writeUInt32LE(0x4e4f534a, 16);
  binaryHeader.writeUInt32LE(offset); binaryHeader.writeUInt32LE(0x004e4942, 4);
  await writeFile(new URL(`../public/models/${name}.glb`, import.meta.url), Buffer.concat([header, padded, binaryHeader, ...chunks]));
  console.log(`${name}: ${original.length / 3} → ${indices.length / 3} triangles, error ${error.toFixed(5)}`);
}

