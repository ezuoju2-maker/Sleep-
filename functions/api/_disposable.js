import { fetchWithTimeout } from "./_http.js";

let cachedDomains = null;
let lastFetch = 0;
const CACHE_TTL = 60 * 60 * 1000;

async function loadDomains() {
  if (cachedDomains && Date.now() - lastFetch < CACHE_TTL) return cachedDomains;
  try {
    const res = await fetchWithTimeout(
      "https://disposable.github.io/disposable-email-domains/domains.json",
      { cf: { cacheTtl: 3600 } },
      5000
    );
    if (!res.ok) throw new Error("fetch failed");
    const arr = await res.json();
    if (!Array.isArray(arr)) throw new Error("invalid payload");
    cachedDomains = new Set(arr.map((d) => String(d).toLowerCase()));
    lastFetch = Date.now();
    return cachedDomains;
  } catch {
    return cachedDomains || new Set();
  }
}

export async function isDisposableEmail(email) {
  if (!email || !email.includes("@")) return true;
  const domain = email.split("@")[1].toLowerCase();
  return (await loadDomains()).has(domain);
}
