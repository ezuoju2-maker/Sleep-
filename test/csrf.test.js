import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyRequest } from '../functions/api/_csrf.js';

const URL_ = 'https://example.com/api/test';

test('Sec-Fetch-Site: same-origin 放行', () => {
  const req = new Request(URL_, { method: 'POST', headers: { 'Sec-Fetch-Site': 'same-origin' } });
  assert.equal(verifyRequest(req), true);
});

test('Sec-Fetch-Site: cross-site 拒绝', () => {
  const req = new Request(URL_, { method: 'POST', headers: { 'Sec-Fetch-Site': 'cross-site' } });
  assert.equal(verifyRequest(req), false);
});

test('Sec-Fetch-Site: none 拒绝（P0-07 回归）', () => {
  const req = new Request(URL_, { method: 'POST', headers: { 'Sec-Fetch-Site': 'none' } });
  assert.equal(verifyRequest(req), false);
});

test('无 Sec-Fetch-Site，同源 Origin 放行', () => {
  const req = new Request(URL_, { method: 'POST', headers: { 'Origin': 'https://example.com' } });
  assert.equal(verifyRequest(req), true);
});

test('无 Sec-Fetch-Site，跨源 Origin 拒绝', () => {
  const req = new Request(URL_, { method: 'POST', headers: { 'Origin': 'https://evil.com' } });
  assert.equal(verifyRequest(req), false);
});

test('无 Sec-Fetch-Site 无 Origin 拒绝', () => {
  const req = new Request(URL_, { method: 'POST' });
  assert.equal(verifyRequest(req), false);
});
