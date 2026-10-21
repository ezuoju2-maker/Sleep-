const BLOCKED_PREFIXES = ["/test/", "/migrations/", "/.github/", "/node_modules/", "/.wrangler/", "/cron-worker/"];
const BLOCKED_EXACT = new Set([
  "/wrangler.toml", "/package.json", "/package-lock.json", "/eslint.config.mjs",
  "/Sleep_final.md", "/logo.png.original", "/.assetsignore", "/.gitignore",
]);
const BLOCKED_SUFFIXES = [".md", ".sql", ".toml", ".log", ".original", ".test.js", ".yml", ".yaml"];
const ALLOWED_HTML = new Set(["/", "/index.html", "/help.html", "/privacy.html", "/terms.html"]);

function isBlocked(pathname) {
  if (BLOCKED_EXACT.has(pathname)) return true;
  if (BLOCKED_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  return BLOCKED_SUFFIXES.some((suf) => pathname.endsWith(suf));
}

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Permissions-Policy": "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
};

const HTML_CSP = "default-src 'self'; script-src 'self' https://esm.sh; style-src 'self'; style-src-attr 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; media-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests";

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (isBlocked(url.pathname)) {
    return new Response("Not Found", {
      status: 404,
      headers: { ...SECURITY_HEADERS, "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const response = await context.next();
  const headers = new Headers(response.headers);

  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    if (!headers.has(k)) headers.set(k, v);
  }

  if (url.pathname.startsWith("/api/")) {
    headers.set("Cache-Control", "no-store");
    headers.set("Pragma", "no-cache");
  }

  const contentType = (headers.get("Content-Type") || "").toLowerCase();
  if (contentType.includes("text/html")) {
    // 未在允许列表中的 HTML 响应视为 SPA fallback，返回 404，避免未知路径一律 200。
    if (!ALLOWED_HTML.has(url.pathname)) {
      return new Response("Not Found", {
        status: 404,
        headers: { ...SECURITY_HEADERS, "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    if (!headers.has("Content-Security-Policy")) {
      headers.set("Content-Security-Policy", HTML_CSP);
    }
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
