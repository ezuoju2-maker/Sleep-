import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, verifyDummyHash, hashNeedsRehash } from '../functions/api/_crypto.js';
import { PBKDF2_ITERATIONS } from '../functions/api/_constants.js';

const env = { PASSWORD_PEPPER: 'a'.repeat(32) };

test('hashPassword 输出格式正确且迭代数符合常量', async () => {
  const hash = await hashPassword('Test1234!Abcd', env);
  assert.match(hash, /^pbkdf2_sha256\$\d+\$[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+$/);
  assert.equal(parseInt(hash.split('$')[1], 10), PBKDF2_ITERATIONS);
});

test('verifyPassword 正确密码返回 true', async () => {
  const hash = await hashPassword('Test1234!Abcd', env);
  assert.equal(await verifyPassword('Test1234!Abcd', hash, env), true);
});

test('verifyPassword 错误密码返回 false', async () => {
  const hash = await hashPassword('Test1234!Abcd', env);
  assert.equal(await verifyPassword('wrong-password', hash, env), false);
});

test('verifyPassword 无法解析的哈希返回 false 不抛错', async () => {
  assert.equal(await verifyPassword('x', 'not-a-valid-hash', env), false);
  assert.equal(await verifyPassword('x', 'pbkdf2_sha256$bad', env), false);
  assert.equal(await verifyPassword('x', '', env), false);
});

test('verifyPassword 缺 PASSWORD_PEPPER 返回 false 不抛错', async () => {
  const hash = await hashPassword('Test1234!Abcd', env);
  assert.equal(await verifyPassword('Test1234!Abcd', hash, {}), false);
});

test('hashNeedsRehash 对低迭代返回 true', () => {
  assert.equal(hashNeedsRehash(`pbkdf2_sha256$${PBKDF2_ITERATIONS / 2}$c2FsdA==$aGFzaA==`), true);
});

test('hashNeedsRehash 对当前迭代返回 false', async () => {
  const hash = await hashPassword('Test1234!Abcd', env);
  assert.equal(hashNeedsRehash(hash), false);
});

test('verifyDummyHash 一定返回 false', async () => {
  assert.equal(await verifyDummyHash('anything', env), false);
});

test('verifyPassword 拒绝越界/非法迭代数', async () => {
  const salt = btoa(String.fromCharCode(...new Uint8Array(16)));
  const hash = btoa(String.fromCharCode(...new Uint8Array(32)));
  for (const it of ['999999999', 'NaN', '-1', '0', '9999', 'abc']) {
    assert.equal(await verifyPassword('x', `pbkdf2_sha256$${it}$${salt}$${hash}`, env), false, `iterations=${it}`);
  }
});

test('verifyPassword 拒绝非法盐长/哈希长', async () => {
  const salt16 = btoa(String.fromCharCode(...new Uint8Array(16)));
  const hash32 = btoa(String.fromCharCode(...new Uint8Array(32)));
  const shortSalt = btoa(String.fromCharCode(...new Uint8Array(8)));
  const shortHash = btoa(String.fromCharCode(...new Uint8Array(16)));
  const it = PBKDF2_ITERATIONS;
  assert.equal(await verifyPassword('x', `pbkdf2_sha256$${it}$${shortSalt}$${hash32}`, env), false);
  assert.equal(await verifyPassword('x', `pbkdf2_sha256$${it}$${salt16}$${shortHash}`, env), false);
});

test('hashNeedsRehash 对畸形输入返回 true', () => {
  for (const v of [null, undefined, '', 'garbage', 'pbkdf2_sha256$x$y$z', 'pbkdf2_sha256$NaN$a$b']) {
    assert.equal(hashNeedsRehash(v), true, `input=${String(v)}`);
  }
});
