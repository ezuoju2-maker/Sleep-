import { PBKDF2_ITERATIONS as DEFAULT_ITERATIONS } from "./_constants.js";

const MIN_ITERATIONS = 10_000;
const MAX_ITERATIONS = 1_000_000;
const SALT_BYTES = 16;
const HASH_BYTES = 32;

function getPepper(env) {
  if (!env.PASSWORD_PEPPER) throw new Error("Server misconfiguration: PASSWORD_PEPPER missing");
  return env.PASSWORD_PEPPER;
}

// pepper 经 HMAC 混入口令，避免拼接式构造在降档后削弱强度。
async function pepperPassword(password, pepper) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(pepper), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(password)));
}

async function digestPBKDF2(password, salt, iterations, pepper) {
  const peppered = await pepperPassword(password, pepper);
  const keyMaterial = await crypto.subtle.importKey("raw", peppered, { name: "PBKDF2" }, false, ["deriveBits"]);
  return await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations, hash: "SHA-256" }, keyMaterial, 256);
}

function timingSafeEqual(a, b) {
  const len = Math.max(a.length, b.length);
  let result = a.length ^ b.length;
  for (let i = 0; i < len; i++) result |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return result === 0;
}

function toBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(str) {
  return Uint8Array.from(atob(str), c => c.charCodeAt(0));
}

export async function hashPassword(password, env, iterations = DEFAULT_ITERATIONS) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hashBuffer = await digestPBKDF2(password, salt, iterations, getPepper(env));
  return `pbkdf2_sha256$${iterations}$${toBase64(salt)}$${toBase64(new Uint8Array(hashBuffer))}`;
}

export async function verifyPassword(password, storedHash, env) {
  try {
    if (typeof storedHash !== "string") return false;
    const parts = storedHash.split("$");
    if (parts.length !== 4 || parts[0] !== "pbkdf2_sha256") return false;

    const iterations = Number(parts[1]);
    if (!Number.isInteger(iterations) || iterations < MIN_ITERATIONS || iterations > MAX_ITERATIONS) return false;

    const salt = fromBase64(parts[2]);
    const expected = fromBase64(parts[3]);
    if (salt.length !== SALT_BYTES || expected.length !== HASH_BYTES) return false;

    const hashBuffer = await digestPBKDF2(password, salt, iterations, getPepper(env));
    return timingSafeEqual(toBase64(new Uint8Array(hashBuffer)), parts[3]);
  } catch {
    return false;
  }
}

export async function verifyDummyHash(password, env) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  await digestPBKDF2(password, salt, DEFAULT_ITERATIONS, getPepper(env));
  return false;
}

export function hashNeedsRehash(storedHash) {
  if (typeof storedHash !== "string") return true;
  const parts = storedHash.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2_sha256") return true;
  const iterations = Number(parts[1]);
  if (!Number.isInteger(iterations)) return true;
  return iterations < DEFAULT_ITERATIONS;
}
