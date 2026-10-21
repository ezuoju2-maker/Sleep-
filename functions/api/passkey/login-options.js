import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { verifyRequest } from "../_csrf.js";
import { rateLimit } from "../_ratelimit.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!verifyRequest(request)) return Response.json({ error: "非法请求" }, { status: 403 });

  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const rl = await rateLimit(env, `passkey_options_ip:${ip}`, 20, 900);
  if (!rl.ok) {
    return Response.json({ error: "尝试过于频繁，请稍后再试" }, { status: 429 });
  }

  const rpID = env.WEBAUTHN_RP_ID || new URL(request.url).hostname;
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "required",
  });

  const challengeId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  await env.DB
    .prepare("INSERT INTO passkey_challenges (id, user_id, challenge, expires_at) VALUES (?, NULL, ?, ?)")
    .bind(challengeId, options.challenge, expiresAt)
    .run();

  return Response.json({ options, challengeId });
}
