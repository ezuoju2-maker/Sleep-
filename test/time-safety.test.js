import { test } from 'node:test';
import assert from 'node:assert/strict';

test('ISO 时间比较：同日过期被正确识别', () => {
  const nowIso = '2026-10-21T15:00:00.000Z';
  const expiredToday = '2026-10-21T00:00:01.000Z';
  assert.equal(new Date(expiredToday).toISOString() <= nowIso, true);
});

test('ISO 时间比较：未来时间不判定为过期', () => {
  const nowIso = '2026-10-21T15:00:00.000Z';
  const future = '2026-10-21T16:00:00.000Z';
  assert.equal(new Date(future).toISOString() <= nowIso, false);
});

test('P0-08 回归：ISO 与 SQLite CURRENT_TIMESTAMP 混用是陷阱', () => {
  const sqlite = '2026-10-21 00:00:01';
  const iso = '2026-10-21T00:00:01.000Z';
  // 字符串逐位比较：'T'(0x54) > ' '(0x20)，ISO 总是"大于"空格格式
  assert.equal(iso > sqlite, true);
  // SQLite 的 CURRENT_TIMESTAMP 无时区，Date 按本地时区解析；ISO 带 Z 按 UTC 解析。
  // 两者在非 UTC 环境下时间戳不同，因此不可混用。此处只断言字符串比较的陷阱，
  // 不断言时间戳差异，避免测试依赖运行环境的时区。
});
