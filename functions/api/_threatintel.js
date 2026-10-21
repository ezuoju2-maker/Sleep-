let cachedExact = null;
let cachedRanges = null;
let lastFetch = 0;
const CACHE_TTL = 5 * 60 * 1000;

function ipv4ToInt(ip) {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    const v = parseInt(p, 10);
    if (isNaN(v) || v < 0 || v > 255) return null;
    n = (n * 256) + v;
  }
  return n;
}

function parseRanges(text) {
  if (!text) return [];
  const out = [];
  for (const line of text.split("\n")) {
    if (!line) continue;
    const [s, e] = line.split(",");
    const sn = parseInt(s, 10);
    const en = parseInt(e, 10);
    if (!isNaN(sn) && !isNaN(en)) out.push([sn, en]);
  }
  return out;
}

async function loadCache(env) {
  const [ipText, cidrText] = await Promise.all([
    env.SLEEP_KV.get("blacklist_ips"),
    env.SLEEP_KV.get("blacklist_cidrs"),
  ]);
  cachedExact = ipText ? new Set(ipText.split("\n").filter(Boolean)) : new Set();
  cachedRanges = parseRanges(cidrText);
  lastFetch = Date.now();
}

export async function isMaliciousIP(env, ip) {
  if (!ip || !env.SLEEP_KV) return false;

  if (cachedExact && cachedRanges && Date.now() - lastFetch < CACHE_TTL) {
    if (cachedExact.has(ip)) return true;
    const ipInt = ipv4ToInt(ip);
    if (ipInt !== null) {
      for (const [start, end] of cachedRanges) {
        if (ipInt >= start && ipInt <= end) return true;
      }
    }
    return false;
  }

  try {
    await loadCache(env);
    return await isMaliciousIP(env, ip);
  } catch (e) {
    console.error(JSON.stringify({ event: "threatintel_unavailable", message: String(e) }));
    return false;
  }
}
