import test from 'node:test';
import assert from 'node:assert/strict';
import { retryAsset, scheduleModelLoad } from '../src/asset-loading.js';

test('transient asset failures are retried and permanent failures are reported', async () => {
  let calls = 0;
  const value = await retryAsset(async () => {
    if (++calls < 3) throw new Error('temporary network failure');
    return 'loaded';
  }, { attempts: 4, baseDelay: 0 });
  assert.equal(value, 'loaded'); assert.equal(calls, 3);
  await assert.rejects(retryAsset(() => Promise.reject(new Error('offline')),
    { attempts: 2, baseDelay: 0 }), /offline/);
});

test('model queue caps heavy concurrent loads and progresses after a failed model', async () => {
  let active = 0, peak = 0;
  const results = await Promise.allSettled(Array.from({length: 8}, (_, i) => scheduleModelLoad(async () => {
    active++; peak = Math.max(peak, active);
    await new Promise(resolve => setTimeout(resolve, 2));
    active--;
    if (i === 1) throw new Error('invalid asset');
    return i;
  })));
  assert.equal(peak, 2);
  assert.equal(results.filter(r=>r.status==='fulfilled').length, 7);
  assert.equal(results[7].value, 7);
});
