export function verifyRequest(request) {
  const fetchSite = request.headers.get("Sec-Fetch-Site");
  const origin = request.headers.get("Origin");

  if (fetchSite) {
    return fetchSite === "same-origin";
  }

  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}
