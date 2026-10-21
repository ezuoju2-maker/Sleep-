import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('../functions/', import.meta.url).pathname;

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : (p.endsWith('.js') ? [p] : []);
  });
}

for (const file of walk(ROOT).sort()) {
  const rel = file.slice(ROOT.length);
  test(`模块可加载: ${rel}`, async () => {
    const mod = await import(pathToFileURL(file).href);
    const handlers = Object.keys(mod).filter((k) => k.startsWith('onRequest'));
    const isHelper = rel.split('/').some((seg) => seg.startsWith('_'));
    if (!isHelper) {
      assert.ok(handlers.length > 0, `${rel} 没有任何 onRequest* 导出`);
    }
  });
}
