import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validatePassword } from '../functions/api/_password.js';

const env = {};

test('过短密码被拒', async () => {
  assert.match(await validatePassword(env, 'abc'), /长度/);
});

test('过长密码被拒', async () => {
  assert.match(await validatePassword(env, 'A'.repeat(200)), /长度/);
});

test('仅一类字符被拒', async () => {
  assert.match(await validatePassword(env, 'aaaaaaaaaaaa'), /至少两种/);
});

test('两类字符通过（跳过 HIBP）', async () => {
  assert.equal(await validatePassword(env, 'TestTest1234', { checkHibp: false }), null);
});

test('含三类字符通过（跳过 HIBP）', async () => {
  assert.equal(await validatePassword(env, 'TestTest123!', { checkHibp: false }), null);
});

test('非字符串输入被拒', async () => {
  assert.match(await validatePassword(env, 12345, { checkHibp: false }), /不合法/);
});

test('null 输入被拒', async () => {
  assert.match(await validatePassword(env, null, { checkHibp: false }), /不合法/);
});
