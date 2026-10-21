
export function jsonError(message, status = 400, requestId = null) {
  const body = { success: false, error: message };
  if (requestId) body.requestId = requestId;
  return Response.json(body, { status });
}

export function jsonSuccess(data = {}, message = "") {
  return Response.json({ success: true, message, ...data });
}
