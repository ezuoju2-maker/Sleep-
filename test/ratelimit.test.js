import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rateLimit } from '../functions/api/_ratelimit.js';

// 内存版 D1，只实现 _ratelimit.js 用到的两条语句。
// UPSERT 的窗口判断与计数在同一语句内完成，与真实 D1 语义一致。
function makeD1() {
  const rows = new Map();
  return {
    rows,
    prepare(sql) {
      let args = [];
      const stmt = {
        bind(...a) { args = a; return stmt; },
        async first() {
          if (!/INSERT INTO rate_limits/.test(sql)) throw new Error(`unexpected first: ${sql}`);
          const [key, resetAt, now] = args;
          const cur = rows.get(key);
          let count, reset_at;
          if (!cur || cur.reset_at <= now) {
            count = 1;
            reset_at = resetAt;
          } else {
            count = cur.count + 1;
            reset_at = cur.reset_at;
          }
          rows.set(key, { count, reset_at });
          return { count, reset_at };
        },
        async run() {
          if (!/DELETE FROM rate_limits WHERE reset_at <=/.test(sql)) throw new Error(`unexpected run: ${sql}`);
          for (const [k, v] of rows) if (v.reset_at <= args[0]) rows.delete(k);
          return { success: true };
        },
      };
      return stmt;
    },
  };
}

test('首次请求放行', async () => {
  const env = { DB: makeD1() };
  const r = await rateLimit(env, 'test:1', 5, 60);
  assert.equal(r.ok, true);
  assert.equal(r.remaining, 4);
});

test('达到上限后拒绝', async () => {
  const env = { DB: makeD1() };
  for (let i = 0; i < 5; i++) {
    const r = await rateLimit(env, 'test:2', 5, 60);
    assert.equal(r.ok, true);
  }
  const r = await rateLimit(env, 'test:2', 5, 60);
  assert.equal(r.ok, false);
  assert.equal(r.remaining, 0);
});

test('DB 缺失时 fail-closed 并标记 degraded', async () => {
  const r = await rateLimit({}, 'test:3', 5, 60);
  assert.equal(r.ok, false);
  assert.equal(r.degraded, true);
});

test('不同 key 互不影响', async () => {
  const env = { DB: makeD1() };
  for (let i = 0; i < 5; i++) await rateLimit(env, 'a', 5, 60);
  const r = await rateLimit(env, 'b', 5, 60);
  assert.equal(r.ok, true);
});

test('remaining 递减正确', async () => {
  const env = { DB: makeD1() };
  assert.equal((await rateLimit(env, 'test:4', 5, 60)).remaining, 4);
  assert.equal((await rateLimit(env, 'test:4', 5, 60)).remaining, 3);
});

test('窗口到期后计数归 1', async () => {
  const env = { DB: makeD1() };
  for (let i = 0; i < 5; i++) await rateLimit(env, 'test:5', 5, 60);
  assert.equal((await rateLimit(env, 'test:5', 5, 60)).ok, false);
  env.DB.rows.get('test:5').reset_at = Date.now() - 1;
  const r = await rateLimit(env, 'test:5', 5, 60);
  assert.equal(r.ok, true);
  assert.equal(r.remaining, 4);
});

test('50 个并发调用放行数恰为 limit', async () => {
  const env = { DB: makeD1() };
  const results = await Promise.all(Array.from({ length: 50 }, () => rateLimit(env, 'test:6', 10, 60)));
  assert.equal(results.filter(r => r.ok).length, 10);
  assert.equal(env.DB.rows.get('test:6').count, 50);
});
