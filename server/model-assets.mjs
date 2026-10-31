import { readdir, readFile, writeFile, rm } from 'node:fs/promises';
import { brotliCompress, constants } from 'node:zlib';
import { promisify } from 'node:util';

const compress = promisify(brotliCompress);
export function modelAssetsPlugin() {
  let outDir, building;
  return {
    name: 'compressed-model-assets',
    configResolved(config) { outDir = config.build.outDir; building = config.command === 'build'; },
    async closeBundle() {
      if (!building) return;
      // These legacy copies are unused; the game loads the versions in models/.
      await rm(`${outDir}/thamr.glb`, { force: true });
      await rm(`${outDir}/thamr_extracted.jpg`, { force: true });
      for (const name of await readdir(`${outDir}/models`)) {
        if (!name.endsWith('.glb')) continue;
        const file = `${outDir}/models/${name}`;
        const packed = await compress(await readFile(file), {
          params: { [constants.BROTLI_PARAM_QUALITY]: 5 },
        });
        await writeFile(file + '.br', packed);
      }
    },
  };
}
