
import { fetchWithTimeout } from "./_http.js";

// 密码泄露检测 (HIBP Pwned Passwords - k-匿名模型)
async function sha1(str) {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export async function isPasswordBreached(password) {
  try {
    const hash = await sha1(password);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);
    const res = await fetchWithTimeout(`https://api.pwnedpasswords.com/range/${prefix}`, { headers: { "User-Agent": "Sleep-App" } }, 3000);
    if (!res.ok) return false;
    
    const text = await res.text();
    for (const line of text.split("\n")) {
      const [hashSuffix, count] = line.trim().split(":");
      if (hashSuffix === suffix) return parseInt(count, 10) > 0;
    }
    return false;
  } catch { 
    return false; // 网络失败放行，不阻断用户
  }
}
