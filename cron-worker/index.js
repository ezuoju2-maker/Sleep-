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

function cidrToRange(cidr) {
  const [base, bitsStr] = cidr.split("/");
  const bits = bitsStr ? parseInt(bitsStr, 10) : 32;
  if (isNaN(bits) || bits < 0 || bits > 32) return null;
  const baseInt = ipv4ToInt(base);
  if (baseInt === null) return null;
  const size = Math.pow(2, 32 - bits);
  return [baseInt, baseInt + size - 1];
}

async function syncThreatIntel(env) {
  console.log("[cron] threat-intel sync start");
  const ipSet = new Set();
  const cidrSet = new Set();

  const sources = [
    { name: "IPsum", url: "https://raw.githubusercontent.com/stamparm/ipsum/master/ipsum.txt", parse: (t) => t.split("\n").forEach((line) => {
      const p = line.trim().split(/\s+/);
      if (p.length >= 2 && parseInt(p[1], 10) >= 3) ipSet.add(p[0]);
    }) },
    { name: "ThreatFox", url: "https://raw.githubusercontent.com/elliotwutingfeng/ThreatFox-IOC-IPs/main/ips.txt", parse: (t) => t.split("\n").forEach((line) => { if (line && !line.startsWith("#")) ipSet.add(line.trim()); }) },
    { name: "Feodo", url: "https://feodotracker.abuse.ch/downloads/ipblocklist.txt", parse: (t) => t.split("\n").forEach((line) => { if (line && !line.startsWith("#")) ipSet.add(line.trim()); }) },
    { name: "CINS", url: "https://cinsscore.com/list/ci-badguys.txt", parse: (t) => t.split("\n").forEach((line) => { if (line && !line.startsWith("#")) ipSet.add(line.trim()); }) },
    { name: "Spamhaus", url: "https://www.spamhaus.org/drop/drop.txt", parse: (t) => t.split("\n").forEach((line) => {
      if (line && !line.startsWith(";")) {
        const cidr = line.split(";")[0].trim();
        if (cidr.includes("/")) cidrSet.add(cidr);
        else if (cidr) ipSet.add(cidr);
      }
    }) },
  ];

  for (const src of sources) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 10000);
      const res = await fetch(src.url, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) { console.warn(`[cron] ${src.name} HTTP ${res.status}`); continue; }
      const text = await res.text();
      if (text.length < 100) { console.warn(`[cron] ${src.name} too small: ${text.length} bytes`); continue; }
      src.parse(text);
      console.log(`[cron] ${src.name} ok, total=${ipSet.size}`);
    } catch (e) {
      console.error(`[cron] ${src.name} failed: ${e.message}`);
    }
  }

  if (ipSet.size + cidrSet.size < 1000) {
    console.error(`[cron] threat-intel aborted, only ${ipSet.size + cidrSet.size} entries (guard min=1000)`);
    return;
  }

  const cidrRanges = [];
  for (const cidr of cidrSet) {
    const r = cidrToRange(cidr);
    if (r) cidrRanges.push(`${r[0]},${r[1]}`);
  }

  await env.SLEEP_KV.put("blacklist_ips", Array.from(ipSet).join("\n"));
  await env.SLEEP_KV.put("blacklist_cidrs", cidrRanges.join("\n"));
  console.log(`[cron] threat-intel written, ${ipSet.size} exact + ${cidrRanges.length} ranges`);
}

async function runRetention(env) {
  if (!env.DB) {
    console.warn("[cron] DB binding missing, skip retention");
    return;
  }
  const now = new Date().toISOString();
  const iso365d = new Date(Date.now() - 365 * 86400 * 1000).toISOString();

  try {
    const iso90d = new Date(Date.now() - 90 * 86400 * 1000).toISOString();
    const res = await env.DB.batch([
      env.DB.prepare("DELETE FROM sessions WHERE expires_at < ?").bind(now),
      env.DB.prepare("DELETE FROM passkey_challenges WHERE expires_at < ?").bind(now),
      env.DB.prepare("DELETE FROM password_resets WHERE expires_at < ?").bind(now),
      env.DB.prepare("DELETE FROM login_attempts WHERE attempts < ?1 AND locked_until IS NULL AND key NOT LIKE 'acct:%' AND key NOT LIKE 'sudo:%'").bind(5),
      env.DB.prepare("DELETE FROM audit_logs WHERE created_at < ?").bind(iso365d),
      env.DB.prepare("DELETE FROM rate_limits WHERE reset_at <= ?").bind(Date.now()),
      env.DB.prepare("DELETE FROM login_attempts WHERE locked_until IS NOT NULL AND locked_until < ?").bind(now),
      env.DB.prepare("DELETE FROM email_logs WHERE created_at < ?").bind(iso90d),
    ]);
    const counts = res.map((r) => (r.meta && r.meta.changes) || 0);
    console.log(`[cron] retention done: sessions=${counts[0]} challenges=${counts[1]} resets=${counts[2]} attempts_unlocked=${counts[3]} audit=${counts[4]} attempts_stale=${counts[5]} email_logs=${counts[6]}`);
  } catch (e) {
    console.error(`[cron] retention failed: ${e.message}`);
  }
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(syncThreatIntel(env));
    ctx.waitUntil(runRetention(env));
  },
};
